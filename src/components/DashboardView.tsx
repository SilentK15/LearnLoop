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
        <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-slate-400 font-mono">
          Querying Supabase PostgreSQL & computing linear mastery...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-12">
      {/* 1. Recommended Next Concept Gap-Detection Banner */}
      {recommendedConcept && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-950/80 via-indigo-950/60 to-slate-900 border border-blue-500/30 p-6 md:p-8 shadow-2xl shadow-blue-950/50">
          <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold tracking-wide uppercase">
                <Compass className="w-3.5 h-3.5 text-blue-400" />
                Algorithm Recommendation • Earliest Gap &lt; 60%
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white">
                Focus on: {recommendedConcept.name}
              </h2>
              <p className="text-sm text-slate-300 leading-relaxed">
                {recommendedConcept.description}
              </p>
              <div className="flex items-center gap-4 pt-1 text-xs text-slate-400 font-mono">
                <span>
                  Sequence Order:{" "}
                  <strong className="text-white">
                    #{recommendedConcept.orderIndex} of {concepts.length}
                  </strong>
                </span>
                <span>•</span>
                <span>
                  Current Mastery:{" "}
                  <strong className="text-amber-400">
                    {(recommendedConcept.score * 100).toFixed(0)}%
                  </strong>
                </span>
              </div>
            </div>

            <button
              onClick={() => onStartQuiz(recommendedConcept.id)}
              className="inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 active:scale-95 transition-all group shrink-0"
            >
              <span>Launch Adaptive Session</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      )}

      {/* 2. High-Level KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Curriculum Mastery
            </span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {(averageMastery * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">overall average</span>
          </div>
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${Math.min(100, averageMastery * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Session Precision
            </span>
            <Target className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {(overallAccuracy * 100).toFixed(0)}%
            </span>
            <span className="text-xs text-slate-400">accuracy rate</span>
          </div>
          <p className="mt-3 text-xs text-slate-400">
            Across {totalAttempts} live response attempts
          </p>
        </div>

        <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">
              Mastery Formula
            </span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-3 font-mono text-xs text-blue-300 bg-blue-950/40 p-2 rounded-lg border border-blue-900/40">
            new = old + 0.35 × (outcome - old) × W(diff)
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            Self-stabilizing dynamic Bayesian weight
          </p>
        </div>
      </div>

      {/* 3. Linear Concepts Curriculum Breakdown */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-blue-400" />
              Linear Concept Sequence (orderIndex 1 – {concepts.length})
            </h3>
            <p className="text-xs text-slate-400">
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
                className={`relative flex flex-col justify-between p-5 rounded-xl transition-all duration-200 border ${
                  isRecommended
                    ? "bg-slate-900/90 border-blue-500 shadow-lg shadow-blue-500/10 ring-1 ring-blue-500/50"
                    : "bg-slate-900/50 border-slate-800 hover:border-slate-700"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                      Step {String(concept.orderIndex).padStart(2, "0")}
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-medium border ${badge.bgColor} ${badge.textColor} ${badge.borderColor}`}
                    >
                      {badge.label}
                    </span>
                  </div>

                  <h4 className="font-semibold text-base text-white tracking-tight">
                    {concept.name}
                  </h4>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {concept.description}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-400">Mastery Level</span>
                    <span className="font-mono font-bold text-white">
                      {(concept.score * 100).toFixed(0)}%
                    </span>
                  </div>

                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-500 ${
                        concept.score >= 0.8
                          ? "bg-emerald-500"
                          : concept.score >= 0.6
                          ? "bg-blue-500"
                          : concept.score >= 0.3
                          ? "bg-amber-500"
                          : "bg-rose-500"
                      }`}
                      style={{
                        width: `${Math.min(100, Math.max(3, concept.score * 100))}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] text-slate-400">
                      {concept.totalQuestions} questions • {concept.attemptsCount} attempts
                    </span>
                    <button
                      onClick={() => onStartQuiz(concept.id)}
                      className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 active:scale-95 transition-all"
                    >
                      Drill <ArrowRight className="w-3 h-3" />
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
        <div className="p-6 rounded-xl bg-slate-900/50 border border-slate-800">
          <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Live Attempt Feed (Recent Live Trials)
          </h4>
          <div className="divide-y divide-slate-800/80">
            {recentAttempts.map((attempt) => (
              <div
                key={attempt.id}
                className="py-3 flex items-center justify-between gap-4 text-xs font-mono"
              >
                <div className="flex items-center gap-3">
                  {attempt.isCorrect ? (
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  )}
                  <span className="text-slate-300">
                    Difficulty {attempt.difficultyAtAttempt}/5
                  </span>
                  <span
                    className={
                      attempt.isCorrect ? "text-emerald-400" : "text-rose-400"
                    }
                  >
                    {attempt.isCorrect ? "CORRECT" : "INCORRECT"}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="text-slate-400">
                    {(attempt.previousMastery * 100).toFixed(0)}% →{" "}
                    <strong className="text-white">
                      {(attempt.newMastery * 100).toFixed(0)}%
                    </strong>
                  </span>
                  <span
                    className={`text-[11px] px-2 py-0.5 rounded ${
                      attempt.newMastery >= attempt.previousMastery
                        ? "bg-emerald-500/10 text-emerald-400"
                        : "bg-rose-500/10 text-rose-400"
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
