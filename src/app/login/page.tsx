"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase";
import { Zap, ArrowRight, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Authenticate locally + attempt Supabase in background
  const completeLogin = (userEmail: string, name: string, role: string, isDemo: boolean = false) => {
    localStorage.setItem(
      "learnloop_session",
      JSON.stringify({
        email: userEmail,
        name,
        role,
        timestamp: Date.now(),
      })
    );
    localStorage.setItem(
      "hackstreak_session",
      JSON.stringify({
        email: userEmail,
        name,
        role,
        timestamp: Date.now(),
      })
    );
    localStorage.removeItem("learnloop_selected_subject_slug");
    localStorage.setItem("learnloop_prompt_subject", "true");
    document.cookie = "learnloop_auth=1; path=/; max-age=86400; SameSite=Lax";
    // Redirect: demo flag forces query param, otherwise plain home
    router.replace(isDemo ? "/?demo=1" : "/");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Check for Judge or Demo credentials if entered
      if (
        cleanEmail === "judge@learnloop.dev" ||
        cleanEmail === "judge@hackstreak.dev" ||
        cleanEmail === "judge"
      ) {
        completeLogin("judge@learnloop.dev", "Judge Evaluator", "judge");
        return;
      }

      if (
        cleanEmail === "demo@learnloop.dev" ||
        cleanEmail === "demo@hackstreak.dev" ||
        cleanEmail === "demo"
      ) {
        completeLogin("demo@learnloop.dev", "Demo Student", "student");
        return;
      }

      // 2. Check if this user registered via the Sign Up page
      try {
        const registeredUsers = JSON.parse(
          localStorage.getItem("learnloop_registered_users") || "{}"
        );
        if (registeredUsers[cleanEmail]) {
          const registered = registeredUsers[cleanEmail];
          if (registered.password && registered.password !== password) {
            setError("Incorrect password for this registered account.");
            setIsLoading(false);
            return;
          }
          // Normal user login, no demo flag
          completeLogin(cleanEmail, registered.name, registered.role || "student", false);
          return;
        }
      } catch {
        // Fall through
      }

      // 3. Try Supabase login if credentials configured
      try {
        const client = supabaseClient();
        if (client?.auth) {
          const { data, error: loginError } = await client.auth.signInWithPassword({
            email,
            password,
          });
          if (data?.session && !loginError) {
            completeLogin(email, email.split("@")[0], "student");
            return;
          }
        }
      } catch {
        // Fallback to local session
      }

      // 4. Fallback: Allow any valid email to sign in
      if (cleanEmail && password.length >= 4) {
        completeLogin(cleanEmail, cleanEmail.split("@")[0], "student");
        return;
      }

      setError("Please enter a valid email and password (minimum 4 characters).");
    } catch (err: any) {
      setError(err?.message || "Failed to sign in. Please try demo login.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoStudent = () => {
    // Explicit demo flag
    completeLogin("demo@learnloop.dev", "Demo Student", "student", true);
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
        {/* Main Card */}
        <div
          style={{
            padding: "32px",
            backgroundColor: "#141420",
            border: "3px solid #00ffcc",
            boxShadow: "6px 6px 0px #000, 0 0 30px rgba(0, 255, 204, 0.15)",
          }}
        >
          {/* Header */}
          <div className="text-center space-y-3 mb-8">
            <div
              className="inline-flex items-center justify-center w-14 h-14 mb-2"
              style={{
                border: "3px solid #00ffcc",
                boxShadow: "3px 3px 0px #000, 0 0 15px rgba(0, 255, 204, 0.3)",
                backgroundColor: "rgba(0, 255, 204, 0.08)",
                color: "#00ffcc",
              }}
            >
              <Zap className="w-7 h-7" />
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
              LearnLoop
            </h1>
            <p
              style={{
                fontFamily: "'VT323', monospace",
                fontSize: "18px",
                color: "#6a6a8a",
              }}
            >
              Adaptive Quest Academy
            </p>
          </div>

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

          {/* Standard Form */}
          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label
                htmlFor="email"
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
                id="email"
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
                  color: "#00ffcc",
                  border: "3px solid #2a2a44",
                  boxShadow: "3px 3px 0px #000, inset 0 0 8px rgba(0, 255, 204, 0.05)",
                }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  style={{
                    display: "block",
                    fontFamily: "'Press Start 2P', monospace",
                    fontSize: "8px",
                    color: "#6a6a8a",
                    textTransform: "uppercase",
                    letterSpacing: "2px",
                  }}
                >
                  Password
                </label>
                <span
                  style={{
                    fontFamily: "'VT323', monospace",
                    fontSize: "14px",
                    color: "#4a4a6a",
                  }}
                >
                  min 4 chars
                </span>
              </div>
              <input
                id="password"
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
                  color: "#00ffcc",
                  border: "3px solid #2a2a44",
                  boxShadow: "3px 3px 0px #000, inset 0 0 8px rgba(0, 255, 204, 0.05)",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              style={{
                width: "100%",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "10px",
                padding: "14px",
                backgroundColor: "#00ff66",
                color: "#000",
                border: "3px solid #000",
                boxShadow: "4px 4px 0px #000, 0 0 12px rgba(0, 255, 102, 0.3)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
                opacity: isLoading ? 0.6 : 1,
                cursor: isLoading ? "wait" : "pointer",
              }}
            >
              <span>{isLoading ? "LOADING..." : "▶ LOG IN"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleDemoStudent}
              style={{
                width: "100%",
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "8px",
                padding: "12px",
                backgroundColor: "#0d0d14",
                color: "#ffcc00",
                border: "3px solid #ffcc00",
                boxShadow: "3px 3px 0px #000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "8px",
              }}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>★ DEMO PLAYER</span>
            </button>
          </div>

          {/* Link to Sign Up */}
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
              New player?{" "}
            </span>
            <Link
              href="/signup"
              style={{
                fontFamily: "'Press Start 2P', monospace",
                fontSize: "8px",
                color: "#ff0055",
                textDecoration: "none",
                borderBottom: "2px solid #ff0055",
                paddingBottom: "2px",
              }}
            >
              CREATE ACCOUNT
            </Link>
          </div>
        </div>

        {/* Footer */}
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
