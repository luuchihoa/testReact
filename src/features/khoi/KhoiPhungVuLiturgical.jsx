import React from "react";
import { BookOpen, Sparkles, Music } from "lucide-react";
import {
  AdventCandleIcon,
  BethlehemStarIcon,
  LentenCrossIcon,
  TriduumChaliceCrossIcon,
  PaschalSunIcon,
  OrdinaryWheatIcon,
  ChristKingCrownIcon
} from "../../components/shared/LiturgicalIcons.jsx";

// 3 Chu Kỳ Năm Phụng Vụ (7 Mùa Phụng Vụ theo trật tự sư phạm Hội Thánh)
const LITURGICAL_CYCLES = [
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

export default function KhoiPhungVuLiturgical({ cycles = LITURGICAL_CYCLES }) {
  return (
    <div className="pv-liturgical-content">
      {cycles.map((cycle) => (
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
                  className={`pv-season-card season-${season.id}`}
                  style={{
                    "--season-ribbon": `var(--pv-lit-${season.colorKey}-ribbon)`,
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
  );
}
