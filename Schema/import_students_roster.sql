-- ============================================================
--  MIGRATION: HỖ TRỢ IMPORT DANH SÁCH HỌC SINH TỪ FILE EXCEL
--  Tự động thêm vào users, enrollments và tạo tài khoản Auth
--  Mật khẩu mặc định: 'bangiaoly'
-- ============================================================

CREATE OR REPLACE FUNCTION public.admin_import_class_roster(
  p_lop      TEXT,
  p_nam_hoc  TEXT,
  p_students JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions
AS $$
DECLARE
  v_item          JSONB;
  v_username      TEXT;
  v_ho_ten        TEXT;
  v_ten_thanh     TEXT;
  v_ngay_sinh     DATE;
  v_ngay_rua_toi  DATE;
  v_ngay_ruoc_le  DATE;
  v_ngay_them_suc DATE;
  v_role          TEXT;
  v_gioi_tinh     TEXT;
  v_ten_cha       TEXT;
  v_ten_me        TEXT;
  v_sdt           TEXT;
  v_giao_xom      TEXT;
  v_avatar        TEXT;
  v_fake_email    TEXT;
  v_auth_id       UUID;
  v_hashed_pw     TEXT;
  v_is_new        BOOLEAN;
  v_total         INT := 0;
  v_new_users     INT := 0;
  v_updated_users INT := 0;
  v_enrolled      INT := 0;
BEGIN
  -- 1. Kiểm tra quyền Admin
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Chỉ quản trị viên mới có quyền import danh sách học sinh';
  END IF;

  IF p_lop IS NULL OR trim(p_lop) = '' THEN
    RAISE EXCEPTION 'Tên lớp học không được để trống';
  END IF;

  IF p_nam_hoc IS NULL OR trim(p_nam_hoc) = '' THEN
    RAISE EXCEPTION 'Năm học không được để trống';
  END IF;

  IF p_students IS NULL OR jsonb_array_length(p_students) = 0 THEN
    RETURN jsonb_build_object(
      'success', true,
      'total', 0,
      'newUsers', 0,
      'updatedUsers', 0,
      'enrolled', 0,
      'message', 'Không có học sinh nào trong danh sách'
    );
  END IF;

  -- 2. Mã hóa mật khẩu mặc định 'bangiaoly' bằng Blowfish bcrypt
  v_hashed_pw := extensions.crypt('bangiaoly', extensions.gen_salt('bf', 10));

  -- 3. Duyệt qua từng học sinh trong mảng JSONB
  FOR v_item IN SELECT * FROM jsonb_array_elements(p_students)
  LOOP
    v_total := v_total + 1;

    v_username := trim(v_item->>'username');
    v_ho_ten   := trim(v_item->>'ho_va_ten');

    -- Bỏ qua dòng thiếu họ tên hoặc username
    IF v_ho_ten IS NULL OR v_ho_ten = '' OR v_username IS NULL OR v_username = '' THEN
      CONTINUE;
    END IF;

    v_ten_thanh := NULLIF(trim(v_item->>'ten_thanh'), '');
    v_ten_cha   := NULLIF(trim(v_item->>'ten_cha'), '');
    v_ten_me    := NULLIF(trim(v_item->>'ten_me'), '');
    v_sdt       := NULLIF(trim(v_item->>'sdt'), '');
    v_giao_xom  := NULLIF(trim(v_item->>'giao_xom'), '');
    
    -- Xử lý ngày sinh
    BEGIN
      IF v_item->>'ngay_sinh' IS NOT NULL AND trim(v_item->>'ngay_sinh') <> '' THEN
        v_ngay_sinh := (v_item->>'ngay_sinh')::DATE;
      ELSE
        v_ngay_sinh := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_ngay_sinh := NULL;
    END;

    -- Xử lý ngày rửa tội
    BEGIN
      IF v_item->>'ngay_rua_toi' IS NOT NULL AND trim(v_item->>'ngay_rua_toi') <> '' THEN
        v_ngay_rua_toi := (v_item->>'ngay_rua_toi')::DATE;
      ELSE
        v_ngay_rua_toi := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_ngay_rua_toi := NULL;
    END;

    -- Xử lý ngày rước lễ lần đầu
    BEGIN
      IF v_item->>'ngay_ruoc_le' IS NOT NULL AND trim(v_item->>'ngay_ruoc_le') <> '' THEN
        v_ngay_ruoc_le := (v_item->>'ngay_ruoc_le')::DATE;
      ELSE
        v_ngay_ruoc_le := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_ngay_ruoc_le := NULL;
    END;

    -- Xử lý ngày thêm sức
    BEGIN
      IF v_item->>'ngay_them_suc' IS NOT NULL AND trim(v_item->>'ngay_them_suc') <> '' THEN
        v_ngay_them_suc := (v_item->>'ngay_them_suc')::DATE;
      ELSE
        v_ngay_them_suc := NULL;
      END IF;
    EXCEPTION WHEN OTHERS THEN
      v_ngay_them_suc := NULL;
    END;

    -- Xử lý vai trò (role): Mặc định tự động gán 'student'
    v_role := trim(COALESCE(v_item->>'role', 'student'));
    IF v_role NOT IN ('student', 'user', 'teacher', 'admin') THEN
      v_role := 'student';
    END IF;

    -- Xử lý giới tính
    v_gioi_tinh := trim(v_item->>'gioi_tinh');
    IF v_gioi_tinh NOT IN ('Nam', 'Nữ') THEN
      v_gioi_tinh := NULL;
    END IF;

    -- Thiết lập avatar mặc định theo giới tính
    v_avatar := CASE
      WHEN v_gioi_tinh = 'Nam' THEN '/images/avatarBoy.avif'
      WHEN v_gioi_tinh = 'Nữ'  THEN '/images/avatarGirl.avif'
      ELSE '/images/avatarDefault.avif'
    END;

    -- Email quy chuẩn dùng đăng nhập: username@giaoly.local
    v_fake_email := lower(v_username) || '@giaoly.local';

    -- 4. Kiểm tra hoặc tạo tài khoản Auth trong auth.users
    SELECT id INTO v_auth_id FROM auth.users WHERE email = v_fake_email LIMIT 1;

    IF v_auth_id IS NULL THEN
      v_auth_id := extensions.gen_random_uuid();

      INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token,
        phone_change,
        phone_change_token,
        email_change_token_current,
        reauthentication_token,
        is_sso_user,
        is_anonymous
      ) VALUES (
        '00000000-0000-0000-0000-000000000000'::uuid,
        v_auth_id,
        'authenticated',
        'authenticated',
        v_fake_email,
        v_hashed_pw,
        NOW(),
        '{"provider":"email","providers":["email"]}'::jsonb,
        jsonb_build_object('username', v_username, 'full_name', v_ho_ten),
        NOW(),
        NOW(),
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        false,
        false
      );
    ELSE
      -- Đã có tài khoản auth: Đảm bảo cập nhật mật khẩu mặc định, xác nhận email và chuẩn hóa token rỗng (tránh Scan NULL của Go)
      UPDATE auth.users
      SET
        encrypted_password         = v_hashed_pw,
        email_confirmed_at         = COALESCE(email_confirmed_at, NOW()),
        raw_app_meta_data          = '{"provider":"email","providers":["email"]}'::jsonb,
        raw_user_meta_data         = jsonb_build_object('username', v_username, 'full_name', v_ho_ten),
        updated_at                 = NOW(),
        confirmation_token         = COALESCE(confirmation_token, ''),
        email_change               = COALESCE(email_change, ''),
        email_change_token_new     = COALESCE(email_change_token_new, ''),
        recovery_token             = COALESCE(recovery_token, ''),
        phone_change               = COALESCE(phone_change, ''),
        phone_change_token         = COALESCE(phone_change_token, ''),
        email_change_token_current = COALESCE(email_change_token_current, ''),
        reauthentication_token     = COALESCE(reauthentication_token, ''),
        is_sso_user                = COALESCE(is_sso_user, false),
        is_anonymous               = COALESCE(is_anonymous, false)
      WHERE id = v_auth_id;
    END IF;

    -- Xóa identity cũ nếu có để tránh sai provider_id
    DELETE FROM auth.identities WHERE user_id = v_auth_id AND provider = 'email';

    -- Tạo identity chuẩn quy cách GoTrue (provider_id = user_id::text)
    INSERT INTO auth.identities (
      id,
      user_id,
      provider_id,
      identity_data,
      provider,
      last_sign_in_at,
      created_at,
      updated_at
    ) VALUES (
      v_auth_id,
      v_auth_id,
      v_auth_id::text,
      jsonb_build_object('sub', v_auth_id::text, 'email', v_fake_email, 'email_verified', true),
      'email',
      NOW(),
      NOW(),
      NOW()
    );

    -- 5. Thêm hoặc Cập nhật vào bảng public.users
    INSERT INTO public.users (
      username,
      auth_id,
      ten_thanh,
      ho_va_ten,
      ngay_sinh,
      ngay_rua_toi,
      ngay_ruoc_le,
      ngay_them_suc,
      ten_cha,
      ten_me,
      sdt,
      giao_xom,
      gioi_tinh,
      avatar,
      role,
      trang_thai
    ) VALUES (
      v_username,
      v_auth_id,
      v_ten_thanh,
      v_ho_ten,
      v_ngay_sinh,
      v_ngay_rua_toi,
      v_ngay_ruoc_le,
      v_ngay_them_suc,
      v_ten_cha,
      v_ten_me,
      v_sdt,
      v_giao_xom,
      v_gioi_tinh,
      v_avatar,
      v_role,
      'Đang học'
    )
    ON CONFLICT (username) DO UPDATE
    SET
      auth_id       = COALESCE(EXCLUDED.auth_id, public.users.auth_id),
      ten_thanh     = COALESCE(EXCLUDED.ten_thanh, public.users.ten_thanh),
      ho_va_ten     = EXCLUDED.ho_va_ten,
      ngay_sinh     = COALESCE(EXCLUDED.ngay_sinh, public.users.ngay_sinh),
      ngay_rua_toi  = COALESCE(EXCLUDED.ngay_rua_toi, public.users.ngay_rua_toi),
      ngay_ruoc_le  = COALESCE(EXCLUDED.ngay_ruoc_le, public.users.ngay_ruoc_le),
      ngay_them_suc = COALESCE(EXCLUDED.ngay_them_suc, public.users.ngay_them_suc),
      ten_cha       = COALESCE(EXCLUDED.ten_cha, public.users.ten_cha),
      ten_me        = COALESCE(EXCLUDED.ten_me, public.users.ten_me),
      sdt           = COALESCE(EXCLUDED.sdt, public.users.sdt),
      giao_xom      = COALESCE(EXCLUDED.giao_xom, public.users.giao_xom),
      gioi_tinh     = COALESCE(EXCLUDED.gioi_tinh, public.users.gioi_tinh)
    RETURNING (xmax = 0) INTO v_is_new; -- xmax = 0 nghĩa là insert mới

    IF v_is_new THEN
      v_new_users := v_new_users + 1;
    ELSE
      v_updated_users := v_updated_users + 1;
    END IF;

    -- 6. Ghi danh vào bảng public.enrollments
    INSERT INTO public.enrollments (username, nam_hoc, lop)
    VALUES (v_username, p_nam_hoc, p_lop)
    ON CONFLICT (username, nam_hoc) DO UPDATE
    SET lop = EXCLUDED.lop;

    v_enrolled := v_enrolled + 1;
  END LOOP;

  RETURN jsonb_build_object(
    'success', true,
    'total', v_total,
    'newUsers', v_new_users,
    'updatedUsers', v_updated_users,
    'enrolled', v_enrolled,
    'lop', p_lop,
    'namHoc', p_nam_hoc
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.admin_import_class_roster(TEXT, TEXT, JSONB) TO authenticated;
