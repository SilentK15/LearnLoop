import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "LearnLoop — Adaptive Knowledge Engine & Gap Detection",
  description:
    "Next.js 14 + Supabase PostgreSQL adaptive assessment platform with real-time mastery recomputation and Gemini-powered learning diagnostics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className="min-h-screen selection:bg-[#B4472A]/20"
        style={{ backgroundColor: "var(--bg-warm, #F7F5F1)" }}
      >
        {children}
      </body>
    </html>
  );
}
