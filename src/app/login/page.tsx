"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase";
import { ShieldCheck, Zap, ArrowRight, UserCheck } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Authenticate locally + attempt Supabase in background
  const completeLogin = (userEmail: string, name: string, role: string) => {
    localStorage.setItem(
      "learnloop_session",
      JSON.stringify({
        email: userEmail,
        name,
        role,
        timestamp: Date.now(),
      })
    );
    // Backwards compatibility with previous key
    localStorage.setItem(
      "hackstreak_session",
      JSON.stringify({
        email: userEmail,
        name,
        role,
        timestamp: Date.now(),
      })
    );
    document.cookie = "learnloop_auth=1; path=/; max-age=86400; SameSite=Lax";
    router.replace("/?demo=1");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const cleanEmail = email.trim().toLowerCase();

      // 1. Check for Judge default credentials
      if (
        cleanEmail === "judge@learnloop.dev" ||
        cleanEmail === "judge@hackstreak.dev" ||
        cleanEmail === "judge"
      ) {
        if (password && password !== "judge2024" && password.length < 4) {
          setError("Password must be at least 4 characters (default: judge2024).");
          setIsLoading(false);
          return;
        }
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
          completeLogin(cleanEmail, registered.name, registered.role);
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

      // 4. For live hackathon evaluation: Allow any valid email to sign in
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

  const handleQuickJudgeLogin = () => {
    setIsLoading(true);
    setEmail("judge@learnloop.dev");
    setPassword("judge2024");
    setTimeout(() => {
      completeLogin("judge@learnloop.dev", "Judge Evaluator", "judge");
    }, 250);
  };

  const handleDemoStudent = () => {
    completeLogin("demo@learnloop.dev", "Demo Student", "student");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 selection:bg-[#B4472A]/20"
      style={{ backgroundColor: "var(--bg-warm, #F7F5F1)" }}
    >
      <div className="w-full max-w-md">
        {/* Main Card */}
        <div
          className="rounded-2xl border p-8 space-y-6 shadow-sm"
          style={{
            backgroundColor: "#FFFFFF",
            borderColor: "#E5E0D8",
          }}
        >
          {/* Header */}
          <div className="text-center space-y-1.5">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-[#2B5D4F]/10 text-[#2B5D4F] mb-2">
              <Zap className="w-6 h-6" />
            </div>
            <h1
              className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#111111]"
            >
              LearnLoop
            </h1>
            <p className="text-xs font-sans text-stone-600">
              Adaptive Learning & Concept Mastery Engine
            </p>
          </div>

          {/* Judge Evaluation Banner (Fake Credentials Highlight) */}
          <div
            className="rounded-xl p-4 border space-y-3"
            style={{
              backgroundColor: "#FAF7F2",
              borderColor: "#E2D9CC",
            }}
          >
            <div className="flex items-center gap-2 text-xs font-semibold text-[#B4472A]">
              <ShieldCheck className="w-4 h-4" />
              <span>JUDGE EVALUATION ACCESS</span>
            </div>

            <div className="text-xs text-stone-600 font-mono space-y-1 bg-white p-2.5 rounded-lg border border-[#E5E0D8]">
              <div>
                <span className="text-stone-400">Email: </span>
                <span className="font-semibold text-stone-900">judge@learnloop.dev</span>
              </div>
              <div>
                <span className="text-stone-400">Password: </span>
                <span className="font-semibold text-stone-900">judge2024</span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleQuickJudgeLogin}
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-xs font-semibold text-white transition-all shadow-sm active:scale-98"
              style={{
                backgroundColor: "var(--color-recommended, #B4472A)",
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>1-Click Instant Judge Login</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-lg text-xs bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {/* Standard Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="judge@learnloop.dev"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#B4472A]/20 focus:border-[#B4472A] transition-all"
                style={{ borderColor: "#D8D2C7" }}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label
                  htmlFor="password"
                  className="block text-xs font-medium text-stone-700"
                >
                  Password
                </label>
                <span className="text-[11px] text-stone-400">min 4 chars</span>
              </div>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#B4472A]/20 focus:border-[#B4472A] transition-all"
                style={{ borderColor: "#D8D2C7" }}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all shadow-sm active:scale-98"
              style={{
                backgroundColor: "var(--color-mastered, #2B5D4F)",
              }}
            >
              <span>{isLoading ? "Signing in..." : "Log In"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Quick Demo Bypass */}
          <div className="pt-1">
            <button
              type="button"
              onClick={handleDemoStudent}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-medium text-stone-700 hover:text-stone-900 hover:bg-stone-100 border border-stone-200 transition-all flex items-center justify-center gap-2"
            >
              <UserCheck className="w-3.5 h-3.5 text-stone-500" />
              <span>Continue as Demo Student (Alex Rivera)</span>
            </button>
          </div>

          {/* Link to Sign Up */}
          <div className="pt-2 text-center text-xs text-stone-600 border-t border-stone-100">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="font-semibold underline hover:text-stone-900 transition-colors"
              style={{ color: "var(--color-recommended, #B4472A)" }}
            >
              Create an account / Sign Up
            </Link>
          </div>
        </div>

        {/* Footer info */}
        <p className="text-center text-[11px] text-stone-500 mt-4">
          LearnLoop Adaptive Engine • Built for Live Hackathon Judging
        </p>
      </div>
    </div>
  );
}
