import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import puppeteer from 'puppeteer';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Thư mục lưu trữ assets Phương Án 1
const OPT1_DIR = path.join(rootDir, 'public/images/opt1');
if (!fs.existsSync(OPT1_DIR)) {
  fs.mkdirSync(OPT1_DIR, { recursive: true });
}

/* =========================================================================
   1. DEFINITIONS OF 7 SACRED LITURGICAL VECTOR EMBLEMS (OPTION 1)
   ========================================================================= */

const SVGS = {
  // LOGO CHÍNH: Marian Monogram Crest (Mẹ Mân Côi)
  'logo-marian': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdf0cd"/>
      <stop offset="35%" stop-color="#dfba6b"/>
      <stop offset="70%" stop-color="#b88b32"/>
      <stop offset="100%" stop-color="#805b12"/>
    </linearGradient>
    <linearGradient id="emeraldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#3b624f"/>
      <stop offset="100%" stop-color="#1d3428"/>
    </linearGradient>
    <linearGradient id="softHalo" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#dfba6b" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="#dfba6b" stop-opacity="0"/>
    </linearGradient>
    <filter id="subtleGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-color="#14261d" flood-opacity="0.2"/>
    </filter>
  </defs>

  <!-- Nền đĩa tròn ngọc lục bảo sang trọng với viền vàng đôi -->
  <circle cx="256" cy="256" r="236" fill="url(#emeraldGrad)"/>
  <circle cx="256" cy="256" r="236" fill="none" stroke="url(#goldGrad)" stroke-width="4"/>
  <circle cx="256" cy="256" r="226" fill="none" stroke="url(#goldGrad)" stroke-width="1.5" stroke-dasharray="3 3"/>
  <circle cx="256" cy="256" r="200" fill="url(#softHalo)"/>

  <!-- Triều thiên 12 Ngôi Sao Nữ Vương Thiên Đàng -->
  <g fill="url(#goldGrad)" opacity="0.95">
    <!-- Vòng 12 ngôi sao nhỏ ở vòm trên -->
    <path d="M256 62 l2 6 6-2 -4 5 5 4 -6 1 1 6 -5-4 -5 4 1-6 -6-1 5-4 -4-5 6 2 z" transform="scale(0.8) translate(64, 15)"/>
    <circle cx="205" cy="76" r="3.5"/>
    <circle cx="160" cy="98" r="3.5"/>
    <circle cx="125" cy="132" r="3.5"/>
    <circle cx="102" cy="176" r="3.5"/>
    <circle cx="307" cy="76" r="3.5"/>
    <circle cx="352" cy="98" r="3.5"/>
    <circle cx="387" cy="132" r="3.5"/>
    <circle cx="410" cy="176" r="3.5"/>
  </g>

  <!-- Vương Miện Nữ Vương (Queen Crown) -->
  <g filter="url(#subtleGlow)">
    <path d="M196 150 L210 115 L235 135 L256 95 L277 135 L302 115 L316 150 Z" fill="url(#goldGrad)"/>
    <!-- Vòng đai vương miện gắn ngọc -->
    <rect x="192" y="150" width="128" height="12" rx="4" fill="url(#goldGrad)"/>
    <circle cx="208" cy="156" r="3" fill="#ffffff" opacity="0.9"/>
    <circle cx="232" cy="156" r="3.5" fill="#314e3e"/>
    <circle cx="256" cy="156" r="4" fill="#991b1b"/>
    <circle cx="280" cy="156" r="3.5" fill="#314e3e"/>
    <circle cx="304" cy="156" r="3" fill="#ffffff" opacity="0.9"/>
    <!-- Ngọc đỉnh chóp -->
    <circle cx="210" cy="113" r="4.5" fill="#ffffff"/>
    <circle cx="256" cy="93" r="6" fill="#ffffff"/>
    <circle cx="302" cy="113" r="4.5" fill="#ffffff"/>
  </g>

  <!-- Thánh Giá Kitô Trung Tâm (Vươn cao từ mẫu tự M) -->
  <g fill="url(#goldGrad)" filter="url(#subtleGlow)">
    <rect x="250" y="125" width="12" height="175" rx="3"/>
    <rect x="226" y="165" width="60" height="12" rx="3"/>
    <!-- Đỉnh nhọn thánh giá -->
    <path d="M256 118 L262 125 L250 125 Z"/>
  </g>

  <!-- Mẫu Tự Marian Monogram 'M' Lộng Lẫy Tối Giản -->
  <g filter="url(#subtleGlow)">
    <!-- Nét uốn mềm mại bên trái -->
    <path d="M136 340 C145 285 168 215 205 185 C222 172 238 185 248 215 L256 240 L264 215 C274 185 290 172 307 185 C344 215 367 285 376 340 C378 350 366 356 358 348 C345 330 330 270 306 230 C296 212 286 215 280 232 L266 276 C262 288 250 288 246 276 L232 232 C226 215 216 212 206 230 C182 270 167 330 154 348 C146 356 134 350 136 340 Z" fill="url(#goldGrad)"/>
    <!-- Chân đế thanh lịch hai bên của chữ M -->
    <ellipse cx="140" cy="346" rx="14" ry="5" fill="url(#goldGrad)"/>
    <ellipse cx="372" cy="346" rx="14" ry="5" fill="url(#goldGrad)"/>
  </g>

  <!-- Tràng Chuỗi Mân Côi Vàng Kim (Dưới chân chữ M) -->
  <g fill="url(#goldGrad)" opacity="0.95">
    <!-- Chuỗi hạt cung tròn phía dưới -->
    <circle cx="160" cy="365" r="4.5"/>
    <circle cx="180" cy="380" r="4.5"/>
    <circle cx="202" cy="392" r="4.5"/>
    <circle cx="226" cy="400" r="4.5"/>
    <circle cx="256" cy="403" r="5.5"/>
    <circle cx="286" cy="400" r="4.5"/>
    <circle cx="310" cy="392" r="4.5"/>
    <circle cx="332" cy="380" r="4.5"/>
    <circle cx="352" cy="365" r="4.5"/>
    <!-- Dây rủ xuống mang Thánh Giá -->
    <circle cx="256" cy="418" r="4"/>
    <circle cx="256" cy="430" r="4"/>
    <!-- Thánh giá Mân Côi nhỏ phía dưới -->
    <rect x="253" y="440" width="6" height="28" rx="1.5"/>
    <rect x="246" y="448" width="20" height="6" rx="1.5"/>
  </g>
</svg>`,

  // 1. KHỐI KHAI TÂM: Chiên Con Thiên Chúa Vinh Hiển (Heraldic Standing Agnus Dei)
  'badge-khai-tam': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgKt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f0fdf4"/>
      <stop offset="100%" stop-color="#dcfce7"/>
    </linearGradient>
    <linearGradient id="goldGradKt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#eab308"/>
      <stop offset="100%" stop-color="#a16207"/>
    </linearGradient>
    <linearGradient id="lambGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f1f5f9"/>
    </linearGradient>
    <filter id="lambShadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="5" stdDeviation="7" flood-color="#064e3b" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Khung Squircle Tông Xanh Mạ Non -->
  <rect x="20" y="20" width="472" height="472" rx="110" fill="url(#bgKt)" stroke="#34d399" stroke-width="4"/>
  <rect x="32" y="32" width="448" height="448" rx="98" fill="none" stroke="#059669" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6 4"/>

  <!-- Hào Quang Mặt Trời Nhẹ Nhàng Phía Sau -->
  <circle cx="256" cy="220" r="140" fill="#ecfdf5" opacity="0.8"/>
  <circle cx="256" cy="220" r="125" fill="none" stroke="#a7f3d0" stroke-width="1.5" stroke-dasharray="4 4"/>

  <!-- Hào Quang Chữ Thập (Cruciform Nimbus) Của Chiên Thiên Chúa -->
  <g transform="translate(195, 175)" filter="url(#lambShadow)">
    <circle cx="0" cy="0" r="46" fill="url(#goldGradKt)"/>
    <circle cx="0" cy="0" r="41" fill="#fef08a"/>
    <!-- Chữ Thập Đỏ Phụng Vụ -->
    <rect x="-5" y="-36" width="10" height="72" fill="#dc2626" rx="2"/>
    <rect x="-36" y="-5" width="72" height="10" fill="#dc2626" rx="2"/>
    <circle cx="0" cy="0" r="41" fill="none" stroke="#ca8a04" stroke-width="2"/>
  </g>

  <!-- Cuốn Sách Bảy Phong Ấn (Book of Seven Seals - Khải Huyền 5:1) -->
  <g filter="url(#lambShadow)">
    <path d="M140 375 L372 375 L385 415 L127 415 Z" fill="#991b1b" stroke="url(#goldGradKt)" stroke-width="3"/>
    <rect x="135" y="375" width="242" height="12" rx="2" fill="url(#goldGradKt)"/>
    <!-- 7 Dải Niêm Phong Rủ Xuống Mang Ấn Vàng -->
    <g fill="#dc2626" stroke="#ca8a04" stroke-width="1">
      <rect x="155" y="387" width="10" height="35" rx="1"/>
      <circle cx="160" cy="422" r="5" fill="url(#goldGradKt)"/>
      <rect x="187" y="387" width="10" height="35" rx="1"/>
      <circle cx="192" cy="422" r="5" fill="url(#goldGradKt)"/>
      <rect x="219" y="387" width="10" height="35" rx="1"/>
      <circle cx="224" cy="422" r="5" fill="url(#goldGradKt)"/>
      <rect x="251" y="387" width="10" height="35" rx="1"/>
      <circle cx="256" cy="422" r="5" fill="url(#goldGradKt)"/>
      <rect x="283" y="387" width="10" height="35" rx="1"/>
      <circle cx="288" cy="422" r="5" fill="url(#goldGradKt)"/>
      <rect x="315" y="387" width="10" height="35" rx="1"/>
      <circle cx="320" cy="422" r="5" fill="url(#goldGradKt)"/>
      <rect x="347" y="387" width="10" height="35" rx="1"/>
      <circle cx="352" cy="422" r="5" fill="url(#goldGradKt)"/>
    </g>
  </g>

  <!-- Chiên Con Thiên Chúa (Agnus Dei Đứng Hùng Dũng & Hiền Hòa) -->
  <g filter="url(#lambShadow)">
    <path d="M315 310 L335 375 L315 375 L300 320 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <path d="M285 315 L295 375 L280 375 L272 325 Z" fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5"/>
    <path d="M190 320 L180 375 L198 375 L205 325 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <rect x="315" y="370" width="20" height="6" rx="2" fill="#ca8a04"/>
    <rect x="280" y="370" width="16" height="6" rx="2" fill="#ca8a04"/>
    <rect x="180" y="370" width="18" height="6" rx="2" fill="#ca8a04"/>

    <!-- Thân Chiên uy nghi với bộ lông cừu trắng tinh tuyền -->
    <path d="M170 305 C160 260 200 235 250 240 C300 240 345 260 345 305 C345 330 325 350 290 350 C230 350 185 340 170 305 Z" fill="url(#lambGrad)" stroke="#cbd5e1" stroke-width="2"/>
    <path d="M340 295 C358 290 365 308 345 320 Z" fill="url(#lambGrad)" stroke="#cbd5e1" stroke-width="1.5"/>

    <!-- Chân trước bên trái nâng cán Thập Tự Cờ Phục Sinh -->
    <path d="M210 295 C220 280 235 285 240 310 C240 325 220 335 210 320 Z" fill="#ffffff" stroke="#94a3b8" stroke-width="2"/>
    <ellipse cx="230" cy="305" rx="8" ry="6" fill="#ca8a04"/>

    <!-- Cổ và Đầu Chiên ngoảnh nhìn lại ngọn cờ -->
    <path d="M210 250 C195 230 185 200 198 178 C215 155 240 170 238 200 C235 230 225 245 210 250 Z" fill="url(#lambGrad)" stroke="#cbd5e1" stroke-width="2"/>
    <path d="M190 180 C168 182 165 198 185 198 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <path d="M235 180 C252 182 250 198 232 198 Z" fill="#e2e8f0" stroke="#94a3b8" stroke-width="1.5"/>
    <!-- Mắt hiền từ nhân hậu -->
    <ellipse cx="210" cy="188" rx="3.5" ry="5" fill="#1e293b"/>
    <circle cx="211" cy="186" r="1.5" fill="#ffffff"/>
    <path d="M198 205 Q205 212 215 208" stroke="#64748b" stroke-width="2" fill="none" stroke-linecap="round"/>
  </g>

  <!-- Cán Cờ Thập Tự Vàng & Cờ Phục Sinh Khải Hoàn (Vexillum) -->
  <g filter="url(#lambShadow)">
    <line x1="230" y1="360" x2="350" y2="85" stroke="url(#goldGradKt)" stroke-width="7" stroke-linecap="round"/>
    <path d="M350 85 L350 62 M340 72 L360 72" stroke="url(#goldGradKt)" stroke-width="5" stroke-linecap="round"/>
    <circle cx="350" cy="62" r="3" fill="#fef08a"/>

    <path d="M346 88 L455 105 L420 135 L455 165 L332 145 Z" fill="#ffffff" stroke="#e2e8f0" stroke-width="2.5"/>
    <path d="M340 117 L435 130" stroke="#dc2626" stroke-width="14" stroke-linecap="square"/>
    <path d="M380 94 L375 155" stroke="#dc2626" stroke-width="14" stroke-linecap="square"/>
  </g>
</svg>`,

  // 2. KHỐI RƯỚC LỄ: Mặt Nhật Thánh Thể & Chén Thánh Cung Đình (Monstrance & Chalice)
  'badge-ruoc-le': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgRl" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#f0fdf4"/>
      <stop offset="100%" stop-color="#dcfce7"/>
    </linearGradient>
    <linearGradient id="goldChalice" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="35%" stop-color="#eab308"/>
      <stop offset="70%" stop-color="#ca8a04"/>
      <stop offset="100%" stop-color="#854d0e"/>
    </linearGradient>
    <linearGradient id="hostGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <filter id="eucharistGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#ca8a04" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Khung Squircle Tông Xanh Lục Tươi (Khối Rước Lễ) -->
  <rect x="20" y="20" width="472" height="472" rx="110" fill="url(#bgRl)" stroke="#22c55e" stroke-width="4"/>
  <rect x="32" y="32" width="448" height="448" rx="98" fill="none" stroke="#16a34a" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6 4"/>

  <!-- Hào Quang Mặt Nhật Thánh Thể 24 Tia Chiếu Tỏa (Monstrance Solar Burst) -->
  <g stroke="url(#goldChalice)" stroke-linecap="round" opacity="0.9">
    <line x1="256" y1="165" x2="256" y2="60" stroke-width="4.5"/>
    <line x1="256" y1="165" x2="361" y2="165" stroke-width="4.5"/>
    <line x1="256" y1="165" x2="151" y2="165" stroke-width="4.5"/>
    <line x1="256" y1="165" x2="330" y2="91" stroke-width="4"/>
    <line x1="256" y1="165" x2="182" y2="91" stroke-width="4"/>
    <line x1="256" y1="165" x2="330" y2="239" stroke-width="3"/>
    <line x1="256" y1="165" x2="182" y2="239" stroke-width="3"/>
    <line x1="256" y1="165" x2="295" y2="75" stroke-width="2.5"/>
    <line x1="256" y1="165" x2="217" y2="75" stroke-width="2.5"/>
    <line x1="256" y1="165" x2="346" y2="128" stroke-width="2.5"/>
    <line x1="256" y1="165" x2="166" y2="128" stroke-width="2.5"/>
    <line x1="256" y1="165" x2="350" y2="202" stroke-width="2"/>
    <line x1="256" y1="165" x2="162" y2="202" stroke-width="2"/>
  </g>

  <!-- Bánh Thánh Mình Thánh Chúa (Holy Eucharistic Host) -->
  <g filter="url(#eucharistGlow)">
    <circle cx="256" cy="165" r="68" fill="url(#hostGrad)" stroke="#fef08a" stroke-width="3.5"/>
    <circle cx="256" cy="165" r="58" fill="none" stroke="#ca8a04" stroke-width="1.5" stroke-dasharray="3 3"/>
    
    <!-- Thánh Giá & Mẫu Tự IHS Cực Kỳ Trang Nghiêm Cân Đối -->
    <g stroke="#a16207" stroke-linecap="round">
      <line x1="256" y1="120" x2="256" y2="142" stroke-width="3"/>
      <line x1="247" y1="128" x2="265" y2="128" stroke-width="3"/>
      <path d="M246 195 L256 205 L266 195 M256 195 L256 205" stroke-width="2.5" fill="none"/>
    </g>
    <text x="256" y="178" font-family="'Times New Roman', serif" font-size="34" font-weight="bold" fill="#854d0e" text-anchor="middle" letter-spacing="4">IHS</text>
  </g>

  <!-- Chén Thánh Hoàng Gia Cân Xứng (Royal Gothic Chalice) -->
  <g filter="url(#eucharistGlow)">
    <path d="M180 240 C180 325 230 345 248 350 L248 405 L205 440 C195 448 202 460 216 460 L296 460 C310 460 317 448 307 440 L264 405 L264 350 C282 345 332 325 332 240 Z" fill="url(#goldChalice)"/>
    <ellipse cx="256" cy="240" rx="76" ry="16" fill="#fef08a" stroke="#ca8a04" stroke-width="2.5"/>
    <ellipse cx="256" cy="240" rx="66" ry="11" fill="#a16207"/>
    <path d="M198 275 C220 295 292 295 314 275" fill="none" stroke="#fef08a" stroke-width="3"/>
    <ellipse cx="256" cy="380" rx="24" ry="12" fill="#fef08a" stroke="#854d0e" stroke-width="2.5"/>
    <circle cx="256" cy="380" r="5" fill="#ca8a04"/>
    <path d="M256 438 L256 454 M249 444 L263 444" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round"/>
  </g>

  <!-- Hai Bông Lúa Mì Vàng Óng Đối Xứng Hai Bên (Ears of Wheat) -->
  <g fill="url(#goldChalice)" stroke="#ca8a04" stroke-width="1.5">
    <path d="M130 390 Q150 320 175 270" stroke="#ca8a04" stroke-width="3" fill="none"/>
    <ellipse cx="140" cy="360" rx="8" ry="15" transform="rotate(-30 140 360)"/>
    <ellipse cx="155" cy="330" rx="8" ry="15" transform="rotate(-25 155 330)"/>
    <ellipse cx="170" cy="298" rx="8" ry="14" transform="rotate(-20 170 298)"/>
    <ellipse cx="178" cy="268" rx="7" ry="13" transform="rotate(-15 178 268)"/>
    <line x1="178" y1="255" x2="185" y2="235" stroke="#ca8a04" stroke-width="1.5"/>

    <path d="M382 390 Q362 320 337 270" stroke="#ca8a04" stroke-width="3" fill="none"/>
    <ellipse cx="372" cy="360" rx="8" ry="15" transform="rotate(30 372 360)"/>
    <ellipse cx="357" cy="330" rx="8" ry="15" transform="rotate(25 357 330)"/>
    <ellipse cx="342" cy="298" rx="8" ry="14" transform="rotate(20 342 298)"/>
    <ellipse cx="334" cy="268" rx="7" ry="13" transform="rotate(15 334 268)"/>
    <line x1="334" y1="255" x2="327" y2="235" stroke="#ca8a04" stroke-width="1.5"/>
  </g>

  <!-- Hai Chùm Nho Thánh Thể Cân Xứng Hai Bên Chân Chén -->
  <g fill="#7e22ce" stroke="#581c87" stroke-width="1">
    <circle cx="175" cy="405" r="8.5"/>
    <circle cx="192" cy="405" r="8.5"/>
    <circle cx="168" cy="420" r="8.5"/>
    <circle cx="184" cy="420" r="8.5"/>
    <circle cx="200" cy="420" r="8.5"/>
    <circle cx="176" cy="435" r="8"/>
    <circle cx="192" cy="435" r="8"/>
    <circle cx="184" cy="448" r="7.5"/>

    <circle cx="320" cy="405" r="8.5"/>
    <circle cx="337" cy="405" r="8.5"/>
    <circle cx="312" cy="420" r="8.5"/>
    <circle cx="328" cy="420" r="8.5"/>
    <circle cx="344" cy="420" r="8.5"/>
    <circle cx="320" cy="435" r="8"/>
    <circle cx="336" cy="435" r="8"/>
    <circle cx="328" cy="448" r="7.5"/>
  </g>
</svg>`,

  // 3. KHỐI THÊM SỨC: Chim Bồ Câu Bernini & Bảy Ngọn Lửa Hiện Xuống
  'badge-them-suc': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgTs" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fffbeb"/>
      <stop offset="100%" stop-color="#fef3c7"/>
    </linearGradient>
    <linearGradient id="fireGradTs" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="40%" stop-color="#ea580c"/>
      <stop offset="80%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <linearGradient id="goldAura" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="50%" stop-color="#f59e0b"/>
      <stop offset="100%" stop-color="#b45309"/>
    </linearGradient>
    <linearGradient id="doveBody" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#f8fafc"/>
    </linearGradient>
    <filter id="pentecostGlow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#d97706" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Khung Squircle Tông Vàng Nghệ (Khối Thêm Sức) -->
  <rect x="20" y="20" width="472" height="472" rx="110" fill="url(#bgTs)" stroke="#f59e0b" stroke-width="4"/>
  <rect x="32" y="32" width="448" height="448" rx="98" fill="none" stroke="#d97706" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6 4"/>

  <!-- Vầng Hào Quang Mặt Trời Thiên Quốc Nhiều Tầng (Bernini Celestial Halo) -->
  <g transform="translate(256, 215)">
    <g stroke="url(#goldAura)" stroke-linecap="round" opacity="0.85">
      <line x1="0" y1="0" x2="0" y2="-155" stroke-width="4.5"/>
      <line x1="0" y1="0" x2="110" y2="-110" stroke-width="4"/>
      <line x1="0" y1="0" x2="-110" y2="-110" stroke-width="4"/>
      <line x1="0" y1="0" x2="155" y2="0" stroke-width="4.5"/>
      <line x1="0" y1="0" x2="-155" y2="0" stroke-width="4.5"/>
      <line x1="0" y1="0" x2="110" y2="110" stroke-width="3"/>
      <line x1="0" y1="0" x2="-110" y2="110" stroke-width="3"/>
      <line x1="0" y1="0" x2="45" y2="-145" stroke-width="2.5"/>
      <line x1="0" y1="0" x2="-45" y2="-145" stroke-width="2.5"/>
      <line x1="0" y1="0" x2="145" y2="-55" stroke-width="2.5"/>
      <line x1="0" y1="0" x2="-145" y2="-55" stroke-width="2.5"/>
      <line x1="0" y1="0" x2="145" y2="55" stroke-width="2"/>
      <line x1="0" y1="0" x2="-145" y2="55" stroke-width="2"/>
    </g>
    <circle cx="0" cy="0" r="105" fill="#fef3c7" opacity="0.7"/>
    <circle cx="0" cy="0" r="95" fill="none" stroke="#fcd34d" stroke-width="2" stroke-dasharray="4 4"/>
  </g>

  <!-- BẢY NGỌN LỬA HỒNG ÂN THÁNH THẦN -->
  <g filter="url(#pentecostGlow)">
    <path d="M256 50 C266 74 278 92 256 116 C234 92 246 74 256 50 Z" fill="url(#fireGradTs)"/>
    <path d="M200 68 C212 90 220 108 202 128 C184 108 190 90 200 68 Z" fill="url(#fireGradTs)"/>
    <path d="M312 68 C324 90 330 108 312 128 C296 108 302 90 312 68 Z" fill="url(#fireGradTs)"/>
    <path d="M150 105 C164 125 168 144 150 160 C136 144 140 125 150 105 Z" fill="url(#fireGradTs)"/>
    <path d="M362 105 C374 125 378 144 362 160 C346 144 350 125 362 105 Z" fill="url(#fireGradTs)"/>
    <path d="M112 160 C128 178 130 196 112 210 C98 196 102 178 112 160 Z" fill="url(#fireGradTs)"/>
    <path d="M400 160 C414 178 418 196 400 210 C384 196 388 178 400 160 Z" fill="url(#fireGradTs)"/>
  </g>

  <!-- CHÚA THÁNH THẦN HÌNH CHIM BỒ CÂU TRẮNG HẠ THẾ -->
  <g filter="url(#pentecostGlow)">
    <path d="M256 225 C220 145 130 135 80 160 C70 165 72 180 85 184 C115 192 160 205 185 240 C155 235 120 220 100 228 C92 232 94 244 105 247 C140 255 185 265 215 285 L256 315 Z" fill="url(#doveBody)" stroke="#ca8a04" stroke-width="2.5"/>
    <path d="M256 225 C292 145 382 135 432 160 C442 165 440 180 427 184 C397 192 352 205 327 240 C357 235 392 220 412 228 C420 232 418 244 407 247 C372 255 327 265 297 285 L256 315 Z" fill="url(#doveBody)" stroke="#ca8a04" stroke-width="2.5"/>
    
    <path d="M120 180 C165 198 205 228 230 265" stroke="#f59e0b" stroke-width="2" fill="none"/>
    <path d="M392 180 C347 198 307 228 282 265" stroke="#f59e0b" stroke-width="2" fill="none"/>

    <path d="M232 180 C242 125 270 125 280 180 Z" fill="url(#doveBody)" stroke="#ca8a04" stroke-width="2"/>
    <line x1="256" y1="130" x2="256" y2="180" stroke="#f59e0b" stroke-width="2"/>

    <path d="M242 240 C238 275 238 325 256 355 C274 325 274 275 270 240 Z" fill="url(#doveBody)" stroke="#ca8a04" stroke-width="2"/>
    <polygon points="256,375 248,354 264,354" fill="#ea580c" stroke="#ca8a04" stroke-width="1.5"/>
    <circle cx="256" cy="342" r="34" fill="none" stroke="#eab308" stroke-width="2.5" stroke-dasharray="4 3"/>
  </g>

  <!-- BẢY LUỒNG ÂN SỦNG RỰC RỠ TỎA XUỐNG THẾ GIAN -->
  <g stroke="url(#goldAura)" stroke-linecap="round" opacity="0.9">
    <line x1="256" y1="388" x2="256" y2="455" stroke-width="4.5"/>
    <line x1="245" y1="382" x2="210" y2="445" stroke-width="3.5"/>
    <line x1="267" y1="382" x2="302" y2="445" stroke-width="3.5"/>
    <line x1="235" y1="375" x2="170" y2="432" stroke-width="3"/>
    <line x1="277" y1="375" x2="342" y2="432" stroke-width="3"/>
    <line x1="225" y1="368" x2="135" y2="415" stroke-width="2.5"/>
    <line x1="287" y1="368" x2="377" y2="415" stroke-width="2.5"/>
  </g>
</svg>`,

  // 4. KHỐI PHỤNG VỤ: Nến Phục Sinh & Bàn Thờ (Paschal Candle & Altar)
  'badge-phung-vu': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgPv" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fff7ed"/>
      <stop offset="100%" stop-color="#ffedd5"/>
    </linearGradient>
    <linearGradient id="candleGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#fef9c3"/>
      <stop offset="70%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#fde047"/>
    </linearGradient>
    <linearGradient id="flameGrad" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="40%" stop-color="#f97316"/>
      <stop offset="80%" stop-color="#fef08a"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <filter id="flameGlow" x="-30%" y="-30%" width="160%" height="160%">
      <feDropShadow dx="0" dy="0" stdDeviation="14" flood-color="#ea580c" flood-opacity="0.4"/>
    </filter>
  </defs>

  <!-- Khung Squircle Tông Cam Phụng Vụ -->
  <rect x="20" y="20" width="472" height="472" rx="110" fill="url(#bgPv)" stroke="#fdba74" stroke-width="4"/>
  <rect x="32" y="32" width="448" height="448" rx="98" fill="none" stroke="#ea580c" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6 4"/>

  <!-- Khói Hương Nghi Ngút Bay Lên (Incense Cloud) -->
  <g fill="none" stroke="#fdba74" stroke-width="3" stroke-linecap="round" opacity="0.6">
    <path d="M370 280 C360 230 400 190 380 140 C370 110 350 90 365 60"/>
    <path d="M385 270 C395 235 375 200 395 160 C405 135 395 110 400 85"/>
  </g>

  <!-- Nến Phục Sinh (Paschal Candle) Vinh Hiển -->
  <g filter="url(#flameGlow)">
    <rect x="155" y="140" width="60" height="220" rx="4" fill="url(#candleGrad)" stroke="#ca8a04" stroke-width="2"/>
    <line x1="185" y1="140" x2="185" y2="125" stroke="#1f2937" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M185 65 C200 95 210 110 185 130 C160 110 170 95 185 65 Z" fill="url(#flameGrad)"/>
    <circle cx="185" cy="105" r="38" fill="#fef08a" opacity="0.35"/>

    <rect x="179" y="170" width="12" height="70" fill="#dc2626" rx="2"/>
    <rect x="165" y="190" width="40" height="12" fill="#dc2626" rx="2"/>
    <circle cx="185" cy="174" r="3.5" fill="#facc15"/>
    <circle cx="185" cy="236" r="3.5" fill="#facc15"/>
    <circle cx="169" cy="196" r="3.5" fill="#facc15"/>
    <circle cx="201" cy="196" r="3.5" fill="#facc15"/>
    <circle cx="185" cy="196" r="4.5" fill="#facc15"/>

    <text x="185" y="165" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#991b1b" text-anchor="middle">A</text>
    <text x="185" y="260" font-family="Georgia, serif" font-size="16" font-weight="bold" fill="#991b1b" text-anchor="middle">Ω</text>
    <text x="185" y="280" font-family="monospace" font-size="12" font-weight="bold" fill="#854d0e" text-anchor="middle">2026</text>
  </g>

  <!-- Chân Đèn Nến Phục Sinh Bằng Đồng Cổ -->
  <path d="M150 360 L220 360 L205 385 L225 395 L145 395 L165 385 Z" fill="#ca8a04"/>

  <!-- Bàn Thờ Thánh Thể (Liturgical Altar) -->
  <g>
    <rect x="110" y="395" width="292" height="45" rx="4" fill="#ffffff" stroke="#e2e8f0" stroke-width="2"/>
    <line x1="110" y1="428" x2="402" y2="428" stroke="#dc2626" stroke-width="3"/>
    <line x1="110" y1="433" x2="402" y2="433" stroke="#ca8a04" stroke-width="1.5"/>
    <rect x="135" y="440" width="242" height="24" rx="2" fill="#78716c"/>
  </g>

  <!-- Bình Hương Phụng Vụ Vàng (Thurible / Censer) -->
  <g filter="url(#flameGlow)">
    <path d="M370 170 L360 280 M380 170 L372 280 M390 170 L384 280" stroke="#ca8a04" stroke-width="1.5"/>
    <path d="M352 280 C352 255 392 255 392 280 Z" fill="#eab308" stroke="#a16207" stroke-width="1.5"/>
    <circle cx="365" cy="272" r="2.5" fill="#78350f"/>
    <circle cx="372" cy="265" r="2.5" fill="#78350f"/>
    <circle cx="379" cy="272" r="2.5" fill="#78350f"/>
    <path d="M350 280 C350 305 394 305 394 280 Z" fill="#ca8a04" stroke="#78350f" stroke-width="1.5"/>
    <rect x="365" y="303" width="14" height="6" rx="1" fill="#a16207"/>
  </g>
</svg>`,

  // 5. KHỐI KINH THÁNH: Sách Lời Chúa & Ngọn Đuốc Đức Tin (Bible & Torch)
  'badge-kinh-thanh': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgKt2" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef2f2"/>
      <stop offset="100%" stop-color="#fee2e2"/>
    </linearGradient>
    <linearGradient id="bibleLeather" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#b91c1c"/>
      <stop offset="100%" stop-color="#7f1d1d"/>
    </linearGradient>
    <linearGradient id="torchFire" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#dc2626"/>
      <stop offset="40%" stop-color="#ea580c"/>
      <stop offset="80%" stop-color="#facc15"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <filter id="fireRadiance" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="4" stdDeviation="12" flood-color="#dc2626" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Khung Squircle Tông Đỏ Thắm (Khối Kinh Thánh - Nghĩa Sĩ) -->
  <rect x="20" y="20" width="472" height="472" rx="110" fill="url(#bgKt2)" stroke="#fca5a5" stroke-width="4"/>
  <rect x="32" y="32" width="448" height="448" rx="98" fill="none" stroke="#dc2626" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6 4"/>

  <!-- Hào Quang Lời Chúa Tỏa Rạng Khắp Vũ Trụ -->
  <circle cx="256" cy="240" r="150" fill="#fee2e2" opacity="0.6"/>
  <circle cx="256" cy="240" r="135" fill="none" stroke="#fecaca" stroke-width="2" stroke-dasharray="6 6"/>

  <!-- Ngọn Đuốc Đức Tin & Chân Lý (Torch of Truth) Vươn Cao Phía Sau -->
  <g filter="url(#fireRadiance)">
    <path d="M256 55 C275 90 295 115 265 150 C235 115 245 90 256 55 Z" fill="url(#torchFire)"/>
    <path d="M240 85 C250 105 255 120 242 140 C230 120 234 105 240 85 Z" fill="#ffffff" opacity="0.8"/>
    <path d="M236 145 L276 145 L268 175 L244 175 Z" fill="#eab308" stroke="#a16207" stroke-width="2"/>
    <rect x="250" y="175" width="12" height="230" fill="#92400e" rx="2"/>
  </g>

  <!-- Cuốn Sách Thánh Kinh Mở Rộng (Open Holy Bible) -->
  <g filter="url(#fireRadiance)">
    <path d="M100 240 C170 230 245 245 256 260 C267 245 342 230 412 240 L422 360 C352 350 267 365 256 380 C245 365 160 350 90 360 Z" fill="url(#bibleLeather)"/>
    <path d="M105 235 C175 225 245 240 256 255 C267 240 337 225 407 235 L415 350 C345 340 267 355 256 370 C245 355 167 340 97 350 Z" fill="#fef08a"/>
    <path d="M110 230 C180 220 245 235 256 250 C267 235 332 220 402 230 L410 342 C340 332 267 348 256 362 C245 348 172 332 102 342 Z" fill="#fffdfa" stroke="#e2e8f0" stroke-width="1"/>
    <line x1="256" y1="250" x2="256" y2="362" stroke="#cbd5e1" stroke-width="2"/>

    <path d="M256 250 Q262 330 256 400 L248 390 L240 400 Q248 330 256 250" fill="#dc2626"/>

    <g transform="translate(180, 290)">
      <text x="0" y="0" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="#991b1b" text-anchor="middle">A</text>
      <line x1="-40" y1="15" x2="40" y2="15" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="-40" y1="25" x2="30" y2="25" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="-40" y1="35" x2="40" y2="35" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
    </g>

    <g transform="translate(332, 290)">
      <text x="0" y="0" font-family="Georgia, serif" font-size="44" font-weight="bold" fill="#991b1b" text-anchor="middle">Ω</text>
      <line x1="-40" y1="15" x2="40" y2="15" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="-30" y1="25" x2="40" y2="25" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
      <line x1="-40" y1="35" x2="40" y2="35" stroke="#94a3b8" stroke-width="2.5" stroke-linecap="round"/>
    </g>
  </g>
</svg>`,

  // 6. KHỐI VÀO ĐỜI: Mỏ Neo Hy Vọng & Chi-Rho Khải Hoàn (Anchor & Chi-Rho Monogram)
  'badge-vao-doi': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="512" height="512">
  <defs>
    <linearGradient id="bgVd" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fdf2f8"/>
      <stop offset="100%" stop-color="#fce7f3"/>
    </linearGradient>
    <linearGradient id="goldVd" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#fef08a"/>
      <stop offset="40%" stop-color="#f59e0b"/>
      <stop offset="80%" stop-color="#d97706"/>
      <stop offset="100%" stop-color="#92400e"/>
    </linearGradient>
    <linearGradient id="sunDawn" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#fb7185"/>
      <stop offset="50%" stop-color="#fde047"/>
      <stop offset="100%" stop-color="#ffffff"/>
    </linearGradient>
    <filter id="anchorShadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="6" stdDeviation="12" flood-color="#831843" flood-opacity="0.35"/>
    </filter>
  </defs>

  <!-- Khung Squircle Tông Đỏ Bầm Hoàng Gia (Khối Vào Đời - Hiệp Sĩ / Huynh Trưởng) -->
  <rect x="20" y="20" width="472" height="472" rx="110" fill="url(#bgVd)" stroke="#f43f5e" stroke-width="4"/>
  <rect x="32" y="32" width="448" height="448" rx="98" fill="none" stroke="#be123c" stroke-width="1.5" stroke-opacity="0.3" stroke-dasharray="6 4"/>

  <!-- Vầng Ánh Dương Bình Minh Hy Vọng (Dawn of Hope) -->
  <circle cx="256" cy="220" r="130" fill="url(#sunDawn)" opacity="0.45"/>
  <g stroke="#fb7185" stroke-width="2" stroke-linecap="round" opacity="0.6">
    <line x1="256" y1="220" x2="256" y2="70" stroke-width="3"/>
    <line x1="256" y1="220" x2="370" y2="105"/>
    <line x1="256" y1="220" x2="142" y2="105"/>
    <line x1="256" y1="220" x2="395" y2="180"/>
    <line x1="256" y1="220" x2="117" y2="180"/>
  </g>

  <!-- Sóng Biển Trần Gian Cuộn Trào Dưới Chân ("Hãy Ra Khơi" - Duc in altum) -->
  <g fill="none" stroke="#be123c" stroke-width="3" opacity="0.75" stroke-linecap="round">
    <path d="M60 415 C110 395 160 435 210 415 C260 395 310 435 360 415 C410 395 440 415 452 410"/>
    <path d="M80 440 C130 420 180 455 230 438 C280 420 330 455 380 438 C420 422 440 435 450 432"/>
  </g>

  <!-- Cành Nguyệt Quế Khải Hoàn (Laurel of Faithful Endurance) Hai Bên -->
  <g fill="none" stroke="#15803d" stroke-width="2.5" opacity="0.85">
    <path d="M140 370 C120 280 150 200 195 150"/>
    <g fill="#16a34a" stroke="#15803d" stroke-width="1.5">
      <ellipse cx="132" cy="335" rx="7" ry="14" transform="rotate(-40 132 335)"/>
      <ellipse cx="128" cy="295" rx="7" ry="14" transform="rotate(-30 128 295)"/>
      <ellipse cx="135" cy="255" rx="7" ry="14" transform="rotate(-20 135 255)"/>
      <ellipse cx="152" cy="215" rx="7" ry="14" transform="rotate(-10 152 215)"/>
      <ellipse cx="178" cy="180" rx="7" ry="14" transform="rotate(5 178 180)"/>
    </g>
    <path d="M372 370 C392 280 362 200 317 150"/>
    <g fill="#16a34a" stroke="#15803d" stroke-width="1.5">
      <ellipse cx="380" cy="335" rx="7" ry="14" transform="rotate(40 380 335)"/>
      <ellipse cx="384" cy="295" rx="7" ry="14" transform="rotate(30 384 295)"/>
      <ellipse cx="377" cy="255" rx="7" ry="14" transform="rotate(20 377 255)"/>
      <ellipse cx="360" cy="215" rx="7" ry="14" transform="rotate(10 360 215)"/>
      <ellipse cx="334" cy="180" rx="7" ry="14" transform="rotate(-5 334 180)"/>
    </g>
  </g>

  <!-- MỎ NEO HY VỌNG KITÔ GIÁO & THÁNH PHÙ CHI-RHO (Christian Anchor & Chi-Rho) -->
  <g filter="url(#anchorShadow)">
    <!-- THÁNH PHÙ CHI-RHO (☧) ĐỈNH MỎ NEO -->
    <circle cx="280" cy="98" r="22" fill="none" stroke="url(#goldVd)" stroke-width="10"/>
    <line x1="225" y1="105" x2="287" y2="155" stroke="url(#goldVd)" stroke-width="10" stroke-linecap="round"/>
    <line x1="287" y1="105" x2="225" y2="155" stroke="url(#goldVd)" stroke-width="10" stroke-linecap="round"/>
    <circle cx="256" cy="130" r="24" fill="none" stroke="url(#goldVd)" stroke-width="9"/>

    <!-- THANH NGANG THÁNH GIÁ CỦA MỎ NEO -->
    <rect x="180" y="185" width="152" height="18" rx="6" fill="url(#goldVd)" stroke="#78350f" stroke-width="2"/>
    <circle cx="180" cy="194" r="14" fill="url(#goldVd)" stroke="#78350f" stroke-width="2"/>
    <circle cx="332" cy="194" r="14" fill="url(#goldVd)" stroke="#78350f" stroke-width="2"/>

    <!-- THÂN CHÍNH MỎ NEO THẲNG ĐỨNG -->
    <rect x="246" y="145" width="20" height="235" rx="7" fill="url(#goldVd)" stroke="#78350f" stroke-width="2.5"/>

    <!-- DÂY THỪNG HY VỌNG UỐN LƯỢN QUANH THÂN THÁNH GIÁ -->
    <path d="M246 170 Q215 210 266 240 Q315 270 246 315 Q215 345 266 380" fill="none" stroke="#fef08a" stroke-width="6" stroke-dasharray="10 4" stroke-linecap="round"/>

    <!-- BÁN NGUYỆT MỎ NEO (Anchor Arms) VƯƠN RỘNG HÙNG VĨ -->
    <path d="M165 315 C165 425 347 425 347 315" fill="none" stroke="url(#goldVd)" stroke-width="22" stroke-linecap="round"/>
    <polygon points="165,300 140,335 185,335" fill="url(#goldVd)" stroke="#78350f" stroke-width="2"/>
    <polygon points="347,300 327,335 372,335" fill="url(#goldVd)" stroke="#78350f" stroke-width="2"/>
    <circle cx="256" cy="405" r="12" fill="url(#goldVd)" stroke="#78350f" stroke-width="2"/>
  </g>
</svg>`
};

/* =========================================================================
   2. GENERATION LOGIC: SVG -> WEBP & HIGH-RES PNG VIA PUPPETEER
   ========================================================================= */

async function generate() {
  console.log('🚀 Đang khởi động Puppeteer để render bộ ảnh Phương Án 1 (Vector Liturgical System)...');

  // Lưu file SVG nguồn trước
  for (const [key, svgContent] of Object.entries(SVGS)) {
    const svgPath = path.join(OPT1_DIR, `${key}.svg`);
    fs.writeFileSync(svgPath, svgContent.trim(), 'utf8');
    console.log(`✓ Đã tạo SVG: ${key}.svg`);
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const page = await browser.newPage();
  await page.setViewport({ width: 1024, height: 1024, deviceScaleFactor: 2 });

  for (const [key, svgContent] of Object.entries(SVGS)) {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { 
              background: transparent; 
              display: flex; 
              align-items: center; 
              justify-content: center; 
              width: 512px; 
              height: 512px; 
            }
            svg { width: 512px; height: 512px; }
          </style>
        </head>
        <body>
          ${svgContent}
        </body>
      </html>
    `;

    await page.setContent(htmlContent, { waitUntil: 'domcontentloaded' });

    // Render WebP
    const webpPath = path.join(OPT1_DIR, `${key}.webp`);
    await page.screenshot({
      path: webpPath,
      type: 'webp',
      quality: 95,
      omitBackground: true,
      clip: { x: 0, y: 0, width: 512, height: 512 }
    });

    // Render PNG
    const pngPath = path.join(OPT1_DIR, `${key}.png`);
    await page.screenshot({
      path: pngPath,
      type: 'png',
      omitBackground: true,
      clip: { x: 0, y: 0, width: 512, height: 512 }
    });

    console.log(`  ✓ Rendered ${key}.webp & ${key}.png ($512x512)`);
  }

  await browser.close();
  console.log('🎉 Hoàn tất render toàn bộ 7 assets Phương Án 1!');
}

generate().catch(err => {
  console.error('Lỗi khi render Phương Án 1:', err);
  process.exit(1);
});
