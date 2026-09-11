// src/utils/documentDownloadHelper.js
// Tiện ích hỗ trợ tải tài liệu về máy với thông báo Toast

export function downloadDocument(doc, showToast) {
  if (!doc) return;

  try {
    showToast?.(`Đang chuẩn bị file "${doc.title}"...`, "info");

    // 1. Nếu có fileUrl thực tế từ server/storage
    if (doc.fileUrl && doc.fileUrl !== "#") {
      const link = document.createElement("a");
      link.href = doc.fileUrl;
      link.download = `${doc.title.replace(/[\/\\?%*:|"<>]/g, "-")}.pdf`;
      link.target = "_blank";
      link.rel = "noopener noreferrer";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      showToast?.(
        doc.isBibleNavigator 
          ? `Đang mở trang tải chính thức "${doc.title}"...` 
          : `Đã kích hoạt tải tài liệu "${doc.title}"!`, 
        "success"
      );
      return;
    }

    // 2. Tạo file văn bản định dạng chuẩn từ nội dung số hóa (chapters)
    if (doc.chapters && doc.chapters.length > 0) {
      let textContent = `====================================================\n`;
      textContent += `${doc.title.toUpperCase()}\n`;
      textContent += `Phân loại: ${doc.khoiLabel || "Giáo Lý Công Giáo"}\n`;
      if (doc.author) textContent += `Tác giả / Nguồn: ${doc.author}\n`;
      textContent += `====================================================\n\n`;

      doc.chapters.forEach((ch, idx) => {
        textContent += `\n----------------------------------------------------\n`;
        textContent += `${ch.title}\n`;
        textContent += `----------------------------------------------------\n\n`;
        // Lược bớt markdown formatting đơn giản
        const cleanContent = ch.content
          .replace(/###\s+/g, "• ")
          .replace(/##\s+/g, "")
          .replace(/#\s+/g, "")
          .replace(/\*\*(.*?)\*\*/g, "$1")
          .replace(/\*(.*?)\*/g, "$1")
          .replace(/>\s+/g, "   ");
        textContent += cleanContent.trim() + `\n\n`;
      });

      textContent += `\n---\nBan Giáo Lý Giáo Xứ An Ngãi — Giáo Phận Đà Nẵng\n`;

      const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${doc.title.replace(/[\/\\?%*:|"<>]/g, "_")}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      showToast?.(`Đã lưu file "${doc.title}" vào máy thành công!`, "success");
      return;
    }

    // Fallback: Khi tài liệu đang trong quá trình số hóa
    showToast?.(`Tài liệu "${doc.title}" đang được ban giáo lý hoàn thiện bản in PDF.`, "info");
  } catch (error) {
    console.error("Lỗi khi tải tài liệu:", error);
    showToast?.("Không thể tải tài liệu. Vui lòng thử lại sau.", "error");
  }
}
