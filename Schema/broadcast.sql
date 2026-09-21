-- ==========================================
-- FILE: broadcast.sql
-- CHỨC NĂNG: Các thủ tục (RPC) liên quan đến hệ thống thông báo chung (Broadcast)
-- ==========================================

-- 1. Thêm cột recipient_role nếu chưa có
ALTER TABLE public.notifications
ADD COLUMN IF NOT EXISTS recipient_role TEXT CHECK (recipient_role IN ('admin', 'teacher', 'student', 'user'));

-- 2. Hàm tạo thông báo chung (Broadcast) cho toàn hệ thống hoặc theo vai trò (role)
CREATE OR REPLACE FUNCTION public.broadcast_notification(
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_recipient_role TEXT DEFAULT NULL
)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Chỉ admin mới được gửi thông báo chung';
  END IF;

  IF p_recipient_role IS NOT NULL AND p_recipient_role NOT IN ('teacher', 'student', 'user', 'admin') THEN
    RAISE EXCEPTION 'Vai trò người nhận không hợp lệ';
  END IF;

  INSERT INTO public.notifications (type, title, message, link, recipient_username, recipient_role, created_by)
  VALUES ('broadcast', p_title, p_message, p_link, NULL, p_recipient_role, public.my_username());
END;
$$;

-- 3. Hàm xoá một thông báo chung (Broadcast/Email) theo ID (cô lập an toàn, không xóa thông báo hệ thống/bài viết)
CREATE OR REPLACE FUNCTION public.delete_broadcast(p_id BIGINT)
RETURNS void AS $$
BEGIN
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Chỉ admin mới được xoá thông báo';
  END IF;

  DELETE FROM public.notifications
  WHERE id = p_id AND type IN ('broadcast', 'email');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
