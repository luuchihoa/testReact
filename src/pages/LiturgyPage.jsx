import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Calendar, ChevronLeft, ChevronRight, Loader2, PlayCircle, 
  PauseCircle, CalendarDays, Copy, Share2, Check, Sparkles, Volume2, ArrowUp, 
  Eye, EyeOff, Maximize2, Minimize2
} from 'lucide-react';
import { usePageMotion } from '../hooks/usePageMotion.js';
import { getLiturgyInfo, getLiturgicalYear, getLiturgicalColor } from '../utils/liturgyCalendar.js';
import { supabase } from '../lib/supabase.js';
import { Link } from 'react-router-dom';

function getLiturgicalCycles(year) {
  const sundayCycle = ["C", "A", "B"][year % 3];
  const weekdayCycle = (year % 2 === 0) ? "II" : "I";
  return { sundayCycle, weekdayCycle };
}

// ─────────────────────────────────────────────────────────────
// BẢNG MÀU PHỤNG VỤ ĐỘNG (Dynamic Liturgical Theme System)
// ─────────────────────────────────────────────────────────────
const LITURGICAL_THEMES = {
  amber: {
    name: 'Vàng / Trắng (Mùa Phục Sinh & Giáng Sinh / Lễ Trọng)',
    badgeBg: 'bg-amber-100/90 dark:bg-amber-950/60 border-amber-300 dark:border-amber-700/60 text-amber-900 dark:text-amber-200',
    accentText: 'text-amber-700 dark:text-amber-400',
    headingText: 'text-amber-950 dark:text-amber-300',
    borderAccent: 'border-amber-500 dark:border-amber-500',
    bgHover: 'hover:bg-amber-100/50 dark:hover:bg-amber-900/30',
    btnBg: 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-900/20',
    activeDay: 'bg-amber-600 text-white shadow-md shadow-amber-900/20 font-bold',
    todayDay: 'bg-amber-100 text-amber-900 dark:bg-amber-900/40 dark:text-amber-100 font-bold',
    gospelCardBg: 'bg-amber-50/60 dark:bg-stone-900/90 border-amber-200 dark:border-amber-800/60',
    icon: 'text-amber-600 dark:text-amber-400',
    navBg: 'bg-white/90 dark:bg-stone-900/90 border-amber-900/10 dark:border-amber-100/10',
    supColor: 'text-amber-600 dark:text-amber-400',
  },
  emerald: {
    name: 'Xanh Lá (Mùa Thường Niên)',
    badgeBg: 'bg-emerald-100/90 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-700/60 text-emerald-900 dark:text-emerald-200',
    accentText: 'text-emerald-700 dark:text-emerald-400',
    headingText: 'text-emerald-950 dark:text-emerald-300',
    borderAccent: 'border-emerald-500 dark:border-emerald-500',
    bgHover: 'hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30',
    btnBg: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-900/20',
    activeDay: 'bg-emerald-600 text-white shadow-md shadow-emerald-900/20 font-bold',
    todayDay: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-900/40 dark:text-emerald-100 font-bold',
    gospelCardBg: 'bg-emerald-50/60 dark:bg-stone-900/90 border-emerald-200 dark:border-emerald-800/60',
    icon: 'text-emerald-600 dark:text-emerald-400',
    navBg: 'bg-white/90 dark:bg-stone-900/90 border-emerald-900/10 dark:border-emerald-100/10',
    supColor: 'text-emerald-600 dark:text-emerald-400',
  },
  purple: {
    name: 'Tím (Mùa Vọng & Mùa Chay)',
    badgeBg: 'bg-purple-100/90 dark:bg-purple-950/60 border-purple-300 dark:border-purple-700/60 text-purple-900 dark:text-purple-200',
    accentText: 'text-purple-700 dark:text-purple-400',
    headingText: 'text-purple-950 dark:text-purple-300',
    borderAccent: 'border-purple-500 dark:border-purple-500',
    bgHover: 'hover:bg-purple-100/50 dark:hover:bg-purple-900/30',
    btnBg: 'bg-purple-600 hover:bg-purple-700 text-white shadow-purple-900/20',
    activeDay: 'bg-purple-600 text-white shadow-md shadow-purple-900/20 font-bold',
    todayDay: 'bg-purple-100 text-purple-900 dark:bg-purple-900/40 dark:text-purple-100 font-bold',
    gospelCardBg: 'bg-purple-50/60 dark:bg-stone-900/90 border-purple-200 dark:border-purple-800/60',
    icon: 'text-purple-600 dark:text-purple-400',
    navBg: 'bg-white/90 dark:bg-stone-900/90 border-purple-900/10 dark:border-purple-100/10',
    supColor: 'text-purple-600 dark:text-purple-400',
  },
  rose: {
    name: 'Đỏ (Lễ Tử Đạo / Lễ Chúa Thánh Thần / Lễ Lá)',
    badgeBg: 'bg-rose-100/90 dark:bg-rose-950/60 border-rose-300 dark:border-rose-700/60 text-rose-900 dark:text-rose-200',
    accentText: 'text-rose-700 dark:text-rose-400',
    headingText: 'text-rose-950 dark:text-rose-300',
    borderAccent: 'border-rose-500 dark:border-rose-500',
    bgHover: 'hover:bg-rose-100/50 dark:hover:bg-rose-900/30',
    btnBg: 'bg-rose-600 hover:bg-rose-700 text-white shadow-rose-900/20',
    activeDay: 'bg-rose-600 text-white shadow-md shadow-rose-900/20 font-bold',
    todayDay: 'bg-rose-100 text-rose-900 dark:bg-rose-900/40 dark:text-rose-100 font-bold',
    gospelCardBg: 'bg-rose-50/60 dark:bg-stone-900/90 border-rose-200 dark:border-rose-800/60',
    icon: 'text-rose-600 dark:text-rose-400',
    navBg: 'bg-white/90 dark:bg-stone-900/90 border-rose-900/10 dark:border-rose-100/10',
    supColor: 'text-rose-600 dark:text-rose-400',
  }
};

// ─────────────────────────────────────────────────────────────
// COMPONENT: Dải Lịch 7 Ngày 1 Chạm (Horizontal Week Ribbon)
// ─────────────────────────────────────────────────────────────
function WeekRibbon({ selectedDate, onSelectDate, theme }) {
  const getDaysOfWeek = (currDate) => {
    const current = new Date(currDate);
    const dayOfWeek = current.getDay(); // 0: CN, 1: T2...
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    
    const monday = new Date(current);
    monday.setDate(current.getDate() + mondayOffset);

    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return d;
    });
  };

  const days = getDaysOfWeek(selectedDate);
  const dowLabels = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];

  return (
    <div className="flex items-center justify-between gap-1 bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-2xl p-1.5 border border-stone-200/80 dark:border-stone-800/80 shadow-sm overflow-x-auto no-scrollbar my-3">
      {days.map((d, idx) => {
        const isSelected = d.toDateString() === selectedDate.toDateString();
        const isToday = d.toDateString() === new Date().toDateString();

        return (
          <button
            key={d.toISOString()}
            onClick={() => onSelectDate(d)}
            className={`flex-1 min-w-[42px] py-1.5 px-1 rounded-xl flex flex-col items-center justify-center transition-all active:scale-95 ${
              isSelected
                ? theme.activeDay
                : isToday
                ? theme.todayDay
                : "text-stone-600 dark:text-stone-400 hover:bg-stone-100 dark:hover:bg-stone-800"
            }`}
          >
            <span className={`text-[10px] font-bold uppercase ${idx === 6 && !isSelected ? 'text-rose-500' : ''}`}>
              {dowLabels[idx]}
            </span>
            <span className="text-[13px] font-extrabold mt-0.5">
              {d.getDate()}
            </span>
          </button>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENT: Custom Date Picker Dropdown
// ─────────────────────────────────────────────────────────────
function CustomDatePicker({ selectedDate, onChange, onClose, theme }) {
  const [viewDate, setViewDate] = useState(new Date(selectedDate));
  
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();
  
  const handlePrevMonth = () => setViewDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setViewDate(new Date(year, month + 1, 1));
  const handleToday = () => {
    const today = new Date();
    setViewDate(today);
    onChange(today);
    onClose();
  };

  const days = [];
  for (let i = 0; i < (firstDayIndex === 0 ? 6 : firstDayIndex - 1); i++) {
    days.push(<div key={`empty-${i}`} className="w-8 h-8" />);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    const d = new Date(year, month, i);
    const isSelected = d.toDateString() === selectedDate.toDateString();
    const isToday = d.toDateString() === new Date().toDateString();

    days.push(
      <button
        key={i}
        onClick={() => {
          onChange(d);
          onClose();
        }}
        className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-medium transition-all ${
          isSelected
            ? theme.activeDay
            : isToday
            ? theme.todayDay
            : "text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800"
        }`}
      >
        {i}
      </button>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 10, scale: 0.95 }}
      className="absolute top-full mt-3 left-1/2 -translate-x-1/2 w-[290px] bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-2xl shadow-2xl p-4 z-50"
    >
      <div className="flex items-center justify-between mb-4">
        <button onClick={handlePrevMonth} className="p-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
          <ChevronLeft className="w-4 h-4" />
        </button>
        <div className="text-[14px] font-bold text-stone-900 dark:text-stone-100">
          Tháng {month + 1}, {year}
        </div>
        <button onClick={handleNextMonth} className="p-1.5 text-stone-500 hover:bg-stone-100 dark:hover:bg-stone-800 rounded-lg transition-colors">
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2 text-center">
        {["T2", "T3", "T4", "T5", "T6", "T7", "CN"].map((dow, i) => (
          <div key={dow} className={`text-[11px] font-bold ${i === 6 ? "text-rose-500" : "text-stone-400"}`}>
            {dow}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 place-items-center">
        {days}
      </div>

      <div className="mt-4 pt-3 border-t border-stone-100 dark:border-stone-800 text-center">
        <button onClick={handleToday} className={`text-[12px] font-bold ${theme.accentText} hover:underline`}>
          Về Hôm Nay
        </button>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// PAGE COMPONENT MAIN
// ─────────────────────────────────────────────────────────────
export default function LiturgyPage() {
  const { heroReveal } = usePageMotion();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [liturgyInfo, setLiturgyInfo] = useState(null);
  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Custom Controls State
  const [fontSize, setFontSize] = useState('medium'); // 'normal' | 'medium' | 'large'
  const [fontStyle, setFontStyle] = useState('serif'); // 'serif' | 'sans'
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isFocusMode, setIsFocusMode] = useState(false);

  // Trạng thái mở dropdown chọn ngày
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  // Xác định theme màu phụng vụ
  const colorKey = getLiturgicalColor(liturgyInfo);
  const theme = LITURGICAL_THEMES[colorKey] || LITURGICAL_THEMES.amber;

  // Click outside để đóng dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsPickerOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  useEffect(() => {
    const fetchFullReading = async () => {
      setLoading(true);
      try {
        const info = getLiturgyInfo(selectedDate);
        setLiturgyInfo(info);

        const lityear = getLiturgicalYear(selectedDate);
        const cycles = getLiturgicalCycles(lityear);
        const isSpecialABCFeast = info.key === 'feast_thanh_tam' || info.key === 'feast_gia_that' || info.key === 'feast_tet_1';
        
        let currentCycle;
        if (info.isSunday || isSpecialABCFeast) {
          currentCycle = cycles.sundayCycle;
        } else if (info.season === 'thuong') {
          currentCycle = cycles.weekdayCycle;
        } else {
          currentCycle = 'all';
        }
        
        const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const d = String(selectedDate.getDate()).padStart(2, '0');
        const possibleFeastKey = `feast_${m}_${d}`;

        const { data, error } = await supabase
          .from('liturgy_contents')
          .select('*')
          .in('liturgy_key', [info.key, possibleFeastKey])
          .in('cycle', [currentCycle, 'all']);

        if (!error && data && data.length > 0) {
          const getDataForKey = (targetKey) => {
            const specificData = data.find(d => d.cycle === currentCycle && d.liturgy_key === targetKey);
            const allData = data.find(d => d.cycle === 'all' && d.liturgy_key === targetKey);
            
            if (specificData && allData) {
              const merged = { ...specificData };
              for (let k in allData) {
                if (!merged[k] || merged[k].toString().trim() === "") merged[k] = allData[k];
              }
              return merged;
            }
            return specificData || allData;
          };

          const infoData = getDataForKey(info.key);
          const feastData = getDataForKey(possibleFeastKey);
          
          let selectedData = null;

          if ((info.isFeast || info.rank <= 12) && infoData) {
            selectedData = infoData;
          } 
          else if (feastData) {
            selectedData = {
              ...feastData,
              title: feastData.title || info.displayName
            };
            setLiturgyInfo(prev => ({ ...prev, displayName: feastData.title, isFeast: true }));
          } 
          else if (infoData) {
            selectedData = infoData;
          }

          setContent(selectedData);
        } else {
          setContent(null);
        }
      } catch (err) {
        console.error(err);
        setContent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchFullReading();
  }, [selectedDate]);

  // Copy toàn bộ Lời Chúa & Suy niệm
  const handleCopy = () => {
    if (!content) return;
    let fullText = `${content.title || liturgyInfo?.displayName || 'Lời Chúa'}\n\n`;
    if (content.r1_content) fullText += `BÀI ĐỌC 1 (${content.r1_ref || ''}):\n${content.r1_content.replace(/<[^>]+>/g, '')}\n\n`;
    if (content.psalm_content) fullText += `ĐÁP CA (${content.psalm_ref || ''}):\n${content.psalm_content.replace(/<[^>]+>/g, '')}\n\n`;
    if (content.r2_content) fullText += `BÀI ĐỌC 2 (${content.r2_ref || ''}):\n${content.r2_content.replace(/<[^>]+>/g, '')}\n\n`;
    if (content.gospel_content) fullText += `Tin Mừng (${content.gospel_ref || ''}):\n${content.gospel_content.replace(/<[^>]+>/g, '')}\n\n`;
    if (content.reflection) fullText += `SUY NIỆM:\n${content.reflection.replace(/<[^>]+>/g, '')}\n`;

    navigator.clipboard.writeText(fullText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Chia sẻ
  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: content?.title || 'Lời Chúa Hằng Ngày',
        text: `Lời Chúa ngày ${selectedDate.toLocaleDateString('vi-VN')}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      handleCopy();
    }
  };

  // Cuộn mượt đến section
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Định dạng số câu Kinh Thánh tối ưu giao diện (Sacred Flow Layout - Typography Phụng Vụ Cao Cấp)
  const formatLiturgyText = (text) => {
    if (!text) return '';
    
    return text.split('\n').map((line) => {
      let trimmedLine = line.trim();
      if (!trimmedLine) return '<div class="h-3 sm:h-4"></div>'; 

      let prefixHtml = '';
      let restOfLine = trimmedLine;
      let hasStartNumber = false;

      // TH1: Đầu đoạn có cả Số Chương + Số Câu (Ví dụ: "11 21b Hồi ấy...", "2 1 Khi ấy...")
      const chapterVerseMatch = restOfLine.match(/^(\d{1,3})\s+(\d{1,3}[a-d]{0,4})(?=\s*[\p{L}"“'‘(]|$)/u);
      if (chapterVerseMatch) {
        const [fullMatch, chap, verse] = chapterVerseMatch;
        hasStartNumber = true;
        prefixHtml = `<span class="inline-flex items-baseline gap-1 font-bold ${theme.supColor} mr-2 select-none"><span class="text-[14px] sm:text-[16px] font-sans font-extrabold leading-none">${chap}</span><sup class="text-[9px] sm:text-[10px] font-sans font-normal leading-none">${verse}</sup></span>`;
        restOfLine = restOfLine.slice(fullMatch.length).trimStart();
      } else {
        // TH2: Đầu đoạn có Số Câu lẻ (Ví dụ: "21b Hồi ấy...", "5 Đức Giê-su...")
        const singleVerseMatch = restOfLine.match(/^(\d{1,3}[a-d]{0,4})(?=\s*[\p{L}"“'‘(]|$)/u);
        if (singleVerseMatch) {
          const [fullMatch, verse] = singleVerseMatch;
          hasStartNumber = true;
          prefixHtml = `<sup class="inline-block font-normal ${theme.supColor} text-[9px] sm:text-[10px] font-sans px-1.5 py-0.5 mr-2 select-none">${verse}</sup>`;
          restOfLine = restOfLine.slice(fullMatch.length).trimStart();
        }
      }

      // TH3: Đổi màu cho TẤT CẢ các chữ số còn lại ở giữa đoạn văn thành Verse Pill nhỏ gọn
      restOfLine = restOfLine.replace(
        /(\d{1,4}[a-d]{0,4})/g,
        `<sup class="inline-block font-normal ${theme.supColor} text-[10px] font-sans ml-1 select-none">$1</sup>`
      );

      // Xử lý dính chữ với thẻ <sup> vừa chèn
      restOfLine = restOfLine.replace(/(<\/sup>)([\p{L}"“'‘(])/gu, '$1 $2');

      // Nếu đoạn văn KHÔNG có số ở đầu -> Thêm thụt đầu dòng [text-indent: 1.25rem] chuẩn văn xuôi cao cấp
      const indentStyle = hasStartNumber ? '' : '[text-indent:1.25rem] sm:[text-indent:1.75rem]';

      return `<div class="mb-3.5 sm:mb-4.5 ${indentStyle} leading-relaxed sm:leading-loose text-justify sm:text-left">${prefixHtml}${restOfLine}</div>`;
    }).join('');
  };

  // Class điều chỉnh phông chữ
  const fontClasses = {
    normal: fontStyle === 'serif' ? 'font-serif text-[16px] sm:text-[17px]' : 'font-sans text-[15px] sm:text-[16px]',
    medium: fontStyle === 'serif' ? 'font-serif text-[18px] sm:text-[19px]' : 'font-sans text-[17px] sm:text-[18px]',
    large: fontStyle === 'serif' ? 'font-serif text-[21px] sm:text-[22px]' : 'font-sans text-[19px] sm:text-[20px]',
  }[fontSize];

  return (
    <div className="min-h-screen bg-[#FDFCF9] dark:bg-[#12100E] text-stone-800 dark:text-stone-200 transition-colors duration-500 fade-in-up pb-32 overflow-x-hidden">
      {/* Dynamic Background Mesh Grid */}
      <div className="fixed inset-0 w-full h-screen bg-[linear-gradient(to_right,#8881_1px,transparent_1px),linear-gradient(to_bottom,#8881_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none z-0" />
      
      <div className="relative z-10 max-w-4xl mx-auto px-2.5 sm:px-6 pt-6 sm:pt-12">
        
        {/* Navigation & Header (An khi o Focus Mode) */}
        {!isFocusMode && (
          <motion.div variants={heroReveal} initial="hidden" animate="visible" custom={0} className="mb-4 sm:mb-8">
            <div className="flex items-center justify-between mb-3">
              <Link to="/" className="inline-flex items-center text-[13px] font-bold text-stone-500 hover:text-stone-900 dark:hover:text-stone-100 transition-colors">
                <ChevronLeft className="w-4 h-4 mr-1" /> Trang chủ
              </Link>

              {/* Liturgical Season Tag */}
              {liturgyInfo && (
                <span className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase border ${theme.badgeBg} flex items-center gap-1.5`}>
                  <Sparkles className="w-3 h-3" /> {theme.name.split(' (')[0]}
                </span>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${theme.accentText} mb-1 flex items-center gap-2`}>
                  <BookOpen className="w-4 h-4" /> Suy Niệm Hằng Ngày
                </p>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 font-serif leading-tight">
                  Lời Chúa & Suy Niệm
                </h1>
              </div>

              {/* Selector ngày (Dropdown) */}
              <div ref={pickerRef} className="relative flex justify-center md:justify-end">
                <div className={`flex items-center bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl border ${theme.navBg} p-1 shadow-sm w-full sm:w-auto justify-between sm:justify-start`}>
                  <button onClick={() => changeDate(-1)} className="p-2 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl transition-all">
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                  
                  <button 
                    onClick={() => setIsPickerOpen(!isPickerOpen)}
                    className="px-2 sm:px-3 flex flex-col items-center justify-center min-w-[170px] sm:w-[210px] rounded-xl hover:bg-stone-100/60 dark:hover:bg-stone-800/60 transition-colors py-1 cursor-pointer active:scale-95"
                  >
                    <div className="flex items-center gap-1.5">
                      <CalendarDays className={`w-4 h-4 ${theme.icon}`} />
                      <span className="text-[13px] sm:text-[14px] font-bold text-stone-900 dark:text-stone-100">
                        {selectedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                      </span>
                    </div>
                    <span className="text-[10px] sm:text-[11px] font-medium text-stone-500 dark:text-stone-400 text-center truncate w-full mt-0.5 max-w-[160px] sm:max-w-full">
                      {liturgyInfo ? liturgyInfo.displayName : "Đang tính..."}
                    </span>
                  </button>

                  <button onClick={() => changeDate(1)} className="p-2 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl transition-all">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>

                {/* Lịch Dropdown */}
                <AnimatePresence>
                  {isPickerOpen && (
                    <CustomDatePicker 
                      selectedDate={selectedDate} 
                      onChange={setSelectedDate} 
                      onClose={() => setIsPickerOpen(false)} 
                      theme={theme}
                    />
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Dải Lịch 7 Ngày Trong Tuần (Horizontal Week Ribbon 1-Touch) */}
            <WeekRibbon 
              selectedDate={selectedDate} 
              onSelectDate={setSelectedDate} 
              theme={theme} 
            />
          </motion.div>
        )}

        {/* Floating Toolbar: Reading Controls (Font size, Copy, Share, Focus) */}
        {content && !isFocusMode && (
          <motion.div variants={heroReveal} initial="hidden" animate="visible" custom={0.05} className="mb-4 sm:mb-6">
            <div className="bg-white/80 dark:bg-stone-900/80 backdrop-blur-xl border border-stone-200 dark:border-stone-800 rounded-2xl p-2.5 sm:p-3 shadow-sm flex flex-wrap items-center justify-between gap-2">
              
              {/* Audio Controls */}
              <div className="flex items-center gap-2.5">
                <button 
                  onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                  className={`flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 rounded-full ${theme.btnBg} transition-all active:scale-95`}
                >
                  {isPlayingAudio ? <PauseCircle className="w-4 h-4 sm:w-5 sm:h-5" /> : <PlayCircle className="w-4 h-4 sm:w-5 sm:h-5" />}
                </button>
                <div>
                  <h4 className="text-[11px] sm:text-[12px] font-bold text-stone-900 dark:text-stone-100 flex items-center gap-1">
                    <Volume2 className="w-3.5 h-3.5 text-amber-500" /> Nghe Bài Đọc
                  </h4>
                  <p className="text-[9px] sm:text-[10px] text-stone-500 dark:text-stone-400">
                    {isPlayingAudio ? "Đang phát..." : "Nhấp phát audio"}
                  </p>
                </div>
              </div>

              {/* Font Size & Copy & Share & Focus Bar */}
              <div className="flex items-center gap-1.5">
                {/* Font Family Toggle */}
                <button
                  onClick={() => setFontStyle(fontStyle === 'serif' ? 'sans' : 'serif')}
                  className="px-2 py-1 rounded-xl border border-stone-200 dark:border-stone-800 text-[11px] sm:text-[12px] font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  title="Đổi phông chữ"
                >
                  {fontStyle === 'serif' ? 'Serif' : 'Sans'}
                </button>

                {/* Font Size Selector */}
                <div className="flex items-center bg-stone-100 dark:bg-stone-800/80 rounded-xl p-0.5">
                  <button 
                    onClick={() => setFontSize('normal')}
                    className={`px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all ${fontSize === 'normal' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100' : 'text-stone-500'}`}
                  >
                    A-
                  </button>
                  <button 
                    onClick={() => setFontSize('medium')}
                    className={`px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all ${fontSize === 'medium' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100' : 'text-stone-500'}`}
                  >
                    A
                  </button>
                  <button 
                    onClick={() => setFontSize('large')}
                    className={`px-1.5 py-0.5 text-[10px] sm:text-[11px] font-bold rounded-lg transition-all ${fontSize === 'large' ? 'bg-white dark:bg-stone-700 shadow-sm text-stone-900 dark:text-stone-100' : 'text-stone-500'}`}
                  >
                    A+
                  </button>
                </div>

                {/* Nút Sao chép */}
                <button
                  onClick={handleCopy}
                  className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors relative"
                  title="Sao chép Lời Chúa"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Nút Chia sẻ */}
                <button
                  onClick={handleShare}
                  className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  title="Chia sẻ"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>

                {/* Nút Chế Độ Tập Trung (Focus Mode) */}
                <button
                  onClick={() => setIsFocusMode(true)}
                  className="p-1.5 rounded-xl border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors"
                  title="Chế độ tập trung"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

        {/* Focus Mode Header Bar (Hiển thị khi bật Focus Mode) */}
        {isFocusMode && (
          <div className="mb-4 flex items-center justify-between bg-white/80 dark:bg-stone-900/80 backdrop-blur-md rounded-2xl px-4 py-2 border border-stone-200 dark:border-stone-800 shadow-sm">
            <span className="text-[12px] font-bold text-stone-600 dark:text-stone-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> Chế Độ Cầu Nguyện
            </span>
            <button
              onClick={() => setIsFocusMode(false)}
              className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 px-2.5 py-1 rounded-xl border border-amber-200 dark:border-amber-800"
            >
              <Minimize2 className="w-3.5 h-3.5" /> Thoát tập trung
            </button>
          </div>
        )}

        {/* Content Area */}
        <motion.div variants={heroReveal} initial="hidden" animate="visible" custom={0.1}>
          {loading ? (
            <div className="py-32 flex flex-col items-center justify-center">
              <Loader2 className={`w-8 h-8 animate-spin ${theme.icon} mb-4`} />
              <p className="text-[14px] font-medium text-stone-500">Đang tải nội dung Lời Chúa...</p>
            </div>
          ) : content ? (
            <div className="bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200/80 dark:border-stone-800/80 p-4 sm:p-10 rounded-2xl sm:rounded-[32px] shadow-sm">

              {/* Tiêu đề chính của ngày (Lễ Kính, Lễ Nhớ, Chúa Nhật...) */}
              {content.title && (
                <div className="mb-8 sm:mb-12 text-center flex flex-col items-center gap-1.5">
                  {content.title
                    .replace(/^(Ngày\s+\d{1,2}\s+tháng\s+\d{1,2})\s*-?\s*/i, '$1\n')
                    .replace(/\s*-\s*(lễ\s+.*)$/i, '\n$1')
                    .split('\n')
                    .map((part, index, arr) => {
                      const lowerPart = part.toLowerCase();
                      
                      if (index === arr.length - 1 && lowerPart.startsWith('lễ ')) {
                        return (
                          <span key={index} className={`inline-block mt-2 px-3 sm:px-4 py-1 rounded-full text-[11px] sm:text-[13px] uppercase tracking-widest font-bold font-sans shadow-sm border ${theme.badgeBg}`}>
                            {part}
                          </span>
                        );
                      }
                      
                      if (index === 0 && lowerPart.startsWith('ngày')) {
                        return (
                          <span key={index} className={`text-[12px] sm:text-[14px] ${theme.accentText} uppercase tracking-widest font-sans font-bold mb-1`}>
                            {part}
                          </span>
                        );
                      }

                      return (
                        <h2 key={index} className={`text-[22px] sm:text-[32px] font-serif font-bold ${theme.headingText} leading-tight`}>
                          {part}
                        </h2>
                      );
                    })}
                </div>
              )}

              {/* Bài Đọc 1 */}
              {content.r1_content && (
                <div id="sec-r1" className="mb-8 sm:mb-12 scroll-mt-24">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1 max-w-[80px]" />
                    <h3 className={`font-serif text-[17px] sm:text-[20px] font-bold ${theme.accentText} uppercase tracking-wider text-center`}>Bài Đọc 1</h3>
                    <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1 max-w-[80px]" />
                  </div>

                  {content.r1_ref && <p className="text-center text-[12px] sm:text-[14px] text-stone-500 dark:text-stone-400 font-bold mb-3 font-sans">{content.r1_ref}</p>}
                  
                  {content.r1_quote && (
                    <p className="italic text-center text-[14px] sm:text-[16px] text-stone-600 dark:text-stone-400 mb-5 px-2 font-serif leading-relaxed">
                      "{content.r1_quote}"
                    </p>
                  )}
                  
                  {content.r1_intro && (
                    <p className="font-bold text-[15px] sm:text-[17px] text-stone-800 dark:text-stone-200 mb-3 font-serif">
                      {content.r1_intro}
                    </p>
                  )}
                  
                  <div className={`${fontClasses}`}>
                    <div dangerouslySetInnerHTML={{ __html: formatLiturgyText(content.r1_content) }} />
                  </div>
                </div>
              )}

              {/* Đáp Ca */}
              {content.psalm_content && (
                <div id="sec-psalm" className="mb-8 sm:mb-12 pl-3.5 sm:pl-8 border-l-4 border-amber-400 dark:border-amber-600 scroll-mt-24">
                  <h3 className={`font-serif text-[15px] sm:text-[18px] ${theme.accentText} mb-2.5 italic flex items-center flex-wrap gap-2`}>
                    <span className="font-bold">Đáp Ca</span> 
                    {content.psalm_ref && <span className="text-[12px] sm:text-[13px] text-stone-500 font-bold not-italic font-sans">- {content.psalm_ref}</span>}
                  </h3>
                  
                  <div className={`${fontClasses} italic text-stone-700 dark:text-stone-300`}>
                    <div dangerouslySetInnerHTML={{ __html: formatLiturgyText(content.psalm_content) }} />
                  </div>
                </div>
              )}

              {/* Bài Đọc 2 */}
              {content.r2_content && (
                <div id="sec-r2" className="mb-8 sm:mb-12 scroll-mt-24">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1 max-w-[80px]" />
                    <h3 className={`font-serif text-[17px] sm:text-[20px] font-bold ${theme.accentText} uppercase tracking-wider text-center`}>Bài Đọc 2</h3>
                    <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1 max-w-[80px]" />
                  </div>

                  {content.r2_ref && <p className="text-center text-[12px] sm:text-[14px] text-stone-500 dark:text-stone-400 font-bold mb-3 font-sans">{content.r2_ref}</p>}
                  
                  {content.r2_quote && (
                    <p className="italic text-center text-[14px] sm:text-[16px] text-stone-600 dark:text-stone-400 mb-5 px-2 font-serif leading-relaxed">
                      "{content.r2_quote}"
                    </p>
                  )}
                  
                  {content.r2_intro && (
                    <p className="font-bold text-[15px] sm:text-[17px] text-stone-800 dark:text-stone-200 mb-3 font-serif">
                      {content.r2_intro}
                    </p>
                  )}
                  
                  <div className={`${fontClasses}`}>
                    <div dangerouslySetInnerHTML={{ __html: formatLiturgyText(content.r2_content) }} />
                  </div>
                </div>
              )}

              {/* Bài Đọc Phụ (Lễ Vọng Phục Sinh...) */}
              {content.extra_readings && Array.isArray(content.extra_readings) && content.extra_readings.map((extra, idx) => (
                <div key={`extra-${idx}`} className="mb-8 sm:mb-12 scroll-mt-24">
                  <h3 className={`font-serif text-[17px] sm:text-[20px] ${theme.accentText} mb-1 uppercase tracking-wider text-center`}>{extra.title || `Bài Đọc ${idx + 3}`}</h3>
                  {extra.ref && <p className="text-center text-[12px] sm:text-[14px] text-stone-500 font-bold mb-3 font-sans">{extra.ref}</p>}
                  
                  {extra.quote && (
                    <p className="italic text-center text-[14px] sm:text-[16px] text-stone-600 dark:text-stone-400 mb-5 px-2 font-serif">
                      "{extra.quote}"
                    </p>
                  )}
                  
                  {extra.intro && (
                    <p className="font-bold text-[15px] sm:text-[17px] text-stone-800 dark:text-stone-200 mb-3 font-serif">
                      {extra.intro}
                    </p>
                  )}
                  
                  {extra.content && (
                    <div className={`${fontClasses} mb-6`}>
                      <div dangerouslySetInnerHTML={{ __html: formatLiturgyText(extra.content) }} />
                    </div>
                  )}

                  {extra.psalm_content && (
                    <div className="mb-8 sm:mb-12 pl-3.5 sm:pl-8 border-l-4 border-amber-400 dark:border-amber-600">
                      <h3 className={`font-serif text-[15px] sm:text-[18px] ${theme.accentText} mb-2.5 italic flex items-center flex-wrap gap-2`}>
                        <span className="font-bold">Đáp Ca</span> 
                        {extra.psalm_ref && <span className="text-[12px] sm:text-[13px] text-stone-500 font-bold not-italic font-sans">- {extra.psalm_ref}</span>}
                      </h3>
                      
                      <div className={`${fontClasses} italic text-stone-700 dark:text-stone-300`}>
                        <div dangerouslySetInnerHTML={{ __html: formatLiturgyText(extra.psalm_content) }} />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {/* Tin Mừng Card Highlight (Responsive: Phẳng trên mobile, bọc Card trên Desktop) */}
              {content.gospel_content && (
                <div id="sec-gospel" className={`mb-8 sm:mb-12 p-0 sm:p-8 rounded-none sm:rounded-3xl border-0 sm:border ${theme.gospelCardBg} shadow-none sm:shadow-sm bg-transparent sm:bg-auto scroll-mt-24 relative overflow-hidden`}>
                  
                  {/* Decorative Gospel Badge */}
                  <div className="hidden sm:flex absolute top-0 right-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-1 rounded-bl-2xl text-[11px] font-bold uppercase tracking-widest font-sans items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Tin Mừng
                  </div>

                  {content.gospel_alleluia && (
                    <div className="mb-5 sm:mb-8 text-center text-[14px] sm:text-[17px] font-serif italic text-amber-900 dark:text-amber-300 px-1 sm:px-12 leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: formatLiturgyText(content.gospel_alleluia) }} />
                    </div>
                  )}

                  <h3 className={`font-serif text-[20px] sm:text-[26px] ${theme.headingText} mb-1 uppercase tracking-wider text-center font-bold`}>Tin Mừng</h3>
                  {content.gospel_ref && <p className="text-center text-[12px] sm:text-[14px] text-stone-500 dark:text-stone-400 font-bold mb-4 sm:mb-6 font-sans">{content.gospel_ref}</p>}

                  <div className="relative pl-3.5 sm:pl-6 border-l-4 border-amber-500 dark:border-amber-400">
                    {content.gospel_intro && (
                      <p className="font-bold text-[15px] sm:text-[18px] text-stone-900 dark:text-stone-100 mb-3 font-serif">
                        {content.gospel_intro}
                      </p>
                    )}
                    
                    <div className={`${fontClasses} text-stone-900 dark:text-stone-100 font-medium`}>
                      <div dangerouslySetInnerHTML={{ __html: formatLiturgyText(content.gospel_content) }} />
                    </div>
                  </div>
                </div>
              )}
                
              {/* Suy niệm */}
              {content.reflection && (
                <div id="sec-reflection" className="border-t border-stone-200 dark:border-stone-800 pt-6 sm:pt-8 mt-8 sm:mt-12 scroll-mt-24">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <BookOpen className={`w-5 h-5 ${theme.icon}`} />
                    <h3 className="font-sans text-[18px] sm:text-[22px] font-bold text-stone-900 dark:text-stone-100">Bài Suy Niệm</h3>
                  </div>
                  <div className={`${fontClasses} text-stone-800 dark:text-stone-200 leading-relaxed`}>
                    <div dangerouslySetInnerHTML={{ __html: content.reflection.replace(/\n/g, '<br/>') }} />
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-20 sm:py-24 text-center bg-white/60 dark:bg-stone-900/50 backdrop-blur-sm border border-stone-200/50 dark:border-stone-800/50 rounded-[28px] sm:rounded-[32px] px-4">
              <Calendar className="w-12 h-12 text-stone-300 dark:text-stone-700 mx-auto mb-4" />
              <h3 className="text-[17px] sm:text-[19px] font-bold text-stone-700 dark:text-stone-300 mb-2">Chưa có bài tĩnh tâm</h3>
              <p className="text-[13px] sm:text-[14px] text-stone-500 max-w-sm mx-auto">
                Hiện tại hệ thống chưa cập nhật Lời Chúa và Bài suy niệm cho <b>{liturgyInfo?.displayName}</b>. Xin vui lòng quay lại sau.
              </p>
            </div>
          )}
        </motion.div>
      </div>

      {/* Sticky Bottom Quick Navigation Bar (Vị trí nâng cao trên Mobile để né Home Bar/BottomNav) */}
      {content && (
        <div className="fixed bottom-20 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200/90 dark:border-stone-800/90 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-2xl flex items-center gap-1 sm:gap-2 text-[11px] sm:text-[12px] font-bold text-stone-600 dark:text-stone-300 max-w-[94vw] overflow-x-auto no-scrollbar">
          {content.r1_content && (
            <button onClick={() => scrollToSection('sec-r1')} className="px-2 sm:px-2.5 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors whitespace-nowrap">
              Đọc 1
            </button>
          )}
          {content.psalm_content && (
            <button onClick={() => scrollToSection('sec-psalm')} className="px-2 sm:px-2.5 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors whitespace-nowrap">
              Đáp Ca
            </button>
          )}
          {content.r2_content && (
            <button onClick={() => scrollToSection('sec-r2')} className="px-2 sm:px-2.5 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors whitespace-nowrap">
              Đọc 2
            </button>
          )}
          {content.gospel_content && (
            <button onClick={() => scrollToSection('sec-gospel')} className={`px-2.5 sm:px-3 py-1 rounded-full ${theme.btnBg} transition-all shadow-sm whitespace-nowrap`}>
              Tin Mừng
            </button>
          )}
          {content.reflection && (
            <button onClick={() => scrollToSection('sec-reflection')} className="px-2 sm:px-2.5 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors whitespace-nowrap">
              Suy Niệm
            </button>
          )}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ml-0.5 flex-shrink-0" title="Lên đầu trang">
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

    </div>
  );
}
