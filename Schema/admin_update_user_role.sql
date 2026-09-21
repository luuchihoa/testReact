-- ============================================================
--  MIGRATION: HỖ TRỢ CẬP NHẬT VAI TRÒ NGƯỜI DÙNG DÀNH CHO ADMIN
--  Kiểm tra quyền Admin, bảo vệ Admin cuối cùng, bảo vệ GLV đang đứng lớp
--  và ngăn chặn người dùng tự đổi cột role.
-- ============================================================

-- 1. Hàm RPC cập nhật vai trò người dùng an toàn
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  p_username TEXT,
  p_new_role TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_current_role TEXT;
  v_admin_count INT;
  v_active_classes_count INT;
  v_is_admin_caller BOOLEAN;
BEGIN
  -- 1.1. Kiểm tra quyền Admin của caller
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin_caller;

  IF NOT v_is_admin_caller THEN
    RAISE EXCEPTION 'Chỉ quản trị viên mới có quyền cập nhật vai trò người dùng';
  END IF;

  -- 1.2. Kiểm tra tham số đầu vào
  IF p_username IS NULL OR trim(p_username) = '' THEN
    RAISE EXCEPTION 'Tên người dùng (username) không được để trống';
  END IF;

  IF p_new_role NOT IN ('admin', 'teacher', 'student', 'user') THEN
    RAISE EXCEPTION 'Vai trò "%" không hợp lệ. Chỉ chấp nhận admin, teacher, student, user', p_new_role;
  END IF;

  -- 1.3. Tìm người dùng mục tiêu trong bảng public.users
  SELECT role INTO v_current_role
  FROM public.users
  WHERE username = p_username;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Không tìm thấy người dùng "%"', p_username;
  END IF;

  -- Nếu vai trò không thay đổi, trả về thành công ngay
  IF v_current_role = p_new_role THEN
    RETURN jsonb_build_object(
      'success', true,
      'username', p_username,
      'oldRole', v_current_role,
      'newRole', p_new_role,
      'message', 'Vai trò không thay đổi'
    );
  END IF;

  -- 1.4. Bảo vệ Quản trị viên cuối cùng (Last Admin Protection)
  IF v_current_role = 'admin' AND p_new_role != 'admin' THEN
    SELECT count(*) INTO v_admin_count
    FROM public.users
    WHERE role = 'admin';

    IF v_admin_count <= 1 THEN
      RAISE EXCEPTION 'Không thể hạ quyền Quản trị viên duy nhất còn lại trong hệ thống. Hệ thống phải duy trì ít nhất 1 Quản trị viên';
    END IF;
  END IF;

  -- 1.5. Bảo vệ Giáo lý viên đang có phân công phụ trách lớp (Active Teacher Protection)
  IF v_current_role = 'teacher' AND p_new_role != 'teacher' THEN
    SELECT count(*) INTO v_active_classes_count
    FROM public.class_teachers
    WHERE teacher_username = p_username;

    IF v_active_classes_count > 0 THEN
      RAISE EXCEPTION 'Không thể hạ quyền Giáo lý viên đang có phân công phụ trách % lớp học. Vui lòng chuyển giao hoặc gỡ phân công trong tab Lớp học trước', v_active_classes_count;
    END IF;
  END IF;

  -- 1.6. Thực thi cập nhật vai trò
  UPDATE public.users
  SET role = p_new_role
  WHERE username = p_username;

  RETURN jsonb_build_object(
    'success', true,
    'username', p_username,
    'oldRole', v_current_role,
    'newRole', p_new_role,
    'message', 'Đã cập nhật vai trò người dùng thành công'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_update_user_role(TEXT, TEXT) TO authenticated;

-- 2. Trigger ngăn chặn người dùng thường tự ý đổi cột role trên bảng users
CREATE OR REPLACE FUNCTION public.protect_user_role_update()
RETURNS TRIGGER AS $$
BEGIN
  -- Nếu cột role bị thay đổi và người thực thi không phải là Quản trị viên
  IF NEW.role IS DISTINCT FROM OLD.role AND NOT public.is_admin() THEN
    RAISE EXCEPTION 'Bạn không có quyền tự ý thay đổi vai trò tài khoản của mình';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_user_role ON public.users;
CREATE TRIGGER trg_protect_user_role
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.protect_user_role_update();
