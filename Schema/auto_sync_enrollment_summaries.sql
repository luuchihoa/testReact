-- ====================================================================
--  MIGRATION: TỰ ĐỘNG ĐỒNG BỘ VÀ DỌN DẸP BẢN GHI TỔNG KẾT / SỔ ĐIỂM
--  Giải quyết triệt để vấn đề:
--  1. Khi chuyển lớp cho học sinh: Tự động cập nhật tên lớp mới vào term_summary, year_summary, grades.
--  2. Khi gỡ học sinh khỏi lớp / xóa ghi danh: Tự động dọn sạch các bản ghi mồ côi.
--  3. Không bao giờ để lại tình trạng Sĩ số = 0 nhưng có điểm xếp loại.
-- ====================================================================

-- 1. Trigger Function tự động đồng bộ khi bảng enrollments thay đổi
CREATE OR REPLACE FUNCTION public.sync_enrollment_changes_to_summaries()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Khi học sinh được chuyển sang lớp mới trong cùng năm học
  IF (TG_OP = 'UPDATE' AND OLD.lop <> NEW.lop) THEN
    -- Cập nhật tên lớp trong term_summary
    UPDATE public.term_summary
    SET lop = NEW.lop
    WHERE username = NEW.username AND nam_hoc = NEW.nam_hoc;

    -- Cập nhật tên lớp trong year_summary
    UPDATE public.year_summary
    SET lop = NEW.lop
    WHERE username = NEW.username AND nam_hoc = NEW.nam_hoc;

    -- Cập nhật tên lớp trong grades
    UPDATE public.grades
    SET lop = NEW.lop
    WHERE username = NEW.username AND nam_hoc = NEW.nam_hoc;

    RETURN NEW;

  -- Khi học sinh bị gỡ bỏ khỏi lớp (xóa khỏi enrollments)
  ELSIF (TG_OP = 'DELETE') THEN
    -- Tự động xóa các bản ghi tổng kết và điểm của năm học đó để không thành bản ghi mồ côi
    DELETE FROM public.term_summary
    WHERE username = OLD.username AND nam_hoc = OLD.nam_hoc;

    DELETE FROM public.year_summary
    WHERE username = OLD.username AND nam_hoc = OLD.nam_hoc;

    DELETE FROM public.grades
    WHERE username = OLD.username AND nam_hoc = OLD.nam_hoc;

    RETURN OLD;
  END IF;

  RETURN NEW;
END;
$$;

-- 2. Gắn Trigger vào bảng enrollments
DROP TRIGGER IF EXISTS trg_sync_enrollment_summaries ON public.enrollments;

CREATE TRIGGER trg_sync_enrollment_summaries
AFTER UPDATE OF lop OR DELETE ON public.enrollments
FOR EACH ROW
EXECUTE FUNCTION public.sync_enrollment_changes_to_summaries();

-- 3. Procedure / Query dọn dẹp các bản ghi mồ côi hiện tại một lần duy nhất
-- (Dọn các bản ghi trong term_summary/year_summary không còn học sinh trong enrollments)
DELETE FROM public.term_summary ts
WHERE NOT EXISTS (
  SELECT 1 FROM public.enrollments e
  WHERE e.username = ts.username
    AND e.nam_hoc = ts.nam_hoc
);

DELETE FROM public.year_summary ys
WHERE NOT EXISTS (
  SELECT 1 FROM public.enrollments e
  WHERE e.username = ys.username
    AND e.nam_hoc = ys.nam_hoc
);

-- Đồng bộ lại tên lớp cho các em đang ghi danh khác với tên lớp trong term_summary
UPDATE public.term_summary ts
SET lop = e.lop
FROM public.enrollments e
WHERE ts.username = e.username
  AND ts.nam_hoc = e.nam_hoc
  AND ts.lop <> e.lop;

UPDATE public.year_summary ys
SET lop = e.lop
FROM public.enrollments e
WHERE ys.username = e.username
  AND ys.nam_hoc = e.nam_hoc
  AND ys.lop <> e.lop;
