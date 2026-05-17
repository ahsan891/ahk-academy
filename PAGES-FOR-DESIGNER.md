# AHK Academy — Pages & Screens for Frontend Design

> Total: 52 pages across 5 portals. Each page lists what data it shows and which API it calls.

---

## Portal Overview

| Portal | URL Prefix | Role | Pages |
|--------|-----------|------|-------|
| Public | `/` | None | 5 |
| Admin | `/admin` | ADMIN | 14 |
| Teacher | `/teacher` | TEACHER | 13 |
| Student | `/student` | STUDENT | 12 |
| Onboarding | `/onboarding` | Any logged-in | 2 |

---

## 1. Public Pages (No Login Required)

### Landing Page — `/`
- Hero section, features, pricing, CTA buttons
- No API calls needed (static)

### Login — `/login`
- Email + password form
- API: `POST /api/auth/[...nextauth]` (credentials provider)

### Blog Listing — `/blog`
- Grid of published posts with title, excerpt, date, language badge
- API: `GET /api/blog` (public)

### Blog Post — `/blog/[slug]`
- Full article with rendered markdown, author, reading time, keywords
- API: `GET /api/blog?slug=xxx` or server-side Prisma query

### AI Chatbots — `/chat`, `/chat/english-tutor`, `/chat/homework`, `/chat/sales`
- Chat UI with message bubbles, input field
- API: `POST /api/chat` with `{ message, chatType }`

---

## 2. Admin Portal (`/admin`)

### Dashboard — `/admin`
- Stats cards: Total Students, Active Teachers, Revenue, Sessions This Week
- Recent activity feed
- Quick actions

### Students — `/admin/students`
- Table: Name, Email, Level, Track, Status, Last Active
- Add Student form (modal/drawer)
- API: `GET /api/students`, `POST /api/students`

### Student Detail — `/admin/students/[id]`
- Profile info, enrollment history, payment status, progress charts
- API: `GET /api/students/[id]`

### Teachers — `/admin/teachers`
- Table: Name, Email, Specializations, Active Students
- Add Teacher form
- API: `GET /api/teachers`, `POST /api/teachers`

### Classes — `/admin/classes`
- Table: Class name, Teacher, Students count, Schedule
- Create Class form
- API: `GET /api/classes`, `POST /api/classes`

### Speaking Sessions — `/admin/speaking`
- Table: Date, Topic, Students, Status (Scheduled/Completed/Cancelled)
- Filters: date range, status
- API: `GET /api/speaking-sessions`

### Speaking Session Detail — `/admin/speaking/[id]`
- Session info, participant list, transcript viewer, AI analysis results
- Actions: add participant, upload transcript, trigger analysis
- API: `GET /api/speaking-sessions/[id]`, `POST .../participants`, `POST .../transcript`, `POST .../analyze`

### Create Speaking Session — `/admin/speaking/create`
- Form: date, topic, duration, meeting link
- Student picker with smart suggestions
- API: `POST /api/speaking-sessions`, `POST /api/sessions/suggest-students`

### Topics — `/admin/topics`
- Table: Topic name, Category, Difficulty, Times Used
- Create/Edit topic form
- API: `GET /api/topics`, `POST /api/topics`

### Groups — `/admin/groups`
- Group management for speaking sessions
- Chemistry scores between students
- API: `GET /api/sessions/suggest-students`

### Grammar — `/admin/grammar`
- Stats: Categories, Topics, Exercises, Student Completion
- Overview of grammar system content

### Payments — `/admin/payments`
- Stats: Total Revenue, Pending, This Month, Active Plans
- Payment Plans table: Student, Type, Amount, Next Due
- Transactions table: Student, Amount, Method, Status, Date
- Actions: Create Plan, Record Transaction, Confirm IBAN Payment
- API: `GET/POST /api/payments/plans`, `GET/POST /api/payments/transactions`, `POST /api/payments/confirm`

### WhatsApp — `/admin/whatsapp`
- Stats: Total Conversations, Active Leads, Student Chats, Unread
- Conversation list with phone, type badge, last message preview
- Quick send form
- API: `GET /api/whatsapp/conversations`, `POST /api/whatsapp/send`

### WhatsApp Conversation — `/admin/whatsapp/[id]`
- Chat bubble UI (inbound left, outbound right)
- Message history with timestamps
- User info sidebar
- Reply input
- API: `GET /api/whatsapp/conversations/[id]`, `POST /api/whatsapp/send`

### Blog Management — `/admin/blog`
- Stats: Total Posts, Published, Drafts
- Posts table: Title, Language, Status, Date
- Create Post form + AI Generate button
- API: `GET /api/blog`, `POST /api/blog`, `POST /api/blog/generate`

### Analytics — `/admin/analytics`
- Platform-wide stats: Students, Teachers, Sessions, Revenue
- Revenue by method (IBAN/Papara/Stripe pie chart)
- Student growth (active vs inactive)
- Country distribution (bar chart)
- Level distribution (A1-C2 bar chart)
- Top performing students

---

## 3. Teacher Portal (`/teacher`)

### Dashboard — `/teacher`
- My stats: Active Students, This Week Sessions, Pending Homework
- Upcoming sessions list
- Recent student activity

### My Students — `/teacher/students`
- Table: Name, Level, Track, Last Session, Grammar Progress
- API: `GET /api/teacher/students`

### Classes — `/teacher/classes`
- Teacher's assigned classes with student lists
- API: `GET /api/teacher/classes`

### Lessons — `/teacher/lessons`
- Lesson log with dates, topics covered
- Create lesson form
- API: `GET /api/lessons`, `POST /api/lessons`

### Assignments — `/teacher/assignments`
- Assignment list with submission status
- Create assignment form
- API: `GET /api/assignments`, `POST /api/assignments`

### Speaking Sessions — `/teacher/speaking`
- Teacher's session list (upcoming + past)
- Status badges, quick actions
- API: `GET /api/teacher/speaking`

### Speaking Session Detail — `/teacher/speaking/[id]`
- Full session management: attendance, transcript, analysis, homework
- Per-student analysis cards with scores
- API: Multiple endpoints under `/api/teacher/speaking/[id]/...`

### Create Session from Lesson — `/teacher/speaking/create`
- Create session linked to a lesson topic
- Student suggestions based on who needs this topic
- API: `POST /api/speaking-sessions`, `POST /api/sessions/suggest-students`

### Topics — `/teacher/topics`
- Topic bank management
- Create custom topics based on lessons
- API: `GET/POST /api/teacher/topics`

### AI Insights — `/teacher/insights`
- AI-generated insights about student progress trends
- Mark as read
- API: `GET /api/teacher-insights`, `POST /api/teacher/insights/mark-read`

### Grammar Overview �� `/teacher/grammar`
- View student grammar progress across categories
- Assign grammar topics to students
- API: `GET /api/grammar/progress`, `POST /api/grammar/assignments`

### Payments — `/teacher/payments`
- Revenue overview: This Month, Total, Students Paid/Pending
- Transaction history
- API: Server-side Prisma query (teacher's students' payments)

### Analytics — `/teacher/analytics`
- Stats: Total Students, Sessions This Month, Avg Score, Resources Generated
- Student progress table (level, sessions, participation, grammar, homework)
- "Students at Risk" section
- "Generate Weekly Resources" button
- API: `POST /api/teacher-resources/generate`

### Attendance — `/teacher/attendance`
- Attendance tracking for classes
- API: `GET/POST /api/attendance`

---

## 4. Student Portal (`/student`)

### Dashboard — `/student`
- My stats: Level, Sessions Attended, Grammar Progress, Next Session
- Upcoming sessions with topics
- Recent homework

### Speaking Sessions — `/student/speaking`
- Upcoming sessions (with prep topic shown)
- Past sessions with scores
- API: `GET /api/speaking-sessions` (filtered for student)

### Speaking Session Detail — `/student/speaking/[id]`
- Session info, topic, other participants
- After session: AI feedback, scores, areas to improve
- Rating form
- API: `GET /api/speaking-sessions/[id]`, `POST .../rate`

### Grammar Hub — `/student/grammar`
- 16 category cards with progress rings
- Overall progress stats
- API: `GET /api/grammar/categories`

### Grammar Category — `/student/grammar/[categorySlug]`
- Topic list for category with completion status
- API: `GET /api/grammar/topics?category=xxx`

### Grammar Topic — `/student/grammar/[categorySlug]/[topicSlug]`
- 3 tabs: Learn (lesson content), Practice (interactive exercises), Quiz (timed assessment)
- API: `GET /api/grammar/topics/[id]`, `POST /api/grammar/exercises/check`, `GET/POST /api/grammar/quiz/[topicId]`

### Homework — `/student/homework`
- Pending + completed homework list
- Each homework shows: title, due date, sections, submit button
- API: Server-side Prisma query

### Progress — `/student/progress`
- Speaking progress: participation trends, vocabulary growth, grammar timeline
- Grammar progress: per-category completion
- API: `GET /api/progress/[studentId]`, `GET /api/grammar/progress`

### Classes — `/student/classes`
- Enrolled classes with schedule
- API: `GET /api/student/classes`

### Lessons — `/student/lessons`
- Past lessons with notes
- API: `GET /api/student/lessons`

### Payments — `/student/payments`
- Current plan info, next due date
- Transaction history with status
- Submit payment proof (screenshot upload for IBAN)
- API: `GET /api/student/payments`, `POST /api/payments/transactions`

### Attendance — `/student/attendance`
- Attendance record
- API: Server-side query

---

## 5. Onboarding Wizards

### Student Onboarding — `/onboarding/student`
**6 steps:**
1. Personal Info (name, country, timezone, phone)
2. Track Selection (Speaking Only vs Full Student)
3. Level Assessment (A1/A2/B1/B2/C1/C2 self-select)
4. Availability Grid (7 days × 3 time slots)
5. Topic Preferences (12 categories to pick from)
6. International Mixing (prefer mixed nationalities yes/no)

API: `POST /api/onboarding`

### Teacher Onboarding — `/onboarding/teacher`
**3 steps:**
1. Personal Info (timezone, country)
2. Specializations (TOEFL, IELTS, Grammar, Speaking, Business, etc.)
3. Bio textarea

API: `POST /api/onboarding`

---

## 6. Shared Components

| Component | Used In | Description |
|-----------|---------|-------------|
| Sidebar | Admin, Teacher, Student | Role-based navigation |
| Notification Bell | All portals | Dropdown with unread count, mark as read |
| Badge | Everywhere | Status indicators (success/warning/danger/info/outline) |
| Button | Everywhere | Variants: default (blue), outline, ghost, destructive |
| Card | Dashboards | Stats display |
| Table | List pages | Sortable data tables |
| Modal/Drawer | Create forms | Overlay forms |
| Chat Bubbles | WhatsApp, AI Chat | Message display |
| Progress Ring | Grammar | Circular progress indicator |
| Date Picker | Sessions, Payments | Date selection |

---

## Design Notes

1. **Color Scheme**: Blue primary (#2563EB), tailwind gray scale
2. **Font**: System font stack (monospace not needed)
3. **Layout**: Sidebar (240px) + Main content area
4. **Responsive**: Mobile-first, sidebar collapses to hamburger on mobile
5. **Dark Mode**: Not implemented yet (future consideration)
6. **Language**: UI in English, content supports English + Turkish
7. **Auth Flow**: Login → Role-based redirect → Portal dashboard
