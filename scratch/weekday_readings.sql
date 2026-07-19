-- ==========================================
-- THỨ HAI TUẦN 16 MÙA THƯỜNG NIÊN
-- ==========================================

-- 1. BẢN GHI DÙNG CHUNG (TẤT CẢ) - CHỈ CHỨA PHÚC ÂM
INSERT INTO public.liturgy_contents (
  liturgy_key, cycle, title, quote,
  gospel_ref, gospel_alleluia, gospel_intro, gospel_content,
  reflection
) VALUES (
  'thuong_16_thu2', 'all',
  'Thứ Hai Tuần XVI Mùa Thường Niên',
  '« Nữ hoàng phương Nam sẽ đứng lên kết án thế hệ này. »',
  
  -- PHÚC ÂM
  'Mt 12, 38-42',
  'Ha-lê-lui-a. Ha-lê-lui-a. Lạy Chúa, xin mở lòng chúng con, để chúng con lắng nghe lời Con của Chúa. Ha-lê-lui-a.',
  '✠ Tin Mừng Chúa Giê-su Ki-tô theo thánh Mát-thêu.',
  '38 Khi ấy, có mấy người trong nhóm kinh sư và nhóm Pha-ri-sêu nói với Đức Giê-su rằng : "Thưa Thầy, chúng tôi muốn thấy Thầy làm một dấu lạ." 39 Người đáp : "Thế hệ gian ác và ngoại tình này đòi dấu lạ. Nhưng chúng sẽ không được thấy dấu lạ nào, ngoài dấu lạ ngôn sứ Giô-na. 40 Quả thật, ông Giô-na đã ở trong bụng kình ngư ba ngày ba đêm thế nào, thì Con Người cũng sẽ ở trong lòng đất ba ngày ba đêm như vậy. 41 Trong cuộc Phán Xét, dân thành Ni-ni-vê sẽ trỗi dậy cùng với thế hệ này và sẽ kết án họ, vì xưa dân ấy đã sám hối khi nghe ông Giô-na rao giảng; mà đây thì còn hơn ông Giô-na nữa. 42 Trong cuộc Phán Xét, Nữ hoàng phương Nam sẽ đứng lên cùng với thế hệ này, và bà sẽ kết án họ, vì xưa bà đã từ tận cùng trái đất đến nghe lời khôn ngoan của vua Sa-lô-môn; mà đây thì còn hơn vua Sa-lô-môn nữa."',

  -- SUY NIỆM
  'Dấu lạ lớn nhất mà Thiên Chúa ban cho chúng ta không phải là những phép lạ kinh thiên động địa, mà chính là sự chết và phục sinh của Chúa Giê-su Ki-tô (dấu lạ Giô-na). Thay vì tìm kiếm những dấu lạ bên ngoài, chúng ta được mời gọi nhìn nhận sự hiện diện của Chúa trong lời giảng dạy và các Bí tích.'
)
ON CONFLICT (liturgy_key, cycle) 
DO UPDATE SET 
  title = EXCLUDED.title, quote = EXCLUDED.quote,
  gospel_ref = EXCLUDED.gospel_ref, gospel_alleluia = EXCLUDED.gospel_alleluia, gospel_intro = EXCLUDED.gospel_intro, gospel_content = EXCLUDED.gospel_content,
  reflection = EXCLUDED.reflection;


-- 2. BẢN GHI NĂM LẺ (I) - CHỈ CHỨA BÀI ĐỌC 1 & ĐÁP CA
INSERT INTO public.liturgy_contents (
  liturgy_key, cycle,
  r1_ref, r1_quote, r1_intro, r1_content,
  psalm_ref, psalm_content
) VALUES (
  'thuong_16_thu2', 'I',
  
  -- BÀI ĐỌC 1
  'Xh 14, 5-18',
  'Họ sẽ biết Ta là Đức Chúa.',
  'Bài trích sách Xuất Hành.',
  '5 Người ta báo cho vua Ai-cập là dân đã trốn rồi. Pha-ra-ôn và bề tôi liền đổi lòng dạ với dân; họ nói : "Ta đã làm gì thế này ? Ta đã để cho Ít-ra-en đi, không làm nô lệ ta nữa !" 6 Vua ách ngựa vào chiến xa, và đem quân cùng đi. 7 Vua đem theo sáu trăm chiến xa loại nhất và tất cả các chiến xa của Ai-cập, xe nào cũng có tam mã... (Bổ sung thêm nội dung)',

  -- ĐÁP CA
  'Xh 15, 1bc-2.3-4.5-6',
  'Đ. Ta hát mừng Chúa, Đấng cao cả uy hùng.

1bc Ta hát mừng Chúa, Đấng cao cả uy hùng:
Kỵ binh cùng chiến mã, Người xô xuống đại dương.
2 Chúa là sức mạnh tôi, là Đấng tôi ca ngợi,
chính Người cứu thoát tôi.
Người là Chúa tôi thờ, xin tôn vinh ngợi bái,
Người là Chúa tổ tiên, xin uy danh rạng ngời.

3 Chúa là chiến binh, danh Người là "Đức Chúa".
4 Chiến xa Pha-ra-ôn cùng lực lượng của vua,
Người xô xuống đại dương.
Những tướng lãnh tinh nhuệ nhất của vua
đều chết chìm trong Biển Sậy.'
)
ON CONFLICT (liturgy_key, cycle) 
DO UPDATE SET 
  r1_ref = EXCLUDED.r1_ref, r1_quote = EXCLUDED.r1_quote, r1_intro = EXCLUDED.r1_intro, r1_content = EXCLUDED.r1_content,
  psalm_ref = EXCLUDED.psalm_ref, psalm_content = EXCLUDED.psalm_content;


-- 3. BẢN GHI NĂM CHẴN (II) - CHỈ CHỨA BÀI ĐỌC 1 & ĐÁP CA
INSERT INTO public.liturgy_contents (
  liturgy_key, cycle,
  r1_ref, r1_quote, r1_intro, r1_content,
  psalm_ref, psalm_content
) VALUES (
  'thuong_16_thu2', 'II',
  
  -- BÀI ĐỌC 1
  'Mk 6, 1-4.6-8',
  'Hỡi người, bạn đã được nói cho hay điều gì là thiện, điều gì Đức Chúa đòi hỏi nơi bạn: đó là thực thi công lý.',
  'Bài trích sách ngôn sứ Mi-kha.',
  '1 Hãy nghe điều Đức Chúa phán : "Đứng lên ! Hãy đưa vụ kiện ra trước núi đồi; hãy cho các gò đống nghe tiếng ngươi !" 2 Hỡi núi đồi, hãy nghe Đức Chúa tố cáo, hỡi nền móng cõi đất, hãy lắng tai ! Vì Đức Chúa mở cuộc tố cáo dân Người, Người đưa Ít-ra-en ra toà xét xử... (Bổ sung thêm nội dung)',

  -- ĐÁP CA
  'Tv 49, 5-6.8-9.16bc-17.21 và 23',
  'Đ. Kẻ sống đi con đường chính trực,
Thiên Chúa sẽ cho hưởng ơn cứu độ.

5 "Hãy tập hợp các tín đồ của Ta lại đây,
những người đã kề kết giao ước với Ta
nhờ hiến tế."
6 Cửu trùng loan truyền Thiên Chúa chí công,
vì chính Người là Đấng xét xử.

8 Ta không trách cứ ngươi về các hy lễ,
lễ toàn thiêu của ngươi ngày nào cũng ở trước nhan Ta.
9 Ta không đòi bắt bò tơ trong nhà ngươi,
cũng chẳng cần dê đực nơi ràn chiên của ngươi.'
)
ON CONFLICT (liturgy_key, cycle) 
DO UPDATE SET 
  r1_ref = EXCLUDED.r1_ref, r1_quote = EXCLUDED.r1_quote, r1_intro = EXCLUDED.r1_intro, r1_content = EXCLUDED.r1_content,
  psalm_ref = EXCLUDED.psalm_ref, psalm_content = EXCLUDED.psalm_content;
