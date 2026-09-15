import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Flame, Clock, Sparkles, ChevronDown, HelpCircle,
  ArrowRight, Church, MapPin, Heart, BookOpen, User, ShieldCheck, Music,
  Compass, Droplets, Bell, Palette, CheckCircle2, Quote,
  Calendar, Users
} from "lucide-react";
import {
  AdventCandleIcon,
  BethlehemStarIcon,
  LentenCrossIcon,
  TriduumChaliceCrossIcon,
  PaschalSunIcon,
  OrdinaryWheatIcon,
  ChristKingCrownIcon,
  BaptismalWaterIcon,
  HolySpiritFlameIcon,
  EucharistHostChaliceIcon,
  KingdomKeysIcon,
  AnointingOilIcon,
  HolyOrdersStoleIcon,
  IntertwinedWeddingRingsIcon
} from "../components/shared/LiturgicalIcons.jsx";
import { getKhoiPhungVuData } from "../utils/academicYear.js";
import "./KhoiPhungVu.css";

// Helper định dạng danh xưng Giáo Lý Viên
const formatTeacherName = (t) => {
  if (t.startsWith("C.")) return `Chị ${t.slice(2)}`;
  if (t.startsWith("A.")) return `Anh ${t.slice(2)}`;
  if (t.startsWith("Sr.")) return `Sr. ${t.slice(3)}`;
  return t;
};

// Helper vị trí phòng học
const getRoomLocation = (room) => {
  if (room.includes("P1") || room.includes("P2")) return `${room} · Tầng Trệt`;
  if (room.toLowerCase().includes("hầm")) return "Nhà Hầm Sinh Hoạt";
  return room;
};

export default function KhoiPhungVu() {
  // Lấy dữ liệu tự động tính toán niên khóa và năm sinh theo thời gian thực
  const data = getKhoiPhungVuData();
  const {
    academicYear,
    phungVuBirthYear,
    classes
  } = data;

  const [openFaq, setOpenFaq] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState("all");
  const [activeTab, setActiveTab] = useState("seasons"); // "seasons" | "sacraments"

  useEffect(() => {
    const prevTitle = document.title;
    document.title = `Khối Phụng Vụ (Lớp 7) · Ngành Nhiệt Quang HTDC · Niên Khóa ${academicYear} | Giáo xứ An Ngãi`;
    return () => {
      document.title = prevTitle;
    };
  }, [academicYear]);

  // 6 Chặng sư phạm đức tin trực quan Ngành Nhiệt Quang (Đẳng cấp Bento & Vectors Phụng Vụ)
  const faithJourneySteps = [
    {
      step: "01",
      icon: Church,
      title: "Căn Bản Đời Thờ Phượng",
      sub: "Phụng Vụ Là Gì?",
      badge: "Nền Tảng",
      meaning: "Hiểu rằng Phụng vụ là hành động thánh thiêng của chính Chúa Kitô cùng toàn thể Dân Chúa. Các em không còn tham dự thụ động mà biết mở lòng hiệp dâng trọn vẹn mỗi Chúa Nhật.",
      practiceIcon: BookOpen,
      practiceLabel: "Nền tảng giáo lý (SC 10)",
      highlight: "Khắc sâu chân lý: Phụng vụ là nguồn mạch tuôn trào và chóp đỉnh của toàn bộ đời sống đức tin.",
      accentColor: "#2e5e43",
      accentBg: "rgba(46, 94, 67, 0.1)",
      accentBorder: "rgba(46, 94, 67, 0.25)"
    },
    {
      step: "02",
      icon: Compass,
      title: "Vòng Tròn Năm Phụng Vụ",
      sub: "Sống Nhịp Sống Giáo Hội",
      badge: "Thời Gian Thánh",
      meaning: "Khám phá ý nghĩa các mùa trong năm: Mùa Vọng, Giáng Sinh, Mùa Chay, Tam Nhật Vượt Qua, Phục Sinh và Thường Niên qua từng màu sắc phẩm phục phụng vụ đặc trưng.",
      practiceIcon: Palette,
      practiceLabel: "4 Sắc áo phụng vụ",
      highlight: "Nhận biết ý nghĩa biểu tượng: Trắng (Vui mừng), Đỏ (Hy sinh/Thần Khí), Tím (Sám hối), Xanh (Hy vọng).",
      accentColor: "#9333ea",
      accentBg: "rgba(147, 51, 234, 0.1)",
      accentBorder: "rgba(147, 51, 234, 0.25)"
    },
    {
      step: "03",
      icon: Droplets,
      title: "Bảy Cánh Cửa Ân Sủng",
      sub: "Bảy Suối Nguồn Cứu Độ",
      badge: "Ân Sủng",
      meaning: "Hiểu sâu 7 Bí tích chia thành 3 nhóm: Khai tâm (Rửa Tội, Thêm Sức, Thánh Thể), Chữa lành (Hòa Giải, Xức Dầu), và Phục vụ cộng đoàn (Truyền Chức, Hôn Phối).",
      practiceIcon: ShieldCheck,
      practiceLabel: "Dấu chỉ & Ơn thánh",
      highlight: "Cảm nhận sâu sắc dấu chỉ hữu hình mang lại nguồn ân sủng vô hình dưỡng nuôi linh hồn suốt đời.",
      accentColor: "#0284c7",
      accentBg: "rgba(2, 132, 199, 0.1)",
      accentBorder: "rgba(2, 132, 199, 0.25)"
    },
    {
      step: "04",
      icon: Heart,
      title: "Cùng Dâng Thánh Lễ Ý Thức",
      sub: "Đỉnh Cao Của Chúa Nhật",
      badge: "Bàn Tiệc Thánh",
      meaning: "Học hiểu từng phần của Thánh Lễ: Nghi thức đầu lễ, Phụng vụ Lời Chúa, Phụng vụ Thánh Thể và Nghi thức kết lễ để tham gia tích cực bằng trọn vẹn tâm trí và lời ca.",
      practiceIcon: Clock,
      practiceLabel: "Giây phút linh thiêng",
      highlight: "Cung kính quỳ gối giây phút Truyền Phép và lắng đọng tâm hồn tạ ơn Chúa ngự vào lòng sau khi rước lễ.",
      accentColor: "#dc2626",
      accentBg: "rgba(220, 38, 38, 0.1)",
      accentBorder: "rgba(220, 38, 38, 0.25)"
    },
    {
      step: "05",
      icon: Bell,
      title: "Phụng Sự Nơi Bàn Thờ",
      sub: "Tác Viên Phụng Vụ",
      badge: "Phục Vụ Bàn Thờ",
      meaning: "Tập dượt các tác vụ cụ thể: Giúp lễ (Lễ sinh), đọc Sách Thánh, dâng lễ vật, giữ trật tự và tham gia ca đoàn phục vụ các cử hành phụng vụ của Xứ đoàn.",
      practiceIcon: CheckCircle2,
      practiceLabel: "Tác phong nề nếp",
      highlight: "Rèn luyện dáng đi, cử chỉ trang nghiêm, tề chỉnh và tâm hồn khiêm nhường trước Bàn Thờ Chúa.",
      accentColor: "#059669",
      accentBg: "rgba(5, 150, 105, 0.1)",
      accentBorder: "rgba(5, 150, 105, 0.25)"
    },
    {
      step: "06",
      icon: Flame,
      title: "Sống Tinh Thần Nhiệt Quang",
      sub: "Khăn Da Cam HTDC",
      badge: "Chứng Nhân Giữa Đời",
      meaning: "Khăn cam Ngành Nhiệt Quang nhắc nhở ngọn lửa nhiệt tâm sốt sắng và sự sáng suốt. Phụng vụ trong nhà thờ được nối dài bằng đời sống yêu thương, bác ái và làm chứng giữa đời.",
      practiceIcon: Sparkles,
      practiceLabel: "Châm ngôn hành động",
      highlight: "Nhiệt tâm phụng sự Bàn Thờ Chúa – Quang dũng làm chứng giữa đời bằng lòng trung thực và bác ái.",
      accentColor: "#f97316",
      accentBg: "rgba(249, 115, 22, 0.12)",
      accentBorder: "rgba(249, 115, 22, 0.35)"
    }
  ];

  // 3 Chu Kỳ Năm Phụng Vụ (7 Mùa Phụng Vụ theo trật tự sư phạm Hội Thánh)
  const liturgicalCycles = [
    {
      groupId: "cycle-nhap-the",
      groupTitle: "Chu Kỳ Nhập Thể",
      groupSubtitle: "2 Mùa Phụng Vụ · Thiên Chúa Đến Với Nhân Loại",
      groupDesc: "Khởi đầu Năm Phụng Vụ với tâm tình trông đợi Đấng Cứu Thế và hân hoan mừng Con Thiên Chúa làm người ở giữa chúng ta.",
      badge: "Nhập Thể",
      gridType: "grid-2",
      seasons: [
        {
          id: "vong",
          season: "Mùa Vọng",
          colorKey: "purple",
          icon: AdventCandleIcon,
          colorBadge: "Màu Tím · 4 Tuần",
          ribbonColor: "#7e22ce",
          theme: "Trông Đợi & Sám Hối Dọn Đường",
          desc: "Bốn tuần chuẩn bị tâm hồn đón mừng đại lễ Chúa Giáng Sinh và trông đợi ngày Người lại đến trong vinh quang vĩnh cửu mai sau.",
          scripture: 'Is 40, 3: "Hãy dọn sẵn con đường cho Đức Chúa, sửa lối cho thẳng để Người ngự đi."',
          sign: "Vòng hoa Mùa Vọng với 4 cây nến, sắc phục tím trông đợi và Kinh Tiền Tụng Mùa Vọng.",
          action: "Tỉnh thức cầu nguyện, hy sinh hãm mình dọn máng cỏ tâm hồn đón mừng Chúa Hài Đồng hạ sinh.",
          culmination: "Đại lễ Chúa Giáng Sinh (25/12)",
          musicRule: "Không hát Kinh Vinh Danh · Vẫn hát Alleluia"
        },
        {
          id: "giang-sinh",
          season: "Mùa Giáng Sinh",
          colorKey: "amber",
          icon: BethlehemStarIcon,
          colorBadge: "Màu Trắng/Vàng · ~3 Tuần",
          ribbonColor: "#d97706",
          theme: "Ánh Sáng Cứu Độ & Vui Mừng Tạ Ơn",
          desc: "Niềm vui Con Thiên Chúa làm người ở cùng chúng ta, kéo dài từ đêm Canh Thức Giáng Sinh đến hết lễ Chúa Giêsu Chịu Phép Rửa.",
          scripture: 'Lc 2, 14: "Vinh danh Thiên Chúa trên trời, bình an dưới thế cho người Chúa thương."',
          sign: "Hang đá máng cỏ máng rơm, ngôi sao Bethlehem rực rỡ và sắc phục trắng ánh quang vinh.",
          action: "Hân hoan loan báo Tin Mừng, chia sẻ quà bánh yêu thương và thực thi bác ái với bạn nghèo.",
          culmination: "Lễ Hiển Linh & Chúa Chịu Phép Rửa",
          musicRule: "Hát Kinh Vinh Danh trọng thể · Hát Alleluia"
        }
      ]
    },
    {
      groupId: "cycle-vuot-qua",
      groupTitle: "Chu Kỳ Vượt Qua",
      groupSubtitle: "3 Mùa Phụng Vụ · Trái Tim Cứu Độ Của Năm Phụng Vụ",
      groupDesc: "Đỉnh cao của toàn bộ Năm Thánh: bước theo Đức Kitô qua cuộc Khổ Nạn, Tử Nạn và Phục Sinh vinh hiển cứu chuộc thế trần.",
      badge: "Vượt Qua",
      gridType: "grid-3",
      seasons: [
        {
          id: "chay",
          season: "Mùa Chay",
          colorKey: "purple",
          icon: LentenCrossIcon,
          colorBadge: "Màu Tím · 40 Ngày",
          ribbonColor: "#7e22ce",
          theme: "Sám Hối, Canh Tân & Trở Về",
          desc: "Bốn mươi ngày sám hối, chay tịnh và cầu nguyện thanh tẩy tâm hồn, noi gương Chúa trong hoang địa dọn lòng mừng mầu nhiệm Vượt Qua.",
          scripture: 'Mc 1, 15: "Thời kỳ đã mãn, hãy ăn năn sám hối và tin vào Tin Mừng cứu độ."',
          sign: "Thứ Tư Lễ Tro, Đàng Thánh Giá mỗi thứ Sáu, sắc tím sám hối và thinh lặng phụng vụ.",
          action: "Thực thi 3 việc Mùa Chay: siêng Cầu nguyện, Ăn chay hãm mình và tích cực làm việc Bác ái.",
          culmination: "Tuần Thánh (Chúa Nhật Lễ Lá)",
          musicRule: "Bỏ cả Kinh Vinh Danh và Alleluia (hát Câu Xướng)"
        },
        {
          id: "tam-nhat",
          season: "Tam Nhật Vượt Qua",
          colorKey: "red",
          icon: TriduumChaliceCrossIcon,
          colorBadge: "Trắng & Đỏ · 3 Ngày Thánh",
          ribbonColor: "#dc2626",
          theme: "Tình Yêu, Thập Giá & Phục Sinh",
          desc: "Ba ngày thánh thiêng nhất cử hành trọn vẹn cuộc Khổ Nạn và Phục Sinh của Chúa Kitô, từ chiều Thứ Năm Tuần Thánh đến hết Chúa Nhật.",
          scripture: 'Ga 13, 1: "Người đã yêu thương những kẻ thuộc về mình, và yêu thương đến cùng."',
          sign: "Nghi thức Rửa Chân Thứ Năm, Tôn kính Thánh Giá Thứ Sáu, Lửa Mới và Nến Phục Sinh.",
          action: "Viếng Mình Thánh Chúa đêm Thứ Năm, thinh lặng hiệp thông cùng Chúa trên Thánh Giá Canvê.",
          culmination: "Đêm Canh Thức Vượt Qua Cực Thánh",
          musicRule: "Thứ Năm rung chuông · Thứ Sáu, Bảy thinh lặng"
        },
        {
          id: "phuc-sinh",
          season: "Mùa Phục Sinh",
          colorKey: "orange",
          icon: PaschalSunIcon,
          colorBadge: "Màu Trắng/Vàng · 50 Ngày",
          ribbonColor: "#ea580c",
          theme: "Khải Hoàn & Sự Sống Mới",
          desc: "Năm mươi ngày hoan lạc cử hành Chúa khải hoàn trên tử thần, khai mở sự sống vĩnh cửu từ Phục Sinh đến lễ Chúa Thánh Thần Hiện Xuống.",
          scripture: 'Lc 24, 34: "Chúa đã trỗi dậy thật rồi và đã hiện ra với ông Simôn, Alleluia!"',
          sign: "Nến Phục Sinh cháy sáng nơi cung thánh, rảy Nước Thánh tái sinh và sắc trắng vàng.",
          action: "Sống niềm vui hân hoan của con cái sự sáng, làm chứng cho Chúa phục sinh giữa đời thường.",
          culmination: "Đại lễ Hiện Xuống (Ngũ Tuần)",
          musicRule: "Hát trọng thể Kinh Vinh Danh & Alleluia Phục Sinh"
        }
      ]
    },
    {
      groupId: "cycle-thuong-nien",
      groupTitle: "Mùa Thường Niên",
      groupSubtitle: "2 Giai Đoạn (~34 Tuần) · Bước Theo Thầy Giữa Đời Thường",
      groupDesc: "Thời gian dài nhất trong năm, dẫn dắt người môn đệ sống mầu nhiệm Nước Trời giữa nhịp sống học tập, gia đình và cộng đoàn xã hội.",
      badge: "Thường Niên",
      gridType: "grid-2",
      seasons: [
        {
          id: "thuong-nien-1",
          season: "Thường Niên Giai Đoạn I",
          colorKey: "green",
          icon: OrdinaryWheatIcon,
          colorBadge: "Màu Xanh Lá · 4–9 Tuần",
          ribbonColor: "#16a34a",
          theme: "Sứ Vụ Rao Giảng Của Chúa Giêsu",
          desc: "Nối mùa Giáng Sinh với mùa Chay, chiêm ngắm các phép lạ và lời mời gọi hoán cải, đón nhận Tin Mừng trong sứ vụ công khai của Thầy Giêsu.",
          scripture: 'Mt 4, 19: "Hãy theo Ta, Ta sẽ làm cho các anh thành những kẻ lưới người như lưới cá."',
          sign: "Sắc phục màu xanh lá cây hy vọng, lắng nghe Lời Chúa qua các Chúa Nhật thường niên.",
          action: "Lắng nghe Lời Chúa, vâng lời cha mẹ thầy cô và chu toàn bổn phận học đường mỗi ngày.",
          culmination: "Chúa Nhật VIII hoặc IX Thường Niên",
          musicRule: "Hát đầy đủ cả Kinh Vinh Danh & Alleluia"
        },
        {
          id: "thuong-nien-2",
          season: "Thường Niên Giai Đoạn II",
          colorKey: "green",
          icon: ChristKingCrownIcon,
          colorBadge: "Màu Xanh Lá · ~24–29 Tuần",
          ribbonColor: "#16a34a",
          theme: "Tăng Trưởng Đức Tin & Cánh Chung",
          desc: "Từ sau Lễ Hiện Xuống đến hết Năm Thánh, người Kitô hữu dấn thân làm chứng giữa đời, khép lại bằng Đại lễ Chúa Kitô Vua Vũ Trụ khải hoàn.",
          scripture: 'Mt 25, 40: "Mỗi lần các ngươi làm như thế cho người bé mọn nhất, là làm cho chính Ta."',
          sign: "Sắc phục xanh lá biểu trưng sức sống đức tin lớn lên từng ngày trong lòng Hội Thánh.",
          action: "Sống chứng tá bác ái, siêng làm việc lành và mở lòng giúp đỡ những bạn bè xung quanh.",
          culmination: "Đại lễ Chúa Kitô Vua Vũ Trụ (Tuần 34)",
          musicRule: "Hát đầy đủ cả Kinh Vinh Danh & Alleluia"
        }
      ]
    }
  ];

  // 3 Nhóm Bảy Bí Tích Cứu Độ (Theo Giáo Lý Hội Thánh Công Giáo)
  const sacramentGroups = [
    {
      groupId: "sacraments-initiation",
      groupTitle: "1. Các Bí Tích Khai Tâm Kitô Giáo",
      groupSubtitle: "3 Bí Tích Nền Tảng · Đặt Định Nền Móng Đời Sống Đức Tin",
      groupDesc: "Đặt nền móng cho toàn bộ đời sống Kitô hữu: được sinh ra trong sự sống mới, được củng cố bằng Thần Khí và được nuôi dưỡng bằng Lương Thực Trường Sinh.",
      badge: "Khai Tâm",
      gridType: "grid-3",
      sacraments: [
        {
          name: "Bí Tích Rửa Tội",
          type: "Khai Tâm Nền Tảng",
          statusBadge: "Đã lãnh nhận",
          colorKey: "sky",
          ribbonColor: "#0284c7",
          icon: BaptismalWaterIcon,
          scripture: 'Mt 28, 19: "Hãy đi rửa tội cho muôn dân nhân danh Cha và Con và Thánh Thần."',
          short: "Cửa ngõ đời sống thiêng liêng, tái sinh làm con Thiên Chúa và tháp nhập vào Thân Thể Hội Thánh.",
          sign: "Nước tự nhiên đổ trên đầu 3 lần cùng lời tuyên phong nhân danh Ba Ngôi cực thánh.",
          grace: "Tẩy sạch tội nguyên tổ, tái sinh làm con Chúa và ghi ấn tín thiêng liêng vĩnh viễn.",
          minister: "Giám mục / Linh mục (nguy tử: mọi người)",
          seal: "Ấn tín vĩnh viễn (1 lần)"
        },
        {
          name: "Bí Tích Thêm Sức",
          type: "Khai Tâm Trưởng Thành",
          statusBadge: "Đã lãnh nhận",
          colorKey: "orange",
          ribbonColor: "#ea580c",
          icon: HolySpiritFlameIcon,
          scripture: 'Cv 1, 8: "Anh em sẽ nhận được sức mạnh của Thánh Thần để làm chứng cho Thầy."',
          short: "Hoàn tất ân sủng Phép Rửa, đón nhận dồi dào Chúa Thánh Thần để trưởng thành làm chứng cho Tin Mừng.",
          sign: "Đức Giám mục đặt tay thinh lặng và xức Dầu Thánh (Chrisma) hình Thánh Giá trên trán.",
          grace: "Ban 7 ơn Thánh Thần, gia tăng sức mạnh đức tin để can đảm sống đạo và làm chứng tá.",
          minister: "Đức Giám mục (hoặc Linh mục ủy quyền)",
          seal: "Ấn tín vĩnh viễn (1 lần)"
        },
        {
          name: "Bí Tích Thánh Thể",
          type: "Nguồn Mạch & Đỉnh Cao",
          statusBadge: "Hiệp lễ mỗi Chúa Nhật",
          colorKey: "amber",
          ribbonColor: "#d97706",
          icon: EucharistHostChaliceIcon,
          scripture: 'Ga 6, 54: "Ai ăn Thịt và uống Máu Ta, thì có sự sống đời đời trong chính mình."',
          short: "Nguồn mạch và đỉnh cao đời sống Kitô hữu; Mình và Máu Thánh Chúa Kitô hiện diện thực sự nuôi hồn.",
          sign: "Bánh miến không men và Rượu nho tự nhiên cùng Lời Truyền Phép thánh hiến của Chủ tế.",
          grace: "Kết hiệp mật thiết với Chúa Giêsu, nuôi dưỡng sự sống linh hồn và hiệp nhất Dân Chúa.",
          minister: "Giám mục / Linh mục (Thừa tác viên: GLV)",
          seal: "Lãnh nhận thường xuyên"
        }
      ]
    },
    {
      groupId: "sacraments-healing",
      groupTitle: "2. Các Bí Tích Chữa Lành",
      groupSubtitle: "2 Bí Tích · Phục Hồi & Nâng Đỡ Tinh Thần Lẫn Thể Xác",
      groupDesc: "Chúa Giêsu – Thầy Thuốc linh hồn và thể xác – tiếp tục sứ vụ tha thứ tội lỗi, xoa dịu đau thương và ban sức mạnh cho tín hữu.",
      badge: "Chữa Lành",
      gridType: "grid-2",
      sacraments: [
        {
          name: "Bí Tích Hoà Giải (Giải Tội)",
          type: "Chữa Lành Linh Hồn",
          statusBadge: "Lãnh nhận thường xuyên",
          colorKey: "indigo",
          ribbonColor: "#6366f1",
          icon: KingdomKeysIcon,
          scripture: 'Ga 20, 23: "Các con tha tội cho ai, thì tội người ấy được tha; cầm giữ ai, thì bị cầm giữ."',
          short: "Tha thứ mọi tội lỗi sau Phép Rửa, hòa giải người hối nhân với Thiên Chúa và cộng đoàn Hội Thánh.",
          sign: "Lòng ăn năn sám hối thật lòng, xưng thú tội lỗi và đón nhận Lời Tha Tội từ Linh mục.",
          grace: "Phục hồi ơn nghĩa tử làm con Chúa, tẩy sạch vết nhơ tội lỗi và ban bình an tâm hồn.",
          minister: "Giám mục / Linh mục có quyền giải tội",
          seal: "Lãnh nhận thường xuyên"
        },
        {
          name: "Bí Tích Xức Dầu Bệnh Nhân",
          type: "Chữa Lành & Nâng Đỡ",
          statusBadge: "Khi bệnh nặng / nguy tử",
          colorKey: "teal",
          ribbonColor: "#0d9488",
          icon: AnointingOilIcon,
          scripture: 'Gc 5, 14: "Ai trong anh em đau yếu, hãy mời các kỳ mục Hội Thánh đến để cầu nguyện và xức dầu."',
          short: "Ban ân sủng nâng đỡ, can đảm và bình an cho người tín hữu đang đau bệnh nặng hay tuổi già yếu.",
          sign: "Linh mục đặt tay thinh lặng và xức Dầu Bệnh Nhân (OI) trên trán, tay kèm lời nguyện.",
          grace: "Ban sức mạnh kiên nhẫn, kết hiệp với Cuộc Khổ Nạn của Chúa và tha thứ mọi tội lỗi.",
          minister: "Giám mục / Linh mục cử hành thánh lễ",
          seal: "Lãnh nhận khi cần thiết"
        }
      ]
    },
    {
      groupId: "sacraments-vocation",
      groupTitle: "3. Các Bí Tích Phục Vụ Cộng Đoàn & Ơn Gọi",
      groupSubtitle: "2 Bí Tích · Thánh Hiến Vì Ơn Cứu Độ Của Tha Nhân",
      groupDesc: "Được thánh hiến để phụng sự cộng đoàn Dân Chúa qua tác vụ thánh tông truyền hoặc qua đời sống gia đình Kitô giáo thánh thiện.",
      badge: "Phục Vụ & Ơn Gọi",
      gridType: "grid-2",
      sacraments: [
        {
          name: "Bí Tích Truyền Chức Thánh",
          type: "Tác Vụ Thánh Tông Truyền",
          statusBadge: "Ơn gọi Tông đồ",
          colorKey: "bronze",
          ribbonColor: "#b45309",
          icon: HolyOrdersStoleIcon,
          scripture: '1 Tm 4, 14: "Đừng thờ ơ với đặc sủng Chúa ban qua lời ngôn sứ và việc đặt tay của các kỳ mục."',
          short: "Thánh hiến người phục vụ Dân Chúa qua 3 cấp bậc: Giám mục, Linh mục và Phó tế theo truyền thống Tông đồ.",
          sign: "Đức Giám mục đặt tay thinh lặng và đọc lời nguyện thánh hiến trọng thể trước Dân Chúa.",
          grace: "In ấn tín vĩnh viễn, ban năng quyền nhân danh Đức Kitô Đầu hướng dẫn Dân Thiên Chúa.",
          minister: "Chỉ Đức Giám mục hiệp thông Hội Thánh",
          seal: "Ấn tín vĩnh viễn (1 lần)"
        },
        {
          name: "Bí Tích Hôn Phối",
          type: "Giao Ước Gia Đình",
          statusBadge: "Đời sống Hôn nhân",
          colorKey: "rose",
          ribbonColor: "#e11d48",
          icon: IntertwinedWeddingRingsIcon,
          scripture: 'Mt 19, 6: "Sự gì Thiên Chúa đã phối hợp kết hiệp, loài người không bao giờ được phép phân ly."',
          short: "Giao ước tình yêu thánh thiện, chung thủy và bất khả phân ly giữa người nam và người nữ trước mặt Chúa.",
          sign: "Đôi bạn tự do bày tỏ sự ưng thuận nhận nhau làm vợ chồng và trao nhẫn cưới thánh hiến.",
          grace: "Thánh hóa tình yêu lứa đôi, ban ơn sống trung tín trọn đời và cùng nuôi dạy con cái.",
          minister: "Đôi tân hôn (Linh mục chứng hôn)",
          seal: "Giao ước trọn đời"
        }
      ]
    }
  ];

  // 4 Mốc thời gian Ca 1 Chúa Nhật
  const timelineSteps = [
    {
      time: "06:50",
      label: "Tập trung & Điểm danh",
      sub: "GLV đón tiếp tại dãy phòng P1, P2 & Nhà hầm",
      highlight: false,
      tag: null
    },
    {
      time: "07:00 – 07:45",
      label: "Huấn Giáo Ý Thức Phụng Vụ",
      sub: "Học ý nghĩa các cử hành Phụng vụ, nghi thức Thánh Lễ và thăng tiến ngành",
      highlight: true,
      tag: "Huấn Giáo Đức Tin"
    },
    {
      time: "07:45",
      label: "Tiến vào Thánh Đường",
      sub: "Chuẩn bị phẩm phục Lễ sinh, sách lễ & chỉnh đốn hàng ngũ trang nghiêm",
      highlight: false,
      tag: null
    },
    {
      time: "08:00 – 09:00",
      label: "Thánh Lễ Thiếu Nhi Toàn Đoàn",
      sub: "Trực tiếp phục vụ Bàn Thờ · Ban Lễ sinh, đọc Sách Thánh và giữ trật tự chung",
      highlight: true,
      tag: "Tâm Điểm Phụng Vụ"
    }
  ];

  // 3 Trụ cột Hội Thánh Tại Gia (Bento Family Hub)
  const familyPillars = [
    {
      key: "green",
      title: "Hiệp Dâng Thánh Lễ Ý Thức",
      badge: "Sáng Chúa Nhật",
      desc: "Cùng con đến nhà thờ trước 10 phút, nhắc con tác phong tề chỉnh và cùng ngồi tham dự Thánh Lễ sốt sắng thay vì đứng tản mác ngoài sân.",
      tip: "Giúp con chuẩn bị y phục sạch đẹp, tắt chuông điện thoại và giữ thinh lặng trang nghiêm nơi Nhà Chúa.",
      icon: Church
    },
    {
      key: "purple",
      title: "Đưa Nhịp Phụng Vụ Về Nhà",
      badge: "Mỗi Mùa Phụng Vụ",
      desc: "Cùng con hòa nhịp với Năm Phụng Vụ: thắp nến Vòng Hoa Mùa Vọng, làm hang đá Mùa Giáng Sinh, hãm mình Mùa Chay và vui mừng Mùa Phục Sinh.",
      tip: "Hỏi con hôm nay Cha chủ tế mặc áo màu gì và chia sẻ câu Tin Mừng ngắn trong bữa cơm gia đình.",
      icon: Heart
    },
    {
      key: "orange",
      title: "Khích Lệ Tác Vụ Phục Vụ",
      badge: "Tông Đồ Tuổi 12",
      desc: "Ủng hộ và tạo điều kiện nếu con có nguyện vọng tham gia Ban Lễ Sinh (giúp lễ), đọc Sách Thánh, hát lễ hoặc công tác thiện nguyện của Xứ đoàn.",
      tip: "Phục vụ Bàn Thờ Chúa là vinh dự lớn lao giúp các em rèn luyện tính kỷ luật, khiêm nhường và trách nhiệm.",
      icon: Sparkles
    }
  ];

  // Khối Sanctuary Box (Lời Huấn Quyền & Checklist Mục Vụ)
  const sanctuaryData = {
    eyebrow: "Hội Thánh Tại Gia · Tâm Tình Mục Vụ",
    quote: "Phụng vụ của Giáo hội không kết thúc nơi cửa nhà thờ, nhưng được nối dài bằng đời sống yêu thương và lời kinh tạ ơn trong từng mái ấm gia đình.",
    author: "Tông Huấn Familiaris Consortio",
    checklistTitle: "3 Việc Nhỏ Cha Mẹ Đồng Hành Chúa Nhật",
    checklist: [
      { label: "Đúng giờ", text: "Đưa con đến trước 06:50 để kịp điểm danh hàng ngũ Ca 1." },
      { label: "Trang phục", text: "Áo đồng phục trắng sơ-vin, đeo khăn quàng Da Cam ngay ngắn." },
      { label: "Lắng nghe", text: "Hỏi con về bài học Tin Mừng hôm nay trong bữa cơm trưa." }
    ],
    supportTitle: "Cần trao đổi riêng với GLV?",
    supportDesc: "Ban Giáo lý luôn sẵn sàng lắng nghe mọi hoàn cảnh gia đình.",
    supportBtnText: "Nhắn Tin GLV",
    supportBtnLink: "/liên-hệ"
  };

  // 5 Câu hỏi thường gặp
  const faqs = [
    {
      q: "Tại sao các em đã lãnh nhận Bí tích Thêm Sức vẫn cần tiếp tục học Khối Phụng Vụ?",
      a: "Bí tích Thêm Sức là dấu mốc trưởng thành Kitô giáo, không phải điểm kết thúc việc học giáo lý. Khối Phụng Vụ (Lớp 7) giúp các em chuyển từ việc tham dự thụ động sang hiểu biết tường tận và tích cực phụng sự bàn thờ Chúa qua các cử hành thánh thiêng của Giáo Hội."
    },
    {
      q: "Các em học Khối Phụng Vụ có được tham gia Ban Giúp Lễ (Lễ sinh) của Giáo xứ không?",
      a: "Hoàn toàn được và rất được khuyến khích. Các em nam có nguyện vọng sẽ được các anh Huynh Trưởng và Quý Cha hướng dẫn tập dượt nghi thức lễ sinh để phục vụ các Thánh Lễ Chúa Nhật và ngày thường."
    },
    {
      q: "Thời gian học Ca 1 Chúa Nhật có gì khác biệt so với các khối nhỏ?",
      a: "Khối Phụng Vụ thuộc Ca 1 (Ca Sáng 1 dành cho các khối lớn). Các em học giáo lý từ 07:00 đến 07:45 trước khi tham dự Thánh Lễ Toàn Xứ Đoàn lúc 08:00 đến 09:00. Xin quý phụ huynh đưa các em đến nhà thờ trước 06:50 để kịp giờ tập hợp."
    },
    {
      q: "Ý nghĩa của Khăn Quàng Da Cam Ngành Nhiệt Quang là gì?",
      a: "Khăn Da Cam là màu khăn chính thức của Ngành Nhiệt Quang trong Phong trào Hùng Tâm Dũng Chí. Màu da cam tượng trưng cho ngọn lửa 'Nhiệt tâm' (sốt sắng trong phụng vụ) và ánh sáng 'Quang dũng' (sáng suốt và can đảm làm chứng đức tin giữa đời sống)."
    },
    {
      q: "Giáo trình học của Khối Phụng Vụ gồm những nội dung chính nào?",
      a: "Chương trình dựa trên Hiến chế Phụng Vụ Sacrosanctum Concilium và Giáo lý Hội Thánh Công giáo, tập trung vào: Cấu trúc Thánh Lễ, Mầu nhiệm 7 Bí tích, Chu kỳ Năm Phụng Vụ, Phụng vụ Giờ Kinh và các bài Thánh ca phụng vụ truyền thống."
    }
  ];

  const filteredClasses = selectedGroup === "all"
    ? classes
    : classes.filter((c) => c.id === selectedGroup);

  return (
    <div className="pv-page">
      {/* ══════════════════════════════════════════════════════════════
          SECTION 1: HERO VISUAL-FIRST & DẢI CHỈ SỐ BENTO
      ══════════════════════════════════════════════════════════════ */}
      <section className="pv-hero">
        <div className="pv-shell">
          <div className="pv-hero-grid">
            {/* Cột trái: Văn bản & CTA */}
            <div className="pv-hero-left">
              <div className="pv-hero-pill-badge">
                <Flame size={14} className="pv-hero-pill-icon" />
                <span>Ngành Nhiệt Quang HTDC · Khối Phụng Vụ</span>
              </div>

              <h1 className="pv-hero-title">
                Cử hành đức tin <em>trong Phụng vụ</em>
              </h1>

              <p className="pv-hero-desc">
                Phụng vụ là đỉnh cao mà mọi hoạt động Giáo Hội hướng tới, đồng thời là nguồn mạch tuôn trào mọi sức mạnh (SC 10) — Khối Phụng Vụ giúp các em 12 tuổi hiểu sâu, yêu mến và tích cực tham dự các cử hành thánh thiêng.
              </p>

              {/* 2 Nút bấm chuẩn 52px đồng bộ KhoiRuocLe - Phương án 2: Chữ Than Củi Tương Phản AAA */}
              <div className="pv-hero-actions">
                <a href="#danh-sach-lop" className="pv-btn-primary">
                  <span>Xem 3 Lớp Học</span>
                  <ArrowRight size={18} aria-hidden="true" className="pv-btn-icon" />
                </a>
                <Link to="/tuyển-sinh#dang-ky" className="pv-btn-secondary">
                  <Sparkles size={17} aria-hidden="true" className="pv-btn-icon" />
                  <span>Đăng Ký Khóa Mới</span>
                </Link>
              </div>
            </div>

            {/* Cột phải: Khung ảnh 4:3 & Floating Badge uy tín */}
            <div className="pv-hero-right">
              <div className="pv-hero-image-card">
                <img
                  src="/images/khoiphungvu-anngai.jpg"
                  alt="Thiếu nhi Khối Phụng Vụ Ngành Nhiệt Quang - Xứ đoàn Mẹ Mân Côi Giáo xứ An Ngãi"
                  className="pv-hero-img"
                  loading="eager"
                  fetchPriority="high"
                />
                <div className="pv-floating-badge">
                  <div className="pv-floating-badge-icon">
                    <Church size={20} />
                  </div>
                  <div>
                    <div className="pv-floating-badge-title">
                      100 Thiếu Nhi Ngành Nhiệt Quang
                    </div>
                    <div className="pv-floating-badge-sub">
                      Xứ đoàn Mẹ Mân Côi · Giáo xứ An Ngãi
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Dải tổng quan 4 chỉ số (Overview Bar) Bento Chips */}
          <div className="pv-overview-bar">
            <div className="pv-overview-chip">
              <span className="pv-chip-cat">Độ tuổi</span>
              <span className="pv-chip-value">12 Tuổi</span>
              <span className="pv-chip-label">Lớp 7 · Sinh năm {phungVuBirthYear}</span>
            </div>
            <div className="pv-overview-chip">
              <span className="pv-chip-cat">Quy mô</span>
              <span className="pv-chip-value">3 Lớp Học</span>
              <span className="pv-chip-label">100 Thiếu Nhi Niên Khóa</span>
            </div>
            <div className="pv-overview-chip">
              <span className="pv-chip-cat">Lịch học</span>
              <span className="pv-chip-value">Ca 1 Chúa Nhật</span>
              <span className="pv-chip-label">Học 07:00 · Lễ 08:00</span>
            </div>
            <div className="pv-overview-chip">
              <span className="pv-chip-cat">Nhân sự</span>
              <span className="pv-chip-value">8 GLV</span>
              <span className="pv-chip-label">Huynh Trưởng &amp; Giáo Lý Viên</span>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 2: DANH SÁCH 3 LỚP HỌC THỰC TẾ (ĐỒNG BỘ 100% KHOIRUOCLE)
      ══════════════════════════════════════════════════════════════ */}
      <section id="danh-sach-lop" className="pv-roster-section">
        <div className="pv-shell">
          <div className="pv-section-header">
            <div className="pv-eyebrow">
              <span className="pv-dot" />
              <span>DANH SÁCH LỚP THỰC TẾ NIÊN KHÓA {academicYear}</span>
            </div>
            <h2 className="pv-section-title">
              Các Lớp Khối Phụng Vụ <em>Giáo xứ An Ngãi</em>
            </h2>
            <p className="pv-section-desc">
              Phòng học, thời gian và đội ngũ Huynh trưởng phụ trách 3 lớp học thuộc Ngành Nhiệt Quang.
            </p>
          </div>

          {/* Bộ lọc phân tầng khối học */}
          <div className="pv-stage-filter-bar">
            <button
              type="button"
              className={`pv-filter-pill ${selectedGroup === "all" ? "active" : ""}`}
              onClick={() => setSelectedGroup("all")}
            >
              Tất Cả<span className="hidden sm:inline"> 3 Lớp</span>
            </button>
            <button
              type="button"
              className={`pv-filter-pill ${selectedGroup === "pv-1-1" ? "active" : ""}`}
              onClick={() => setSelectedGroup("pv-1-1")}
            >
              <span className="hidden sm:inline">Lớp </span>Phụng Vụ 1/1<span className="hidden sm:inline"> (Phòng P2)</span>
            </button>
            <button
              type="button"
              className={`pv-filter-pill ${selectedGroup === "pv-1-2" ? "active" : ""}`}
              onClick={() => setSelectedGroup("pv-1-2")}
            >
              <span className="hidden sm:inline">Lớp </span>Phụng Vụ 1/2<span className="hidden sm:inline"> (Phòng P1)</span>
            </button>
            <button
              type="button"
              className={`pv-filter-pill ${selectedGroup === "pv-1-3" ? "active" : ""}`}
              onClick={() => setSelectedGroup("pv-1-3")}
            >
              <span className="hidden sm:inline">Lớp </span>Phụng Vụ 1/3<span className="hidden sm:inline"> (Nhà hầm)</span>
            </button>
          </div>

          {/* NHÓM LỚP: KHỐI PHỤNG VỤ */}
          <div className="pv-group-block">
            <div className="pv-stage-header">
              <div className="pv-stage-title-wrap">
                <span className="pv-stage-num">01</span>
                <div>
                  <h3 className="pv-stage-title">Khối Phụng Vụ</h3>
                  <p className="pv-stage-subtitle">
                    Lớp 7 · Huấn giáo Phụng vụ &amp; Rèn luyện tác phong người Kitô hữu trưởng thành
                  </p>
                </div>
              </div>
              <div className="pv-stage-pills">
                <span className="pv-stage-pill">12 Tuổi</span>
                <span className="pv-stage-pill">Sinh năm {phungVuBirthYear}</span>
                <span className="pv-stage-pill">3 Lớp (P1, P2, Nhà hầm)</span>
              </div>
            </div>

            <div className="pv-class-grid">
              {filteredClasses.map((item) => (
                <div key={item.id} className="pv-class-card card-pv">
                  {/* TẦNG 1: Head - Badge mã lớp & Vị trí phòng */}
                  <div className="pv-bento-card-head">
                    <span className="pv-bento-class-code">
                      {item.name.replace("Lớp Phụng Vụ ", "PV ")}
                    </span>
                    <span className="pv-bento-room-badge">
                      <MapPin size={13} aria-hidden="true" />
                      <span>{getRoomLocation(item.room)}</span>
                    </span>
                  </div>

                  {/* TẦNG 2: Tiêu đề lớp & Dải chỉ số Sĩ số / Độ tuổi */}
                  <div>
                    <h4 className="pv-bento-class-title">{item.name}</h4>
                    <div className="pv-bento-stats-strip">
                      {item.studentsCount && (
                        <span className="pv-bento-stat-chip">
                          <Users size={13} aria-hidden="true" />
                          <span>Sĩ số: <strong>{item.studentsCount} em</strong></span>
                        </span>
                      )}
                      <span className="pv-bento-stat-chip">
                        <Calendar size={13} aria-hidden="true" />
                        <span>Độ tuổi: <strong>{item.ageText} ({item.birthYear})</strong></span>
                      </span>
                    </div>
                  </div>

                  {/* TẦNG 3: Đội ngũ GLV Phụ trách */}
                  <div className="pv-bento-teacher-box">
                    <div className="pv-bento-teacher-label">
                      <ShieldCheck size={13} aria-hidden="true" />
                      <span>GLV Phụ trách ({item.teachers.length})</span>
                    </div>
                    <div className="pv-bento-teacher-pills">
                      {item.teachers.map((t, idx) => (
                        <span key={idx} className="pv-bento-teacher-pill">
                          {formatTeacherName(t)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* TẦNG 4: Trọng tâm huấn giáo phụng vụ */}
                  <div className="pv-bento-focus-box">
                    <div className="pv-bento-focus-badge">{item.levelBadge}</div>
                    <p className="pv-bento-focus-desc">{item.focus}</p>
                  </div>

                  {/* TẦNG 5: Footer - Giờ học & Trạng thái nề nếp */}
                  <div className="pv-bento-card-foot">
                    <span className="pv-bento-time">
                      <Clock size={13} aria-hidden="true" />
                      <span>{item.time} (Ca 1)</span>
                    </span>
                    <span className="pv-bento-status">
                      ● {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 3: LỘ TRÌNH 6 CHẶNG GIÁO LÝ ĐỨC TIN TRỰC QUAN (ĐỒNG BỘ KHOIRUOCLE)
      ══════════════════════════════════════════════════════════════ */}
      <section className="pv-journey-section">
        <div className="pv-shell">
          <div className="pv-section-header">
            <div className="pv-eyebrow">
              <span className="pv-dot" />
              <span>SƯ PHẠM ĐỨC TIN NGÀNH NHIỆT QUANG</span>
            </div>
            <h2 className="pv-section-title">
              Hành Trình Khám Phá &amp; <em>Cử Hành Phụng Vụ</em>
            </h2>
            <p className="pv-section-desc">
              Chương trình huấn giáo 6 chặng chuyển hóa từ hiểu biết các cử hành thánh thiêng đến ý thức hiệp lễ và nhiệt thành phụng sự bàn thờ Chúa.
            </p>
          </div>

          <div className="pv-journey-grid">
            {faithJourneySteps.map((card, idx) => {
              const StepIcon = card.icon;
              const PracticeIcon = card.practiceIcon;
              return (
                <div
                  key={idx}
                  className={`pv-journey-card stage-step-${card.step}`}
                >
                  <div>
                    <div className="pv-journey-card-top">
                      <div className="pv-journey-left-header">
                        <div className="pv-journey-icon-wrap">
                          <StepIcon size={22} aria-hidden="true" />
                        </div>
                        <div>
                          <span className="pv-journey-step-badge">CHẶNG {card.step}</span>
                        </div>
                      </div>
                      <span className="pv-journey-category-pill">{card.badge}</span>
                    </div>

                    <div className="pv-journey-card-body">
                      <div className="pv-journey-sub">{card.sub}</div>
                      <h3 className="pv-journey-title">{card.title}</h3>
                      <p className="pv-journey-meaning">{card.meaning}</p>
                    </div>
                  </div>

                  <div className="pv-journey-practice-box">
                    <div className="pv-practice-header">
                      <PracticeIcon size={14} aria-hidden="true" />
                      <span>{card.practiceLabel}</span>
                    </div>
                    <div className="pv-practice-content">
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
          SECTION 3B: KHO TÀNG NĂM PHỤNG VỤ & BẢY BÍ TÍCH (TABS & BENTO)
      ══════════════════════════════════════════════════════════════ */}
      <section className="pv-liturgical-section">
        <div className="pv-shell">
          <div className="pv-section-header">
            <div className="pv-eyebrow">
              <span className="pv-dot"></span>
              Kho tàng Hội Thánh
            </div>
            <h2 className="pv-section-title">
              Năm Phụng Vụ <em>&amp; Bảy Bí Tích</em>
            </h2>
            <p className="pv-section-desc">
              Khám phá nhịp sống thiêng liêng của Giáo Hội qua các mùa phụng vụ sống động và 7 suối nguồn ân sủng nuôi dưỡng linh hồn Kitô hữu.
            </p>
          </div>

          {/* Tabs chuyển đổi trực quan chuẩn Accessibility & Mobile */}
          <div className="pv-liturgical-tabs-wrapper">
            <div className="pv-liturgical-tabs" role="tablist" aria-label="Kho tàng Hội Thánh">
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "seasons"}
                className={`pv-tab-btn ${activeTab === "seasons" ? "active" : ""}`}
                onClick={() => setActiveTab("seasons")}
              >
                <span aria-hidden="true">📅</span>
                <span>Chu Kỳ Năm Phụng Vụ</span>
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={activeTab === "sacraments"}
                className={`pv-tab-btn ${activeTab === "sacraments" ? "active" : ""}`}
                onClick={() => setActiveTab("sacraments")}
              >
                <span aria-hidden="true">🕊️</span>
                <span>Bảy Bí Tích Cứu Độ</span>
              </button>
            </div>
          </div>

          {/* Tab 1: 3 Chu Kỳ Năm Phụng Vụ (7 Mùa) */}
          {activeTab === "seasons" && (
            <div className="pv-liturgical-content" role="tabpanel" aria-label="Chu Kỳ Năm Phụng Vụ">
              {liturgicalCycles.map((cycle) => (
                <div key={cycle.groupId} className="pv-group-block">
                  <div className="pv-group-header">
                    <div className="pv-group-title-wrap">
                      <div className="pv-group-badge-line">
                        <span className="pv-group-pill">{cycle.badge}</span>
                        <span className="pv-group-subtitle">{cycle.groupSubtitle}</span>
                      </div>
                      <h3 className="pv-group-title">{cycle.groupTitle}</h3>
                    </div>
                    <p className="pv-group-desc">{cycle.groupDesc}</p>
                  </div>

                  <div className={cycle.gridType === "grid-3" ? "pv-cycle-grid-3" : "pv-cycle-grid-2"}>
                    {cycle.seasons.map((season) => {
                      const SeasonIcon = season.icon;
                      return (
                        <div
                          key={season.id}
                          className="pv-season-card"
                          style={{
                            "--season-ribbon": `var(--pv-lit-${season.colorKey})`,
                            "--season-color-text": `var(--pv-lit-${season.colorKey}-text)`
                          }}
                        >
                          <div className="pv-season-card-main">
                            <div className="pv-season-top">
                              <div className="pv-season-icon-wrap">
                                <SeasonIcon className="pv-season-vector-icon" />
                              </div>
                              <span className="pv-season-color-badge">
                                {season.colorBadge}
                              </span>
                            </div>

                            <h4 className="pv-season-name">{season.season}</h4>
                            <div className="pv-season-theme-pill">{season.theme}</div>

                            <p className="pv-season-desc">{season.desc}</p>

                            <div className="pv-season-scripture">
                              <BookOpen className="pv-scripture-icon" size={14} aria-hidden="true" />
                              <span className="pv-scripture-text">{season.scripture}</span>
                            </div>
                          </div>

                          <div className="pv-season-micro-grid">
                            <div className="pv-micro-card pv-micro-sign">
                              <div className="pv-micro-header">
                                <span className="pv-micro-tag">Dấu chỉ &amp; Nghi thức</span>
                                <span className="pv-micro-subtitle">Biểu trưng Phụng vụ</span>
                              </div>
                              <p className="pv-micro-body">{season.sign}</p>
                            </div>

                            <div className="pv-micro-card pv-micro-action">
                              <div className="pv-micro-header">
                                <span className="pv-micro-tag">Thực hành Đức tin</span>
                                <span className="pv-micro-subtitle">Đời sống Thiếu nhi</span>
                              </div>
                              <p className="pv-micro-body">{season.action}</p>
                            </div>
                          </div>

                          <div className="pv-season-footer">
                            <div className="pv-season-footer-item" title="Đỉnh cao cử hành của mùa">
                              <Sparkles className="pv-footer-icon" size={13} aria-hidden="true" />
                              <span className="pv-footer-text">
                                <strong>Đỉnh cao:</strong> {season.culmination}
                              </span>
                            </div>
                            <div className="pv-season-footer-item" title="Quy chuẩn Thánh ca phụng vụ">
                              <Music className="pv-footer-icon" size={13} aria-hidden="true" />
                              <span className="pv-footer-text">
                                <strong>Thánh ca:</strong> {season.musicRule}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Tab 2: 3 Nhóm Bảy Bí Tích Cứu Độ */}
          {activeTab === "sacraments" && (
            <div className="pv-liturgical-content" role="tabpanel" aria-label="Bảy Bí Tích Cứu Độ">
              {sacramentGroups.map((group) => (
                <div key={group.groupId} className="pv-group-block">
                  <div className="pv-group-header">
                    <div className="pv-group-title-wrap">
                      <div className="pv-group-badge-line">
                        <span className="pv-group-pill">{group.badge}</span>
                        <span className="pv-group-subtitle">{group.groupSubtitle}</span>
                      </div>
                      <h3 className="pv-group-title">{group.groupTitle}</h3>
                    </div>
                    <p className="pv-group-desc">{group.groupDesc}</p>
                  </div>

                  <div className={group.gridType === "grid-3" ? "pv-sacrament-grid-3" : "pv-sacrament-grid-2"}>
                    {group.sacraments.map((sacrament, sIdx) => {
                      const SacramentIcon = sacrament.icon;
                      return (
                        <div
                          key={sIdx}
                          className="pv-sacrament-card"
                          style={{
                            "--sacrament-ribbon": `var(--pv-lit-${sacrament.colorKey})`,
                            "--sacrament-color-text": `var(--pv-lit-${sacrament.colorKey}-text)`
                          }}
                        >
                          <div className="pv-sacrament-card-main">
                            <div className="pv-sacrament-top">
                              <div className="pv-sacrament-icon-wrap">
                                <SacramentIcon className="pv-sacrament-vector-icon" />
                              </div>
                              <span className="pv-sacrament-status-badge">
                                {sacrament.statusBadge}
                              </span>
                            </div>

                            <h4 className="pv-sacrament-name">{sacrament.name}</h4>
                            <div className="pv-sacrament-type-tag">{sacrament.type}</div>

                            <p className="pv-sacrament-short">{sacrament.short}</p>

                            <div className="pv-sacrament-scripture">
                              <BookOpen className="pv-scripture-icon" size={14} aria-hidden="true" />
                              <span className="pv-scripture-text">{sacrament.scripture}</span>
                            </div>
                          </div>

                          <div className="pv-sacrament-micro-grid">
                            <div className="pv-micro-card pv-micro-sign">
                              <div className="pv-micro-header">
                                <span className="pv-micro-tag">Dấu chỉ hữu hình</span>
                                <span className="pv-micro-subtitle">Chất thể &amp; Mô thức</span>
                              </div>
                              <p className="pv-micro-body">{sacrament.sign}</p>
                            </div>

                            <div className="pv-micro-card pv-micro-grace">
                              <div className="pv-micro-header">
                                <span className="pv-micro-tag">Ân sủng thiêng liêng</span>
                                <span className="pv-micro-subtitle">Hiệu quả Bí tích</span>
                              </div>
                              <p className="pv-micro-body">{sacrament.grace}</p>
                            </div>
                          </div>

                          <div className="pv-sacrament-footer">
                            <div className="pv-sacrament-footer-item" title="Thừa tác viên cử hành">
                              <User className="pv-footer-icon" size={13} aria-hidden="true" />
                              <span className="pv-footer-text">
                                <strong>Thừa tác:</strong> {sacrament.minister}
                              </span>
                            </div>
                            <div className="pv-sacrament-footer-item" title="Hiệu quả ấn tín thiêng liêng">
                              <ShieldCheck className="pv-footer-icon" size={13} aria-hidden="true" />
                              <span className="pv-footer-text">
                                <strong>Ấn tín:</strong> {sacrament.seal}
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 4: TIMELINE COMPACT 4 BƯỚC NHỊP SỐNG CHÚA NHẬT
      ══════════════════════════════════════════════════════════════ */}
      <section className="pv-timeline-section">
        <div className="pv-shell">
          <div className="pv-section-header">
            <div className="pv-eyebrow">
              <span className="pv-dot" />
              <span>THỜI GIAN BIỂU CHÚA NHẬT (CA 1)</span>
            </div>
            <h2 className="pv-section-title">
              Nhịp Sống <em>Chúa Nhật</em>
            </h2>
            <p className="pv-section-desc">
              Lịch trình sinh hoạt sáng Chúa Nhật hàng tuần dành cho toàn bộ đoàn sinh Khối Phụng Vụ Giáo xứ An Ngãi.
            </p>
          </div>

          {/* Thanh ray ngang tiến trình Stepper (Desktop >= 768px) */}
          <div className="pv-stepper-track" aria-hidden="true">
            <div className="pv-stepper-line" />
            <div className="pv-stepper-nodes">
              {timelineSteps.map((step, idx) => (
                <div key={idx} className={`pv-stepper-col ${step.highlight ? "highlight" : ""}`}>
                  <div className="pv-stepper-node">{idx + 1}</div>
                  <span className="pv-stepper-time">{step.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Lưới thẻ thời gian biểu (Mobile: Trục dọc, Desktop: 4 Cards) */}
          <div className="pv-compact-timeline">
            {timelineSteps.map((step, idx) => (
              <React.Fragment key={idx}>
                <div className={`pv-time-chip ${step.highlight ? "highlight" : ""}`}>
                  <span className="pv-time-node" aria-hidden="true">{idx + 1}</span>
                  <div className="pv-time-card">
                    <div className="pv-time-header">
                      <span className="pv-time-badge">{step.time}</span>
                      {step.tag && (
                        <span className="pv-time-tag">{step.tag}</span>
                      )}
                    </div>
                    <div className="pv-time-content">
                      <span className="pv-time-label">{step.label}</span>
                      <span className="pv-time-sub">{step.sub}</span>
                    </div>
                  </div>
                </div>
                {idx < timelineSteps.length - 1 && (
                  <span className="pv-time-arrow" aria-hidden="true">→</span>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="pv-timeline-footer-note">
            <ShieldCheck size={18} style={{ color: "var(--pv-accent-badge)", flexShrink: 0 }} aria-hidden="true" />
            <span><strong>Lưu ý nề nếp:</strong> Phụ huynh vui lòng nhắc nhở các em đến đúng giờ tại sảnh Nhà Thờ và phòng học để bảo đảm an toàn nề nếp.</span>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          SECTION 5: HỘI THÁNH TẠI GIA & FAQ CẨM NANG PHỤ HUYNH
      ══════════════════════════════════════════════════════════════ */}
      <section id="dong-hanh" className="pv-family-section">
        <div className="pv-shell">
          <div className="pv-section-header">
            <div className="pv-eyebrow">
              <span className="pv-dot" />
              <span>GÓC PHỤ HUYNH &amp; HỘI THÁNH TẠI GIA</span>
            </div>
            <h2 className="pv-section-title">
              Đồng Hành Cùng Con <em>Trong Phụng Vụ</em>
            </h2>
            <p className="pv-section-desc">
              Tuổi 12 là dấu mốc các em bước vào chiều sâu phụng vụ sau Bí tích Thêm Sức. Mái ấm gia đình chính là nơi nuôi dưỡng ngọn lửa sốt mến để con gắn bó bền chặt với Bàn Thờ Chúa.
            </p>
          </div>

          {/* Bento Family Hub (2 Cột: 3 Cột Trụ bên trái + Sanctuary Box bên phải) */}
          <div className="pv-family-bento-grid">
            {/* Cột trái: 3 Trụ cột hành động */}
            <div className="pv-pillars-stack">
              {familyPillars.map((item, idx) => {
                const IconComp = item.icon;
                return (
                  <div
                    key={idx}
                    className={`pv-pillar-card pillar-${item.key || (idx === 0 ? "green" : idx === 1 ? "purple" : "orange")}`}
                  >
                    <div className="pv-pillar-top">
                      <div className="pv-pillar-header-left">
                        <div className="pv-pillar-icon-wrap">
                          <IconComp size={22} />
                        </div>
                        <h4 className="pv-pillar-title">{item.title}</h4>
                      </div>
                      <span className="pv-pillar-badge">{item.badge}</span>
                    </div>
                    <p className="pv-pillar-desc">{item.desc}</p>
                    <div className="pv-pillar-action-tip">
                      <strong>Gợi ý cha mẹ:</strong> {item.tip}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Cột phải: Sanctuary Box (Mái Ấm & Checklist) */}
            <div className="pv-sanctuary-box">
              <div>
                <div className="pv-sanctuary-eyebrow">
                  <Sparkles size={14} aria-hidden="true" />
                  <span>{sanctuaryData.eyebrow}</span>
                </div>

                <div className="pv-sanctuary-quote-card">
                  <div className="pv-sanctuary-quote-header">
                    <Quote size={18} className="pv-sanctuary-quote-icon" aria-hidden="true" />
                    <span className="pv-sanctuary-quote-author">{sanctuaryData.author}</span>
                  </div>
                  <blockquote className="pv-sanctuary-quote-text">
                    {sanctuaryData.quote}
                  </blockquote>
                </div>

                <div className="pv-checklist-section-title">
                  <CheckCircle2 size={16} aria-hidden="true" />
                  <span>{sanctuaryData.checklistTitle}</span>
                </div>

                <ul className="pv-checklist-list">
                  {sanctuaryData.checklist.map((chk, cIdx) => (
                    <li key={cIdx} className="pv-checklist-item">
                      <span className="pv-check-icon">✓</span>
                      <span><strong>{chk.label}:</strong> {chk.text}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pv-support-note-box">
                <div className="pv-support-note-text">
                  <strong>{sanctuaryData.supportTitle}</strong><br />
                  {sanctuaryData.supportDesc}
                </div>
                <Link to={sanctuaryData.supportBtnLink} className="pv-support-note-btn">
                  <span>{sanctuaryData.supportBtnText}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>

          {/* FAQ Accordion Phụ Huynh */}
          <div className="pv-faq-wrapper">
            <div className="pv-faq-header">
              <h3 className="pv-faq-title">
                Giải Đáp Thắc Mắc Phụ Huynh (FAQ)
              </h3>
              <p className="pv-faq-desc">
                Các thông tin cần thiết về chương trình giáo lý sau Thêm Sức, sinh hoạt Ngành Nhiệt Quang và tác vụ lễ sinh.
              </p>
            </div>

            <div className="pv-faq-list">
              {faqs.map((item, idx) => {
                const isOpen = openFaq === idx;
                const faqAnsId = `pv-faq-ans-${idx}`;
                const padIdx = String(idx + 1).padStart(2, "0");
                return (
                  <div key={idx} className={`pv-faq-item ${isOpen ? "active" : ""}`}>
                    <button
                      type="button"
                      className="pv-faq-btn"
                      aria-expanded={isOpen}
                      aria-controls={faqAnsId}
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                    >
                      <div className="pv-faq-question-wrap">
                        <span className="pv-faq-q-badge">{padIdx}</span>
                        <span>{item.q}</span>
                      </div>
                      <ChevronDown
                        size={18}
                        aria-hidden="true"
                        className="pv-faq-chevron"
                      />
                    </button>
                    {isOpen && (
                      <div id={faqAnsId} className="pv-faq-answer">
                        <p>{item.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ══════════════════════════════════════════════════════════════
              SECTION 6: CTA BANNER ĐĂNG KÝ TUYỂN SINH & LIÊN HỆ
          ══════════════════════════════════════════════════════════════ */}
          <div className="pv-cta-banner">
            <div className="pv-cta-glow" aria-hidden="true" />

            <div className="pv-cta-badge">
              <span className="pv-cta-badge-icon" aria-hidden="true">🔥</span>
              <span>NIÊN KHÓA {academicYear} · GIÁO XỨ AN NGÃI</span>
            </div>

            <h3 className="pv-cta-title">
              Cùng Con Hiểu Sâu &amp; Yêu Mến Thánh Lễ
            </h3>

            <p className="pv-cta-desc">
              Tuổi 12 là dấu mốc các em bước vào chiều sâu phụng vụ sau Bí tích Thêm Sức. Xứ đoàn Mẹ Mân Côi kính mời quý phụ huynh đồng hành để các em hiểu sâu ý nghĩa Thánh Lễ, nhiệt tâm phụng sự bàn thờ Chúa và hăng say sống đức tin mỗi ngày.
            </p>

            <div className="pv-cta-actions">
              {/* Nút chính 52px chiếm vị trí nổi bật nhất */}
              <Link to="/tuyển-sinh#dang-ky" className="pv-cta-primary-btn">
                <Sparkles size={18} aria-hidden="true" className="pv-cta-sparkle" />
                <span>Đăng Ký Khối Phụng Vụ</span>
                <ArrowRight size={18} aria-hidden="true" className="pv-cta-arrow" />
              </Link>

              {/* 2 nút phụ hỗ trợ thanh lịch, đối xứng */}
              <div className="pv-cta-secondary-group">
                <Link to="/lịch-học" className="pv-cta-secondary-btn">
                  <Clock size={15} aria-hidden="true" />
                  <span>Xem Lịch Ca 1</span>
                </Link>
                <Link to="/liên-hệ" className="pv-cta-secondary-btn">
                  <Church size={15} aria-hidden="true" />
                  <span>Liên Hệ Ban Giáo Lý</span>
                </Link>
              </div>
            </div>

            <div className="pv-cta-note">
              <span>✦ Ghi danh trực tuyến thuận tiện · Ban Giáo lý sẽ liên hệ xác nhận và sắp xếp phòng học Ca 1.</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}