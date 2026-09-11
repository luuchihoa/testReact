# BỘ CẤU HÌNH CHUẨN MASTER TẠO AUDIO PHỤNG VỤ (LITURGY AUDIO CONFIG)

> **HƯỚNG DẪN DÀNH CHO AI AGENT**: 
> Khi người dùng yêu cầu "render audio bài đọc", "tạo audio Phụng Vụ" hoặc "render theo cấu hình lưu trong file", AI **BẮT BUỘC** đọc và tuân thủ chính xác 100% tất cả các tham số, quy tắc lưu trữ, bộ lọc làm sạch và kịch bản thực thi được quy định trong tài liệu master này.

---

## ⚙️ 1. THAM SỐ CẤU HÌNH KỸ THUẬT AI (TECHNICAL CONFIG OBJECT)

```json
{
  "model_name": "k2-fsa/OmniVoice",
  "diffusion_steps": 16,
  "sampling_rate": 24000,
  "paragraph_break_sec": 0.60,
  "sentence_break_sec": 0.45,
  "major_break_sec": 0.30,
  "medium_break_sec": 0.25,
  "thermal_file_cool_down_sec": 5.0,
  "process_isolation": true,
  "peak_headroom_normalization": 0.97,
  "audio_format": "MP3 96kbps Mono (libmp3lame)"
}
```

---

## ⏱️ 2. QUY TẮC NGẮT NGHỈ PHỤNG VỤ (EXACT TIMING BREAKS)

| Vị Trí / Ký Tự | Tên Cấp Độ Ngắt Nghỉ | Khoảng Im Lặng (Silence Tensor) | Tác Dụng Phụng Vụ |
| :--- | :--- | :---: | :--- |
| **Xuống dòng (`\n`)** | `paragraphBreak` | **`0.60 giây`** | Sau nhãn mở đầu *"Bài đọc một."* / *"Bài đọc hai."* hoặc giữa các đoạn văn |
| **Dấu chấm (`. ! ?`)** | `sentenceBreak` | **`0.45 giây`** | Giữa các câu văn cho giọng đọc chậm rãi, ngân vang trang trọng |
| **Dấu chấm phẩy (`;`) & Hai chấm (`:`)** | `majorBreak` | **`0.30 giây`** | Giữa các mệnh đề lớn, phân tách ý rõ ràng |
| **Dấu phẩy (`,`)** | `mediumBreak` | **`0.25 giây`** | Tại các vế câu ngắn, giúp nhịp ngắt mượt mà tự nhiên |

---

## 📁 3. CẤU TRÚC THƯ MỤC & NGUYÊN TẮC ĐẶT TÊN FILE (FOLDERS & FILENAMES)

| Loại Bài Đọc | Thư Mục Lưu Trữ | Tiền Tố & Cấu Trúc Tên File | Mẫu Ví Dụ Đường Dẫn |
| :--- | :--- | :--- | :--- |
| **Bài Đọc 1** | `public/audio/readings/r1/` | `r1_<clean_ref>.mp3` | `public/audio/readings/r1/r1_1_V_357-12.mp3` |
| **Bài Đọc 2** | `public/audio/readings/r2/` | `r2_<clean_ref>.mp3` | `public/audio/readings/r2/r2_Rm_828-30.mp3` |
| **Tin Mừng** | `public/audio/gospels/` | `gospel_<clean_ref>.mp3` | `public/audio/gospels/gospel_Mt_1344-52.mp3` |

### Quy tắc làm sạch trích dẫn (`clean_ref`):
1. Bỏ dấu chấm `.`, phẩy `,`, chấm phẩy `;`, hai chấm `:`, ngoặc `()`.
2. Chuẩn hóa khoảng trắng xung quanh gạch ngang ` - ` ➔ gạch ngang đơn `-`.
3. Chuyển tất cả khoảng trắng còn lại ➔ dấu gạch dưới `_`.
   * *Ví dụ*: `1 V 3,5.7-12` ➔ `1_V_357-12`
   * *Ví dụ*: `Rm 8,28-30` ➔ `Rm_828-30`

---

## 🎙️ 4. QUY TẮC GIỌNG ĐỌC & NỘI DUNG (VOICE & STRUCTURE)

### A. Bài Đọc 1
* **Giọng mẫu**: **Nữ Bắc Giang** (`/Users/tranthithuynhi/OmniVoice-Studio/backend/assets/samples/voice_giang - northern female narrator.mp3`)
* **Mở đầu**: Mặc định chèn *"Bài đọc một."* ➔ Xuống dòng `\n` (nghỉ **`0.60s`**) ➔ Đọc `r1_intro` + `r1_content`.
* **Kết thúc**: Đọc hết nội dung bài đọc ➔ Dừng file (Không có outro promo).

### B. Bài Đọc 2
* **Giọng mẫu**: **Nữ Bắc Giang** (`/Users/tranthithuynhi/OmniVoice-Studio/backend/assets/samples/voice_giang - northern female narrator.mp3`)
* **Mở đầu**: Mặc định chèn *"Bài đọc hai."* ➔ Xuống dòng `\n` (nghỉ **`0.60s`**) ➔ Đọc `r2_intro` + `r2_content`.
* **Kết thúc**: Đọc hết nội dung bài đọc ➔ Dừng file (Không có outro promo).

### C. Bài Đọc Tin Mừng (Gospel)
* **Giọng mẫu**: **Nam Triều Dương** (`/Users/tranthithuynhi/OmniVoice-Studio/backend/assets/samples/voice_trieu duong -deep, calm and resonant.mp3` - Trầm ấm, sâu lắng)
* **Mở đầu**: Đọc `gospel_intro` (làm sạch ký tự `✠`).
* **Nội dung**: Đọc `gospel_content`.
* **Kết thúc**: **BỎ HOÀN TOÀN** câu đọc *"Đó là Lời Chúa."* ở cuối bài và **KHÔNG CÓ** outro promo.

---

## 🧹 5. BỘ LỌC LÀM SẠCH VĂN BẢN (6-LAYER SCRIPTURE CLEANER)

1. **Lớp 1 (Ký tự đặc biệt)**: Loại bỏ ký tự thập tự `✠`, chuyển ngoặc kép cong `“` `”` về ngoặc kép chuẩn `"`.
2. **Lớp 2 (Chỉ số Superscript)**: Xóa sạch toàn bộ các số câu dạng số mũ: `¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁰`.
3. **Lớp 3 (Chỉ số dính dấu câu & BẢO TỒN DẤU CHẤM)**:  
   * Xóa các số câu dính ngay sau dấu chấm/ngoặc (Ví dụ: `.5 Con` ➔ `. Con`, `.”7 Vua` ➔ `.” Vua`).
   * **BẢO TỒN NGUYÊN VẸN 100% DẤU CHẤM CÂU (`.`)** để câu không bị dính liền!
4. **Lớp 4 (Chỉ số kèm chữ cái)**: Xóa sạch các ký hiệu câu phụ như `1a`, `2b`, `15c`.
5. **Lớp 5 (Số câu độc lập)**: Xóa các số câu đứng riêng lẻ giữa các khoảng trắng.
6. **Lớp 6 (PHIÊN ÂM CHUẨN TÊN RIÊNG & ĐỊA DANH KINH THÁNH)**:  
   * **Quy tắc chuyển đổi tên ghép có gạch nối (`Giu-đa`, `ít-ra-en`)**: Tất cả các tên riêng, địa danh, tên người Kinh Thánh có dấu gạch nối giữa các âm tiết đều được tự động chuyển thành **từ cách khoảng chuẩn in hoa từng từ**.
   * *Ví dụ*:
     * `Giu-đa` ➔ **`Giu Đa`**
     * `ít-ra-en` / `Ít-ra-en` ➔ **`Ít Ra En`**
     * `Ghíp-ôn` / `Ghíp Ôn` ➔ **`Gíp Ôn`** (Phiên âm `Gíp` giúp AI đọc chuẩn 100% âm *"Ghíp"* không bị chệch)
     * `Sa-lô-môn` ➔ **`Sa Lô Môn`**
     * `Đa-vít` ➔ **`Đa Vít`**
     * `Giê-su` ➔ **`Giê Su`**
     * `Ki-tô` ➔ **`Ki Tô`**
     * `Mô-sê` ➔ **`Mô Sê`**
     * `A-bra-ham` ➔ **`A Bra Ham`**
     * `Giê-ru-sa-lem` ➔ **`Giê Ru Sa Lem`**
     * `Na-za-rét` ➔ **`Na Za Rét`**
   * **Lý do**: Dấu gạch nối `-` giữa các âm tiết thường khiến Tokenizer của AI hiểu lầm là dấu ngắt nghỉ/dấu câu, gây vấp âm như *"Giu... đa"* hoặc *"ít... ra... en"*. Việc chuyển sang dạng **khoảng trắng chuẩn in hoa từng âm tiết** giúp AI OmniVoice nhận diện đây là tên riêng ghép Tiếng Việt, phát âm **tròn chữ, mượt mà, liền mạch 100%**.

---

## 🛠️ 6. KỊCH BẢN THỰC THI CHÍNH (MASTER SCRIPTS)

* **Script render Bài đọc (1 & 2)**: `/Users/tranthithuynhi/my-react-app/scripts/generate_single_reading_mp3.py`
* **Script render Tin Mừng**: `/Users/tranthithuynhi/my-react-app/scripts/generate_single_gospel_mp3.py`
* **Script rebuild Manifest**: `/Users/tranthithuynhi/my-react-app/scripts/rebuild_audio_manifest.py`
* **Môi trường Python**: `/Users/tranthithuynhi/OmniVoice-Studio/.venv/bin/python`

---

## 🚀 7. LỆNH MẪU KHI CẦN RENDER BÀI ĐỌC MỚI

Khi người dùng yêu cầu render bài đọc cho một ngày bất kỳ, AI chỉ cần thực thi kịch bản bằng lệnh:
```bash
/Users/tranthithuynhi/OmniVoice-Studio/.venv/bin/python /Users/tranthithuynhi/my-react-app/scripts/generate_single_reading_mp3.py "<ref>" "<intro>" "<content>" "<out_path>" "<section_label>" 16 false
```
Và sau đó tự động gọi `python3 /Users/tranthithuynhi/my-react-app/scripts/rebuild_audio_manifest.py` để cập nhật ứng dụng.
