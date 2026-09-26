# 👾 LearnLoop: Retro RPG Adaptive Learning Engine

> **8-bit/16-bit Retro Arcade Adaptive Assessment Platform** with Bayesian knowledge graph mastery recalculation, multi-realm topic trees, 20-question randomized Stat Trials, and Google Gemini AI diagnostic synthesis.

Built with **Next.js 14 (App Router)**, **TypeScript**, **Tailwind CSS**, **Prisma ORM**, **Supabase PostgreSQL**, and **Google Gemini 1.5**.

---

## 🕹️ Live Demo & Evaluation Walkthrough

### 🚀 Instant Demo Evaluation (Recommended for Judges)
1. Navigate to [`/login`](http://localhost:3000/login).
2. Click **"🎮 Continue as Demo Player (Alex Rivera)"** for instant one-click access with pre-seeded combat history, mastery baselines, and test scores.

### 🔑 User Account Registration & Persistence
- **Hero Sign Up (`/signup`):** Register a custom player account with Name, Email, and Password. Account data, mastery, and encounter logs persist permanently in Supabase PostgreSQL.
- **Hero Sign In (`/login`):** Sign in with existing credentials or use the demo player button.
- **Role-Based Protection:** The **Reset Data** action is exclusively available for the demo student (`demo@hackstreak.dev`) to prevent accidental wiping of real student accounts.

---

## 🌟 Key Features & Gameplay Architecture

### 1. ⚔️ Multi-Subject Skill Trees (Realms)
Students select their learning path from 6 distinct disciplines, each containing a linear progression of 6 specialized topic quests:
- **🗄️ SQL:** SELECT & Filtering → JOINs → Aggregation & GROUP BY → Subqueries & CTEs → Indexes & Performance → Transactions & ACID
- **☕ Java:** Java Syntax & Types → OOP & Classes → Collections Framework → Exception Handling → Concurrency & Threads → JVM & Memory
- **🐍 Python:** Variables & Data Types → Control Structures → Functions & Lambdas → OOP & Classes → Iterators & Generators → Async & Decorators
- **🌐 HTML:** Semantic Elements → Forms & Validations → Multimedia & Canvas → Tables & Layout → SEO & Meta Tags → Accessibility (a11y)
- **🕸️ Data Structures:** Arrays & Strings → Linked Lists → Stacks & Queues → Binary Trees & BST → Graphs & Traversals → Hash Tables & Sets
- **⚙️ C++:** Pointers & References → Classes & Constructors → STL Containers → Memory & RAII → Templates & Generics → Concurrency & Threading

### 2. 🎯 Dynamic 5-Question Adaptive Topic Drills
- **Controlled 5-Question Sessions:** Drills cleanly conclude after 5 calibrated questions, transitioning smoothly to the Victory Log.
- **Calibrated 900+ Question Database:** Each subtopic contains 30–40 calibrated questions across 5 difficulty tiers.
- **RPG Boss Tiers:**
  - `LVL 1 - SLIME` (Recruit / Easy)
  - `LVL 2 - GOBLIN` (Soldier / Medium)
  - `LVL 3 - KNIGHT` (Warrior / Hard)
  - `LVL 4 - DRAGON` (Champion / Expert)
  - `LVL 5 - BOSS` (Grandmaster / Boss)
- **Dynamic IRT Difficulty Adjustment:** Correct answers increase encounter difficulty ($+1$), while misses step down ($-1$), tailoring tests to each student's current skill level.

### 3. 🎲 20-Question Randomized Stat Trial (Ability Benchmark)
- **Cross-Topic Encounter Pool:** Evaluates student ability with a randomized 20-question trial sampled across all topic tests.
- **Fresh Permutations on Every Attempt:** Fisher-Yates randomization and round-robin concept sampling deliver a unique question set every time.
- **Dual Scope Support:**
  - **Subject Realm Trial:** 20 random questions from all 6 topics of the active subject.
  - **Grand Realm Trial (`subject=all`):** 20 random questions drawn across all 6 subjects and 36 subtopics.
- **20-Segment Pixel Health Bar:** Visual real-time encounter tracker with status indicators.
- **Re-Roll Controls:** One-click re-roll generates 20 fresh questions at any time.
- **Trial Evaluation Debriefing:** Displays score, precision rate, and RPG Rank (`S-RANK`, `A-RANK`, `B-RANK`, `C-RANK`) with question-by-question breakdown.

### 4. 🧮 Bayesian Mastery Calculation Engine
Upon every question submission, mastery is updated in real time using a Bayesian differential formula:

$$\text{newMastery} = \text{oldMastery} + 0.35 \times (\text{outcome} - \text{oldMastery}) \times W(\text{difficulty})$$

- $\text{outcome} \in \{1.0 \text{ (correct)}, 0.0 \text{ (incorrect)}\}$
- $W(\text{difficulty}) = 1.0 + (\text{difficulty} - 3) \times 0.2$
  - Level 1 (Slime): $0.60$
  - Level 2 (Goblin): $0.80$
  - Level 3 (Knight): $1.00$
  - Level 4 (Dragon): $1.20$
  - Level 5 (Boss): $1.40$
- Mastery is strictly bounded within $[0.00, 1.00]$.

### 5. 🤖 Google Gemini 1.5 AI Tactical Debriefing
- Analyzes session logs to synthesize plain-English pedagogical feedback.
- Identifies **Key Breakthroughs & Strength Mastery**, **Target Focus Areas & Blindspots**, and **Recommended Next Quests**.
- Includes automatic fallback to an intelligent heuristic diagnostics engine if no API key is configured.

### 6. 🎨 8-Bit/16-Bit Retro RPG Arcade Aesthetic
- **Pixel Typography:** Google Fonts `Press Start 2P` for HUD headers, scores, badges, and meters; `VT323` for terminal descriptions and questions.
- **Dark Neon Palette:** Deep space background (`#121216`), arcade card panels (`#1e1e24`), sharp cyan (`#00ffcc`), arcade pink (`#ff0055`), emerald green (`#00ff66`), coin gold (`#ffcc00`), and neon purple (`#a855f7`).
- **Retro Visual Accents:** Pixel box-shadow borders (`4px 4px 0px 0px #000`), scanlines, glowing health bars, and celebration particle confetti.

---

## 🗺️ Application Navigation

| Tab / Route | Name | Purpose |
| :--- | :--- | :--- |
| `REALMS` | Subject Selector | Choose between SQL, Java, Python, HTML, Data Structures, and C++ |
| `QUESTS` | Dashboard | Linear curriculum progression, learning gap alerts, radar metrics, and attempt logs |
| `DRILL` | Adaptive Quiz | 5-question focused adaptive test for a specific topic with dynamic difficulty |
| `STAT TRIAL` | Diagnostic Trial | 20-question randomized trial evaluating ability across all tests |
| `VICTORY` | Session Results | Before vs. After mastery deltas and Gemini AI pedagogical synthesis |

---

## 🛠️ Tech Stack

- **Framework:** [Next.js 14](https://nextjs.org/) (App Router, Server Actions, API Routes)
- **Language:** TypeScript
- **Styling:** Vanilla Tailwind CSS with custom 8-bit retro arcade tokens, `@tailwindcss/typography`, custom keyframe animations
- **Database & Auth:** Supabase PostgreSQL with Connection Pooling
- **ORM:** Prisma Client
- **AI Engine:** Google Gemini 1.5 Flash via `@google/genai`
- **Effects & Icons:** Lucide React, Canvas-Confetti

---

## 🚀 Local Development Setup

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/SilentK15/LearnLoop.git
cd LearnLoop
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Ensure `.env` contains your Supabase PostgreSQL credentials and optional Gemini API key:
```env
DATABASE_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[YOUR-PROJECT-REF]:[YOUR-PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Optional Google Gemini API Key (Get free key at https://aistudio.google.com)
GEMINI_API_KEY="your-gemini-api-key-here"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Initialize & Seed Database
```bash
npm run db:push
npm run db:seed
```

### 4. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🌐 Deploy to Vercel

1. Push your repository to GitHub:
   ```bash
   git push origin main
   ```
2. Import the project in [Vercel](https://vercel.com).
3. Set the environment variables:
   - `DATABASE_URL`
   - `DIRECT_URL`
   - `GEMINI_API_KEY` (optional)
4. Click **Deploy**. Vercel will automatically build the Next.js bundle and configure edge caching.
