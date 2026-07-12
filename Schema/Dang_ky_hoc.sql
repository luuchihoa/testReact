-- ============================================================
--  MIGRATION: Đăng ký học (form TuyenSinh.jsx) + Admin xử lý
--  Chạy sau khi đã có schema.sql gốc (cần các hàm is_admin(),
--  my_username(), current_nam_hoc() và bảng notifications, users)
-- ============================================================

-- ============================================================
-- BLOCK 1: Bảng dữ liệu
-- ============================================================

CREATE TABLE public.dang_ky_hoc (
  id                BIGSERIAL PRIMARY KEY,

  -- Các trường khớp đúng form TuyenSinh.jsx
  ho_ten            TEXT NOT NULL CHECK (char_length(trim(ho_ten)) >= 2),
  nam_sinh          INT  NOT NULL CHECK (nam_sinh BETWEEN 1990 AND EXTRACT(YEAR FROM CURRENT_DATE)::INT),
  sdt               TEXT NOT NULL CHECK (sdt ~ '^(0[3|5|7|8|9])[0-9]{8}$'),
  giao_xom          TEXT NOT NULL CHECK (char_length(trim(giao_xom)) >= 1),
  khoi_dang_ky      TEXT NOT NULL CHECK (khoi_dang_ky IN (
                       'Chiên Con (Mầm non – Lớp 2)',
                       'Rước Lễ Lần Đầu (Lớp 3 – 4)',
                       'Thêm Sức (Lớp 5 – 6)',
                       'Phụng Vụ (Lớp 7)'
                     )),
  ghi_chu           TEXT,
  nam_hoc           TEXT NOT NULL DEFAULT public.current_nam_hoc(),

  -- Trạng thái xử lý của admin
  trang_thai        TEXT NOT NULL DEFAULT 'moi'
                     CHECK (trang_thai IN ('moi', 'da_lien_he', 'da_xep_lop', 'tu_choi')),
  ghi_chu_admin     TEXT,
  xu_ly_boi         TEXT REFERENCES public.users(username) ON DELETE SET NULL,
  xu_ly_luc         TIMESTAMPTZ,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.dang_ky_hoc IS
  'Hồ sơ đăng ký học từ trang TuyenSinh.jsx (khách vãng lai, chưa có tài khoản). moi -> da_lien_he/tu_choi -> da_xep_lop';

CREATE INDEX idx_dang_ky_hoc_trang_thai ON public.dang_ky_hoc(trang_thai, created_at DESC);
CREATE INDEX idx_dang_ky_hoc_nam_hoc    ON public.dang_ky_hoc(nam_hoc, khoi_dang_ky);

ALTER TABLE public.dang_ky_hoc ENABLE ROW LEVEL SECURITY;

-- Chỉ admin được đọc/sửa trực tiếp qua bảng. Người ngoài KHÔNG được insert
-- trực tiếp — bắt buộc đi qua hàm submit_dang_ky_hoc() bên dưới để kiểm soát
-- input và không cho tự set trang_thai lúc nộp form.
CREATE POLICY "dang_ky_hoc: admin all" ON public.dang_ky_hoc
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
-- BLOCK 2: Hàm nộp form (gọi từ trang public, không cần đăng nhập)
-- ============================================================

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
BEGIN
  INSERT INTO public.dang_ky_hoc (ho_ten, nam_sinh, sdt, giao_xom, khoi_dang_ky, ghi_chu)
  VALUES (trim(p_ho_ten), p_nam_sinh, trim(p_sdt), trim(p_giao_xom), p_khoi_dang_ky, p_ghi_chu)
  RETURNING id INTO v_id;

  -- Tạo thông báo cho toàn bộ admin
  INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
  SELECT
    'system',
    'Đăng ký học mới',
    trim(p_ho_ten) || ' (' || p_nam_sinh || ') vừa đăng ký ' || p_khoi_dang_ky,
    '/quản-trị/đăng-ký?id=' || v_id,
    u.username,
    NULL
  FROM public.users u
  WHERE u.role = 'admin';

  RETURN v_id;
END;
$$;

-- anon = khách chưa đăng nhập trên web; authenticated = đã đăng nhập cũng gọi được
GRANT EXECUTE ON FUNCTION public.submit_dang_ky_hoc TO anon, authenticated;

-- ============================================================
-- BLOCK 3: Hàm admin xử lý / đổi trạng thái hồ sơ
-- ============================================================

CREATE OR REPLACE FUNCTION public.process_dang_ky_hoc(
  p_id            BIGINT,
  p_trang_thai    TEXT,
  p_ghi_chu_admin TEXT DEFAULT NULL
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Chỉ admin mới được xử lý đăng ký';
  END IF;
  IF p_trang_thai NOT IN ('moi', 'da_lien_he', 'da_xep_lop', 'tu_choi') THEN
    RAISE EXCEPTION 'Trạng thái không hợp lệ';
  END IF;

  UPDATE public.dang_ky_hoc
  SET trang_thai    = p_trang_thai,
      ghi_chu_admin = COALESCE(p_ghi_chu_admin, ghi_chu_admin),
      xu_ly_boi     = public.my_username(),
      xu_ly_luc     = NOW()
  WHERE id = p_id;
END;
$$;

GRANT EXECUTE ON FUNCTION public.process_dang_ky_hoc TO authenticated;

-- ============================================================
-- BLOCK 4: Hàm đếm số hồ sơ chưa xử lý (badge trên UI admin)
-- ============================================================

CREATE OR REPLACE FUNCTION public.get_pending_dang_ky_count()
RETURNS BIGINT
LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COUNT(*) FROM public.dang_ky_hoc WHERE trang_thai = 'moi';
$$;

GRANT EXECUTE ON FUNCTION public.get_pending_dang_ky_count TO authenticated;