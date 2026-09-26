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
  CheckCircle2,
  Target,
  Compass,
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

  const conceptIds = Array.from(
    new Set([...Object.keys(startMasteries), ...Object.keys(endMasteries)])
  );

  const totalAttempts = attempts.length;
  const correctAttempts = attempts.filter((a) => a.isCorrect).length;
  const accuracy =
    totalAttempts > 0 ? (correctAttempts / totalAttempts) * 100 : 0;

  useEffect(() => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

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
  }, []);

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      {/* 1. Header Banner */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#2B5D4F]/10 border border-[#2B5D4F]/30 text-[#2B5D4F] text-xs font-semibold uppercase tracking-wider">
          <Award className="w-4 h-4" /> Adaptive Session Completed
        </div>
        <h2 className="text-3xl md:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Session Delta & Cognitive Growth
        </h2>
        <p className="text-sm text-stone-600 max-w-xl mx-auto font-sans">
          Here is how your linear concept masteries shifted during this session,
          synthesized with Google Gemini AI.
        </p>
      </div>

      {/* 2. Top-level session metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div
          className="p-5 rounded-2xl border shadow-sm text-center"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
        >
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Total Attempts
          </span>
          <div className="text-3xl font-serif font-bold text-stone-900 mt-1">
            {totalAttempts}
          </div>
          <span className="text-[11px] text-stone-500 font-sans">
            adaptive questions answered
          </span>
        </div>

        <div
          className="p-5 rounded-2xl border shadow-sm text-center"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
        >
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Session Accuracy
          </span>
          <div className="text-3xl font-serif font-bold text-[#2B5D4F] mt-1">
            {accuracy.toFixed(0)}%
          </div>
          <span className="text-[11px] text-stone-500 font-sans">
            {correctAttempts} correct of {totalAttempts}
          </span>
        </div>

        <div
          className="p-5 rounded-2xl border shadow-sm text-center"
          style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
        >
          <span className="text-xs font-semibold text-stone-500 uppercase tracking-wider">
            Active Concepts
          </span>
          <div className="text-3xl font-serif font-bold text-[#B4472A] mt-1">
            {conceptIds.length}
          </div>
          <span className="text-[11px] text-stone-500 font-sans">
            curriculum areas calibrated
          </span>
        </div>
      </div>

      {/* 3. Before vs After Mastery Comparison */}
      <div
        className="p-6 md:p-8 rounded-2xl border shadow-sm space-y-6"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-[#2B5D4F]" />
            Before vs. After Mastery Breakdown
          </h3>
          <span className="text-xs text-stone-500 font-mono">
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
                className="p-4 rounded-xl border border-stone-200 bg-stone-50/50 space-y-3"
              >
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h4 className="font-serif font-bold text-sm text-stone-900">
                      {name}
                    </h4>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-stone-600 font-mono">
                      {(before * 100).toFixed(0)}% →{" "}
                      <strong className="text-stone-900">
                        {(after * 100).toFixed(0)}%
                      </strong>
                    </span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-full font-mono font-bold flex items-center gap-1 ${
                        delta > 0
                          ? "bg-[#2B5D4F]/10 text-[#2B5D4F] border border-[#2B5D4F]/30"
                          : delta < 0
                          ? "bg-[#B4472A]/10 text-[#B4472A] border border-[#B4472A]/30"
                          : "bg-stone-200 text-stone-600"
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
                  <div className="flex items-center gap-2 text-[10px] text-stone-500 font-mono">
                    <span className="w-12">Before</span>
                    <div className="flex-1 bg-stone-200 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-stone-400 h-full rounded-full"
                        style={{ width: `${Math.min(100, before * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-700 font-mono">
                    <span className="w-12 font-bold text-stone-900">After</span>
                    <div className="flex-1 bg-stone-200 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full"
                        style={{
                          width: `${Math.min(100, after * 100)}%`,
                          backgroundColor:
                            after >= 0.8
                              ? "#2B5D4F"
                              : after >= 0.6
                              ? "#2563EB"
                              : after >= 0.3
                              ? "#D97706"
                              : "#B4472A",
                        }}
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
      <div
        className="p-6 md:p-8 rounded-2xl border shadow-sm space-y-4"
        style={{ backgroundColor: "#FFFFFF", borderColor: "#E5E0D8" }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#2B5D4F]/10 border border-[#2B5D4F]/20 flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#2B5D4F]" />
            </div>
            <div>
              <h3 className="text-base font-serif font-bold text-stone-900">
                Cognitive Growth & Gap Synthesis
              </h3>
              <p className="text-xs text-stone-500 font-sans">
                Plain-English pedagogical analysis of performance shifts
              </p>
            </div>
          </div>

          <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-stone-100 text-stone-700 border border-stone-200 flex items-center gap-1.5 font-medium">
            <Sparkles className="w-3 h-3 text-amber-600" />
            {provider.includes("gemini")
              ? "Google Gemini 1.5"
              : "Smart Diagnostic Engine"}
          </span>
        </div>

        {loadingAI ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-2 border-[#B4472A] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs text-stone-600 font-sans">
              Generating pedagogical synthesis with Google Gemini API...
            </p>
          </div>
        ) : (
          <div className="space-y-4 font-sans">
            <SummaryCards text={summary} />
          </div>
        )}
      </div>

      {/* 5. Navigation Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={onReturnToDashboard}
          className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-sm transition-all border border-stone-200"
        >
          Return to Curriculum Radar
        </button>

        <button
          onClick={onStartNewQuiz}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl text-white font-semibold text-sm shadow-sm active:scale-98 transition-all"
          style={{ backgroundColor: "var(--color-recommended, #B4472A)" }}
        >
          <span>Continue Adaptive Practice</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function FormattedInline({ text }: { text: string }) {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return (
    <>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} className="font-semibold text-stone-900">
              {part.slice(2, -2)}
            </strong>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </>
  );
}

function SummaryCards({ text }: { text: string }) {
  if (!text) return null;

  const lines = text.split("\n");
  const sections: Array<{
    type: "title" | "overview" | "breakthrough" | "focus" | "action" | "general";
    title?: string;
    content: string[];
  }> = [];

  let currentSection: {
    type: "title" | "overview" | "breakthrough" | "focus" | "action" | "general";
    title?: string;
    content: string[];
  } = { type: "overview", content: [] };

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("### ")) {
      if (currentSection.content.length > 0) sections.push(currentSection);
      sections.push({
        type: "title",
        title: trimmed.replace(/^###\s+/, ""),
        content: [],
      });
      currentSection = { type: "overview", content: [] };
    } else if (trimmed.startsWith("#### ") || /^[1-4]\.\s+["']?/.test(trimmed)) {
      if (currentSection.content.length > 0) sections.push(currentSection);
      const cleanHeader = trimmed
        .replace(/^####\s+/, "")
        .replace(/^[1-4]\.\s+/, "")
        .replace(/^["']|["']$/g, "");

      let type: "breakthrough" | "focus" | "action" | "general" = "general";
      const lower = cleanHeader.toLowerCase();
      if (
        lower.includes("breakthrough") ||
        lower.includes("strength") ||
        cleanHeader.includes("🚀")
      ) {
        type = "breakthrough";
      } else if (
        lower.includes("focus") ||
        lower.includes("vulnerabilit") ||
        lower.includes("blindspot") ||
        cleanHeader.includes("🔍")
      ) {
        type = "focus";
      } else if (
        lower.includes("action") ||
        lower.includes("next") ||
        lower.includes("move") ||
        cleanHeader.includes("🎯")
      ) {
        type = "action";
      }

      currentSection = { type, title: cleanHeader, content: [] };
    } else {
      currentSection.content.push(trimmed);
    }
  }

  if (currentSection.content.length > 0) {
    sections.push(currentSection);
  }

  return (
    <div className="space-y-4">
      {sections.map((sec, idx) => {
        if (sec.type === "title") {
          return (
            <div key={idx} className="pb-1 border-b border-stone-200">
              <h4 className="text-base font-serif font-bold text-stone-900 tracking-tight flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#2B5D4F]" />
                <FormattedInline text={sec.title || "Diagnostic Analysis"} />
              </h4>
            </div>
          );
        }

        if (sec.type === "breakthrough") {
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-emerald-200 bg-gradient-to-r from-emerald-50/80 to-emerald-50/30 text-stone-800 space-y-2 shadow-xs"
            >
              <div className="flex items-center gap-2 text-emerald-800 font-semibold text-xs uppercase tracking-wide">
                <div className="w-6 h-6 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </div>
                <span>{sec.title || "Key Breakthroughs & Strength Mastery"}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans pl-8">
                <FormattedInline text={sec.content.join(" ")} />
              </p>
            </div>
          );
        }

        if (sec.type === "focus") {
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50/80 to-amber-50/30 text-stone-800 space-y-2 shadow-xs"
            >
              <div className="flex items-center gap-2 text-amber-800 font-semibold text-xs uppercase tracking-wide">
                <div className="w-6 h-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                  <Target className="w-3.5 h-3.5" />
                </div>
                <span>{sec.title || "Target Focus Areas & Friction Points"}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-700 leading-relaxed font-sans pl-8">
                <FormattedInline text={sec.content.join(" ")} />
              </p>
            </div>
          );
        }

        if (sec.type === "action") {
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl border border-[#B4472A]/30 bg-gradient-to-r from-[#B4472A]/10 to-[#B4472A]/5 text-stone-800 space-y-2 shadow-xs"
            >
              <div className="flex items-center gap-2 text-[#B4472A] font-semibold text-xs uppercase tracking-wide">
                <div className="w-6 h-6 rounded-lg bg-[#B4472A]/20 flex items-center justify-center text-[#B4472A]">
                  <Compass className="w-3.5 h-3.5" />
                </div>
                <span>{sec.title || "Recommended Next Move"}</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-800 font-medium leading-relaxed font-sans pl-8">
                <FormattedInline text={sec.content.join(" ")} />
              </p>
            </div>
          );
        }

        return (
          <div
            key={idx}
            className="p-5 rounded-2xl border border-stone-200 bg-stone-50/70 text-stone-700 text-xs sm:text-sm leading-relaxed"
          >
            {sec.title && (
              <h5 className="font-semibold text-stone-900 mb-1">
                <FormattedInline text={sec.title} />
              </h5>
            )}
            <p>
              <FormattedInline text={sec.content.join(" ")} />
            </p>
          </div>
        );
      })}
    </div>
  );
}
