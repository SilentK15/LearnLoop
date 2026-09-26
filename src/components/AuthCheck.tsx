"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabaseClient } from "@/lib/supabase";

export default function AuthCheck({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // 1. Check URL query param ?demo=1
        if (typeof window !== "undefined") {
          const url = new URL(window.location.href);
          if (url.searchParams.get("demo") === "1") {
            const demoSession = {
              email: "demo@learnloop.dev",
              name: "Demo Student",
              role: "student",
            };
            localStorage.setItem("learnloop_session", JSON.stringify(demoSession));
            localStorage.setItem("hackstreak_session", JSON.stringify(demoSession));
            setIsAuthenticated(true);
            return;
          }

          // 2. Check localStorage session (Judge credentials or logged-in student)
          const stored =
            localStorage.getItem("learnloop_session") ||
            localStorage.getItem("hackstreak_session");
          if (stored) {
            setIsAuthenticated(true);
            return;
          }
        }

        // 3. Check Supabase session safely without throwing
        try {
          const client = supabaseClient();
          if (client && client.auth) {
            const { data } = await client.auth.getSession();
            if (data?.session) {
              setIsAuthenticated(true);
              return;
            }
          }
        } catch {
          // If Supabase is not configured, fall through
        }

        // Not authenticated
        setIsAuthenticated(false);
        router.replace("/login");
      } catch (err) {
        console.error("Auth check failed:", err);
        // Default to letting the demo load rather than an unrecoverable crash
        setIsAuthenticated(true);
      }
    };

    checkAuth();
  }, [router]);

  if (isAuthenticated === null) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center gap-3"
        style={{ backgroundColor: "var(--bg-warm, #F7F5F1)" }}
      >
        <div className="w-8 h-8 border-2 border-[#B4472A] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm font-sans text-stone-600">Verifying session...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
