import { useState, useEffect } from "react";
import { LoadingBox, StartBox } from "../ui/Feedback.jsx";
import { useParams, useNavigate } from "react-router-dom";
import QuizBox from "./QuizBox.jsx";
import DoVui from "../../pages/DoVui.jsx";
import { AnimatePresence } from "framer-motion";

import { supabase } from "../../lib/supabase.js";
import { detectSemester, formatQuizTitle, inferDetailedKhoiLabel } from "../../lib/quizzesApi.js";

const DEFAULT_QUIZ_CONFIG = {
  "ôn-tập-15-phút-học-kỳ-1": {
    title: "Ôn Tập 15 Phút — Học Kỳ 1",
    time: 900, mcqCount: 10, mcqPoint: 5, essayCount: 2, essayPoint: 5,
  },
  "ôn-tập-1-tiết-học-kỳ-1": {
    title: "Ôn Tập 1 Tiết — Học Kỳ 1",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 3, essayPoint: 5,
  },
  "ôn-tập-cuối-học-kỳ-1": {
    title: "Ôn Tập Cuối Học Kỳ 1",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 3, essayPoint: 5,
  },
  "ôn-tập-15-phút-học-kỳ-2": {
    title: "Ôn Tập 15 Phút — Học Kỳ 2",
    time: 900, mcqCount: 10, mcqPoint: 5, essayCount: 2, essayPoint: 5,
  },
  "ôn-tập-1-tiết-học-kỳ-2": {
    title: "Ôn Tập 1 Tiết — Học Kỳ 2",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 3, essayPoint: 5,
  },
  "ôn-tập-cuối-học-kỳ-2": {
    title: "Ôn Tập Cuối Học Kỳ 2",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 3, essayPoint: 5,
  },
  "đố-vui-giáo-lý": {
    title: "Đố Vui Giáo Lý",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 0, essayPoint: 0,
  },
};

export default function TestQuiz() {
  const { type } = useParams();
  const navigate = useNavigate();
  const baseConfig = DEFAULT_QUIZ_CONFIG[type] || null;
  const [config, setConfig] = useState(baseConfig);
  const [quizData, setQuizData] = useState(null);
  const [started, setStarted] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  
  useEffect(() => {
    let isMounted = true;

    async function loadQuiz() {
      try {
        const { data, error } = await supabase
          .from("quizzes")
          .select("*")
          .eq("slug", type)
          .single();

        if (error || !data || !data.data) {
          throw error || new Error("Không tìm thấy dữ liệu đề thi trên Supabase");
        }

        if (isMounted) {
          const sem = detectSemester(data);
          const resolvedTitle = formatQuizTitle(data, sem) || baseConfig?.title || "ÔN TẬP GIÁO LÝ";
          const resolvedKhoi = inferDetailedKhoiLabel(data);

          setQuizData(data.data);
          setConfig({
            title: resolvedTitle,
            khoiLabel: resolvedKhoi,
            semesterLabel: sem?.label || "",
            time: data.time || baseConfig?.time || 900,
            mcqCount: data.mcq_count || baseConfig?.mcqCount || 10,
            mcqPoint: data.mcq_point ? parseFloat(data.mcq_point) : (baseConfig?.mcqPoint || 5),
            essayCount: data.essay_count ?? (baseConfig?.essayCount || 0),
            essayPoint: data.essay_point ? parseFloat(data.essay_point) : (baseConfig?.essayPoint || 0),
          });
        }
      } catch (err) {
        console.error("Lỗi khi tải bộ đề từ Supabase:", err);
        if (isMounted) {
          setFetchError(true);
        }
      }
    }

    loadQuiz();

    return () => {
      isMounted = false;
    };
  }, [type, baseConfig, navigate]);

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-[#faf8f3] dark:bg-[#151c18] transition-colors duration-500">
        <p className="text-[18px] font-bold text-[#293d32] dark:text-[#ecece0] font-serif">Không tải được dữ liệu 😕</p>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3.5 rounded-2xl bg-[#314e3e] text-[#ffffff] hover:bg-[#273e31] dark:bg-[#d6b883] dark:text-[#19251d] dark:hover:bg-[#cbb07c] text-[14.5px] font-bold shadow-xs transition-all active:scale-[0.98] cursor-pointer"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!quizData) return <LoadingBox />;

  const hasQuestions = Boolean(
    quizData && (
      (Array.isArray(quizData.mcq) && quizData.mcq.length > 0) ||
      (Array.isArray(quizData.essay) && quizData.essay.length > 0) ||
      (Array.isArray(quizData) && quizData.length > 0)
    )
  );

  if (!hasQuestions) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 py-12 bg-[#faf8f3] dark:bg-[#151c18] text-center transition-colors duration-500">
        <div className="w-16 h-16 rounded-2xl bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] flex items-center justify-center text-3xl font-bold shadow-xs border border-[#927140]/25 dark:border-[#d4b47d]/30">
          ⏳
        </div>
        <div className="space-y-2 max-w-md">
          {config?.title && (
            <span className="inline-block text-[11.5px] font-bold uppercase tracking-wider px-3 py-1 rounded-full shadow-xs bg-[#927140]/10 dark:bg-[#d4b47d]/15 text-[#7c5c2d] dark:text-[#d4b47d] border border-[#927140]/25 dark:border-[#d4b47d]/30">
              {config.title}
            </span>
          )}
          <h2 className="text-2xl font-bold text-[#293d32] dark:text-[#ecece0] font-serif">
            Đề thi đang được biên soạn
          </h2>
          <p className="text-[14px] text-[#575e55] dark:text-[#b0b9ac] leading-relaxed">
            Nội dung câu hỏi của bộ đề này đang được Ban Giáo lý tổng hợp và hoàn thiện. Bạn vui lòng quay lại ôn luyện các đề thi đã sẵn sàng nhé!
          </p>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-2">
          <button
            type="button"
            onClick={() => navigate("/tài-liệu#de-thi")}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#314e3e] text-[#ffffff] hover:bg-[#273e31] dark:bg-[#d6b883] dark:text-[#19251d] dark:hover:bg-[#cbb07c] text-[13.5px] font-bold shadow-xs active:scale-[0.98] transition-all cursor-pointer"
          >
            <span>←</span>
            <span>Quay lại Thư viện đề thi</span>
          </button>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-[#dedfd4] dark:border-[#354237] text-[#293d32] dark:text-[#ecece0] bg-[#fffefa] dark:bg-[#1e2821] hover:bg-[#faf8f3] dark:hover:bg-[#151c18] text-[13.5px] font-semibold transition-colors cursor-pointer"
          >
            Trang trước
          </button>
        </div>
      </div>
    );
  }

  const isGame = type === "đố-vui-giáo-lý";
  const QuizMap = isGame ? DoVui : QuizBox;
  const mergedConfig = { ...config, isGame, autoShowGuide: false };

  return (
    <div className="min-h-screen bg-[#faf8f3] dark:bg-[#151c18] transition-colors duration-500">
      <AnimatePresence mode="wait">
        {!started ? (
          <StartBox
            key="start"
            mode={isGame ? "game" : "quiz"}
            startQuiz={() => setStarted(true)}
            config={mergedConfig}
            onClose={() => navigate(-1)}
          />
        ) : (
          <QuizMap
            key="quiz"
            handleExit={() => navigate(-1)}
            config={mergedConfig}
            quizData={quizData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}