-- ==============================================================================
-- MIGRATION: ĐỒNG BỘ TIÊU CHUẨN HẠNH KIỂM (PHƯƠNG ÁN 1: CHÂM CHƯỚC 1 BUỔI KP)
-- VÀ XẾP HẠNG VỊ THỨ CHUẨN THI ĐẤU (STANDARD RANK 1-2-2-4) KÈM TIÊU CHÍ PHỤ
-- Ban Giáo lý An Ngãi
-- Mô tả:
-- 1. Hạnh kiểm: Vắng 1 buổi không phép (và là buổi vắng duy nhất) vẫn được xét loại TỐT.
-- 2. Vị thứ: Ưu tiên 1 theo Điểm TB, Ưu tiên 2 (khi bằng ĐTB) theo Hạnh kiểm (Tốt > Khá > TB > Yếu).
-- 3. Xếp hạng nhảy bậc chuẩn 1-2-2-4: Với lớp 25 em, bạn thấp điểm nhất sẽ nhận đúng Hạng 25.
-- ==============================================================================

-- BƯỚC 1: CẬP NHẬT HÀM ĐỒNG BỘ HẠNH KIỂM HỌC KỲ (TERM_SUMMARY)
CREATE OR REPLACE FUNCTION public.sync_attendance_evaluation_to_term_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_username TEXT;
  v_nam_hoc TEXT;
  v_hoc_ky INT;
  v_lop TEXT;
  v_total_attended INT := 0;
  v_nghi_phep INT := 0;
  v_nghi_khong_phep INT := 0;
  v_tong_nghi INT := 0;
  v_hanh_kiem TEXT;
BEGIN
  IF (TG_OP = 'DELETE') THEN
    v_username := OLD.username;
    v_nam_hoc  := OLD.nam_hoc;
    v_hoc_ky   := OLD.hoc_ky;
  ELSE
    v_username := NEW.username;
    v_nam_hoc  := NEW.nam_hoc;
    v_hoc_ky   := NEW.hoc_ky;
  END IF;

  -- 1. Đếm số buổi vắng và tổng số buổi đã điểm danh
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE trang_thai = 'nghi_phep'),
    COUNT(*) FILTER (WHERE trang_thai = 'nghi_khong_phep')
  INTO 
    v_total_attended,
    v_nghi_phep,
    v_nghi_khong_phep
  FROM public.attendance
  WHERE username = v_username 
    AND nam_hoc = v_nam_hoc 
    AND hoc_ky = v_hoc_ky;

  v_tong_nghi := v_nghi_phep + v_nghi_khong_phep;

  -- 2. Tự động xét Hạnh kiểm theo tiêu chuẩn chuyên cần học kỳ (16 buổi)
  -- Phương án 1: Nới lỏng nhân văn cho thiếu nhi (châm chước 1 buổi không phép)
  IF v_total_attended = 0 THEN
    v_hanh_kiem := NULL;
  ELSIF (v_nghi_khong_phep = 0 AND v_nghi_phep <= 2) OR (v_nghi_khong_phep = 1 AND v_nghi_phep = 0) THEN
    v_hanh_kiem := 'Tốt';
  ELSIF v_nghi_khong_phep <= 2 AND v_tong_nghi <= 3 THEN
    v_hanh_kiem := 'Khá';
  ELSIF v_nghi_khong_phep <= 3 AND v_tong_nghi <= 5 THEN
    v_hanh_kiem := 'Trung Bình';
  ELSE
    v_hanh_kiem := 'Yếu';
  END IF;

  -- 3. Lấy lớp của học sinh
  SELECT lop INTO v_lop
  FROM public.enrollments
  WHERE username = v_username AND nam_hoc = v_nam_hoc
  LIMIT 1;

  IF v_lop IS NOT NULL THEN
    INSERT INTO public.term_summary (
      username, nam_hoc, lop, hoc_ky, hanh_kiem, updated_by
    ) VALUES (
      v_username, v_nam_hoc, v_lop, v_hoc_ky, v_hanh_kiem, CASE WHEN TG_OP <> 'DELETE' THEN NEW.updated_by ELSE NULL END
    )
    ON CONFLICT (username, nam_hoc, hoc_ky) DO UPDATE SET
      lop = EXCLUDED.lop,
      hanh_kiem = COALESCE(EXCLUDED.hanh_kiem, term_summary.hanh_kiem);
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;


-- BƯỚC 2: CẬP NHẬT HÀM ĐỒNG BỘ ĐIỂM & VỊ THỨ HỌC KỲ (TERM_SUMMARY) SANG RANK() KÈM TIÊU CHÍ PHỤ
CREATE OR REPLACE FUNCTION public.sync_grades_evaluation_to_term_summary()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_hoc_luc TEXT;
  v_lop TEXT;
BEGIN
  -- 1. Tự động xét Học lực theo Điểm Trung Bình
  IF NEW.diem_tb IS NULL THEN
    v_hoc_luc := NULL;
  ELSIF NEW.diem_tb >= 8.0 THEN
    v_hoc_luc := 'Giỏi';
  ELSIF NEW.diem_tb >= 6.5 THEN
    v_hoc_luc := 'Khá';
  ELSIF NEW.diem_tb >= 5.0 THEN
    v_hoc_luc := 'Trung Bình';
  ELSIF NEW.diem_tb >= 3.5 THEN
    v_hoc_luc := 'Yếu';
  ELSE
    v_hoc_luc := 'Kém';
  END IF;

  -- 2. Xác định tên lớp (ưu tiên từ NEW.lop hoặc enrollments)
  v_lop := COALESCE(NEW.lop, (
    SELECT lop FROM public.enrollments 
    WHERE username = NEW.username AND nam_hoc = NEW.nam_hoc
    LIMIT 1
  ));

  IF v_lop IS NOT NULL THEN
    -- 3. Upsert vào term_summary
    INSERT INTO public.term_summary (
      username, nam_hoc, lop, hoc_ky, hoc_luc, updated_by
    ) VALUES (
      NEW.username, NEW.nam_hoc, v_lop, NEW.hoc_ky, v_hoc_luc, NEW.updated_by
    )
    ON CONFLICT (username, nam_hoc, hoc_ky) DO UPDATE SET
      lop = EXCLUDED.lop,
      hoc_luc = COALESCE(EXCLUDED.hoc_luc, term_summary.hoc_luc);

    -- 4. Tự động tính toán lại vị thứ RANK() kèm Tiêu chí phụ Hạnh kiểm
    WITH ranked AS (
      SELECT 
        g.username,
        RANK() OVER (
          ORDER BY 
            g.diem_tb DESC NULLS LAST,
            CASE ts_sub.hanh_kiem 
              WHEN 'Tốt' THEN 4 
              WHEN 'Khá' THEN 3 
              WHEN 'Trung Bình' THEN 2 
              WHEN 'TB' THEN 2 
              WHEN 'Yếu' THEN 1 
              ELSE 0 
            END DESC
        ) as rank_val
      FROM public.grades g
      LEFT JOIN public.term_summary ts_sub 
        ON ts_sub.username = g.username 
       AND ts_sub.nam_hoc = g.nam_hoc 
       AND ts_sub.hoc_ky = g.hoc_ky
      WHERE g.nam_hoc = NEW.nam_hoc 
        AND g.hoc_ky = NEW.hoc_ky 
        AND g.lop = v_lop
        AND g.diem_tb IS NOT NULL
    )
    UPDATE public.term_summary ts
    SET vi_thu = ranked.rank_val
    FROM ranked
    WHERE ts.username = ranked.username
      AND ts.nam_hoc = NEW.nam_hoc
      AND ts.hoc_ky = NEW.hoc_ky;

    -- Đặt vi_thu = NULL cho những em chưa đủ điểm trong lớp
    UPDATE public.term_summary ts
    SET vi_thu = NULL
    WHERE ts.nam_hoc = NEW.nam_hoc
      AND ts.hoc_ky = NEW.hoc_ky
      AND ts.lop = v_lop
      AND NOT EXISTS (
        SELECT 1 FROM public.grades g
        WHERE g.username = ts.username 
          AND g.nam_hoc = ts.nam_hoc 
          AND g.hoc_ky = ts.hoc_ky 
          AND g.diem_tb IS NOT NULL
      );
  END IF;

  RETURN NEW;
END;
$$;


-- BƯỚC 3: CẬP NHẬT HÀM TỔNG KẾT CẢ NĂM (YEAR_SUMMARY) SANG TIÊU CHÍ MỚI
CREATE OR REPLACE FUNCTION public.compute_year_summary(p_student_username TEXT, p_nam_hoc TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_lop TEXT;
  v_tb1 NUMERIC;
  v_tb2 NUMERIC;
  v_diem_tb NUMERIC;
  v_hoc_luc TEXT;
  v_hanh_kiem TEXT;
  v_nghi_phep INT := 0;
  v_nghi_khong_phep INT := 0;
  v_tong_nghi INT := 0;
  v_total_attended INT := 0;
  v_hk2_hanh_kiem TEXT;
  v_hk1_hanh_kiem TEXT;
BEGIN
  IF p_student_username IS NULL OR p_nam_hoc IS NULL THEN
    RETURN;
  END IF;

  -- 1. Tìm lớp học của học sinh
  SELECT lop INTO v_lop
  FROM public.enrollments
  WHERE username = p_student_username AND nam_hoc = p_nam_hoc
  LIMIT 1;

  IF v_lop IS NULL THEN
    SELECT lop INTO v_lop
    FROM public.grades
    WHERE username = p_student_username AND nam_hoc = p_nam_hoc
    LIMIT 1;
  END IF;

  -- 2. Lấy ĐTB của Học kỳ 1 và Học kỳ 2 từ bảng grades
  SELECT diem_tb INTO v_tb1
  FROM public.grades
  WHERE username = p_student_username AND nam_hoc = p_nam_hoc AND hoc_ky = 1;

  SELECT diem_tb INTO v_tb2
  FROM public.grades
  WHERE username = p_student_username AND nam_hoc = p_nam_hoc AND hoc_ky = 2;

  -- 3. Tính ĐTB Cả Năm nếu cả 2 học kỳ đều đã có điểm
  IF v_tb1 IS NOT NULL AND v_tb2 IS NOT NULL THEN
    -- Công thức chuẩn Ban Giáo lý: (HK1 + HK2 * 2) / 3
    v_diem_tb := ROUND(((v_tb1 + v_tb2 * 2.0) / 3.0)::numeric, 1);

    -- Xét Học lực theo ĐTB Cả Năm
    IF v_diem_tb >= 8.0 THEN
      v_hoc_luc := 'Giỏi';
    ELSIF v_diem_tb >= 6.5 THEN
      v_hoc_luc := 'Khá';
    ELSIF v_diem_tb >= 5.0 THEN
      v_hoc_luc := 'Trung Bình';
    ELSIF v_diem_tb >= 3.5 THEN
      v_hoc_luc := 'Yếu';
    ELSE
      v_hoc_luc := 'Kém';
    END IF;
  ELSE
    v_diem_tb := NULL;
    v_hoc_luc := NULL;
  END IF;

  -- 4. Tính Hạnh kiểm Cả Năm dựa trên tổng số buổi vắng cả năm trong bảng attendance
  SELECT 
    COUNT(*),
    COUNT(*) FILTER (WHERE trang_thai = 'nghi_phep'),
    COUNT(*) FILTER (WHERE trang_thai = 'nghi_khong_phep')
  INTO 
    v_total_attended,
    v_nghi_phep,
    v_nghi_khong_phep
  FROM public.attendance
  WHERE username = p_student_username AND nam_hoc = p_nam_hoc;

  v_tong_nghi := v_nghi_phep + v_nghi_khong_phep;

  -- Lấy hạnh kiểm HK1 & HK2 để dự phòng
  SELECT hanh_kiem INTO v_hk1_hanh_kiem FROM public.term_summary WHERE username = p_student_username AND nam_hoc = p_nam_hoc AND hoc_ky = 1;
  SELECT hanh_kiem INTO v_hk2_hanh_kiem FROM public.term_summary WHERE username = p_student_username AND nam_hoc = p_nam_hoc AND hoc_ky = 2;

  IF v_total_attended > 0 THEN
    -- Phương án 1 (Cả năm 32 buổi): Châm chước 1 buổi không phép nếu tổng vắng <= 2
    IF (v_nghi_khong_phep = 0 AND v_nghi_phep <= 4) OR (v_nghi_khong_phep <= 1 AND v_tong_nghi <= 2) THEN
      v_hanh_kiem := 'Tốt';
    ELSIF v_nghi_khong_phep <= 3 AND v_tong_nghi <= 6 THEN
      v_hanh_kiem := 'Khá';
    ELSIF v_nghi_khong_phep <= 5 AND v_tong_nghi <= 10 THEN
      v_hanh_kiem := 'Trung Bình';
    ELSE
      v_hanh_kiem := 'Yếu';
    END IF;
  ELSE
    -- Dự phòng: nếu không có bản ghi điểm danh chi tiết, lấy theo hạnh kiểm HK2 (hoặc HK1)
    v_hanh_kiem := COALESCE(v_hk2_hanh_kiem, v_hk1_hanh_kiem);
  END IF;

  -- 5. Upsert vào bảng year_summary nếu có ít nhất 1 dữ kiện (lớp hoặc điểm hoặc hạnh kiểm)
  IF v_lop IS NOT NULL OR v_diem_tb IS NOT NULL OR v_hanh_kiem IS NOT NULL THEN
    INSERT INTO public.year_summary (
      username, nam_hoc, lop, diem_tb, hoc_luc, hanh_kiem
    ) VALUES (
      p_student_username, p_nam_hoc, v_lop, v_diem_tb, v_hoc_luc, v_hanh_kiem
    )
    ON CONFLICT (username, nam_hoc) DO UPDATE SET
      lop = COALESCE(EXCLUDED.lop, year_summary.lop),
      diem_tb = EXCLUDED.diem_tb,
      hoc_luc = EXCLUDED.hoc_luc,
      hanh_kiem = COALESCE(EXCLUDED.hanh_kiem, year_summary.hanh_kiem);

    -- 6. Tính toán lại vị thứ chuẩn học đường RANK() (Kèm Tiêu chí phụ Hạnh kiểm)
    IF v_lop IS NOT NULL THEN
      WITH ranked AS (
        SELECT 
          ys_inner.username,
          RANK() OVER (
            ORDER BY 
              ys_inner.diem_tb DESC NULLS LAST,
              CASE ys_inner.hanh_kiem 
                WHEN 'Tốt' THEN 4 
                WHEN 'Khá' THEN 3 
                WHEN 'Trung Bình' THEN 2 
                WHEN 'TB' THEN 2 
                WHEN 'Yếu' THEN 1 
                ELSE 0 
              END DESC
          ) as rank_val
        FROM public.year_summary ys_inner
        WHERE ys_inner.nam_hoc = p_nam_hoc 
          AND ys_inner.lop = v_lop
          AND ys_inner.diem_tb IS NOT NULL
      )
      UPDATE public.year_summary ys
      SET vi_thu = ranked.rank_val
      FROM ranked
      WHERE ys.username = ranked.username
        AND ys.nam_hoc = p_nam_hoc;

      -- Đặt vi_thu = NULL cho những em chưa có điểm cả năm
      UPDATE public.year_summary ys
      SET vi_thu = NULL
      WHERE ys.nam_hoc = p_nam_hoc
        AND ys.lop = v_lop
        AND ys.diem_tb IS NULL;
    END IF;
  END IF;
END;
$$;


-- BƯỚC 4: TÍNH TOÁN LẠI HẠNH KIỂM & VỊ THỨ CHO TOÀN BỘ CƠ SỞ DỮ LIỆU HIỆN CÓ
-- 4A. Cập nhật lại Hạnh kiểm trong term_summary theo quy tắc mới từ bảng attendance
WITH att_calc AS (
  SELECT 
    username,
    nam_hoc,
    hoc_ky,
    COUNT(*) as total_att,
    COUNT(*) FILTER (WHERE trang_thai = 'nghi_phep') as phep,
    COUNT(*) FILTER (WHERE trang_thai = 'nghi_khong_phep') as k_phep
  FROM public.attendance
  GROUP BY username, nam_hoc, hoc_ky
)
UPDATE public.term_summary ts
SET hanh_kiem = CASE 
  WHEN (att.k_phep = 0 AND att.phep <= 2) OR (att.k_phep = 1 AND att.phep = 0) THEN 'Tốt'
  WHEN att.k_phep <= 2 AND (att.k_phep + att.phep) <= 3 THEN 'Khá'
  WHEN att.k_phep <= 3 AND (att.k_phep + att.phep) <= 5 THEN 'Trung Bình'
  ELSE 'Yếu'
END
FROM att_calc att
WHERE ts.username = att.username 
  AND ts.nam_hoc = att.nam_hoc 
  AND ts.hoc_ky = att.hoc_ky;

-- 4B. Cập nhật vị thứ theo RANK() kèm Tiêu chí phụ Hạnh kiểm cho term_summary (HK1 & HK2)
WITH ranked_ts AS (
  SELECT 
    g.username,
    g.nam_hoc,
    g.hoc_ky,
    RANK() OVER (
      PARTITION BY g.nam_hoc, g.hoc_ky, g.lop 
      ORDER BY 
        g.diem_tb DESC NULLS LAST,
        CASE ts_sub.hanh_kiem 
          WHEN 'Tốt' THEN 4 
          WHEN 'Khá' THEN 3 
          WHEN 'Trung Bình' THEN 2 
          WHEN 'TB' THEN 2 
          WHEN 'Yếu' THEN 1 
          ELSE 0 
        END DESC
    ) as rank_val
  FROM public.grades g
  LEFT JOIN public.term_summary ts_sub 
    ON ts_sub.username = g.username 
   AND ts_sub.nam_hoc = g.nam_hoc 
   AND ts_sub.hoc_ky = g.hoc_ky
  WHERE g.diem_tb IS NOT NULL AND g.lop IS NOT NULL
)
UPDATE public.term_summary ts
SET vi_thu = ranked_ts.rank_val
FROM ranked_ts
WHERE ts.username = ranked_ts.username
  AND ts.nam_hoc = ranked_ts.nam_hoc
  AND ts.hoc_ky = ranked_ts.hoc_ky;

-- 4C. Cập nhật lại Hạnh kiểm Cả năm trong year_summary theo quy tắc mới từ bảng attendance
WITH att_year AS (
  SELECT 
    username,
    nam_hoc,
    COUNT(*) as total_att,
    COUNT(*) FILTER (WHERE trang_thai = 'nghi_phep') as phep,
    COUNT(*) FILTER (WHERE trang_thai = 'nghi_khong_phep') as k_phep
  FROM public.attendance
  GROUP BY username, nam_hoc
)
UPDATE public.year_summary ys
SET hanh_kiem = CASE 
  WHEN (att.k_phep = 0 AND att.phep <= 4) OR (att.k_phep <= 1 AND (att.k_phep + att.phep) <= 2) THEN 'Tốt'
  WHEN att.k_phep <= 3 AND (att.k_phep + att.phep) <= 6 THEN 'Khá'
  WHEN att.k_phep <= 5 AND (att.k_phep + att.phep) <= 10 THEN 'Trung Bình'
  ELSE 'Yếu'
END
FROM att_year att
WHERE ys.username = att.username 
  AND ys.nam_hoc = att.nam_hoc;

-- 4D. Cập nhật vị thứ theo RANK() kèm Tiêu chí phụ Hạnh kiểm cho year_summary (Cả năm)
WITH ranked_ys AS (
  SELECT 
    ys.username,
    ys.nam_hoc,
    RANK() OVER (
      PARTITION BY ys.nam_hoc, ys.lop 
      ORDER BY 
        ys.diem_tb DESC NULLS LAST,
        CASE ys.hanh_kiem 
          WHEN 'Tốt' THEN 4 
          WHEN 'Khá' THEN 3 
          WHEN 'Trung Bình' THEN 2 
          WHEN 'TB' THEN 2 
          WHEN 'Yếu' THEN 1 
          ELSE 0 
        END DESC
    ) as rank_val
  FROM public.year_summary ys
  WHERE ys.diem_tb IS NOT NULL AND ys.lop IS NOT NULL
)
UPDATE public.year_summary ys
SET vi_thu = ranked_ys.rank_val
FROM ranked_ys
WHERE ys.username = ranked_ys.username
  AND ys.nam_hoc = ranked_ys.nam_hoc;
