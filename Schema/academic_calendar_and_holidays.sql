-- ============================================================
-- SCHEMA: QUẢN TRỊ LỊCH NIÊN KHÓA TẬP TRUNG & NGÀY NGHỈ LỄ PHỤNG VỤ
-- Ban Giáo lý An Ngãi
-- ============================================================

-- 1. Bảng cấu hình khung Lịch Niên khóa (HK1 & HK2) toàn Xứ đoàn
CREATE TABLE IF NOT EXISTS public.academic_calendars (
  nam_hoc          TEXT PRIMARY KEY,                     -- vd: '2026-2027'
  hk1_start_date   DATE NOT NULL,                        -- vd: '2026-09-06' (Chúa Nhật đầu tháng 9)
  hk1_total_weeks  INT NOT NULL DEFAULT 16 CHECK (hk1_total_weeks > 0),
  hk2_start_date   DATE NOT NULL,                        -- vd: '2027-01-10' (Chúa Nhật đầu tháng 1)
  hk2_total_weeks  INT NOT NULL DEFAULT 16 CHECK (hk2_total_weeks > 0),
  ghi_chu          TEXT DEFAULT '',
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by       TEXT REFERENCES public.users(username) ON DELETE SET NULL
);

COMMENT ON TABLE public.academic_calendars IS 'Cấu hình lịch học kỳ tập trung toàn xứ đoàn theo niên khóa';

-- 2. Bảng quản lý Danh sách Ngày Nghỉ Lễ Phụng vụ, Nghỉ Tết & Sự kiện ngoại khóa
CREATE TABLE IF NOT EXISTS public.academic_holidays (
  id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  nam_hoc      TEXT NOT NULL,
  hoc_ky       INT NOT NULL CHECK (hoc_ky IN (1, 2)),
  ngay         DATE NOT NULL,                            -- Ngày Chúa Nhật nghỉ (YYYY-MM-DD)
  ten_ngay_le  TEXT NOT NULL,                            -- vd: 'Nghỉ Tết Nguyên Đán', 'Lễ Phục Sinh'
  loai_nghi    TEXT NOT NULL DEFAULT 'nghi_le' CHECK (loai_nghi IN ('nghi_le', 'nghi_tet', 'su_kien', 'hoc_bu')),
  ghi_chu      TEXT DEFAULT '',
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(nam_hoc, ngay)
);

COMMENT ON TABLE public.academic_holidays IS 'Danh sách các ngày Chúa Nhật nghỉ lễ Phụng vụ, nghỉ Tết và sự kiện toàn xứ đoàn';

-- 3. Thiết lập RLS (Row Level Security)
ALTER TABLE public.academic_calendars ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.academic_holidays  ENABLE ROW LEVEL SECURITY;

-- Cho phép tất cả tài khoản đã đăng nhập xem lịch và ngày nghỉ
DROP POLICY IF EXISTS "academic_calendars: read all" ON public.academic_calendars;
CREATE POLICY "academic_calendars: read all" ON public.academic_calendars
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "academic_holidays: read all" ON public.academic_holidays;
CREATE POLICY "academic_holidays: read all" ON public.academic_holidays
  FOR SELECT TO authenticated USING (true);

-- Chỉ Admin mới có quyền thêm/sửa/xóa lịch và ngày nghỉ
DROP POLICY IF EXISTS "academic_calendars: admin write" ON public.academic_calendars;
CREATE POLICY "academic_calendars: admin write" ON public.academic_calendars
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "academic_holidays: admin write" ON public.academic_holidays;
CREATE POLICY "academic_holidays: admin write" ON public.academic_holidays
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 4. RPC: Đồng bộ Lịch Niên khóa vào term_summary của tất cả các lớp trong năm học
CREATE OR REPLACE FUNCTION public.sync_academic_calendar_to_classes(
  p_nam_hoc       TEXT,
  p_hk1_start     DATE,
  p_hk1_weeks     INT,
  p_hk2_start     DATE,
  p_hk2_weeks     INT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_count_hk1 INT := 0;
  v_count_hk2 INT := 0;
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Chỉ Ban Quản Trị mới có quyền đồng bộ lịch niên khóa';
  END IF;

  -- 1. Lưu/Cập nhật bảng academic_calendars
  INSERT INTO public.academic_calendars (
    nam_hoc, hk1_start_date, hk1_total_weeks, hk2_start_date, hk2_total_weeks, updated_at, updated_by
  ) VALUES (
    p_nam_hoc, p_hk1_start, p_hk1_weeks, p_hk2_start, p_hk2_weeks, NOW(), public.my_username()
  )
  ON CONFLICT (nam_hoc) DO UPDATE SET
    hk1_start_date  = EXCLUDED.hk1_start_date,
    hk1_total_weeks = EXCLUDED.hk1_total_weeks,
    hk2_start_date  = EXCLUDED.hk2_start_date,
    hk2_total_weeks = EXCLUDED.hk2_total_weeks,
    updated_at      = NOW(),
    updated_by      = public.my_username();

  -- 2. Đảm bảo tất cả học sinh đã ghi danh (enrollments) đều có bản ghi term_summary cho HK1 và HK2
  -- HK1:
  INSERT INTO public.term_summary (username, nam_hoc, lop, hoc_ky, ngay_bat_dau, tong_buoi, updated_by)
  SELECT e.username, e.nam_hoc, e.lop, 1, p_hk1_start, p_hk1_weeks, public.my_username()
  FROM public.enrollments e
  WHERE e.nam_hoc = p_nam_hoc
  ON CONFLICT (username, nam_hoc, hoc_ky) DO UPDATE SET
    lop          = EXCLUDED.lop,
    ngay_bat_dau = EXCLUDED.ngay_bat_dau,
    tong_buoi    = EXCLUDED.tong_buoi,
    updated_by   = public.my_username();
  GET DIAGNOSTICS v_count_hk1 = ROW_COUNT;

  -- HK2:
  INSERT INTO public.term_summary (username, nam_hoc, lop, hoc_ky, ngay_bat_dau, tong_buoi, updated_by)
  SELECT e.username, e.nam_hoc, e.lop, 2, p_hk2_start, p_hk2_weeks, public.my_username()
  FROM public.enrollments e
  WHERE e.nam_hoc = p_nam_hoc
  ON CONFLICT (username, nam_hoc, hoc_ky) DO UPDATE SET
    lop          = EXCLUDED.lop,
    ngay_bat_dau = EXCLUDED.ngay_bat_dau,
    tong_buoi    = EXCLUDED.tong_buoi,
    updated_by   = public.my_username();
  GET DIAGNOSTICS v_count_hk2 = ROW_COUNT;

  RETURN jsonb_build_object(
    'success', true,
    'nam_hoc', p_nam_hoc,
    'updated_hk1_students', v_count_hk1,
    'updated_hk2_students', v_count_hk2
  );
END;
$$;
