# ⚡ Hackstreak

> **Adaptive Knowledge Engine & Gap-Detection Platform** built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **Supabase PostgreSQL**, and **Google Gemini 1.5**.

---

## 🎯 Architecture Overview

Hackstreak models learning across a **strictly linear progression of concepts** (`orderIndex` 1 through 6) rather than an unconstrained DAG. Knowledge gaps are detected automatically by identifying the earliest concept in sequence where mastery drops below **60%**.

### 1. Database Schema (Prisma + Supabase)
- **`Student`**: Demo student identity (`Alex Rivera`, `demo@hackstreak.dev`).
- **`Concept`**: 6 progressive topics ordered strictly by `orderIndex` (1–6).
- **`Question`**: 54 calibrated questions (8–10 per concept) scaled across difficulties 1 to 5 with detailed explanations.
- **`AttemptLog`**: Immutable event stream of all trial submissions recording answers, accuracy, difficulty at trial, and mastery deltas.
- **`MasteryScore`**: Normalized mastery state $[0.00, 1.00]$ per student and concept.

---

## 🧮 Dynamic Mastery Recomputation Engine

Upon every submission, the engine updates mastery using the required Bayesian delta formula:

$$\text{newMastery} = \text{oldMastery} + 0.35 \times (\text{outcome} - \text{oldMastery}) \times W(\text{difficulty})$$

- $\text{outcome} \in \{1.0 \text{ (correct)}, 0.0 \text{ (incorrect)}\}$
- $W(\text{difficulty}) = 1.0 + (\text{difficulty} - 3) \times 0.2$ (D1: 0.60, D2: 0.80, D3: 1.00, D4: 1.20, D5: 1.40)
- Clamped strictly within $[0.00, 1.00]$.

---

## 🔁 Live Adaptive Difficulty Engine

- Starts at intermediate difficulty (D3) or concept's current mastery level.
- **Correct answer**: difficulty increments $+1$ (clamped to max 5).
- **Incorrect answer**: difficulty decrements $-1$ (clamped to min 1).
- Live mastery recomputes in real time and updates the visual UI immediately.

---

## 🤖 Google Gemini 1.5 AI Session Synthesis

At the end of an adaptive drill:
1. Computes the before-vs-after mastery delta for all touched concepts.
2. Calls **Google Gemini 1.5 Flash** (via `@google/generative-ai`) to synthesize a plain-English, pedagogically sound review outlining:
   - **Session Snapshot**
   - **Key Breakthroughs**
   - **Vulnerabilities & Blindspots**
   - **Next Best Move**
3. If no `GEMINI_API_KEY` is provided, automatically uses an intelligent local heuristic evaluator so the app is always fully functional.

---

## 🚀 Quick Start Guide

### 1. Environment Variables
Copy `.env.example` to `.env` and provide your credentials:

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Supabase PostgreSQL (Project Settings -> Database -> Connection string -> URI)
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Google Gemini API Key (Free tier at https://aistudio.google.com)
GEMINI_API_KEY="your-gemini-api-key-here"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Push Schema & Seed Database
Push the Prisma schema to Supabase and seed the demo student, 6 concepts, 54 questions, and initial baseline mastery:

```bash
npm run db:push
npm run db:seed
```

### 3. Launch Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

1. Push this repository to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) and import the repository.
3. In **Environment Variables**, add:
   - `DATABASE_URL`: Your Supabase pooler connection string (with `?pgbouncer=true`).
   - `DIRECT_URL`: Your Supabase direct connection string (port 5432).
   - `GEMINI_API_KEY`: Your Gemini API key.
4. Click **Deploy**. Vercel will automatically run `prisma generate && next build`.

---

## 🔄 Replayability: "Reset Demo Data" Button
A dedicated **Reset Demo Data** button is located in the top navigation bar. Clicking it clears session attempt logs and re-establishes baseline mastery scores (e.g., Concept 3 *Functions & Scope* at 52% to guarantee immediate gap recommendation).
