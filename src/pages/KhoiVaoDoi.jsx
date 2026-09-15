import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Flame, Clock, Sparkles, ChevronDown, HelpCircle,
  ShieldCheck, ArrowRight, Church, MapPin, BookOpen,
  Compass, Heart, CheckCircle2, ExternalLink,
  Users, Globe, Calendar, Award, Lightbulb,
  MessageSquare, Share2, Quote
} from "lucide-react";
import { getKhoiVaoDoiData } from "../utils/academicYear.js";
import DocumentReaderModal from "../components/shared/DocumentReaderModal.jsx";
import { DOCUMENTS_DATA } from "../data/documents/docData.js";
import { getDocumentById } from "../lib/documentsApi.js";
import { downloadDocument } from "../utils/documentDownloadHelper.js";
import { useToast } from "../components/ui/ToastContext.jsx";
import "./KhoiVaoDoi.css";

// Helper định dạng chức danh Huynh Trưởng / Giáo Lý Viên trang trọng
const formatTeacherName = (t) => {
  if (t.startsWith("C.")) return `Chị ${t.slice(2)}`;
  if (t.startsWith("A.")) return `Anh ${t.slice(2)}`;
  if (t.startsWith("Sr.")) return `Sr. ${t.slice(3)}`;
  return t;
};

// Helper gắn khu vực / tầng cho phòng học giúp phụ huynh & đoàn sinh dễ định vị
const getRoomLocation = (room) => {
  if (room.includes("Nhà họp xứ")) {
    return `${room} · Khu Mục Vụ`;
  }
  if (room.includes("P10") || room.includes("P11") || room.includes("P12") || room.includes("P13")) {
    return `${room} · Lầu 1`;
  }
  return room;
};

export default function KhoiVaoDoi() {
  // Lấy dữ liệu tự động tính toán niên khóa và năm sinh theo thời gian thực
  const data = getKhoiVaoDoiData();
  const {
    academicYear,
    vaoDoi1BirthYear,
    vaoDoi2BirthYear,
    classes
  } = data;

  const { showToast } = useToast();
  const [openFaq, setOpenFaq] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [readingDoc, setReadingDoc] = useState(null);
  const [isReaderOpen, setIsReaderOpen] = useState(false);

  const handleOpenReader = async (docId) => {
    // Ưu tiên hiển thị tức thì từ bộ nhớ local (0ms lag)
    const localDoc = DOCUMENTS_DATA[docId];
    if (localDoc) {
      setReadingDoc(localDoc);
      setIsReaderOpen(true);
    }

    // Đồng bộ tiếp tục từ database Supabase nếu có phiên bản mới hơn
    try {
      const freshDoc = await getDocumentById(docId);
      if (freshDoc) {
        setReadingDoc(freshDoc);
        setIsReaderOpen(true);
      } else if (!localDoc) {
        showToast?.("Tài liệu đang được cập nhật số hóa.", "info");
      }
    } catch {
      if (!localDoc) {
        showToast?.("Tài liệu đang được cập nhật số hóa.", "info");
      }
    }
  };

  const handleDownloadDoc = (doc) => {
    downloadDocument(doc, showToast);
  };

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Khối Vào Đời (Lớp 10 & 11) · Ngành Chinh Chiến HTDC · Niên Khóa ${academicYear} | Giáo xứ An Ngãi`;
    return () => {
      document.title = prevTitle;
    };
  }, [academicYear]);

  // Phân nhóm 2 khối: Vào Đời 1 (15 tuổi · Lớp 10) và Vào Đời 2 (16 tuổi · Lớp 11)
  const vd1Classes = classes.filter((c) => c.group === "Vào Đời 1");
  const vd2Classes = classes.filter((c) => c.group === "Vào Đời 2");

  // 6 Chặng sư phạm đức tin dấn thân Ngành Chinh Chiến HTDC
  const faithJourneySteps = [
    {
      step: "01",
      icon: Compass,
      practiceIcon: ShieldCheck,
      badge: "Căn Tính Đức Tin",
      title: "Căn Tính Người Trẻ Kitô Hữu",
      sub: "Tôi là ai trong mắt Thiên Chúa?",
      meaning: "Định vị bản ngã và xác tín ơn làm con cái Thiên Chúa giữa tuổi dậy thì. Vượt qua những bất an tâm lý, áp lực so sánh mạng xã hội để trân quý vẻ đẹp độc đáo Chúa ban cho mỗi cá vị.",
      practiceLabel: "Rèn Luyện Bản Ngã",
      highlight: "Nhận biết phẩm giá bản thân, xây dựng lòng tự trọng Kitô giáo và sống thật với Chúa cùng tha nhân."
    },
    {
      step: "02",
      icon: Globe,
      practiceIcon: Sparkles,
      badge: "Văn Hóa & Kỷ Nguyên Số",
      title: "Đối Thoại Văn Hóa & Thời Đại AI",
      sub: "Giữ ngọn đèn đức tin trước thời đại số",
      meaning: "Phân định khôn ngoan trước các trào lưu tiêu thụ, lối sống ảo, văn hóa hưởng thụ và thuyết tương đối đạo đức. Học cách dùng mạng xã hội và công nghệ như phương tiện loan báo Tin Mừng.",
      practiceLabel: "Làm Chủ Không Gian Mạng",
      highlight: "Làm chủ công nghệ, bảo vệ tâm hồn trong sạch, ứng xử văn minh và chân thật nơi môi trường số."
    },
    {
      step: "03",
      icon: ShieldCheck,
      practiceIcon: Compass,
      badge: "Phân Định Đạo Đức",
      title: "Lương Tâm & Phân Định Luân Lý",
      sub: "La bàn nội tâm cho mọi ngã rẽ cuộc đời",
      meaning: "Đào sâu huấn lệnh Tin Mừng và luân lý Kitô giáo: học cách lắng nghe tiếng nói của lương tâm ngay chính, can đảm chọn điều thiện, bài trừ gian lận học đường và chối từ cám dỗ tuổi trẻ.",
      practiceLabel: "Tập Thói Quen Phản Tỉnh",
      highlight: "Tập thói quen xét mình cuối ngày, can đảm đứng về phía sự thật và bảo vệ bạn bè yếu thế."
    },
    {
      step: "04",
      icon: Heart,
      practiceIcon: Heart,
      badge: "Tình Yêu & Hôn Nhân",
      title: "Tình Bạn, Tình Yêu & Khiết Tịnh",
      sub: "Xây đắp tương quan trong sáng và bền vững",
      meaning: "Hiểu đúng ý nghĩa thần học thân xác, tình bạn cao đẹp và tình yêu đôi lứa theo thánh ý Thiên Chúa. Tôn trọng sự sống, gìn giữ đức khiết tịnh và chuẩn bị hành trang cho đời sống gia đình Kitô giáo tương lai.",
      practiceLabel: "Tôn Trọng Sự Sống",
      highlight: "Tôn trọng bạn khác giới, xây dựng tình bạn thánh thiện và nhìn nhận tình yêu bằng con mắt đức tin."
    },
    {
      step: "05",
      icon: Lightbulb,
      practiceIcon: CheckCircle2,
      badge: "Học Thuyết Xã Hội",
      title: "Học Thuyết Docat & Bác Ái Dấn Thân",
      sub: "Trái tim chạnh thương trước nỗi đau đồng loại",
      meaning: "Tiếp cận 12 nguyên tắc Học thuyết Xã hội Công giáo: nhân phẩm, công ích, tình liên đới và bổ trợ. Dấn thân cụ thể vào các hoạt động bác ái, phục vụ người nghèo và bảo vệ môi trường theo Laudato Si'.",
      practiceLabel: "Hành Động Bác Ái Cụ Thể",
      highlight: "Biến đức tin thành hành động bác ái cụ thể, sống tinh thần dấn thân phục vụ của người Hiệp Sĩ Kitô."
    },
    {
      step: "06",
      icon: Flame,
      practiceIcon: Award,
      badge: "Sứ Vụ Trưởng Thành",
      title: "Sứ Vụ Chứng Nhân & Tuyên Hứa Trưởng Thành",
      sub: "Men muối giữa giảng đường đại học và xã hội",
      meaning: "Khép lại hành trình giáo lý thiếu nhi, các bạn trẻ cử hành Nghi thức Tuyên Hứa Trưởng Thành Vào Đời, sẵn sàng bước vào ngưỡng cửa đại học hoặc lập nghiệp với tư cách là những tông đồ giáo dân nhiệt thành.",
      practiceLabel: "Tông Đồ Giáo Dân",
      highlight: "Chiến tâm vượt khó, Chinh dũng dấn thân: Tự hào sống đức tin và tích cực tham gia Giới Trẻ Giáo xứ."
    }
  ];

  // 4 Trụ cột hành trang Vào Đời (Youcat, Docat, Phân định ơn gọi, Kỹ năng lãnh đạo)
  const pillarsData = [
    {
      key: "youcat",
      icon: BookOpen,
      badge: "GIÁO LÝ VẤN ĐÁP · YOUCAT",
      title: "Youcat — Đức Tin Sống Động",
      desc: "Hệ thống hóa giáo lý Hội Thánh qua hình thức vấn đáp gần gũi, giúp người trẻ giải đáp những thắc mắc nền tảng về đức tin, bí tích và đời sống luân lý Kitô giáo.",
      sub: "Giáo lý Hội Thánh cho người trẻ",
      linkText: "Khám phá Youcat",
      actionType: "reader",
      docId: "youcat-vietnam",
      topics: [
        "Thiên Chúa là ai & tình yêu cá vị",
        "Nghịch lý đức tin & khoa học hiện đại",
        "Kinh Thánh & 7 Suối nguồn Bí Tích",
        "Cầu nguyện thân mật cùng Thầy Giêsu"
      ]
    },
    {
      key: "docat",
      icon: Globe,
      badge: "HỌC THUYẾT XÃ HỘI · DOCAT",
      title: "Docat — Hành Động Bác Ái",
      desc: "Học thuyết Xã hội Công giáo bằng ngôn ngữ thanh niên, trao cho các em chiếc la bàn luân lý để giải quyết các vấn đề công bằng, bác ái và môi trường sống.",
      sub: "Học thuyết Xã hội cho người trẻ",
      linkText: "Khám phá Docat",
      actionType: "reader",
      docId: "docat-vietnam",
      topics: [
        "Phẩm giá con người: Thước đo xã hội",
        "Công bằng lao động & kinh tế nhân bản",
        "Sinh thái toàn diện & Laudato Si'",
        "Bác ái dấn thân & văn hóa gặp gỡ"
      ]
    },
    {
      key: "calling",
      icon: Church,
      badge: "TƯƠNG LAI & ƠN GỌI",
      title: "Phân Định Ơn Gọi & Tương Lai",
      desc: "Đồng hành phân định con đường tương lai: Hôn nhân gia đình Kitô giáo, ơn gọi thánh hiến linh mục/tu sĩ, hoặc độc thân phục vụ giữa đời sống xã hội.",
      sub: "Đồng hành cùng Quý Cha & Quý Soeur",
      linkText: "Nhận tư vấn ơn gọi",
      actionType: "anchor",
      href: "#dong-hanh",
      topics: [
        "Lắng nghe tiếng Chúa trong thinh lặng",
        "Hôn nhân Công giáo: Tình yêu hiến dâng",
        "Ơn gọi Dâng hiến: Dấn thân vì Nước Trời",
        "Chọn nghề nghiệp theo lương tâm Kitô hữu"
      ]
    },
    {
      key: "skills",
      icon: Users,
      badge: "KỸ NĂNG THANH NIÊN",
      title: "Kỹ Năng Lãnh Đạo & Đồng Đội",
      desc: "Rèn luyện kỹ năng mềm thiết yếu cho người trẻ trưởng thành: làm việc nhóm, giao tiếp, thuyết trình, tổ chức sinh hoạt dã ngoại và quản trị cảm xúc.",
      sub: "Huấn luyện thực hành Ngành Chinh Chiến",
      linkText: "Xem chuyên đề kỹ năng",
      actionType: "route",
      to: "/giới-trẻ-công-giáo",
      topics: [
        "Lãnh đạo theo gương phục vụ Đức Kitô",
        "Giải quyết xung đột & làm việc đội nhóm",
        "Tổ chức sinh hoạt, dã ngoại & lửa trại",
        "Quản trị thời gian giữa học tập & phụng sự"
      ]
    }
  ];

  // Dải 4 bước Compact Timeline Ca 1 Chúa Nhật
  const timelineSteps = [
    {
      time: "06:45",
      label: "Tập Trung & Chào Cờ",
      sub: "Sân Giáo Lý · Nghi thức chào cờ Ngành Chinh Chiến & dâng ngày mới",
      highlight: false,
      tag: null
    },
    {
      time: "07:00 – 07:45",
      label: "Chuyên Đề Sống Đức Tin Vào Đời",
      sub: "Nhà Họp Xứ · Thảo luận Youcat, Docat, định hướng nghề nghiệp và luân lý",
      highlight: true,
      tag: "Huấn Giáo Đức Tin"
    },
    {
      time: "07:45",
      label: "Tiến vào Thánh Đường",
      sub: "Hỗ trợ Huynh trưởng ổn định chỗ ngồi và sẵn sàng các phận vụ",
      highlight: false,
      tag: null
    },
    {
      time: "08:00 – 09:00",
      label: "Thánh Lễ Thiếu Nhi Toàn Đoàn",
      sub: "Gương mẫu toàn xứ đoàn · Tham gia điều phối trật tự, ca đoàn và hiệp dâng Thánh Lễ",
      highlight: true,
      tag: "Tâm Điểm Phụng Vụ"
    }
  ];

  // 3 Trụ cột hành động đồng hành người trẻ (Youth Hub Cột Trái)
  const youthPillars = [
    {
      key: "red",
      icon: Compass,
      title: "Đồng Hành Phân Định Ơn Gọi",
      badge: "Tương Lai & Ơn Gọi",
      desc: "Ban Huynh Trưởng và Quý Soeur luôn lắng nghe, đồng hành phân định những băn khoăn về chọn trường, chọn ngành nghề, tình bạn tình yêu và ơn gọi dâng hiến.",
      tip: "Đừng ngần ngại trò chuyện riêng cùng GLV hoặc Cha Tuyên Úy khi đứng trước những lựa chọn lớn của cuộc đời."
    },
    {
      key: "emerald",
      icon: Lightbulb,
      title: "Dự Án Bác Ái & Xã Hội (Docat)",
      badge: "Hành Động Bác Ái",
      desc: "Hiện thực hóa Lời Chúa qua các chuyến viếng thăm người nghèo, mái ấm khuyết tật và các chiến dịch xanh bảo vệ môi trường theo tinh thần Laudato Si'.",
      tip: "Mỗi học kỳ, mỗi lớp Vào Đời cùng lên kế hoạch và tự tay thực hiện một dự án phục vụ cộng đoàn cụ thể."
    },
    {
      key: "amber",
      icon: Users,
      title: "Không Gian Giới Trẻ Lành Mạnh",
      badge: "Kết Nối Huynh Đệ",
      desc: "Môi trường kết nối bạn bè cùng đức tin: các buổi cà phê chuyên đề, đêm diễn nguyện, trại hè Chinh Chiến và giải bóng đá giao hữu Giới Trẻ Giáo xứ.",
      tip: "Tham gia tích cực vào các ban Phụng vụ, Ca đoàn và Ban Truyền thông Xứ đoàn để phát huy sở trường bản thân."
    }
  ];

  // Mái ấm & Checklist hành trang vào đời (Youth Hub Cột Phải - Sanctuary Box)
  const youthSanctuaryData = {
    eyebrow: "LỜI NHẮN NHỦ GỬI NGƯỜI TRẺ · THÁNH GIOAN PHAOLÔ II",
    author: "Thánh Giáo Hoàng Gioan Phaolô II",
    quote: "“Đừng sợ! Đừng thỏa hiệp với sự tầm thường. Hãy mở rộng cửa tâm hồn cho Đức Kitô, vì chỉ có Người mới biết rõ điều gì đang ở trong trái tim các con!”",
    checklistTitle: "Checklist 4 Hành Trang Người Trưởng Thành Vào Đời",
    checklist: [
      { label: "Cầu Nguyện Cá Vị", text: "Dành 10 phút tĩnh lặng mỗi tối đọc Lời Chúa và xét mình trước khi ngủ." },
      { label: "Bí Tích Nguồn Mạch", text: "Xưng tội định kỳ hàng tháng và sốt sắng rước Mình Thánh Chúa mỗi Chúa Nhật." },
      { label: "Làm Chủ Bản Thân", text: "Gìn giữ đức khiết tịnh, trung thực trong thi cử và có trách nhiệm nơi môi trường mạng." },
      { label: "Dấn Thân Phục Vụ", text: "Sẵn sàng đón nhận sứ mạng Tông Đồ Giáo Dân, tham gia Giới Trẻ hoặc trở thành Giáo Lý Viên tương lai." }
    ],
    supportTitle: "Cần trao đổi riêng với Huynh Trưởng?",
    supportDesc: "Ban Huynh Trưởng Khối Vào Đời luôn sẵn sàng lắng nghe và đồng hành.",
    supportBtnText: "Nhắn Huynh Trưởng",
    supportBtnLink: "/liên-hệ"
  };

  // 5 Câu hỏi thường gặp (FAQ Accordion)
  const faqs = [
    {
      q: `Điều kiện để các bạn trẻ đăng ký theo học Khối Vào Đời niên khóa ${academicYear} là gì?`,
      a: `Dành cho các bạn trẻ 15 – 16 tuổi: Lớp Vào Đời 1 (15 tuổi · Sinh năm ${vaoDoi1BirthYear}) và Lớp Vào Đời 2 (16 tuổi · Sinh năm ${vaoDoi2BirthYear}), đã lãnh nhận Bí tích Thêm Sức. Học sinh từ các giáo xứ khác chuyển đến hoặc bị gián đoạn trước đây chỉ cần liên hệ Ban Giáo lý để được hướng dẫn xếp lớp thuận tiện.`
    },
    {
      q: "Nếu em bận lịch học thêm văn hóa hoặc chuẩn bị thi tuyển sinh lớp 10, THPT quốc gia thì sao?",
      a: "Ban Giáo Lý và các Huynh Trưởng luôn thấu hiểu và tạo điều kiện tối đa cho việc học văn hóa của các bạn. Giáo xứ có cơ chế hỗ trợ tài liệu học tập tóm lược, sinh hoạt trực tuyến kết hợp hoặc bài tập phản tỉnh tại nhà để các em không bị gián đoạn tiến trình đức tin."
    },
    {
      q: "Chương trình Khối Vào Đời có những điểm gì khác biệt so với các khối cấp 2?",
      a: "Khối Vào Đời chuyển hoàn toàn sang phương pháp tương tác mở: thảo luận nhóm, giải quyết tình huống thực tế (case studies), tọa đàm cùng diễn giả khách mời, học chuyên sâu hai tài liệu Youcat và Docat, đồng thời bắt buộc tham gia các dự án bác ái thực tế thay vì chỉ học bài lý thuyết trên lớp."
    },
    {
      q: "Sau khi hoàn thành Khối Vào Đời (Lớp Vào Đời 2), các em sẽ tiếp tục sinh hoạt ở đâu?",
      a: "Sau khi hoàn thành chương trình Vào Đời 2, các em sẽ tham dự Nghi thức Tuyên Hứa Trưởng Thành và được chuyển tiếp sinh hoạt tại Giới Trẻ Giáo xứ An Ngãi, hoặc được định hướng đào tạo tham gia Lớp Dự Trưởng / Giáo Lý Viên tương lai của Xứ đoàn."
    },
    {
      q: "Giáo xứ có tổ chức các hoạt động ngoại khóa, dã ngoại hoặc chiến dịch tình nguyện cho khối không?",
      a: "Hằng năm, Khối Vào Đời đều tổ chức các hoạt động đặc thù: Trại dấn thân Chinh Chiến, các chuyến viếng thăm mái ấm tình thương, trung tâm khuyết tật, chiến dịch bảo vệ môi trường tại địa phương và đêm hội diễn nguyện Giới Trẻ."
    }
  ];

  return (
    <div className="vd-page">
      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: HERO SECTION
      ══════════════════════════════════════════════════════════════ */}
      <section className="vd-hero">
        <div className="vd-shell">
          <div className="vd-hero-grid">
            {/* Cột trái: Văn bản & CTA */}
            <div className="vd-hero-left">
              <div className="vd-hero-pill-badge">
                <Flame size={14} className="vd-hero-pill-icon" />
                <span>Ngành Chinh Chiến HTDC · Khối Vào Đời</span>
              </div>

              <h1 className="vd-hero-title">
                Sống Đức Tin Giữa Lòng Đời — <em>Chiến Tâm Vượt Khó</em>, Chinh Dũng Dấn Thân
              </h1>

              <p className="vd-hero-desc">
                Không còn là những bài học thụ động, Khối Vào Đời là trường huấn luyện bản lĩnh dành cho các bạn trẻ 15–16 tuổi: làm chứng cho Tin Mừng giữa thế giới hiện đại, làm chủ công nghệ, thông thạo Học thuyết Xã hội Docat và tự tin phân định ơn gọi tương lai.
              </p>

              <div className="vd-hero-actions">
                <a href="#danh-sach-lop" className="vd-btn-primary">
                  <span>Xem 5 Lớp Học</span>
                  <ArrowRight size={18} aria-hidden="true" className="vd-btn-icon" />
                </a>
                <Link to="/tuyển-sinh#dang-ky" className="vd-btn-secondary">
                  <Sparkles size={17} aria-hidden="true" className="vd-btn-icon" />
                  <span>Đăng Ký Niên Khóa Mới</span>
                </Link>
              </div>
            </div>

            {/* Cột phải: Khung ảnh 4:3 & Floating Badge uy tín */}
            <div className="vd-hero-right">
              <div className="vd-hero-image-card">
                <img
                  src="/images/khoivaodoi-anngai.jpg"
                  alt="Đoàn sinh Khối Vào Đời (Lớp Vào Đời 2/1 - Phêrô Can Đảm) Ngành Chinh Chiến HTDC - Xứ đoàn Mẹ Mân Côi Giáo xứ An Ngãi"
                  className="vd-hero-img"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="vd-floating-badge">
                  <div className="vd-floating-badge-icon">
                    <Flame size={20} />
                  </div>
                  <div className="vd-floating-badge-content">
                    <div className="vd-floating-badge-title">
                      150 Đoàn Sinh Khối Vào Đời
                    </div>
                    <div className="vd-floating-badge-sub">
                      Lớp 10 &amp; 11 · Xứ đoàn Mẹ Mân Côi Giáo xứ An Ngãi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dải tổng quan 4 chỉ số (Overview Bar) Bento Chips */}
          <div className="vd-overview-bar">
            <div className="vd-overview-chip">
              <span className="vd-chip-cat">Độ tuổi</span>
              <span className="vd-chip-value">15 – 16 Tuổi</span>
              <span className="vd-chip-label">Sinh năm {vaoDoi2BirthYear} – {vaoDoi1BirthYear}</span>
            </div>
            <div className="vd-overview-chip">
              <span className="vd-chip-cat">Quy mô</span>
              <span className="vd-chip-value">5 Lớp Học</span>
              <span className="vd-chip-label">150 Đoàn sinh</span>
            </div>
            <div className="vd-overview-chip">
              <span className="vd-chip-cat">Lịch học</span>
              <span className="vd-chip-value">Ca 1 Chúa Nhật</span>
              <span className="vd-chip-label">Học 07:00 · Lễ 08:00</span>
            </div>
            <div className="vd-overview-chip">
              <span className="vd-chip-cat">Nhân sự</span>
              <span className="vd-chip-value">10 GLV</span>
              <span className="vd-chip-label">Giáo Lý Viên & Huynh Trưởng</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: DANH SÁCH 5 LỚP HỌC THỰC TẾ & BỘ LỌC
      ══════════════════════════════════════════════════════════════ */}
      <section id="danh-sach-lop" className="vd-roster-section">
        <div className="vd-shell">
          <div className="vd-section-header">
            <div className="vd-eyebrow">
              <span className="vd-dot" />
              <span>DANH SÁCH LỚP THỰC TẾ NIÊN KHÓA {academicYear}</span>
            </div>
            <h2 className="vd-section-title">
              Các Lớp Khối Vào Đời <em>Giáo xứ An Ngãi</em>
            </h2>
            <p className="vd-section-desc">
              Phòng học lầu 1 và Nhà Họp Xứ, thời gian học Ca 1 Chúa Nhật cùng đội ngũ 10 Huynh trưởng - Giáo lý viên giàu nhiệt huyết trực tiếp đồng hành.
            </p>
          </div>

          {/* Bộ lọc phân tầng khối học */}
          <div className="vd-stage-filter-bar">
            <button
              type="button"
              className={`vd-filter-pill ${selectedGroup === "all" ? "active" : ""}`}
              onClick={() => setSelectedGroup("all")}
            >
              Tất Cả<span className="hidden sm:inline"> 5 Lớp</span>
            </button>
            <button
              type="button"
              className={`vd-filter-pill ${selectedGroup === "vd1" ? "active" : ""}`}
              onClick={() => setSelectedGroup("vd1")}
            >
              <span className="hidden sm:inline">Khối </span>Vào Đời 1<span className="hidden sm:inline"> (15 Tuổi · 3 Lớp)</span>
            </button>
            <button
              type="button"
              className={`vd-filter-pill ${selectedGroup === "vd2" ? "active" : ""}`}
              onClick={() => setSelectedGroup("vd2")}
            >
              <span className="hidden sm:inline">Khối </span>Vào Đời 2<span className="hidden sm:inline"> (16 Tuổi · 2 Lớp)</span>
            </button>
          </div>

          {/* NHÓM 1: VÀO ĐỜI 1 (15 TUỔI · LỚP 10) */}
          {(selectedGroup === "all" || selectedGroup === "vd1") && (
            <div className="vd-group-block">
              <div className="vd-stage-header">
                <div className="vd-stage-title-wrap">
                  <span className="vd-stage-num">01</span>
                  <div>
                    <h3 className="vd-stage-title">Khối Vào Đời 1</h3>
                    <p className="vd-stage-subtitle">
                      Năm thứ nhất · Căn tính người trẻ, Youcat đức tin và đức tin trong kỷ nguyên số
                    </p>
                  </div>
                </div>
                <div className="vd-stage-pills">
                  <span className="vd-stage-pill">15 Tuổi</span>
                  <span className="vd-stage-pill">Sinh năm {vaoDoi1BirthYear}</span>
                  <span className="vd-stage-pill">3 Lớp (P10, P11, P12)</span>
                </div>
              </div>

              <div className="vd-class-grid">
                {vd1Classes.map((item) => (
                  <div key={item.id} className="vd-class-card card-vd1">
                    {/* TẦNG 1: Head - Mã lớp & Phòng */}
                    <div className="vd-bento-card-head">
                      <span className="vd-bento-class-code">
                        {item.name.replace("Lớp Vào Đời ", "VD ")}
                      </span>
                      <span className="vd-bento-room-badge">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{getRoomLocation(item.room)}</span>
                      </span>
                    </div>

                    {/* TẦNG 2: Tiêu đề lớp & Dải chỉ số */}
                    <div>
                      <h4 className="vd-bento-class-title">{item.name}</h4>
                      <div className="vd-bento-stats-strip">
                        {item.studentsCount && (
                          <span className="vd-bento-stat-chip">
                            <Users size={13} aria-hidden="true" />
                            <span>Sĩ số: <strong>{item.studentsCount} em</strong></span>
                          </span>
                        )}
                        <span className="vd-bento-stat-chip">
                          <Calendar size={13} aria-hidden="true" />
                          <span>Độ tuổi: <strong>{item.ageText} ({item.birthYear})</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* TẦNG 3: Đội ngũ GLV */}
                    <div className="vd-bento-teacher-box">
                      <div className="vd-bento-teacher-label">
                        <ShieldCheck size={13} aria-hidden="true" />
                        <span>Huynh Trưởng / GLV ({item.teachers.length})</span>
                      </div>
                      <div className="vd-bento-teacher-pills">
                        {item.teachers.map((t, idx) => (
                          <span key={idx} className="vd-bento-teacher-pill">
                            {formatTeacherName(t)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* TẦNG 4: Trọng tâm đào tạo */}
                    <div className="vd-bento-focus-box">
                      <div className="vd-bento-focus-badge">{item.levelBadge}</div>
                      <p className="vd-bento-focus-desc">{item.focus}</p>
                    </div>

                    {/* TẦNG 5: Footer - Giờ học & Nề nếp */}
                    <div className="vd-bento-card-foot">
                      <span className="vd-bento-time">
                        <Clock size={13} aria-hidden="true" />
                        <span>{item.time} (Ca 1)</span>
                      </span>
                      <span className="vd-bento-status">
                        ● {item.status === "Đang học tập" ? "Đang sinh hoạt" : item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NHÓM 2: VÀO ĐỜI 2 (16 TUỔI · LỚP 11) */}
          {(selectedGroup === "all" || selectedGroup === "vd2") && (
            <div className="vd-group-block" style={{ marginBottom: "16px" }}>
              <div className="vd-stage-header vd-stage-highlight">
                <div className="vd-stage-title-wrap">
                  <span className="vd-stage-num">02</span>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                      <h3 className="vd-stage-title">Khối Vào Đời 2</h3>
                      <span className="vd-stage-special-badge">⭐ Trưởng Thành Ngành Chinh Chiến</span>
                    </div>
                    <p className="vd-stage-subtitle">
                      Năm thứ hai · Docat, Học thuyết Xã hội, Phân định Ơn gọi &amp; Chuẩn bị Tốt nghiệp Vào Đời
                    </p>
                  </div>
                </div>
                <div className="vd-stage-pills">
                  <span className="vd-stage-pill">16 Tuổi</span>
                  <span className="vd-stage-pill">Sinh năm {vaoDoi2BirthYear}</span>
                  <span className="vd-stage-pill">2 Lớp (P13 &amp; Nhà Họp Xứ)</span>
                </div>
              </div>

              <div className="vd-class-grid">
                {vd2Classes.map((item) => (
                  <div key={item.id} className="vd-class-card card-vd2">
                    {/* TẦNG 1: Head - Mã lớp & Phòng */}
                    <div className="vd-bento-card-head">
                      <span className="vd-bento-class-code">
                        {item.name.replace("Lớp Vào Đời ", "VD ")}
                      </span>
                      <span className="vd-bento-room-badge">
                        <MapPin size={13} aria-hidden="true" />
                        <span>{getRoomLocation(item.room)}</span>
                      </span>
                    </div>

                    {/* TẦNG 2: Tiêu đề lớp & Dải chỉ số */}
                    <div>
                      <h4 className="vd-bento-class-title">{item.name}</h4>
                      <div className="vd-bento-stats-strip">
                        {item.studentsCount && (
                          <span className="vd-bento-stat-chip">
                            <Users size={13} aria-hidden="true" />
                            <span>Sĩ số: <strong>{item.studentsCount} em</strong></span>
                          </span>
                        )}
                        <span className="vd-bento-stat-chip">
                          <Calendar size={13} aria-hidden="true" />
                          <span>Độ tuổi: <strong>{item.ageText} ({item.birthYear})</strong></span>
                        </span>
                      </div>
                    </div>

                    {/* TẦNG 3: Đội ngũ GLV */}
                    <div className="vd-bento-teacher-box">
                      <div className="vd-bento-teacher-label">
                        <ShieldCheck size={13} aria-hidden="true" />
                        <span>Huynh Trưởng / GLV ({item.teachers.length})</span>
                      </div>
                      <div className="vd-bento-teacher-pills">
                        {item.teachers.map((t, idx) => (
                          <span key={idx} className="vd-bento-teacher-pill">
                            {formatTeacherName(t)}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* TẦNG 4: Trọng tâm đào tạo */}
                    <div className="vd-bento-focus-box">
                      <div className="vd-bento-focus-badge">{item.levelBadge}</div>
                      <p className="vd-bento-focus-desc">{item.focus}</p>
                    </div>

                    {/* TẦNG 5: Footer - Giờ học & Nề nếp */}
                    <div className="vd-bento-card-foot">
                      <span className="vd-bento-time">
                        <Clock size={13} aria-hidden="true" />
                        <span>{item.time} (Ca 1)</span>
                      </span>
                      <span className="vd-bento-status">
                        ● {item.status === "Đang học tập" ? "Đang sinh hoạt" : item.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: SƯ PHẠM ĐỨC TIN 6 CHẶNG DẤN THÂN
      ══════════════════════════════════════════════════════════════ */}
      <section className="vd-journey-section">
        <div className="vd-shell">
          <div className="vd-section-header">
            <div className="vd-eyebrow">
              <span className="vd-dot" />
              <span>LỘ TRÌNH SƯ PHẠM ĐỨC TIN CHUYÊN SÂU</span>
            </div>
            <h2 className="vd-section-title">
              6 Chặng Sư Phạm Đức Tin <em>Dấn Thân Vào Đời</em>
            </h2>
            <p className="vd-section-desc">
              Tiến trình huấn luyện toàn diện từ củng cố căn tính nội tâm đến rèn luyện đạo đức, dấn thân xã hội và trưởng thành đức tin trước ngưỡng cửa đại học.
            </p>
          </div>

          <div className="vd-journey-grid">
            {faithJourneySteps.map((card, idx) => {
              const StepIcon = card.icon;
              const PracticeIcon = card.practiceIcon || CheckCircle2;
              return (
                <div key={idx} className={`vd-journey-card stage-step-${card.step}`}>
                  <div className="vd-journey-card-main">
                    <div className="vd-journey-card-top">
                      <div className="vd-journey-left-header">
                        <div className="vd-journey-icon-wrap">
                          <StepIcon size={22} aria-hidden="true" />
                        </div>
                        <div>
                          <span className="vd-journey-step-badge">CHẶNG {card.step}</span>
                        </div>
                      </div>
                      <span className="vd-journey-category-pill">{card.badge}</span>
                    </div>

                    <div className="vd-journey-card-body">
                      <div className="vd-journey-sub">{card.sub}</div>
                      <h3 className="vd-journey-title">{card.title}</h3>
                      <p className="vd-journey-meaning">{card.meaning}</p>
                    </div>
                  </div>

                  <div className="vd-journey-practice-box">
                    <div className="vd-practice-header">
                      <PracticeIcon size={14} aria-hidden="true" />
                      <span>{card.practiceLabel}</span>
                    </div>
                    <div className="vd-practice-content">
                      {card.highlight}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: 4 TRỤ CỘT HÀNH TRANG VÀO ĐỜI (YOUCAT / DOCAT)
      ══════════════════════════════════════════════════════════════ */}
      <section className="vd-pillars-section">
        <div className="vd-shell">
          <div className="vd-section-header">
            <div className="vd-eyebrow">
              <span className="vd-dot" />
              <span>NỀN TẢNG TRI THỨC &amp; KỸ NĂNG CỐT LÕI</span>
            </div>
            <h2 className="vd-section-title">
              4 Trụ Cột Hành Trang <em>Vào Đời</em>
            </h2>
            <p className="vd-section-desc">
              Trang bị đồng bộ giữa tri thức giáo lý vững vàng, trách nhiệm xã hội sắc bén, sự sáng suốt trong phân định và kỹ năng làm việc thực tiễn.
            </p>
          </div>

          <div className="vd-pillars-grid">
            {pillarsData.map((p, idx) => {
              const PIcon = p.icon;
              return (
                <div key={idx} className={`vd-pillar-card theme-${p.key}`}>
                  <div className="vd-pillar-main">
                    <div className="vd-pillar-card-top">
                      <div className="vd-pillar-icon-box">
                        <PIcon size={22} aria-hidden="true" />
                      </div>
                      <span className="vd-pillar-badge">{p.badge}</span>
                    </div>

                    <h3 className="vd-pillar-title">{p.title}</h3>
                    <p className="vd-pillar-desc">{p.desc}</p>

                    <div className="vd-pillar-topics-grid">
                      {p.topics.map((top, tIdx) => (
                        <div key={tIdx} className="vd-pillar-topic-chip">
                          <CheckCircle2 size={14} className="vd-pillar-topic-icon" aria-hidden="true" />
                          <span>{top}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="vd-pillar-card-foot">
                    <span className="vd-pillar-foot-sub">{p.sub}</span>
                    {p.actionType === "reader" && (
                      <button
                        type="button"
                        onClick={() => handleOpenReader(p.docId)}
                        className="vd-pillar-foot-btn"
                        aria-label={`${p.linkText}: Mở trình đọc trực tuyến trong ứng dụng`}
                      >
                        <span>{p.linkText}</span>
                        <ArrowRight size={13} aria-hidden="true" className="vd-pillar-foot-icon" />
                      </button>
                    )}
                    {p.actionType === "anchor" && (
                      <a
                        href={p.href}
                        className="vd-pillar-foot-btn"
                        aria-label={`${p.linkText}: Di chuyển tới góc đồng hành tuổi trẻ`}
                      >
                        <span>{p.linkText}</span>
                        <ArrowRight size={13} aria-hidden="true" className="vd-pillar-foot-icon" />
                      </a>
                    )}
                    {p.actionType === "route" && (
                      <Link
                        to={p.to}
                        className="vd-pillar-foot-btn"
                        aria-label={`${p.linkText}: Chuyển sang chuyên mục Giới Trẻ`}
                      >
                        <span>{p.linkText}</span>
                        <ArrowRight size={13} aria-hidden="true" className="vd-pillar-foot-icon" />
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: THỜI GIAN BIỂU CHUẨN XỨ ĐOÀN (CA 1 SÁNG)
      ══════════════════════════════════════════════════════════════ */}
      <section className="vd-timeline-section">
        <div className="vd-shell">
          <div className="vd-section-header">
            <div className="vd-eyebrow">
              <span className="vd-dot" />
              <span>THỜI GIAN BIỂU CHÚA NHẬT (CA 1)</span>
            </div>
            <h2 className="vd-section-title">
              Nhịp Sống <em>Chúa Nhật</em>
            </h2>
            <p className="vd-section-desc">
              Khung giờ sinh hoạt quy chuẩn tại Giáo xứ An Ngãi, kết hợp hài hòa giữa trau dồi tri thức giáo lý và hiệp dâng Thánh Lễ cộng đoàn.
            </p>
          </div>

          {/* Thanh ray ngang tiến trình Stepper (Desktop >= 768px) */}
          <div className="vd-stepper-track" aria-hidden="true">
            <div className="vd-stepper-line" />
            <div className="vd-stepper-nodes">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className={`vd-stepper-col ${step.highlight ? "highlight" : ""}`}>
                  <div className="vd-stepper-node">{idx + 1}</div>
                  <span className="vd-stepper-time">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lưới thẻ thời gian biểu (Mobile: Trục dọc, Desktop: 4 Cards) */}
          <div className="vd-compact-timeline">
            {timelineSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className={`vd-time-chip ${step.highlight ? "highlight" : ""}`}>
                  <span className="vd-time-node" aria-hidden="true">{idx + 1}</span>
                  <div className="vd-time-card">
                    <div className="vd-time-header">
                      <span className="vd-time-badge">{step.time}</span>
                      {step.tag && (
                        <span className="vd-time-tag">{step.tag}</span>
                      )}
                    </div>
                    <div className="vd-time-content">
                      <span className="vd-time-label">{step.label}</span>
                      <span className="vd-time-sub">{step.sub}</span>
                    </div>
                  </div>
                </div>
                {idx < timelineSteps.length - 1 && (
                  <span className="vd-time-arrow" aria-hidden="true">→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="vd-timeline-footer-note">
            <ShieldCheck size={18} style={{ color: "var(--vd-accent-badge)", flexShrink: 0 }} aria-hidden="true" />
            <span><strong>Lưu ý tác phong:</strong> Tác phong Ngành Chinh Chiến: Đoàn sinh có mặt đúng 06:45, trang phục chỉnh tề, khăn quàng ngay ngắn và nghiêm trang gìn giữ trật tự chung.</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 6: GÓC ĐỒNG HÀNH TUỔI TRẺ & FAQ CẨM NANG VÀO ĐỜI
      ══════════════════════════════════════════════════════════════ */}
      <section id="dong-hanh" className="vd-youth-section">
        <div className="vd-shell">
          <div className="vd-section-header">
            <div className="vd-eyebrow">
              <span className="vd-dot" />
              <span>GÓC ĐỒNG HÀNH TUỔI TRẺ &amp; HÀNH TRANG TRƯỞNG THÀNH</span>
            </div>
            <h2 className="vd-section-title">
              Đồng Hành Cùng Bạn Trẻ <em>Dấn Thân Vào Đời</em>
            </h2>
            <p className="vd-section-desc">
              Tuổi 15–16 là bước ngoặt định hình nhân cách và lý tưởng. Xứ đoàn Mẹ Mân Côi và Ban Huynh Trưởng luôn là điểm tựa tin cậy, đồng hành cùng các bạn trên con đường trưởng thành đức tin và nhân bản.
            </p>
          </div>

          {/* Bento Youth Hub (2 Cột: 3 Cột Trụ bên trái + Sanctuary Box bên phải) */}
          <div className="vd-youth-bento-grid">
            {/* Cột trái: 3 Trụ cột hành động */}
            <div className="vd-pillars-stack">
              {youthPillars.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className={`vd-youth-pillar-card pillar-${item.key || (idx === 0 ? "red" : idx === 1 ? "emerald" : "amber")}`}
                  >
                    <div className="vd-youth-pillar-top">
                      <div className="vd-youth-pillar-header-left">
                        <div className="vd-youth-pillar-icon-wrap">
                          <IconComp size={22} />
                        </div>
                        <h4 className="vd-youth-pillar-title">{item.title}</h4>
                      </div>
                      <span className="vd-youth-pillar-badge">{item.badge}</span>
                    </div>
                    <p className="vd-youth-pillar-desc">{item.desc}</p>
                    <div className="vd-youth-pillar-action-tip">
                      <strong>Gợi ý hành động:</strong> {item.tip}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cột phải: Sanctuary Box (Mái Ấm & Checklist) */}
            <div className="vd-sanctuary-box">
              <div>
                <div className="vd-sanctuary-eyebrow">
                  <Sparkles size={14} aria-hidden="true" />
                  <span>{youthSanctuaryData.eyebrow}</span>
                </div>

                <div className="vd-sanctuary-quote-card">
                  <div className="vd-sanctuary-quote-header">
                    <Quote size={18} className="vd-sanctuary-quote-icon" aria-hidden="true" />
                    <span className="vd-sanctuary-quote-author">{youthSanctuaryData.author}</span>
                  </div>
                  <blockquote className="vd-sanctuary-quote-text">
                    {youthSanctuaryData.quote}
                  </blockquote>
                </div>

                <div className="vd-checklist-section-title">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{youthSanctuaryData.checklistTitle}</span>
                </div>

                <ul className="vd-checklist-list">
                  {youthSanctuaryData.checklist.map((chk, cIdx) => (
                    <li key={cIdx} className="vd-checklist-item">
                      <span className="vd-check-icon">✓</span>
                      <span><strong>{chk.label}:</strong> {chk.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="vd-support-note-box">
                <div className="vd-support-note-text">
                  <strong>{youthSanctuaryData.supportTitle}</strong><br />
                  {youthSanctuaryData.supportDesc}
                </div>
                <Link to={youthSanctuaryData.supportBtnLink} className="vd-support-note-btn">
                  <span>{youthSanctuaryData.supportBtnText}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Accordion Chuẩn Flagship */}
          <div className="vd-faq-wrapper">
            <div className="vd-faq-header">
              <h3 className="vd-faq-title">
                Giải Đáp Thắc Mắc Khối Vào Đời (FAQ)
              </h3>
              <p className="vd-faq-desc">
                Các câu hỏi thiết thực về lịch học, phân phối thời gian, phương pháp học Youcat/Docat và nghi thức trưởng thành.
              </p>
            </div>

            <div className="vd-faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                const faqAnsId = `vd-faq-ans-${idx}`;
                const padIdx = String(idx + 1).padStart(2, "0");
                return (
                  <div key={idx} className={`vd-faq-item ${isOpen ? "active" : ""}`}>
                    <button
                      type="button"
                      className="vd-faq-btn"
                      aria-expanded={isOpen}
                      aria-controls={faqAnsId}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                    >
                      <div className="vd-faq-question-wrap">
                        <span className="vd-faq-q-badge">{padIdx}</span>
                        <span>{item.q}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className="vd-faq-chevron"
                      />
                    </button>
                    {isOpen && (
                      <div id={faqAnsId} className="vd-faq-answer">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 7: CTA BANNER DẤN THÂN & KẾT NỐI GIỚI TRẺ
      ══════════════════════════════════════════════════════════════ */}
      <div className="vd-shell" style={{ paddingBottom: "56px" }}>
        <div className="vd-cta-banner">
          <div className="vd-cta-glow" aria-hidden="true" />

          <div className="vd-cta-badge">
            <span className="vd-cta-badge-icon" aria-hidden="true">⚔️</span>
            <span>NGÀNH CHINH CHIẾN · NIÊN KHÓA {academicYear} · GIÁO XỨ AN NGÃI</span>
          </div>

          <h3 className="vd-cta-title">
            Sẵn Sàng Bước Vào Đời Cùng Đức Kitô?
          </h3>

          <p className="vd-cta-desc">
            Bạn không bước vào tương lai một mình. Gia nhập cộng đoàn thanh niên Khối Vào Đời Giáo xứ An Ngãi để cùng nhau tôi luyện đức tin, gắn kết tình huynh đệ và trở thành những chứng nhân Tin Mừng dũng cảm giữa trần thế.
          </p>

          <div className="vd-cta-actions">
            {/* Nút chính 52px chiếm vị trí nổi bật nhất */}
            <Link to="/tuyển-sinh#dang-ky" className="vd-cta-primary-btn">
              <Sparkles size={18} aria-hidden="true" className="vd-cta-sparkle" />
              <span>Đăng Ký Khối Vào Đời</span>
              <ArrowRight size={18} aria-hidden="true" className="vd-cta-arrow" />
            </Link>

            {/* 2 nút phụ hỗ trợ thanh lịch, đối xứng */}
            <div className="vd-cta-secondary-group">
              <Link to="/giới-trẻ-công-giáo" className="vd-cta-secondary-btn">
                <Users size={15} aria-hidden="true" />
                <span>Giới Trẻ An Ngãi</span>
              </Link>
              <Link to="/liên-hệ" className="vd-cta-secondary-btn">
                <Church size={15} aria-hidden="true" />
                <span>Liên Hệ Ban Giáo Lý</span>
              </Link>
            </div>
          </div>

          <div className="vd-cta-note">
            <span>✦ Dấn thân phục vụ · Sẵn sàng làm chứng nhân Tin Mừng giữa giảng đường đại học và công sở.</span>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════
          TRÌNH ĐỌC GIÁO TRÌNH TRỰC TUYẾN (YOUCAT & DOCAT)
      ══════════════════════════════════════════════════════════════ */}
      <DocumentReaderModal
        isOpen={isReaderOpen}
        onClose={() => setIsReaderOpen(false)}
        doc={readingDoc}
        onDownload={handleDownloadDoc}
      />
    </div>
  );
}