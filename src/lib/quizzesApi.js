// src/lib/quizzesApi.js
// Tầng kết nối dữ liệu bộ đề thi & ôn luyện từ Supabase
// Ban Giáo Lý & Huynh Trưởng — Giáo xứ An Ngãi

import { supabase } from "./supabase.js";
import {
  Clock, Zap, Sparkles, Flame, Heart, Church, BookOpen, Globe, GraduationCap
} from "lucide-react";

/**
 * Bản đồ icon đại diện theo khối
 */
const KHOI_ICON_MAP = {
  "chien-con":  Heart,
  "ruoc-le":    Sparkles,
  "them-suc":   Flame,
  "phung-vu":   Church,
  "kinh-thanh": BookOpen,
  "vao-doi":    Globe,
  "all":        GraduationCap,
};

/**
 * Bản đồ tên nhãn hiển thị theo khối
 */
const KHOI_LABEL_MAP = {
  "chien-con":  "Khối Chiên Con",
  "ruoc-le":    "Khối Rước Lễ",
  "them-suc":   "Khối Thêm Sức",
  "phung-vu":   "Khối Phụng Vụ",
  "kinh-thanh": "Khối Kinh Thánh",
  "vao-doi":    "Khối Vào Đời",
  "all":        "Toàn đoàn",
};

/**
 * Nhận diện học kỳ (Học kỳ 1 / Học kỳ 2) từ slug, id hoặc title
 * @param {Object} row - Bản ghi quiz từ DB
 * @returns {{ id: string, label: string, short: string }|null}
 */
export function detectSemester(row) {
  if (!row) return null;
  const text = `${row.slug || ""} ${row.id || ""} ${row.title || ""}`.toLowerCase();

  // BẮT BUỘC kiểm tra Học kỳ 2 TRƯỚC Học kỳ 1 vì chuỗi "học kỳ ii" chứa "học kỳ i"
  if (
    text.includes("học kỳ 2") ||
    text.includes("học-kỳ-2") ||
    text.includes("hoc-ky-2") ||
    text.includes("học kỳ ii") ||
    text.includes("hoc-ky-ii") ||
    text.includes("hk2") ||
    text.includes("hk 2")
  ) {
    return { id: "hk2", label: "Học Kỳ II", short: "HK2" };
  }

  if (
    text.includes("học kỳ 1") ||
    text.includes("học-kỳ-1") ||
    text.includes("hoc-ky-1") ||
    text.includes("học kỳ i") ||
    text.includes("hoc-ky-i") ||
    text.includes("hk1") ||
    text.includes("hk 1")
  ) {
    return { id: "hk1", label: "Học Kỳ I", short: "HK1" };
  }

  return null;
}

/**
 * Phân loại định dạng kiểm tra (15 Phút, 1 Tiết, Học Kỳ, Đố Vui)
 * @param {Object} row - Bản ghi quiz từ DB
 * @returns {string} Loại hình kiểm tra
 */
export function detectExamType(row) {
  if (!row) return "Ôn tập";
  const text = `${row.slug || ""} ${row.id || ""} ${row.title || ""}`.toLowerCase();

  if (text.includes("đố vui") || text.includes("do-vui") || text.includes("đố-vui")) {
    return "Đố Vui";
  }
  if (text.includes("15 phút") || text.includes("15-phut") || text.includes("15-phút") || text.includes("15p")) {
    return "15 Phút";
  }
  if (text.includes("1 tiết") || text.includes("1-tiet") || text.includes("1-tiết")) {
    return "1 Tiết";
  }
  if (
    text.includes("cuối") ||
    text.includes("cuoi") ||
    text.includes("học kỳ i") ||
    text.includes("học kỳ ii") ||
    text.includes("học kỳ 1") ||
    text.includes("học kỳ 2")
  ) {
    return "Học Kỳ";
  }
  if (row.time && row.time <= 900) {
    return "15 Phút";
  }
  if (row.time && row.time <= 2700) {
    return "1 Tiết";
  }
  return "Ôn tập";
}

/**
 * Phân tích và sinh nhãn Khối / Lớp chi tiết (ví dụ: "Khối Rước Lễ 1", "Khối Thêm Sức 2")
 * @param {Object} row - Bản ghi quiz từ DB
 * @returns {string} Nhãn hiển thị chi tiết
 */
export function inferDetailedKhoiLabel(row) {
  if (!row) return "Toàn đoàn";
  const khoiKey = row.khoi || "all";
  const baseLabel = KHOI_LABEL_MAP[khoiKey] || (row.khoi ? `Khối ${row.khoi}` : "Toàn đoàn");

  const text = `${row.slug || ""} ${row.id || ""} ${row.title || ""}`.toLowerCase();

  if (khoiKey === "ruoc-le") {
    if (text.includes("rước lễ 2") || text.includes("ruoc-le-2") || text.includes("rl2") || text.includes("rước-lễ-2")) {
      return "Khối Rước Lễ 2";
    }
    if (text.includes("rước lễ 1") || text.includes("ruoc-le-1") || text.includes("rl1") || text.includes("rước-lễ-1")) {
      return "Khối Rước Lễ 1";
    }
  }

  if (khoiKey === "them-suc") {
    if (text.includes("thêm sức 2") || text.includes("them-suc-2") || text.includes("ts2") || text.includes("thêm-sức-2")) {
      return "Khối Thêm Sức 2";
    }
    if (text.includes("thêm sức 1") || text.includes("them-suc-1") || text.includes("ts1") || text.includes("thêm-sức-1")) {
      return "Khối Thêm Sức 1";
    }
  }

  if (khoiKey === "kinh-thanh") {
    if (text.includes("kinh thánh 2") || text.includes("kinh-thanh-2") || text.includes("kt2") || text.includes("kinh-thánh-2")) {
      return "Khối Kinh Thánh 2";
    }
    if (text.includes("kinh thánh 1") || text.includes("kinh-thanh-1") || text.includes("kt1") || text.includes("kinh-thánh-1")) {
      return "Khối Kinh Thánh 1";
    }
  }

  if (khoiKey === "vao-doi") {
    if (text.includes("vào đời 2") || text.includes("vao-doi-2") || text.includes("vd2") || text.includes("vào-đời-2")) {
      return "Khối Vào Đời 2";
    }
    if (text.includes("vào đời 1") || text.includes("vao-doi-1") || text.includes("vd1") || text.includes("vào-đời-1")) {
      return "Khối Vào Đời 1";
    }
  }

  return baseLabel;
}

/**
 * Chuẩn hóa tiêu đề đề thi:
 * - Chuyển chữ hoa thô thành Title Case trang trọng
 * - Tiêu chuẩn hóa: "Ôn Tập 15 Phút — Học Kỳ I", "Ôn Tập 1 Tiết — Học Kỳ I", "Ôn Tập Cuối Học Kỳ I"
 * @param {Object} row - Bản ghi thô
 * @param {Object|null} semester - Thông tin học kỳ
 * @returns {string} Tiêu đề hiển thị chuẩn hóa
 */
export function formatQuizTitle(row, semester) {
  let title = (row?.title || "").trim();
  if (!title) return "Bộ đề ôn tập";

  // Nếu toàn bộ chữ hoa (như "ÔN TẬP 15 PHÚT"), chuẩn hóa về dạng Title Case
  if (title === title.toUpperCase() && title.length > 5) {
    title = title
      .toLowerCase()
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  // Chuẩn hóa số La Mã I / II trang trọng theo đúng quy ước sư phạm giáo xứ
  title = title.replace(/Học Kỳ 1\b/gi, "Học Kỳ I").replace(/Học Kỳ 2\b/gi, "Học Kỳ II");

  if (title.toLowerCase() === "ôn tập học kỳ i") {
    title = "Ôn Tập Cuối Học Kỳ I";
  } else if (title.toLowerCase() === "ôn tập học kỳ ii") {
    title = "Ôn Tập Cuối Học Kỳ II";
  }

  // Nếu tiêu đề bị dài do kèm tên lớp -> Tinh gọn về chuẩn "Ôn Tập [Loại] — Học Kỳ I/II"
  if (title.includes("—") && (title.includes("Rước Lễ") || title.includes("Thêm Sức") || title.includes("Kinh Thánh") || title.includes("Vào Đời"))) {
    const examType = detectExamType(row);
    const semRoman = semester?.id === "hk2" ? "Học Kỳ II" : "Học Kỳ I";
    if (examType === "15 Phút") {
      title = `Ôn Tập 15 Phút — ${semRoman}`;
    } else if (examType === "1 Tiết") {
      title = `Ôn Tập 1 Tiết — ${semRoman}`;
    } else if (examType === "Học Kỳ") {
      title = `Ôn Tập Cuối ${semRoman}`;
    }
  }

  const titleLower = title.toLowerCase();
  // Nếu tiêu đề bị thiếu thông tin học kỳ mà slug/id có, tự động nối thêm để phân biệt rõ rệt
  if (semester && !titleLower.includes("học kỳ") && !titleLower.includes("hk")) {
    const semRoman = semester.id === "hk2" ? "Học Kỳ II" : "Học Kỳ I";
    title = `${title} — ${semRoman}`;
  }

  return title;
}

/**
 * Phân tích và sinh nhãn thẻ (badge) có phân biệt rõ ràng học kỳ và hình thức
 * @param {Object} row - Bản ghi quiz từ DB
 * @param {Object|null} semester - Kết quả từ detectSemester
 * @param {string} examType - Kết quả từ detectExamType
 * @returns {string} Nhãn hiển thị trên góc thẻ (ví dụ: "15 Phút • HK1", "Cuối HK2")
 */
export function inferQuizBadge(row, semester, examType) {
  if (examType === "Đố Vui") return "Đố Vui";
  if (semester) {
    if (examType === "Học Kỳ") {
      return `Cuối ${semester.short}`;
    }
    return `${examType} • ${semester.short}`;
  }
  if (examType === "Học Kỳ") return "Cuối Kỳ";
  return examType;
}

/**
 * Chuyển đổi một bản ghi thô từ bảng quizzes Supabase sang cấu trúc dữ liệu hiển thị thẻ
 * @param {Object} row - Dữ liệu thô từ bảng quizzes
 * @returns {Object} Dữ liệu đã chuẩn hóa cho giao diện
 */
export function mapDatabaseRecordToQuiz(row) {
  if (!row) return null;

  const khoiKey = row.khoi || "all";
  const icon = KHOI_ICON_MAP[khoiKey] || GraduationCap;
  const khoiLabel = inferDetailedKhoiLabel(row);

  // Thời gian làm bài (tính theo giây trong DB, chuyển sang phút)
  const timeSeconds = Number(row.time) || 0;
  const timeMinutes = Math.round(timeSeconds / 60);

  let timeText = "Tự do";
  let durationBadge = "∞";
  let durationClass = "tl-time-stat-free";
  let durationIcon = Sparkles;

  if (timeSeconds > 0) {
    timeText = `${timeMinutes} phút`;
    durationBadge = `${timeMinutes}'`;
    if (timeMinutes <= 15) {
      durationClass = "tl-time-stat-15";
      durationIcon = Zap;
    } else {
      durationClass = "tl-time-stat-45";
      durationIcon = Clock;
    }
  }

  // Kiểm tra bộ đề đã có dữ liệu câu hỏi trong database hay chưa
  const hasQuestions = Boolean(
    row.data && (
      (Array.isArray(row.data.mcq) && row.data.mcq.length > 0) ||
      (Array.isArray(row.data.essay) && row.data.essay.length > 0) ||
      (Array.isArray(row.data) && row.data.length > 0)
    )
  );

  // Số lượng câu hỏi trắc nghiệm & tự luận
  const mcqCount = Number(row.mcq_count) || 0;
  const essayCount = Number(row.essay_count) || 0;
  let questionsText = "Đang cập nhật câu hỏi";

  if (hasQuestions) {
    if (mcqCount > 0 && essayCount > 0) {
      questionsText = `${mcqCount} TN + ${essayCount} TL`;
    } else if (mcqCount > 0) {
      questionsText = `${mcqCount} trắc nghiệm`;
    } else if (essayCount > 0) {
      questionsText = `${essayCount} tự luận`;
    } else {
      questionsText = "Đa dạng câu hỏi";
    }
  } else {
    // Nếu chưa có câu hỏi chính thức trong data, thông báo trạng thái đang soạn
    if (mcqCount > 0 && essayCount > 0) {
      questionsText = `${mcqCount} TN + ${essayCount} TL (Đang soạn)`;
    } else if (mcqCount > 0) {
      questionsText = `${mcqCount} câu TN (Đang soạn)`;
    } else {
      questionsText = "Đang cập nhật câu hỏi";
    }
  }

  const semester = detectSemester(row);
  const examType = detectExamType(row);
  const formattedTitle = formatQuizTitle(row, semester);
  const badge = inferQuizBadge(row, semester, examType);
  const badgeClass = `tl-badge-${khoiKey}`;

  // Đường dẫn làm bài: khớp với route /:khoi/:type trong App.jsx
  const targetKhoi = row.khoi && row.khoi !== "all" ? row.khoi : "giao-ly";
  const path = `/${targetKhoi}/${row.slug || row.id}`;

  return {
    id: row.id,
    slug: row.slug,
    title: formattedTitle,
    rawTitle: row.title,
    khoi: khoiKey,
    khoiLabel,
    semester: semester ? semester.id : "all",
    semesterLabel: semester ? semester.label : null,
    semesterShort: semester ? semester.short : null,
    examType,
    hasQuestions,
    status: hasQuestions ? "ready" : "draft",
    statusLabel: hasQuestions ? "Sẵn sàng thi" : "Đang biên soạn",
    actionLabel: hasQuestions ? "Vào thi" : "Chưa mở",
    icon,
    durationIcon,
    durationBadge,
    durationClass,
    path,
    time: timeText,
    timeSeconds,
    questions: questionsText,
    mcqCount,
    essayCount,
    badge,
    badgeClass,
    isActive: row.is_active ?? true,
    createdAt: row.created_at,
  };
}

/**
 * Tải danh sách bộ đề đang kích hoạt từ Supabase
 * @returns {Promise<{ data: Array, error: Error|null }>}
 */
export async function fetchActiveQuizzes() {
  try {
    const { data, error } = await supabase
      .from("quizzes")
      .select("id, slug, title, khoi, time, mcq_count, mcq_point, essay_count, essay_point, data, is_active, created_at")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("[quizzesApi] Lỗi truy vấn Supabase:", error);
      return { data: [], error };
    }

    if (!data || data.length === 0) {
      return { data: [], error: null };
    }

    const mapped = data.map(mapDatabaseRecordToQuiz).filter(Boolean);
    return { data: mapped, error: null };
  } catch (err) {
    console.error("[quizzesApi] Lỗi ngoại lệ khi tải danh sách đề thi:", err);
    return { data: [], error: err };
  }
}
