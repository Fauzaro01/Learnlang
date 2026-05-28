"use client";

import React, { useEffect, useMemo, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Icon } from "@iconify/react";
import AIMascot from "@/components/AIMascot";
import DashboardLayout from "@/components/DashboardLayout";
import AudioPlayer from "@/components/AudioPlayer";
import {
  DndContext,
  closestCenter,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  useDroppable,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Headphones,
  BookOpenText,
  CheckCircle2,
  Volume2,
  ChevronRight,
} from "lucide-react";

const methodConfig = {
  vocabulary: {
    title: "Vocabulary",
    description: "Pilih jawaban yang benar untuk kata dasar A1.",
    icon: BookOpenText,
    badge: "Vocabulary",
  },
  listening: {
    title: "Listening",
    description: "Dengar audio, lihat kalimat, lalu pilih kata yang tepat.",
    icon: Headphones,
    badge: "Listening",
  },
  grammar: {
    title: "Grammar",
    description: "Cari kata yang salah dan pilih perbaikannya.",
    icon: CheckCircle2,
    badge: "Grammar",
  },
};

function getMethodDisplay(method) {
  return methodConfig[method] || null;
}

function parseListeningAnswer(value) {
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return value
      .split("|")
      .map((part) => part.trim())
      .filter(Boolean);
  }
}

function createListeningItems(question) {
  let chunks = question?.chunks || [];
  if (typeof chunks === "string") {
    try {
      chunks = JSON.parse(chunks);
    } catch {
      chunks = [];
    }
  }
  if (!Array.isArray(chunks)) chunks = [];

  return chunks.map((text, index) => ({
    id: `${question?.sessionQuestionId || question?.questionId || "chunk"}-${index}`,
    text,
  }));
}

function shuffleListeningItems(items) {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function serializeListeningItems(items) {
  return JSON.stringify(items.map((item) => item.text));
}

function buildListeningBoard(question, savedAnswer) {
  const sourceItems = createListeningItems(question);
  const savedTokens = parseListeningAnswer(savedAnswer);

  if (savedTokens.length === 0) {
    return { bank: shuffleListeningItems(sourceItems), answer: [] };
  }

  const usedIndexes = new Set();
  const answer = savedTokens
    .map((token) => {
      const index = sourceItems.findIndex(
        (item, itemIndex) => !usedIndexes.has(itemIndex) && item.text === token,
      );

      if (index === -1) return null;
      usedIndexes.add(index);
      return sourceItems[index];
    })
    .filter(Boolean);

  const bank = sourceItems.filter((_, index) => !usedIndexes.has(index));

  return { bank, answer };
}

function normalizeExpectedListeningAnswer(answer) {
  const normalized = parseListeningAnswer(answer);
  return normalized;
}

function formatListeningTokens(answer) {
  return parseListeningAnswer(answer).join(" ");
}

function SortableListeningItem({ item, disabled, active, onActivate }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id, disabled });

  return (
    <button
      ref={setNodeRef}
      type="button"
      {...attributes}
      {...listeners}
      onClick={() => {
        if (!disabled) onActivate?.(item);
      }}
      className={`rounded-2xl border-2 px-4 py-3 text-sm font-semibold shadow-sm transition-all ${
        disabled
          ? "cursor-not-allowed border-slate-200 bg-slate-100 text-slate-400"
          : active
            ? "cursor-pointer border-blue-500 bg-blue-50 text-blue-700"
            : "cursor-grab border-slate-300 bg-white text-slate-800 hover:-translate-y-0.5 hover:border-blue-300 hover:shadow"
      } ${isDragging ? "opacity-50 ring-2 ring-blue-300" : ""}`}
      style={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {item.text}
    </button>
  );
}

const LISTENING_BANK_ID = "listening-bank";
const LISTENING_ANSWER_ID = "listening-answer";

function ListeningDropZone({ id, className = "", children }) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={`${className} ${isOver ? "ring-2 ring-blue-300" : ""}`}
    >
      {children}
    </div>
  );
}

export default function MethodPracticeClient({ method }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const methodStr = String(method || "").toLowerCase();
  const methodDisplay = getMethodDisplay(methodStr);
  const listeningSensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const [sessionData, setSessionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [revealed, setRevealed] = useState(false);
  const [correct, setCorrect] = useState(null);
  const [answers, setAnswers] = useState({}); // { sessionQuestionId: answer }
  const [submitting, setSubmitting] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [results, setResults] = useState(null);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [listeningBank, setListeningBank] = useState([]);
  const [listeningAnswer, setListeningAnswer] = useState([]);
  const sessionIdRef = useRef(null);

  const getProgressStorageKey = (sessionId) =>
    sessionId ? `learningProgress:${sessionId}` : null;

  const clearProgressStorage = (sessionId) => {
    if (typeof window === "undefined") return;
    const storageKey = getProgressStorageKey(sessionId);
    if (storageKey) {
      sessionStorage.removeItem(storageKey);
    }
  };

  const saveProgressStorage = (sessionId, progress) => {
    if (typeof window === "undefined") return;
    const storageKey = getProgressStorageKey(sessionId);
    if (!storageKey) return;

    sessionStorage.setItem(
      storageKey,
      JSON.stringify({
        ...progress,
        sessionId,
        method: methodStr,
        savedAt: Date.now(),
      }),
    );
  };

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Handle beforeunload to warn about losing progress
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (sessionData && !completed) {
        e.preventDefault();
        e.returnValue =
          "Jika Anda keluar, progress latihan akan hilang. Apakah Anda yakin?";
        return "Jika Anda keluar, progress latihan akan hilang. Apakah Anda yakin?";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionData, completed]);

  // Handle route protection - prevent leaving page without confirmation
  useEffect(() => {
    if (!sessionData || completed) return;

    const handlePopState = () => {
      setShowExitDialog(true);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [sessionData, completed]);

  useEffect(() => {
    if (!methodDisplay) return;

    let isActive = true;
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        // First, check if we have a session ID from sessionStorage (from /learn page)
        const storedSessionId = sessionStorage.getItem("learningSessionId");
        const storedMethod = sessionStorage.getItem("learningMethod");

        let sessionId = storedSessionId;

        // If no session in storage, create a new one
        if (!sessionId) {
          const response = await fetch("/api/learn/session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              method: methodStr,
              limit: 5,
            }),
          });
          const payload = await response.json();

          if (!response.ok || !payload?.success) {
            throw new Error(payload?.message || "Failed to load learning data");
          }

          sessionId = payload.data?.session?.id;

          // Store session info in sessionStorage
          if (typeof window !== "undefined" && sessionId) {
            sessionStorage.setItem("learningSessionId", sessionId);
            sessionStorage.setItem("learningMethod", methodStr);
          }

          if (isActive) {
            sessionIdRef.current = sessionId;
            setSessionData(payload.data);
            setCurrentIndex(0);
            setSelected(null);
            setRevealed(false);
            setCorrect(null);
            setAnswers({});
          }
        } else {
          // We have a session ID, fetch its data
          const response = await fetch(`/api/learn/session/${sessionId}`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          });
          const payload = await response.json();

          if (!response.ok || !payload?.success) {
            throw new Error(payload?.message || "Failed to load learning data");
          }

          if (isActive) {
            sessionIdRef.current = sessionId;

            const progressRaw =
              typeof window !== "undefined"
                ? sessionStorage.getItem(getProgressStorageKey(sessionId))
                : null;
            let restoredProgress = null;

            if (progressRaw) {
              try {
                restoredProgress = JSON.parse(progressRaw);
              } catch (parseError) {
                console.warn("Invalid saved progress, resetting:", parseError);
              }
            }

            const loadedAnswers = {};
            payload.data.questions.forEach((question) => {
              if (
                question.userAnswer !== undefined &&
                question.userAnswer !== null
              ) {
                loadedAnswers[question.sessionQuestionId] = question.userAnswer;
              }
            });

            const isMatchingProgress =
              restoredProgress?.sessionId === sessionId &&
              restoredProgress?.method === methodStr;

            const nextAnswers = isMatchingProgress
              ? restoredProgress.answers || loadedAnswers
              : loadedAnswers;

            const nextCurrentIndex = isMatchingProgress
              ? Math.min(
                  Math.max(restoredProgress.currentIndex ?? 0, 0),
                  Math.max(payload.data.questions.length - 1, 0),
                )
              : Math.max(
                  payload.data.questions.findIndex(
                    (question) =>
                      question.userAnswer === undefined ||
                      question.userAnswer === null,
                  ),
                  0,
                );

            const activeQuestion =
              payload.data.questions[nextCurrentIndex] ||
              payload.data.questions[0] ||
              null;

            const restoredCorrect = (() => {
              if (
                isMatchingProgress &&
                typeof restoredProgress.correct !== "undefined"
              ) {
                return !!restoredProgress.correct;
              }

              if (
                methodStr === "listening" &&
                activeQuestion?.answer !== undefined &&
                activeQuestion?.userAnswer !== undefined &&
                activeQuestion?.userAnswer !== null
              ) {
                const expected = normalizeExpectedListeningAnswer(
                  activeQuestion.answer,
                );
                const submitted = parseListeningAnswer(
                  activeQuestion.userAnswer,
                );
                return (
                  expected.length === submitted.length &&
                  expected.every((item, index) => item === submitted[index])
                );
              }

              if (
                activeQuestion?.userAnswer !== undefined &&
                activeQuestion?.userAnswer !== null
              ) {
                return activeQuestion.userAnswer === activeQuestion.answer;
              }

              return null;
            })();

            setSessionData(payload.data);
            setCurrentIndex(nextCurrentIndex);
            setSelected(
              isMatchingProgress ? (restoredProgress.selected ?? null) : null,
            );
            setRevealed(
              isMatchingProgress ? !!restoredProgress.revealed : false,
            );
            setCorrect(restoredCorrect);
            setAnswers(nextAnswers);
          }
        }
      } catch (err) {
        if (isActive) setError(err.message || "Failed to load learning data");
      } finally {
        if (isActive) setLoading(false);
      }
    };

    load();
    return () => {
      isActive = false;
    };
  }, [methodStr, methodDisplay]);

  const currentQuestion = sessionData?.questions[currentIndex];
  const total = sessionData?.session?.total || 0;
  const Icon = methodDisplay?.icon || Volume2;

  useEffect(() => {
    if (methodStr !== "listening" || !currentQuestion) return;

    const restored = buildListeningBoard(
      currentQuestion,
      answers[currentQuestion.sessionQuestionId],
    );

    setListeningBank(restored.bank);
    setListeningAnswer(restored.answer);
  }, [
    methodStr,
    currentQuestion?.sessionQuestionId,
    currentQuestion?.chunks,
    answers[currentQuestion?.sessionQuestionId],
  ]);

  const persistListeningAnswer = (questionId, answerItems) => {
    if (!questionId) return;

    const serialized = serializeListeningItems(answerItems);
    setAnswers((prev) => ({
      ...prev,
      [questionId]: serialized,
    }));

    if (sessionData?.session?.id) {
      fetch(`/api/learn/session/${sessionData.session.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [
            {
              sessionQuestionId: questionId,
              userAnswer: serialized,
            },
          ],
        }),
      }).catch((e) => console.warn("Listening autosave failed:", e));
    }
  };

  const consumeEnergyForWrongAnswer = async () => {
    if (!sessionData?.session?.id) return;

    try {
      await fetch(`/api/learn/session/${sessionData.session.id}/energy`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1 }),
      });
    } catch (error) {
      console.warn("Failed to consume energy:", error);
    }
  };

  const commitListeningBoard = (nextBank, nextAnswer) => {
    setListeningBank(nextBank);
    setListeningAnswer(nextAnswer);
    persistListeningAnswer(currentQuestion?.sessionQuestionId, nextAnswer);
  };

  const handleListeningItemActivate = (item, fromContainer) => {
    if (!currentQuestion || revealed) return;

    if (fromContainer === LISTENING_BANK_ID) {
      const nextBank = listeningBank.filter(
        (current) => current.id !== item.id,
      );
      const nextAnswer = [...listeningAnswer, item];
      commitListeningBoard(nextBank, nextAnswer);
      return;
    }

    const nextAnswer = listeningAnswer.filter(
      (current) => current.id !== item.id,
    );
    const nextBank = [...listeningBank, item];
    commitListeningBoard(nextBank, nextAnswer);
  };

  const handleListeningDragEnd = ({ active, over }) => {
    if (!over || !currentQuestion || revealed) return;
    if (active.id === over.id) return;

    const getContainer = (itemId) => {
      if (itemId === LISTENING_BANK_ID) return LISTENING_BANK_ID;
      if (itemId === LISTENING_ANSWER_ID) return LISTENING_ANSWER_ID;
      if (listeningBank.some((item) => item.id === itemId)) {
        return LISTENING_BANK_ID;
      }
      if (listeningAnswer.some((item) => item.id === itemId)) {
        return LISTENING_ANSWER_ID;
      }
      return null;
    };

    const sourceContainer = getContainer(active.id);
    const targetContainer = getContainer(over.id);

    if (!sourceContainer || !targetContainer) return;

    const sourceItems =
      sourceContainer === LISTENING_BANK_ID ? listeningBank : listeningAnswer;
    const targetItems =
      targetContainer === LISTENING_BANK_ID ? listeningBank : listeningAnswer;

    const sourceIndex = sourceItems.findIndex((item) => item.id === active.id);
    const targetIndex = targetItems.findIndex((item) => item.id === over.id);

    if (sourceIndex === -1) return;

    let nextBank = listeningBank;
    let nextAnswer = listeningAnswer;

    const insertIntoTarget = (items, movedItem, index) => {
      const safeIndex = index < 0 ? items.length : index;
      return [
        ...items.slice(0, safeIndex),
        movedItem,
        ...items.slice(safeIndex),
      ];
    };

    if (sourceContainer === targetContainer) {
      const reordered = arrayMove(
        sourceItems,
        sourceIndex,
        targetIndex < 0 ? sourceItems.length - 1 : targetIndex,
      );
      if (sourceContainer === LISTENING_BANK_ID) {
        nextBank = reordered;
      } else {
        nextAnswer = reordered;
      }
    } else {
      const movedItem = sourceItems[sourceIndex];
      const filteredSource = sourceItems.filter(
        (item) => item.id !== active.id,
      );
      const insertIndex = targetIndex < 0 ? targetItems.length : targetIndex;
      const nextTarget = insertIntoTarget(targetItems, movedItem, insertIndex);

      if (sourceContainer === LISTENING_BANK_ID) {
        nextBank = filteredSource;
        nextAnswer = nextTarget;
      } else {
        nextAnswer = filteredSource;
        nextBank = nextTarget;
      }
    }

    commitListeningBoard(nextBank, nextAnswer);
  };

  const handleListeningCheck = () => {
    if (!currentQuestion || revealed) return;

    const expected = normalizeExpectedListeningAnswer(currentQuestion.answer);
    const current = listeningAnswer.map((item) => item.text);
    const isRight =
      expected.length === current.length &&
      expected.every((item, index) => item === current[index]);

    const serialized = serializeListeningItems(listeningAnswer);

    setSelected(serialized);
    setCorrect(isRight);
    setRevealed(true);
    
    if (isRight) {
      new Audio('/correct.mp3').play().catch(e => console.error("Error playing audio", e));
    } else {
      new Audio('/incorrect.mp3').play().catch(e => console.error("Error playing audio", e));
    }

    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.sessionQuestionId]: serialized,
    }));

    if (!isRight) {
      consumeEnergyForWrongAnswer();
    }

    if (sessionData?.session?.id) {
      fetch(`/api/learn/session/${sessionData.session.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          updates: [
            {
              sessionQuestionId: currentQuestion.sessionQuestionId,
              userAnswer: serialized,
            },
          ],
        }),
      }).catch((e) => console.warn("Listening check autosave failed:", e));
    }
  };

  useEffect(() => {
    if (!sessionData?.session?.id || completed) return;

    saveProgressStorage(sessionData.session.id, {
      currentIndex,
      selected,
      revealed,
      correct,
      answers,
    });

    // periodic autosave to backend (send all answers every 10s)
    const interval = setInterval(() => {
      if (!sessionData?.session?.id) return;
      const sid = sessionData.session.id;
      const updates = Object.entries(answers || {}).map(
        ([sessionQuestionId, userAnswer]) => ({
          sessionQuestionId,
          userAnswer,
        }),
      );
      if (updates.length === 0) return;

      fetch(`/api/learn/session/${sid}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ updates }),
      }).catch((e) => console.warn("Autosave batch failed:", e));
    }, 10000);

    return () => clearInterval(interval);
  }, [
    sessionData,
    currentIndex,
    selected,
    revealed,
    correct,
    answers,
    completed,
  ]);

  const handleAnswer = (answer) => {
    if (!currentQuestion || revealed) return;
    setSelected(answer);
    const isRight = answer === currentQuestion.answer;
    setCorrect(isRight);
    setRevealed(true);

    if (isRight) {
      new Audio('/correct.mp3').play().catch(e => console.error("Error playing audio", e));
    } else {
      new Audio('/incorrect.mp3').play().catch(e => console.error("Error playing audio", e));
    }

    // Store answer
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.sessionQuestionId]: answer,
    }));

    if (!isRight) {
      consumeEnergyForWrongAnswer();
    }
    // autosave single question answer to backend
    if (sessionData?.session?.id) {
      const sid = sessionData.session.id;
      const qid = currentQuestion.sessionQuestionId;
      try {
        fetch(`/api/learn/session/${sid}/progress`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            updates: [{ sessionQuestionId: qid, userAnswer: answer }],
          }),
        }).catch((e) => console.warn("Autosave failed:", e));
      } catch (e) {
        console.warn("Autosave exception:", e);
      }
    }
  };

  const handleBackWithConfirmation = () => {
    setShowExitDialog(true);
  };

  const handleConfirmExit = async () => {
    // Delete session from database to discard progress
    if (sessionIdRef.current) {
      try {
        await fetch(`/api/learn/session/${sessionIdRef.current}`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
        });
      } catch (err) {
        console.error("Failed to delete session:", err);
      }
    }

    // Clear sessionStorage
    if (typeof window !== "undefined") {
      clearProgressStorage(sessionIdRef.current);
      sessionStorage.removeItem("learningSessionId");
      sessionStorage.removeItem("learningMethod");
    }

    setShowExitDialog(false);
    router.push("/learn");
  };

  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  const goNext = async () => {
    const next = currentIndex + 1;
    if (next >= total) {
      // Submit session
      await submitSession();
      return;
    }
    setCurrentIndex(next);
    setSelected(null);
    setRevealed(false);
    setCorrect(null);
  };

  const submitSession = async () => {
    if (!sessionData?.session?.id) return;
    setSubmitting(true);
    try {
      // ensure last autosave flush
      if (sessionData?.session?.id && Object.keys(answers || {}).length > 0) {
        try {
          await fetch(`/api/learn/session/${sessionData.session.id}/progress`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              updates: Object.entries(answers).map(
                ([sessionQuestionId, userAnswer]) => ({
                  sessionQuestionId,
                  userAnswer,
                }),
              ),
            }),
          });
        } catch (e) {
          console.warn("Final autosave failed:", e);
        }
      }
      const response = await fetch(
        `/api/learn/session/${sessionData.session.id}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ answers }),
        },
      );
      const payload = await response.json();

      if (!response.ok || !payload?.success) {
        throw new Error(payload?.message || "Failed to submit session");
      }

      // Clear sessionStorage on successful completion
      if (typeof window !== "undefined") {
        clearProgressStorage(sessionData.session.id);
        sessionStorage.removeItem("learningSessionId");
        sessionStorage.removeItem("learningMethod");
      }

      setResults(payload.data);
      setCompleted(true);

      const finalScore = payload.data.session.percentage;
      if (finalScore >= 60) {
        new Audio('/Diatasratarata.mp3').play().catch(e => console.error("Error playing audio", e));
      } else {
        new Audio('/Dibawahratarata.mp3').play().catch(e => console.error("Error playing audio", e));
      }
    } catch (err) {
      setError(err.message || "Failed to submit session");
    } finally {
      setSubmitting(false);
    }
  };

  const sentenceTokens = useMemo(() => {
    if (!currentQuestion || methodStr !== "grammar") return [];
    let words = currentQuestion.words;
    if (typeof words === "string") {
      try {
        words = JSON.parse(words);
      } catch {
        words = [];
      }
    }
    return Array.isArray(words) ? words : [];
  }, [currentQuestion, methodStr]);

  const formatTime = (seconds) => {
    if (!seconds || Number.isNaN(seconds)) return "0:00";
    const totalSeconds = Math.max(0, Math.floor(seconds));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercent = total > 0 ? ((currentIndex + 1) / total) * 100 : 0;

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F0F7FF]">
        <div className="text-xl font-black text-[#6366F1] animate-pulse">
          Memuat...
        </div>
      </div>
    );
  }

  if (!session) return null;

  if (!methodDisplay) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-[#F0F7FF] flex items-center justify-center">
          <div className="bg-white border-4 border-b-8 border-gray-200 rounded-3xl p-8 text-center shadow-lg">
            <p className="font-black text-gray-900 mb-4 text-lg">
              Metode belajar tidak ditemukan.
            </p>
            <button
              className="px-6 py-3 bg-[#6366F1] border-2 border-b-4 border-[#4338CA] text-white rounded-2xl font-black hover:bg-[#818CF8] active:translate-y-[4px] active:border-b-0 transition-all"
              onClick={() => router.push("/learn")}
            >
              ← Kembali ke Menu
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Results view
  if (completed && results) {
    const pct = results.session.percentage;
    const resultMood = pct >= 60 ? "happy" : "wrong";
    const isWin = pct >= 60;
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#EEF2FF] to-[#F5F3FF] font-[family-name:var(--font-nunito)] flex items-center justify-center p-4">
          <style
            dangerouslySetInnerHTML={{
              __html: `.duo-btn{border-bottom-width:4px;transition:all 0.1s ease}.duo-btn:hover{transform:translateY(-2px);border-bottom-width:6px}.duo-btn:active{transform:translateY(4px);border-bottom-width:0px}`,
            }}
          />
          <motion.div
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="w-full max-w-md"
          >
            <div className="bg-white border-2 border-b-[6px] border-gray-200 rounded-[2rem] overflow-hidden shadow-2xl">
              {/* Result Header */}
              <div
                className={`px-8 pt-10 pb-8 text-center relative overflow-hidden ${
                  isWin
                    ? "bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600"
                    : "bg-gradient-to-br from-rose-400 via-red-500 to-rose-600"
                }`}
              >
                <div className="absolute inset-0 opacity-10">
                  {isWin ? (
                    <div className="text-[120px] leading-none text-center select-none">
                      🏆
                    </div>
                  ) : (
                    <div className="text-[120px] leading-none text-center select-none">
                      🔄
                    </div>
                  )}
                </div>
                <div className="relative">
                  <div className="flex justify-center mb-4">
                    <AIMascot mood={resultMood} />
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
                  <p className="text-white/80 text-sm font-semibold">
                    {isWin
                      ? "Kamu berhasil menyelesaikan latihan ini!"
                      : "Jangan menyerah, terus berlatih!"}
                  </p>
                </div>
              </div>
              <div className="p-6">
                {/* Score circle */}
                <div className="flex justify-center mb-6">
                  <div
                    className={`w-28 h-28 rounded-full border-[6px] flex flex-col items-center justify-center shadow-inner ${
                      isWin
                        ? "border-emerald-400 bg-emerald-50"
                        : "border-rose-400 bg-rose-50"
                    }`}
                  >
                    <span
                      className={`text-4xl font-black leading-none ${
                        isWin ? "text-emerald-600" : "text-rose-600"
                      }`}
                    >
                      {pct}%
                    </span>
                    <span className="text-[9px] font-black text-gray-400 uppercase tracking-wider mt-0.5">
                      Skor
                    </span>
                  </div>
                </div>
                {/* Stats */}
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {[
                    {
                      icon: "solar:check-circle-bold",
                      iconClass: "text-emerald-500",
                      bg: "bg-emerald-50 border-emerald-200",
                      val: `${results.session.score}/${results.session.total}`,
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
                      icon: "solar:bolt-bold",
                      iconClass: "text-amber-500",
                      bg: "bg-amber-50 border-amber-200",
                      val: methodDisplay.badge,
                      valClass: "text-amber-600",
                      label: "Mode",
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
                    +{results.progress?.earnedXP || 0} XP
                  </div>
                </div>

                <div
                  className={`mb-5 rounded-2xl border-2 border-b-4 p-4 text-center ${
                    (results.progress?.earnedXP || 0) > 0
                      ? "border-[#A7F3D0] bg-gradient-to-br from-emerald-50 to-teal-50"
                      : "border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50"
                  }`}
                >
                  <div
                    className={`text-[10px] font-black uppercase tracking-widest ${(results.progress?.earnedXP || 0) > 0 ? "text-emerald-600" : "text-amber-700"}`}
                  >
                    Status Reward
                  </div>
                  <div
                    className={`mt-1 text-base font-black ${(results.progress?.earnedXP || 0) > 0 ? "text-emerald-700" : "text-amber-800"}`}
                  >
                    {(results.progress?.earnedXP || 0) > 0
                      ? "EXP berhasil ditambahkan"
                      : "Reward EXP sudah pernah diklaim atau 0"}
                  </div>
                  <p
                    className={`mt-1 text-xs font-bold ${(results.progress?.earnedXP || 0) > 0 ? "text-emerald-600" : "text-amber-700"}`}
                  >
                    {(results.progress?.earnedXP || 0) > 0
                      ? "Selamat, bonus EXP dari latihan ini sudah masuk ke akunmu."
                      : "Kamu tetap bisa latihan lagi, tapi bonus EXP hanya diberikan jika ada ketentuan berlaku."}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-3 flex-col sm:flex-row">
                  <button
                    className="duo-btn flex-1 py-3.5 bg-gradient-to-r from-[#6366F1] to-[#818CF8] text-white border-2 border-b-4 border-[#4338CA] rounded-2xl font-black text-sm shadow-md"
                    onClick={() => router.push("/learn")}
                  >
                    ← Kembali ke Menu
                  </button>
                  <button
                    className="duo-btn flex-1 py-3.5 bg-white text-gray-600 border-2 border-b-4 border-gray-200 rounded-2xl font-black text-sm"
                    onClick={() => window.location.reload()}
                  >
                    Ulang ↺
                  </button>
                </div>
              </div>
            </div>

            {/* Detailed results */}
            <div className="mt-5 bg-white rounded-3xl border-2 border-b-[6px] border-gray-200 shadow-sm overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-4 border-b-2 border-gray-100">
                <Icon
                  icon="solar:clipboard-list-bold"
                  className="text-xl text-indigo-500"
                />
                <h3 className="font-black text-gray-900">Pembahasan Jawaban</h3>
              </div>
              <div className="p-5 space-y-3">
                {results.results?.map((item, index) => (
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
                          Soal ke-{index + 1}
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
                              {Array.isArray(item.userAnswer) ? item.userAnswer.join(" ") : item.userAnswer || "(tidak dijawab)"}
                            </span>
                          </p>
                          {!item.isCorrect && (
                            <p className="text-gray-600">
                              Jawaban benar:{" "}
                              <span className="text-emerald-700">
                                {Array.isArray(item.correctAnswer) ? item.correctAnswer.join(" ") : item.correctAnswer}
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

  const mascotMood = revealed ? (correct ? "happy" : "wrong") : "neutral";

  return (
    <DashboardLayout>
      <div className="flex-1 flex flex-col min-h-screen bg-gradient-to-br from-[#F0F7FF] via-[#EEF2FF] to-[#F5F3FF] font-[family-name:var(--font-nunito)]">
        <style
          dangerouslySetInnerHTML={{
            __html: `
          .duo-btn{border-bottom-width:4px;transition:all 0.1s ease}
          .duo-btn:hover{transform:translateY(-2px);border-bottom-width:6px}
          .duo-btn:active{transform:translateY(4px);border-bottom-width:0px}
          .cloud-bg{position:absolute;background:white;border-radius:999px;opacity:0.7;border:3px solid #E2E8F0}
        `,
          }}
        />
        <div className="absolute inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="cloud-bg w-48 h-16 top-12 -left-12 shadow-sm animate-[bounce_4s_infinite]" />
          <div className="cloud-bg w-64 h-20 top-32 -right-16 shadow-sm animate-[bounce_5s_infinite]" />
        </div>

        <div className="max-w-5xl w-full mx-auto px-2 sm:px-6 py-2 md:py-4 relative z-10 flex-1 flex flex-col pb-8">
          <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Keluar dari Latihan?</AlertDialogTitle>
                <AlertDialogDescription>
                  Progress latihan akan hilang jika kamu keluar. Apakah kamu
                  yakin?
                </AlertDialogDescription>
              </AlertDialogHeader>
              <div className="flex gap-3 justify-end">
                <AlertDialogCancel
                  onClick={handleCancelExit}
                  className="rounded-lg"
                >
                  Batal
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleConfirmExit}
                  className="bg-red-600 hover:bg-red-700 rounded-lg"
                >
                  Keluar &amp; Hapus Progress
                </AlertDialogAction>
              </div>
            </AlertDialogContent>
          </AlertDialog>

          {/* Top bar */}
          <div className="flex items-center gap-2 mb-2 bg-white/80 backdrop-blur-sm rounded-xl p-2 border-2 border-white shadow-sm shrink-0">
            <button
              onClick={handleBackWithConfirmation}
              className="duo-btn flex items-center gap-1 px-2 py-1.5 bg-white border-2 border-b-[3px] border-gray-200 rounded-lg font-black text-gray-600 text-[10px] sm:text-xs hover:bg-gray-50 shrink-0"
            >
              <ArrowLeft className="w-3 h-3 sm:w-3.5 sm:h-3.5" />{" "}
              <span className="hidden sm:inline">Keluar</span>
            </button>
            <div className="flex-1 space-y-1 sm:space-y-1.5 px-2">
              <div className="flex items-center gap-1">
                {Array.from({ length: total }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 sm:h-2 flex-1 rounded-full transition-all duration-300 ${
                      i < currentIndex
                        ? "bg-[#10B981]"
                        : i === currentIndex
                          ? "bg-gradient-to-r from-[#6366F1] to-[#818CF8] animate-pulse"
                          : "bg-gray-200"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {loading && (
            <div className="flex justify-center py-20">
              <div className="text-xl font-black text-[#6366F1] animate-pulse">
                Memuat soal...
              </div>
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-4 border-red-300 rounded-3xl p-6 text-center">
              <p className="font-black text-red-700">{error}</p>
            </div>
          )}

          {!loading && !error && currentQuestion && sessionData && (
            <div className="grid lg:grid-cols-12 gap-3 sm:gap-6 items-start flex-1 pb-1">
              {/* Mascot column */}
              <div className="hidden lg:flex lg:col-span-4 flex-col items-center justify-start gap-4 bg-white/50 border-2 border-white/80 rounded-3xl p-6 shadow-sm sticky top-4">
                <AIMascot mood={mascotMood} />
                <AnimatePresence>
                  {revealed && (
                    <motion.div
                      key={`feedback-${currentIndex}`}
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
                          {correct ? "Analisis AI Tepat!" : "Bukan yang itu!"}
                        </span>
                      </div>
                      <p
                        className="text-xs font-bold leading-relaxed"
                        style={{ color: correct ? "#047857" : "#E53935" }}
                      >
                        {correct
                          ? "Jawaban kamu benar! 👍"
                          : methodStr === "listening"
                            ? `Jawaban benar: ${formatListeningTokens(currentQuestion.answer)}`
                            : `Jawaban benar: ${currentQuestion.answer}`}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Question panel */}
              <div className="col-span-12 lg:col-span-8 flex flex-col">
                <div className="bg-white border-2 border-b-[4px] sm:border-b-[6px] border-gray-200 rounded-2xl sm:rounded-3xl p-3 sm:p-5 shadow-sm flex flex-col gap-3">
                  {/* Scrollable contents inside the card */}
                  <div className="flex flex-col gap-3">
                    {/* Instruction badge */}
                    <div className="hidden lg:flex bg-[#E0E7FF] border-2 border-[#818CF8] rounded-2xl p-3 items-center gap-3">
                      <div className="hidden lg:block shrink-0">
                        <svg
                          className="w-5 h-5 text-[#0288D1]"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M12 20H21M3 17.25V21H6.75L17.81 9.94L14.06 6.19L3 17.25ZM20.71 7.04C21.1 6.65 21.1 6.02 20.71 5.63L18.37 3.29C17.98 2.9 17.35 2.9 16.96 3.29L15.13 5.12L18.88 8.87L20.71 7.04Z"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </div>
                      <div>
                        <h4 className="font-black text-[#4338CA] text-[10px] sm:text-xs tracking-wider uppercase">
                          Detektif AI:
                        </h4>
                        <p className="text-[#3730A3] font-black text-sm leading-tight mt-0.5">
                          {methodStr === "vocabulary" &&
                            "Pilih arti kata yang benar!"}
                          {methodStr === "listening" &&
                            "Susun kata sesuai kalimat yang kamu dengar!"}
                          {methodStr === "grammar" &&
                            "Temukan & klik 1 kata yang salah!"}
                        </p>
                      </div>
                    </div>

                    {/* Mobile Feedback */}
                    {revealed && (
                      <div className="block lg:hidden mb-4 shrink-0">
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className="rounded-2xl p-3 border-2 text-center bg-white shadow-sm"
                          style={{
                            borderColor: correct ? "#A8E6CF" : "#EA2B2B",
                          }}
                        >
                          <div className="flex items-center justify-center gap-1.5 mb-0.5">
                            <span
                              className="font-black text-xs"
                              style={{ color: correct ? "#059669" : "#C62828" }}
                            >
                              {correct
                                ? "✓ Analisis AI Tepat!"
                                : "✗ Bukan yang itu!"}
                            </span>
                          </div>
                          <p
                            className="text-[11px] font-bold"
                            style={{ color: correct ? "#047857" : "#E53935" }}
                          >
                            {correct
                              ? "Jawaban kamu benar! 👍"
                              : methodStr === "listening"
                                ? `Jawaban benar: ${formatListeningTokens(currentQuestion.answer)}`
                                : `Jawaban benar: ${currentQuestion.answer}`}
                          </p>
                        </motion.div>
                      </div>
                    )}

                    {/* VOCABULARY */}
                    {methodStr === "vocabulary" && (
                      <>
                        <div className="rounded-3xl bg-white/90 backdrop-blur-md border border-gray-200 p-6 text-center shadow-lg relative overflow-hidden">
                          <div className="absolute top-2 right-3 text-4xl opacity-10 font-black select-none">
                            🔤
                          </div>
                          <p className="text-[10px] font-black text-[#6366F1] uppercase tracking-widest mb-1.5 opacity-70">
                            Apa arti kata ini?
                          </p>
                          <p className="text-3xl sm:text-4xl font-black text-[#1E1B4B] tracking-tight">
                            {currentQuestion.question}
                          </p>
                        </div>
                        <div className="grid gap-2.5 sm:grid-cols-2">
                          {Object.entries(
                            typeof currentQuestion.options === "string"
                              ? JSON.parse(currentQuestion.options)
                              : currentQuestion.options || {},
                          ).map(([key, value]) => {
                            const isSel = selected === key;
                            const isCorrectAnswer =
                              revealed && currentQuestion.answer === key;
                            return (
                              <button
                                key={key}
                                type="button"
                                onClick={() => !revealed && handleAnswer(key)}
                                disabled={revealed}
                                className={`px-4 py-3 rounded-2xl font-bold text-xs sm:text-sm transition-all duration-200 text-left flex items-center gap-3 w-full border-2 group
                                  ${!revealed ? "bg-white border-gray-200 text-gray-700 hover:border-[#6366F1] hover:bg-[#EEF2FF] hover:scale-[1.01] shadow-sm cursor-pointer border-b-[4px] active:translate-y-[2px] active:border-b-[2px]" : ""}
                                  ${isSel && correct ? "bg-emerald-50 border-emerald-400 border-b-[4px] text-emerald-700" : ""}
                                  ${isSel && !correct ? "bg-red-50 border-red-400 border-b-[4px] text-red-700" : ""}
                                  ${isCorrectAnswer && !isSel ? "bg-emerald-50 border-emerald-300 border-b-[4px] text-emerald-600" : ""}
                                  ${revealed && !isSel && !isCorrectAnswer ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed" : ""}
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
                                          : isCorrectAnswer
                                            ? "bg-emerald-300 text-white"
                                            : "bg-gray-100 text-gray-300"
                                  }`}
                                >
                                  {key}
                                </span>
                                <span className="flex-1 leading-snug">
                                  {value}
                                </span>
                                {isSel && correct && (
                                  <span className="text-emerald-500 text-base">
                                    ✓
                                  </span>
                                )}
                                {isSel && !correct && (
                                  <span className="text-red-400 text-base">
                                    ✗
                                  </span>
                                )}
                                {isCorrectAnswer && !isSel && (
                                  <span className="text-emerald-400 text-xs font-black">
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}

                    {/* LISTENING */}
                    {methodStr === "listening" && (
                      <>
                        <div className="mb-4">
                          <AudioPlayer
                            text={currentQuestion.sentences}
                            title="Listening Sentence"
                            subtitle="Pilih normal untuk kecepatan biasa atau slow untuk versi lebih lambat"
                          />
                        </div>
                        <DndContext
                          sensors={listeningSensors}
                          collisionDetection={closestCenter}
                          onDragEnd={handleListeningDragEnd}
                        >
                          <div className="space-y-4">
                            <div className="rounded-3xl border-2 border-[#6366F1]/30 bg-[#E0E7FF]/40 p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-[#4338CA] uppercase tracking-wider">
                                  Jawaban Kamu
                                </p>
                                <span className="px-2 py-0.5 rounded-lg bg-[#6366F1]/10 border-2 border-[#6366F1]/20 text-[10px] font-black text-[#6366F1]">
                                  {listeningAnswer.length}/
                                  {
                                    normalizeExpectedListeningAnswer(
                                      currentQuestion.answer,
                                    ).length
                                  }
                                </span>
                              </div>
                              <SortableContext
                                items={listeningAnswer.map((i) => i.id)}
                              >
                                <ListeningDropZone
                                  id={LISTENING_ANSWER_ID}
                                  className="flex flex-wrap gap-2 min-h-16 rounded-2xl border-2 border-dashed border-[#6366F1]/30 bg-white p-3"
                                >
                                  {listeningAnswer.length > 0 ? (
                                    listeningAnswer.map((item) => (
                                      <SortableListeningItem
                                        key={item.id}
                                        item={item}
                                        disabled={revealed}
                                        active={true}
                                        onActivate={(w) =>
                                          handleListeningItemActivate(
                                            w,
                                            LISTENING_ANSWER_ID,
                                          )
                                        }
                                      />
                                    ))
                                  ) : (
                                    <p className="text-xs text-gray-400 self-center">
                                      Tarik atau klik kata ke sini…
                                    </p>
                                  )}
                                </ListeningDropZone>
                              </SortableContext>
                            </div>
                            <div className="rounded-3xl border-2 border-gray-200 bg-white p-4 space-y-2">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-black text-gray-500 uppercase tracking-wider">
                                  Word Bank
                                </p>
                                <span className="px-2 py-0.5 rounded-lg bg-gray-100 border-2 border-gray-200 text-[10px] font-black text-gray-500">
                                  {listeningBank.length} kata
                                </span>
                              </div>
                              <SortableContext
                                items={listeningBank.map((i) => i.id)}
                              >
                                <ListeningDropZone
                                  id={LISTENING_BANK_ID}
                                  className="flex flex-wrap gap-2 min-h-16 rounded-2xl border-2 border-dashed border-gray-200 bg-slate-50 p-3"
                                >
                                  {listeningBank.length > 0 ? (
                                    listeningBank.map((item) => (
                                      <SortableListeningItem
                                        key={item.id}
                                        item={item}
                                        disabled={revealed}
                                        active={false}
                                        onActivate={(w) =>
                                          handleListeningItemActivate(
                                            w,
                                            LISTENING_BANK_ID,
                                          )
                                        }
                                      />
                                    ))
                                  ) : (
                                    <p className="text-xs text-gray-400 self-center">
                                      Semua kata sudah dipindahkan.
                                    </p>
                                  )}
                                </ListeningDropZone>
                              </SortableContext>
                            </div>
                          </div>
                        </DndContext>
                      </>
                    )}

                    {/* GRAMMAR */}
                    {methodStr === "grammar" && (
                      <>
                        <div className="rounded-3xl border-2 border-gray-200 bg-gradient-to-br from-white to-slate-50 p-5 mb-4 shadow-[0_4px_0_#E2E8F0]">
                          <div className="flex flex-wrap gap-2 justify-center">
                            {sentenceTokens.map((word, index) => (
                              <span
                                key={`${word}-${index}`}
                                className={`rounded-xl px-3 py-1.5 text-sm font-black transition-all
                                  ${revealed && index === currentQuestion.wrongIndex ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-400" : ""}
                                  ${!revealed && index === currentQuestion.wrongIndex ? "bg-amber-100 text-amber-700 ring-2 ring-amber-300 animate-pulse" : ""}
                                  ${index !== currentQuestion.wrongIndex ? "bg-white text-gray-700 border-2 border-gray-200" : ""}
                                `}
                              >
                                {word}
                              </span>
                            ))}
                          </div>
                          <p className="text-center text-[10px] font-bold text-gray-400 mt-3">
                            Pilih kata yang salah dari pilihan di bawah
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5">
                          {(typeof currentQuestion.choices === "string"
                            ? JSON.parse(currentQuestion.choices)
                            : currentQuestion.choices || []
                          ).map((choice) => {
                            const isSel = selected === choice;
                            const isCorrectChoice =
                              revealed && choice === currentQuestion.answer;
                            return (
                              <button
                                key={choice}
                                type="button"
                                onClick={() => handleAnswer(choice)}
                                disabled={revealed}
                                className={`py-3.5 px-4 rounded-2xl font-black text-sm transition-all duration-200 text-center w-full border-2 flex items-center justify-center gap-2
                                  ${
                                    !revealed
                                      ? "bg-white border-gray-200 text-gray-700 hover:bg-[#EEF2FF] hover:border-[#6366F1] hover:text-[#4338CA] shadow-sm cursor-pointer border-b-[4px] active:translate-y-[2px] active:border-b-[2px]"
                                      : ""
                                  }
                                  ${isSel && correct ? "bg-emerald-50 border-emerald-500 border-b-[4px] text-emerald-700" : ""}
                                  ${isSel && !correct ? "bg-red-50 border-red-500 border-b-[4px] text-red-700" : ""}
                                  ${isCorrectChoice && !isSel ? "bg-emerald-50 border-emerald-400 border-b-[4px] text-emerald-600" : ""}
                                  ${revealed && !isSel && !isCorrectChoice ? "bg-gray-50 border-gray-200 text-gray-400 opacity-50 cursor-not-allowed border-b-2" : ""}
                                `}
                              >
                                <span
                                  className={`text-lg leading-none shrink-0
                                  ${isSel && correct ? "text-emerald-500" : ""}
                                  ${isSel && !correct ? "text-red-400" : ""}
                                  ${isCorrectChoice && !isSel ? "text-emerald-400" : ""}
                                  ${!revealed || (revealed && !isSel && !isCorrectChoice) ? "text-gray-400" : ""}
                                `}
                                >
                                  •
                                </span>
                                <span className="leading-snug">{choice}</span>
                                {isSel && correct && (
                                  <span className="text-emerald-500 shrink-0 text-base">
                                    ✓
                                  </span>
                                )}
                                {isSel && !correct && (
                                  <span className="text-red-400 shrink-0 text-base">
                                    ✗
                                  </span>
                                )}
                                {isCorrectChoice && !isSel && (
                                  <span className="text-emerald-400 shrink-0 text-xs font-black">
                                    ✓
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Footer: Check/Next Button */}
                  <div className="pt-3 border-t border-gray-100">
                    {methodStr === "listening" ? (
                      <button
                        type="button"
                        className={`duo-btn w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm border-2 border-b-4 text-white transition-all ${
                          !revealed
                            ? "bg-[#6366F1] border-[#4338CA] hover:bg-[#818CF8]"
                            : correct
                              ? "bg-[#10B981] border-[#047857] hover:bg-[#34D399]"
                              : "bg-[#EA2B2B] border-[#B71C1C] hover:bg-[#FF4D4D]"
                        }`}
                        onClick={!revealed ? handleListeningCheck : goNext}
                        disabled={
                          (!revealed && listeningAnswer.length === 0) ||
                          submitting
                        }
                      >
                        {submitting
                          ? "Mengirim…"
                          : !revealed
                            ? "Periksa Jawaban ✓"
                            : currentIndex === total - 1
                              ? "Selesaikan & Lihat Hasil 🏆"
                              : "Soal Berikutnya →"}
                      </button>
                    ) : (
                      <motion.button
                        initial={false}
                        animate={revealed ? { scale: [0.97, 1] } : {}}
                        transition={{ duration: 0.2 }}
                        className={`duo-btn w-full py-3.5 rounded-2xl font-black text-xs sm:text-sm border-2 border-b-4 text-white transition-all flex items-center justify-center gap-2
                          ${
                            !revealed
                              ? "bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed"
                              : correct
                                ? "bg-gradient-to-r from-[#10B981] to-[#059669] border-[#047857] hover:opacity-90 shadow-md"
                                : "bg-gradient-to-r from-[#EA2B2B] to-[#C62828] border-[#B71C1C] hover:opacity-90 shadow-md"
                          }
                        `}
                        onClick={goNext}
                        disabled={!revealed || submitting}
                      >
                        {submitting
                          ? "Mengirim…"
                          : !revealed
                            ? "Pilih jawaban dulu"
                            : currentIndex === total - 1
                              ? "🏆 Selesaikan & Lihat Hasil"
                              : "Soal Berikutnya →"}
                      </motion.button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
