-- ============================================================
--  MIGRATION: HỖ TRỢ XOÁ NGƯỜI DÙNG DÀNH CHO ADMIN
--  Xoá sạch dữ liệu trong public.users, auth.users và auth.identities
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_delete_user(p_username TEXT)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_auth_id UUID;
  v_role TEXT;
  v_is_admin_caller BOOLEAN;
  v_deleted_count INT := 0;
BEGIN
  -- 1. Kiểm tra quyền Admin
  SELECT EXISTS (
    SELECT 1 FROM public.users 
    WHERE auth_id = auth.uid() AND role = 'admin'
  ) INTO v_is_admin_caller;

  IF NOT v_is_admin_caller THEN
    RAISE EXCEPTION 'Chỉ quản trị viên mới có quyền xoá người dùng';
  END IF;

  IF p_username IS NULL OR trim(p_username) = '' THEN
    RAISE EXCEPTION 'Tên người dùng (username) không được để trống';
  END IF;

  -- 2. Không cho phép admin tự xoá chính mình
  IF p_username = (SELECT username FROM public.users WHERE auth_id = auth.uid() LIMIT 1) THEN
    RAISE EXCEPTION 'Không thể tự xoá tài khoản quản trị đang đăng nhập';
  END IF;

  -- 3. Tìm user trong bảng public.users
  SELECT auth_id, role INTO v_auth_id, v_role
  FROM public.users
  WHERE username = p_username;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Không tìm thấy người dùng "%"', p_username;
  END IF;

  -- 4. Dọn dẹp các bảng phụ thuộc tránh lỗi ràng buộc khoá ngoại (Foreign Key)
  DELETE FROM public.enrollments WHERE username = p_username;
  DELETE FROM public.class_teachers WHERE teacher_username = p_username;
  DELETE FROM public.grades WHERE username = p_username;
  DELETE FROM public.attendance WHERE username = p_username;
  DELETE FROM public.year_summary WHERE username = p_username;
  DELETE FROM public.term_summary WHERE username = p_username;
  DELETE FROM public.notification_reads WHERE username = p_username;
  DELETE FROM public.notifications WHERE recipient_username = p_username;
  DELETE FROM public.articles WHERE author_username = p_username;

  -- Dọn dẹp các bảng tùy chọn nếu tồn tại
  BEGIN
    DELETE FROM public.dovui_scores WHERE username = p_username;
  EXCEPTION WHEN undefined_table THEN
  END;

  BEGIN
    DELETE FROM public.dovui_user_totals WHERE username = p_username;
  EXCEPTION WHEN undefined_table THEN
  END;

  BEGIN
    UPDATE public.liturgy_contents SET created_by = NULL WHERE created_by = p_username;
  EXCEPTION WHEN undefined_table THEN
  END;

  BEGIN
    UPDATE public.dang_ky_hoc SET xu_ly_boi = NULL WHERE xu_ly_boi = p_username;
  EXCEPTION WHEN undefined_table THEN
  END;

  -- Set null các trường ghi vết quản trị viên
  UPDATE public.term_locks SET locked_by = NULL WHERE locked_by = p_username;
  UPDATE public.grades SET updated_by = NULL WHERE updated_by = p_username;
  UPDATE public.attendance SET updated_by = NULL WHERE updated_by = p_username;
  UPDATE public.year_summary SET updated_by = NULL WHERE updated_by = p_username;
  UPDATE public.term_summary SET updated_by = NULL WHERE updated_by = p_username;
  UPDATE public.articles SET reviewed_by = NULL WHERE reviewed_by = p_username;
  UPDATE public.notifications SET created_by = NULL WHERE created_by = p_username;

  -- 5. Xoá bản ghi trong public.users
  DELETE FROM public.users WHERE username = p_username;
  GET DIAGNOSTICS v_deleted_count = ROW_COUNT;

  -- 6. Xoá tài khoản Auth trong auth.users & auth.identities
  IF v_auth_id IS NOT NULL THEN
    DELETE FROM auth.identities WHERE user_id = v_auth_id;
    DELETE FROM auth.users WHERE id = v_auth_id;
  END IF;

  -- Quét dọn bất kỳ tài khoản auth nào có email username@giaoly.local phòng trường hợp auth_id bị lệch
  DELETE FROM auth.identities WHERE user_id IN (
    SELECT id FROM auth.users WHERE lower(email) = lower(p_username) || '@giaoly.local'
  );
  DELETE FROM auth.users WHERE lower(email) = lower(p_username) || '@giaoly.local';

  RETURN jsonb_build_object(
    'success', true,
    'username', p_username,
    'deletedCount', v_deleted_count,
    'message', 'Đã xoá người dùng và tài khoản liên quan thành công'
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_delete_user(TEXT) TO authenticated;

-- Bổ sung RLS Policy DELETE cho bảng users
DROP POLICY IF EXISTS "users: admin delete all" ON public.users;
CREATE POLICY "users: admin delete all" ON public.users FOR DELETE USING (public.is_admin());
