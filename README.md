# Complete Guide

Welcome to the official documentation for the **RRB Exam Preparation Platform**. This comprehensive guide provides a deep dive into the architecture, design, and implementation of a high-performance exam engine built for scalability and a premium user experience.

---

## 📖 Project Overview
The RRB Exam Preparation Platform is a specialized web application designed to help railway aspirants master their exams. It features a massive dataset of ~90,000 questions, an immersive testing environment, and real-time performance tracking.

## 🚀 Key Features
- **Topic-Wise Tests**: Fixed-set practicing on specific subjects with non-repeating question logic.
- **Full Mock Exams**: Dynamically generated 50-question papers with balanced topic distribution.
- **Pro Quiz Engine**:
  - Precision Timer (IST-synchronized).
  - Navigation Control (Prevents accidental exit).
  - Immersive Fullscreen Mode.
  - Question Grid for quick review.
- **Real-Time Analytics**: Instant updates to scores, accuracy, and daily streaks.
- **Global Leaderboard**: Competitive ranking based on total performance.
- **Responsive Mastery**: Fluid UI that feels native on both mobile and desktop.

---

## 🛠️ Tech Stack
- **Framework**: [Next.js 16](https://nextjs.org/) (App Router & Turbopack)
- **Styling**: [Tailwind CSS 4.0](https://tailwindcss.com/)
- **Backend/Database**: [Supabase](https://supabase.com/) (Auth, PostgreSQL, RPC, RLS)
- **State Management**: [TanStack Query v5](https://tanstack.com/query/latest)
- **Icons**: Lucide React
- **Notifications**: React Hot Toast

---

## 🏗️ System Architecture
The application follows a **Decoupled-Atomic** architecture:
1.  **Frontend**: Next.js Server Components handle initial data fetching for SEO and speed.
2.  **Interaction Layer**: Client Components manage the complex quiz state using React Query for synchronization.
3.  **Persistence Layer**: Supabase handles Auth and Database. 
4.  **Logic Layer (RPC)**: Critical calculations (scoring, streaks, stat updates) are pushed to the database level via PL/pgSQL functions for atomicity and speed.

---

## 📊 Database Schema
The schema is optimized for high-volume questions and concurrent test attempts.

### Core Tables
- **`profiles`**: User metadata, `total_score`, `tests_attempted`, and `streak_count`.
- **`questions`**: 90k+ records. Includes `topic`, `difficulty`, and a `random_id` (float) for O(1) random selection.
- **`tests`**: Definitions for both fixed and dynamic test types.
- **`test_questions`**: Junction table for fixed-topic tests.
- **`attempts`**: Records of started and completed test sessions.
- **`attempt_answers`**: Logs of user choices vs correct answers.

### Security (RLS)
Every table has **Row Level Security** enabled. Users can only read their own attempts and profiles, while questions and test definitions are globally readable for authenticated users.

---

## 🧠 Test & Quiz Logic

### 1. Question Retrieval
- **Topic-Wise**: Fetches from the `test_questions` junction table to ensure a fixed, pre-defined experience.
- **Mock Tests**: Uses the `get_random_questions_v2` RPC. It leverages the `random_id` index to pick a balanced distribution of questions across all topics in milliseconds, avoiding expensive `ORDER BY random()`.

### 2. The Quiz Engine
- **State Safety**: Answers and current index are synced to `localStorage`.
- **Interruption Control**: Uses `popstate` and `beforeunload` listeners to trap navigation, ensuring users don't lose progress by accidentally hitting "Back".

---

## ⚡ Submission & Streak System

### Atomic Submission (RPC)
When a user hits "Submit", a single call is made to the `submit_test_attempt` function:
1.  **Validation**: Ensures the test hasn't been submitted already.
2.  **Scoring**: Validates accuracy and time taken.
3.  **Profile Update**: Atomically increments `total_score` and `tests_attempted`.
4.  **Streak Calculation**:
    - **Indian Standard Time (IST)**: All date logic is handled in `Asia/Kolkata` time.
    - **Logic**:
      - *Same Day*: Streak persists.
      - *Consecutive Day*: Streak increments (+1).
      - *Gap (>1 day)*: Streak resets to 1.

---

## 🏎️ Performance Optimization
- **Dataset Handling**: Questions are indexed by `topic` and `random_id`.
- **Batch Ingestion**: Bulk import scripts in `/supabase` use JSON streaming to handle 90k+ rows without memory overflows.
- **Optimistic UI**: React Query `setQueryData` is used to update dashboard stats instantly upon test completion, before the background refetch finishes.

---

## 🎨 UI/UX Design System
The "RRB Premium" theme is characterized by:
- **Palette**: Deep Slates (`#0f172a`), Indigo Accents (`#4f46e5`), and Emerald Success states.
- **Glassmorphism**: Backdrop blurs (`blur-xl`) on navbars and modals for depth.
- **Typography**: Inter Variable for maximum legibility.
- **Feedback**: Active states, hover-scales, and smooth `cubic-bezier` transitions for all interactive elements.

---

## 📂 Project Structure
```bash
src/
├── app/                  # Pages & Route Handlers
│   ├── (auth)/           # Authentication routes
│   ├── dashboard/        # User analytics hub
│   ├── test/[id]/        # Immersive quiz engine
│   └── proxy.ts          # Next 16 Middleware/Proxy
├── components/           # UI Atomic Design (Navbar, Spinner, etc.)
├── lib/                  # Services & Shared Logic
│   ├── api.ts            # Centralized API logic
│   └── supabase/         # Client & Server initializers
└── providers/            # Auth & Query Context providers
```

---

## 🛠️ Getting Started

### 1. Prerequisites
- Node.js 20+
- Supabase Account

### 2. Environment Variables
Create a `.env.local` file:
```env
NEXT_PUBLIC_SUPABASE_URL=your_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Installation
```bash
npm install
npm run dev
```

---

## 🚢 Deployment Guide
1.  **Database**: Run the `schema.sql` and `fix_stats_rpc.sql` in your Supabase SQL Editor.
2.  **Environment**: Add your Supabase keys to Vercel/Deployment provider.
3.  **Build**: Run `npm run build` to ensure all TypeScript and Lint checks pass.

---

## 🆘 Common Issues & Fixes
- **Failed to Fetch (Login)**: Ensure environment variables are not wrapped in quotes and have the correct `NEXT_PUBLIC_` prefix.
- **EPERM (Build)**: Stop the development server before running `npm run build` on Windows systems.
- **Middleware Deprecation**: The project has been migrated from `middleware.ts` to `proxy.ts` (Next 16 convention).

---
*Generated by Antigravity Technical Solutions.*
