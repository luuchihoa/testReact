import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Sprout, Cross, Flame, BookOpen, Church, Compass, Users, ArrowRight, ArrowUpRight, Sunrise, Sunset, Star, Heart, Leaf, ChevronLeft, ChevronRight, X, Images, CalendarDays, MapPin } from "lucide-react";
import "./GioiThieu.css";

const nganhList = [
  {
    nganh: "Ngành Ấu Nhi",
    accent: "emerald",
    khoi: [
      { ten: "Khối Chiên Con", tuoi: "6 – 7 tuổi", moTa: "Làm quen với Chúa qua lời kinh, bài hát.", icon: Sprout, to: "/khối-chiên-con" },
      { ten: "Khối Rước Lễ", tuoi: "8 – 9 tuổi", moTa: "Chuẩn bị tâm hồn rước Mình Thánh Chúa.", icon: Cross, to: "/khối-rước-lễ" }
    ]
  },
  {
    nganh: "Ngành Thiếu Nhi",
    accent: "blue",
    khoi: [
      { ten: "Khối Thêm Sức", tuoi: "10 – 11 tuổi", moTa: "Đón nhận ơn Chúa Thánh Thần.", icon: Flame, to: "/khối-thêm-sức" }
    ]
  },
  {
    nganh: "Ngành Nghĩa Sĩ",
    accent: "amber",
    khoi: [
      { ten: "Khối Phụng Vụ", tuoi: "12 tuổi", moTa: "Tập sự phục vụ bàn thờ, giúp lễ.", icon: Church, to: "/khối-phụng-vụ" },
      { ten: "Khối Kinh Thánh", tuoi: "13 – 14 tuổi", moTa: "Đào sâu Lịch Sử Cứu Độ.", icon: BookOpen, to: "/khối-kinh-thánh" },
    ]
  },
  {
    nganh: "Ngành Hiệp Sĩ",
    accent: "orange",
    khoi: [
      { ten: "Khối Vào Đời", tuoi: "15 – 16 tuổi", moTa: "Rèn luyện bản lĩnh người tông đồ trẻ.", icon: Compass, to: "/khối-vào-đời" }
    ]
  },
  {
    nganh: "Sinh Hoạt Tông Đồ",
    accent: "rose",
    khoi: [
      { ten: "Giới Trẻ", tuoi: "Sinh viên & Đi làm", moTa: "Tiếp nối sứ vụ trong đời sống trưởng thành.", icon: Users, to: "/giới-trẻ-công-giáo" }
    ]
  }
];

const accentStyles = {
  emerald: { dot: "bg-emerald-500", ring: "ring-emerald-500/20", line: "from-emerald-500/50", text: "text-emerald-700 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-200 dark:border-emerald-500/20" },
  blue:    { dot: "bg-blue-500",    ring: "ring-blue-500/20",    line: "from-blue-500/50",    text: "text-blue-700 dark:text-blue-400",       bg: "bg-blue-50 dark:bg-blue-500/10",       border: "border-blue-200 dark:border-blue-500/20" },
  amber:   { dot: "bg-amber-500",   ring: "ring-amber-500/20",   line: "from-amber-500/50",   text: "text-amber-700 dark:text-amber-400",     bg: "bg-amber-50 dark:bg-amber-500/10",     border: "border-amber-200 dark:border-amber-500/20" },
  orange:  { dot: "bg-orange-500",  ring: "ring-orange-500/20",  line: "from-orange-500/50",  text: "text-orange-700 dark:text-orange-400",   bg: "bg-orange-50 dark:bg-orange-500/10",   border: "border-orange-200 dark:border-orange-500/20" },
  rose:    { dot: "bg-rose-500",    ring: "ring-rose-500/20",    line: "from-rose-500/50",    text: "text-rose-700 dark:text-rose-400",       bg: "bg-rose-50 dark:bg-rose-500/10",       border: "border-rose-200 dark:border-rose-500/20" }
};

const lichNgayThuong = [
  { icon: Sunrise, gio: "04:30", nhan: "Lễ Sáng" },
  { icon: Sunset, gio: "17:30", nhan: "Lễ Chiều" }
];
 
const lichCuoiTuan = [
  { ten: "Thánh Lễ I",   gio: "17:30", khi: "Chiều Thứ Bảy", ghiChu: "Lễ thay Chủ Nhật",                 icon: Sunset,  noiBat: false },
  { ten: "Thánh Lễ II",  gio: "05:00", khi: "Sáng Chủ Nhật", ghiChu: "Lễ Cộng đoàn",                     icon: Sunrise, noiBat: false },
  { ten: "Thánh Lễ III", gio: "08:00", khi: "Sáng Chủ Nhật", ghiChu: "Dành riêng cho Xứ đoàn Thiếu Nhi", icon: Star,    noiBat: true },
  { ten: "Thánh Lễ IV",  gio: "15:00", khi: "Chiều Chủ Nhật",ghiChu: "Lễ Cộng đoàn",                     icon: Sunset,  noiBat: false }
];

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
  { name: "dem-hoi", title: "Thánh đường lên đèn", category: "Giáo xứ", desc: "Ánh sáng và sắc màu trên mặt tiền nhà thờ trong buổi sinh hoạt buổi tối." },
];
const categories = ["Tất cả", "Sinh hoạt", "Phụng vụ", "Giáo xứ"];
const leaders = [
  { name: "Cha Phaolô Maria Trần Quốc Việt", role: "Linh mục Quản xứ", image: "cha_quan_xu.jpg" },
  { name: "Cha Giuse Võ Ngọc Thân", role: "Linh mục Phó xứ", image: "cha_pho_xu.jpg" },
];

function Photo({ name, alt, eager = false, sizes = "(max-width: 640px) 100vw, 50vw", ...props }) {
  return <img src={photo(name)} srcSet={`${photo(name, 640)} 640w, ${photo(name)} 1280w, ${photo(name, 1920)} 1920w`} sizes={sizes} alt={alt} loading={eager ? "eager" : "lazy"} fetchPriority={eager ? "high" : undefined} decoding="async" width="2048" height="1365" {...props} />;
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
      if (trigger instanceof HTMLElement && trigger.isConnected) trigger.focus({ preventScroll: true });
    };
  }, []);

  return <dialog ref={dialogRef} className="about-viewer" aria-labelledby="about-photo-title" aria-describedby="about-photo-desc" data-lenis-prevent
    onCancel={(event) => { event.preventDefault(); onClose(); }}
    onClick={(event) => { if (event.target === event.currentTarget) onClose(); }}
    onKeyDown={(event) => {
      if (event.key === "ArrowLeft" || event.key === "ArrowRight") {
        event.preventDefault(); move(event.key === "ArrowLeft" ? -1 : 1);
      }
    }}>
    <div className="about-viewer-panel">
      <div className="about-viewer-toolbar"><span>{item.category} <span aria-live="polite">· {index + 1} / {items.length}</span></span><button type="button" autoFocus onClick={onClose} aria-label="Đóng xem ảnh"><X size={22} /></button></div>
      <div className="about-viewer-stage">
        <Photo key={item.name} name={item.name} alt={item.title} eager sizes="90vw" />
        <button type="button" className="about-viewer-prev" aria-label="Ảnh trước" onClick={() => move(-1)}><ChevronLeft /></button>
        <button type="button" className="about-viewer-next" aria-label="Ảnh kế tiếp" onClick={() => move(1)}><ChevronRight /></button>
      </div>
      <div className="about-viewer-caption"><h2 id="about-photo-title">{item.title}</h2><p id="about-photo-desc">{item.desc}</p></div>
    </div>
  </dialog>;
}

export default function GioiThieu() {
  const [category, setCategory] = useState("Tất cả");
  const [viewer, setViewer] = useState(null);
  const filteredImages = galleryImages.filter((item) => category === "Tất cả" || item.category === category);

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

  return <div className="about-page">
    <section className="about-hero about-shell" aria-labelledby="about-title">
      <div className="about-hero-copy">
        <p className="about-eyebrow"><span /> GIÁO PHẬN ĐÀ NẴNG · GIÁO XỨ AN NGÃI</p>
        <p className="about-overline">Chào mừng đến với</p>
        <h1 id="about-title">Xứ đoàn<br /><em>Mẹ Mân Côi</em></h1>
        <p className="about-intro">Cùng lớn lên trong đức tin.<br />Cùng trao đi yêu thương.</p>
        <p className="about-description">Một mái nhà để các em học giáo lý, tìm thấy tình bạn và lớn lên trong tinh thần yêu thương, phục vụ.</p>
        <div className="about-actions">
          <Link className="about-button about-button-primary" to="/tuyển-sinh">Tìm hiểu tuyển sinh <ArrowUpRight size={18} /></Link>
          <a className="about-text-link" href="#ky-uc-section" onClick={(event) => jumpTo(event, "ky-uc-section")}><Images size={18} /> Những khoảnh khắc</a>
        </div>
        <div className="about-hero-note"><MapPin size={16} /><span>Xứ đoàn Mẹ Mân Côi · Giáo xứ An Ngãi</span></div>
      </div>
      <figure className="about-hero-photo">
        <Photo name="thanh-duong" alt="Thánh đường với hai tháp chuông và cờ hoa trước sân" eager sizes="(max-width: 900px) 100vw, 55vw" />
        <figcaption><span>ĐỨC TIN KẾT NỐI CHÚNG TA</span><strong>Nơi những hành trình bắt đầu.</strong></figcaption>
        <div className="about-photo-seal" aria-hidden="true"><Cross size={23} /><span>TIN YÊU<br />& PHỤC VỤ</span></div>
      </figure>
    </section>

    <nav className="about-shortcuts about-shell" aria-label="Khám phá trang giới thiệu">
      <a href="#khoi-hoc-section" onClick={(event) => jumpTo(event, "khoi-hoc-section")}><BookOpen /><span><small>HÀNH TRÌNH GIÁO LÝ</small>Khối học phù hợp với em</span><ArrowUpRight /></a>
      <Link to="/lịch-học"><CalendarDays /><span><small>DÀNH CHO PHỤ HUYNH</small>Theo dõi lịch học</span><ArrowUpRight /></Link>
      <a href="#gio-le-section" onClick={(event) => jumpTo(event, "gio-le-section")}><Church /><span><small>ĐỜI SỐNG CỘNG ĐOÀN</small>Xem giờ thánh lễ</span><ArrowUpRight /></a>
    </nav>

    <section className="about-shell about-section about-story" aria-labelledby="about-story-title">
      <div><p className="about-eyebrow">TIN YÊU · ĐỒNG HÀNH · PHỤC VỤ</p><h2 id="about-story-title">Một đức tin được nuôi dưỡng<br /><em>từ những điều giản dị.</em></h2></div>
      <div><p>Dưới sự chở che của Đức Mẹ Mân Côi, Xứ đoàn đồng hành cùng các em qua từng giờ giáo lý, lời cầu nguyện và những sinh hoạt chung.</p><p>Ở đây, bài học không chỉ nằm trên trang sách, mà còn trong cách chúng ta lắng nghe, sẻ chia và chăm sóc nhau mỗi ngày.</p></div>
      <div className="about-values">
        {[{ icon: BookOpen, title: "Học hỏi đức tin", text: "Tìm hiểu Lời Chúa, tập cầu nguyện và đem điều đã học vào cuộc sống." }, { icon: Heart, title: "Lớn lên trong yêu thương", text: "Biết lắng nghe, nâng đỡ bạn bè và cùng nhau xây dựng tình thân." }, { icon: Leaf, title: "Sẵn sàng phục vụ", text: "Bắt đầu từ những việc nhỏ, góp niềm vui cho gia đình và cộng đoàn." }].map((value, index) => { const { icon: Icon, title, text } = value; return <div className="about-value" key={title}><span className="about-value-number">0{index + 1}</span><Icon size={24} /><h3>{title}</h3><p>{text}</p></div>; })}
      </div>
    </section>

    <section id="khoi-hoc-section" tabIndex={-1} className="about-section about-pathways" aria-labelledby="about-path-title">
      <div className="about-shell">
        <div className="about-section-heading"><div><p className="about-eyebrow">TỪ NHỮNG BƯỚC CHÂN ĐẦU TIÊN</p><h2 id="about-path-title">Mỗi độ tuổi,<br /><em>một chặng đường đức tin.</em></h2></div><div><p>Khám phá các khối giáo lý và sinh hoạt. Phụ huynh có thể liên hệ Ban Giáo lý để được hướng dẫn xếp lớp phù hợp.</p><Link className="about-text-link" to="/liên-hệ">Nhận hướng dẫn <ArrowRight size={17} /></Link></div></div>
        <div className="about-path-list">{nganhList.map((group, index) => <div className="about-path-row" key={group.nganh}>
          <div className="about-path-label"><span>0{index + 1}</span><h3>{group.nganh}</h3></div>
          <div className="about-path-cards">{group.khoi.map((block) => { const { ten, tuoi, moTa, icon: Icon, to } = block; return <Link to={to} key={ten} className="about-path-card"><span className={`about-path-icon ${accentStyles[group.accent].bg} ${accentStyles[group.accent].text}`}><Icon size={23} /></span><div><span className="about-age">{tuoi}</span><h4>{ten}</h4><p>{moTa}</p></div><ArrowUpRight size={19} className="about-card-arrow" /></Link>; })}</div>
        </div>)}</div>
        <div className="about-path-footer"><span>Cùng học hỏi và thực hành Lời Chúa mỗi ngày.</span><Link className="about-text-link" to="/tài-liệu">Khám phá tủ sách số <ArrowRight size={17} /></Link></div>
      </div>
    </section>

    <section id="ky-uc-section" tabIndex={-1} className="about-section about-gallery" aria-labelledby="about-gallery-title">
      <div className="about-shell">
        <div className="about-section-heading"><div><p className="about-eyebrow">NHỮNG GƯƠNG MẶT, NHỮNG CÂU CHUYỆN</p><h2 id="about-gallery-title">Thanh xuân có nhau.<br /><em>Ký ức còn mãi.</em></h2></div><p>Từ những giờ phụng vụ trang nghiêm đến ngày hội rộn ràng, mỗi bức ảnh là một phần đời sống cộng đoàn.</p></div>
        <div className="about-gallery-tools"><div className="about-filters" role="group" aria-label="Lọc ảnh theo chủ đề">{categories.map((name) => <button type="button" key={name} aria-pressed={category === name} onClick={() => setCategory(name)}>{name}</button>)}</div><span className="about-image-count" role="status">{filteredImages.length} khoảnh khắc</span></div>
        <div className="about-gallery-grid">{filteredImages.map((item, index) => <button type="button" className="about-gallery-card" key={item.name} aria-label={`Xem ảnh: ${item.title}`} onClick={() => setViewer({ items: filteredImages, index })}>
          <Photo name={item.name} alt={item.title} sizes={index === 0 ? "(max-width: 800px) 100vw, 66vw" : "(max-width: 600px) 100vw, (max-width: 800px) 50vw, 33vw"} />
          <span className="about-gallery-overlay"><small>{item.category}</small><strong>{item.title}</strong></span><span className="about-gallery-expand" aria-hidden="true"><ArrowUpRight size={20} /></span>
        </button>)}</div>
        <p className="about-gallery-hint"><Images size={16} /> Chọn một bức ảnh để xem trọn khoảnh khắc.</p>
      </div>
    </section>

    <section className="about-section about-shell" aria-labelledby="about-leaders-title">
      <div className="about-section-heading"><div><p className="about-eyebrow">CÙNG NHAU TRÊN HÀNH TRÌNH</p><h2 id="about-leaders-title">Những người <em>đồng hành.</em></h2></div><p>Quý Cha cùng các anh chị giáo lý viên, huynh trưởng đồng hành với các em trong đời sống đức tin.</p></div>
      <div className="about-leaders">{leaders.map((person) => <article className="about-leader" key={person.name}><img src={asset(`images/${person.image}`)} alt={person.name} width="112" height="112" loading="lazy" decoding="async" /><div><p className="about-eyebrow">{person.role}</p><h3>{person.name}</h3></div></article>)}</div>
      <div className="about-companions"><Photo name="nu-cuoi" alt="Các thành viên quây quần chụp ảnh trong buổi sinh hoạt" /><div><Users size={28} /><h3>Có những người anh, người chị<br />luôn sẵn lòng bên em.</h3><p>Các anh chị giáo lý viên và huynh trưởng cùng chuẩn bị bài học, tổ chức sinh hoạt và chia sẻ niềm vui phục vụ.</p><Link className="about-text-link" to="/liên-hệ">Kết nối với Ban Giáo lý <ArrowRight size={17} /></Link></div></div>
    </section>

    <section id="gio-le-section" tabIndex={-1} className="about-section about-schedule" aria-labelledby="about-mass-title"><div className="about-shell">
      <div className="about-section-heading"><div><p className="about-eyebrow">NHỊP SỐNG PHỤNG VỤ</p><h2 id="about-mass-title">Hẹn nhau nơi <em>thánh đường.</em></h2></div><Link className="about-text-link" to="/lịch-sinh-hoạt">Xem lịch sinh hoạt <ArrowUpRight size={18} /></Link></div>
      <div className="about-schedule-grid"><div className="about-weekday"><Church size={30} /><h3>Ngày thường</h3><p>Thứ Hai – Thứ Bảy</p>{lichNgayThuong.map((mass) => { const { nhan, gio, icon: Icon } = mass; return <div className="about-mass-time" key={nhan}><span><Icon size={18} />{nhan}</span><strong>{gio}</strong></div>; })}</div><div className="about-weekend"><h3>Cuối tuần</h3><div>{lichCuoiTuan.map((mass) => <article className={mass.noiBat ? "about-mass featured" : "about-mass"} key={mass.ten}><span>{mass.khi}</span><strong>{mass.gio}</strong><p>{mass.noiBat ? "Thánh lễ Thiếu nhi" : mass.ghiChu}</p></article>)}</div></div></div>
      <p className="about-schedule-note">Giờ lễ có thể thay đổi vào các dịp đặc biệt. Vui lòng theo dõi thông báo của giáo xứ.</p>
    </div></section>

    <section className="about-shell about-final"><span className="about-eyebrow">MỘT HÀNH TRÌNH MỚI ĐANG CHỜ</span><h2>Cùng em viết tiếp<br /><em>câu chuyện đức tin.</em></h2><p>Tìm hiểu tuyển sinh hoặc kết nối với Ban Giáo lý<br className="about-desktop-break" /> để được hướng dẫn trước khi tham gia.</p><div className="about-actions"><Link className="about-button about-button-primary" to="/tuyển-sinh">Tìm hiểu tuyển sinh <ArrowUpRight size={18} /></Link><Link className="about-button about-button-outline" to="/liên-hệ">Liên hệ Ban Giáo lý <ArrowRight size={18} /></Link></div><Cross className="about-final-cross" aria-hidden="true" /></section>
    {viewer && <PhotoViewer items={viewer.items} initialIndex={viewer.index} onClose={() => setViewer(null)} />}
  </div>;
}
