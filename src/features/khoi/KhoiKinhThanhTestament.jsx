import React from "react";
import {
  BookOpen,
  Scroll,
  Cross,
  Clock,
  Globe,
  Sparkles,
  Church,
  Bookmark,
  Compass,
  Sun,
  ExternalLink,
  Eye,
  HelpCircle,
  Check,
  Heart,
  Flame
} from "lucide-react";

export default function KhoiKinhThanhTestament({
  activeTab = "bible",
  onOpenBookModal
}) {
  return (
    <div className="kt-tabpanel-container">
      {/* ── TAB 1: 73 SÁCH KINH THÁNH ── */}
      {activeTab === "bible" && (
        <div id="panel-bible" className="kt-bible-two-col" role="tabpanel" aria-labelledby="kt-tab-bible">
          {/* Cựu Ước */}
          <div className="kt-testament-box kt-testament-old">
            <div>
              <div className="kt-testament-top">
                <div className="kt-testament-icon-wrap" aria-hidden="true">
                  <Scroll size={24} />
                </div>
                <span className="kt-testament-badge">46 QUYỂN SÁCH · CỰU ƯỚC</span>
              </div>

              <h3 className="kt-testament-title">Cựu Ước (Vetus Testamentum)</h3>

              <div className="kt-testament-meta-bar">
                <span className="kt-meta-chip">
                  <Clock size={14} aria-hidden="true" />
                  <span>Thời gian: <strong>Thế kỷ X – I TCN</strong></span>
                </span>
                <span className="kt-meta-chip">
                  <Globe size={14} aria-hidden="true" />
                  <span>Ngôn ngữ: <strong>Hípri &amp; A-ram</strong></span>
                </span>
              </div>

              <p className="kt-testament-desc">
                Giao ước tình yêu giữa Thiên Chúa và dân tuyển chọn Israel, chuẩn bị con đường cứu độ muôn dân và tiên báo về ngày Đấng Mêsia giáng trần.
              </p>

              <div className="kt-testament-groups">
                {/* Ngũ Thư */}
                <div className="kt-bento-group-item kt-bento-ngu-thu">
                  <div className="kt-group-item-head">
                    <span className="kt-group-name">
                      <BookOpen size={14} aria-hidden="true" />
                      <span>Ngũ Thư (Torah)</span>
                    </span>
                    <span className="kt-group-count">5 Quyển</span>
                  </div>
                  <div className="kt-group-chips-wrap">
                    <button type="button" onClick={() => onOpenBookModal?.("st")} className="kt-book-pill">
                      <strong>St</strong> Sáng Thế
                    </button>
                    <button type="button" onClick={() => onOpenBookModal?.("xh")} className="kt-book-pill">
                      <strong>Xh</strong> Xuất Hành
                    </button>
                    <button type="button" onClick={() => onOpenBookModal?.("lv")} className="kt-book-pill">
                      <strong>Lv</strong> Lê-vi
                    </button>
                    <button type="button" onClick={() => onOpenBookModal?.("ds")} className="kt-book-pill">
                      <strong>Ds</strong> Dân Số
                    </button>
                    <button type="button" onClick={() => onOpenBookModal?.("dnl")} className="kt-book-pill">
                      <strong>Đnl</strong> Đệ Nhị Luật
                    </button>
                  </div>
                </div>

                {/* Lịch Sử */}
                <div className="kt-bento-group-item kt-bento-lich-su">
                  <div className="kt-group-item-head">
                    <span className="kt-group-name">
                      <Clock size={14} aria-hidden="true" />
                      <span>Các Sách Lịch Sử</span>
                    </span>
                    <span className="kt-group-count">16 Quyển</span>
                  </div>
                  <div className="kt-group-chips-wrap">
                    <button type="button" onClick={() => onOpenBookModal?.("gs")} className="kt-book-pill"><strong>Gs</strong> Giô-suê</button>
                    <button type="button" onClick={() => onOpenBookModal?.("tl")} className="kt-book-pill"><strong>Tl</strong> Thủ Lãnh</button>
                    <button type="button" onClick={() => onOpenBookModal?.("rt")} className="kt-book-pill"><strong>Rt</strong> Rút</button>
                    <button type="button" onClick={() => onOpenBookModal?.("1sm")} className="kt-book-pill"><strong>1-2Sm</strong> Sa-mu-en</button>
                    <button type="button" onClick={() => onOpenBookModal?.("1v")} className="kt-book-pill"><strong>1-2V</strong> Các Vua</button>
                    <button type="button" onClick={() => onOpenBookModal?.("1sb")} className="kt-book-pill"><strong>1-2Sb</strong> Sử Biên Niên</button>
                    <button type="button" onClick={() => onOpenBookModal?.("er")} className="kt-book-pill"><strong>Er</strong> Ét-ra</button>
                    <button type="button" onClick={() => onOpenBookModal?.("ne")} className="kt-book-pill"><strong>Ne</strong> Nơ-khe-mi-a</button>
                    <button type="button" onClick={() => onOpenBookModal?.("tb")} className="kt-book-pill"><strong>Tb</strong> Tô-bi-a</button>
                    <button type="button" onClick={() => onOpenBookModal?.("gdt")} className="kt-book-pill"><strong>Gđt</strong> Giu-đi-tha</button>
                    <button type="button" onClick={() => onOpenBookModal?.("et")} className="kt-book-pill"><strong>Et</strong> Ét-te</button>
                    <button type="button" onClick={() => onOpenBookModal?.("1mcb")} className="kt-book-pill"><strong>1-2Mcb</strong> Ma-ca-bê</button>
                  </div>
                </div>

                {/* Giáo Huấn & Thánh Vịnh */}
                <div className="kt-bento-group-item kt-bento-giao-huan">
                  <div className="kt-group-item-head">
                    <span className="kt-group-name">
                      <Bookmark size={14} aria-hidden="true" />
                      <span>Giáo Huấn &amp; Thánh Vịnh</span>
                    </span>
                    <span className="kt-group-count">7 Quyển</span>
                  </div>
                  <div className="kt-group-chips-wrap">
                    <button type="button" onClick={() => onOpenBookModal?.("g")} className="kt-book-pill"><strong>G</strong> Gióp</button>
                    <button type="button" onClick={() => onOpenBookModal?.("tv")} className="kt-book-pill"><strong>Tv</strong> 150 Thánh Vịnh</button>
                    <button type="button" onClick={() => onOpenBookModal?.("cn")} className="kt-book-pill"><strong>Cn</strong> Châm Ngôn</button>
                    <button type="button" onClick={() => onOpenBookModal?.("gv")} className="kt-book-pill"><strong>Gv</strong> Giảng Viên</button>
                    <button type="button" onClick={() => onOpenBookModal?.("dc")} className="kt-book-pill"><strong>Dc</strong> Diễm Ca</button>
                    <button type="button" onClick={() => onOpenBookModal?.("kn")} className="kt-book-pill"><strong>Kn</strong> Khôn Ngoan</button>
                    <button type="button" onClick={() => onOpenBookModal?.("hc")} className="kt-book-pill"><strong>Hc</strong> Huấn Ca</button>
                  </div>
                </div>

                {/* Các Ngôn Sứ */}
                <div className="kt-bento-group-item kt-bento-ngon-su">
                  <div className="kt-group-item-head">
                    <span className="kt-group-name">
                      <Compass size={14} aria-hidden="true" />
                      <span>Các Ngôn Sứ (Tiên Tri)</span>
                    </span>
                    <span className="kt-group-count">18 Quyển</span>
                  </div>
                  <div className="kt-group-chips-wrap">
                    <button type="button" onClick={() => onOpenBookModal?.("is")} className="kt-book-pill"><strong>Is</strong> I-sai-a</button>
                    <button type="button" onClick={() => onOpenBookModal?.("gr")} className="kt-book-pill"><strong>Gr</strong> Giê-rê-mi-a</button>
                    <button type="button" onClick={() => onOpenBookModal?.("ac")} className="kt-book-pill"><strong>Ac</strong> Ai Ca</button>
                    <button type="button" onClick={() => onOpenBookModal?.("br")} className="kt-book-pill"><strong>Br</strong> Ba-rúc</button>
                    <button type="button" onClick={() => onOpenBookModal?.("ez")} className="kt-book-pill"><strong>Ez</strong> Ê-dê-ki-en</button>
                    <button type="button" onClick={() => onOpenBookModal?.("dn")} className="kt-book-pill"><strong>Đn</strong> Đa-ni-en</button>
                    <button type="button" onClick={() => onOpenBookModal?.(null, "old")} className="kt-book-pill" title="Hô-sê, Gô-en, A-mốt, Ô-va-đia, Giô-na, Mi-kha, Na-khum, Kha-ba-cúc, Xô-phô-ni-a, Khai-gai, Da-ca-ri-a, Mơ-la-khi">
                      <strong>12</strong> Ngôn Sứ Nhỏ
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="kt-bible-lookup-btn"
              onClick={() => onOpenBookModal?.(null, "old")}
            >
              <BookOpen size={16} aria-hidden="true" />
              <span>Tra Cứu 46 Cuốn Cựu Ước Trực Tuyến</span>
              <ExternalLink size={14} aria-hidden="true" />
            </button>
          </div>

          {/* Tân Ước */}
          <div className="kt-testament-box kt-testament-new">
            <div>
              <div className="kt-testament-top">
                <div className="kt-testament-icon-wrap" aria-hidden="true">
                  <Cross size={24} />
                </div>
                <span className="kt-testament-badge">27 QUYỂN SÁCH · TÂN ƯỚC</span>
              </div>

              <h3 className="kt-testament-title">Tân Ước (Novum Testamentum)</h3>

              <div className="kt-testament-meta-bar">
                <span className="kt-meta-chip">
                  <Clock size={14} aria-hidden="true" />
                  <span>Thời gian: <strong>Khoảng 50 – 100 CN</strong></span>
                </span>
                <span className="kt-meta-chip">
                  <Globe size={14} aria-hidden="true" />
                  <span>Ngôn ngữ: <strong>Hy Lạp (Koiné)</strong></span>
                </span>
              </div>

              <p className="kt-testament-desc">
                Tin Mừng Đức Giêsu Kitô — Ngôi Lời Nhập Thể, Đấng đã chết và sống lại vinh hiển, hiện diện sống động trong Hội Thánh qua mọi thời đại.
              </p>

              <div className="kt-testament-groups">
                {/* Bốn Sách Tin Mừng */}
                <div className="kt-bento-group-item kt-bento-tin-mung">
                  <div className="kt-group-item-head">
                    <span className="kt-group-name">
                      <Sparkles size={14} aria-hidden="true" />
                      <span>Bốn Tin Mừng (Trái Tim Kinh Thánh)</span>
                    </span>
                    <span className="kt-group-count">4 Quyển</span>
                  </div>
                  <div className="kt-group-chips-wrap">
                    <button type="button" onClick={() => onOpenBookModal?.("mt")} className="kt-book-pill"><strong>Mt</strong> Mát-thêu</button>
                    <button type="button" onClick={() => onOpenBookModal?.("mc")} className="kt-book-pill"><strong>Mc</strong> Mác-cô</button>
                    <button type="button" onClick={() => onOpenBookModal?.("lc")} className="kt-book-pill"><strong>Lc</strong> Lu-ca</button>
                    <button type="button" onClick={() => onOpenBookModal?.("ga")} className="kt-book-pill"><strong>Ga</strong> Gio-an</button>
                  </div>
                </div>

                {/* Lịch Sử Giáo Hội Tiên Khởi */}
                <div className="kt-bento-group-item kt-bento-cv">
                  <div className="kt-group-item-head">
                    <span className="kt-group-name">
                      <Church size={14} aria-hidden="true" />
                      <span>Lịch Sử Hội Thánh Tiên Khởi</span>
                    </span>
                    <span className="kt-group-count">1 Quyển</span>
                  </div>
                  <div className="kt-group-chips-wrap">
                    <button type="button" onClick={() => onOpenBookModal?.("cv")} className="kt-book-pill"><strong>Cv</strong> Tông Đồ Công Vụ</button>
                  </div>
                </div>

                {/* Thư Thánh Phaolô */}
                <div className="kt-bento-group-item kt-bento-phaolo">
                  <div className="kt-group-item-head">
                    <span className="kt-group-name">
                      <Bookmark size={14} aria-hidden="true" />
                      <span>Các Thư Thánh Phaolô</span>
                    </span>
                    <span className="kt-group-count">14 Thư</span>
                  </div>
                  <div className="kt-group-chips-wrap">
                    <button type="button" onClick={() => onOpenBookModal?.("rm")} className="kt-book-pill"><strong>Rm</strong> Rô-ma</button>
                    <button type="button" onClick={() => onOpenBookModal?.("1cr")} className="kt-book-pill"><strong>1-2Cr</strong> Cô-rin-tô</button>
                    <button type="button" onClick={() => onOpenBookModal?.("gl")} className="kt-book-pill"><strong>Gl</strong> Ga-lát</button>
                    <button type="button" onClick={() => onOpenBookModal?.("ep")} className="kt-book-pill"><strong>Ep</strong> Ê-phê-sô</button>
                    <button type="button" onClick={() => onOpenBookModal?.("pl")} className="kt-book-pill"><strong>Pl</strong> Phi-líp-phê</button>
                    <button type="button" onClick={() => onOpenBookModal?.("cl")} className="kt-book-pill"><strong>Cl</strong> Cô-lô-sê</button>
                    <button type="button" onClick={() => onOpenBookModal?.("1tx")} className="kt-book-pill"><strong>1-2Tx</strong> Thê-xa-lô-ni-ca</button>
                    <button type="button" onClick={() => onOpenBookModal?.("1tm")} className="kt-book-pill"><strong>1-2Tm</strong> Ti-mô-thê</button>
                    <button type="button" onClick={() => onOpenBookModal?.("tt")} className="kt-book-pill"><strong>Tt</strong> Ti-tô</button>
                    <button type="button" onClick={() => onOpenBookModal?.("pm")} className="kt-book-pill"><strong>Pm</strong> Phi-lê-môn</button>
                    <button type="button" onClick={() => onOpenBookModal?.("dt")} className="kt-book-pill"><strong>Dt</strong> Do Thái</button>
                  </div>
                </div>

                {/* Thư Chung & Khải Huyền */}
                <div className="kt-bento-group-item kt-bento-khai-huyen">
                  <div className="kt-group-item-head">
                    <span className="kt-group-name">
                      <Sun size={14} aria-hidden="true" />
                      <span>Thư Tông Đồ Chung &amp; Khải Huyền</span>
                    </span>
                    <span className="kt-group-count">8 Quyển</span>
                  </div>
                  <div className="kt-group-chips-wrap">
                    <button type="button" onClick={() => onOpenBookModal?.("gc")} className="kt-book-pill"><strong>Gc</strong> Gia-cô-bê</button>
                    <button type="button" onClick={() => onOpenBookModal?.("1pr")} className="kt-book-pill"><strong>1-2Pr</strong> Phê-rô</button>
                    <button type="button" onClick={() => onOpenBookModal?.("1ga")} className="kt-book-pill"><strong>1-2-3Ga</strong> Gio-an</button>
                    <button type="button" onClick={() => onOpenBookModal?.("gd")} className="kt-book-pill"><strong>Gđ</strong> Giu-đa</button>
                    <button type="button" onClick={() => onOpenBookModal?.("kh")} className="kt-book-pill"><strong>Kh</strong> Khải Huyền</button>
                  </div>
                </div>
              </div>
            </div>

            <button
              type="button"
              className="kt-bible-lookup-btn"
              onClick={() => onOpenBookModal?.(null, "new")}
            >
              <BookOpen size={16} aria-hidden="true" />
              <span>Tra Cứu 27 Cuốn Tân Ước Trực Tuyến</span>
              <ExternalLink size={14} aria-hidden="true" />
            </button>
          </div>
        </div>
      )}

      {/* ── TAB 2: 4 BƯỚC CẦU NGUYỆN LECTIO DIVINA ── */}
      {activeTab === "lectio" && (
        <div id="panel-lectio" role="tabpanel" aria-labelledby="kt-tab-lectio">
          <div className="kt-lectio-grid">
            {/* Bước 1: Lectio */}
            <div className="kt-lectio-card kt-lectio-step-1">
              <div>
                <div className="kt-lectio-card-top">
                  <div className="kt-lectio-icon-wrap" aria-hidden="true">
                    <Eye size={22} />
                  </div>
                  <span className="kt-lectio-step-num">BƯỚC 01</span>
                </div>
                <div className="kt-lectio-latin">Lectio · Lắng Nghe Tiếng Chúa</div>
                <h4 className="kt-lectio-title">Đọc Lời Chúa</h4>
                <p className="kt-lectio-desc">
                  Đọc chậm rãi đoạn Kinh Thánh từ 2–3 lần. Lắng đọng tâm hồn, gác lại âu lo để đón nhận từng lời như chính Chúa đang nói riêng với chính bạn.
                </p>
              </div>
              <div>
                <div className="kt-lectio-question-box">
                  <div className="kt-question-tag">
                    <HelpCircle size={12} aria-hidden="true" />
                    <span>Câu Hỏi Soi Sáng</span>
                  </div>
                  <div className="kt-question-text">
                    "Đoạn Lời Chúa này đang nói điều gì với tôi?"
                  </div>
                </div>
                <div className="kt-action-tip">
                  <Check size={14} aria-hidden="true" />
                  <span>Thực hành: Gạch chân 1 câu đánh động tâm hồn nhất.</span>
                </div>
              </div>
            </div>

            {/* Bước 2: Meditatio */}
            <div className="kt-lectio-card kt-lectio-step-2">
              <div>
                <div className="kt-lectio-card-top">
                  <div className="kt-lectio-icon-wrap" aria-hidden="true">
                    <Compass size={22} />
                  </div>
                  <span className="kt-lectio-step-num">BƯỚC 02</span>
                </div>
                <div className="kt-lectio-latin">Meditatio · Ghi Khắc Vào Tim</div>
                <h4 className="kt-lectio-title">Suy Niệm</h4>
                <p className="kt-lectio-desc">
                  Nhai đi nhai lại câu Lời Chúa trong tâm trí. Đặt cuộc sống, áp lực học tập và các mối quan hệ bạn bè của mình vào ánh sáng của Lời Chúa soi chiếu.
                </p>
              </div>
              <div>
                <div className="kt-lectio-question-box">
                  <div className="kt-question-tag">
                    <HelpCircle size={12} aria-hidden="true" />
                    <span>Câu Hỏi Soi Sáng</span>
                  </div>
                  <div className="kt-question-text">
                    "Chúa đang mời gọi tôi thay đổi hay từ bỏ thói xấu nào?"
                  </div>
                </div>
                <div className="kt-action-tip">
                  <Check size={14} aria-hidden="true" />
                  <span>Thực hành: Thinh lặng 3 phút để Lời Chúa thấm vào lòng.</span>
                </div>
              </div>
            </div>

            {/* Bước 3: Oratio */}
            <div className="kt-lectio-card kt-lectio-step-3">
              <div>
                <div className="kt-lectio-card-top">
                  <div className="kt-lectio-icon-wrap" aria-hidden="true">
                    <Heart size={22} />
                  </div>
                  <span className="kt-lectio-step-num">BƯỚC 03</span>
                </div>
                <div className="kt-lectio-latin">Oratio · Tâm Tình Với Cha</div>
                <h4 className="kt-lectio-title">Cầu Nguyện</h4>
                <p className="kt-lectio-desc">
                  Thưa chuyện chân thành với Chúa như một người con nói với Cha. Dâng lên Chúa những niềm vui, nỗi buồn, sự yếu đuối và xin ơn trợ giúp.
                </p>
              </div>
              <div>
                <div className="kt-lectio-question-box">
                  <div className="kt-question-tag">
                    <HelpCircle size={12} aria-hidden="true" />
                    <span>Câu Hỏi Soi Sáng</span>
                  </div>
                  <div className="kt-question-text">
                    "Tôi muốn thưa gì với Chúa sau khi nghe Lời Người?"
                  </div>
                </div>
                <div className="kt-action-tip">
                  <Check size={14} aria-hidden="true" />
                  <span>Thực hành: Viết 1 lời nguyện tự phát ngắn vào sổ tay.</span>
                </div>
              </div>
            </div>

            {/* Bước 4: Contemplatio & Actio */}
            <div className="kt-lectio-card kt-lectio-step-4">
              <div>
                <div className="kt-lectio-card-top">
                  <div className="kt-lectio-icon-wrap" aria-hidden="true">
                    <Flame size={22} />
                  </div>
                  <span className="kt-lectio-step-num">BƯỚC 04</span>
                </div>
                <div className="kt-lectio-latin">Contemplatio · Chiêm Ngắm &amp; Sống</div>
                <h4 className="kt-lectio-title">Chiêm Ngắm &amp; Hành Động</h4>
                <p className="kt-lectio-desc">
                  Nghỉ yên trong tình yêu Chúa và biến ơn soi sáng thành hành động cụ thể: làm hòa với bạn bè, giúp đỡ cha mẹ hay sống thật thà hơn mỗi ngày.
                </p>
              </div>
              <div>
                <div className="kt-lectio-question-box">
                  <div className="kt-question-tag">
                    <HelpCircle size={12} aria-hidden="true" />
                    <span>Câu Hỏi Soi Sáng</span>
                  </div>
                  <div className="kt-question-text">
                    "Tôi sẽ làm việc lành cụ thể nào trong hôm nay?"
                  </div>
                </div>
                <div className="kt-action-tip">
                  <Check size={14} aria-hidden="true" />
                  <span>Thực hành: Chọn 1 việc hy sinh nhỏ để thực hiện ngay.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
