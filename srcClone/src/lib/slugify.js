// Sinh slug từ tiêu đề tiếng Việt: bỏ dấu, thường hoá, thay khoảng trắng bằng "-".
// Thêm hậu tố ngẫu nhiên ngắn để giảm khả năng đụng UNIQUE(slug) khi 2 người
// đặt cùng tiêu đề — tránh phải round-trip kiểm tra tồn tại trước khi insert.
export function slugify(title) {
  const base = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // bỏ dấu
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const suffix = Math.random().toString(36).slice(2, 7);
  return `${base || "bai-viet"}-${suffix}`;
}