-- ====================================================================
-- MIGRATION: TỰ ĐỘNG ĐỒNG BỘ ĐIỂM TRUNG BÌNH, HỌC LỰC, HẠNH KIỂM & VỊ THỨ
-- Ban Giáo lý An Ngãi
-- ====================================================================

-- 1A. Hàm tự động tính ĐTB trước khi lưu vào bảng grades
CREATE OR REPLACE FUNCTION public.compute_grades_diem_tb()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_has_all_grades BOOLEAN;
  v_diem_tb NUMERIC;
BEGIN
  -- 1. Kiểm tra xem đã có đủ 5 cột điểm chưa
  v_has_all_grades := (
    NEW.diem_mieng IS NOT NULL AND
    NEW.diem_vo IS NOT NULL AND
    NEW.diem_15_phut IS NOT NULL AND
    NEW.diem_1_tiet IS NOT NULL AND
    NEW.diem_thi IS NOT NULL
  );

  -- 2. Tính Điểm Trung Bình nếu đủ 5 cột điểm, ngược lại trả về NULL
  IF v_has_all_grades THEN
    v_diem_tb := ROUND(
      (
        NEW.diem_mieng * 1 +
        NEW.diem_vo * 1 +
        NEW.diem_15_phut * 1 +
        NEW.diem_1_tiet * 2 +
        NEW.diem_thi * 3
      )::numeric / 8.0,
      1
    );
  ELSE
    v_diem_tb := NULL;
  END IF;

  -- Gán lại diem_tb vào bản ghi grades
  NEW.diem_tb := v_diem_tb;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_compute_grades_diem_tb ON public.grades;
CREATE TRIGGER trg_compute_grades_diem_tb
BEFORE INSERT OR UPDATE OF diem_mieng, diem_vo, diem_15_phut, diem_1_tiet, diem_thi ON public.grades
FOR EACH ROW
EXECUTE FUNCTION public.compute_grades_diem_tb();


-- 1B. Hàm đồng bộ Học lực & Vị thứ SAU KHI grades đã được cập nhật
CREATE OR REPLACE FUNCTION public.sync_grades_evaluation_to_term_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hoc_luc TEXT;
  v_lop TEXT;
BEGIN
  -- 1. Tự động xét Học lực theo Điểm Trung Bình
  IF NEW.diem_tb IS NULL THEN
    v_hoc_luc := NULL;
  ELSIF NEW.diem_tb >= 8.0 THEN
    v_hoc_luc := 'Giỏi';
  ELSIF NEW.diem_tb >= 6.5 THEN
    v_hoc_luc := 'Khá';
  ELSIF NEW.diem_tb >= 5.0 THEN
    v_hoc_luc := 'Trung Bình';
  ELSIF NEW.diem_tb >= 3.5 THEN
    v_hoc_luc := 'Yếu';
  ELSE
    v_hoc_luc := 'Kém';
  END IF;

  -- 2. Xác định tên lớp (ưu tiên từ NEW.lop hoặc enrollments)
  v_lop := COALESCE(NEW.lop, (
    SELECT lop FROM public.enrollments 
    WHERE username = NEW.username AND nam_hoc = NEW.nam_hoc
    LIMIT 1
  ));

  IF v_lop IS NOT NULL THEN
    -- 3. Upsert vào term_summary
    INSERT INTO public.term_summary (
      username, nam_hoc, lop, hoc_ky, hoc_luc, updated_by
    ) VALUES (
      NEW.username, NEW.nam_hoc, v_lop, NEW.hoc_ky, v_hoc_luc, NEW.updated_by
    )
    ON CONFLICT (username, nam_hoc, hoc_ky) DO UPDATE SET
      lop = EXCLUDED.lop,
      hoc_luc = COALESCE(EXCLUDED.hoc_luc, term_summary.hoc_luc);

    -- 4. Tự động tính toán lại vị thứ (vi_thu) cho cả lớp trong học kỳ đó
    WITH ranked AS (
      SELECT 
        g.username,
        DENSE_RANK() OVER (ORDER BY g.diem_tb DESC NULLS LAST) as rank_val
      FROM public.grades g
      WHERE g.nam_hoc = NEW.nam_hoc 
        AND g.hoc_ky = NEW.hoc_ky 
        AND g.lop = v_lop
        AND g.diem_tb IS NOT NULL
    )
    UPDATE public.term_summary ts
    SET vi_thu = ranked.rank_val
    FROM ranked
    WHERE ts.username = ranked.username
      AND ts.nam_hoc = NEW.nam_hoc
      AND ts.hoc_ky = NEW.hoc_ky;

    -- Đặt vi_thu = NULL cho những em chưa đủ điểm trong lớp
    UPDATE public.term_summary ts
    SET vi_thu = NULL
    WHERE ts.nam_hoc = NEW.nam_hoc
      AND ts.hoc_ky = NEW.hoc_ky
      AND ts.lop = v_lop
      AND NOT EXISTS (
        SELECT 1 FROM public.grades g
        WHERE g.username = ts.username 
          AND g.nam_hoc = ts.nam_hoc 
          AND g.hoc_ky = ts.hoc_ky 
          AND g.diem_tb IS NOT NULL
      );
  END IF;

  RETURN NEW;
END;
$$;

-- Gắn Trigger AFTER vào bảng grades
DROP TRIGGER IF EXISTS trg_sync_grades_evaluation ON public.grades;
CREATE TRIGGER trg_sync_grades_evaluation
AFTER INSERT OR UPDATE OF diem_tb, diem_mieng, diem_vo, diem_15_phut, diem_1_tiet, diem_thi ON public.grades
FOR EACH ROW
EXECUTE FUNCTION public.sync_grades_evaluation_to_term_summary();


-- 2. Hàm tính toán và đồng bộ Hạnh kiểm khi bảng attendance thay đổi
CREATE OR REPLACE FUNCTION public.sync_attendance_evaluation_to_term_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_nam_hoc TEXT;
  v_hoc_ky INT;
  v_lop TEXT;
  v_total_attended INT := 0;
  v_nghi_phep INT := 0;
  v_nghi_khong_phep INT := 0;
  v_tong_nghi INT := 0;
  v_hanh_kiem TEXT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_username := OLD.username;
    v_nam_hoc  := OLD.nam_hoc;
    v_hoc_ky   := OLD.hoc_ky;
  ELSE
    v_username := NEW.username;
    v_nam_hoc  := NEW.nam_hoc;
    v_hoc_ky   := NEW.hoc_ky;
  END IF;

  -- 1. Đếm số buổi vắng và tổng số buổi đã điểm danh
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE trang_thai = 'nghi_phep'),
    COUNT(*) FILTER (WHERE trang_thai = 'nghi_khong_phep')
  INTO 
    v_total_attended,
    v_nghi_phep,
    v_nghi_khong_phep
  FROM public.attendance
  WHERE username = v_username 
    AND nam_hoc = v_nam_hoc 
    AND hoc_ky = v_hoc_ky;

  v_tong_nghi := v_nghi_phep + v_nghi_khong_phep;

  -- 2. Tự động xét Hạnh kiểm theo tiêu chuẩn chuyên cần
  IF v_total_attended = 0 THEN
    v_hanh_kiem := NULL;
  ELSIF v_nghi_khong_phep = 0 AND v_nghi_phep <= 1 THEN
    v_hanh_kiem := 'Tốt';
  ELSIF v_nghi_khong_phep <= 1 AND v_nghi_phep <= 2 THEN
    v_hanh_kiem := 'Khá';
  ELSIF v_nghi_khong_phep <= 2 AND v_tong_nghi <= 4 THEN
    v_hanh_kiem := 'Trung Bình';
  ELSE
    v_hanh_kiem := 'Yếu';
  END IF;

  -- 3. Lấy lớp của học sinh
  SELECT lop INTO v_lop
  FROM public.enrollments
  WHERE username = v_username AND nam_hoc = v_nam_hoc
  LIMIT 1;

  IF v_lop IS NOT NULL THEN
    INSERT INTO public.term_summary (
      username, nam_hoc, lop, hoc_ky, hanh_kiem, updated_by
    ) VALUES (
      v_username, v_nam_hoc, v_lop, v_hoc_ky, v_hanh_kiem, CASE WHEN TG_OP <> 'DELETE' THEN NEW.updated_by ELSE NULL END
    )
    ON CONFLICT (username, nam_hoc, hoc_ky) DO UPDATE SET
      lop = EXCLUDED.lop,
      hanh_kiem = COALESCE(EXCLUDED.hanh_kiem, term_summary.hanh_kiem);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- Gắn Trigger vào bảng attendance
DROP TRIGGER IF EXISTS trg_sync_attendance_evaluation ON public.attendance;

CREATE TRIGGER trg_sync_attendance_evaluation
AFTER INSERT OR UPDATE OR DELETE ON public.attendance
FOR EACH ROW
EXECUTE FUNCTION public.sync_attendance_evaluation_to_term_summary();
