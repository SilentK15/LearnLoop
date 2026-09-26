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
  1: { label: "★ Slime (D1)", color: "#00ff66" },
  2: { label: "★★ Goblin (D2)", color: "#00b4d8" },
  3: { label: "★★★ Knight (D3)", color: "#ffcc00" },
  4: { label: "★★★★ Dragon (D4)", color: "#ff8800" },
  5: { label: "★★★★★ Boss (D5)", color: "#ff0055" },
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
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <div
          className="w-10 h-10 border-4 animate-spin"
          style={{
            borderColor: "#00ffcc",
            borderTopColor: "transparent",
            boxShadow: "0 0 12px rgba(0, 255, 204, 0.4)",
          }}
        />
        <p
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: "18px",
            color: "#6a6a8a",
          }}
        >
          Spawning enemy at Difficulty {currentDifficulty}...
        </p>
      </div>
    );
  }

  if (!question || !concept) {
    return (
      <div className="text-center py-16 space-y-4">
        <p style={{ fontFamily: "'VT323', monospace", fontSize: "20px", color: "#6a6a8a" }}>
          No enemies found in this dungeon.
        </p>
        <button
          onClick={() => fetchAdaptiveQuestion()}
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "9px",
            padding: "10px 20px",
            backgroundColor: "#00ffcc",
            color: "#000",
            border: "3px solid #000",
            boxShadow: "3px 3px 0px #000",
          }}
        >
          RETRY
        </button>
      </div>
    );
  }

  const optionsList = Array.isArray(question.options)
    ? (question.options as string[])
    : typeof question.options === "string"
    ? JSON.parse(question.options)
    : [];

  const diffInfo = DIFFICULTY_LABELS[currentDifficulty] || { label: "???", color: "#ff0055" };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-16">
      {/* 0. 5-Question Stepper */}
      <div
        className="flex items-center justify-between"
        style={{
          padding: "16px 20px",
          backgroundColor: "#141420",
          border: "3px solid #2a2a44",
          boxShadow: "4px 4px 0px #000",
        }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "8px",
              padding: "4px 10px",
              border: "2px solid #2a2a44",
              boxShadow: "2px 2px 0px #000",
              backgroundColor: "#0d0d14",
              color: "#00ffcc",
            }}
          >
            WAVE {Math.min(5, sessionAttempts.length + 1)}/5
          </span>
          <span
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: "16px",
              color: "#4a4a6a",
            }}
          >
            Adaptive Combat
          </span>
        </div>

        {/* 5-step pixel progress */}
        <div className="flex items-center gap-2">
          {[0, 1, 2, 3, 4].map((idx) => {
            const isCompleted = idx < sessionAttempts.length;
            const isCurrent = idx === sessionAttempts.length;
            return (
              <div
                key={idx}
                style={{
                  width: isCompleted || isCurrent ? "24px" : "12px",
                  height: "8px",
                  backgroundColor: isCompleted
                    ? "#00ff66"
                    : isCurrent
                    ? "#ff0055"
                    : "#2a2a44",
                  border: "2px solid #000",
                  boxShadow: isCompleted
                    ? "0 0 6px rgba(0,255,102,0.3)"
                    : isCurrent
                    ? "0 0 6px rgba(255,0,85,0.3)"
                    : "none",
                  transition: "all 0.3s",
                }}
                title={`Wave ${idx + 1}`}
              />
            );
          })}
        </div>
      </div>

      {/* 1. Header & Concept */}
      <div
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
        style={{
          padding: "20px",
          backgroundColor: "#141420",
          border: "3px solid #2a2a44",
          boxShadow: "4px 4px 0px #000",
        }}
      >
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "7px",
                padding: "3px 8px",
                border: "2px solid #00ff66",
                boxShadow: "2px 2px 0px #000",
                backgroundColor: "rgba(0,255,102,0.08)",
                color: "#00ff66",
              }}
            >
              {selectedSubjectName ? `${selectedSubjectName} • ` : ""}STAGE {concept.orderIndex}/6
            </span>
            <span
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: "16px",
                color: "#4a4a6a",
              }}
            >
              Live Adaptive
            </span>
          </div>
          <h2
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "0.9rem",
              color: "#00ffcc",
              textShadow: "2px 2px 0px #000",
              lineHeight: "1.6",
            }}
          >
            {concept.name}
          </h2>
        </div>

        {/* Concept Switcher */}
        {availableConcepts.length > 0 && (
          <select
            value={concept.id}
            onChange={(e) => fetchAdaptiveQuestion(e.target.value)}
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "8px",
              padding: "8px 12px",
              backgroundColor: "#0d0d14",
              color: "#00ffcc",
              border: "3px solid #2a2a44",
              boxShadow: "3px 3px 0px #000",
            }}
          >
            {availableConcepts.map((c) => (
              <option key={c.id} value={c.id}>
                #{c.orderIndex} {c.name}
              </option>
            ))}
          </select>
        )}
      </div>

      {/* 2. Difficulty & Mastery Meters */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Difficulty */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#141420",
            border: "3px solid #2a2a44",
            boxShadow: "4px 4px 0px #000",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "7px",
                color: "#6a6a8a",
                textTransform: "uppercase",
              }}
            >
              Enemy Level
            </span>
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "8px",
                color: diffInfo.color,
                textShadow: `0 0 6px ${diffInfo.color}44`,
              }}
            >
              {diffInfo.label}
            </span>
          </div>
          {/* 5-Segment Meter */}
          <div className="grid grid-cols-5 gap-1.5" style={{ height: "8px" }}>
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                style={{
                  backgroundColor:
                    lvl <= currentDifficulty
                      ? lvl >= 4
                        ? "#ff0055"
                        : lvl === 3
                        ? "#ffcc00"
                        : "#00ff66"
                      : "#1a1a2e",
                  border: "2px solid #000",
                  boxShadow:
                    lvl <= currentDifficulty
                      ? `0 0 4px ${lvl >= 4 ? "rgba(255,0,85,0.3)" : lvl === 3 ? "rgba(255,204,0,0.3)" : "rgba(0,255,102,0.3)"}`
                      : "none",
                  transition: "all 0.3s",
                }}
              />
            ))}
          </div>
          <p
            className="mt-2"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: "14px",
              color: "#4a4a6a",
            }}
          >
            Auto-shifts ±1 upon evaluation (Clamped 1–5)
          </p>
        </div>

        {/* Mastery */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#141420",
            border: "3px solid #2a2a44",
            boxShadow: "4px 4px 0px #000",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "7px",
                color: "#6a6a8a",
                textTransform: "uppercase",
              }}
            >
              Power Level
            </span>
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "10px",
                color:
                  concept.currentMastery >= 0.8
                    ? "#00ff66"
                    : concept.currentMastery >= 0.6
                    ? "#00b4d8"
                    : concept.currentMastery >= 0.3
                    ? "#ffcc00"
                    : "#ff0055",
              }}
            >
              {(concept.currentMastery * 100).toFixed(0)}%
            </span>
          </div>
          <div
            style={{
              width: "100%",
              height: "8px",
              backgroundColor: "#0d0d12",
              border: "2px solid #2a2a44",
              boxShadow: "inset 0 1px 0 rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, Math.max(3, concept.currentMastery * 100))}%`,
                backgroundColor:
                  concept.currentMastery >= 0.8
                    ? "#00ff66"
                    : concept.currentMastery >= 0.6
                    ? "#00b4d8"
                    : concept.currentMastery >= 0.3
                    ? "#ffcc00"
                    : "#ff0055",
                transition: "width 0.5s",
              }}
            />
          </div>
          <p
            className="mt-2"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: "14px",
              color: "#4a4a6a",
            }}
          >
            DMG: new = old + 0.35 × (outcome - old) × W(diff)
          </p>
        </div>
      </div>

      {/* 3. Question Card */}
      <div
        className="space-y-6"
        style={{
          padding: "24px 28px",
          backgroundColor: "#141420",
          border: "3px solid #2a2a44",
          boxShadow: "4px 4px 0px #000",
        }}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "8px",
                color: "#6a6a8a",
                textTransform: "uppercase",
                letterSpacing: "2px",
              }}
            >
              ENCOUNTER #{servedQuestionIds.length}
            </span>
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "8px",
                padding: "3px 10px",
                border: `2px solid ${diffInfo.color}`,
                boxShadow: "2px 2px 0px #000",
                backgroundColor: `${diffInfo.color}15`,
                color: diffInfo.color,
              }}
            >
              LVL {question.difficulty}/5
            </span>
          </div>

          <h3
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: "24px",
              color: "#e8e8f0",
              lineHeight: "1.4",
            }}
          >
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

            let borderColor = "#2a2a44";
            let bgColor = "#0d0d14";
            let textColor = "#a0a0c0";
            let glow = "none";

            if (isSelected && !isSubmitted) {
              borderColor = "#00ffcc";
              bgColor = "rgba(0, 255, 204, 0.06)";
              textColor = "#e8e8f0";
              glow = "0 0 8px rgba(0, 255, 204, 0.2)";
            }
            if (isCorrect) {
              borderColor = "#00ff66";
              bgColor = "rgba(0, 255, 102, 0.08)";
              textColor = "#00ff66";
              glow = "0 0 10px rgba(0, 255, 102, 0.25)";
            }
            if (isWrongSelected) {
              borderColor = "#ff0055";
              bgColor = "rgba(255, 0, 85, 0.08)";
              textColor = "#ff0055";
              glow = "0 0 10px rgba(255, 0, 85, 0.25)";
            }

            return (
              <button
                key={idx}
                disabled={isSubmitted}
                onClick={() => setSelectedOption(opt)}
                style={{
                  width: "100%",
                  display: "flex",
                  alignItems: "flex-start",
                  gap: "12px",
                  padding: "14px 16px",
                  backgroundColor: bgColor,
                  border: `3px solid ${borderColor}`,
                  boxShadow: `3px 3px 0px #000, ${glow}`,
                  textAlign: "left",
                  transition: "all 0.1s",
                  cursor: isSubmitted ? "default" : "pointer",
                  textTransform: "none",
                  letterSpacing: "0px",
                }}
              >
                <span
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: "10px",
                    width: "24px",
                    height: "24px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                    border: `2px solid ${isSelected || isCorrect ? borderColor : "#2a2a44"}`,
                    backgroundColor:
                      isSelected && !isSubmitted
                        ? "#00ffcc"
                        : isCorrect
                        ? "#00ff66"
                        : isWrongSelected
                        ? "#ff0055"
                        : "#0d0d14",
                    color:
                      isSelected || isCorrect || isWrongSelected
                        ? "#000"
                        : "#6a6a8a",
                    boxShadow: "1px 1px 0px #000",
                  }}
                >
                  {letter}
                </span>
                <span
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: "20px",
                    color: textColor,
                    lineHeight: "1.3",
                  }}
                >
                  {opt}
                </span>
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
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "10px",
                padding: "14px 24px",
                backgroundColor:
                  !selectedOption || isSubmitting ? "#2a2a44" : "#ff0055",
                color: !selectedOption || isSubmitting ? "#4a4a6a" : "#fff",
                border: "3px solid #000",
                boxShadow:
                  !selectedOption || isSubmitting
                    ? "3px 3px 0px #000"
                    : "3px 3px 0px #000, 0 0 10px rgba(255, 0, 85, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                opacity: !selectedOption || isSubmitting ? 0.5 : 1,
                cursor: !selectedOption || isSubmitting ? "not-allowed" : "pointer",
              }}
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>JUDGING...</span>
                </>
              ) : (
                <>
                  <span>⚔ ATTACK</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* 4. Feedback */}
        {attemptResult && (
          <div
            className="pt-6 space-y-5"
            style={{ borderTop: "2px solid #2a2a44" }}
          >
            {/* Outcome Banner */}
            <div
              style={{
                padding: "16px 20px",
                border: `3px solid ${attemptResult.isCorrect ? "#00ff66" : "#ff0055"}`,
                boxShadow: `3px 3px 0px #000, 0 0 12px ${
                  attemptResult.isCorrect
                    ? "rgba(0,255,102,0.2)"
                    : "rgba(255,0,85,0.2)"
                }`,
                backgroundColor: attemptResult.isCorrect
                  ? "rgba(0,255,102,0.06)"
                  : "rgba(255,0,85,0.06)",
                display: "flex",
                alignItems: "flex-start",
                gap: "12px",
              }}
            >
              {attemptResult.isCorrect ? (
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#00ff66" }} />
              ) : (
                <XCircle className="w-5 h-5 shrink-0 mt-0.5" style={{ color: "#ff0055" }} />
              )}
              <div className="space-y-1">
                <div
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: "9px",
                    color: attemptResult.isCorrect ? "#00ff66" : "#ff0055",
                  }}
                >
                  {attemptResult.isCorrect
                    ? "✓ CRITICAL HIT! +1 LVL UP"
                    : "✗ MISS! -1 LVL DOWN"}
                </div>
                <div
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: "16px",
                    color: "#6a6a8a",
                  }}
                >
                  {attemptResult.isCorrect
                    ? `Next enemy: LVL ${Math.min(5, currentDifficulty + 1)} (capped at 5)`
                    : `Next enemy: LVL ${Math.max(1, currentDifficulty - 1)} (min 1)`}
                </div>
              </div>
            </div>

            {/* Mastery Delta */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "#0d0d14",
                border: "3px solid #2a2a44",
                boxShadow: "3px 3px 0px #000",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <span
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: "7px",
                    color: "#6a6a8a",
                  }}
                >
                  XP RECOMPUTATION
                </span>
                <span
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: "9px",
                    color: "#e8e8f0",
                  }}
                >
                  {(attemptResult.previousMastery * 100).toFixed(0)}% →{" "}
                  {(attemptResult.newMastery * 100).toFixed(0)}% (
                  <strong
                    style={{
                      color: attemptResult.delta >= 0 ? "#00ff66" : "#ff0055",
                    }}
                  >
                    {attemptResult.delta >= 0 ? "+" : ""}
                    {(attemptResult.delta * 100).toFixed(1)}%
                  </strong>
                  )
                </span>
              </div>
              <div
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: "15px",
                  color: "#4a4a6a",
                  padding: "8px 10px",
                  backgroundColor: "#141420",
                  border: "2px solid #2a2a44",
                }}
              >
                DMG: {(attemptResult.previousMastery * 100).toFixed(0)}% + 0.35 × (
                {attemptResult.isCorrect ? "1.0" : "0.0"} −{" "}
                {attemptResult.previousMastery.toFixed(2)}) ×{" "}
                {attemptResult.difficultyWeight.toFixed(2)} (W) ={" "}
                {(attemptResult.newMastery * 100).toFixed(1)}%
              </div>
            </div>

            {/* Explanation */}
            <div
              style={{
                padding: "16px",
                backgroundColor: "rgba(255, 204, 0, 0.04)",
                border: "3px solid rgba(255, 204, 0, 0.25)",
                boxShadow: "3px 3px 0px #000",
              }}
            >
              <span
                className="flex items-center gap-1.5 mb-2"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "7px",
                  color: "#ffcc00",
                  textTransform: "uppercase",
                }}
              >
                <HelpCircle className="w-3.5 h-3.5" /> LORE SCROLL
              </span>
              <p
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: "18px",
                  color: "#a0a0c0",
                  lineHeight: "1.4",
                }}
              >
                {attemptResult.explanation}
              </p>
            </div>

            {/* Action Bar */}
            {sessionAttempts.length >= 5 ? (
              <div className="pt-2 flex justify-center sm:justify-end">
                <button
                  onClick={handleFinishSession}
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: "9px",
                    padding: "14px 24px",
                    backgroundColor: "#00ff66",
                    color: "#000",
                    border: "3px solid #000",
                    boxShadow: "4px 4px 0px #000, 0 0 12px rgba(0,255,102,0.3)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "10px",
                  }}
                >
                  <span>★ QUEST COMPLETE (5/5)</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
                <button
                  onClick={handleFinishSession}
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: "8px",
                    padding: "10px 16px",
                    backgroundColor: "#0d0d14",
                    color: "#6a6a8a",
                    border: "2px solid #2a2a44",
                    boxShadow: "2px 2px 0px #000",
                    width: "100%",
                  }}
                  className="sm:w-auto"
                >
                  RETREAT ({sessionAttempts.length}/5)
                </button>

                <button
                  onClick={handleNextQuestion}
                  style={{
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: "8px",
                    padding: "12px 20px",
                    backgroundColor: "#ff0055",
                    color: "#fff",
                    border: "3px solid #000",
                    boxShadow: "3px 3px 0px #000, 0 0 8px rgba(255,0,85,0.2)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                  }}
                  className="sm:w-auto"
                >
                  <span>
                    NEXT WAVE ({sessionAttempts.length + 1}/5) • LVL{" "}
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
