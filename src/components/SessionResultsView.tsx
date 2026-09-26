"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  Brain,
  Layers,
  Award,
} from "lucide-react";
import confetti from "canvas-confetti";

interface SessionResultsProps {
  sessionData: {
    startMasteries: Record<string, number>;
    endMasteries: Record<string, number>;
    conceptNames: Record<string, string>;
    attempts: Array<{
      conceptId: string;
      conceptName: string;
      difficulty: number;
      isCorrect: boolean;
    }>;
  };
  onReturnToDashboard: () => void;
  onStartNewQuiz: () => void;
}

export function SessionResultsView({
  sessionData,
  onReturnToDashboard,
  onStartNewQuiz,
}: SessionResultsProps) {
  const [summary, setSummary] = useState<string>("");
  const [provider, setProvider] = useState<string>("gemini-1.5-flash");
  const [loadingAI, setLoadingAI] = useState<boolean>(true);

  const { startMasteries, endMasteries, conceptNames, attempts } = sessionData;

  // List of concepts evaluated
  const conceptIds = Array.from(
    new Set([...Object.keys(startMasteries), ...Object.keys(endMasteries)])
  );

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.isCorrect).length;
  const accuracy =
    totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

  // Trigger celebration on load
  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Call API for Gemini AI synthesis
    const fetchSummary = async () => {
      try {
        setLoadingAI(true);
        const res = await fetch("/api/session/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(sessionData),
        });

        const data = await res.json();
        if (res.ok && data.summary) {
          setSummary(data.summary);
          setProvider(data.provider || "gemini");
        } else {
          setSummary("Mastery updated across all evaluated curriculum concepts.");
        }
      } catch (err) {
        console.error("AI summary error:", err);
        setSummary("Live mastery delta logged to database.");
      } finally {
        setLoadingAI(false);
      }
    };

    fetchSummary();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* 1. Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" /> Adaptive Session Completed
        </div>
        <h2 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight">
          Session Delta & Cognitive Growth
        </h2>
        <p className="text-sm text-slate-400 max-w-xl mx-auto">
          Here is how your linear concept masteries shifted during this session,
          synthesized with Google Gemini AI.
        </p>
      </div>

      {/* 2. Top-level session metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-xs text-slate-400">Total Attempts</span>
          <div className="text-3xl font-extrabold text-white mt-1">
            {totalAttempts}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            adaptive questions answered
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-xs text-slate-400">Session Accuracy</span>
          <div className="text-3xl font-extrabold text-emerald-400 mt-1">
            {accuracy.toFixed(0)}%
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            {correctAttempts} correct of {totalAttempts}
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 text-center">
          <span className="text-xs text-slate-400">Active Concepts</span>
          <div className="text-3xl font-extrabold text-blue-400 mt-1">
            {conceptIds.length}
          </div>
          <span className="text-[11px] text-slate-500 font-mono">
            curriculum areas calibrated
          </span>
        </div>
      </div>

      {/* 3. Before vs After Mastery Comparison */}
      <div className="p-6 md:p-8 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-400" />
            Before vs. After Mastery Breakdown
          </h3>
          <span className="text-xs text-slate-400 font-mono">
            Live Recomputed Delta
          </span>
        </div>

        <div className="space-y-4">
          {conceptIds.map((id) => {
            const name = conceptNames[id] || "Concept";
            const before = startMasteries[id] ?? 0.0;
            const after = endMasteries[id] ?? before;
            const delta = after - before;

            return (
              <div
                key={id}
                className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-semibold text-sm text-white">{name}</h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-mono">
                      {(before * 100).toFixed(0)}% →{" "}
                      <strong className="text-white">
                        {(after * 100).toFixed(0)}%
                      </strong>
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 ${
                        delta > 0
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                          : delta < 0
                          ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {delta > 0 ? (
                        <TrendingUp className="w-3 h-3" />
                      ) : delta < 0 ? (
                        <TrendingDown className="w-3 h-3" />
                      ) : null}
                      {delta >= 0 ? "+" : ""}
                      {(delta * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Comparative Double Bar */}
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
                    <span className="w-12">Before</span>
                    <div className="flex-1 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-slate-500 h-full"
                        style={{ width: `${Math.min(100, before * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-slate-300 font-mono">
                    <span className="w-12 font-bold text-white">After</span>
                    <div className="flex-1 bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${
                          after >= 0.8
                            ? "bg-emerald-500"
                            : after >= 0.6
                            ? "bg-blue-500"
                            : after >= 0.3
                            ? "bg-amber-500"
                            : "bg-rose-500"
                        }`}
                        style={{ width: `${Math.min(100, after * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Google Gemini 1.5 AI Plain-English Diagnostic Analysis */}
      <div className="p-6 md:p-8 rounded-2xl bg-gradient-to-br from-blue-950/40 via-indigo-950/20 to-slate-900 border border-blue-500/30 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
              <Brain className="w-4 h-4 text-cyan-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">
                Cognitive Growth & Gap Synthesis
              </h3>
              <p className="text-xs text-slate-400">
                Plain-English pedagogical analysis of performance shifts
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-cyan-400" />
            {provider.includes("gemini")
              ? "Google Gemini 1.5"
              : "Smart Diagnostic Engine"}
          </span>
        </div>

        {loadingAI ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-slate-400 font-mono">
              Generating plain-English synthesis with Google Gemini API...
            </p>
          </div>
        ) : (
          <div className="prose prose-invert max-w-none text-slate-200 text-sm leading-relaxed space-y-3 bg-slate-950/60 p-6 rounded-xl border border-slate-800 whitespace-pre-line font-sans">
            {summary}
          </div>
        )}
      </div>

      {/* 5. Navigation Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={onReturnToDashboard}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-sm transition-all"
        >
          Return to Curriculum Radar
        </button>

        <button
          onClick={onStartNewQuiz}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-semibold text-sm shadow-lg shadow-blue-600/30 active:scale-95 transition-all"
        >
          <span>Continue Adaptive Practice</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
