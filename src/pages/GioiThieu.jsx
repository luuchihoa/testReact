import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { motion as Motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  Baby,
  Wheat,
  Flame,
  BookOpen,
  Church,
  Compass,
  Users,
  ArrowRight,
  ArrowUpRight,
  Sunrise,
  Sunset,
  Star,
  Heart,
  Leaf,
  ChevronLeft,
  ChevronRight,
  X,
  Images,
  CalendarDays,
  MapPin,
  Cross
} from "lucide-react";
import { CENTRAL_MASS } from "../data/lichHocData.js";
import "./GioiThieu.css";

/* ─────────────────────────────────────────────
   1. DỮ LIỆU 6 KHỐI GIÁO LÝ HÙNG TÂM DŨNG CHÍ & TÔNG ĐỒ
───────────────────────────────────────────── */
const nganhList = [
  {
    id: "khai-tam",
    nganh: "Khối Khai Tâm (Vườn Trẻ & Khai Tâm)",
    khoi: [
      { ten: "Khối Khai Tâm", tuoi: "5 – 7 tuổi · Khăn Xanh Lá Trơn", moTa: "Làm quen với Chúa qua lời kinh, bài hát, cử điệu và câu chuyện Kinh Thánh đơn sơ.", icon: Baby, to: "/khối-chiên-con" }
    ]
  },
  {
    id: "ruoc-le",
    nganh: "Khối Rước Lễ Lần Đầu",
    khoi: [
      { ten: "Khối Rước Lễ (RLLĐ 1 & 2)", tuoi: "8 – 9 tuổi · Khăn Xanh Có Viền", moTa: "Chuẩn bị tâm hồn thánh thiện rước Mình Thánh Chúa Kitô và lãnh nhận Bí tích Hòa Giải.", icon: Wheat, to: "/khối-rước-lễ" }
    ]
  },
  {
    id: "them-suc",
    nganh: "Khối Thêm Sức",
    khoi: [
      { ten: "Khối Thêm Sức 1 & 2", tuoi: "10 – 11 tuổi · Khăn Vàng Có Viền", moTa: "Đón nhận Bảy Ơn Chúa Thánh Thần và sống can đảm, quảng đại dấn thân.", icon: Flame, to: "/khối-thêm-sức" }
    ]
  },
  {
    id: "phung-vu",
    nganh: "Khối Phụng Vụ",
    khoi: [
      { ten: "Khối Phụng Vụ (Lớp 7)", tuoi: "12 tuổi · Khăn Da Cam Có Viền", moTa: "Tập sự phục vụ bàn thờ, giúp lễ và sống đời phụng vụ sốt sắng.", icon: Church, to: "/khối-phụng-vụ" }
    ]
  },
  {
    id: "kinh-thanh",
    nganh: "Khối Kinh Thánh",
    khoi: [
      { ten: "Khối Kinh Thánh 1 & 2", tuoi: "13 – 14 tuổi · Khăn Đỏ Có Viền", moTa: "Đào sâu 73 cuốn Sách Thánh Cựu Ước & Tân Ước và sống Lời Chúa mỗi ngày.", icon: BookOpen, to: "/khối-kinh-thánh" }
    ]
  },
  {
    id: "chinh-chien",
    nganh: "Khối Vào Đời",
    khoi: [
      { ten: "Khối Vào Đời 1 & 2", tuoi: "15 – 16 tuổi · Khăn Đỏ Có Viền", moTa: "Rèn luyện bản lĩnh người tông đồ trẻ, sống đạo giữa đời và làm Huynh Trưởng.", icon: Compass, to: "/khối-vào-đời" }
    ]
  },
  {
    id: "tong-do",
    nganh: "Sinh Hoạt Tông Đồ",
    khoi: [
      { ten: "Giới Trẻ Giáo Xứ", tuoi: "Sinh viên & Đi làm", moTa: "Tiếp nối sứ vụ phục vụ Giáo hội và tha nhân trong đời sống trưởng thành.", icon: Users, to: "/giới-trẻ-công-giáo" }
    ]
  }
];

/* ── Bảng màu ngành & khối chuẩn hóa theo màu khăn quàng HTDC (WCAG AAA >= 7.0:1) ── */
const accentStyles = {
  "khai-tam": {
    dot: "bg-emerald-600",
    ring: "ring-emerald-500/20",
    line: "from-emerald-500/50",
    text: "text-emerald-900 dark:text-emerald-300",
    bg: "bg-emerald-50 dark:bg-emerald-950/50",
    border: "border-emerald-200/80 dark:border-emerald-800/50",
  },
  "ruoc-le": {
    dot: "bg-teal-600",
    ring: "ring-teal-500/20",
    line: "from-teal-500/50",
    text: "text-teal-900 dark:text-teal-300",
    bg: "bg-teal-50 dark:bg-teal-950/50",
    border: "border-teal-200/80 dark:border-teal-800/50",
  },
  "them-suc": {
    dot: "bg-amber-500",
    ring: "ring-amber-500/20",
    line: "from-amber-500/50",
    text: "text-amber-900 dark:text-amber-300",
    bg: "bg-amber-50 dark:bg-amber-950/50",
    border: "border-amber-200/80 dark:border-amber-800/50",
  },
  "phung-vu": {
    dot: "bg-orange-500",
    ring: "ring-orange-500/20",
    line: "from-orange-500/50",
    text: "text-orange-950 dark:text-orange-300",
    bg: "bg-orange-50 dark:bg-orange-950/50",
    border: "border-orange-200/80 dark:border-orange-800/50",
  },
  "kinh-thanh": {
    dot: "bg-red-600",
    ring: "ring-red-500/20",
    line: "from-red-500/50",
    text: "text-red-900 dark:text-red-300",
    bg: "bg-red-50 dark:bg-red-950/50",
    border: "border-red-200/80 dark:border-red-800/50",
  },
  "chinh-chien": {
    dot: "bg-rose-600",
    ring: "ring-rose-500/20",
    line: "from-rose-500/50",
    text: "text-rose-900 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/50",
    border: "border-rose-200/80 dark:border-rose-800/50",
  },
  "vao-doi": {
    dot: "bg-rose-600",
    ring: "ring-rose-500/20",
    line: "from-rose-500/50",
    text: "text-rose-900 dark:text-rose-300",
    bg: "bg-rose-50 dark:bg-rose-950/50",
    border: "border-rose-200/80 dark:border-rose-800/50",
  },
  "tong-do": {
    dot: "bg-indigo-600",
    ring: "ring-indigo-500/20",
    line: "from-indigo-500/50",
    text: "text-indigo-900 dark:text-indigo-300",
    bg: "bg-indigo-50 dark:bg-indigo-950/50",
    border: "border-indigo-200/80 dark:border-indigo-800/50",
  },
};

/* ─────────────────────────────────────────────
   2. DỮ LIỆU LỊCH THÁNH LỄ
───────────────────────────────────────────── */
const centralMassStartTime = CENTRAL_MASS?.time ? CENTRAL_MASS.time.split(" ")[0] : "08:00";

const lichNgayThuong = [
  { icon: Sunrise, gio: "04:30", nhan: "Lễ Sáng" },
  { icon: Sunset, gio: "17:30", nhan: "Lễ Chiều" }
];

const lichCuoiTuan = [
  { ten: "Thánh Lễ I", gio: "17:30", khi: "Chiều Thứ Bảy", ghiChu: "Lễ thay Chúa Nhật", icon: Sunset, noiBat: false },
  { ten: "Thánh Lễ II", gio: "05:00", khi: "Sáng Chúa Nhật", ghiChu: "Lễ Cộng đoàn", icon: Sunrise, noiBat: false },
  { ten: "Thánh Lễ III", gio: centralMassStartTime, khi: "Sáng Chúa Nhật", ghiChu: "Dành riêng cho Xứ đoàn Thiếu Nhi", icon: Star, noiBat: true },
  { ten: "Thánh Lễ IV", gio: "15:00", khi: "Chiều Chúa Nhật", ghiChu: "Lễ Cộng đoàn", icon: Sunset, noiBat: false }
];

/* ── Helper chuẩn hóa URL tĩnh tương thích Base URL ── */
const asset = (path) => `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`;
const photo = (name, width = 1280) => asset(`images/gioi-thieu/${name}-${width}.webp`);

const galleryImages = [
  { name: "cung-nhau", title: "Cùng nhau lưu giữ thanh xuân", category: "Sinh hoạt", desc: "Nụ cười và những chiếc khăn quàng trong một buổi sinh hoạt tập thể." },
  { name: "doi-trong", title: "Nhịp trống trước thánh đường", category: "Phụng vụ", desc: "Đội trống trong trang phục đồng bộ, tập trung trước sân nhà thờ." },
  { name: "cong-doan", title: "Một cộng đoàn, một niềm tin", category: "Phụng vụ", desc: "Khoảnh khắc chụp ảnh chung của cộng đoàn trước thánh đường." },
  { name: "hoi-trai", title: "Bước vào ngày hội", category: "Sinh hoạt", desc: "Cổng trại được trang trí dưới những tán cây trong khuôn viên." },
  { name: "thanh-duong", title: "Thánh đường thân thương", category: "Giáo xứ", desc: "Hai tháp chuông vươn cao, sân nhà thờ rực rỡ cờ hoa." },
  { name: "nu-cuoi", title: "Niềm vui được ở bên nhau", category: "Sinh hoạt", desc: "Các thành viên cùng lưu lại một bức ảnh bên cổng trang trí bóng bay." },
  { name: "thanh-le", title: "Quây quần trong lời nguyện", category: "Phụng vụ", desc: "Cộng đoàn quy tụ trong không gian trang nghiêm của thánh đường." },
  { name: "don-tiep", title: "Hân hoan chào đón", category: "Giáo xứ", desc: "Những hàng người chào đón trên lối đi vào nhà thờ." },
  { name: "phung-vu", title: "Hiệp nhất trong phục vụ", category: "Phụng vụ", desc: "Tập thể trong lễ phục chụp ảnh kỷ niệm trước cửa nhà thờ." },
  { name: "dem-hoi", title: "Thánh đường lên đèn", category: "Giáo xứ", desc: "Ánh sáng và sắc màu trên mặt tiền nhà thờ trong buổi sinh hoạt buổi tối." }
];

const categories = ["Tất cả", "Sinh hoạt", "Phụng vụ", "Giáo xứ"];

const leaders = [
  { name: "Cha Phaolô Maria Trần Quốc Việt", role: "Linh mục Quản xứ", image: "cha_quan_xu.jpg" },
  { name: "Cha Giuse Võ Ngọc Thân", role: "Linh mục Phó xứ", image: "cha_pho_xu.jpg" }
];

function Photo({ name, alt, eager = false, sizes = "(max-width: 640px) 100vw, 50vw", ...props }) {
  return (
    <img
      src={photo(name)}
      srcSet={`${photo(name, 640)} 640w, ${photo(name)} 1280w, ${photo(name, 1920)} 1920w`}
      sizes={sizes}
      alt={alt}
      loading={eager ? "eager" : "lazy"}
      fetchPriority={eager ? "high" : undefined}
      decoding="async"
      width="2048"
      height="1365"
      {...props}
    />
  );
}

function PhotoViewer({ items, initialIndex, onClose }) {
  const [index, setIndex] = useState(initialIndex);
  const dialogRef = useRef(null);
  const item = items[index];
  const move = (direction) => setIndex((current) => (current + direction + items.length) % items.length);

  useEffect(() => {
    const dialog = dialogRef.current;
    const trigger = document.activeElement;
    const overflow = document.body.style.overflow;
    const lenis = window.lenis;
    const resumeLenis = lenis && !lenis.isStopped;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    if (resumeLenis) lenis.stop();
    return () => {
      dialog.close();
      document.body.style.overflow = overflow;
      if (resumeLenis) lenis.start();
      if (trigger instanceof HTMLElement && trigger.isConnected) {
        trigger.focus({ preventScroll: true });
      }
    };
  }, []);

  return (
    <dialog
      ref={dialogRef}
      className="about-viewer"
      aria-labelledby="about-photo-title"
      aria-describedby="about-photo-desc"
      data-lenis-prevent
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      onKeyDown={(event) => {
        if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
          event.preventDefault();
          move(event.key === "ArrowLeft" ? -1 : 1);
        }
      }}
    >
      <div className="about-viewer-panel">
        <div className="about-viewer-toolbar">
          <span>
            {item.category} <span aria-live="polite">· {index + 1} / {items.length}</span>
          </span>
          <button type="button" autoFocus onClick={onClose} aria-label="Đóng xem ảnh">
            <X size={22} aria-hidden="true" />
          </button>
        </div>
        <div className="about-viewer-stage">
          <Photo key={item.name} name={item.name} alt={item.title} eager sizes="90vw" />
          <button type="button" className="about-viewer-prev" aria-label="Ảnh trước" onClick={() => move(-1)}>
            <ChevronLeft aria-hidden="true" />
          </button>
          <button type="button" className="about-viewer-next" aria-label="Ảnh kế tiếp" onClick={() => move(1)}>
            <ChevronRight aria-hidden="true" />
          </button>
        </div>
        <div className="about-viewer-caption">
          <h2 id="about-photo-title">{item.title}</h2>
          <p id="about-photo-desc">{item.desc}</p>
        </div>
      </div>
    </dialog>
  );
}

export default function GioiThieu() {
  const shouldReduceMotion = useReducedMotion();
  const [category, setCategory] = useState("Tất cả");
  const [viewer, setViewer] = useState(null);
  const filteredImages = galleryImages.filter((item) => category === "Tất cả" || item.category === category);

  /* ── Motion Variants tuân thủ AGENTS.md (Trang nghiêm, điềm đạm, 100% disabled on reduced motion) ── */
  const variants = shouldReduceMotion
    ? {
        heroContainer: { hidden: { opacity: 1 }, visible: { opacity: 1 } },
        heroItem: { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } },
        sectionReveal: { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } },
        gridContainer: { hidden: { opacity: 1 }, visible: { opacity: 1 } },
        cardItem: { hidden: { opacity: 1, y: 0 }, visible: { opacity: 1, y: 0 } },
        galleryContainer: {
          initial: { opacity: 1 },
          animate: { opacity: 1 },
          exit: { opacity: 1 },
          transition: { duration: 0 }
        }
      }
    : {
        heroContainer: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.06,
              delayChildren: 0.04
            }
          }
        },
        heroItem: {
          hidden: { opacity: 0, y: 14 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.42, ease: [0.25, 1, 0.5, 1] }
          }
        },
        sectionReveal: {
          hidden: { opacity: 0, y: 16 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
          }
        },
        gridContainer: {
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.05,
              delayChildren: 0.02
            }
          }
        },
        cardItem: {
          hidden: { opacity: 0, y: 12 },
          visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.35, ease: [0.25, 1, 0.5, 1] }
          }
        },
        galleryContainer: {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.2, ease: "easeInOut" }
        }
      };

  useEffect(() => {
    const previousTitle = document.title;
    document.title = "Giới thiệu Xứ đoàn Mẹ Mân Côi | Giáo xứ An Ngãi";
    const existing = document.querySelector('meta[name="description"]');
    const description = existing || document.createElement("meta");
    const previousDescription = description.getAttribute("content");
    description.name = "description";
    description.content = "Tìm hiểu Xứ đoàn Mẹ Mân Côi, Giáo xứ An Ngãi: hành trình giáo lý, người đồng hành, hình ảnh hoạt động và lịch thánh lễ.";
    if (!existing) document.head.appendChild(description);
    return () => {
      document.title = previousTitle;
      if (!existing) description.remove();
      else if (previousDescription === null) description.removeAttribute("content");
      else description.setAttribute("content", previousDescription);
    };
  }, []);

  function jumpTo(event, id) {
    event.preventDefault();
    const target = document.getElementById(id);
    if (!target) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    target.focus({ preventScroll: true });
    target.scrollIntoView({ behavior: reduced ? "instant" : "smooth", block: "start" });
  }

  return (
    <div className="about-page">
      {/* ════ 1. HERO SECTION ════ */}
      <section className="about-hero about-shell" aria-labelledby="about-title">
        <Motion.div
          className="about-hero-copy"
          initial="hidden"
          animate="visible"
          variants={variants.heroContainer}
        >
          <Motion.p className="about-eyebrow" variants={variants.heroItem}>
            <span aria-hidden="true" /> GIÁO PHẬN ĐÀ NẴNG · GIÁO XỨ AN NGÃI
          </Motion.p>
          <Motion.p className="about-overline" variants={variants.heroItem}>
            Chào mừng đến với
          </Motion.p>
          <Motion.h1 id="about-title" variants={variants.heroItem}>
            Xứ đoàn<br />
            <em>Mẹ Mân Côi</em>
          </Motion.h1>
          <Motion.p className="about-intro" variants={variants.heroItem}>
            Cùng lớn lên trong đức tin.<br />
            Cùng trao đi yêu thương.
          </Motion.p>
          <Motion.p className="about-description" variants={variants.heroItem}>
            Một mái nhà để các em học giáo lý, tìm thấy tình bạn và lớn lên trong tinh thần yêu thương, phục vụ.
          </Motion.p>
          <Motion.div className="about-actions" variants={variants.heroItem}>
            <Link className="about-button about-button-primary" to="/tuyển-sinh">
              <span>Tìm hiểu tuyển sinh</span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
            <a
              className="about-text-link"
              href="#ky-uc-section"
              onClick={(event) => jumpTo(event, "ky-uc-section")}
            >
              <Images size={18} aria-hidden="true" />
              <span>Những khoảnh khắc</span>
            </a>
          </Motion.div>
          <Motion.div className="about-hero-note" variants={variants.heroItem}>
            <MapPin size={16} aria-hidden="true" />
            <span>Xứ đoàn Mẹ Mân Côi · Giáo xứ An Ngãi</span>
          </Motion.div>
        </Motion.div>

        <Motion.figure
          className="about-hero-photo"
          initial="hidden"
          animate="visible"
          variants={variants.heroItem}
        >
          <Photo name="thanh-duong" alt="Thánh đường với hai tháp chuông và cờ hoa trước sân" eager sizes="(max-width: 900px) 100vw, 55vw" />
          <figcaption>
            <span>ĐỨC TIN KẾT NỐI CHÚNG TA</span>
            <strong>Nơi những hành trình bắt đầu.</strong>
          </figcaption>
          <div className="about-photo-seal" aria-hidden="true">
            <Cross size={23} aria-hidden="true" />
            <span>TIN YÊU<br />& PHỤC VỤ</span>
          </div>
        </Motion.figure>
      </section>

      {/* ════ 2. NAVIGATION SHORTCUTS ════ */}
      <Motion.nav
        className="about-shortcuts about-shell"
        aria-label="Khám phá trang giới thiệu"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={variants.sectionReveal}
      >
        <a href="#khoi-hoc-section" onClick={(event) => jumpTo(event, "khoi-hoc-section")}>
          <BookOpen aria-hidden="true" />
          <span>
            <small>HÀNH TRÌNH GIÁO LÝ</small>
            Khối học phù hợp với em
          </span>
          <ArrowUpRight aria-hidden="true" />
        </a>
        <Link to="/lịch-học">
          <CalendarDays aria-hidden="true" />
          <span>
            <small>DÀNH CHO PHỤ HUYNH</small>
            Theo dõi lịch học
          </span>
          <ArrowUpRight aria-hidden="true" />
        </Link>
        <a href="#gio-le-section" onClick={(event) => jumpTo(event, "gio-le-section")}>
          <Church aria-hidden="true" />
          <span>
            <small>ĐỜI SỐNG CỘNG ĐOÀN</small>
            Xem giờ thánh lễ
          </span>
          <ArrowUpRight aria-hidden="true" />
        </a>
      </Motion.nav>

      {/* ════ 3. TINH THẦN & GIÁ TRỊ CỐT LÕI ════ */}
      <section className="about-shell about-section about-story" aria-labelledby="about-story-title">
        <Motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={variants.sectionReveal}
        >
          <p className="about-eyebrow">TIN YÊU · ĐỒNG HÀNH · PHỤC VỤ</p>
          <h2 id="about-story-title">
            Một đức tin được nuôi dưỡng<br />
            <em>từ những điều giản dị.</em>
          </h2>
        </Motion.div>

        <Motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={variants.sectionReveal}
        >
          <p>Dưới sự chở che của Đức Mẹ Mân Côi, Xứ đoàn đồng hành cùng các em qua từng giờ giáo lý, lời cầu nguyện và những sinh hoạt chung.</p>
          <p>Ở đây, bài học không chỉ nằm trên trang sách, mà còn trong cách chúng ta lắng nghe, sẻ chia và chăm sóc nhau mỗi ngày.</p>
        </Motion.div>

        <Motion.div
          className="about-values"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={variants.gridContainer}
        >
          {[
            { icon: BookOpen, title: "Học hỏi đức tin", text: "Tìm hiểu Lời Chúa, tập cầu nguyện và đem điều đã học vào cuộc sống." },
            { icon: Heart, title: "Lớn lên trong yêu thương", text: "Biết lắng nghe, nâng đỡ bạn bè và cùng nhau xây dựng tình thân." },
            { icon: Leaf, title: "Sẵn sàng phục vụ", text: "Bắt đầu từ những việc nhỏ, góp niềm vui cho gia đình và cộng đoàn." }
          ].map((value, index) => {
            const { icon: Icon, title, text } = value;
            return (
              <Motion.div className="about-value" key={title} variants={variants.cardItem}>
                <span className="about-value-number">0{index + 1}</span>
                <Icon size={24} aria-hidden="true" />
                <h3>{title}</h3>
                <p>{text}</p>
              </Motion.div>
            );
          })}
        </Motion.div>
      </section>

      {/* ════ 4. HÀNH TRÌNH 6 KHỐI GIÁO LÝ ĐỨC TIN ════ */}
      <section id="khoi-hoc-section" tabIndex={-1} className="about-section about-pathways" aria-labelledby="about-path-title">
        <div className="about-shell">
          <Motion.div
            className="about-section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={variants.sectionReveal}
          >
            <div>
              <p className="about-eyebrow">TỪ NHỮNG BƯỚC CHÂN ĐẦU TIÊN</p>
              <h2 id="about-path-title">
                Mỗi độ tuổi,<br />
                <em>một chặng đường đức tin.</em>
              </h2>
            </div>
            <div>
              <p>Khám phá các khối giáo lý và sinh hoạt. Phụ huynh có thể liên hệ Ban Giáo lý để được hướng dẫn xếp lớp phù hợp.</p>
              <Link className="about-text-link" to="/liên-hệ">
                <span>Nhận hướng dẫn</span>
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            </div>
          </Motion.div>

          <Motion.div
            className="about-path-list"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.1 }}
            variants={variants.gridContainer}
          >
            {nganhList.map((group, index) => (
              <Motion.div className="about-path-row" key={group.id} variants={variants.cardItem}>
                <div className="about-path-label">
                  <span>0{index + 1}</span>
                  <h3>{group.nganh}</h3>
                </div>
                <div className="about-path-cards">
                  {group.khoi.map((block) => {
                    const { ten, tuoi, moTa, icon: Icon, to } = block;
                    const style = accentStyles[group.id] || accentStyles["khai-tam"];
                    return (
                      <Link to={to} key={ten} className="about-path-card">
                        <span className={`about-path-icon ${style.bg} ${style.text} border ${style.border}`}>
                          <Icon size={23} aria-hidden="true" />
                        </span>
                        <div>
                          <span className="about-age">{tuoi}</span>
                          <h4>{ten}</h4>
                          <p>{moTa}</p>
                        </div>
                        <ArrowUpRight size={19} className="about-card-arrow" aria-hidden="true" />
                      </Link>
                    );
                  })}
                </div>
              </Motion.div>
            ))}
          </Motion.div>

          <div className="about-path-footer">
            <span>Cùng học hỏi và thực hành Lời Chúa mỗi ngày.</span>
            <Link className="about-text-link" to="/tài-liệu">
              <span>Khám phá tủ sách số</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ════ 5. KÝ ỨC XỨ ĐOÀN & GALLERY ════ */}
      <section id="ky-uc-section" tabIndex={-1} className="about-section about-gallery" aria-labelledby="about-gallery-title">
        <div className="about-shell">
          <Motion.div
            className="about-section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={variants.sectionReveal}
          >
            <div>
              <p className="about-eyebrow">NHỮNG GƯƠNG MẶT, NHỮNG CÂU CHUYỆN</p>
              <h2 id="about-gallery-title">
                Thanh xuân có nhau.<br />
                <em>Ký ức còn mãi.</em>
              </h2>
            </div>
            <p>Từ những giờ phụng vụ trang nghiêm đến ngày hội rộn ràng, mỗi bức ảnh là một phần đời sống cộng đoàn.</p>
          </Motion.div>

          <Motion.div
            className="about-gallery-tools"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={variants.sectionReveal}
          >
            <div className="about-filters" role="group" aria-label="Lọc ảnh theo chủ đề">
              {categories.map((name) => (
                <button
                  type="button"
                  key={name}
                  aria-pressed={category === name}
                  onClick={() => setCategory(name)}
                >
                  {name}
                </button>
              ))}
            </div>
            <span className="about-image-count" role="status">
              {filteredImages.length} khoảnh khắc
            </span>
          </Motion.div>

          <AnimatePresence mode="wait">
            <Motion.div
              key={category}
              className="about-gallery-grid"
              initial="initial"
              animate="animate"
              exit="exit"
              variants={variants.galleryContainer}
            >
              {filteredImages.map((item, index) => (
                <button
                  type="button"
                  className="about-gallery-card"
                  key={item.name}
                  aria-label={`Xem ảnh: ${item.title}`}
                  onClick={() => setViewer({ items: filteredImages, index })}
                >
                  <Photo
                    name={item.name}
                    alt={item.title}
                    sizes={index === 0 ? "(max-width: 800px) 100vw, 66vw" : "(max-width: 600px) 100vw, (max-width: 800px) 50vw, 33vw"}
                  />
                  <span className="about-gallery-overlay">
                    <small>{item.category}</small>
                    <strong>{item.title}</strong>
                  </span>
                  <span className="about-gallery-expand" aria-hidden="true">
                    <ArrowUpRight size={20} aria-hidden="true" />
                  </span>
                </button>
              ))}
            </Motion.div>
          </AnimatePresence>

          <p className="about-gallery-hint">
            <Images size={16} aria-hidden="true" /> Chọn một bức ảnh để xem trọn khoảnh khắc.
          </p>
        </div>
      </section>

      {/* ════ 6. NGƯỜI ĐỒNG HÀNH & QUÝ CHA ════ */}
      <section className="about-section about-shell" aria-labelledby="about-leaders-title">
        <Motion.div
          className="about-section-heading"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={variants.sectionReveal}
        >
          <div>
            <p className="about-eyebrow">CÙNG NHAU TRÊN HÀNH TRÌNH</p>
            <h2 id="about-leaders-title">
              Những người <em>đồng hành.</em>
            </h2>
          </div>
          <p>Quý Cha cùng các anh chị giáo lý viên, huynh trưởng đồng hành với các em trong đời sống đức tin.</p>
        </Motion.div>

        <Motion.div
          className="about-leaders"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={variants.sectionReveal}
        >
          {leaders.map((person) => (
            <article className="about-leader" key={person.name}>
              <img src={asset(`images/${person.image}`)} alt={person.name} width="112" height="112" loading="lazy" decoding="async" />
              <div>
                <p className="about-eyebrow">{person.role}</p>
                <h3>{person.name}</h3>
              </div>
            </article>
          ))}
        </Motion.div>

        <Motion.div
          className="about-companions"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          variants={variants.sectionReveal}
        >
          <Photo name="nu-cuoi" alt="Các thành viên quây quần chụp ảnh trong buổi sinh hoạt" />
          <div>
            <Users size={28} aria-hidden="true" />
            <h3>
              Có những người anh, người chị<br />
              luôn sẵn lòng bên em.
            </h3>
            <p>Các anh chị giáo lý viên và huynh trưởng cùng chuẩn bị bài học, tổ chức sinh hoạt và chia sẻ niềm vui phục vụ.</p>
            <Link className="about-text-link" to="/liên-hệ">
              <span>Kết nối với Ban Giáo lý</span>
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </div>
        </Motion.div>
      </section>

      {/* ════ 7. LỊCH THÁNH LỄ GIÁO XỨ & XỨ ĐOÀN ════ */}
      <section id="gio-le-section" tabIndex={-1} className="about-section about-schedule" aria-labelledby="about-mass-title">
        <div className="about-shell">
          <Motion.div
            className="about-section-heading"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={variants.sectionReveal}
          >
            <div>
              <p className="about-eyebrow">NHỊP SỐNG PHỤNG VỤ</p>
              <h2 id="about-mass-title">
                Hẹn nhau nơi <em>thánh đường.</em>
              </h2>
            </div>
            <Link className="about-text-link" to="/lịch-sinh-hoạt">
              <span>Xem lịch sinh hoạt</span>
              <ArrowUpRight size={18} aria-hidden="true" />
            </Link>
          </Motion.div>

          <Motion.div
            className="about-schedule-grid"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.15 }}
            variants={variants.sectionReveal}
          >
            <div className="about-weekday">
              <Church size={30} aria-hidden="true" />
              <h3>Ngày thường</h3>
              <p>Thứ Hai – Thứ Bảy</p>
              {lichNgayThuong.map((mass) => {
                const { nhan, gio, icon: Icon } = mass;
                return (
                  <div className="about-mass-time" key={nhan}>
                    <span>
                      <Icon size={18} aria-hidden="true" />
                      {nhan}
                    </span>
                    <strong>{gio}</strong>
                  </div>
                );
              })}
            </div>

            <div className="about-weekend">
              <h3>Cuối tuần</h3>
              <div>
                {lichCuoiTuan.map((mass) => (
                  <article className={mass.noiBat ? "about-mass featured" : "about-mass"} key={mass.ten}>
                    <span>{mass.khi}</span>
                    <strong>{mass.gio}</strong>
                    <p>{mass.noiBat ? "Thánh lễ Thiếu nhi" : mass.ghiChu}</p>
                  </article>
                ))}
              </div>
            </div>
          </Motion.div>

          <p className="about-schedule-note">
            Giờ lễ có thể thay đổi vào các dịp đặc biệt. Vui lòng theo dõi thông báo của giáo xứ.
          </p>
        </div>
      </section>

      {/* ════ 8. FINAL CTA BANNER ════ */}
      <Motion.section
        className="about-shell about-final"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.15 }}
        variants={variants.sectionReveal}
      >
        <span className="about-eyebrow">MỘT HÀNH TRÌNH MỚI ĐANG CHỜ</span>
        <h2>
          Cùng em viết tiếp<br />
          <em>câu chuyện đức tin.</em>
        </h2>
        <p>
          Tìm hiểu tuyển sinh hoặc kết nối với Ban Giáo lý<br className="about-desktop-break" /> để được hướng dẫn trước khi tham gia.
        </p>
        <div className="about-actions">
          <Link className="about-button about-button-primary" to="/tuyển-sinh">
            <span>Tìm hiểu tuyển sinh</span>
            <ArrowUpRight size={18} aria-hidden="true" />
          </Link>
          <Link className="about-button about-button-outline" to="/liên-hệ">
            <span>Liên hệ Ban Giáo lý</span>
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
        <Cross className="about-final-cross" aria-hidden="true" />
      </Motion.section>

      {viewer && <PhotoViewer items={viewer.items} initialIndex={viewer.index} onClose={() => setViewer(null)} />}
    </div>
  );
}
