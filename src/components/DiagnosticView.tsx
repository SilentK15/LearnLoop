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
        <div className="w-10 h-10 border-2 border-[#B4472A] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-600 font-sans">
          Assembling 6-concept curriculum diagnostic benchmark...
        </p>
      </div>
    );
  }

  if (items.length === 0 || !currentItem?.question) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-stone-600">Diagnostic questions not ready.</p>
        <button
          onClick={fetchDiagnostic}
          className="px-4 py-2 rounded-xl text-white text-xs font-semibold shadow-sm"
          style={{ backgroundColor: "var(--color-recommended, #B4472A)" }}
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
      <div
        className="p-5 rounded-2xl border shadow-sm space-y-3"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
      >
        <div className="flex items-center justify-between text-xs">
          <span className="font-semibold text-[#B4472A] font-mono uppercase tracking-wide">
            Diagnostic Stage {currentIndex + 1} of {items.length}
          </span>
          <span className="text-stone-500 font-medium">
            {completedCount} evaluated
          </span>
        </div>

        {/* Progress Bar */}
        <div className="grid grid-cols-6 gap-2">
          {items.map((item, idx) => (
            <div
              key={item.conceptId}
              className={`h-2 rounded-full transition-all ${
                idx < currentIndex
                  ? "bg-[#2B5D4F]"
                  : idx === currentIndex
                  ? "bg-[#B4472A]"
                  : "bg-stone-200"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-stone-700">
            Concept #{currentItem.conceptOrder}:{" "}
            <strong className="text-stone-900">{currentItem.conceptName}</strong>
          </span>
          <span className="text-[11px] font-mono text-stone-500">
            Base Mastery: {(currentItem.currentMastery * 100).toFixed(0)}%
          </span>
        </div>
      </div>

      {/* Question Card */}
      <div
        className="p-6 md:p-8 rounded-2xl border shadow-sm space-y-6"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
      >
        <div className="space-y-2">
          <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 font-medium">
            Difficulty {currentItem.question.difficulty}/5
          </span>
          <h3 className="text-lg md:text-xl font-medium text-stone-900 leading-relaxed font-sans">
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
              "border-stone-200 hover:border-stone-400 bg-white text-stone-800";
            if (isSelected && !isSubmitted) {
              borderStyle =
                "border-[#B4472A] bg-[#B4472A]/5 text-stone-900 ring-2 ring-[#B4472A]/20";
            }
            if (isCorrect) {
              borderStyle =
                "border-[#2B5D4F] bg-[#2B5D4F]/10 text-[#2B5D4F] ring-2 ring-[#2B5D4F]/20 font-semibold";
            }
            if (isWrong) {
              borderStyle =
                "border-rose-400 bg-rose-50 text-rose-800 ring-2 ring-rose-200";
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
                      ? "bg-[#B4472A] text-white"
                      : isCorrect
                      ? "bg-[#2B5D4F] text-white"
                      : "bg-stone-100 text-stone-600 border border-stone-200"
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
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white text-sm font-semibold shadow-sm hover:opacity-95 active:scale-98 transition-all disabled:opacity-40 disabled:pointer-events-none"
              style={{ backgroundColor: "var(--color-recommended, #B4472A)" }}
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
          <div className="pt-6 border-t border-stone-100 space-y-4 animate-in fade-in duration-300">
            <div
              className={`p-4 rounded-xl border flex items-start gap-3 ${
                attemptResult.isCorrect
                  ? "bg-[#2B5D4F]/10 border-[#2B5D4F]/30 text-[#2B5D4F]"
                  : "bg-[#B4472A]/10 border-[#B4472A]/30 text-[#B4472A]"
              }`}
            >
              {attemptResult.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 text-[#2B5D4F] shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-[#B4472A] shrink-0 mt-0.5" />
              )}
              <div className="text-xs space-y-1">
                <p className="font-bold font-serif text-sm">
                  {attemptResult.isCorrect ? "Correct Verification" : "Incorrect Response"}
                </p>
                <p className="text-stone-700">
                  Concept Mastery Updated: {(attemptResult.previousMastery * 100).toFixed(0)}% →{" "}
                  <strong>{(attemptResult.newMastery * 100).toFixed(0)}%</strong> (
                  {attemptResult.delta >= 0 ? "+" : ""}
                  {(attemptResult.delta * 100).toFixed(1)}%)
                </p>
              </div>
            </div>

            <p className="text-xs text-stone-700 bg-stone-50 p-4 rounded-xl border border-stone-200 leading-relaxed font-sans">
              {attemptResult.explanation}
            </p>

            <div className="flex justify-end pt-2">
              <button
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm active:scale-98 transition-all"
                style={{ backgroundColor: "var(--color-recommended, #B4472A)" }}
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
