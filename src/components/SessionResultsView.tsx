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
  Trophy,
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

        const res = await fetch("/api/session/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            startMasteries,
            endMasteries,
            conceptNames,
            attempts,
            studentEmail: studentEmail || undefined,
          }),
        });

        const data = await res.json();
        if (res.ok && data.summary) {
          setSummary(data.summary);
          if (data.provider) setProvider(data.provider);
        }
      } catch (err) {
        console.error("Failed to load Gemini diagnostic summary:", err);
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
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#121216] border-2 border-[#00ffcc] text-[#00ffcc] font-pixel text-[10px] shadow-[2px_2px_0px_0px_#000]">
          <Trophy className="w-3.5 h-3.5 text-[#ffcc00]" />
          MISSION DEBRIEFING & VICTORY LOG
        </div>
        <h2 className="font-pixel text-2xl md:text-3xl text-white tracking-wide">
          COGNITIVE EXP DELTA
        </h2>
        <p className="font-vt323 text-xl text-stone-400 max-w-xl mx-auto">
          Post-encounter statistical evaluation synthesized with Google Gemini AI.
        </p>
      </div>

      {/* 2. Top-level session metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-[#1e1e24] border-4 border-[#38384a] shadow-[6px_6px_0px_0px_#000] text-center">
          <span className="font-pixel text-[9px] text-stone-400 uppercase tracking-wider">
            TOTAL ENCOUNTERS
          </span>
          <div className="font-pixel text-3xl text-[#00ffcc] mt-2">
            {totalAttempts}
          </div>
          <span className="font-vt323 text-lg text-stone-400">
            questions executed
          </span>
        </div>

        <div className="p-5 bg-[#1e1e24] border-4 border-[#38384a] shadow-[6px_6px_0px_0px_#000] text-center">
          <span className="font-pixel text-[9px] text-stone-400 uppercase tracking-wider">
            HIT PRECISION
          </span>
          <div className="font-pixel text-3xl text-[#00ff66] mt-2">
            {accuracy.toFixed(0)}%
          </div>
          <span className="font-vt323 text-lg text-stone-400">
            {correctAttempts} hits of {totalAttempts}
          </span>
        </div>

        <div className="p-5 bg-[#1e1e24] border-4 border-[#38384a] shadow-[6px_6px_0px_0px_#000] text-center">
          <span className="font-pixel text-[9px] text-stone-400 uppercase tracking-wider">
            ACTIVE REALMS
          </span>
          <div className="font-pixel text-3xl text-[#ff0055] mt-2">
            {conceptIds.length}
          </div>
          <span className="font-vt323 text-lg text-stone-400">
            topics calibrated
          </span>
        </div>
      </div>

      {/* 3. Before vs After Mastery Comparison */}
      <div className="p-6 md:p-8 bg-[#1e1e24] border-4 border-[#00ffcc] shadow-[8px_8px_0px_0px_#000] space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-[#38384a]">
          <h3 className="font-pixel text-sm text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#00ffcc]" />
            BEFORE VS. AFTER MASTERY GAINS
          </h3>
          <span className="font-pixel text-[9px] text-[#00ffcc] bg-[#121216] px-2 py-1 border border-[#38384a]">
            DYNAMIC DELTA RECOMPUTATION
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
                className="p-4 bg-[#121216] border-2 border-[#38384a] shadow-[4px_4px_0px_0px_#000] space-y-3"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-pixel text-xs text-white">
                      {name}
                    </h4>
                    <p className="font-vt323 text-base text-stone-400">
                      Topic #{id.slice(-4)}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-pixel text-[10px] text-stone-400">
                      {(before * 100).toFixed(0)}%
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-stone-500" />
                    <span className="font-pixel text-xs text-[#00ffcc]">
                      {(after * 100).toFixed(0)}%
                    </span>

                    <span
                      className={`inline-flex items-center gap-1 font-pixel text-[9px] px-2 py-0.5 border-2 border-black ${
                        delta > 0
                          ? "bg-[#00ff66] text-black"
                          : delta < 0
                          ? "bg-[#ff0055] text-white"
                          : "bg-[#38384a] text-stone-300"
                      }`}
                    >
                      {delta > 0 ? (
                        <>
                          <TrendingUp className="w-3 h-3" />
                          +{(delta * 100).toFixed(0)}%
                        </>
                      ) : delta < 0 ? (
                        <>
                          <TrendingDown className="w-3 h-3" />
                          {(delta * 100).toFixed(0)}%
                        </>
                      ) : (
                        "0%"
                      )}
                    </span>
                  </div>
                </div>

                {/* Progress bar comparison */}
                <div className="space-y-1">
                  <div className="h-3 bg-[#1e1e24] border border-[#38384a] overflow-hidden flex">
                    <div
                      className="h-full bg-[#00ffcc] transition-all"
                      style={{ width: `${Math.min(100, Math.max(0, after * 100))}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Google Gemini AI Plain-English Diagnostic Analysis */}
      <div className="p-6 md:p-8 bg-[#1e1e24] border-4 border-[#ff0055] shadow-[8px_8px_0px_0px_#000] space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b-2 border-[#38384a]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-[#121216] border-2 border-[#ff0055] flex items-center justify-center">
              <Brain className="w-4 h-4 text-[#ff0055]" />
            </div>
            <div>
              <h3 className="font-pixel text-xs text-white">
                TACTICAL AI COGNITIVE SYNTHESIS
              </h3>
              <p className="font-vt323 text-base text-stone-400">
                Plain-English pedagogical diagnostic generated from performance logs
              </p>
            </div>
          </div>

          <span className="font-pixel text-[9px] px-2 py-1 bg-[#121216] text-[#ffcc00] border-2 border-[#38384a] flex items-center gap-1.5">
            <Sparkles className="w-3 h-3 text-[#ffcc00]" />
            {provider.includes("gemini")
              ? "GEMINI 1.5 FLASH"
              : "SMART DIAGNOSTIC ENGINE"}
          </span>
        </div>

        {loadingAI ? (
          <div className="py-8 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 border-4 border-[#ff0055] border-t-transparent animate-spin shadow-[0_0_12px_rgba(255,0,85,0.4)]" />
            <p className="font-pixel text-[10px] text-[#ff0055]">
              SYNTHESIZING COGNITIVE PROFILE WITH GEMINI AI...
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <SummaryCards text={summary} />
          </div>
        )}
      </div>

      {/* 5. Navigation Action Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
        <button
          onClick={onReturnToDashboard}
          className="w-full sm:w-auto px-6 py-3.5 bg-[#121216] hover:bg-[#252530] text-stone-200 hover:text-white font-pixel text-xs border-2 border-[#38384a] shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]"
        >
          RETURN TO QUEST RADAR
        </button>

        <button
          onClick={onStartNewQuiz}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-[#00ffcc] hover:bg-[#00e6b8] text-black font-pixel text-xs border-2 border-black shadow-[4px_4px_0px_0px_#000] active:translate-x-[2px] active:translate-y-[2px]"
        >
          <span>CONTINUE ADAPTIVE DRILL</span>
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
            <strong key={i} className="text-[#00ffcc] font-semibold">
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
    <div className="space-y-4 font-vt323 text-xl">
      {sections.map((sec, idx) => {
        if (sec.type === "title") {
          return (
            <div key={idx} className="pb-2 border-b-2 border-[#38384a]">
              <h4 className="font-pixel text-xs text-[#00ffcc] tracking-wide flex items-center gap-2">
                <span className="w-2 h-2 bg-[#00ffcc]" />
                <FormattedInline text={sec.title || "Diagnostic Analysis"} />
              </h4>
            </div>
          );
        }

        if (sec.type === "breakthrough") {
          return (
            <div
              key={idx}
              className="p-4 bg-[#121216] border-2 border-[#00ff66] text-stone-200 space-y-2 shadow-[4px_4px_0px_0px_#000]"
            >
              <div className="flex items-center gap-2 font-pixel text-[10px] text-[#00ff66]">
                <CheckCircle2 className="w-4 h-4" />
                <span>{sec.title || "Key Breakthroughs & Strength Mastery"}</span>
              </div>
              <p className="text-stone-300 leading-relaxed pl-6">
                <FormattedInline text={sec.content.join(" ")} />
              </p>
            </div>
          );
        }

        if (sec.type === "focus") {
          return (
            <div
              key={idx}
              className="p-4 bg-[#121216] border-2 border-[#ffcc00] text-stone-200 space-y-2 shadow-[4px_4px_0px_0px_#000]"
            >
              <div className="flex items-center gap-2 font-pixel text-[10px] text-[#ffcc00]">
                <Target className="w-4 h-4" />
                <span>{sec.title || "Target Focus Areas & Blindspots"}</span>
              </div>
              <p className="text-stone-300 leading-relaxed pl-6">
                <FormattedInline text={sec.content.join(" ")} />
              </p>
            </div>
          );
        }

        if (sec.type === "action") {
          return (
            <div
              key={idx}
              className="p-4 bg-[#121216] border-2 border-[#ff0055] text-stone-200 space-y-2 shadow-[4px_4px_0px_0px_#000]"
            >
              <div className="flex items-center gap-2 font-pixel text-[10px] text-[#ff0055]">
                <Compass className="w-4 h-4" />
                <span>{sec.title || "Recommended Next Quest"}</span>
              </div>
              <p className="text-stone-200 leading-relaxed pl-6">
                <FormattedInline text={sec.content.join(" ")} />
              </p>
            </div>
          );
        }

        return (
          <div
            key={idx}
            className="p-4 bg-[#121216] border-2 border-[#38384a] text-stone-300 leading-relaxed shadow-[3px_3px_0px_0px_#000]"
          >
            {sec.title && (
              <h5 className="font-pixel text-[10px] text-white mb-2">
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
