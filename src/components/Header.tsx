"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, RotateCcw, CheckCircle2, UserCheck, LogOut, BookOpen, Layers } from "lucide-react";

interface HeaderProps {
  activeTab: "subjects" | "dashboard" | "quiz" | "diagnostic" | "results";
  setActiveTab: (tab: "subjects" | "dashboard" | "quiz" | "diagnostic" | "results") => void;
  onResetComplete?: () => void;
  currentSubjectName?: string;
}

export default function Header({
  activeTab,
  setActiveTab,
  onResetComplete,
  currentSubjectName,
}: HeaderProps) {
  const router = useRouter();
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [userName, setUserName] = useState("Demo Student");
  const [userRole, setUserRole] = useState("student");
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    try {
      const stored =
        localStorage.getItem("learnloop_session") ||
        localStorage.getItem("hackstreak_session");
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.name) setUserName(parsed.name);
        if (parsed.role) setUserRole(parsed.role);
        if (parsed.email) setUserEmail(parsed.email);
      }
    } catch {
      // Ignore
    }
  }, []);

  // ONLY show reset data button for demo accounts or judges
  const isDemoAccount =
    userRole === "judge" ||
    userEmail.toLowerCase().includes("demo") ||
    userName.toLowerCase().includes("demo") ||
    userEmail === "demo@hackstreak.dev" ||
    userEmail === "demo@learnloop.dev";

  const handleResetDemoData = async () => {
    if (
      !confirm(
        "Are you sure you want to reset all concept masteries and clear demo attempt logs across all subjects?"
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
    localStorage.removeItem("learnloop_session");
    localStorage.removeItem("hackstreak_session");
    document.cookie = "learnloop_auth=; path=/; max-age=0";
    document.cookie = "hackstreak_auth=; path=/; max-age=0";
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-50 border-b-4 border-[#00ffcc] bg-[#16161c] shadow-[0_4px_0px_0px_#000]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* 8-Bit Brand Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group select-none"
            onClick={() => setActiveTab("dashboard")}
          >
            <div className="w-10 h-10 bg-[#00ffcc] border-2 border-black shadow-[3px_3px_0px_0px_#000] flex items-center justify-center text-black group-hover:bg-[#ff0055] group-hover:text-white transition-colors">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-base sm:text-lg tracking-wider text-white">
                  LEARN<span className="text-[#00ffcc]">LOOP</span>
                </span>
                <span className="font-pixel text-[9px] px-1.5 py-0.5 bg-[#ff0055] text-white border border-black shadow-[2px_2px_0px_0px_#000]">
                  8-BIT
                </span>
              </div>
              <p className="font-retro text-sm text-[#ffcc00] tracking-widest hidden sm:block">
                ► ADAPTIVE RPG MASTERY ENGINE ◄
              </p>
            </div>
          </div>

          {/* Arcade Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-2 bg-[#121216] p-1.5 border-2 border-[#38384a] shadow-[3px_3px_0px_0px_#000]">
            <button
              onClick={() => setActiveTab("subjects")}
              className={`px-3 py-1.5 font-pixel text-[10px] uppercase transition-all flex items-center gap-1.5 ${
                activeTab === "subjects"
                  ? "bg-[#00ffcc] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                  : "bg-transparent text-stone-300 hover:text-white hover:bg-[#252530]"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>REALMS</span>
              {currentSubjectName && (
                <span className="text-[9px] px-1 bg-black text-[#ffcc00] font-pixel ml-1">
                  {currentSubjectName}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("dashboard")}
              className={`px-3 py-1.5 font-pixel text-[10px] uppercase transition-all ${
                activeTab === "dashboard"
                  ? "bg-[#00ffcc] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                  : "bg-transparent text-stone-300 hover:text-white hover:bg-[#252530]"
              }`}
            >
              QUEST MAP
            </button>

            <button
              onClick={() => setActiveTab("quiz")}
              className={`px-3 py-1.5 font-pixel text-[10px] uppercase transition-all ${
                activeTab === "quiz"
                  ? "bg-[#00ffcc] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                  : "bg-transparent text-stone-300 hover:text-white hover:bg-[#252530]"
              }`}
            >
              ADAPTIVE DRILL
            </button>

            <button
              onClick={() => setActiveTab("diagnostic")}
              className={`px-3 py-1.5 font-pixel text-[10px] uppercase transition-all ${
                activeTab === "diagnostic"
                  ? "bg-[#00ffcc] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                  : "bg-transparent text-stone-300 hover:text-white hover:bg-[#252530]"
              }`}
            >
              STAT TRIAL
            </button>

            <button
              onClick={() => setActiveTab("results")}
              className={`px-3 py-1.5 font-pixel text-[10px] uppercase transition-all ${
                activeTab === "results"
                  ? "bg-[#00ffcc] text-black border-2 border-black shadow-[2px_2px_0px_0px_#000]"
                  : "bg-transparent text-stone-300 hover:text-white hover:bg-[#252530]"
              }`}
            >
              VICTORY LOG
            </button>
          </nav>

          {/* User Session Badge & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-[#121216] border-2 border-[#38384a] shadow-[2px_2px_0px_0px_#000] text-xs">
              <span className="text-[#00ff66]">👾</span>
              <span className="font-pixel text-[9px] text-[#00ffcc]">
                P1: {userName.toUpperCase()}
              </span>
              {userRole === "judge" && (
                <span className="font-pixel text-[8px] bg-[#ffcc00] text-black px-1 py-0.5">
                  JUDGE
                </span>
              )}
            </div>

            {/* Reset Demo Data Button - ONLY visible for Demo Student */}
            {isDemoAccount && (
              <button
                onClick={handleResetDemoData}
                disabled={resetting}
                title="Reset evaluation baseline data (Demo account only)"
                className="inline-flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-black font-pixel text-[9px] uppercase shadow-[2px_2px_0px_0px_#000] disabled:opacity-50"
                style={{
                  backgroundColor: resetSuccess ? "#00ff66" : "#ff0055",
                  color: resetSuccess ? "#000000" : "#ffffff",
                }}
              >
                {resetSuccess ? (
                  <>
                    <CheckCircle2 className="w-3 h-3 text-black" />
                    <span className="hidden sm:inline">RESET!</span>
                  </>
                ) : (
                  <>
                    <RotateCcw
                      className={`w-3 h-3 ${resetting ? "animate-spin text-white" : ""}`}
                    />
                    <span className="hidden sm:inline">
                      {resetting ? "..." : "RESET"}
                    </span>
                  </>
                )}
              </button>
            )}

            {/* Exit/Sign Out Button */}
            <button
              onClick={handleLogout}
              title="Exit session"
              className="p-2 bg-[#121216] hover:bg-[#ff0055] text-stone-300 hover:text-white border-2 border-black shadow-[2px_2px_0px_0px_#000] transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Mobile Sub-Navigation Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t-2 border-[#38384a] gap-1 overflow-x-auto text-[10px] font-pixel">
          <button
            onClick={() => setActiveTab("subjects")}
            className={`px-2 py-1 whitespace-nowrap ${
              activeTab === "subjects"
                ? "bg-[#00ffcc] text-black"
                : "text-stone-300 hover:bg-[#252530]"
            }`}
          >
            REALMS
          </button>
          <button
            onClick={() => setActiveTab("dashboard")}
            className={`px-2 py-1 whitespace-nowrap ${
              activeTab === "dashboard"
                ? "bg-[#00ffcc] text-black"
                : "text-stone-300 hover:bg-[#252530]"
            }`}
          >
            QUESTS
          </button>
          <button
            onClick={() => setActiveTab("quiz")}
            className={`px-2 py-1 whitespace-nowrap ${
              activeTab === "quiz"
                ? "bg-[#00ffcc] text-black"
                : "text-stone-300 hover:bg-[#252530]"
            }`}
          >
            DRILL
          </button>
          <button
            onClick={() => setActiveTab("diagnostic")}
            className={`px-2 py-1 whitespace-nowrap ${
              activeTab === "diagnostic"
                ? "bg-[#00ffcc] text-black"
                : "text-stone-300 hover:bg-[#252530]"
            }`}
          >
            TRIAL
          </button>
          <button
            onClick={() => setActiveTab("results")}
            className={`px-2 py-1 whitespace-nowrap ${
              activeTab === "results"
                ? "bg-[#00ffcc] text-black"
                : "text-stone-300 hover:bg-[#252530]"
            }`}
          >
            VICTORY
          </button>
        </div>
      </div>
    </header>
  );
}
