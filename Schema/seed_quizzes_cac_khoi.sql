-- ==============================================================================
-- TỆP SQL KHỞI TẠO BỘ ĐỀ THI ÔN TẬP CÁC KHỐI GIÁO LÝ (DÀNH CHO TEST HIỂN THỊ UI)
-- Ban Giáo Lý & Huynh Trưởng — Giáo xứ An Ngãi
--
-- CÁC KHỐI BAO GỒM (Mỗi lớp 6 đề: 15' HK I, 1 Tiết HK I, Cuối HK I, 15' HK II, 1 Tiết HK II, Cuối HK II):
-- 1. Khối Rước Lễ Lần Đầu: Rước Lễ 1, Rước Lễ 2 (khoi: 'ruoc-le')
-- 2. Khối Thêm Sức:        Thêm Sức 1, Thêm Sức 2 (khoi: 'them-suc')
-- 3. Khối Kinh Thánh:      Kinh Thánh 1, Kinh Thánh 2 (khoi: 'kinh-thanh')
-- 4. Khối Vào Đời:         Vào Đời 1, Vào Đời 2 (khoi: 'vao-doi')
--
-- QUY CHUẨN HIỂN THỊ TỐI ƯU GIAO DIỆN (UI/UX):
-- - Tiêu đề chính (H3): Ôn Tập 15 Phút — Học Kỳ I, Ôn Tập 1 Tiết — Học Kỳ I, Ôn Tập Cuối Học Kỳ I...
-- - Dòng nhãn bên dưới: Tự động hiển thị chính xác tên lớp (vd: ● Khối Rước Lễ 1, ● Khối Rước Lễ 2).
-- - Câu hỏi (data): Để trống mảng JSON {"mcq": [], "essay": []} để test UI.
-- ==============================================================================

-- 1. Đảm bảo bảng public.quizzes đã tồn tại với đầy đủ cấu trúc
CREATE TABLE IF NOT EXISTS public.quizzes (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  khoi TEXT NOT NULL DEFAULT 'phung-vu',
  time INTEGER NOT NULL DEFAULT 900,
  mcq_count INTEGER NOT NULL DEFAULT 10,
  mcq_point NUMERIC(4, 2) NOT NULL DEFAULT 5.0,
  essay_count INTEGER NOT NULL DEFAULT 2,
  essay_point NUMERIC(4, 2) NOT NULL DEFAULT 5.0,
  data JSONB NOT NULL DEFAULT '{"mcq": [], "essay": []}'::jsonb,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Tạo chỉ mục tìm kiếm tối ưu
CREATE INDEX IF NOT EXISTS idx_quizzes_slug ON public.quizzes(slug);
CREATE INDEX IF NOT EXISTS idx_quizzes_khoi ON public.quizzes(khoi);

-- Kích hoạt RLS và cấp quyền đọc công khai cho các đề đang active
ALTER TABLE public.quizzes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read active quizzes" ON public.quizzes;
CREATE POLICY "Allow public read active quizzes" ON public.quizzes
  FOR SELECT TO public
  USING (is_active = true);

-- 2. Chèn 48 bộ đề thi cho 4 khối (ON CONFLICT id DO UPDATE để chạy nhiều lần an toàn)
INSERT INTO public.quizzes (
  id,
  slug,
  title,
  khoi,
  time,
  mcq_count,
  mcq_point,
  essay_count,
  essay_point,
  data,
  is_active
)
VALUES
  -- ============================================================================
  -- 1. KHỐI RƯỚC LỄ LẦN ĐẦU (khoi: 'ruoc-le')
  -- ============================================================================
  
  -- --- LỚP RƯỚC LỄ 1 ---
  (
    'on-tap-15-phut-ruoc-le-1-hk1',
    'on-tap-15-phut-ruoc-le-1-hk1',
    'Ôn Tập 15 Phút — Học Kỳ I',
    'ruoc-le',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-ruoc-le-1-hk1',
    'on-tap-1-tiet-ruoc-le-1-hk1',
    'Ôn Tập 1 Tiết — Học Kỳ I',
    'ruoc-le',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk1-ruoc-le-1',
    'on-tap-cuoi-hk1-ruoc-le-1',
    'Ôn Tập Cuối Học Kỳ I',
    'ruoc-le',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-15-phut-ruoc-le-1-hk2',
    'on-tap-15-phut-ruoc-le-1-hk2',
    'Ôn Tập 15 Phút — Học Kỳ II',
    'ruoc-le',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-ruoc-le-1-hk2',
    'on-tap-1-tiet-ruoc-le-1-hk2',
    'Ôn Tập 1 Tiết — Học Kỳ II',
    'ruoc-le',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk2-ruoc-le-1',
    'on-tap-cuoi-hk2-ruoc-le-1',
    'Ôn Tập Cuối Học Kỳ II',
    'ruoc-le',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),

  -- --- LỚP RƯỚC LỄ 2 ---
  (
    'on-tap-15-phut-ruoc-le-2-hk1',
    'on-tap-15-phut-ruoc-le-2-hk1',
    'Ôn Tập 15 Phút — Học Kỳ I',
    'ruoc-le',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-ruoc-le-2-hk1',
    'on-tap-1-tiet-ruoc-le-2-hk1',
    'Ôn Tập 1 Tiết — Học Kỳ I',
    'ruoc-le',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk1-ruoc-le-2',
    'on-tap-cuoi-hk1-ruoc-le-2',
    'Ôn Tập Cuối Học Kỳ I',
    'ruoc-le',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-15-phut-ruoc-le-2-hk2',
    'on-tap-15-phut-ruoc-le-2-hk2',
    'Ôn Tập 15 Phút — Học Kỳ II',
    'ruoc-le',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-ruoc-le-2-hk2',
    'on-tap-1-tiet-ruoc-le-2-hk2',
    'Ôn Tập 1 Tiết — Học Kỳ II',
    'ruoc-le',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk2-ruoc-le-2',
    'on-tap-cuoi-hk2-ruoc-le-2',
    'Ôn Tập Cuối Học Kỳ II',
    'ruoc-le',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),

  -- ============================================================================
  -- 2. KHỐI THÊM SỨC (khoi: 'them-suc')
  -- ============================================================================

  -- --- LỚP THÊM SỨC 1 ---
  (
    'on-tap-15-phut-them-suc-1-hk1',
    'on-tap-15-phut-them-suc-1-hk1',
    'Ôn Tập 15 Phút — Học Kỳ I',
    'them-suc',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-them-suc-1-hk1',
    'on-tap-1-tiet-them-suc-1-hk1',
    'Ôn Tập 1 Tiết — Học Kỳ I',
    'them-suc',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk1-them-suc-1',
    'on-tap-cuoi-hk1-them-suc-1',
    'Ôn Tập Cuối Học Kỳ I',
    'them-suc',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-15-phut-them-suc-1-hk2',
    'on-tap-15-phut-them-suc-1-hk2',
    'Ôn Tập 15 Phút — Học Kỳ II',
    'them-suc',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-them-suc-1-hk2',
    'on-tap-1-tiet-them-suc-1-hk2',
    'Ôn Tập 1 Tiết — Học Kỳ II',
    'them-suc',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk2-them-suc-1',
    'on-tap-cuoi-hk2-them-suc-1',
    'Ôn Tập Cuối Học Kỳ II',
    'them-suc',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),

  -- --- LỚP THÊM SỨC 2 ---
  (
    'on-tap-15-phut-them-suc-2-hk1',
    'on-tap-15-phut-them-suc-2-hk1',
    'Ôn Tập 15 Phút — Học Kỳ I',
    'them-suc',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-them-suc-2-hk1',
    'on-tap-1-tiet-them-suc-2-hk1',
    'Ôn Tập 1 Tiết — Học Kỳ I',
    'them-suc',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk1-them-suc-2',
    'on-tap-cuoi-hk1-them-suc-2',
    'Ôn Tập Cuối Học Kỳ I',
    'them-suc',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-15-phut-them-suc-2-hk2',
    'on-tap-15-phut-them-suc-2-hk2',
    'Ôn Tập 15 Phút — Học Kỳ II',
    'them-suc',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-them-suc-2-hk2',
    'on-tap-1-tiet-them-suc-2-hk2',
    'Ôn Tập 1 Tiết — Học Kỳ II',
    'them-suc',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk2-them-suc-2',
    'on-tap-cuoi-hk2-them-suc-2',
    'Ôn Tập Cuối Học Kỳ II',
    'them-suc',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),

  -- ============================================================================
  -- 3. KHỐI KINH THÁNH (khoi: 'kinh-thanh')
  -- ============================================================================

  -- --- LỚP KINH THÁNH 1 ---
  (
    'on-tap-15-phut-kinh-thanh-1-hk1',
    'on-tap-15-phut-kinh-thanh-1-hk1',
    'Ôn Tập 15 Phút — Học Kỳ I',
    'kinh-thanh',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-kinh-thanh-1-hk1',
    'on-tap-1-tiet-kinh-thanh-1-hk1',
    'Ôn Tập 1 Tiết — Học Kỳ I',
    'kinh-thanh',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk1-kinh-thanh-1',
    'on-tap-cuoi-hk1-kinh-thanh-1',
    'Ôn Tập Cuối Học Kỳ I',
    'kinh-thanh',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-15-phut-kinh-thanh-1-hk2',
    'on-tap-15-phut-kinh-thanh-1-hk2',
    'Ôn Tập 15 Phút — Học Kỳ II',
    'kinh-thanh',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-kinh-thanh-1-hk2',
    'on-tap-1-tiet-kinh-thanh-1-hk2',
    'Ôn Tập 1 Tiết — Học Kỳ II',
    'kinh-thanh',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk2-kinh-thanh-1',
    'on-tap-cuoi-hk2-kinh-thanh-1',
    'Ôn Tập Cuối Học Kỳ II',
    'kinh-thanh',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),

  -- --- LỚP KINH THÁNH 2 ---
  (
    'on-tap-15-phut-kinh-thanh-2-hk1',
    'on-tap-15-phut-kinh-thanh-2-hk1',
    'Ôn Tập 15 Phút — Học Kỳ I',
    'kinh-thanh',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-kinh-thanh-2-hk1',
    'on-tap-1-tiet-kinh-thanh-2-hk1',
    'Ôn Tập 1 Tiết — Học Kỳ I',
    'kinh-thanh',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk1-kinh-thanh-2',
    'on-tap-cuoi-hk1-kinh-thanh-2',
    'Ôn Tập Cuối Học Kỳ I',
    'kinh-thanh',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-15-phut-kinh-thanh-2-hk2',
    'on-tap-15-phut-kinh-thanh-2-hk2',
    'Ôn Tập 15 Phút — Học Kỳ II',
    'kinh-thanh',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-kinh-thanh-2-hk2',
    'on-tap-1-tiet-kinh-thanh-2-hk2',
    'Ôn Tập 1 Tiết — Học Kỳ II',
    'kinh-thanh',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk2-kinh-thanh-2',
    'on-tap-cuoi-hk2-kinh-thanh-2',
    'Ôn Tập Cuối Học Kỳ II',
    'kinh-thanh',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),

  -- ============================================================================
  -- 4. KHỐI VÀO ĐỜI (khoi: 'vao-doi')
  -- ============================================================================

  -- --- LỚP VÀO ĐỜI 1 ---
  (
    'on-tap-15-phut-vao-doi-1-hk1',
    'on-tap-15-phut-vao-doi-1-hk1',
    'Ôn Tập 15 Phút — Học Kỳ I',
    'vao-doi',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-vao-doi-1-hk1',
    'on-tap-1-tiet-vao-doi-1-hk1',
    'Ôn Tập 1 Tiết — Học Kỳ I',
    'vao-doi',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk1-vao-doi-1',
    'on-tap-cuoi-hk1-vao-doi-1',
    'Ôn Tập Cuối Học Kỳ I',
    'vao-doi',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-15-phut-vao-doi-1-hk2',
    'on-tap-15-phut-vao-doi-1-hk2',
    'Ôn Tập 15 Phút — Học Kỳ II',
    'vao-doi',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-vao-doi-1-hk2',
    'on-tap-1-tiet-vao-doi-1-hk2',
    'Ôn Tập 1 Tiết — Học Kỳ II',
    'vao-doi',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk2-vao-doi-1',
    'on-tap-cuoi-hk2-vao-doi-1',
    'Ôn Tập Cuối Học Kỳ II',
    'vao-doi',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),

  -- --- LỚP VÀO ĐỜI 2 ---
  (
    'on-tap-15-phut-vao-doi-2-hk1',
    'on-tap-15-phut-vao-doi-2-hk1',
    'Ôn Tập 15 Phút — Học Kỳ I',
    'vao-doi',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-vao-doi-2-hk1',
    'on-tap-1-tiet-vao-doi-2-hk1',
    'Ôn Tập 1 Tiết — Học Kỳ I',
    'vao-doi',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk1-vao-doi-2',
    'on-tap-cuoi-hk1-vao-doi-2',
    'Ôn Tập Cuối Học Kỳ I',
    'vao-doi',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-15-phut-vao-doi-2-hk2',
    'on-tap-15-phut-vao-doi-2-hk2',
    'Ôn Tập 15 Phút — Học Kỳ II',
    'vao-doi',
    900, 10, 5.0, 2, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-1-tiet-vao-doi-2-hk2',
    'on-tap-1-tiet-vao-doi-2-hk2',
    'Ôn Tập 1 Tiết — Học Kỳ II',
    'vao-doi',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  ),
  (
    'on-tap-cuoi-hk2-vao-doi-2',
    'on-tap-cuoi-hk2-vao-doi-2',
    'Ôn Tập Cuối Học Kỳ II',
    'vao-doi',
    2700, 20, 5.0, 3, 5.0,
    '{"mcq": [], "essay": []}'::jsonb,
    true
  )

ON CONFLICT (id) DO UPDATE SET
  slug = EXCLUDED.slug,
  title = EXCLUDED.title,
  khoi = EXCLUDED.khoi,
  time = EXCLUDED.time,
  mcq_count = EXCLUDED.mcq_count,
  mcq_point = EXCLUDED.mcq_point,
  essay_count = EXCLUDED.essay_count,
  essay_point = EXCLUDED.essay_point,
  is_active = EXCLUDED.is_active,
  updated_at = timezone('utc'::text, now());

-- ==============================================================================
-- 3. CÂU LỆNH KIỂM TRA SAU KHI NẠP DỮ LIỆU
-- ==============================================================================
SELECT
  khoi,
  count(*) AS total_quizzes,
  count(*) FILTER (WHERE title ILIKE '%học kỳ i%') AS count_hk1,
  count(*) FILTER (WHERE title ILIKE '%học kỳ ii%') AS count_hk2
FROM public.quizzes
GROUP BY khoi
ORDER BY khoi;

-- ==============================================================================
-- HƯỚNG DẪN CẬP NHẬT CÂU HỎI KHI BẠN CÓ ĐỀ CHÍNH THỨC:
-- 
-- Khi bạn đã soạn xong câu hỏi cho một đề (ví dụ: Rước Lễ 1 - 15 phút HK I),
-- bạn chạy câu lệnh UPDATE đơn giản như sau trong SQL Editor của Supabase:
--
-- UPDATE public.quizzes
-- SET data = '{
--   "mcq": [
--     {
--       "text": "Bí tích Thánh Thể do ai thiết lập?",
--       "choices": {
--         "A": "Chúa Giêsu trong Bữa Tiệc Ly",
--         "B": "Thánh Phêrô",
--         "C": "Các Tông Đồ",
--         "D": "Hội Thánh sơ khai"
--       },
--       "correct": "A"
--     }
--   ],
--   "essay": [
--     {
--       "text": "Em cần chuẩn bị tâm hồn như thế nào trước khi rước Chúa?",
--       "suggested": "Giữ sạch tội trọng, có lòng khao khát kết hợp với Chúa, giữ chay 1 giờ trước khi rước lễ."
--     }
--   ]
-- }'::jsonb,
-- updated_at = timezone('utc'::text, now())
-- WHERE id = 'on-tap-15-phut-ruoc-le-1-hk1';
-- ==============================================================================
