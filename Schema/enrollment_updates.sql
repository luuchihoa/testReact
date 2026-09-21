-- ==============================================================================
-- Migration: Cập nhật & Chuẩn hóa bảng Đăng ký học (public.dang_ky_hoc)
-- Phiên bản: 2.0
-- Mục đích: Sửa regex SĐT, thêm giới hạn độ dài và chống nộp trùng hồ sơ liên tiếp
-- ==============================================================================

-- 1. Sửa ràng buộc kiểm tra số điện thoại (bỏ ký tự '|' sai cú pháp trong character class)
ALTER TABLE public.dang_ky_hoc DROP CONSTRAINT IF EXISTS dang_ky_hoc_sdt_check;
ALTER TABLE public.dang_ky_hoc ADD CONSTRAINT dang_ky_hoc_sdt_check 
  CHECK (sdt ~ '^0[35789][0-9]{8}$');

-- 2. Thêm ràng buộc giới hạn độ dài ký tự tối đa
ALTER TABLE public.dang_ky_hoc DROP CONSTRAINT IF EXISTS dang_ky_hoc_ho_ten_len_check;
ALTER TABLE public.dang_ky_hoc ADD CONSTRAINT dang_ky_hoc_ho_ten_len_check 
  CHECK (char_length(trim(ho_ten)) BETWEEN 2 AND 100);

ALTER TABLE public.dang_ky_hoc DROP CONSTRAINT IF EXISTS dang_ky_hoc_giao_xom_len_check;
ALTER TABLE public.dang_ky_hoc ADD CONSTRAINT dang_ky_hoc_giao_xom_len_check 
  CHECK (char_length(trim(giao_xom)) BETWEEN 1 AND 100);

ALTER TABLE public.dang_ky_hoc DROP CONSTRAINT IF EXISTS dang_ky_hoc_ghi_chu_len_check;
ALTER TABLE public.dang_ky_hoc ADD CONSTRAINT dang_ky_hoc_ghi_chu_len_check 
  CHECK (ghi_chu IS NULL OR char_length(trim(ghi_chu)) <= 500);

-- 3. Cập nhật RPC `submit_dang_ky_hoc` với cơ chế chống gửi trùng lặp
CREATE OR REPLACE FUNCTION public.submit_dang_ky_hoc(
  p_ho_ten       TEXT,
  p_nam_sinh     INT,
  p_sdt          TEXT,
  p_giao_xom     TEXT,
  p_khoi_dang_ky TEXT,
  p_ghi_chu      TEXT DEFAULT NULL
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id BIGINT;
  v_trimmed_name TEXT := trim(COALESCE(p_ho_ten, ''));
  v_trimmed_phone TEXT := trim(COALESCE(p_sdt, ''));
  v_trimmed_xom TEXT := trim(COALESCE(p_giao_xom, ''));
  v_trimmed_note TEXT := NULLIF(trim(COALESCE(p_ghi_chu, '')), '');
  v_existing_id BIGINT;
BEGIN
  -- Kiểm tra dữ liệu đầu vào cơ bản
  IF char_length(v_trimmed_name) < 2 OR char_length(v_trimmed_name) > 100 THEN
    RAISE EXCEPTION 'Họ và tên học viên phải từ 2 đến 100 ký tự';
  END IF;

  IF v_trimmed_phone !~ '^0[35789][0-9]{8}$' THEN
    RAISE EXCEPTION 'Số điện thoại di động không hợp lệ';
  END IF;

  IF char_length(v_trimmed_xom) < 1 OR char_length(v_trimmed_xom) > 100 THEN
    RAISE EXCEPTION 'Giáo họ / Giáo xóm phải từ 1 đến 100 ký tự';
  END IF;

  IF p_khoi_dang_ky NOT IN (
    'Chiên Con (Mầm non – Lớp 2)',
    'Rước Lễ Lần Đầu (Lớp 3 – 4)',
    'Thêm Sức (Lớp 5 – 6)',
    'Phụng Vụ (Lớp 7)'
  ) THEN
    RAISE EXCEPTION 'Khối đăng ký không nằm trong danh sách tuyển sinh trực tuyến';
  END IF;

  -- 1. Kiểm tra đơn đăng ký chưa xử lý (trang_thai = 'moi') của cùng em thiếu nhi (họ tên + sdt)
  SELECT id INTO v_existing_id
  FROM public.dang_ky_hoc
  WHERE ho_ten = v_trimmed_name
    AND sdt = v_trimmed_phone
    AND nam_hoc = public.current_nam_hoc()
    AND trang_thai = 'moi'
  ORDER BY created_at DESC
  LIMIT 1;

  -- 2. Nếu đơn cũ tồn tại và phụ huynh gửi lại để sửa thông tin
  IF v_existing_id IS NOT NULL THEN
    -- Nếu toàn bộ thông tin hoàn toàn trùng khớp 100% trong vòng 2 phút (chống double click do mạng chậm)
    IF EXISTS (
      SELECT 1 FROM public.dang_ky_hoc
      WHERE id = v_existing_id
        AND nam_sinh = p_nam_sinh
        AND giao_xom = v_trimmed_xom
        AND khoi_dang_ky = p_khoi_dang_ky
        AND (ghi_chu = v_trimmed_note OR (ghi_chu IS NULL AND v_trimmed_note IS NULL))
        AND created_at >= NOW() - INTERVAL '2 minutes'
    ) THEN
      RETURN v_existing_id;
    END IF;

    -- Nếu phụ huynh có sửa đổi thông tin (năm sinh, khối, xóm, ghi chú), cập nhật lại đơn cũ với dữ liệu mới nhất
    UPDATE public.dang_ky_hoc
    SET
      nam_sinh = p_nam_sinh,
      giao_xom = v_trimmed_xom,
      khoi_dang_ky = p_khoi_dang_ky,
      ghi_chu = v_trimmed_note,
      created_at = NOW()
    WHERE id = v_existing_id;

    -- Gửi thông báo cho Admin về việc cập nhật hồ sơ
    INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
    SELECT
      'system',
      'Cập nhật đăng ký học',
      v_trimmed_name || ' (' || p_nam_sinh || ') vừa cập nhật lại thông tin đăng ký ' || p_khoi_dang_ky,
      '/quản-trị/đăng-ký?id=' || v_existing_id,
      u.username,
      NULL
    FROM public.users u
    WHERE u.role = 'admin';

    RETURN v_existing_id;
  END IF;

  -- 3. Nếu là hồ sơ mới, thêm bản ghi mới
  INSERT INTO public.dang_ky_hoc (
    ho_ten,
    nam_sinh,
    sdt,
    giao_xom,
    khoi_dang_ky,
    ghi_chu,
    nam_hoc
  )
  VALUES (
    v_trimmed_name,
    p_nam_sinh,
    v_trimmed_phone,
    v_trimmed_xom,
    p_khoi_dang_ky,
    v_trimmed_note,
    public.current_nam_hoc()
  )
  RETURNING id INTO v_id;

  -- Tạo thông báo cho toàn bộ Admin
  INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
  SELECT
    'system',
    'Đăng ký học mới',
    v_trimmed_name || ' (' || p_nam_sinh || ') vừa đăng ký ' || p_khoi_dang_ky,
    '/quản-trị/đăng-ký?id=' || v_id,
    u.username,
    NULL
  FROM public.users u
  WHERE u.role = 'admin';

  RETURN v_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.submit_dang_ky_hoc TO anon, authenticated;
