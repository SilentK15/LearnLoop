# 🔄 LearnLoop

> **Adaptive Knowledge Engine & Gap-Detection Learning Platform** built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **Supabase PostgreSQL**, and **Google Gemini 1.5**.

---

## ⚡ Hackathon Judging Quick Access

### 🔑 Judge Credentials
- **Email:** `judge@learnloop.dev` (or `judge@hackstreak.dev`)
- **Password:** `judge2024`
- **1-Click Judge Access:** Click the **⚡ 1-Click Instant Judge Login** button on `/login` to bypass typing completely.
- **Demo Student Mode:** Click **Continue as Demo Student** to instantly inspect the pre-seeded learner profile (`Alex Rivera`).
- **Custom Account Registration:** Visit `/signup` to register as a Judge or Student. Any registered credentials can be used immediately to log in.

---

## 🎯 Architecture & What Makes LearnLoop Unique

LearnLoop transforms static learning by enforcing a **strictly linear knowledge graph** (`orderIndex` 1 through 6) combined with **Bayesian Item Response Theory (IRT)**:

1. **Linear Knowledge Dependency:** Concepts progress strictly in sequence. An unresolved gap earlier in the chain impedes later mastery.
2. **Deterministic Gap Detection:** The algorithm continuously monitors all concepts and recommends the **earliest concept in linear order with mastery < 60%**.
3. **Continuous Difficulty Calibration:** Questions adapt in real-time ($D_1$ to $D_5$), shifting $\pm 1$ on each answer attempt.
4. **Bayesian Mastery Updates:** Masteries are updated per question using a weighted differential learning equation.
5. **AI Synthesis:** At the conclusion of a session, **Google Gemini 1.5** performs an pedagogical post-drill breakdown.

---

## 🧮 Mathematical Mastery Engine

Upon every submission, the engine updates concept mastery using the dynamic Bayesian formula:

$$\text{newMastery} = \text{oldMastery} + 0.35 \times (\text{outcome} - \text{oldMastery}) \times W(\text{difficulty})$$

- $\text{outcome} \in \{1.0 \text{ (correct)}, 0.0 \text{ (incorrect)}\}$
- $W(\text{difficulty}) = 1.0 + (\text{difficulty} - 3) \times 0.2$
  - Difficulty 1: $0.60$
  - Difficulty 2: $0.80$
  - Difficulty 3: $1.00$ (Standard Baseline)
  - Difficulty 4: $1.20$
  - Difficulty 5: $1.40$
- Clamped strictly within $[0.00, 1.00]$.

---

## 🔁 Live Adaptive Difficulty Engine

- **Initial State:** Starts at intermediate difficulty ($D_3$) or the concept's active difficulty.
- **Correct Response:** Difficulty increments $+1$ (clamped to max $D_5$).
- **Incorrect Response:** Difficulty decrements $-1$ (clamped to min $D_1$).
- **Real-Time Visuals:** Mastery meters and multi-segmented difficulty bars react immediately with live feedback explanations.

---

## 🤖 Google Gemini 1.5 AI Session Synthesis

At the end of an adaptive drill session:
1. Computes the before-vs-after mastery delta across all evaluated curriculum concepts.
2. Calls **Google Gemini 1.5 Flash** (via `@google/generative-ai`) to synthesize a plain-English review outlining:
   - **Session Snapshot**
   - **Key Breakthroughs & Concept Wins**
   - **Vulnerabilities & Identified Blindspots**
   - **Recommended Next Best Move**
3. If no `GEMINI_API_KEY` is provided, automatically uses an intelligent local heuristic evaluator so the app is always 100% operational during offline judging.

---

## 🗄️ Database Schema (Prisma + Supabase)

- **`Student`**: Learner profile (`Alex Rivera`, `demo@learnloop.dev`).
- **`Concept`**: 6 progressive topics ordered strictly by `orderIndex` (1–6).
- **`Question`**: 54 calibrated questions (8–10 per concept) scaled across difficulties 1 to 5 with detailed explanations.
- **`AttemptLog`**: Immutable event stream of all trial submissions recording answers, accuracy, difficulty at trial, and mastery deltas.
- **`MasteryScore`**: Normalized mastery state $[0.00, 1.00]$ per student and concept.

---

## 🚀 Quick Start Guide

### 1. Environment Variables
Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure `.env` contains your Supabase PostgreSQL credentials and optional Gemini API key:
```env
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Optional Google Gemini API Key (Free tier at https://aistudio.google.com)
GEMINI_API_KEY="your-gemini-api-key-here"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 2. Push Schema & Seed Database
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

## 🔄 Replayability: "Reset Baseline" Button
A dedicated **Reset Baseline** button is located in the top navigation bar. Clicking it clears session attempt logs and re-establishes baseline mastery scores (e.g., Concept 3 *Functions & Scope* at 52% to guarantee immediate gap recommendation).
