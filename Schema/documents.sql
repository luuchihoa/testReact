-- ==============================================================================
-- BẢNG TÀI LIỆU GIÁO LÝ & VĂN KIỆN SỐ HÓA (PUBLIC.DOCUMENTS)
-- Ban Giáo Lý & Huynh Trưởng — Giáo Xứ An Ngãi · Giáo Phận Đà Nẵng
-- ==============================================================================

CREATE TABLE IF NOT EXISTS public.documents (
  id TEXT PRIMARY KEY,                       -- Định danh slug độc nhất (vd: 'youcat-vietnam', 'docat-vietnam')
  title TEXT NOT NULL,                       -- Tiêu đề tài liệu
  khoi TEXT NOT NULL,                        -- Mã khối: 'chien-con', 'ruoc-le', 'them-suc', 'phung-vu', 'kinh-thanh', 'vao-doi', 'all'
  khoi_label TEXT,                           -- Tên khối hiển thị ('Khối Vào Đời', 'Khối Kinh Thánh',...)
  badge TEXT,                                -- Nhãn huy hiệu ('Youcat', 'Docat', 'Khai Tâm',...)
  author TEXT,                               -- Tác giả / Nguồn phát hành
  read_time TEXT,                            -- Thời gian đọc ước tính
  size TEXT,                                 -- Quy mô / kích thước tài liệu
  description TEXT,                          -- Đoạn mô tả vắn tắt
  official_source_url TEXT,                  -- Đường dẫn liên kết nguồn chính thống (HĐGMVN, Vatican,...)
  file_url TEXT,                             -- Đường dẫn file PDF tải về (nếu có)
  chapters JSONB NOT NULL DEFAULT '[]'::jsonb, -- Toàn bộ các chương/mục đã số hóa: [{id, title, content}]
  is_active BOOLEAN NOT NULL DEFAULT true,   -- Trạng thái hiển thị công khai
  sort_order INT DEFAULT 0,                  -- Thứ tự ưu tiên sắp xếp
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Bật Row Level Security (RLS)
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 1. Cho phép đọc công khai (Ai cũng có thể xem tài liệu đang kích hoạt)
DROP POLICY IF EXISTS "Allow public read active documents" ON public.documents;
CREATE POLICY "Allow public read active documents" ON public.documents
  FOR SELECT TO public
  USING (is_active = true);

-- 2. Cho phép người dùng xác thực (authenticated/admin) thêm/sửa
DROP POLICY IF EXISTS "Allow authenticated insert documents" ON public.documents;
CREATE POLICY "Allow authenticated insert documents" ON public.documents
  FOR INSERT TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Allow authenticated update documents" ON public.documents;
CREATE POLICY "Allow authenticated update documents" ON public.documents
  FOR UPDATE TO authenticated
  USING (true);

-- Indexes tối ưu hóa truy vấn
CREATE INDEX IF NOT EXISTS idx_documents_khoi ON public.documents(khoi);
CREATE INDEX IF NOT EXISTS idx_documents_is_active ON public.documents(is_active);
CREATE INDEX IF NOT EXISTS idx_documents_sort ON public.documents(sort_order);

-- ==============================================================================
-- NẠP DỮ LIỆU SỐ HÓA HOÀN CHỈNH (SEED DATA)
-- ==============================================================================

-- Tài liệu: Cẩm Nang Khai Tâm — Em Học Làm Dấu & Cầu Nguyện
INSERT INTO public.documents (
  id,
  title,
  khoi,
  khoi_label,
  badge,
  author,
  read_time,
  size,
  description,
  official_source_url,
  file_url,
  chapters,
  is_active,
  sort_order,
  updated_at
) VALUES (
  'cam-nang-khai-tam-chien-con',
  'Cẩm Nang Khai Tâm — Em Học Làm Dấu & Cầu Nguyện',
  'chien-con',
  'Khối Chiên Con',
  'Chiên Con',
  'Ban Giáo Lý Ấu Nhi — Giáo Xứ An Ngãi',
  '5 phút đọc',
  '4.3 KB',
  'Tài liệu vỡ lòng sinh động, hướng dẫn các em ấu nhi cách bước vào nhà thờ, làm dấu Thánh Giá, chào Chúa Giêsu Thánh Thể và những lời kinh đơn sơ hằng ngày.',
  NULL,
  NULL,
  '[{"id":"buoc-vao-nha-chua","title":"1. Em Bước Vào Ngôi Nhà Của Chúa","content":"\nNhà thờ là ngôi nhà linh thiêng đặc biệt nhất trần gian, vì nơi đây có **Chúa Giêsu Thánh Thể** hằng ngày ngự trị trong Nhà Tạm để chờ đón các em đến thăm và chuyện trò.\n\n### Khi bước vào cổng nhà thờ:\n1. **Lấy nước thánh làm dấu:** Em chấm tay phải vào chén Nước Thánh ở cửa, làm dấu Thánh Giá một cách khoan thai để nhắc nhớ ngày em được Rửa Tội làm con Chúa.\n2. **Chào Chúa Giêsu Thánh Thể:** Nhìn thẳng lên Nhà Tạm (nơi có ngọn đèn chầu màu đỏ luôn thắp sáng), em quỳ chân phải sát đất, cúi đầu tôn kính và thưa thầm: *\"Lạy Chúa Giêsu Thánh Thể, con kính chào Chúa!\"*.\n3. **Giữ yên lặng và trang nghiêm:** Đi nhẹ, nói khẽ, không chạy nhảy hay rượt đuổi; không mang quà bánh, kẹo cao su hay đồ chơi vào trong thánh đường.\n4. **Trang phục sạch đẹp:** Quần áo lịch sự, gọn gàng, đầu tóc chải ngay ngắn để tỏ lòng tôn kính Chúa và tôn trọng mọi người.\n"},{"id":"dau-thanh-gia","title":"2. Em Học Làm Dấu Thánh Giá","content":"\nDấu Thánh Giá là huy hiệu và dấu ấn tình yêu tuyệt vời của người Kitô hữu. Khi làm dấu Thánh Giá, em tuyên xưng mầu nhiệm **Một Chúa Ba Ngôi** và tình yêu Chúa Giêsu đã chịu chết trên Thánh Giá để cứu chuộc em.\n\n### Cách làm Dấu Thánh Giá chuẩn mực:\n- Bàn tay trái đặt phẳng ngay ngắn trên ngực (nơi trái tim).\n- Bàn tay phải mở thẳng, các ngón khép lại:\n  - **Đưa lên trán:** Đọc dõng dạc *\"Nhân danh Cha\"*, xin Chúa soi sáng trí khôn và suy nghĩ của em luôn ngay thật.\n  - **Đưa xuống giữa ngực:** Đọc *\"và Con\"*, xin Chúa ngự vào lòng để em biết yêu mến Chúa và yêu thương mọi người.\n  - **Đưa sang vai trái rồi qua vai phải:** Đọc *\"và Thánh Thần\"*, xin Chúa ban sức mạnh chúc lành cho mọi việc đôi tay em làm.\n  - **Chắp hai tay lại trước ngực:** Đọc *\"Amen!\"*, nghĩa là *\"Con tin thật như vậy!\"*.\n"},{"id":"kinh-nguyen-don-so","title":"3. Những Lời Cầu Nguyện Đơn Sơ Của Bé","content":"\nCầu nguyện đơn giản là trò chuyện thân tình với Chúa Giêsu như một người Cha nhân từ và người Bạn tốt nhất của em.\n\n### Lời nguyện khi thức dậy buổi sáng:\n> \"Lạy Chúa Giêsu, con tạ ơn Chúa đã cho con một đêm ngủ ngon và thức dậy bình an. Hôm nay, con xin dâng cho Chúa mọi lời nói, việc làm và việc học tập của con. Xin giữ gìn con luôn là em bé ngoan. Amen.\"\n\n### Lời nguyện trước và sau bữa ăn:\n> \"Lạy Chúa, xin chúc lành cho thức ăn này chúng con sắp dùng, và xin trả công bội hậu cho ba mẹ đã vất vả nuôi nấng chúng con. Amen.\"\n\n### Lời nguyện trước khi đi ngủ buổi tối:\n> \"Lạy Chúa, một ngày lại trôi qua, con cảm tạ Chúa vì muôn ơn lành. Xin Chúa tha thứ những lỗi lầm hôm nay con trót phạm, và xin sai các Thiên thần gìn giữ giấc ngủ của con và cả gia đình con đêm nay. Amen.\"\n"},{"id":"chua-yeu-tre-nho","title":"4. Chúa Giêsu — Người Bạn Thân Của Em","content":"\nTrong Tin Mừng, Chúa Giêsu đặc biệt yêu quý các em thiếu nhi. Người từng ôm các em vào lòng, đặt tay chúc lành và phán với các môn đệ:\n\n> \"Cứ để trẻ em đến với Thầy, đừng ngăn cấm chúng, vì Nước Thiên Chúa là của những ai giống như chúng.\"  \n> — *Tin Mừng theo Thánh Mác-cô (Mc 10, 14)*\n\n### Em làm gì để trở thành người bạn ngoan của Chúa?\n- **Ở nhà:** Vâng lời ông bà cha mẹ, giúp đỡ việc nhà vừa sức, yêu thương anh chị em.\n- **Ở trường:** Chăm chỉ học bài, thật thà trong kiểm tra, không nói tục chửi thề, biết chia sẻ đồ dùng với bạn.\n- **Ở nhà thờ:** Siêng năng đi lễ Chúa Nhật, chăm chú lắng nghe Lời Chúa và hăng hái tham gia giờ học giáo lý.\n"}]'::jsonb,
  true,
  10,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  khoi = EXCLUDED.khoi,
  khoi_label = EXCLUDED.khoi_label,
  badge = EXCLUDED.badge,
  author = EXCLUDED.author,
  read_time = EXCLUDED.read_time,
  size = EXCLUDED.size,
  description = EXCLUDED.description,
  official_source_url = EXCLUDED.official_source_url,
  chapters = EXCLUDED.chapters,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Tài liệu: Cẩm Nang Xét Mình & Dọn Lòng Rước Lễ Sốt Sắng
INSERT INTO public.documents (
  id,
  title,
  khoi,
  khoi_label,
  badge,
  author,
  read_time,
  size,
  description,
  official_source_url,
  file_url,
  chapters,
  is_active,
  sort_order,
  updated_at
) VALUES (
  'cam-nang-xet-minh-ruoc-le',
  'Cẩm Nang Xét Mình & Dọn Lòng Rước Lễ Sốt Sắng',
  'ruoc-le',
  'Khối Rước Lễ',
  'Rước Lễ',
  'Ban Giáo Lý Thiếu Nhi — Giáo Xứ An Ngãi',
  '6 phút đọc',
  '4.2 KB',
  'Hướng dẫn các em thiếu nhi 5 bước xưng tội nên, bản xét mình chi tiết theo 10 Điều Răn và tâm tình sốt mến khi rước Mình Thánh Chúa.',
  NULL,
  NULL,
  '[{"id":"5-buoc","title":"1. Năm Bước Để Xưng Tội Nên","content":"\nBí tích Giải Tội (Giao Hòa) là dòng suối Lòng Thương Xót tuôn đổ ơn tha thứ của Chúa. Để việc lãnh nhận Bí tích được trọn vẹn, em hãy thực hiện đủ 5 bước sau:\n\n1. **Xét mình:** Nhớ lại những tội lỗi đã phạm từ lần xưng tội trước qua tư tưởng, lời nói, việc làm và những điều thiếu sót.\n2. **Ăn năn tội:** Đau đớn trong lòng vì đã làm mất lòng Chúa là Đấng vô cùng nhân từ và trọn tốt trọn lành.\n3. **Dốc lòng chừa:** Quyết tâm thật lòng từ nay xa lánh dịp tội và không tái phạm.\n4. **Xưng tội cùng Linh mục:** Thú nhận thành thật, rõ ràng và đầy đủ các tội trọng trước mặt Cha giải tội (với thái độ khiêm nhường).\n5. **Làm việc đền tội:** Mau mắn hoàn thành việc kinh nguyện hoặc việc bác ái mà Cha giải tội đã chỉ định.\n"},{"id":"xet-minh-10-dieu-ran","title":"2. Bản Xét Mình Chi Tiết Dành Cho Thiếu Nhi","content":"\n### Đối với Chúa:\n- Tôi có bỏ lễ Chúa Nhật hoặc lễ trọng mà không có lý do chính đáng không?\n- Trong thánh lễ, tôi có chia trí, nói chuyện riêng, cười đùa hay bấm điện thoại không?\n- Tôi có lười biếng đọc kinh sáng, tối hay trước bữa ăn không?\n- Tôi có kêu tên Chúa vô cớ, nói lời phạm thượng hay tin vào bói toán, mê tín không?\n\n### Đối với Cha Mẹ & Thầy Cô:\n- Tôi có cãi lời, vô lễ, cau có hay làm buồn lòng ông bà cha mẹ không?\n- Tôi có lười biếng làm việc nhà giúp đỡ ba mẹ không?\n- Ở trường, tôi có thiếu tôn trọng thầy cô, nói leo hay không chú ý nghe giảng không?\n\n### Đối với Tha Nhân & Bản Thân:\n- Tôi có đánh nhau, chửi thề, nói tục hay bắt nạt bạn bè không?\n- Tôi có nói dối, vu oan giáng họa hay đổ lỗi cho người khác không?\n- Tôi có gian lận thi cử, quay cóp bài tập của bạn không?\n- Tôi có lấy trộm tiền bạc, đồ dùng của ai mà chưa trả lại không?\n- Tôi có xem những hình ảnh xấu, bậy bạ trên mạng internet không?\n- Tôi có ghen tị khi thấy bạn giỏi hơn hay có đồ chơi đẹp hơn tôi không?\n"},{"id":"ruoc-le-sot-sang","title":"3. Tâm Tình Khi Rước Mình Thánh Chúa","content":"\nChúa Giêsu Thánh Thể chính là Thần Lương nuôi sống linh hồn. Khi lên rước lễ, em đang đón rước chính Chúa Cả Trời Đất vào lòng mình.\n\n### Chuẩn bị trước khi rước lễ:\n- **Giữ chay Thánh Thể:** Không ăn uống bất cứ thứ gì (trừ nước lọc và thuốc men) ít nhất 1 giờ trước khi rước lễ.\n- **Sạch tội trọng:** Nếu mắc tội trọng, phải xưng tội trước khi lên rước lễ.\n- **Tâm thế trang nghiêm:** Xếp hàng ngay ngắn, chắp tay trước ngực, mắt hướng về Bàn Thờ với lòng yêu mến thiết tha.\n\n### Khi đón nhận Mình Thánh:\n- Khi Linh mục/Thừa tác viên nâng Mình Thánh lên và nói: *\"Mình Thánh Chúa Kitô\"*, em thưa rõ ràng: *\"Amen!\"*.\n- **Rước bằng tay:** Đặt lòng bàn tay trái ngửa lên trên bàn tay phải thành hình chiếc ngai đón rước Chúa. Sau khi rước, lập tức dùng tay phải kiễng Mình Thánh vào miệng trước mặt Thừa tác viên, kiểm tra xem có mẩu vụn nào rơi trên tay không.\n- **Rước bằng miệng:** Há miệng vừa đủ, đưa đầu lưỡi ra nhẹ nhàng để Thừa tác viên đặt Mình Thánh lên lưỡi.\n\n### Tạ ơn sau khi rước lễ:\nTrở về chỗ, quỳ gối sốt sắng, nhắm mắt lại và trò chuyện thân mật với Chúa Giêsu:\n> \"Lạy Chúa Giêsu Thánh Thể, con tạ ơn Chúa đã ngự vào lòng con. Xin biến đổi trái tim con nên giống trái tim Chúa: biết vâng lời, biết yêu thương và biết tha thứ cho mọi người xung quanh. Amen.\"\n"}]'::jsonb,
  true,
  20,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  khoi = EXCLUDED.khoi,
  khoi_label = EXCLUDED.khoi_label,
  badge = EXCLUDED.badge,
  author = EXCLUDED.author,
  read_time = EXCLUDED.read_time,
  size = EXCLUDED.size,
  description = EXCLUDED.description,
  official_source_url = EXCLUDED.official_source_url,
  chapters = EXCLUDED.chapters,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Tài liệu: 7 Ơn Chúa Thánh Thần & 12 Hoa Trái Thần Khí
INSERT INTO public.documents (
  id,
  title,
  khoi,
  khoi_label,
  badge,
  author,
  read_time,
  size,
  description,
  official_source_url,
  file_url,
  chapters,
  is_active,
  sort_order,
  updated_at
) VALUES (
  '7-on-chua-thanh-than',
  '7 Ơn Chúa Thánh Thần & 12 Hoa Trái Thần Khí',
  'them-suc',
  'Khối Thêm Sức',
  'Thêm Sức',
  'Ban Giáo Lý Nghĩa Sĩ — Giáo Xứ An Ngãi',
  '7 phút đọc',
  '5.9 KB',
  'Ý nghĩa thần học, dấu chỉ và hướng dẫn cụ thể cách sống 7 Ơn Cả Chúa Thánh Thần cùng 12 Hoa Trái Thần Khí dành cho người trẻ sắp lãnh nhận Bí tích Thêm Sức.',
  NULL,
  NULL,
  '[{"id":"7-on-chua-thanh-than","title":"1. Bảy Ơn Chúa Thánh Thần (Is 11, 2-3)","content":"\nChúa Thánh Thần là Đấng Ban Sự Sống, là nguồn sức mạnh biến đổi các Tông đồ nhút nhát thành những chứng nhân anh dũng. Bảy ơn thiêng của Ngài gồm:\n\n1. **Ơn Khôn Ngoan (*Sapientia*):** Giúp ta nếm cảm sự ngọt ngào của Thiên Chúa, biết nhìn vạn vật dưới ánh sáng vĩnh cửu của Người và nhận ra giá trị đích thực của cuộc sống.\n2. **Ơn Hiểu Biết (*Intellectus*):** Soi sáng trí khôn giúp ta thấu hiểu sâu xa những mầu nhiệm đức tin mà trí tuệ loài người tự nhiên không thể lãnh hội được.\n3. **Ơn Lo Liệu (*Consilium*):** Hướng dẫn ta biết phân định đâu là ý Chúa trong những tình huống khó khăn, chọn lựa điều lành và đưa ra lời khuyên khôn ngoan cho người khác.\n4. **Ơn Sức Mạnh (*Fortitudo*):** Ban sự can đảm vượt qua sợ hãi, cám dỗ, đứng vững trước dư luận xấu và trung thành làm chứng cho Chúa dù phải chịu thiệt thòi.\n5. **Ơn Thông Minh (*Scientia*):** Giúp ta nhận biết trật tự và vẻ đẹp của thế giới tạo thành, biết sử dụng của cải trần gian để tôn vinh Thiên Chúa chứ không bị lệ thuộc vào chúng.\n6. **Ơn Đạo Đức (*Pietas*):** Gieo vào lòng ta tâm tình hiếu thảo mến yêu Cha trên trời, và thúc đẩy ta đối xử với tha nhân bằng tình huynh đệ chân thành.\n7. **Ơn Kính Sợ Chúa (*Timor Domini*):** Không phải là nỗi sợ hãi trừng phạt, mà là lòng kính trọng sâu xa trước Đấng Toàn Năng, sợ làm tổn thương mối tình nghĩa cao quý với Thiên Chúa.\n"},{"id":"12-hoa-trai-than-khi","title":"2. Mười Hai Hoa Trái Của Chúa Thánh Thần (Gl 5, 22-23)","content":"\nKhi một tâm hồn mở rộng đón nhận và để Chúa Thánh Thần hướng dẫn, đời sống người đó sẽ trổ sinh những hoa trái ngọt ngào sau đây:\n\n1. **Bác ái (*Caritas*):** Tình yêu vô điều kiện noi gương Đức Kitô.\n2. **Hoan lạc (*Gaudium*):** Niềm vui sâu thẳm trong tâm hồn ngay cả giữa thử thách.\n3. **Bình an (*Pax*):** Sự thanh thản nội tâm vì biết mình thuộc trọn về Chúa.\n4. **Nhẫn nhục (*Patientia*):** Kiên tâm chịu đựng những nghịch cảnh và tha nhân.\n5. **Nhân từ (*Benignitas*):** Thái độ dịu dàng, quan tâm và sẵn sàng giúp đỡ.\n6. **Từ tâm (*Bonitas*):** Lòng quảng đại làm điều thiện lành cho mọi người.\n7. **Khoan dung (*Longanimitas*):** Lòng vị tha, không cố chấp trước lỗi lầm của người khác.\n8. **Hiền hòa (*Mansuetudo*):** Ôn tồn, không nóng nảy, không dùng bạo lực.\n9. **Trung tín (*Fides*):** Đáng tin cậy, giữ đúng lời hứa và trung thành với đức tin.\n10. **Khiêm nhu (*Modestia*):** Giản dị, đúng mực trong lời ăn tiếng nói và trang phục.\n11. **Tiết độ (*Continentia*):** Tiết chế các ham muốn, làm chủ bản thân trước cám dỗ.\n12. **Khiết tịnh (*Castitas*):** Giữ gìn thân xác và tâm hồn thanh sạch, thánh thiện.\n"}]'::jsonb,
  true,
  30,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  khoi = EXCLUDED.khoi,
  khoi_label = EXCLUDED.khoi_label,
  badge = EXCLUDED.badge,
  author = EXCLUDED.author,
  read_time = EXCLUDED.read_time,
  size = EXCLUDED.size,
  description = EXCLUDED.description,
  official_source_url = EXCLUDED.official_source_url,
  chapters = EXCLUDED.chapters,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Tài liệu: Sổ Tay Lễ Sinh & Thừa Tác Vụ Bàn Thờ
INSERT INTO public.documents (
  id,
  title,
  khoi,
  khoi_label,
  badge,
  author,
  read_time,
  size,
  description,
  official_source_url,
  file_url,
  chapters,
  is_active,
  sort_order,
  updated_at
) VALUES (
  'so-tay-le-sinh',
  'Sổ Tay Lễ Sinh & Thừa Tác Vụ Bàn Thờ',
  'phung-vu',
  'Khối Phụng Vụ',
  'Phụng Vụ',
  'Ban Phụng Vụ Thánh — Giáo Xứ An Ngãi',
  '8 phút đọc',
  '3.0 KB',
  'Quy chuẩn tác phong, nghi thức giúp lễ, phân công nhiệm vụ và thứ tự rước kiệu trong Thánh Lễ tại Bàn Thờ Giáo xứ An Ngãi.',
  NULL,
  NULL,
  '[{"id":"tac-phong-le-sinh","title":"1. Tác Phong & Nhân Cách Người Giúp Lễ","content":"\nĐược phục vụ quanh Bàn Thờ Chúa là một vinh dự thiêng liêng đặc biệt. Người lễ sinh đại diện cho cộng đoàn để cận kề bên Chúa Giêsu Thượng Tế.\n\n### Quy chuẩn tác phong:\n- **Thời gian:** Có mặt tại phòng thánh ít nhất 15 phút trước giờ lễ để mặc áo giúp lễ, cầu nguyện chuẩn bị và phụ giúp chuẩn bị bàn thờ.\n- **Trang phục:** Áo giúp lễ sạch sẽ, cài nút cẩn thận; đi giày hoặc dép có quai hậu lịch sự; tóc tai cắt tỉa gọn gàng.\n- **Cử chỉ:** Đi đứng khoan thai, không chạy nhảy hay hấp tấp; hai tay chắp trước ngực ngang tầm tim khi đứng hoặc đi; mắt nhìn thẳng trang nghiêm.\n- **Cúi mình:** Cúi sâu trước Bàn Thờ khi đi ngang qua (Bàn Thờ tượng trưng cho chính Đức Kitô). Quỳ gối tôn thờ trước Nhà Tạm.\n"},{"id":"nhiem-vu-trong-thanh-le","title":"2. Phân Công & Nhiệm Vụ Trong Thánh Lễ","content":"\n### 1. Đoàn rước nhập lễ:\n- Đi đầu: Lễ sinh mang bình hương (nếu có xông hương).\n- Tiếp theo: Lễ sinh cầm Thánh Giá nến cao (đi giữa hai ngọn nến sáng).\n- Lễ sinh thừa tác viên khác đi theo hàng đôi.\n- Đi cuối: Linh mục chủ tế.\n\n### 2. Phụng vụ Lời Chúa:\n- Đứng nghiêm trang nghe bài đọc 1, đáp ca và bài đọc 2.\n- Khi xướng Alleluia: Hai lễ sinh cầm nến đến đứng hai bên giảng đài để cung nghinh Lời Chúa trong Tin Mừng.\n\n### 3. Phụng vụ Thánh Thể:\n- **Dọn bàn thờ:** Đem khăn thánh, khăn lau chén, chén thánh và sách lễ đặt cẩn thận lên bàn thờ theo hiệu lệnh của Cha chủ tế.\n- **Rửa tay:** Lễ sinh nâng bình nước và khay đựng nước, một em cầm khăn lau tay đưa cho Linh mục. Cúi chào Cha trước và sau khi thực hiện.\n- **Chuông Thánh Thể:** Rung chuông một hồi dài khi Linh mục đặt tay trên của lễ (xin ơn Thánh Thần biến đổi). Rung 3 hồi chuông khi Linh mục nâng Mình Thánh và nâng Chén Máu Thánh lên cao.\n"}]'::jsonb,
  true,
  40,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  khoi = EXCLUDED.khoi,
  khoi_label = EXCLUDED.khoi_label,
  badge = EXCLUDED.badge,
  author = EXCLUDED.author,
  read_time = EXCLUDED.read_time,
  size = EXCLUDED.size,
  description = EXCLUDED.description,
  official_source_url = EXCLUDED.official_source_url,
  chapters = EXCLUDED.chapters,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Tài liệu: Năm Phụng Vụ — Lịch Công Giáo & Các Mùa Thánh
INSERT INTO public.documents (
  id,
  title,
  khoi,
  khoi_label,
  badge,
  author,
  read_time,
  size,
  description,
  official_source_url,
  file_url,
  chapters,
  is_active,
  sort_order,
  updated_at
) VALUES (
  'nam-phung-vu',
  'Năm Phụng Vụ — Lịch Công Giáo & Các Mùa Thánh',
  'phung-vu',
  'Khối Phụng Vụ',
  'Phụng Vụ',
  'Ủy Ban Phụng Tự — HĐGMVN',
  '7 phút đọc',
  '4.7 KB',
  'Tổng hợp chu kỳ Năm Phụng Vụ, ý nghĩa các mùa thánh, bảng màu phẩm phục phụng vụ và danh mục các Đại Lễ Trọng trong năm.',
  NULL,
  NULL,
  '[{"id":"cac-mua-thanh","title":"1. Chu Kỳ Các Mùa Trong Năm Phụng Vụ","content":"\nNăm Phụng Vụ khởi đầu từ **Chúa Nhật I Mùa Vọng** (khoảng cuối tháng 11 hoặc đầu tháng 12) và kết thúc bằng **Đại Lễ Chúa Kitô Vua Vũ Trụ**. Năm Phụng Vụ gồm 5 mùa chính:\n\n1. **Mùa Vọng (4 tuần):** Mùa trông đợi, chuẩn bị tâm hồn đón mừng kỷ niệm Con Thiên Chúa giáng sinh và mong chờ Chúa lại đến trong vinh quang.\n2. **Mùa Giáng Sinh:** Bắt đầu từ Lễ Giáng Sinh (25/12) đến Lễ Chúa Giêsu Chịu Phép Rửa. Mừng mầu nhiệm Con Thiên Chúa Nhập Thể ở cùng nhân loại.\n3. **Mùa Chay (40 ngày):** Khởi đầu từ Thứ Tư Lễ Tro đến hết Thứ Bảy Tuần Thánh. Mùa hoán cải, ăn chay, cầu nguyện và làm việc bác ái để cùng Chúa bước vào mầu nhiệm Thập Giá.\n4. **Mùa Phục Sinh (50 ngày):** Từ Đêm Vọng Phục Sinh đến Đại Lễ Chúa Thánh Thần Hiện Xuống. Mùa hoan hỷ mừng Chúa Kitô khải hoàn chiến thắng tử thần.\n5. **Mùa Thường Niên (33 hoặc 34 tuần):** Chia làm 2 giai đoạn (giữa Giáng Sinh - Mùa Chay, và sau Lễ Hiện Xuống). Thời gian sống và làm chứng cho Tin Mừng giữa cuộc sống đời thường.\n"},{"id":"mau-pham-phuc","title":"2. Ý Nghĩa Các Màu Phẩm Phục Phụng Vụ","content":"\n- **Màu Trắng / Vàng:** Tượng trưng cho ánh sáng, sự thanh sạch, niềm vui phục sinh và vinh quang. Dùng trong Mùa Giáng Sinh, Mùa Phục Sinh, các lễ về Chúa Giêsu (không mang tính thương khó), Đức Mẹ và các Thánh không tử đạo.\n- **Màu Đỏ:** Tượng trưng cho tình yêu hiến tế, máu tử đạo và ngọn lửa Chúa Thánh Thần. Dùng trong Lễ Chúa Nhật Lễ Lá, Thứ Sáu Tuần Thánh, Lễ Hiện Xuống và các Thánh Tử Đạo.\n- **Màu Tím:** Tượng trưng cho sự ăn năn, sám hối, chờ đợi và cầu nguyện. Dùng trong Mùa Vọng, Mùa Chay và các lễ Cầu Hồn.\n- **Màu Xanh Lá:** Tượng trưng cho sự sống, niềm hy vọng và sự tăng trưởng đức tin. Dùng trong Mùa Thường Niên.\n- **Màu Hồng:** Tượng trưng cho niềm vui dịu dàng le lói giữa mùa sám hối. Dùng trong Chúa Nhật III Mùa Vọng (*Gaudete*) và Chúa Nhật IV Mùa Chay (*Laetare*).\n"}]'::jsonb,
  true,
  50,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  khoi = EXCLUDED.khoi,
  khoi_label = EXCLUDED.khoi_label,
  badge = EXCLUDED.badge,
  author = EXCLUDED.author,
  read_time = EXCLUDED.read_time,
  size = EXCLUDED.size,
  description = EXCLUDED.description,
  official_source_url = EXCLUDED.official_source_url,
  chapters = EXCLUDED.chapters,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Tài liệu: Phương Pháp Cầu Nguyện Với Lời Chúa (Lectio Divina)
INSERT INTO public.documents (
  id,
  title,
  khoi,
  khoi_label,
  badge,
  author,
  read_time,
  size,
  description,
  official_source_url,
  file_url,
  chapters,
  is_active,
  sort_order,
  updated_at
) VALUES (
  'phuong-phap-lectio-divina',
  'Phương Pháp Cầu Nguyện Với Lời Chúa (Lectio Divina)',
  'kinh-thanh',
  'Khối Kinh Thánh',
  'Kinh Thánh',
  'Ban Huấn Giáo — Tỉnh Dòng Biển Đức & GP Đà Nẵng',
  '6 phút đọc',
  '2.8 KB',
  'Cẩm nang 5 bước cầu nguyện truyền thống đan tu: Đọc, Suy niệm, Cầu nguyện, Chiêm niệm và Hành động, giúp biến Lời Chúa thành kim chỉ nam đời sống.',
  NULL,
  NULL,
  '[{"id":"y-nghia-lectio","title":"1. Nguồn Gốc & Ý Nghĩa Của Lectio Divina","content":"\nLectio Divina (Đọc Kinh Thánh trong tinh thần cầu nguyện) là phương pháp đọc và tiếp xúc Lời Chúa cổ kính từ các Giáo Phụ và các Đan sĩ Dòng Biển Đức từ thế kỷ thứ VI.\n\nĐây không phải là việc nghiên cứu Kinh Thánh thuần túy về mặt học thuật hay ngữ pháp, mà là cuộc gặp gỡ thân tình và sống động với chính Đấng đang phán truyền qua từng trang Sách Thánh.\n"},{"id":"5-buoc-thuc-hanh","title":"2. Năm Bước Thực Hành Cụ Thể Mỗi Ngày","content":"\n### 1. Đọc (Lectio):\nLắng đọng tâm hồn, làm dấu Thánh Giá và xin ơn Chúa Thánh Thần. Đọc chậm rãi, to nhỏ tùy ý, từng câu từng chữ của đoạn Tin Mừng ngày hôm đó từ 2 đến 3 lần. Đọc như thể Lời này đang được viết ra riêng cho chính bạn lúc này.\n\n### 2. Suy niệm (Meditatio):\nDừng lại ở từ ngữ, hình ảnh hoặc câu nói đánh động bạn nhất. Đừng vội vàng lướt qua. Hãy nhai đi nhai lại Lời ấy trong tâm trí: *\"Chúa muốn nói gì với hoàn cảnh hiện tại của con qua lời này?\"*.\n\n### 3. Cầu nguyện (Oratio):\nBiến những suy nghĩ thành lời thưa chuyện chân thành cùng Chúa. Có thể là lời cảm tạ, lời xin ơn trợ giúp vượt qua cám dỗ, hay lời ăn năn thống hối vì đã sống nghịch lại Lời Chúa.\n\n### 4. Chiêm niệm (Contemplatio):\nTạm ngưng mọi suy nghĩ và lý luận. Hãy để lòng mình hoàn toàn thinh lặng trong tình yêu của Thiên Chúa, ngắm nhìn Chúa và cảm nhận Chúa đang trìu mến nhìn mình.\n\n### 5. Hành động (Actio):\nLời Chúa là ngọn đèn soi cho con bước (Tv 119, 105). Hãy chọn cho mình **MỘT quyết tâm rất cụ thể** trong ngày: tha thứ cho một người bạn, làm lành với người thân, giúp đỡ việc nhà hay kiềm chế một lời nói tiêu cực.\n"}]'::jsonb,
  true,
  60,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  khoi = EXCLUDED.khoi,
  khoi_label = EXCLUDED.khoi_label,
  badge = EXCLUDED.badge,
  author = EXCLUDED.author,
  read_time = EXCLUDED.read_time,
  size = EXCLUDED.size,
  description = EXCLUDED.description,
  official_source_url = EXCLUDED.official_source_url,
  chapters = EXCLUDED.chapters,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Tài liệu: Youcat — Giáo Lý Hội Thánh Dành Cho Người Trẻ
INSERT INTO public.documents (
  id,
  title,
  khoi,
  khoi_label,
  badge,
  author,
  read_time,
  size,
  description,
  official_source_url,
  file_url,
  chapters,
  is_active,
  sort_order,
  updated_at
) VALUES (
  'youcat-vietnam',
  'Youcat — Giáo Lý Hội Thánh Dành Cho Người Trẻ',
  'vao-doi',
  'Khối Vào Đời',
  'Youcat',
  'Ủy Ban Giáo Lý Đức Tin — HĐGMVN · Youcat Foundation (Lời tựa: ĐTC Biển Đức XVI)',
  '25 phút đọc trọn bộ',
  '527 Câu Hỏi (8 Chương Giáo Trình)',
  'Ấn bản Giáo lý Hội Thánh Công giáo dành cho bạn trẻ: Hệ thống hóa các câu hỏi sống còn về đức tin, bí tích, đời sống luân lý và cầu nguyện qua 8 chương giáo trình toàn diện.',
  'https://hdgmvietnam.com',
  NULL,
  '[{"id":"youcat-chuong-1-khat-vong","title":"1. Lời Tựa ĐTC Biển Đức XVI & Khát Vọng Đức Tin (Câu 1 - 24)","content":"### Lời Tựa Của Đức Thánh Cha Biển Đức XVI Gửi Người Trẻ Thế Giới\n\n> *\"Các con thân mến, hôm nay Cha trao cho các con cuốn sách Youcat... Cha mời gọi các con: Hãy nghiên cứu giáo lý! Đó là ước nguyện tha thiết của con tim Cha. Các con hãy đọc giáo lý này trong sự tĩnh lặng của căn phòng mình; hãy cùng đọc với nhau từng đôi một; hãy lập các nhóm và mạng lưới học hỏi giáo lý, trao đổi với nhau trên mạng internet... Các con phải hiểu biết đức tin của mình với cùng độ chính xác và chuyên nghiệp như một chuyên gia tin học hiểu biết về hệ điều hành máy tính.\"*  \n> — **Đức Giáo Hoàng Biển Đức XVI** *(Lời tựa cuốn YOUCAT)*\n\n---\n\n#### [ CÂU 1 ] Con người hiện hữu trên đời để làm gì?\n**Đáp:** Con người ở trên đời là để nhận biết và yêu mến Thiên Chúa, làm điều thiện theo ý Người, và ngày sau được hưởng hạnh phúc đời đời trên Thiên Đàng.  \nThiên Chúa tạo dựng con người theo hình ảnh và giống như Người, ban cho chúng ta tự do và lý trí để yêu thương.\n\n#### [ CÂU 2 ] Tại sao Thiên Chúa lại tạo dựng con người?\n**Đáp:** Thiên Chúa tạo dựng con người hoàn toàn do tình yêu nhưng không. Người không cần đến chúng ta để được vinh quang hơn, nhưng vì tình yêu thương vô biên, Người muốn chia sẻ sự sống thần linh và hạnh phúc của Người cho chúng ta.\n\n#### [ CÂU 4 ] Lý trí con người có thể nhận biết Thiên Chúa không?\n**Đáp:** Có. Bằng lý trí tự nhiên, khi chiêm ngắm trật tự kỳ diệu, vẻ đẹp hài hòa của vũ trụ và lắng nghe tiếng nói luân lý nơi sâu thẳm lương tâm mình, con người có thể nhận biết chắc chắn sự hiện hữu của một Thiên Chúa là nguồn gốc và cùng đích của muôn loài.\n\n#### [ CÂU 7 ] Thiên Chúa mạc khải chính Người như thế nào?\n**Đáp:** Thiên Chúa không chỉ để con người tìm kiếm Người qua thiên nhiên, mà Người đã chủ động bước vào lịch sử loài người: Người ngỏ lời với các Tổ phụ, các Ngôn sứ trong Cựu Ước, và cuối cùng mạc khải trọn vẹn tình yêu của Người qua chính Đức Giêsu Kitô — Con Một hằng hữu của Thiên Chúa.\n\n#### [ CÂU 14 ] Kinh Thánh là gì và có cấu trúc như thế nào?\n**Đáp:** Kinh Thánh là Lời Thiên Chúa được ghi chép lại dưới sự linh hứng của Chúa Thánh Thần, gồm 73 cuốn sách:\n- **Cựu Ước (46 cuốn):** Chuẩn bị cho công cuộc cứu độ, ghi lại giao ước của Thiên Chúa với dân tộc Israel.\n- **Tân Ước (27 cuốn):** Mạc khải trọn vẹn cuộc đời, lời giảng dạy, cuộc khổ nạn, phục sinh của Chúa Giêsu và thời kỳ phôi thai của Hội Thánh. Trung tâm của Kinh Thánh là bốn sách Tin Mừng (Mát-thêu, Mác-cô, Lu-ca, Gio-an).\n\n#### [ CÂU 29 ] Đức Tin và Khoa Học có mâu thuẫn nhau không?\n**Đáp:** Hoàn toàn không! Không thể có bất kỳ sự mâu thuẫn thực sự nào giữa đức tin chân chính và khoa học đích thực. Cả hai cùng xuất phát từ một Đấng Sáng Tạo duy nhất. Khoa học khám phá trật tự vật lý và quy luật của thế giới tự nhiên, còn Đức Tin giải đáp những câu hỏi tối hậu về ý nghĩa cuộc đời, nguồn gốc và cùng đích của con người."},{"id":"youcat-chuong-2-thien-chua-ba-ngoi","title":"2. Chúng Tôi Tin: Thiên Chúa Ba Ngôi & Công Trình Sáng Tạo (Câu 25 - 55)","content":"### Tuyên Xưng Đức Tin Vào Thiên Chúa Hằng Sống\n\n#### [ CÂU 25 ] Đức tin là gì?\n**Đáp:** Đức tin là sự gắn bó cá vị của con người với Thiên Chúa; là sự ưng thuận trọn vẹn của lý trí và ý chí trước chân lý mà Thiên Chúa đã mạc khải. Người tin không chỉ nắm giữ các tín điều trên lý thuyết, mà là phó thác trọn vẹn cuộc đời mình vào bàn tay Đấng hằng yêu thương họ.\n\n#### [ CÂU 35 ] Mầu nhiệm Một Chúa Ba Ngôi là gì?\n**Đáp:** Chúng ta tin vào một Thiên Chúa duy nhất trong Ba Ngôi vị: **Chúa Cha, Chúa Con và Chúa Thánh Thần**. Ba Ngôi không phải là ba vị thần, mà là một Thiên Chúa duy nhất cùng một bản tính thần linh, hiệp nhất trọn vẹn trong tình yêu trao ban vô biên. Đây là mầu nhiệm trung tâm của đức tin và đời sống Kitô giáo.\n\n#### [ CÂU 41 ] Thiên Chúa sáng tạo vũ trụ như thế nào?\n**Đáp:** Thiên Chúa tự do tạo dựng vũ trụ từ hư không (*creatio ex nihilo*) chỉ bằng Lời quyền năng của Người. Vũ trụ không phải là kết quả của sự ngẫu nhiên mù quáng hay sự xung đột hỗn mang, mà là công trình của sự khôn ngoan và tình yêu Thiên Chúa.\n\n#### [ CÂU 51 ] Nếu Thiên Chúa tốt lành, tại sao lại có sự dữ và đau khổ?\n**Đáp:** Thiên Chúa không tạo ra sự dữ. Sự dữ là sự thiếu vắng hoặc làm biến chất điều thiện. Sự dữ luân lý phát sinh từ việc con người lạm dụng tự do để chống lại Thiên Chúa. Thiên Chúa tôn trọng tự do con người, và trong sự quan phòng khôn ngoan mầu nhiệm, Người có thể rút ra điều thiện lành lớn lao hơn từ những đau khổ — đỉnh cao là việc biến đổi Thập Giá Đức Kitô thành nguồn ơn cứu độ nhân loại.\n\n#### [ CÂU 54 ] Con người có linh hồn không?\n**Đáp:** Có. Mỗi con người được Thiên Chúa tạo thành gồm cả thể xác vật chất và linh hồn thiêng liêng bất tử. Linh hồn là nguyên lý sự sống, mang lại cho con người lý trí, ý chí tự do và khả năng yêu thương, hiệp thông với Thiên Chúa. Linh hồn không chết theo thể xác."},{"id":"youcat-chuong-3-duc-giesu-kito","title":"3. Đức Giêsu Kitô: Đấng Cứu Độ & Hội Thánh (Câu 56 - 165)","content":"### Mầu Nhiệm Nhập Thể, Vượt Qua & Hội Thánh\n\n#### [ CÂU 64 ] Tại sao Thiên Chúa lại làm người nơi Đức Giêsu Kitô?\n**Đáp:** Con Thiên Chúa làm người vì chúng ta và để cứu độ chúng ta:\n1. Để hòa giải chúng ta với Thiên Chúa qua việc đền thay tội lỗi.\n2. Để chúng ta nhận biết tình yêu thương vô biên của Thiên Chúa.\n3. Để trở nên mẫu gương thánh thiện cho chúng ta noi theo.\n4. Để cho chúng ta được thông phần bản tính thần linh của Người.\n\n#### [ CÂU 82 ] Đức Maria có vai trò gì trong công trình cứu chuộc?\n**Đáp:** Mẹ Maria là Mẹ Thiên Chúa (*Theotokos*) vì Mẹ đã sinh ra Đức Giêsu Kitô, Đấng vừa là Thiên Chúa thật vừa là người thật. Bằng lời thưa *\"Xin vâng\"* (*Fiat*) khiêm nhường, Mẹ đã hoàn toàn phó thác để kế hoạch cứu độ được thực hiện. Đức Mẹ cũng là Mẹ của Hội Thánh và người chuyển cầu tuyệt hảo cho mọi Kitô hữu.\n\n#### [ CÂU 101 ] Ý nghĩa cuộc Tử Nạn và Phục Sinh của Đức Kitô là gì?\n**Đáp:** Đây là trọng tâm của Tin Mừng. Bằng cái chết trên Thập Giá vì yêu thương, Đức Giêsu đã gánh lấy tội lỗi nhân loại và hòa giải ta với Chúa Cha. Bằng sự Phục Sinh vinh hiển từ cõi chết, Người đã đập tan xiềng xích tử thần và mở toang cánh cửa dẫn vào sự sống vĩnh hằng cho mọi người tin.\n\n#### [ CÂU 129 ] Bốn đặc tính căn bản của Hội Thánh là gì?\n**Đáp:**\n1. **Duy Nhất:** Hội Thánh chỉ có một Chúa, tuyên xưng một đức tin, sinh ra từ một phép rửa và liên kết trong một Thân Thể mầu nhiệm.\n2. **Thánh Thiện:** Vì Đấng sáng lập là Đức Kitô chí thánh và có Chúa Thánh Thần hằng hướng dẫn, dù các thành viên vẫn còn mang phận người yếu đuối.\n3. **Công Giáo (Phổ Quát):** Được sai đến với toàn thể nhân loại thuộc mọi thời đại, ngôn ngữ và nền văn hóa.\n4. **Tông Truyền:** Xây dựng trên nền tảng các Tông đồ và được tiếp nối liên tục qua các Đấng kế vị là Giám mục hiệp thông với Đức Giáo Hoàng.\n\n#### [ CÂU 157 ] Sau cái chết, con người sẽ đi về đâu?\n**Đáp:** Ngay sau khi chết, mỗi người trải qua cuộc phán xét riêng trước nhan Đức Kitô:\n- **Thiên Đàng:** Hưởng hạnh phúc đời đời kết hiệp trọn vẹn với Thiên Chúa và các thánh.\n- **Luyện Ngục:** Trạng thái thanh luyện cuối cùng dành cho những ai chết trong tình nghĩa Chúa nhưng chưa hoàn toàn tinh tuyền.\n- **Hỏa Ngục:** Sự tách biệt vĩnh viễn khỏi Thiên Chúa do chính người đó kiên quyết từ chối tình yêu và ân sủng tha thứ của Người cho đến phút cuối đời."},{"id":"youcat-chuong-4-phung-vu-bi-tich","title":"4. Cử Hành Mầu Nhiệm Phụng Vụ & 7 Suối Nguồn Ân Sủng (Câu 166 - 278)","content":"### 7 Bí Tích — Suối Nguồn Ân Sủng Chữa Lành & Thánh Hóa\n\n#### [ CÂU 172 ] Bí tích là gì và do ai thiết lập?\n**Đáp:** Các Bí tích là những dấu chỉ khả giác và hữu hiệu của ân sủng, do Chúa Giêsu Kitô thiết lập và trao ban cho Hội Thánh, qua đó sự sống thần linh của Thiên Chúa được thông ban cho chúng ta qua tác động của Chúa Thánh Thần.\n\n#### [ CÂU 194 ] Bí tích Rửa Tội đem lại những ơn ích cốt lõi nào?\n**Đáp:** Bí tích Rửa Tội là cửa ngõ bước vào đời sống thiêng liêng:\n- Tẩy sạch Tội Nguyên Tổ và mọi tội riêng đã phạm trước đó.\n- Cho người thụ nhân được tái sinh làm con cái dấu yêu của Thiên Chúa Cha.\n- Tháp nhập vào Thân Thể Đức Kitô và trở thành chi thể của Hội Thánh.\n- Ghi dấu ấn thiêng liêng vĩnh viễn không thể tẩy xóa.\n\n#### [ CÂU 203 ] Bí tích Thêm Sức đem lại hiệu quả gì cho người trẻ?\n**Đáp:** Bí tích Thêm Sức kiện toàn ân sủng Rửa Tội, ban tràn đầy **7 Ơn Chúa Thánh Thần**: *Khôn Ngoan, Hiểu Biết, Lo Liệu, Sức Mạnh, Thông Minh, Đạo Đức và Kính Sợ Chúa*. Bí tích này biến người tín hữu thành những chiến sĩ trưởng thành, can đảm làm chứng cho Đức Kitô giữa lòng thế giới.\n\n#### [ CÂU 211 ] Tại sao Bí tích Thánh Thể là “Nguồn mạch và Đỉnh cao”?\n**Đáp:** Vì trong Bí tích Thánh Thể, chính Đức Giêsu Kitô hiện diện thực sự bằng Mình, Máu, Linh hồn và Thần tính của Người dưới hình bánh rượu (Mầu nhiệm Biến đổi bản thể - *Transubstantiatio*). Đây không chỉ là một biểu tượng hay kỷ niệm, mà là hy tế Thập Giá được hiện tại hóa trên bàn thờ để nuôi dưỡng linh hồn người tín hữu.\n\n#### [ CÂU 224 ] Năm bước để lãnh nhận Bí tích Hòa Giải (Xưng Tội) nên là gì?\n**Đáp:**\n1. **Xét mình:** Soi chiếu tư tưởng, lời nói, việc làm và sự thiếu sót theo Lời Chúa.\n2. **Ăn năn tội:** Đau buồn chân thành vì đã xúc phạm đến Thiên Chúa nhân từ.\n3. **Dốc lòng chừa:** Quyết tâm thật lòng xa lánh dịp tội và sửa đổi đời sống.\n4. **Xưng tội:** Thành thật thú nhận mọi tội trọng cùng linh mục giải tội.\n5. **Làm việc đền tội:** Thực hiện việc đền tạ để bù đắp những tổn thương do tội gây ra."},{"id":"youcat-chuong-5-doi-song-trong-duc-kito","title":"5. Đời Sống Trong Đức Kitô: Tự Do, Lương Tâm & Nhân Đức (Câu 286 - 342)","content":"### Nghệ Thuật Sống Của Người Trưởng Thành Kitô Giáo\n\n#### [ CÂU 286 ] Tự do thực sự là gì?\n**Đáp:** Tự do không phải là làm bất cứ điều gì mình thích theo bản năng mù quáng. Tự do đích thực là khả năng và sức mạnh tự nguyện chọn lựa điều chân thiện mỹ, phụng sự Thiên Chúa và phục vụ tha nhân. Càng làm điều thiện, con người càng trở nên tự do đích thực. Khi phạm tội, con người đánh mất chính mình và trở thành nô lệ của đam mê tội lỗi.\n\n#### [ CÂU 295 ] Lương tâm là gì và làm sao để rèn luyện lương tâm ngay thẳng?\n**Đáp:** Lương tâm là cung thánh thầm kín nơi đáy lòng con người, nơi con người hiện diện một mình với Thiên Chúa và nghe thấy tiếng Người thúc giục làm lành lánh dữ. Để rèn luyện lương tâm ngay chính, người trẻ cần:\n- Siêng năng lắng nghe và học hỏi Lời Chúa mỗi ngày.\n- Suy xét theo giáo huấn chân chính của Hội Thánh.\n- Tập thói quen xét mình mỗi tối trước khi đi ngủ.\n- Tìm kiếm lời khuyên từ những người đồng hành đức tin khôn ngoan.\n\n#### [ CÂU 300 ] Bốn Nhân đức Trụ (Nhân bản) rèn luyện thế nào?\n**Đáp:**\n1. **Khôn ngoan (*Prudentia*):** Khả năng phân định điều thực sự tốt lành trong mọi hoàn cảnh và lựa chọn phương thế đúng đắn.\n2. **Công bằng (*Iustitia*):** Ý chí kiên định luôn tôn trọng quyền lợi của tha nhân và trả lại cho mỗi người những gì thuộc về họ.\n3. **Can đảm (*Fortitudo*):** Sức mạnh nội tâm vượt qua sợ hãi, trung thành với điều thiện ngay cả khi gặp nghịch cảnh hay đe dọa.\n4. **Tiết độ (*Temperantia*):** Khả năng làm chủ các bản năng, ham muốn thể xác và sử dụng chừng mực của cải trần thế.\n\n#### [ CÂU 305 ] Ba Nhân đức Đối Thần là gì?\n**Đáp:** Đó là **Tin, Cậy và Mến**. Được Thiên Chúa đổ tràn vào linh hồn qua Bí tích Rửa Tội:\n- **Đức Tin:** Nhận biết và ưng thuận trọn vẹn trước Chân lý Thiên Chúa.\n- **Đức Cậy:** Vững lòng trông cậy và khao khát Nước Trời cùng sự trợ lực của ân sủng Chúa.\n- **Đức Mến:** Yêu mến Thiên Chúa trên hết mọi sự và yêu tha nhân như chính mình vì lòng mến Chúa."},{"id":"youcat-chuong-6-muoi-dieu-ran","title":"6. Mười Điều Răn: Yêu Chúa & Yêu Người Giữa Thế Giới Hiện Đại (Câu 343 - 468)","content":"### Chiếc La Bàn Đạo Đức Trong Thời Đại Kỹ Thuật Số\n\n#### [ CÂU 352 ] Nhóm Ba Điều Răn Đầu: Thờ Phượng & Tôn Kính Thiên Chúa\n**Đáp:** \n- **Điều răn 1:** Tôn thờ một Thiên Chúa duy nhất. Người trẻ cần từ bỏ các hình thức mê tín dị đoan, bói toán, tôn sùng tiền tài danh vọng, hay biến các trào lưu ảo trên mạng thành thần tượng của mình.\n- **Điều răn 2:** Tôn kính Danh Thánh Chúa. Không xúc phạm đến sự thánh thiêng, không thề gian dối hay dùng Danh Chúa vào mục đích vụ lợi.\n- **Điều răn 3:** Thánh hóa ngày Chúa Nhật. Nghỉ ngơi thân xác, dâng trọn tâm tình trong Thánh Lễ, bồi dưỡng mối tương quan gia đình và thực thi bác ái.\n\n#### [ CÂU 367 ] Điều Răn Thứ 4: Thảo Kính Cha Mẹ\n**Đáp:** Tôn kính, vâng lời và biết ơn cha mẹ; chăm sóc phụng dưỡng khi cha mẹ già yếu bệnh tật. Trong trường học và cộng đoàn, tôn trọng thầy cô giáo, các vị chủ chăn và những người có trách nhiệm hướng dẫn mình.\n\n#### [ CÂU 378 ] Điều Răn Thứ 5: Bảo Vệ & Tôn Trọng Sự Sống\n**Đáp:** Sự sống là quà tặng thiêng liêng của Thiên Chúa từ giây phút thụ thai cho đến hơi thở cuối cùng tự nhiên. Người trẻ phải:\n- Kiên quyết nói không với nạo phá thai, trợ tử và tự tử.\n- Lên án mọi hình thức bạo lực học đường, xúc phạm thể xác, bạo lực mạng và đua xe nguy hiểm.\n- Không sử dụng ma túy, thuốc lá điện tử hay chất gây nghiện tàn phá sức khỏe bản thân.\n\n#### [ CÂU 401 ] Điều Răn Thứ 6 & 9: Đức Khiết Tịnh & Phẩm Giá Tình Yêu\n**Đáp:** Khiết tịnh không phải là sự chối bỏ tính dục, mà là nghệ thuật làm chủ cảm xúc và bản năng để hướng về tình yêu đích thực. Người trẻ sống khiết tịnh bằng cách:\n- Tôn trọng phẩm giá của chính mình và bạn khác giới; không biến người khác thành công cụ thỏa mãn dục vọng.\n- Tránh xa văn hóa phẩm đồi trụy, nội dung khiêu dâm trên không gian mạng.\n- Gìn giữ tâm hồn thanh sạch để chuẩn bị cho ơn gọi hôn nhân hoặc thánh hiến mai sau.\n\n#### [ CÂU 426 ] Điều Răn Thứ 7 & 10: Công Bằng Xã Hội & Sự Ngay Thẳng\n**Đáp:** Tôn trọng tài sản của người khác và của công; không gian lận trong học tập, thi cử và công việc; không trộm cắp tài sản trí tuệ; không nuôi dưỡng lòng ghen tị hay tham lam của cải tha nhân.\n\n#### [ CÂU 452 ] Điều Răn Thứ 8: Sống Trong Sự Thật & Trách Nhiệm Trên Mạng\n**Đáp:** Thiên Chúa là Chân Lý. Người trẻ phải sống chân thật, ghét sự dối trá. Đặc biệt trên mạng xã hội: không tung tin đồn vô căn cứ (*fake news*), không nói xấu sau lưng, không tham gia tấn công hội đồng hủy hoại danh dự của người khác."},{"id":"youcat-chuong-7-cau-nguyen","title":"7. Cầu Nguyện Trong Đời Sống Đức Tin: Trò Chuyện Cùng Thầy Giêsu (Câu 469 - 510)","content":"### Cầu Nguyện Là Hơi Thở Của Linh Hồn\n\n#### [ CÂU 469 ] Cầu nguyện là gì và tại sao chúng ta cần cầu nguyện?\n**Đáp:** Thánh Nữ Têrêsa Hài Đồng Giêsu từng viết: *\"Đối với tôi, cầu nguyện là sự hướng lòng lên, là cái nhìn đơn sơ hướng về trời, là tiếng kêu tri ân và yêu mến giữa cơn thử thách cũng như lúc hân hoan.\"*  \nCầu nguyện là cuộc trò chuyện thân tình giữa người con với Cha trên trời. Nếu không cầu nguyện, đức tin của chúng ta sẽ khô héo như một nhành cây thiếu nước.\n\n#### [ CÂU 483 ] Năm hình thức cầu nguyện nền tảng trong Hội Thánh:\n**Đáp:**\n1. **Chúc tụng & Thờ lạy:** Tôn vinh sự vĩ đại và thánh thiện tuyệt đối của Thiên Chúa.\n2. **Cầu xin:** Chân thành xin ơn tha thứ tội lỗi và xin những ơn cần thiết cho linh hồn và thể xác.\n3. **Chuyển cầu:** Cầu nguyện thay cho anh chị em, cho gia đình, bạn bè, quê hương và cả những người xúc phạm mình.\n4. **Tạ ơn:** Tri ân Thiên Chúa vì muôn vàn hồng ân Người thương ban trong từng phút giây cuộc sống.\n5. **Ngợi khen:** Tán dương Thiên Chúa vì chính Người là Đấng Trọn Tốt Trọn Lành.\n\n#### [ CÂU 496 ] Năm bước thực hành Lectio Divina (Đọc Lời Chúa):\n**Đáp:**\n1. **Đọc (Lectio):** Đọc chậm rãi đoạn Tin Mừng, mở rộng tâm hồn lắng nghe Lời Chúa nói với chính mình hôm nay.\n2. **Suy niệm (Meditatio):** Dừng lại ở câu chữ chạm vào lòng mình; tự hỏi: *\"Chúa đang muốn dạy con điều gì?\"*.\n3. **Cầu nguyện (Oratio):** Trút cạn tâm tư thưa chuyện với Chúa về những đánh động vừa nhận được.\n4. **Chiêm niệm (Contemplatio):** Lắng đọng mọi ồn ào xung quanh, an nghỉ trong ánh mắt yêu thương của Chúa.\n5. **Hành động (Actio):** Đưa ra một cam kết cụ thể để sống Lời Chúa ngay trong ngày sống hôm nay.\n\n#### [ CÂU 499 ] Làm gì khi gặp khô khan và chia trí khi cầu nguyện?\n**Đáp:** Chia trí là chuyện rất bình thường của con người. Khi nhận ra mình bị chia trí, đừng nản lòng buông xuôi, hãy nhẹ nhàng hướng tâm trí trở lại với Chúa. Hãy biến chính những nỗi lo âu đang làm ta bận lòng thành đề tài cầu nguyện dâng lên cho Người."},{"id":"youcat-chuong-8-kinh-lay-cha-va-su-vu","title":"8. Kinh Lạy Cha & Sứ Vụ Người Trẻ Giữa Đời (Câu 511 - 527 & 138 - 139)","content":"### Kinh Lạy Cha & Sứ Mạng Tông Đồ Giữa Trần Thế\n\n#### [ CÂU 511 ] Kinh Lạy Cha có nguồn gốc từ đâu?\n**Đáp:** Kinh Lạy Cha do chính Đức Giêsu Kitô dạy cho các môn đệ khi họ xin Người: *\"Lạy Thầy, xin dạy chúng con cầu nguyện\"* (Lc 11, 1). Lời kinh này là bản tóm lược toàn bộ Tin Mừng và là trường dạy cầu nguyện hoàn hảo nhất của người Kitô hữu.\n\n#### [ CÂU 512 ] Kinh Lạy Cha được cấu trúc như thế nào?\n**Đáp:** Kinh Lạy Cha gồm 7 lời cầu xin nền tảng:\n- **Ba lời cầu đầu tiên:** Hướng lòng ta hoàn toàn về Thiên Chúa Cha: Danh Cha cả sáng, Nước Cha trị đến, Ý Cha thể hiện dưới đất cũng như trên trời.\n- **Bốn lời cầu tiếp theo:** Dâng lên Cha mọi nhu cầu thiết thân của phận người: Lương thực hằng ngày, Ơn tha thứ nợ nần tội lỗi, Ơn gìn giữ khỏi sa chước cám dỗ, và Ơn giải thoát khỏi tay ma quỷ sự dữ.\n\n#### [ CÂU 527 ] Tiếng \"Amen\" ở cuối Kinh Lạy Cha có nghĩa là gì?\n**Đáp:** \"Amen\" là từ ngữ gốc Do Thái mang ý nghĩa: *\"Ước gì được như vậy! Con xin đoan hứa và tin thật như thế!\"*. Khi thưa \"Amen\", người tín hữu xác tín lời cầu nguyện và ký nhận cam kết sống trọn vẹn theo tinh thần Kinh Lạy Cha trong từng ngày sống.\n\n---\n\n### Sứ Mạng Chứng Nhân Giữa Lòng Thế Giới\n\n#### [ CÂU 138 ] Có phải mọi Kitô hữu đều được kêu gọi làm tông đồ không?\n**Đáp:** Đúng vậy! Mọi người đã chịu phép Rửa Tội và Thêm Sức đều được chia sẻ vào chức vụ tư tế, ngôn sứ và vương giả của Đức Kitô. Mọi người trẻ Kitô giáo đều được kêu gọi trở thành những chứng nhân sống động và can đảm loan báo Tin Mừng giữa lòng thế giới.\n\n#### [ CÂU 139 ] Sứ mạng cụ thể của người trẻ giáo dân giữa trần gian là gì?\n**Đáp:** Người giáo dân được sai vào lòng đời như men trong bột:\n- Sống trung thực, chan hòa và tận tụy trong học tập và công việc.\n- Can đảm bảo vệ sự thật, lẽ công bằng và người yếu thế.\n- Tỏa rạng niềm vui, hy vọng và lòng bác ái của Chúa Kitô cho bạn bè đồng trang lứa.\n\n---\n\n### Lời Tuyên Hứa Hiệp Sĩ Vào Đời An Ngãi:\n> *\"Lạy Chúa Giêsu, con xin dâng trọn tuổi trẻ, sức sống và ước mơ của con cho Chúa. Xin ban cho con một trái tim biết yêu thương, một ý chí can trường để phục vụ và một đức tin kiên vững để làm nhân chứng cho Tin Mừng giữa trần thế hôm nay. Amen!\"*"}]'::jsonb,
  true,
  70,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  khoi = EXCLUDED.khoi,
  khoi_label = EXCLUDED.khoi_label,
  badge = EXCLUDED.badge,
  author = EXCLUDED.author,
  read_time = EXCLUDED.read_time,
  size = EXCLUDED.size,
  description = EXCLUDED.description,
  official_source_url = EXCLUDED.official_source_url,
  chapters = EXCLUDED.chapters,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Tài liệu: Docat — Cẩm Nang Hành Động Xã Hội Của Người Trẻ
INSERT INTO public.documents (
  id,
  title,
  khoi,
  khoi_label,
  badge,
  author,
  read_time,
  size,
  description,
  official_source_url,
  file_url,
  chapters,
  is_active,
  sort_order,
  updated_at
) VALUES (
  'docat-vietnam',
  'Docat — Cẩm Nang Hành Động Xã Hội Của Người Trẻ',
  'vao-doi',
  'Khối Vào Đời',
  'Docat',
  'Hội Đồng Giám Mục Việt Nam · Youcat Foundation (Lời mở đầu: ĐTC Phanxicô)',
  '30 phút đọc trọn bộ',
  '328 Câu Hỏi (12 Chương Toàn Diện)',
  'Cẩm nang Học thuyết Xã hội Công giáo trọn vẹn 12 chương: Trao chiếc la bàn luân lý giúp người trẻ biến đức tin thành hành động cụ thể về công bằng, lao động, kinh tế, môi trường Laudato Si'' và hòa bình.',
  'https://hdgmvietnam.com',
  NULL,
  '[{"id":"docat-chuong-1-ke-hoach-thien-chua","title":"1. Kế Hoạch Lớn Của Thiên Chúa: Tình Yêu Trong Hành Động (Câu 1 - 21)","content":"### Bức Thư Tâm Huyết Của Đức Thánh Cha Phanxicô Gửi Bạn Trẻ\n\n> *\"Thầy mong ước một triệu người trẻ Công giáo — thậm chí nhiều hơn nữa — trở thành một thế hệ biết đọc và sống Học thuyết Xã hội của Hội Thánh. Không gì khác hơn có thể biến đổi thế giới này! Hãy đọc Docat! Học thuyết Xã hội không đến từ một bàn giấy lý thuyết, mà xuất phát từ trái tim của Đức Giêsu Kitô. Thầy hy vọng các con sẽ có DOCAT trong tay và để cho cuốn sách này đốt lên ngọn lửa nhiệt huyết trong các con!\"*  \n> — **Đức Thánh Cha Phanxicô** *(Lời mở đầu DOCAT)*\n\n---\n\n#### [ CÂU 1 ] Kế hoạch của Thiên Chúa dành cho trần gian là gì?\n**Đáp:** Thiên Chúa dựng nên thế giới không phải như một nơi chốn vô nghĩa đầy đau khổ, mà là không gian của tình yêu thương và sự hiệp thông. Ý định của Thiên Chúa là biến toàn thể nhân loại thành một gia đình duy nhất, nơi mọi người nhận biết Thiên Chúa là Cha và sống chan hòa tình anh em với nhau.\n\n#### [ CÂU 4 ] Tình yêu đóng vai trò gì trong trật tự xã hội?\n**Đáp:** Tình yêu (*Caritas*) không chỉ là cảm xúc riêng tư hay việc bố thí tùy hứng, mà là sức mạnh biến đổi xã hội lớn nhất. Một xã hội chỉ dựa trên luật pháp nghiêm khắc hay hiệu quả kinh tế đơn thuần sẽ trở nên lạnh lùng và tàn nhẫn. Chỉ có tình yêu mới mang lại linh hồn và hơi ấm cho công lý.\n\n#### [ CÂU 14 ] Tại sao con người có bản tính xã hội bẩm sinh?\n**Đáp:** Vì con người được tạo dựng theo hình ảnh của Thiên Chúa Ba Ngôi — Đấng là sự hiệp thông hoàn hảo của tình yêu. Không ai có thể sống và phát triển trọn vẹn một mình như một ốc đảo biệt lập. Con người cần tha nhân để chia sẻ, học hỏi, cộng tác và trao ban chính mình."},{"id":"docat-chuong-2-su-mang-xa-hoi-hoi-thanh","title":"2. Cùng Nhau Hiệp Nhất: Sứ Mạng Xã Hội Của Hội Thánh (Câu 22 - 46)","content":"### Tiếng Nói Của Tin Mừng Giữa Các Vấn Đề Thời Đại\n\n#### [ CÂU 22 ] Học thuyết Xã hội của Hội Thánh bắt nguồn từ đâu?\n**Đáp:** Bắt nguồn từ chính Lời Chúa trong Kinh Thánh và tấm lòng thương xót của Chúa Giêsu đối với những người nghèo khổ, bị áp bức. Dấu mốc lịch sử hiện đại khởi đầu từ Thông điệp *Rerum Novarum* (Tân Sự, năm 1891) của Đức Giáo Hoàng Lêô XIII bênh vực công nhân thời kỳ công nghiệp hóa, tiếp nối qua các văn kiện của Công đồng Vatican II và các Thông điệp của các Đức Thánh Cha cho đến nay.\n\n#### [ CÂU 28 ] Tại sao Hội Thánh can thiệp vào các vấn đề kinh tế - xã hội?\n**Đáp:** Hội Thánh không có tham vọng quyền lực chính trị hay quản lý kinh tế, nhưng Hội Thánh có bổn phận luân lý bênh vực phẩm giá con người bất cứ nơi nào nhân phẩm bị chà đạp. Nơi nào có bất công, nghèo đói và áp bức, nơi đó Tin Mừng cứu độ của Đức Kitô phải được vang lên.\n\n#### [ CÂU 35 ] Người giáo dân có vai trò gì trong sứ mạng này?\n**Đáp:** Nếu các linh mục và tu sĩ có sứ vụ giảng dạy và cử hành phụng vụ, thì người giáo dân — đặc biệt là người trẻ — chính là những người trực tiếp dấn thân giữa lòng đời: trong chính trị, kinh tế, khoa học, truyền thông và nghệ thuật. Bạn trẻ có trách nhiệm đưa các giá trị Tin Mừng thấm nhuần vào các cấu trúc xã hội."},{"id":"docat-chuong-3-nhan-vi-con-nguoi","title":"3. Độc Đáo & Bất Khả Xâm Phạm: Phẩm Giá Nhân Vị Con Người (Câu 47 - 83)","content":"### Con Người Là Trung Tâm & Mục Đích Của Mọi Định Chế\n\n#### [ CÂU 47 ] Phẩm giá con người bắt nguồn từ đâu?\n**Đáp:** Phẩm giá con người không do nhà nước, xã hội hay tiền của ban tặng, mà bắt nguồn từ chính Thiên Chúa: mỗi người đều được tạo dựng theo hình ảnh Thiên Chúa, có linh hồn thiêng liêng và được Chúa Giêsu cứu chuộc bằng chính bửu huyết của Người. Vì thế, phẩm giá này là thiêng liêng, bất khả xâm phạm và bình đẳng nơi mọi người.\n\n#### [ CÂU 56 ] Những ai có quyền con người?\n**Đáp:** Tất cả mọi người, không phân biệt chủng tộc, giới tính, tôn giáo, địa vị kinh tế hay tình trạng sức khỏe. Quyền con người bắt đầu từ quyền sống của thai nhi trong bụng mẹ cho đến giây phút cuối đời của người già yếu và bệnh nhân nan y.\n\n#### [ CÂU 68 ] Sự bình đẳng giữa nam và nữ được hiểu như thế nào?\n**Đáp:** Nam và nữ có phẩm giá hoàn toàn bình đẳng trước nhan Thiên Chúa, nhưng mang những đặc tính bổ túc tuyệt vời cho nhau. Xã hội phải đảm bảo sự công bằng về cơ hội học tập, việc làm và mức lương cho nữ giới, đồng thời tôn vinh thiên chức làm mẹ và vai trò vô giá của người phụ nữ trong gia đình."},{"id":"docat-chuong-4-bon-tru-cot-nen-tang","title":"4. Bốn Trụ Cột Nền Tảng Của Học Thuyết Xã Hội (Câu 84 - 111)","content":"### Chiếc Kiềng Bốn Chân Của Một Xã Hội Nhân Bản\n\n#### [ CÂU 84 ] Trụ Cột 1: Phẩm Giá Con Người (Human Dignity)\n**Đáp:** Mọi chính sách, thể chế và luật lệ phải phục vụ con người, chứ không được biến con người thành công cụ phục vụ cho kinh tế hay quyền lực chính trị.\n\n#### [ CÂU 90 ] Trụ Cột 2: Ích Chung / Công Ích (Common Good)\n**Đáp:** Công ích là tổng thể tất cả các điều kiện xã hội — an ninh, giáo dục, y tế, việc làm, môi trường trong lành — cho phép mọi nhóm xã hội và từng cá nhân đạt tới sự phát triển toàn diện một cách dễ dàng và trọn vẹn hơn.\n\n#### [ CÂU 99 ] Trụ Cột 3: Nguyên Tắc Bổ Trợ (Subsidiarity)\n**Đáp:** Các cấp chính quyền hoặc tổ chức cấp cao hơn không được tước đoạt hay can thiệp thô bạo vào những công việc mà gia đình, cộng đồng địa phương hay cấp cơ sở có thể tự giải quyết hiệu quả. Cấp trên có bổn phận hỗ trợ, khuyến khích và tạo điều kiện tự chủ cho cấp dưới.\n\n#### [ CÂU 108 ] Trụ Cột 4: Tình Liên Đới (Solidarity)\n**Đáp:** Là sự quyết tâm kiên trì dấn thân vì công ích; ý thức sâu sắc rằng chúng ta cùng chịu trách nhiệm về nhau. Tình liên đới đòi hỏi sự sẻ chia cụ thể của cải vật chất và tinh thần giữa người giàu và người nghèo, giữa các thế hệ và giữa các quốc gia."},{"id":"docat-chuong-5-gia-dinh-hon-nhan","title":"5. Trái Tim Của Xã Hội: Gia Đình & Hôn Nhân (Câu 112 - 133)","content":"### Nôi Sự Sống & Trường Dạy Các Giá Trị Đầu Đời\n\n#### [ CÂU 112 ] Tại sao gia đình là nền tảng của toàn bộ xã hội?\n**Đáp:** Gia đình là tế bào tự nhiên và sống động đầu tiên của xã hội loài người. Một xã hội lành mạnh bắt đầu từ những gia đình bền vững. Chính trong gia đình, con người lần đầu tiên học được thế nào là được yêu thương vô điều kiện, học nói, học cầu nguyện, học lòng tha thứ và tinh thần trách nhiệm.\n\n#### [ CÂU 117 ] Bản chất của hôn nhân Kitô giáo là gì?\n**Đáp:** Hôn nhân là sự kết hợp tình yêu tự do, trọn vẹn, một vợ một chồng, chung thủy và bất khả phân ly giữa một người nam và một người nữ suốt đời, mở rộng lòng đón nhận và giáo dục con cái mà Thiên Chúa thương ban.\n\n#### [ CÂU 125 ] Người trẻ chuẩn bị gì cho đời sống hôn nhân tương lai?\n**Đáp:** Cần xây dựng tình bạn trong sáng, tôn trọng sự khác biệt, học cách lắng nghe và làm chủ cảm xúc. Hôn nhân không phải là một trò chơi thử nghiệm may rủi, mà là một ơn gọi cao quý đòi hỏi sự trưởng thành về nhân cách, đức tin và tinh thần trách nhiệm."},{"id":"docat-chuong-6-lao-dong-con-nguoi","title":"6. Lao Động Con Người: Phẩm Giá, Quyền Lợi & Trách Nhiệm (Câu 134 - 157)","content":"### Con Người Cộng Tác Với Đấng Sáng Tạo\n\n#### [ CÂU 134 ] Ý nghĩa đích thực của lao động con người là gì?\n**Đáp:** Lao động không phải là một gánh nặng bị nguyền rủa, mà là vinh dự và ơn gọi. Qua lao động lương thiện, con người phát triển tài năng, nuôi sống bản thân và gia đình, đồng thời cộng tác với Thiên Chúa để làm cho vũ trụ ngày càng hoàn mỹ hơn.\n\n#### [ CÂU 144 ] Nguyên tắc ưu tiên của lao động trước tư bản:\n**Đáp:** Hội Thánh luôn khẳng định mạnh mẽ: **Con người luôn đứng trên đồng tiền và máy móc!** Tư bản (vốn liếng, thiết bị, thuật toán, công nghệ AI) chỉ là công cụ hỗ trợ, không bao giờ được phép thống trị hay biến con người thành bánh răng vô hồn phục vụ lợi nhuận.\n\n#### [ CÂU 150 ] Những quyền căn bản của người lao động:\n**Đáp:**\n- Quyền có việc làm ổn định và môi trường lao động an toàn, nhân phẩm được tôn trọng.\n- Quyền được trả mức lương công bằng đủ trang trải cuộc sống gia đình một cách đàng hoàng.\n- Quyền được nghỉ ngơi định kỳ và thánh hóa ngày Chúa Nhật.\n- Quyền lập nghiệp đoàn và đình công hợp pháp khi các quyền lợi chính đáng bị xâm phạm bất công."},{"id":"docat-chuong-7-kinh-te-phuc-vu-con-nguoi","title":"7. Kinh Tế Phục Vụ Sự Sống: Thị Trường, Đạo Đức & Toàn Cầu Hóa (Câu 158 - 194)","content":"### Xây Dựng Một Nền Kinh Tế Chia Sẻ & Huynh Đệ\n\n#### [ CÂU 158 ] Mục tiêu tối hậu của nền kinh tế là gì?\n**Đáp:** Kinh tế tồn tại là để phục vụ con người, chứ không phải con người sinh ra để phục vụ nền kinh tế. Một nền kinh tế phát triển thịnh vượng thực sự không chỉ đo lường bằng chỉ số GDP hay số lượng tỷ phú, mà bằng việc mọi người dân — nhất là những người yếu thế nhất — có được cuộc sống ấm no, có cơm ăn áo mặc và cơ hội thăng tiến.\n\n#### [ CÂU 167 ] Hội Thánh nhìn nhận quyền tư hữu như thế nào?\n**Đáp:** Hội Thánh công nhận quyền sở hữu tư nhân chính đáng nhằm bảo đảm tự do và sự phát triển của cá nhân. Tuy nhiên, quyền tư hữu luôn đi kèm với **bổn phận xã hội của tài sản (Universal Destination of Goods)**: Thiên Chúa ban tặng đất đai và tài nguyên cho toàn thể nhân loại, vì thế của cải dư thừa không được cất giữ ích kỷ trong khi tha nhân đang chết đói.\n\n#### [ CÂU 182 ] Đạo đức trong kinh doanh và khởi nghiệp trẻ:\n**Đáp:** Người trẻ bước vào thương trường cần giữ lương tâm trong sáng: không sản xuất hàng giả độc hại, không trốn thuế, không bóc lột nhân công, và can đảm tiên phong trong các mô hình kinh doanh tuần hoàn, bảo vệ môi trường sinh thái."},{"id":"docat-chuong-8-chinh-tri-va-dan-chu","title":"8. Cộng Đồng Chính Trị & Dân Chủ (Câu 195 - 228)","content":"### Quyền Bính Là Để Phục Vụ Công Ích\n\n#### [ CÂU 195 ] Quyền bính chính trị xuất phát từ đâu và có mục đích gì?\n**Đáp:** Mọi quyền bính chính đáng đều bắt nguồn từ Thiên Chúa nhằm thiết lập trật tự công bằng và bảo đảm công ích cho cộng đồng. Người nắm giữ quyền bính không phải là ông chủ độc tài, mà là tôi tớ phục vụ nhân dân theo tinh thần Chúa Giêsu quỳ xuống rửa chân cho các môn đệ.\n\n#### [ CÂU 205 ] Những tiêu chuẩn của một nền dân chủ lành mạnh:\n**Đáp:** Một nền dân chủ chân chính không chỉ là việc bỏ phiếu hình thức, mà phải được xây dựng trên:\n- Thượng tôn pháp luật (*Rule of law*), bình đẳng trước pháp luật.\n- Bảo vệ quyền tự do tôn giáo, tự do tư tưởng và ngôn luận.\n- Minh bạch tài chính công và bài trừ nạn tham nhũng làm nghèo đất nước.\n- Lắng nghe và bảo vệ quyền lợi của các nhóm yếu thế, thiểu số.\n\n#### [ CÂU 220 ] Trách nhiệm công dân của người trẻ Công giáo:\n**Đáp:** Người Kitô hữu không được sống thờ ơ, bàng quan trước các vấn đề của đất nước. Hãy tích cực tham gia các hoạt động cộng đồng, đóng góp tài năng xây dựng quê hương, và can đảm lên tiếng trước những đạo luật trái nghịch với luân lý tự nhiên."},{"id":"docat-chuong-9-gia-dinh-quoc-te","title":"9. Gia Đình Quốc Tế: Hòa Bình & Công Lý Toàn Cầu (Câu 229 - 255)","content":"### Tình Huynh Đệ Vượt Mọi Biên Giới\n\n#### [ CÂU 229 ] Cộng đồng quốc tế được hiểu như thế nào?\n**Đáp:** Các quốc gia và dân tộc trên thế giới hợp thành một gia đình nhân loại duy nhất. Sự thịnh vượng hay khủng hoảng của một quốc gia đều ảnh hưởng sâu sắc đến các quốc gia khác. Vì thế, trật tự quốc tế phải được xây dựng trên sự tôn trọng lẫn nhau, công lý và sự thật.\n\n#### [ CÂU 242 ] Tinh thần đối với người di cư và người tị nạn:\n**Đáp:** ĐTC Phanxicô luôn kêu gọi 4 hành động cụ thể đối với người di cư: **Đón tiếp, Bảo vệ, Thăng tiến và Hội nhập**. Người trẻ Kitô hữu mở rộng vòng tay nâng đỡ những người vì chiến tranh, nghèo đói hay thiên tai mà phải rời bỏ quê hương, nhìn thấy nơi họ khuôn mặt của Chúa Giêsu lưu lạc năm xưa."},{"id":"docat-chuong-10-moi-truong-laudato-si","title":"10. Bảo Vệ Ngôi Nhà Chung: Sinh Thái Toàn Diện Laudato Si'' (Câu 256 - 269)","content":"### Lắng Nghe Tiếng Kêu Của Trái Đất & Tiếng Than Của Người Nghèo\n\n#### [ CÂU 256 ] Tại sao bảo vệ thiên nhiên là bổn phận đức tin?\n**Đáp:** Thiên nhiên là kỳ công tuyệt mỹ do Thiên Chúa sáng tạo và ủy thác cho con người chăm sóc (St 2, 15). Việc hủy hoại môi sinh vì lòng tham vô độ là tội lỗi xúc phạm đến Đấng Tạo Hóa và cướp đi tương lai sinh tồn của các thế hệ con cháu mai sau.\n\n#### [ CÂU 260 ] Thế nào là \"Sinh thái toàn diện\" (Integral Ecology)?\n**Đáp:** Mọi sự trong vũ trụ đều gắn kết mật thiết với nhau. Ta không thể giải quyết khủng hoảng môi trường nếu tách rời khỏi khủng hoảng xã hội và đạo đức. Tiếng kêu của Trái Đất bị ô nhiễm hòa chung với tiếng than van của những người nghèo đang chịu ảnh hưởng nặng nề nhất bởi biến đổi khí hậu.\n\n#### [ CÂU 268 ] Hành động cụ thể của bạn trẻ An Ngãi:\n**Đáp:**\n- Tiết kiệm điện, tắt các thiết bị khi không sử dụng.\n- Khóa chặt vòi nước, không lãng phí nguồn nước ngọt quý giá.\n- Hạn chế tối đa việc sử dụng túi nilon và đồ nhựa dùng một lần.\n- Tham gia các chiến dịch dọn sạch môi trường, trồng cây phủ xanh khuôn viên giáo xứ và đường làng xóm đạo."},{"id":"docat-chuong-11-hoa-binh-tha-thu","title":"11. Hòa Bình: Xây Dựng Bằng Công Lý & Lòng Tha Thứ (Câu 270 - 304)","content":"### Phúc Cho Ai Xây Dựng Hòa Bình\n\n#### [ CÂU 270 ] Hòa bình đích thực là gì?\n**Đáp:** Hòa bình không chỉ đơn thuần là sự im ắng của tiếng súng đạn, mà là hoa trái của công lý, trật tự hài hòa và tình thương mến (Is 32, 17). Không thể có hòa bình lâu dài nếu sự bất công, nghèo đói và áp bức vẫn còn tồn tại.\n\n#### [ CÂU 285 ] Vũ khí và việc chạy đua vũ trang:\n**Đáp:** Hội Thánh lên án mạnh mẽ việc sản xuất, buôn bán và tích trữ vũ khí hủy diệt hàng loạt. Mỗi đồng tiền đổ vào kho vũ khí là một sự cướp đoạt mồ hôi nước mắt của những người đang thiếu ăn, thiếu trường học và trạm y tế trên khắp hành tinh.\n\n#### [ CÂU 298 ] Sức mạnh của lòng tha thứ Kitô giáo:\n**Đáp:** Bạo lực chỉ sinh ra bạo lực; hận thù không thể dập tắt được hận thù, chỉ có tình yêu thương và sự tha thứ mới có thể cắt đứt vòng xoáy oan nghiệt. Chúa Giêsu trên Thập Giá đã tha thứ cho chính những kẻ đóng đinh Người — đó là bài học hòa giải cao cả nhất cho nhân loại."},{"id":"docat-chuong-12-bac-ai-dan-than","title":"12. Bác Ái Trong Hành Động: Lời Kêu Gọi Dấn Thân Của Người Trẻ Vào Đời (Câu 305 - 328)","content":"### Biến Đức Tin Thành Hành Động Cụ Thể\n\n#### [ CÂU 305 ] Mười Bốn Mối Thương Người (7 Thể Xác & 7 Linh Hồn):\n**Đáp:**\n- **Thương xác:** Cho kẻ đói ăn; cho kẻ khát uống; cho kẻ rách rưới ăn mặc; viếng kẻ liệt cùng kẻ tù rạc; cho khách đỗ nhà; chuộc kẻ làm tôi; chôn xác kẻ chết.\n- **Thương linh hồn:** Lấy lời lành khuyên người; mở dạy kẻ mê muội; yên ủi kẻ âu lo; răn bảo kẻ có tội; tha kẻ dể ta; nhịn kẻ mất lòng ta; cầu cho kẻ sống và kẻ chết.\n\n#### [ CÂU 320 ] Xây dựng \"Nền văn hóa gặp gỡ\" (Culture of Encounter):\n**Đáp:** Bước ra khỏi \"bong bóng an toàn\" và chiếc màn hình smartphone để thật sự nhìn vào mắt nhau, lắng nghe tiếng lòng của những người cô đơn, người già neo đơn và những bạn trẻ lầm lỡ trong xóm đạo.\n\n#### [ CÂU 328 ] Bản Tuyên Ngôn Dấn Thân Của Hiệp Sĩ Vào Đời:\n**Đáp:**\n> *\"Tôi tin rằng Tin Mừng Đức Kitô có sức mạnh biến đổi xã hội. Tôi cam kết sống trung thực trong học tập và nghề nghiệp, yêu thương hòa bình, sẵn sàng chìa tay giúp đỡ người nghèo khổ, và trở thành men muối tình yêu của Chúa giữa trần đời hôm nay!\"*"}]'::jsonb,
  true,
  80,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  khoi = EXCLUDED.khoi,
  khoi_label = EXCLUDED.khoi_label,
  badge = EXCLUDED.badge,
  author = EXCLUDED.author,
  read_time = EXCLUDED.read_time,
  size = EXCLUDED.size,
  description = EXCLUDED.description,
  official_source_url = EXCLUDED.official_source_url,
  chapters = EXCLUDED.chapters,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Tài liệu: Bản Tóm Lược Các Kinh Cần Thuộc — Giáo Phận Đà Nẵng
INSERT INTO public.documents (
  id,
  title,
  khoi,
  khoi_label,
  badge,
  author,
  read_time,
  size,
  description,
  official_source_url,
  file_url,
  chapters,
  is_active,
  sort_order,
  updated_at
) VALUES (
  'ban-kinh-can-thuoc-da-nang',
  'Bản Tóm Lược Các Kinh Cần Thuộc — Giáo Phận Đà Nẵng',
  'all',
  'Mọi Cấp Lớp',
  'Kinh Nguyện',
  'Ban Giáo Lý Giáo Phận Đà Nẵng',
  '8 phút đọc',
  '11 KB',
  'Tổng hợp toàn văn các kinh nguyện cốt lõi theo quy chuẩn Giáo phận Đà Nẵng dành cho thiếu nhi học thuộc lòng và cầu nguyện mỗi ngày.',
  NULL,
  NULL,
  '[{"id":"kinh-nguyen-hang-ngay","title":"1. Các Kinh Nguyện Khởi Đầu & Hằng Ngày","content":"\n### Làm Dấu Thánh Giá\nNhân danh Cha, và Con, và Thánh Thần. Amen.\n\n### Kinh Đức Chúa Thánh Thần\nChúng con lạy ơn Đức Chúa Thánh Thần thiêng liêng sáng láng vô cùng. Chúng con xin Đức Chúa Thánh Thần xuống đầy lòng chúng con, là kẻ tin cậy Đức Chúa Trời, và đốt lửa kính mến Đức Chúa Trời trong lòng chúng con; chúng con xin Đức Chúa Trời cho Đức Chúa Thánh Thần xuống.  \n*— Sửa lại mọi sự trong ngoài chúng con.*  \nChúng con cầu cùng Đức Chúa Trời, xưa đã cho Đức Chúa Thánh Thần xuống soi lòng dạy dỗ các Thánh Tông Đồ, thì rày chúng con cũng xin Đức Chúa Trời cho Đức Chúa Thánh Thần lại xuống, an ủi dạy dỗ chúng con làm những việc lành, vì công nghiệp Đức Chúa Giêsu Kitô là Chúa chúng con. Amen.\n\n### Kinh Lạy Cha\nLạy Cha chúng con ở trên trời, chúng con nguyện Danh Cha cả sáng, Nước Cha trị đến, Ý Cha thể hiện dưới đất cũng như trên trời.  \nXin Cha cho chúng con hôm nay lương thực hằng ngày, và tha nợ chúng con, như chúng con cũng tha kẻ có nợ chúng con; xin chớ để chúng con sa chước cám dỗ, nhưng cứu chúng con cho khỏi sự dữ. Amen.\n\n### Kinh Kính Mừng\nKính mừng Maria đầy ơn phúc, Đức Chúa Trời ở cùng Bà, Bà có phúc lạ hơn mọi người nữ, và Giêsu con lòng Bà gồm phúc lạ.  \nThánh Maria Đức Mẹ Chúa Trời, cầu cho chúng con là kẻ có tội, khi này và trong giờ lâm tử. Amen.\n\n### Kinh Sáng Danh\nSáng danh Đức Chúa Cha, và Đức Chúa Con, và Đức Chúa Thánh Thần.  \nNhư đã có trước vô cùng, và bây giờ, và hằng có, và đời đời chẳng cùng. Amen.\n\n### Kinh Thiên Thần Bản Mệnh\nLạy ơn Thánh Thiên Thần gìn giữ tôi, tôi cám ơn Thánh Thiên Thần vốn gìn giữ tôi từ thuở mới sinh đến nay cho được mọi sự lành. Trâm lạy Thánh Thiên Thần gìn giữ tôi, xin rủ lòng thương gìn giữ tôi ban ngày và ban đêm, kẻo chước ma quỷ cám dỗ mà phạm tội mất lòng Đức Chúa Trời. Amen.\n"},{"id":"kinh-tin-kinh","title":"2. Kinh Tin Kính (Tín Biểu Các Sứ Đồ)","content":"\nTôi tin kính Đức Chúa Trời là Cha phép tắc vô cùng dựng nên trời đất.  \nTôi tin kính Đức Chúa Giêsu Kitô là Con Một Đức Chúa Cha cùng là Chúa chúng tôi; bởi phép Đức Chúa Thánh Thần mà Người xuống thai, sinh bởi Bà Maria đồng trinh; chịu nạn đời quan Phongxiô Philatô, chịu đóng đinh trên cây Thánh giá, chết và táng xác; xuống ngục tổ tông, ngày thứ ba bởi trong kẻ chết mà sống lại; lên trời ngự bên hữu Đức Chúa Cha phép tắc vô cùng; ngày sau bởi trời lại xuống phán xét kẻ sống và kẻ chết.  \nTôi tin kính Đức Chúa Thánh Thần; tôi tin có Hội Thánh hằng có ở khắp thế này, các thánh thông công; tôi tin phép tha tội; tôi tin xác loài người ngày sau sống lại; tôi tin hằng sống vậy. Amen.\n"},{"id":"kinh-tin-cay-men","title":"3. Kinh Tin, Cậy, Mến, Ăn Năn Tội & Trông Cậy","content":"\n### Kinh Tin\nLạy Chúa, con tin thật có một Đức Chúa Trời, là Đấng thưởng phạt vô cùng. Con lại tin thật Đức Chúa Trời có Ba Ngôi, mà Ngôi Thứ Hai đã xuống thế làm người, chịu nạn chịu chết mà chuộc tội cho thiên hạ. Bấy nhiêu điều ấy, cùng các điều Hội Thánh dạy, thì con tin vững vàng, vì Chúa là Đấng thông minh và chân thật vô cùng, đã phán truyền cho Hội Thánh. Amen.\n\n### Kinh Cậy\nLạy Chúa, con trông cậy vững vàng, vì công nghiệp Đức Chúa Giêsu, thì Chúa sẽ ban ơn cho con giữ đạo nên ở đời này, cho ngày sau được lên thiên đàng, xem thấy mặt Đức Chúa Trời hưởng phúc đời đời, vì Chúa là Đấng phép tắc và lòng lành vô cùng, đã phán hứa sự ấy chẳng có lẽ nào sai được. Amen.\n\n### Kinh Mến\nLạy Chúa, con kính mến Chúa hết lòng hết sức, trên hết mọi sự, vì Chúa là Đấng trọn tốt trọn lành vô cùng, lại vì Chúa, thì con thương yêu người ta như mình con vậy. Amen.\n\n### Kinh Ăn Năn Tội\nLạy Chúa con, Chúa là Đấng trọn tốt trọn lành vô cùng. Chúa đã dựng nên con, và cho Con Chúa ra đời chịu nạn chịu chết vì con, mà con đã cả lòng phản nghịch lỗi nghĩa cùng Chúa, thì con lo buồn đau đớn, cùng chê ghét mọi tội con trên hết mọi sự; con dốc lòng chừa, và nhờ ơn Chúa, thì con sẽ lánh xa dịp tội, cùng làm việc đền tội cho xứng. Amen.\n\n### Kinh Cám Ơn\nLạy Chúa con, con cám ơn Đức Chúa Trời là Chúa lòng lành vô cùng, chẳng bỏ con, chẳng để con không đời đời, mà lại sinh ra con, cho con được làm người, cùng gìn giữ con, hằng che chở con; lại cho Ngôi Thứ Hai xuống thế làm người, chuộc tội chịu chết trên cây Thánh Giá vì con, lại cho con được đạo thánh Đức Chúa Trời, cùng chịu nhiều ơn nhiều phép Hội Thánh nữa, và đã cho phần xác con ngày hôm nay được mọi sự lành; lại cứu lấy con kẻo phải chết tươi ăn năn tội chẳng kịp. Vậy các Thánh ở trên thiên đàng, cám ơn Đức Chúa Trời thế nào, thì con cũng hợp cùng các Thánh mà dâng cho Chúa con cùng ngần ấy sự cám ơn. Amen.\n\n### Kinh Trông Cậy\nChúng con trông cậy Rất Thánh Đức Mẹ Chúa Trời, xin chớ chê chớ bỏ lời chúng con nguyện trong cơn gian nan thiếu thốn, Đức Nữ Đồng Trinh hiển vinh sáng láng.  \n*— Hằng chữa chúng con cho khỏi mọi sự dữ. Amen.*  \n- Lạy Rất Thánh Trái Tim Đức Chúa Giêsu — *Thương xót chúng con.*  \n- Lạy Trái Tim Cực Thanh Cực Tịnh Rất Thánh Đức Bà Maria — *Cầu cho chúng con.*  \n- Lạy Ông Thánh Giuse là bạn thanh sạch Đức Bà Maria trọn đời đồng trinh — *Cầu cho chúng con.*  \n- Các Thánh Tử Đạo Việt Nam — *Cầu cho chúng con.*\n"},{"id":"dieu-ran-phuc-that","title":"4. Mười Điều Răn, Sáu Điều Răn & Tám Mối Phúc","content":"\n### Mười Điều Răn Thiên Chúa\nĐạo Đức Chúa Trời có mười điều răn:\n- **Thứ nhất:** Thờ phượng một Đức Chúa Trời và kính mến Người trên hết mọi sự.\n- **Thứ hai:** Chớ kêu tên Đức Chúa Trời vô cớ.\n- **Thứ ba:** Giữ ngày Chúa Nhật.\n- **Thứ bốn:** Thảo kính cha mẹ.\n- **Thứ năm:** Chớ giết người.\n- **Thứ sáu:** Chớ làm sự dâm dục.\n- **Thứ bảy:** Chớ lấy của người.\n- **Thứ tám:** Chớ làm chứng dối.\n- **Thứ chín:** Chớ muốn vợ chồng người.\n- **Thứ mười:** Chớ tham của người.\n\n> Mười điều răn ấy tóm về hai điều này: trước kính mến một Đức Chúa Trời trên hết mọi sự, sau lại yêu người như mình ta vậy. Amen.\n\n---\n\n### Sáu Điều Răn Hội Thánh\n- **Thứ nhất:** Dâng lễ ngày Chúa Nhật cùng các ngày lễ buộc.\n- **Thứ hai:** Chớ làm việc xác ngày Chúa Nhật cùng các ngày lễ buộc.\n- **Thứ ba:** Xưng tội trong một năm ít là một lần.\n- **Thứ bốn:** Rước Mình Thánh Chúa trong Mùa Phục Sinh.\n- **Thứ năm:** Giữ chay và kiêng thịt những ngày Hội Thánh dạy.\n- **Thứ sáu:** Đóng góp cho các nhu cầu của Hội Thánh.\n\n---\n\n### Tám Mối Phúc Thật (Hiến Chương Nước Trời)\n1. Phúc cho ai có tinh thần nghèo khó, vì Nước Trời là của họ.\n2. Phúc cho ai hiền lành, vì họ sẽ được Đất Hứa làm gia nghiệp.\n3. Phúc cho ai sầu khổ, vì họ sẽ được Thiên Chúa ủi an.\n4. Phúc cho ai khát khao nên người công chính, vì họ sẽ được Thiên Chúa cho thỏa lòng.\n5. Phúc cho ai xót thương người, vì họ sẽ được Thiên Chúa xót thương.\n6. Phúc cho ai có tâm hồn trong sạch, vì họ sẽ được nhìn ngắm Thiên Chúa.\n7. Phúc cho ai xây dựng hòa bình, vì họ sẽ được gọi là con Thiên Chúa.\n8. Phúc cho ai bị bách hại vì sống công chính, vì Nước Trời là của họ.\n"},{"id":"cai-toi-va-bi-tich","title":"5. Cải Tội Bảy Mối & Bảy Bí Tích","content":"\n### Cải Tội Bảy Mối Có Bảy Đức:\n1. Khiêm nhượng chớ kiêu ngạo.\n2. Rộng rãi chớ hà tiện.\n3. Giữ mình sạch sẽ chớ mê dâm dục.\n4. Hay nhịn chớ hờn giận.\n5. Kiêng bớt chớ mê ăn uống.\n6. Yêu người chớ ghen ghét.\n7. Siêng năng việc Đức Chúa Trời chớ làm biếng.\n\n---\n\n### Bảy Bí Tích Của Hội Thánh:\n1. **Bí tích Rửa Tội** (Khai tâm)\n2. **Bí tích Thêm Sức** (Khai tâm)\n3. **Bí tích Thánh Thể** (Khai tâm)\n4. **Bí tích Giải Tội** (Chữa lành)\n5. **Bí tích Xức Dầu Bệnh Nhân** (Chữa lành)\n6. **Bí tích Truyền Chức Thánh** (Phục vụ cộng đoàn)\n7. **Bí tích Hôn Phối** (Phục vụ cộng đoàn)\n\n---\n\n### Kinh Cầu Cho Cha Mẹ & Giáo Xứ:\n*Lạy Chúa, xin chúc lành và ban muôn ơn lành xác hồn cho cha mẹ, thầy cô và quý ân nhân của chúng con. Xin gìn giữ giáo xứ An Ngãi chúng con trong tình hiệp nhất, bình an và hăng say loan báo Tin Mừng. Amen.*\n"},{"id":"kinh-man-coi","title":"6. Kinh Mân Côi — 20 Mầu Nhiệm Cứu Độ","content":"\nTràng Hạt Mân Côi là bản tóm lược toàn bộ Tin Mừng qua cái nhìn của Mẹ Maria:\n\n### NĂM SỰ VUI (Đọc vào thứ Hai & thứ Bảy)\n- **Thứ nhất:** Đức Bà chịu thai — *Xin cho được ở khiêm nhường.*\n- **Thứ hai:** Đức Bà đi viếng Bà Thánh Isave — *Xin cho được lòng yêu người.*\n- **Thứ ba:** Đức Bà sinh Đức Chúa Giêsu nơi máng cỏ — *Xin cho được lòng khó khăn.*\n- **Thứ bốn:** Đức Bà dâng Đức Chúa Giêsu trong đền thánh — *Xin cho được vâng lời chịu lụy.*\n- **Thứ năm:** Đức Bà tìm được Đức Chúa Giêsu trong đền thánh — *Xin cho được tìm kiếm Chúa luôn.*\n\n### NĂM SỰ SÁNG (Đọc vào thứ Năm)\n- **Thứ nhất:** Đức Chúa Giêsu chịu phép rửa tại sông Gio-đan — *Xin cho được sống xứng đáng là con cái Chúa.*\n- **Thứ hai:** Đức Chúa Giêsu dự tiệc cưới Cana — *Xin cho được vâng nghe lời Mẹ.*\n- **Thứ ba:** Đức Chúa Giêsu rao giảng Nước Trời và kêu gọi sám hối — *Xin cho được tin vào Tin Mừng và hoán cải đời sống.*\n- **Thứ bốn:** Đức Chúa Giêsu biến hình trên núi Thabor — *Xin cho được biến đổi tâm hồn.*\n- **Thứ năm:** Đức Chúa Giêsu lập Bí tích Thánh Thể — *Xin cho được sốt sắng kết hợp cùng Chúa Giêsu Thánh Thể.*\n\n### NĂM SỰ THƯƠNG (Đọc vào thứ Ba & thứ Sáu)\n- **Thứ nhất:** Đức Chúa Giêsu lo buồn đổ mồ hôi máu — *Xin cho được ăn năn tội nên.*\n- **Thứ hai:** Đức Chúa Giêsu chịu đánh đòn — *Xin cho được hãm mình chịu khó.*\n- **Thứ ba:** Đức Chúa Giêsu chịu đội mão gai — *Xin cho được chịu mọi sự sỉ nhục vì Chúa.*\n- **Thứ bốn:** Đức Chúa Giêsu vác Thánh giá — *Xin cho được vác Thánh giá theo chân Chúa.*\n- **Thứ năm:** Đức Chúa Giêsu chịu chết trên cây Thánh giá — *Xin cho được đóng đinh tính xác thịt vào Thánh giá Chúa.*\n\n### NĂM SỰ MỪNG (Đọc vào thứ Tư & Chúa Nhật)\n- **Thứ nhất:** Đức Chúa Giêsu sống lại — *Xin cho được sống lại thật về phần linh hồn.*\n- **Thứ hai:** Đức Chúa Giêsu lên trời — *Xin cho được ái mộ những sự trên trời.*\n- **Thứ ba:** Đức Chúa Thánh Thần hiện xuống — *Xin cho được đầy dẫy ơn Chúa Thánh Thần.*\n- **Thứ bốn:** Đức Chúa Trời cho Đức Mẹ lên trời — *Xin cho được ơn chết lành trong tay Mẹ.*\n- **Thứ năm:** Đức Chúa Trời thưởng Đức Mẹ trên trời — *Xin cho được thưởng cùng Đức Mẹ trên thiên đàng.*\n"}]'::jsonb,
  true,
  90,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  khoi = EXCLUDED.khoi,
  khoi_label = EXCLUDED.khoi_label,
  badge = EXCLUDED.badge,
  author = EXCLUDED.author,
  read_time = EXCLUDED.read_time,
  size = EXCLUDED.size,
  description = EXCLUDED.description,
  official_source_url = EXCLUDED.official_source_url,
  chapters = EXCLUDED.chapters,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();

-- Tài liệu: Toát Yếu Giáo Lý Hội Thánh Công Giáo
INSERT INTO public.documents (
  id,
  title,
  khoi,
  khoi_label,
  badge,
  author,
  read_time,
  size,
  description,
  official_source_url,
  file_url,
  chapters,
  is_active,
  sort_order,
  updated_at
) VALUES (
  'toat-yeu-giao-ly',
  'Toát Yếu Giáo Lý Hội Thánh Công Giáo',
  'all',
  'Tài Liệu Chung',
  'Văn Kiện',
  'Đức Thánh Cha Bênêđictô XVI — Vatican',
  '12 phút đọc',
  '5.2 KB',
  'Tóm tắt toàn bộ đức tin Công giáo dưới hình thức Hỏi - Đáp ngắn gọn, rõ ràng, dựa trên Sách Giáo lý Hội Thánh Công giáo (1992).',
  NULL,
  NULL,
  '[{"id":"tuyen-xung-duc-tin","title":"1. Tuyên Xưng Đức Tin (Tín Biểu Các Tông Đồ)","content":"\n**Hỏi: Ý định của Thiên Chúa đối với con người là gì?**  \n**Đáp:** Thiên Chúa vô cùng hoàn hảo và hạnh phúc tự muôn đời. Bởi ý định hoàn toàn tự do và lòng nhân hậu thuần túy, Người đã tạo dựng con người để cho con người được thông phần vào sự sống hạnh phúc vĩnh cửu của Người. Vì thế, vào thời viên mãn, Thiên Chúa Cha đã sai Con Một Người là Đấng Cứu Độ và Cứu Chuộc nhân loại khỏi tội lỗi để đưa chúng ta trở nên con cái Người.\n\n**Hỏi: Tại sao trong tâm hồn con người luôn có khao khát Thiên Chúa?**  \n**Đáp:** Khi tạo dựng con người theo hình ảnh Người, Thiên Chúa đã ghi khắc vào tâm hồn họ niềm khao khát được nhìn thấy Người. Dù con người thường bỏ qua ước muốn này, Thiên Chúa không ngừng lôi kéo con người đến với Người, bởi vì chỉ nơi Thiên Chúa, con người mới tìm thấy chân lý và hạnh phúc trọn vẹn mà họ không ngừng tìm kiếm.\n\n**Hỏi: Thiên Chúa mặc khải trọn vẹn nhất nơi ai?**  \n**Đáp:** Nơi Đức Giêsu Kitô. Người là Ngôi Lời nhập thể của Chúa Cha. Nơi Đức Kitô, Thiên Chúa đã nói hết mọi sự và không còn một mặc khải công nào khác nữa sau Người.\n\n**Hỏi: Mầu nhiệm trung tâm của đức tin và đời sống Kitô giáo là gì?**  \n**Đáp:** Đó là Mầu nhiệm Thiên Chúa Ba Ngôi cực thánh: Chúa Cha, Chúa Con và Chúa Thánh Thần. Ba Ngôi phân biệt nhưng cùng một bản tính duy nhất, một uy quyền và một vinh quang như nhau.\n"},{"id":"cu-hanh-mau-nhiem","title":"2. Cử Hành Mầu Nhiệm Kitô Giáo (Phụng Vụ & 7 Bí Tích)","content":"\n**Hỏi: Phụng vụ là gì?**  \n**Đáp:** Phụng vụ là việc cử hành Mầu nhiệm Đức Kitô, và đặc biệt là Mầu nhiệm Vượt Qua của Người. Trong Phụng vụ, Chúa Kitô thi hành chức vụ Tư tế của Người cùng với Hội Thánh là Thân Thể mầu nhiệm, để thánh hóa con người và tôn vinh Thiên Chúa Cha.\n\n**Hỏi: Bảy Bí tích được phân loại thế nào?**  \n**Đáp:** Bảy Bí tích được chia làm ba nhóm:\n1. **Các Bí tích Khai Tâm Kitô giáo:** Bí tích Rửa Tội, Bí tích Thêm Sức và Bí tích Thánh Thể. Ba bí tích này đặt nền tảng cho toàn bộ đời sống Kitô hữu.\n2. **Các Bí tích Chữa Lành:** Bí tích Giải Tội (Giao Hòa) và Bí tích Xức Dầu Bệnh Nhân. Giúp chữa lành và phục hồi con người khỏi bệnh tật phần hồn cũng như phần xác.\n3. **Các Bí tích Phục Vụ Sự Hiệp Thông & Sứ Vụ:** Bí tích Truyền Chức Thánh và Bí tích Hôn Phối. Trao ban ân sủng đặc biệt cho một sứ mạng chuyên biệt trong Hội Thánh.\n\n**Hỏi: Tại sao Bí tích Thánh Thể là nguồn mạch và đỉnh cao của đời sống Kitô giáo?**  \n**Đáp:** Vì trong Bí tích Thánh Thể chứa đựng trọn vẹn chính Chúa Giêsu Kitô — Mình và Máu, linh hồn và thần tính của Người — Đấng là nguồn mạch mọi ân sủng và ơn cứu độ của chúng ta.\n"},{"id":"doi-song-trong-duc-kito","title":"3. Đời Sống Trong Đức Kitô (Luân Lý & Giới Răn)","content":"\n**Hỏi: Căn bản phẩm giá con người dựa trên điều gì?**  \n**Đáp:** Phẩm giá con người dựa trên việc họ được Thiên Chúa tạo dựng theo hình ảnh và giống như Người, có linh hồn thiêng liêng, có trí khôn để hiểu biết và ý chí tự do để yêu thương.\n\n**Hỏi: Các nhân đức là gì?**  \n**Đáp:** Nhân đức là thói quen tốt và xu hướng kiên định để làm điều lành. Hội Thánh phân biệt:\n- **Ba Nhân đức Đối Thần:** Tin, Cậy, Mến (hướng thẳng về Thiên Chúa).\n- **Bốn Nhân đức Trụ:** Khôn ngoan, Công bằng, Dũng cảm, Tiết độ (điều chỉnh hành vi đạo đức nhân bản).\n\n**Hỏi: Luật mới hay Luật Tin Mừng là gì?**  \n**Đáp:** Luật mới là chính ân sủng của Chúa Thánh Thần được ban cho các tín hữu qua đức tin vào Đức Kitô. Luật này được tóm kết trong **Giới Răn Yêu Thương** của Chúa Giêsu: *\"Anh em hãy yêu thương nhau như Thầy đã yêu thương anh em\"* (Ga 13, 34), và được diễn tả sống động qua **Tám Mối Phúc Thật**.\n"},{"id":"kinh-nguyen-kito-giao","title":"4. Kinh Nguyện Kitô Giáo (Cầu Nguyện & Kinh Lạy Cha)","content":"\n**Hỏi: Cầu nguyện là gì?**  \n**Đáp:** Theo Thánh Têrêsa Hài Đồng Giêsu: *\"Cầu nguyện là sự hướng lòng lên, là cái nhìn đơn sơ hướng về trời, là tiếng kêu tri ân và yêu mến giữa cơn thử thách cũng như lúc hân hoan.\"* Cầu nguyện là cuộc đối thoại thân tình giữa Thiên Chúa và con người.\n\n**Hỏi: Có những hình thức cầu nguyện nào?**  \n**Đáp:** Có năm hình thức cầu nguyện chính yếu:\n1. **Chúc tụng và Thờ lạy:** Tôn vinh sự cao cả của Thiên Chúa là Đấng Tạo Hóa.\n2. **Cầu xin:** Xin ơn tha thứ tội lỗi và xin những ơn cần thiết phần hồn phần xác.\n3. **Chuyển cầu:** Cầu nguyện thay cho tha nhân noi gương Chúa Giêsu.\n4. **Tạ ơn:** Tri ân Thiên Chúa vì muôn ơn lành Người thương ban.\n5. **Ngợi khen:** Tán tụng Thiên Chúa chỉ vì chính Người là Đấng Thánh.\n\n**Hỏi: Tại sao Kinh Lạy Cha được gọi là Bản Tóm Lược Toàn Bộ Tin Mừng?**  \n**Đáp:** Vì Kinh Lạy Cha do chính Chúa Giêsu dạy cho các Tông đồ (Mt 6, 9-13). Lời kinh này vừa dạy ta biết cầu xin những điều gì, vừa dạy ta thứ tự ưu tiên của những ước muốn: trước hết là Danh Cha, Nước Cha và Ý Cha; sau đó là lương thực hằng ngày, ơn tha thứ, sự gìn giữ trước cám dỗ và sự giải thoát khỏi ma quỷ dữ dằn.\n"}]'::jsonb,
  true,
  100,
  now()
)
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  khoi = EXCLUDED.khoi,
  khoi_label = EXCLUDED.khoi_label,
  badge = EXCLUDED.badge,
  author = EXCLUDED.author,
  read_time = EXCLUDED.read_time,
  size = EXCLUDED.size,
  description = EXCLUDED.description,
  official_source_url = EXCLUDED.official_source_url,
  chapters = EXCLUDED.chapters,
  is_active = EXCLUDED.is_active,
  sort_order = EXCLUDED.sort_order,
  updated_at = now();
