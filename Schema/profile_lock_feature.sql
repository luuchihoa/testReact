-- ============================================================
-- Migration: profile_lock_feature.sql
-- Mục đích: Khóa chỉnh sửa hồ sơ cá nhân học sinh (Ban Giáo lý An Ngãi)
-- ============================================================

-- 1. Bổ sung các cột trạng thái khóa vào bảng `users`
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS is_profile_locked BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS profile_locked_by TEXT,
ADD COLUMN IF NOT EXISTS profile_locked_at TIMESTAMPTZ;

-- 2. Đảm bảo index để lọc học sinh bị khóa nhanh chóng
CREATE INDEX IF NOT EXISTS idx_users_profile_locked ON users(is_profile_locked) WHERE role = 'student';

-- 3. Function RPC khóa / mở khóa an toàn cho 1 hoặc nhiều học sinh
CREATE OR REPLACE FUNCTION toggle_student_profile_lock(
  p_student_usernames TEXT[],
  p_locked BOOLEAN,
  p_locked_by TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Kiểm tra quyền: Phải là Admin hoặc Giáo viên
  IF NOT (
    EXISTS (
      SELECT 1 FROM users 
      WHERE auth_id = auth.uid() 
      AND role IN ('admin', 'teacher')
    )
  ) THEN
    RAISE EXCEPTION 'Bạn không có quyền thực hiện thao tác này';
  END IF;

  -- Cập nhật trạng thái khóa cho danh sách học sinh
  UPDATE users 
  SET 
    is_profile_locked = p_locked,
    profile_locked_by = CASE WHEN p_locked THEN p_locked_by ELSE NULL END,
    profile_locked_at = CASE WHEN p_locked THEN NOW() ELSE NULL END
  WHERE username = ANY(p_student_usernames);
END;
$$;
