-- Bảng danh sách đăng ký nhận tin (Subscribers)
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Bất kỳ ai cũng có thể ĐĂNG KÝ (Insert)
-- Không giới hạn đối tượng vì ô đăng ký nằm ở Footer công khai
CREATE POLICY "Cho phép tất cả mọi người đăng ký nhận tin"
    ON public.subscribers
    FOR INSERT
    WITH CHECK (true);

-- Policy 2: Chỉ Admin mới có quyền XEM (Select) danh sách
CREATE POLICY "Chỉ Admin được xem danh sách đăng ký"
    ON public.subscribers
    FOR SELECT
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Policy 3: Chỉ Admin mới có quyền SỬA (Update) danh sách
CREATE POLICY "Chỉ Admin được sửa danh sách đăng ký"
    ON public.subscribers
    FOR UPDATE
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Policy 4: Chỉ Admin mới có quyền XOÁ (Delete)
CREATE POLICY "Chỉ Admin được xoá danh sách đăng ký"
    ON public.subscribers
    FOR DELETE
    USING (
        auth.role() = 'authenticated' AND
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.auth_id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- ==========================================
-- PHẦN BỔ SUNG TỪ BẢN CẬP NHẬT LỊCH SỬ EMAIL
-- ==========================================
-- PHẦN BỔ SUNG TỪ BẢN CẬP NHẬT LỊCH SỬ EMAIL & IDEMPOTENCY
-- ==========================================

-- 1. Cập nhật Constraint để cho phép loại thông báo 'email'
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

ALTER TABLE public.newsletter_send_jobs ADD COLUMN IF NOT EXISTS payload_hash TEXT;
ALTER TABLE public.newsletter_send_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "newsletter_send_jobs: admin all" ON public.newsletter_send_jobs;
CREATE POLICY "newsletter_send_jobs: admin all"
ON public.newsletter_send_jobs
FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 3. Hàm chiếm quyền xử lý gửi email nguyên tử (Atomic Idempotency Claiming)
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

  SELECT * INTO v_existing
  FROM public.newsletter_send_jobs
  WHERE idempotency_key = p_idempotency_key
  FOR UPDATE;

  IF FOUND THEN
    IF v_existing.payload_hash IS NOT NULL AND v_existing.payload_hash != p_payload_hash THEN
      RETURN jsonb_build_object(
        'action', 'payload_mismatch',
        'message', 'Idempotency key này đã được sử dụng cho một nội dung thông báo khác.'
      );
    END IF;

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

    IF v_existing.status = 'processing' AND v_existing.updated_at > (NOW() - INTERVAL '5 minutes') THEN
      RETURN jsonb_build_object(
        'action', 'conflict',
        'message', 'Yêu cầu phát bản tin này đang được máy chủ xử lý. Vui lòng đợi trong giây lát.'
      );
    END IF;

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
  SELECT * INTO v_existing
  FROM public.newsletter_send_jobs
  WHERE idempotency_key = p_idempotency_key;

  RETURN jsonb_build_object(
    'action', 'conflict',
    'message', 'Yêu cầu phát bản tin này đang được máy chủ xử lý.'
  );
END;
$$;

-- 4. Hàm kết thúc và ghi nhận lịch sử gửi email nguyên tử (Server-side finalize)
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

  IF p_accepted > 0 AND v_title IS NOT NULL THEN
    INSERT INTO public.newsletters (title, message, link, created_by)
    VALUES (v_title, v_message, v_link, v_created_by);

    INSERT INTO public.notifications (type, title, message, link, recipient_username, recipient_role, created_by)
    VALUES ('email', v_title, v_message, v_link, NULL, NULL, v_created_by);
  END IF;
END;
$$;

-- 5. Cập nhật hàm get_my_notifications để ẩn 'email' khỏi chuông thông báo của user và lọc theo recipient_role & notif_system
CREATE OR REPLACE FUNCTION public.get_my_notifications(p_limit INT DEFAULT 30)
RETURNS TABLE (id BIGINT, type TEXT, title TEXT, message TEXT, link TEXT, created_at TIMESTAMPTZ, read BOOLEAN)
LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE
  v_username TEXT := public.my_username();
  v_role TEXT := public.my_role();
  v_is_adm BOOLEAN := public.is_admin();
  v_notif_system BOOLEAN;
BEGIN
  IF v_username IS NULL THEN RETURN; END IF;
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

-- 6. Cập nhật hàm đếm thông báo chưa đọc (lọc theo recipient_role & notif_system)
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INT LANGUAGE plpgsql STABLE SET search_path = public AS $$
DECLARE
  v_username TEXT := public.my_username();
  v_role TEXT := public.my_role();
  v_is_adm BOOLEAN := public.is_admin();
  v_notif_system BOOLEAN;
  v_count INT;
BEGIN
  IF v_username IS NULL THEN RETURN 0; END IF;
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

-- ==========================================
-- HÀM TIỆN ÍCH CHO EMAIL
-- ==========================================

-- Lấy email của người dùng từ auth.users
CREATE OR REPLACE FUNCTION get_user_email(p_username TEXT)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT au.email INTO v_email
  FROM auth.users au
  JOIN public.users pu ON au.id = pu.auth_id
  WHERE pu.username = p_username;

  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
