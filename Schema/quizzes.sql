-- Schema khởi tạo bảng quizzes trên Supabase
-- Lưu trữ các bộ đề thi trắc nghiệm & tự luận ôn tập giáo lý và đố vui giáo lý

create table if not exists public.quizzes (
  id text primary key,                                              -- vd: "on-tap-15-phut-hk1"
  slug text unique not null,                                        -- vd: "ôn-tập-15-phút-học-kỳ-1" (khớp với router param trên web)
  title text not null,                                              -- vd: "ÔN TẬP 15 PHÚT"
  khoi text not null default 'phung-vu',                            -- "phung-vu" hoặc "all"
  time integer not null default 900,                                -- Thời gian làm bài (giây): vd 900 (15p) hoặc 2700 (45p)
  mcq_count integer not null default 10,                            -- Số câu trắc nghiệm lấy ngẫu nhiên
  mcq_point numeric(4, 2) not null default 5.0,                     -- Thang điểm phần trắc nghiệm (vd: 5.0)
  essay_count integer not null default 2,                           -- Số câu tự luận lấy ngẫu nhiên
  essay_point numeric(4, 2) not null default 5.0,                   -- Thang điểm phần tự luận (vd: 5.0)
  data jsonb not null,                                              -- Cấu trúc: { mcq: [...], essay: [...] } hoặc [...] cho đố vui
  is_active boolean not null default true,                          -- Cho phép kích hoạt hoặc tạm ẩn đề thi
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tạo chỉ mục tìm kiếm nhanh theo slug
create index if not exists idx_quizzes_slug on public.quizzes(slug);
create index if not exists idx_quizzes_khoi on public.quizzes(khoi);

-- Kích hoạt Row Level Security (RLS)
alter table public.quizzes enable row level security;

-- Cho phép đọc công khai các bộ đề active (cho học sinh và khách)
drop policy if exists "Allow public read active quizzes" on public.quizzes;
create policy "Allow public read active quizzes" on public.quizzes
  for select to public
  using (is_active = true);

-- Cho phép thêm, sửa, xóa với service_role hoặc người dùng có role admin
drop policy if exists "Allow service role full access" on public.quizzes;
create policy "Allow service role full access" on public.quizzes
  for all to service_role
  using (true)
  with check (true);
