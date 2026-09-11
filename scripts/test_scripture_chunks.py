import json
import re

def perfect_scripture_cleaner(text):
    if not text:
        return ""

    # 1. Bỏ ký tự thập tự ✠ và chuẩn hóa ngoặc kép
    text = text.replace("✠", "").replace("“", '"').replace("”", '"')

    # 2. Xóa các chỉ số câu dạng superscript: ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁰
    for s in "¹²³⁴⁵⁶⁷⁸⁹⁰":
        text = text.replace(s, "")

    # 3. Xóa số câu ở đầu dòng, đầu câu hoặc dính sau ngoặc kép / dấu câu / khoảng trắng
    text = re.sub(r'(?:^|[\n\s.!?\"\'\)\],;])\d+[a-z]?(?=[\sA-ZÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴa-zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ])', ' ', text)

    # 4. Xóa số câu đứng riêng lẻ hoặc kèm ký tự a-z
    text = re.sub(r'(?<=\s)\d+[a-z]?(?=[\s.,!?\"\'\)])', ' ', text)

    # 5. Xóa các số câu dạng word boundary
    text = re.sub(r'\b\d+[a-z]?\b', ' ', text)

    # 6. Sửa tên riêng Phụng vụ chuẩn Tiếng Việt (Sa-lô-môn -> Sa Lô Môn, Ghíp-ôn -> Ghíp Ôn, Đa-vít -> Đa Vít, Giê-su -> Giê Su, Ki-tô -> Ki Tô)
    text = text.replace("Sa-lô-môn", "Sa Lô Môn").replace("Ghíp-ôn", "Ghíp Ôn").replace("Đa-vít", "Đa Vít").replace("Giê-su", "Giê Su").replace("Ki-tô", "Ki Tô")
    text = re.sub(r'([a-zA-Zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]+)-([a-zA-Zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]+)', r'\1 \2', text)

    # Thu gọn khoảng trắng ngang (giữ \n)
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    return '\n'.join(line for line in lines if line)

def parse_scripture_chunks(text):
    """
    Tách bài đọc Phụng vụ thành từng cụm câu/mệnh đề trang trọng (12-25 từ):
    - Xuống dòng (\n): paragraphBreak = 0.60s
    - Dấu chấm, hỏi, cảm (. ! ?): sentenceBreak = 0.45s
    - Nếu câu dài trên 25 từ, tách nhẹ theo dấu hai chấm (:) hoặc chấm phẩy (;)
    """
    if not text:
        return []

    lines = text.split('\n')
    parsed_items = []

    for line in lines:
        line_str = line.strip()
        if not line_str:
            continue

        raw_sentences = re.split(r'(?<=[.!?])\s+', line_str)
        sentences = [s.strip() for s in raw_sentences if s.strip()]

        for s_idx, sentence in enumerate(sentences):
            is_last_in_line = (s_idx == len(sentences) - 1)
            
            # If sentence is very long (> 25 words), split by : or ; for solemn reading
            words = sentence.split()
            if len(words) > 25 and (':' in sentence or ';' in sentence):
                clauses = re.split(r'(?<=[:;])\s+', sentence)
                clauses = [c.strip() for c in clauses if c.strip()]
                for c_idx, clause in enumerate(clauses):
                    is_last_clause = (c_idx == len(clauses) - 1)
                    pause_sec = (0.60 if is_last_in_line else 0.45) if is_last_clause else 0.30
                    btype = "paragraphBreak (0.60s)" if (is_last_clause and is_last_in_line) else ("sentenceBreak (0.45s)" if is_last_clause else "majorBreak (0.30s)")
                    parsed_items.append((clause, pause_sec, btype))
            else:
                pause_sec = 0.60 if is_last_in_line else 0.45
                btype = "paragraphBreak (0.60s)" if is_last_in_line else "sentenceBreak (0.45s)"
                parsed_items.append((sentence, pause_sec, btype))

    return parsed_items

with open("liturgy_contents_rows.json", "r", encoding="utf-8") as f:
    rows = json.load(f)

for r in rows:
    if r.get("id") == "4d2f4c67-7d47-4829-81f7-6f921d91928f":
        raw = f"Bài đọc một.\n{r.get('r1_intro')}\n{r.get('r1_content')}"
        clean = perfect_scripture_cleaner(raw)
        items = parse_scripture_chunks(clean)
        
        print("=== CÁC CỤM CÂU PHỤNG VỤ CHUẨN MỚI ===")
        print(f"Tổng số cụm xử lý riêng: {len(items)}")
        for idx, (sent, pause, btype) in enumerate(items, 1):
            print(f"• [{idx}] \"{sent}\"\n  ➔ Pause: {pause}s ({btype})\n")
        break
