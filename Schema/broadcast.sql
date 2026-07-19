-- ==========================================
-- FILE: broadcast.sql
-- CHỨC NĂNG: Các thủ tục (RPC) liên quan đến hệ thống thông báo chung (Broadcast)
-- ==========================================

-- 1. Hàm tạo thông báo chung (Broadcast) cho toàn hệ thống
CREATE OR REPLACE FUNCTION public.broadcast_notification(p_title TEXT, p_message TEXT, p_link TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ admin mới được gửi thông báo chung'; END IF;
  INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
  VALUES ('broadcast', p_title, p_message, p_link, NULL, public.my_username());
END;
$$;

-- 2. Hàm xoá một thông báo chung (Broadcast) theo ID
CREATE OR REPLACE FUNCTION public.delete_broadcast(p_id BIGINT)
RETURNS void AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Chỉ admin mới được xoá thông báo';
    END IF;
    
    DELETE FROM public.notifications 
    WHERE id = p_id AND (recipient_username IS NULL OR type = 'email');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
