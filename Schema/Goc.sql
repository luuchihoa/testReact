-- ============================================================
--  SCHEMA HOÀN CHỈNH (ĐÃ GỘP TÍNH NĂNG BÀI VIẾT + THÔNG BÁO ADMIN)
--  Học sinh / Giáo viên / Admin quản lý lớp giáo lý + Bài viết
--
--  ⚠️  File này DROP toàn bộ bảng liên quan trước khi tạo lại.
--      Chỉ chạy trên DB mới, hoặc khi chấp nhận mất dữ liệu cũ.
-- ============================================================

-- ============================================================
--  BLOCK 0: Dọn sạch (bỏ qua nếu muốn giữ dữ liệu cũ)
-- ============================================================

DROP TABLE IF EXISTS public.articles           CASCADE;
DROP TABLE IF EXISTS public.notification_reads CASCADE;
DROP TABLE IF EXISTS public.notifications      CASCADE;
DROP TABLE IF EXISTS public.grades_audit       CASCADE;
DROP TABLE IF EXISTS public.term_locks         CASCADE;
DROP TABLE IF EXISTS public.term_summary       CASCADE;
DROP TABLE IF EXISTS public.year_summary       CASCADE;
DROP TABLE IF EXISTS public.attendance         CASCADE;
DROP TABLE IF EXISTS public.grades             CASCADE;
DROP TABLE IF EXISTS public.class_teachers     CASCADE;
DROP TABLE IF EXISTS public.enrollments        CASCADE;
DROP TABLE IF EXISTS public.users              CASCADE;

-- Drop functions (Bài viết & Thông báo Admin)
DROP FUNCTION IF EXISTS public.submit_article(BIGINT);
DROP FUNCTION IF EXISTS public.review_article(BIGINT, BOOLEAN, TEXT);
DROP FUNCTION IF EXISTS public.touch_articles_updated_at();
DROP FUNCTION IF EXISTS public.get_pending_articles_count();
DROP FUNCTION IF EXISTS public.notify_admin_on_new_article();

-- Drop functions (Core)
DROP FUNCTION IF EXISTS public.broadcast_notification(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_my_notifications(INT);
DROP FUNCTION IF EXISTS public.get_unread_notification_count();
DROP FUNCTION IF EXISTS public.mark_all_notifications_read();
DROP FUNCTION IF EXISTS public.mark_notification_read(BIGINT);
DROP FUNCTION IF EXISTS public.notify_grades_change();
DROP FUNCTION IF EXISTS public.notify_term_summary_change();
DROP FUNCTION IF EXISTS public.notify_year_summary_change();
DROP FUNCTION IF EXISTS public.assign_class_teacher(TEXT, TEXT, TEXT);
DROP FUNCTION IF EXISTS public.unassign_class_teacher(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.lock_term(TEXT, TEXT, INT);
DROP FUNCTION IF EXISTS public.unlock_term(TEXT, TEXT, INT);
DROP FUNCTION IF EXISTS public.is_term_locked(TEXT, TEXT, INT);
DROP FUNCTION IF EXISTS public.log_grades_change();
DROP FUNCTION IF EXISTS public.is_admin();
DROP FUNCTION IF EXISTS public.is_teacher();
DROP FUNCTION IF EXISTS public.is_teacher_of(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.my_username();
DROP FUNCTION IF EXISTS public.current_nam_hoc();

-- ============================================================
--  BLOCK 1: Bảng dữ liệu
-- ============================================================

CREATE TABLE public.users (
  username       TEXT PRIMARY KEY,
  auth_id        UUID UNIQUE REFERENCES auth.users(id) ON DELETE SET NULL,
  ten_thanh      TEXT,
  ho_va_ten      TEXT NOT NULL,
  ngay_sinh      DATE,
  ngay_rua_toi   DATE,
  ngay_ruoc_le   DATE,
  ngay_them_suc  DATE,
  ten_cha        TEXT,
  ten_me         TEXT,
  sdt            TEXT,
  giao_xom       TEXT,
  gioi_tinh      TEXT CHECK (gioi_tinh IN ('Nam', 'Nữ')),
  avatar         TEXT,
  role           TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('user', 'admin', 'teacher', 'student')),
  trang_thai     TEXT NOT NULL DEFAULT 'Đang học' CHECK (trang_thai IN ('Đang học', 'Nghỉ học', 'Hoàn thành', 'Đang dạy', 'Nghỉ dạy')),
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'Bảng tài khoản chung: học sinh, giáo viên, admin — phân biệt qua cột role';

CREATE TABLE public.enrollments (
  username  TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
  nam_hoc   TEXT NOT NULL,
  lop       TEXT NOT NULL,
  PRIMARY KEY (username, nam_hoc)
);

CREATE TABLE public.class_teachers (
  teacher_username TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
  nam_hoc          TEXT NOT NULL,
  lop              TEXT NOT NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (teacher_username, nam_hoc)
);

CREATE TABLE public.grades (
  username      TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
  nam_hoc       TEXT NOT NULL,
  lop           TEXT NOT NULL,
  hoc_ky        INT  NOT NULL CHECK (hoc_ky IN (1, 2)),
  diem_mieng    NUMERIC CHECK (diem_mieng >= 0 AND diem_mieng <= 10),
  diem_vo       NUMERIC CHECK (diem_vo >= 0 AND diem_vo <= 10),
  diem_15_phut  NUMERIC CHECK (diem_15_phut >= 0 AND diem_15_phut <= 10),
  diem_1_tiet   NUMERIC CHECK (diem_1_tiet >= 0 AND diem_1_tiet <= 10),
  diem_thi      NUMERIC CHECK (diem_thi >= 0 AND diem_thi <= 10),
  diem_tb       NUMERIC CHECK (diem_tb >= 0 AND diem_tb <= 10),
  ghi_chu       TEXT DEFAULT '',
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_by    TEXT REFERENCES public.users(username) ON DELETE SET NULL,
  PRIMARY KEY (username, nam_hoc, hoc_ky)
);

CREATE TABLE public.attendance (
  username    TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
  nam_hoc     TEXT NOT NULL,
  hoc_ky      INT  NOT NULL CHECK (hoc_ky IN (1, 2)),
  ngay        DATE NOT NULL,
  trang_thai  TEXT NOT NULL CHECK (trang_thai IN ('co_mat', 'nghi_phep', 'nghi_khong_phep', 'nghi_le')),
  updated_by  TEXT REFERENCES public.users(username) ON DELETE SET NULL,
  PRIMARY KEY (username, nam_hoc, hoc_ky, ngay)
);

CREATE TABLE public.year_summary (
  username   TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
  nam_hoc    TEXT NOT NULL,
  lop        TEXT,
  diem_tb    NUMERIC CHECK (diem_tb >= 0 AND diem_tb <= 10),
  hoc_luc    TEXT CHECK (hoc_luc IN ('Giỏi', 'Khá', 'Trung Bình', 'Yếu', 'Kém')),
  hanh_kiem  TEXT CHECK (hanh_kiem IN ('Tốt', 'Khá', 'Trung Bình', 'Yếu')),
  vi_thu     INT,
  ghi_chu    TEXT DEFAULT '',
  updated_by TEXT REFERENCES public.users(username) ON DELETE SET NULL,
  PRIMARY KEY (username, nam_hoc)
);

CREATE TABLE public.term_summary (
  username      TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
  nam_hoc       TEXT NOT NULL,
  lop           TEXT NOT NULL,
  hoc_ky        INT  NOT NULL CHECK (hoc_ky IN (1, 2)),
  tong_buoi     INT  DEFAULT 0 CHECK (tong_buoi >= 0),
  ngay_bat_dau  DATE,
  hoc_luc       TEXT CHECK (hoc_luc IN ('Giỏi', 'Khá', 'Trung Bình', 'Yếu', 'Kém')),
  hanh_kiem     TEXT CHECK (hanh_kiem IN ('Tốt', 'Khá', 'Trung Bình', 'Yếu')),
  vi_thu        INT,
  ghi_chu       TEXT,
  updated_by    TEXT REFERENCES public.users(username) ON DELETE SET NULL,
  PRIMARY KEY (username, nam_hoc, hoc_ky)
);

CREATE TABLE public.term_locks (
  nam_hoc     TEXT NOT NULL,
  lop         TEXT NOT NULL,
  hoc_ky      INT  NOT NULL CHECK (hoc_ky IN (1, 2)),
  locked_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  locked_by   TEXT REFERENCES public.users(username) ON DELETE SET NULL,
  PRIMARY KEY (nam_hoc, lop, hoc_ky)
);

CREATE TABLE public.grades_audit (
  id          BIGSERIAL PRIMARY KEY,
  username    TEXT NOT NULL,
  nam_hoc     TEXT NOT NULL,
  hoc_ky      INT  NOT NULL,
  old_data    JSONB,
  new_data    JSONB,
  changed_by  TEXT,
  changed_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Bảng thông báo (Đã bao gồm type 'bai_viet') ──
CREATE TABLE public.notifications (
  id                  BIGSERIAL PRIMARY KEY,
  type                TEXT NOT NULL CHECK (type IN (
                         'diem', 'hanh_kiem', 'hoc_luc',
                         'tong_ket_ky', 'tong_ket_nam', 'broadcast', 'system', 'bai_viet'
                       )),
  title               TEXT NOT NULL,
  message             TEXT NOT NULL,
  link                TEXT,
  recipient_username  TEXT REFERENCES public.users(username) ON DELETE CASCADE,
  nam_hoc             TEXT,
  lop                 TEXT,
  hoc_ky              INT CHECK (hoc_ky IN (1, 2)),
  created_by          TEXT REFERENCES public.users(username) ON DELETE SET NULL,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE public.notification_reads (
  notification_id  BIGINT NOT NULL REFERENCES public.notifications(id) ON DELETE CASCADE,
  username          TEXT   NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,
  read_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (notification_id, username)
);

-- ── Bảng bài viết (Articles) ──
CREATE TABLE public.articles (
  id                BIGSERIAL PRIMARY KEY,
  slug              TEXT UNIQUE NOT NULL,
  title             TEXT NOT NULL CHECK (char_length(title) BETWEEN 3 AND 200),
  summary           TEXT CHECK (char_length(summary) <= 300),
  content           TEXT NOT NULL CHECK (char_length(content) >= 10),
  cover_image       TEXT,
  category          TEXT,

  author_username   TEXT NOT NULL REFERENCES public.users(username) ON DELETE CASCADE,

  status            TEXT NOT NULL DEFAULT 'draft'
                     CHECK (status IN ('draft', 'pending', 'published', 'rejected')),
  rejection_reason  TEXT,

  submitted_at      TIMESTAMPTZ,
  published_at      TIMESTAMPTZ,
  reviewed_by       TEXT REFERENCES public.users(username) ON DELETE SET NULL,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE public.articles IS 'Bài viết cộng đồng: draft -> pending -> published/rejected. content lưu markdown thô.';

-- ============================================================
--  BLOCK 2: Hàm Helper & Nghiệp Vụ
-- ============================================================

CREATE OR REPLACE FUNCTION public.my_username()
RETURNS TEXT LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT username FROM public.users WHERE auth_id = auth.uid() LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.current_nam_hoc()
RETURNS TEXT LANGUAGE SQL STABLE AS $$
  SELECT CASE
    WHEN EXTRACT(MONTH FROM CURRENT_DATE) >= 9
      THEN EXTRACT(YEAR FROM CURRENT_DATE)::TEXT || '-' || (EXTRACT(YEAR FROM CURRENT_DATE)::INT + 1)::TEXT
    ELSE (EXTRACT(YEAR FROM CURRENT_DATE)::INT - 1)::TEXT || '-' || EXTRACT(YEAR FROM CURRENT_DATE)::TEXT
  END;
$$;

CREATE OR REPLACE FUNCTION public.is_teacher_of(target_username TEXT, target_nam_hoc TEXT)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.class_teachers ct JOIN public.enrollments e ON e.lop = ct.lop AND e.nam_hoc = ct.nam_hoc
    WHERE ct.teacher_username = public.my_username() AND ct.nam_hoc = target_nam_hoc AND e.username = target_username
  );
$$;

CREATE OR REPLACE FUNCTION public.is_teacher()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'teacher');
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.users WHERE auth_id = auth.uid() AND role = 'admin');
$$;

CREATE OR REPLACE FUNCTION public.assign_class_teacher(p_lop TEXT, p_teacher_username TEXT, p_nam_hoc TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ admin mới được phân công'; END IF;
  IF p_teacher_username IS NULL THEN RAISE EXCEPTION 'Cần truyền teacher_username'; END IF;
  DELETE FROM public.class_teachers WHERE teacher_username = p_teacher_username AND nam_hoc = p_nam_hoc;
  INSERT INTO public.class_teachers (lop, teacher_username, nam_hoc) VALUES (p_lop, p_teacher_username, p_nam_hoc);
END;
$$;

CREATE OR REPLACE FUNCTION public.unassign_class_teacher(p_teacher_username TEXT, p_nam_hoc TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ admin mới được bỏ phân công'; END IF;
  DELETE FROM public.class_teachers WHERE teacher_username = p_teacher_username AND nam_hoc = p_nam_hoc;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_term_locked(p_nam_hoc TEXT, p_lop TEXT, p_hoc_ky INT)
RETURNS BOOLEAN LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.term_locks WHERE nam_hoc = p_nam_hoc AND lop = p_lop AND hoc_ky = p_hoc_ky);
$$;

CREATE OR REPLACE FUNCTION public.lock_term(p_nam_hoc TEXT, p_lop TEXT, p_hoc_ky INT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ admin mới được khóa sổ điểm'; END IF;
  INSERT INTO public.term_locks (nam_hoc, lop, hoc_ky, locked_by) VALUES (p_nam_hoc, p_lop, p_hoc_ky, public.my_username()) ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.unlock_term(p_nam_hoc TEXT, p_lop TEXT, p_hoc_ky INT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ admin mới được mở khóa sổ điểm'; END IF;
  DELETE FROM public.term_locks WHERE nam_hoc = p_nam_hoc AND lop = p_lop AND hoc_ky = p_hoc_ky;
END;
$$;

CREATE OR REPLACE FUNCTION public.log_grades_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.grades_audit (username, nam_hoc, hoc_ky, old_data, new_data, changed_by)
  VALUES (OLD.username, OLD.nam_hoc, OLD.hoc_ky, to_jsonb(OLD), to_jsonb(NEW), public.my_username());
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_grades_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_parts TEXT[] := '{}';
  v_message TEXT;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.diem_mieng IS DISTINCT FROM OLD.diem_mieng AND NEW.diem_mieng IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm miệng: ' || NEW.diem_mieng); END IF;
    IF NEW.diem_15_phut IS DISTINCT FROM OLD.diem_15_phut AND NEW.diem_15_phut IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm 15 phút: ' || NEW.diem_15_phut); END IF;
    IF NEW.diem_1_tiet IS DISTINCT FROM OLD.diem_1_tiet AND NEW.diem_1_tiet IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm 1 tiết: ' || NEW.diem_1_tiet); END IF;
    IF NEW.diem_vo IS DISTINCT FROM OLD.diem_vo AND NEW.diem_vo IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm vở: ' || NEW.diem_vo); END IF;
    IF NEW.diem_thi IS DISTINCT FROM OLD.diem_thi AND NEW.diem_thi IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm thi: ' || NEW.diem_thi); END IF;
    IF NEW.diem_tb IS DISTINCT FROM OLD.diem_tb AND NEW.diem_tb IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm trung bình: ' || NEW.diem_tb); END IF;
  ELSE
    IF NEW.diem_mieng IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm miệng: ' || NEW.diem_mieng); END IF;
    IF NEW.diem_15_phut IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm 15 phút: ' || NEW.diem_15_phut); END IF;
    IF NEW.diem_1_tiet IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm 1 tiết: ' || NEW.diem_1_tiet); END IF;
    IF NEW.diem_vo IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm vở: ' || NEW.diem_vo); END IF;
    IF NEW.diem_thi IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm thi: ' || NEW.diem_thi); END IF;
    IF NEW.diem_tb IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm trung bình: ' || NEW.diem_tb); END IF;
  END IF;

  IF array_length(v_parts, 1) IS NULL THEN RETURN NEW; END IF;
  v_message := array_to_string(v_parts, ' · ');

  INSERT INTO public.notifications (type, title, message, link, recipient_username, nam_hoc, lop, hoc_ky, created_by)
  VALUES ('diem', 'Điểm học kỳ ' || NEW.hoc_ky || ' đã cập nhật', v_message, '/ket-qua-hoc-tap', NEW.username, NEW.nam_hoc, NEW.lop, NEW.hoc_ky, COALESCE(NEW.updated_by, public.my_username()));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_term_summary_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_parts TEXT[] := '{}';
  v_message TEXT;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.hoc_luc IS DISTINCT FROM OLD.hoc_luc AND NEW.hoc_luc IS NOT NULL THEN v_parts := array_append(v_parts, 'Học lực: ' || NEW.hoc_luc); END IF;
    IF NEW.hanh_kiem IS DISTINCT FROM OLD.hanh_kiem AND NEW.hanh_kiem IS NOT NULL THEN v_parts := array_append(v_parts, 'Hạnh kiểm: ' || NEW.hanh_kiem); END IF;
  ELSE
    IF NEW.hoc_luc IS NOT NULL THEN v_parts := array_append(v_parts, 'Học lực: ' || NEW.hoc_luc); END IF;
    IF NEW.hanh_kiem IS NOT NULL THEN v_parts := array_append(v_parts, 'Hạnh kiểm: ' || NEW.hanh_kiem); END IF;
  END IF;

  IF array_length(v_parts, 1) IS NULL THEN RETURN NEW; END IF;
  v_message := array_to_string(v_parts, ' · ');

  INSERT INTO public.notifications (type, title, message, link, recipient_username, nam_hoc, lop, hoc_ky, created_by)
  VALUES ('tong_ket_ky', 'Tổng kết học kỳ ' || NEW.hoc_ky || ' đã cập nhật', v_message, '/ket-qua-hoc-tap', NEW.username, NEW.nam_hoc, NEW.lop, NEW.hoc_ky, COALESCE(NEW.updated_by, public.my_username()));
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_year_summary_change()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_parts TEXT[] := '{}';
  v_message TEXT;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.hoc_luc IS DISTINCT FROM OLD.hoc_luc AND NEW.hoc_luc IS NOT NULL THEN v_parts := array_append(v_parts, 'Học lực cả năm: ' || NEW.hoc_luc); END IF;
    IF NEW.hanh_kiem IS DISTINCT FROM OLD.hanh_kiem AND NEW.hanh_kiem IS NOT NULL THEN v_parts := array_append(v_parts, 'Hạnh kiểm cả năm: ' || NEW.hanh_kiem); END IF;
    IF NEW.diem_tb IS DISTINCT FROM OLD.diem_tb AND NEW.diem_tb IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm TB cả năm: ' || NEW.diem_tb); END IF;
  ELSE
    IF NEW.hoc_luc IS NOT NULL THEN v_parts := array_append(v_parts, 'Học lực cả năm: ' || NEW.hoc_luc); END IF;
    IF NEW.hanh_kiem IS NOT NULL THEN v_parts := array_append(v_parts, 'Hạnh kiểm cả năm: ' || NEW.hanh_kiem); END IF;
    IF NEW.diem_tb IS NOT NULL THEN v_parts := array_append(v_parts, 'Điểm TB cả năm: ' || NEW.diem_tb); END IF;
  END IF;

  IF array_length(v_parts, 1) IS NULL THEN RETURN NEW; END IF;
  v_message := array_to_string(v_parts, ' · ');

  INSERT INTO public.notifications (type, title, message, link, recipient_username, nam_hoc, created_by)
  VALUES ('tong_ket_nam', 'Tổng kết năm học đã cập nhật', v_message, '/ket-qua-hoc-tap', NEW.username, NEW.nam_hoc, COALESCE(NEW.updated_by, public.my_username()));
  RETURN NEW;
END;
$$;

-- ── Thông báo bài viết cho Admin ──
CREATE OR REPLACE FUNCTION public.notify_admin_on_new_article()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_admin_record RECORD;
BEGIN
  IF (NEW.status = 'pending' AND (OLD.status IS NULL OR OLD.status != 'pending')) THEN
    FOR v_admin_record IN SELECT username FROM public.users WHERE role = 'admin' LOOP
      INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
      VALUES (
        'bai_viet',
        'Bài viết mới chờ duyệt',
        'Tác giả ' || NEW.author_username || ' vừa gửi bài viết: "' || NEW.title || '"',
        '/quản-trị/bài-viết', 
        v_admin_record.username,
        NEW.author_username
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.broadcast_notification(p_title TEXT, p_message TEXT, p_link TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ admin mới được gửi thông báo chung'; END IF;
  INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
  VALUES ('broadcast', p_title, p_message, p_link, NULL, public.my_username());
END;
$$;

CREATE OR REPLACE FUNCTION public.get_my_notifications(p_limit INT DEFAULT 30)
RETURNS TABLE (id BIGINT, type TEXT, title TEXT, message TEXT, link TEXT, created_at TIMESTAMPTZ, read BOOLEAN)
LANGUAGE SQL STABLE SET search_path = public AS $$
  SELECT n.id, n.type, n.title, n.message, n.link, n.created_at, (nr.read_at IS NOT NULL) AS read
  FROM public.notifications n
  LEFT JOIN public.notification_reads nr ON nr.notification_id = n.id AND nr.username = public.my_username()
  WHERE n.recipient_username = public.my_username() OR n.recipient_username IS NULL
  ORDER BY n.created_at DESC LIMIT p_limit;
$$;

CREATE OR REPLACE FUNCTION public.get_unread_notification_count()
RETURNS INT LANGUAGE SQL STABLE SET search_path = public AS $$
  SELECT COUNT(*)::INT FROM public.notifications n
  LEFT JOIN public.notification_reads nr ON nr.notification_id = n.id AND nr.username = public.my_username()
  WHERE (n.recipient_username = public.my_username() OR n.recipient_username IS NULL) AND nr.read_at IS NULL;
$$;

CREATE OR REPLACE FUNCTION public.mark_all_notifications_read()
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  INSERT INTO public.notification_reads (notification_id, username)
  SELECT n.id, public.my_username() FROM public.notifications n
  LEFT JOIN public.notification_reads nr ON nr.notification_id = n.id AND nr.username = public.my_username()
  WHERE (n.recipient_username = public.my_username() OR n.recipient_username IS NULL) AND nr.read_at IS NULL
  ON CONFLICT DO NOTHING;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id BIGINT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE v_username TEXT := public.my_username();
BEGIN
  IF v_username IS NULL THEN RAISE EXCEPTION 'Không xác định được người dùng hiện tại'; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.notifications WHERE id = p_notification_id AND (recipient_username = v_username OR recipient_username IS NULL)) THEN
    RAISE EXCEPTION 'Không tìm thấy thông báo hoặc không có quyền';
  END IF;
  INSERT INTO public.notification_reads (notification_id, username) VALUES (p_notification_id, v_username) ON CONFLICT DO NOTHING;
END;
$$;

-- ── Hàm nghiệp vụ Bài Viết ──

CREATE OR REPLACE FUNCTION public.touch_articles_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.submit_article(p_id BIGINT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_username TEXT := public.my_username();
  v_status   TEXT;
  v_pending_count INT;
BEGIN
  IF v_username IS NULL THEN RAISE EXCEPTION 'Không xác định được người dùng hiện tại'; END IF;
  SELECT status INTO v_status FROM public.articles WHERE id = p_id AND author_username = v_username FOR UPDATE;
  IF v_status IS NULL THEN RAISE EXCEPTION 'Không tìm thấy bài viết hoặc bạn không phải tác giả'; END IF;
  IF v_status NOT IN ('draft', 'rejected') THEN RAISE EXCEPTION 'Chỉ có thể gửi duyệt bài nháp hoặc bị từ chối'; END IF;

  SELECT COUNT(*) INTO v_pending_count FROM public.articles WHERE author_username = v_username AND status = 'pending';
  IF v_pending_count >= 3 THEN RAISE EXCEPTION 'Bạn đang có % bài chờ duyệt, vui lòng đợi admin xử lý', v_pending_count; END IF;

  UPDATE public.articles SET status = 'pending', submitted_at = NOW(), rejection_reason = NULL WHERE id = p_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.review_article(p_id BIGINT, p_approve BOOLEAN, p_reason TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_article public.articles%ROWTYPE;
  v_reviewer TEXT := public.my_username();
BEGIN
  IF NOT public.is_admin() THEN RAISE EXCEPTION 'Chỉ admin mới được duyệt bài'; END IF;
  SELECT * INTO v_article FROM public.articles WHERE id = p_id FOR UPDATE;
  IF v_article.id IS NULL THEN RAISE EXCEPTION 'Không tìm thấy bài viết'; END IF;
  IF v_article.status <> 'pending' THEN RAISE EXCEPTION 'Bài viết không ở trạng thái chờ duyệt'; END IF;

  IF p_approve THEN
    UPDATE public.articles SET status = 'published', published_at = NOW(), reviewed_by = v_reviewer, rejection_reason = NULL WHERE id = p_id;
    INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
    VALUES ('bai_viet', 'Bài viết đã được duyệt', 'Bài viết "' || v_article.title || '" của bạn đã được đăng.', '/bài-viết/' || v_article.slug, v_article.author_username, v_reviewer);
  ELSE
    IF p_reason IS NULL OR btrim(p_reason) = '' THEN RAISE EXCEPTION 'Cần nhập lý do từ chối'; END IF;
    UPDATE public.articles SET status = 'rejected', reviewed_by = v_reviewer, rejection_reason = p_reason WHERE id = p_id;
    INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
    VALUES ('bai_viet', 'Bài viết bị từ chối', 'Bài viết "' || v_article.title || '" cần chỉnh sửa: ' || p_reason, '/bài-viết-của-tôi/soạn/' || v_article.id, v_article.author_username, v_reviewer);
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_pending_articles_count()
RETURNS INT LANGUAGE SQL STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT CASE WHEN public.is_admin() THEN (SELECT COUNT(*)::INT FROM public.articles WHERE status = 'pending') ELSE 0 END;
$$;

-- ============================================================
--  BLOCK 3: Bật Row Level Security (RLS)
-- ============================================================

ALTER TABLE public.users               ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments         ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.class_teachers      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.attendance          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.year_summary        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.term_summary        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.term_locks          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grades_audit        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notification_reads  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.articles            ENABLE ROW LEVEL SECURITY;

-- ============================================================
--  BLOCK 4: RLS Policies
-- ============================================================

-- ── users ──
CREATE POLICY "users: select own" ON public.users FOR SELECT USING (auth_id = auth.uid());
CREATE POLICY "users: update own" ON public.users FOR UPDATE USING (auth_id = auth.uid()) WITH CHECK (auth_id = auth.uid());
CREATE POLICY "users: teacher select student" ON public.users FOR SELECT USING (public.is_teacher_of(username, public.current_nam_hoc()));
CREATE POLICY "users: teacher update student" ON public.users FOR UPDATE USING (public.is_teacher_of(username, public.current_nam_hoc())) WITH CHECK (public.is_teacher_of(username, public.current_nam_hoc()));
CREATE POLICY "users: admin select all" ON public.users FOR SELECT USING (public.is_admin());
CREATE POLICY "users: admin update all" ON public.users FOR UPDATE USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── enrollments ──
CREATE POLICY "enrollments: select own" ON public.enrollments FOR SELECT USING (username = public.my_username());
CREATE POLICY "enrollments: teacher select class" ON public.enrollments FOR SELECT USING (EXISTS (SELECT 1 FROM public.class_teachers ct WHERE ct.teacher_username = public.my_username() AND ct.nam_hoc = enrollments.nam_hoc AND ct.lop = enrollments.lop));
CREATE POLICY "enrollments: admin all" ON public.enrollments FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── class_teachers ──
CREATE POLICY "class_teachers: select own" ON public.class_teachers FOR SELECT USING (teacher_username = public.my_username());
CREATE POLICY "class_teachers: admin all" ON public.class_teachers FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── grades ──
CREATE POLICY "grades: select own" ON public.grades FOR SELECT USING (username = public.my_username());
CREATE POLICY "grades: teacher select" ON public.grades FOR SELECT USING (public.is_teacher_of(username, nam_hoc));
CREATE POLICY "grades: teacher insert" ON public.grades FOR INSERT WITH CHECK (public.is_teacher_of(username, nam_hoc) AND NOT public.is_term_locked(nam_hoc, lop, hoc_ky));
CREATE POLICY "grades: teacher update" ON public.grades FOR UPDATE USING (public.is_teacher_of(username, nam_hoc) AND NOT public.is_term_locked(nam_hoc, lop, hoc_ky)) WITH CHECK (public.is_teacher_of(username, nam_hoc) AND NOT public.is_term_locked(nam_hoc, lop, hoc_ky));
CREATE POLICY "grades: admin all" ON public.grades FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── attendance ──
CREATE POLICY "attendance: select own" ON public.attendance FOR SELECT USING (username = public.my_username());
CREATE POLICY "attendance: teacher select" ON public.attendance FOR SELECT USING (public.is_teacher_of(username, nam_hoc));
CREATE POLICY "attendance: teacher insert" ON public.attendance FOR INSERT WITH CHECK (public.is_teacher_of(username, nam_hoc) AND NOT public.is_term_locked(nam_hoc, (SELECT lop FROM public.enrollments e WHERE e.username = attendance.username AND e.nam_hoc = attendance.nam_hoc), hoc_ky));
CREATE POLICY "attendance: teacher update" ON public.attendance FOR UPDATE USING (public.is_teacher_of(username, nam_hoc) AND NOT public.is_term_locked(nam_hoc, (SELECT lop FROM public.enrollments e WHERE e.username = attendance.username AND e.nam_hoc = attendance.nam_hoc), hoc_ky)) WITH CHECK (public.is_teacher_of(username, nam_hoc) AND NOT public.is_term_locked(nam_hoc, (SELECT lop FROM public.enrollments e WHERE e.username = attendance.username AND e.nam_hoc = attendance.nam_hoc), hoc_ky));
CREATE POLICY "attendance: admin all" ON public.attendance FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── term_summary ──
CREATE POLICY "term_summary: select own" ON public.term_summary FOR SELECT USING (username = public.my_username());
CREATE POLICY "term_summary: teacher select" ON public.term_summary FOR SELECT USING (public.is_teacher_of(username, nam_hoc));
CREATE POLICY "term_summary: teacher insert" ON public.term_summary FOR INSERT WITH CHECK (public.is_teacher_of(username, nam_hoc) AND NOT public.is_term_locked(nam_hoc, lop, hoc_ky));
CREATE POLICY "term_summary: teacher update" ON public.term_summary FOR UPDATE USING (public.is_teacher_of(username, nam_hoc) AND NOT public.is_term_locked(nam_hoc, lop, hoc_ky)) WITH CHECK (public.is_teacher_of(username, nam_hoc) AND NOT public.is_term_locked(nam_hoc, lop, hoc_ky));
CREATE POLICY "term_summary: admin all" ON public.term_summary FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── year_summary ──
CREATE POLICY "year_summary: select own" ON public.year_summary FOR SELECT USING (username = public.my_username());
CREATE POLICY "year_summary: teacher select" ON public.year_summary FOR SELECT USING (public.is_teacher_of(username, nam_hoc));
CREATE POLICY "year_summary: teacher insert" ON public.year_summary FOR INSERT WITH CHECK (public.is_teacher_of(username, nam_hoc));
CREATE POLICY "year_summary: teacher update" ON public.year_summary FOR UPDATE USING (public.is_teacher_of(username, nam_hoc)) WITH CHECK (public.is_teacher_of(username, nam_hoc));
CREATE POLICY "year_summary: admin all" ON public.year_summary FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── term_locks ──
CREATE POLICY "term_locks: teacher select own class" ON public.term_locks FOR SELECT USING (EXISTS (SELECT 1 FROM public.class_teachers ct WHERE ct.teacher_username = public.my_username() AND ct.nam_hoc = term_locks.nam_hoc AND ct.lop = term_locks.lop));
CREATE POLICY "term_locks: admin all" ON public.term_locks FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ── grades_audit ──
CREATE POLICY "grades_audit: teacher select own students" ON public.grades_audit FOR SELECT USING (public.is_teacher_of(username, nam_hoc));
CREATE POLICY "grades_audit: admin select all" ON public.grades_audit FOR SELECT USING (public.is_admin());

-- ── notifications & notification_reads ──
CREATE POLICY "notifications: select mine or broadcast" ON public.notifications FOR SELECT USING (recipient_username = public.my_username() OR recipient_username IS NULL);
CREATE POLICY "notification_reads: select own" ON public.notification_reads FOR SELECT USING (username = public.my_username());
CREATE POLICY "notification_reads: insert own" ON public.notification_reads FOR INSERT WITH CHECK (username = public.my_username());
CREATE POLICY "notification_reads: update own" ON public.notification_reads FOR UPDATE USING (username = public.my_username()) WITH CHECK (username = public.my_username());

-- ── articles ──
CREATE POLICY "articles: public select published" ON public.articles FOR SELECT USING (status = 'published');
CREATE POLICY "articles: author select own" ON public.articles FOR SELECT USING (author_username = public.my_username());
CREATE POLICY "articles: admin select all" ON public.articles FOR SELECT USING (public.is_admin());
CREATE POLICY "articles: author insert own draft" ON public.articles FOR INSERT WITH CHECK (author_username = public.my_username() AND status = 'draft');
CREATE POLICY "articles: author update draft or rejected" ON public.articles FOR UPDATE USING (author_username = public.my_username() AND status IN ('draft', 'rejected')) WITH CHECK (author_username = public.my_username() AND status IN ('draft', 'rejected', 'pending'));
CREATE POLICY "articles: author delete own draft" ON public.articles FOR DELETE USING (author_username = public.my_username() AND status = 'draft');
CREATE POLICY "articles: admin all" ON public.articles FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

-- ============================================================
--  BLOCK 5: Trigger
-- ============================================================

CREATE TRIGGER trg_grades_audit
  AFTER UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.log_grades_change();

CREATE TRIGGER trg_notify_grades_change
  AFTER INSERT OR UPDATE ON public.grades
  FOR EACH ROW EXECUTE FUNCTION public.notify_grades_change();

CREATE TRIGGER trg_notify_term_summary_change
  AFTER INSERT OR UPDATE ON public.term_summary
  FOR EACH ROW EXECUTE FUNCTION public.notify_term_summary_change();

CREATE TRIGGER trg_notify_year_summary_change
  AFTER INSERT OR UPDATE ON public.year_summary
  FOR EACH ROW EXECUTE FUNCTION public.notify_year_summary_change();

CREATE TRIGGER trg_articles_touch_updated_at
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.touch_articles_updated_at();

-- Trigger thông báo cho Admin khi có bài viết mới
CREATE TRIGGER trg_notify_admin_article
  AFTER UPDATE ON public.articles
  FOR EACH ROW WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_on_new_article();

-- ============================================================
--  BLOCK 6: Indexes
-- ============================================================

-- Từ schema cũ
CREATE INDEX idx_users_auth_id                 ON public.users(auth_id);
CREATE INDEX idx_users_role                    ON public.users(role);
CREATE INDEX idx_class_teachers_teacher_namhoc ON public.class_teachers(teacher_username, nam_hoc);
CREATE INDEX idx_class_teachers_lop_namhoc     ON public.class_teachers(lop, nam_hoc);
CREATE INDEX idx_enrollments_lop_namhoc        ON public.enrollments(lop, nam_hoc);
CREATE INDEX idx_enrollments_username          ON public.enrollments(username);
CREATE INDEX idx_grades_lookup                 ON public.grades(username, nam_hoc, hoc_ky);
CREATE INDEX idx_attendance_lookup             ON public.attendance(username, nam_hoc, hoc_ky);
CREATE INDEX idx_term_locks_lop_namhoc         ON public.term_locks(lop, nam_hoc);
CREATE INDEX idx_grades_audit_lookup           ON public.grades_audit(username, nam_hoc, hoc_ky);
CREATE INDEX idx_grades_audit_changed_at       ON public.grades_audit(changed_at DESC);
CREATE INDEX idx_notifications_recipient       ON public.notifications(recipient_username);
CREATE INDEX idx_notifications_broadcast       ON public.notifications(created_at DESC) WHERE recipient_username IS NULL;
CREATE INDEX idx_notifications_created_at      ON public.notifications(created_at DESC);
CREATE INDEX idx_notification_reads_user       ON public.notification_reads(username);

-- Indexes mới cho tính năng Bài viết
CREATE INDEX idx_articles_status_published     ON public.articles(status, published_at DESC) WHERE status = 'published';
CREATE INDEX idx_articles_author               ON public.articles(author_username, status);
CREATE INDEX idx_articles_slug                 ON public.articles(slug);

-- ============================================================
--  BLOCK 7: Kiểm tra sau khi chạy
-- ============================================================

SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;
SELECT tablename, policyname, cmd, qual FROM pg_policies WHERE schemaname = 'public' ORDER BY tablename, policyname;
SELECT public.current_nam_hoc();