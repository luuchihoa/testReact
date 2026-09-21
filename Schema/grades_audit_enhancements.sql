-- ============================================================
--  MIGRATION: grades_audit_enhancements.sql
--  Tính năng: Lưu vết & Kiểm soát lịch sử sửa điểm (Per-Column Audit)
--  Mục tiêu:
--    1. Không lưu Điểm Trung Bình (diem_tb là điểm tự động tính toán).
--    2. Mỗi cột điểm chỉ lưu duy nhất 1 bản ghi gần nhất (Per-Column UPSERT).
--    3. Tiết kiệm dung lượng lưu trữ tối đa (Khống chế max 6 bản ghi/học sinh/học kỳ).
-- ============================================================

-- 1. Tạo mới / Tái cấu trúc bảng public.grades_audit theo mô hình Per-Column
DROP TABLE IF EXISTS public.grades_audit CASCADE;

CREATE TABLE public.grades_audit (
  username        TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
  nam_hoc         TEXT NOT NULL,
  hoc_ky          INT  NOT NULL CHECK (hoc_ky IN (1, 2)),
  field_name      TEXT NOT NULL CHECK (field_name IN ('diem_mieng', 'diem_vo', 'diem_15_phut', 'diem_1_tiet', 'diem_thi', 'ghi_chu')),
  operation       TEXT NOT NULL DEFAULT 'update' CHECK (operation IN ('insert', 'update')),
  old_value       TEXT,
  new_value       TEXT,
  changed_by      TEXT REFERENCES public.users(username) ON DELETE SET NULL,
  changed_by_name TEXT,
  changed_by_role TEXT,
  changed_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (username, nam_hoc, hoc_ky, field_name)
);

-- 2. Trigger BEFORE INSERT OR UPDATE trên public.grades: Kiểm tra nghiệp vụ & Gán metadata
CREATE OR REPLACE FUNCTION public.touch_grades_audit_metadata()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor TEXT;
  v_is_changed BOOLEAN := FALSE;
  v_has_initial_data BOOLEAN := FALSE;
BEGIN
  v_actor := public.my_username();
  IF v_actor IS NULL THEN
    IF current_user IN ('postgres', 'supabase_admin') THEN
      v_actor := COALESCE(NEW.updated_by, 'system');
    ELSE
      RAISE EXCEPTION 'Không xác định được người thực hiện thao tác điểm số';
    END IF;
  END IF;

  IF TG_OP = 'INSERT' THEN
    -- Không tính diem_tb vào việc xác định nhập điểm ban đầu
    v_has_initial_data := (
      NEW.diem_mieng IS NOT NULL OR NEW.diem_vo IS NOT NULL OR NEW.diem_15_phut IS NOT NULL OR
      NEW.diem_1_tiet IS NOT NULL OR NEW.diem_thi IS NOT NULL OR
      (NEW.ghi_chu IS NOT NULL AND TRIM(NEW.ghi_chu) <> '')
    );
    IF v_has_initial_data THEN
      NEW.updated_at := NOW();
      NEW.updated_by := v_actor;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- So sánh các cột điểm thành phần (bỏ qua diem_tb)
    v_is_changed := ROW(
      OLD.diem_mieng, OLD.diem_vo, OLD.diem_15_phut, OLD.diem_1_tiet, OLD.diem_thi, COALESCE(TRIM(OLD.ghi_chu), '')
    ) IS DISTINCT FROM ROW(
      NEW.diem_mieng, NEW.diem_vo, NEW.diem_15_phut, NEW.diem_1_tiet, NEW.diem_thi, COALESCE(TRIM(NEW.ghi_chu), '')
    );

    IF v_is_changed THEN
      NEW.updated_at := NOW();
      NEW.updated_by := v_actor;
    ELSE
      NEW.updated_at := OLD.updated_at;
      NEW.updated_by := OLD.updated_by;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_grades_touch_metadata ON public.grades;
CREATE TRIGGER trg_grades_touch_metadata
  BEFORE INSERT OR UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.touch_grades_audit_metadata();

-- 3. Trigger AFTER INSERT OR UPDATE trên public.grades: Ghi đè vết theo từng cột (Per-column UPSERT)
CREATE OR REPLACE FUNCTION public.log_grades_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_actor TEXT;
  v_actor_name TEXT;
  v_actor_role TEXT;
  v_fields TEXT[] := ARRAY['diem_mieng', 'diem_vo', 'diem_15_phut', 'diem_1_tiet', 'diem_thi', 'ghi_chu'];
  v_f TEXT;
  v_old_text TEXT;
  v_new_text TEXT;
  v_is_diff BOOLEAN;
BEGIN
  v_actor := COALESCE(NEW.updated_by, public.my_username());
  IF v_actor IS NULL THEN
    v_actor := 'system';
  END IF;
  
  -- Lấy snapshot Tên Thánh, Họ và Tên và Role của người sửa tại thời điểm hiện tại
  SELECT 
    TRIM(CONCAT_WS(' ', NULLIF(ten_thanh, ''), NULLIF(ho_va_ten, ''))),
    role
  INTO v_actor_name, v_actor_role
  FROM public.users 
  WHERE username = v_actor;

  IF v_actor_name IS NULL OR v_actor_name = '' THEN
    v_actor_name := v_actor;
  END IF;

  FOREACH v_f IN ARRAY v_fields LOOP
    v_is_diff := FALSE;
    v_old_text := NULL;
    v_new_text := NULL;

    IF v_f = 'diem_mieng' THEN
      IF TG_OP = 'INSERT' THEN
        IF NEW.diem_mieng IS NOT NULL THEN
          v_is_diff := TRUE; v_old_text := NULL; v_new_text := NEW.diem_mieng::text;
        END IF;
      ELSE
        IF OLD.diem_mieng IS DISTINCT FROM NEW.diem_mieng THEN
          v_is_diff := TRUE; v_old_text := OLD.diem_mieng::text; v_new_text := NEW.diem_mieng::text;
        END IF;
      END IF;
    ELSIF v_f = 'diem_vo' THEN
      IF TG_OP = 'INSERT' THEN
        IF NEW.diem_vo IS NOT NULL THEN
          v_is_diff := TRUE; v_old_text := NULL; v_new_text := NEW.diem_vo::text;
        END IF;
      ELSE
        IF OLD.diem_vo IS DISTINCT FROM NEW.diem_vo THEN
          v_is_diff := TRUE; v_old_text := OLD.diem_vo::text; v_new_text := NEW.diem_vo::text;
        END IF;
      END IF;
    ELSIF v_f = 'diem_15_phut' THEN
      IF TG_OP = 'INSERT' THEN
        IF NEW.diem_15_phut IS NOT NULL THEN
          v_is_diff := TRUE; v_old_text := NULL; v_new_text := NEW.diem_15_phut::text;
        END IF;
      ELSE
        IF OLD.diem_15_phut IS DISTINCT FROM NEW.diem_15_phut THEN
          v_is_diff := TRUE; v_old_text := OLD.diem_15_phut::text; v_new_text := NEW.diem_15_phut::text;
        END IF;
      END IF;
    ELSIF v_f = 'diem_1_tiet' THEN
      IF TG_OP = 'INSERT' THEN
        IF NEW.diem_1_tiet IS NOT NULL THEN
          v_is_diff := TRUE; v_old_text := NULL; v_new_text := NEW.diem_1_tiet::text;
        END IF;
      ELSE
        IF OLD.diem_1_tiet IS DISTINCT FROM NEW.diem_1_tiet THEN
          v_is_diff := TRUE; v_old_text := OLD.diem_1_tiet::text; v_new_text := NEW.diem_1_tiet::text;
        END IF;
      END IF;
    ELSIF v_f = 'diem_thi' THEN
      IF TG_OP = 'INSERT' THEN
        IF NEW.diem_thi IS NOT NULL THEN
          v_is_diff := TRUE; v_old_text := NULL; v_new_text := NEW.diem_thi::text;
        END IF;
      ELSE
        IF OLD.diem_thi IS DISTINCT FROM NEW.diem_thi THEN
          v_is_diff := TRUE; v_old_text := OLD.diem_thi::text; v_new_text := NEW.diem_thi::text;
        END IF;
      END IF;
    ELSIF v_f = 'ghi_chu' THEN
      IF TG_OP = 'INSERT' THEN
        IF NEW.ghi_chu IS NOT NULL AND TRIM(NEW.ghi_chu) <> '' THEN
          v_is_diff := TRUE; v_old_text := NULL; v_new_text := TRIM(NEW.ghi_chu);
        END IF;
      ELSE
        IF COALESCE(TRIM(OLD.ghi_chu), '') IS DISTINCT FROM COALESCE(TRIM(NEW.ghi_chu), '') THEN
          v_is_diff := TRUE; v_old_text := TRIM(OLD.ghi_chu); v_new_text := TRIM(NEW.ghi_chu);
        END IF;
      END IF;
    END IF;

    IF v_is_diff THEN
      INSERT INTO public.grades_audit (
        username,
        nam_hoc,
        hoc_ky,
        field_name,
        operation,
        old_value,
        new_value,
        changed_by,
        changed_by_name,
        changed_by_role,
        changed_at
      ) VALUES (
        NEW.username,
        NEW.nam_hoc,
        NEW.hoc_ky,
        v_f,
        CASE WHEN TG_OP = 'INSERT' OR v_old_text IS NULL THEN 'insert' ELSE 'update' END,
        v_old_text,
        v_new_text,
        v_actor,
        v_actor_name,
        v_actor_role,
        NOW()
      )
      ON CONFLICT (username, nam_hoc, hoc_ky, field_name)
      DO UPDATE SET
        operation = 'update',
        old_value = EXCLUDED.old_value,
        new_value = EXCLUDED.new_value,
        changed_by = EXCLUDED.changed_by,
        changed_by_name = EXCLUDED.changed_by_name,
        changed_by_role = EXCLUDED.changed_by_role,
        changed_at = EXCLUDED.changed_at;
    END IF;

  END LOOP;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_grades_audit ON public.grades;
CREATE TRIGGER trg_grades_audit
  AFTER INSERT OR UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.log_grades_change();

-- 4. Phân quyền bảo mật RLS
ALTER TABLE public.grades_audit ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "grades_audit: teacher select own students" ON public.grades_audit;
CREATE POLICY "grades_audit: teacher select own students" ON public.grades_audit 
  FOR SELECT USING (public.is_teacher_of(username, nam_hoc));

DROP POLICY IF EXISTS "grades_audit: admin select all" ON public.grades_audit;
CREATE POLICY "grades_audit: admin select all" ON public.grades_audit 
  FOR SELECT USING (public.is_admin());

-- 5. RPC Bảo mật truy vấn lịch sử sửa điểm theo từng cột
DROP FUNCTION IF EXISTS public.get_student_grade_audit_logs(TEXT, TEXT, INT, INT, INT);
DROP FUNCTION IF EXISTS public.get_student_grade_audit_logs(TEXT, TEXT, INT);
DROP FUNCTION IF EXISTS public.get_student_grade_audit_logs;

CREATE OR REPLACE FUNCTION public.get_student_grade_audit_logs(
  p_student_username TEXT,
  p_nam_hoc TEXT,
  p_hoc_ky INT
)
RETURNS TABLE (
  username TEXT,
  nam_hoc TEXT,
  hoc_ky INT,
  field_name TEXT,
  operation TEXT,
  old_value TEXT,
  new_value TEXT,
  changed_by TEXT,
  changed_by_name TEXT,
  changed_by_role TEXT,
  changed_at TIMESTAMPTZ
) LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_caller TEXT;
BEGIN
  v_caller := public.my_username();
  IF v_caller IS NULL THEN
    RAISE EXCEPTION 'Vui lòng đăng nhập để truy cập lịch sử sửa điểm';
  END IF;

  -- Kiểm tra quyền: Phải là Admin HOẶC Giáo lý viên phụ trách học sinh trong năm học đó
  IF NOT (public.is_admin() OR public.is_teacher_of(p_student_username, p_nam_hoc)) THEN
    RAISE EXCEPTION 'Bạn không có quyền xem nhật ký chỉnh sửa điểm của học sinh này';
  END IF;

  RETURN QUERY
  SELECT 
    ga.username,
    ga.nam_hoc,
    ga.hoc_ky,
    ga.field_name,
    ga.operation,
    ga.old_value,
    ga.new_value,
    ga.changed_by,
    ga.changed_by_name,
    ga.changed_by_role,
    ga.changed_at
  FROM public.grades_audit ga
  WHERE ga.username = p_student_username
    AND ga.nam_hoc = p_nam_hoc
    AND ga.hoc_ky = p_hoc_ky
  ORDER BY ga.changed_at DESC;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_student_grade_audit_logs(TEXT, TEXT, INT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_student_grade_audit_logs(TEXT, TEXT, INT) TO authenticated;
