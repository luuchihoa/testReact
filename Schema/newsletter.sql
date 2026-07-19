-- Bảng danh sách đăng ký nhận tin (Subscribers)
CREATE TABLE IF NOT EXISTS public.subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    status TEXT DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Bật RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Policy 1: Bất kỳ ai cũng có thể ĐĂNG KÝ (Insert)
-- Không giới hạn đối tượng vì ô đăng ký nằm ở Footer công khai
CREATE POLICY "Cho phép tất cả mọi người đăng ký nhận tin" 
    ON public.subscribers 
    FOR INSERT 
    WITH CHECK (true);

-- Policy 2: Chỉ Admin mới có quyền XEM (Select) danh sách
CREATE POLICY "Chỉ Admin được xem danh sách đăng ký" 
    ON public.subscribers 
    FOR SELECT 
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Policy 3: Chỉ Admin mới có quyền SỬA (Update) danh sách
CREATE POLICY "Chỉ Admin được sửa danh sách đăng ký" 
    ON public.subscribers 
    FOR UPDATE 
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- Policy 4: Chỉ Admin mới có quyền XOÁ (Delete)
CREATE POLICY "Chỉ Admin được xoá danh sách đăng ký" 
    ON public.subscribers 
    FOR DELETE 
    USING (
        auth.role() = 'authenticated' AND 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- ==========================================
-- PHẦN BỔ SUNG TỪ BẢN CẬP NHẬT LỊCH SỬ EMAIL
-- ==========================================

-- 1. Cập nhật Constraint để cho phép loại thông báo 'email'
ALTER TABLE public.notifications DROP CONSTRAINT IF EXISTS notifications_type_check;
ALTER TABLE public.notifications ADD CONSTRAINT notifications_type_check CHECK (type IN (
  'diem', 'hanh_kiem', 'hoc_luc',
  'tong_ket_ky', 'tong_ket_nam', 'broadcast', 'system', 'bai_viet', 'email'
));

-- 2. Cập nhật hàm get_my_notifications để ẩn 'email' khỏi chuông thông báo của user (chỉ hiển thị trong lịch sử admin)
CREATE OR REPLACE FUNCTION public.get_my_notifications(p_limit INT DEFAULT 30)
RETURNS TABLE (id BIGINT, type TEXT, title TEXT, message TEXT, link TEXT, created_at TIMESTAMPTZ, read BOOLEAN)
LANGUAGE SQL STABLE SET search_path = public AS $$
  SELECT n.id, n.type, n.title, n.message, n.link, n.created_at, (nr.read_at IS NOT NULL) AS read
  FROM public.notifications n
  LEFT JOIN public.notification_reads nr ON nr.notification_id = n.id AND nr.username = public.my_username()
  WHERE (n.recipient_username = public.my_username() OR n.recipient_username IS NULL)
    AND n.type != 'email'
  ORDER BY n.created_at DESC LIMIT p_limit;
$$;

-- 3. Cập nhật hàm đếm thông báo chưa đọc
CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INT LANGUAGE SQL STABLE SET search_path = public AS $$
  SELECT COUNT(*)::INT FROM public.notifications n
  LEFT JOIN public.notification_reads nr ON nr.notification_id = n.id AND nr.username = public.my_username()
  WHERE (n.recipient_username = public.my_username() OR n.recipient_username IS NULL) 
    AND n.type != 'email'
    AND nr.read_at IS NULL;
$$;

-- 4. Tạo hàm RPC để lưu lịch sử Email
CREATE OR REPLACE FUNCTION public.log_email_broadcast(p_title TEXT, p_message TEXT, p_link TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ admin mới được lưu lịch sử'; END IF;
  INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
  VALUES ('email', p_title, p_message, p_link, NULL, public.my_username());
END;
$$;

-- ==========================================
-- HÀM TIỆN ÍCH CHO EMAIL
-- ==========================================

-- Lấy email của người dùng từ auth.users
CREATE OR REPLACE FUNCTION get_user_email(p_username TEXT)
RETURNS TEXT AS $$
DECLARE
  v_email TEXT;
BEGIN
  SELECT au.email INTO v_email
  FROM auth.users au
  JOIN public.users pu ON au.id = pu.auth_id
  WHERE pu.username = p_username;
  
  RETURN v_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
