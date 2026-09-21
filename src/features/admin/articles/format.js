/**
 * format.js
 *
 * Hàm helper định dạng thời gian, trạng thái, validation lý do kiểm duyệt
 * và hiển thị tên tác giả trong module quản trị bài viết.
 */

export const MIN_MODERATION_REASON_LENGTH = 5;

/**
 * Định dạng ngày giờ chuẩn tiếng Việt: "dd/mm/yyyy, hh:mm"
 * @param {string | null | undefined} dateStr
 * @returns {string}
 */
export function formatDateVi(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Định dạng thời gian tương đối ("Vừa xong", "5 phút trước", "2 giờ trước", "Hôm qua", "3 ngày trước")
 * @param {string | null | undefined} dateStr
 * @param {Date} [now]
 * @returns {string}
 */
export function formatRelativeTimeVi(dateStr, now = new Date()) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";

  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return formatDateVi(dateStr);

  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return "Vừa xong";
  if (diffMinutes < 60) return `${diffMinutes} phút trước`;
  if (diffHours < 24) return `${diffHours} giờ trước`;
  if (diffDays === 1) return "Hôm qua";
  if (diffDays < 7) return `${diffDays} ngày trước`;

  return formatDateVi(dateStr);
}

/**
 * Kiểm tra số ngày bài viết đã chờ duyệt (tính theo ngày tròn)
 * @param {string | null | undefined} dateStr
 * @param {number} [thresholdDays=3]
 * @param {Date} [now]
 * @returns {boolean}
 */
export function isAging(dateStr, thresholdDays = 3, now = new Date()) {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return false;
  const thresholdMs = thresholdDays * 24 * 60 * 60 * 1000;
  return now.getTime() - date.getTime() >= thresholdMs;
}

/**
 * Trả về chuỗi mô tả số ngày chờ trung tính: "Đã chờ X ngày"
 * @param {string | null | undefined} dateStr
 * @param {Date} [now]
 * @returns {string}
 */
export function formatAgingDays(dateStr, now = new Date()) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return "";
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return "";
  const days = Math.floor(diffMs / (24 * 60 * 60 * 1000));
  if (days <= 0) return "Hôm nay";
  return `Đã chờ ${days} ngày`;
}

/**
 * Ghép Tên Thánh + Họ Tên hiển thị của tác giả, fallback về username
 * @param {{ ten_thanh?: string | null, ho_va_ten?: string | null, username?: string | null } | null | undefined} author
 * @param {string} [fallbackUsername=""]
 * @returns {string}
 */
export function getAuthorDisplayName(author, fallbackUsername = "") {
  if (!author) return fallbackUsername || "";
  const tenThanh = (author.ten_thanh || "").trim();
  const hoTen = (author.ho_va_ten || "").trim();

  if (tenThanh && hoTen) return `${tenThanh} ${hoTen}`;
  if (hoTen) return hoTen;
  if (tenThanh) return tenThanh;
  return author.username || fallbackUsername || "";
}

/**
 * Cấu hình hiển thị nhãn và badge của từng trạng thái bài viết
 * @param {string} status
 * @returns {{ label: string, badgeClass: string, key: string }}
 */
export function getArticleStatusMeta(status) {
  switch (status) {
    case "pending":
      return {
        key: "pending",
        label: "Chờ duyệt",
        badgeClass:
          "bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700/60",
      };
    case "published":
      return {
        key: "published",
        label: "Đã xuất bản",
        badgeClass:
          "bg-[#314e3e]/10 dark:bg-[#d6b883]/20 text-[#314e3e] dark:text-[#d6b883] border-[#314e3e]/20 dark:border-[#d6b883]/30",
      };
    case "rejected":
      return {
        key: "rejected",
        label: "Bị từ chối",
        badgeClass:
          "bg-red-100 dark:bg-red-950/80 text-red-900 dark:text-red-200 border-red-300 dark:border-red-700/60",
      };
    case "unpublished":
      return {
        key: "unpublished",
        label: "Đã gỡ",
        badgeClass:
          "bg-orange-100 dark:bg-orange-950/80 text-orange-900 dark:text-orange-200 border-orange-300 dark:border-orange-700/60",
      };
    default:
      return {
        key: status || "unknown",
        label: "Không xác định",
        badgeClass:
          "bg-stone-100 dark:bg-stone-800 text-stone-800 dark:text-stone-200 border-stone-300 dark:border-stone-700",
      };
  }
}

/**
 * Lấy nhãn và thời gian tương ứng theo trạng thái bài viết
 * @param {{ status?: string, submitted_at?: string, published_at?: string, reviewed_at?: string, unpublished_at?: string, updated_at?: string } | null | undefined} article
 * @returns {{ label: string, dateStr: string, relativeStr: string, fullStr: string }}
 */
export function getArticleTimestampMeta(article) {
  if (!article) {
    return { label: "Thời gian", dateStr: "", relativeStr: "", fullStr: "" };
  }

  let label = "Thời gian";
  let rawDate = "";

  switch (article.status) {
    case "pending":
      label = "Gửi lúc";
      rawDate = article.submitted_at || article.updated_at || "";
      break;
    case "published":
      label = "Đăng lúc";
      rawDate = article.published_at || article.updated_at || "";
      break;
    case "rejected":
      label = "Từ chối lúc";
      rawDate = article.reviewed_at || article.updated_at || "";
      break;
    case "unpublished":
      label = "Gỡ lúc";
      rawDate = article.unpublished_at || article.updated_at || "";
      break;
    default:
      label = "Cập nhật lúc";
      rawDate = article.updated_at || "";
  }

  return {
    label,
    dateStr: rawDate,
    relativeStr: formatRelativeTimeVi(rawDate),
    fullStr: formatDateVi(rawDate),
  };
}

/**
 * Kiểm tra tính hợp lệ của lý do kiểm duyệt / từ chối / gỡ / xóa
 * @param {string | null | undefined} reason
 * @param {number} [minLength=MIN_MODERATION_REASON_LENGTH]
 * @returns {{ valid: boolean, error: string | null, trimmed: string }}
 */
export function validateModerationReason(reason, minLength = MIN_MODERATION_REASON_LENGTH) {
  const trimmed = (reason || "").trim();
  if (!trimmed) {
    return {
      valid: false,
      error: "Vui lòng nhập lý do để ghi nhận và thông báo cho tác giả",
      trimmed: "",
    };
  }
  if (trimmed.length < minLength) {
    return {
      valid: false,
      error: `Lý do phải có ít nhất ${minLength} ký tự (hiện có ${trimmed.length} ký tự)`,
      trimmed,
    };
  }
  return {
    valid: true,
    error: null,
    trimmed,
  };
}

/**
 * Sắp xếp danh sách bài viết theo thời điểm gửi (submitted_at) hoặc ngày cập nhật
 * @param {Array<{submitted_at?: string, updated_at?: string}>} list
 * @param {'asc' | 'desc'} [order='asc']
 */
export function sortBySubmittedAt(list, order = "asc") {
  return [...list].sort((a, b) => {
    const timeA = new Date(a.submitted_at || a.updated_at || 0).getTime();
    const timeB = new Date(b.submitted_at || b.updated_at || 0).getTime();
    return order === "desc" ? timeB - timeA : timeA - timeB;
  });
}