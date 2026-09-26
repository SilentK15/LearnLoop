"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import AuthCheck from "@/components/AuthCheck";
import { DashboardView } from "@/components/DashboardView";
import { AdaptiveQuizView } from "@/components/AdaptiveQuizView";
import { DiagnosticView } from "@/components/DiagnosticView";
import { SessionResultsView } from "@/components/SessionResultsView";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "dashboard" | "quiz" | "diagnostic" | "results"
  >("dashboard");

  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [recommendedConcept, setRecommendedConcept] = useState<any | null>(null);
  const [averageMastery, setAverageMastery] = useState<number>(0);
  const [totalAttempts, setTotalAttempts] = useState<number>(0);
  const [overallAccuracy, setOverallAccuracy] = useState<number>(0);
  const [recentAttempts, setRecentAttempts] = useState<any[]>([]);

  // Selected concept when navigating to quiz
  const [selectedConceptId, setSelectedConceptId] = useState<string | undefined>(
    undefined
  );

  // Completed session data for Before/After screen
  const [lastSessionData, setLastSessionData] = useState<{
    startMasteries: Record<string, number>;
    endMasteries: Record<string, number>;
    conceptNames: Record<string, string>;
    attempts: Array<{
      conceptId: string;
      conceptName: string;
      difficulty: number;
      isCorrect: boolean;
    }>;
  } | null>(null);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      const data = await res.json();
      if (res.ok) {
        setConcepts(data.concepts || []);
        setRecommendedConcept(data.recommendedConcept || null);
        setAverageMastery(data.averageMastery || 0);
        setTotalAttempts(data.totalAttempts || 0);
        setOverallAccuracy(data.overallAccuracy || 0);
        setRecentAttempts(data.recentAttempts || []);
      }
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setLoadingProfile(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleStartQuiz = (conceptId?: string) => {
    setSelectedConceptId(conceptId || recommendedConcept?.id);
    setActiveTab("quiz");
  };

  const handleFinishSession = (sessionData: {
    startMasteries: Record<string, number>;
    endMasteries: Record<string, number>;
    conceptNames: Record<string, string>;
    attempts: Array<{
      conceptId: string;
      conceptName: string;
      difficulty: number;
      isCorrect: boolean;
    }>;
  }) => {
    setLastSessionData(sessionData);
    setActiveTab("results");
    fetchProfile();
  };

  return (
    <AuthCheck>
      <div
        className="min-h-screen flex flex-col selection:bg-[#B4472A]/20"
        style={{ backgroundColor: "var(--bg-warm, #F7F5F1)" }}
      >
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onResetComplete={fetchProfile}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {activeTab === "dashboard" && (
            <DashboardView
              concepts={concepts}
              recommendedConcept={recommendedConcept}
              averageMastery={averageMastery}
              totalAttempts={totalAttempts}
              overallAccuracy={overallAccuracy}
              recentAttempts={recentAttempts}
              onStartQuiz={handleStartQuiz}
              loading={loadingProfile}
            />
          )}

          {activeTab === "quiz" && (
            <AdaptiveQuizView
              initialConceptId={selectedConceptId}
              onFinishSession={handleFinishSession}
              onRefreshProfile={fetchProfile}
            />
          )}

          {activeTab === "diagnostic" && (
            <DiagnosticView
              onDiagnosticComplete={() => {
                fetchProfile();
                setActiveTab("dashboard");
              }}
              onRefreshProfile={fetchProfile}
            />
          )}

          {activeTab === "results" && (
            <SessionResultsView
              sessionData={
                lastSessionData || {
                  startMasteries: {},
                  endMasteries: {},
                  conceptNames: {},
                  attempts: [],
                }
              }
              onReturnToDashboard={() => setActiveTab("dashboard")}
              onStartNewQuiz={() => setActiveTab("quiz")}
            />
          )}
        </main>

        <footer
          className="border-t py-6 text-center text-xs text-stone-500 mt-12"
          style={{ borderColor: "#E5E0D8" }}
        >
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-serif font-bold text-stone-800">Hackstreak</span>
              <span>•</span>
              <span>Next.js 14 + Supabase PostgreSQL + Google Gemini</span>
            </div>
            <p className="font-mono text-[11px] text-stone-500">
              Formula: new = old + 0.35 × (outcome - old) × W(diff)
            </p>
          </div>
        </footer>
      </div>
    </AuthCheck>
  );
}
