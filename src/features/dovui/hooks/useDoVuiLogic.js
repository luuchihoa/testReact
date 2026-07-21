import { useState, useRef, useCallback, useEffect } from "react";
import useSound from "../../sound/useSounds.js";
import { supabase } from "../../../lib/supabase.js";
import {
  SKIP_GUIDE_KEY,
  DEFAULT_QUESTION_DURATION_MS,
  shuffleArray,
  burstConfetti,
} from "../utils/dovuiUtils.js";

function saveToLocalStorageGuest(item, name, isGuest) {
  try {
    const existing = JSON.parse(localStorage.getItem("dovui_guest_scores") || "[]");
    if (!existing.some((e) => e.id === item.id)) {
      existing.push({ ...item, name, isGuest });
      const trimmed = existing.slice(-100);
      localStorage.setItem("dovui_guest_scores", JSON.stringify(trimmed));
    }
  } catch (e) {
    console.error("LocalStorage save error:", e);
  }
}

function getStartOfWeek() {
  const now = new Date();
  const day = now.getDay();
  const diff = now.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(now);
  monday.setDate(diff);
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function getStartOfMonth() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export default function useDoVuiLogic({ config = {}, quizData = [], onExitToRoute }) {
  const { play, unlock, stopAll } = useSound();

  const [phase, setPhase] = useState("quiz");
  const [showGuide, setShowGuide] = useState(false);
  const [showExit, setShowExit] = useState(false);

  // Leaderboard states
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [leaderboardPeriod, setLeaderboardPeriod] = useState("all"); // all | week | month
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);

  const [quizQ, setQuizQ] = useState([]);
  const [current, setCurrent] = useState(0);
  const [score, setScore] = useState(0); // Số câu làm đúng
  const [totalPoints, setTotalPoints] = useState(0); // Tổng điểm x10 + bonus
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [timerOn, setTimerOn] = useState(false);
  const [optStates, setOptStates] = useState({});
  const [history, setHistory] = useState([]);

  // Power-ups state
  const [usedFiftyFifty, setUsedFiftyFifty] = useState(false);
  const [usedExtraTime, setUsedExtraTime] = useState(false);
  const [extraTimeCount, setExtraTimeCount] = useState(0);
  const [questionDuration, setQuestionDuration] = useState(
    config.timerSeconds ? config.timerSeconds * 1000 : DEFAULT_QUESTION_DURATION_MS
  );

  const lockedRef = useRef(false);
  const quizQRef = useRef([]);
  const currentRef = useRef(0);
  const quizEndedRef = useRef(false);
  const nextQTimerRef = useRef(null);
  const hasInitRef = useRef(false);
  const scoreSavedRef = useRef(false);
  const questionStartTimeRef = useRef(Date.now());
  const allRawScoresRef = useRef([]);

  /* ── Mô Hình 2 Tầng: Save Score (Upsert Tổng Trọn Đời + Insert Lịch Sử) ── */
  const saveQuizScore = useCallback(async ({ title, scoreVal, totalVal, pointsVal, maxStreakVal }) => {
    if (scoreSavedRef.current) return;
    scoreSavedRef.current = true;

    const dateStr = new Date().toLocaleDateString("vi-VN");

    // 1. Nhận diện Đăng Nhập Đa Tầng (Supabase Auth + LocalStorage Session)
    let user = null;
    try {
      const { data: authData } = await supabase.auth.getUser();
      user = authData?.user;
    } catch (e) {}

    const localUsername = localStorage.getItem("username");
    let username = "Khách";
    let isGuest = true;

    if (user) {
      isGuest = false;
      username = user.email?.split("@")[0] || "Thành viên";
      try {
        const { data: profile } = await supabase
          .from("users")
          .select("username, ho_va_ten")
          .eq("auth_id", user.id)
          .maybeSingle();

        if (profile) {
          username = profile.username || profile.ho_va_ten || username;
        }
      } catch (e) {}
    } else if (localUsername && localUsername.trim() !== "") {
      isGuest = false;
      username = localUsername.trim();
    }

    const scoreItem = {
      id: Date.now().toString(),
      title: title || "Đố Vui Giáo Lý",
      score: scoreVal,
      total: totalVal,
      points: pointsVal,
      maxStreak: maxStreakVal,
      date: dateStr,
      createdAt: new Date().toISOString(),
      name: username,
      isGuest,
    };

    // Luôn lưu bộ nhớ đệm LocalStorage
    saveToLocalStorageGuest(scoreItem, username, isGuest);

    // 2. BẢNG 1: UPSERT Tổng Điểm Tích Lũy Trọn Đời (dovui_user_totals)
    try {
      const { data: existingUser } = await supabase
        .from("dovui_user_totals")
        .select("*")
        .eq("username", username)
        .maybeSingle();

      const newPoints = (existingUser?.all_time_points || 0) + pointsVal;
      const newCorrect = (existingUser?.total_correct || 0) + scoreVal;
      const newTotalQ = (existingUser?.total_questions || 0) + totalVal;
      const newPlayCount = (existingUser?.play_count || 0) + 1;
      const newMaxStreak = Math.max(existingUser?.max_streak || 0, maxStreakVal);

      const { error: upsertErr } = await supabase.from("dovui_user_totals").upsert({
        username,
        all_time_points: newPoints,
        total_correct: newCorrect,
        total_questions: newTotalQ,
        play_count: newPlayCount,
        max_streak: newMaxStreak,
        updated_at: new Date().toISOString(),
      });

      if (upsertErr) {
        console.warn("[DoVui] Upsert dovui_user_totals warning:", upsertErr.message);
      } else {
        console.log("[DoVui] Updated all-time totals for user:", username);
      }
    } catch (err) {
      console.warn("[DoVui] Error updating dovui_user_totals:", err);
    }

    // 3. BẢNG 2: INSERT Lịch Sử Lượt Chơi Ngắn Hạn (dovui_scores)
    const insertPayload = {
      username,
      points: pointsVal,
      correct_count: scoreVal,
      total_questions: totalVal,
      max_streak: maxStreakVal,
    };

    if (title) insertPayload.topic_title = title;
    if (user?.id) insertPayload.user_id = user.id;

    try {
      const { data, error } = await supabase.from("dovui_scores").insert(insertPayload).select();

      if (error) {
        delete insertPayload.topic_title;
        delete insertPayload.user_id;
        await supabase.from("dovui_scores").insert(insertPayload).select();
      } else {
        console.log("[DoVui] Saved short-term score to dovui_scores:", data);
      }
    } catch (err) {}
  }, []);

  /* ── Client In-Memory Filter & Aggregation Cho Tuần/Tháng ── */
  const filterAndAggregateLeaderboard = useCallback((rawScoresList, period = "all") => {
    let minDate = null;
    if (period === "week") {
      minDate = getStartOfWeek();
    } else if (period === "month") {
      minDate = getStartOfMonth();
    }

    const filtered = rawScoresList.filter((item) => {
      if (!minDate) return true;
      const itemDate = item.createdAt ? new Date(item.createdAt) : null;
      return itemDate && itemDate >= minDate;
    });

    const aggregatedMap = {};
    filtered.forEach((item) => {
      const key = item.username.toLowerCase();
      if (!aggregatedMap[key]) {
        aggregatedMap[key] = {
          username: item.username,
          totalPoints: 0,
          totalCorrect: 0,
          totalQuestions: 0,
          maxStreak: 0,
          playCount: 0,
          isGuest: item.isGuest,
        };
      } else {
        if (item.isGuest === false) {
          aggregatedMap[key].isGuest = false;
          aggregatedMap[key].username = item.username;
        }
      }
      aggregatedMap[key].totalPoints += item.points;
      aggregatedMap[key].totalCorrect += item.correct;
      aggregatedMap[key].totalQuestions += item.total;
      aggregatedMap[key].playCount += 1;
      aggregatedMap[key].maxStreak = Math.max(aggregatedMap[key].maxStreak, item.maxStreak);
    });

    const leaderboardList = Object.values(aggregatedMap);
    leaderboardList.sort((a, b) => {
      if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
      if (b.totalCorrect !== a.totalCorrect) return b.totalCorrect - a.totalCorrect;
      return b.maxStreak - a.maxStreak;
    });

    return leaderboardList.slice(0, 50);
  }, []);

  /* ── Mô Hình 2 Tầng: Fetch Leaderboard ── */
  const fetchLeaderboard = useCallback(async (initialPeriod = "all") => {
    setLeaderboardLoading(true);

    if (initialPeriod === "all") {
      // 🌟 Tab "Tất cả": Đọc trực tiếp từ dovui_user_totals (Tổng điểm trọn đời)
      const listMap = {};

      // 1. Đọc từ Supabase dovui_user_totals
      try {
        const { data, error } = await supabase
          .from("dovui_user_totals")
          .select("*")
          .order("all_time_points", { ascending: false })
          .limit(50);

        if (!error && Array.isArray(data)) {
          data.forEach((row) => {
            const key = row.username.toLowerCase();
            listMap[key] = {
              username: row.username,
              totalPoints: row.all_time_points || 0,
              totalCorrect: row.total_correct || 0,
              totalQuestions: row.total_questions || 0,
              maxStreak: row.max_streak || 0,
              playCount: row.play_count || 1,
              isGuest: false,
            };
          });
        }
      } catch (e) {}

      // 2. Gom thêm từ LocalStorage (cho khách/local offline)
      try {
        const localScores = JSON.parse(localStorage.getItem("dovui_guest_scores") || "[]");
        localScores.forEach((s) => {
          const name = s.name || "Khách";
          const key = name.toLowerCase();
          const pts = s.points || (s.score ? s.score * 100 : 0);
          if (!listMap[key]) {
            listMap[key] = {
              username: name,
              totalPoints: pts,
              totalCorrect: s.score || 0,
              totalQuestions: s.total || 0,
              maxStreak: s.maxStreak || 0,
              playCount: 1,
              isGuest: s.isGuest !== false,
            };
          } else if (s.isGuest === false) {
            listMap[key].isGuest = false;
          }
        });
      } catch (e) {}

      const allList = Object.values(listMap);
      allList.sort((a, b) => {
        if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
        if (b.totalCorrect !== a.totalCorrect) return b.totalCorrect - a.totalCorrect;
        return b.maxStreak - a.maxStreak;
      });

      setLeaderboardData(allList.slice(0, 50));
      setLeaderboardLoading(false);
      return;
    }

    // 🌟 Tab "Tuần" & "Tháng": Đọc từ dovui_scores
    let rawScores = [];
    try {
      const localScores = JSON.parse(localStorage.getItem("dovui_guest_scores") || "[]");
      localScores.forEach((s) => {
        rawScores.push({
          username: s.name || "Khách",
          points: s.points || (s.score ? s.score * 100 : 0),
          correct: s.score || 0,
          total: s.total || 0,
          maxStreak: s.maxStreak || 0,
          isGuest: s.isGuest !== false,
          createdAt: s.createdAt || new Date().toISOString(),
        });
      });
    } catch (e) {}

    try {
      const { data, error } = await supabase.from("dovui_scores").select("*");
      if (!error && Array.isArray(data)) {
        data.forEach((row) => {
          rawScores.push({
            username: row.username || "Thành viên",
            points: row.points || (row.score ? row.score * 100 : 0),
            correct: row.correct_count || row.score || 0,
            total: row.total_questions || row.total || 0,
            maxStreak: row.max_streak || 0,
            isGuest: false,
            createdAt: row.created_at || new Date().toISOString(),
          });
        });
      }
    } catch (err) {}

    allRawScoresRef.current = rawScores;
    const computed = filterAndAggregateLeaderboard(rawScores, initialPeriod);
    setLeaderboardData(computed);
    setLeaderboardLoading(false);
  }, [filterAndAggregateLeaderboard]);

  const openLeaderboard = useCallback((period = "all") => {
    setLeaderboardPeriod(period);
    setShowLeaderboard(true);
    fetchLeaderboard(period);
  }, [fetchLeaderboard]);

  const changeLeaderboardPeriod = useCallback((period) => {
    setLeaderboardPeriod(period);
    fetchLeaderboard(period);
  }, [fetchLeaderboard]);

  /* ── Start / Restart quiz ── */
  const startQuiz = useCallback(() => {
    if (nextQTimerRef.current) {
      clearTimeout(nextQTimerRef.current);
      nextQTimerRef.current = null;
    }
    unlock();
    const pool = Array.isArray(quizData) ? quizData : [];
    const shuffledPool = shuffleArray(pool);
    const countNeeded = Math.min(config.mcqCount || shuffledPool.length, shuffledPool.length);
    const picked = shuffledPool.slice(0, countNeeded);

    quizQRef.current = picked;
    currentRef.current = 0;
    lockedRef.current = false;
    quizEndedRef.current = false;
    scoreSavedRef.current = false;
    questionStartTimeRef.current = Date.now();

    setQuizQ(picked);
    setCurrent(0);
    setScore(0);
    setTotalPoints(0);
    setStreak(0);
    setMaxStreak(0);
    setOptStates({});
    setHistory([]);
    setUsedFiftyFifty(false);
    setUsedExtraTime(false);
    setExtraTimeCount(0);
    setQuestionDuration(config.timerSeconds ? config.timerSeconds * 1000 : DEFAULT_QUESTION_DURATION_MS);

    if (localStorage.getItem(SKIP_GUIDE_KEY) === "1") {
      setPhase("quiz");
      setTimerOn(true);
    } else {
      setPhase("quiz");
      setShowGuide(true);
      setTimerOn(false);
    }
  }, [quizData, config.mcqCount, config.timerSeconds, unlock]);

  useEffect(() => {
    if (hasInitRef.current) return;
    hasInitRef.current = true;
    startQuiz();
  }, [startQuiz]);

  useEffect(() => () => {
    if (nextQTimerRef.current) clearTimeout(nextQTimerRef.current);
  }, []);

  /* ── Callbacks ── */
  const handleGuideConfirm = useCallback((skipNext) => {
    if (skipNext) localStorage.setItem(SKIP_GUIDE_KEY, "1");
    setShowGuide(false);
    setTimerOn(true);
    questionStartTimeRef.current = Date.now();
  }, []);

  const showResults = useCallback(() => {
    if (quizEndedRef.current) return;
    quizEndedRef.current = true;
    if (nextQTimerRef.current) {
      clearTimeout(nextQTimerRef.current);
      nextQTimerRef.current = null;
    }
    setTimerOn(false);
    play("win");
    setPhase("result");

    saveQuizScore({
      title: config.title,
      scoreVal: score,
      totalVal: quizQRef.current.length,
      pointsVal: totalPoints,
      maxStreakVal: maxStreak,
    });
  }, [play, saveQuizScore, config.title, score, totalPoints, maxStreak]);

  const nextQuestion = useCallback(() => {
    const next = currentRef.current + 1;
    if (next < quizQRef.current.length) {
      currentRef.current = next;
      lockedRef.current = false;
      setCurrent(next);
      setOptStates({});
      setQuestionDuration(config.timerSeconds ? config.timerSeconds * 1000 : DEFAULT_QUESTION_DURATION_MS);
      questionStartTimeRef.current = Date.now();
      setTimerOn(true);
    } else {
      showResults();
    }
  }, [showResults, config.timerSeconds]);

  const handleAnswer = useCallback(
    (selectedKey = null, clickRect = null) => {
      if (lockedRef.current) return;
      lockedRef.current = true;
      setTimerOn(false);

      const q = quizQRef.current[currentRef.current];
      if (!q) return;

      const correct = q.correct;
      const isCorrect = selectedKey === correct;
      const responseTimeMs = Date.now() - questionStartTimeRef.current;

      const newStates = {};
      Object.keys(q.choices).forEach((k) => {
        if (k === correct) newStates[k] = "correct";
        else if (k === selectedKey) newStates[k] = "wrong";
        else newStates[k] = "dim";
      });
      setOptStates(newStates);

      setHistory((prev) => [
        ...prev,
        { question: q, selectedKey, correctKey: correct, isCorrect },
      ]);

      if (isCorrect) {
        play("correct");
        setScore((s) => s + 1);

        let currentStreakVal = 0;
        setStreak((prevStreak) => {
          currentStreakVal = prevStreak + 1;
          setMaxStreak((m) => Math.max(m, currentStreakVal));
          return currentStreakVal;
        });

        let earnedPoints = 100;
        if (currentStreakVal >= 2) earnedPoints += (currentStreakVal - 1) * 20;
        if (responseTimeMs < 5000) earnedPoints += 50;

        setTotalPoints((prev) => prev + earnedPoints);

        if (clickRect) {
          burstConfetti(clickRect.left + clickRect.width / 2, clickRect.top + clickRect.height / 2);
        }
      } else {
        play("wrong");
        setStreak(0);
      }

      nextQTimerRef.current = setTimeout(() => {
        nextQTimerRef.current = null;
        nextQuestion();
      }, 1300);
    },
    [play, nextQuestion]
  );

  const handleTimeUp = useCallback(() => {
    if (lockedRef.current) return;
    play("wrong");
    setStreak(0);
    handleAnswer(null);
  }, [play, handleAnswer]);

  const handleFinalRush = useCallback(() => {
    play("tick1", 1.6);
    setTimeout(() => play("tick2", 1.8), 350);
  }, [play]);

  const handleHover = useCallback(() => play("hover"), [play]);

  /* ── Power-up logic ── */
  const handleFiftyFifty = useCallback(() => {
    if (usedFiftyFifty || lockedRef.current || !quizQ[current]) return;
    const q = quizQ[current];
    const wrongKeys = Object.keys(q.choices).filter((k) => k !== q.correct);
    const hidden = shuffleArray(wrongKeys).slice(0, 2);

    const newStates = { ...optStates };
    hidden.forEach((k) => {
      newStates[k] = "dim";
    });

    setOptStates(newStates);
    setUsedFiftyFifty(true);
    play("hover");
  }, [usedFiftyFifty, quizQ, current, optStates, play]);

  const handleAddExtraTime = useCallback(() => {
    if (usedExtraTime || lockedRef.current) return;
    setQuestionDuration((prev) => prev + 10_000);
    setExtraTimeCount((prev) => prev + 1);
    setUsedExtraTime(true);
    play("hover");
  }, [usedExtraTime, play]);

  const confirmExit = useCallback(() => {
    if (nextQTimerRef.current) {
      clearTimeout(nextQTimerRef.current);
      nextQTimerRef.current = null;
    }
    setTimerOn(false);
    stopAll();
    lockedRef.current = true;
    quizEndedRef.current = true;
    setShowExit(false);
    onExitToRoute?.();
  }, [stopAll, onExitToRoute]);

  const handleEarlyEnd = useCallback(() => {
    if (nextQTimerRef.current) {
      clearTimeout(nextQTimerRef.current);
      nextQTimerRef.current = null;
    }
    setTimerOn(false);
    showResults();
  }, [showResults]);

  /* ── Tab Visibility Listener (Auto-pause) ── */
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        setTimerOn(false);
      } else if (phase === "quiz" && !showGuide && !showExit && !showLeaderboard && !lockedRef.current) {
        setTimerOn(true);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [phase, showGuide, showExit, showLeaderboard]);

  /* ── Keyboard Controls ── */
  useEffect(() => {
    if (phase !== "quiz" || showGuide || showExit || showLeaderboard || lockedRef.current) return;

    const handleKeyDown = (e) => {
      const q = quizQ[current];
      if (!q) return;
      const choicesArr = Object.keys(q.choices);

      if (e.key === "1" || e.key.toLowerCase() === "a") {
        if (choicesArr[0] && !optStates[choicesArr[0]]) handleAnswer(choicesArr[0]);
      } else if (e.key === "2" || e.key.toLowerCase() === "b") {
        if (choicesArr[1] && !optStates[choicesArr[1]]) handleAnswer(choicesArr[1]);
      } else if (e.key === "3" || e.key.toLowerCase() === "c") {
        if (choicesArr[2] && !optStates[choicesArr[2]]) handleAnswer(choicesArr[2]);
      } else if (e.key === "4" || e.key.toLowerCase() === "d") {
        if (choicesArr[3] && !optStates[choicesArr[3]]) handleAnswer(choicesArr[3]);
      } else if (e.code === "Space") {
        e.preventDefault();
        if (Object.keys(optStates).length === 0) handleAnswer(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [phase, showGuide, showExit, showLeaderboard, current, quizQ, optStates, handleAnswer]);

  return {
    phase,
    showGuide,
    setShowGuide,
    showExit,
    setShowExit,
    showLeaderboard,
    setShowLeaderboard,
    leaderboardPeriod,
    changeLeaderboardPeriod,
    leaderboardData,
    leaderboardLoading,
    openLeaderboard,
    quizQ,
    current,
    score,
    totalPoints,
    streak,
    maxStreak,
    timerOn,
    setTimerOn,
    optStates,
    history,
    usedFiftyFifty,
    usedExtraTime,
    extraTimeCount,
    questionDuration,
    startQuiz,
    handleGuideConfirm,
    handleAnswer,
    handleTimeUp,
    handleFinalRush,
    handleHover,
    handleFiftyFifty,
    handleAddExtraTime,
    confirmExit,
    handleEarlyEnd,
  };
}
