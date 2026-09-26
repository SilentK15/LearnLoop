"use client";

import React, { useState } from "react";
import { Zap, RotateCcw, CheckCircle2, UserCheck } from "lucide-react";

interface HeaderProps {
  activeTab: "dashboard" | "quiz" | "diagnostic" | "results";
  setActiveTab: (tab: "dashboard" | "quiz" | "diagnostic" | "results") => void;
  onResetComplete?: () => void;
}

export function Header({
  activeTab,
  setActiveTab,
  onResetComplete,
}: HeaderProps) {
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetDemoData = async () => {
    if (
      !confirm(
        "Are you sure you want to reset demo data? This will restore baseline mastery scores and clear all session attempt logs."
      )
    ) {
      return;
    }

    try {
      setResetting(true);
      const res = await fetch("/api/reset", { method: "POST" });
      if (res.ok) {
        setResetSuccess(true);
        setTimeout(() => setResetSuccess(false), 3000);
        if (onResetComplete) onResetComplete();
      } else {
        alert("Failed to reset demo data");
      }
    } catch (err) {
      console.error(err);
      alert("Error resetting demo data");
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-[#090d16]/85 border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 p-[1px] shadow-lg shadow-blue-500/20">
              <div className="w-full h-full bg-[#0d1322] rounded-[11px] flex items-center justify-center">
                <Zap className="w-5 h-5 text-cyan-400 fill-cyan-400/20" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                  Hackstreak
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/25">
                  Adaptive v1.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Linear Knowledge Graph & Live Mastery Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "dashboard"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Curriculum Radar
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "quiz"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Adaptive Quiz (Live)
            </button>
            <button
              onClick={() => setActiveTab("diagnostic")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "diagnostic"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Baseline Diagnostic
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeTab === "results"
                  ? "bg-blue-600 text-white shadow-sm"
                  : "text-slate-400 hover:text-white hover:bg-slate-800/60"
              }`}
            >
              Session Results & AI
            </button>
          </nav>

          {/* Right Action: Demo User Badge & Reset Demo Data */}
          <div className="flex items-center gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/50 border border-slate-700/60 text-xs text-slate-300">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Alex Rivera</span>
            </div>

            <button
              onClick={handleResetDemoData}
              disabled={resetting}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                resetSuccess
                  ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                  : "bg-slate-900 text-slate-300 hover:text-white hover:bg-slate-800 border-slate-700"
              } active:scale-95 disabled:opacity-50`}
              title="Reset demo student baseline and clear attempt logs"
            >
              {resetSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Reset Complete</span>
                </>
              ) : resetting ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin text-blue-400" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
                  <span>Reset Demo Data</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile Nav Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-800/80 text-xs">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-2 py-1 rounded ${
              activeTab === "dashboard" ? "text-blue-400 font-semibold" : "text-slate-400"
            }`}
          >
            Radar
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-2 py-1 rounded ${
              activeTab === "quiz" ? "text-blue-400 font-semibold" : "text-slate-400"
            }`}
          >
            Adaptive Quiz
          </button>
          <button
            onClick={() => setActiveTab("diagnostic")}
            className={`px-2 py-1 rounded ${
              activeTab === "diagnostic" ? "text-blue-400 font-semibold" : "text-slate-400"
            }`}
          >
            Diagnostic
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`px-2 py-1 rounded ${
              activeTab === "results" ? "text-blue-400 font-semibold" : "text-slate-400"
            }`}
          >
            AI Results
          </button>
        </div>
      </div>
    </header>
  );
}
