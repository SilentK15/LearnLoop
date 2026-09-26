"use client";

import React from "react";
import {
  Compass,
  ArrowRight,
  TrendingUp,
  Target,
  Sparkles,
  Layers,
  CheckCircle,
  XCircle,
  Award,
  BookOpen,
  Database,
  Coffee,
  Terminal,
  Globe,
  Network,
  Cpu,
  RefreshCw,
} from "lucide-react";
import { getMasteryBadge } from "@/lib/mastery";

interface ConceptStat {
  id: string;
  name: string;
  slug: string;
  description: string;
  orderIndex: number;
  score: number;
  totalQuestions: number;
  attemptsCount: number;
  accuracy: number;
}

interface AttemptLogItem {
  id: string;
  isCorrect: boolean;
  difficultyAtAttempt: number;
  previousMastery: number;
  newMastery: number;
  createdAt: string;
}

export interface SubjectInfo {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon?: string;
  color?: string;
}

interface DashboardViewProps {
  concepts: ConceptStat[];
  recommendedConcept: ConceptStat | null;
  averageMastery: number;
  totalAttempts: number;
  overallAccuracy: number;
  recentAttempts: AttemptLogItem[];
  onStartQuiz: (conceptId?: string) => void;
  loading: boolean;
  currentSubject?: SubjectInfo | null;
  allSubjects?: Array<{ id: string; name: string; slug: string; color: string }>;
  onChangeSubject?: () => void;
  onSelectSubject?: (slug: string) => void;
}

const SUBJECT_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  sql: Database,
  java: Coffee,
  python: Terminal,
  html: Globe,
  "data-structures": Network,
  cpp: Cpu,
};

const SUBJECT_NEON: Record<string, string> = {
  sql: "#00b4d8",
  java: "#ffcc00",
  python: "#00ff66",
  html: "#ff0055",
  "data-structures": "#9d4edd",
  cpp: "#00ffcc",
};

export function DashboardView({
  concepts,
  recommendedConcept,
  averageMastery,
  totalAttempts,
  overallAccuracy,
  recentAttempts,
  onStartQuiz,
  loading,
  currentSubject,
  allSubjects = [],
  onChangeSubject,
  onSelectSubject,
}: DashboardViewProps) {
  if (loading) {
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
          Loading quest data & computing mastery scores...
        </p>
      </div>
    );
  }

  const masteredCount = concepts.filter((c) => c.score >= 0.8).length;
  const ActiveIcon = currentSubject?.slug
    ? SUBJECT_ICON_MAP[currentSubject.slug] || BookOpen
    : BookOpen;
  const activeNeon = currentSubject?.slug
    ? SUBJECT_NEON[currentSubject.slug] || "#00ffcc"
    : "#00ffcc";

  return (
    <div className="space-y-8 pb-12">
      {/* 0. Subject Navigation & Quick Switcher Bar */}
      <div
        className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
        style={{
          padding: "20px 24px",
          backgroundColor: "#141420",
          border: `3px solid ${activeNeon}`,
          boxShadow: `4px 4px 0px #000, 0 0 15px ${activeNeon}33`,
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 flex items-center justify-center shrink-0"
            style={{
              border: `3px solid ${activeNeon}`,
              boxShadow: `2px 2px 0px #000, 0 0 10px ${activeNeon}44`,
              backgroundColor: "rgba(0,0,0,0.3)",
              color: activeNeon,
            }}
          >
            <ActiveIcon className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "7px",
                  color: "#6a6a8a",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                Active Quest
              </span>
              <span
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "7px",
                  padding: "2px 8px",
                  border: "2px solid #2a2a44",
                  boxShadow: "2px 2px 0px #000",
                  backgroundColor: "#0d0d14",
                  color: activeNeon,
                }}
              >
                6 STAGES
              </span>
            </div>
            <h2
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "1rem",
                color: activeNeon,
                textShadow: `2px 2px 0px #000, 0 0 10px ${activeNeon}44`,
                marginTop: "4px",
              }}
            >
              {currentSubject?.name || "Curriculum Track"}
            </h2>
            <p
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: "16px",
                color: "#6a6a8a",
                marginTop: "2px",
              }}
            >
              {currentSubject?.description}
            </p>
          </div>
        </div>

        {/* Quick subject pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end pt-2 md:pt-0"
          style={{ borderTop: "none" }}
        >
          {allSubjects.map((sub) => {
            const isSelected = currentSubject?.slug === sub.slug;
            const subNeon = SUBJECT_NEON[sub.slug] || "#00ffcc";
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubject && onSelectSubject(sub.slug)}
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "7px",
                  padding: "6px 12px",
                  backgroundColor: isSelected ? subNeon : "#0d0d14",
                  color: isSelected ? "#000" : "#6a6a8a",
                  border: `2px solid ${isSelected ? subNeon : "#2a2a44"}`,
                  boxShadow: isSelected
                    ? `3px 3px 0px #000, 0 0 8px ${subNeon}44`
                    : "2px 2px 0px #000",
                  textTransform: "uppercase",
                }}
              >
                {sub.name}
              </button>
            );
          })}

          {onChangeSubject && (
            <button
              onClick={onChangeSubject}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "7px",
                padding: "6px 12px",
                backgroundColor: "#0d0d14",
                color: "#00ffcc",
                border: "2px solid #00ffcc",
                boxShadow: "2px 2px 0px #000",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
              }}
            >
              <RefreshCw className="w-3 h-3" />
              <span>All Quests</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Recommended Gap-Detection Banner */}
      {recommendedConcept && (
        <div
          className="relative overflow-hidden"
          style={{
            padding: "24px 28px",
            backgroundColor: "#141420",
            border: "3px solid #ff0055",
            boxShadow: "4px 4px 0px #000, 0 0 15px rgba(255, 0, 85, 0.2)",
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div
                className="inline-flex items-center gap-2"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "8px",
                  padding: "4px 12px",
                  border: "2px solid #ff0055",
                  boxShadow: "2px 2px 0px #000",
                  backgroundColor: "rgba(255, 0, 85, 0.1)",
                  color: "#ff0055",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                <Compass className="w-3.5 h-3.5" />
                ⚠ BOSS WEAKNESS DETECTED
              </div>

              <h2
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "1.1rem",
                  color: "#ff0055",
                  textShadow: "2px 2px 0px #000, 0 0 12px rgba(255, 0, 85, 0.4)",
                  lineHeight: "1.6",
                }}
              >
                Focus: {recommendedConcept.name}
              </h2>

              <p
                style={{
                  fontFamily: "'VT323', monospace",
                  fontSize: "18px",
                  color: "#a0a0c0",
                  lineHeight: "1.4",
                }}
              >
                {recommendedConcept.description}
              </p>

              <div
                className="flex items-center gap-4 pt-1"
                style={{
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "7px",
                  color: "#6a6a8a",
                }}
              >
                <span>
                  Stage:{" "}
                  <strong style={{ color: "#e8e8f0" }}>
                    #{recommendedConcept.orderIndex} of {concepts.length}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Mastery:{" "}
                  <strong style={{ color: "#ff0055" }}>
                    {(recommendedConcept.score * 100).toFixed(0)}%
                  </strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => onStartQuiz(recommendedConcept.id)}
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "9px",
                padding: "14px 24px",
                backgroundColor: "#ff0055",
                color: "#ffffff",
                border: "3px solid #000",
                boxShadow: "4px 4px 0px #000, 0 0 12px rgba(255, 0, 85, 0.3)",
                display: "inline-flex",
                alignItems: "center",
                gap: "10px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                whiteSpace: "nowrap",
              }}
            >
              <span>⚔ BATTLE NOW</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Mastery */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#141420",
            border: "3px solid #2a2a44",
            boxShadow: "4px 4px 0px #000",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "7px",
                color: "#6a6a8a",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              {currentSubject?.name || "Subject"} XP
            </span>
            <TrendingUp className="w-4 h-4" style={{ color: "#00ff66" }} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "1.5rem",
                color: "#00ff66",
                textShadow: "2px 2px 0px #000, 0 0 8px rgba(0, 255, 102, 0.3)",
              }}
            >
              {(averageMastery * 100).toFixed(0)}%
            </span>
            <span
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: "16px",
                color: "#6a6a8a",
              }}
            >
              power level
            </span>
          </div>
          <div
            className="mt-3 w-full overflow-hidden"
            style={{
              height: "8px",
              backgroundColor: "#0d0d12",
              border: "2px solid #2a2a44",
              boxShadow: "inset 0 1px 0 rgba(0,0,0,0.5)",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${Math.min(100, averageMastery * 100)}%`,
                backgroundColor: "#00ff66",
                boxShadow: "0 0 6px rgba(0, 255, 102, 0.4)",
                transition: "width 0.5s",
              }}
            />
          </div>
        </div>

        {/* KPI 2: Precision */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#141420",
            border: "3px solid #2a2a44",
            boxShadow: "4px 4px 0px #000",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "7px",
                color: "#6a6a8a",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Hit Rate
            </span>
            <Target className="w-4 h-4" style={{ color: "#ff0055" }} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "1.5rem",
                color: "#00ffcc",
                textShadow: "2px 2px 0px #000, 0 0 8px rgba(0, 255, 204, 0.3)",
              }}
            >
              {(overallAccuracy * 100).toFixed(0)}%
            </span>
            <span
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: "16px",
                color: "#6a6a8a",
              }}
            >
              accuracy
            </span>
          </div>
          <p
            className="mt-3"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: "15px",
              color: "#6a6a8a",
            }}
          >
            Across {totalAttempts} combat attempts
          </p>
        </div>

        {/* KPI 3: Mastered */}
        <div
          style={{
            padding: "20px",
            backgroundColor: "#141420",
            border: "3px solid #2a2a44",
            boxShadow: "4px 4px 0px #000",
          }}
        >
          <div className="flex items-center justify-between">
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "7px",
                color: "#6a6a8a",
                textTransform: "uppercase",
                letterSpacing: "1px",
              }}
            >
              Stages Cleared
            </span>
            <Award className="w-4 h-4" style={{ color: "#ffcc00" }} />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "1.5rem",
                color: "#ffcc00",
                textShadow: "2px 2px 0px #000, 0 0 8px rgba(255, 204, 0, 0.3)",
              }}
            >
              {masteredCount}/{concepts.length}
            </span>
            <span
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: "16px",
                color: "#6a6a8a",
              }}
            >
              ({((masteredCount / Math.max(1, concepts.length)) * 100).toFixed(0)}%)
            </span>
          </div>
          <div
            className="mt-3 p-2"
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: "14px",
              color: "#6a6a8a",
              backgroundColor: "#0d0d14",
              border: "2px solid #2a2a44",
            }}
          >
            <span style={{ color: "#4a4a6a" }}>DMG Formula: </span>
            <span>new = old + 0.35 × (hit − old) × W(lvl)</span>
          </div>
        </div>
      </div>

      {/* 3. Concepts / Skill Tree Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3
              className="flex items-center gap-2"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "0.85rem",
                color: "#ffcc00",
                textShadow: "1px 1px 0px #000",
              }}
            >
              <Layers className="w-5 h-5" style={{ color: "#00ff66" }} />
              {currentSubject?.name || "Subject"}: Skill Tree
            </h3>
            <p
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: "16px",
                color: "#6a6a8a",
                marginTop: "4px",
              }}
            >
              Master each stage sequentially. {'<'}60% = unresolved weakness.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {concepts.map((concept) => {
            const badge = getMasteryBadge(concept.score);
            const isRecommended = recommendedConcept?.id === concept.id;
            const masteryPct = (concept.score * 100);
            const barColor =
              concept.score >= 0.8
                ? "#00ff66"
                : concept.score >= 0.6
                ? "#00b4d8"
                : concept.score >= 0.4
                ? "#ffcc00"
                : "#ff0055";

            return (
              <div
                key={concept.id}
                className="group relative flex flex-col justify-between"
                style={{
                  padding: "20px",
                  backgroundColor: isRecommended ? "#1a1020" : "#141420",
                  border: `3px solid ${isRecommended ? "#ff0055" : "#2a2a44"}`,
                  boxShadow: isRecommended
                    ? "4px 4px 0px #000, 0 0 12px rgba(255, 0, 85, 0.2)"
                    : "4px 4px 0px #000",
                }}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: "7px",
                        padding: "3px 8px",
                        border: "2px solid #2a2a44",
                        boxShadow: "2px 2px 0px #000",
                        backgroundColor: "#0d0d14",
                        color: "#a0a0c0",
                      }}
                    >
                      STAGE {String(concept.orderIndex).padStart(2, "0")}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: "7px",
                        padding: "3px 8px",
                        border: `2px solid ${barColor}`,
                        boxShadow: "2px 2px 0px #000",
                        backgroundColor: `${barColor}15`,
                        color: barColor,
                      }}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <h4
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: "0.7rem",
                      color: "#e8e8f0",
                      lineHeight: "1.6",
                      marginBottom: "8px",
                      textShadow: "1px 1px 0px #000",
                    }}
                  >
                    {concept.name}
                  </h4>

                  <p
                    style={{
                      fontFamily: "'VT323', monospace",
                      fontSize: "16px",
                      color: "#6a6a8a",
                      lineHeight: "1.3",
                      marginBottom: "16px",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {concept.description}
                  </p>
                </div>

                <div
                  className="space-y-3 pt-3"
                  style={{ borderTop: "2px solid #2a2a44" }}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span
                        style={{
                          fontFamily: "'VT323', monospace",
                          fontSize: "15px",
                          color: "#6a6a8a",
                        }}
                      >
                        Mastery Level
                      </span>
                      <span
                        style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: "9px",
                          color: barColor,
                        }}
                      >
                        {masteryPct.toFixed(0)}%
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
                          width: `${Math.min(100, Math.max(3, masteryPct))}%`,
                          height: "100%",
                          backgroundColor: barColor,
                          boxShadow: `0 0 4px ${barColor}55`,
                          transition: "width 0.5s",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span
                      style={{
                        fontFamily: "'VT323', monospace",
                        fontSize: "14px",
                        color: "#4a4a6a",
                      }}
                    >
                      {concept.totalQuestions} Q • {concept.attemptsCount} attempts
                    </span>
                    <button
                      onClick={() => onStartQuiz(concept.id)}
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: "7px",
                        padding: "5px 10px",
                        backgroundColor: "#0d0d14",
                        color: "#00ffcc",
                        border: "2px solid #00ffcc",
                        boxShadow: "2px 2px 0px #000",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <span>DRILL</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Attempt Log */}
      {recentAttempts.length > 0 && (
        <div
          style={{
            padding: "24px",
            backgroundColor: "#141420",
            border: "3px solid #2a2a44",
            boxShadow: "4px 4px 0px #000",
          }}
        >
          <h4
            className="mb-4 flex items-center gap-2"
            style={{
              fontFamily: "'Press Start 2P', monospace",
              fontSize: "0.7rem",
              color: "#00ffcc",
              textShadow: "1px 1px 0px #000",
            }}
          >
            <TrendingUp className="w-4 h-4" style={{ color: "#00ff66" }} />
            Battle Log ({currentSubject?.name || "Subject"})
          </h4>

          <div>
            {recentAttempts.map((attempt, idx) => (
              <div
                key={attempt.id}
                className="py-3 flex items-center justify-between gap-4"
                style={{
                  borderBottom:
                    idx < recentAttempts.length - 1
                      ? "1px solid #2a2a44"
                      : "none",
                }}
              >
                <div className="flex items-center gap-3">
                  {attempt.isCorrect ? (
                    <CheckCircle className="w-4 h-4 shrink-0" style={{ color: "#00ff66" }} />
                  ) : (
                    <XCircle className="w-4 h-4 shrink-0" style={{ color: "#ff0055" }} />
                  )}
                  <div>
                    <span
                      style={{
                        fontFamily: "'VT323', monospace",
                        fontSize: "18px",
                        color: attempt.isCorrect ? "#00ff66" : "#ff0055",
                      }}
                    >
                      {attempt.isCorrect ? "✓ HIT" : "✗ MISS"}
                    </span>
                    <span
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: "7px",
                        color: "#4a4a6a",
                        marginLeft: "8px",
                      }}
                    >
                      (LVL {attempt.difficultyAtAttempt})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    style={{
                      fontFamily: "'VT323', monospace",
                      fontSize: "16px",
                      color: "#6a6a8a",
                    }}
                  >
                    XP:{" "}
                    <strong style={{ color: "#e8e8f0" }}>
                      {((attempt.previousMastery ?? 0) * 100).toFixed(0)}%
                    </strong>
                    {" → "}
                    <strong
                      style={{
                        color:
                          (attempt.newMastery ?? 0) >= (attempt.previousMastery ?? 0)
                            ? "#00ff66"
                            : "#ff0055",
                      }}
                    >
                      {((attempt.newMastery ?? 0) * 100).toFixed(0)}%
                    </strong>
                  </span>
                  <span
                    style={{
                      fontFamily: "'Press Start 2P', monospace",
                      fontSize: "7px",
                      color: "#4a4a6a",
                    }}
                  >
                    {new Date(attempt.createdAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
