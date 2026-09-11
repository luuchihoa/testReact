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

    # 6. Chuẩn hóa tên riêng Phụng vụ: Sa-lô-môn -> Sa Lô Môn (Giúp AI đọc tròn chữ 100% không bị vấp)
    # Thay dấu gạch nối giữa các từ tiếng Việt bằng khoảng trắng
    text = re.sub(r'([a-zA-Zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]+)-([a-zA-Zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]+)', r'\1 \2', text)

    # Thu gọn khoảng trắng
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    return '\n'.join(line for line in lines if line)

def split_into_individual_sentences(text):
    """
    Tách văn bản thành TỪNG CÂU ĐỘC LẬP để gửi từng câu vào AI generate.
    Giúp AI đọc thong thả, không bị liến thoắng dồn dập, và chèn 0.45s / 0.60s Silence Tensor chính xác 100%!
    """
    if not text:
        return []

    lines = text.split('\n')
    parsed_items = []

    for line_idx, line in enumerate(lines):
        line_str = line.strip()
        if not line_str:
            continue

        # Split line into sentences by . ! ?
        raw_sentences = re.split(r'(?<=[.!?])\s+', line_str)
        sentences = [s.strip() for s in raw_sentences if s.strip()]

        for s_idx, sentence in enumerate(sentences):
            is_last_in_line = (s_idx == len(sentences) - 1)
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
        items = split_into_individual_sentences(clean)
        
        print("=== CHUẨN TÁCH CÂU ĐỘC LẬP MỚI ===")
        print(f"Tổng số câu xử lý riêng: {len(items)}")
        for idx, (sent, pause, btype) in enumerate(items, 1):
            print(f"• [{idx}] \"{sent}\"\n  ➔ Pause: {pause}s ({btype})\n")
        break
