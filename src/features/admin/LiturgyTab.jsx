import React, { useState, useEffect, useMemo } from 'react';
import { BookOpen, Save, CheckCircle2, AlertCircle, Loader2, CalendarRange, Calendar } from 'lucide-react';
import { supabase } from '../../lib/supabase.js';

export default function LiturgyTab() {
  const [inputType, setInputType] = useState(() => localStorage.getItem('admin_inputType') || 'season');

  // State for "season" mode
  const [seasonMode, setSeasonMode] = useState(() => localStorage.getItem('admin_season') || 'thuong');
  const [week, setWeek] = useState(() => Number(localStorage.getItem('admin_week')) || 1);
  const [dayOfWeek, setDayOfWeek] = useState(() => localStorage.getItem('admin_day') || 'thu2');
  
  // State for "fixed" mode
  const [fixedMonth, setFixedMonth] = useState(() => Number(localStorage.getItem('admin_fixedMonth')) || 1);
  const [fixedDate, setFixedDate] = useState(() => Number(localStorage.getItem('admin_fixedDate')) || 1);

  // Shared state
  const [selectedCycle, setSelectedCycle] = useState(() => localStorage.getItem('admin_cycle') || 'all');

  // Lưu state vào localStorage để không bị mất khi F5 hoặc đóng web
  useEffect(() => {
    localStorage.setItem('admin_inputType', inputType);
    localStorage.setItem('admin_season', seasonMode);
    localStorage.setItem('admin_week', week.toString());
    localStorage.setItem('admin_day', dayOfWeek);
    localStorage.setItem('admin_fixedMonth', fixedMonth.toString());
    localStorage.setItem('admin_fixedDate', fixedDate.toString());
    localStorage.setItem('admin_cycle', selectedCycle);
  }, [inputType, seasonMode, week, dayOfWeek, fixedMonth, fixedDate, selectedCycle]);

  const [formData, setFormData] = useState({
    title: "",
    quote: "",
    r1_ref: "", r1_quote: "", r1_intro: "", r1_content: "",
    psalm_ref: "", psalm_content: "",
    r2_ref: "", r2_quote: "", r2_intro: "", r2_content: "",
    gospel_ref: "", gospel_alleluia: "", gospel_intro: "", gospel_content: "",
    reflection: ""
  });

  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  // Tính toán Key dựa trên UI
  const generatedKey = useMemo(() => {
    if (inputType === 'season') {
      if (dayOfWeek === 'cn') return `${seasonMode}_cn_${week}`;
      return `${seasonMode}_${week}_${dayOfWeek}`;
    } else {
      const m = fixedMonth.toString().padStart(2, '0');
      const d = fixedDate.toString().padStart(2, '0');
      return `fixed_${m}_${d}`;
    }
  }, [inputType, seasonMode, week, dayOfWeek, fixedMonth, fixedDate]);

  // Load data
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      setMessage(null);
      try {
        const { data } = await supabase
          .from('liturgy_contents')
          .select('*')
          .eq('liturgy_key', generatedKey)
          .eq('cycle', selectedCycle)
          .single();

        if (data) {
          setFormData({
            title: data.title || "",
            quote: data.quote || "",
            r1_ref: data.r1_ref || "", r1_quote: data.r1_quote || "", r1_intro: data.r1_intro || "", r1_content: data.r1_content || "",
            psalm_ref: data.psalm_ref || "", psalm_content: data.psalm_content || "",
            r2_ref: data.r2_ref || "", r2_quote: data.r2_quote || "", r2_intro: data.r2_intro || "", r2_content: data.r2_content || "",
            gospel_ref: data.gospel_ref || "", gospel_alleluia: data.gospel_alleluia || "", gospel_intro: data.gospel_intro || "", gospel_content: data.gospel_content || "",
            reflection: data.reflection || ""
          });
        } else {
          // Generate auto title
          let autoTitle = "";
          if (inputType === 'season') {
            const toRoman = (num) => {
              const roman = { M: 1000, CM: 900, D: 500, CD: 400, C: 100, XC: 90, L: 50, XL: 40, X: 10, IX: 9, V: 5, IV: 4, I: 1 };
              let str = '';
              for (let i of Object.keys(roman)) {
                let q = Math.floor(num / roman[i]);
                num -= q * roman[i];
                str += i.repeat(q);
              }
              return str;
            };
            const daysMap = { thu2: "Thứ Hai", thu3: "Thứ Ba", thu4: "Thứ Tư", thu5: "Thứ Năm", thu6: "Thứ Sáu", thu7: "Thứ Bảy", cn: "Chúa Nhật" };
            const seasonMap = { thuong: "Mùa Thường Niên", vong: "Mùa Vọng", giangsinh: "Mùa Giáng Sinh", chay: "Mùa Chay", phucsinh: "Mùa Phục Sinh" };
            autoTitle = `${daysMap[dayOfWeek]} Tuần ${toRoman(week)} ${seasonMap[seasonMode]}`;
          }

          // Khởi tạo form trống
          let newFormData = {
            title: autoTitle, quote: "",
            r1_ref: "", r1_quote: "", r1_intro: "", r1_content: "",
            psalm_ref: "", psalm_content: "",
            r2_ref: "", r2_quote: "", r2_intro: "", r2_content: "",
            gospel_ref: "", gospel_alleluia: "", gospel_intro: "", gospel_content: "",
            reflection: ""
          };

          // Tính năng Mượn Phúc Âm (Dành cho ngày thường khi Phúc Âm giống nhau giữa Năm I và Năm II)
          if (inputType === 'season' && dayOfWeek !== 'cn' && (selectedCycle === 'I' || selectedCycle === 'II')) {
            const otherCycle = selectedCycle === 'I' ? 'II' : 'I';
            const { data: otherData } = await supabase
              .from('liturgy_contents')
              .select('gospel_ref, gospel_alleluia, gospel_intro, gospel_content')
              .eq('liturgy_key', generatedKey)
              .eq('cycle', otherCycle)
              .single();
            
            if (otherData && otherData.gospel_content) {
              newFormData = {
                ...newFormData,
                gospel_ref: otherData.gospel_ref || "",
                gospel_alleluia: otherData.gospel_alleluia || "",
                gospel_intro: otherData.gospel_intro || "",
                gospel_content: otherData.gospel_content || ""
              };
            }
          }

          setFormData(newFormData);
        }
      } catch (err) {
        console.error("Error loading liturgy content:", err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [generatedKey, selectedCycle, inputType, seasonMode, week, dayOfWeek]);

  // Make sure cycle is valid for current selection
  useEffect(() => {
    if (inputType === 'season') {
      if (dayOfWeek === 'cn') {
        if (!['A', 'B', 'C', 'all'].includes(selectedCycle)) setSelectedCycle('A');
      } else {
        if (!['I', 'II', 'all'].includes(selectedCycle)) setSelectedCycle('I');
      }
    }
  }, [inputType, dayOfWeek, selectedCycle]);

  const handleSave = async () => {
    if (!formData.title) {
      setMessage({ type: 'error', text: 'Vui lòng nhập Tiêu đề chính!' });
      return;
    }

    setSaving(true);
    setMessage(null);

    // Auto format quote
    let finalQuote = formData.quote?.trim() || '';
    if (finalQuote && !finalQuote.startsWith('«')) finalQuote = '« ' + finalQuote;
    if (finalQuote && !finalQuote.endsWith('»')) finalQuote = finalQuote + ' »';

    try {
      const { error } = await supabase
        .from('liturgy_contents')
        .upsert({
          liturgy_key: generatedKey,
          cycle: selectedCycle,
          title: formData.title,
          quote: finalQuote,
          r1_ref: formData.r1_ref, r1_quote: formData.r1_quote, r1_intro: formData.r1_intro, r1_content: formData.r1_content,
          psalm_ref: formData.psalm_ref, psalm_content: formData.psalm_content,
          r2_ref: formData.r2_ref, r2_quote: formData.r2_quote, r2_intro: formData.r2_intro, r2_content: formData.r2_content,
          gospel_ref: formData.gospel_ref, gospel_alleluia: formData.gospel_alleluia, gospel_intro: formData.gospel_intro, gospel_content: formData.gospel_content,
          reflection: formData.reflection
        }, {
          onConflict: 'liturgy_key,cycle'
        });

      if (error) throw error;
      
      setMessage({ type: 'success', text: 'Đã lưu dữ liệu Lời Chúa thành công!' });
    } catch (err) {
      console.error(err);
      setMessage({ type: 'error', text: 'Có lỗi xảy ra khi lưu dữ liệu.' });
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="max-w-5xl mx-auto pb-24">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-100 flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-amber-600" /> Quản lý Lời Chúa
          </h1>
          <p className="text-[14px] text-stone-500 mt-1">Hệ thống biên soạn Sách Lễ Roma điện tử.</p>
        </div>

        {/* Toggle Mode */}
        <div className="flex items-center bg-stone-100 dark:bg-stone-800 p-1 rounded-xl shadow-inner border border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setInputType('season')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-colors ${
              inputType === 'season' 
                ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-sm' 
                : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            <CalendarRange className="w-4 h-4" /> Nhập theo Mùa
          </button>
          <button
            onClick={() => setInputType('fixed')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-[13px] font-bold transition-colors ${
              inputType === 'fixed' 
                ? 'bg-white dark:bg-stone-700 text-amber-700 dark:text-amber-400 shadow-sm' 
                : 'text-stone-500 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            <Calendar className="w-4 h-4" /> Lễ Cố Định
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white dark:bg-stone-900 rounded-2xl border border-stone-200 dark:border-stone-800 shadow-sm overflow-hidden mb-6">
        
        {/* Thanh Chọn Cấu Trúc */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border-b border-amber-100 dark:border-amber-900/50 px-6 py-4">
          <div className="text-[12px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-500 mb-3">
            Cấu trúc Phụng Vụ
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {inputType === 'season' ? (
              <>
                <select value={seasonMode} onChange={(e) => setSeasonMode(e.target.value)} className="bg-white dark:bg-stone-800 border border-amber-200 dark:border-amber-700/50 text-amber-950 dark:text-amber-100 font-bold rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="thuong">Mùa Thường Niên</option>
                  <option value="vong">Mùa Vọng</option>
                  <option value="giangsinh">Mùa Giáng Sinh</option>
                  <option value="chay">Mùa Chay</option>
                  <option value="phucsinh">Mùa Phục Sinh</option>
                </select>
                <select value={week} onChange={(e) => setWeek(Number(e.target.value))} className="bg-white dark:bg-stone-800 border border-amber-200 dark:border-amber-700/50 text-amber-950 dark:text-amber-100 font-bold rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-500">
                  {Array.from({ length: 34 }, (_, i) => i + 1).map(w => <option key={w} value={w}>Tuần {w}</option>)}
                </select>
                <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)} className="bg-white dark:bg-stone-800 border border-amber-200 dark:border-amber-700/50 text-amber-950 dark:text-amber-100 font-bold rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-500">
                  <option value="thu2">Thứ 2</option>
                  <option value="thu3">Thứ 3</option>
                  <option value="thu4">Thứ 4</option>
                  <option value="thu5">Thứ 5</option>
                  <option value="thu6">Thứ 6</option>
                  <option value="thu7">Thứ 7</option>
                  <option value="cn">Chúa Nhật</option>
                </select>
              </>
            ) : (
              <>
                <select value={fixedMonth} onChange={(e) => setFixedMonth(Number(e.target.value))} className="bg-white dark:bg-stone-800 border border-amber-200 dark:border-amber-700/50 text-amber-950 dark:text-amber-100 font-bold rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-500">
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(m => <option key={m} value={m}>Tháng {m}</option>)}
                </select>
                <select value={fixedDate} onChange={(e) => setFixedDate(Number(e.target.value))} className="bg-white dark:bg-stone-800 border border-amber-200 dark:border-amber-700/50 text-amber-950 dark:text-amber-100 font-bold rounded-lg px-3 py-2 text-[14px] focus:outline-none focus:ring-2 focus:ring-amber-500">
                  {Array.from({ length: 31 }, (_, i) => i + 1).map(d => <option key={d} value={d}>Ngày {d}</option>)}
                </select>
              </>
            )}

            <span className="text-amber-300 dark:text-amber-900 font-light text-2xl mx-1">/</span>

            <select value={selectedCycle} onChange={(e) => setSelectedCycle(e.target.value)} className="bg-amber-600 border border-amber-700 text-white font-bold rounded-lg px-3 py-2 text-[14px] focus:outline-none shadow-sm">
              {inputType === 'season' && dayOfWeek === 'cn' ? (
                <><option value="A">Năm A</option><option value="B">Năm B</option><option value="C">Năm C</option><option value="all">Chung (Tất cả)</option></>
              ) : inputType === 'season' && dayOfWeek !== 'cn' ? (
                <><option value="I">Năm Lẻ (I)</option><option value="II">Năm Chẵn (II)</option><option value="all">Chung (Tất cả)</option></>
              ) : (
                <><option value="all">Chung (Tất cả)</option><option value="A">Năm A</option><option value="B">Năm B</option><option value="C">Năm C</option><option value="I">Năm Lẻ (I)</option><option value="II">Năm Chẵn (II)</option></>
              )}
            </select>
          </div>

          <div className="mt-3 text-[13px] text-amber-800/80 dark:text-amber-200/60 flex items-center justify-between">
            <span>Mã hệ thống: <b className="font-mono bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">{generatedKey}</b></span>
            <button onClick={handleSave} disabled={saving || loading} className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-xl font-bold text-[13px] transition-colors disabled:opacity-50">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Lưu Bài Này
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mx-6 mt-6 px-4 py-3 rounded-xl flex items-start gap-3 ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'} border`}>
            {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            <span className="text-[14px] font-medium">{message.text}</span>
          </div>
        )}

        {/* Form */}
        <div className="p-6 space-y-8">
          {loading ? (
            <div className="py-12 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-stone-300" /></div>
          ) : (
            <>
              {/* GLOBAL */}
              <div className="bg-stone-50 dark:bg-stone-800/50 p-5 rounded-2xl border border-stone-200 dark:border-stone-700/50">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Tiêu đề chính <span className="text-red-500">*</span></label>
                    <input type="text" name="title" value={formData.title} onChange={handleInputChange} placeholder="VD: Chúa Nhật Tuần XVI Thường Niên" className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-amber-500/50" />
                  </div>
                  <div>
                    <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Câu Lời Chúa nổi bật (Hiển thị Home)</label>
                    <input type="text" name="quote" value={formData.quote} onChange={handleInputChange} placeholder="VD: « Con Người làm chủ ngày sa-bát. »" className="w-full bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2.5 text-[14px] focus:ring-2 focus:ring-amber-500/50" />
                  </div>
                </div>
              </div>

              {/* BÀI ĐỌC 1 */}
              <div className="space-y-4">
                <h3 className="font-serif text-[18px] text-amber-800 dark:text-amber-500 font-bold uppercase tracking-wide border-b border-stone-200 dark:border-stone-700 pb-2">1. Bài Đọc 1</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Mã trích dẫn</label>
                    <input type="text" name="r1_ref" value={formData.r1_ref} onChange={handleInputChange} placeholder="VD: Is 38,1-6.21-22.7-8" className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2 text-[14px]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Câu tóm tắt / Ý chính</label>
                    <input type="text" name="r1_quote" value={formData.r1_quote} onChange={handleInputChange} placeholder="VD: Ta đã nghe lời ngươi cầu nguyện..." className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2 text-[14px] italic" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Lời dẫn (Tiêu đề sách)</label>
                  <input type="text" name="r1_intro" value={formData.r1_intro} onChange={handleInputChange} placeholder="VD: Bài trích sách ngôn sứ I-sai-a." className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2 text-[14px] font-bold" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Nội dung Bài Đọc 1</label>
                  <textarea name="r1_content" value={formData.r1_content} onChange={handleInputChange} rows={6} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-[14px] font-serif leading-relaxed" />
                </div>
              </div>

              {/* ĐÁP CA */}
              <div className="space-y-4">
                <h3 className="font-serif text-[18px] text-amber-800 dark:text-amber-500 font-bold uppercase tracking-wide border-b border-stone-200 dark:border-stone-700 pb-2">2. Đáp Ca</h3>
                <div>
                  <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Mã trích dẫn</label>
                  <input type="text" name="psalm_ref" value={formData.psalm_ref} onChange={handleInputChange} placeholder="VD: Is 38,10.11.12abcd.16" className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2 text-[14px]" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Nội dung Đáp Ca</label>
                  <textarea name="psalm_content" value={formData.psalm_content} onChange={handleInputChange} rows={6} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-[14px] font-serif leading-relaxed" />
                </div>
              </div>

              {/* BÀI ĐỌC 2 */}
              <div className="space-y-4">
                <h3 className="font-serif text-[18px] text-amber-800 dark:text-amber-500 font-bold uppercase tracking-wide border-b border-stone-200 dark:border-stone-700 pb-2">3. Bài Đọc 2 (Tùy chọn)</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Mã trích dẫn</label>
                    <input type="text" name="r2_ref" value={formData.r2_ref} onChange={handleInputChange} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2 text-[14px]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Câu tóm tắt / Ý chính</label>
                    <input type="text" name="r2_quote" value={formData.r2_quote} onChange={handleInputChange} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2 text-[14px] italic" />
                  </div>
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Lời dẫn</label>
                  <input type="text" name="r2_intro" value={formData.r2_intro} onChange={handleInputChange} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2 text-[14px] font-bold" />
                </div>
                <div>
                  <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Nội dung Bài Đọc 2</label>
                  <textarea name="r2_content" value={formData.r2_content} onChange={handleInputChange} rows={6} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-[14px] font-serif leading-relaxed" />
                </div>
              </div>

              {/* PHÚC ÂM */}
              <div className="space-y-4">
                <h3 className="font-serif text-[18px] text-amber-800 dark:text-amber-500 font-bold uppercase tracking-wide border-b border-stone-200 dark:border-stone-700 pb-2">4. Phúc Âm (Tin Mừng)</h3>
                
                <div>
                  <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Tung hô Tin Mừng (Alleluia)</label>
                  <textarea name="gospel_alleluia" value={formData.gospel_alleluia} onChange={handleInputChange} rows={3} placeholder="VD: Ha-lê-lui-a. Chúa nói : Chiên của tôi..." className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-[14px] font-serif leading-relaxed italic" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-1">
                    <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Mã trích dẫn</label>
                    <input type="text" name="gospel_ref" value={formData.gospel_ref} onChange={handleInputChange} placeholder="VD: Mt 12,1-8" className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2 text-[14px]" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Lời dẫn</label>
                    <input type="text" name="gospel_intro" value={formData.gospel_intro} onChange={handleInputChange} placeholder="VD: ✠ Tin Mừng Chúa Giê-su Ki-tô theo thánh..." className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-2 text-[14px] font-bold" />
                  </div>
                </div>

                <div>
                  <label className="block text-[13px] font-bold text-stone-700 dark:text-stone-300 mb-2">Nội dung Tin Mừng</label>
                  <textarea name="gospel_content" value={formData.gospel_content} onChange={handleInputChange} rows={8} className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-[14px] font-serif leading-relaxed" />
                </div>
              </div>

              {/* SUY NIỆM */}
              <div className="space-y-4">
                <h3 className="font-serif text-[18px] text-amber-800 dark:text-amber-500 font-bold uppercase tracking-wide border-b border-stone-200 dark:border-stone-700 pb-2">5. Bài Suy Niệm</h3>
                <div>
                  <textarea name="reflection" value={formData.reflection} onChange={handleInputChange} rows={8} placeholder="Bài suy niệm..." className="w-full bg-stone-50 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-xl px-4 py-3 text-[14px] leading-relaxed" />
                </div>
              </div>

            </>
          )}
        </div>
      </div>
    </div>
  );
}
