import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const outDir = path.join(rootDir, 'public/images/sectors');

if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

/* =========================================================================
   6 UI-OPTIMIZED SECTOR BADGES (96x96 ViewBox, Needle-Sharp at 52px)
   Designed specifically for UI Containers, Zero Clutter, Zero AI Hallucination
   ========================================================================= */

const BADGES = {
  'sector-khai-tam': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <defs>
    <linearGradient id="bg-kt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ECFDF5"/>
      <stop offset="100%" stop-color="#A7F3D0"/>
    </linearGradient>
    <linearGradient id="gold-kt" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FDE047"/>
      <stop offset="100%" stop-color="#CA8A04"/>
    </linearGradient>
    <filter id="shadow-kt" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#064E3B" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Modern Squircle Container (Khăn Xanh Lá Trơn) -->
  <rect x="4" y="4" width="88" height="88" rx="24" fill="url(#bg-kt)" stroke="#10B981" stroke-width="1.8"/>
  <rect x="8" y="8" width="80" height="80" rx="20" fill="none" stroke="#059669" stroke-width="1" stroke-dasharray="3 3" opacity="0.4"/>

  <!-- Hào Quang Mặt Trời Dịu Nhẹ -->
  <circle cx="48" cy="42" r="28" fill="#F0FDF4" opacity="0.9"/>
  <circle cx="48" cy="42" r="24" fill="none" stroke="#6EE7B7" stroke-width="1" stroke-dasharray="2 3"/>

  <!-- Đồi Cỏ Mầm Non -->
  <path d="M12 78 C28 70 68 70 84 78 V84 H12 Z" fill="#34D399" opacity="0.3"/>
  <path d="M10 82 C30 75 66 75 86 82" stroke="#059669" stroke-width="2" stroke-linecap="round"/>

  <!-- Hào Quang Chữ Thập Của Chiên Thiên Chúa (Cruciform Halo) -->
  <g transform="translate(34, 38)">
    <circle cx="0" cy="0" r="11" fill="url(#gold-kt)"/>
    <!-- Chữ thập đỏ phụng vụ -->
    <rect x="-1.5" y="-9" width="3" height="18" fill="#DC2626" rx="1"/>
    <rect x="-9" y="-1.5" width="18" height="3" fill="#DC2626" rx="1"/>
    <circle cx="0" cy="0" r="10.5" fill="none" stroke="#A16207" stroke-width="1"/>
  </g>

  <!-- Chiên Con Thiên Chúa (Agnus Dei Đứng Hùng Dũng & Hiền Hòa) -->
  <g filter="url(#shadow-kt)">
    <!-- 4 Chân chiên vững vàng -->
    <path d="M40 68 V76 M46 68 V77 M60 67 V76 M66 67 V77" stroke="#1E293B" stroke-width="2.5" stroke-linecap="round"/>
    
    <!-- Thân Chiên trắng tinh tuyền với các cuộn lông êm ái -->
    <path d="M36 50 C30 46 30 62 36 68 C44 70 66 70 70 65 C74 60 74 48 66 48 C62 44 42 44 36 50 Z" fill="#FFFFFF" stroke="#334155" stroke-width="2.2" stroke-linejoin="round"/>
    <!-- Đầu Chiên ngoảnh nhìn cờ Phục Sinh -->
    <path d="M38 48 C34 44 32 38 36 34 C41 30 47 34 46 40 C45 46 41 48 38 48 Z" fill="#FFFFFF" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>
    <!-- Tai chiên mềm mại -->
    <path d="M33 36 C30 35 29 39 33 40 Z" fill="#FFFFFF" stroke="#334155" stroke-width="1.5"/>
    <!-- Mắt chiên nhân hậu -->
    <circle cx="38" cy="36" r="1.3" fill="#0F172A"/>
  </g>

  <!-- Cán Cờ Thập Tự Vàng & Cờ Phục Sinh Khải Hoàn (Vexillum) -->
  <g stroke="url(#gold-kt)" stroke-width="2" stroke-linecap="round">
    <line x1="44" y1="72" x2="68" y2="16"/>
    <!-- Thập giá đỉnh cán cờ -->
    <line x1="68" y1="13" x2="68" y2="20"/>
    <line x1="65" y1="16" x2="71" y2="16"/>
  </g>
  <!-- Lá Cờ Phục Sinh Đỏ Trắng Bay Trong Gió -->
  <path d="M67 17 L86 21 L81 26 L86 31 L65 27 Z" fill="#FFFFFF" stroke="#E2E8F0" stroke-width="1.2"/>
  <path d="M66 22 L83 26" stroke="#DC2626" stroke-width="3" stroke-linecap="square"/>
  <path d="M74 18 L73 30" stroke="#DC2626" stroke-width="3" stroke-linecap="square"/>
</svg>
`,

  'sector-ruoc-le': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <defs>
    <linearGradient id="bg-rl" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F0FDF4"/>
      <stop offset="100%" stop-color="#DCFCE7"/>
    </linearGradient>
    <linearGradient id="gold-chalice" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="50%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#A16207"/>
    </linearGradient>
    <filter id="shadow-rl" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#713F12" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Modern Squircle (Khăn Xanh Viền Vàng Kim) -->
  <rect x="4" y="4" width="88" height="88" rx="24" fill="url(#bg-rl)" stroke="#EAB308" stroke-width="2"/>
  <rect x="7.5" y="7.5" width="81" height="81" rx="21" fill="none" stroke="#16A34A" stroke-width="1.2" stroke-dasharray="3 3"/>

  <!-- Hào Quang Mặt Trời Chiếu Rọi Thánh Thể -->
  <g stroke="#FDE047" stroke-width="1.5" stroke-linecap="round" opacity="0.8">
    <line x1="48" y1="12" x2="48" y2="18"/>
    <line x1="62" y1="18" x2="57" y2="23"/>
    <line x1="34" y1="18" x2="39" y2="23"/>
    <line x1="68" y1="32" x2="62" y2="32"/>
    <line x1="28" y1="32" x2="34" y2="32"/>
  </g>

  <!-- Bánh Thánh (Mình Thánh Chúa Luminous Host) -->
  <g filter="url(#shadow-rl)">
    <circle cx="48" cy="32" r="14" fill="#FFFFFF" stroke="url(#gold-chalice)" stroke-width="2"/>
    <circle cx="48" cy="32" r="11.5" fill="none" stroke="#FDE047" stroke-width="0.8" stroke-dasharray="2 1.5"/>
    <!-- Thánh Giá Hy Lạp IHS Trên Bánh Thánh -->
    <path d="M48 23 V41 M39 32 H57" stroke="#CA8A04" stroke-width="2.2" stroke-linecap="round"/>
    <circle cx="48" cy="32" r="2.5" fill="#FEF9C3"/>
  </g>

  <!-- Chén Thánh Phụng Vụ (Golden Holy Chalice) -->
  <g filter="url(#shadow-rl)">
    <!-- Miệng chén & Cúp chén -->
    <path d="M30 46 C30 62 40 66 48 66 C56 66 66 62 66 46 H30 Z" fill="url(#gold-chalice)" stroke="#854D0E" stroke-width="2" stroke-linejoin="round"/>
    <ellipse cx="48" cy="46" rx="18" ry="3.5" fill="#FEF08A" stroke="#854D0E" stroke-width="1.5"/>
    <!-- Thân trụ & Nút thắt chén thánh -->
    <path d="M48 66 V78" stroke="#854D0E" stroke-width="4" stroke-linecap="round"/>
    <circle cx="48" cy="72" r="3.5" fill="#FEF08A" stroke="#854D0E" stroke-width="1.5"/>
    <!-- Chân đế Chén Thánh vững chãi -->
    <path d="M34 82 C34 78 42 78 48 78 C54 78 62 78 62 82 H34 Z" fill="url(#gold-chalice)" stroke="#854D0E" stroke-width="2" stroke-linejoin="round"/>
  </g>

  <!-- Bông Lúa Mì & Nhành Nho Bên Cạnh -->
  <g stroke="#15803D" stroke-width="1.8" stroke-linecap="round" fill="none">
    <path d="M22 72 Q26 58 32 52"/>
    <path d="M74 72 Q70 58 64 52"/>
  </g>
  <!-- Hạt lúa mì vàng óng -->
  <circle cx="21" cy="68" r="2.5" fill="#EAB308"/>
  <circle cx="25" cy="60" r="2.5" fill="#EAB308"/>
  <circle cx="29" cy="53" r="2.5" fill="#EAB308"/>
  <!-- Chùm nho tím phụng vụ -->
  <circle cx="72" cy="62" r="2.5" fill="#7E22CE"/>
  <circle cx="76" cy="66" r="2.5" fill="#9333EA"/>
  <circle cx="68" cy="68" r="2.5" fill="#7E22CE"/>
</svg>
`,

  'sector-them-suc': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <defs>
    <linearGradient id="bg-ts" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFFBEB"/>
      <stop offset="100%" stop-color="#FEF3C7"/>
    </linearGradient>
    <linearGradient id="flame-grad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#EF4444"/>
      <stop offset="50%" stop-color="#F97316"/>
      <stop offset="100%" stop-color="#FBBF24"/>
    </linearGradient>
    <filter id="shadow-ts" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#9A3412" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Modern Squircle (Khăn Vàng Viền Đỏ Thắm) -->
  <rect x="4" y="4" width="88" height="88" rx="24" fill="url(#bg-ts)" stroke="#DC2626" stroke-width="2"/>
  <rect x="7.5" y="7.5" width="81" height="81" rx="21" fill="none" stroke="#F59E0B" stroke-width="1.5" stroke-dasharray="3 3"/>

  <!-- Hào Quang Lửa Thánh Linh -->
  <circle cx="48" cy="50" r="26" fill="#FEF9C3" opacity="0.6"/>
  <circle cx="48" cy="50" r="22" fill="none" stroke="#FDE047" stroke-width="1" stroke-dasharray="2 2"/>

  <!-- Bảy Ngọn Lửa Ơn Chúa Thánh Thần (7 Tongues of Sacred Fire) -->
  <g fill="url(#flame-grad)" stroke="#B91C1C" stroke-width="0.8" filter="url(#shadow-ts)">
    <!-- 1. Đỉnh chính giữa (Khôn ngoan) -->
    <path d="M48 14 C49.5 17 51 20 48 23 C45 20 46.5 17 48 14 Z"/>
    <!-- 2 & 3. Tầng hai (Hiểu biết & Lo liệu) -->
    <path d="M36 18 C38 21 39 23 36 26 C33 23 34 21 36 18 Z"/>
    <path d="M60 18 C62 21 63 23 60 26 C57 23 58 21 60 18 Z"/>
    <!-- 4 & 5. Tầng ba (Sức mạnh & Thông minh) -->
    <path d="M26 26 C28 29 28 31 25 34 C23 31 24 29 26 26 Z"/>
    <path d="M70 26 C72 29 72 31 69 34 C67 31 68 29 70 26 Z"/>
    <!-- 6 & 7. Tầng bốn (Đạo đức & Kính sợ Chúa) -->
    <path d="M20 38 C22 41 21 43 19 46 C17 43 18 41 20 38 Z"/>
    <path d="M76 38 C78 41 77 43 75 46 C73 43 74 41 76 38 Z"/>
  </g>

  <!-- Chim Bồ Câu Thánh Thần Giáng Lâm (Holy Spirit Dove) -->
  <g filter="url(#shadow-ts)">
    <!-- Cánh Bồ Câu dang rộng chở che -->
    <path d="M48 64 C45 56 38 44 20 40 C30 46 34 54 36 60 C28 58 24 60 20 64 C28 65 34 68 36 72 C32 74 30 78 28 80 C36 78 44 75 48 73 C52 75 60 78 68 80 C66 78 64 74 60 72 C62 68 68 65 76 64 C72 60 68 58 60 60 C62 54 66 46 76 40 C58 44 51 56 48 64 Z" fill="#FFFFFF" stroke="#334155" stroke-width="2" stroke-linejoin="round"/>
    <!-- Đầu bồ câu sà xuống ban ơn -->
    <circle cx="48" cy="68" r="1.5" fill="#0F172A"/>
    <!-- Mỏ vàng tinh tế -->
    <polygon points="48,70 47,73 49,73" fill="#F59E0B"/>
  </g>
</svg>
`,

  'sector-phung-vu': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <defs>
    <linearGradient id="bg-pv" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFF7ED"/>
      <stop offset="100%" stop-color="#FFEDD5"/>
    </linearGradient>
    <linearGradient id="gold-censer" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="50%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <filter id="shadow-pv" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#9A3412" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Modern Squircle (Khăn Cam Viền Trắng Tinh) -->
  <rect x="4" y="4" width="88" height="88" rx="24" fill="url(#bg-pv)" stroke="#EA580C" stroke-width="2"/>
  <rect x="7.5" y="7.5" width="81" height="81" rx="21" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="3 3"/>

  <!-- Khói Trầm Hương Nghi Ngút Bay Lên Tòa Chúa -->
  <g stroke="#FB923C" stroke-width="1.8" stroke-linecap="round" fill="none" opacity="0.85">
    <path d="M66 42 C60 34 72 26 66 18 C62 12 70 8 64 4" stroke-dasharray="3 3"/>
    <path d="M32 30 C28 22 36 16 32 10" stroke-dasharray="2 2" opacity="0.6"/>
  </g>

  <!-- Cây Nến Phục Sinh Cháy Sáng (Paschal Candle) -->
  <g filter="url(#shadow-pv)">
    <!-- Ngọn lửa nến ấm áp -->
    <path d="M32 20 C34 24 36 27 32 32 C28 27 30 24 32 20 Z" fill="#F97316" stroke="#C2410C" stroke-width="1.2"/>
    <circle cx="32" cy="28" r="1.5" fill="#FEF08A"/>
    <!-- Thân nến phục sinh sáp trắng -->
    <rect x="28" y="32" width="8" height="42" rx="1.5" fill="#FFFFFF" stroke="#78716C" stroke-width="1.8"/>
    <!-- Thánh giá đỏ & Năm Phụng vụ trên nến -->
    <path d="M28 42 H36 M32 37 V48" stroke="#DC2626" stroke-width="1.5"/>
    <circle cx="32" cy="35" r="1" fill="#DC2626"/>
    <!-- Chân đế cắm nến đồng thau -->
    <path d="M24 74 C24 71 30 71 32 71 C34 71 40 71 40 74 H24 Z" fill="url(#gold-censer)" stroke="#854D0E" stroke-width="1.5"/>
    <line x1="22" y1="76" x2="42" y2="76" stroke="#854D0E" stroke-width="2" stroke-linecap="round"/>
  </g>

  <!-- Bình Hương Phụng Vụ (Thurible / Censer) -->
  <g filter="url(#shadow-pv)">
    <!-- 3 Dây xích vàng treo bình hương -->
    <line x1="56" y1="52" x2="64" y2="24" stroke="#78716C" stroke-width="1.2" stroke-dasharray="2 1.5"/>
    <line x1="76" y1="52" x2="68" y2="24" stroke="#78716C" stroke-width="1.2" stroke-dasharray="2 1.5"/>
    <line x1="66" y1="52" x2="66" y2="24" stroke="#78716C" stroke-width="1.2" stroke-dasharray="2 1.5"/>
    <circle cx="66" cy="24" r="2.5" fill="url(#gold-censer)"/>

    <!-- Thân bình hương trầm vàng kim -->
    <path d="M54 60 C54 74 60 78 66 78 C72 78 78 74 78 60 H54 Z" fill="url(#gold-censer)" stroke="#854D0E" stroke-width="1.8" stroke-linejoin="round"/>
    <!-- Nắp vòm bình hương có lỗ thoát khói -->
    <path d="M58 60 L62 52 H70 L74 60" stroke="#854D0E" stroke-width="1.5" fill="none"/>
    <circle cx="64" cy="56" r="1.2" fill="#854D0E"/>
    <circle cx="68" cy="56" r="1.2" fill="#854D0E"/>
    <!-- Chân đế bình hương -->
    <path d="M62 78 H70" stroke="#854D0E" stroke-width="2.5" stroke-linecap="round"/>
  </g>
</svg>
`,

  'sector-kinh-thanh': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <defs>
    <linearGradient id="bg-ktb" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF2F2"/>
      <stop offset="100%" stop-color="#FEE2E2"/>
    </linearGradient>
    <linearGradient id="gold-ktb" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="50%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#CA8A04"/>
    </linearGradient>
    <filter id="shadow-ktb" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#991B1B" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Modern Squircle (Khăn Đỏ Viền Vàng Kim) -->
  <rect x="4" y="4" width="88" height="88" rx="24" fill="url(#bg-ktb)" stroke="#EAB308" stroke-width="2"/>
  <rect x="7.5" y="7.5" width="81" height="81" rx="21" fill="none" stroke="#DC2626" stroke-width="1.5" stroke-dasharray="3 3"/>

  <!-- Luồng Ánh Sáng Lời Chúa Chiếu Rọi -->
  <g stroke="#FDE047" stroke-width="1.5" stroke-linecap="round" opacity="0.9">
    <line x1="48" y1="12" x2="48" y2="20"/>
    <line x1="36" y1="16" x2="41" y2="23"/>
    <line x1="60" y1="16" x2="55" y2="23"/>
  </g>

  <!-- Ngọn Đuốc Soi Đường (Torch of the Word of God) -->
  <g filter="url(#shadow-ktb)">
    <path d="M48 18 C50 22 52 24 48 28 C44 24 46 22 48 18 Z" fill="#EA580C" stroke="#9A3412" stroke-width="1"/>
    <circle cx="48" cy="25" r="1.5" fill="#FEF08A"/>
    <!-- Thân đuốc -->
    <path d="M45 28 L47 36 H49 L51 28 Z" fill="url(#gold-ktb)" stroke="#854D0E" stroke-width="1"/>
  </g>

  <!-- Cuốn Kinh Thánh Mở Rộng (Sacred Scriptures 73 Thư Quy) -->
  <g filter="url(#shadow-ktb)">
    <!-- Các trang sách trắng uốn cong mềm mại -->
    <path d="M48 46 C42 40 30 38 18 42 V70 C30 66 42 68 48 74 C54 68 66 66 78 70 V42 C66 38 54 40 48 46 Z" fill="#FFFFFF" stroke="#1E293B" stroke-width="2.2" stroke-linejoin="round"/>
    <!-- Gáy sách trung tâm -->
    <line x1="48" y1="46" x2="48" y2="74" stroke="#1E293B" stroke-width="2.5"/>

    <!-- Dải ruy-băng đỏ đánh dấu Lời Chúa -->
    <path d="M48 74 C46 80 50 84 46 90 L51 86 L48 74" fill="#DC2626" stroke="#991B1B" stroke-width="1"/>

    <!-- Ký tự Alpha & Omega Trên Hai Trang Sách -->
    <text x="32" y="58" font-family="'Cinzel', Georgia, serif" font-size="10" font-weight="700" fill="#B45309" text-anchor="middle">Α</text>
    <text x="64" y="58" font-family="'Cinzel', Georgia, serif" font-size="10" font-weight="700" fill="#B45309" text-anchor="middle">Ω</text>

    <!-- Các dòng chữ Lời Chúa tượng trưng -->
    <g stroke="url(#gold-ktb)" stroke-width="1.2" stroke-linecap="round">
      <line x1="24" y1="62" x2="38" y2="61"/>
      <line x1="24" y1="66" x2="36" y2="65"/>
      <line x1="58" y1="61" x2="72" y2="62"/>
      <line x1="60" y1="65" x2="72" y2="66"/>
    </g>
  </g>
</svg>
`,

  'sector-vao-doi': `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" width="96" height="96">
  <defs>
    <linearGradient id="bg-vd" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF2F2"/>
      <stop offset="100%" stop-color="#FFE4E6"/>
    </linearGradient>
    <linearGradient id="gold-anchor" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A"/>
      <stop offset="50%" stop-color="#EAB308"/>
      <stop offset="100%" stop-color="#A16207"/>
    </linearGradient>
    <filter id="shadow-vd" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="2" stdDeviation="2.5" flood-color="#881337" flood-opacity="0.15"/>
    </filter>
  </defs>

  <!-- Modern Squircle (Khăn Đỏ Viền Trắng Tinh) -->
  <rect x="4" y="4" width="88" height="88" rx="24" fill="url(#bg-vd)" stroke="#DC2626" stroke-width="2"/>
  <rect x="7.5" y="7.5" width="81" height="81" rx="21" fill="none" stroke="#FFFFFF" stroke-width="2" stroke-dasharray="3 3"/>

  <!-- Ngôi Sao Biển Soi Đường (Stella Maris Star) -->
  <g filter="url(#shadow-vd)">
    <path d="M48 10 L50 14 L54 15 L51 18 L52 22 L48 19 L44 22 L45 18 L42 15 L46 14 Z" fill="url(#gold-anchor)"/>
  </g>

  <!-- Mỏ Neo Hy Vọng & Thập Tự Giá Kiên Vững (Crux Spes Anchor) -->
  <g filter="url(#shadow-vd)">
    <!-- Vòng khuyên đỉnh mỏ neo -->
    <circle cx="48" cy="25" r="4.5" stroke="url(#gold-anchor)" stroke-width="2" fill="none"/>

    <!-- Thân chính Thập Tự Mỏ Neo -->
    <g stroke="#1E293B" stroke-width="2.8" stroke-linecap="round">
      <line x1="48" y1="30" x2="48" y2="68"/>
      <!-- Xà ngang thập giá cứu độ -->
      <line x1="34" y1="38" x2="62" y2="38"/>
      <circle cx="34" cy="38" r="1.8" fill="#1E293B"/>
      <circle cx="62" cy="38" r="1.8" fill="#1E293B"/>
    </g>

    <!-- Cánh Mỏ Neo Uốn Cong Cắm Chặt Giữa Sóng Gió -->
    <path d="M30 54 C32 68 40 76 48 76 C56 76 64 68 66 54" stroke="#1E293B" stroke-width="3" stroke-linecap="round" fill="none"/>
    <!-- Mũi nhọn neo (Flukes) -->
    <path d="M26 57 L30 52 L34 58 M70 57 L66 52 L62 58" stroke="#1E293B" stroke-width="2.2" stroke-linejoin="round" fill="#FFFFFF"/>
  </g>

  <!-- Làn Sóng Trần Thế (Rhythmic Ocean Crest Waves) -->
  <g stroke="#0284C7" stroke-width="2" stroke-linecap="round" fill="none">
    <path d="M16 80 C24 76 32 84 40 80 C48 76 56 84 64 80 C72 76 80 84 84 80"/>
    <path d="M22 85 C30 82 38 88 46 85 C54 82 62 88 70 85" stroke="#38BDF8" stroke-width="1.5" opacity="0.6"/>
  </g>
</svg>
`
};

console.log('Writing 6 UI-optimized sector badges to:', outDir);
for (const [name, content] of Object.entries(BADGES)) {
  const filePath = path.join(outDir, `${name}.svg`);
  fs.writeFileSync(filePath, content.trim(), 'utf-8');
  console.log(` -> Saved ${filePath}`);
}

console.log('Done! All 6 badges are ready for UI testing.');
