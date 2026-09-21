-- ==============================================================================
-- FILE: Schema/broadcast_targeting_and_history.sql
-- MỤC ĐÍCH:
--   1. Thêm cột `recipient_role` vào `public.notifications` (hỗ trợ phân quyền nhóm nhận).
--   2. Tạo bảng `newsletter_send_jobs` với `payload_hash` hỗ trợ Idempotency chống gửi lặp email ở server.
--   3. Tạo hàm `public.claim_newsletter_send_job` và `public.finalize_newsletter_send_job`
--      để lock nguyên tử (atomic idempotency claim), gắn chặt hash nội dung và lưu lịch sử server-side.
--   4. Tạo hàm `public.my_role()` và cập nhật RLS SELECT trên `public.notifications`
--      để bảo vệ dữ liệu theo role (ngăn chặn học sinh/phụ huynh truy vấn thông báo GLV).
--   5. Cập nhật `broadcast_notification` nhận thêm tham số `p_recipient_role`.
--   6. Cô lập phạm vi xóa của `delete_broadcast` CHỈ cho type IN ('broadcast', 'email').
--   7. Cập nhật `get_my_notifications`, `get_unread_notification_count`,
--      `mark_all_notifications_read`, `mark_notification_read` theo đúng recipient_role
--      và tôn trọng cài đặt thông báo của người dùng (`notif_system`).
-- ==============================================================================

-- 1. Thêm cột recipient_role nếu chưa có
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS recipient_role TEXT CHECK (recipient_role IN ('admin', 'teacher', 'student', 'user'));

COMMENT ON COLUMN public.notifications.recipient_role IS 'Vai trò tài khoản được nhận thông báo khi recipient_username IS NULL. NULL = Tất cả tài khoản.';

-- Đảm bảo constraint type cho phép 'email'
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'diem', 'hanh_kiem', 'hoc_luc',
  'tong_ket_ky', 'tong_ket_nam', 'broadcast', 'system', 'bai_viet', 'email'
));

-- 2. Bảng quản lý tiến trình gửi email hàng loạt (Newsletter Send Jobs - Idempotency & Batch Tracking)
CREATE TABLE IF NOT EXISTS public.newsletter_send_jobs (
  id                  BIGSERIAL PRIMARY KEY,
  idempotency_key     TEXT UNIQUE NOT NULL,
  payload_hash        TEXT NOT NULL,
  title               TEXT NOT NULL,
  message             TEXT NOT NULL,
  link                TEXT,
  status              TEXT NOT NULL CHECK (status IN ('processing', 'success', 'partial', 'failed')),
  requested           INT NOT NULL DEFAULT 0,
  accepted            INT NOT NULL DEFAULT 0,
  rejected            INT NOT NULL DEFAULT 0,
  failed_batches      INT NOT NULL DEFAULT 0,
  errors              TEXT[],
  created_by          TEXT REFERENCES public.users(username) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Đảm bảo cột payload_hash tồn tại nếu bảng đã được tạo trước đó
ALTER TABLE public.newsletter_send_jobs ADD COLUMN IF NOT EXISTS payload_hash TEXT;

ALTER TABLE public.newsletter_send_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_send_jobs: admin all" ON public.newsletter_send_jobs;
CREATE POLICY "newsletter_send_jobs: admin all"
ON public.newsletter_send_jobs
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. Hàm tiện ích lấy vai trò của người dùng hiện tại
CREATE OR REPLACE FUNCTION public.my_role()
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT role FROM public.users WHERE username = public.my_username();
$$;

-- 4. RLS SELECT bảo vệ bảng notifications: chặn truy cập trái phép vào thông báo phân quyền
DROP POLICY IF EXISTS "notifications: select mine or broadcast" ON public.notifications;
DROP POLICY IF EXISTS "notifications: select mine or eligible broadcast" ON public.notifications;

CREATE POLICY "notifications: select mine or eligible broadcast"
ON public.notifications
FOR SELECT
USING (
  recipient_username = public.my_username()
  OR (
    recipient_username IS NULL
    AND (
      recipient_role IS NULL
      OR recipient_role = public.my_role()
      OR (recipient_role = 'teacher' AND public.is_admin())
    )
  )
);

-- 5. Cập nhật hàm broadcast_notification hỗ trợ đối tượng role
CREATE OR REPLACE FUNCTION public.broadcast_notification(
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_recipient_role TEXT DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Chỉ admin mới được gửi thông báo';
  END IF;

  IF p_recipient_role IS NOT NULL AND p_recipient_role NOT IN ('teacher', 'student', 'user', 'admin') THEN
    RAISE EXCEPTION 'Vai trò người nhận không hợp lệ';
  END IF;

  INSERT INTO public.notifications (type, title, message, link, recipient_username, recipient_role, created_by)
  VALUES ('broadcast', p_title, p_message, p_link, NULL, p_recipient_role, public.my_username());
END;
$$;

-- 6. Giới hạn phạm vi xóa của delete_broadcast CHỈ trong broadcast và email
CREATE OR REPLACE FUNCTION public.delete_broadcast(p_id BIGINT)
RETURNS void AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Chỉ admin mới được xoá thông báo';
  END IF;

  DELETE FROM public.notifications
  WHERE id = p_id AND type IN ('broadcast', 'email');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 7. Hàm chiếm quyền xử lý gửi email nguyên tử (Atomic Idempotency Claiming)
CREATE OR REPLACE FUNCTION public.claim_newsletter_send_job(
  p_idempotency_key TEXT,
  p_payload_hash TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_created_by TEXT DEFAULT NULL
)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_existing public.newsletter_send_jobs%ROWTYPE;
  v_new_id BIGINT;
BEGIN
  IF NOT (public.is_admin() OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Không có quyền thực hiện thao tác này';
  END IF;

  IF p_idempotency_key IS NULL OR length(trim(p_idempotency_key)) = 0 THEN
    RAISE EXCEPTION 'Thiếu idempotency key';
  END IF;

  -- Tìm job đã tồn tại theo key và khóa dòng để chống xung đột race condition
  SELECT * INTO v_existing
  FROM public.newsletter_send_jobs
  WHERE idempotency_key = p_idempotency_key
  FOR UPDATE;

  IF FOUND THEN
    -- Kiểm tra payload_hash: nếu đã dùng key cho nội dung khác -> từ chối
    IF v_existing.payload_hash IS NOT NULL AND v_existing.payload_hash != p_payload_hash THEN
      RETURN jsonb_build_object(
        'action', 'payload_mismatch',
        'message', 'Idempotency key này đã được sử dụng cho một nội dung thông báo khác.'
      );
    END IF;

    -- Nếu đợt gửi trước đã hoàn tất (thành công hoặc một phần) -> trả kết quả cũ (Replay)
    IF v_existing.status IN ('success', 'partial') THEN
      RETURN jsonb_build_object(
        'action', 'replay',
        'status', v_existing.status,
        'requested', v_existing.requested,
        'accepted', v_existing.accepted,
        'rejected', v_existing.rejected,
        'failed_batches', v_existing.failed_batches,
        'errors', v_existing.errors,
        'message', 'Bản tin đã được xử lý trước đó (Idempotent response)'
      );
    END IF;

    -- Nếu đang xử lý và chưa bị timeout (trong vòng 5 phút) -> conflict
    IF v_existing.status = 'processing' AND v_existing.updated_at > (NOW() - INTERVAL '5 minutes') THEN
      RETURN jsonb_build_object(
        'action', 'conflict',
        'message', 'Yêu cầu phát bản tin này đang được máy chủ xử lý. Vui lòng đợi trong giây lát.'
      );
    END IF;

    -- Nếu trạng thái là failed hoặc processing bị quá hạn 5 phút -> Cho phép tiếp tục xử lý
    UPDATE public.newsletter_send_jobs
    SET status = 'processing',
        payload_hash = p_payload_hash,
        title = p_title,
        message = p_message,
        link = p_link,
        errors = NULL,
        updated_at = NOW()
    WHERE id = v_existing.id;

    RETURN jsonb_build_object(
      'action', 'proceed',
      'job_id', v_existing.id
    );
  END IF;

  -- Chưa tồn tại: Insert mới nguyên tử
  INSERT INTO public.newsletter_send_jobs (
    idempotency_key, payload_hash, title, message, link, status, created_by, created_at, updated_at
  )
  VALUES (
    p_idempotency_key, p_payload_hash, p_title, p_message, p_link, 'processing', p_created_by, NOW(), NOW()
  )
  RETURNING id INTO v_new_id;

  RETURN jsonb_build_object(
    'action', 'proceed',
    'job_id', v_new_id
  );
EXCEPTION WHEN unique_violation THEN
  -- Bắt race condition nếu hai request đồng thời cùng chèn một key
  SELECT * INTO v_existing
  FROM public.newsletter_send_jobs
  WHERE idempotency_key = p_idempotency_key;

  RETURN jsonb_build_object(
    'action', 'conflict',
    'message', 'Yêu cầu phát bản tin này đang được máy chủ xử lý.'
  );
END;
$$;

-- 8. Hàm kết thúc và ghi nhận lịch sử gửi email nguyên tử (Server-side finalize)
CREATE OR REPLACE FUNCTION public.finalize_newsletter_send_job(
  p_idempotency_key TEXT,
  p_status TEXT,
  p_requested INT,
  p_accepted INT,
  p_rejected INT,
  p_failed_batches INT,
  p_errors TEXT[] DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_title TEXT;
  v_message TEXT;
  v_link TEXT;
  v_created_by TEXT;
BEGIN
  IF NOT (public.is_admin() OR auth.role() = 'service_role') THEN
    RAISE EXCEPTION 'Không có quyền thực hiện thao tác này';
  END IF;

  UPDATE public.newsletter_send_jobs
  SET status = p_status,
      requested = p_requested,
      accepted = p_accepted,
      rejected = p_rejected,
      failed_batches = p_failed_batches,
      errors = p_errors,
      updated_at = NOW()
  WHERE idempotency_key = p_idempotency_key
  RETURNING title, message, link, created_by INTO v_title, v_message, v_link, v_created_by;

  -- Chỉ ghi lịch sử khi có ít nhất 1 email được tiếp nhận
  IF p_accepted > 0 AND v_title IS NOT NULL THEN
    -- Lưu vào bảng newsletters
    INSERT INTO public.newsletters (title, message, link, created_by)
    VALUES (v_title, v_message, v_link, v_created_by);

    -- Lưu vào bảng notifications cho lịch sử của admin
    INSERT INTO public.notifications (type, title, message, link, recipient_username, recipient_role, created_by)
    VALUES ('email', v_title, v_message, v_link, NULL, NULL, v_created_by);
  END IF;
END;
$$;

-- 9. Cập nhật hàm get_my_notifications hỗ trợ lọc theo recipient_role & notif_system
CREATE OR REPLACE FUNCTION public.get_my_notifications(p_limit INT DEFAULT 30)
RETURNS TABLE (id BIGINT, type TEXT, title TEXT, message TEXT, link TEXT, created_at TIMESTAMPTZ, read BOOLEAN)
LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE
  v_username TEXT := public.my_username();
  v_role TEXT := public.my_role();
  v_is_adm BOOLEAN := public.is_admin();
  v_notif_system BOOLEAN;
BEGIN
  IF v_username IS NULL THEN
    RETURN;
  END IF;

  SELECT notif_system INTO v_notif_system FROM public.users WHERE username = v_username;

  RETURN QUERY
  SELECT n.id, n.type, n.title, n.message, n.link, n.created_at, (nr.read_at IS NOT NULL) AS read
  FROM public.notifications n
  LEFT JOIN public.notification_reads nr ON nr.notification_id = n.id AND nr.username = v_username
  WHERE (
    n.recipient_username = v_username
    OR (
      n.recipient_username IS NULL
      AND (
        n.recipient_role IS NULL
        OR n.recipient_role = v_role
        OR (n.recipient_role = 'teacher' AND v_is_adm)
      )
    )
  )
  AND n.type != 'email'
  AND (
    (n.type IN ('broadcast', 'system', 'bai_viet') AND COALESCE(v_notif_system, TRUE) = TRUE)
    OR (n.type NOT IN ('broadcast', 'system', 'bai_viet'))
  )
  ORDER BY n.created_at DESC LIMIT p_limit;
END;
$$;

-- 10. Cập nhật hàm đếm chưa đọc (bảo vệ recipient_role & notif_system)
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INT LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE
  v_username TEXT := public.my_username();
  v_role TEXT := public.my_role();
  v_is_adm BOOLEAN := public.is_admin();
  v_notif_system BOOLEAN;
  v_count INT;
BEGIN
  IF v_username IS NULL THEN
    RETURN 0;
  END IF;

  SELECT notif_system INTO v_notif_system FROM public.users WHERE username = v_username;

  SELECT COUNT(*)::INT INTO v_count
  FROM public.notifications n
  LEFT JOIN public.notification_reads nr ON nr.notification_id = n.id AND nr.username = v_username
  WHERE (
    n.recipient_username = v_username
    OR (
      n.recipient_username IS NULL
      AND (
        n.recipient_role IS NULL
        OR n.recipient_role = v_role
        OR (n.recipient_role = 'teacher' AND v_is_adm)
      )
    )
  )
  AND n.type != 'email'
  AND nr.read_at IS NULL
  AND (
    (n.type IN ('broadcast', 'system', 'bai_viet') AND COALESCE(v_notif_system, TRUE) = TRUE)
    OR (n.type NOT IN ('broadcast', 'system', 'bai_viet'))
  );

  RETURN v_count;
END;
$$;

-- 11. Cập nhật hàm đánh dấu tất cả đã đọc (bảo vệ recipient_role & notif_system)
CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_username TEXT := public.my_username();
  v_role TEXT := public.my_role();
  v_is_adm BOOLEAN := public.is_admin();
  v_notif_system BOOLEAN;
BEGIN
  IF v_username IS NULL THEN RETURN; END IF;

  SELECT notif_system INTO v_notif_system FROM public.users WHERE username = v_username;

  INSERT INTO public.notification_reads (notification_id, username, read_at)
  SELECT n.id, v_username, NOW()
  FROM public.notifications n
  LEFT JOIN public.notification_reads nr ON nr.notification_id = n.id AND nr.username = v_username
  WHERE (
    n.recipient_username = v_username
    OR (
      n.recipient_username IS NULL
      AND (
        n.recipient_role IS NULL
        OR n.recipient_role = v_role
        OR (n.recipient_role = 'teacher' AND v_is_adm)
      )
    )
  )
  AND n.type != 'email'
  AND (
    (n.type IN ('broadcast', 'system', 'bai_viet') AND COALESCE(v_notif_system, TRUE) = TRUE)
    OR (n.type NOT IN ('broadcast', 'system', 'bai_viet'))
  )
  AND nr.read_at IS NULL
  ON CONFLICT (notification_id, username) DO NOTHING;
END;
$$;

-- 12. Cập nhật hàm đánh dấu 1 thông báo đã đọc (kiểm tra quyền nhận trước khi ghi nhận)
CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id BIGINT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_username TEXT := public.my_username();
  v_role TEXT := public.my_role();
  v_is_adm BOOLEAN := public.is_admin();
  v_eligible BOOLEAN;
BEGIN
  IF v_username IS NULL THEN
    RAISE EXCEPTION 'Không xác định được người dùng hiện tại';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM public.notifications n
    WHERE n.id = p_notification_id
      AND (
        n.recipient_username = v_username
        OR (
          n.recipient_username IS NULL
          AND (
            n.recipient_role IS NULL
            OR n.recipient_role = v_role
            OR (n.recipient_role = 'teacher' AND v_is_adm)
          )
        )
      )
      AND n.type != 'email'
  ) INTO v_eligible;

  IF NOT v_eligible THEN
    RAISE EXCEPTION 'Không tìm thấy thông báo hoặc không có quyền truy cập';
  END IF;

  INSERT INTO public.notification_reads (notification_id, username, read_at)
  VALUES (p_notification_id, v_username, NOW())
  ON CONFLICT (notification_id, username) DO NOTHING;
END;
$$;
