import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

const OPT1_DIR = path.join(rootDir, 'public/images/redesign/opt1');
const OPT2_DIR = path.join(rootDir, 'public/images/redesign/opt2');

[OPT1_DIR, OPT2_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

/* =========================================================================
   PHƯƠNG ÁN 1: KHIÊN PHỤNG VỤ ĐỒNG BỘ (SACRED HERALDIC CREST) - 256x256
   ========================================================================= */

const OPT1_SVGS = {
  'crest-khai-tam': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="opt1-parchment" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FCFAF5"/>
      <stop offset="100%" stop-color="#F2EBE0"/>
    </linearGradient>
    <linearGradient id="opt1-gold" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D9B76A"/>
      <stop offset="50%" stop-color="#B88A34"/>
      <stop offset="100%" stop-color="#8C631B"/>
    </linearGradient>
    <filter id="opt1-shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#241E1A" flood-opacity="0.08"/>
    </filter>
  </defs>

  <!-- Khiên Gothic Phụng Vụ -->
  <g filter="url(#opt1-shadow)">
    <path d="M128 20 C190 20 226 28 226 92 C226 172 128 236 128 236 C128 236 30 172 30 92 C30 28 66 20 128 20 Z" fill="url(#opt1-parchment)" stroke="url(#opt1-gold)" stroke-width="3.5"/>
    <path d="M128 28 C182 28 214 36 214 92 C214 163 128 222 128 222 C128 222 42 163 42 92 C42 36 74 28 128 28 Z" stroke="#D8C8AF" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
  </g>

  <!-- Vòng Hào Quang Nhành Lá Xanh Chiên Con -->
  <circle cx="128" cy="116" r="58" stroke="#2E7D32" stroke-width="1.8" stroke-dasharray="6 4" fill="none" opacity="0.6"/>

  <!-- Thánh Giá Hoa Nở (Flowering Cross) -->
  <g stroke="url(#opt1-gold)" stroke-width="2.5" stroke-linecap="round">
    <line x1="128" y1="56" x2="128" y2="78"/>
    <line x1="117" y1="65" x2="139" y2="65"/>
    <circle cx="128" cy="65" r="2.5" fill="#B88A34"/>
  </g>

  <!-- Chú Chiên Con (Agnus Dei - Mầm non ngây thơ) -->
  <g stroke="#2C3437" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
    <!-- Thân chiên êm ái -->
    <path d="M100 135 C92 130 84 122 88 112 C92 103 103 102 110 107 C116 102 127 100 136 104 C144 100 155 104 158 113 C163 124 156 137 147 141 C142 150 116 152 107 145 Z" fill="#FFFFFF"/>
    <!-- Đầu chiên cúi chào dịu dàng -->
    <ellipse cx="96" cy="114" rx="11" ry="9" fill="#FFFFFF"/>
    <!-- Tai chiên -->
    <path d="M89 110 C83 109 81 113 85 116 Z" fill="#FFFFFF"/>
    <!-- Mắt chiên ngây thơ -->
    <circle cx="94" cy="113" r="1.8" fill="#2C3437"/>
    <!-- Mũi miệng -->
    <path d="M87 116 Q89 119 92 117" stroke-width="1.5" fill="none"/>
    <!-- Chân chiên quỳ ngoan ngoãn -->
    <path d="M105 145 L103 154 M116 146 L116 155 M138 144 L140 154" stroke-width="2"/>
  </g>

  <!-- Mầm Cây Đức Tin Vươn Cao (Sprout of Faith) -->
  <path d="M128 174 V152 C128 145 117 138 110 144 C120 148 126 153 128 153 C130 153 136 148 146 144 C139 138 128 145 128 152" fill="#4CAF50" stroke="#2E7D32" stroke-width="2.2" stroke-linejoin="round"/>

  <!-- Dải Ribbon Khẩu Hiệu BAY CAO -->
  <path d="M72 198 H184" stroke="url(#opt1-gold)" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="68" cy="198" r="2.5" fill="#B88A34"/>
  <circle cx="188" cy="198" r="2.5" fill="#B88A34"/>
  <text x="128" y="193" font-family="'Cinzel', Georgia, serif" font-size="12" font-weight="700" fill="#7A5500" text-anchor="middle" letter-spacing="3">BAY CAO</text>
  <text x="128" y="210" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="700" fill="#2E7D32" text-anchor="middle" letter-spacing="1">NGÀNH CHIÊN CON</text>
</svg>
`,

  'crest-ruoc-le': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="opt1-parchment-rl" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FCFAF5"/>
      <stop offset="100%" stop-color="#F2EBE0"/>
    </linearGradient>
    <linearGradient id="opt1-gold-rl" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D9B76A"/>
      <stop offset="50%" stop-color="#B88A34"/>
      <stop offset="100%" stop-color="#8C631B"/>
    </linearGradient>
    <filter id="opt1-shadow-rl" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#241E1A" flood-opacity="0.08"/>
    </filter>
  </defs>

  <g filter="url(#opt1-shadow-rl)">
    <path d="M128 20 C190 20 226 28 226 92 C226 172 128 236 128 236 C128 236 30 172 30 92 C30 28 66 20 128 20 Z" fill="url(#opt1-parchment-rl)" stroke="url(#opt1-gold-rl)" stroke-width="3.5"/>
    <path d="M128 28 C182 28 214 36 214 92 C214 163 128 222 128 222 C128 222 42 163 42 92 C42 36 74 28 128 28 Z" stroke="#D8C8AF" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
  </g>

  <!-- Tia Sáng Vinh Quang Thánh Thể -->
  <g stroke="#E8C872" stroke-width="1.8" stroke-linecap="round" opacity="0.8">
    <line x1="128" y1="46" x2="128" y2="58"/>
    <line x1="156" y1="58" x2="148" y2="66"/>
    <line x1="100" y1="58" x2="108" y2="66"/>
    <line x1="168" y1="88" x2="156" y2="88"/>
    <line x1="88" y1="88" x2="100" y2="88"/>
  </g>

  <!-- Bánh Thánh (Mình Thánh Chúa) -->
  <circle cx="128" cy="88" r="28" fill="#FFFFFF" stroke="url(#opt1-gold-rl)" stroke-width="2.5"/>
  <circle cx="128" cy="88" r="23" fill="none" stroke="#E5D8BE" stroke-width="1" stroke-dasharray="2 2"/>
  <!-- Thánh Giá trên Bánh Thánh -->
  <path d="M128 72 V104 M114 82 H142" stroke="url(#opt1-gold-rl)" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="128" cy="88" r="4" fill="#FCFAF5" stroke="url(#opt1-gold-rl)" stroke-width="1.5"/>

  <!-- Chén Thánh Phụng Vụ (Chalice) -->
  <path d="M96 116 C96 142 114 148 123 150 V166 H110 C106 166 106 172 110 172 H146 C150 172 150 166 146 166 H133 V150 C142 148 160 142 160 116 H96 Z" fill="#FFFDF8" stroke="url(#opt1-gold-rl)" stroke-width="2.8" stroke-linejoin="round"/>
  <!-- Điểm nhấn Chén Thánh -->
  <ellipse cx="128" cy="116" rx="32" ry="5" fill="#FFF7E0" stroke="url(#opt1-gold-rl)" stroke-width="2"/>
  <circle cx="128" cy="158" r="4" fill="url(#opt1-gold-rl)"/>

  <!-- Bông Lúa Mì & Nhành Nho -->
  <g stroke="#2E7D32" stroke-width="2" stroke-linecap="round" fill="none">
    <path d="M80 148 C86 130 96 120 96 120"/>
    <path d="M176 148 C170 130 160 120 160 120"/>
  </g>
  <circle cx="78" cy="150" r="3.5" fill="#C5A059"/>
  <circle cx="72" cy="144" r="3" fill="#C5A059"/>
  <circle cx="178" cy="150" r="3.5" fill="#C5A059"/>
  <circle cx="184" cy="144" r="3" fill="#C5A059"/>

  <!-- Dải Ribbon Khẩu Hiệu TRONG SẠCH -->
  <path d="M68 198 H188" stroke="url(#opt1-gold-rl)" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="64" cy="198" r="2.5" fill="#B88A34"/>
  <circle cx="192" cy="198" r="2.5" fill="#B88A34"/>
  <text x="128" y="193" font-family="'Cinzel', Georgia, serif" font-size="11.5" font-weight="700" fill="#7A5500" text-anchor="middle" letter-spacing="2.5">TRONG SẠCH</text>
  <text x="128" y="210" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="700" fill="#2E7D32" text-anchor="middle" letter-spacing="1">NGÀNH ẤU NHI</text>
</svg>
`,

  'crest-them-suc': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="opt1-parchment-ts" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FCFAF5"/>
      <stop offset="100%" stop-color="#F2EBE0"/>
    </linearGradient>
    <linearGradient id="opt1-gold-ts" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D9B76A"/>
      <stop offset="50%" stop-color="#B88A34"/>
      <stop offset="100%" stop-color="#8C631B"/>
    </linearGradient>
    <filter id="opt1-shadow-ts" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#241E1A" flood-opacity="0.08"/>
    </filter>
  </defs>

  <g filter="url(#opt1-shadow-ts)">
    <path d="M128 20 C190 20 226 28 226 92 C226 172 128 236 128 236 C128 236 30 172 30 92 C30 28 66 20 128 20 Z" fill="url(#opt1-parchment-ts)" stroke="url(#opt1-gold-ts)" stroke-width="3.5"/>
    <path d="M128 28 C182 28 214 36 214 92 C214 163 128 222 128 222 C128 222 42 163 42 92 C42 36 74 28 128 28 Z" stroke="#D8C8AF" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
  </g>

  <!-- Hào Quang Lửa Thánh Linh -->
  <circle cx="128" cy="98" r="50" stroke="#E65100" stroke-width="1.2" stroke-dasharray="3 4" fill="none" opacity="0.6"/>

  <!-- Bảy Ngọn Lửa Ơn Chúa Thánh Thần (7 Tongues of Fire) -->
  <g fill="#D84315" stroke="#BF360C" stroke-width="1.2">
    <!-- Lửa đỉnh trung tâm -->
    <path d="M128 48 C130.5 53 133 57 128 62 C123 57 125.5 53 128 48 Z"/>
    <!-- 2 ngọn lửa tầng 2 -->
    <path d="M104 56 C107 61 108 64 104 69 C100 64 101 61 104 56 Z"/>
    <path d="M152 56 C155 61 156 64 152 69 C148 64 149 61 152 56 Z"/>
    <!-- 2 ngọn lửa tầng 3 -->
    <path d="M84 74 C87 79 87 82 84 87 C81 82 81 79 84 74 Z"/>
    <path d="M172 74 C175 79 175 82 172 87 C169 82 169 79 172 74 Z"/>
    <!-- 2 ngọn lửa tầng 4 -->
    <path d="M78 104 C81 108 80 111 76 116 C74 111 75 108 78 104 Z"/>
    <path d="M178 104 C181 108 180 111 176 116 C174 111 175 108 178 104 Z"/>
  </g>

  <!-- Chim Bồ Câu Thánh Thần Giáng Lâm (Holy Spirit Dove) -->
  <g stroke="#2C3437" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
    <path d="M128 138 C124 128 110 108 78 100 C96 110 102 124 106 134 C92 130 82 134 74 140 C88 142 100 148 106 154 C98 158 94 163 90 168 C102 163 116 158 124 154 L128 158 L132 154 C140 158 154 163 166 168 C162 163 158 158 150 154 C156 148 168 142 182 140 C174 134 164 130 150 134 C154 124 160 110 178 100 C146 108 132 128 128 138 Z" fill="#FFFFFF"/>
    <!-- Mắt bồ câu -->
    <circle cx="128" cy="144" r="2" fill="#2C3437"/>
  </g>

  <!-- Dải Ribbon Khẩu Hiệu QUẢNG ĐẠI -->
  <path d="M68 198 H188" stroke="url(#opt1-gold-ts)" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="64" cy="198" r="2.5" fill="#B88A34"/>
  <circle cx="192" cy="198" r="2.5" fill="#B88A34"/>
  <text x="128" y="193" font-family="'Cinzel', Georgia, serif" font-size="11.5" font-weight="700" fill="#7A5500" text-anchor="middle" letter-spacing="2.5">QUẢNG ĐẠI</text>
  <text x="128" y="210" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="700" fill="#C2410C" text-anchor="middle" letter-spacing="1">NGÀNH THIẾU NHI</text>
</svg>
`,

  'crest-phung-vu': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="opt1-parchment-pv" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FCFAF5"/>
      <stop offset="100%" stop-color="#F2EBE0"/>
    </linearGradient>
    <linearGradient id="opt1-gold-pv" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D9B76A"/>
      <stop offset="50%" stop-color="#B88A34"/>
      <stop offset="100%" stop-color="#8C631B"/>
    </linearGradient>
    <filter id="opt1-shadow-pv" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#241E1A" flood-opacity="0.08"/>
    </filter>
  </defs>

  <g filter="url(#opt1-shadow-pv)">
    <path d="M128 20 C190 20 226 28 226 92 C226 172 128 236 128 236 C128 236 30 172 30 92 C30 28 66 20 128 20 Z" fill="url(#opt1-parchment-pv)" stroke="url(#opt1-gold-pv)" stroke-width="3.5"/>
    <path d="M128 28 C182 28 214 36 214 92 C214 163 128 222 128 222 C128 222 42 163 42 92 C42 36 74 28 128 28 Z" stroke="#D8C8AF" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
  </g>

  <!-- Làn Khói Trầm Hương Nghi Ngút (Incense Smoke) -->
  <g stroke="#E65100" stroke-width="2" stroke-linecap="round" fill="none" opacity="0.75">
    <path d="M128 50 C118 60 138 68 128 78 C120 86 134 94 126 104" stroke-dasharray="4 4"/>
  </g>

  <!-- Cây Nến Phục Sinh (Paschal Candle) -->
  <!-- Ngọn lửa nến -->
  <path d="M128 62 C132 68 135 72 128 78 C121 72 124 68 128 62 Z" fill="#FFA726" stroke="#E65100" stroke-width="1.8"/>
  <circle cx="128" cy="73" r="2.5" fill="#FFE082"/>
  <!-- Thân nến -->
  <rect x="122" y="78" width="12" height="48" rx="2" fill="#FFFFFF" stroke="url(#opt1-gold-pv)" stroke-width="2.2"/>
  <!-- Thánh giá trên nến -->
  <path d="M122 92 H134 M128 86 V100" stroke="#C5A059" stroke-width="1.8" stroke-linecap="round"/>
  <!-- 4 đinh thánh -->
  <circle cx="128" cy="84" r="1.2" fill="#B71C1C"/>
  <circle cx="128" cy="102" r="1.2" fill="#B71C1C"/>
  <circle cx="120" cy="92" r="1.2" fill="#B71C1C"/>
  <circle cx="136" cy="92" r="1.2" fill="#B71C1C"/>

  <!-- Bình Hương Phụng Vụ (Thurible / Censer) -->
  <!-- Dây xích treo -->
  <g stroke="#8D6E63" stroke-width="1.5" stroke-dasharray="2 3">
    <line x1="102" y1="126" x2="118" y2="76"/>
    <line x1="154" y1="126" x2="138" y2="76"/>
    <line x1="128" y1="126" x2="128" y2="76"/>
  </g>
  <circle cx="128" cy="76" r="3.5" fill="url(#opt1-gold-pv)"/>

  <!-- Chén hương -->
  <path d="M92 142 C92 166 108 174 128 174 C148 174 164 166 164 142 H92 Z" fill="#FFFDF8" stroke="url(#opt1-gold-pv)" stroke-width="2.5" stroke-linejoin="round"/>
  <path d="M106 142 L116 126 H140 L150 142" stroke="url(#opt1-gold-pv)" stroke-width="2.2"/>
  <!-- Lỗ thoát khói trầm -->
  <circle cx="120" cy="134" r="2.2" fill="url(#opt1-gold-pv)"/>
  <circle cx="128" cy="134" r="2.2" fill="url(#opt1-gold-pv)"/>
  <circle cx="136" cy="134" r="2.2" fill="url(#opt1-gold-pv)"/>
  <!-- Chân đế bình hương -->
  <path d="M116 174 H140" stroke="url(#opt1-gold-pv)" stroke-width="3" stroke-linecap="round"/>

  <!-- Dải Ribbon Khẩu Hiệu TIẾN -->
  <path d="M78 198 H178" stroke="url(#opt1-gold-pv)" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="74" cy="198" r="2.5" fill="#B88A34"/>
  <circle cx="182" cy="198" r="2.5" fill="#B88A34"/>
  <text x="128" y="193" font-family="'Cinzel', Georgia, serif" font-size="12" font-weight="700" fill="#7A5500" text-anchor="middle" letter-spacing="3">TIẾN</text>
  <text x="128" y="210" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="700" fill="#E65100" text-anchor="middle" letter-spacing="1">KHỐI PHỤNG VỤ</text>
</svg>
`,

  'crest-kinh-thanh': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="opt1-parchment-kt" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FCFAF5"/>
      <stop offset="100%" stop-color="#F2EBE0"/>
    </linearGradient>
    <linearGradient id="opt1-gold-kt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D9B76A"/>
      <stop offset="50%" stop-color="#B88A34"/>
      <stop offset="100%" stop-color="#8C631B"/>
    </linearGradient>
    <filter id="opt1-shadow-kt" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#241E1A" flood-opacity="0.08"/>
    </filter>
  </defs>

  <g filter="url(#opt1-shadow-kt)">
    <path d="M128 20 C190 20 226 28 226 92 C226 172 128 236 128 236 C128 236 30 172 30 92 C30 28 66 20 128 20 Z" fill="url(#opt1-parchment-kt)" stroke="url(#opt1-gold-kt)" stroke-width="3.5"/>
    <path d="M128 28 C182 28 214 36 214 92 C214 163 128 222 128 222 C128 222 42 163 42 92 C42 36 74 28 128 28 Z" stroke="#D8C8AF" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
  </g>

  <!-- Ánh Hào Quang Lời Chúa Chiếu Tỏa -->
  <g stroke="#E8C872" stroke-width="1.8" stroke-linecap="round" opacity="0.85">
    <line x1="128" y1="46" x2="128" y2="58"/>
    <line x1="102" y1="54" x2="112" y2="64"/>
    <line x1="154" y1="54" x2="144" y2="64"/>
  </g>

  <!-- Thánh Giá Chiếc Gậy Mục Tử -->
  <g stroke="#B71C1C" stroke-width="2.5" stroke-linecap="round">
    <line x1="128" y1="54" x2="128" y2="76"/>
    <line x1="118" y1="62" x2="138" y2="62"/>
    <circle cx="128" cy="62" r="2.5" fill="#B71C1C"/>
  </g>

  <!-- Cuốn Kinh Thánh Rộng Mở (Sacred Scriptures - 73 Thư Quy) -->
  <g stroke="#2C3437" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
    <!-- Trang sách mở uốn lượn -->
    <path d="M128 116 C116 108 96 106 66 110 V156 C94 152 116 154 128 162 C140 154 162 152 190 156 V110 C160 106 140 108 128 116 Z" fill="#FFFFFF"/>
    <!-- Gáy sách trung tâm -->
    <line x1="128" y1="116" x2="128" y2="162" stroke-width="2.5"/>
    <!-- Dải ruy-băng đánh dấu trang Lời Chúa -->
    <path d="M128 162 C126 172 130 178 124 186 C122 188 124 190 126 189 L132 178 L128 162" fill="#B71C1C" stroke="#B71C1C" stroke-width="1.2"/>
  </g>

  <!-- Dòng chữ tượng trưng Kinh Thánh Cựu Ước & Tân Ước -->
  <g stroke="url(#opt1-gold-kt)" stroke-width="1.6" stroke-linecap="round">
    <line x1="78" y1="124" x2="114" y2="122"/>
    <line x1="78" y1="133" x2="112" y2="131"/>
    <line x1="78" y1="142" x2="104" y2="140"/>
    <line x1="142" y1="122" x2="178" y2="124"/>
    <line x1="144" y1="131" x2="178" y2="133"/>
    <line x1="152" y1="140" x2="178" y2="142"/>
  </g>

  <!-- Alpha & Omega (Khởi nguyên và Tận cùng) -->
  <text x="88" y="102" font-family="'Cinzel', Georgia, serif" font-size="11" font-weight="700" fill="#B88A34" text-anchor="middle">Α</text>
  <text x="168" y="102" font-family="'Cinzel', Georgia, serif" font-size="11" font-weight="700" fill="#B88A34" text-anchor="middle">Ω</text>

  <!-- Dải Ribbon Khẩu Hiệu THẮNG -->
  <path d="M74 198 H182" stroke="url(#opt1-gold-kt)" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="70" cy="198" r="2.5" fill="#B88A34"/>
  <circle cx="186" cy="198" r="2.5" fill="#B88A34"/>
  <text x="128" y="193" font-family="'Cinzel', Georgia, serif" font-size="12" font-weight="700" fill="#7A5500" text-anchor="middle" letter-spacing="3">THẮNG</text>
  <text x="128" y="210" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="700" fill="#B71C1C" text-anchor="middle" letter-spacing="1">HIỆP SĨ KINH THÁNH</text>
</svg>
`,

  'crest-vao-doi': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <linearGradient id="opt1-parchment-vd" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#FCFAF5"/>
      <stop offset="100%" stop-color="#F2EBE0"/>
    </linearGradient>
    <linearGradient id="opt1-gold-vd" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#D9B76A"/>
      <stop offset="50%" stop-color="#B88A34"/>
      <stop offset="100%" stop-color="#8C631B"/>
    </linearGradient>
    <filter id="opt1-shadow-vd" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#241E1A" flood-opacity="0.08"/>
    </filter>
  </defs>

  <g filter="url(#opt1-shadow-vd)">
    <path d="M128 20 C190 20 226 28 226 92 C226 172 128 236 128 236 C128 236 30 172 30 92 C30 28 66 20 128 20 Z" fill="url(#opt1-parchment-vd)" stroke="url(#opt1-gold-vd)" stroke-width="3.5"/>
    <path d="M128 28 C182 28 214 36 214 92 C214 163 128 222 128 222 C128 222 42 163 42 92 C42 36 74 28 128 28 Z" stroke="#D8C8AF" stroke-width="1.5" stroke-dasharray="3 3" fill="none"/>
  </g>

  <!-- Mỏ Neo Hy Vọng & Thánh Giá Kiên Vững (Crux Spes Anchor) -->
  <!-- Vòng khuyên đỉnh mỏ neo -->
  <circle cx="128" cy="62" r="8.5" stroke="url(#opt1-gold-vd)" stroke-width="3" fill="none"/>
  
  <!-- Thân Thánh Giá Mỏ Neo -->
  <g stroke="#2C3437" stroke-width="3.2" stroke-linecap="round">
    <line x1="128" y1="71" x2="128" y2="148"/>
    <!-- Xà ngang thập giá -->
    <line x1="104" y1="88" x2="152" y2="88"/>
    <circle cx="104" cy="88" r="2.5" fill="#2C3437"/>
    <circle cx="152" cy="88" r="2.5" fill="#2C3437"/>
  </g>

  <!-- Cánh Mỏ Neo Uốn Cong Cắm Sâu Vững Vàng -->
  <path d="M90 124 C94 148 110 162 128 162 C146 162 162 148 166 124" stroke="#2C3437" stroke-width="3.2" stroke-linecap="round" fill="none"/>
  <!-- Mũi mỏ neo (Flukes) -->
  <path d="M84 128 L90 120 L96 130 M172 128 L166 120 L160 130" stroke="#2C3437" stroke-width="2.5" stroke-linejoin="round" fill="#FFFFFF"/>

  <!-- Làn Sóng Trần Thế (Waves of Life) -->
  <g stroke="#1976D2" stroke-width="2.2" stroke-linecap="round" fill="none" opacity="0.85">
    <path d="M68 168 C80 163 94 171 106 167 C118 163 130 171 142 167 C154 163 168 171 180 167 C186 164 190 167 194 167"/>
    <path d="M78 177 C90 173 102 181 114 177 C126 173 138 181 150 177 C162 173 174 181 184 177" stroke-width="1.5" opacity="0.5"/>
  </g>

  <!-- Ngôi Sao Biển Soi Đường (Stella Maris Star) -->
  <path d="M128 42 L130 48 L136 49 L131 53 L133 59 L128 55 L123 59 L125 53 L120 49 L126 48 Z" fill="url(#opt1-gold-vd)"/>

  <!-- Dải Ribbon Khẩu Hiệu DẤN THÂN -->
  <path d="M70 198 H186" stroke="url(#opt1-gold-vd)" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="66" cy="198" r="2.5" fill="#B88A34"/>
  <circle cx="190" cy="198" r="2.5" fill="#B88A34"/>
  <text x="128" y="193" font-family="'Cinzel', Georgia, serif" font-size="11.5" font-weight="700" fill="#7A5500" text-anchor="middle" letter-spacing="2.5">DẤN THÂN</text>
  <text x="128" y="210" font-family="'Plus Jakarta Sans', sans-serif" font-size="8.5" font-weight="700" fill="#B71C1C" text-anchor="middle" letter-spacing="1">NGÀNH VÀO ĐỜI</text>
</svg>
`
};

/* =========================================================================
   PHƯƠNG ÁN 2: PHÙ HIỆU KHĂN QUÀNG VẢI THÊU DỆT THẬT (WOVEN SCARF ROUNDEL) - 256x256
   ========================================================================= */

const OPT2_SVGS = {
  'patch-khai-tam': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <!-- Texture sớ vải dệt chéo (Twill Fabric Weave) -->
    <pattern id="twill-weave-kt" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 8 L8 0 M0 0 L8 8" stroke="#000000" stroke-width="0.75" opacity="0.06"/>
    </pattern>
    <filter id="patch-shadow-kt" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#14261D" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Đĩa vải thêu dệt màu Xanh Lá Trơn (Ngành Chiên Con) -->
  <g filter="url(#patch-shadow-kt)">
    <!-- Vòng chỉ vắt sổ ngoài cùng (Overlock Stitch) -->
    <circle cx="128" cy="128" r="118" fill="#1B5E20" stroke="#0D3B12" stroke-width="3"/>
    <circle cx="128" cy="128" r="115" fill="none" stroke="#2E7D32" stroke-width="4" stroke-dasharray="4 2"/>
    <!-- Thân vải canvas kem tự nhiên -->
    <circle cx="128" cy="128" r="106" fill="#FBF9F4"/>
    <circle cx="128" cy="128" r="106" fill="url(#twill-weave-kt)"/>
    <!-- Đường may lùi giữ viền (Lockstitch) -->
    <circle cx="128" cy="128" r="100" fill="none" stroke="#1B5E20" stroke-width="2" stroke-dasharray="5 3"/>
  </g>

  <!-- Vòng tròn tâm điểm thêu nổi -->
  <circle cx="128" cy="122" r="66" fill="#F4EFE6" stroke="#C5A059" stroke-width="1.8" stroke-dasharray="3 3"/>

  <!-- Thánh Giá Chỉ Thêu Vàng Kim -->
  <g stroke="#C5A059" stroke-width="3" stroke-linecap="round">
    <line x1="128" y1="68" x2="128" y2="94"/>
    <line x1="116" y1="78" x2="140" y2="78"/>
    <circle cx="128" cy="78" r="3" fill="#C5A059"/>
  </g>

  <!-- Chú Chiên Con Thêu Nổi Mộc Mạc -->
  <g stroke="#2C3437" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M102 138 C94 133 86 125 90 115 C94 106 105 105 112 110 C118 105 129 103 138 107 C146 103 157 107 160 116 C165 127 158 140 149 144 C144 153 118 155 109 148 Z" fill="#FFFFFF"/>
    <ellipse cx="98" cy="117" rx="10" ry="8" fill="#FFFFFF"/>
    <circle cx="96" cy="116" r="1.8" fill="#2C3437"/>
    <!-- Chân chiên quỳ -->
    <path d="M107 148 L105 156 M138 147 L140 156" stroke-width="2.2"/>
  </g>

  <!-- Mầm Cây Xanh Thêu Chỉ Nổi -->
  <path d="M128 172 V152 C128 146 118 140 112 145 C121 148 126 153 128 153 C130 153 135 148 144 145 C138 140 128 146 128 152" fill="#4CAF50" stroke="#2E7D32" stroke-width="2.5" stroke-linejoin="round"/>

  <!-- Vòm Chữ Thêu Chỉ Sắc Nét -->
  <text x="128" y="196" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#1B5E20" text-anchor="middle" letter-spacing="1.5">CHIÊN CON · BAY CAO</text>
  <text x="128" y="210" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="700" fill="#6B7280" text-anchor="middle" letter-spacing="1">KHĂN XANH LÁ TRƠN</text>
</svg>
`,

  'patch-ruoc-le': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <pattern id="twill-weave-rl" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 8 L8 0 M0 0 L8 8" stroke="#000000" stroke-width="0.75" opacity="0.06"/>
    </pattern>
    <filter id="patch-shadow-rl" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#14261D" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Đĩa vải thêu màu Xanh Lá có viền Vàng (Ngành Ấu Nhi) -->
  <g filter="url(#patch-shadow-rl)">
    <!-- Viền ngoài màu Vàng Kim thực tế của Khăn RLLĐ -->
    <circle cx="128" cy="128" r="118" fill="#FBC02D" stroke="#C49000" stroke-width="3"/>
    <circle cx="128" cy="128" r="115" fill="none" stroke="#F57F17" stroke-width="4" stroke-dasharray="4 2"/>
    <!-- Vành đai xanh lá của khăn ngành -->
    <circle cx="128" cy="128" r="106" fill="#1B5E20"/>
    <circle cx="128" cy="128" r="106" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="3 3"/>
    <!-- Nền vải canvas kem thêu trung tâm -->
    <circle cx="128" cy="128" r="94" fill="#FBF9F4"/>
    <circle cx="128" cy="128" r="94" fill="url(#twill-weave-rl)"/>
    <circle cx="128" cy="128" r="88" fill="none" stroke="#2E7D32" stroke-width="2" stroke-dasharray="5 3"/>
  </g>

  <!-- Bánh Thánh & Chén Thánh Thêu Chỉ Vàng -->
  <g stroke="#C5A059" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <!-- Bánh Thánh Mình Thánh Chúa -->
    <circle cx="128" cy="86" r="22" fill="#FFFFFF"/>
    <path d="M128 72 V100 M116 82 H140" stroke-width="2.2"/>
    <circle cx="128" cy="86" r="3" fill="#FBF9F4"/>

    <!-- Chén Thánh Phụng Vụ -->
    <path d="M102 110 C102 132 116 138 124 140 V154 H112 C108 154 108 160 112 160 H144 C148 160 148 154 144 154 H132 V140 C140 138 154 132 154 110 H102 Z" fill="#FFFDF8"/>
    <ellipse cx="128" cy="110" rx="26" ry="4" fill="#FFF7E0"/>
    <circle cx="128" cy="147" r="3.5" fill="#C5A059"/>
  </g>

  <!-- Nhành Bông Lúa Miến Thêu Xanh & Vàng -->
  <g stroke="#2E7D32" stroke-width="2" stroke-linecap="round" fill="none">
    <path d="M88 136 C92 124 100 116 100 116"/>
    <path d="M168 136 C164 124 156 116 156 116"/>
  </g>
  <circle cx="86" cy="138" r="3" fill="#FBC02D"/>
  <circle cx="170" cy="138" r="3" fill="#FBC02D"/>

  <!-- Vòm Chữ Thêu Sắc Nét -->
  <text x="128" y="184" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#1B5E20" text-anchor="middle" letter-spacing="1.5">ẤU NHI · TRONG SẠCH</text>
  <text x="128" y="198" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="700" fill="#B45309" text-anchor="middle" letter-spacing="1">KHĂN XANH VIỀN VÀNG</text>
</svg>
`,

  'patch-them-suc': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <pattern id="twill-weave-ts" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 8 L8 0 M0 0 L8 8" stroke="#000000" stroke-width="0.75" opacity="0.06"/>
    </pattern>
    <filter id="patch-shadow-ts" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#3E2723" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Đĩa vải thêu màu Vàng có viền Đỏ (Ngành Thiếu Nhi) -->
  <g filter="url(#patch-shadow-ts)">
    <!-- Viền chỉ Đỏ Thắm thực tế của Khăn Thêm Sức -->
    <circle cx="128" cy="128" r="118" fill="#D32F2F" stroke="#9A0007" stroke-width="3"/>
    <circle cx="128" cy="128" r="115" fill="none" stroke="#B71C1C" stroke-width="4" stroke-dasharray="4 2"/>
    <!-- Vành đai vàng tươi của khăn ngành -->
    <circle cx="128" cy="128" r="106" fill="#FBC02D"/>
    <circle cx="128" cy="128" r="106" fill="none" stroke="#FFF9C4" stroke-width="1.5" stroke-dasharray="3 3"/>
    <!-- Nền vải canvas kem thêu trung tâm -->
    <circle cx="128" cy="128" r="94" fill="#FBF9F4"/>
    <circle cx="128" cy="128" r="94" fill="url(#twill-weave-ts)"/>
    <circle cx="128" cy="128" r="88" fill="none" stroke="#D32F2F" stroke-width="2" stroke-dasharray="5 3"/>
  </g>

  <!-- Ngọn Lửa Thánh Linh & Chim Bồ Câu Thêu Nổi -->
  <g fill="#D84315" stroke="#BF360C" stroke-width="1">
    <path d="M128 62 C130 66 132 69 128 73 C124 69 126 66 128 62 Z"/>
    <path d="M110 68 C112 72 113 74 110 78 C107 74 108 72 110 68 Z"/>
    <path d="M146 68 C148 72 149 74 146 78 C143 74 144 72 146 68 Z"/>
    <path d="M96 82 C98 86 98 88 96 92 C94 88 94 86 96 82 Z"/>
    <path d="M160 82 C162 86 162 88 160 92 C158 88 158 86 160 82 Z"/>
  </g>

  <!-- Chim Bồ Câu Thần Khí Thêu Chỉ Trắng -->
  <g stroke="#2C3437" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M128 128 C124 120 112 104 84 98 C98 106 104 118 106 126 C96 122 88 126 82 130 C94 132 102 136 106 142 C100 146 96 150 92 154 C104 150 116 146 124 142 L128 146 L132 142 C140 146 152 150 164 154 C160 150 156 146 150 142 C154 136 162 132 174 130 C168 126 160 122 150 126 C152 118 158 106 172 98 C144 104 132 120 128 128 Z" fill="#FFFFFF"/>
    <circle cx="128" cy="134" r="2" fill="#2C3437"/>
  </g>

  <!-- Vòm Chữ Thêu Sắc Nét -->
  <text x="128" y="184" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#B45309" text-anchor="middle" letter-spacing="1.5">THIẾU NHI · QUẢNG ĐẠI</text>
  <text x="128" y="198" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="700" fill="#B71C1C" text-anchor="middle" letter-spacing="1">KHĂN VÀNG VIỀN ĐỎ</text>
</svg>
`,

  'patch-phung-vu': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <pattern id="twill-weave-pv" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 8 L8 0 M0 0 L8 8" stroke="#000000" stroke-width="0.75" opacity="0.06"/>
    </pattern>
    <filter id="patch-shadow-pv" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#3E2723" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Đĩa vải thêu màu Cam có viền Trắng (Khối Phụng Vụ) -->
  <g filter="url(#patch-shadow-pv)">
    <!-- Viền chỉ Trắng vắt sổ nổi bật trên nền Cam -->
    <circle cx="128" cy="128" r="118" fill="#FFFFFF" stroke="#E65100" stroke-width="3"/>
    <circle cx="128" cy="128" r="115" fill="none" stroke="#FFA726" stroke-width="4" stroke-dasharray="4 2"/>
    <!-- Vành đai cam nhiệt thành của khăn Phụng Vụ -->
    <circle cx="128" cy="128" r="106" fill="#E65100"/>
    <circle cx="128" cy="128" r="106" fill="none" stroke="#FFE0B2" stroke-width="1.5" stroke-dasharray="3 3"/>
    <!-- Nền vải canvas kem thêu trung tâm -->
    <circle cx="128" cy="128" r="94" fill="#FBF9F4"/>
    <circle cx="128" cy="128" r="94" fill="url(#twill-weave-pv)"/>
    <circle cx="128" cy="128" r="88" fill="none" stroke="#E65100" stroke-width="2" stroke-dasharray="5 3"/>
  </g>

  <!-- Cây Nến Sáng & Lư Hương Bàn Thờ Thêu Nổi -->
  <!-- Ngọn Lửa Nến -->
  <path d="M128 68 C131 73 133 76 128 81 C123 76 125 73 128 68 Z" fill="#FFA726" stroke="#E65100" stroke-width="1.5"/>
  <rect x="123" y="81" width="10" height="38" rx="2" fill="#FFFFFF" stroke="#C5A059" stroke-width="2"/>
  <path d="M123 92 H133 M128 87 V98" stroke="#C5A059" stroke-width="1.5"/>

  <!-- Lư Hương Phụng Vụ Thêu Chỉ Vàng -->
  <g stroke="#C5A059" stroke-width="2.2" stroke-linejoin="round" stroke-linecap="round">
    <path d="M102 134 C102 152 114 158 128 158 C142 158 154 152 154 134 H102 Z" fill="#FFFDF8"/>
    <path d="M112 134 L118 122 H138 L144 134" stroke-width="1.8"/>
    <!-- Dây xích thêu -->
    <line x1="110" y1="122" x2="122" y2="82" stroke="#8D6E63" stroke-width="1.5" stroke-dasharray="2 2"/>
    <line x1="146" y1="122" x2="134" y2="82" stroke="#8D6E63" stroke-width="1.5" stroke-dasharray="2 2"/>
    <circle cx="128" cy="82" r="3" fill="#C5A059"/>
  </g>

  <!-- Vòm Chữ Thêu Sắc Nét -->
  <text x="128" y="184" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#E65100" text-anchor="middle" letter-spacing="1.5">PHỤNG VỤ · TIẾN BƯỚC</text>
  <text x="128" y="198" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="700" fill="#C2410C" text-anchor="middle" letter-spacing="1">KHĂN DA CAM VIỀN TRẮNG</text>
</svg>
`,

  'patch-kinh-thanh': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <pattern id="twill-weave-kt-p" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 8 L8 0 M0 0 L8 8" stroke="#000000" stroke-width="0.75" opacity="0.06"/>
    </pattern>
    <filter id="patch-shadow-kt-p" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#3E2723" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Đĩa vải thêu màu Đỏ có viền Vàng (Ngành Hiệp Sĩ Kinh Thánh) -->
  <g filter="url(#patch-shadow-kt-p)">
    <!-- Viền chỉ Vàng Kim sắc nét trên nền Đỏ Thắm -->
    <circle cx="128" cy="128" r="118" fill="#FBC02D" stroke="#C49000" stroke-width="3"/>
    <circle cx="128" cy="128" r="115" fill="none" stroke="#F57F17" stroke-width="4" stroke-dasharray="4 2"/>
    <!-- Vành đai đỏ nhiệt huyết của khăn Kinh Thánh -->
    <circle cx="128" cy="128" r="106" fill="#B71C1C"/>
    <circle cx="128" cy="128" r="106" fill="none" stroke="#FFCDD2" stroke-width="1.5" stroke-dasharray="3 3"/>
    <!-- Nền vải canvas kem thêu trung tâm -->
    <circle cx="128" cy="128" r="94" fill="#FBF9F4"/>
    <circle cx="128" cy="128" r="94" fill="url(#twill-weave-kt-p)"/>
    <circle cx="128" cy="128" r="88" fill="none" stroke="#B71C1C" stroke-width="2" stroke-dasharray="5 3"/>
  </g>

  <!-- Cuốn Sách Thánh & Thập Tự Thêu Nổi -->
  <g stroke="#C5A059" stroke-width="2.5" stroke-linecap="round">
    <line x1="128" y1="62" x2="128" y2="84"/>
    <line x1="118" y1="70" x2="138" y2="70"/>
    <circle cx="128" cy="70" r="2.5" fill="#C5A059"/>
  </g>

  <!-- Cuốn Kinh Thánh Mở Rộng -->
  <g stroke="#2C3437" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round">
    <path d="M128 108 C118 100 102 98 78 102 V142 C102 138 118 140 128 146 C138 140 154 138 178 142 V102 C154 98 138 100 128 108 Z" fill="#FFFFFF"/>
    <line x1="128" y1="108" x2="128" y2="146" stroke-width="2.5"/>
    <path d="M128 146 C126 154 130 158 126 166 L131 160 L128 146" fill="#B71C1C" stroke="#B71C1C" stroke-width="1.2"/>
  </g>

  <!-- Dòng chữ Thánh Kinh thêu chỉ vàng -->
  <g stroke="#C5A059" stroke-width="1.5" stroke-linecap="round">
    <line x1="88" y1="114" x2="116" y2="112"/>
    <line x1="88" y1="122" x2="114" y2="120"/>
    <line x1="88" y1="130" x2="108" y2="128"/>
    <line x1="140" y1="112" x2="168" y2="114"/>
    <line x1="142" y1="120" x2="168" y2="122"/>
    <line x1="148" y1="128" x2="168" y2="130"/>
  </g>

  <!-- Vòm Chữ Thêu Sắc Nét -->
  <text x="128" y="184" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#B71C1C" text-anchor="middle" letter-spacing="1.5">KINH THÁNH · THẮNG</text>
  <text x="128" y="198" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="700" fill="#B45309" text-anchor="middle" letter-spacing="1">KHĂN ĐỎ VIỀN VÀNG</text>
</svg>
`,

  'patch-vao-doi': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" width="256" height="256">
  <defs>
    <pattern id="twill-weave-vd-p" width="8" height="8" patternUnits="userSpaceOnUse">
      <path d="M0 8 L8 0 M0 0 L8 8" stroke="#000000" stroke-width="0.75" opacity="0.06"/>
    </pattern>
    <filter id="patch-shadow-vd-p" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="5" stdDeviation="6" flood-color="#3E2723" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Đĩa vải thêu màu Đỏ có viền Trắng (Ngành Vào Đời) -->
  <g filter="url(#patch-shadow-vd-p)">
    <!-- Viền chỉ Trắng tinh khôi sắc nét của người Trưởng thành -->
    <circle cx="128" cy="128" r="118" fill="#FFFFFF" stroke="#B71C1C" stroke-width="3"/>
    <circle cx="128" cy="128" r="115" fill="none" stroke="#EF9A9A" stroke-width="4" stroke-dasharray="4 2"/>
    <!-- Vành đai đỏ nhiệt thành của khăn Vào Đời -->
    <circle cx="128" cy="128" r="106" fill="#B71C1C"/>
    <circle cx="128" cy="128" r="106" fill="none" stroke="#FFCDD2" stroke-width="1.5" stroke-dasharray="3 3"/>
    <!-- Nền vải canvas kem thêu trung tâm -->
    <circle cx="128" cy="128" r="94" fill="#FBF9F4"/>
    <circle cx="128" cy="128" r="94" fill="url(#twill-weave-vd-p)"/>
    <circle cx="128" cy="128" r="88" fill="none" stroke="#B71C1C" stroke-width="2" stroke-dasharray="5 3"/>
  </g>

  <!-- Mỏ Neo Hy Vọng & Thập Tự Thêu Nổi -->
  <circle cx="128" cy="68" r="7" stroke="#C5A059" stroke-width="2.5" fill="none"/>
  
  <g stroke="#2C3437" stroke-width="3" stroke-linecap="round">
    <line x1="128" y1="75" x2="128" y2="136"/>
    <line x1="108" y1="88" x2="148" y2="88"/>
    <circle cx="108" cy="88" r="2.2" fill="#2C3437"/>
    <circle cx="148" cy="88" r="2.2" fill="#2C3437"/>
  </g>

  <!-- Cánh Mỏ Neo Thêu Chỉ Nổi Cắm Sóng -->
  <path d="M96 118 C100 138 112 148 128 148 C144 148 156 138 160 118" stroke="#2C3437" stroke-width="3" stroke-linecap="round" fill="none"/>
  <path d="M92 122 L96 116 L100 124 M164 122 L160 116 L156 124" stroke="#2C3437" stroke-width="2.2" stroke-linejoin="round" fill="#FFFFFF"/>

  <!-- Làn sóng thế gian thêu chỉ xanh dương -->
  <path d="M78 154 C88 150 98 156 108 153 C118 150 128 156 138 153 C148 150 158 156 168 153" stroke="#1976D2" stroke-width="2" stroke-linecap="round" fill="none"/>

  <!-- Vòm Chữ Thêu Sắc Nét -->
  <text x="128" y="184" font-family="'Plus Jakarta Sans', sans-serif" font-size="11" font-weight="800" fill="#B71C1C" text-anchor="middle" letter-spacing="1.5">VÀO ĐỜI · DẤN THÂN</text>
  <text x="128" y="198" font-family="'Plus Jakarta Sans', sans-serif" font-size="8" font-weight="700" fill="#6B7280" text-anchor="middle" letter-spacing="1">KHĂN ĐỎ VIỀN TRẮNG</text>
</svg>
`
};

/* =========================================================================
   GHI CÁC FILE SVG VÀO THƯ MỤC
   ========================================================================= */

console.log('Writing Option 1 SVGs...');
for (const [name, content] of Object.entries(OPT1_SVGS)) {
  const filePath = path.join(OPT1_DIR, `${name}.svg`);
  fs.writeFileSync(filePath, content.trim(), 'utf-8');
  console.log(` -> Saved ${filePath}`);
}

console.log('\nWriting Option 2 SVGs...');
for (const [name, content] of Object.entries(OPT2_SVGS)) {
  const filePath = path.join(OPT2_DIR, `${name}.svg`);
  fs.writeFileSync(filePath, content.trim(), 'utf-8');
  console.log(` -> Saved ${filePath}`);
}

console.log('\nAll 12 vector assets for both options generated successfully!');
