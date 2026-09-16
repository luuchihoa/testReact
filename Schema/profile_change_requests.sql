-- ==============================================================================
-- FILE: profile_change_requests.sql
-- TÍNH NĂNG: Quy trình học sinh gửi yêu cầu thay đổi thông tin hồ sơ
--           và Giáo lý viên chủ nhiệm / Admin phê duyệt (Phương án toàn diện).
-- ==============================================================================

-- 1. BẢNG LƯU TRỮ YÊU CẦU THAY ĐỔI HỒ SƠ
CREATE TABLE IF NOT EXISTS public.profile_change_requests (
  id              BIGSERIAL PRIMARY KEY,
  username        TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
  nam_hoc         TEXT NOT NULL,
  lop             TEXT,
  proposed_data   JSONB NOT NULL,
  current_data    JSONB NOT NULL,
  status          TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  teacher_note    TEXT,
  reviewed_by     TEXT REFERENCES public.users(username) ON DELETE SET NULL,
  reviewed_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. CHỈ MỤC (INDEXES)
CREATE INDEX IF NOT EXISTS idx_pcr_username_status ON public.profile_change_requests(username, status);
CREATE INDEX IF NOT EXISTS idx_pcr_namhoc_lop     ON public.profile_change_requests(nam_hoc, lop);
CREATE INDEX IF NOT EXISTS idx_pcr_created_at      ON public.profile_change_requests(created_at DESC);

-- 3. PHÂN QUYỀN ROW LEVEL SECURITY (RLS)
ALTER TABLE public.profile_change_requests ENABLE ROW LEVEL SECURITY;

-- Học sinh chỉ xem và tạo yêu cầu của chính mình
CREATE POLICY "pcr: student select own"
  ON public.profile_change_requests
  FOR SELECT
  USING (username = public.my_username());

CREATE POLICY "pcr: student insert own"
  ON public.profile_change_requests
  FOR INSERT
  WITH CHECK (username = public.my_username() AND status = 'pending');

CREATE POLICY "pcr: student cancel own"
  ON public.profile_change_requests
  FOR UPDATE
  USING (username = public.my_username() AND status = 'pending')
  WITH CHECK (status = 'cancelled');

-- Giáo viên xem & duyệt yêu cầu của học sinh thuộc lớp mình chủ nhiệm
CREATE POLICY "pcr: teacher select class"
  ON public.profile_change_requests
  FOR SELECT
  USING (public.is_teacher_of(username, nam_hoc) OR public.is_admin());

CREATE POLICY "pcr: teacher update class"
  ON public.profile_change_requests
  FOR UPDATE
  USING (public.is_teacher_of(username, nam_hoc) OR public.is_admin())
  WITH CHECK (public.is_teacher_of(username, nam_hoc) OR public.is_admin());

CREATE POLICY "pcr: admin all"
  ON public.profile_change_requests
  FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- 4. HÀM TẠO YÊU CẦU THAY ĐỔI HỒ SƠ (Dành cho Học sinh)
CREATE OR REPLACE FUNCTION public.create_profile_change_request(p_changes JSONB)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_username      TEXT := public.my_username();
  v_nam_hoc       TEXT;
  v_lop           TEXT;
  v_current_data  JSONB;
  v_request_id    BIGINT;
  v_teacher       TEXT;
  v_student_name  TEXT;
BEGIN
  IF v_username IS NULL THEN
    RAISE EXCEPTION 'Bạn chưa đăng nhập';
  END IF;

  -- Tìm lớp và niên khóa của học sinh
  SELECT e.lop, e.nam_hoc INTO v_lop, v_nam_hoc
  FROM public.enrollments e
  WHERE e.username = v_username
  ORDER BY e.nam_hoc DESC
  LIMIT 1;

  IF v_nam_hoc IS NULL THEN
    v_nam_hoc := public.current_nam_hoc();
    v_lop := 'Chưa xếp lớp';
  END IF;

  -- Snapshot dữ liệu hiện tại
  SELECT jsonb_build_object(
    'ten_thanh', ten_thanh,
    'ho_va_ten', ho_va_ten,
    'ngay_sinh', ngay_sinh,
    'gioi_tinh', gioi_tinh,
    'ngay_rua_toi', ngay_rua_toi,
    'ngay_ruoc_le', ngay_ruoc_le,
    'ngay_them_suc', ngay_them_suc,
    'ten_cha', ten_cha,
    'ten_me', ten_me,
    'sdt', sdt,
    'giao_xom', giao_xom
  ), ho_va_ten
  INTO v_current_data, v_student_name
  FROM public.users
  WHERE username = v_username;

  IF v_current_data IS NULL THEN
    RAISE EXCEPTION 'Không tìm thấy thông tin tài khoản';
  END IF;

  -- Tự động hủy các yêu cầu cũ đang pending của học sinh này
  UPDATE public.profile_change_requests
  SET status = 'cancelled', updated_at = NOW()
  WHERE username = v_username AND status = 'pending';

  -- Tạo yêu cầu mới
  INSERT INTO public.profile_change_requests (
    username, nam_hoc, lop, proposed_data, current_data, status
  ) VALUES (
    v_username, v_nam_hoc, v_lop, p_changes, v_current_data, 'pending'
  ) RETURNING id INTO v_request_id;

  -- Gửi thông báo đến Giáo lý viên chủ nhiệm của lớp
  FOR v_teacher IN 
    SELECT ct.teacher_username 
    FROM public.class_teachers ct 
    WHERE ct.lop = v_lop AND ct.nam_hoc = v_nam_hoc
  LOOP
    INSERT INTO public.notifications (
      type, title, message, link, recipient_username, created_by, nam_hoc, lop
    ) VALUES (
      'system',
      'Yêu cầu sửa hồ sơ: ' || COALESCE(v_student_name, v_username),
      'Học sinh ' || COALESCE(v_student_name, v_username) || ' (Lớp ' || v_lop || ') vừa gửi yêu cầu cập nhật thông tin hồ sơ.',
      '/quản-lý-học-sinh/học-sinh',
      v_teacher,
      v_username,
      v_nam_hoc,
      v_lop
    );
  END LOOP;

  RETURN jsonb_build_object(
    'id', v_request_id,
    'status', 'pending',
    'nam_hoc', v_nam_hoc,
    'lop', v_lop,
    'message', 'Yêu cầu cập nhật hồ sơ đã được gửi đến Giáo lý viên chủ nhiệm'
  );
END;
$$;


-- 5. HÀM LẤY YÊU CẦU CHỜ DUYỆT CỦA HỌC SINH ĐANG ĐĂNG NHẬP
CREATE OR REPLACE FUNCTION public.get_my_pending_profile_request()
RETURNS JSONB
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_username TEXT := public.my_username();
  v_result   JSONB;
BEGIN
  IF v_username IS NULL THEN RETURN NULL; END IF;

  SELECT row_to_json(r)::JSONB INTO v_result
  FROM (
    SELECT id, username, nam_hoc, lop, proposed_data, current_data, status, teacher_note, created_at
    FROM public.profile_change_requests
    WHERE username = v_username AND status = 'pending'
    ORDER BY created_at DESC
    LIMIT 1
  ) r;

  RETURN v_result;
END;
$$;


-- 6. HÀM LẤY DANH SÁCH YÊU CẦU CHỜ DUYỆT (Dành cho Giáo viên & Admin)
CREATE OR REPLACE FUNCTION public.get_pending_profile_requests_for_teacher(p_nam_hoc TEXT DEFAULT NULL)
RETURNS TABLE (
  id BIGINT,
  username TEXT,
  ho_va_ten TEXT,
  ten_thanh TEXT,
  avatar TEXT,
  gioi_tinh TEXT,
  lop TEXT,
  nam_hoc TEXT,
  proposed_data JSONB,
  current_data JSONB,
  status TEXT,
  created_at TIMESTAMPTZ
)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_active_nam_hoc TEXT := COALESCE(p_nam_hoc, public.current_nam_hoc());
  v_is_admin       BOOLEAN := public.is_admin();
BEGIN
  RETURN QUERY
  SELECT 
    pcr.id,
    pcr.username,
    u.ho_va_ten,
    u.ten_thanh,
    u.avatar,
    u.gioi_tinh,
    pcr.lop,
    pcr.nam_hoc,
    pcr.proposed_data,
    pcr.current_data,
    pcr.status,
    pcr.created_at
  FROM public.profile_change_requests pcr
  JOIN public.users u ON u.username = pcr.username
  WHERE pcr.status = 'pending'
    AND pcr.nam_hoc = v_active_nam_hoc
    AND (
      v_is_admin 
      OR public.is_teacher_of(pcr.username, pcr.nam_hoc)
    )
  ORDER BY pcr.created_at ASC;
END;
$$;


-- 7. HÀM PHÊ DUYỆT YÊU CẦU (Dành cho Giáo viên & Admin)
CREATE OR REPLACE FUNCTION public.approve_profile_change_request(p_request_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_req            RECORD;
  v_reviewer       TEXT := public.my_username();
  v_is_authorized  BOOLEAN;
BEGIN
  SELECT * INTO v_req
  FROM public.profile_change_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Không tìm thấy yêu cầu';
  END IF;

  IF v_req.status <> 'pending' THEN
    RAISE EXCEPTION 'Yêu cầu này đã được xử lý trước đó (Trạng thái: %)', v_req.status;
  END IF;

  -- Kiểm tra quyền: Admin hoặc GLV chủ nhiệm của học sinh
  v_is_authorized := public.is_admin() OR public.is_teacher_of(v_req.username, v_req.nam_hoc);
  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'Bạn không có quyền phê duyệt yêu cầu của học sinh này';
  END IF;

  -- Cập nhật dữ liệu vào bảng users
  UPDATE public.users
  SET
    ten_thanh     = CASE WHEN v_req.proposed_data ? 'ten_thanh'     THEN NULLIF(v_req.proposed_data->>'ten_thanh', '')     ELSE ten_thanh     END,
    ho_va_ten     = CASE WHEN v_req.proposed_data ? 'ho_va_ten'     THEN NULLIF(v_req.proposed_data->>'ho_va_ten', '')     ELSE ho_va_ten     END,
    ngay_sinh     = CASE WHEN v_req.proposed_data ? 'ngay_sinh'     THEN NULLIF(v_req.proposed_data->>'ngay_sinh', '')::DATE ELSE ngay_sinh   END,
    gioi_tinh     = CASE WHEN v_req.proposed_data ? 'gioi_tinh'     THEN NULLIF(v_req.proposed_data->>'gioi_tinh', '')     ELSE gioi_tinh     END,
    ngay_rua_toi  = CASE WHEN v_req.proposed_data ? 'ngay_rua_toi'  THEN NULLIF(v_req.proposed_data->>'ngay_rua_toi', '')::DATE ELSE ngay_rua_toi END,
    ngay_ruoc_le  = CASE WHEN v_req.proposed_data ? 'ngay_ruoc_le'  THEN NULLIF(v_req.proposed_data->>'ngay_ruoc_le', '')::DATE ELSE ngay_ruoc_le END,
    ngay_them_suc = CASE WHEN v_req.proposed_data ? 'ngay_them_suc' THEN NULLIF(v_req.proposed_data->>'ngay_them_suc', '')::DATE ELSE ngay_them_suc END,
    ten_cha       = CASE WHEN v_req.proposed_data ? 'ten_cha'       THEN NULLIF(v_req.proposed_data->>'ten_cha', '')       ELSE ten_cha       END,
    ten_me        = CASE WHEN v_req.proposed_data ? 'ten_me'        THEN NULLIF(v_req.proposed_data->>'ten_me', '')        ELSE ten_me        END,
    sdt           = CASE WHEN v_req.proposed_data ? 'sdt'           THEN NULLIF(v_req.proposed_data->>'sdt', '')           ELSE sdt           END,
    giao_xom      = CASE WHEN v_req.proposed_data ? 'giao_xom'      THEN NULLIF(v_req.proposed_data->>'giao_xom', '')      ELSE giao_xom      END
  WHERE username = v_req.username;

  -- Đánh dấu yêu cầu là approved
  UPDATE public.profile_change_requests
  SET 
    status = 'approved',
    reviewed_by = v_reviewer,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

  -- Gửi thông báo đến học sinh
  INSERT INTO public.notifications (
    type, title, message, link, recipient_username, created_by
  ) VALUES (
    'system',
    'Hồ sơ đã được phê duyệt',
    'Giáo lý viên chủ nhiệm đã phê duyệt các thay đổi trong hồ sơ cá nhân của bạn.',
    '/tài-khoản/hồ-sơ',
    v_req.username,
    v_reviewer
  );

  RETURN jsonb_build_object('success', TRUE, 'id', p_request_id, 'status', 'approved');
END;
$$;


-- 8. HÀM TỪ CHỐI YÊU CẦU (Dành cho Giáo viên & Admin)
CREATE OR REPLACE FUNCTION public.reject_profile_change_request(p_request_id BIGINT, p_note TEXT DEFAULT NULL)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_req            RECORD;
  v_reviewer       TEXT := public.my_username();
  v_is_authorized  BOOLEAN;
  v_reason_msg     TEXT;
BEGIN
  SELECT * INTO v_req
  FROM public.profile_change_requests
  WHERE id = p_request_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Không tìm thấy yêu cầu';
  END IF;

  IF v_req.status <> 'pending' THEN
    RAISE EXCEPTION 'Yêu cầu này đã được xử lý trước đó (Trạng thái: %)', v_req.status;
  END IF;

  -- Kiểm tra quyền: Admin hoặc GLV chủ nhiệm của học sinh
  v_is_authorized := public.is_admin() OR public.is_teacher_of(v_req.username, v_req.nam_hoc);
  IF NOT v_is_authorized THEN
    RAISE EXCEPTION 'Bạn không có quyền từ chối yêu cầu của học sinh này';
  END IF;

  -- Đánh dấu yêu cầu là rejected
  UPDATE public.profile_change_requests
  SET 
    status = 'rejected',
    teacher_note = p_note,
    reviewed_by = v_reviewer,
    reviewed_at = NOW(),
    updated_at = NOW()
  WHERE id = p_request_id;

  v_reason_msg := CASE 
    WHEN p_note IS NOT NULL AND TRIM(p_note) <> '' THEN 'Lý do: ' || TRIM(p_note)
    ELSE 'Vui lòng liên hệ Giáo lý viên chủ nhiệm để biết thêm chi tiết.'
  END;

  -- Gửi thông báo đến học sinh
  INSERT INTO public.notifications (
    type, title, message, link, recipient_username, created_by
  ) VALUES (
    'system',
    'Yêu cầu sửa hồ sơ không được duyệt',
    'Yêu cầu cập nhật hồ sơ của bạn đã bị từ chối. ' || v_reason_msg,
    '/tài-khoản/hồ-sơ',
    v_req.username,
    v_reviewer
  );

  RETURN jsonb_build_object('success', TRUE, 'id', p_request_id, 'status', 'rejected');
END;
$$;


-- 9. HÀM HỦY YÊU CẦU (Dành cho Học sinh tự hủy)
CREATE OR REPLACE FUNCTION public.cancel_profile_change_request(p_request_id BIGINT)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_username TEXT := public.my_username();
BEGIN
  UPDATE public.profile_change_requests
  SET status = 'cancelled', updated_at = NOW()
  WHERE id = p_request_id AND username = v_username AND status = 'pending';

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Không tìm thấy yêu cầu đang chờ duyệt phù hợp để hủy';
  END IF;

  RETURN jsonb_build_object('success', TRUE, 'id', p_request_id, 'status', 'cancelled');
END;
$$;
