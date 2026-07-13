-- ============================================================
-- 1. Tạo bảng lưu trữ góp ý/liên hệ
-- ============================================================
CREATE TABLE public.lien_he (
  id          BIGSERIAL PRIMARY KEY,
  ho_ten      TEXT NOT NULL,
  sdt         TEXT NOT NULL,
  noi_dung    TEXT NOT NULL,
  trang_thai  TEXT NOT NULL DEFAULT 'moi' CHECK (trang_thai IN ('moi', 'da_doc', 'da_xu_ly')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Bật bảo mật dòng (RLS): Chỉ admin mới được xem bảng này[cite: 10]
ALTER TABLE public.lien_he ENABLE ROW LEVEL SECURITY;[cite: 10]
CREATE POLICY "lien_he: admin all" ON public.lien_he[cite: 10]
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());[cite: 10]

-- ============================================================
-- 2. Tạo hàm nộp form (Cho phép khách vãng lai gọi)[cite: 10]
-- ============================================================
CREATE OR REPLACE FUNCTION public.submit_lien_he(
  p_ho_ten    TEXT,
  p_sdt       TEXT,
  p_noi_dung  TEXT
)
RETURNS BIGINT
LANGUAGE plpgsql
SECURITY DEFINER -- Cho phép bỏ qua RLS để khách chưa đăng nhập vẫn insert được[cite: 10]
SET search_path = public
AS $$
DECLARE
  v_id BIGINT;
BEGIN
  -- Insert dữ liệu vào bảng[cite: 10]
  INSERT INTO public.lien_he (ho_ten, sdt, noi_dung)
  VALUES (trim(p_ho_ten), trim(p_sdt), trim(p_noi_dung))
  RETURNING id INTO v_id;

  -- Gửi thông báo (type: 'system') cho tất cả tài khoản có role = 'admin'[cite: 10]
  INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
  SELECT
    'system',
    'Có góp ý / liên hệ mới',
    trim(p_ho_ten) || ' (' || trim(p_sdt) || ') vừa gửi một lời nhắn.',
    '/quản-trị/góp-ý', 
    u.username,
    NULL
  FROM public.users u
  WHERE u.role = 'admin';

  RETURN v_id;
END;
$$;

-- Cấp quyền cho khách (anon) và người dùng đã đăng nhập (authenticated) được gọi hàm[cite: 10]
GRANT EXECUTE ON FUNCTION public.submit_lien_he TO anon, authenticated;[cite: 10]


-- ============================================================
-- 🌟 BLOCK BỔ SUNG: TỰ ĐỘNG XÓA DỮ LIỆU SAU 7 NGÀY
-- ============================================================

-- Kích hoạt extension pg_cron (Hệ thống đặt lịch ngầm của PostgreSQL trên Supabase)
CREATE EXTENSION IF NOT EXISTS pg_cron;[cite: 22]

-- Tạo hàm dọn dẹp: Tìm và xóa các bản ghi 'da_xu_ly' có tuổi đời vượt quá 7 ngày
CREATE OR REPLACE FUNCTION public.cleanup_resolved_lien_he()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Thực thi với quyền tối cao để đảm bảo luôn xóa được bất kể cấu hình RLS
SET search_path = public
AS $$
BEGIN
  DELETE FROM public.lien_he 
  WHERE trang_thai = 'da_xu_ly' 
    AND created_at < NOW() - INTERVAL '7 days';[cite: 22]
END;
$$;

-- Lên lịch (Cron Job): Gọi hàm dọn dẹp này tự động vào lúc 2 giờ sáng mỗi ngày
-- Cú pháp '0 2 * * *' tương ứng với: Phút(0) Giờ(2) NgàyTrongTháng(*) Tháng(*) NgàyTrongTuần(*)
SELECT cron.schedule('cleanup-lien-he', '0 2 * * *', 'SELECT public.cleanup_resolved_lien_he()');[cite: 22]