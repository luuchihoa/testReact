import React from "react";
import { Link } from "react-router-dom";
import {
  BookOpen,
  Globe,
  Church,
  Users,
  ArrowRight,
  ExternalLink,
  CheckCircle2
} from "lucide-react";

// 4 Trụ Cột Hành Trang Vào Đời
const VAO_DOI_PILLARS = [
  {
    key: "youcat",
    icon: BookOpen,
    badge: "GIÁO LÝ VẤN ĐÁP · YOUCAT",
    title: "Youcat — Đức Tin Sống Động",
    desc: "Hệ thống hóa giáo lý Hội Thánh qua hình thức vấn đáp gần gũi, giúp người trẻ giải đáp những thắc mắc nền tảng về đức tin, bí tích và đời sống luân lý Kitô giáo.",
    sub: "Giáo lý Hội Thánh cho người trẻ",
    linkText: "Khám phá Youcat Trực Tuyến",
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
    linkText: "Khám phá Docat Trực Tuyến",
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
    linkText: "Nhận Tư Vấn Ơn Gọi",
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
    linkText: "Xem Chuyên Đề Giới Trẻ",
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

export default function KhoiVaoDoiPillars({ onOpenReader, pillars = VAO_DOI_PILLARS }) {
  return (
    <div className="vd-pillars-grid">
      {pillars.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.key} className="vd-pillar-card">
            <div>
              <div className="vd-pillar-top">
                <div className="vd-pillar-icon-wrap" aria-hidden="true">
                  <Icon size={22} />
                </div>
                <span className="vd-pillar-badge">{item.badge}</span>
              </div>

              <h3 className="vd-pillar-title">{item.title}</h3>
              <div className="vd-pillar-sub">{item.sub}</div>
              <p className="vd-pillar-desc">{item.desc}</p>

              <div className="vd-pillar-topics">
                {item.topics.map((topic) => (
                  <div key={topic} className="vd-topic-item">
                    <CheckCircle2 size={14} aria-hidden="true" className="vd-topic-check" />
                    <span>{topic}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="vd-pillar-action-wrap">
              {item.actionType === "reader" && (
                <button
                  type="button"
                  onClick={() => onOpenReader?.(item.docId)}
                  className="vd-pillar-btn"
                >
                  <span>{item.linkText}</span>
                  <BookOpen size={14} aria-hidden="true" />
                </button>
              )}

              {item.actionType === "anchor" && (
                <a href={item.href} className="vd-pillar-btn">
                  <span>{item.linkText}</span>
                  <ArrowRight size={14} aria-hidden="true" />
                </a>
              )}

              {item.actionType === "route" && (
                <Link to={item.to} className="vd-pillar-btn">
                  <span>{item.linkText}</span>
                  <ExternalLink size={14} aria-hidden="true" />
                </Link>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
