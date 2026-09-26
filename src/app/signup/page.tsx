"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase";
import { Zap, ArrowRight, UserCheck } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const saveUserAndComplete = (
    userEmail: string,
    userName: string,
    userPass: string
  ) => {
    // 1. Save user to registered users database in localStorage
    try {
      const existingUsers = JSON.parse(
        localStorage.getItem("learnloop_registered_users") || "{}"
      );
      existingUsers[userEmail.toLowerCase()] = {
        name: userName || "Student Learner",
        role: "student",
        password: userPass,
        createdAt: Date.now(),
      };
      localStorage.setItem(
        "learnloop_registered_users",
        JSON.stringify(existingUsers)
      );
    } catch (err) {
      console.error("Failed to store user registry:", err);
    }

    // 2. Clear any old demo session keys
    localStorage.removeItem("learnloop_session");
    localStorage.removeItem("hackstreak_session");

    // 3. Set active session
    const sessionData = {
      email: userEmail,
      name: userName || "Student Learner",
      role: "student",
      timestamp: Date.now(),
    };
    localStorage.setItem("learnloop_session", JSON.stringify(sessionData));
    localStorage.setItem("hackstreak_session", JSON.stringify(sessionData));

    localStorage.removeItem("learnloop_selected_subject_slug");
    localStorage.setItem("learnloop_prompt_subject", "true");
    document.cookie = "learnloop_auth=1; path=/; max-age=86400; SameSite=Lax";
    setSuccess(true);
    setTimeout(() => {
      router.replace("/");
      // Force a full reload to ensure the new session is used
      setTimeout(() => {
        window.location.reload();
      }, 100);
    }, 700);
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();
      if (!cleanEmail || !cleanEmail.includes("@")) {
        setError("Please enter a valid email address.");
        setIsLoading(false);
        return;
      }

      if (password.length < 4) {
        setError("Password must be at least 4 characters.");
        setIsLoading(false);
        return;
      }

      // Try Supabase if configured
      try {
        const client = supabaseClient();
        if (client?.auth) {
          await client.auth.signUp({
            email: cleanEmail,
            password,
            options: {
              data: {
                name: name || "Student Learner",
                role: "student",
              },
            },
          });
        }
      } catch {
        // Fall back gracefully to local registry
      }

      saveUserAndComplete(cleanEmail, name || "Student Learner", password);
    } catch (err: any) {
      setError(err?.message || "Sign up failed. Please try again.");
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: "#0a0a0f",
        backgroundImage:
          "linear-gradient(rgba(10, 10, 15, 0.96), rgba(10, 10, 15, 0.96)), linear-gradient(0deg, rgba(0, 255, 204, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 204, 0.03) 1px, transparent 1px)",
        backgroundSize: "100% 100%, 24px 24px, 24px 24px",
      }}
    >
      <div className="w-full max-w-md">
        <div
          style={{
            padding: "32px",
            backgroundColor: "#141420",
            border: "3px solid #9d4edd",
            boxShadow: "6px 6px 0px #000, 0 0 30px rgba(157, 78, 221, 0.15)",
          }}
        >
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 mb-2"
              style={{
                border: "3px solid #9d4edd",
                boxShadow: "3px 3px 0px #000, 0 0 15px rgba(157, 78, 221, 0.3)",
                backgroundColor: "rgba(157, 78, 221, 0.08)",
                color: "#9d4edd",
              }}
            >
              <Zap className="w-7 h-7" />
            </div>
            <h1
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "1.1rem",
                color: "#9d4edd",
                textShadow: "3px 3px 0px #000, 0 0 20px rgba(157, 78, 221, 0.5)",
                lineHeight: "1.8",
              }}
            >
              New Player
            </h1>
            <p
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: "18px",
                color: "#6a6a8a",
              }}
            >
              Create your hero to begin adaptive quests
            </p>
          </div>

          {success && (
            <div
              className="mb-6"
              style={{
                padding: "10px 14px",
                fontFamily: "'VT323', monospace",
                fontSize: "18px",
                backgroundColor: "rgba(0, 255, 102, 0.08)",
                border: "2px solid rgba(0, 255, 102, 0.3)",
                color: "#00ff66",
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>★ Hero created! Entering dungeon...</span>
            </div>
          )}

          {error && (
            <div
              className="mb-6"
              style={{
                padding: "10px 14px",
                fontFamily: "'VT323', monospace",
                fontSize: "16px",
                backgroundColor: "rgba(255, 0, 85, 0.08)",
                border: "2px solid rgba(255, 0, 85, 0.3)",
                color: "#ff0055",
              }}
            >
              ⚠ {error}
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-5">
            <div>
              <label
                htmlFor="name"
                style={{
                  display: "block",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "8px",
                  color: "#6a6a8a",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                Hero Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Rivera"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontFamily: "'VT323', monospace",
                  fontSize: "20px",
                  backgroundColor: "#0d0d14",
                  color: "#9d4edd",
                  border: "3px solid #2a2a44",
                  boxShadow: "3px 3px 0px #000, inset 0 0 8px rgba(157, 78, 221, 0.05)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="signup-email"
                style={{
                  display: "block",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "8px",
                  color: "#6a6a8a",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                Player Email
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hero@example.com"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontFamily: "'VT323', monospace",
                  fontSize: "20px",
                  backgroundColor: "#0d0d14",
                  color: "#9d4edd",
                  border: "3px solid #2a2a44",
                  boxShadow: "3px 3px 0px #000, inset 0 0 8px rgba(157, 78, 221, 0.05)",
                }}
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                style={{
                  display: "block",
                  fontFamily: "'Press Start 2P', monospace",
                  fontSize: "8px",
                  color: "#6a6a8a",
                  marginBottom: "6px",
                  textTransform: "uppercase",
                  letterSpacing: "2px",
                }}
              >
                Password
              </label>
              <input
                id="signup-password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  fontFamily: "'VT323', monospace",
                  fontSize: "20px",
                  backgroundColor: "#0d0d14",
                  color: "#9d4edd",
                  border: "3px solid #2a2a44",
                  boxShadow: "3px 3px 0px #000, inset 0 0 8px rgba(157, 78, 221, 0.05)",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              style={{
                width: "100%",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "10px",
                padding: "14px",
                backgroundColor: "#9d4edd",
                color: "#fff",
                border: "3px solid #000",
                boxShadow: "4px 4px 0px #000, 0 0 12px rgba(157, 78, 221, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: isLoading || success ? 0.6 : 1,
                cursor: isLoading || success ? "wait" : "pointer",
              }}
            >
              <span>{isLoading ? "CREATING..." : "★ CREATE HERO"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Link to Login */}
          <div
            className="pt-5 text-center"
            style={{ borderTop: "2px solid #2a2a44", marginTop: "20px" }}
          >
            <span
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: "18px",
                color: "#6a6a8a",
              }}
            >
              Already a player?{" "}
            </span>
            <Link
              href="/login"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "8px",
                color: "#00ffcc",
                textDecoration: "none",
                borderBottom: "2px solid #00ffcc",
                paddingBottom: "2px",
              }}
            >
              LOG IN
            </Link>
          </div>
        </div>

        <p
          className="text-center mt-4"
          style={{
            fontFamily: "'VT323', monospace",
            fontSize: "16px",
            color: "#4a4a6a",
          }}
        >
          ◆ LearnLoop Quest Academy ◆
        </p>
      </div>
    </div>
  );
}
