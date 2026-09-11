import json
import re

def perfect_scripture_cleaner(text):
    if not text:
        return ""

    # 1. Bỏ các ký tự thập tự ✠ và chuẩn hóa ngoặc kép
    text = text.replace("✠", "").replace("“", '"').replace("”", '"')

    # 2. Xóa các chỉ số câu dạng superscript: ¹ ² ³ ⁴ ⁵ ⁶ ⁷ ⁸ ⁹ ⁰
    for s in "¹²³⁴⁵⁶⁷⁸⁹⁰":
        text = text.replace(s, "")

    # 3. Xóa số câu ở đầu dòng, đầu câu hoặc dính sau ngoặc kép / dấu câu / khoảng trắng
    # Ví dụ: "1 Một hôm...", "\n2 Người...", '"2 Người...', 'đã dạy môn đệ của ông.”2 Người'
    text = re.sub(r'(?:^|[\n\s.!?\"\'\)\],;])\d+[a-z]?(?=[\sA-ZÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴa-zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ])', ' ', text)

    # 4. Xóa số câu đứng riêng lẻ hoặc kèm ký tự a-z
    text = re.sub(r'(?<=\s)\d+[a-z]?(?=[\s.,!?\"\'\)])', ' ', text)

    # 5. Xóa các số câu còn sót lại dạng word boundary
    text = re.sub(r'\b\d+[a-z]?\b', ' ', text)

    # 6. Chuẩn hóa khoảng trắng và dấu câu
    text = text.replace("-", " ")
    text = re.sub(r'\s+', ' ', text).strip()
    return text

with open("liturgy_contents_rows.json", "r", encoding="utf-8") as f:
    rows = json.load(f)

# Scan for any remaining digits in cleaned content
remaining_digit_snippets = []

for idx, r in enumerate(rows):
    for field in ["r1_content", "r2_content", "gospel_content"]:
        content = r.get(field)
        if content and len(content.strip()) > 10:
            cleaned = perfect_scripture_cleaner(content)
            # Find any remaining digits that might not be numbers written as words
            matches = re.findall(r'\b\d+\b', cleaned)
            if matches:
                remaining_digit_snippets.append((field, r.get("id"), matches, cleaned[:100]))

print(f"📊 Đã quét toàn bộ {len(rows)} dòng trong CSDL.")
print(f"📌 Số đoạn văn còn sót chữ số tự nhiên sau khi làm sạch: {len(remaining_digit_snippets)}")

if remaining_digit_snippets:
    print("\n--- MẪU CÁC DÒNG CÒN CHỮ SỐ (ĐỂ ĐÁNH GIÁ XEM LÀ SỐ CÂU HAY SỐ SỐ HỌC) ---")
    for s in remaining_digit_snippets[:10]:
        print(f"Field: {s[0]} | Digits: {s[2]} | Snippet: {s[3]}...")
