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
              Join LearnLoop
            </h1>
            <p className="text-xs font-sans text-stone-600">
              Create your account to start adaptive learning
            </p>
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
                placeholder="Alex Rivera"
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
                placeholder="name@example.com"
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
          LearnLoop Adaptive Learning Engine
        </p>
      </div>
    </div>
  );
}
