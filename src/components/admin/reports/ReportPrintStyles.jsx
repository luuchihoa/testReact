import React from "react";

/**
 * ReportPrintStyles
 *
 * Tách riêng khỏi ReportsTab để component chính không bị "phình" bởi
 * một khối CSS dài không liên quan tới logic render bảng. Nếu dự án
 * dùng CSS Modules / Tailwind layer riêng, khối này có thể chuyển
 * thẳng sang file .css và import tĩnh thay vì <style> inline.
 */
export function ReportPrintStyles() {
  return (
    <style>{`
      @media print {
        body * { visibility: hidden; }
        #admin-reports-print, #admin-reports-print * { visibility: visible; }
        #admin-reports-print {
          position: absolute; left: 0; top: 0; width: 100%;
          background: white !important;
        }
        .ag-no-print { display: none !important; }

        * {
          backdrop-filter: none !important;
          -webkit-backdrop-filter: none !important;
          text-shadow: none !important;
          box-shadow: none !important;
        }

        table {
          border-collapse: collapse !important;
          width: 100% !important;
          border: 1px solid #000 !important;
        }
        th, td {
          border: 0.5pt solid #000 !important;
          padding: 8px !important;
        }
        thead tr { background-color: #f3f4f6 !important; -webkit-print-color-adjust: exact; }

        .sticky { position: static !important; }
      }
    `}</style>
  );
}