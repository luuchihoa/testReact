-- ==============================================================================
-- MIGRATION: KHẮC PHỤC RLS POLICY TRÊN BẢNG USERS CHO GIÁO LÝ VIÊN
-- Mục đích: Cho phép Giáo lý viên xem và cập nhật hồ sơ Giáo lý sinh thuộc
-- các lớp mình phụ trách ở BẤT KỲ niên khóa nào (thay vì bị ghim cứng current_nam_hoc()).
-- ==============================================================================

-- 1. Sửa quyền SELECT học sinh cho Giáo lý viên
DROP POLICY IF EXISTS "users: teacher select student" ON public.users;
CREATE POLICY "users: teacher select student" ON public.users FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.class_teachers ct
    JOIN public.enrollments e ON e.lop = ct.lop AND e.nam_hoc = ct.nam_hoc
    WHERE ct.teacher_username = public.my_username()
      AND e.username = users.username
  )
);

-- 2. Sửa quyền UPDATE thông tin học sinh cho Giáo lý viên
DROP POLICY IF EXISTS "users: teacher update student" ON public.users;
CREATE POLICY "users: teacher update student" ON public.users FOR UPDATE USING (
  EXISTS (
    SELECT 1 FROM public.class_teachers ct
    JOIN public.enrollments e ON e.lop = ct.lop AND e.nam_hoc = ct.nam_hoc
    WHERE ct.teacher_username = public.my_username()
      AND e.username = users.username
  )
) WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.class_teachers ct
    JOIN public.enrollments e ON e.lop = ct.lop AND e.nam_hoc = ct.nam_hoc
    WHERE ct.teacher_username = public.my_username()
      AND e.username = users.username
  )
);
