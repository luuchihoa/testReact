import os
import sys
import re
import json
import gc
import time
import subprocess
import torch
import torchaudio

# Add OmniVoice Studio path
sys.path.append('/Users/tranthithuynhi/OmniVoice-Studio')
from omnivoice import OmniVoice

REF_FEMALE_VOICE = "/Users/tranthithuynhi/OmniVoice-Studio/backend/assets/samples/voice_giang - northern female narrator.mp3"
REF_MALE_VOICE = "/Users/tranthithuynhi/OmniVoice-Studio/backend/assets/samples/voice_trieu duong -deep, calm and resonant.mp3"

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

    # 6. Thu gọn khoảng trắng ngang (không làm mất \n)
    lines = [re.sub(r'[ \t]+', ' ', line).strip() for line in text.split('\n')]
    return '\n'.join(line for line in lines if line)

def parse_full_sentences_with_pauses(text):
    """
    Giữ NGUYÊN CÂU HOÀN CHỈNH (không ngắt vụn theo dấu phẩy) để giọng đọc mượt mà không bị hẫng:
    - Xuống dòng (\n) ➔ paragraphBreak = 0.60s
    - Câu (. ! ?) ➔ sentenceBreak = 0.45s
    """
    if not text:
        return []

    lines = text.split('\n')
    parsed_items = []
    
    for line_idx, line in enumerate(lines):
        line_str = line.strip()
        if not line_str:
            continue
            
        # Split line into full sentences by . ! ?
        raw_sentences = re.split(r'(?<=[.!?])\s+', line_str)
        sentences = [s.strip() for s in raw_sentences if s.strip()]
        
        for s_idx, sentence in enumerate(sentences):
            # Is last sentence of paragraph/line?
            is_last_in_line = (s_idx == len(sentences) - 1)
            pause_sec = 0.60 if is_last_in_line else 0.45
            btype = "paragraphBreak (0.60s)" if is_last_in_line else "sentenceBreak (0.45s)"
            parsed_items.append((sentence, pause_sec, btype))
            
    return parsed_items

def convert_wav_to_mp3(wav_path, mp3_path):
    cmd = [
        "ffmpeg", "-y",
        "-i", wav_path,
        "-codec:a", "libmp3lame",
        "-b:a", "96k",
        "-ac", "1",
        mp3_path
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL, check=True)

with open("liturgy_contents_rows.json", "r", encoding="utf-8") as f:
    rows = json.load(f)

for r in rows:
    if r.get("id") == "4d2f4c67-7d47-4829-81f7-6f921d91928f":
        raw = f"Bài đọc một.\n{r.get('r1_intro')}\n{r.get('r1_content')}"
        clean = perfect_scripture_cleaner(raw)
        items = parse_full_sentences_with_pauses(clean)
        
        print("=== CHUẨN NGHỈ MỚI (GIỮ NGUYÊN CÂU, KHÔNG NGẮT HẪNG DẤU PHẨY) ===")
        print(f"Tổng số câu: {len(items)}")
        for idx, (sent, pause, btype) in enumerate(items[:6], 1):
            print(f"• [{idx}] \"{sent}\"\n  ➔ Pause: {pause}s ({btype})\n")
        break
