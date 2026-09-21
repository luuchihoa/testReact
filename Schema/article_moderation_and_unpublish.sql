-- ==============================================================================
-- Migration: Quản lý, Gỡ bài viết (Unpublish), Xóa bài viết và Ghi vết kiểm duyệt
-- Phiên bản: 1.0
-- Lưu ý: Áp dụng vào PostgreSQL / Supabase để hoàn thiện hệ thống quản trị bài viết.
-- ==============================================================================

-- 1. Mở rộng CHECK constraint cho cột `status` trong bảng `public.articles`
ALTER TABLE public.articles DROP CONSTRAINT IF EXISTS articles_status_check;
ALTER TABLE public.articles ADD CONSTRAINT articles_status_check 
  CHECK (status IN ('draft', 'pending', 'published', 'rejected', 'unpublished'));

-- 2. Thêm các cột lưu vết gỡ bài và ngày duyệt chi tiết
ALTER TABLE public.articles
  ADD COLUMN IF NOT EXISTS unpublished_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS unpublished_by TEXT REFERENCES public.users(username) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS unpublish_reason TEXT,
  ADD COLUMN IF NOT EXISTS reviewed_at TIMESTAMPTZ;

-- 3. Tạo bảng ghi vết sự kiện kiểm duyệt (Moderation Audit Log)
CREATE TABLE IF NOT EXISTS public.article_moderation_events (
  id BIGSERIAL PRIMARY KEY,
  article_id BIGINT NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  action TEXT NOT NULL CHECK (action IN ('submit', 'approve', 'reject', 'unpublish', 'delete')),
  previous_status TEXT,
  next_status TEXT,
  reason TEXT,
  actor_username TEXT REFERENCES public.users(username) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Chỉ mục hỗ trợ tra cứu lịch sử kiểm duyệt
CREATE INDEX IF NOT EXISTS idx_article_mod_events_article_id ON public.article_moderation_events(article_id);
CREATE INDEX IF NOT EXISTS idx_article_mod_events_created_at ON public.article_moderation_events(created_at DESC);

-- Bật Row Level Security cho bảng `article_moderation_events`
ALTER TABLE public.article_moderation_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "moderation_events: admin all" ON public.article_moderation_events;
CREATE POLICY "moderation_events: admin all" ON public.article_moderation_events
  FOR ALL USING (public.is_admin()) WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "moderation_events: author select own article" ON public.article_moderation_events;
CREATE POLICY "moderation_events: author select own article" ON public.article_moderation_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.articles a 
      WHERE a.id = article_moderation_events.article_id 
        AND a.author_username = public.my_username()
    )
  );

-- 4. Cập nhật RLS Policy trên `public.articles` để tác giả có thể sửa và gửi lại bài `unpublished`
DROP POLICY IF EXISTS "articles: author update own" ON public.articles;
DROP POLICY IF EXISTS "articles: author update own (draft/rejected/published)" ON public.articles;
DROP POLICY IF EXISTS "articles: author update own (draft/rejected/unpublished/published)" ON public.articles;
DROP POLICY IF EXISTS "articles: author update own (draft/rejected/unpublished/publish" ON public.articles;

CREATE POLICY "articles: author update own" ON public.articles
  FOR UPDATE USING (
    author_username = public.my_username() 
    AND status IN ('draft', 'rejected', 'unpublished', 'published')
  )
  WITH CHECK (
    author_username = public.my_username() 
    AND status IN ('draft', 'rejected', 'pending')
  );

-- 5. Cập nhật RPC `review_article` (Duyệt hoặc Từ chối bài trong hàng đợi pending)
CREATE OR REPLACE FUNCTION public.review_article(p_id BIGINT, p_approve BOOLEAN, p_reason TEXT DEFAULT NULL)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_article public.articles%ROWTYPE;
  v_reviewer TEXT := public.my_username();
BEGIN
  IF NOT public.is_admin() THEN 
    RAISE EXCEPTION 'Chỉ quản trị viên mới có quyền duyệt bài'; 
  END IF;

  SELECT * INTO v_article FROM public.articles WHERE id = p_id FOR UPDATE;
  IF v_article.id IS NULL THEN 
    RAISE EXCEPTION 'Không tìm thấy bài viết'; 
  END IF;

  IF v_article.status <> 'pending' THEN 
    RAISE EXCEPTION 'Bài viết không ở trạng thái chờ duyệt (status: %)', v_article.status; 
  END IF;

  IF p_approve THEN
    UPDATE public.articles 
    SET status = 'published', 
        published_at = NOW(), 
        reviewed_at = NOW(),
        reviewed_by = v_reviewer, 
        rejection_reason = NULL 
    WHERE id = p_id;

    INSERT INTO public.article_moderation_events (article_id, action, previous_status, next_status, reason, actor_username)
    VALUES (p_id, 'approve', v_article.status, 'published', NULL, v_reviewer);

    INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
    VALUES (
      'bai_viet', 
      'Bài viết đã được duyệt', 
      'Bài viết "' || v_article.title || '" của bạn đã được xuất bản.', 
      '/bài-viết/' || v_article.slug, 
      v_article.author_username, 
      v_reviewer
    );
  ELSE
    IF p_reason IS NULL OR btrim(p_reason) = '' THEN 
      RAISE EXCEPTION 'Cần nhập lý do từ chối bài viết'; 
    END IF;

    UPDATE public.articles 
    SET status = 'rejected', 
        reviewed_at = NOW(),
        reviewed_by = v_reviewer, 
        rejection_reason = btrim(p_reason) 
    WHERE id = p_id;

    INSERT INTO public.article_moderation_events (article_id, action, previous_status, next_status, reason, actor_username)
    VALUES (p_id, 'reject', v_article.status, 'rejected', btrim(p_reason), v_reviewer);

    INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
    VALUES (
      'bai_viet', 
      'Bài viết bị từ chối', 
      'Bài viết "' || v_article.title || '" cần chỉnh sửa: ' || btrim(p_reason), 
      '/bài-viết-của-tôi/soạn/' || v_article.id, 
      v_article.author_username, 
      v_reviewer
    );
  END IF;
END;
$$;

-- 6. RPC: `admin_unpublish_article` (Gỡ bài viết đã xuất bản khỏi trang công khai)
CREATE OR REPLACE FUNCTION public.admin_unpublish_article(p_id BIGINT, p_reason TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_article public.articles%ROWTYPE;
  v_actor TEXT := public.my_username();
  v_trimmed_reason TEXT := btrim(COALESCE(p_reason, ''));
BEGIN
  IF NOT public.is_admin() THEN 
    RAISE EXCEPTION 'Chỉ quản trị viên mới có quyền gỡ bài viết'; 
  END IF;

  IF char_length(v_trimmed_reason) < 5 THEN 
    RAISE EXCEPTION 'Vui lòng nhập lý do gỡ bài ít nhất 5 ký tự'; 
  END IF;

  SELECT * INTO v_article FROM public.articles WHERE id = p_id FOR UPDATE;
  IF v_article.id IS NULL THEN 
    RAISE EXCEPTION 'Không tìm thấy bài viết'; 
  END IF;

  IF v_article.status <> 'published' THEN 
    RAISE EXCEPTION 'Chỉ có thể gỡ bài viết đang ở trạng thái đã xuất bản (status: %)', v_article.status; 
  END IF;

  UPDATE public.articles
  SET status = 'unpublished',
      unpublished_at = NOW(),
      unpublished_by = v_actor,
      unpublish_reason = v_trimmed_reason
  WHERE id = p_id;

  INSERT INTO public.article_moderation_events (article_id, action, previous_status, next_status, reason, actor_username)
  VALUES (p_id, 'unpublish', v_article.status, 'unpublished', v_trimmed_reason, v_actor);

  INSERT INTO public.notifications (type, title, message, link, recipient_username, created_by)
  VALUES (
    'bai_viet',
    'Bài viết đã bị gỡ khỏi trang công khai',
    'Bài viết "' || v_article.title || '" đã được Ban Quản trị gỡ: ' || v_trimmed_reason,
    '/bài-viết-của-tôi/soạn/' || v_article.id,
    v_article.author_username,
    v_actor
  );
END;
$$;

-- 7. RPC: `admin_delete_article` (Xóa có kiểm soát bài rejected hoặc unpublished)
CREATE OR REPLACE FUNCTION public.admin_delete_article(p_id BIGINT, p_reason TEXT)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_article public.articles%ROWTYPE;
  v_actor TEXT := public.my_username();
  v_trimmed_reason TEXT := btrim(COALESCE(p_reason, ''));
BEGIN
  IF NOT public.is_admin() THEN 
    RAISE EXCEPTION 'Chỉ quản trị viên mới có quyền xóa bài viết'; 
  END IF;

  IF char_length(v_trimmed_reason) < 5 THEN 
    RAISE EXCEPTION 'Vui lòng nhập lý do xóa bài ít nhất 5 ký tự'; 
  END IF;

  SELECT * INTO v_article FROM public.articles WHERE id = p_id FOR UPDATE;
  IF v_article.id IS NULL THEN 
    RAISE EXCEPTION 'Không tìm thấy bài viết'; 
  END IF;

  IF v_article.status NOT IN ('rejected', 'unpublished') THEN
    RAISE EXCEPTION 'Chỉ có thể xóa bài viết đã bị từ chối hoặc đã gỡ. Nếu bài đang xuất bản, vui lòng gỡ bài trước khi xóa.';
  END IF;

  -- Ghi log audit trước khi xóa bản ghi
  INSERT INTO public.article_moderation_events (article_id, action, previous_status, next_status, reason, actor_username)
  VALUES (p_id, 'delete', v_article.status, 'deleted', v_trimmed_reason, v_actor);

  -- Dọn dẹp / cập nhật các thông báo cũ trỏ đến bài viết đã bị xóa để tránh link chết
  UPDATE public.notifications
  SET link = '/bài-viết-của-tôi',
      message = message || ' (Bài viết đã bị xóa bởi Ban Quản trị)'
  WHERE link = '/bài-viết/' || v_article.slug OR link = '/bài-viết-của-tôi/soạn/' || v_article.id;

  -- Xóa bản ghi
  DELETE FROM public.articles WHERE id = p_id;
END;
$$;

-- 8. RPC: `get_admin_article_status_counts` (Lấy số lượng bài viết theo 4 trạng thái trong 1 truy vấn)
CREATE OR REPLACE FUNCTION public.get_admin_article_status_counts()
RETURNS JSON LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_result JSON;
BEGIN
  IF NOT public.is_admin() THEN
    RETURN json_build_object('pending', 0, 'published', 0, 'rejected', 0, 'unpublished', 0);
  END IF;

  SELECT json_build_object(
    'pending', COUNT(*) FILTER (WHERE status = 'pending'),
    'published', COUNT(*) FILTER (WHERE status = 'published'),
    'rejected', COUNT(*) FILTER (WHERE status = 'rejected'),
    'unpublished', COUNT(*) FILTER (WHERE status = 'unpublished')
  ) INTO v_result
  FROM public.articles;

  RETURN v_result;
END;
$$;

-- 9. Trigger thông báo cho Admin khi có bài viết mới gửi duyệt (trỏ chính xác đến /quản-trị/bài-viết)
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
        '/quản-trị/bài-viết?tab=pending&article=' || NEW.id,
        v_admin_record.username,
        NEW.author_username
      );
    END LOOP;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_notify_admin_article ON public.articles;
CREATE TRIGGER trg_notify_admin_article
  AFTER INSERT OR UPDATE ON public.articles
  FOR EACH ROW WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_admin_on_new_article();
