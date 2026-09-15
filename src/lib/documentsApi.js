// src/lib/documentsApi.js
// Service kết nối dữ liệu tài liệu từ Supabase kết hợp Local Cache Fallback
// Giáo xứ An Ngãi — Ban Giáo Lý & Huynh Trưởng

import { supabase } from "./supabase.js";
import { DOCUMENTS_DATA } from "../data/documents/docData.js";

/**
 * Bộ nhớ đệm trong phiên làm việc (in-memory cache)
 */
let cachedDocuments = null;

/**
 * Chuyển đổi dữ liệu bản ghi từ Supabase sang chuẩn cấu trúc tài liệu của ứng dụng
 */
function mapDatabaseRecordToDoc(row) {
  if (!row) return null;
  return {
    id: row.id,
    title: row.title,
    khoi: row.khoi,
    khoiLabel: row.khoi_label || row.khoi,
    badge: row.badge,
    author: row.author,
    readTime: row.read_time,
    size: row.size,
    description: row.description,
    officialSourceUrl: row.official_source_url,
    fileUrl: row.file_url,
    chapters: Array.isArray(row.chapters) ? row.chapters : [],
    isActive: row.is_active ?? true,
    sortOrder: row.sort_order ?? 0,
  };
}

/**
 * Lấy toàn bộ tài liệu công khai (ưu tiên Supabase, tự động fallback về docData.js)
 * @returns {Promise<Array>} Danh sách tài liệu
 */
export async function fetchAllDocuments() {
  if (cachedDocuments && cachedDocuments.length > 0) {
    return cachedDocuments;
  }

  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("is_active", true)
      .order("sort_order", { ascending: true });

    if (error || !data || data.length === 0) {
      // Fallback về docData tĩnh
      const fallbackList = Object.values(DOCUMENTS_DATA);
      cachedDocuments = fallbackList;
      return fallbackList;
    }

    const mapped = data.map(mapDatabaseRecordToDoc);
    cachedDocuments = mapped;
    return mapped;
  } catch (err) {
    console.warn("[documentsApi] Không thể kết nối Supabase, chuyển sang dữ liệu nội bộ:", err);
    const fallbackList = Object.values(DOCUMENTS_DATA);
    cachedDocuments = fallbackList;
    return fallbackList;
  }
}

/**
 * Lấy chi tiết một tài liệu theo ID slug (vd: 'youcat-vietnam', 'docat-vietnam')
 * @param {string} docId - Slug ID của tài liệu
 * @returns {Promise<Object|null>} Chi tiết tài liệu và các chương số hóa
 */
export async function getDocumentById(docId) {
  if (!docId) return null;

  // Lấy dữ liệu local dự phòng tức thì
  const localDoc = DOCUMENTS_DATA[docId] || null;

  try {
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("id", docId)
      .eq("is_active", true)
      .maybeSingle();

    if (error || !data) {
      return localDoc;
    }

    const parsed = mapDatabaseRecordToDoc(data);
    // Nếu chapters trong DB chưa có hoặc rỗng, ưu tiên chapters từ localDoc
    if ((!parsed.chapters || parsed.chapters.length === 0) && localDoc?.chapters) {
      parsed.chapters = localDoc.chapters;
    }
    return parsed;
  } catch (err) {
    console.warn(`[documentsApi] Lỗi lấy tài liệu ${docId} từ Supabase, dùng local cache:`, err);
    return localDoc;
  }
}

/**
 * Lấy danh sách tài liệu theo từng khối
 * @param {string} khoi - Mã khối ('vao-doi', 'kinh-thanh', 'phung-vu', 'all',...)
 * @returns {Promise<Array>}
 */
export async function getDocumentsByKhoi(khoi) {
  const all = await fetchAllDocuments();
  if (!khoi || khoi === "all") return all;
  return all.filter((d) => d.khoi === khoi || d.khoi === "all");
}
