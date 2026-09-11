/**
 * Helper xuất tài liệu PDF (.pdf) chính thức, sắc nét, chuẩn khổ A4 phía client
 * Giải quyết triệt để 100% các vấn đề:
 * 1. Bố cục bảng biểu chuẩn mực A4 (không bị co rúm, không bị cắt xén, không ảnh hưởng bởi dark mode hay màn hình điện thoại).
 * 2. Ngắt trang thông minh (tuyệt đối KHÔNG cắt đôi dòng học sinh, lặp lại tiêu đề cột trên mỗi trang mới).
 * 3. Đầy đủ 100% dữ liệu (không bị giới hạn bởi thanh cuộn max-h-[65vh]).
 * 4. Tích hợp File System Access API (showSaveFilePicker) để bắt chuẩn xác Bấm Lưu (thành công) và Bấm Huỷ.
 */

let _pdfPromise = null;

/**
 * Tải trước thư viện jsPDF và html2canvas-pro vào RAM
 */
export function preloadPDFLibs() {
  if (!_pdfPromise) {
    _pdfPromise = Promise.all([
      import("jspdf"),
      import("html2canvas-pro"),
    ]).then(([jsPdfMod, html2canvasMod]) => ({
      jsPDF: jsPdfMod.jsPDF || jsPdfMod.default,
      html2canvas: html2canvasMod.default || html2canvasMod,
    }));
  }
  return _pdfPromise;
}

export async function getPDFLibs() {
  if (!_pdfPromise) {
    return preloadPDFLibs();
  }
  return _pdfPromise;
}

/**
 * Hàm phân chia mảng thành các phần nhỏ (chunk) theo số lượng chỉ định
 */
function chunkArray(array, size) {
  const result = [];
  for (let i = 0; i < array.length; i += size) {
    result.push(array.slice(i, i + size));
  }
  return result;
}

/**
 * Kích hoạt render từng trang A4 độc lập sang Canvas và ghép nối vào jsPDF
 * @param {string[]} pagesHtml - Mảng các chuỗi HTML đại diện cho từng trang A4
 * @param {Object} options
 * @param {'portrait'|'landscape'} [options.orientation='portrait']
 * @returns {Promise<Blob>}
 */
export async function exportHtmlPagesToPdfBlob(pagesHtml, options = {}) {
  const { jsPDF, html2canvas } = await getPDFLibs();
  const orientation = options.orientation || "portrait";
  const isLandscape = orientation === "landscape";

  const pageWidthMm = isLandscape ? 297 : 210;
  const pageHeightMm = isLandscape ? 210 : 297;

  // Kích thước Pixel theo tỷ lệ A4 chuẩn (96 DPI cơ sở)
  const pageWidthPx = isLandscape ? 1123 : 794;
  const pageHeightPx = isLandscape ? 794 : 1123;

  // Tạo container tạm thời ngoài màn hình để render độc lập
  const sandbox = document.createElement("div");
  sandbox.id = "pdf-render-sandbox";
  sandbox.style.position = "fixed";
  sandbox.style.left = "-99999px";
  sandbox.style.top = "0";
  sandbox.style.zIndex = "-99999";
  sandbox.style.opacity = "0";
  sandbox.style.pointerEvents = "none";
  sandbox.style.background = "#ffffff";
  document.body.appendChild(sandbox);

  try {
    const pageElements = [];
    for (let i = 0; i < pagesHtml.length; i++) {
      const pageEl = document.createElement("div");
      pageEl.className = "pdf-page-sheet";
      pageEl.style.width = `${pageWidthPx}px`;
      pageEl.style.height = `${pageHeightPx}px`;
      pageEl.style.minHeight = `${pageHeightPx}px`;
      pageEl.style.maxHeight = `${pageHeightPx}px`;
      pageEl.style.boxSizing = "border-box";
      pageEl.style.padding = isLandscape ? "32px 40px" : "36px 40px";
      pageEl.style.background = "#ffffff";
      pageEl.style.color = "#1c1917";
      pageEl.style.fontFamily = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";
      pageEl.style.position = "relative";
      pageEl.style.overflow = "hidden";
      pageEl.innerHTML = pagesHtml[i];
      sandbox.appendChild(pageEl);
      pageElements.push(pageEl);
    }

    const doc = new jsPDF({
      orientation,
      unit: "mm",
      format: "a4",
      compress: true,
    });

    for (let i = 0; i < pageElements.length; i++) {
      if (i > 0) {
        doc.addPage("a4", orientation);
      }
      const canvas = await html2canvas(pageElements[i], {
        scale: 2, // 2x Retina cho chữ sắc nét
        useCORS: true,
        logging: false,
        backgroundColor: "#ffffff",
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.96);
      doc.addImage(imgData, "JPEG", 0, 0, pageWidthMm, pageHeightMm, undefined, "FAST");
    }

    return doc.output("blob");
  } finally {
    if (sandbox.parentNode) {
      sandbox.parentNode.removeChild(sandbox);
    }
  }
}

/**
 * Xuất BẢNG ĐIỂM HỌC SINH (Admin) ra file PDF chính thức, phân trang hoàn hảo
 */
export async function exportGradesReportPdf({
  lop = "",
  namHoc = "",
  hocKy = "HK1",
  teacherName = "",
  scoreFields = [],
  rows = [],
}) {
  const hkLabel = hocKy === "CN" ? "Cả năm" : (hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II");
  const currentDate = new Date().toLocaleDateString("vi-VN");

  // Thống kê nhanh cuối bảng
  let sumTB = 0, countTB = 0;
  let gioi = 0, kha = 0, tb = 0, yeu = 0;
  rows.forEach((r) => {
    const v = parseFloat(r.diem_tb);
    if (!isNaN(v)) {
      sumTB += v;
      countTB++;
    }
    if (r.hocLuc === "Giỏi") gioi++;
    else if (r.hocLuc === "Khá") kha++;
    else if (r.hocLuc === "Trung Bình" || r.hocLuc === "TB") tb++;
    else if (r.hocLuc) yeu++;
  });
  const avgClass = countTB > 0 ? (sumTB / countTB).toFixed(1) : "—";

  // Định mức học sinh mỗi trang để không bị tràn
  // Nếu cả lớp <= 22 học sinh: Vừa vặn 1 trang kèm bảng tổng kết & chữ ký
  // Nếu > 22 học sinh: Trang 1 chứa 26 học sinh, các trang tiếp theo chứa 28 học sinh
  let pagesData = [];
  if (rows.length <= 22) {
    pagesData = [rows];
  } else {
    pagesData.push(rows.slice(0, 26));
    let remaining = rows.slice(26);
    while (remaining.length > 0) {
      pagesData.push(remaining.slice(0, 28));
      remaining = remaining.slice(28);
    }
  }

  const totalPages = pagesData.length;
  let runningIndex = 0;

  const pagesHtml = pagesData.map((pageRows, pageIdx) => {
    const isFirstPage = pageIdx === 0;
    const isLastPage = pageIdx === totalPages - 1;
    const startIndex = runningIndex;
    runningIndex += pageRows.length;

    return `
      <!-- HEADER -->
      ${isFirstPage ? `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #b45309; padding-bottom: 12px; margin-bottom: 12px;">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: #78350f; text-transform: uppercase; letter-spacing: 0.5px;">GIÁO PHẬN ĐÀ NẴNG — GIÁO XỨ AN NGÃI — BAN GIÁO LÝ</div>
            <div style="font-size: 19px; font-weight: 800; color: #1c1917; margin-top: 4px; text-transform: uppercase;">BẢNG ĐIỂM HỌC SINH</div>
            <div style="font-size: 12.5px; font-weight: 600; color: #44403c; margin-top: 3px;">
              Lớp: <span style="color: #b45309; font-weight: 700;">${lop}</span> — ${hkLabel} (Niên khóa: ${namHoc})
            </div>
          </div>
          <div style="text-align: right; font-size: 11.5px; color: #57534e; line-height: 1.5;">
            <div>GVCN: <strong style="color: #1c1917;">${teacherName || "Chưa phân công"}</strong></div>
            <div>Sĩ số: <strong style="color: #1c1917;">${rows.length}</strong> học sinh</div>
            <div style="font-size: 10.5px; color: #78716c; margin-top: 4px;">Ngày xuất: ${currentDate}</div>
          </div>
        </div>
      ` : `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #d97706; padding-bottom: 8px; margin-bottom: 12px;">
          <div style="font-size: 13px; font-weight: 700; color: #1c1917; text-transform: uppercase;">
            Bảng điểm lớp ${lop} — ${hkLabel} <span style="font-weight: 400; font-size: 11px; color: #78716c;">(Trang tiếp theo)</span>
          </div>
          <div style="font-size: 11px; color: #78716c;">Năm học: ${namHoc}</div>
        </div>
      `}

      <!-- TABLE -->
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background: #fef3c7; color: #78350f; font-weight: 700; text-transform: uppercase; font-size: 10.5px;">
            <th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 34px;">STT</th>
            <th style="border: 1px solid #d97706; padding: 6px 8px; text-align: left; width: 175px;">Họ và Tên</th>
            ${scoreFields.map(f => `<th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 44px;">${f.label}</th>`).join("")}
            <th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 44px; background: #fde68a;">ĐTB</th>
            <th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 58px;">Học Lực</th>
            <th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 58px;">Hạnh Kiểm</th>
            <th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 44px;">Vắng CP</th>
            <th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 44px;">Vắng KP</th>
          </tr>
        </thead>
        <tbody>
          ${pageRows.map((r, pIdx) => {
            const globalIdx = startIndex + pIdx + 1;
            const isOdd = globalIdx % 2 === 1;
            const bg = isOdd ? "#ffffff" : "#fefce8";
            return `
            <tr style="background: ${bg}; font-size: 11px; color: #1c1917;">
              <td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center; color: #78716c;">${globalIdx}</td>
              <td style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; font-weight: 600;">
                ${r.student?.tenThanh ? `<span style="font-weight: 400; color: #57534e; margin-right: 4px;">${r.student.tenThanh}</span>` : ""}${r.student?.hoTen || r.student?.username}
              </td>
              ${scoreFields.map(f => `<td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center; font-weight: 600;">${r[f.key] ?? "—"}</td>`).join("")}
              <td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center; font-weight: 800; color: #92400e; background: ${isOdd ? '#fefce8' : '#fef9c3'};">${r.diem_tb ?? "—"}</td>
              <td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center;">${r.hocLuc || "—"}</td>
              <td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center;">${r.hanhKiem || "—"}</td>
              <td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center; color: #44403c;">${r.vangCoPhep ?? 0}</td>
              <td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center; color: ${(r.vangKhongPhep > 0) ? '#dc2626; font-weight: 700;' : '#44403c;'}">${r.vangKhongPhep ?? 0}</td>
            </tr>
            `;
          }).join("")}
        </tbody>
      </table>

      <!-- FOOTER (Chỉ hiển thị ở trang cuối cùng) -->
      ${isLastPage ? `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 8px 14px; margin-top: 14px; font-size: 11.5px; color: #78350f;">
          <div><strong>Sĩ số:</strong> ${rows.length} HS</div>
          <div><strong>Điểm TB lớp:</strong> ${avgClass}</div>
          <div><strong>Giỏi:</strong> ${gioi} &nbsp;|&nbsp; <strong>Khá:</strong> ${kha} &nbsp;|&nbsp; <strong>TB:</strong> ${tb} &nbsp;|&nbsp; <strong>Yếu:</strong> ${yeu}</div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 20px; padding: 0 24px; font-size: 11.5px; color: #1c1917; text-align: center;">
          <div>
            <div style="font-weight: 700; text-transform: uppercase;">Người lập bảng</div>
            <div style="font-size: 10px; color: #78716c; font-style: italic; margin-top: 2px;">(Ký và ghi rõ họ tên)</div>
            <div style="height: 48px;"></div>
          </div>
          <div>
            <div style="font-weight: 700; text-transform: uppercase;">Giáo viên chủ nhiệm</div>
            <div style="font-size: 10px; color: #78716c; font-style: italic; margin-top: 2px;">(Ký và ghi rõ họ tên)</div>
            <div style="height: 48px;"></div>
            <div style="font-weight: 600; color: #44403c;">${teacherName || ""}</div>
          </div>
          <div>
            <div style="font-weight: 700; text-transform: uppercase;">Ban Điều Hành Giáo Lý</div>
            <div style="font-size: 10px; color: #78716c; font-style: italic; margin-top: 2px;">(Ký tên và đóng dấu)</div>
            <div style="height: 48px;"></div>
          </div>
        </div>
      ` : ""}

      <!-- ĐÁNH SỐ TRANG Ở CHÂN MỖI TRANG -->
      <div style="position: absolute; bottom: 16px; left: 40px; right: 40px; display: flex; justify-content: space-between; font-size: 10px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 6px;">
        <div>Hệ thống Quản lý Giáo lý — Bản in chính thức</div>
        <div>Trang ${pageIdx + 1} / ${totalPages}</div>
      </div>
    `;
  });

  return exportHtmlPagesToPdfBlob(pagesHtml, { orientation: "portrait" });
}

/**
 * Xuất BẢNG TỔNG KẾT LỚP (Teacher - Sổ chủ nhiệm) ra file PDF chính thức
 */
export async function exportSummaryReportPdf({
  lop = "",
  namHoc = "",
  hocKy = "HK1",
  isCaNam = false,
  classStats = {},
  rows = [],
}) {
  const hkLabel = isCaNam ? "Cả năm" : (hocKy === "HK1" ? "Học kỳ I" : "Học kỳ II");
  const currentDate = new Date().toLocaleDateString("vi-VN");

  // Định mức học sinh mỗi trang
  let pagesData = [];
  if (rows.length <= 22) {
    pagesData = [rows];
  } else {
    pagesData.push(rows.slice(0, 26));
    let remaining = rows.slice(26);
    while (remaining.length > 0) {
      pagesData.push(remaining.slice(0, 28));
      remaining = remaining.slice(28);
    }
  }

  const totalPages = pagesData.length;
  let runningIndex = 0;

  const pagesHtml = pagesData.map((pageRows, pageIdx) => {
    const isFirstPage = pageIdx === 0;
    const isLastPage = pageIdx === totalPages - 1;
    const startIndex = runningIndex;
    runningIndex += pageRows.length;

    return `
      <!-- HEADER -->
      ${isFirstPage ? `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #b45309; padding-bottom: 12px; margin-bottom: 12px;">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: #78350f; text-transform: uppercase; letter-spacing: 0.5px;">GIÁO PHẬN ĐÀ NẴNG — GIÁO XỨ AN NGÃI — SỔ CHỦ NHIỆM GIÁO LÝ</div>
            <div style="font-size: 19px; font-weight: 800; color: #1c1917; margin-top: 4px; text-transform: uppercase;">BẢNG TỔNG KẾT LỚP HỌC</div>
            <div style="font-size: 12.5px; font-weight: 600; color: #44403c; margin-top: 3px;">
              Lớp: <span style="color: #b45309; font-weight: 700;">${lop}</span> — ${hkLabel} (Niên khóa: ${namHoc})
            </div>
          </div>
          <div style="text-align: right; font-size: 11.5px; color: #57534e; line-height: 1.5;">
            <div>Sĩ số: <strong style="color: #1c1917;">${rows.length}</strong> học sinh</div>
            <div>Đánh giá: <strong>${hkLabel}</strong></div>
            <div style="font-size: 10.5px; color: #78716c; margin-top: 4px;">Ngày xuất: ${currentDate}</div>
          </div>
        </div>
      ` : `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #d97706; padding-bottom: 8px; margin-bottom: 12px;">
          <div style="font-size: 13px; font-weight: 700; color: #1c1917; text-transform: uppercase;">
            Bảng tổng kết lớp ${lop} — ${hkLabel} <span style="font-weight: 400; font-size: 11px; color: #78716c;">(Trang tiếp theo)</span>
          </div>
          <div style="font-size: 11px; color: #78716c;">Năm học: ${namHoc}</div>
        </div>
      `}

      <!-- TABLE -->
      <table style="width: 100%; border-collapse: collapse; font-size: 11px;">
        <thead>
          <tr style="background: #fef3c7; color: #78350f; font-weight: 700; text-transform: uppercase; font-size: 10.5px;">
            <th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 34px;">STT</th>
            <th style="border: 1px solid #d97706; padding: 6px 8px; text-align: left; width: 180px;">Tên Thánh, Họ và Tên</th>
            ${!isCaNam ? `<th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 55px;">Điểm Thi</th>` : ""}
            <th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 55px; background: #fde68a;">Điểm TB</th>
            <th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 70px;">Học Lực</th>
            <th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 70px;">Hạnh Kiểm</th>
            <th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 50px;">Vắng CP</th>
            <th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 50px;">Vắng KP</th>
            ${isCaNam ? `<th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 55px;">Vị Thứ</th>` : ""}
            <th style="border: 1px solid #d97706; padding: 6px 4px; text-align: center; width: 75px;">${isCaNam ? "Kết Quả" : "Xếp Loại"}</th>
          </tr>
        </thead>
        <tbody>
          ${pageRows.map((r, pIdx) => {
            const globalIdx = startIndex + pIdx + 1;
            const isOdd = globalIdx % 2 === 1;
            const bg = isOdd ? "#ffffff" : "#fefce8";
            const ketQuaStr = isCaNam 
              ? (r.hocLuc === "Yếu" || r.hocLuc === "Kém" ? "Ở lại lớp" : "Lên lớp")
              : (r.hocLuc || "—");
            return `
            <tr style="background: ${bg}; font-size: 11px; color: #1c1917;">
              <td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center; color: #78716c;">${globalIdx}</td>
              <td style="border: 1px solid #cbd5e1; padding: 5px 8px; text-align: left; font-weight: 600;">
                ${r.student?.tenThanh ? `<span style="font-weight: 400; color: #57534e; margin-right: 4px;">${r.student.tenThanh}</span>` : ""}${r.student?.hoTen || r.student?.username}
              </td>
              ${!isCaNam ? `<td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center; font-weight: 600;">${r.diemThi ?? "—"}</td>` : ""}
              <td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center; font-weight: 800; color: #92400e; background: ${isOdd ? '#fefce8' : '#fef9c3'};">${r.diemTB ?? "—"}</td>
              <td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center; font-weight: 500;">${r.hocLuc || "—"}</td>
              <td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center;">${r.hanhKiem || "—"}</td>
              <td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center; color: #44403c;">${r.vangCoPhep ?? 0}</td>
              <td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center; color: ${(r.vangKhongPhep > 0) ? '#dc2626; font-weight: 700;' : '#44403c;'}">${r.vangKhongPhep ?? 0}</td>
              ${isCaNam ? `<td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center; font-weight: 700;">${r.viThu ?? "—"}</td>` : ""}
              <td style="border: 1px solid #cbd5e1; padding: 5px 3px; text-align: center; font-weight: 600; color: ${ketQuaStr === 'Ở lại lớp' ? '#dc2626' : '#15803d'};">${ketQuaStr}</td>
            </tr>
            `;
          }).join("")}
        </tbody>
      </table>

      <!-- FOOTER TRANG CUỐI -->
      ${isLastPage ? `
        <div style="display: flex; justify-content: space-between; align-items: center; background: #fffbeb; border: 1px solid #fde68a; border-radius: 6px; padding: 8px 14px; margin-top: 14px; font-size: 11.5px; color: #78350f;">
          <div><strong>Sĩ số:</strong> ${rows.length} HS</div>
          <div><strong>Điểm TB lớp:</strong> ${classStats?.average ?? "—"}</div>
          <div>
            <strong>Giỏi:</strong> ${classStats?.gioi ?? 0} &nbsp;|&nbsp; 
            <strong>Khá:</strong> ${classStats?.kha ?? 0} &nbsp;|&nbsp; 
            <strong>TB:</strong> ${classStats?.tb ?? 0} &nbsp;|&nbsp; 
            <strong>Yếu:</strong> ${classStats?.yeuKem ?? 0}
          </div>
        </div>

        <div style="display: flex; justify-content: space-between; margin-top: 20px; padding: 0 30px; font-size: 11.5px; color: #1c1917; text-align: center;">
          <div>
            <div style="font-weight: 700; text-transform: uppercase;">Người lập bảng</div>
            <div style="font-size: 10px; color: #78716c; font-style: italic; margin-top: 2px;">(Ký và ghi rõ họ tên)</div>
            <div style="height: 48px;"></div>
          </div>
          <div>
            <div style="font-weight: 700; text-transform: uppercase;">Giáo viên chủ nhiệm</div>
            <div style="font-size: 10px; color: #78716c; font-style: italic; margin-top: 2px;">(Ký và ghi rõ họ tên)</div>
            <div style="height: 48px;"></div>
          </div>
          <div>
            <div style="font-weight: 700; text-transform: uppercase;">Ban Điều Hành Giáo Lý</div>
            <div style="font-size: 10px; color: #78716c; font-style: italic; margin-top: 2px;">(Ký tên và đóng dấu)</div>
            <div style="height: 48px;"></div>
          </div>
        </div>
      ` : ""}

      <!-- SỐ TRANG -->
      <div style="position: absolute; bottom: 16px; left: 40px; right: 40px; display: flex; justify-content: space-between; font-size: 10px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 6px;">
        <div>Sổ chủ nhiệm Giáo lý — Bản tổng kết chính thức</div>
        <div>Trang ${pageIdx + 1} / ${totalPages}</div>
      </div>
    `;
  });

  return exportHtmlPagesToPdfBlob(pagesHtml, { orientation: "portrait" });
}

/**
 * Xuất BÁO CÁO THỐNG KÊ (Admin - Reports) ra file PDF khổ ngang A4 (Landscape)
 */
export async function exportStatsReportPdf({
  namHoc = "",
  term = "HK1",
  config = {},
  stats = [],
}) {
  const TERM_LABELS = {
    HK1: "Học kỳ I",
    HK2: "Học kỳ II",
    CN: "Cả năm",
  };
  const termLabel = TERM_LABELS[term] || term;
  const currentDate = new Date().toLocaleDateString("vi-VN");
  const columns = config.columns || [];

  // Tính dòng tổng cộng
  let totalSiSo = 0;
  let totalXepLoai = 0;
  const colTotals = {};
  columns.forEach(c => { colTotals[c.key] = 0; });

  stats.forEach(s => {
    const siSo = s.studentCount ?? s.siSo ?? 0;
    const xepLoai = s.totalGraded ?? s.daXepLoai ?? 0;
    totalSiSo += siSo;
    totalXepLoai += xepLoai;
    columns.forEach(c => {
      colTotals[c.key] += (s[c.key] || 0);
    });
  });

  // Báo cáo thống kê phân chia trang (khổ ngang mỗi trang chứa ~15 lớp)
  const pagesData = stats.length <= 15 ? [stats] : chunkArray(stats, 15);
  const totalPages = pagesData.length;
  let runningIndex = 0;

  const pagesHtml = pagesData.map((pageRows, pageIdx) => {
    const isFirstPage = pageIdx === 0;
    const isLastPage = pageIdx === totalPages - 1;
    const startIndex = runningIndex;
    runningIndex += pageRows.length;

    return `
      <!-- HEADER KHỔ NGANG -->
      ${isFirstPage ? `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #b45309; padding-bottom: 12px; margin-bottom: 14px;">
          <div>
            <div style="font-size: 11px; font-weight: 700; color: #78350f; text-transform: uppercase; letter-spacing: 0.5px;">GIÁO PHẬN ĐÀ NẴNG — GIÁO XỨ AN NGÃI — BAN GIÁO LÝ</div>
            <div style="font-size: 20px; font-weight: 800; color: #1c1917; margin-top: 4px; text-transform: uppercase;">
              BÁO CÁO THỐNG KÊ — ${String(config.label || "KẾT QUẢ").toUpperCase()}
            </div>
            <div style="font-size: 13px; font-weight: 600; color: #44403c; margin-top: 3px;">
              Đánh giá: <span style="color: #b45309; font-weight: 700;">${termLabel}</span> — Niên khóa: ${namHoc}
            </div>
          </div>
          <div style="text-align: right; font-size: 11.5px; color: #57534e; line-height: 1.5;">
            <div>Tổng số lớp: <strong style="color: #1c1917;">${stats.length}</strong> lớp</div>
            <div>Tổng học sinh: <strong style="color: #1c1917;">${totalSiSo}</strong> em</div>
            <div style="font-size: 10.5px; color: #78716c; margin-top: 4px;">Ngày lập báo cáo: ${currentDate}</div>
          </div>
        </div>
      ` : `
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1.5px solid #d97706; padding-bottom: 8px; margin-bottom: 12px;">
          <div style="font-size: 13px; font-weight: 700; color: #1c1917; text-transform: uppercase;">
            Báo cáo thống kê ${config.label || ""} — ${termLabel} (${namHoc}) <span style="font-weight: 400; font-size: 11px; color: #78716c;">(Trang tiếp theo)</span>
          </div>
          <div style="font-size: 11px; color: #78716c;">Ngày xuất: ${currentDate}</div>
        </div>
      `}

      <!-- TABLE KHỔ NGANG -->
      <table style="width: 100%; border-collapse: collapse; font-size: 11.5px;">
        <thead>
          <tr style="background: #fef3c7; color: #78350f; font-weight: 700; text-transform: uppercase; font-size: 11px;">
            <th style="border: 1px solid #d97706; padding: 7px 6px; text-align: center; width: 45px;">STT</th>
            <th style="border: 1px solid #d97706; padding: 7px 12px; text-align: left; width: 140px;">Tên Lớp</th>
            <th style="border: 1px solid #d97706; padding: 7px 8px; text-align: center; width: 75px;">Sĩ số</th>
            <th style="border: 1px solid #d97706; padding: 7px 8px; text-align: center; width: 95px;">Đã xếp loại</th>
            ${columns.map(col => `
              <th style="border: 1px solid #d97706; padding: 7px 8px; text-align: center;" colspan="2">
                ${col.label}
              </th>
            `).join("")}
          </tr>
          <tr style="background: #fde68a; color: #92400e; font-weight: 600; font-size: 10px; text-transform: uppercase;">
            <th style="border: 1px solid #d97706; padding: 4px;" colspan="4"></th>
            ${columns.map(() => `
              <th style="border: 1px solid #d97706; padding: 4px; text-align: center; width: 50px;">SL</th>
              <th style="border: 1px solid #d97706; padding: 4px; text-align: center; width: 55px;">Tỉ lệ</th>
            `).join("")}
          </tr>
        </thead>
        <tbody>
          ${pageRows.map((s, pIdx) => {
            const globalIdx = startIndex + pIdx + 1;
            const isOdd = globalIdx % 2 === 1;
            const bg = isOdd ? "#ffffff" : "#fefce8";
            const siSo = s.studentCount ?? s.siSo ?? 0;
            const daXepLoai = s.totalGraded ?? s.daXepLoai ?? 0;
            return `
            <tr style="background: ${bg}; font-size: 11.5px; color: #1c1917;">
              <td style="border: 1px solid #cbd5e1; padding: 6px 4px; text-align: center; color: #78716c;">${globalIdx}</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px 12px; text-align: left; font-weight: 700; color: #78350f;">${s.lop}</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; font-weight: 600;">${siSo}</td>
              <td style="border: 1px solid #cbd5e1; padding: 6px 8px; text-align: center; font-weight: 600; color: #0369a1;">${daXepLoai}</td>
              ${columns.map(col => {
                const count = s[col.key] || 0;
                const pct = daXepLoai > 0 ? ((count / daXepLoai) * 100).toFixed(1) + "%" : "0%";
                return `
                  <td style="border: 1px solid #cbd5e1; padding: 6px 4px; text-align: center; font-weight: 600;">${count}</td>
                  <td style="border: 1px solid #cbd5e1; padding: 6px 4px; text-align: center; color: #57534e; font-size: 10.5px;">${pct}</td>
                `;
              }).join("")}
            </tr>
            `;
          }).join("")}

          <!-- DÒNG TỔNG CỘNG TRANG CUỐI -->
          ${isLastPage ? `
            <tr style="background: #fef3c7; font-size: 12px; font-weight: 800; color: #78350f; border-top: 2px solid #b45309;">
              <td style="border: 1px solid #d97706; padding: 7px 6px; text-align: center;" colspan="2">TỔNG CỘNG HỆ THỐNG</td>
              <td style="border: 1px solid #d97706; padding: 7px 8px; text-align: center;">${totalSiSo}</td>
              <td style="border: 1px solid #d97706; padding: 7px 8px; text-align: center; color: #0369a1;">${totalXepLoai}</td>
              ${columns.map(col => {
                const count = colTotals[col.key] || 0;
                const pct = totalXepLoai > 0 ? ((count / totalXepLoai) * 100).toFixed(1) + "%" : "0%";
                return `
                  <td style="border: 1px solid #d97706; padding: 7px 4px; text-align: center;">${count}</td>
                  <td style="border: 1px solid #d97706; padding: 7px 4px; text-align: center; font-size: 11px;">${pct}</td>
                `;
              }).join("")}
            </tr>
          ` : ""}
        </tbody>
      </table>

      <!-- KHỐI CHỮ KÝ TRANG CUỐI -->
      ${isLastPage ? `
        <div style="display: flex; justify-content: space-between; margin-top: 24px; padding: 0 40px; font-size: 12px; color: #1c1917; text-align: center;">
          <div>
            <div style="font-weight: 700; text-transform: uppercase;">Người lập báo cáo</div>
            <div style="font-size: 10.5px; color: #78716c; font-style: italic; margin-top: 2px;">(Ký và ghi rõ họ tên)</div>
            <div style="height: 48px;"></div>
          </div>
          <div>
            <div style="font-weight: 700; text-transform: uppercase;">Trưởng Ban Giáo Lý</div>
            <div style="font-size: 10.5px; color: #78716c; font-style: italic; margin-top: 2px;">(Ký và ghi rõ họ tên)</div>
            <div style="height: 48px;"></div>
          </div>
          <div>
            <div style="font-weight: 700; text-transform: uppercase;">Linh Mục Quản Xứ</div>
            <div style="font-size: 10.5px; color: #78716c; font-style: italic; margin-top: 2px;">(Ký tên và đóng dấu)</div>
            <div style="height: 48px;"></div>
          </div>
        </div>
      ` : ""}

      <!-- SỐ TRANG -->
      <div style="position: absolute; bottom: 14px; left: 40px; right: 40px; display: flex; justify-content: space-between; font-size: 10px; color: #a8a29e; border-top: 1px solid #e7e5e4; padding-top: 6px;">
        <div>Hệ thống Quản lý Giáo lý — Thống kê báo cáo chính thức</div>
        <div>Trang ${pageIdx + 1} / ${totalPages}</div>
      </div>
    `;
  });

  return exportHtmlPagesToPdfBlob(pagesHtml, { orientation: "landscape" });
}

/**
 * Giữ nguyên fallback xuất trực tiếp từ DOM (hỗ trợ backward compatibility)
 */
export async function exportElementToPdfBlob(element, options = {}) {
  if (!element) {
    throw new Error("Không tìm thấy phần tử DOM cần xuất PDF");
  }

  const { jsPDF, html2canvas } = await getPDFLibs();
  const orientation = options.orientation || "portrait";
  const scale = options.scale || 2;

  const canvas = await html2canvas(element, {
    scale,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
    windowWidth: 1200,
    onclone: (clonedDoc) => {
      clonedDoc.querySelectorAll(".print\\:block").forEach((el) => {
        el.style.setProperty("display", "block", "important");
      });
      clonedDoc.querySelectorAll(".print\\:flex").forEach((el) => {
        el.style.setProperty("display", "flex", "important");
      });
      clonedDoc.querySelectorAll(".print\\:hidden, .ag-no-print, .tk-no-print").forEach((el) => {
        el.style.setProperty("display", "none", "important");
      });
    },
  });

  const imgData = canvas.toDataURL("image/jpeg", 0.96);
  const isLandscape = orientation === "landscape";
  const pageWidth = isLandscape ? 297 : 210;
  const pageHeight = isLandscape ? 210 : 297;
  const marginX = options.marginX ?? 8;
  const marginY = options.marginY ?? 10;
  const contentWidth = pageWidth - marginX * 2;
  const contentHeight = pageHeight - marginY * 2;

  const doc = new jsPDF({
    orientation,
    unit: "mm",
    format: "a4",
    compress: true,
  });

  const imgWidth = contentWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  let heightLeft = imgHeight;
  let position = marginY;

  doc.addImage(imgData, "JPEG", marginX, position, imgWidth, imgHeight, undefined, "FAST");
  heightLeft -= contentHeight;

  while (heightLeft > 0) {
    position -= contentHeight;
    doc.addPage();
    doc.addImage(imgData, "JPEG", marginX, position, imgWidth, imgHeight, undefined, "FAST");
    heightLeft -= contentHeight;
  }

  return doc.output("blob");
}

/**
 * Tải file PDF an toàn về máy người dùng qua showSaveFilePicker hoặc fallback
 */
export async function triggerSafePdfDownload(blob, fileName = "TaiLieu.pdf") {
  if (!fileName.toLowerCase().endsWith(".pdf")) {
    fileName = `${fileName}.pdf`;
  }

  // 1. File System Access API trên Chrome/Edge/Cốc Cốc
  if (typeof window !== "undefined" && typeof window.showSaveFilePicker === "function") {
    try {
      const handle = await window.showSaveFilePicker({
        suggestedName: fileName,
        types: [
          {
            description: "Tài liệu PDF (*.pdf)",
            accept: {
              "application/pdf": [".pdf"],
            },
          },
        ],
      });

      const writableStream = await handle.createWritable();
      await writableStream.write(blob);
      await writableStream.close();

      return { method: "picker", success: true };
    } catch (err) {
      if (err?.name === "AbortError") {
        return { cancelled: true };
      }
      console.warn("showSaveFilePicker PDF failed, falling back to Blob download:", err);
    }
  }

  // 2. Fallback Blob Download cho Safari / Firefox / Mobile
  try {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileName;
    a.target = "_self";
    a.rel = "noopener";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 10000);

    return { method: "fallback", success: true };
  } catch (err) {
    console.error("triggerSafePdfDownload Blob fallback error:", err);
    return { error: err };
  }
}
