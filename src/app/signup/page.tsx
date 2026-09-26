"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabaseClient } from "@/lib/supabase";
import { Zap, ArrowRight, ShieldCheck, UserCheck } from "lucide-react";

export default function SignUpPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"student" | "judge">("judge");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const completeSignUp = (userEmail: string, userName: string, userRole: string) => {
    localStorage.setItem(
      "hackstreak_session",
      JSON.stringify({
        email: userEmail,
        name: userName || "Judge Evaluator",
        role: userRole,
        timestamp: Date.now(),
      })
    );
    document.cookie = "hackstreak_auth=1; path=/; max-age=86400; SameSite=Lax";
    setSuccess(true);
    setTimeout(() => {
      router.replace("/?demo=1");
    }, 800);
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
                name: name || (role === "judge" ? "Judge Evaluator" : "Student"),
                role,
              },
            },
          });
        }
      } catch {
        // Fall back gracefully to mock session
      }

      completeSignUp(cleanEmail, name || (role === "judge" ? "Judge Evaluator" : "Student"), role);
    } catch (err: any) {
      setError(err?.message || "Sign up failed. Please try again.");
      setIsLoading(false);
    }
  };

  const handleQuickJudgeSignup = () => {
    setName("Judge Evaluator");
    setEmail("judge@hackstreak.dev");
    setPassword("judge2024");
    setRole("judge");
    completeSignUp("judge@hackstreak.dev", "Judge Evaluator", "judge");
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 selection:bg-[#B4472A]/20"
      style={{ backgroundColor: "var(--bg-warm, #F7F5F1)" }}
    >
      <div className="w-full max-w-md">
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
            <h1 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight text-[#111111]">
              Join Hackstreak
            </h1>
            <p className="text-xs font-sans text-stone-600">
              Create an account or register as a Judge for live evaluation
            </p>
          </div>

          {/* Quick Judge Access Banner */}
          <div
            className="rounded-xl p-3.5 border space-y-2.5"
            style={{
              backgroundColor: "#FAF7F2",
              borderColor: "#E2D9CC",
            }}
          >
            <div className="flex items-center justify-between text-xs font-semibold text-[#B4472A]">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>JUDGE EXPRESS ONBOARDING</span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B4472A]/10 border border-[#B4472A]/20 font-mono">
                Live Demo
              </span>
            </div>
            <p className="text-xs text-stone-600">
              Evaluating this hackathon project? Click below to immediately register and enter the app as an Evaluator.
            </p>
            <button
              type="button"
              onClick={handleQuickJudgeSignup}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-semibold text-white shadow-sm transition-all active:scale-98"
              style={{
                backgroundColor: "var(--color-recommended, #B4472A)",
              }}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>⚡ Register Instantly as Judge Evaluator</span>
            </button>
          </div>

          {success && (
            <div className="p-3 rounded-lg text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2">
              <UserCheck className="w-4 h-4 shrink-0" />
              <span>Account created! Redirecting to live curriculum...</span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-lg text-xs bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label
                htmlFor="name"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Full Name
              </label>
              <input
                id="name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Dr. Evelyn Carter"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#2B5D4F]/20 focus:border-[#2B5D4F] transition-all"
                style={{ borderColor: "#D8D2C7" }}
              />
            </div>

            <div>
              <label
                htmlFor="signup-email"
                className="block text-xs font-medium text-stone-700 mb-1"
              >
                Email Address
              </label>
              <input
                id="signup-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="judge@hackstreak.dev"
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#2B5D4F]/20 focus:border-[#2B5D4F] transition-all"
                style={{ borderColor: "#D8D2C7" }}
              />
            </div>

            <div>
              <label
                htmlFor="signup-password"
                className="block text-xs font-medium text-stone-700 mb-1"
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
                className="w-full px-3.5 py-2.5 rounded-xl border text-sm text-stone-900 placeholder:text-stone-400 bg-white focus:outline-none focus:ring-2 focus:ring-[#2B5D4F]/20 focus:border-[#2B5D4F] transition-all"
                style={{ borderColor: "#D8D2C7" }}
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-stone-700 mb-1">
                Account Role
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRole("judge")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    role === "judge"
                      ? "border-[#B4472A] bg-[#B4472A]/10 text-[#B4472A] font-semibold"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  ⚖️ Judge / Reviewer
                </button>
                <button
                  type="button"
                  onClick={() => setRole("student")}
                  className={`py-2 px-3 rounded-xl text-xs font-medium border text-center transition-all ${
                    role === "student"
                      ? "border-[#2B5D4F] bg-[#2B5D4F]/10 text-[#2B5D4F] font-semibold"
                      : "border-stone-200 text-stone-600 hover:bg-stone-50"
                  }`}
                >
                  🎓 Student Learner
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading || success}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white transition-all shadow-sm active:scale-98"
              style={{
                backgroundColor: "var(--color-mastered, #2B5D4F)",
              }}
            >
              <span>{isLoading ? "Creating Account..." : "Create Account & Start"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Link to Login */}
          <div className="pt-2 text-center text-xs text-stone-600 border-t border-stone-100">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-semibold underline hover:text-stone-900 transition-colors"
              style={{ color: "var(--color-recommended, #B4472A)" }}
            >
              Log in with credentials
            </Link>
          </div>
        </div>

        <p className="text-center text-[11px] text-stone-500 mt-4">
          Hackstreak Adaptive Engine • Built for Live Hackathon Judging
        </p>
      </div>
    </div>
  );
}
