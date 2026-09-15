import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("💥 Lỗi: Không tìm thấy VITE_SUPABASE_URL hoặc VITE_SUPABASE_SERVICE_ROLE_KEY trong file .env!");
  process.exit(1);
}

console.log(`📡 Đang kết nối tới Supabase: ${SUPABASE_URL}`);
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const dataPath = path.resolve(__dirname, 'exported_quizzes.json');
if (!fs.existsSync(dataPath)) {
  console.error(`💥 Không tìm thấy file dữ liệu: ${dataPath}`);
  process.exit(1);
}

const exportedQuizzes = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));

const QUIZ_CONFIGS = [
  {
    id: "on-tap-15-phut-hk1",
    slug: "ôn-tập-15-phút-học-kỳ-1",
    title: "Ôn Tập 15 Phút — Học Kỳ 1",
    khoi: "phung-vu",
    time: 900,
    mcq_count: 10,
    mcq_point: 5.0,
    essay_count: 2,
    essay_point: 5.0,
  },
  {
    id: "on-tap-1-tiet-hk1",
    slug: "ôn-tập-1-tiết-học-kỳ-1",
    title: "Ôn Tập 1 Tiết — Học Kỳ 1",
    khoi: "phung-vu",
    time: 2700,
    mcq_count: 20,
    mcq_point: 5.0,
    essay_count: 3,
    essay_point: 5.0,
  },
  {
    id: "on-tap-cuoi-hk1",
    slug: "ôn-tập-cuối-học-kỳ-1",
    title: "Ôn Tập Cuối Học Kỳ 1",
    khoi: "phung-vu",
    time: 2700,
    mcq_count: 20,
    mcq_point: 5.0,
    essay_count: 3,
    essay_point: 5.0,
  },
  {
    id: "on-tap-15-phut-hk2",
    slug: "ôn-tập-15-phút-học-kỳ-2",
    title: "Ôn Tập 15 Phút — Học Kỳ 2",
    khoi: "phung-vu",
    time: 900,
    mcq_count: 10,
    mcq_point: 5.0,
    essay_count: 2,
    essay_point: 5.0,
  },
  {
    id: "on-tap-1-tiet-hk2",
    slug: "ôn-tập-1-tiết-học-kỳ-2",
    title: "Ôn Tập 1 Tiết — Học Kỳ 2",
    khoi: "phung-vu",
    time: 2700,
    mcq_count: 20,
    mcq_point: 5.0,
    essay_count: 3,
    essay_point: 5.0,
  },
  {
    id: "on-tap-cuoi-hk2",
    slug: "ôn-tập-cuối-học-kỳ-2",
    title: "Ôn Tập Cuối Học Kỳ 2",
    khoi: "phung-vu",
    time: 2700,
    mcq_count: 20,
    mcq_point: 5.0,
    essay_count: 3,
    essay_point: 5.0,
  },
  {
    id: "do-vui-giao-ly",
    slug: "đố-vui-giáo-lý",
    title: "ĐỐ VUI GIÁO LÝ",
    khoi: "all",
    time: 2700,
    mcq_count: 20,
    mcq_point: 5.0,
    essay_count: 0,
    essay_point: 0,
  },
];

async function migrate() {
  console.log(`\n🚀 Bắt đầu di chuyển ${QUIZ_CONFIGS.length} bộ đề vào bảng "quizzes"...`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < QUIZ_CONFIGS.length; i++) {
    const cfg = QUIZ_CONFIGS[i];
    const quizData = exportedQuizzes[cfg.slug];

    if (!quizData) {
      console.error(`❌ [${i + 1}/${QUIZ_CONFIGS.length}] Không tìm thấy dữ liệu cho slug "${cfg.slug}"`);
      failCount++;
      continue;
    }

    const mcqLength = Array.isArray(quizData) ? quizData.length : (quizData.mcq ? quizData.mcq.length : 0);
    const essayLength = Array.isArray(quizData) ? 0 : (quizData.essay ? quizData.essay.length : 0);

    const payload = {
      id: cfg.id,
      slug: cfg.slug,
      title: cfg.title,
      khoi: cfg.khoi,
      time: cfg.time,
      mcq_count: cfg.mcq_count,
      mcq_point: cfg.mcq_point,
      essay_count: cfg.essay_count,
      essay_point: cfg.essay_point,
      data: quizData,
      is_active: true,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('quizzes')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.error(`❌ [${i + 1}/${QUIZ_CONFIGS.length}] Thất bại "${cfg.slug}":`, error.message);
      failCount++;
    } else {
      console.log(`✅ [${i + 1}/${QUIZ_CONFIGS.length}] Đã nạp "${cfg.slug}" (MCQ: ${mcqLength}, Essay: ${essayLength})`);
      successCount++;
    }
  }

  console.log(`\n🎉 KẾT QUẢ DI CHUYỂN:`);
  console.log(`- Thành công: ${successCount}/${QUIZ_CONFIGS.length}`);
  console.log(`- Thất bại:   ${failCount}/${QUIZ_CONFIGS.length}`);

  if (failCount > 0) {
    console.log(`\n⚠️ LƯU Ý: Nếu lỗi do bảng "quizzes" chưa tồn tại, hãy chạy nội dung file "Schema/quizzes.sql" trên Supabase SQL Editor rồi chạy lại script này.`);
  }
}

migrate();
