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
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-2 border-[#B4472A] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-600 font-sans">
          Loading learning track & computing linear concept mastery...
        </p>
      </div>
    );
  }

  const masteredCount = concepts.filter((c) => c.score >= 0.8).length;
  const ActiveIcon = currentSubject?.slug
    ? SUBJECT_ICON_MAP[currentSubject.slug] || BookOpen
    : BookOpen;

  return (
    <div className="space-y-8 pb-12">
      {/* 0. Subject Navigation & Quick Switcher Bar */}
      <div
        className="rounded-2xl border p-5 sm:p-6 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all"
        style={{
          backgroundColor: "#FFFFFF",
          borderColor: "#E5E0D8",
        }}
      >
        <div className="flex items-center gap-4">
          <div
            className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm shrink-0"
            style={{
              backgroundColor: currentSubject?.color || "#2B5D4F",
            }}
          >
            <ActiveIcon className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-semibold uppercase tracking-wider text-stone-500">
                Active Track
              </span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 font-mono font-medium">
                6 Topics to Master
              </span>
            </div>
            <h2 className="text-2xl font-serif font-bold text-stone-900 tracking-tight">
              {currentSubject?.name || "Curriculum Track"}
            </h2>
            <p className="text-xs text-stone-500 line-clamp-1 max-w-xl">
              {currentSubject?.description}
            </p>
          </div>
        </div>

        {/* Quick subject pills and Change Subject button */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-start md:justify-end pt-2 md:pt-0 border-t md:border-t-0 border-stone-100">
          {allSubjects.map((sub) => {
            const isSelected = currentSubject?.slug === sub.slug;
            return (
              <button
                key={sub.id}
                onClick={() => onSelectSubject && onSelectSubject(sub.slug)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  isSelected
                    ? "bg-stone-900 text-white shadow-sm"
                    : "bg-stone-100 text-stone-700 hover:bg-stone-200"
                }`}
              >
                {sub.name}
              </button>
            );
          })}

          {onChangeSubject && (
            <button
              onClick={onChangeSubject}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-all ml-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>All Tracks</span>
            </button>
          )}
        </div>
      </div>

      {/* 1. Recommended Next Concept Gap-Detection Banner */}
      {recommendedConcept && (
        <div
          className="relative overflow-hidden rounded-2xl border p-6 md:p-8 shadow-sm transition-all"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E5E0D8",
          }}
        >
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              {/* Algorithm Recommendation Pill Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B4472A]/10 border border-[#B4472A]/30 text-[#B4472A] text-xs font-bold tracking-wide uppercase">
                <Compass className="w-4 h-4 text-[#B4472A]" />
                Algorithm Recommendation • Earliest Gap &lt; 60%
              </div>

              <h2 className="text-2xl md:text-3xl font-serif font-bold tracking-tight text-stone-900">
                Focus on: {recommendedConcept.name}
              </h2>

              <p className="text-sm text-stone-600 leading-relaxed font-sans">
                {recommendedConcept.description}
              </p>

              <div className="flex items-center gap-4 pt-1 text-xs text-stone-500 font-mono">
                <span>
                  Sequence Order:{" "}
                  <strong className="text-stone-800">
                    Topic #{recommendedConcept.orderIndex} of {concepts.length}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Current Mastery:{" "}
                  <strong className="text-[#B4472A] font-bold">
                    {(recommendedConcept.score * 100).toFixed(0)}%
                  </strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => onStartQuiz(recommendedConcept.id)}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl font-semibold text-sm transition-all shadow-sm hover:opacity-95 active:scale-98 text-white shrink-0"
              style={{
                backgroundColor: "var(--color-recommended, #B4472A)",
              }}
            >
              <span>Launch Adaptive Session</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 2. High-Level KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* KPI 1: Curriculum Mastery */}
        <div
          className="p-5 rounded-2xl border shadow-sm"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              {currentSubject?.name || "Subject"} Mastery
            </span>
            <TrendingUp className="w-4 h-4 text-[#2B5D4F]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
              {(averageMastery * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-stone-500 font-sans">track average</span>
          </div>
          <div className="mt-3 w-full bg-stone-100 rounded-full h-2 overflow-hidden">
            <div
              className="h-full transition-all duration-500 rounded-full"
              style={{
                width: `${Math.min(100, averageMastery * 100)}%`,
                backgroundColor: "var(--color-mastered, #2B5D4F)",
              }}
            />
          </div>
        </div>

        {/* KPI 2: Session Precision */}
        <div
          className="p-5 rounded-2xl border shadow-sm"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
              Session Precision
            </span>
            <Target className="w-4 h-4 text-[#B4472A]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
              {(overallAccuracy * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-stone-500 font-sans">accuracy rate</span>
          </div>
          <p className="mt-3 text-xs text-stone-500">
            Across {totalAttempts} live response attempts in this subject
          </p>
        </div>

        {/* KPI 3: Concepts Mastered */}
        <div
          className="p-5 rounded-2xl border shadow-sm flex flex-col justify-between"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Topics Mastered
              </span>
              <Award className="w-4 h-4 text-amber-600" />
            </div>
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
                {masteredCount} of {concepts.length}
              </span>
              <span className="text-xs text-stone-500 font-sans">
                ({((masteredCount / Math.max(1, concepts.length)) * 100).toFixed(0)}%)
              </span>
            </div>
          </div>
          <div className="mt-3 font-mono text-[11px] text-stone-700 bg-stone-50 p-2 rounded-lg border border-stone-200">
            <span className="text-stone-400 font-sans">Formula: </span>
            <span>new = old + 0.35 × (outcome − old) × W(diff)</span>
          </div>
        </div>
      </div>

      {/* 3. Linear Concepts Curriculum Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-serif font-bold text-stone-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-[#2B5D4F]" />
              {currentSubject?.name || "Subject"}: 6 Topics to Master
            </h3>
            <p className="text-xs text-stone-500">
              Master each topic sequentially. Mastery &lt; 60% flags an unresolved foundational gap.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {concepts.map((concept) => {
            const badge = getMasteryBadge(concept.score);
            const isRecommended = recommendedConcept?.id === concept.id;

            return (
              <div
                key={concept.id}
                className={`relative flex flex-col justify-between p-5 rounded-2xl transition-all duration-200 border shadow-sm ${
                  isRecommended
                    ? "bg-[#FFFDFB] border-[#B4472A] ring-2 ring-[#B4472A]/20"
                    : "bg-white border-[#E5E0D8] hover:border-stone-400"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-stone-100 text-stone-700 border border-stone-200">
                      Topic {String(concept.orderIndex).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${badge.bgColor} ${badge.textColor} ${badge.borderColor}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <h4 className="text-lg font-serif font-bold text-stone-900 mb-2 leading-tight">
                    {concept.name}
                  </h4>

                  <p className="text-xs text-stone-600 line-clamp-3 leading-relaxed font-sans mb-4">
                    {concept.description}
                  </p>
                </div>

                <div className="space-y-3 pt-3 border-t border-stone-100">
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1">
                      <span className="text-stone-500 font-sans">Mastery Level</span>
                      <span className="font-mono font-bold text-stone-800">
                        {(concept.score * 100).toFixed(0)}%
                      </span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(3, concept.score * 100))}%`,
                          backgroundColor:
                            concept.score >= 0.8
                              ? "var(--color-mastered, #2B5D4F)"
                              : concept.score >= 0.6
                              ? "var(--color-proficient, #2563EB)"
                              : concept.score >= 0.4
                              ? "var(--color-review, #D97706)"
                              : "var(--color-gap, #B4472A)",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-stone-500 font-sans">
                      {concept.totalQuestions} questions • {concept.attemptsCount} attempts
                    </span>
                    <button
                      onClick={() => onStartQuiz(concept.id)}
                      className="text-xs font-semibold text-stone-800 hover:text-[#B4472A] inline-flex items-center gap-1 transition-colors"
                    >
                      <span>Drill</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Recent Attempt Audit Log */}
      {recentAttempts.length > 0 && (
        <div
          className="rounded-2xl border p-6 shadow-sm"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
        >
          <h4 className="text-base font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#2B5D4F]" />
            Recent Live Attempts ({currentSubject?.name || "Subject"})
          </h4>

          <div className="divide-y divide-stone-100">
            {recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="py-3 flex items-center justify-between gap-4 text-xs font-sans"
              >
                <div className="flex items-center gap-3">
                  {attempt.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-[#2B5D4F] shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#B4472A] shrink-0" />
                  )}
                  <div>
                    <span className="font-semibold text-stone-800">
                      {attempt.isCorrect ? "Correct Response" : "Incorrect Response"}
                    </span>
                    <span className="text-stone-400 font-mono text-[11px] ml-2">
                      (Difficulty Level {attempt.difficultyAtAttempt})
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="text-stone-500">
                    Mastery:{" "}
                    <strong>{((attempt.previousMastery ?? 0) * 100).toFixed(0)}%</strong>
                    {" → "}
                    <strong
                      className={
                        (attempt.newMastery ?? 0) >= (attempt.previousMastery ?? 0)
                          ? "text-[#2B5D4F]"
                          : "text-[#B4472A]"
                      }
                    >
                      {((attempt.newMastery ?? 0) * 100).toFixed(0)}%
                    </strong>
                  </span>
                  <span className="text-stone-400">
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
