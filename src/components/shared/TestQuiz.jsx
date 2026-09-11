import { useState, useEffect } from "react";
import { LoadingBox, StartBox } from "../ui/Feedback.jsx";
import { useParams, useNavigate } from "react-router-dom";
import QuizBox from "./QuizBox.jsx";
import DoVui from "../../pages/DoVui.jsx";
import { AnimatePresence } from "framer-motion";

import { supabase } from "../../lib/supabase.js";

const DEFAULT_QUIZ_CONFIG = {
  "ôn-tập-15-phút-học-kỳ-1": {
    title: "ÔN TẬP 15 PHÚT",
    time: 900, mcqCount: 10, mcqPoint: 5, essayCount: 2, essayPoint: 5,
  },
  "ôn-tập-1-tiết-học-kỳ-1": {
    title: "ÔN TẬP 1 TIẾT",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 3, essayPoint: 5,
  },
  "ôn-tập-cuối-học-kỳ-1": {
    title: "ÔN TẬP HỌC KỲ I",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 3, essayPoint: 5,
  },
  "ôn-tập-15-phút-học-kỳ-2": {
    title: "ÔN TẬP 15 PHÚT",
    time: 900, mcqCount: 10, mcqPoint: 5, essayCount: 2, essayPoint: 5,
  },
  "ôn-tập-1-tiết-học-kỳ-2": {
    title: "ÔN TẬP 1 TIẾT",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 3, essayPoint: 5,
  },
  "ôn-tập-cuối-học-kỳ-2": {
    title: "ÔN TẬP HỌC KỲ II",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 3, essayPoint: 5,
  },
  "đố-vui-giáo-lý": {
    title: "ĐỐ VUI GIÁO LÝ",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 0, essayPoint: 0,
  },
};

export default function TestQuiz() {
  const { type } = useParams();
  const navigate = useNavigate();
  const baseConfig = DEFAULT_QUIZ_CONFIG[type];
  const [config, setConfig] = useState(baseConfig);
  const [quizData, setQuizData] = useState(null);
  const [started, setStarted] = useState(false);
  const [fetchError, setFetchError] = useState(false);
  
  useEffect(() => {
    if (!baseConfig) {
      navigate(-1);
      return;
    }

    let isMounted = true;
    setQuizData(null);
    setFetchError(false);
    setConfig(baseConfig);

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
          setQuizData(data.data);
          setConfig({
            ...baseConfig,
            title: data.title || baseConfig.title,
            time: data.time || baseConfig.time,
            mcqCount: data.mcq_count || baseConfig.mcqCount,
            mcqPoint: data.mcq_point ? parseFloat(data.mcq_point) : baseConfig.mcqPoint,
            essayCount: data.essay_count ?? baseConfig.essayCount,
            essayPoint: data.essay_point ? parseFloat(data.essay_point) : baseConfig.essayPoint,
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

  if (!config) return null;

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 bg-[#FDFBF7] dark:bg-[#1C1917] transition-colors duration-500">
        <p className="text-[18px] font-bold text-amber-950 dark:text-amber-50 font-serif">Không tải được dữ liệu 😕</p>
        <button
          onClick={() => navigate(-1)}
          className="px-8 py-3.5 rounded-2xl bg-amber-900 text-amber-50 dark:bg-amber-600 dark:text-white text-[14.5px] font-bold shadow-sm md:hover:opacity-90 transition-all active:scale-[0.98]"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!quizData) return <LoadingBox />;

  const QuizMap = type === "đố-vui-giáo-lý" ? DoVui : QuizBox;

  return (
    <div className="min-h-screen bg-[#FDFBF7] dark:bg-[#1C1917] transition-colors duration-500">
      <AnimatePresence mode="wait">
        {!started ? (
          <StartBox key="start" startQuiz={() => setStarted(true)} config={config} onClose={() => navigate(-1)}/>
        ) : (
          <QuizMap
            key="quiz"
            handleExit={() => navigate(-1)}
            config={config}
            quizData={quizData}
          />
        )}
      </AnimatePresence>
    </div>
  );
}