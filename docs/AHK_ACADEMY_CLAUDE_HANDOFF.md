# AHK ACADEMY — COMPLETE CLAUDE HANDOFF DOCUMENT
### For: Claude Code on the other laptop
### Owner: Ahsan Hussain Khan (ahk7991@gmail.com)
### Prepared: 2026-05-18

---

> READ THIS FIRST before touching any code. This is the complete picture of everything
> built so far, how it fits together, and what the vision is.

---

## 1. THE BIG PICTURE

AHK Academy is Ahsan's English tutoring business. He teaches English and maths to
Turkish students (currently ~25 students). The goal is to scale from 25 students to
eventually 1 million — starting in Turkey, then Pakistan, Saudi Arabia, Egypt, etc.

**Platform:** ahkacademy.com
**Primary market:** Turkey (IELTS / TOEFL preparation)
**Price target:** ₺500/month per student (~£15)
**Revenue at 10,000 students:** ₺5,000,000/month (~£140,000)

### Ahsan's Current Teaching Workflow
- Platform: Microsoft Teams (video call + recording)
- 40-minute lessons, 2 per day, 4 days/week
- After each lesson: takes Teams transcript → Claude generates personalized homework as LaTeX → compiles on Overleaf → sends PDF to student
- Payment: 100-lesson packages with installments

---

## 2. ROOT FOLDER STRUCTURE

Everything lives at: `C:\Users\ahk79\AHK_Academy\`

```
AHK_Academy\
├── CODE\
│   ├── ahk-academy\          ← MAIN APP (Next.js full platform)
│   │   ├── marketplace\      ← Cambly-like tutor marketplace sub-app
│   │   ├── prisma\           ← Database schema + seed files
│   │   ├── scripts\          ← Python utility scripts
│   │   └── src\              ← Next.js app (app router)
│   ├── attendance_fees\      ← OLD Python Flask app (now mostly superseded)
│   ├── lesson_ai_system\     ← FastAPI AI lesson generator
│   ├── math-mastery\         ← React/TypeScript math learning frontend
│   └── english_teaching\     ← (empty placeholder)
├── STUDENTS\                 ← 17 student folders (homework, attendance, reports)
├── IELTS_MATERIALS\          ← Cambridge IELTS 3–19, Barrons, templates
├── TEACHING_MATERIALS\       ← Lesson PDFs, grammar guides, templates
├── BUSINESS\                 ← Master plan, contracts, student database, enrollment
└── BRANDING\                 ← Logos, social media (AHK_ACADEMY_PK + AHK_ACADEMY_SP)
```

---

## 3. MAIN APP — ahk-academy (THE ONE THAT MATTERS)

**Path:** `C:\Users\ahk79\AHK_Academy\CODE\ahk-academy\`
**Stack:** Next.js (App Router) + PostgreSQL (Prisma ORM) + NextAuth.js
**Local port:** 3000 (`npm run dev`)

### Tech Stack
| Layer | Tech |
|-------|------|
| Frontend + Backend | Next.js (App Router, TypeScript) |
| Database | PostgreSQL via Prisma |
| Auth | NextAuth.js (credentials + session cookies) |
| AI | Gemini Flash → Claude Haiku (cascade fallback) |
| Email | Gmail (ahk7991@gmail.com) |
| Chat | Groq API (primary AI chat) |
| WhatsApp | 360dialog / Meta webhook |
| Payments | Stripe + Papara + IBAN (manual) |
| Recording transcripts | Fireflies.ai webhook |

### Dev Seed Credentials
- **Admin:** `ahsan@ahkacademy.com` / `admin123`
- **Teacher:** `brishna@ahkacademy.com` / `teacher123`
- **Student:** `student@ahkacademy.com` / `student123`

### Local .env
```
DATABASE_URL="REDACTED"
NEXTAUTH_SECRET="REDACTED"
NEXTAUTH_URL="http://localhost:3000"
GROQ_API_KEY="REDACTED"
GMAIL_USER="REDACTED"
```

### User Roles
- `ADMIN` — Ahsan. Full access to everything.
- `TEACHER` — Teachers (e.g. Brishna). Manages own students/classes.
- `STUDENT` — Students. See own profile/lessons/payments only.

---

## 4. DATABASE SCHEMA SUMMARY (Prisma)

Full schema at: `CODE\ahk-academy\prisma\schema.prisma`

### Core Models
| Model | Purpose |
|-------|---------|
| `User` | All users (admin/teacher/student). Central model. |
| `Department` | Department with head teacher |
| `Course` | A course (e.g. "IELTS Preparation") |
| `Class` | A class within a course (has one teacher, many students) |
| `Enrollment` | Links student → class |
| `Lesson` | Individual lesson within a class |
| `Attendance` | Per-student per-lesson attendance record |
| `Payment` | Legacy payment record |
| `Assignment` | Homework assigned to a class |
| `Submission` | Student's submitted homework + grade |
| `Notification` | In-app notifications |

### Speaking Session System
| Model | Purpose |
|-------|---------|
| `SpeakingSession` | Group speaking session (max 5 students) |
| `SessionParticipant` | Which students joined a session |
| `SessionTranscript` | Full transcript text for the session |
| `SessionAnalysis` | Per-student AI analysis of their speaking |
| `Topic` | Discussion topics for speaking sessions |
| `StudentSpeakingProfile` | Student's track/level/preferences |
| `ChemistryScore` | Compatibility score between pairs of students |
| `TeacherInsight` | AI-generated insights for teacher about a student |

### Grammar System
| Model | Purpose |
|-------|---------|
| `GrammarCategory` | Top-level category (e.g. "Tenses") |
| `GrammarTopic` | Specific topic (e.g. "Present Perfect") |
| `GrammarLesson` | Lesson content + examples + tips |
| `GrammarExercise` | Individual exercise (MCQ, fill-in, etc.) |
| `StudentGrammarProgress` | Per-student per-topic progress tracking |
| `ExerciseAttempt` | Each attempt at an exercise |
| `GrammarAssignment` | Teacher assigns a grammar topic to a student |
| `GrammarLessonLog` | Log of grammar lessons taught by teacher |

### V2 Features
| Model | Purpose |
|-------|---------|
| `StudentProfile` | Extended student profile (track, level, teacher assigned) |
| `TeacherProfile2` | Extended teacher profile |
| `PaymentPlan` | Payment plan (monthly/annual, amount, currency) |
| `PaymentTransaction` | Individual payment transaction (IBAN/Papara/Stripe) |
| `BlogPost` | Blog posts (EN/TR, draft/published) |
| `WhatsappConversation` | WhatsApp conversation (leads + students) |
| `WhatsappMessage` | Individual WhatsApp messages |
| `Homework` | Personalized homework with token for secure link |
| `TeacherResource` | AI-generated weekly teaching resources |
| `PrivateLesson` | One-on-one private lesson tracking |
| `StudentDocument` | Documents stored per student (PDF/text) |

### Marketplace Models (Cambly-like)
| Model | Purpose |
|-------|---------|
| `TutorProfile` | Tutor's public profile + rates + approval status |
| `StudentMarketProfile` | Student's marketplace profile + credits |
| `TutorAvailability` | Tutor's available time slots |
| `MktBooking` | Booking between student and tutor |
| `Review` | Student review of a tutor |
| `Transaction` | Credit purchase or tutor payout |
| `MarketMessage` | Messages between student and tutor |
| `LessonNote` | Notes from a marketplace lesson |

---

## 5. APP PAGES (Next.js App Router)

### Public / Auth
- `/` — Homepage / landing page
- `/(auth)/login` — Login page
- `/(public)/blog` — Public blog listing
- `/(public)/blog/[slug]` — Individual blog post
- `/onboarding/student` — Student onboarding flow
- `/onboarding/teacher` — Teacher onboarding flow

### Admin Pages (`/admin/...`)
- `/admin` — Admin dashboard
- `/admin/analytics` — Analytics dashboard
- `/admin/blog` — Blog management
- `/admin/classes` — Class management
- `/admin/grammar` — Grammar system management
- `/admin/groups` — Student group management
- `/admin/payments` — Payment tracking
- `/admin/speaking` — Speaking session management
- `/admin/speaking/create` — Create new speaking session
- `/admin/speaking/[id]` — Individual session detail
- `/admin/students` — All students list
- `/admin/students/[id]` — Individual student profile
- `/admin/teachers` — Teachers management
- `/admin/topics` — Discussion topics management
- `/admin/whatsapp` — WhatsApp conversations
- `/admin/whatsapp/[id]` — Individual conversation

### Teacher Pages (`/teacher/...`)
- `/teacher` — Teacher dashboard
- `/teacher/analytics` — Teacher analytics
- `/teacher/assignments` — Assignments management
- `/teacher/attendance` — Take attendance
- `/teacher/classes` — Teacher's classes
- `/teacher/grammar` — Grammar assignments
- `/teacher/insights` — AI insights about students
- `/teacher/lessons` — Lessons management
- `/teacher/payments` — Payment overview
- `/teacher/speaking` — Speaking sessions
- `/teacher/speaking/create` — Create speaking session
- `/teacher/speaking/[id]` — Session detail + actions
- `/teacher/students` — Teacher's students
- `/teacher/topics` — Topics management

### Student Pages (`/student/...`)
- `/student` — Student dashboard
- `/student/attendance` — View attendance record
- `/student/classes` — Enrolled classes
- `/student/grammar` — Grammar learning
- `/student/grammar/[categorySlug]` — Grammar category
- `/student/grammar/[categorySlug]/[topicSlug]` — Grammar topic (lesson + practice + quiz tabs)
- `/student/homework` — Homework assignments
- `/student/lessons` — All lessons
- `/student/payments` — Payment history
- `/student/progress` — Learning progress
- `/student/speaking` — Speaking sessions
- `/student/speaking/[id]` — Individual session

### Chat Pages
- `/chat` — AI chat hub
- `/chat/english-tutor` — English tutor chatbot
- `/chat/homework` — Homework help chatbot
- `/chat/sales` — Sales/enrollment chatbot

---

## 6. ALL API ENDPOINTS

Base URL: `http://localhost:3000/api`
Auth: NextAuth.js session cookies. Roles: ADMIN, TEACHER, STUDENT.

### Auth
- `GET|POST /api/auth/[...nextauth]` — NextAuth handler

### Students
- `GET /api/students` — List all students
- `POST /api/students` — Create student
- `DELETE /api/students?id=xxx` — Delete student
- `GET /api/students/[id]` — Full student profile (enrollments, payments, attendance, submissions)
- `GET /api/student/classes` — Student's own enrolled classes (STUDENT auth)
- `GET /api/student/lessons` — Student's lessons with attendance status
- `GET /api/student/payments` — Student's payment history

### Teachers
- `GET /api/teachers` — List all teachers
- `POST /api/teachers` — Create teacher
- `GET /api/teacher/classes` — Teacher's own classes (TEACHER auth)
- `GET /api/teacher/students?classId=xxx` — Students in a class
- `GET /api/teacher/insights` — AI insights for teacher
- `POST /api/teacher/insights/mark-read` — Mark all insights read

### Classes & Courses
- `GET/POST /api/classes` — List/create classes
- `GET/POST /api/courses` — List/create courses
- `POST /api/enrollments` — Enroll student in class
- `DELETE /api/enrollments?studentId=xxx&classId=xxx` — Remove student

### Lessons & Assignments
- `GET/POST /api/lessons?classId=xxx` — List/create lessons
- `GET/POST /api/assignments` — List/create assignments (filter by classId or studentId)
- `GET/POST/PATCH /api/submissions` — List/submit/grade submissions
- `GET/POST /api/attendance` — Get/mark attendance

### Grammar System
- `GET /api/grammar/categories` — List categories with progress
- `GET /api/grammar/topics?categorySlug=xxx` — Topics with progress
- `GET /api/grammar/topics/[id]` — Full topic (lesson + exercises + progress)
- `POST /api/grammar/exercises/check` — Check exercise answer
- `GET/POST /api/grammar/quiz/[topicId]` — Get quiz / submit quiz answers
- `GET/POST /api/grammar/assignments` — List/create grammar assignments
- `GET/PUT /api/grammar/progress` — Get progress stats / mark lesson read
- `GET/POST /api/grammar-lessons` — Grammar lesson logs

### Speaking Sessions
- `GET/POST /api/speaking-sessions` — List/create sessions
- `GET/PUT/DELETE /api/speaking-sessions/[id]` — Get/update/delete session
- `POST/DELETE /api/speaking-sessions/[id]/participants` — Add/remove students
- `PUT /api/speaking-sessions/[id]/attendance` — Mark attendance
- `POST /api/speaking-sessions/[id]/rate` — Student rates session (1-5)
- `GET/POST /api/speaking-sessions/[id]/transcript` — Get/upload transcript
- `POST /api/speaking-sessions/[id]/analyze` — Trigger AI analysis
- `GET/PUT /api/student-speaking-profile` — Get/update speaking profile

### Topics
- `GET/POST /api/topics` — List/create discussion topics
- `PUT/DELETE /api/topics/[id]` — Update/delete topic
- `GET/POST /api/teacher/topics` — Teacher's topics

### Teacher Speaking Workflow
- `POST /api/teacher/speaking` — Create session
- `POST /api/teacher/speaking/[id]/transcript` — Upload transcript
- `POST /api/teacher/speaking/[id]/analyze` — Run AI analysis
- `POST /api/teacher/speaking/[id]/homework` — Generate homework for student
- `POST /api/teacher/speaking/[id]/attendance` — Save attendance
- `POST /api/teacher/speaking/[id]/assign-topic` — Update topic

### AI Analysis & Homework
- `POST /api/ai/generate-homework` — Generate homework from transcript
- `POST /api/analysis/generate` — Full AI analysis of session (all attended students)
- `POST /api/homework/generate` — Personalized homework from student's analysis
- `GET /api/progress/[studentId]` — Comprehensive progress report
- `GET /api/teacher-insights` — Teacher insights (role-filtered)
- `POST /api/teacher-resources/generate` — Weekly AI teaching resources
- `GET/POST /api/teacher-insights` — Insights + mark read

### AI Chat
- `POST /api/chat` — AI chatbot (cascade: Ollama → Groq → Anthropic)

### Payments
- `GET/POST/PATCH /api/payments` — Legacy payment records
- `GET/POST /api/payments/plans` — Payment plans
- `GET/POST /api/payments/transactions` — Payment transactions
- `POST /api/payments/confirm` — Confirm IBAN payment + send receipt email

### WhatsApp
- `GET/POST /api/webhooks/whatsapp` — Meta webhook (receive + verify)
- `POST /api/whatsapp/send` — Send WhatsApp message/template
- `GET /api/whatsapp/conversations` — List all conversations (ADMIN)
- `GET /api/whatsapp/conversations/[id]` — Full conversation thread

### Blog
- `GET/POST /api/blog` — List/create blog posts
- `POST /api/blog/generate` — AI-generate SEO blog post

### Other
- `GET/POST/PUT /api/notifications` — Get/create/mark-read notifications
- `POST /api/onboarding` — Save onboarding data (student or teacher type)
- `POST /api/cron/reminders` — Automated reminders (sessions, payments, homework)
- `POST /api/sessions/suggest-students` — AI group suggestions
- `POST /api/sessions/notify` — Send session reminders (48h or 2h)
- `POST /api/sessions/auto-schedule` — Find overlapping student availability

### Webhooks
- `POST /api/webhooks/stripe` — Stripe payment confirmation
- `POST /api/webhooks/papara` — Papara payment (matches by AHK-XXXX reference code)
- `POST /api/webhooks/fireflies` — Fireflies.ai transcript delivery

---

## 7. MARKETPLACE SUB-APP

**Path:** `CODE\ahk-academy\marketplace\`
**Purpose:** Cambly-like tutor marketplace (separate Next.js app)
**Stack:** Next.js + Prisma (shares same DB schema) + NextAuth

### Pages
- `/` — Homepage
- `/tutors` — Browse tutors
- `/tutors/[id]` — Tutor profile
- `/book/[tutorId]` — Book a tutor
- `/bookings` — Student's bookings
- `/dashboard` — Dashboard
- `/login` / `/register` — Auth
- `/messages` — Messaging
- `/pricing` — Pricing page
- `/wallet` — Student wallet + credits
- `/wallet` (credit-packages) — Buy credits
- `/tutor/apply` — Apply to become a tutor
- `/tutor/(portal)/dashboard` — Tutor dashboard
- `/tutor/(portal)/availability` — Set availability
- `/tutor/(portal)/bookings` — Manage bookings
- `/tutor/(portal)/earnings` — View earnings
- `/tutor/(portal)/profile/edit` — Edit profile
- `/homework/[token]` — Public homework page (token-based, no login needed)

### API Routes (marketplace)
- `/api/bookings` — Create/list bookings
- `/api/messages` — Messaging
- `/api/register` — Register user
- `/api/reviews` — Reviews
- `/api/tutor/profile` — Tutor profile management
- `/api/tutors` — List tutors
- `/api/tutors/[id]` — Get tutor
- `/api/tutors/[id]/availability` — Availability slots
- `/api/wallet` — Wallet balance + transactions
- `/homework/[token]` — Token-based homework access

---

## 8. PYTHON UTILITY SCRIPTS

**Path:** `CODE\ahk-academy\scripts\`

| Script | Purpose |
|--------|---------|
| `check_homework.py` | Check homework status |
| `check_lesson_times.py` | Verify lesson scheduling |
| `fix_gurkan.py` | One-off fix for Gurkan's data |
| `generate_brishna_portal.py` | Generate Brishna's portal HTML |
| `generate_timetable.py` | Generate timetable HTML (e.g. gurkan_timetable.html) |
| `gurkan_report.py` | Gurkan's progress report |
| `import_document.py` | Import a document into DB |
| `import_gurkan.py` | Import Gurkan's lesson data |
| `import_transcripts.py` | Import lesson transcripts |
| `post_lesson_auto.py` | Auto-post lesson data after session |
| `setup_brishna.py` | Set up Brishna as teacher |
| `transcribe_and_summarize.py` | Transcribe audio + AI summary |
| `update_gurkan_times.py` | Update Gurkan's lesson times |
| `update_phase2_times.py` | Bulk update Phase 2 lesson times |

**Generated HTML files (in root of ahk-academy):**
- `brishna_portal.html` — Brishna's standalone portal
- `gurkan_timetable.html` — Gurkan's timetable

---

## 9. OTHER CODE APPS (Legacy / Supplementary)

### `CODE\attendance_fees\` — OLD Python Flask App
- **Stack:** Python Flask + SQLite (`attendance.db`)
- **Port:** 5000 (`python app.py` or `run.bat`)
- **Status:** Mostly superseded by the main Next.js app
- **What it does:** Original student management system — attendance, fees, packages
- **Templates:** dashboard, students, student_detail, lesson_form, packages, payment_form, student_portal

### `CODE\lesson_ai_system\` — AI Lesson Generator
- **Stack:** Python FastAPI + Claude API (`claude-opus-4-7`)
- **Port:** 8000
- **Files:** `main.py`, `ai_service.py`, `file_service.py`, `pptx_service.py`
- **What it does:** Generate lesson plans and PowerPoint slides using AI

### `CODE\math-mastery\` — Math Learning Frontend
- **Stack:** React + TypeScript + Vite
- **Port:** 5173 (`npm run dev`)
- **Student:** Built for Maral (maths student)
- **Pages:** Dashboard, ChapterPage, TopicPage, ExamListPage, ExamTakePage, ExamReviewPage
- **Data:** `src/data/curriculum.ts`, `src/data/examPapers.ts`

---

## 10. STUDENTS (17 Active)

Each has a folder under `STUDENTS\`:
- Ahmet, Alev, Ayse, Bilal, Cengiz, Eva, Fatmagul, Gorkem, Gurkan, Hale, Ihsan, Ilhan, Kamer, Maral (maths), Omer, Taner, Zeynep

**Note:** Bilal is also associated with MULTIMULK work — keep separate.
**Gurkan** has special timetable/import scripts (see Python scripts above).
**Brishna** is a teacher (not a student) — has her own portal HTML generated.

---

## 11. BUSINESS DOCUMENTS

**Path:** `BUSINESS\`

| File | Contents |
|------|----------|
| `AHK_Academy_Master_Plan.md` | Full 6-month build plan, tech stack, growth strategy, financial projections |
| `AHK_Academy_Master_Plan.docx` | Same in Word format |
| `AHK_Academy_Master_Plan 1.docx` | Earlier version |
| `AHK_Academy_Attendance.html` | Attendance tracker HTML |
| `AHK_Academy_LIVE.html` | Live site page |
| `Online students.xlsx` | Student database spreadsheet |
| `Contracts\Enrollment_Contract.tex` | LaTeX enrollment contract |

### Master Plan Summary
- **Vision:** 10,000 paying students in Turkey within 6 months, then Pakistan/Saudi Arabia
- **Price:** ₺500/month per student
- **Revenue at 10,000 students:** ~£140,000/month
- **6-Month Build Timeline:**
  - Month 1: Site live, login system, homepage, 50 beta students
  - Month 2: IELTS + TOEFL sections, grammar library, blog
  - Month 3: Practice tests, vocabulary games, progress tracking, Turkish language support
  - Month 4: Subscription system, Stripe + iyzico payments, invoices
  - Month 5: SEO, email marketing, referral program, reviews
  - Month 6: Mobile optimization, AI essay feedback, live classes, analytics
- **Growth channels:** Google SEO (Turkish keywords), YouTube, Instagram/TikTok, Turkish forums, paid ads (Month 3+), affiliate tutors
- **Expansion:** Pakistan (Month 7–12), Saudi Arabia (Month 13–18)

---

## 12. IELTS MATERIALS

**Path:** `IELTS_MATERIALS\`
- Cambridge IELTS books 3 through 19
- Barrons IELTS
- Templates and feedback sheets

---

## 13. BRANDING

**Path:** `BRANDING\`

| Folder | Contents |
|--------|----------|
| `AHK_ACADEMY_PK\` | Pakistan brand content (90-day plans, logos, ideas) |
| `AHK_ACADEMY_SP\` | Spain/international brand content |
| `Logos\` | Logo files |
| `Social_Media\` | Social media images and content |

---

## 14. AI CASCADE (How AI Features Work)

AI endpoints use this cascade (cheapest/fastest first):
1. Gemini Flash (free tier)
2. Gemini Flash (paid)
3. Claude Haiku (fallback)

Chat endpoint cascade:
1. Ollama (local, if running)
2. Groq (fast, GROQ_API_KEY in .env)
3. Anthropic (fallback)

The `model` field in AI responses tells you which was used.

---

## 15. KEY TECHNICAL PATTERNS

### Auth Pattern
All protected endpoints use NextAuth.js session cookies. Browser sends cookie automatically after login. Server reads `getServerSession()` to get current user + role.

### Error Format (all API endpoints)
```json
{ "error": "Human-readable error message" }
```
Status codes: 400 (bad request), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error).

### API Response Patterns
- Lists → return JSON arrays directly
- Created resources → return object with status 201
- Deletions → `{ success: true }`
- Role-based filtering → happens server-side from session

### Payment Reference Codes
Papara payments are matched by AHK reference code (format: `AHK-XXXX`) in the payment description. Auto-generated on transaction creation.

### Homework Token Links
Homework has a unique `token` field. Public URL: `/homework/[token]` — no login needed. Used to send students a direct link to their homework.

### Speaking Session Flow
1. Teacher creates session → adds students → sets date/topic
2. Session happens (Teams/Zoom)
3. Teacher uploads transcript
4. Teacher clicks "Analyze" → AI creates per-student SessionAnalysis + TeacherInsights
5. Teacher generates Homework from analysis
6. Homework delivered via WhatsApp link or email

### WhatsApp Integration
- Incoming messages → `/api/webhooks/whatsapp`
- For unknown numbers (leads) → AI chatbot responds automatically
- For known users → messages logged to WhatsappConversation
- Outgoing → `/api/whatsapp/send` (requires 360dialog/Meta credentials in env)

---

## 16. WHAT'S BUILT vs WHAT'S NOT YET BUILT

### Built (in the Next.js app)
- Full auth system (admin/teacher/student roles)
- Student management + enrollment
- Class/course/lesson management
- Attendance tracking
- Speaking session system + AI analysis
- Grammar learning system (lessons + exercises + quizzes + progress)
- Homework generation + token-based delivery
- Payment tracking (legacy + V2 with plans + transactions)
- Papara + Stripe + IBAN webhooks
- WhatsApp conversations + messaging
- Blog system (manual + AI-generated)
- Teacher insights (AI-generated)
- Teacher resources (AI-generated weekly)
- Cron reminder system (session, payment, homework reminders)
- Student speaking profiles
- AI group suggestion for sessions
- AI chat (English tutor, homework help, sales)
- Fireflies.ai webhook integration
- Marketplace sub-app (tutor booking, wallet, reviews)
- Private lesson tracking (PrivateLesson model)
- Student documents storage

### NOT YET BUILT (from Master Plan)
- Public-facing marketing homepage (currently just admin/teacher/student portals)
- IELTS / TOEFL content sections
- Practice test system (graded, timed)
- Vocabulary flashcard game
- Subscription system (free vs premium tiers)
- Full iyzico integration (Turkey payments)
- Automatic PDF invoices
- Email marketing sequences
- Referral program
- Turkish language (i18n) support
- Mobile optimization pass
- AI essay grading tool (/ielts/writing/check)
- Live class system (calendar, registration, recordings)
- Full analytics dashboard
- SEO optimization (sitemap, meta tags, etc.)
- YouTube channel integration
- Google/Facebook Ads tracking

---

## 17. PRISMA SEED FILES

**Path:** `CODE\ahk-academy\prisma\`

| File | Purpose |
|------|---------|
| `seed.ts` | Main seed (users, classes, lessons, basic data) |
| `seed-v2.ts` | V2 seed (student profiles, payment plans, speaking data) |
| `seed-grammar.ts` | Grammar categories, topics, lessons, exercises |

Run seed: `npx prisma db seed`
Run migrations: `npx prisma migrate dev`
View DB: `npx prisma studio`

---

## 18. IMPORTANT NOTES FOR CLAUDE ON THE OTHER LAPTOP

1. **This is the source of truth.** The actual code files are the real reference. This document summarizes them — always check the actual file if something seems off.

2. **The main app is `ahk-academy`** (Next.js). The Flask `attendance_fees` app is legacy — don't build new features there.

3. **Do not mix up with MULTIMULK.** AHK Academy is Ahsan's tutoring business. MULTIMULK is a separate real estate lead automation system that lives on the OTHER laptop. No connection between the two.

4. **Bilal exception:** Bilal appears in both STUDENTS\ folder (as an English student) AND in MULTIMULK (as a real estate contact). These are completely separate contexts.

5. **Brishna is a teacher**, not a student. She teaches some students. Her portal HTML is at `CODE\ahk-academy\brishna_portal.html`.

6. **Gurkan has lots of special scripts.** Several Python scripts in `scripts\` were written specifically for Gurkan's lessons (import_gurkan.py, gurkan_report.py, fix_gurkan.py, etc.).

7. **The marketplace** (`CODE\ahk-academy\marketplace\`) is a separate Next.js sub-app — it has its own package.json and runs independently. It shares the same Prisma DB schema.

8. **AI model to use:** For any new Claude API calls in this project, use `claude-haiku-4-5-20251001` (cheapest) or `claude-sonnet-4-6` (better quality). The existing code references `claude-opus-4-7` in lesson_ai_system — that's fine for that app.

9. **Local database:** PostgreSQL on localhost:5432, database name `ahk_academy`, password `Wolverine1997@@`

10. **File-based IELTS materials** are in `IELTS_MATERIALS\` — Cambridge IELTS 3–19, Barrons. These are the source materials for creating practice tests and content.

---

*Generated 2026-05-18 from complete scan of C:\Users\ahk79\AHK_Academy\ on the MULTIMULK laptop*
*All details verified against actual files on disk*
