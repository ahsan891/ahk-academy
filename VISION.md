# AHK ACADEMY — Full Vision & Requirements

## The Big Picture
Build the biggest online academy in the world, starting with English. Scale from 25 students to 1 million.

---

## Current Workflow (How Ahsan Teaches Today)

### Lesson Structure
- **Platform**: Microsoft Teams (video call + recording)
- **Lesson duration**: 40 minutes per lesson
- **Sessions per day**: 2 lessons = ~1.5 hours total
- **Days per week**: 4 days
  - 2 days are **fixed/strict** (same day every week)
  - 2 days are **flexible** (can be moved around)
- **Current students**: 25

### How a Lesson Works Today
1. Ahsan sends students a Teams link
2. Students join the video call
3. Lesson is recorded in Teams
4. After the lesson, Ahsan takes the **transcript** from the recording
5. Transcript goes to **Claude AI**
6. Claude generates **personalized homework** as LaTeX code
7. Ahsan compiles the LaTeX on **Overleaf** → gets PDFs
8. PDFs are sent to students as their homework
9. Students feel the homework is personalized to what they learned (because it is)

### Payment Model
- **100 lessons** sold as a package
- Payments are collected with **installments**
- Need to track: how much paid, how much remaining, due dates

---

## What's Missing (Problems to Solve)

Ahsan currently has **NO system** to track:
- ❌ Student attendance (who showed up, who didn't)
- ❌ Payment tracking (who paid, how much, what's owed)
- ❌ Lesson history (what topics were covered, when)
- ❌ Student progress (what they've learned, what's left)
- ❌ Homework tracking (submitted? graded? feedback given?)

---

## What We Need to Build — The Automated System

### 1. Scheduling & Links (Automated)
- When lesson days and times are decided → **automatically** generate meeting links
- Students get the link automatically
- Teacher gets the link automatically
- Reminders before the session

### 2. Lesson Recording & AI Pipeline (Automated)
- Once a session is completed → the recording is captured
- Recording transcript is **automatically** sent to Claude/AI
- AI generates **personalized homework** based on what was taught
- Homework is formatted and delivered to students automatically
- No manual LaTeX/Overleaf step — the system does it

### 3. Homework Flow
- Students receive homework after each lesson
- Students **submit** their homework through the portal
- Teacher **reviews and grades** the homework
- AI can **assist with grading** (especially for English essays, grammar)
- Students get **feedback** on their submissions

### 4. Tracking Everything

#### For Students (Student Portal):
- View their attendance record
- See payment status (paid vs. owed, installment schedule)
- Access all past lessons and topics covered
- View homework assignments and grades
- Track their progress (how much learned, how much left out of 100 lessons)

#### For Teachers (Teacher Portal):
- See all their classes and students
- Take attendance (mark present/absent/late)
- View student progress and performance
- Assign and grade homework
- Access lesson recordings and transcripts

#### For Admin — Ahsan (Admin Dashboard):
- Overview of everything: students, payments, attendance, progress
- Track revenue: who paid, who owes, total income
- Monitor teacher performance
- Generate reports and insights

### 5. Per-Student Database/Profile
- Each student has their own complete profile with:
  - Full lesson history
  - All topics covered
  - Attendance percentage
  - Payment history and balance
  - Homework scores and feedback
  - Performance metrics
  - Progress: X out of 100 lessons completed

---

## Phase 2 — Teacher Platform (Next Step)

After building this system for Ahsan's students:

### Multi-Teacher System
- Other teachers can **join AHK Academy**
- Each teacher gets their own portal with the same features
- Teachers with **private students** can use the system to track everything
- Teachers manage their own:
  - Students
  - Classes
  - Attendance
  - Homework
  - Payments
- Ahsan (admin) has oversight of all teachers and their students

### The Goal
- Build once, scale for every teacher
- Every teacher gets the same powerful system
- AHK Academy becomes the platform that teachers AND students use
- Eventually: the biggest online academy in the world

---

## Tech Stack
- **Frontend**: Next.js (Vercel)
- **Backend/DB**: PostgreSQL (Railway)
- **AI**: Claude API (homework generation, grading assistance, reports)
- **Video**: Microsoft Teams integration (or custom later)
- **Code**: GitHub (single repo)
- **Manager**: Claude Code (connected to everything)

---

## Key Principles
1. **Everything automated** — minimize manual work
2. **AI-powered** — homework generation, grading, insights
3. **Scalable** — built to handle 1 million students
4. **Easy to track** — every metric visible at a glance
5. **Teacher-friendly** — any teacher can join and use the system
6. **Student-friendly** — students see their full learning journey
