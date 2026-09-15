export const CONTACT_TOPICS = ["Tuyển sinh", "Lịch học", "Tham gia giáo lý viên", "Góp ý", "Khác"];
export const CONTACT_LIMITS = { name: 100, message: 2000 };

export function normalizePhone(value) {
  return value.trim().replace(/[\s().-]/g, "").replace(/^\+84/, "0");
}

export function validateContact(form) {
  const errors = {};
  if (!form.hoTen.trim()) errors.hoTen = "Vui lòng nhập họ và tên.";
  else if (form.hoTen.trim().length > CONTACT_LIMITS.name) errors.hoTen = "Họ tên tối đa 100 ký tự.";
  if (!/^0[35789]\d{8}$/.test(normalizePhone(form.sdt))) errors.sdt = "Nhập số di động gồm 10 chữ số, hoặc bắt đầu bằng +84.";
  if (!CONTACT_TOPICS.includes(form.chuDe)) errors.chuDe = "Vui lòng chọn nội dung cần hỗ trợ.";
  if (!form.noiDung.trim()) errors.noiDung = "Vui lòng nhập lời nhắn để Ban Giáo lý có thể hỗ trợ bạn.";
  else if (form.noiDung.trim().length > CONTACT_LIMITS.message) errors.noiDung = "Lời nhắn tối đa 2.000 ký tự.";
  return errors;
}

// Preserve the existing RPC contract; the topic is also visible in the admin inbox.
export function buildContactPayload(form) {
  return {
    hoTen: form.hoTen.trim(),
    sdt: normalizePhone(form.sdt),
    noiDung: `[Chủ đề: ${form.chuDe}]\n${form.noiDung.trim()}`,
  };
}
