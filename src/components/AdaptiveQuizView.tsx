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
  selectedSubjectSlug?: string;
  selectedSubjectName?: string;
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
  selectedSubjectSlug,
  selectedSubjectName,
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

  // Load available concepts list on mount or subject change
  useEffect(() => {
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

    fetch(`/api/profile?${params.toString()}`)
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
  }, [selectedSubjectSlug]);

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

      const cId = targetConceptId || concept?.id || initialConceptId || "";
      const diff = targetDiff !== undefined ? targetDiff : currentDifficulty;
      const excludes = (exclude || servedQuestionIds).join(",");

      const params = new URLSearchParams();
      if (cId) params.set("conceptId", cId);
      params.set("currentDifficulty", String(diff));
      params.set("excludeIds", excludes);
      if (selectedSubjectSlug) params.set("subject", selectedSubjectSlug);
      if (studentEmail) params.set("studentEmail", studentEmail);

      const url = `/api/quiz/adaptive?${params.toString()}`;

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
  }, [initialConceptId, selectedSubjectSlug]);

  // Handle Answer Submission
  const handleSubmitAnswer = async () => {
    if (!selectedOption || !question || !concept || isSubmitting) return;

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
          questionId: question.id,
          selectedAnswer: selectedOption,
          studentEmail: studentEmail || undefined,
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
      {/* 0. 5-Question Stepper Progress Card */}
      <div
        className="p-4 rounded-2xl border shadow-sm flex items-center justify-between"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-lg bg-stone-100 text-stone-800 border border-stone-200">
            Question {Math.min(5, sessionAttempts.length + 1)} of 5
          </span>
          <span className="text-xs text-stone-500 font-sans hidden sm:inline">
            Adaptive Topic Calibration
          </span>
        </div>

        {/* 5-step progress pill indicators */}
        <div className="flex items-center gap-1.5">
          {[0, 1, 2, 3, 4].map((idx) => {
            const isCompleted = idx < sessionAttempts.length;
            const isCurrent = idx === sessionAttempts.length;
            return (
              <div
                key={idx}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isCompleted
                    ? "w-6 bg-[#2B5D4F]"
                    : isCurrent
                    ? "w-6 bg-[#B4472A] ring-2 ring-[#B4472A]/20"
                    : "w-3 bg-stone-200"
                }`}
                title={`Question ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* 1. Header & Concept Selector */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl border shadow-sm"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#2B5D4F]/10 text-[#2B5D4F] font-semibold border border-[#2B5D4F]/20">
              {selectedSubjectName ? `${selectedSubjectName} • ` : ""}Topic {concept.orderIndex} of 6
            </span>
            <span className="text-xs text-stone-500 font-sans">Live Adaptive Mode</span>
          </div>
          <h2 className="text-xl font-serif font-bold text-stone-900 tracking-tight">
            {concept.name}
          </h2>
        </div>

        {/* Concept Switcher */}
        {availableConcepts.length > 0 && (
          <select
            value={concept.id}
            onChange={(e) => fetchAdaptiveQuestion(e.target.value)}
            className="text-xs bg-stone-50 text-stone-800 border border-stone-300 rounded-xl px-3 py-2 outline-none focus:border-[#B4472A] transition-colors"
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
        <div
          className="p-5 rounded-2xl border shadow-sm"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-stone-500 font-medium">Adaptive Difficulty</span>
            <span
              className={`font-mono font-bold ${
                DIFFICULTY_LABELS[currentDifficulty]?.color || "text-[#B4472A]"
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
                      ? "bg-[#B4472A]"
                      : lvl === 3
                      ? "bg-amber-500"
                      : "bg-[#2B5D4F]"
                    : "bg-stone-200"
                }`}
              />
            ))}
          </div>
          <p className="text-[10px] text-stone-400 mt-2 font-mono">
            Auto-shifts ±1 upon evaluation (Clamped 1–5)
          </p>
        </div>

        {/* Live Mastery Meter */}
        <div
          className="p-5 rounded-2xl border shadow-sm"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-stone-500 font-medium">Current Concept Mastery</span>
            <span className="font-mono font-bold text-stone-900">
              {(concept.currentMastery * 100).toFixed(0)}%
            </span>
          </div>
          <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
            <div
              className={`h-full transition-all duration-500 ${
                concept.currentMastery >= 0.8
                  ? "bg-[#2B5D4F]"
                  : concept.currentMastery >= 0.6
                  ? "bg-blue-600"
                  : concept.currentMastery >= 0.3
                  ? "bg-amber-500"
                  : "bg-[#B4472A]"
              }`}
              style={{
                width: `${Math.min(
                  100,
                  Math.max(3, concept.currentMastery * 100)
                )}%`,
              }}
            />
          </div>
          <p className="text-[10px] text-stone-400 mt-2 font-mono">
            Formula: new = old + 0.35 × (outcome - old) × W(diff)
          </p>
        </div>
      </div>

      {/* 3. Question Card */}
      <div
        className="p-6 md:p-8 rounded-2xl border shadow-sm space-y-6"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-stone-500 uppercase tracking-wider font-semibold">
              Question #{servedQuestionIds.length}
            </span>
            <span className="text-xs font-mono px-2.5 py-0.5 rounded-full bg-stone-100 text-stone-700 border border-stone-200 font-medium">
              Difficulty {question.difficulty}/5
            </span>
          </div>

          <h3 className="text-lg md:text-xl font-medium text-stone-900 leading-relaxed font-sans">
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
              "border-stone-200 hover:border-stone-400 bg-white text-stone-800";
            if (isSelected && !isSubmitted) {
              borderStyle =
                "border-[#B4472A] bg-[#B4472A]/5 text-stone-900 ring-2 ring-[#B4472A]/20";
            }
            if (isCorrect) {
              borderStyle =
                "border-[#2B5D4F] bg-[#2B5D4F]/10 text-[#2B5D4F] ring-2 ring-[#2B5D4F]/20 font-semibold";
            }
            if (isWrongSelected) {
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

        {/* Submit Button */}
        {!attemptResult && (
          <div className="pt-4 flex justify-end">
            <button
              onClick={handleSubmitAnswer}
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
                  <span>Submit Answer</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* 4. Live Feedback & Dynamic Adaptation Details */}
        {attemptResult && (
          <div className="pt-6 border-t border-stone-100 space-y-5 animate-in fade-in duration-300">
            {/* Outcome Banner */}
            <div
              className={`p-4 rounded-xl border flex items-start gap-3.5 ${
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
              <div className="space-y-1">
                <div className="font-bold text-sm font-serif">
                  {attemptResult.isCorrect
                    ? "Correct! +1 Difficulty Adaptation Triggered"
                    : "Incorrect. -1 Difficulty Calibration Triggered"}
                </div>
                <div className="text-xs font-mono">
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
            <div className="p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-600 font-medium">
                  Live Mastery Recomputation:
                </span>
                <span className="font-mono font-bold text-stone-900">
                  {(attemptResult.previousMastery * 100).toFixed(0)}% →{" "}
                  {(attemptResult.newMastery * 100).toFixed(0)}% (
                  <strong
                    className={
                      attemptResult.delta >= 0
                        ? "text-[#2B5D4F]"
                        : "text-[#B4472A]"
                    }
                  >
                    {attemptResult.delta >= 0 ? "+" : ""}
                    {(attemptResult.delta * 100).toFixed(1)}%
                  </strong>
                  )
                </span>
              </div>
              <div className="font-mono text-[11px] text-stone-600 bg-white p-2.5 rounded-lg border border-stone-200">
                Formula: {(attemptResult.previousMastery * 100).toFixed(0)}% +
                0.35 × (
                {attemptResult.isCorrect ? "1.0" : "0.0"} -{" "}
                {attemptResult.previousMastery.toFixed(2)}) ×{" "}
                {attemptResult.difficultyWeight.toFixed(2)} (W) ={" "}
                {(attemptResult.newMastery * 100).toFixed(1)}%
              </div>
            </div>

            {/* Explanation */}
            <div className="p-4 rounded-xl bg-amber-50/60 border border-amber-200/70 space-y-1.5">
              <span className="text-xs font-semibold text-amber-900 flex items-center gap-1.5">
                <HelpCircle className="w-3.5 h-3.5" /> Conceptual Explanation
              </span>
              <p className="text-xs text-stone-700 leading-relaxed">
                {attemptResult.explanation}
              </p>
            </div>

            {/* Action Bar */}
            {sessionAttempts.length >= 5 ? (
              <div className="pt-2 flex justify-center sm:justify-end">
                <button
                  onClick={handleFinishSession}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3.5 rounded-xl text-white text-sm font-semibold shadow-md active:scale-98 transition-all hover:opacity-95"
                  style={{ backgroundColor: "#2B5D4F" }}
                >
                  <span>Complete Drill & View Results (5/5 Finished)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleFinishSession}
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors border border-stone-200"
                >
                  End Early & View Analysis ({sessionAttempts.length} of 5 answered)
                </button>

                <button
                  onClick={handleNextQuestion}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-semibold shadow-sm active:scale-98 transition-all"
                  style={{ backgroundColor: "var(--color-recommended, #B4472A)" }}
                >
                  <span>
                    Next Question ({sessionAttempts.length + 1} of 5) • D
                    {attemptResult.isCorrect
                      ? Math.min(5, currentDifficulty + 1)
                      : Math.max(1, currentDifficulty - 1)}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
