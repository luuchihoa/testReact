import json
import re

with open("liturgy_contents_rows.json", "r", encoding="utf-8") as f:
    rows = json.load(f)

for r in rows:
    if r.get("id") == "4d2f4c67-7d47-4829-81f7-6f921d91928f":
        raw = f"{r.get('r1_intro')} {r.get('r1_content')}"
        print("=== NỘI DUNG GỐC BÀI ĐỌC 1 (1 V 3,5.7-12) ===")
        print(raw[:350])
        
        # Sửa: GIỮ NGUYÊN dấu gạch nối danh từ riêng (Sa-lo-môn, Ga-ba-ôn, Giê-ru-sa-lem)
        clean = raw.replace("✠", "").replace("“", '"').replace("”", '"')
        for s in "¹²³⁴⁵⁶⁷⁸⁹⁰":
            clean = clean.replace(s, "")
        
        # Chỉ xóa số câu chỉ dẫn:
        clean = re.sub(r'(?:^|[\n\s.!?\"\'\)\],;])\d+[a-z]?(?=[\sA-ZÀÁẢÃẠÂẦẤẨẪẬĂẰẮẲẴẶÈÉẺẼẸÊỀẾỂỄỆÌÍỈĨỊÒÓỎÕỌÔỒỐỔỖỘƠỜỚỞỠỢÙÚỦŨỤƯỪỨỬỮỰỲÝỶỸỴa-zàáảãạâầấẩẫậăằắẳẵặèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ])', ' ', clean)
        clean = re.sub(r'\s+', ' ', clean).strip()
        
        print("\n=== NỘI DUNG GIỮ DẤU GẠCH NỐI TÊN RIÊNG Phụng Vụ ===")
        print(clean[:350])
        break
