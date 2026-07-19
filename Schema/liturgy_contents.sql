-- ==============================================================================
-- BẢNG NỘI DUNG PHỤNG VỤ (LITURGY CONTENTS)
-- ==============================================================================
CREATE TABLE public.liturgy_contents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  liturgy_key TEXT NOT NULL,         -- Khóa liên kết từ code (vd: 'thuong_12_thu2')
  cycle TEXT NOT NULL DEFAULT 'all', -- 'A', 'B', 'C', 'I', 'II', hoặc 'all' (dùng chung)
  title TEXT NOT NULL,               -- Tiêu đề chính (vd: "Thứ Sáu Tuần XV Thường Niên")
  quote TEXT,                        -- Câu Lời Chúa ngắn gọn hiển thị ngoài trang chủ
  
  -- BÀI ĐỌC 1 (4 Cột)
  r1_ref TEXT,                       -- Trích dẫn (Vd: Is 38,1-6)
  r1_quote TEXT,                     -- Câu tóm tắt
  r1_intro TEXT,                     -- Lời dẫn (Vd: Bài trích sách...)
  r1_content TEXT,                   -- Nội dung Bài đọc 1
  
  -- ĐÁP CA (2 Cột)
  psalm_ref TEXT,                    -- Trích dẫn Đáp ca (Vd: Is 38,10.11)
  psalm_content TEXT,                -- Nội dung Đáp ca
  
  -- BÀI ĐỌC 2 (4 Cột)
  r2_ref TEXT,
  r2_quote TEXT,
  r2_intro TEXT,
  r2_content TEXT,
  
  -- PHÚC ÂM (4 Cột)
  gospel_ref TEXT,                   -- Trích dẫn Phúc Âm (Vd: Mt 12,1-8)
  gospel_alleluia TEXT,              -- Tung hô Tin Mừng (Vd: Ha-lê-lui-a...)
  gospel_intro TEXT,                 -- Lời dẫn (Vd: Tin Mừng Chúa Giê-su...)
  gospel_content TEXT,               -- Nội dung Phúc Âm
  
  -- SUY NIỆM
  reflection TEXT,                   -- Bài suy niệm
  
  created_by TEXT REFERENCES public.users(username),
  created_at TIMESTAMPTZ DEFAULT now(),
  
  -- Đảm bảo không bị trùng lặp nội dung của cùng 1 ngày trong cùng 1 chu kỳ
  UNIQUE(liturgy_key, cycle) 
);

-- Bật Row Level Security
ALTER TABLE public.liturgy_contents ENABLE ROW LEVEL SECURITY;

-- Cho phép đọc công khai (Ai cũng được xem)
CREATE POLICY "Allow public read access" ON public.liturgy_contents
  FOR SELECT TO public USING (true);

-- Cho phép thêm mới công khai (Để admin có thể nhập liệu)
CREATE POLICY "Allow public insert access" ON public.liturgy_contents
  FOR INSERT TO public WITH CHECK (true);

-- Cho phép sửa công khai (Để admin có thể cập nhật)
CREATE POLICY "Allow public update access" ON public.liturgy_contents
  FOR UPDATE TO public USING (true);

-- Cho phép xóa công khai
CREATE POLICY "Allow public delete access" ON public.liturgy_contents
  FOR DELETE TO public USING (true);

-- Bật bảo mật RLS
ALTER TABLE public.liturgy_contents ENABLE ROW LEVEL SECURITY;

-- Cấp quyền XEM cho tất cả mọi người (kể cả khách chưa đăng nhập)
CREATE POLICY "Ai cũng có thể xem nội dung phụng vụ"
  ON public.liturgy_contents FOR SELECT
  USING (true);

-- Cấp quyền THÊM, SỬA, XÓA chỉ cho Admin
CREATE POLICY "Chỉ Admin được chỉnh sửa nội dung phụng vụ"
  ON public.liturgy_contents FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE username = public.my_username() AND role = 'admin'
    )
  );
