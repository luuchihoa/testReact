-- Schema khởi tạo Mô Hình 2 Tầng (Hybrid System) cho Đố Vui Giáo Lý trên Supabase
-- Giúp lưu giữ thành tích trọn đời của học sinh nhưng luôn giữ Database siêu nhẹ (< 10MB)

-- ============================================================================
-- 1. BẢNG 1: dovui_user_totals (Tổng điểm tích lũy trọn đời - 1 Học sinh = 1 Dòng)
-- ============================================================================
create table if not exists public.dovui_user_totals (
  username text primary key,
  all_time_points integer not null default 0,
  total_correct integer not null default 0,
  total_questions integer not null default 0,
  play_count integer not null default 0,
  max_streak integer not null default 0,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Kích hoạt Row Level Security (RLS) cho dovui_user_totals
alter table public.dovui_user_totals enable row level security;

drop policy if exists "Allow select dovui_user_totals" on public.dovui_user_totals;
create policy "Allow select dovui_user_totals" on public.dovui_user_totals for select to public using (true);

drop policy if exists "Allow insert dovui_user_totals" on public.dovui_user_totals;
create policy "Allow insert dovui_user_totals" on public.dovui_user_totals for insert to public with check (true);

drop policy if exists "Allow update dovui_user_totals" on public.dovui_user_totals;
create policy "Allow update dovui_user_totals" on public.dovui_user_totals for update to public using (true);

-- ============================================================================
-- 2. BẢNG 2: dovui_scores (Lịch sử các lượt chơi ngắn hạn 30 ngày)
-- ============================================================================
create table if not exists public.dovui_scores (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete set null,
  username text not null,
  topic_title text,
  points integer not null default 0,
  correct_count integer not null default 0,
  total_questions integer not null default 0,
  max_streak integer not null default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.dovui_scores add column if not exists topic_title text;
alter table public.dovui_scores enable row level security;

drop policy if exists "Allow select dovui_scores" on public.dovui_scores;
create policy "Allow select dovui_scores" on public.dovui_scores for select to public using (true);

drop policy if exists "Allow insert dovui_scores" on public.dovui_scores;
create policy "Allow insert dovui_scores" on public.dovui_scores for insert to public with check (true);

-- ============================================================================
-- 3. HÀM TỰ ĐỘNG DỌN DẸP DỮ LIỆU CŨ > 30 NGÀY
-- ============================================================================
create or replace function clean_old_dovui_scores()
returns void as $$
begin
  delete from public.dovui_scores
  where created_at < now() - interval '30 days';
end;
$$ language plpgsql;