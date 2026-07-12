-- 1. Tạo bảng lưu trữ góp ý/liên hệ
CREATE TABLE public.lien_he (
  id          BIGSERIAL PRIMARY KEY,
  ho_ten      TEXT NOT NULL,
  sdt         TEXT NOT NULL,
  noi_dung    TEXT NOT NULL,
  trang_thai  TEXT NOT NULL DEFAULT 'moi' CHECK (trang_thai IN ('moi', 'da_doc', 'da_xu_ly')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bật bảo mật dòng (RLS): Chỉ admin mới được xem bảng này
ALTER TABLE public.lien_he ENABLE ROW LEVEL SECURITY;
CREATE POLICY "lien_he: admin all" ON public.lien_he
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- 2. Tạo hàm nộp form (Cho phép khách vãng lai gọi)
CREATE OR REPLACE FUNCTION public.submit_lien_he(
  p_ho_ten    TEXT,
  p_sdt       TEXT,
  p_noi_dung  TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER -- Cho phép bỏ qua RLS để khách chưa đăng nhập vẫn insert được
SET search_path = public
AS $$
DECLARE
  v_id BIGINT;
BEGIN
  -- Insert dữ liệu vào bảng
  INSERT INTO public.lien_he (ho_ten, sdt, noi_dung)
  VALUES (trim(p_ho_ten), trim(p_sdt), trim(p_noi_dung))
  RETURNING id INTO v_id;

  -- Gửi thông báo (type: 'system') cho tất cả tài khoản có role = 'admin'
  INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
  SELECT
    'system',
    'Có góp ý / liên hệ mới',
    trim(p_ho_ten) || ' (' || trim(p_sdt) || ') vừa gửi một lời nhắn.',
    '/quản-trị/góp-ý', -- Đường dẫn đến tab quản lý góp ý sau này
    u.username,
    NULL
  FROM public.users u
  WHERE u.role = 'admin';

  RETURN v_id;
END;
$$;

-- 3. Cấp quyền cho khách (anon) và người dùng đã đăng nhập (authenticated) được gọi hàm
GRANT EXECUTE ON FUNCTION public.submit_lien_he TO anon, authenticated;