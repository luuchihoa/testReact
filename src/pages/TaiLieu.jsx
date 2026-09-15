import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  GraduationCap, FileText, Play, Search, ChevronRight, ChevronLeft,
  Download, Clock, BookOpen, Sparkles, Flame, Heart, Church, Globe, X, Eye, Compass,
  ArrowRight, Zap, Trophy, AlertCircle, RefreshCw
} from "lucide-react";
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from "framer-motion";
import { usePageMotion } from "../hooks/usePageMotion.js";
import { useDebounce } from "../hooks/useDebounce.js";
import { useToast } from "../components/ui/ToastContext.jsx";
import DocumentReaderModal from "../components/shared/DocumentReaderModal.jsx";
import BibleQuickNavigatorModal from "../components/bible/BibleQuickNavigatorModal.jsx";
import { downloadDocument } from "../utils/documentDownloadHelper.js";
import { DOCUMENTS_DATA } from "../data/documents/docData.js";
import { getDocumentById } from "../lib/documentsApi.js";
import { fetchActiveQuizzes } from "../lib/quizzesApi.js";
import "./TaiLieu.css";

const KHOI_LIST = [
  { id: "all",        label: "Tất cả" },
  { id: "chien-con",  label: "Chiên Con" },
  { id: "ruoc-le",    label: "Rước Lễ" },
  { id: "them-suc",   label: "Thêm Sức" },
  { id: "phung-vu",   label: "Phụng Vụ" },
  { id: "kinh-thanh", label: "Kinh Thánh" },
  { id: "vao-doi",    label: "Vào Đời" },
];

// Dữ liệu bộ đề thi ôn luyện được tải trực tiếp từ bảng quizzes trên Supabase qua fetchActiveQuizzes()

const DOCS = [
  // Khối Chiên Con
  {
    id: "cam-nang-khai-tam-chien-con",
    title: "Cẩm Nang Khai Tâm — Em Học Làm Dấu & Cầu Nguyện",
    khoi: "chien-con",
    khoiLabel: "Chiên Con",
    type: "PDF",
    icon: Heart,
    desc: "Hướng dẫn ấu nhi cách bước vào nhà thờ, làm dấu Thánh Giá, chào Chúa Giêsu Thánh Thể.",
    url: "#",
    size: "4.3 KB",
    hasReader: true,
  },
  // Khối Rước Lễ
  {
    id: "cam-nang-xet-minh-ruoc-le",
    title: "Cẩm Nang Xét Mình & Dọn Lòng Rước Lễ Sốt Sắng",
    khoi: "ruoc-le",
    khoiLabel: "Rước Lễ",
    type: "PDF",
    icon: Sparkles,
    desc: "Hướng dẫn 5 bước xưng tội nên và bản xét mình chi tiết theo 10 Điều Răn.",
    url: "#",
    size: "4.2 KB",
    hasReader: true,
  },
  // Khối Thêm Sức
  {
    id: "7-on-chua-thanh-than",
    title: "7 Ơn Chúa Thánh Thần & 12 Hoa Trái Thần Khí",
    khoi: "them-suc",
    khoiLabel: "Thêm Sức",
    type: "PDF",
    icon: Flame,
    desc: "Tài liệu học và suy niệm 7 ơn Chúa Thánh Thần dành riêng cho Khối Thêm Sức.",
    url: "#",
    size: "5.9 KB",
    hasReader: true,
  },
  // Khối Phụng Vụ
  {
    id: "so-tay-le-sinh",
    title: "Sổ Tay Lễ Sinh & Thừa Tác Vụ Bàn Thờ",
    khoi: "phung-vu",
    khoiLabel: "Phụng Vụ",
    type: "PDF",
    icon: Church,
    desc: "Cẩm nang tác phong, nghi thức giúp lễ và thứ tự phụng vụ thánh lễ trang nghiêm.",
    url: "#",
    size: "3.0 KB",
    hasReader: true,
  },
  {
    id: "nam-phung-vu",
    title: "Năm Phụng Vụ — Lịch Công Giáo & Các Mùa Thánh",
    khoi: "phung-vu",
    khoiLabel: "Phụng Vụ",
    type: "PDF",
    icon: FileText,
    desc: "Chu kỳ Năm Phụng vụ, ý nghĩa các mùa thánh, màu phẩm phục và danh mục Lễ Trọng.",
    url: "#",
    size: "4.7 KB",
    hasReader: true,
  },
  // Khối Kinh Thánh
  {
    id: "phuong-phap-lectio-divina",
    title: "Phương Pháp Cầu Nguyện Với Lời Chúa (Lectio Divina)",
    khoi: "kinh-thanh",
    khoiLabel: "Kinh Thánh",
    type: "PDF",
    icon: BookOpen,
    desc: "Phương pháp đọc và suy niệm Lời Chúa truyền thống của Hội Thánh qua 5 bước.",
    url: "#",
    size: "2.8 KB",
    hasReader: true,
  },
  {
    id: "kinh-thanh-cgkpv",
    title: "Kinh Thánh — Bản Dịch Nhóm Các Giờ Kinh Phụng Vụ",
    khoi: "kinh-thanh",
    khoiLabel: "Kinh Thánh",
    type: "PDF",
    icon: BookOpen,
    desc: "Toàn bộ Kinh Thánh 73 quyển (CGKPV) • Tra cứu nhanh, có audio nghe từng chương và ghi chú.",
    url: "#",
    size: "13.1 MB (73 Sách)",
    hasReader: true,
    isBibleNavigator: true,
  },
  // Khối Vào Đời
  {
    id: "youcat-vietnam",
    title: "Youcat — Giáo Lý Hội Thánh Dành Cho Người Trẻ",
    khoi: "vao-doi",
    khoiLabel: "Vào Đời",
    type: "PDF",
    icon: BookOpen,
    desc: "Ấn bản Giáo lý Hội Thánh dành cho bạn trẻ: 527 câu hỏi-đáp về đức tin, bí tích, luân lý và cầu nguyện.",
    url: "#",
    size: "527 Câu Hỏi",
    hasReader: true,
  },
  {
    id: "docat-vietnam",
    title: "Docat — Cẩm Nang Hành Động Xã Hội Của Người Trẻ",
    khoi: "vao-doi",
    khoiLabel: "Vào Đời",
    type: "PDF",
    icon: Globe,
    desc: "Học thuyết Xã hội Công giáo: Phẩm giá con người, công bằng, bảo vệ môi trường theo Laudato Si'.",
    url: "#",
    size: "328 Câu Hỏi",
    hasReader: true,
  },
  {
    id: "dinh-huong-vao-doi",
    title: "Cẩm Nang Bạn Trẻ Vào Đời — Đức Tin, Nghề Nghiệp & Tình Yêu",
    khoi: "vao-doi",
    khoiLabel: "Vào Đời",
    type: "PDF",
    icon: Globe,
    desc: "Định hướng sống đức tin trưởng thành, phân định ơn gọi, đạo đức nghề nghiệp và hôn nhân Kitô giáo.",
    url: "#",
    size: "5.1 KB",
    hasReader: true,
  },
  // Tài Liệu Chung (Mọi Khối)
  {
    id: "ban-kinh-can-thuoc-da-nang",
    title: "Bản Tóm Lược Các Kinh Cần Thuộc — Giáo Phận Đà Nẵng",
    khoi: "all",
    khoiLabel: "Tất cả",
    type: "PDF",
    icon: FileText,
    desc: "Tổng hợp toàn văn các kinh nguyện cốt lõi theo quy chuẩn Giáo phận Đà Nẵng.",
    url: "#",
    size: "11 KB",
    hasReader: true,
  },
  {
    id: "toat-yeu-giao-ly",
    title: "Toát Yếu Giáo Lý Hội Thánh Công Giáo",
    khoi: "all",
    khoiLabel: "Tất cả",
    type: "PDF",
    icon: FileText,
    desc: "Tổng hợp toàn bộ giáo lý Công giáo dưới dạng hỏi-đáp ngắn gọn, súc tích.",
    url: "#",
    size: "5.2 KB",
    hasReader: true,
  },
];

const KHOI_BADGE_MAP = {
  "chien-con":  { label: "Chiên Con",  badgeClass: "tl-badge-chien-con", icon: Heart },
  "ruoc-le":    { label: "Rước Lễ",    badgeClass: "tl-badge-ruoc-le",    icon: Sparkles },
  "them-suc":   { label: "Thêm Sức",   badgeClass: "tl-badge-them-suc",   icon: Flame },
  "phung-vu":   { label: "Phụng Vụ",   badgeClass: "tl-badge-phung-vu",   icon: Church },
  "kinh-thanh": { label: "Kinh Thánh", badgeClass: "tl-badge-kinh-thanh", icon: BookOpen },
  "vao-doi":    { label: "Vào Đời",    badgeClass: "tl-badge-vao-doi",    icon: Globe },
  "all":        { label: "Tất cả",     badgeClass: "tl-badge-all",        icon: GraduationCap },
};

const KHOI_LINKS = [
  { path: "/khối-chiên-con",  label: "Chiên Con",  sub: "Ấu nhi (6 – 9 tuổi)",     icon: Heart },
  { path: "/khối-rước-lễ",    label: "Rước Lễ",    sub: "Thiếu nhi (10 – 12 tuổi)", icon: Sparkles },
  { path: "/khối-thêm-sức",   label: "Thêm Sức",   sub: "Nghĩa sĩ (13 – 15 tuổi)",  icon: Flame },
  { path: "/khối-phụng-vụ",   label: "Phụng Vụ",   sub: "Lễ sinh & Ca đoàn",       icon: Church },
  { path: "/khối-kinh-thanh", label: "Kinh Thánh", sub: "Hiệp sĩ (16 – 18 tuổi)",  icon: BookOpen },
  { path: "/khối-vào-đời",    label: "Vào Đời",    sub: "Dự trưởng & Giới trẻ",     icon: Globe },
];

// Helper sinh dãy số phân trang thông minh kèm ellipsis
function generatePageNumbers(current, total) {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, "...", total];
  }
  if (current >= total - 3) {
    return [1, "...", total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, "...", current - 1, current, current + 1, "...", total];
}

export default function TaiLieu() {
  const { showToast } = useToast();
  const [activeKhoi, setActiveKhoi] = useState("all");
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const { fadeUp, heroReveal, vp } = usePageMotion();

  // State quản lý danh sách đề thi tải từ Supabase
  const [quizzes, setQuizzes] = useState([]);
  const [loadingQuizzes, setLoadingQuizzes] = useState(true);
  const [quizError, setQuizError] = useState(null);

  // State bộ lọc học kỳ (all: tất cả, hk1: học kỳ 1, hk2: học kỳ 2)
  const [activeSemester, setActiveSemester] = useState("all");

  // State phân trang cho phần Đề thi (mặc định 6 đề/trang)
  const [quizPage, setQuizPage] = useState(1);
  const [quizPageSize, setQuizPageSize] = useState(6);

  const [searchParams] = useSearchParams();
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);
  const [isBibleModalOpen, setIsBibleModalOpen] = useState(false);

  // Tải danh sách bộ đề từ Supabase (hỗ trợ nút thử lại khi có lỗi)
  const loadQuizzes = useCallback(async () => {
    setLoadingQuizzes(true);
    setQuizError(null);
    try {
      const { data, error } = await fetchActiveQuizzes();
      if (error) {
        setQuizError(error.message || "Không thể kết nối đến máy chủ cơ sở dữ liệu đề thi.");
      } else {
        setQuizzes(data || []);
      }
    } catch (err) {
      setQuizError(err.message || "Đã xảy ra lỗi không mong muốn khi tải đề thi.");
    } finally {
      setLoadingQuizzes(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function initialLoad() {
      try {
        const { data, error } = await fetchActiveQuizzes();
        if (!isMounted) return;
        if (error) {
          setQuizError(error.message || "Không thể kết nối đến máy chủ cơ sở dữ liệu đề thi.");
        } else {
          setQuizzes(data || []);
        }
      } catch (err) {
        if (!isMounted) return;
        setQuizError(err.message || "Đã xảy ra lỗi không mong muốn khi tải đề thi.");
      } finally {
        if (isMounted) {
          setLoadingQuizzes(false);
        }
      }
    }

    initialLoad();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleKhoiChange = (id) => {
    setActiveKhoi(id);
    setQuizPage(1);
  };

  const handleSemesterChange = (sem) => {
    setActiveSemester(sem);
    setQuizPage(1);
  };

  const handleSearchChange = (val) => {
    setSearch(val);
    setQuizPage(1);
  };

  const handlePageSizeChange = (size) => {
    setQuizPageSize(size);
    setQuizPage(1);
  };

  const handleOpenReader = async (doc) => {
    if (doc.id === "kinh-thanh-cgkpv" || doc.isBibleNavigator) {
      setIsBibleModalOpen(true);
      return;
    }
    const fullDoc = DOCUMENTS_DATA[doc.id] || {
      ...doc,
      chapters: [{ id: "preview", title: doc.title, content: doc.desc }]
    };
    setSelectedDoc(fullDoc);
    setIsReaderOpen(true);

    try {
      const freshDoc = await getDocumentById(doc.id);
      if (freshDoc) {
        setSelectedDoc(freshDoc);
      }
    } catch {
      // Fallback local memory
    }
  };

  // Tự động kích hoạt tài liệu khi có tham số URL ?doc=... hoặc ?read=...
  useEffect(() => {
    const docQuery = searchParams.get("doc") || searchParams.get("read");
    if (!docQuery) return;

    const timer = setTimeout(() => {
      const targetDoc = DOCS.find(
        (d) => d.id === docQuery || d.id.toLowerCase().includes(docQuery.toLowerCase())
      );
      if (targetDoc) {
        handleOpenReader(targetDoc);
        if (targetDoc.khoi && targetDoc.khoi !== "all") {
          setActiveKhoi(targetDoc.khoi);
        }
      }
    }, 0);

    return () => clearTimeout(timer);
  }, [searchParams]);

  const handleDownloadDoc = (doc) => {
    if (doc.id === "kinh-thanh-cgkpv" || doc.isBibleNavigator) {
      setIsBibleModalOpen(true);
      showToast?.("Vui lòng chọn quyển sách bạn muốn tải PDF trong danh mục 73 cuốn.", "info");
      return;
    }
    const fullDoc = DOCUMENTS_DATA[doc.id] || doc;
    downloadDocument(fullDoc, showToast);
  };

  const handleEmptyQuizClick = useCallback(() => {
    showToast?.(
      "Bộ đề đang được Ban Giáo lý biên soạn câu hỏi và sẽ sớm phát hành!",
      "info"
    );
  }, [showToast]);

  const filteredQuizzes = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();
    return quizzes.filter((q) => {
      const matchKhoi = activeKhoi === "all" || q.khoi === activeKhoi || q.khoi === "all";
      const matchSemester =
        activeSemester === "all" ||
        q.semester === activeSemester ||
        q.semester === "all";
      const matchSearch =
        !query ||
        q.title.toLowerCase().includes(query) ||
        (q.khoiLabel && q.khoiLabel.toLowerCase().includes(query)) ||
        (q.badge && q.badge.toLowerCase().includes(query));
      return matchKhoi && matchSemester && matchSearch;
    });
  }, [quizzes, activeKhoi, activeSemester, debouncedSearch]);

  // Đếm số lượng đề thi theo học kỳ dựa trên tab Khối hiện tại
  const semesterCounts = useMemo(() => {
    const counts = { all: 0, hk1: 0, hk2: 0 };
    quizzes.forEach((q) => {
      const matchKhoi = activeKhoi === "all" || q.khoi === activeKhoi || q.khoi === "all";
      if (matchKhoi) {
        counts.all++;
        if (q.semester === "hk1") counts.hk1++;
        if (q.semester === "hk2") counts.hk2++;
      }
    });
    return counts;
  }, [quizzes, activeKhoi]);

  // Tính toán trang hợp lệ và đề thi hiển thị trên trang hiện tại
  const totalQuizPages = Math.max(1, Math.ceil(filteredQuizzes.length / quizPageSize));
  const safeQuizPage = Math.min(Math.max(1, quizPage), totalQuizPages);

  const paginatedQuizzes = useMemo(() => {
    const start = (safeQuizPage - 1) * quizPageSize;
    return filteredQuizzes.slice(start, start + quizPageSize);
  }, [filteredQuizzes, safeQuizPage, quizPageSize]);

  const handleQuizPageChange = (newPage) => {
    if (newPage < 1 || newPage > totalQuizPages) return;
    setQuizPage(newPage);
    const element = document.getElementById("de-thi");
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const filteredDocs = useMemo(() => {
    const query = debouncedSearch.toLowerCase().trim();
    return DOCS.filter((d) => {
      const matchKhoi = activeKhoi === "all" || d.khoi === activeKhoi || d.khoi === "all";
      const matchSearch =
        !query ||
        d.title.toLowerCase().includes(query) ||
        d.desc.toLowerCase().includes(query) ||
        d.khoiLabel.toLowerCase().includes(query);
      return matchKhoi && matchSearch;
    });
  }, [activeKhoi, debouncedSearch]);

  // Đếm số lượng tài liệu + đề thi theo từng tab Khối
  const khoiCounts = useMemo(() => {
    const counts = {};
    KHOI_LIST.forEach((k) => {
      if (k.id === "all") {
        counts[k.id] = quizzes.length + DOCS.length;
      } else {
        const qCount = quizzes.filter((q) => q.khoi === k.id || q.khoi === "all").length;
        const dCount = DOCS.filter((d) => d.khoi === k.id || d.khoi === "all").length;
        counts[k.id] = qCount + dCount;
      }
    });
    return counts;
  }, [quizzes]);

  return (
    <div className="tl-page">
      {/* HERO SECTION */}
      <header className="tl-hero">
        <div className="tl-shell">
          <div className="max-w-3xl">
            <motion.div variants={heroReveal} initial="hidden" animate="visible" custom={0}>
              <span className="tl-eyebrow">
                <GraduationCap className="w-3.5 h-3.5" /> Thư Viện Giáo Lý
              </span>
            </motion.div>

            <motion.h1
              variants={heroReveal}
              initial="hidden"
              animate="visible"
              custom={0.05}
              className="tl-hero-title"
            >
              Tài liệu học tập & <em>Hệ thống đề ôn luyện</em>
            </motion.h1>

            <motion.p
              variants={heroReveal}
              initial="hidden"
              animate="visible"
              custom={0.1}
              className="tl-hero-desc"
            >
              Hệ thống tài liệu huấn giáo chuẩn mực, cẩm nang phụng vụ, Kinh Thánh toàn bộ 73 cuốn và kho đề thi trắc nghiệm trực tuyến có chấm điểm tự động.
            </motion.p>

            {/* Quick Access Chips */}
            <motion.div
              variants={heroReveal}
              initial="hidden"
              animate="visible"
              custom={0.15}
              className="tl-stat-strip"
            >
              <a href="#de-thi" className="tl-stat-pill">
                <Play className="w-3.5 h-3.5 fill-current text-[#7c5c2d] dark:text-[#d4b47d]" />
                <span>Đề ôn tập ({loadingQuizzes ? "…" : filteredQuizzes.length})</span>
              </a>
              <a href="#tai-lieu" className="tl-stat-pill">
                <FileText className="w-3.5 h-3.5 text-[#7c5c2d] dark:text-[#d4b47d]" />
                <span>Tài liệu ({filteredDocs.length})</span>
              </a>
              <button
                type="button"
                onClick={() => setIsBibleModalOpen(true)}
                className="tl-stat-pill cursor-pointer"
                title="Mở bảng tra cứu Kinh Thánh 73 cuốn"
              >
                <Compass className="w-3.5 h-3.5 text-[#047857] dark:text-[#34d399]" />
                <span>Tra cứu Kinh Thánh (73 Sách)</span>
              </button>
              <a href="#khoi-lop" className="tl-stat-pill">
                <GraduationCap className="w-3.5 h-3.5 text-[#7c5c2d] dark:text-[#d4b47d]" />
                <span>Các Khối học (6)</span>
              </a>
            </motion.div>
          </div>
        </div>
      </header>

      {/* STICKY FILTER & SEARCH BAR */}
      <div className="tl-filter-bar">
        <div className="tl-shell">
          <div className="flex flex-col gap-2.5">
            {/* Hàng 1: Tiêu đề danh mục & Ô tìm kiếm */}
            <div className="flex items-center justify-between gap-3">
              <div className="hidden sm:flex items-center gap-2 font-serif font-bold text-[17px] text-[#293d32] dark:text-[#ecece0]">
                <FileText className="w-4 h-4 text-[#7c5c2d] dark:text-[#d4b47d]" />
                <span>Tư liệu & Đề thi</span>
              </div>

              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#575e55] dark:text-[#b0b9ac] pointer-events-none" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Tìm tài liệu, đề thi, tác giả..."
                  aria-label="Tìm kiếm tài liệu và đề thi"
                  className="tl-search-input"
                />
                {search && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    aria-label="Xóa từ khóa tìm kiếm"
                    className="tl-search-clear"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Hàng 2: Cuộn ngang các tab Khối học */}
            <div className="tl-tabs-scroll" role="tablist" aria-label="Lọc theo khối học">
              {KHOI_LIST.map((k) => {
                const active = activeKhoi === k.id;
                const count = khoiCounts[k.id] || 0;
                return (
                  <button
                    key={k.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => handleKhoiChange(k.id)}
                    className={`tl-tab-btn ${active ? "active" : ""}`}
                  >
                    <span>{k.label}</span>
                    <span className="tl-tab-badge">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* CORE CONTENT MAIN AREA */}
      <main className="tl-shell py-8 md:py-12 space-y-12 md:space-y-16">
        {/* SECTION 1: ĐỀ ÔN LUYỆN TRỰC TUYẾN (CÓ PHÂN TRANG VÀ THẺ NHẬN DIỆN NHANH) */}
        <section id="de-thi" className="scroll-mt-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            custom={0.1}
            className="tl-section-header"
          >
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <h2 className="tl-section-title">
                <Play className="w-5 h-5 fill-current text-[#7c5c2d] dark:text-[#d4b47d]" />
                <span>Đề ôn luyện trực tuyến</span>
              </h2>

              <div className="flex items-center gap-2.5">
                <span className="tl-badge tl-badge-all">
                  {loadingQuizzes
                    ? "Đang tải…"
                    : quizError
                    ? "Chưa kết nối"
                    : `${filteredQuizzes.length} đề thi`}
                </span>

                {/* Bộ chọn số lượng đề trên 1 trang */}
                {!loadingQuizzes && !quizError && filteredQuizzes.length > 6 && (
                  <div className="hidden sm:inline-flex items-center gap-1 text-[11px] text-[#575e55] dark:text-[#b0b9ac] border border-[#dedfd4] dark:border-[#354237] rounded-lg px-2 py-1 bg-[#fffefa] dark:bg-[#1e2821]">
                    <span>Trang:</span>
                    {[6, 12].map((size) => (
                      <button
                        key={size}
                        type="button"
                        onClick={() => handlePageSizeChange(size)}
                        className={`px-1.5 py-0.5 rounded font-bold cursor-pointer transition-colors ${
                          quizPageSize === size
                            ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d]"
                            : "hover:bg-[#f3f0e6] dark:hover:bg-[#26332a]"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <p className="tl-section-sub">
              {loadingQuizzes ? (
                "Đang kiểm tra và đồng bộ danh sách bộ đề ôn tập từ cơ sở dữ liệu…"
              ) : quizError ? (
                "Chưa thể kết nối tới cơ sở dữ liệu đề thi trực tuyến."
              ) : filteredQuizzes.length > 0 ? (
                <>
                  Hiển thị từ đề số <strong>{(quizPage - 1) * quizPageSize + 1}</strong> đến <strong>{Math.min(quizPage * quizPageSize, filteredQuizzes.length)}</strong> trên tổng số <strong>{filteredQuizzes.length}</strong> bộ đề {activeSemester !== "all" ? `(${activeSemester === "hk1" ? "Học kỳ 1" : "Học kỳ 2"})` : ""}. Chấm điểm tự động và có đáp án chi tiết.
                </>
              ) : quizzes.length === 0 ? (
                "Hệ thống câu hỏi trắc nghiệm & tự luận ôn định kỳ có chấm điểm tự động."
              ) : (
                "Không có bộ đề nào phù hợp với bộ lọc hiện tại."
              )}
            </p>

            {/* BỘ LỌC CHỌN HỌC KỲ 1 / HỌC KỲ 2 */}
            {!loadingQuizzes && !quizError && quizzes.length > 0 && (
              <div className="mt-3.5 flex items-center gap-1.5 flex-wrap" role="group" aria-label="Bộ lọc học kỳ">
                <span className="text-xs font-semibold text-[#575e55] dark:text-[#b0b9ac] mr-1">
                  Kỳ học:
                </span>
                {[
                  { id: "all", label: "Tất cả học kỳ", count: semesterCounts.all },
                  { id: "hk1", label: "Học kỳ 1", count: semesterCounts.hk1 },
                  { id: "hk2", label: "Học kỳ 2", count: semesterCounts.hk2 },
                ].map((sem) => {
                  const isSelected = activeSemester === sem.id;
                  return (
                    <button
                      key={sem.id}
                      type="button"
                      onClick={() => handleSemesterChange(sem.id)}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                        isSelected
                          ? "bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] shadow-xs"
                          : "bg-[#fffefa] dark:bg-[#1e2821] text-[#293d32] dark:text-[#ecece0] border border-[#dedfd4] dark:border-[#354237] hover:border-[#927140] dark:hover:border-[#d4b47d]"
                      }`}
                      aria-pressed={isSelected}
                    >
                      <span>{sem.label}</span>
                      {sem.count > 0 && (
                        <span
                          className={`text-[10.5px] px-1.5 py-0.5 rounded-full font-bold ${
                            isSelected
                              ? "bg-white/20 text-white dark:bg-[#19251d]/20 dark:text-[#19251d]"
                              : "bg-[#dedfd4]/60 dark:bg-[#354237] text-[#575e55] dark:text-[#b0b9ac]"
                          }`}
                        >
                          {sem.count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </motion.div>

          <AnimatePresence mode="popLayout">
            {loadingQuizzes ? (
              /* TRẠNG THÁI LOADING: SKELETON CARDS */
              <motion.div
                key="quiz-loading-skeleton"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                aria-busy="true"
                aria-label="Đang tải danh mục đề thi"
              >
                {[1, 2, 3].map((idx) => (
                  <div key={`skeleton-quiz-${idx}`} className="tl-skeleton-card">
                    <div>
                      <div className="tl-card-head">
                        <div className="tl-head-badges">
                          <div className="tl-skeleton-box w-12 h-6 rounded-md" />
                          <div className="tl-skeleton-box w-16 h-6 rounded-full" />
                        </div>
                        <div className="tl-skeleton-box w-9 h-9 rounded-xl" />
                      </div>
                      <div className="tl-card-body">
                        <div className="tl-skeleton-box w-3/4 h-5 rounded mb-2" />
                        <div className="tl-skeleton-box w-1/3 h-4 rounded" />
                      </div>
                      <div className="tl-bento-specs">
                        <div className="tl-skeleton-box w-full h-3.5 rounded mb-1.5" />
                        <div className="tl-skeleton-box w-2/3 h-3.5 rounded" />
                      </div>
                    </div>
                    <div className="tl-card-foot">
                      <div className="tl-skeleton-box w-20 h-3 rounded" />
                      <div className="tl-skeleton-box w-16 h-6 rounded-lg" />
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : quizError ? (
              /* TRẠNG THÁI LỖI KẾT NỐI */
              <motion.div
                key="quiz-error-state"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="tl-quiz-error-box"
                role="alert"
              >
                <div className="w-12 h-12 rounded-full bg-amber-500/10 dark:bg-amber-400/10 text-amber-700 dark:text-amber-400 flex items-center justify-center mb-3">
                  <AlertCircle className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-[#293d32] dark:text-[#ecece0] mb-1">
                  Chưa thể tải dữ liệu đề thi
                </h3>
                <p className="text-sm text-[#575e55] dark:text-[#b0b9ac] max-w-md mb-4 leading-relaxed">
                  Hệ thống tạm thời chưa thể kết nối tới cơ sở dữ liệu đề thi trực tuyến. Bạn có thể kiểm tra kết nối mạng và thử lại.
                </p>
                <button
                  type="button"
                  onClick={loadQuizzes}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#314e3e] text-white dark:bg-[#d6b883] dark:text-[#19251d] text-xs font-bold hover:opacity-90 active:scale-[0.98] transition-all cursor-pointer shadow-xs"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Thử kết nối lại</span>
                </button>
              </motion.div>
            ) : quizzes.length === 0 ? (
              /* TRẠNG THÁI EMPTY THỰC TẾ (DATABASE CHƯA CÓ ĐỀ) */
              <motion.div
                key="quiz-empty-db"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="tl-empty-state"
              >
                <div className="w-12 h-12 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex items-center justify-center text-[#7c5c2d] dark:text-[#d4b47d] mb-3 shadow-xs">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-[17px] font-bold font-serif text-[#293d32] dark:text-[#ecece0] mb-1.5">
                  Hệ thống đề ôn tập đang được cập nhật
                </h3>
                <p className="text-sm text-[#575e55] dark:text-[#b0b9ac] max-w-lg leading-relaxed mb-4">
                  Ban Giáo lý hiện đang tổng hợp và số hóa ngân hàng câu hỏi trắc nghiệm & tự luận theo chương trình các khối học. Dữ liệu đề thi trực tuyến sẽ được cập nhật lên hệ thống trong thời gian sớm nhất.
                </p>
                <a
                  href="#tai-lieu"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#314e3e]/10 dark:bg-[#d6b883]/10 text-[#314e3e] dark:text-[#d6b883] text-xs font-bold hover:bg-[#314e3e]/15 dark:hover:bg-[#d6b883]/20 transition-colors"
                >
                  <span>Tham khảo giáo trình & tài liệu bên dưới</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </a>
              </motion.div>
            ) : filteredQuizzes.length > 0 ? (
              /* TRẠNG THÁI CÓ ĐỀ THI VÀ KHỚP BỘ LỌC (SUCCESS) */
              <div>
                <motion.div
                  key={`page-${quizPage}-${activeKhoi}-${debouncedSearch}`}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                  className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  {paginatedQuizzes.map((quiz, i) => {
                    const Icon = quiz.icon;
                    const DurationIcon = quiz.durationIcon || Clock;
                    const isReady = quiz.hasQuestions;

                    return (
                      <motion.div
                        key={quiz.id || quiz.slug || quiz.title}
                        variants={fadeUp}
                        initial="hidden"
                        animate="visible"
                        custom={i * 0.04}
                      >
                        {isReady ? (
                          <Link
                            to={quiz.path}
                            className={`tl-quiz-card card-khoi-${quiz.khoi || "all"} group`}
                            aria-label={`Vào làm bài: ${quiz.title} (${quiz.khoiLabel})`}
                          >
                            <div>
                              {/* Tầng 1: Header Bento (Thời gian / Badge / Squircle icon) */}
                              <div className="tl-card-head">
                                <div className="tl-head-badges">
                                  <span className="tl-code-badge">
                                    <DurationIcon className="w-3.5 h-3.5" />
                                    <span>{quiz.durationBadge}</span>
                                  </span>

                                  <span className="tl-type-pill">
                                    {quiz.badge}
                                  </span>
                                </div>

                                <div className="tl-icon-squircle" title={quiz.khoiLabel}>
                                  <Icon className="w-4 h-4" />
                                </div>
                              </div>

                              {/* Tầng 2: Tiêu đề & Tên khối */}
                              <div className="tl-card-body">
                                <h3 className="tl-quiz-title">
                                  {quiz.title}
                                </h3>

                                <div className="tl-khoi-label">
                                  <span className="tl-khoi-dot" />
                                  <span>{quiz.khoiLabel}</span>
                                </div>
                              </div>

                              {/* Tầng 3: Bento Focus Specs Box */}
                              <div className="tl-bento-specs">
                                <div className="tl-spec-row">
                                  <span className="tl-spec-label">
                                    <FileText className="w-3.5 h-3.5 opacity-80" /> Cấu trúc:
                                  </span>
                                  <span className="tl-spec-value">{quiz.questions}</span>
                                </div>
                                <div className="tl-spec-row">
                                  <span className="tl-spec-label">
                                    <Clock className="w-3.5 h-3.5 opacity-80" /> Thời lượng:
                                  </span>
                                  <span className="tl-spec-value">
                                    {quiz.time} {quiz.semesterLabel ? `• ${quiz.semesterLabel}` : ""} {quiz.timeSeconds > 0 ? "• Tự động chấm" : ""}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Tầng 4: Footer Thẻ & Nút Action */}
                            <div className="tl-card-foot">
                              <span className="tl-status-ready">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                <span>Sẵn sàng thi</span>
                              </span>

                              <span className="tl-btn-action">
                                <span>Vào thi</span>
                                <ChevronRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                              </span>
                            </div>
                          </Link>
                        ) : (
                          <div
                            role="button"
                            tabIndex={0}
                            onClick={() => handleEmptyQuizClick(quiz)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                handleEmptyQuizClick(quiz);
                              }
                            }}
                            className={`tl-quiz-card card-khoi-${quiz.khoi || "all"} is-draft group`}
                            aria-label={`${quiz.title} (${quiz.khoiLabel}) — Đang biên soạn, chưa mở làm bài`}
                          >
                            <div>
                              {/* Tầng 1: Header Bento (Thời gian / Badge / Squircle icon) */}
                              <div className="tl-card-head">
                                <div className="tl-head-badges">
                                  <span className="tl-code-badge">
                                    <DurationIcon className="w-3.5 h-3.5" />
                                    <span>{quiz.durationBadge}</span>
                                  </span>

                                  <span className="tl-type-pill">
                                    {quiz.badge}
                                  </span>
                                </div>

                                <div className="tl-icon-squircle" title={quiz.khoiLabel}>
                                  <Icon className="w-4 h-4" />
                                </div>
                              </div>

                              {/* Tầng 2: Tiêu đề & Tên khối */}
                              <div className="tl-card-body">
                                <h3 className="tl-quiz-title">
                                  {quiz.title}
                                </h3>

                                <div className="tl-khoi-label">
                                  <span className="tl-khoi-dot" />
                                  <span>{quiz.khoiLabel}</span>
                                </div>
                              </div>

                              {/* Tầng 3: Bento Focus Specs Box */}
                              <div className="tl-bento-specs">
                                <div className="tl-spec-row">
                                  <span className="tl-spec-label">
                                    <FileText className="w-3.5 h-3.5 opacity-80" /> Cấu trúc:
                                  </span>
                                  <span className="tl-spec-value">{quiz.questions}</span>
                                </div>
                                <div className="tl-spec-row">
                                  <span className="tl-spec-label">
                                    <Clock className="w-3.5 h-3.5 opacity-80" /> Thời lượng:
                                  </span>
                                  <span className="tl-spec-value">
                                    {quiz.time} {quiz.semesterLabel ? `• ${quiz.semesterLabel}` : ""}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Tầng 4: Footer Thẻ Trạng Thái Đang Soạn */}
                            <div className="tl-card-foot">
                              <span className="tl-status-draft">
                                <span className="tl-status-draft-dot" />
                                <span>Đang biên soạn</span>
                              </span>

                              <span className="tl-btn-draft">
                                <span>Chưa mở ○</span>
                              </span>
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </motion.div>

                {/* THANH ĐIỀU KHIỂN PHÂN TRANG (PAGINATION) */}
                {totalQuizPages > 1 && (
                  <div className="tl-pagination-container">
                    <div className="tl-pagination-info">
                      <span>
                        Trang <strong>{quizPage}</strong> / <strong>{totalQuizPages}</strong> (Tổng cộng {filteredQuizzes.length} đề)
                      </span>
                    </div>

                    <nav className="tl-pagination-nav" aria-label="Điều hướng phân trang đề thi">
                      <button
                        type="button"
                        onClick={() => handleQuizPageChange(quizPage - 1)}
                        disabled={quizPage === 1}
                        className="tl-page-btn"
                        aria-label="Đến trang trước"
                      >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline">Trang trước</span>
                      </button>

                      {/* Mobile Indicator */}
                      <span className="sm:hidden text-xs font-bold text-[#293d32] dark:text-[#ecece0] px-2">
                        {quizPage} / {totalQuizPages}
                      </span>

                      {/* Desktop Number Buttons */}
                      <div className="hidden sm:flex items-center gap-1.5">
                        {generatePageNumbers(quizPage, totalQuizPages).map((p, idx) => {
                          if (p === "...") {
                            return (
                              <span key={`ellipsis-${idx}`} className="tl-page-ellipsis">
                                …
                              </span>
                            );
                          }
                          const isCurrent = p === quizPage;
                          return (
                            <button
                              key={`page-${p}`}
                              type="button"
                              onClick={() => handleQuizPageChange(p)}
                              className={`tl-page-btn ${isCurrent ? "active" : ""}`}
                              aria-current={isCurrent ? "page" : undefined}
                            >
                              {p}
                            </button>
                          );
                        })}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleQuizPageChange(quizPage + 1)}
                        disabled={quizPage === totalQuizPages}
                        className="tl-page-btn"
                        aria-label="Đến trang sau"
                      >
                        <span className="hidden sm:inline">Trang sau</span>
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </nav>
                  </div>
                )}
              </div>
            ) : (
              /* TRẠNG THÁI LỌC / TÌM KIẾM KHÔNG THẤY */
              <motion.div
                key="empty-quizzes-filtered"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="tl-empty-state"
              >
                <p className="text-sm font-medium text-[#293d32] dark:text-[#ecece0]">
                  Không tìm thấy đề thi phù hợp với bộ lọc hiện tại.
                </p>
                {(search || activeKhoi !== "all") && (
                  <button
                    type="button"
                    onClick={() => {
                      handleSearchChange("");
                      handleKhoiChange("all");
                    }}
                    className="mt-3 text-xs font-bold text-[#314e3e] dark:text-[#d6b883] underline cursor-pointer"
                  >
                    Đặt lại tìm kiếm & bộ lọc
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* SECTION 2: TÀI LIỆU THAM KHẢO & GIÁO TRÌNH */}
        <section id="tai-lieu" className="scroll-mt-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            custom={0.15}
            className="tl-section-header"
          >
            <div className="flex items-center justify-between gap-4">
              <h2 className="tl-section-title">
                <FileText className="w-5 h-5 text-[#7c5c2d] dark:text-[#d4b47d]" />
                <span>Tài liệu tham khảo & Giáo trình</span>
              </h2>
              <span className="tl-badge tl-badge-all">
                {filteredDocs.length} tài liệu
              </span>
            </div>
            <p className="tl-section-sub">
              Sách giáo lý, cẩm nang huấn giáo, kinh nguyện Giáo phận Đà Nẵng và các văn kiện chính thức của Giáo Hội.
            </p>
          </motion.div>

          <AnimatePresence mode="popLayout">
            {filteredDocs.length > 0 ? (
              <motion.div
                key={activeKhoi + debouncedSearch + "d"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col gap-3"
              >
                {filteredDocs.map((doc, i) => {
                  const Icon = doc.icon;
                  const khoiMeta = KHOI_BADGE_MAP[doc.khoi] || KHOI_BADGE_MAP["all"];
                  const KhoiIcon = khoiMeta.icon;

                  return (
                    <motion.article
                      key={doc.id || doc.title}
                      variants={fadeUp}
                      initial="hidden"
                      animate="visible"
                      custom={i * 0.03}
                      className="tl-doc-card group"
                    >
                      {/* Icon tài liệu */}
                      <div className="tl-doc-icon">
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Vùng nội dung — Chạm vào để mở Đọc trực tiếp */}
                      <div
                        tabIndex={0}
                        role="button"
                        onClick={() => handleOpenReader(doc)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            handleOpenReader(doc);
                          }
                        }}
                        className="tl-doc-body focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#314e3e] dark:focus-visible:ring-[#d6b883] rounded-lg p-0.5"
                        aria-label={`Đọc trực tiếp: ${doc.title}`}
                      >
                        <h3 className="tl-doc-title">
                          {doc.title}
                        </h3>

                        <p className="tl-doc-desc">
                          {doc.desc}
                        </p>

                        {/* Meta Badges: Khối lớp, Dung lượng, Nút đọc trực tiếp */}
                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                          <span className={`tl-badge ${khoiMeta.badgeClass}`}>
                            <KhoiIcon className="w-3 h-3" />
                            <span>{khoiMeta.label}</span>
                          </span>

                          <span className="text-[11px] font-semibold text-[#575e55] dark:text-[#b0b9ac]">
                            {doc.size}
                          </span>

                          {doc.hasReader && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#7c5c2d] dark:text-[#d4b47d]">
                              {doc.isBibleNavigator ? <Compass className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                              <span>{doc.isBibleNavigator ? "Tra cứu & Đọc" : "Đọc trực tiếp"}</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Nút Tải về độc lập — Touch Target 44x44px */}
                      <button
                        type="button"
                        aria-label={`Tải xuống ${doc.title}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadDoc(doc);
                        }}
                        className="tl-doc-download-btn"
                        title="Tải tài liệu về máy"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                    </motion.article>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty-docs"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="tl-empty-state"
              >
                <p className="text-sm">Không tìm thấy tài liệu phù hợp với từ khóa này.</p>
                {search && (
                  <button
                    type="button"
                    onClick={() => handleSearchChange("")}
                    className="mt-3 text-xs font-bold text-[#314e3e] dark:text-[#d6b883] underline cursor-pointer"
                  >
                    Xóa tìm kiếm
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </section>

        {/* SECTION 3: CÁC KHỐI GIÁO LÝ */}
        <section id="khoi-lop" className="scroll-mt-24">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="visible"
            viewport={vp}
            custom={0.2}
            className="tl-section-header"
          >
            <h2 className="tl-section-title">
              <GraduationCap className="w-5 h-5 text-[#7c5c2d] dark:text-[#d4b47d]" />
              <span>Khám phá theo khối lớp</span>
            </h2>
            <p className="tl-section-sub">
              Tìm hiểu chương trình huấn giáo, độ tuổi tiếp nhận và lịch học của từng khối lớp trong Xứ đoàn.
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {KHOI_LINKS.map((k, i) => {
              const Icon = k.icon;
              return (
                <motion.div
                  key={k.path}
                  variants={fadeUp}
                  initial="hidden"
                  whileInView="visible"
                  viewport={vp}
                  custom={i * 0.04}
                >
                  <Link
                    to={k.path}
                    className="tl-khoi-card group"
                    aria-label={`Xem chi tiết ${k.label}`}
                  >
                    <div className="w-11 h-11 rounded-2xl bg-[#faf8f3] dark:bg-[#151c18] border border-[#dedfd4] dark:border-[#354237] flex items-center justify-center text-[#314e3e] dark:text-[#d6b883] mb-2.5 shadow-xs group-hover:scale-110 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>

                    <span className="block text-[14px] font-bold text-[#293d32] dark:text-[#ecece0] group-hover:text-[#7c5c2d] dark:group-hover:text-[#d4b47d] transition-colors leading-tight mb-1">
                      {k.label}
                    </span>

                    <span className="block text-[11px] text-[#575e55] dark:text-[#b0b9ac] font-medium mb-3">
                      {k.sub}
                    </span>

                    <span className="mt-auto inline-flex items-center gap-1 text-[11px] font-bold text-[#314e3e] dark:text-[#d6b883] group-hover:underline">
                      <span>Chi tiết</span>
                      <ArrowRight className="w-3 h-3 transform group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      </main>

      {/* DOCUMENT READER MODAL */}
      <DocumentReaderModal
        doc={selectedDoc}
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        onDownload={handleDownloadDoc}
      />

      {/* BIBLE QUICK NAVIGATOR MODAL */}
      <BibleQuickNavigatorModal
        isOpen={isBibleModalOpen}
        onClose={() => setIsBibleModalOpen(false)}
        initialTestament="all"
      />
    </div>
  );
}