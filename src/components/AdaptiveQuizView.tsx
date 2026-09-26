"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowRight,
  CheckCircle2,
  XCircle,
  HelpCircle,
  RefreshCw,
} from "lucide-react";
import confetti from "canvas-confetti";

interface QuestionData {
  id: string;
  text: string;
  options: string[];
  difficulty: number;
}

interface ConceptData {
  id: string;
  name: string;
  slug: string;
  orderIndex: number;
  currentMastery: number;
}

interface AttemptResult {
  isCorrect: boolean;
  correctAnswer: string;
  explanation: string;
  difficulty: number;
  previousMastery: number;
  newMastery: number;
  delta: number;
  difficultyWeight: number;
}

interface AdaptiveQuizViewProps {
  initialConceptId?: string;
  onFinishSession: (sessionData: {
    startMasteries: Record<string, number>;
    endMasteries: Record<string, number>;
    conceptNames: Record<string, string>;
    attempts: Array<{
      conceptId: string;
      conceptName: string;
      difficulty: number;
      isCorrect: boolean;
    }>;
  }) => void;
  onRefreshProfile: () => void;
}

const DIFFICULTY_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Foundational Syntax (D1)", color: "text-emerald-400" },
  2: { label: "Core Mechanics (D2)", color: "text-blue-400" },
  3: { label: "Intermediate Reasoning (D3)", color: "text-cyan-400" },
  4: { label: "Advanced Edge Cases (D4)", color: "text-amber-400" },
  5: { label: "Engine Internals (D5)", color: "text-rose-400" },
};

export function AdaptiveQuizView({
  initialConceptId,
  onFinishSession,
  onRefreshProfile,
}: AdaptiveQuizViewProps) {
  const [concept, setConcept] = useState<ConceptData | null>(null);
  const [question, setQuestion] = useState<QuestionData | null>(null);
  const [currentDifficulty, setCurrentDifficulty] = useState<number>(3);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState<boolean>(true);
  const [attemptResult, setAttemptResult] = useState<AttemptResult | null>(null);
  const [servedQuestionIds, setServedQuestionIds] = useState<string[]>([]);
  const [availableConcepts, setAvailableConcepts] = useState<
    Array<{ id: string; name: string; orderIndex: number }>
  >([]);

  // Session tracking for Before/After screen
  const [sessionStartMasteries, setSessionStartMasteries] = useState<
    Record<string, number>
  >({});
  const [sessionEndMasteries, setSessionEndMasteries] = useState<
    Record<string, number>
  >({});
  const [sessionConceptNames, setSessionConceptNames] = useState<
    Record<string, string>
  >({});
  const [sessionAttempts, setSessionAttempts] = useState<
    Array<{
      conceptId: string;
      conceptName: string;
      difficulty: number;
      isCorrect: boolean;
    }>
  >([]);

  // Load available concepts list on mount
  useEffect(() => {
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.concepts) {
          setAvailableConcepts(
            data.concepts.map((c: any) => ({
              id: c.id,
              name: c.name,
              orderIndex: c.orderIndex,
            }))
          );
        }
      })
      .catch((err) => console.error("Error loading concepts:", err));
  }, []);

  // Fetch adaptive question
  const fetchAdaptiveQuestion = async (
    targetConceptId?: string,
    targetDiff?: number,
    exclude?: string[]
  ) => {
    try {
      setIsLoadingQuestion(true);
      setAttemptResult(null);
      setSelectedOption(null);

      const cId = targetConceptId || concept?.id || initialConceptId || "";
      const diff = targetDiff !== undefined ? targetDiff : currentDifficulty;
      const excludes = (exclude || servedQuestionIds).join(",");

      const url = `/api/quiz/adaptive?conceptId=${encodeURIComponent(
        cId
      )}&currentDifficulty=${diff}&excludeIds=${encodeURIComponent(excludes)}`;

      const res = await fetch(url);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to fetch question");
      }

      setConcept(data.concept);
      setQuestion(data.question);
      setCurrentDifficulty(data.question.difficulty);

      // Record initial start mastery for this concept in the session if not set
      if (sessionStartMasteries[data.concept.id] === undefined) {
        setSessionStartMasteries((prev) => ({
          ...prev,
          [data.concept.id]: data.concept.currentMastery,
        }));
      }

      setSessionConceptNames((prev) => ({
        ...prev,
        [data.concept.id]: data.concept.name,
      }));

      // Add to served question list
      setServedQuestionIds((prev) =>
        prev.includes(data.question.id) ? prev : [...prev, data.question.id]
      );
    } catch (err) {
      console.error("Error loading adaptive question:", err);
    } finally {
      setIsLoadingQuestion(false);
    }
  };

  useEffect(() => {
    fetchAdaptiveQuestion(initialConceptId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialConceptId]);

  // Handle Answer Submission
  const handleSubmitAnswer = async () => {
    if (!selectedOption || !question || !concept || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const res = await fetch("/api/attempts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionId: question.id,
          selectedAnswer: selectedOption,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      setAttemptResult(data);

      // Trigger celebratory confetti on correct answer
      if (data.isCorrect) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
        });
      }

      // Update current mastery locally
      setConcept((prev) =>
        prev ? { ...prev, currentMastery: data.newMastery } : null
      );

      // Track session end mastery
      setSessionEndMasteries((prev) => ({
        ...prev,
        [concept.id]: data.newMastery,
      }));

      // Track session attempt
      setSessionAttempts((prev) => [
        ...prev,
        {
          conceptId: concept.id,
          conceptName: concept.name,
          difficulty: question.difficulty,
          isCorrect: data.isCorrect,
        },
      ]);

      // Inform parent profile to refresh background stats
      onRefreshProfile();
    } catch (err) {
      console.error("Error submitting answer:", err);
      alert("Failed to submit answer. Check database connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Move to next adaptive question
  const handleNextQuestion = () => {
    if (!attemptResult) return;

    // Requirement (4): Adjust difficulty ±1 per answer (clamped 1-5)
    let nextDiff: number;
    if (attemptResult.isCorrect) {
      nextDiff = Math.min(5, currentDifficulty + 1);
    } else {
      nextDiff = Math.max(1, currentDifficulty - 1);
    }

    fetchAdaptiveQuestion(concept?.id, nextDiff);
  };

  // Complete session & trigger AI synthesis
  const handleFinishSession = () => {
    onFinishSession({
      startMasteries: sessionStartMasteries,
      endMasteries: sessionEndMasteries,
      conceptNames: sessionConceptNames,
      attempts: sessionAttempts,
    });
  };

  if (isLoadingQuestion) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-mono">
          Calibrating next adaptive question at Difficulty {currentDifficulty}...
        </p>
      </div>
    );
  }

  if (!question || !concept) {
    return (
      <div className="text-center py-16 space-y-4">
        <p className="text-slate-400">No questions available for this concept.</p>
        <button
          onClick={() => fetchAdaptiveQuestion()}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-xs font-semibold"
        >
          Retry
        </button>
      </div>
    );
  }

  const optionsList = Array.isArray(question.options)
    ? (question.options as string[])
    : typeof question.options === "string"
    ? JSON.parse(question.options)
    : [];

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* 1. Header & Concept Selector */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 backdrop-blur-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
              Concept {concept.orderIndex} of 6
            </span>
            <span className="text-xs text-slate-400">Live Adaptive Mode</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            {concept.name}
          </h2>
        </div>

        {/* Concept Switcher */}
        {availableConcepts.length > 0 && (
          <select
            value={concept.id}
            onChange={(e) => fetchAdaptiveQuestion(e.target.value)}
            className="text-xs bg-slate-800 text-slate-200 border border-slate-700 rounded-lg px-3 py-2 outline-none focus:border-blue-500 transition-colors"
          >
            {availableConcepts.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.orderIndex} {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 2. Live Dynamic Meters: Difficulty & Mastery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Difficulty Bar */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">Adaptive Difficulty Level</span>
            <span
              className={`font-mono font-bold ${
                DIFFICULTY_LABELS[currentDifficulty]?.color || "text-blue-400"
              }`}
            >
              {DIFFICULTY_LABELS[currentDifficulty]?.label}
            </span>
          </div>
          {/* 5-Segment Difficulty Meter */}
          <div className="grid grid-cols-5 gap-1.5 h-2">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className={`rounded-full transition-all duration-300 ${
                  lvl <= currentDifficulty
                    ? lvl >= 4
                      ? "bg-rose-500"
                      : lvl === 3
                      ? "bg-amber-500"
                      : "bg-blue-500"
                    : "bg-slate-800"
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            Auto-shifts ±1 upon evaluation (Clamped 1–5)
          </p>
        </div>

        {/* Live Mastery Meter */}
        <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800/80">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-slate-400">Current Concept Mastery</span>
            <span className="font-mono font-bold text-white">
              {(concept.currentMastery * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                concept.currentMastery >= 0.8
                  ? "bg-emerald-500"
                  : concept.currentMastery >= 0.6
                  ? "bg-blue-500"
                  : concept.currentMastery >= 0.3
                  ? "bg-amber-500"
                  : "bg-rose-500"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(3, concept.currentMastery * 100)
                )}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-mono">
            Recomputed live via Bayesian formula on every submission
          </p>
        </div>
      </div>

      {/* 3. Question Card */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">
              Question #{servedQuestionIds.length}
            </span>
            <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              Difficulty {question.difficulty}/5
            </span>
          </div>

          <h3 className="text-base md:text-lg font-medium text-slate-100 leading-relaxed font-sans">
            {question.text}
          </h3>
        </div>

        {/* Options */}
        <div className="space-y-3 pt-2">
          {optionsList.map((opt: string, idx: number) => {
            const letter = String.fromCharCode(65 + idx);
            const isSelected = selectedOption === opt;
            const isSubmitted = !!attemptResult;
            const isCorrect = isSubmitted && opt === attemptResult.correctAnswer;
            const isWrongSelected =
              isSubmitted && isSelected && !attemptResult.isCorrect;

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
            if (isWrongSelected) {
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

        {/* Submit Button */}
        {!attemptResult && (
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSubmitAnswer}
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
                  <span>Submit Answer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* 4. Live Feedback & Dynamic Adaptation Details */}
        {attemptResult && (
          <div className="pt-6 border-t border-slate-800 space-y-5 animate-in fade-in duration-300">
            {/* Outcome Banner */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3.5 ${
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
              <div className="space-y-1">
                <div className="font-bold text-sm">
                  {attemptResult.isCorrect
                    ? "Correct! +1 Difficulty Adaptation Triggered"
                    : "Incorrect. -1 Difficulty Calibration Triggered"}
                </div>
                <div className="text-xs text-slate-300 font-mono">
                  {attemptResult.isCorrect
                    ? `Next adaptive question difficulty: D${Math.min(
                        5,
                        currentDifficulty + 1
                      )} (clamped max 5)`
                    : `Next adaptive question difficulty: D${Math.max(
                        1,
                        currentDifficulty - 1
                      )} (clamped min 1)`}
                </div>
              </div>
            </div>

            {/* Live Formula & Mastery Delta Details */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">
                  Live Mastery Recomputation:
                </span>
                <span className="font-mono font-bold text-white">
                  {(attemptResult.previousMastery * 100).toFixed(0)}% →{" "}
                  {(attemptResult.newMastery * 100).toFixed(0)}% (
                  <strong
                    className={
                      attemptResult.delta >= 0
                        ? "text-emerald-400"
                        : "text-rose-400"
                    }
                  >
                    {attemptResult.delta >= 0 ? "+" : ""}
                    {(attemptResult.delta * 100).toFixed(1)}%
                  </strong>
                  )
                </span>
              </div>
              <div className="font-mono text-[11px] text-slate-400 bg-slate-900 p-2 rounded border border-slate-800/80">
                Formula: {(attemptResult.previousMastery * 100).toFixed(0)}% +
                0.35 × (
                {attemptResult.isCorrect ? "1.0" : "0.0"} -{" "}
                {attemptResult.previousMastery.toFixed(2)}) ×{" "}
                {attemptResult.difficultyWeight.toFixed(2)} (W) ={" "}
                {(attemptResult.newMastery * 100).toFixed(1)}%
              </div>
            </div>

            {/* Explanation */}
            <div className="p-4 rounded-xl bg-blue-950/20 border border-blue-500/20 space-y-1.5">
              <span className="text-xs font-semibold text-blue-300 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> Conceptual Explanation
              </span>
              <p className="text-xs text-slate-300 leading-relaxed">
                {attemptResult.explanation}
              </p>
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
              <button
                onClick={handleFinishSession}
                className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
              >
                Complete Session & View AI Analysis ({sessionAttempts.length}{" "}
                answered)
              </button>

              <button
                onClick={handleNextQuestion}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
              >
                <span>
                  Next Adaptive Question (D
                  {attemptResult.isCorrect
                    ? Math.min(5, currentDifficulty + 1)
                    : Math.max(1, currentDifficulty - 1)}
                  )
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
