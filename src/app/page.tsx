"use client";

import React, { useState, useEffect, useCallback } from "react";
import Header from "@/components/Header";
import AuthCheck from "@/components/AuthCheck";
import { DashboardView, SubjectInfo } from "@/components/DashboardView";
import { AdaptiveQuizView } from "@/components/AdaptiveQuizView";
import { DiagnosticView } from "@/components/DiagnosticView";
import { SessionResultsView } from "@/components/SessionResultsView";
import { SubjectSelector } from "@/components/SubjectSelector";

export default function Home() {
  const [activeTab, setActiveTab] = useState<
    "subjects" | "dashboard" | "quiz" | "diagnostic" | "results"
  >("dashboard");

  const [selectedSubjectSlug, setSelectedSubjectSlug] = useState<string>("sql");
  const [hasPromptedSubject, setHasPromptedSubject] = useState<boolean>(false);

  const [loadingProfile, setLoadingProfile] = useState<boolean>(true);
  const [concepts, setConcepts] = useState<any[]>([]);
  const [currentSubject, setCurrentSubject] = useState<SubjectInfo | null>(null);
  const [allSubjects, setAllSubjects] = useState<any[]>([]);
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

  // Initialize subject from localStorage on mount, or prompt first
  useEffect(() => {
    try {
      const storedSubject = localStorage.getItem("learnloop_selected_subject_slug");
      if (storedSubject) {
        setSelectedSubjectSlug(storedSubject);
        setHasPromptedSubject(true);
      } else {
        // First visit: ask the user first which subject they want to learn
        setActiveTab("subjects");
      }
    } catch {
      setActiveTab("subjects");
    }
  }, []);

  const fetchProfile = useCallback(async (subjectSlug?: string) => {
    try {
      setLoadingProfile(true);

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

      const targetSlug = subjectSlug || selectedSubjectSlug || "sql";
      const params = new URLSearchParams();
      if (targetSlug) params.set("subject", targetSlug);
      if (studentEmail) params.set("studentEmail", studentEmail);

      const res = await fetch(`/api/profile?${params.toString()}`);
      const data = await res.json();

      if (res.ok) {
        setConcepts(data.concepts || []);
        setCurrentSubject(data.subject || null);
        setAllSubjects(data.allSubjects || []);
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
  }, [selectedSubjectSlug]);

  useEffect(() => {
    fetchProfile(selectedSubjectSlug);
  }, [fetchProfile, selectedSubjectSlug]);

  const handleSelectSubject = (slug: string) => {
    setSelectedSubjectSlug(slug);
    try {
      localStorage.setItem("learnloop_selected_subject_slug", slug);
    } catch {}
    setHasPromptedSubject(true);
    fetchProfile(slug);
    setActiveTab("dashboard");
  };

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
    fetchProfile(selectedSubjectSlug);
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
          onResetComplete={() => fetchProfile(selectedSubjectSlug)}
          currentSubjectName={currentSubject?.name}
        />

        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-8">
          {activeTab === "subjects" && (
            <SubjectSelector
              currentSubjectSlug={selectedSubjectSlug}
              onSelectSubject={handleSelectSubject}
            />
          )}

          {activeTab === "dashboard" && (
            <DashboardView
              concepts={concepts}
              currentSubject={currentSubject}
              allSubjects={allSubjects}
              recommendedConcept={recommendedConcept}
              averageMastery={averageMastery}
              totalAttempts={totalAttempts}
              overallAccuracy={overallAccuracy}
              recentAttempts={recentAttempts}
              onStartQuiz={handleStartQuiz}
              loading={loadingProfile}
              onChangeSubject={() => setActiveTab("subjects")}
              onSelectSubject={handleSelectSubject}
            />
          )}

          {activeTab === "quiz" && (
            <AdaptiveQuizView
              initialConceptId={selectedConceptId}
              selectedSubjectSlug={selectedSubjectSlug}
              selectedSubjectName={currentSubject?.name}
              onFinishSession={handleFinishSession}
              onRefreshProfile={() => fetchProfile(selectedSubjectSlug)}
            />
          )}

          {activeTab === "diagnostic" && (
            <DiagnosticView
              selectedSubjectSlug={selectedSubjectSlug}
              selectedSubjectName={currentSubject?.name}
              onDiagnosticComplete={() => {
                fetchProfile(selectedSubjectSlug);
                setActiveTab("dashboard");
              }}
              onRefreshProfile={() => fetchProfile(selectedSubjectSlug)}
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
              <span className="font-serif font-bold text-stone-800">LearnLoop</span>
              <span>•</span>
              <span>
                Adaptive Learning Platform (SQL, Java, Python, HTML, Data Structures, C++)
              </span>
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
