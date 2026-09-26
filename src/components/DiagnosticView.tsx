"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";

interface DiagnosticItem {
  conceptId: string;
  conceptName: string;
  conceptOrder: number;
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
}

export function DiagnosticView({
  onDiagnosticComplete,
  onRefreshProfile,
}: DiagnosticViewProps) {
  const [items, setItems] = useState<DiagnosticItem[]>([]);
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [attemptResult, setAttemptResult] = useState<any | null>(null);
  const [completedCount, setCompletedCount] = useState<number>(0);

  const fetchDiagnostic = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/diagnostic");
      const data = await res.json();
      if (res.ok && data.diagnosticQuestions) {
        setItems(data.diagnosticQuestions);
      }
    } catch (err) {
      console.error("Failed to load diagnostic:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostic();
  }, []);

  const currentItem = items[currentIndex];

  const handleSubmit = async () => {
    if (!selectedOption || !currentItem?.question || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: currentItem.question.id,
          selectedAnswer: selectedOption,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setAttemptResult(data);
      setCompletedCount((prev) => prev + 1);

      if (data.isCorrect) {
        confetti({ particleCount: 40, spread: 60, origin: { y: 0.7 } });
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
      onDiagnosticComplete();
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-mono">
          Assembling 6-concept curriculum diagnostic benchmark...
        </p>
      </div>
    );
  }

  if (items.length === 0 || !currentItem?.question) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-slate-400">Diagnostic questions not ready.</p>
        <button
          onClick={fetchDiagnostic}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
        >
          Reload
        </button>
      </div>
    );
  }

  const options = Array.isArray(currentItem.question.options)
    ? currentItem.question.options
    : typeof currentItem.question.options === "string"
    ? JSON.parse(currentItem.question.options)
    : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* Stepper Header */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm space-y-3">
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-blue-400 font-mono">
            Diagnostic Stage {currentIndex + 1} of {items.length}
          </span>
          <span className="text-slate-400">
            {completedCount} evaluated
          </span>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-6 gap-2">
          {items.map((item, idx) => (
            <div
              key={item.conceptId}
              className={`h-1.5 rounded-full transition-all ${
                idx < currentIndex
                  ? "bg-emerald-500"
                  : idx === currentIndex
                  ? "bg-blue-500"
                  : "bg-slate-800"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-slate-300">
            Concept #{currentItem.conceptOrder}:{" "}
            <strong className="text-white">{currentItem.conceptName}</strong>
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            Base Mastery: {(currentItem.currentMastery * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="space-y-2">
          <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
            Difficulty {currentItem.question.difficulty}/5
          </span>
          <h3 className="text-base md:text-lg font-medium text-slate-100 leading-relaxed font-sans">
            {currentItem.question.text}
          </h3>
        </div>

        <div className="space-y-3 pt-2">
          {options.map((opt: string, idx: number) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedOption === opt;
            const isSubmitted = !!attemptResult;
            const isCorrect = isSubmitted && opt === attemptResult.correctAnswer;
            const isWrong = isSubmitted && isSelected && !attemptResult.isCorrect;

            let borderStyle =
              "border-slate-800 hover:border-slate-700 bg-slate-900/50 text-slate-200";
            if (isSelected && !isSubmitted) {
              borderStyle =
                "border-blue-500 bg-blue-950/30 text-white ring-1 ring-blue-500";
            }
            if (isCorrect) {
              borderStyle =
                "border-emerald-500 bg-emerald-950/40 text-emerald-200 ring-1 ring-emerald-500";
            }
            if (isWrong) {
              borderStyle =
                "border-rose-500 bg-rose-950/40 text-rose-200 ring-1 ring-rose-500";
            }

            return (
              <button
                key={idx}
                disabled={isSubmitted}
                onClick={() => setSelectedOption(opt)}
                className={`w-full flex items-start gap-4 p-4 rounded-xl border text-left transition-all ${borderStyle} disabled:cursor-default`}
              >
                <span
                  className={`w-6 h-6 rounded-lg text-xs font-mono font-bold flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "bg-blue-600 text-white"
                      : "bg-slate-800 text-slate-400"
                  }`}
                >
                  {letter}
                </span>
                <span className="text-sm leading-relaxed">{opt}</span>
              </button>
            );
          })}
        </div>

        {!attemptResult ? (
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 active:scale-95 transition-all disabled:opacity-40 disabled:pointer-events-none"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Evaluating...</span>
                </>
              ) : (
                <>
                  <span>Evaluate Concept</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="pt-6 border-t border-slate-800 space-y-4 animate-in fade-in duration-300">
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                attemptResult.isCorrect
                  ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                  : "bg-rose-950/30 border-rose-500/40 text-rose-300"
              }`}
            >
              {attemptResult.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <p className="font-bold">
                  {attemptResult.isCorrect ? "Correct Verification" : "Incorrect Response"}
                </p>
                <p className="text-slate-300">
                  Concept Mastery Updated: {(attemptResult.previousMastery * 100).toFixed(0)}% →{" "}
                  <strong>{(attemptResult.newMastery * 100).toFixed(0)}%</strong> (
                  {attemptResult.delta >= 0 ? "+" : ""}
                  {(attemptResult.delta * 100).toFixed(1)}%)
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800 leading-relaxed">
              {attemptResult.explanation}
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
              >
                <span>
                  {currentIndex + 1 < items.length
                    ? "Proceed to Next Concept"
                    : "Complete Diagnostic"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
