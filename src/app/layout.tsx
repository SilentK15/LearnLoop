import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hackstreak — Adaptive Knowledge Engine & Gap Detection",
  description:
    "Next.js 14 + Supabase PostgreSQL adaptive assessment platform with real-time mastery recomputation and Gemini-powered learning diagnostics.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-[#090d16] text-slate-100 min-h-screen selection:bg-blue-500/30 selection:text-blue-200">
        {children}
      </body>
    </html>
  );
}
