import React from "react";
import { BookOpen, User, ShieldCheck } from "lucide-react";
import {
  BaptismalWaterIcon,
  HolySpiritFlameIcon,
  EucharistHostChaliceIcon,
  KingdomKeysIcon,
  AnointingOilIcon,
  HolyOrdersStoleIcon,
  IntertwinedWeddingRingsIcon
} from "../../components/shared/LiturgicalIcons.jsx";

// 3 Nhóm Bảy Bí Tích Cứu Độ (Theo Giáo Lý Hội Thánh Công Giáo)
const SACRAMENT_GROUPS = [
  {
    groupId: "sacraments-initiation",
    groupTitle: "1. Các Bí Tích Khai Tâm Kitô Giáo",
    groupSubtitle: "3 Bí Tích Nền Tảng · Đặt Định Nền Móng Đời Sống Đức Tin",
    groupDesc: "Đặt nền móng cho toàn bộ đời sống Kitô hữu: được sinh ra trong sự sống mới, được củng cố bằng Thần Khí và được nuôi dưỡng bằng Lương Thực Trường Sinh.",
    badge: "Khai Tâm",
    gridType: "grid-3",
    sacraments: [
      {
        id: "rua-toi",
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
        id: "them-suc",
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
        id: "thanh-the",
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
        id: "hoa-giai",
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
        id: "xuc-dau",
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
        id: "truyen-chuc",
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
        id: "hon-phoi",
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

export default function KhoiPhungVuSacraments({ groups = SACRAMENT_GROUPS }) {
  return (
    <div className="pv-liturgical-content">
      {groups.map((group) => (
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
            {group.sacraments.map((sacrament) => {
              const SacramentIcon = sacrament.icon;
              return (
                <div
                  key={sacrament.id}
                  className={`pv-sacrament-card sacrament-${sacrament.id}`}
                  style={{
                    "--sacrament-ribbon": `var(--pv-lit-${sacrament.colorKey}-ribbon)`,
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
  );
}
