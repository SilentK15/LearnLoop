"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, RotateCcw, CheckCircle2, UserCheck, LogOut } from "lucide-react";

interface HeaderProps {
  activeTab: "dashboard" | "quiz" | "diagnostic" | "results";
  setActiveTab: (tab: "dashboard" | "quiz" | "diagnostic" | "results") => void;
  onResetComplete?: () => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  onResetComplete,
}: HeaderProps) {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [userName, setUserName] = useState("Demo Student");
  const [userRole, setUserRole] = useState("student");

  useEffect(() => {
    try {
      const stored = localStorage.getItem("hackstreak_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.role) setUserRole(parsed.role);
      }
    } catch {
      // Ignore
    }
  }, []);

  const handleResetDemoData = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all concept masteries and clear demo attempt logs?"
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

  const handleLogout = () => {
    localStorage.removeItem("hackstreak_session");
    document.cookie = "hackstreak_auth=; path=/; max-age=0";
    router.replace("/login");
  };

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md transition-colors"
      style={{
        backgroundColor: "rgba(247, 245, 241, 0.92)",
        borderColor: "#E5E0D8",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2B5D4F] flex items-center justify-center shadow-sm">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-xl tracking-tight text-stone-900">
                  Hackstreak
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-[#B4472A]/10 text-[#B4472A] border border-[#B4472A]/20 font-semibold">
                  Adaptive v1.0
                </span>
              </div>
              <p className="text-[11px] text-stone-500 hidden sm:block">
                Linear Knowledge Graph & Live Mastery Engine
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-stone-200/60 p-1 rounded-xl border border-stone-300/60">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "dashboard"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
              }`}
            >
              Curriculum Radar
            </button>
            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "quiz"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
              }`}
            >
              Adaptive Quiz (Live)
            </button>
            <button
              onClick={() => setActiveTab("diagnostic")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "diagnostic"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
              }`}
            >
              Baseline Diagnostic
            </button>
            <button
              onClick={() => setActiveTab("results")}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === "results"
                  ? "bg-white text-stone-900 shadow-sm"
                  : "text-stone-600 hover:text-stone-900 hover:bg-stone-200/50"
              }`}
            >
              Session Results & AI
            </button>
          </nav>

          {/* User Session Badge & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white border border-[#E5E0D8] text-xs text-stone-800 shadow-xs">
              <UserCheck className="w-3.5 h-3.5 text-[#2B5D4F]" />
              <span className="font-medium">{userName}</span>
              {userRole === "judge" && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded font-semibold">
                  Judge
                </span>
              )}
            </div>

            {/* Reset Demo Data Button */}
            <button
              onClick={handleResetDemoData}
              disabled={resetting}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all border shadow-xs ${
                resetSuccess
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-white text-stone-700 hover:bg-stone-50 border-[#E5E0D8]"
              } active:scale-95 disabled:opacity-50`}
              title="Reset demo baseline and clear attempt logs"
            >
              {resetSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#2B5D4F]" />
                  <span>Reset Complete</span>
                </>
              ) : resetting ? (
                <>
                  <RotateCcw className="w-3.5 h-3.5 animate-spin text-[#B4472A]" />
                  <span>Resetting...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden sm:inline">Reset Baseline</span>
                </>
              )}
            </button>

            {/* Sign Out / Exit */}
            <button
              onClick={handleLogout}
              className="p-1.5 sm:px-2.5 sm:py-1.5 rounded-xl text-xs font-medium text-stone-500 hover:text-stone-900 hover:bg-stone-200/50 border border-transparent transition-all flex items-center gap-1"
              title="Log out"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-stone-200 text-xs">
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-2 py-1 rounded font-medium ${
              activeTab === "dashboard"
                ? "text-[#B4472A] font-bold"
                : "text-stone-600"
            }`}
          >
            Radar
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-2 py-1 rounded font-medium ${
              activeTab === "quiz"
                ? "text-[#B4472A] font-bold"
                : "text-stone-600"
            }`}
          >
            Adaptive Quiz
          </button>
          <button
            onClick={() => setActiveTab("diagnostic")}
            className={`px-2 py-1 rounded font-medium ${
              activeTab === "diagnostic"
                ? "text-[#B4472A] font-bold"
                : "text-stone-600"
            }`}
          >
            Diagnostic
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`px-2 py-1 rounded font-medium ${
              activeTab === "results"
                ? "text-[#B4472A] font-bold"
                : "text-stone-600"
            }`}
          >
            AI Results
          </button>
        </div>
      </div>
    </header>
  );
}
