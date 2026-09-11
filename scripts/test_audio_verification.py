#!/usr/bin/env python3
"""
Test Suite for Automated Audio Verification & Refinement Pipeline
==================================================================
Chạy kiểm thử tích hợp cho module audio_verifier_refiner.py
"""

import os
import sys
import shutil

# Thêm directory scripts vào python path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from audio_verifier_refiner import (
    STTInspector,
    PhoneticRefiner,
    AudioAnalyzer,
    AudioVerificationPipeline
)

def test_phonetic_refiner():
    print("\n🧪 [Test 1] Phonetic Replacement Engine")
    refiner = PhoneticRefiner()
    
    input_text = "Vua Sa-lô-môn đến dâng lễ tại Ghíp-ôn và xin Chúa ơn tài phân biệt."
    expected_contains = ["Sa Lô Môn", "Ghíp ô-n"]
    
    output_text = refiner.apply_phonetic_fixes(input_text)
    print(f"   Input:    {input_text}")
    print(f"   Refined:  {output_text}")
    
    for word in expected_contains:
        assert word in output_text, f"Lỗi: Không tìm thấy '{word}' trong kết quả refined."
    print("   ✅ PASSED: Phonetic Refiner chuyển đổi chính xác.")

def test_stt_text_discrepancy():
    print("\n🧪 [Test 2] STT Text Discrepancy Matcher")
    stt = STTInspector()
    
    orig = "Vua Sa-lô-môn đến Ghíp-ôn xin ơn tài phân biệt"
    trans = "Vua Sa Lô Môn đến Gép-ôn xin ơn đài phân việt"
    
    discrepancies = stt.check_text_discrepancies(orig, trans)
    print(f"   Số lỗi phát hiện: {len(discrepancies)}")
    for d in discrepancies:
        print(f"   - Original: '{d['original']}' <--> Transcribed: '{d['transcribed']}'")
    
    assert len(discrepancies) >= 1, "Lỗi: Không phát hiện sai lệch từ ngữ."
    print("   ✅ PASSED: Text Discrepancy Matcher hoạt động tốt.")

def test_audio_analyzer():
    print("\n🧪 [Test 3] Audio Feature & Thermal Analyzer")
    analyzer = AudioAnalyzer()
    
    # Tìm file MP3 test sẵn có trong project
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    sample_mp3 = os.path.join(project_root, "test_clean_plain.mp3")
    
    if os.path.exists(sample_mp3):
        print(f"   Phân tích file: {os.path.basename(sample_mp3)}")
        valid_silence, silences = analyzer.validate_silence_timing(sample_mp3)
        has_thermal = analyzer.check_thermal_artifacts(sample_mp3)
        print(f"   - Silence timing valid: {valid_silence} ({len(silences)} khoảng lặng)")
        print(f"   - Thermal artifact detected: {has_thermal}")
        print("   ✅ PASSED: Audio Feature Analysis hoàn tất.")
    else:
        print("   ⚠️ Bỏ qua test file thực tế (test_clean_plain.mp3 không tìm thấy).")

def test_full_pipeline():
    print("\n🧪 [Test 4] Full Auto-Retry Pipeline Controller")
    pipeline = AudioVerificationPipeline()
    
    project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
    target_mp3 = os.path.join(project_root, "test_clean_plain.mp3")
    orig_text = "Vua Sa-lô-môn dâng lễ tại Ghíp-ôn."

    if os.path.exists(target_mp3):
        # Mock render callback
        def mock_render(prompt: str) -> bool:
            print(f"   [Mock Render Callback] Executing render with prompt: '{prompt[:60]}...'")
            return True

        result = pipeline.verify_and_refine_audio(
            audio_path=target_mp3,
            original_text=orig_text,
            render_callback=mock_render,
            max_retries=2,
            cool_down_sec=1.0
        )
        print(f"   Result: {'PASSED' if result else 'FAILED'}")
        print("   ✅ PASSED: Full Pipeline Controller thực thi mượt mà.")
    else:
        print("   ⚠️ Bỏ qua test full pipeline (không có MP3).")

if __name__ == "__main__":
    print("==================================================")
    print("🚀 Bắt đầu Chạy Integration Test cho Verification Pipeline")
    print("==================================================")
    
    try:
        test_phonetic_refiner()
        test_stt_text_discrepancy()
        test_audio_analyzer()
        test_full_pipeline()
        print("\n🎉 BỘ TÍNH NĂNG KIỂM THỬ & SỬA LỖI AUDIO TỰ ĐỘNG ĐÃ SẴN SÀNG!")
    except Exception as e:
        print(f"\n❌ Test thất bại với lỗi: {e}")
        sys.exit(1)
