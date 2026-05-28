"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { Icon } from "@iconify/react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import DashboardLayout from "@/components/DashboardLayout";
import AIMascot from "@/components/AIMascot";

const LABELS = ["A", "B", "C", "D", "E"];

export default function TakeQuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();

  const [quiz, setQuiz] = useState(null);
  const [userXp, setUserXp] = useState(0);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({}); // { questionId: optionId }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [submitDialogOpen, setSubmitDialogOpen] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
    else if (status === "authenticated") fetchQuiz();
  }, [status]);

  // Reset reveal state when question changes
  useEffect(() => {
    const q = quiz?.questions[currentQuestion];
    if (!q) return;
    const saved = answers[q.id];
    if (saved) {
      const correctOpt = q.options.find((o) => o.isCorrect);
      setCorrect(saved === correctOpt?.id);
      setRevealed(true);
    } else {
      setRevealed(false);
      setCorrect(null);
    }
  }, [currentQuestion, quiz]);

  const fetchQuiz = async () => {
    try {
      const [quizRes, statsRes] = await Promise.all([
        fetch(`/api/quizzes/${params.id}`),
        fetch("/api/user/stats"),
      ]);

      let xpValue = 0;
      if (statsRes.ok) {
        const statsPayload = await statsRes.json();
        xpValue = statsPayload?.stats?.totalXP || 0;
        setUserXp(xpValue);
      }

      if (quizRes.ok) {
        const quizData = await quizRes.json();
        if (xpValue < (quizData.minXp || 0)) {
          toast.error(
            `Butuh minimal ${quizData.minXp || 0} XP untuk mengerjakan quiz ini`,
          );
          router.push("/quiz");
          return;
        }
        setQuiz(quizData);
      } else {
        toast.error("Quiz tidak ditemukan");
        router.push("/quiz");
      }
    } catch {
      toast.error("Gagal memuat quiz");
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAnswer = (questionId, optionId) => {
    if (revealed) return;
    const q = quiz.questions[currentQuestion];
    const correctOpt = q.options.find((o) => o.isCorrect);
    const isRight = optionId === correctOpt?.id;
    setAnswers((prev) => ({ ...prev, [questionId]: optionId }));
    setCorrect(isRight);
    setRevealed(true);
    
    if (isRight) {
      new Audio('/correct.mp3').play().catch(e => console.error("Error playing audio", e));
    } else {
      new Audio('/incorrect.mp3').play().catch(e => console.error("Error playing audio", e));
    }
  };

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion((i) => i + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) setCurrentQuestion((i) => i - 1);
  };

  const handleSubmit = () => {
    const unanswered = quiz.questions.filter((q) => !answers[q.id]);
    if (unanswered.length > 0) {
      toast.error(
        `Masih ada ${unanswered.length} pertanyaan yang belum dijawab`,
      );
      return;
    }
    setSubmitDialogOpen(true);
  };

  const confirmSubmit = async () => {
    setSubmitDialogOpen(false);
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/quizzes/${params.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ answers }),
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data);
        toast.success("Quiz selesai!");
        if (data.percentage >= 60) {
          new Audio('/Diatasratarata.mp3').play().catch(e => console.error("Error playing audio", e));
        } else {
          new Audio('/Dibawahratarata.mp3').play().catch(e => console.error("Error playing audio", e));
        }
      } else toast.error("Gagal mengirim jawaban");
    } catch {
      toast.error("Gagal mengirim jawaban");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#EEF2FF] to-[#F5F3FF] flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <Icon
              icon="svg-spinners:ring-resize"
              className="text-5xl text-indigo-500"
            />
            <p className="font-black text-indigo-500 animate-pulse">
              Memuat quiz...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!quiz) return null;

  // ── Result screen ────────────────────────────────────────────
  if (result) {
    const pct = result.percentage;
    const isWin = pct >= 60;
    const rewardGranted = !!result.rewardGranted;
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#EEF2FF] to-[#F5F3FF] font-[family-name:var(--font-nunito)] py-8 px-4">
          <style
            dangerouslySetInnerHTML={{
              __html: `.duo-btn{border-bottom-width:4px;transition:all .1s ease}.duo-btn:hover{transform:translateY(-2px);border-bottom-width:6px}.duo-btn:active{transform:translateY(4px);border-bottom-width:0}`,
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.45 }}
            className="max-w-2xl mx-auto space-y-5"
          >
            <div className="bg-white border-2 border-b-[6px] border-gray-200 rounded-[2rem] overflow-hidden shadow-xl">
              {/* Header */}
              <div
                className={`px-8 pt-10 pb-8 text-center relative overflow-hidden ${isWin ? "bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600" : "bg-gradient-to-br from-rose-400 via-red-500 to-rose-600"}`}
              >
                <div className="absolute inset-0 opacity-10 text-[120px] leading-none text-center select-none">
                  {isWin ? "🏆" : "🔄"}
                </div>
                <div className="relative">
                  <div className="flex justify-center mb-4">
                    <AIMascot mood={isWin ? "happy" : "wrong"} />
                  </div>
                  <h2 className="text-2xl font-black text-white drop-shadow-md mb-1">
                    {pct >= 80
                      ? "Luar Biasa! 🎉"
                      : pct >= 60
                        ? "Bagus Sekali! 👍"
                        : pct >= 40
                          ? "Tingkatkan Lagi 💪"
                          : "Ayo Coba Lagi 🔄"}
                  </h2>
                  <p className="text-white/80 text-sm font-bold">
                    {isWin
                      ? "Kamu berhasil menyelesaikan quiz ini!"
                      : "Jangan menyerah, terus berlatih!"}
                  </p>
                </div>
              </div>

              <div className="p-6">
                {/* Score circle */}
                <div className="flex justify-center mb-5">
                  <div
                    className={`w-28 h-28 rounded-full border-[6px] flex flex-col items-center justify-center shadow-inner ${isWin ? "border-emerald-400 bg-emerald-50" : "border-rose-400 bg-rose-50"}`}
                  >
                    <span
                      className={`text-4xl font-black leading-none ${isWin ? "text-emerald-600" : "text-rose-600"}`}
                    >
                      {pct}%
                    </span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider mt-0.5">
                      Skor
                    </span>
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-5">
                  {[
                    {
                      icon: "solar:check-circle-bold",
                      iconClass: "text-emerald-500",
                      bg: "bg-emerald-50 border-emerald-200",
                      val: `${result.score}/${result.totalQuestions}`,
                      valClass: "text-emerald-600",
                      label: "Benar",
                    },
                    {
                      icon: "solar:target-bold",
                      iconClass: "text-indigo-500",
                      bg: "bg-indigo-50 border-indigo-200",
                      val: `${pct}%`,
                      valClass: "text-indigo-600",
                      label: "Akurasi",
                    },
                    {
                      icon: "solar:book-2-bold",
                      iconClass: "text-amber-500",
                      bg: "bg-amber-50 border-amber-200",
                      val: result.totalQuestions,
                      valClass: "text-amber-600",
                      label: "Soal",
                    },
                  ].map(({ icon, iconClass, bg, val, valClass, label }) => (
                    <div
                      key={label}
                      className={`${bg} border-2 border-b-4 rounded-2xl p-3 text-center`}
                    >
                      <Icon
                        icon={icon}
                        className={`text-2xl mx-auto mb-1 ${iconClass}`}
                      />
                      <div className={`font-black text-base ${valClass}`}>
                        {val}
                      </div>
                      <div className="text-[9px] font-black text-gray-400 uppercase tracking-wide">
                        {label}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mb-5 rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4 text-center">
                  <div className="text-[10px] font-black uppercase tracking-widest text-emerald-600">
                    Reward EXP
                  </div>
                  <div className="text-2xl font-black text-emerald-700">
                    +{result.rewardXp || 0} XP
                  </div>
                </div>

                <div
                  className={`mb-5 rounded-2xl border-2 border-b-4 p-4 text-center ${
                    rewardGranted
                      ? "border-[#A7F3D0] bg-gradient-to-br from-emerald-50 to-teal-50"
                      : "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
                  }`}
                >
                  <div
                    className={`text-[10px] font-black uppercase tracking-widest ${rewardGranted ? "text-emerald-600" : "text-amber-700"}`}
                  >
                    Status Reward
                  </div>
                  <div
                    className={`mt-1 text-base font-black ${rewardGranted ? "text-emerald-700" : "text-amber-800"}`}
                  >
                    {rewardGranted
                      ? "EXP berhasil ditambahkan"
                      : "Reward EXP sudah pernah diklaim"}
                  </div>
                  <p
                    className={`mt-1 text-xs font-bold ${rewardGranted ? "text-emerald-600" : "text-amber-700"}`}
                  >
                    {rewardGranted
                      ? "Selamat, bonus EXP dari quiz ini sudah masuk ke akunmu."
                      : "Kamu tetap bisa latihan lagi, tapi bonus EXP tidak ditambahkan ulang."}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                  <button
                    className="duo-btn flex-1 py-3.5 bg-white text-gray-600 border-2 border-b-4 border-gray-200 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                    onClick={() => router.push("/quiz")}
                  >
                    <Icon icon="solar:home-2-bold" className="text-lg" />{" "}
                    Kembali
                  </button>
                  <button
                    className="duo-btn flex-1 py-3.5 bg-indigo-500 text-white border-2 border-b-4 border-indigo-700 rounded-2xl font-black text-sm flex items-center justify-center gap-2"
                    onClick={() => {
                      setResult(null);
                      setAnswers({});
                      setCurrentQuestion(0);
                      setRevealed(false);
                      setCorrect(null);
                    }}
                  >
                    <Icon icon="solar:restart-bold" className="text-lg" />{" "}
                    Kerjakan Lagi
                  </button>
                </div>
              </div>
            </div>

            {/* Detailed results */}
            <div className="bg-white rounded-3xl border-2 border-b-[6px] border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b-2 border-gray-100">
                <Icon
                  icon="solar:clipboard-list-bold"
                  className="text-xl text-indigo-500"
                />
                <h3 className="font-black text-gray-900">Pembahasan Jawaban</h3>
              </div>
              <div className="p-5 space-y-3">
                {result.detailedResults.map((item, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl border-2 border-b-4 p-4 ${item.isCorrect ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"}`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${item.isCorrect ? "bg-emerald-400" : "bg-red-400"}`}
                      >
                        <Icon
                          icon={
                            item.isCorrect
                              ? "solar:check-circle-bold"
                              : "solar:close-circle-bold"
                          }
                          className="text-white text-lg"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-black text-gray-900 text-sm mb-2">
                          {index + 1}. {item.question}
                        </p>
                        <div className="space-y-1 text-xs font-bold">
                          <p className="text-gray-600">
                            Jawaban kamu:{" "}
                            <span
                              className={
                                item.isCorrect
                                  ? "text-emerald-700"
                                  : "text-red-700"
                              }
                            >
                              {item.userAnswer || "(tidak dijawab)"}
                            </span>
                          </p>
                          {!item.isCorrect && (
                            <p className="text-gray-600">
                              Jawaban benar:{" "}
                              <span className="text-emerald-700">
                                {item.correctAnswer}
                              </span>
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </DashboardLayout>
    );
  }

  // ── Quiz screen ──────────────────────────────────────────────
  const question = quiz.questions[currentQuestion];
  const total = quiz.questions.length;
  const answeredCount = Object.keys(answers).length;
  const mascotMood = revealed ? (correct ? "happy" : "wrong") : "neutral";
  const selectedOptionId = answers[question?.id];
  const correctOptionId = question?.options.find((o) => o.isCorrect)?.id;

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#EEF2FF] to-[#F5F3FF] font-[family-name:var(--font-nunito)]">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .duo-btn{border-bottom-width:4px;transition:all .1s ease}
          .duo-btn:hover{transform:translateY(-2px);border-bottom-width:6px}
          .duo-btn:active{transform:translateY(4px);border-bottom-width:0}
          .cloud-bg{position:absolute;background:white;border-radius:999px;opacity:0.7;border:3px solid #E2E8F0}
        `,
          }}
        />

        {/* Decorative clouds */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="cloud-bg w-48 h-16 top-12 -left-12 shadow-sm animate-[bounce_4s_infinite]" />
          <div className="cloud-bg w-64 h-20 top-32 -right-16 shadow-sm animate-[bounce_5s_infinite]" />
        </div>

        <div className="max-w-5xl w-full mx-auto px-2 sm:px-6 py-2 md:py-4 relative z-10 flex-1 flex flex-col pb-8">
          {/* Top bar */}
          <div className="flex items-center gap-2 mb-3 bg-white/80 backdrop-blur-sm rounded-xl p-2 border-2 border-white shadow-sm">
            <button
              onClick={() => setExitDialogOpen(true)}
              className="duo-btn flex items-center gap-1 px-2 py-1.5 bg-white border-2 border-b-[3px] border-gray-200 rounded-lg font-black text-gray-600 text-[10px] sm:text-xs hover:bg-gray-50 shrink-0"
            >
              <Icon
                icon="solar:arrow-left-bold"
                className="w-3 h-3 sm:w-3.5 sm:h-3.5"
              />
              <span className="hidden sm:inline">Keluar</span>
            </button>
            <div className="flex-1 flex items-center gap-1 px-2">
              {quiz.questions.map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 sm:h-2 flex-1 rounded-full transition-all duration-300 ${
                    i < currentQuestion
                      ? "bg-[#10B981]"
                      : i === currentQuestion
                        ? "bg-gradient-to-r from-[#6366F1] to-[#818CF8] animate-pulse"
                        : "bg-gray-200"
                  }`}
                />
              ))}
            </div>
            <div className="shrink-0 px-2.5 py-1 bg-indigo-50 border-2 border-indigo-200 rounded-xl">
              <span className="font-black text-indigo-600 text-xs">
                {answeredCount}/{total}
              </span>
            </div>
          </div>

          {/* Main grid — mascot left, question right */}
          <div className="grid lg:grid-cols-12 gap-3 sm:gap-6 items-start flex-1 pb-1">
            {/* Mascot column */}
            <div className="hidden lg:flex lg:col-span-4 flex-col items-center justify-start gap-4 bg-white/50 border-2 border-white/80 rounded-3xl p-6 shadow-sm sticky top-4">
              <AIMascot mood={mascotMood} />

              {/* Quiz title & info */}
              <div className="w-full text-center space-y-2">
                <p className="font-black text-gray-800 text-sm leading-snug">
                  {quiz.title}
                </p>
                {quiz.difficulty && (
                  <span
                    className={`inline-block px-3 py-1 font-black text-[11px] rounded-xl border-2 ${
                      quiz.difficulty === "EASY"
                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                        : quiz.difficulty === "MEDIUM"
                          ? "bg-amber-50 border-amber-200 text-amber-700"
                          : "bg-red-50 border-red-200 text-red-700"
                    }`}
                  >
                    {quiz.difficulty === "EASY"
                      ? "Mudah"
                      : quiz.difficulty === "MEDIUM"
                        ? "Sedang"
                        : "Sulit"}
                  </span>
                )}
              </div>

              {/* Feedback after answer */}
              <AnimatePresence>
                {revealed && (
                  <motion.div
                    key={`feedback-${currentQuestion}`}
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full rounded-2xl p-4 border-2 text-center bg-white shadow-sm"
                    style={{ borderColor: correct ? "#A8E6CF" : "#EA2B2B" }}
                  >
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-sm"
                        style={{
                          backgroundColor: correct ? "#10B981" : "#EA2B2B",
                        }}
                      >
                        {correct ? "✓" : "✗"}
                      </div>
                      <span
                        className="font-black text-sm"
                        style={{ color: correct ? "#059669" : "#C62828" }}
                      >
                        {correct ? "Jawaban Tepat!" : "Bukan yang itu!"}
                      </span>
                    </div>
                    <p
                      className="text-xs font-bold leading-relaxed"
                      style={{ color: correct ? "#047857" : "#E53935" }}
                    >
                      {correct
                        ? "Kamu benar! 👍"
                        : `Jawaban benar: ${question?.options.find((o) => o.isCorrect)?.option}`}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Question map */}
              <div className="w-full">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-wider mb-2">
                  Navigasi Soal
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {quiz.questions.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => setCurrentQuestion(i)}
                      className={`w-8 h-8 rounded-xl font-black text-xs border-2 border-b-[3px] transition-all ${
                        i === currentQuestion
                          ? "bg-indigo-500 border-indigo-700 text-white scale-110"
                          : answers[q.id]
                            ? "bg-emerald-100 border-emerald-300 text-emerald-700"
                            : "bg-gray-50 border-gray-200 text-gray-500 hover:bg-indigo-50 hover:border-indigo-300"
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Question panel */}
            <div className="col-span-12 lg:col-span-8 flex flex-col">
              <div className="bg-white border-2 border-b-[4px] sm:border-b-[6px] border-gray-200 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm flex flex-col gap-3">
                {/* Instruction badge */}
                <div className="hidden lg:flex bg-[#E0E7FF] border-2 border-[#818CF8] rounded-2xl p-3 items-center gap-3">
                  <Icon
                    icon="solar:question-circle-bold"
                    className="text-xl text-indigo-500 shrink-0"
                  />
                  <div>
                    <h4 className="font-black text-[#4338CA] text-[10px] uppercase tracking-wider">
                      Quiz:
                    </h4>
                    <p className="text-[#3730A3] font-black text-sm leading-tight mt-0.5">
                      Pilih jawaban yang paling tepat!
                    </p>
                  </div>
                </div>

                {/* Mobile feedback */}
                {revealed && (
                  <div className="block lg:hidden">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="rounded-2xl p-3 border-2 text-center bg-white shadow-sm"
                      style={{ borderColor: correct ? "#A8E6CF" : "#EA2B2B" }}
                    >
                      <span
                        className="font-black text-xs"
                        style={{ color: correct ? "#059669" : "#C62828" }}
                      >
                        {correct ? "✓ Jawaban Tepat!" : "✗ Bukan yang itu!"}
                      </span>
                      <p
                        className="text-[11px] font-bold mt-0.5"
                        style={{ color: correct ? "#047857" : "#E53935" }}
                      >
                        {correct
                          ? "Kamu benar! 👍"
                          : `Jawaban benar: ${question?.options.find((o) => o.isCorrect)?.option}`}
                      </p>
                    </motion.div>
                  </div>
                )}

                {/* Question text */}
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="rounded-3xl bg-white/90 border border-gray-200 p-5 sm:p-6 text-center shadow-sm relative overflow-hidden">
                      <div className="absolute top-2 right-3 text-4xl opacity-10 font-black select-none">
                        ❓
                      </div>
                      <p className="text-[10px] font-black text-[#6366F1] uppercase tracking-widest mb-2 opacity-70">
                        Pertanyaan {currentQuestion + 1} dari {total}
                      </p>
                      <p className="text-lg sm:text-xl font-black text-[#1E1B4B] leading-snug">
                        {question.question}
                      </p>
                    </div>

                    {/* Options */}
                    <div className="grid gap-2.5 sm:grid-cols-2 mt-3">
                      {question.options.map((option, idx) => {
                        const isSel = selectedOptionId === option.id;
                        const isCorrectOpt =
                          revealed && option.id === correctOptionId;
                        return (
                          <button
                            key={option.id}
                            type="button"
                            onClick={() =>
                              handleSelectAnswer(question.id, option.id)
                            }
                            disabled={revealed}
                            className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 text-left flex items-center gap-3 w-full border-2 group
                              ${!revealed ? "bg-white border-gray-200 text-gray-700 hover:border-[#6366F1] hover:bg-[#EEF2FF] hover:scale-[1.01] shadow-sm cursor-pointer border-b-[4px] active:translate-y-[2px] active:border-b-[2px]" : ""}
                              ${isSel && correct ? "bg-emerald-50 border-emerald-400 border-b-[4px] text-emerald-700" : ""}
                              ${isSel && !correct ? "bg-red-50 border-red-400 border-b-[4px] text-red-700" : ""}
                              ${isCorrectOpt && !isSel ? "bg-emerald-50 border-emerald-300 border-b-[4px] text-emerald-600" : ""}
                              ${revealed && !isSel && !isCorrectOpt ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed" : ""}
                            `}
                          >
                            <span
                              className={`w-7 h-7 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                                !revealed
                                  ? "bg-gray-100 text-gray-500 group-hover:bg-[#6366F1] group-hover:text-white"
                                  : isSel && correct
                                    ? "bg-emerald-400 text-white"
                                    : isSel && !correct
                                      ? "bg-red-400 text-white"
                                      : isCorrectOpt
                                        ? "bg-emerald-300 text-white"
                                        : "bg-gray-100 text-gray-300"
                              }`}
                            >
                              {LABELS[idx] ?? idx + 1}
                            </span>
                            <span className="flex-1 leading-snug">
                              {option.option}
                            </span>
                            {isSel && correct && (
                              <span className="text-emerald-500 text-base">
                                ✓
                              </span>
                            )}
                            {isSel && !correct && (
                              <span className="text-red-400 text-base">✗</span>
                            )}
                            {isCorrectOpt && !isSel && (
                              <span className="text-emerald-400 text-xs font-black">
                                ✓
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Footer nav */}
                <div className="pt-3 border-t border-gray-100 flex items-center gap-3">
                  <button
                    onClick={handlePrevious}
                    disabled={currentQuestion === 0}
                    className="duo-btn flex items-center gap-1.5 px-4 py-3 bg-white border-2 border-b-[4px] border-gray-200 rounded-2xl font-black text-xs text-gray-600 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    <Icon icon="solar:arrow-left-bold" /> Sebelumnya
                  </button>

                  <div className="flex-1" />

                  {currentQuestion === total - 1 ? (
                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting}
                      className="duo-btn flex items-center gap-1.5 px-5 py-3 bg-emerald-500 border-2 border-b-[4px] border-emerald-700 rounded-2xl font-black text-xs text-white disabled:opacity-60 hover:bg-emerald-600"
                    >
                      <Icon
                        icon="solar:check-circle-bold"
                        className="text-base"
                      />
                      {isSubmitting ? "Mengirim..." : "Selesai & Kirim"}
                    </button>
                  ) : (
                    <motion.button
                      initial={false}
                      animate={revealed ? { scale: [0.97, 1] } : {}}
                      transition={{ duration: 0.2 }}
                      onClick={handleNext}
                      disabled={!revealed}
                      className={`duo-btn flex items-center gap-1.5 px-5 py-3 rounded-2xl font-black text-xs border-2 border-b-[4px] text-white transition-all
                        ${
                          !revealed
                            ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                            : correct
                              ? "bg-gradient-to-r from-[#10B981] to-[#059669] border-[#047857] hover:opacity-90"
                              : "bg-gradient-to-r from-[#EA2B2B] to-[#C62828] border-[#B71C1C] hover:opacity-90"
                        }`}
                    >
                      {!revealed ? "Pilih jawaban dulu" : "Soal Berikutnya"}
                      {revealed && (
                        <Icon
                          icon="solar:arrow-right-bold"
                          className="text-base"
                        />
                      )}
                    </motion.button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exit Dialog */}
        <AlertDialog open={exitDialogOpen} onOpenChange={setExitDialogOpen}>
          <AlertDialogContent className="rounded-3xl border-4 border-b-[6px] border-gray-200 font-[family-name:var(--font-nunito)]">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-black">
                Keluar dari Quiz?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-bold text-gray-500">
                Progress kamu akan hilang dan tidak tersimpan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel className="rounded-2xl font-black border-2 border-b-4">
                Lanjutkan
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={() => router.push("/quiz")}
                className="rounded-2xl font-black bg-red-500 border-2 border-b-4 border-red-700 hover:bg-red-600"
              >
                Keluar
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>

        {/* Submit Dialog */}
        <AlertDialog open={submitDialogOpen} onOpenChange={setSubmitDialogOpen}>
          <AlertDialogContent className="rounded-3xl border-4 border-b-[6px] border-gray-200 font-[family-name:var(--font-nunito)]">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-black">
                Kirim Jawaban?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-bold text-gray-500">
                Kamu tidak bisa mengubah jawaban setelah ini.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <div className="flex gap-3 justify-end">
              <AlertDialogCancel className="rounded-2xl font-black border-2 border-b-4">
                Kembali
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmSubmit}
                disabled={isSubmitting}
                className="rounded-2xl font-black bg-emerald-500 border-2 border-b-4 border-emerald-700 hover:bg-emerald-600"
              >
                {isSubmitting ? "Mengirim..." : "Kirim Jawaban"}
              </AlertDialogAction>
            </div>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </DashboardLayout>
  );
}
