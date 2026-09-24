-- ==============================================================================
-- MIGRATION: TỰ ĐỘNG TÍNH TOÁN VÀ ĐỒNG BỘ TỔNG KẾT CẢ NĂM (YEAR_SUMMARY)
-- Ban Giáo lý An Ngãi
-- Công thức: ĐTB Cả Năm = (ĐTB HK1 + ĐTB HK2 * 2) / 3
-- Tự động tính Học Lực, Hạnh Kiểm và Vị Thứ Cả Năm khi có dữ liệu HK1 & HK2
-- ==============================================================================

-- 1. Hàm tính toán và cập nhật year_summary cho 1 học sinh trong 1 niên khóa
CREATE OR REPLACE FUNCTION public.compute_year_summary(p_student_username TEXT, p_nam_hoc TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lop TEXT;
  v_tb1 NUMERIC;
  v_tb2 NUMERIC;
  v_diem_tb NUMERIC;
  v_hoc_luc TEXT;
  v_hanh_kiem TEXT;
  v_nghi_phep INT := 0;
  v_nghi_khong_phep INT := 0;
  v_tong_nghi INT := 0;
  v_total_attended INT := 0;
  v_hk2_hanh_kiem TEXT;
  v_hk1_hanh_kiem TEXT;
BEGIN
  IF p_student_username IS NULL OR p_nam_hoc IS NULL THEN
    RETURN;
  END IF;

  -- 1. Tìm lớp học của học sinh
  SELECT lop INTO v_lop
  FROM public.enrollments
  WHERE username = p_student_username AND nam_hoc = p_nam_hoc
  LIMIT 1;

  IF v_lop IS NULL THEN
    SELECT lop INTO v_lop
    FROM public.grades
    WHERE username = p_student_username AND nam_hoc = p_nam_hoc
    LIMIT 1;
  END IF;

  -- 2. Lấy ĐTB của Học kỳ 1 và Học kỳ 2 từ bảng grades
  SELECT diem_tb INTO v_tb1
  FROM public.grades
  WHERE username = p_student_username AND nam_hoc = p_nam_hoc AND hoc_ky = 1;

  SELECT diem_tb INTO v_tb2
  FROM public.grades
  WHERE username = p_student_username AND nam_hoc = p_nam_hoc AND hoc_ky = 2;

  -- 3. Tính ĐTB Cả Năm nếu cả 2 học kỳ đều đã có điểm
  IF v_tb1 IS NOT NULL AND v_tb2 IS NOT NULL THEN
    -- Công thức chuẩn Ban Giáo lý: (HK1 + HK2 * 2) / 3
    v_diem_tb := ROUND(((v_tb1 + v_tb2 * 2.0) / 3.0)::numeric, 1);

    -- Xét Học lực theo ĐTB Cả Năm
    IF v_diem_tb >= 8.0 THEN
      v_hoc_luc := 'Giỏi';
    ELSIF v_diem_tb >= 6.5 THEN
      v_hoc_luc := 'Khá';
    ELSIF v_diem_tb >= 5.0 THEN
      v_hoc_luc := 'Trung Bình';
    ELSIF v_diem_tb >= 3.5 THEN
      v_hoc_luc := 'Yếu';
    ELSE
      v_hoc_luc := 'Kém';
    END IF;
  ELSE
    v_diem_tb := NULL;
    v_hoc_luc := NULL;
  END IF;

  -- 4. Tính Hạnh kiểm Cả Năm dựa trên tổng số buổi vắng cả năm trong bảng attendance
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE trang_thai = 'nghi_phep'),
    COUNT(*) FILTER (WHERE trang_thai = 'nghi_khong_phep')
  INTO 
    v_total_attended,
    v_nghi_phep,
    v_nghi_khong_phep
  FROM public.attendance
  WHERE username = p_student_username AND nam_hoc = p_nam_hoc;

  v_tong_nghi := v_nghi_phep + v_nghi_khong_phep;

  -- Lấy hạnh kiểm HK1 & HK2 để dự phòng
  SELECT hanh_kiem INTO v_hk1_hanh_kiem FROM public.term_summary WHERE username = p_student_username AND nam_hoc = p_nam_hoc AND hoc_ky = 1;
  SELECT hanh_kiem INTO v_hk2_hanh_kiem FROM public.term_summary WHERE username = p_student_username AND nam_hoc = p_nam_hoc AND hoc_ky = 2;

  IF v_total_attended > 0 THEN
    IF (v_nghi_khong_phep = 0 AND v_nghi_phep <= 4) OR (v_nghi_khong_phep <= 1 AND v_tong_nghi <= 2) THEN
      v_hanh_kiem := 'Tốt';
    ELSIF v_nghi_khong_phep <= 3 AND v_tong_nghi <= 6 THEN
      v_hanh_kiem := 'Khá';
    ELSIF v_nghi_khong_phep <= 5 AND v_tong_nghi <= 10 THEN
      v_hanh_kiem := 'Trung Bình';
    ELSE
      v_hanh_kiem := 'Yếu';
    END IF;
  ELSE
    -- Dự phòng: nếu không có bản ghi điểm danh chi tiết, lấy theo hạnh kiểm HK2 (hoặc HK1)
    v_hanh_kiem := COALESCE(v_hk2_hanh_kiem, v_hk1_hanh_kiem);
  END IF;

  -- 5. Upsert vào bảng year_summary nếu có ít nhất 1 dữ kiện (lớp hoặc điểm hoặc hạnh kiểm)
  IF v_lop IS NOT NULL OR v_diem_tb IS NOT NULL OR v_hanh_kiem IS NOT NULL THEN
    INSERT INTO public.year_summary (
      username, nam_hoc, lop, diem_tb, hoc_luc, hanh_kiem
    ) VALUES (
      p_student_username, p_nam_hoc, v_lop, v_diem_tb, v_hoc_luc, v_hanh_kiem
    )
    ON CONFLICT (username, nam_hoc) DO UPDATE SET
      lop = COALESCE(EXCLUDED.lop, year_summary.lop),
      diem_tb = EXCLUDED.diem_tb,
      hoc_luc = EXCLUDED.hoc_luc,
      hanh_kiem = COALESCE(EXCLUDED.hanh_kiem, year_summary.hanh_kiem);

      -- 6. Tính toán lại vị thứ chuẩn học đường RANK() (Kèm Tiêu chí phụ Hạnh kiểm)
      WITH ranked AS (
        SELECT 
          ys_inner.username,
          RANK() OVER (
            ORDER BY 
              ys_inner.diem_tb DESC NULLS LAST,
              CASE ys_inner.hanh_kiem 
                WHEN 'Tốt' THEN 4 
                WHEN 'Khá' THEN 3 
                WHEN 'Trung Bình' THEN 2 
                WHEN 'TB' THEN 2 
                WHEN 'Yếu' THEN 1 
                ELSE 0 
              END DESC
          ) as rank_val
        FROM public.year_summary ys_inner
        WHERE ys_inner.nam_hoc = p_nam_hoc 
          AND ys_inner.lop = v_lop
          AND ys_inner.diem_tb IS NOT NULL
      )
      UPDATE public.year_summary ys
      SET vi_thu = ranked.rank_val
      FROM ranked
      WHERE ys.username = ranked.username
        AND ys.nam_hoc = p_nam_hoc;

      -- Đặt vi_thu = NULL cho những em chưa có điểm cả năm
      UPDATE public.year_summary ys
      SET vi_thu = NULL
      WHERE ys.nam_hoc = p_nam_hoc
        AND ys.lop = v_lop
        AND ys.diem_tb IS NULL;
    END IF;
  END IF;
END;
$$;

-- 2. Trigger từ bảng grades -> tự động tính year_summary
CREATE OR REPLACE FUNCTION public.trg_auto_sync_year_summary_from_grades()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  PERFORM public.compute_year_summary(NEW.username, NEW.nam_hoc);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_grades_auto_sync_year_summary ON public.grades;
CREATE TRIGGER trg_grades_auto_sync_year_summary
AFTER INSERT OR UPDATE OF diem_tb, diem_thi, diem_mieng, diem_vo, diem_15_phut, diem_1_tiet ON public.grades
FOR EACH ROW
EXECUTE FUNCTION public.trg_auto_sync_year_summary_from_grades();

-- 3. Trigger từ bảng attendance -> tự động cập nhật hạnh kiểm cả năm
CREATE OR REPLACE FUNCTION public.trg_auto_sync_year_summary_from_attendance()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user TEXT;
  v_year TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    v_user := OLD.username;
    v_year := OLD.nam_hoc;
  ELSE
    v_user := NEW.username;
    v_year := NEW.nam_hoc;
  END IF;
  PERFORM public.compute_year_summary(v_user, v_year);
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_attendance_auto_sync_year_summary ON public.attendance;
CREATE TRIGGER trg_attendance_auto_sync_year_summary
AFTER INSERT OR UPDATE OR DELETE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.trg_auto_sync_year_summary_from_attendance();

-- 4. Chạy backfill ngay lập tức cho toàn bộ dữ liệu hiện có trong hệ thống
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN SELECT DISTINCT username, nam_hoc FROM public.grades LOOP
    PERFORM public.compute_year_summary(r.username, r.nam_hoc);
  END LOOP;
END $$;
