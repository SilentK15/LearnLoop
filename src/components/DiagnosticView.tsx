"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  Sparkles,
  Trophy,
  Dices,
  Flame,
  Globe,
  Compass,
} from "lucide-react";
import confetti from "canvas-confetti";

interface DiagnosticItem {
  conceptId: string;
  conceptName: string;
  conceptOrder: number;
  subjectName?: string;
  subjectSlug?: string;
  currentMastery: number;
  question: {
    id: string;
    text: string;
    options: string[];
    difficulty: number;
  } | null;
}

interface DiagnosticViewProps {
  onDiagnosticComplete: () => void;
  onRefreshProfile: () => void;
  selectedSubjectSlug?: string;
  selectedSubjectName?: string;
}

const DIFFICULTY_LABELS: Record<
  number,
  { label: string; color: string; badge: string }
> = {
  1: { label: "LVL 1 - SLIME (EASY)", color: "#00ff66", badge: "SLIME" },
  2: { label: "LVL 2 - GOBLIN (MEDIUM)", color: "#00ffcc", badge: "GOBLIN" },
  3: { label: "LVL 3 - KNIGHT (HARD)", color: "#ffcc00", badge: "KNIGHT" },
  4: { label: "LVL 4 - DRAGON (EXPERT)", color: "#ff8800", badge: "DRAGON" },
  5: { label: "LVL 5 - BOSS (MASTER)", color: "#ff0055", badge: "BOSS" },
};

export function DiagnosticView({
  onDiagnosticComplete,
  onRefreshProfile,
  selectedSubjectSlug,
  selectedSubjectName,
}: DiagnosticViewProps) {
  const [scope, setScope] = useState<"subject" | "all">("subject");
  const [items, setItems] = useState<DiagnosticItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [attemptResult, setAttemptResult] = useState<any | null>(null);
  const [answersHistory, setAnswersHistory] = useState<
    Array<{
      questionId: string;
      isCorrect: boolean;
      conceptName: string;
      difficulty: number;
    }>
  >([]);
  const [isFinished, setIsFinished] = useState<boolean>(false);

  const fetchDiagnostic = async (targetScope: "subject" | "all" = scope) => {
    try {
      setLoading(true);
      let studentEmail = "";
      try {
        const stored =
          localStorage.getItem("learnloop_session") ||
          localStorage.getItem("hackstreak_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email) studentEmail = parsed.email;
        }
      } catch {}

      const params = new URLSearchParams();
      if (targetScope === "all") {
        params.set("subject", "all");
      } else if (selectedSubjectSlug) {
        params.set("subject", selectedSubjectSlug);
      }
      if (studentEmail) params.set("studentEmail", studentEmail);
      params.set("limit", "20");

      const url = `/api/diagnostic?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.diagnosticQuestions) {
        setItems(data.diagnosticQuestions);
        setCurrentIndex(0);
        setSelectedOption(null);
        setAttemptResult(null);
        setAnswersHistory([]);
        setIsFinished(false);
      }
    } catch (err) {
      console.error("Failed to load stat trial:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostic(scope);
  }, [selectedSubjectSlug, scope]);

  const currentItem = items[currentIndex];

  const handleSubmit = async () => {
    if (!selectedOption || !currentItem?.question || isSubmitting) return;

    try {
      setIsSubmitting(true);
      let studentEmail = "";
      try {
        const stored =
          localStorage.getItem("learnloop_session") ||
          localStorage.getItem("hackstreak_session");
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed.email) studentEmail = parsed.email;
        }
      } catch {}

      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentItem.question.id,
          selectedAnswer: selectedOption,
          studentEmail: studentEmail || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAttemptResult(data);
      setAnswersHistory((prev) => [
        ...prev,
        {
          questionId: currentItem.question!.id,
          isCorrect: data.isCorrect,
          conceptName: currentItem.conceptName,
          difficulty: currentItem.question!.difficulty,
        },
      ]);

      if (data.isCorrect) {
        confetti({ particleCount: 45, spread: 65, origin: { y: 0.65 } });
      }

      onRefreshProfile();
    } catch (err) {
      console.error(err);
      alert("Submission error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setAttemptResult(null);
    setSelectedOption(null);
    if (currentIndex + 1 < items.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      setIsFinished(true);
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[55vh] gap-4 p-8 text-center">
        <div className="w-12 h-12 border-4 border-[#00ffcc] border-t-transparent animate-spin shadow-[0_0_15px_rgba(0,255,204,0.4)]" />
        <p className="font-pixel text-xs text-[#00ffcc] animate-pulse">
          INITIALIZING 20-QUESTION STAT TRIAL...
        </p>
        <p className="font-vt323 text-lg text-stone-400">
          Rolling random calibrated encounters across all tests to evaluate student ability...
        </p>
      </div>
    );
  }

  if (items.length === 0 || (!currentItem?.question && !isFinished)) {
    return (
      <div className="text-center py-16 px-4 bg-[#1e1e24] border-4 border-[#38384a] shadow-[6px_6px_0px_0px_#000] max-w-xl mx-auto space-y-4">
        <p className="font-pixel text-xs text-[#ff0055]">
          STAT TRIAL QUESTIONS NOT FOUND
        </p>
        <p className="font-vt323 text-lg text-stone-400">
          No question pool available for this realm selection.
        </p>
        <button
          onClick={() => fetchDiagnostic()}
          className="px-5 py-2.5 bg-[#00ffcc] hover:bg-[#00e6b8] text-black font-pixel text-xs border-2 border-black shadow-[3px_3px_0px_0px_#000]"
        >
          RETRY LOAD
        </button>
      </div>
    );
  }

  // --- STAT TRIAL FINISHED VIEW ---
  if (isFinished) {
    const totalCount = items.length;
    const correctCount = answersHistory.filter((a) => a.isCorrect).length;
    const accuracy = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0;

    let rank = "C-RANK";
    let rankColor = "#ffcc00";
    if (accuracy >= 90) {
      rank = "S-RANK (LEGENDARY)";
      rankColor = "#00ffcc";
    } else if (accuracy >= 75) {
      rank = "A-RANK (CHAMPION)";
      rankColor = "#00ff66";
    } else if (accuracy >= 55) {
      rank = "B-RANK (WARRIOR)";
      rankColor = "#ffcc00";
    } else {
      rank = "C-RANK (APPRENTICE)";
      rankColor = "#ff0055";
    }

    return (
      <div className="max-w-3xl mx-auto space-y-6 pb-20">
        <div className="p-6 md:p-8 bg-[#1e1e24] border-4 border-[#00ffcc] shadow-[8px_8px_0px_0px_#000] text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121216] border-2 border-[#00ffcc] font-pixel text-[10px] text-[#00ffcc]">
            <Trophy className="w-4 h-4 text-[#ffcc00]" />
            STAT TRIAL COMPLETED
          </div>

          <h2 className="font-pixel text-xl md:text-2xl text-white tracking-wide">
            EVALUATION REPORT
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 bg-[#121216] border-2 border-[#38384a] shadow-[3px_3px_0px_0px_#000]">
              <div className="font-pixel text-[9px] text-stone-400">SCORE</div>
              <div className="font-pixel text-2xl text-[#00ffcc] mt-2">
                {correctCount} / {totalCount}
              </div>
              <div className="font-vt323 text-base text-stone-400">
                Encounters Cleared
              </div>
            </div>

            <div className="p-4 bg-[#121216] border-2 border-[#38384a] shadow-[3px_3px_0px_0px_#000]">
              <div className="font-pixel text-[9px] text-stone-400">ACCURACY</div>
              <div className="font-pixel text-2xl text-[#00ff66] mt-2">
                {accuracy}%
              </div>
              <div className="font-vt323 text-base text-stone-400">
                Precision Rate
              </div>
            </div>

            <div className="p-4 bg-[#121216] border-2 border-[#38384a] shadow-[3px_3px_0px_0px_#000]">
              <div className="font-pixel text-[9px] text-stone-400">TRIAL RANK</div>
              <div
                className="font-pixel text-xs mt-2.5 py-1 px-2 border-2 border-black inline-block shadow-[2px_2px_0px_0px_#000]"
                style={{ backgroundColor: rankColor, color: "#000" }}
              >
                {rank}
              </div>
              <div className="font-vt323 text-base text-stone-400 mt-1">
                Ability Benchmark
              </div>
            </div>
          </div>

          {/* Stepper summary */}
          <div className="p-4 bg-[#121216] border-2 border-[#38384a] space-y-2">
            <div className="flex items-center justify-between font-pixel text-[9px] text-stone-400">
              <span>ENCOUNTER RECORD</span>
              <span>{correctCount} VICTORY • {totalCount - correctCount} DEFEAT</span>
            </div>
            <div className="grid grid-cols-10 sm:grid-cols-20 gap-1.5 pt-1">
              {answersHistory.map((h, i) => (
                <div
                  key={i}
                  title={`Q${i + 1}: ${h.conceptName} (${h.isCorrect ? "Correct" : "Incorrect"})`}
                  className={`h-5 border border-black flex items-center justify-center font-pixel text-[8px] ${
                    h.isCorrect
                      ? "bg-[#00ff66] text-black"
                      : "bg-[#ff0055] text-white"
                  }`}
                >
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-4 border-t-2 border-[#38384a]">
            <button
              onClick={() => fetchDiagnostic()}
              className="flex items-center gap-2 px-5 py-3 bg-[#00ffcc] hover:bg-[#00e6b8] text-black font-pixel text-xs border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]"
            >
              <Dices className="w-4 h-4" />
              START NEW TRIAL (RANDOM 20 Qs)
            </button>

            <button
              onClick={onDiagnosticComplete}
              className="flex items-center gap-2 px-5 py-3 bg-[#121216] hover:bg-[#252530] text-[#00ffcc] font-pixel text-xs border-2 border-[#00ffcc] shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]"
            >
              <Compass className="w-4 h-4" />
              RETURN TO QUEST DASHBOARD
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentItem?.question) {
    return null;
  }

  // Parse options
  const q = currentItem.question;
  const options = Array.isArray(q.options)
    ? q.options
    : typeof q.options === "string"
    ? JSON.parse(q.options)
    : [];

  const diffConfig =
    DIFFICULTY_LABELS[q.difficulty] ||
    DIFFICULTY_LABELS[2];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* 1. Stat Trial Mode Header & Scope Selector */}
      <div className="p-4 bg-[#1e1e24] border-4 border-[#38384a] shadow-[6px_6px_0px_0px_#000] space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="font-pixel text-xs text-[#00ffcc] flex items-center gap-1.5">
              <Flame className="w-4 h-4 text-[#ff0055]" />
              STAT TRIAL
            </span>
            <span className="font-pixel text-[9px] bg-[#121216] text-stone-300 px-2 py-0.5 border border-[#38384a]">
              20 RANDOM QUESTIONS
            </span>
          </div>

          {/* Scope Toggle & Re-Roll Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const nextScope = scope === "subject" ? "all" : "subject";
                setScope(nextScope);
                fetchDiagnostic(nextScope);
              }}
              title="Toggle evaluation pool scope"
              className="flex items-center gap-1 px-2.5 py-1 bg-[#121216] hover:bg-[#252530] border-2 border-[#38384a] font-pixel text-[8px] text-[#00ffcc]"
            >
              <Globe className="w-3 h-3 text-[#00ffcc]" />
              {scope === "all" ? "GRAND REALM (ALL)" : `${selectedSubjectName || "CURRENT"} REALM`}
            </button>

            <button
              onClick={() => fetchDiagnostic()}
              title="Re-roll fresh 20 random questions"
              className="flex items-center gap-1 px-2.5 py-1 bg-[#121216] hover:bg-[#252530] border-2 border-[#38384a] font-pixel text-[8px] text-[#ffcc00]"
            >
              <Dices className="w-3 h-3 text-[#ffcc00]" />
              RE-ROLL
            </button>
          </div>
        </div>

        {/* 20-segment pixel HP / Progress Bar */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between font-pixel text-[9px]">
            <span className="text-stone-300">
              STAGE {currentIndex + 1} / {items.length}
            </span>
            <span className="text-[#00ff66]">
              {answersHistory.filter((a) => a.isCorrect).length} CLEARED
            </span>
          </div>

          <div className="grid grid-cols-10 sm:grid-cols-20 gap-1">
            {items.map((_, idx) => {
              const answered = answersHistory[idx];
              const isCurrent = idx === currentIndex;
              let bg = "bg-[#121216] border-[#38384a]";
              if (answered) {
                bg = answered.isCorrect
                  ? "bg-[#00ff66] border-[#00cc52]"
                  : "bg-[#ff0055] border-[#cc0044]";
              } else if (isCurrent) {
                bg = "bg-[#00ffcc] border-white animate-pulse shadow-[0_0_8px_rgba(0,255,204,0.6)]";
              }

              return (
                <div
                  key={idx}
                  className={`h-2.5 border-2 transition-all ${bg}`}
                />
              );
            })}
          </div>
        </div>
      </div>

      {/* 2. Main Encounter Card */}
      <div className="p-6 md:p-8 bg-[#1e1e24] border-4 border-[#00ffcc] shadow-[8px_8px_0px_0px_#000] space-y-6">
        {/* Topic & Difficulty Meta */}
        <div className="flex flex-wrap items-center justify-between gap-2 pb-4 border-b-2 border-[#38384a]">
          <div className="flex flex-wrap items-center gap-2">
            {currentItem.subjectName && (
              <span className="px-2 py-0.5 bg-[#121216] border border-[#00ffcc] text-[#00ffcc] font-pixel text-[9px]">
                {currentItem.subjectName.toUpperCase()}
              </span>
            )}
            <span className="px-2 py-0.5 bg-[#121216] border border-[#38384a] text-stone-300 font-pixel text-[9px]">
              TOPIC: {currentItem.conceptName}
            </span>
          </div>

          <span
            className="px-2 py-0.5 font-pixel text-[8px] border-2 border-black"
            style={{
              backgroundColor: diffConfig.color,
              color: "#000000",
            }}
          >
            {diffConfig.label}
          </span>
        </div>

        {/* Question Text */}
        <div className="bg-[#121216] p-4 border-2 border-[#38384a]">
          <p className="font-pixel text-[11px] text-[#00ffcc] mb-2 tracking-wider">
            MISSION OBJECTIVE:
          </p>
          <h3 className="font-vt323 text-2xl md:text-3xl text-white leading-relaxed">
            {currentItem.question.text}
          </h3>
        </div>

        {/* Options Grid */}
        <div className="space-y-3">
          {options.map((opt: string, idx: number) => {
            const isSelected = selectedOption === opt;
            const isSubmitted = !!attemptResult;
            const isCorrectAnswer =
              isSubmitted &&
              attemptResult.correctAnswer &&
              opt.trim().toLowerCase() ===
                attemptResult.correctAnswer.trim().toLowerCase();
            const isWrongSelection =
              isSubmitted && isSelected && !attemptResult.isCorrect;

            let cardStyles =
              "bg-[#121216] border-[#38384a] text-stone-200 hover:border-[#00ffcc] hover:bg-[#252530]";
            if (isSelected && !isSubmitted) {
              cardStyles =
                "bg-[#252530] border-[#00ffcc] text-[#00ffcc] shadow-[0_0_12px_rgba(0,255,204,0.3)]";
            }
            if (isCorrectAnswer) {
              cardStyles =
                "bg-[#0a2e1d] border-[#00ff66] text-[#00ff66] shadow-[0_0_12px_rgba(0,255,102,0.3)]";
            }
            if (isWrongSelection) {
              cardStyles =
                "bg-[#2e0a14] border-[#ff0055] text-[#ff0055] shadow-[0_0_12px_rgba(255,0,85,0.3)]";
            }

            return (
              <button
                key={idx}
                disabled={isSubmitted || isSubmitting}
                onClick={() => setSelectedOption(opt)}
                className={`w-full text-left p-3.5 md:p-4 border-2 font-vt323 text-xl md:text-2xl transition-all flex items-center justify-between shadow-[3px_3px_0px_0px_#000] active:translate-x-[1px] active:translate-y-[1px] disabled:cursor-not-allowed ${cardStyles}`}
              >
                <div className="flex items-center gap-3">
                  <span className="font-pixel text-[9px] text-stone-500 w-5">
                    [{String.fromCharCode(65 + idx)}]
                  </span>
                  <span>{opt}</span>
                </div>
                {isCorrectAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-[#00ff66] shrink-0" />
                )}
                {isWrongSelection && (
                  <XCircle className="w-5 h-5 text-[#ff0055] shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Live Mastery Delta Feedback */}
        {attemptResult && (
          <div
            className={`p-4 border-2 shadow-[4px_4px_0px_0px_#000] space-y-2 ${
              attemptResult.isCorrect
                ? "bg-[#0a2e1d] border-[#00ff66]"
                : "bg-[#2e0a14] border-[#ff0055]"
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2 font-pixel text-[10px]">
              <span
                className={`font-bold ${
                  attemptResult.isCorrect ? "text-[#00ff66]" : "text-[#ff0055]"
                }`}
              >
                {attemptResult.isCorrect ? "ACTION SUCCESSFUL!" : "TARGET MISSED!"}
              </span>
              <span className="text-stone-300">
                MASTERY:{" "}
                <strong>
                  {((attemptResult.previousMastery ?? 0) * 100).toFixed(0)}%
                </strong>{" "}
                →{" "}
                <strong
                  className={
                    attemptResult.newMastery >= attemptResult.previousMastery
                      ? "text-[#00ff66]"
                      : "text-[#ff0055]"
                  }
                >
                  {((attemptResult.newMastery ?? 0) * 100).toFixed(0)}%
                </strong>{" "}
                (
                {attemptResult.delta >= 0 ? "+" : ""}
                {((attemptResult.delta ?? 0) * 100).toFixed(0)}%)
              </span>
            </div>

            {attemptResult.explanation && (
              <p className="font-vt323 text-lg md:text-xl text-stone-300 pt-2 border-t border-[#38384a]">
                {attemptResult.explanation}
              </p>
            )}
          </div>
        )}

        {/* Action Button Footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          {!attemptResult ? (
            <button
              disabled={!selectedOption || isSubmitting}
              onClick={handleSubmit}
              className="px-6 py-3 bg-[#00ffcc] hover:bg-[#00e6b8] text-black font-pixel text-xs border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {isSubmitting ? "CALCULATING..." : "EXECUTE ACTION"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 bg-[#00ff66] hover:bg-[#00e65c] text-black font-pixel text-xs border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]"
            >
              <span>
                {currentIndex + 1 < items.length
                  ? "NEXT ENCOUNTER"
                  : "FINISH TRIAL & VIEW REPORT"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
