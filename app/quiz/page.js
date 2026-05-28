"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import DashboardLayout from "@/components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { Lock, CheckCircle2, Clock, BookOpen, Trophy } from "lucide-react";
import AIMascot from "@/components/AIMascot";
import { sortQuizzesForPath } from "@/lib/quiz-order";

// Custom Icons
const CyberLockIcon = () => (
  <svg
    className="w-5 h-5"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <rect x="5" y="11" width="14" height="10" rx="2" />
    <path d="M12 15v3M8 11V7a4 4 0 0 1 8 0v4" />
  </svg>
);

const CyberEnergyIcon = () => (
  <svg
    className="w-4 h-4"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
  </svg>
);

export default function QuizPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userXp, setUserXp] = useState(0);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [activeQuiz, setActiveQuiz] = useState(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchQuizzes();
    }
  }, [status, router]);

  const fetchQuizzes = async () => {
    try {
      const [quizRes, statsRes] = await Promise.all([
        fetch("/api/quizzes"),
        fetch("/api/user/stats"),
      ]);

      if (quizRes.ok) {
        const data = await quizRes.json();
        const sortedQuizzes = Array.isArray(data)
          ? sortQuizzesForPath(data)
          : [];
        setQuizzes(sortedQuizzes);

        // Set active quiz (first incomplete quiz)
        const firstIncomplete = sortedQuizzes.find(
          (q) => !q.results || q.results.length === 0,
        );
        if (firstIncomplete) {
          setActiveQuiz(firstIncomplete.id);
        }
      } else {
        toast.error("Gagal memuat kuis");
      }

      if (statsRes.ok) {
        const statsPayload = await statsRes.json();
        setUserXp(statsPayload?.stats?.totalXP || 0);
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan saat memuat kuis");
    } finally {
      setLoading(false);
    }
  };

  // Check if quiz is unlocked (previous quiz must be completed)
  const isQuizUnlocked = (quizIndex) => {
    if (quizIndex <= 0) return true; // First quiz in the path is always unlocked

    const previousQuiz = quizzes[quizIndex - 1];
    if (!previousQuiz) return true;

    return previousQuiz.results && previousQuiz.results.length > 0;
  };

  const canAttemptQuiz = (quiz, quizIndex) => {
    return isQuizUnlocked(quizIndex) && userXp >= (quiz.minXp || 0);
  };

  // Generate bezier path for the learning path
  const generateBezierPath = () => {
    if (quizzes.length === 0) return "";

    const points = quizzes.map((quiz, index) => {
      const x = index % 2 === 0 ? 280 : 120;
      const y = 80 + index * 140;
      return { x, y };
    });

    if (points.length === 1) return `M${points[0].x},${points[0].y}`;

    let path = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const midY = (prev.y + curr.y) / 2;
      path += ` C${prev.x},${midY} ${curr.x},${midY} ${curr.x},${curr.y}`;
    }
    return path;
  };

  const bezierPath = generateBezierPath();
  const svgHeight = Math.max(600, quizzes.length * 140 + 80);

  // Get current active node for mascot position
  const currentActiveNode =
    quizzes.find((q) => q.id === activeQuiz) || quizzes[0];
  const activeIndex = quizzes.findIndex((q) => q.id === activeQuiz);
  const offsetDistance =
    quizzes.length > 1
      ? `${(activeIndex / (quizzes.length - 1)) * 100}%`
      : "0%";

  // Get inspected quiz details
  const inspectedQuiz =
    quizzes.find((q) => q.id === (selectedQuiz || activeQuiz)) || quizzes[0];
  const isInspectedUnlocked = inspectedQuiz
    ? isQuizUnlocked(inspectedQuiz)
    : false;
  const canAttemptInspectedQuiz = inspectedQuiz
    ? canAttemptQuiz(inspectedQuiz)
    : false;

  if (status === "loading" || loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center bg-white">
          <div className="text-xl font-black text-indigo-500 animate-pulse">
            Memuat Jalur Belajar...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .duo-btn { 
          border-bottom-width: 4px; 
          transition: all 0.1s ease; 
        }
        .duo-btn:hover { 
          transform: translateY(-2px); 
          border-bottom-width: 6px; 
        }
        .duo-btn:active { 
          transform: translateY(4px); 
          border-bottom-width: 0px; 
        }
      `,
        }}
      />

      <div className="min-h-[calc(100vh-4rem)] bg-white relative w-full font-[family-name:var(--font-nunito)] overflow-x-hidden">
        {/* Background Decorations */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-60" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-50 rounded-full blur-3xl -z-10 opacity-40" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 flex flex-col gap-8 relative z-10 w-full overflow-hidden sm:overflow-visible">
          {/* Header Section */}
          <header className="flex flex-col sm:flex-row items-center justify-between gap-6 bg-gradient-to-r from-indigo-500 to-indigo-600 p-8 rounded-[2.5rem] border-4 border-b-8 border-indigo-700 text-white shadow-xl">
            <div className="flex items-center gap-5">
              <div className="bg-white p-3 rounded-2xl shadow-inner">
                <svg
                  className="w-12 h-12 text-indigo-500 drop-shadow-md animate-pulse"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="4 2"
                    className="opacity-55"
                  />
                  <circle
                    cx="12"
                    cy="12"
                    r="6"
                    stroke="#10B981"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M16.24 7.76l-2.12 6.36-6.36 2.12 2.12-6.36 6.36-2.12z"
                    fill="#6366F1"
                    stroke="#4F46E5"
                    strokeWidth="1.5"
                    strokeLinejoin="round"
                  />
                  <circle cx="12" cy="12" r="1.5" fill="white" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-black tracking-tight">
                  Jalur Belajar Kuis
                </h1>
                <p className="font-bold opacity-90 text-sm">
                  {quizzes.length} level menunggumu! Selesaikan berurutan untuk
                  unlock level berikutnya
                </p>
              </div>
            </div>
          </header>

          {/* Learning Path Map */}
          {quizzes.length === 0 ? (
            <div className="text-center py-20 bg-gray-50 rounded-[2rem] border-4 border-dashed border-gray-200">
              <BookOpen className="w-24 h-24 mx-auto mb-6 text-gray-300" />
              <h3 className="text-xl font-black text-gray-400">
                Belum ada kuis tersedia
              </h3>
              <p className="text-gray-400 font-bold text-sm mt-1">
                Kuis baru akan segera hadir!
              </p>
            </div>
          ) : (
            <div className="w-full flex justify-center items-center relative">
              {/* Glowing ambient orbs */}
              <div className="absolute top-1/4 left-10 w-72 h-72 bg-indigo-200/20 rounded-full blur-[100px] pointer-events-none -z-20" />
              <div className="absolute bottom-1/4 right-10 w-72 h-72 bg-emerald-200/20 rounded-full blur-[100px] pointer-events-none -z-20" />

              {/* The Path */}
              <div
                className="relative w-[400px] shrink-0 scale-[0.85] sm:scale-100 origin-top"
                style={{ height: `${svgHeight}px` }}
              >
                {/* SVG Bezier Path */}
                <svg
                  className="absolute inset-0 w-full h-full z-0 pointer-events-none"
                  viewBox={`0 0 400 ${svgHeight}`}
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <defs>
                    <linearGradient
                      id="cyberGradient"
                      x1="0%"
                      y1="0%"
                      x2="100%"
                      y2="100%"
                    >
                      <stop offset="0%" stopColor="#6366F1" />
                      <stop offset="35%" stopColor="#10B981" />
                      <stop offset="70%" stopColor="#1CB0F6" />
                      <stop offset="100%" stopColor="#A560E8" />
                    </linearGradient>
                  </defs>
                  {/* Base path */}
                  <path
                    d={bezierPath}
                    stroke="#F1F5F9"
                    strokeWidth="20"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {/* Animated energy pulse */}
                  <motion.path
                    d={bezierPath}
                    stroke="url(#cyberGradient)"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeDasharray="16, 24"
                    initial={{ strokeDashoffset: 160 }}
                    animate={{ strokeDashoffset: 0 }}
                    transition={{
                      repeat: Infinity,
                      duration: 5,
                      ease: "linear",
                    }}
                  />
                </svg>

                {/* Hopping Mascot */}
                {currentActiveNode && (
                  <motion.div
                    style={{
                      offsetPath: `path('${bezierPath}')`,
                      offsetRotate: "0deg",
                      transformOrigin: "50% 100%",
                    }}
                    animate={{
                      offsetDistance: offsetDistance,
                      y: -15,
                    }}
                    transition={{
                      type: "spring",
                      stiffness: 70,
                      damping: 14,
                      mass: 1,
                    }}
                    className="absolute top-0 left-0 pointer-events-none z-30 flex flex-col items-center"
                  >
                    <div className="w-48 h-48 flex items-center justify-center origin-bottom scale-[0.4] drop-shadow-md">
                      <AIMascot mood="neutral" skin="explorer" />
                    </div>
                  </motion.div>
                )}

                {/* Quiz Nodes */}
                {quizzes.map((quiz, index) => {
                  const x = index % 2 === 0 ? 280 : 120;
                  const y = 80 + index * 140;
                  const isUnlocked = isQuizUnlocked(index);
                  const isCompleted = quiz.results && quiz.results.length > 0;
                  const isSelected = selectedQuiz === quiz.id;
                  const meetsXp = userXp >= (quiz.minXp || 0);
                  const canAttempt = canAttemptQuiz(quiz, index);
                  const quizColor = quiz.color || "#6366F1";

                  return (
                    <div
                      key={quiz.id}
                      style={{
                        left: `${x}px`,
                        top: `${y}px`,
                        zIndex: isSelected ? 40 : 10,
                      }}
                      className="absolute -translate-x-1/2 -translate-y-1/2 flex items-center justify-center"
                    >
                      {/* Selection rings */}
                      {isSelected && (
                        <>
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 10,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="absolute w-24 h-24 border-2 border-dashed rounded-full -z-10 opacity-75 scale-105"
                            style={{ borderColor: quizColor }}
                          />
                          <motion.div
                            animate={{ scale: [1, 1.15, 1] }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut",
                            }}
                            className="absolute w-22 h-22 rounded-full -z-10"
                            style={{ backgroundColor: `${quizColor}10` }}
                          />
                        </>
                      )}

                      {/* Quiz Node Button */}
                      <button
                        onClick={() => {
                          if (canAttempt) {
                            setActiveQuiz(quiz.id);
                            setSelectedQuiz(
                              selectedQuiz === quiz.id ? null : quiz.id,
                            );
                          } else {
                            if (!isUnlocked) {
                              toast.error(
                                "Selesaikan kuis sebelumnya terlebih dahulu!",
                              );
                            } else {
                              toast.error(
                                `Butuh minimal ${quiz.minXp || 0} XP untuk membuka kuis ini`,
                              );
                            }
                          }
                        }}
                        style={{
                          backgroundColor: canAttempt ? quizColor : "#9CA3AF",
                          borderBottomColor: canAttempt ? quizColor : "#6B7280",
                          filter: canAttempt
                            ? "brightness(1)"
                            : "brightness(0.7)",
                        }}
                        className={`w-16 h-16 rounded-full border-2 border-b-6 border-white text-white font-black flex items-center justify-center cursor-pointer transition-all hover:scale-105 active:translate-y-[4px] active:border-b-2 shadow-md relative ${!canAttempt && "cursor-not-allowed"}`}
                        disabled={!canAttempt}
                      >
                        {/* Icon */}
                        {isCompleted ? (
                          <CheckCircle2 className="w-7 h-7" />
                        ) : canAttempt ? (
                          <span className="text-2xl">{quiz.icon || "📚"}</span>
                        ) : (
                          <CyberLockIcon />
                        )}

                        {/* Active indicator */}
                        {canAttempt && !isCompleted && !isSelected && (
                          <span className="absolute -top-3.5 bg-yellow-400 text-yellow-950 text-[8px] font-black px-1.5 py-0.5 rounded border border-yellow-300 shadow-md uppercase tracking-wider animate-bounce">
                            GO
                          </span>
                        )}

                        {/* Order badge */}
                        <span
                          className="absolute -bottom-2 bg-white text-gray-700 text-[10px] font-black px-2 py-0.5 rounded-full border-2 shadow-sm"
                          style={{ borderColor: quizColor }}
                        >
                          {index + 1}
                        </span>
                      </button>

                      <div className="absolute top-full mt-2 w-56 text-center text-[10px] font-bold text-gray-500">
                        <div className="flex items-center justify-center gap-1 flex-wrap">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                            +{quiz.rewardXp || 0} XP
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                            Min {quiz.minXp || 0} XP
                          </span>
                        </div>
                        {!meetsXp && (
                          <div className="mt-1 text-rose-500">
                            XP kamu: {userXp}
                          </div>
                        )}
                      </div>

                      {/* Floating Details Popup */}
                      <AnimatePresence>
                        {isSelected && (
                          <>
                            {/* Mobile Backdrop */}
                            <motion.div
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 z-[90] bg-black/20 backdrop-blur-sm sm:hidden"
                              onClick={() => setSelectedQuiz(null)}
                            />

                            <motion.div
                              initial={{
                                opacity: 0,
                                scale: 0.9,
                              }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{
                                opacity: 0,
                                scale: 0.9,
                              }}
                              className={`fixed sm:absolute z-[100] sm:z-45 
                                bottom-4 left-4 right-4 sm:bottom-auto sm:left-auto sm:right-auto sm:w-72 
                                bg-white/95 backdrop-blur-md border-3 border-gray-200 p-5 sm:p-6 rounded-3xl shadow-xl text-center 
                                sm:top-1/2 sm:-translate-y-1/2 
                                ${x >= 200 ? "sm:right-full sm:mr-6" : "sm:left-full sm:ml-6"}
                              `}
                            >
                              {/* Pointer arrow (Desktop only) */}
                              {x >= 200 ? (
                                <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 -right-2 w-3.5 h-3.5 bg-white border-t-3 border-r-3 border-gray-200 rotate-45" />
                              ) : (
                                <div className="hidden sm:block absolute top-1/2 -translate-y-1/2 -left-2 w-3.5 h-3.5 bg-white border-b-3 border-l-3 border-gray-200 rotate-45" />
                              )}

                            {/* Icon */}
                            <div className="flex justify-center mb-4">
                              <div
                                className="w-14 h-14 rounded-2xl border-2 border-dashed flex items-center justify-center shadow-sm text-3xl"
                                style={{
                                  backgroundColor: `${quizColor}10`,
                                  borderColor: `${quizColor}40`,
                                  color: quizColor,
                                }}
                              >
                                {quiz.icon || "📚"}
                              </div>
                            </div>

                            <h5 className="font-black text-gray-900 text-lg mb-2">
                              {quiz.title}
                            </h5>
                            <p className="text-gray-500 font-bold text-sm leading-relaxed mb-4">
                              {quiz.description}
                            </p>

                            {/* Stats */}
                            <div className="space-y-2 mb-4 text-xs font-bold">
                              <div className="flex items-center justify-between bg-indigo-50 border border-indigo-100 rounded-lg p-2">
                                <span className="text-indigo-700 flex items-center gap-1.5">
                                  <Trophy className="w-4 h-4" /> Reward XP:
                                </span>
                                <span className="text-indigo-600 font-black">
                                  +{quiz.rewardXp || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between bg-amber-50 border border-amber-100 rounded-lg p-2">
                                <span className="text-amber-700 flex items-center gap-1.5">
                                  <CyberEnergyIcon /> Minimum XP:
                                </span>
                                <span className="text-amber-600 font-black">
                                  {quiz.minXp || 0}
                                </span>
                              </div>
                              <div className="flex items-center justify-between border-t border-gray-100 pt-2">
                                <span className="text-gray-400 flex items-center gap-1.5">
                                  <BookOpen className="w-4 h-4" /> Soal:
                                </span>
                                <span className="text-gray-700">
                                  {quiz._count?.questions || 0} pertanyaan
                                </span>
                              </div>

                              {quiz.timeLimit && (
                                <div className="flex items-center justify-between">
                                  <span className="text-gray-400 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4" /> Waktu:
                                  </span>
                                  <span className="text-gray-700">
                                    {quiz.timeLimit} menit
                                  </span>
                                </div>
                              )}

                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 flex items-center gap-1.5">
                                  <Trophy className="w-4 h-4" /> Peserta:
                                </span>
                                <span className="text-gray-700">
                                  {quiz._count?.results || 0} orang
                                </span>
                              </div>

                              <div className="flex items-center justify-between">
                                <span className="text-gray-400 flex items-center gap-1.5">
                                  <CyberEnergyIcon /> Status:
                                </span>
                                <span
                                  className={
                                    isCompleted
                                      ? "text-emerald-500"
                                      : isUnlocked
                                        ? "text-indigo-500"
                                        : "text-gray-400"
                                  }
                                >
                                  {isCompleted
                                    ? "✅ Selesai"
                                    : isUnlocked
                                      ? "🔓 Terbuka"
                                      : "🔒 Terkunci"}
                                </span>
                              </div>

                              {/* Last score */}
                              {isCompleted && quiz.results[0] && (
                                <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-lg p-2 mt-3">
                                  <span className="text-emerald-700 font-black text-xs">
                                    Skor Terakhir:
                                  </span>
                                  <span className="text-emerald-600 font-black text-xl">
                                    {quiz.results[0].score}
                                  </span>
                                </div>
                              )}
                            </div>

                            {/* Action Button */}
                            {canAttemptInspectedQuiz ? (
                              <Link
                                href={`/quiz/${quiz.id}`}
                                className="block w-full"
                              >
                                <button
                                  style={{
                                    backgroundColor: quizColor,
                                    borderBottomColor: quizColor,
                                  }}
                                  className="duo-btn w-full py-3 border-b-4 rounded-xl text-white font-black text-sm hover:brightness-105 shadow-sm"
                                >
                                  {isCompleted
                                    ? "🔄 ULANGI KUIS"
                                    : "▶️ MULAI KUIS"}
                                </button>
                              </Link>
                            ) : (
                              <button className="w-full py-3 bg-gray-100 text-gray-400 font-black text-sm rounded-xl border-b-4 border-gray-200 cursor-not-allowed">
                                🔒 TERKUNCI
                              </button>
                            )}
                          </motion.div>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Bottom Footer */}
          <footer className="mt-6 flex flex-col items-center gap-4 py-8">
            <div className="h-1.5 w-16 bg-gray-100 rounded-full" />
            <p className="text-xs font-black text-gray-300 uppercase tracking-[0.2em]">
              Akhir dari Jalur Belajar
            </p>
          </footer>
        </div>
      </div>
    </DashboardLayout>
  );
}
