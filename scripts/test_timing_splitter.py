import re
import json

def parse_text_with_breaks(text):
    """
    Phân tích văn bản thành các đoạn kèm khoảng nghỉ chính xác theo quy định:
    - Xuống dòng (\n) ➔ paragraphBreak = 0.60s
    - Dấu chấm, hỏi, cảm (. ! ?) ➔ sentenceBreak = 0.45s
    - Dấu chấm phẩy (;) ➔ majorBreak = 0.30s
    - Dấu phẩy (,) ➔ mediumBreak = 0.25s
    """
    if not text:
        return []

    # Tokenize text by break markers, preserving delimiters
    # We match delimiters: \n, [.!?], ;, ,
    pattern = r'(\n|[\.!\?]|;|,)='
    
    # Split text into segments with delimiter attached
    segments = []
    current = ""
    
    i = 0
    n = len(text)
    while i < n:
        char = text[i]
        current += char
        
        if char == '\n':
            segments.append((current.strip(), 0.60, "paragraphBreak"))
            current = ""
        elif char in ['.', '!', '?']:
            segments.append((current.strip(), 0.45, "sentenceBreak"))
            current = ""
        elif char == ';':
            segments.append((current.strip(), 0.30, "majorBreak"))
            current = ""
        elif char == ',':
            segments.append((current.strip(), 0.25, "mediumBreak"))
            current = ""
        i += 1

    if current.strip():
        segments.append((current.strip(), 0.45, "sentenceBreak"))

    # Clean empty segments
    cleaned_segments = []
    for txt, duration, btype in segments:
        clean_txt = txt.strip()
        if clean_txt and clean_txt not in ['.', ',', ';', '!', '?', '\n']:
            cleaned_segments.append((clean_txt, duration, btype))

    return cleaned_segments

with open("liturgy_contents_rows.json", "r", encoding="utf-8") as f:
    rows = json.load(f)

for r in rows:
    if r.get("id") == "4d2f4c67-7d47-4829-81f7-6f921d91928f":
        raw = f"{r.get('r1_intro')}\n{r.get('r1_content')}"
        parsed = parse_text_with_breaks(raw)
        print(f"=== TEST PHÂN TÍCH NGẮT NGHỈ CHO BÀI ĐỌC 1 (Tổng {len(parsed)} đoạn) ===")
        for p in parsed[:8]:
            print(f"• Đoạn: \"{p[0]}\"\n  ➔ Khoảng nghỉ: {p[1]}s ({p[2]})\n")
        break
