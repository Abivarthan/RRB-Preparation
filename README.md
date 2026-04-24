# Complete Guide

Welcome to the **RRB Exam Preparation Platform** technical guide. This document is designed for developers and product engineers to understand the system architecture, core logic, and design principles of the application.

---

## 🏗️ 1. Project Overview
A high-performance exam simulation platform built for railway aspirants. It handles a massive database of **90,000+ questions** with sub-second retrieval times and provides a secure, distraction-free environment for mock exams.

### Key Features
- **Intelligent Test Generation**: Mixed mock tests and focused topic drills.
- **Proctor-Ready Engine**: Fullscreen enforcement and navigation trapping.
- **Atomic Stats**: Real-time updates to user profiles using database-level transactions.
- **Persistence**: Auto-save progress to survive browser crashes or accidental refreshes.

---

## 🛠️ 2. Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (via Supabase)
- **State Management**: TanStack Query v5 (React Query)
- **Styling**: Tailwind CSS 4.0
- **Auth**: Supabase Auth (with SSR support)

---

## 🧠 3. Test Generation Logic

The system distinguishes between **fixed** and **dynamic** tests to ensure a variety of learning paths.

### A. Topic-Wise Tests (Focused Practice)
- **Logic**: When a user selects a topic, the system checks for existing tests or generates a new one.
- **Persistence**: Once generated, the relationship between the test and its questions is stored in `test_questions`. This ensures the same test ID always returns the same questions.

### B. Mock Exams (Balanced Distribution)
- **Algorithm**: Instead of purely random selection, the system:
  1. Fetches all available topics via `get_topic_stats`.
  2. Calculates `questions_per_topic` based on the target total.
  3. Iterates through topics to pick a balanced set, ensuring the exam covers the entire syllabus.
  4. Shuffles the final set to mimic real exam conditions.

### C. Efficient Random Retrieval (`random_id`)
To avoid the performance trap of `ORDER BY random()`, we use a custom `random_id` float column.
- **How it works**: Questions are fetched where `random_id >= random()`. If not enough questions are found, it wraps around to `random_id < random()`.
- **Result**: Question selection remains O(1) even with 100,000+ records.

---

## 🔄 4. The Submission Lifecycle

The most critical flow in the application is the transition from "Answering" to "Completed".

### Step-by-Step Data Flow
1.  **Start**: User enters `/test/[id]`. A record is inserted into `attempts` (if not already existing).
2.  **In-Progress**: Every time a user selects an option, `saveAnswer` is called. This records the choice in `attempt_answers` instantly.
3.  **Submission**: User clicks "Confirm Submit".
4.  **Atomic RPC Call**: The frontend calls the `submit_test_attempt` PostgreSQL function.
    - **Step A**: Checks if the attempt is already submitted (prevents duplicates).
    - **Step B**: Marks `is_submitted = true` and records `completed_at`.
    - **Step C**: Updates `profiles` (increments `total_score` and `tests_attempted`).
    - **Step D**: Calculates and updates `streak_count` based on IST date logic.
5.  **Finalization**: The frontend invalidates the `profile` cache and redirects to `/result/[id]`.

---

## 🔥 5. Streak & Stats Logic

The streak system is designed to encourage daily consistency without punishing users for multiple tests in one day.

- **IST Synchronization**: All time calculations use `Asia/Kolkata` timezone to match the RRB exam schedule.
- **Increment Rules**:
  - **Same Day**: If `last_active_date` is today, stats update but streak stays same.
  - **Next Day**: If `last_active_date` is yesterday, streak increments (+1).
  - **Gap**: If `last_active_date` is older than 24 hours, streak resets to 1.

---

## 🛡️ 6. Security & Stability

### Middleware & Proxy
The project utilizes `src/proxy.ts` (the Next 16 middleware convention) to:
- Intercept requests to protected routes (`/dashboard`, `/test`).
- Validate the user session via Supabase SSR.
- Redirect unauthorized users to `/login`.

### Row Level Security (RLS)
Database policies ensure that users can only view their own `attempts` and `profiles`. Public data like `questions` is restricted to authenticated roles only.

---

## 👨‍💻 7. Developer's Guide

### Adding New Questions
Questions can be added via the Supabase Dashboard or by running the bulk-import script:
```bash
npx ts-node supabase/bulk-import.ts
```

### Modifying Scoring Logic
To change how scores are calculated (e.g., adding negative marking), modify the `submit_test_attempt` function in `supabase/fix_stats_rpc.sql` and the calculation in `src/app/test/[id]/QuizEngine.tsx`.

### Creating New Tests
Topic tests are generated dynamically in `src/lib/api.ts` using the `generateTopicTest` function. You can adjust the `questionCount` parameter there.

---

## 🆘 8. Troubleshooting (Common Issues)

| Issue | Cause | Fix |
| :--- | :--- | :--- |
| **Submission Failed** | RPC not found or Attempt ID mismatch | Ensure `fix_stats_rpc.sql` is run in Supabase SQL editor. |
| **Failed to Fetch** | Incorrect Supabase URL/Key | Check `.env.local` for missing `NEXT_PUBLIC_` prefix. |
| **EPERM: Permission Denied** | File lock on Windows | Close the dev server (`Ctrl+C`) before running `npm run build`. |
| **Hydration Mismatch** | Server/Client date difference | Ensure all date components use `useEffect` to render on client only. |

---

## 🚀 9. Setup & Deployment

### 1. Local Setup
```bash
npm install
npm run dev
```

### 2. Environment Configuration
Ensure `.env.local` contains:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Production Deployment
- Connect your repo to **Vercel**.
- Add the Environment Variables in the Vercel Dashboard.
- Ensure your Supabase Database has all migrations from the `/supabase` folder applied.

---
*Maintained by the RRB Product Engineering Team.*
