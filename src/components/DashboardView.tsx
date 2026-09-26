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

interface DashboardViewProps {
  concepts: ConceptStat[];
  recommendedConcept: ConceptStat | null;
  averageMastery: number;
  totalAttempts: number;
  overallAccuracy: number;
  recentAttempts: AttemptLogItem[];
  onStartQuiz: (conceptId?: string) => void;
  loading: boolean;
}

export function DashboardView({
  concepts,
  recommendedConcept,
  averageMastery,
  totalAttempts,
  overallAccuracy,
  recentAttempts,
  onStartQuiz,
  loading,
}: DashboardViewProps) {
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
        <div className="w-10 h-10 border-2 border-[#B4472A] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-stone-600 font-sans">
          Querying Supabase PostgreSQL & computing linear mastery...
        </p>
      </div>
    );
  }

  const masteredCount = concepts.filter((c) => c.score >= 0.8).length;

  return (
    <div className="space-y-8 pb-12">
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
              {/* Algorithm Recommendation Pill Badge - Fixed High Contrast */}
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
                    #{recommendedConcept.orderIndex} of {concepts.length}
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
              Curriculum Mastery
            </span>
            <TrendingUp className="w-4 h-4 text-[#2B5D4F]" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-serif font-bold text-stone-900 tracking-tight">
              {(averageMastery * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-stone-500 font-sans">overall average</span>
          </div>
          <div className="mt-3 w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
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
            Across {totalAttempts} live response attempts
          </p>
        </div>

        {/* KPI 3: Adaptive Mastery Score (FIXED: Shows real metrics & clean formula) */}
        <div
          className="p-5 rounded-2xl border shadow-sm flex flex-col justify-between"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
                Concepts Mastered
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
              Linear Concept Sequence (orderIndex 1 – {concepts.length})
            </h3>
            <p className="text-xs text-stone-500">
              Concepts progress strictly linearly. Mastery &lt; 60% indicates an
              unresolved foundational gap.
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
                      Step {String(concept.orderIndex).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${badge.bgColor} ${badge.textColor} ${badge.borderColor}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <h4 className="font-serif font-bold text-base text-stone-900 tracking-tight">
                    {concept.name}
                  </h4>
                  <p className="text-xs text-stone-600 mt-1 line-clamp-2">
                    {concept.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-100 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-stone-500">Mastery Level</span>
                    <span className="font-mono font-bold text-stone-900">
                      {(concept.score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="w-full bg-stone-100 h-2 rounded-full overflow-hidden border border-stone-200">
                    <div
                      className="h-full transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(100, Math.max(3, concept.score * 100))}%`,
                        backgroundColor:
                          concept.score >= 0.8
                            ? "#2B5D4F"
                            : concept.score >= 0.6
                            ? "#2563EB"
                            : concept.score >= 0.3
                            ? "#D97706"
                            : "#B4472A",
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-stone-500">
                      {concept.totalQuestions} questions • {concept.attemptsCount} attempts
                    </span>
                    <button
                      onClick={() => onStartQuiz(concept.id)}
                      className="text-xs font-semibold text-[#B4472A] hover:underline flex items-center gap-1 active:scale-95 transition-all"
                    >
                      <span>Drill</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Live Attempt Stream */}
      {recentAttempts.length > 0 && (
        <div
          className="p-6 rounded-2xl border shadow-sm"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
        >
          <h4 className="text-sm font-serif font-bold text-stone-900 mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#2B5D4F] animate-pulse" />
            Live Attempt Feed (Recent Live Trials)
          </h4>
          <div className="divide-y divide-stone-100">
            {recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="py-3 flex items-center justify-between gap-4 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  {attempt.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-[#2B5D4F] shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-[#B4472A] shrink-0" />
                  )}
                  <span className="text-stone-700">
                    Difficulty {attempt.difficultyAtAttempt}/5
                  </span>
                  <span
                    className={
                      attempt.isCorrect
                        ? "text-[#2B5D4F] font-bold"
                        : "text-[#B4472A] font-bold"
                    }
                  >
                    {attempt.isCorrect ? "CORRECT" : "INCORRECT"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-stone-600">
                    {(attempt.previousMastery * 100).toFixed(0)}% →{" "}
                    <strong className="text-stone-900">
                      {(attempt.newMastery * 100).toFixed(0)}%
                    </strong>
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded font-semibold ${
                      attempt.newMastery >= attempt.previousMastery
                        ? "bg-[#2B5D4F]/10 text-[#2B5D4F]"
                        : "bg-[#B4472A]/10 text-[#B4472A]"
                    }`}
                  >
                    {attempt.newMastery >= attempt.previousMastery ? "+" : ""}
                    {(
                      (attempt.newMastery - attempt.previousMastery) *
                      100
                    ).toFixed(0)}
                    %
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
