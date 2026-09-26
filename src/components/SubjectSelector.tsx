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
    glowColor: string;
    badgeText: string;
  }
> = {
  sql: {
    icon: Database,
    accentColor: "#00b4d8",
    glowColor: "rgba(0, 180, 216, 0.3)",
    badgeText: "Relational Queries & Engines",
  },
  java: {
    icon: Coffee,
    accentColor: "#ffcc00",
    glowColor: "rgba(255, 204, 0, 0.3)",
    badgeText: "Enterprise OOP & Concurrency",
  },
  python: {
    icon: Terminal,
    accentColor: "#00ff66",
    glowColor: "rgba(0, 255, 102, 0.3)",
    badgeText: "Scripting, OOP & Data Libs",
  },
  html: {
    icon: Globe,
    accentColor: "#ff0055",
    glowColor: "rgba(255, 0, 85, 0.3)",
    badgeText: "Web Standards & Semantics",
  },
  "data-structures": {
    icon: Network,
    accentColor: "#9d4edd",
    glowColor: "rgba(157, 78, 221, 0.3)",
    badgeText: "Algorithms, Trees & Graphs",
  },
  cpp: {
    icon: Cpu,
    accentColor: "#00ffcc",
    glowColor: "rgba(0, 255, 204, 0.3)",
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
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);

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
      <div className="text-center max-w-2xl mx-auto mb-10 space-y-4">
        <div
          className="inline-flex items-center gap-2 px-4 py-2"
          style={{
            border: "3px solid #00ffcc",
            boxShadow: "3px 3px 0px #000, 0 0 12px rgba(0, 255, 204, 0.25)",
            backgroundColor: "rgba(0, 255, 204, 0.08)",
            color: "#00ffcc",
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "9px",
            textTransform: "uppercase",
            letterSpacing: "2px",
          }}
        >
          <Sparkles className="w-3.5 h-3.5" />
          SELECT YOUR QUEST
        </div>

        <h1
          style={{
            fontFamily: "'Press Start 2P', monospace",
            fontSize: "1.3rem",
            color: "#00ffcc",
            textShadow: "3px 3px 0px #000, 0 0 20px rgba(0, 255, 204, 0.5)",
            lineHeight: "1.8",
          }}
        >
          Choose Your Skill Tree
        </h1>

        <p
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: "20px",
            color: "#a0a0c0",
            lineHeight: "1.4",
          }}
        >
          Each track features{" "}
          <span style={{ color: "#ffcc00", fontWeight: "bold" }}>
            6 progressive dungeons
          </span>{" "}
          with adaptive gap detection and boss-level drills.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div
            className="w-10 h-10 border-4 animate-spin"
            style={{
              borderColor: "#00ffcc",
              borderTopColor: "transparent",
              boxShadow: "0 0 12px rgba(0, 255, 204, 0.4)",
            }}
          />
          <p
            style={{
              fontFamily: "'VT323', monospace",
              fontSize: "18px",
              color: "#6a6a8a",
            }}
          >
            Loading quest map...
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => {
            const config = SUBJECT_CONFIGS[sub.slug] || {
              icon: BookOpen,
              accentColor: "#00ffcc",
              glowColor: "rgba(0, 255, 204, 0.3)",
              badgeText: "Core Subject Track",
            };
            const IconComponent = config.icon;
            const isCurrent = currentSubjectSlug === sub.slug;
            const isHovered = hoveredSlug === sub.slug;
            const masteryPercent = Math.round(sub.averageMastery * 100);

            return (
              <div
                key={sub.id}
                onClick={() => {
                  onSelectSubject(sub.slug);
                  if (onClose) onClose();
                }}
                onMouseEnter={() => setHoveredSlug(sub.slug)}
                onMouseLeave={() => setHoveredSlug(null)}
                className="group relative flex flex-col justify-between cursor-pointer"
                style={{
                  padding: "20px",
                  backgroundColor: isCurrent ? "#1e1e3a" : "#141420",
                  border: `3px solid ${
                    isCurrent
                      ? config.accentColor
                      : isHovered
                      ? config.accentColor
                      : "#2a2a44"
                  }`,
                  boxShadow: isHovered
                    ? `5px 5px 0px #000, 0 0 20px ${config.glowColor}`
                    : "4px 4px 0px #000",
                  transition: "box-shadow 0.15s, border-color 0.15s, transform 0.1s",
                  transform: isHovered ? "translateY(-3px)" : "none",
                }}
              >
                <div className="relative z-10 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div
                      className="w-12 h-12 flex items-center justify-center"
                      style={{
                        border: `3px solid ${config.accentColor}`,
                        boxShadow: `2px 2px 0px #000, 0 0 8px ${config.glowColor}`,
                        backgroundColor: "rgba(0,0,0,0.3)",
                        color: config.accentColor,
                      }}
                    >
                      <IconComponent className="w-6 h-6" />
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span
                        style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: "7px",
                          padding: "3px 8px",
                          border: "2px solid #2a2a44",
                          boxShadow: "2px 2px 0px #000",
                          backgroundColor: "#0d0d14",
                          color: "#a0a0c0",
                          textTransform: "uppercase",
                        }}
                      >
                        6 STAGES
                      </span>
                      {isCurrent && (
                        <span
                          style={{
                            fontFamily: "'Press Start 2P', monospace",
                            fontSize: "7px",
                            color: config.accentColor,
                            textShadow: `0 0 6px ${config.glowColor}`,
                          }}
                        >
                          ▶ ACTIVE
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <h3
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: "0.8rem",
                        color: config.accentColor,
                        textShadow: `1px 1px 0px #000`,
                        lineHeight: "1.6",
                      }}
                    >
                      {sub.name}
                    </h3>
                    <p
                      style={{
                        fontFamily: "'VT323', monospace",
                        fontSize: "16px",
                        color: "#8888a8",
                        marginTop: "4px",
                        lineHeight: "1.3",
                      }}
                    >
                      {sub.description}
                    </p>
                  </div>

                  {/* Track badge */}
                  <div
                    style={{
                      fontFamily: "'VT323', monospace",
                      fontSize: "15px",
                      padding: "6px 10px",
                      border: "2px solid #2a2a44",
                      backgroundColor: "#0d0d14",
                      color: "#6a6a8a",
                    }}
                  >
                    <span style={{ color: "#4a4a6a" }}>Track: </span>
                    {config.badgeText}
                  </div>
                </div>

                <div
                  className="relative z-10 pt-5 mt-4 space-y-3"
                  style={{ borderTop: "2px solid #2a2a44" }}
                >
                  {/* Mastery Progress Bar */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <span
                        style={{
                          fontFamily: "'VT323', monospace",
                          fontSize: "16px",
                          color: "#6a6a8a",
                        }}
                      >
                        Domain Mastery
                      </span>
                      <span
                        style={{
                          fontFamily: "'Press Start 2P', monospace",
                          fontSize: "9px",
                          color: config.accentColor,
                        }}
                      >
                        {masteryPercent}%
                      </span>
                    </div>
                    <div
                      style={{
                        width: "100%",
                        height: "8px",
                        backgroundColor: "#0d0d12",
                        border: "2px solid #2a2a44",
                        boxShadow: "inset 0 1px 0 rgba(0,0,0,0.5), 1px 1px 0px #000",
                      }}
                    >
                      <div
                        style={{
                          width: `${Math.max(4, masteryPercent)}%`,
                          height: "100%",
                          backgroundColor:
                            masteryPercent >= 80
                              ? "#00ff66"
                              : masteryPercent >= 60
                              ? config.accentColor
                              : "#ff0055",
                          boxShadow:
                            masteryPercent >= 80
                              ? "0 0 6px rgba(0,255,102,0.4)"
                              : "none",
                          transition: "width 0.5s",
                        }}
                      />
                    </div>
                  </div>

                  {/* Action CTA */}
                  <div className="flex items-center justify-between pt-1">
                    <span
                      style={{
                        fontFamily: "'Press Start 2P', monospace",
                        fontSize: "8px",
                        color: isHovered ? config.accentColor : "#8888a8",
                        textTransform: "uppercase",
                        transition: "color 0.15s",
                      }}
                    >
                      {isCurrent ? "⚔ Continue Quest" : "▶ Start Quest"}
                    </span>
                    <div
                      className="w-7 h-7 flex items-center justify-center"
                      style={{
                        border: `2px solid ${isHovered ? config.accentColor : "#2a2a44"}`,
                        boxShadow: isHovered ? `0 0 8px ${config.glowColor}` : "2px 2px 0px #000",
                        backgroundColor: isHovered ? config.accentColor : "#0d0d14",
                        color: isHovered ? "#000" : "#6a6a8a",
                        transition: "all 0.15s",
                      }}
                    >
                      <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Footer hint */}
      <div
        className="mt-10 text-center"
        style={{
          fontFamily: "'VT323', monospace",
          fontSize: "16px",
          color: "#4a4a6a",
        }}
      >
        ◆ You can switch between quests at any time from the dashboard ◆
      </div>
    </div>
  );
}
