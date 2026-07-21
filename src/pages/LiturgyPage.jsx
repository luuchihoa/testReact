import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BookOpen, Calendar, ChevronLeft, ChevronRight, Loader2, PlayCircle, 
  PauseCircle, CalendarDays, Copy, Share2, Check, Sparkles, Volume2, ArrowUp, 
  Eye, EyeOff, Maximize2, Minimize2, Search, X, Command, Tag, ArrowRight, CornerDownLeft
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
// COMPONENT: Item Kết Quả Tìm Kiếm Tra Cứu Lời Chúa
// ─────────────────────────────────────────────────────────────
const QUICK_SEARCH_CHIPS = [
  { label: 'Lễ Đức Mẹ', query: 'Đức Mẹ' },
  { label: 'Tin Mừng Gio-an', query: 'Gio-an' },
  { label: 'Tin Mừng Mát-thêu', query: 'Mát-thêu' },
  { label: 'Giáng Sinh', query: 'Giáng Sinh' },
  { label: 'Mùa Chay', query: 'Mùa Chay' },
  { label: 'Tết', query: 'Tết' },
  { label: 'Thư Phao-lô', query: 'Phao-lô' },
];

// Bản đồ từ khóa Mùa Phụng Vụ thông minh (Smart Liturgical Synonyms Mapping)
const LITURGICAL_SYNONYMS = {
  'giang sinh': ['giang', 'giáng', 'noel', 'noen', '12_25', '12_24', '12_26', 'thánh gia', 'lễ đêm', 'lễ rạng sáng', 'ban ngày'],
  'giáng sinh': ['giang', 'giáng', 'noel', 'noen', '12_25', '12_24', '12_26', 'thánh gia', 'lễ đêm', 'lễ rạng sáng', 'ban ngày'],
  'noel': ['giang', 'giáng', 'noel', 'noen', '12_25', '12_24', 'lễ đêm'],
  'phuc sinh': ['phucsinh', 'phục sinh', 'vọng phục sinh', 'lễ lá'],
  'phục sinh': ['phucsinh', 'phục sinh', 'vọng phục sinh', 'lễ lá'],
  'mua chay': ['chay_', 'chay', 'tro', 'lễ lá', 'tuần thánh'],
  'mùa chay': ['chay_', 'chay', 'tro', 'lễ lá', 'tuần thánh'],
  'mua vong': ['vong_', 'mùa vọng', 'vọng'],
  'mùa vọng': ['vong_', 'mùa vọng', 'vọng'],
  'duc me': ['duc me', 'đức mẹ', 'mẹ thiên chúa', 'truyền tin', 'mẹ maria', 'feast_08_15', 'feast_12_08', 'feast_03_25', 'feast_01_01'],
  'đức mẹ': ['duc me', 'đức mẹ', 'mẹ thiên chúa', 'truyền tin', 'mẹ maria', 'feast_08_15', 'feast_12_08', 'feast_03_25', 'feast_01_01'],
  'thanh giuse': ['thánh giuse', 'giuse', '03_19', '05_01'],
  'thánh giuse': ['thánh giuse', 'giuse', '03_19', '05_01'],
  'tet': ['tết', 'tết nguyên đán',  '01_01', '02_01', 'feast_tet_1', 'feast_tet_2', 'feast_tet_3'],
  'tết': ['tết', 'tết nguyên đán',  '01_01', '02_01', 'feast_tet_1', 'feast_tet_2', 'feast_tet_3'],
  // 'phao-lô': ['phao-lô', 'feast_06_29', 'feast_01_25'],
  // 'phaolo': ['phao-lô', 'feast_06_29', 'feast_01_25'],
  // 'phao-lo': ['phao-lô', 'feast_06_29', 'feast_01_25']
};

function SearchResultItem({ item, query, onSelect, theme, highlightSearchText }) {
  const previewText = item.quote || item.gospel_intro || item.r1_intro || item.r2_intro;

  return (
    <button
      onClick={() => onSelect(item)}
      className="w-full text-left p-3 rounded-2xl bg-stone-50/70 dark:bg-stone-800/50 hover:bg-amber-50/80 dark:hover:bg-stone-800/80 border border-stone-200/60 dark:border-stone-800 hover:border-amber-300/80 dark:hover:border-amber-700/80 transition-all flex items-start justify-between gap-3 group active:scale-[0.99]"
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <span className="text-[14px] font-bold text-stone-900 dark:text-stone-100 group-hover:text-amber-700 dark:group-hover:text-amber-300 transition-colors">
            {highlightSearchText(item.title, query)}
          </span>
          {item.cycle && item.cycle !== 'all' && (
            <span className={`px-2 py-0.5 text-[10px] font-bold uppercase rounded-md border ${theme.badgeBg}`}>
              Năm {item.cycle}
            </span>
          )}
        </div>

        <div className="text-[12px] text-stone-500 dark:text-stone-400 font-medium flex items-center gap-2 flex-wrap mb-1">
          {item.gospel_ref && <span>Phúc Âm: {highlightSearchText(item.gospel_ref, query)}</span>}
          {item.r1_ref && <span>• Bài đọc 1: {highlightSearchText(item.r1_ref, query)}</span>}
          {item.r2_ref && <span>• Bài đọc 2: {highlightSearchText(item.r2_ref, query)}</span>}
        </div>

        {previewText && (
          <p className={`text-[12px] italic ${theme.accentText} line-clamp-1 font-serif`}>
            "{highlightSearchText(previewText, query)}"
          </p>
        )}
      </div>

      <div className="p-1.5 rounded-xl bg-white dark:bg-stone-700/60 text-stone-400 group-hover:text-amber-600 dark:group-hover:text-amber-400 group-hover:bg-amber-100 dark:group-hover:bg-amber-950/60 transition-all self-center flex-shrink-0">
        <ArrowRight className="w-4 h-4" />
      </div>
    </button>
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

  // Trạng thái mở dropdown chọn ngày & ô tìm kiếm
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const pickerRef = useRef(null);

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const searchRef = useRef(null);
  const searchInputRef = useRef(null);

  // Lắng nghe phím tắt toàn cục Cmd+K / Ctrl+K / Esc để bật/tắt Modal Tìm kiếm
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  // Tự động focus vào input khi Modal Tìm kiếm mở
  useEffect(() => {
    if (isSearchOpen && searchInputRef.current) {
      const timer = setTimeout(() => searchInputRef.current?.focus(), 80);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  // Quản lý tạm dừng Lenis & khóa cuộn body khi mở Modal Tìm kiếm (Kiểm tra an toàn phương thức start/stop)
  useEffect(() => {
    if (isSearchOpen) {
      document.body.style.overflow = 'hidden';
      if (typeof window.lenis?.stop === 'function') {
        window.lenis.stop();
      }
    } else {
      document.body.style.overflow = '';
      if (typeof window.lenis?.start === 'function') {
        window.lenis.start();
      }
    }
    return () => {
      document.body.style.overflow = '';
      if (typeof window.lenis?.start === 'function') {
        window.lenis.start();
      }
    };
  }, [isSearchOpen]);

  // Phân loại kết quả tìm kiếm theo nhóm (Lễ Trọng/Kính, Bài Đọc/Phúc Âm, Suy Niệm)
  const categorizedSearchResults = useMemo(() => {
    if (!searchResults || searchResults.length === 0) return { feasts: [], readings: [], reflections: [] };
    const feasts = [];
    const readings = [];
    const reflections = [];

    searchResults.forEach((item) => {
      const key = item.liturgy_key || '';
      const titleLower = (item.title || '').toLowerCase();

      if (key.startsWith('feast_') || key.startsWith('fixed_') || titleLower.includes('lễ ')) {
        feasts.push(item);
      } else if (item.gospel_ref || item.r1_ref || item.r2_ref) {
        readings.push(item);
      } else {
        reflections.push(item);
      }
    });

    return { feasts, readings, reflections };
  }, [searchResults]);

  // Tô sáng từ khóa tìm kiếm trong kết quả (Highlighting)
  const highlightSearchText = (text, query) => {
    if (!text || !query.trim()) return text;
    const q = query.trim();
    const regex = new RegExp(`(${q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      part.toLowerCase() === q.toLowerCase() ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-900/80 text-amber-950 dark:text-amber-100 font-bold px-0.5 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  // Xác định theme màu phụng vụ
  const colorKey = getLiturgicalColor(liturgyInfo);
  const theme = LITURGICAL_THEMES[colorKey] || LITURGICAL_THEMES.amber;

  // Click outside để đóng dropdown chọn ngày & dropdown tìm kiếm
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setIsPickerOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Debounce search truy vấn Supabase (kèm Mở Rộng Từ Khóa Thông Minh & Trường r1_info, r2_info, gospel_info)
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const qLower = q.toLowerCase();
        let searchTerms = [q];

        // Mở rộng từ khóa thông minh (Synonym & Season Mapping)
        Object.keys(LITURGICAL_SYNONYMS).forEach(key => {
          if (qLower.includes(key)) {
            searchTerms = Array.from(new Set([...searchTerms, ...LITURGICAL_SYNONYMS[key]]));
          }
        });

        const fields = [
          'title', 'gospel_ref', 'r1_ref', 'r2_ref', 'quote', 'reflection',
          'gospel_intro', 'r1_intro', 'r2_intro', 'liturgy_key'
        ];

        const orConditions = searchTerms.flatMap(term => 
          fields.map(field => `${field}.ilike."%${term}%"`)
        ).join(',');

        const { data, error } = await supabase
          .from('liturgy_contents')
          .select('id, liturgy_key, cycle, title, quote, r1_ref, r2_ref, gospel_ref, r1_intro, r2_intro, gospel_intro')
          .or(orConditions)
          .limit(16);

        if (!error && data) {
          // Ưu tiên các bài có tiêu đề (title) hoặc khóa (liturgy_key) khớp từ khóa lên trước
          const sortedData = [...data].sort((a, b) => {
            const aMatch = (a.title || '').toLowerCase().includes(qLower) || (a.liturgy_key || '').toLowerCase().includes(qLower);
            const bMatch = (b.title || '').toLowerCase().includes(qLower) || (b.liturgy_key || '').toLowerCase().includes(qLower);
            if (aMatch && !bMatch) return -1;
            if (!aMatch && bMatch) return 1;
            return 0;
          });
          setSearchResults(sortedData);
        } else {
          setSearchResults([]);
        }
      } catch (err) {
        console.error(err);
        setSearchResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Chọn 1 kết quả từ danh sách tìm kiếm
  const handleSelectSearchResult = async (item) => {
    setIsSearchOpen(false);
    setSearchQuery('');

    // Nếu liturgy_key dạng feast_03_19 hoặc fixed_03_19 -> Đổi ngày
    const matchFeast = item.liturgy_key.match(/(?:feast|fixed)_(\d{1,2})_(\d{1,2})/);
    if (matchFeast) {
      const month = parseInt(matchFeast[1], 10) - 1;
      const day = parseInt(matchFeast[2], 10);
      const newDate = new Date(selectedDate.getFullYear(), month, day);
      setSelectedDate(newDate);
      return;
    }

    // Nạp trực tiếp dữ liệu bài đọc theo ID
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('liturgy_contents')
        .select('*')
        .eq('id', item.id)
        .single();

      if (!error && data) {
        setContent(data);
        setLiturgyInfo(prev => ({
          ...prev,
          displayName: data.title || prev?.displayName
        }));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        const { data: list } = await supabase
          .from('liturgy_contents')
          .select('*')
          .eq('liturgy_key', item.liturgy_key);
        if (list && list.length > 0) {
          setContent(list[0]);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        
        const dayStr = String(selectedDate.getDate()).padStart(2, '0');
        const monthStr = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const datePrefix = `Ngày ${dayStr} tháng ${monthStr}`;

        const mPadded = monthStr;
        const dPadded = dayStr;
        const mNum = String(selectedDate.getMonth() + 1);
        const dNum = String(selectedDate.getDate());

        const keysToFetch = Array.from(new Set([
          info.key,
          `feast_${mPadded}_${dPadded}`,
          `feast_${mNum}_${dNum}`,
          `fixed_${mPadded}_${dPadded}`,
          `fixed_${mNum}_${dNum}`,
          info.seasonKey
        ].filter(Boolean)));

        const { data, error } = await supabase
          .from('liturgy_contents')
          .select('*')
          .in('liturgy_key', keysToFetch);

        if (!error && data && data.length > 0) {
          const getDataForKey = (targetKey) => {
            if (!targetKey) return null;
            const matches = data.filter(d => d.liturgy_key === targetKey);
            if (matches.length === 0) return null;

            // Ưu tiên 1: Lấy hàng theo chu kỳ năm I/II hoặc A/B/C (Bắt buộc không chọn 'all' ở đây để không bị đè bài đọc 1)
            const cycleRow = matches.find(d => d.cycle === cycles.weekdayCycle || d.cycle === cycles.sundayCycle)
                          || matches.find(d => d.cycle !== 'all')
                          || matches[0];
            const allRow = matches.find(d => d.cycle === 'all');

            const merged = {};
            const allFields = [
              'title', 'quote', 
              'r1_ref', 'r1_quote', 'r1_intro', 'r1_content', 
              'psalm_ref', 'psalm_content', 
              'r2_ref', 'r2_quote', 'r2_intro', 'r2_content', 
              'gospel_ref', 'gospel_alleluia', 'gospel_intro', 'gospel_content', 
              'reflection', 'extra_readings'
            ];

            for (const f of allFields) {
              const valFromCycle = cycleRow?.[f];
              const valFromAll = allRow?.[f];

              if (valFromCycle && valFromCycle.toString().trim() !== "") {
                merged[f] = valFromCycle;
              } else if (valFromAll && valFromAll.toString().trim() !== "") {
                merged[f] = valFromAll;
              }
            }

            return Object.keys(merged).length > 0 ? merged : null;
          };

          const feastData = getDataForKey(info.key) 
                         || getDataForKey(`feast_${mPadded}_${dPadded}`) 
                         || getDataForKey(`fixed_${mPadded}_${dPadded}`)
                         || getDataForKey(`feast_${mNum}_${dNum}`)
                         || getDataForKey(`fixed_${mNum}_${dNum}`);
                         
          const weekdayData = info.seasonKey ? getDataForKey(info.seasonKey) : null;
          
          let selectedData = null;

          if (feastData) {
            // Ưu tiên bài đọc từ feastData, trường nào feastData trống mới bù từ weekdayData
            const mergedContent = { ...(weekdayData || {}) };
            for (let k in feastData) {
              if (feastData[k] && feastData[k].toString().trim() !== "") {
                mergedContent[k] = feastData[k];
              }
            }

            const saintName = info.displayName || mergedContent.title || 'Lễ Nhớ';
            const displayTitle = (info.feastType === 'memorial_obligatory' || info.feastType === 'memorial_optional')
              ? `${datePrefix} - ${saintName} - ${info.feastTypeName || 'Lễ Nhớ'}`
              : (feastData.title || mergedContent.title || `${datePrefix} - ${saintName}`);

            selectedData = {
              ...mergedContent,
              title: displayTitle
            };
          } else if (weekdayData) {
            // Không có dữ liệu Lễ trong DB: dùng Bài đọc Ngày Thường
            const saintName = info.displayName || weekdayData.title || 'Lễ Nhớ';
            const displayTitle = (info.feastType === 'memorial_obligatory' || info.feastType === 'memorial_optional')
              ? `${datePrefix} - ${saintName} - ${info.feastTypeName || 'Lễ Nhớ'}`
              : (weekdayData.title?.toLowerCase().startsWith('ngày') ? weekdayData.title : `${datePrefix} - ${weekdayData.title || saintName}`);

            selectedData = {
              ...weekdayData,
              title: displayTitle
            };
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

  // Phân loại các Thánh Lễ khác nhau trong cùng 1 ngày (VD: 24/12 Lễ Sáng vs Lễ Vọng Ban Tối)
  const fullMassReadings = useMemo(() => {
    if (!content?.extra_readings || !Array.isArray(content.extra_readings)) return [];
    return content.extra_readings.filter(ex => ex.type === 'full_mass');
  }, [content]);

  const [activeMassIdx, setActiveMassIdx] = useState(0);

  useEffect(() => {
    setActiveMassIdx(0);
  }, [content]);

  // Nội dung Thánh Lễ đang chọn (Lễ chính hoặc Lễ Vọng/Lễ Phụ)
  const activeContent = useMemo(() => {
    if (!content) return null;
    if (activeMassIdx > 0 && fullMassReadings[activeMassIdx - 1]) {
      const extraMass = fullMassReadings[activeMassIdx - 1];
      return {
        ...content,
        ...extraMass,
        title: extraMass.title || extraMass.mass_title || content.title
      };
    }
    return content;
  }, [content, activeMassIdx, fullMassReadings]);

  // Phân loại Bài đọc extra: Kiệu lá / Rước lá vs Bài đọc chọn thêm (Alternative) vs Bài đọc phụ khác
  const processionReadings = useMemo(() => {
    if (!activeContent?.extra_readings || !Array.isArray(activeContent.extra_readings)) return [];
    return activeContent.extra_readings.filter(ex => 
      ex.type === 'procession' || 
      ex.title?.toLowerCase().includes('kiệu lá') || 
      ex.title?.toLowerCase().includes('rước lá')
    );
  }, [activeContent]);

  const alternativeReadings = useMemo(() => {
    if (!activeContent?.extra_readings || !Array.isArray(activeContent.extra_readings)) return [];
    return activeContent.extra_readings.filter(ex => ex.type === 'alternative');
  }, [activeContent]);

  const standardExtraReadings = useMemo(() => {
    if (!activeContent?.extra_readings || !Array.isArray(activeContent.extra_readings)) return [];
    return activeContent.extra_readings.filter(ex => 
      !processionReadings.includes(ex) && !alternativeReadings.includes(ex) && ex.type !== 'full_mass'
    );
  }, [activeContent, processionReadings, alternativeReadings]);

  // Tab Index State cho các Bài Đọc Tùy Chọn
  const [r1AltIdx, setR1AltIdx] = useState(0);
  const [r2AltIdx, setR2AltIdx] = useState(0);
  const [gospelAltIdx, setGospelAltIdx] = useState(0);

  useEffect(() => {
    setR1AltIdx(0);
    setR2AltIdx(0);
    setGospelAltIdx(0);
  }, [activeContent]);

  // Gom các Lựa Chọn cho từng bài đọc
  const r1Options = useMemo(() => {
    const mainOpt = activeContent?.r1_content ? {
      title: "Bài Đọc 1",
      ref: activeContent.r1_ref,
      quote: activeContent.r1_quote,
      intro: activeContent.r1_intro,
      content: activeContent.r1_content,
      option_label: activeContent.r1_ref ? `Bài chính (${activeContent.r1_ref})` : 'Bài đọc chính'
    } : null;
    const alts = alternativeReadings.filter(a => a.target_section === 'r1');
    return [mainOpt, ...alts].filter(Boolean);
  }, [activeContent, alternativeReadings]);

  const r2Options = useMemo(() => {
    const mainOpt = activeContent?.r2_content ? {
      title: "Bài Đọc 2",
      ref: activeContent.r2_ref,
      quote: activeContent.r2_quote,
      intro: activeContent.r2_intro,
      content: activeContent.r2_content,
      option_label: activeContent.r2_ref ? `Bài chính (${activeContent.r2_ref})` : 'Bài đọc chính'
    } : null;
    const alts = alternativeReadings.filter(a => a.target_section === 'r2');
    return [mainOpt, ...alts].filter(Boolean);
  }, [activeContent, alternativeReadings]);

  const gospelOptions = useMemo(() => {
    const mainOpt = activeContent?.gospel_content ? {
      title: "Tin Mừng",
      ref: activeContent.gospel_ref,
      alleluia: activeContent.gospel_alleluia,
      quote: activeContent.quote || activeContent.gospel_quote,
      intro: activeContent.gospel_intro,
      content: activeContent.gospel_content,
      option_label: activeContent.gospel_ref ? `Bài chính (${activeContent.gospel_ref})` : 'Bài đọc chính'
    } : null;
    const alts = alternativeReadings.filter(a => a.target_section === 'gospel');
    return [mainOpt, ...alts].filter(Boolean);
  }, [activeContent, alternativeReadings]);

  // Copy toàn bộ Lời Chúa & Suy niệm
  const handleCopy = () => {
    if (!activeContent) return;
    let fullText = `${activeContent.title || liturgyInfo?.displayName || 'Lời Chúa'}\n\n`;

    // 1. Tin Mừng Kiệu lá (nếu có)
    if (processionReadings.length > 0) {
      processionReadings.forEach(ex => {
        fullText += `${(ex.title || 'TIN MỪNG - KIỆU LÁ').toUpperCase()} (${ex.ref || ''}):\n`;
        if (ex.quote) fullText += `"${ex.quote}"\n`;
        if (ex.intro) fullText += `${ex.intro}\n`;
        if (ex.content) fullText += `${ex.content.replace(/<[^>]+>/g, '')}\n\n`;
      });
    }

    const currentR1 = r1Options[r1AltIdx];
    if (currentR1?.content) fullText += `BÀI ĐỌC 1 (${currentR1.ref || ''}):\n${currentR1.content.replace(/<[^>]+>/g, '')}\n\n`;
    if (activeContent.psalm_content) fullText += `ĐÁP CA (${activeContent.psalm_ref || ''}):\n${activeContent.psalm_content.replace(/<[^>]+>/g, '')}\n\n`;
    
    const currentR2 = r2Options[r2AltIdx];
    if (currentR2?.content) fullText += `BÀI ĐỌC 2 (${currentR2.ref || ''}):\n${currentR2.content.replace(/<[^>]+>/g, '')}\n\n`;

    // 2. Bài đọc phụ khác
    if (standardExtraReadings.length > 0) {
      standardExtraReadings.forEach((ex, idx) => {
        fullText += `${(ex.title || `BÀI ĐỌC ${idx + 3}`).toUpperCase()} (${ex.ref || ''}):\n`;
        if (ex.quote) fullText += `"${ex.quote}"\n`;
        if (ex.intro) fullText += `${ex.intro}\n`;
        if (ex.content) fullText += `${ex.content.replace(/<[^>]+>/g, '')}\n\n`;
        if (ex.psalm_content) fullText += `ĐÁP CA (${ex.psalm_ref || ''}):\n${ex.psalm_content.replace(/<[^>]+>/g, '')}\n\n`;
      });
    }

    const currentGospel = gospelOptions[gospelAltIdx];
    if (currentGospel?.content) fullText += `TIN MỪNG (${currentGospel.ref || ''}):\n${currentGospel.content.replace(/<[^>]+>/g, '')}\n\n`;
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
        `<sup class="font-normal ${theme.supColor} text-[10px] font-sans ml-1 select-none">$1</sup>`
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
            <div className="flex items-center justify-end mb-3">
              {/* Liturgical Season & Feast Rank Tag */}
              {liturgyInfo && (
                <div className="flex items-center gap-2 flex-wrap justify-end">
                  {liturgyInfo.feastTypeName && (
                    <span className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase border ${theme.badgeBg} flex items-center gap-1.5 shadow-sm`}>
                      <Sparkles className="w-3 h-3" /> {liturgyInfo.feastTypeName}
                    </span>
                  )}
                  <span className={`px-3 py-1 rounded-full text-[10px] sm:text-[11px] font-bold tracking-wider uppercase border ${theme.badgeBg} flex items-center gap-1.5`}>
                    {theme.name.split(' (')[0]}
                  </span>
                </div>
              )}
            </div>
            
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
              <div>
                <p className={`text-[11px] font-bold uppercase tracking-widest ${theme.accentText} mb-1 flex items-center gap-2`}>
                  <BookOpen className="w-4 h-4" /> Phụng Vụ Hằng Ngày
                </p>
                <h1 className="text-2xl sm:text-4xl font-extrabold text-stone-900 dark:text-stone-100 font-serif leading-tight">
                  Lời Chúa & Suy Niệm
                </h1>
              </div>

              {/* Action Controls: Search & Date Selector */}
              <div className="flex flex-col sm:flex-row items-center gap-2.5 w-full md:w-auto">
                {/* Search Trigger Button (Command Palette Trigger) */}
                <div className="relative w-full sm:w-64 md:w-72">
                  <button
                    onClick={() => setIsSearchOpen(true)}
                    className="w-full h-[46px] flex items-center justify-between pl-3.5 pr-2.5 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl rounded-2xl border border-stone-200/90 dark:border-stone-800/90 shadow-sm hover:border-amber-400/60 dark:hover:border-amber-600/60 text-stone-500 dark:text-stone-400 transition-all font-medium group text-left cursor-pointer active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <Search className={`w-4 h-4 ${theme.icon} flex-shrink-0 group-hover:scale-110 transition-transform`} />
                      <span className="truncate">Tìm bài đọc, ngày lễ...</span>
                    </div>
                    <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-bold text-stone-500 dark:text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg flex-shrink-0">
                      <Command className="w-2.5 h-2.5" />K
                    </kbd>
                  </button>
                </div>

                {/* Selector ngày (Dropdown) */}
                <div ref={pickerRef} className="relative flex justify-center md:justify-end w-full sm:w-auto">
                  <div className={`h-[46px] flex items-center bg-white/90 dark:bg-stone-900/90 backdrop-blur-md rounded-2xl border ${theme.navBg} px-1 shadow-sm w-full sm:w-auto justify-between sm:justify-start`}>
                    <button onClick={() => changeDate(-1)} className="p-1.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl transition-all">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <button 
                      onClick={() => setIsPickerOpen(!isPickerOpen)}
                      className="px-2 sm:px-3 flex flex-col items-center justify-center min-w-[160px] sm:w-[200px] rounded-xl hover:bg-stone-100/60 dark:hover:bg-stone-800/60 transition-colors py-0.5 cursor-pointer active:scale-95"
                    >
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className={`w-3.5 h-3.5 ${theme.icon}`} />
                        <span className="text-[13px] sm:text-[14px] font-bold text-stone-900 dark:text-stone-100 leading-tight">
                          {selectedDate.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                        </span>
                      </div>
                      <span className="hidden sm:block text-[10px] sm:text-[11px] font-medium text-stone-500 dark:text-stone-400 text-center truncate w-full leading-tight max-w-[150px] sm:max-w-full">
                        {liturgyInfo ? liturgyInfo.displayName : "Đang tính..."}
                      </span>
                    </button>

                    <button onClick={() => changeDate(1)} className="p-1.5 text-stone-400 hover:text-stone-800 dark:hover:text-stone-200 rounded-xl transition-all">
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
              {activeContent.title && (
                <div className="mb-8 sm:mb-12 text-center flex flex-col items-center gap-1.5">
                  {activeContent.title
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

              {/* Bộ Chọn Thánh Lễ (Dùng khi 1 ngày có từ 2 Thánh Lễ trở lên, VD: 24/12 Lễ Sáng vs Lễ Vọng Ban Tối) */}
              {fullMassReadings.length > 0 && (
                <div className="mb-6 sm:mb-8 bg-amber-50/80 dark:bg-stone-900/90 border border-amber-200/80 dark:border-amber-800/80 rounded-2xl p-3 sm:p-4 text-center shadow-sm">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-amber-800 dark:text-amber-300 mb-2 font-sans flex items-center justify-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> Chọn Thánh Lễ Cử Hành
                  </p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => setActiveMassIdx(0)}
                      className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[12px] sm:text-[13px] font-bold transition-all ${
                        activeMassIdx === 0
                          ? `${theme.btnBg} shadow-sm`
                          : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                      }`}
                    >
                      {content?.mass_title || "Thánh Lễ Chính"}
                    </button>

                    {fullMassReadings.map((m, idx) => (
                      <button
                        key={`mass-tab-${idx}`}
                        onClick={() => setActiveMassIdx(idx + 1)}
                        className={`px-3.5 sm:px-4 py-1.5 rounded-full text-[12px] sm:text-[13px] font-bold transition-all ${
                          activeMassIdx === idx + 1
                            ? `${theme.btnBg} shadow-sm`
                            : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border border-stone-200 dark:border-stone-700 hover:bg-stone-100 dark:hover:bg-stone-700'
                        }`}
                      >
                        {m.mass_title || m.title || `Thánh Lễ ${idx + 2}`}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Tin Mừng - Kiệu Lá (Phúc Âm rước lá - Lễ Lá) */}
              {processionReadings.map((extra, idx) => (
                <div key={`procession-${idx}`} id="sec-procession" className={`mb-8 sm:mb-12 p-5 sm:p-8 rounded-2xl sm:rounded-3xl border ${theme.gospelCardBg} shadow-sm scroll-mt-24 relative overflow-hidden`}>
                  <div className="flex absolute top-0 right-0 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 px-3.5 py-1 rounded-bl-2xl text-[11px] font-bold uppercase tracking-widest font-sans items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {extra.title || "Tin Mừng - Kiệu Lá"}
                  </div>

                  <h3 className={`font-serif text-[18px] sm:text-[24px] ${theme.headingText} mb-1 uppercase tracking-wider text-center font-bold`}>
                    {extra.title || "Tin Mừng - Kiệu Lá"}
                  </h3>
                  {extra.ref && <p className="text-center text-[12px] sm:text-[14px] text-stone-500 dark:text-stone-400 font-bold mb-4 font-sans">{extra.ref}</p>}

                  {extra.quote && (
                    <p className="italic text-center text-[14px] sm:text-[16px] text-stone-600 dark:text-stone-400 mb-5 px-2 font-serif leading-relaxed">
                      "{extra.quote}"
                    </p>
                  )}

                  {extra.intro && (
                    <p className="font-bold text-[15px] sm:text-[17px] text-stone-800 dark:text-stone-200 mb-3 font-serif">
                      {extra.intro}
                    </p>
                  )}

                  {extra.content && (
                    <div className={`${fontClasses}`}>
                      <div dangerouslySetInnerHTML={{ __html: formatLiturgyText(extra.content) }} />
                    </div>
                  )}
                </div>
              ))}

              {/* Bài Đọc 1 */}
              {r1Options.length > 0 && (
                <div id="sec-r1" className="mb-8 sm:mb-12 scroll-mt-24">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1 max-w-[80px]" />
                    <h3 className={`font-serif text-[17px] sm:text-[20px] font-bold ${theme.accentText} uppercase tracking-wider text-center`}>Bài Đọc 1</h3>
                    <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1 max-w-[80px]" />
                  </div>

                  {/* Segmented Tab Toggle cho Bài Đọc 1 (nếu có lựa chọn thay thế) */}
                  {r1Options.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                      {r1Options.map((opt, idx) => (
                        <button
                          key={`r1-opt-${idx}`}
                          onClick={() => setR1AltIdx(idx)}
                          className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all ${
                            r1AltIdx === idx
                              ? `${theme.btnBg} shadow-sm`
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                          }`}
                        >
                          {opt.option_label || opt.ref || `Lựa chọn ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {r1Options[r1AltIdx]?.ref && <p className="text-center text-[12px] sm:text-[14px] text-stone-500 dark:text-stone-400 font-bold mb-3 font-sans">{r1Options[r1AltIdx].ref}</p>}
                  
                  {r1Options[r1AltIdx]?.quote && (
                    <p className="italic text-center text-[14px] sm:text-[16px] text-stone-600 dark:text-stone-400 mb-5 px-2 font-serif leading-relaxed">
                      "{r1Options[r1AltIdx].quote}"
                    </p>
                  )}
                  
                  {r1Options[r1AltIdx]?.intro && (
                    <p className="font-bold text-[15px] sm:text-[17px] text-stone-800 dark:text-stone-200 mb-3 font-serif">
                      {r1Options[r1AltIdx].intro}
                    </p>
                  )}
                  
                  {r1Options[r1AltIdx]?.content && (
                    <div className={`${fontClasses}`}>
                      <div dangerouslySetInnerHTML={{ __html: formatLiturgyText(r1Options[r1AltIdx].content) }} />
                    </div>
                  )}
                </div>
              )}

              {/* Đáp Ca */}
              {activeContent.psalm_content && (
                <div id="sec-psalm" className="mb-8 sm:mb-12 pl-3.5 sm:pl-8 border-l-4 border-amber-400 dark:border-amber-600 scroll-mt-24">
                  <h3 className={`font-serif text-[15px] sm:text-[18px] ${theme.accentText} mb-2.5 italic flex items-center flex-wrap gap-2`}>
                    <span className="font-bold">Đáp Ca</span> 
                    {activeContent.psalm_ref && <span className="text-[12px] sm:text-[13px] text-stone-500 font-bold not-italic font-sans">- {activeContent.psalm_ref}</span>}
                  </h3>
                  
                  <div className={`${fontClasses} italic text-stone-700 dark:text-stone-300`}>
                    <div dangerouslySetInnerHTML={{ __html: formatLiturgyText(activeContent.psalm_content) }} />
                  </div>
                </div>
              )}

              {/* Bài Đọc 2 */}
              {r2Options.length > 0 && (
                <div id="sec-r2" className="mb-8 sm:mb-12 scroll-mt-24">
                  <div className="flex items-center justify-center gap-3 mb-2">
                    <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1 max-w-[80px]" />
                    <h3 className={`font-serif text-[17px] sm:text-[20px] font-bold ${theme.accentText} uppercase tracking-wider text-center`}>Bài Đọc 2</h3>
                    <div className="h-px bg-stone-200 dark:bg-stone-800 flex-1 max-w-[80px]" />
                  </div>

                  {/* Segmented Tab Toggle cho Bài Đọc 2 (nếu có lựa chọn thay thế) */}
                  {r2Options.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap">
                      {r2Options.map((opt, idx) => (
                        <button
                          key={`r2-opt-${idx}`}
                          onClick={() => setR2AltIdx(idx)}
                          className={`px-3 py-1 rounded-full text-[12px] font-bold transition-all ${
                            r2AltIdx === idx
                              ? `${theme.btnBg} shadow-sm`
                              : 'bg-stone-100 dark:bg-stone-800 text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-stone-700'
                          }`}
                        >
                          {opt.option_label || opt.ref || `Lựa chọn ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {r2Options[r2AltIdx]?.ref && <p className="text-center text-[12px] sm:text-[14px] text-stone-500 dark:text-stone-400 font-bold mb-3 font-sans">{r2Options[r2AltIdx].ref}</p>}
                  
                  {r2Options[r2AltIdx]?.quote && (
                    <p className="italic text-center text-[14px] sm:text-[16px] text-stone-600 dark:text-stone-400 mb-5 px-2 font-serif leading-relaxed">
                      "{r2Options[r2AltIdx].quote}"
                    </p>
                  )}
                  
                  {r2Options[r2AltIdx]?.intro && (
                    <p className="font-bold text-[15px] sm:text-[17px] text-stone-800 dark:text-stone-200 mb-3 font-serif">
                      {r2Options[r2AltIdx].intro}
                    </p>
                  )}
                  
                  {r2Options[r2AltIdx]?.content && (
                    <div className={`${fontClasses}`}>
                      <div dangerouslySetInnerHTML={{ __html: formatLiturgyText(r2Options[r2AltIdx].content) }} />
                    </div>
                  )}
                </div>
              )}

              {/* Bài Đọc Phụ (Lễ Vọng Phục Sinh...) */}
              {standardExtraReadings.map((extra, idx) => (
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

              {/* Tin Mừng Card Highlight */}
              {gospelOptions.length > 0 && (
                <div id="sec-gospel" className={`mb-8 sm:mb-12 p-0 sm:p-8 rounded-none sm:rounded-3xl border-0 sm:border ${theme.gospelCardBg} shadow-none sm:shadow-sm bg-transparent sm:bg-auto scroll-mt-24 relative overflow-hidden`}>
                  
                  {/* Decorative Gospel Badge */}
                  <div className="hidden sm:flex absolute top-0 right-0 bg-amber-500/10 text-amber-600 dark:text-amber-400 px-4 py-1 rounded-bl-2xl text-[11px] font-bold uppercase tracking-widest font-sans items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Tin Mừng
                  </div>

                  {/* Segmented Tab Toggle cho Tin Mừng (nếu có lựa chọn thay thế) */}
                  {gospelOptions.length > 1 && (
                    <div className="flex items-center justify-center gap-2 mb-4 flex-wrap pt-2 sm:pt-0">
                      {gospelOptions.map((opt, idx) => (
                        <button
                          key={`gospel-opt-${idx}`}
                          onClick={() => setGospelAltIdx(idx)}
                          className={`px-3.5 py-1.5 rounded-full text-[12px] font-bold transition-all ${
                            gospelAltIdx === idx
                              ? `${theme.btnBg} shadow-sm`
                              : 'bg-stone-200/80 dark:bg-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-300 dark:hover:bg-stone-700'
                          }`}
                        >
                          {opt.option_label || opt.ref || `Lựa chọn ${idx + 1}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {(gospelOptions[gospelAltIdx]?.alleluia || activeContent.gospel_alleluia) && (
                    <div className="mb-5 sm:mb-8 text-center text-[14px] sm:text-[17px] font-serif italic text-amber-900 dark:text-amber-300 px-1 sm:px-12 leading-relaxed">
                      <div dangerouslySetInnerHTML={{ __html: formatLiturgyText(gospelOptions[gospelAltIdx]?.alleluia || activeContent.gospel_alleluia) }} />
                    </div>
                  )}

                  <h3 className={`font-serif text-[20px] sm:text-[26px] ${theme.headingText} mb-1 uppercase tracking-wider text-center font-bold`}>
                    {gospelOptions[gospelAltIdx]?.title || "Tin Mừng"}
                  </h3>
                  {gospelOptions[gospelAltIdx]?.ref && <p className="text-center text-[12px] sm:text-[14px] text-stone-500 dark:text-stone-400 font-bold mb-4 sm:mb-6 font-sans">{gospelOptions[gospelAltIdx].ref}</p>}

                  {gospelOptions[gospelAltIdx]?.quote && (
                    <p className="italic text-center text-[14px] sm:text-[16px] text-stone-600 dark:text-stone-400 mb-5 px-2 font-serif leading-relaxed">
                      "{gospelOptions[gospelAltIdx].quote}"
                    </p>
                  )}

                  <div className="relative pl-3.5 sm:pl-6 border-l-4 border-amber-500 dark:border-amber-400">
                    {gospelOptions[gospelAltIdx]?.intro && (
                      <p className="font-bold text-[15px] sm:text-[18px] text-stone-900 dark:text-stone-100 mb-3 font-serif">
                        {gospelOptions[gospelAltIdx].intro}
                      </p>
                    )}
                    
                    {gospelOptions[gospelAltIdx]?.content && (
                      <div className={`${fontClasses} text-stone-900 dark:text-stone-100 font-medium`}>
                        <div dangerouslySetInnerHTML={{ __html: formatLiturgyText(gospelOptions[gospelAltIdx].content) }} />
                      </div>
                    )}
                  </div>
                </div>
              )}
                
              {/* Suy niệm */}
              {activeContent.reflection && (
                <div id="sec-reflection" className="border-t border-stone-200 dark:border-stone-800 pt-6 sm:pt-8 mt-8 sm:mt-12 scroll-mt-24">
                  <div className="flex items-center gap-2 mb-4 sm:mb-6">
                    <BookOpen className={`w-5 h-5 ${theme.icon}`} />
                    <h3 className="font-sans text-[18px] sm:text-[22px] font-bold text-stone-900 dark:text-stone-100">Bài Suy Niệm</h3>
                  </div>
                  <div className={`${fontClasses} text-stone-800 dark:text-stone-200 leading-relaxed`}>
                    <div dangerouslySetInnerHTML={{ __html: activeContent.reflection.replace(/\n/g, '<br/>') }} />
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

      {/* Sticky Bottom Quick Navigation Bar */}
      {activeContent && (
        <div className="fixed bottom-20 sm:bottom-5 left-1/2 -translate-x-1/2 z-40 bg-white/95 dark:bg-stone-900/95 backdrop-blur-xl border border-stone-200/90 dark:border-stone-800/90 rounded-full px-3 sm:px-4 py-1.5 sm:py-2 shadow-2xl flex items-center gap-1 sm:gap-2 text-[11px] sm:text-[12px] font-bold text-stone-600 dark:text-stone-300 max-w-[94vw] overflow-x-auto no-scrollbar">
          {processionReadings.length > 0 && (
            <button onClick={() => scrollToSection('sec-procession')} className="px-2 sm:px-2.5 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors whitespace-nowrap text-emerald-700 dark:text-emerald-400 font-bold">
              Kiệu Lá
            </button>
          )}
          {r1Options.length > 0 && (
            <button onClick={() => scrollToSection('sec-r1')} className="px-2 sm:px-2.5 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors whitespace-nowrap">
              Đọc 1
            </button>
          )}
          {activeContent.psalm_content && (
            <button onClick={() => scrollToSection('sec-psalm')} className="px-2 sm:px-2.5 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors whitespace-nowrap">
              Đáp Ca
            </button>
          )}
          {r2Options.length > 0 && (
            <button onClick={() => scrollToSection('sec-r2')} className="px-2 sm:px-2.5 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors whitespace-nowrap">
              Đọc 2
            </button>
          )}
          {gospelOptions.length > 0 && (
            <button onClick={() => scrollToSection('sec-gospel')} className={`px-2.5 sm:px-3 py-1 rounded-full ${theme.btnBg} transition-all shadow-sm whitespace-nowrap`}>
              Tin Mừng
            </button>
          )}
          {activeContent.reflection && (
            <button onClick={() => scrollToSection('sec-reflection')} className="px-2 sm:px-2.5 py-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors whitespace-nowrap">
              Suy Niệm
            </button>
          )}
          <button onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className="p-1 rounded-full hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors ml-0.5 flex-shrink-0" title="Lên đầu trang">
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Command Palette Modal & Fullscreen Sheet */}
      <AnimatePresence>
        {isSearchOpen && (
          <div className="fixed inset-0 z-50 flex items-start sm:items-center justify-center p-0 sm:p-4 md:p-6 overflow-hidden" data-lenis-prevent>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSearchOpen(false)}
              className="fixed inset-0 bg-stone-950/60 dark:bg-black/80 backdrop-blur-md transition-opacity"
            />

            {/* Modal Dialog Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="relative w-full h-full sm:h-auto sm:max-h-[85vh] sm:max-w-2xl bg-white/95 dark:bg-stone-900/95 backdrop-blur-2xl border-0 sm:border border-stone-200/90 dark:border-stone-800/90 sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden z-10"
            >
              {/* Search Header Input Bar */}
              <div className="p-3.5 sm:p-5 border-b border-stone-200/80 dark:border-stone-800/80 flex items-center gap-3 bg-stone-50/50 dark:bg-stone-900/50">
                <Search className={`w-5 h-5 ${theme.icon} flex-shrink-0`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm bài đọc, ngày lễ, từ khóa, trích dẫn Lời Chúa..."
                  className="w-full bg-transparent text-[15px] sm:text-[17px] font-medium text-stone-900 dark:text-stone-100 placeholder-stone-400 dark:placeholder-stone-500 focus:outline-none"
                />
                {searchQuery ? (
                  <button
                    onClick={() => { setSearchQuery(''); setSearchResults([]); }}
                    className="p-1.5 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 rounded-full hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[11px] font-semibold text-stone-400 bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md">
                    ESC
                  </kbd>
                )}
                <button
                  onClick={() => setIsSearchOpen(false)}
                  className="sm:hidden p-1 text-[13px] font-bold text-amber-600 dark:text-amber-400 hover:underline"
                >
                  Đóng
                </button>
              </div>

              {/* Modal Body / Scrollable Results & Suggestions */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 no-scrollbar" data-lenis-prevent>
                {/* Trạng thái 1: Chưa nhập từ khóa -> Hiển thị Quick Search Chips & Lợi ích tra cứu */}
                {searchQuery.trim().length < 2 ? (
                  <div className="space-y-5">
                    <div>
                      <h4 className="text-[12px] font-bold uppercase tracking-wider text-stone-400 dark:text-stone-500 mb-3 flex items-center gap-1.5">
                        <Tag className="w-3.5 h-3.5 text-amber-500" /> Gợi Ý Tra Cứu Nhanh
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {QUICK_SEARCH_CHIPS.map((chip, idx) => (
                          <button
                            key={idx}
                            onClick={() => setSearchQuery(chip.query)}
                            className="px-3 py-1.5 rounded-xl text-[13px] font-semibold bg-stone-100/80 dark:bg-stone-800/80 text-stone-700 dark:text-stone-300 hover:bg-amber-100 dark:hover:bg-amber-950/60 hover:text-amber-900 dark:hover:text-amber-200 border border-stone-200/60 dark:border-stone-700/60 transition-all flex items-center gap-1.5 active:scale-95 cursor-pointer"
                          >
                            <Sparkles className="w-3 h-3 text-amber-500" />
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/50 dark:border-amber-900/30">
                      <p className="text-[12px] text-amber-900 dark:text-amber-300 font-medium leading-relaxed">
                        💡 <b>Mẹo tra cứu:</b> Bạn có thể gõ tên Thánh Lễ <i>(Lễ Giáng Sinh, Lễ Lá...)</i>, đoạn Kinh Thánh <i>(Phúc Âm Gio-an, Bài đọc 1...)</i> hoặc trích dẫn bất kỳ để tìm lại bài suy niệm.
                      </p>
                    </div>
                  </div>
                ) : searching ? (
                  /* Trạng thái 2: Đang tìm kiếm */
                  <div className="py-12 text-center text-stone-500 dark:text-stone-400 text-[14px] flex flex-col items-center justify-center gap-3">
                    <Loader2 className={`w-7 h-7 animate-spin ${theme.icon}`} />
                    <span>Đang tra cứu cơ sở dữ liệu Lời Chúa...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  /* Trạng thái 3: Hiển thị kết quả được phân nhóm */
                  <div className="space-y-6">
                    {/* Nhóm 1: Ngày Lễ & Lễ Trọng */}
                    {categorizedSearchResults.feasts.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400 mb-2.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Ngày Lễ & Lễ Kính ({categorizedSearchResults.feasts.length})
                        </h4>
                        <div className="space-y-2">
                          {categorizedSearchResults.feasts.map((item) => (
                            <SearchResultItem
                              key={item.id || item.liturgy_key + item.cycle}
                              item={item}
                              query={searchQuery}
                              onSelect={handleSelectSearchResult}
                              theme={theme}
                              highlightSearchText={highlightSearchText}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nhóm 2: Bài Đọc & Phúc Âm */}
                    {categorizedSearchResults.readings.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400 mb-2.5 flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5" /> Trích Dẫn Lời Chúa & Bài Đọc ({categorizedSearchResults.readings.length})
                        </h4>
                        <div className="space-y-2">
                          {categorizedSearchResults.readings.map((item) => (
                            <SearchResultItem
                              key={item.id || item.liturgy_key + item.cycle}
                              item={item}
                              query={searchQuery}
                              onSelect={handleSelectSearchResult}
                              theme={theme}
                              highlightSearchText={highlightSearchText}
                            />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Nhóm 3: Bài Suy Niệm */}
                    {categorizedSearchResults.reflections.length > 0 && (
                      <div>
                        <h4 className="text-[11px] font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400 mb-2.5 flex items-center gap-1.5">
                          <Sparkles className="w-3.5 h-3.5" /> Bài Suy Niệm ({categorizedSearchResults.reflections.length})
                        </h4>
                        <div className="space-y-2">
                          {categorizedSearchResults.reflections.map((item) => (
                            <SearchResultItem
                              key={item.id || item.liturgy_key + item.cycle}
                              item={item}
                              query={searchQuery}
                              onSelect={handleSelectSearchResult}
                              theme={theme}
                              highlightSearchText={highlightSearchText}
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Trạng thái 4: Không có kết quả */
                  <div className="py-12 text-center text-stone-500 dark:text-stone-400 text-[14px]">
                    <p className="font-bold text-stone-700 dark:text-stone-300 mb-1">Không tìm thấy bài đọc nào</p>
                    <p className="text-[13px] text-stone-400">Thử tìm kiếm với từ khóa khác như "Đức Mẹ", "Gioan", "Mùa Vọng"...</p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="px-4 py-2.5 sm:px-6 sm:py-3 border-t border-stone-200/80 dark:border-stone-800/80 bg-stone-100/50 dark:bg-stone-900/50 flex items-center justify-between text-[11px] text-stone-500 dark:text-stone-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 font-sans bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-[10px]">↵</kbd> Chọn kết quả
                  </span>
                  <span className="hidden sm:flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 font-sans bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded text-[10px]">ESC</kbd> Đóng
                  </span>
                </div>
                <span>Tra cứu Lời Chúa Phụng Vụ</span>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
