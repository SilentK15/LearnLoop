"use client";

import React, { useState, useEffect } from "react";
import {
  CheckCircle2,
  XCircle,
  ArrowRight,
  RefreshCw,
  BookOpen,
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
  selectedSubjectSlug?: string;
  selectedSubjectName?: string;
}

export function DiagnosticView({
  onDiagnosticComplete,
  onRefreshProfile,
  selectedSubjectSlug,
  selectedSubjectName,
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
      if (selectedSubjectSlug) params.set("subject", selectedSubjectSlug);
      if (studentEmail) params.set("studentEmail", studentEmail);

      const url = `/api/diagnostic?${params.toString()}`;
      const res = await fetch(url);
      const data = await res.json();
      if (res.ok && data.diagnosticQuestions) {
        setItems(data.diagnosticQuestions);
        setCurrentIndex(0);
        setSelectedOption(null);
        setAttemptResult(null);
        setCompletedCount(0);
      }
    } catch (err) {
      console.error("Failed to load diagnostic:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiagnostic();
  }, [selectedSubjectSlug]);

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
          Assembling 6-topic {selectedSubjectName || "curriculum"} diagnostic benchmark...
        </p>
      </div>
    );
  }

  if (items.length === 0 || !currentItem?.question) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-stone-600">
          Diagnostic questions for {selectedSubjectName || "this track"} are not ready.
        </p>
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
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#B4472A] font-mono uppercase tracking-wide">
              Diagnostic Stage {currentIndex + 1} of {items.length}
            </span>
            {selectedSubjectName && (
              <span className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 font-mono font-medium">
                {selectedSubjectName} Track
              </span>
            )}
          </div>
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
      </div>

      {/* Main Question Card */}
      <div
        className="p-6 md:p-8 rounded-2xl border shadow-sm space-y-6"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
      >
        {/* Concept Metadata Pill */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-stone-100 text-stone-700 border border-stone-200 font-medium">
              Topic #{currentItem.conceptOrder}: {currentItem.conceptName}
            </span>
          </div>
          <span className="text-xs font-mono text-stone-500">
            Initial Baseline: {(currentItem.currentMastery * 100).toFixed(0)}%
          </span>
        </div>

        {/* Question Text */}
        <h3 className="text-xl md:text-2xl font-serif font-bold text-stone-900 leading-snug">
          {currentItem.question.text}
        </h3>

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

            let cardStyles = "border-[#E5E0D8] bg-[#F7F5F1]/40 hover:bg-[#F7F5F1]";
            if (isSelected && !isSubmitted) {
              cardStyles = "border-stone-800 bg-stone-50 ring-1 ring-stone-800";
            }
            if (isCorrectAnswer) {
              cardStyles = "border-[#2B5D4F] bg-[#E6F4EA] text-stone-900";
            }
            if (isWrongSelection) {
              cardStyles = "border-[#B4472A] bg-[#FCE8E6] text-stone-900";
            }

            return (
              <button
                key={idx}
                disabled={isSubmitted || isSubmitting}
                onClick={() => setSelectedOption(opt)}
                className={`w-full text-left p-4 rounded-xl border text-sm font-sans transition-all flex items-center justify-between ${cardStyles} disabled:cursor-not-allowed`}
              >
                <span>{opt}</span>
                {isCorrectAnswer && (
                  <CheckCircle2 className="w-5 h-5 text-[#2B5D4F] shrink-0" />
                )}
                {isWrongSelection && (
                  <XCircle className="w-5 h-5 text-[#B4472A] shrink-0" />
                )}
              </button>
            );
          })}
        </div>

        {/* Live Mastery Delta Feedback */}
        {attemptResult && (
          <div
            className={`p-4 rounded-xl border space-y-2 ${
              attemptResult.isCorrect
                ? "bg-[#E6F4EA] border-[#34A853]/30"
                : "bg-[#FCE8E6] border-[#EA4335]/30"
            }`}
          >
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="font-bold">
                {attemptResult.isCorrect ? "Correct Response" : "Incorrect"}
              </span>
              <span>
                Mastery:{" "}
                <strong>
                  {((attemptResult.previousMastery ?? 0) * 100).toFixed(0)}%
                </strong>{" "}
                →{" "}
                <strong
                  className={
                    attemptResult.newMastery >= attemptResult.previousMastery
                      ? "text-[#2B5D4F]"
                      : "text-[#B4472A]"
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
              <p className="text-xs text-stone-700 font-sans leading-relaxed pt-1 border-t border-stone-200/50">
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
              className="px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: "var(--color-recommended, #B4472A)" }}
            >
              {isSubmitting ? "Validating..." : "Submit Answer"}
            </button>
          ) : (
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-white font-semibold text-sm transition-all shadow-sm"
              style={{ backgroundColor: "#2B5D4F" }}
            >
              <span>
                {currentIndex + 1 < items.length
                  ? "Next Topic Question"
                  : "Finish Diagnostic & View Radar"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
