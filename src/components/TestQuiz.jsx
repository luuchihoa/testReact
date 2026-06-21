import { useState, useEffect } from "react";
import { LoadingBox, StartBox } from "./ui/Feedback.jsx";
import { useParams, useNavigate } from "react-router-dom";
import QuizBox from "./QuizBox.jsx";
import DoVui from "./DoVui.jsx";
import { AnimatePresence } from "framer-motion";

const quizConfig = {
  "ôn-tập-15-phút-học-kỳ-1": {
    title: "ÔN TẬP 15 PHÚT",
    api: "https://script.google.com/macros/s/AKfycbzs823Exjgop4XQHd90PVcjSMD3INg2j4V0Iy3uN0zAhZfvwHZIonpIEW0HdD8YOE4Y/exec",
    time: 900, mcqCount: 10, mcqPoint: 5, essayCount: 2, essayPoint: 5,
  },
  "ôn-tập-1-tiết-học-kỳ-1": {
    title: "ÔN TẬP 1 TIẾT",
    api: "https://script.google.com/macros/s/AKfycbwOuqPMsL1VjVy78FpeTEAMaYjWMkp6UqTBe9KSjaqu-f16F8RyO5iNc3xYqluEB9LyyA/exec",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 3, essayPoint: 5,
  },
  "ôn-tập-cuối-học-kỳ-1": {
    title: "ÔN TẬP HỌC KỲ I",
    api: "https://script.google.com/macros/s/AKfycbxgznZnvG0OhZr7p8nFxLAdoXhKMYpZNISmRhAnONoIW3SxYwDDP65olJEB7jN_pCGu/exec",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 3, essayPoint: 5,
  },
  "ôn-tập-15-phút-học-kỳ-2": {
    title: "ÔN TẬP 15 PHÚT",
    api: "https://script.google.com/macros/s/AKfycbyZLxxsneEBeuNuAybHV4lT9vRXu2fhAusQKSA8pS2AAZLbo_wqFo1OC0DS-2kQRy0orw/exec",
    time: 900, mcqCount: 10, mcqPoint: 5, essayCount: 2, essayPoint: 5,
  },
  "ôn-tập-1-tiết-học-kỳ-2": {
    title: "ÔN TẬP 1 TIẾT",
    api: "https://script.google.com/macros/s/AKfycbwdT_yb2wPsgGetQOcTkogPaVB3JQQ73AJijeVTGSQ6O-lX5m8weIqyl8ItL2yS519ukA/exec",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 3, essayPoint: 5,
  },
  "ôn-tập-cuối-học-kỳ-2": {
    title: "ÔN TẬP HỌC KỲ II",
    api: "https://script.google.com/macros/s/AKfycby6EZi44bGG2cQvR_YvdeuAIaKrit6u_KOjxLExzMbsjARTJ6mrZ1eqzQQqnzk_eEme/exec",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 3, essayPoint: 5,
  },
  "đố-vui-giáo-lý": {
    title: "ĐỐ VUI GIÁO LÝ",
    api: "https://script.google.com/macros/s/AKfycbzouvhKjvjxsOKv2xAm74bmvwFVhM8M9FWe0eiOMiuYv1hRItRzsyz7eokfz5Oz8lI/exec",
    time: 2700, mcqCount: 20, mcqPoint: 5, essayCount: 3, essayPoint: 5,
  },
};

export default function TestQuiz() {
  const { type } = useParams();
  const navigate = useNavigate();
  const [quizData, setQuizData] = useState(null);
  const [started, setStarted] = useState(false);
  const [fetchError, setFetchError] = useState(false);

  const config = quizConfig[type];

  // Guard: unknown route type
  if (!config) {
    navigate(-1);
    return null;
  }

  useEffect(() => {
    setQuizData(null);
    setFetchError(false);
    fetch(config.api)
      .then((res) => res.json())
      .then((data) => setQuizData(data))
      .catch(() => setFetchError(true));
  }, [config.api]);

  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F9F9F9]">
        <p className="text-[17px] font-semibold text-gray-700">Không tải được dữ liệu 😕</p>
        <button
          onClick={() => navigate(-1)}
          className="px-5 py-2.5 rounded-2xl bg-[#FF6B35] text-white text-[15px] font-semibold"
        >
          Quay lại
        </button>
      </div>
    );
  }

  if (!quizData) return <LoadingBox />;

  const QuizMap = type === "đố-vui-giáo-lý" ? DoVui : QuizBox;

  return (
    <div className="min-h-screen bg-[#F2F2F7]">
      <AnimatePresence mode="wait">
        {!started ? (
          <StartBox key="start" startQuiz={() => setStarted(true)} config={config} />
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