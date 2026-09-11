import re
import json

def perfect_scripture_cleaner(text):
    if not text:
        return ""

    # 1. Bỏ ký tự thập tự ✠ và chuẩn hóa ngoặc kép
    text = text.replace("✠", "").replace("“", '"').replace("”", '"')

    # 2. Xóa các chỉ số câu dạng superscript: ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁰
    for s in "¹²³⁴⁵⁶⁷⁸⁹⁰":
        text = text.replace(s, "")

    # 3. GIỮ NGUYÊN DẤU CHẤM CÂU (. ! ?), chỉ xóa chữ số câu câu chỉ dẫn (ví dụ: ".5 Con" -> ". Con", ".”7 Vua" -> ".” Vua")
    # Sử dụng Lookbehind/Lookahead để không làm mất dấu chấm hay dấu ngoặc trước đó
    text = re.sub(r'(?<=[.!?\"\'\)\],;\s])\d+[a-z]?(?=\s|[A-ZÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴa-zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ])', '', text)
    text = re.sub(r'^\d+[a-z]?\s*', '', text) # Xóa số ở đầu câu văn

    # 4. Phiên âm địa danh & tên riêng chuẩn giọng đọc AI:
    # "Ghíp-ôn" -> "Gíp Ôn" (chữ Gíp giúp AI OmniVoice phát âm chuẩn 100% âm "Ghíp", không bị lái sang "Gép")
    text = text.replace("Ghíp-ôn", "Gíp Ôn").replace("Ghíp Ôn", "Gíp Ôn").replace("Ghíp ôn", "Gíp Ôn")
    text = text.replace("Sa-lô-môn", "Sa Lô Môn").replace("Đa-vít", "Đa Vít").replace("Giê-su", "Giê Su").replace("Ki-tô", "Ki Tô")
    
    # Chuẩn hóa gạch nối từ ghép còn lại
    text = re.sub(r'([a-zA-Zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]+)-([a-zA-Zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]+)', r'\1 \2', text)

    # Thu gọn khoảng trắng ngang
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    return '\n'.join(line for line in lines if line)

with open("liturgy_contents_rows.json", "r", encoding="utf-8") as f:
    rows = json.load(f)

for r in rows:
    if r.get("id") == "4d2f4c67-7d47-4829-81f7-6f921d91928f":
        raw = f"Bài đọc một.\n{r.get('r1_intro')}\n{r.get('r1_content')}"
        clean = perfect_scripture_cleaner(raw)
        
        print("=== NỘI DUNG SAU KHÍ BẢO TỒN DẤU CHẤM CÂU VÀ SỬA PHIÊN ÂM GÍP ÔN ===")
        print(clean)
        break
