"use client";

import React, { useState, useEffect } from "react";
import {
  Database,
  Coffee,
  Terminal,
  Globe,
  Network,
  Cpu,
  ArrowRight,
  BookOpen,
  Sparkles,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

export interface SubjectItem {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  color: string;
  orderIndex: number;
  totalConcepts: number;
  totalQuestions: number;
  averageMastery: number;
  masteredCount: number;
  needsReviewCount: number;
  criticalGapCount: number;
}

interface SubjectSelectorProps {
  onSelectSubject: (subjectSlug: string) => void;
  currentSubjectSlug?: string;
  isModal?: boolean;
  onClose?: () => void;
}

// Icon mapping helper
const SUBJECT_CONFIGS: Record<
  string,
  {
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    bgGradient: string;
    borderColor: string;
    badgeText: string;
  }
> = {
  sql: {
    icon: Database,
    accentColor: "#2563EB",
    bgGradient: "from-blue-500/10 via-blue-500/5 to-transparent",
    borderColor: "border-blue-200 hover:border-blue-400",
    badgeText: "Relational Queries & Engines",
  },
  java: {
    icon: Coffee,
    accentColor: "#D97706",
    bgGradient: "from-amber-500/10 via-amber-500/5 to-transparent",
    borderColor: "border-amber-200 hover:border-amber-400",
    badgeText: "Enterprise OOP & Concurrency",
  },
  python: {
    icon: Terminal,
    accentColor: "#059669",
    bgGradient: "from-emerald-500/10 via-emerald-500/5 to-transparent",
    borderColor: "border-emerald-200 hover:border-emerald-400",
    badgeText: "Scripting, OOP & Data Libs",
  },
  html: {
    icon: Globe,
    accentColor: "#E11D48",
    bgGradient: "from-rose-500/10 via-rose-500/5 to-transparent",
    borderColor: "border-rose-200 hover:border-rose-400",
    badgeText: "Web Standards & Semantics",
  },
  "data-structures": {
    icon: Network,
    accentColor: "#7C3AED",
    bgGradient: "from-purple-500/10 via-purple-500/5 to-transparent",
    borderColor: "border-purple-200 hover:border-purple-400",
    badgeText: "Algorithms, Trees & Graphs",
  },
  cpp: {
    icon: Cpu,
    accentColor: "#0284C7",
    bgGradient: "from-sky-500/10 via-sky-500/5 to-transparent",
    borderColor: "border-sky-200 hover:border-sky-400",
    badgeText: "Low-Level Memory & Templates",
  },
};

export function SubjectSelector({
  onSelectSubject,
  currentSubjectSlug,
  isModal = false,
  onClose,
}: SubjectSelectorProps) {
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubjects = async () => {
      try {
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

        const url = studentEmail
          ? `/api/subjects?studentEmail=${encodeURIComponent(studentEmail)}`
          : "/api/subjects";

        const res = await fetch(url);
        const data = await res.json();
        if (data.subjects) {
          setSubjects(data.subjects);
        }
      } catch (err) {
        console.error("Failed to load subjects:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubjects();
  }, []);

  return (
    <div
      className={`w-full max-w-6xl mx-auto ${
        isModal ? "p-6" : "py-8 sm:py-12 px-4 sm:px-6"
      }`}
    >
      {/* Header Banner */}
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B4472A]/10 border border-[#B4472A]/20 text-[#B4472A] text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" />
          Curriculum Track Selection
        </div>

        <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 tracking-tight">
          Which subject would you like to master?
        </h1>

        <p className="text-sm sm:text-base text-stone-600 font-sans leading-relaxed">
          Choose a foundational domain below. Each track features{" "}
          <span className="font-semibold text-stone-800">
            6 progressive topics
          </span>{" "}
          with automated gap detection and adaptive drills.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-10 h-10 border-2 border-[#B4472A] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-stone-500 font-sans">
            Loading subjects and learning tracks...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => {
            const config = SUBJECT_CONFIGS[sub.slug] || {
              icon: BookOpen,
              accentColor: "#2B5D4F",
              bgGradient: "from-stone-500/10 to-transparent",
              borderColor: "border-stone-200 hover:border-stone-400",
              badgeText: "Core Subject Track",
            };
            const IconComponent = config.icon;
            const isCurrent = currentSubjectSlug === sub.slug;
            const masteryPercent = Math.round(sub.averageMastery * 100);

            return (
              <div
                key={sub.id}
                onClick={() => {
                  onSelectSubject(sub.slug);
                  if (onClose) onClose();
                }}
                className={`group relative flex flex-col justify-between p-6 rounded-2xl bg-white border transition-all duration-300 cursor-pointer shadow-sm hover:shadow-md hover:-translate-y-1 ${
                  config.borderColor
                } ${
                  isCurrent
                    ? "ring-2 ring-offset-2 ring-stone-800 border-stone-800"
                    : ""
                }`}
              >
                {/* Background soft glow gradient */}
                <div
                  className={`absolute inset-0 rounded-2xl bg-gradient-to-b ${config.bgGradient} opacity-40 group-hover:opacity-100 transition-opacity pointer-events-none`}
                />

                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105"
                      style={{ backgroundColor: config.accentColor }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex flex-col items-end">
                      <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-stone-100 text-stone-600 border border-stone-200 font-medium">
                        6 Topics
                      </span>
                      {isCurrent && (
                        <span className="text-[10px] font-bold text-stone-800 uppercase mt-1 tracking-wider">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-serif font-bold text-stone-900 group-hover:text-stone-950 transition-colors flex items-center gap-2">
                      {sub.name}
                    </h3>
                    <p className="text-xs text-stone-500 font-sans mt-1 line-clamp-2 leading-relaxed">
                      {sub.description}
                    </p>
                  </div>

                  {/* Topic badge preview */}
                  <div className="text-[11px] font-mono text-stone-500 bg-stone-50/80 p-2 rounded-lg border border-stone-100">
                    <span className="text-stone-400 font-sans">Track: </span>
                    {config.badgeText}
                  </div>
                </div>

                <div className="relative z-10 pt-5 mt-4 border-t border-stone-100 space-y-3">
                  {/* Mastery Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="text-stone-500 font-sans">Domain Mastery</span>
                      <span className="font-mono font-semibold text-stone-800">
                        {masteryPercent}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.max(4, masteryPercent)}%`,
                          backgroundColor:
                            masteryPercent >= 80
                              ? "#2B5D4F"
                              : masteryPercent >= 60
                              ? config.accentColor
                              : "#B4472A",
                        }}
                      />
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs font-semibold text-stone-700 group-hover:text-stone-950">
                      {isCurrent ? "Currently Learning" : "Start Learning"}
                    </span>
                    <div className="w-7 h-7 rounded-full bg-stone-100 flex items-center justify-center text-stone-700 group-hover:bg-stone-900 group-hover:text-white transition-colors">
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      <div className="mt-10 text-center text-xs text-stone-500">
        You can switch between subjects at any time using the subject bar on your dashboard.
      </div>
    </div>
  );
}
