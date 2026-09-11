// src/data/documents/docData.js
// Cơ sở dữ liệu số hóa các tài liệu tham khảo giáo lý chuẩn mực Công giáo
// Giáo Xứ An Ngãi — Giáo Phận Đà Nẵng

export const DOCUMENTS_DATA = {
  // ==========================================================================
  // KHỐI CHIÊN CON (6 - 9 TUỔI)
  // ==========================================================================
  "cam-nang-khai-tam-chien-con": {
    id: "cam-nang-khai-tam-chien-con",
    title: "Cẩm Nang Khai Tâm — Em Học Làm Dấu & Cầu Nguyện",
    khoi: "chien-con",
    khoiLabel: "Khối Chiên Con",
    badge: "Chiên Con",
    author: "Ban Giáo Lý Ấu Nhi — Giáo Xứ An Ngãi",
    readTime: "5 phút đọc",
    size: "4.3 KB",
    description: "Tài liệu vỡ lòng sinh động, hướng dẫn các em ấu nhi cách bước vào nhà thờ, làm dấu Thánh Giá, chào Chúa Giêsu Thánh Thể và những lời kinh đơn sơ hằng ngày.",
    chapters: [
      {
        id: "buoc-vao-nha-chua",
        title: "1. Em Bước Vào Ngôi Nhà Của Chúa",
        content: `
Nhà thờ là ngôi nhà linh thiêng đặc biệt nhất trần gian, vì nơi đây có **Chúa Giêsu Thánh Thể** hằng ngày ngự trị trong Nhà Tạm để chờ đón các em đến thăm và chuyện trò.

### Khi bước vào cổng nhà thờ:
1. **Lấy nước thánh làm dấu:** Em chấm tay phải vào chén Nước Thánh ở cửa, làm dấu Thánh Giá một cách khoan thai để nhắc nhớ ngày em được Rửa Tội làm con Chúa.
2. **Chào Chúa Giêsu Thánh Thể:** Nhìn thẳng lên Nhà Tạm (nơi có ngọn đèn chầu màu đỏ luôn thắp sáng), em quỳ chân phải sát đất, cúi đầu tôn kính và thưa thầm: *"Lạy Chúa Giêsu Thánh Thể, con kính chào Chúa!"*.
3. **Giữ yên lặng và trang nghiêm:** Đi nhẹ, nói khẽ, không chạy nhảy hay rượt đuổi; không mang quà bánh, kẹo cao su hay đồ chơi vào trong thánh đường.
4. **Trang phục sạch đẹp:** Quần áo lịch sự, gọn gàng, đầu tóc chải ngay ngắn để tỏ lòng tôn kính Chúa và tôn trọng mọi người.
`
      },
      {
        id: "dau-thanh-gia",
        title: "2. Em Học Làm Dấu Thánh Giá",
        content: `
Dấu Thánh Giá là huy hiệu và dấu ấn tình yêu tuyệt vời của người Kitô hữu. Khi làm dấu Thánh Giá, em tuyên xưng mầu nhiệm **Một Chúa Ba Ngôi** và tình yêu Chúa Giêsu đã chịu chết trên Thánh Giá để cứu chuộc em.

### Cách làm Dấu Thánh Giá chuẩn mực:
- Bàn tay trái đặt phẳng ngay ngắn trên ngực (nơi trái tim).
- Bàn tay phải mở thẳng, các ngón khép lại:
  - **Đưa lên trán:** Đọc dõng dạc *"Nhân danh Cha"*, xin Chúa soi sáng trí khôn và suy nghĩ của em luôn ngay thật.
  - **Đưa xuống giữa ngực:** Đọc *"và Con"*, xin Chúa ngự vào lòng để em biết yêu mến Chúa và yêu thương mọi người.
  - **Đưa sang vai trái rồi qua vai phải:** Đọc *"và Thánh Thần"*, xin Chúa ban sức mạnh chúc lành cho mọi việc đôi tay em làm.
  - **Chắp hai tay lại trước ngực:** Đọc *"Amen!"*, nghĩa là *"Con tin thật như vậy!"*.
`
      },
      {
        id: "kinh-nguyen-don-so",
        title: "3. Những Lời Cầu Nguyện Đơn Sơ Của Bé",
        content: `
Cầu nguyện đơn giản là trò chuyện thân tình với Chúa Giêsu như một người Cha nhân từ và người Bạn tốt nhất của em.

### Lời nguyện khi thức dậy buổi sáng:
> "Lạy Chúa Giêsu, con tạ ơn Chúa đã cho con một đêm ngủ ngon và thức dậy bình an. Hôm nay, con xin dâng cho Chúa mọi lời nói, việc làm và việc học tập của con. Xin giữ gìn con luôn là em bé ngoan. Amen."

### Lời nguyện trước và sau bữa ăn:
> "Lạy Chúa, xin chúc lành cho thức ăn này chúng con sắp dùng, và xin trả công bội hậu cho ba mẹ đã vất vả nuôi nấng chúng con. Amen."

### Lời nguyện trước khi đi ngủ buổi tối:
> "Lạy Chúa, một ngày lại trôi qua, con cảm tạ Chúa vì muôn ơn lành. Xin Chúa tha thứ những lỗi lầm hôm nay con trót phạm, và xin sai các Thiên thần gìn giữ giấc ngủ của con và cả gia đình con đêm nay. Amen."
`
      },
      {
        id: "chua-yeu-tre-nho",
        title: "4. Chúa Giêsu — Người Bạn Thân Của Em",
        content: `
Trong Tin Mừng, Chúa Giêsu đặc biệt yêu quý các em thiếu nhi. Người từng ôm các em vào lòng, đặt tay chúc lành và phán với các môn đệ:

> "Cứ để trẻ em đến với Thầy, đừng ngăn cấm chúng, vì Nước Thiên Chúa là của những ai giống như chúng."  
> — *Tin Mừng theo Thánh Mác-cô (Mc 10, 14)*

### Em làm gì để trở thành người bạn ngoan của Chúa?
- **Ở nhà:** Vâng lời ông bà cha mẹ, giúp đỡ việc nhà vừa sức, yêu thương anh chị em.
- **Ở trường:** Chăm chỉ học bài, thật thà trong kiểm tra, không nói tục chửi thề, biết chia sẻ đồ dùng với bạn.
- **Ở nhà thờ:** Siêng năng đi lễ Chúa Nhật, chăm chú lắng nghe Lời Chúa và hăng hái tham gia giờ học giáo lý.
`
      }
    ]
  },

  // ==========================================================================
  // KHỐI RƯỚC LỄ (10 - 12 TUỔI)
  // ==========================================================================
  "cam-nang-xet-minh-ruoc-le": {
    id: "cam-nang-xet-minh-ruoc-le",
    title: "Cẩm Nang Xét Mình & Dọn Lòng Rước Lễ Sốt Sắng",
    khoi: "ruoc-le",
    khoiLabel: "Khối Rước Lễ",
    badge: "Rước Lễ",
    author: "Ban Giáo Lý Thiếu Nhi — Giáo Xứ An Ngãi",
    readTime: "6 phút đọc",
    size: "4.2 KB",
    description: "Hướng dẫn các em thiếu nhi 5 bước xưng tội nên, bản xét mình chi tiết theo 10 Điều Răn và tâm tình sốt mến khi rước Mình Thánh Chúa.",
    chapters: [
      {
        id: "5-buoc",
        title: "1. Năm Bước Để Xưng Tội Nên",
        content: `
Bí tích Giải Tội (Giao Hòa) là dòng suối Lòng Thương Xót tuôn đổ ơn tha thứ của Chúa. Để việc lãnh nhận Bí tích được trọn vẹn, em hãy thực hiện đủ 5 bước sau:

1. **Xét mình:** Dành vài phút thinh lặng trước Thánh Giá, xin Chúa soi sáng để nhớ lại những tư tưởng, lời nói và hành vi sai trái đã phạm từ lần xưng tội trước.
2. **Ăn năn tội:** Là bước quan trọng nhất — thực lòng đau buồn, hối tiếc vì tội lỗi của mình đã làm buồn lòng Chúa là Cha chí nhân vô cùng.
3. **Dốc lòng chừa:** Quyết tâm bằng hành động cụ thể không tái phạm tội ấy nữa và kiên quyết tránh xa các dịp dễ dẫn ta sa ngã phạm tội.
4. **Xưng tội:** Tiến vào tòa giải tội, thành thật, khiêm tốn xưng hết các tội của mình với linh mục đại diện Chúa, không giấu giếm hay quanh co.
5. **Đền tội:** Sốt sắng làm việc đền tội theo lời dặn của linh mục (như đọc một đoạn kinh, làm một việc lành bác ái) và sửa chữa những thiệt hại do lỗi lầm mình gây ra.
`
      },
      {
        id: "bang-xet-minh",
        title: "2. Bảng Xét Mình Dành Cho Thiếu Nhi",
        content: `
### Bổn phận đối với Chúa:
- Em có lười biếng bỏ đọc kinh sớm tối không?
- Em có chia trí, nghịch ngợm, nói chuyện hay dùng điện thoại trong giờ Thánh Lễ không?
- Em có vô cớ kêu tên Chúa, Đức Mẹ hay các Thánh trong những câu nói đùa vô bổ không?
- Em có xấu hổ không dám làm dấu Thánh Giá và nhận mình là người Công giáo trước mặt bạn bè không?

### Bổn phận đối với Cha Mẹ, Thầy Cô & Bề Trên:
- Em có cãi lời, hỗn láo, bực bội hay làm cha mẹ phải buồn lòng khóc vì mình không?
- Em có trốn học giáo lý, đi lễ trễ giờ hay lười biếng không làm bài tập được giao không?
- Em có nói dối cha mẹ, thầy cô để bao che cho khuyết điểm của mình không?

### Bổn phận đối với Bạn Bè & Tha Nhân:
- Em có đánh nhau, bắt nạt, nói xấu sau lưng hay cô lập bạn bè trong lớp không?
- Em có trộm cắp tiền bạc, đồ chơi hay đồ dùng học tập của người khác không?
- Em có ghen tị, tức tối khi thấy người khác học giỏi hơn hay được khen thưởng không?
- Em có xem các hình ảnh, video xấu độc hại trên mạng Internet không?
`
      },
      {
        id: "ruoc-le",
        title: "3. Tâm Tình Khi Rước Mình Thánh Chúa",
        content: `
Khi tiến lên rước Chúa, em hãy nhớ rằng đây chính là **Đức Giêsu Kitô hằng sống** ngự vào lòng em thật sự dưới hình Bánh:

### 1. Chuẩn bị chu đáo:
- Giữ chay Thánh Thể ít nhất 1 giờ trước khi rước lễ (không ăn quà vặt, bánh kẹo hay uống nước ngọt; chỉ được uống nước lọc hoặc dùng thuốc chữa bệnh).
- Tâm hồn sạch tội trọng (nếu lỡ phạm tội nặng thì phải xưng tội trước khi lên rước lễ).

### 2. Tư thế tiến lên rước Chúa:
- Xếp hàng ngay ngắn, hai tay chắp trước ngực ngang tầm tim.
- Khi Linh mục hay Thừa tác viên giơ Mình Thánh và nói: *"Mình Thánh Chúa Kitô"*, em ngước nhìn với lòng tin kính và thưa dõng dạc: *"Amen!"* (nghĩa là: Con tin thật!).

### 3. Cầu nguyện sau khi rước lễ:
- Trở về ghế, quỳ gối sốt sắng, nhắm mắt lại để trò chuyện thân mật với Chúa Giêsu đang ở ngay trong tâm hồn mình.
- Dâng lời cảm tạ: *"Lạy Chúa Giêsu, con cảm tạ Chúa vì Chúa đã đến ngự trong lòng con. Xin gìn giữ linh hồn con luôn tinh sạch để Chúa vui thích ở lại cùng con mãi mãi."*
`
      }
    ]
  },

  // ==========================================================================
  // KHỐI THÊM SỨC (13 - 15 TUỔI)
  // ==========================================================================
  "7-on-chua-thanh-than": {
    id: "7-on-chua-thanh-than",
    title: "7 Ơn Chúa Thánh Thần & 12 Hoa Trái Thần Khí",
    khoi: "them-suc",
    khoiLabel: "Khối Thêm Sức",
    badge: "Thêm Sức",
    author: "Ủy Ban Giáo Lý Đức Tin — HĐGMVN",
    readTime: "8 phút đọc",
    size: "5.9 KB",
    description: "Tài liệu học và suy niệm 7 ơn Chúa Thánh Thần cùng 12 hoa trái Thần Khí dành riêng cho các em chuẩn bị lãnh nhận Bí tích Thêm Sức.",
    chapters: [
      {
        id: "intro",
        title: "1. Ý Nghĩa Bí Tích Thêm Sức",
        content: `
Bí tích Thêm Sức là một trong ba Bí tích Khai Tâm Kitô giáo (cùng với Bí tích Rửa Tội và Bí tích Thánh Thể). Nếu Bí tích Rửa Tội sinh chúng ta vào đời sống mới trong Đức Kitô, thì Bí tích Thêm Sức kiện toàn ân sủng đó, ghi vào linh hồn người tín hữu một dấu ấn thiêng liêng không thể tẩy xóa, và đổ tràn ơn Chúa Thánh Thần để họ trở nên những chứng nhân can đảm của Tin Mừng.

> "Khi Đấng Bảo Trợ đến, Đấng mà Thầy sẽ sai đến với anh em từ nơi Chúa Cha, Người là Thần Khí sự thật phát xuất từ Chúa Cha, Người sẽ làm chứng về Thầy."  
> — *Tin Mừng theo Thánh Gioan (Ga 15, 26)*

Qua việc Giám mục đặt tay và xức Dầu Thánh Chrisma trên trán, người Kitô hữu được lãnh nhận dồi dào 7 ơn thiêng của Chúa Thánh Thần, giúp họ sống đức tin kiên định giữa đời.
`
      },
      {
        id: "bay-on",
        title: "2. Bảy Ơn Chúa Thánh Thần",
        content: `
Dựa theo sách ngôn sứ Isaia (Is 11, 1-2), Hội Thánh dạy chúng ta về 7 hồng ân đặc biệt mà Chúa Thánh Thần trao ban:

### 1. Ơn Khôn Ngoan (Sapientia)
- **Ý nghĩa:** Nhìn thấy mọi sự theo nhãn quan của Thiên Chúa, biết phân định điều gì thực sự có giá trị vĩnh cửu và đặt Chúa lên trên hết mọi của cải trần gian.
- **Thực hành sống:** Một bạn trẻ từ chối nói dối hoặc gian lận dù bị bạn bè lôi kéo, vì biết sống chân thật làm đẹp lòng Chúa.

### 2. Ơn Hiểu Biết (Intellectus)
- **Ý nghĩa:** Giúp trí khôn thấu hiểu sâu sắc các mầu nhiệm đức tin, Lời Chúa trong Kinh Thánh và nhận ra sự hiện diện của Chúa trong cuộc sống thường ngày.
- **Thực hành sống:** Khi đọc một đoạn Phúc Âm hay nghe giảng lễ, em tự nhiên hiểu được Chúa đang nhắn nhủ điều gì cho chính bản thân mình hôm nay.

### 3. Ơn Biết Lo Liệu (Consilium)
- **Ý nghĩa:** Ơn phân định và hướng dẫn ta biết lựa chọn con đường tốt lành, hành động đúng đắn theo thánh ý Chúa trong những tình huống bối rối, khó khăn.
- **Thực hành sống:** Biết khi nào nên khuyên nhủ bạn bè, khi nào nên im lặng cầu nguyện; biết chọn cách ứng xử bác ái thay vì nóng giận.

### 4. Ơn Sức Mạnh (Fortitudo)
- **Ý nghĩa:** Ban cho ta lòng dũng cảm, can trường để vượt qua các cơn cám dỗ, đau khổ, và không sợ hãi khi phải làm chứng cho đức tin trước mặt người đời.
- **Thực hành sống:** Dám công khai làm dấu Thánh Giá và cầu nguyện trước bữa ăn ở trường học, đám đông mà không hề e ngại hay xấu hổ.

### 5. Ơn Thông Minh (Scientia)
- **Ý nghĩa:** Nhận biết vẻ đẹp của thế giới tạo thành và nhìn ra dấu vết yêu thương của Thiên Chúa trong vạn vật; dùng tài năng trí tuệ để phụng sự tha nhân.
- **Thực hành sống:** Chăm chỉ học tập không phải để kiêu ngạo, mà để trở thành người có ích, phục vụ cộng đoàn và làm sáng danh Chúa.

### 6. Ơn Đạo Đức (Pietas)
- **Ý nghĩa:** Đặt nền móng trên tình yêu thảo hiếu sâu sắc đối với Thiên Chúa là Cha, và lòng nhân ái chân thành đối với mọi người là anh chị em trong Chúa.
- **Thực hành sống:** Sốt sắng tham dự Thánh Lễ và rước Chúa mỗi Chúa Nhật với tâm tình con thảo, sẵn sàng giúp đỡ người già yếu và các bạn cơ nhỡ.

### 7. Ơn Kính Sợ Chúa (Timor Domini)
- **Ý nghĩa:** Không phải là nỗi sợ hãi trừng phạt hay khiếp sợ, mà là lòng tôn kính sâu xa trước Đấng Toàn Năng cực thánh và sợ làm buồn lòng Người là Cha nhân từ.
- **Thực hành sống:** Tránh xa các thói quen xấu, không xem những nội dung độc hại vì yêu mến và muốn gìn giữ tâm hồn thanh sạch trước nhan Chúa.
`
      },
      {
        id: "hoa-trai",
        title: "3. Mười Hai Hoa Trái Chúa Thánh Thần",
        content: `
Khi một tâm hồn biết ngoan ngùy cộng tác với ơn Chúa Thánh Thần, đời sống của người ấy sẽ trổ sinh 12 hoa trái thánh thiện (Gl 5, 22-23 theo bản Phổ Thông):

1. **Bác ái (Caritas):** Yêu thương Chúa trên hết mọi sự và yêu thương tha nhân như chính mình.
2. **Hoan lạc (Gaudium):** Niềm vui sâu xa trong tâm hồn vì luôn có Chúa ở cùng.
3. **Bình an (Pax):** Sự thanh thản, an tĩnh dù cuộc sống gặp sóng gió.
4. **Nhẫn nại (Patientia):** Kiên tâm chịu đựng thử thách và bao dung với lỗi lầm của người khác.
5. **Nhân từ (Benignitas):** Lòng tốt lành, luôn sẵn sàng tha thứ và nâng đỡ.
6. **Lương thiện (Bonitas):** Làm điều lành một cách quảng đại, không toan tính vụ lợi.
7. **Khoan dung (Longanimitas):** Kiên nhẫn chờ đợi kẻ tội lỗi ăn năn hối cải.
8. **Hiền hòa (Mansuetudo):** Ôn hòa, khiêm tốn trong lời ăn tiếng nói và hành xử.
9. **Trung tín (Fides):** Trung kiên trong lời hứa, giữ vững đức tin đến cùng.
10. **Khiêm tốn (Modestia):** Giản dị, trang nhã, không kiêu căng tự mãn.
11. **Tiết độ (Continentia):** Biết kiềm chế những ước muốn bất chính và làm chủ bản thân.
12. **Thanh khiết (Castitas):** Giữ gìn thân xác và linh hồn trong sạch xứng đáng là đền thờ Chúa Thánh Thần.
`
      },
      {
        id: "prayer",
        title: "4. Kinh Xin Ơn Chúa Thánh Thần",
        content: `
*Lạy Chúa Thánh Thần, xin ngự đến làm mới lại lòng chúng con.*  
*Xin soi sáng tâm trí, đốt lên ngọn lửa tình yêu nồng nàn trong trái tim chúng con.*  
*Xin ban cho chúng con 7 ơn Thánh thiện của Ngài,*  
*để chúng con nên những Kitô hữu trưởng thành, can đảm làm chứng cho Chúa Kitô*  
*bằng lời nói và trọn cả cuộc sống của chúng con. Amen.*
`
      }
    ]
  },

  // ==========================================================================
  // KHỐI PHỤNG VỤ
  // ==========================================================================
  "so-tay-le-sinh": {
    id: "so-tay-le-sinh",
    title: "Sổ Tay Lễ Sinh & Thừa Tác Vụ Bàn Thờ",
    khoi: "phung-vu",
    khoiLabel: "Khối Phụng Vụ",
    badge: "Phụng Vụ",
    author: "Ban Phụng Vụ Giáo Xứ An Ngãi",
    readTime: "7 phút đọc",
    size: "3.0 KB",
    description: "Cẩm nang hướng dẫn tác phong, nghi thức giúp lễ, ý nghĩa phẩm phục và thứ tự phụng vụ thánh lễ trang nghiêm, sốt sắng.",
    chapters: [
      {
        id: "vai-tro",
        title: "1. Ơn Gọi & Tác Phong Người Lễ Sinh",
        content: `
Lễ sinh là những người được diễm phúc phụng sự bàn thờ Chúa gần gũi nhất bên cạnh vị chủ tế. Tác phong của em ảnh hưởng trực tiếp đến sự trang nghiêm và tâm tình sốt sắng của cả cộng đoàn phụng vụ.

### Những Tiêu Chuẩn Cần Có:
1. **Đến sớm trước lễ:** Ít nhất 15 phút để chuẩn bị tâm hồn, mặc áo lễ sạch sẽ, thắp nến và chuẩn bị đồ thánh.
2. **Tác phong chững chạc:** Đi đứng khoan thai, hai bàn tay chắp trước ngực ngang tầm tim. Không nhìn dáo dác hay nói chuyện riêng trên cung thánh.
3. **Tôn kính Nhà Tạm:** Luôn bái gối sâu trước Nhà Tạm có Mình Thánh Chúa khi bước vào hay rời khỏi cung thánh.
`
      },
      {
        id: "do-phung-vu",
        title: "2. Các Đồ Dùng Phụng Vụ Cơ Bản",
        content: `
- **Chén Thánh (Calix):** Chén quý dùng đựng Rượu Nho sẽ trở thành Máu Thánh Chúa Kitô.
- **Đĩa Thánh (Patena):** Đĩa đựng Bánh Thánh sẽ trở thành Mình Thánh Chúa Kitô.
- **Bình Thánh (Ciborium):** Bình có nắp dùng đựng Mình Thánh Chúa trao cho cộng đoàn và cất giữ trong Nhà Tạm.
- **Bình Nước & Rượu (Ampullae):** Hai bình nhỏ đựng rượu và nước dâng lên bàn thờ trong phần Phụng vụ Thánh Thể.
- **Khăn Lau Chén (Purificatorium):** Khăn vải trắng có thêu thánh giá ở giữa dùng để lau chén thánh và đĩa thánh.
- **Khăn Thánh (Corporale):** Khăn vuông gấp 9 phần, trải trên bàn thờ để đặt chén thánh và bình thánh.
- **Bình Hương & Tàu Hương (Thuribulum & Navicula):** Dùng đốt than và trầm hương tỏa hương thơm tượng trưng cho lời cầu nguyện bay lên trước nhan Chúa.
`
      },
      {
        id: "dien-tien",
        title: "3. Thứ Tự Giúp Lễ Trong Thánh Lễ",
        content: `
1. **Đoàn rước nhập lễ:** Đi đầu là hương trầm, tiếp theo là Thánh giá nến cao, các lễ sinh, thầy phó tế và linh mục chủ tế.
2. **Phụng vụ Lời Chúa:** Giữ tư thế ngồi nghiêm trang khi đọc Bài đọc và Thánh vịnh; đứng cầm nến sáng hai bên khi Linh mục công bố Tin Mừng.
3. **Chuẩn bị lễ vật:** Mang khăn thánh, chén thánh, bình rượu và nước lên bàn thờ sau Lời nguyện tín hữu. Giúp Linh mục rửa tay (*Rửa tay thanh tẩy tâm hồn*).
4. **Kinh nguyện Thánh Thể:** Quỳ sốt sắng, rung chuông theo hiệu lệnh:
   - Khi Linh mục đặt tay trên lễ vật cầu xin Chúa Thánh Thần (1 hồi ngắn).
   - Khi Linh mục nâng Mình Thánh Chúa lên cao (3 hồi dõng dạc).
   - Khi Linh mục nâng Chén Máu Thánh lên cao (3 hồi dõng dạc).
5. **Hiệp lễ & Kết lễ:** Giúp rước nến tháp tùng khi trao Mình Thánh Chúa và đưa bình nước tráng chén sau hiệp lễ.
`
      }
    ]
  },

  "nam-phung-vu": {
    id: "nam-phung-vu",
    title: "Năm Phụng Vụ — Lịch Công Giáo & Các Mùa Thánh",
    khoi: "phung-vu",
    khoiLabel: "Khối Phụng Vụ",
    badge: "Phụng Vụ",
    author: "Ủy Ban Phụng Tự — Hội Đồng Giám Mục Việt Nam",
    readTime: "8 phút đọc",
    size: "4.7 KB",
    description: "Cẩm nang tìm hiểu chu kỳ Năm Phụng vụ, ý nghĩa các mùa thánh, quy luật màu sắc phẩm phục và danh mục các ngày Lễ Trọng trong năm Công giáo.",
    chapters: [
      {
        id: "y-nghia-nam-phung-vu",
        title: "1. Ý Nghĩa Năm Phụng Vụ & Chu Kỳ Cứu Độ",
        content: `
Năm Phụng Vụ không tính theo lịch dương thông thường, mà là chu kỳ cử hành toàn bộ mầu nhiệm cứu chuộc của Đức Kitô — từ sự trông đợi Người giáng sinh, cuộc đời công khai, cuộc khổ nạn, cái chết, sự phục sinh vinh quang, cho tới ngày Người ngự đến trong vinh quang.

### Khởi đầu và kết thúc:
- **Khởi đầu:** Vào chiều Chúa Nhật I Mùa Vọng (thường cuối tháng 11 hoặc đầu tháng 12 dương lịch).
- **Kết thúc:** Vào thứ Bảy sau Chúa Nhật Lễ Chúa Kitô Vua Vũ Trụ (Chúa Nhật cuối cùng của Mùa Thường Niên).

### Chu kỳ các bài đọc Kinh Thánh:
- **Ngày Chúa Nhật (Chu kỳ 3 năm):**
  - **Năm A:** Đọc Tin Mừng theo Thánh Mát-thêu.
  - **Năm B:** Đọc Tin Mừng theo Thánh Mác-cô (xen kẽ chương 6 Tin Mừng Gio-an).
  - **Năm C:** Đọc Tin Mừng theo Thánh Lu-ca.
- **Ngày Trong Tuần (Chu kỳ 2 năm):**
  - **Năm I (Năm lẻ):** Ví dụ 2025, 2027...
  - **Năm II (Năm chẵn):** Ví dụ 2026, 2028...
`
      },
      {
        id: "cac-mua-phung-vu",
        title: "2. Sáu Mùa Phụng Vụ Thánh Trong Năm",
        content: `
1. **Mùa Vọng (Advent):** Gồm 4 tuần lễ trước Đại lễ Giáng Sinh. Là thời gian tỉnh thức, hoán cải tâm hồn đón mừng biến cố Con Thiên Chúa nhập thể làm người và đợi trông ngày Chúa quang lâm.
2. **Mùa Giáng Sinh (Christmas):** Bắt đầu từ lễ Vọng Giáng Sinh (đêm 24/12) đến hết Lễ Chúa Giêsu Chịu Phép Rửa. Cử hành mầu nhiệm Con Thiên Chúa làm người ở cùng nhân loại.
3. **Mùa Chay (Lent):** Gồm 40 ngày (từ Thứ Tư Lễ Tro đến trước Thánh Lễ Tiệc Ly chiều Thứ Năm Tuần Thánh). Là thời gian cầu nguyện, ăn chay, hãm mình và chia sẻ bác ái để cùng Đức Kitô bước vào mầu nhiệm Vượt Qua.
4. **Tam Nhật Vượt Qua (Triduum Paschale):** Đỉnh cao và tâm điểm của toàn bộ Năm Phụng vụ:
   - **Thứ Năm Tuần Thánh:** Tưởng niệm Bí tích Thánh Thể, Bí tích Truyền Chức và Rửa chân bác ái.
   - **Thứ Sáu Tuần Thánh:** Tưởng niệm cuộc khổ nạn và cái chết của Chúa Giêsu trên Thập Giá (giữ chay và kiêng thịt).
   - **Đêm Vọng Phục Sinh & Chúa Nhật Phục Sinh:** Mừng Đức Kitô chiến thắng sự chết sống lại khải hoàn.
5. **Mùa Phục Sinh (Easter):** Kéo dài trọn vẹn 50 ngày trong niềm vui hoan lạc, kết thúc vào Lễ Chúa Thánh Thần Hiện Xuống (Ngũ Tuần).
6. **Mùa Thường Niên (Ordinary Time):** Gồm 33 hoặc 34 tuần, chia làm 2 giai đoạn: giữa Mùa Giáng Sinh và Mùa Chay, và từ sau Lễ Hiện Xuống đến Mùa Vọng mới. Giúp các tín hữu suy niệm và sống trọn vẹn đời sống thường ngày theo lời dạy của Chúa Giêsu.
`
      },
      {
        id: "mau-sac-pham-phuc",
        title: "3. Ý Nghĩa Các Màu Phẩm Phục Phụng Vụ",
        content: `
Mỗi màu áo lễ của Linh mục và khăn trải bàn thờ đều mang ý nghĩa thiêng liêng sâu sắc:

- **Màu Trắng (hoặc Vàng):** Biểu tượng của ánh sáng, sự tinh tuyền và niềm vui Phục Sinh. Dùng trong Mùa Giáng Sinh, Mùa Phục Sinh, các Lễ kính Chúa Giêsu, Đức Mẹ, các Thiên thần và các Thánh không tử đạo.
- **Màu Đỏ:** Biểu tượng của ngọn lửa tình yêu, Chúa Thánh Thần và máu tử đạo. Dùng trong Chúa Nhật Lễ Lá, Thứ Sáu Tuần Thánh, Lễ Chúa Thánh Thần Hiện Xuống và các Lễ kính các Thánh Tử Đạo.
- **Màu Xanh Lá Cây:** Biểu tượng của hy vọng và sự sống mới đang sinh sôi nảy nở. Dùng trong suốt Mùa Thường Niên.
- **Màu Tím:** Biểu tượng của sự hoán cải, thống hối và trông đợi. Dùng trong Mùa Vọng, Mùa Chay và các Lễ Cầu Hồn / An Táng.
- **Màu Hồng:** Biểu tượng của niềm vui le lói giữa mùa sám hối. Dùng duy nhất vào 2 ngày trong năm: Chúa Nhật III Mùa Vọng (*Chúa Nhật Gaudete*) và Chúa Nhật IV Mùa Chay (*Chúa Nhật Laetare*).
`
      },
      {
        id: "cac-le-trong",
        title: "4. Các Ngày Lễ Trọng & Lễ Buộc Tại Việt Nam",
        content: `
Hội đồng Giám mục Việt Nam quy định 4 ngày Lễ Trọng buộc mọi tín hữu phải tham dự Thánh Lễ và nghỉ việc xác:

1. **Lễ Chúa Giáng Sinh (25 tháng 12)**
2. **Lễ Đức Maria Mẹ Thiên Chúa (01 tháng 01)**
3. **Lễ Chúa Thăng Thiên (Dời vào Chúa Nhật thứ VII Phục Sinh)**
4. **Lễ Đức Mẹ Hồn Xác Lên Trời (15 tháng 08)**

### Các ngày Lễ Trọng quan trọng khác trong năm:
- **Lễ Thánh Cả Giuse (19/03)** — Bạn trăm năm Đức Maria & Bổn mạng Giáo hội Việt Nam.
- **Lễ Truyền Tin (25/03)**
- **Đại Lễ Phục Sinh & Chúa Nhật Hiện Xuống**
- **Lễ Chúa Ba Ngôi & Lễ Mình Máu Thánh Chúa**
- **Lễ Thánh Phêrô và Phaolô Tông Đồ (29/06)**
- **Lễ Các Thánh Nam Nữ (01/11)** & Lễ Cầu Cho Các Linh Hồn (02/11)
- **Lễ Các Thánh Tử Đạo Việt Nam (24/11)**
- **Lễ Đức Mẹ Vô Nhiễm Nguyên Tội (08/12)**
`
      }
    ]
  },

  // ==========================================================================
  // KHỐI KINH THÁNH
  // ==========================================================================
  "phuong-phap-lectio-divina": {
    id: "phuong-phap-lectio-divina",
    title: "Phương Pháp Cầu Nguyện Với Lời Chúa (Lectio Divina)",
    khoi: "kinh-thanh",
    khoiLabel: "Khối Kinh Thánh",
    badge: "Kinh Thánh",
    author: "Truyền Thống Đan Viện Kitô Giáo",
    readTime: "6 phút đọc",
    size: "2.8 KB",
    description: "Phương pháp đọc và suy niệm Lời Chúa truyền thống của Hội Thánh qua 5 bước: Đọc, Suy niệm, Cầu nguyện, Chiêm niệm và Thực hành.",
    chapters: [
      {
        id: "tong-quan",
        title: "1. Lectio Divina Là Gì?",
        content: `
**Lectio Divina** (nghĩa là *Đọc Lời Chúa trong Thần Khí*) là một phương pháp cầu nguyện cổ kính có từ thời các Giáo phụ và các Đan viện Biển Đức. Đây không phải là việc nghiên cứu Kinh Thánh thuần lý trí, mà là cuộc gặp gỡ thân tình giữa linh hồn với Thiên Chúa hằng sống qua Lời của Người.

> "Lời Chúa là ngọn đèn soi cho con bước, là ánh sáng chỉ đường con đi."  
> — *Thánh Vịnh 119, 105*
`
      },
      {
        id: "5-buoc",
        title: "2. Năm Bước Thực Hành Lectio Divina",
        content: `
### Bước 1: Lectio (Đọc — Chúa nói gì trong bản văn?)
- Chọn một đoạn Tin Mừng ngắn (tốt nhất là bài Tin Mừng trong ngày).
- Lắng đọng tâm hồn, làm dấu Thánh Giá và xin Chúa Thánh Thần soi sáng.
- Đọc đoạn văn chậm rãi từ 2 đến 3 lần. Chú ý từng câu chữ, bối cảnh và hành động của Chúa Giêsu.

### Bước 2: Meditatio (Suy niệm — Chúa muốn nói gì với tôi hôm nay?)
- Hãy để một từ, một câu hoặc một hình ảnh đánh động tâm hồn bạn.
- Tự hỏi: Đoạn Lời Chúa này đang chiếu sáng điều gì trong hoàn cảnh hiện tại của tôi? Chúa đang nhắc nhở, an ủi hay mời gọi tôi hoán cải điều gì?

### Bước 3: Oratio (Cầu nguyện — Tôi thưa gì với Chúa?)
- Từ những điều đã suy niệm, hãy giãi bày lòng mình với Chúa một cách chân thành như với một người bạn thân.
- Có thể là lời tạ ơn, lời xin tha thứ, lời cầu xin ơn can đảm, hoặc phó thác gánh nặng trong lòng cho Chúa.

### Bước 4: Contemplatio (Chiêm niệm — Nghỉ ngơi trong tình yêu Chúa)
- Tạm dừng mọi suy nghĩ và lời nói, chỉ đơn sơ ở lại trong sự hiện diện đầy yêu thương của Chúa.
- Hãy để tâm hồn được sưởi ấm và biến đổi trong bình an sâu thẳm của Thần Khí.

### Bước 5: Actio (Hành động — Tôi sẽ sống Lời Chúa thế nào?)
- Đưa Lời Chúa vào đời thực bằng một quyết tâm cụ thể trong ngày:
  - Tha thứ cho một người bạn đã làm mình buồn.
  - Làm một việc bác ái nhỏ âm thầm.
  - Từ bỏ một thói quen xấu.
`
      }
    ]
  },

  // ==========================================================================
  // KHỐI VÀO ĐỜI (16 - 18 TUỔI)
  // ==========================================================================
  "dinh-huong-vao-doi": {
    id: "dinh-huong-vao-doi",
    title: "Cẩm Nang Bạn Trẻ Vào Đời — Đức Tin, Nghề Nghiệp & Tình Yêu",
    khoi: "vao-doi",
    khoiLabel: "Khối Vào Đời",
    badge: "Vào Đời",
    author: "Ban Mục Vụ Giới Trẻ & Giáo Lý Vào Đời",
    readTime: "9 phút đọc",
    size: "5.1 KB",
    description: "Định hướng sống đức tin trưởng thành, phân định ơn gọi, đạo đức nghề nghiệp và chuẩn bị nền tảng cho tình yêu, hôn nhân gia đình Kitô giáo trước ngưỡng cửa cuộc đời.",
    chapters: [
      {
        id: "ban-sac-nguoi-tre",
        title: "1. Bản Sắc Người Trẻ Kitô Giáo Giữa Xã Hội Hiện Đại",
        content: `
Tuổi trẻ là mùa xuân của cuộc đời và là hồng ân quý giá Thiên Chúa ban tặng. Tuy nhiên, trước làn sóng tục hóa, chủ nghĩa hưởng thụ và thuyết tương đối luân lý, bạn trẻ đối diện với nhiều thách thức lớn lao.

### Những Cám Dỗ Cần Vượt Qua:
- **Vô thần thực hành:** Không chối bỏ Chúa bằng lời nói, nhưng sống và làm việc như thể Chúa không hề hiện hữu.
- **Ảo tưởng mạng xã hội:** Đánh mất bản thân sau những lượt "like", chạy theo các trào lưu bề nổi mà bỏ quên chiều sâu tâm hồn.
- **Chủ nghĩa thực dụng:** Coi tiền bạc, danh vọng và hưởng thụ cá nhân là thước đo duy nhất của sự thành công.

### Trụ Cột Nuôi Dưỡng Đức Tin Người Trẻ:
1. **Đời sống nội tâm:** Duy trì giờ cầu nguyện riêng tư mỗi ngày, tham dự Thánh Lễ Chúa Nhật và xưng tội định kỳ.
2. **Lắng nghe Lời Chúa:** Biến Lời Chúa thành kim chỉ nam soi sáng mọi quyết định trong học tập và tương lai.
3. **Cộng đoàn đức tin:** Tham gia các phong trào giới trẻ, huynh trưởng thiếu nhi để được nâng đỡ và cùng nhau tiến bước.
`
      },
      {
        id: "on-goi-va-nghe-nghiep",
        title: "2. Phân Định Ơn Gọi & Đạo Đức Nghề Nghiệp",
        content: `
Thiên Chúa có một kế hoạch độc nhất vô nhị và tràn đầy yêu thương cho cuộc đời của mỗi người chúng ta.

### Ba Ơn Gọi Cốt Lõi:
1. **Ơn gọi Hôn Nhân Gia Đình:** Con đường phổ biến nhất — kết hợp với một người bạn đời để xây dựng tổ ấm hạnh phúc, cộng tác với Thiên Chúa truyền ban sự sống và giáo dục con cái.
2. **Ơn gọi Thánh Hiến (Linh mục & Tu sĩ):** Dâng trọn vẹn con tim và cuộc đời để phụng sự Thiên Chúa và phục vụ tha nhân.
3. **Ơn gọi Độc Thân Tận Hiến Giữa Đời:** Dùng sự tự do và khả năng chuyên môn để phục vụ xã hội và làm chứng cho Tin Mừng.

### Đạo Đức Nghề Nghiệp Của Người Tín Hữu:
- Chọn nghề nghiệp chân chính, lương thiện, đem lại giá trị cho cộng đồng.
- Luôn trung thực, không tham nhũng, không gian lận thương mại hay làm hàng giả hại người.
- Xem công việc lao động không chỉ để mưu sinh, mà là cộng tác với Thiên Chúa hoàn thiện vũ trụ tạo thành.
`
      },
      {
        id: "tinh-yeu-hon-nhan",
        title: "3. Tình Yêu, Giới Tính & Hôn Nhân Công Giáo",
        content: `
Thân xác con người là công trình kỳ diệu của Thiên Chúa, và tình yêu nam nữ là hình ảnh phản chiếu tình yêu chung thủy giữa Đức Kitô và Hội Thánh.

> "Anh em lại không biết rằng thân xác anh em là Đền Thờ của Thánh Thần sao? Thần Khí ấy anh em đã nhận được từ Thiên Chúa."  
> — *Thư thứ nhất gửi tín hữu Cô-rin-tô (1 Cr 6, 19)*

### Tình Yêu Đích Thực vs Cảm Xúc Nhất Thời:
- **Tình yêu đích thực:** Đòi hỏi trách nhiệm, hy sinh, sự tôn trọng thân xác và mong muốn điều tốt đẹp nhất cho người mình yêu.
- **Sống trong sạch trước hôn nhân:** Giữ gìn sự trinh khiết không phải là cổ hủ, mà là bảo vệ món quà thiêng liêng nhất để trao trọn vẹn cho người phối ngẫu trọn đời trong ngày cưới.

### Đặc Tính Bí Tích Hôn Phối:
- **Đơn nhất:** Một vợ một chồng — bình đẳng về phẩm giá và yêu thương nhau đến cùng.
- **Bất khả phân ly:** "Sự gì Thiên Chúa đã phối hợp, loài người không được phân ly" (Mt 19, 6).
- **Mở ra cho sự sống:** Sẵn sàng đón nhận con cái Chúa ban như gia tài quý giá nhất.
`
      },
      {
        id: "dan-than-phuc-vu",
        title: "4. Người Tín Hữu Dấn Thân — Muối Men Cho Đời",
        content: `
Người Công giáo không được phép co cụm trong sự an toàn của nhà thờ, mà phải can đảm đem tinh thần Tin Mừng đi vào trường học, công xưởng, văn phòng và khu dân cư.

### Lời mời gọi của Đức Thánh Cha Phanxicô:
> "Các con đừng ngồi trên ghế sofa để nhìn cuộc đời trôi qua! Hãy xỏ giày vào và bước ra thế giới để để lại dấu ấn của chính mình!"

### Những Hành Động Cụ Thể:
- Sẵn sàng giúp đỡ bạn bè gặp hoàn cảnh khó khăn mà không toan tính vụ lợi.
- Tham gia các hoạt động thiện nguyện, bảo vệ môi trường, thăm viếng người nghèo và người đau yếu.
- Đóng góp sức trẻ xây dựng Giáo xứ: tham gia làm Giáo lý viên, Huynh trưởng Thiếu Nhi Thánh Thể, ban Caritas hoặc Ca đoàn.
`
      }
    ]
  },

  // ==========================================================================
  // TÀI LIỆU CHUNG (MỌI CẤP LỚP)
  // ==========================================================================
  "ban-kinh-can-thuoc-da-nang": {
    id: "ban-kinh-can-thuoc-da-nang",
    title: "Bản Tóm Lược Các Kinh Cần Thuộc — Giáo Phận Đà Nẵng",
    khoi: "all",
    khoiLabel: "Mọi Cấp Lớp",
    badge: "Kinh Nguyện",
    author: "Ban Giáo Lý Giáo Phận Đà Nẵng",
    readTime: "8 phút đọc",
    size: "11 KB",
    description: "Tổng hợp toàn văn các kinh nguyện cốt lõi theo quy chuẩn Giáo phận Đà Nẵng dành cho thiếu nhi học thuộc lòng và cầu nguyện mỗi ngày.",
    chapters: [
      {
        id: "kinh-nguyen-hang-ngay",
        title: "1. Các Kinh Nguyện Khởi Đầu & Hằng Ngày",
        content: `
### Làm Dấu Thánh Giá
Nhân danh Cha, và Con, và Thánh Thần. Amen.

### Kinh Đức Chúa Thánh Thần
Chúng con lạy ơn Đức Chúa Thánh Thần thiêng liêng sáng láng vô cùng. Chúng con xin Đức Chúa Thánh Thần xuống đầy lòng chúng con, là kẻ tin cậy Đức Chúa Trời, và đốt lửa kính mến Đức Chúa Trời trong lòng chúng con; chúng con xin Đức Chúa Trời cho Đức Chúa Thánh Thần xuống.  
*— Sửa lại mọi sự trong ngoài chúng con.*  
Chúng con cầu cùng Đức Chúa Trời, xưa đã cho Đức Chúa Thánh Thần xuống soi lòng dạy dỗ các Thánh Tông Đồ, thì rày chúng con cũng xin Đức Chúa Trời cho Đức Chúa Thánh Thần lại xuống, an ủi dạy dỗ chúng con làm những việc lành, vì công nghiệp Đức Chúa Giêsu Kitô là Chúa chúng con. Amen.

### Kinh Lạy Cha
Lạy Cha chúng con ở trên trời, chúng con nguyện Danh Cha cả sáng, Nước Cha trị đến, Ý Cha thể hiện dưới đất cũng như trên trời.  
Xin Cha cho chúng con hôm nay lương thực hằng ngày, và tha nợ chúng con, như chúng con cũng tha kẻ có nợ chúng con; xin chớ để chúng con sa chước cám dỗ, nhưng cứu chúng con cho khỏi sự dữ. Amen.

### Kinh Kính Mừng
Kính mừng Maria đầy ơn phúc, Đức Chúa Trời ở cùng Bà, Bà có phúc lạ hơn mọi người nữ, và Giêsu con lòng Bà gồm phúc lạ.  
Thánh Maria Đức Mẹ Chúa Trời, cầu cho chúng con là kẻ có tội, khi này và trong giờ lâm tử. Amen.

### Kinh Sáng Danh
Sáng danh Đức Chúa Cha, và Đức Chúa Con, và Đức Chúa Thánh Thần.  
Như đã có trước vô cùng, và bây giờ, và hằng có, và đời đời chẳng cùng. Amen.

### Kinh Thiên Thần Bản Mệnh
Lạy ơn Thánh Thiên Thần gìn giữ tôi, tôi cám ơn Thánh Thiên Thần vốn gìn giữ tôi từ thuở mới sinh đến nay cho được mọi sự lành. Trâm lạy Thánh Thiên Thần gìn giữ tôi, xin rủ lòng thương gìn giữ tôi ban ngày và ban đêm, kẻo chước ma quỷ cám dỗ mà phạm tội mất lòng Đức Chúa Trời. Amen.
`
      },
      {
        id: "kinh-tin-kinh",
        title: "2. Kinh Tin Kính (Tín Biểu Các Sứ Đồ)",
        content: `
Tôi tin kính Đức Chúa Trời là Cha phép tắc vô cùng dựng nên trời đất.  
Tôi tin kính Đức Chúa Giêsu Kitô là Con Một Đức Chúa Cha cùng là Chúa chúng tôi; bởi phép Đức Chúa Thánh Thần mà Người xuống thai, sinh bởi Bà Maria đồng trinh; chịu nạn đời quan Phongxiô Philatô, chịu đóng đinh trên cây Thánh giá, chết và táng xác; xuống ngục tổ tông, ngày thứ ba bởi trong kẻ chết mà sống lại; lên trời ngự bên hữu Đức Chúa Cha phép tắc vô cùng; ngày sau bởi trời lại xuống phán xét kẻ sống và kẻ chết.  
Tôi tin kính Đức Chúa Thánh Thần; tôi tin có Hội Thánh hằng có ở khắp thế này, các thánh thông công; tôi tin phép tha tội; tôi tin xác loài người ngày sau sống lại; tôi tin hằng sống vậy. Amen.
`
      },
      {
        id: "kinh-tin-cay-men",
        title: "3. Kinh Tin, Cậy, Mến, Ăn Năn Tội & Trông Cậy",
        content: `
### Kinh Tin
Lạy Chúa, con tin thật có một Đức Chúa Trời, là Đấng thưởng phạt vô cùng. Con lại tin thật Đức Chúa Trời có Ba Ngôi, mà Ngôi Thứ Hai đã xuống thế làm người, chịu nạn chịu chết mà chuộc tội cho thiên hạ. Bấy nhiêu điều ấy, cùng các điều Hội Thánh dạy, thì con tin vững vàng, vì Chúa là Đấng thông minh và chân thật vô cùng, đã phán truyền cho Hội Thánh. Amen.

### Kinh Cậy
Lạy Chúa, con trông cậy vững vàng, vì công nghiệp Đức Chúa Giêsu, thì Chúa sẽ ban ơn cho con giữ đạo nên ở đời này, cho ngày sau được lên thiên đàng, xem thấy mặt Đức Chúa Trời hưởng phúc đời đời, vì Chúa là Đấng phép tắc và lòng lành vô cùng, đã phán hứa sự ấy chẳng có lẽ nào sai được. Amen.

### Kinh Mến
Lạy Chúa, con kính mến Chúa hết lòng hết sức, trên hết mọi sự, vì Chúa là Đấng trọn tốt trọn lành vô cùng, lại vì Chúa, thì con thương yêu người ta như mình con vậy. Amen.

### Kinh Ăn Năn Tội
Lạy Chúa con, Chúa là Đấng trọn tốt trọn lành vô cùng. Chúa đã dựng nên con, và cho Con Chúa ra đời chịu nạn chịu chết vì con, mà con đã cả lòng phản nghịch lỗi nghĩa cùng Chúa, thì con lo buồn đau đớn, cùng chê ghét mọi tội con trên hết mọi sự; con dốc lòng chừa, và nhờ ơn Chúa, thì con sẽ lánh xa dịp tội, cùng làm việc đền tội cho xứng. Amen.

### Kinh Cám Ơn
Lạy Chúa con, con cám ơn Đức Chúa Trời là Chúa lòng lành vô cùng, chẳng bỏ con, chẳng để con không đời đời, mà lại sinh ra con, cho con được làm người, cùng gìn giữ con, hằng che chở con; lại cho Ngôi Thứ Hai xuống thế làm người, chuộc tội chịu chết trên cây Thánh Giá vì con, lại cho con được đạo thánh Đức Chúa Trời, cùng chịu nhiều ơn nhiều phép Hội Thánh nữa, và đã cho phần xác con ngày hôm nay được mọi sự lành; lại cứu lấy con kẻo phải chết tươi ăn năn tội chẳng kịp. Vậy các Thánh ở trên thiên đàng, cám ơn Đức Chúa Trời thế nào, thì con cũng hợp cùng các Thánh mà dâng cho Chúa con cùng ngần ấy sự cám ơn. Amen.

### Kinh Trông Cậy
Chúng con trông cậy Rất Thánh Đức Mẹ Chúa Trời, xin chớ chê chớ bỏ lời chúng con nguyện trong cơn gian nan thiếu thốn, Đức Nữ Đồng Trinh hiển vinh sáng láng.  
*— Hằng chữa chúng con cho khỏi mọi sự dữ. Amen.*  
- Lạy Rất Thánh Trái Tim Đức Chúa Giêsu — *Thương xót chúng con.*  
- Lạy Trái Tim Cực Thanh Cực Tịnh Rất Thánh Đức Bà Maria — *Cầu cho chúng con.*  
- Lạy Ông Thánh Giuse là bạn thanh sạch Đức Bà Maria trọn đời đồng trinh — *Cầu cho chúng con.*  
- Các Thánh Tử Đạo Việt Nam — *Cầu cho chúng con.*
`
      },
      {
        id: "dieu-ran-phuc-that",
        title: "4. Mười Điều Răn, Sáu Điều Răn & Tám Mối Phúc",
        content: `
### Mười Điều Răn Thiên Chúa
Đạo Đức Chúa Trời có mười điều răn:
- **Thứ nhất:** Thờ phượng một Đức Chúa Trời và kính mến Người trên hết mọi sự.
- **Thứ hai:** Chớ kêu tên Đức Chúa Trời vô cớ.
- **Thứ ba:** Giữ ngày Chúa Nhật.
- **Thứ bốn:** Thảo kính cha mẹ.
- **Thứ năm:** Chớ giết người.
- **Thứ sáu:** Chớ làm sự dâm dục.
- **Thứ bảy:** Chớ lấy của người.
- **Thứ tám:** Chớ làm chứng dối.
- **Thứ chín:** Chớ muốn vợ chồng người.
- **Thứ mười:** Chớ tham của người.

> Mười điều răn ấy tóm về hai điều này: trước kính mến một Đức Chúa Trời trên hết mọi sự, sau lại yêu người như mình ta vậy. Amen.

---

### Sáu Điều Răn Hội Thánh
- **Thứ nhất:** Dâng lễ ngày Chúa Nhật cùng các ngày lễ buộc.
- **Thứ hai:** Chớ làm việc xác ngày Chúa Nhật cùng các ngày lễ buộc.
- **Thứ ba:** Xưng tội trong một năm ít là một lần.
- **Thứ bốn:** Rước Mình Thánh Chúa trong Mùa Phục Sinh.
- **Thứ năm:** Giữ chay và kiêng thịt những ngày Hội Thánh dạy.
- **Thứ sáu:** Đóng góp cho các nhu cầu của Hội Thánh.

---

### Tám Mối Phúc Thật (Hiến Chương Nước Trời)
1. Phúc cho ai có tinh thần nghèo khó, vì Nước Trời là của họ.
2. Phúc cho ai hiền lành, vì họ sẽ được Đất Hứa làm gia nghiệp.
3. Phúc cho ai sầu khổ, vì họ sẽ được Thiên Chúa ủi an.
4. Phúc cho ai khát khao nên người công chính, vì họ sẽ được Thiên Chúa cho thỏa lòng.
5. Phúc cho ai xót thương người, vì họ sẽ được Thiên Chúa xót thương.
6. Phúc cho ai có tâm hồn trong sạch, vì họ sẽ được nhìn ngắm Thiên Chúa.
7. Phúc cho ai xây dựng hòa bình, vì họ sẽ được gọi là con Thiên Chúa.
8. Phúc cho ai bị bách hại vì sống công chính, vì Nước Trời là của họ.
`
      },
      {
        id: "cai-toi-va-bi-tich",
        title: "5. Cải Tội Bảy Mối & Bảy Bí Tích",
        content: `
### Cải Tội Bảy Mối Có Bảy Đức:
1. Khiêm nhượng chớ kiêu ngạo.
2. Rộng rãi chớ hà tiện.
3. Giữ mình sạch sẽ chớ mê dâm dục.
4. Hay nhịn chớ hờn giận.
5. Kiêng bớt chớ mê ăn uống.
6. Yêu người chớ ghen ghét.
7. Siêng năng việc Đức Chúa Trời chớ làm biếng.

---

### Bảy Bí Tích Của Hội Thánh:
1. **Bí tích Rửa Tội** (Khai tâm)
2. **Bí tích Thêm Sức** (Khai tâm)
3. **Bí tích Thánh Thể** (Khai tâm)
4. **Bí tích Giải Tội** (Chữa lành)
5. **Bí tích Xức Dầu Bệnh Nhân** (Chữa lành)
6. **Bí tích Truyền Chức Thánh** (Phục vụ cộng đoàn)
7. **Bí tích Hôn Phối** (Phục vụ cộng đoàn)

---

### Kinh Cầu Cho Cha Mẹ & Giáo Xứ:
*Lạy Chúa, xin chúc lành và ban muôn ơn lành xác hồn cho cha mẹ, thầy cô và quý ân nhân của chúng con. Xin gìn giữ giáo xứ An Ngãi chúng con trong tình hiệp nhất, bình an và hăng say loan báo Tin Mừng. Amen.*
`
      },
      {
        id: "kinh-man-coi",
        title: "6. Kinh Mân Côi — 20 Mầu Nhiệm Cứu Độ",
        content: `
Tràng Hạt Mân Côi là bản tóm lược toàn bộ Tin Mừng qua cái nhìn của Mẹ Maria:

### NĂM SỰ VUI (Đọc vào thứ Hai & thứ Bảy)
- **Thứ nhất:** Đức Bà chịu thai — *Xin cho được ở khiêm nhường.*
- **Thứ hai:** Đức Bà đi viếng Bà Thánh Isave — *Xin cho được lòng yêu người.*
- **Thứ ba:** Đức Bà sinh Đức Chúa Giêsu nơi máng cỏ — *Xin cho được lòng khó khăn.*
- **Thứ bốn:** Đức Bà dâng Đức Chúa Giêsu trong đền thánh — *Xin cho được vâng lời chịu lụy.*
- **Thứ năm:** Đức Bà tìm được Đức Chúa Giêsu trong đền thánh — *Xin cho được tìm kiếm Chúa luôn.*

### NĂM SỰ SÁNG (Đọc vào thứ Năm)
- **Thứ nhất:** Đức Chúa Giêsu chịu phép rửa tại sông Gio-đan — *Xin cho được sống xứng đáng là con cái Chúa.*
- **Thứ hai:** Đức Chúa Giêsu dự tiệc cưới Cana — *Xin cho được vâng nghe lời Mẹ.*
- **Thứ ba:** Đức Chúa Giêsu rao giảng Nước Trời và kêu gọi sám hối — *Xin cho được tin vào Tin Mừng và hoán cải đời sống.*
- **Thứ bốn:** Đức Chúa Giêsu biến hình trên núi Thabor — *Xin cho được biến đổi tâm hồn.*
- **Thứ năm:** Đức Chúa Giêsu lập Bí tích Thánh Thể — *Xin cho được sốt sắng kết hợp cùng Chúa Giêsu Thánh Thể.*

### NĂM SỰ THƯƠNG (Đọc vào thứ Ba & thứ Sáu)
- **Thứ nhất:** Đức Chúa Giêsu lo buồn đổ mồ hôi máu — *Xin cho được ăn năn tội nên.*
- **Thứ hai:** Đức Chúa Giêsu chịu đánh đòn — *Xin cho được hãm mình chịu khó.*
- **Thứ ba:** Đức Chúa Giêsu chịu đội mão gai — *Xin cho được chịu mọi sự sỉ nhục vì Chúa.*
- **Thứ bốn:** Đức Chúa Giêsu vác Thánh giá — *Xin cho được vác Thánh giá theo chân Chúa.*
- **Thứ năm:** Đức Chúa Giêsu chịu chết trên cây Thánh giá — *Xin cho được đóng đinh tính xác thịt vào Thánh giá Chúa.*

### NĂM SỰ MỪNG (Đọc vào thứ Tư & Chúa Nhật)
- **Thứ nhất:** Đức Chúa Giêsu sống lại — *Xin cho được sống lại thật về phần linh hồn.*
- **Thứ hai:** Đức Chúa Giêsu lên trời — *Xin cho được ái mộ những sự trên trời.*
- **Thứ ba:** Đức Chúa Thánh Thần hiện xuống — *Xin cho được đầy dẫy ơn Chúa Thánh Thần.*
- **Thứ bốn:** Đức Chúa Trời cho Đức Mẹ lên trời — *Xin cho được ơn chết lành trong tay Mẹ.*
- **Thứ năm:** Đức Chúa Trời thưởng Đức Mẹ trên trời — *Xin cho được thưởng cùng Đức Mẹ trên thiên đàng.*
`
      }
    ]
  },

  "toat-yeu-giao-ly": {
    id: "toat-yeu-giao-ly",
    title: "Toát Yếu Giáo Lý Hội Thánh Công Giáo",
    khoi: "all",
    khoiLabel: "Tài Liệu Chung",
    badge: "Văn Kiện",
    author: "Đức Thánh Cha Bênêđictô XVI — Vatican",
    readTime: "12 phút đọc",
    size: "5.2 KB",
    description: "Tóm tắt toàn bộ đức tin Công giáo dưới hình thức Hỏi - Đáp ngắn gọn, rõ ràng, dựa trên Sách Giáo lý Hội Thánh Công giáo (1992).",
    chapters: [
      {
        id: "tuyen-xung-duc-tin",
        title: "1. Tuyên Xưng Đức Tin (Tín Biểu Các Tông Đồ)",
        content: `
**Hỏi: Ý định của Thiên Chúa đối với con người là gì?**  
**Đáp:** Thiên Chúa vô cùng hoàn hảo và hạnh phúc tự muôn đời. Bởi ý định hoàn toàn tự do và lòng nhân hậu thuần túy, Người đã tạo dựng con người để cho con người được thông phần vào sự sống hạnh phúc vĩnh cửu của Người. Vì thế, vào thời viên mãn, Thiên Chúa Cha đã sai Con Một Người là Đấng Cứu Độ và Cứu Chuộc nhân loại khỏi tội lỗi để đưa chúng ta trở nên con cái Người.

**Hỏi: Tại sao trong tâm hồn con người luôn có khao khát Thiên Chúa?**  
**Đáp:** Khi tạo dựng con người theo hình ảnh Người, Thiên Chúa đã ghi khắc vào tâm hồn họ niềm khao khát được nhìn thấy Người. Dù con người thường bỏ qua ước muốn này, Thiên Chúa không ngừng lôi kéo con người đến với Người, bởi vì chỉ nơi Thiên Chúa, con người mới tìm thấy chân lý và hạnh phúc trọn vẹn mà họ không ngừng tìm kiếm.

**Hỏi: Thiên Chúa mặc khải trọn vẹn nhất nơi ai?**  
**Đáp:** Nơi Đức Giêsu Kitô. Người là Ngôi Lời nhập thể của Chúa Cha. Nơi Đức Kitô, Thiên Chúa đã nói hết mọi sự và không còn một mặc khải công nào khác nữa sau Người.

**Hỏi: Mầu nhiệm trung tâm của đức tin và đời sống Kitô giáo là gì?**  
**Đáp:** Đó là Mầu nhiệm Thiên Chúa Ba Ngôi cực thánh: Chúa Cha, Chúa Con và Chúa Thánh Thần. Ba Ngôi phân biệt nhưng cùng một bản tính duy nhất, một uy quyền và một vinh quang như nhau.
`
      },
      {
        id: "cu-hanh-mau-nhiem",
        title: "2. Cử Hành Mầu Nhiệm Kitô Giáo (Phụng Vụ & 7 Bí Tích)",
        content: `
**Hỏi: Phụng vụ là gì?**  
**Đáp:** Phụng vụ là việc cử hành Mầu nhiệm Đức Kitô, và đặc biệt là Mầu nhiệm Vượt Qua của Người. Trong Phụng vụ, Chúa Kitô thi hành chức vụ Tư tế của Người cùng với Hội Thánh là Thân Thể mầu nhiệm, để thánh hóa con người và tôn vinh Thiên Chúa Cha.

**Hỏi: Bảy Bí tích được phân loại thế nào?**  
**Đáp:** Bảy Bí tích được chia làm ba nhóm:
1. **Các Bí tích Khai Tâm Kitô giáo:** Bí tích Rửa Tội, Bí tích Thêm Sức và Bí tích Thánh Thể. Ba bí tích này đặt nền tảng cho toàn bộ đời sống Kitô hữu.
2. **Các Bí tích Chữa Lành:** Bí tích Giải Tội (Giao Hòa) và Bí tích Xức Dầu Bệnh Nhân. Giúp chữa lành và phục hồi con người khỏi bệnh tật phần hồn cũng như phần xác.
3. **Các Bí tích Phục Vụ Sự Hiệp Thông & Sứ Vụ:** Bí tích Truyền Chức Thánh và Bí tích Hôn Phối. Trao ban ân sủng đặc biệt cho một sứ mạng chuyên biệt trong Hội Thánh.

**Hỏi: Tại sao Bí tích Thánh Thể là nguồn mạch và đỉnh cao của đời sống Kitô giáo?**  
**Đáp:** Vì trong Bí tích Thánh Thể chứa đựng trọn vẹn chính Chúa Giêsu Kitô — Mình và Máu, linh hồn và thần tính của Người — Đấng là nguồn mạch mọi ân sủng và ơn cứu độ của chúng ta.
`
      },
      {
        id: "doi-song-trong-duc-kito",
        title: "3. Đời Sống Trong Đức Kitô (Luân Lý & Giới Răn)",
        content: `
**Hỏi: Căn bản phẩm giá con người dựa trên điều gì?**  
**Đáp:** Phẩm giá con người dựa trên việc họ được Thiên Chúa tạo dựng theo hình ảnh và giống như Người, có linh hồn thiêng liêng, có trí khôn để hiểu biết và ý chí tự do để yêu thương.

**Hỏi: Các nhân đức là gì?**  
**Đáp:** Nhân đức là thói quen tốt và xu hướng kiên định để làm điều lành. Hội Thánh phân biệt:
- **Ba Nhân đức Đối Thần:** Tin, Cậy, Mến (hướng thẳng về Thiên Chúa).
- **Bốn Nhân đức Trụ:** Khôn ngoan, Công bằng, Dũng cảm, Tiết độ (điều chỉnh hành vi đạo đức nhân bản).

**Hỏi: Luật mới hay Luật Tin Mừng là gì?**  
**Đáp:** Luật mới là chính ân sủng của Chúa Thánh Thần được ban cho các tín hữu qua đức tin vào Đức Kitô. Luật này được tóm kết trong **Giới Răn Yêu Thương** của Chúa Giêsu: *"Anh em hãy yêu thương nhau như Thầy đã yêu thương anh em"* (Ga 13, 34), và được diễn tả sống động qua **Tám Mối Phúc Thật**.
`
      },
      {
        id: "kinh-nguyen-kito-giao",
        title: "4. Kinh Nguyện Kitô Giáo (Cầu Nguyện & Kinh Lạy Cha)",
        content: `
**Hỏi: Cầu nguyện là gì?**  
**Đáp:** Theo Thánh Têrêsa Hài Đồng Giêsu: *"Cầu nguyện là sự hướng lòng lên, là cái nhìn đơn sơ hướng về trời, là tiếng kêu tri ân và yêu mến giữa cơn thử thách cũng như lúc hân hoan."* Cầu nguyện là cuộc đối thoại thân tình giữa Thiên Chúa và con người.

**Hỏi: Có những hình thức cầu nguyện nào?**  
**Đáp:** Có năm hình thức cầu nguyện chính yếu:
1. **Chúc tụng và Thờ lạy:** Tôn vinh sự cao cả của Thiên Chúa là Đấng Tạo Hóa.
2. **Cầu xin:** Xin ơn tha thứ tội lỗi và xin những ơn cần thiết phần hồn phần xác.
3. **Chuyển cầu:** Cầu nguyện thay cho tha nhân noi gương Chúa Giêsu.
4. **Tạ ơn:** Tri ân Thiên Chúa vì muôn ơn lành Người thương ban.
5. **Ngợi khen:** Tán tụng Thiên Chúa chỉ vì chính Người là Đấng Thánh.

**Hỏi: Tại sao Kinh Lạy Cha được gọi là Bản Tóm Lược Toàn Bộ Tin Mừng?**  
**Đáp:** Vì Kinh Lạy Cha do chính Chúa Giêsu dạy cho các Tông đồ (Mt 6, 9-13). Lời kinh này vừa dạy ta biết cầu xin những điều gì, vừa dạy ta thứ tự ưu tiên của những ước muốn: trước hết là Danh Cha, Nước Cha và Ý Cha; sau đó là lương thực hằng ngày, ơn tha thứ, sự gìn giữ trước cám dỗ và sự giải thoát khỏi ma quỷ dữ dằn.
`
      }
    ]
  }
};
