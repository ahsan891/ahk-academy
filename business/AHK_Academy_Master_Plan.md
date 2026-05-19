# AHK ACADEMY — COMPLETE 6-MONTH MASTER PLAN
### For: Assistant / Operations Team
### Owner: Ahsan Hussain Khan
### Prepared by: Claude Code
### Date: May 2026

---

> **HOW TO USE THIS DOCUMENT**
> Follow every step in order. Do not skip steps.
> When you need to build something — open Claude Code in VS Code,
> describe what you want in plain English, Claude writes all the code.
> You do not need to know how to code.

---

# PART 1: WHAT WE ARE BUILDING

## The Vision
AHK Academy is a professional online education platform starting in Turkey,
targeting students preparing for IELTS and TOEFL exams. It includes video
lectures, grammar PDFs, practice tests, vocabulary games, a blog, and a full
student management system (attendance + fees).

**Goal: 10,000 paying students within 6 months in Turkey, then expand globally.**

## The Website
- URL: ahkacademy.com
- Primary market: Turkey (then Pakistan, Saudi Arabia, Egypt...)
- Languages: Turkish + English
- Price: ₺500/month per student (~£15)
- Revenue at 10,000 students: ₺5,000,000/month (~£140,000)

## What the Site Includes
1. Home / Landing Page
2. IELTS Section (Reading, Writing, Listening, Speaking)
3. TOEFL Section
4. Grammar PDF Library
5. Video Lectures
6. Practice Tests with automatic scoring
7. Vocabulary Games
8. Blog (brings free Google traffic)
9. Student Portal (progress, lessons, payments)
10. Teacher Portal (attendance, fees — already built)
11. Online Payments (Stripe + iyzico for Turkey)

---

# PART 2: TECHNOLOGY STACK

| What | Tool | Cost | Purpose |
|------|------|------|---------|
| Programming language | Python | Free | Runs everything |
| Web framework | Flask | Free | The website engine |
| Database | PostgreSQL (Supabase) | Free | Stores all data |
| Speed cache | Redis (Upstash) | Free | Makes site fast |
| Background jobs | Celery | Free | Auto sends emails |
| Hosting | Railway | Free → $5/mo | Always live |
| Domain | Namecheap | £10/year | ahkacademy.com |
| CDN + Protection | Cloudflare | Free | Fast globally, secure |
| File storage | Cloudflare R2 | Free (10GB) | PDFs, images |
| Email | Resend | Free (3,000/mo) | Welcome, reminders |
| Payments | Stripe + iyzico | 2.9% per charge | Student subscriptions |
| AI features | Claude API | Pay per use | Essay grading, chatbot |
| Code editor | VS Code + Claude Code | Free | Write and deploy code |
| Code backup | GitHub | Free | Saves all code |

**Total monthly cost to start: £0**
**Total monthly cost at 10,000 students: ~$700 (~£550)**

---

# PART 3: ONE-TIME SETUP (DO THIS FIRST — IN ORDER)

## STEP 1 — Install Software on the Computer

### Install VS Code
1. Go to https://code.visualstudio.com
2. Click "Download for Windows"
3. Run installer, click Next through all steps → Install → Finish

### Install Claude Code in VS Code
1. Open VS Code
2. Click the square Extensions icon (left sidebar)
3. Search: Claude Code
4. Click Install on the Anthropic extension
5. Sign in with Anthropic account when prompted

### Install Git
1. Go to https://git-scm.com/download/win
2. Download and install with all default settings
3. In VS Code, press Ctrl+` (backtick) to open terminal
4. Type: git --version → should show a version number

### Install Python
1. Go to https://python.org/downloads
2. Download Python 3.12
3. CRITICAL: Tick "Add Python to PATH" before clicking Install
4. Type in terminal: python --version → should show Python 3.12.x

---

## STEP 2 — Create All Accounts (All Free)

### GitHub (stores your code)
1. Go to https://github.com → Sign up
2. Username: ahkacademy
3. Verify email
4. SAVE username + password

### Railway (hosts the website — always live)
1. Go to https://railway.app
2. Click "Login with GitHub"
3. Approve the connection
4. Free $5 credit given every month

### Supabase (free PostgreSQL database)
1. Go to https://supabase.com → Sign up with GitHub
2. Click "New Project" → Name: ahk-academy
3. Set a strong database password → SAVE IT
4. Region: Europe West (closest to Turkey)
5. Click "Create new project" — wait 2 minutes
6. Go to Settings → Database → copy the "URI" connection string
7. SAVE THIS — starts with postgresql://...

### Upstash (free Redis)
1. Go to https://upstash.com → Sign up with GitHub
2. Click "Create Database" → Name: ahk-redis → Region: EU-West
3. Copy UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN
4. SAVE BOTH

### Cloudflare (free CDN + DNS)
1. Go to https://cloudflare.com → Sign up
2. You will add your domain here after buying it

### Namecheap (buy the domain)
1. Go to https://namecheap.com → Sign up
2. Search: ahkacademy.com → Buy it (~£10/year)
3. SAVE login credentials + note the renewal date

### Resend (free email sending)
1. Go to https://resend.com → Sign up
2. API Keys → Create API Key → Name: ahk-academy
3. SAVE the key (starts with re_...)

---

## STEP 3 — Set Up the Project Code

### Open the Project
1. Open VS Code
2. File → Open Folder → navigate to C:\Users\ahk79\attendance_fees
3. Press Ctrl+` to open terminal

### Install Dependencies
```
python -m pip install -r requirements.txt
```

### Test It Works Locally
```
python app.py
```
Open browser → http://127.0.0.1:5000
If you see the website, everything works. Press Ctrl+C to stop.

### Connect to GitHub
```
git init
git add .
git commit -m "Initial AHK Academy commit"
```
Then in GitHub:
1. Go to github.com → New Repository → Name: ahk-academy → Create
2. Copy the commands shown under "push an existing repository"
3. Paste them into VS Code terminal → press Enter

---

## STEP 4 — Deploy to Railway (Make It Live)

### Create Railway Project
1. Go to railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select: ahk-academy
4. Railway starts building — wait 2 minutes

### Add Environment Variables
In Railway → your project → Variables tab → Add these one by one:

```
DATABASE_URL     = [your Supabase postgresql:// connection string]
REDIS_URL        = [your Upstash Redis URL]
RESEND_API_KEY   = [your Resend key]
SECRET_KEY       = [type any 32 random characters]
FLASK_ENV        = production
```

Railway restarts automatically.

### Get Your Live URL
1. Railway → your project → Settings → Domains
2. Click "Generate Domain"
3. You get: something.up.railway.app
4. Open it in browser — site is LIVE

### Connect ahkacademy.com to Railway
1. In Railway Domains → "Add Custom Domain" → type ahkacademy.com
2. Railway gives you a CNAME value — COPY IT
3. Go to Cloudflare → your domain → DNS → Add Record:
   - Type: CNAME
   - Name: @
   - Target: [paste Railway CNAME]
   - Proxy: ON (orange cloud)
4. In Namecheap → Domain → Nameservers → switch to Cloudflare's nameservers
5. Wait 10–15 minutes → ahkacademy.com loads your site

---

# PART 4: THE DAILY WORKFLOW

## Every Morning

1. Open VS Code → File → Open Folder → your project
2. Press Ctrl+` for terminal
3. Pull latest code: `git pull origin main`
4. Start local server: `python app.py`
5. Open http://127.0.0.1:5000 — check everything looks fine

---

## Building New Features with Claude Code

**Step 1 — Open Claude Code**
Press Ctrl+Shift+P → type Claude → select "Claude: Open Chat"

**Step 2 — Describe what you want in plain English**

Good example:
> "Add a page at /ielts/reading that lists practice tests.
> Each test has a title, difficulty (Easy/Medium/Hard), and a Start button.
> Students answer 10 multiple choice questions, one at a time.
> At the end show their score with the correct answers highlighted."

Bad example:
> "Add reading tests"

The more detail you give, the better the result.

**Step 3 — Claude writes the code**
Review it looks reasonable. You do not need to understand every line.

**Step 4 — Test locally**
With server running, click through the new feature at localhost:5000.
If something is wrong, tell Claude:
> "The quiz page loads but clicking Next doesn't go to the next question.
> Here is the browser error: [paste error]"

**Step 5 — Deploy**
```
git add .
git commit -m "Add IELTS reading practice tests"
git push origin main
```
Within 60 seconds, it is live on ahkacademy.com.

---

## When Something Breaks

1. Copy the full red error message
2. Open Claude Code
3. Type: "I got this error, please fix it: [paste error]"
4. Claude explains the problem and fixes the code
5. Test locally → push → live

---

# PART 5: 6-MONTH BUILD PLAN

## MONTH 1 — Foundation (Weeks 1–4)

### Week 1: Everything Live
- [ ] Complete all account setups
- [ ] Deploy attendance system to Railway
- [ ] ahkacademy.com pointing to Railway and loading
- [ ] Test from different devices and browsers

### Week 2: Login System
Tell Claude Code:
> "Add a complete login and registration system with three roles:
> Admin (full access to everything), Teacher (manage students, lessons,
> payments), Student (view only their own profile, lessons, progress).
> Include: register page, login page, logout, forgot password via email,
> remember me checkbox. Passwords must be hashed securely."

Test:
- Register as new student
- Login as teacher
- Admin sees everything
- Student cannot see other students

### Week 3: Professional Homepage
Tell Claude Code:
> "Create a professional homepage for AHK Academy with:
> - Fixed navigation bar: Logo, IELTS, TOEFL, Blog, Pricing, Login, Sign Up
> - Hero: 'Master IELTS & TOEFL — Turkey's Most Trusted Online Academy'
>   with two buttons: Start Free Trial, View Courses
> - Stats bar: 10,000+ Students, 500+ Lessons, 4.9/5 Rating, Band 7+ Guaranteed
> - Features section: 6 cards showing platform benefits
> - How it works: 3 steps (Sign up, Study, Succeed)
> - Pricing: Free plan vs Premium ₺500/month
> - Testimonials: 3 student reviews (placeholder text for now)
> - Footer: links, social icons, contact email
> Professional blue (#1a56db) and white color scheme."

### Week 4: Student Dashboard
Tell Claude Code:
> "Create a student dashboard shown after login with:
> - Welcome message with student's name
> - Progress cards: lessons completed, tests taken, average score, streak days
> - Weekly activity chart (days studied this week)
> - Upcoming lessons list
> - Continue Learning section (last accessed content)
> - Quick links: IELTS, TOEFL, Practice Test, Grammar"

**Month 1 Target: Site live, 50 beta students signed up, login working**

---

## MONTH 2 — Core Content (Weeks 5–8)

### Week 5: IELTS Section
Tell Claude Code:
> "Create a full IELTS preparation section at /ielts with:
> - Overview page showing 4 sections: Reading, Writing, Listening, Speaking
> - Each section has its own page listing available lessons
> - Each lesson has: title, description, duration, video (YouTube embed),
>   PDF download button, and a Mark as Complete button
> - Admin can add new lessons from an admin panel
> - Student progress tracked — completed lessons shown with a green tick"

### Week 6: TOEFL Section
Tell Claude Code:
> "Create a TOEFL preparation section identical in structure to IELTS
> at /toefl with sections: Reading, Listening, Speaking, Writing.
> Same lesson format. Separate content from IELTS."

### Week 7: Grammar PDF Library
Tell Claude Code:
> "Create a grammar library at /grammar with:
> - Searchable list of all grammar PDFs
> - Each entry: title, description, level (A1/A2/B1/B2/C1/C2), download button
> - PDFs stored on Cloudflare R2
> - Admin can upload new PDFs from admin panel
> - Filter by level, search by keyword
> - Most downloaded PDFs shown at top"

### Week 8: Blog
Tell Claude Code:
> "Create a blog at /blog:
> - Public page showing all blog posts (no login needed)
> - Each post: title, featured image, category, author, date, reading time
> - Post URL format: /blog/how-to-ace-ielts-writing-task-2
> - Categories: IELTS Tips, TOEFL Tips, Grammar, Study Strategies, Success Stories
> - Admin writes and publishes posts in a rich text editor
> - Social share buttons (Twitter, Facebook, WhatsApp) on each post
> - Related posts shown at bottom
> - Posts available in Turkish and English"

**Month 2 Target: 200 students, real content to study, blog getting Google traffic**

---

## MONTH 3 — Interactive Features (Weeks 9–12)

### Week 9: Practice Tests
Tell Claude Code:
> "Create a practice test system:
> - Admin creates tests: title, section (IELTS/TOEFL), type, difficulty, time limit
> - Each test has multiple choice questions (4 options, 1 correct)
> - Student takes test: one question at a time, countdown timer
> - At end: score out of total, percentage, time taken
> - Correct/incorrect answers shown with explanations
> - All attempts saved: student can see their history and improvement over time
> - Leaderboard showing top scorers this week"

### Week 10: Vocabulary Game
Tell Claude Code:
> "Create a vocabulary flashcard game at /vocabulary:
> - Admin adds vocabulary words: English word, Turkish meaning, example sentence, level
> - Student sees English word, must pick correct Turkish meaning from 4 options
> - Points system: +10 for correct, -5 for wrong
> - Streak counter: bonus points for consecutive correct answers
> - Words marked as Learned / Needs Practice / New
> - Daily goal: 20 new words
> - IELTS Academic Word List and TOEFL word list pre-loaded"

### Week 11: Progress Tracking
Tell Claude Code:
> "Create a detailed progress page for students:
> - Line chart: test scores over last 30 days (one line per IELTS section)
> - Bar chart: vocabulary words learned per week
> - Calendar heatmap: days studied (like GitHub contribution graph)
> - Achievements/badges: First Test, 7-Day Streak, 100 Words Learned, Band 7 Score
> - Estimated IELTS band score based on test performance
> - Areas to improve: bottom 3 weakest topics highlighted in red"

### Week 12: Turkish Language Support
Tell Claude Code:
> "Add full Turkish/English bilingual support:
> - TR/EN toggle button fixed in top-right corner of every page
> - All navigation, buttons, labels, error messages translate
> - Homepage, IELTS, TOEFL pages have Turkish versions
> - Blog posts can be written in TR or EN or both
> - URL: ahkacademy.com/tr/ielts for Turkish, ahkacademy.com/ielts for English
> - Remember user's language preference in their profile"

**Month 3 Target: 500 students, platform is engaging, students coming back daily**

---

## MONTH 4 — Monetization (Weeks 13–16)

### Week 13: Subscription System
Tell Claude Code:
> "Add a subscription system:
> - Free plan: homepage, blog, 1 sample test per section, 20 vocabulary words/day
> - Premium plan: ₺500/month — full access to everything
> - Annual plan: ₺4,500/year (3 months free)
> - Pricing page at /pricing with clear comparison table
> - Premium badge on student profile
> - Content blocked for free users with 'Upgrade to Premium' overlay
> - 7-day free trial for new signups — no card required"

### Week 14: Stripe + iyzico Payments
Tell Claude Code:
> "Integrate payments:
> - Stripe for international cards (UK, EU students)
> - iyzico for Turkish credit/debit cards (main market)
> - Student clicks Subscribe → payment page → enters card → subscribed
> - Subscription renews automatically monthly
> - Cancel anytime from profile settings
> - Failed payment → email reminder → 3 retry attempts → downgrade to free"

### Week 15: Automatic Invoices
Tell Claude Code:
> "After every payment:
> - Generate a PDF invoice automatically (student name, date, amount, invoice number)
> - Email invoice to student via Resend
> - Invoice downloadable from student profile → Billing section
> - Admin can see all invoices with search and date filter
> - Monthly revenue summary PDF for admin"

### Week 16: Teacher Finance Dashboard
Tell Claude Code:
> "Expand the teacher portal to show:
> - Total subscription revenue this month vs last month
> - One-to-one lesson payments recorded manually (existing system)
> - Combined revenue chart: subscriptions + manual payments
> - List of students with overdue payments (balance > 0 and not paid in 30 days)
> - Auto-send payment reminder email to overdue students (admin can trigger)"

**Month 4 Target: 1,500 paying students, ₺750,000/month revenue, fully automated**

---

## MONTH 5 — Marketing & Growth (Weeks 17–20)

### Week 17: SEO Optimisation
Tell Claude Code:
> "Optimise the entire site for Turkish Google search:
> - Every page has a unique title tag and meta description in Turkish
> - Blog posts have SEO URLs like /blog/ielts-nasil-hazirlanilir
> - Generate sitemap.xml automatically at /sitemap.xml
> - Add Open Graph tags (for WhatsApp/Facebook link previews)
> - Compress all images automatically on upload
> - Add robots.txt
> - Page load time under 2 seconds on mobile"

Write these 10 blog posts (1 per week, 1,500+ words in Turkish):
1. IELTS Band 7 için nasıl çalışılır — 30 günlük plan
2. TOEFL 100+ puan için strateji rehberi
3. IELTS Writing Task 2 — en sık yapılan 10 hata
4. IELTS Reading hızını artırmanın 5 yolu
5. TOEFL Speaking için model cevap örnekleri
6. İngilizce dilbilgisi — Present Perfect vs Past Simple
7. IELTS Listening için en iyi ücretsiz kaynaklar
8. Yurt dışı üniversite için hangi sınav: IELTS mi TOEFL mü?
9. Band 8 yazan öğrencilerin ortak sırları
10. IELTS sınavında panik olmadan nasıl kalınır?

### Week 18: Email Marketing
Tell Claude Code:
> "Create an email marketing system:
> - Homepage footer: 'Get free weekly IELTS tips' email signup (no login needed)
> - When someone signs up: 7-day automated email sequence:
>   Day 1: Welcome + free IELTS study plan PDF
>   Day 2: Top 10 vocabulary words for IELTS
>   Day 3: Writing Task 2 — how to structure your essay
>   Day 4: Reading — how to save 10 minutes per section
>   Day 5: Speaking — common mistakes to avoid
>   Day 6: Listening — strategies for every question type
>   Day 7: Special offer — start 7-day free trial, 20% off first month
> - All emails sent via Resend
> - Admin dashboard showing open rates and click rates"

### Week 19: Referral Program
Tell Claude Code:
> "Add a referral system:
> - Each student gets a unique referral link at /ref/[username]
> - When a friend signs up via that link and subscribes, both get 1 month free
> - Student dashboard shows: referrals made, referrals who subscribed, free months earned
> - Referral count shown as a badge of honour on profile
> - Email notification when a referral converts to paid"

### Week 20: Reviews & Social Proof
Tell Claude Code:
> "Add a review and testimonials system:
> - After 30 days as premium student: automated email asking for a review
> - Students rate 1-5 stars and write a review (max 200 words)
> - Best reviews (4-5 stars) shown on homepage after admin approves
> - Show total student count and average rating in hero section
> - Badge: 'Trusted by 4,000+ students' once milestone reached"

**Month 5 Target: 4,000 students, Google sending 20,000 visitors/month, referrals working**

---

## MONTH 6 — Scale (Weeks 21–24)

### Week 21: Mobile Optimisation
Tell Claude Code:
> "Make the entire website perfect on mobile phones:
> - Test every single page at 375px width (iPhone SE)
> - Navigation collapses to hamburger menu on mobile
> - All buttons minimum 44px tap target
> - Text readable without zooming
> - Videos play correctly on mobile
> - Practice test works perfectly on mobile
> - Load time under 3 seconds on 4G mobile"

### Week 22: AI Writing Feedback
Tell Claude Code:
> "Add an AI essay grading tool at /ielts/writing/check:
> - Student types or pastes their IELTS Task 2 essay
> - Clicks 'Get AI Feedback'
> - Claude API analyses the essay and returns:
>   - Estimated band score (1-9) for each criterion:
>     Task Achievement, Coherence & Cohesion, Lexical Resource, Grammatical Range
>   - 3 specific strengths in the essay
>   - 3 specific areas to improve with examples
>   - Corrected version of 2-3 weak sentences
> - Results shown in clean formatted report
> - Student can save reports to their profile history
> - Premium feature only"

### Week 23: Live Classes
Tell Claude Code:
> "Add a live class system:
> - Teacher creates a live class: title, date, time, duration, Zoom link, topic, max students
> - Classes shown in a calendar view and list view
> - Students register for classes (limited spots)
> - Reminder email sent 24 hours before and 30 minutes before
> - After class: recording link added, students who attended marked
> - Premium students get unlimited live classes
> - Free students see classes but cannot register (upgrade prompt shown)"

### Week 24: Admin Analytics
Tell Claude Code:
> "Create a full analytics dashboard at /admin/analytics:
> - Total students over time: line chart (daily/weekly/monthly toggle)
> - Monthly revenue: bar chart showing subscriptions vs one-to-one lessons
> - Student retention: % who renew each month (cohort chart)
> - Top 10 most visited pages this month
> - Average test scores by section across all students
> - New vs returning visitors
> - Country breakdown (Turkey, Pakistan, UK, other)
> - Churn rate: students who cancelled this month
> - Revenue forecast: based on current growth rate"

**Month 6 Target: 10,000 paying students, ₺5,000,000/month, ready for Pakistan launch**

---

# PART 6: HOW TO GET 10,000 STUDENTS

## The Core Strategy
```
Free content → Google finds it → Students find you →
They trust you → They subscribe → They refer friends → 10,000 students
```

---

## Channel 1: Google SEO — Most Important

**Target:** 50 Turkish blog posts and 20 YouTube videos in 6 months

Top Turkish search terms to target:
- "IELTS hazırlık kursu" — 18,000 searches/month in Turkey
- "TOEFL sınavı nasıl hazırlanılır" — 12,000 searches/month
- "IELTS band 7 nasıl alınır" — 9,000 searches/month
- "İngilizce dilbilgisi PDF" — 25,000 searches/month

**How:** Write one blog post per week targeting one of these terms.
Each post: 1,500+ words, answer the question better than anyone else.
**Expected result:** 30,000–50,000 free visitors/month by month 6.

---

## Channel 2: YouTube

Create channel: AHK Academy (same name everywhere)

Post 2 videos per week:
- Full lesson videos (15–20 min): "IELTS Writing Task 2 — Band 7 Model Answer"
- Short tip videos (3–5 min): "3 grammar mistakes that cost you 1 IELTS band"

End every video:
> "Daha fazla ders ve kişisel geri bildirim için ahkacademy.com'u ziyaret edin"
> (Visit ahkacademy.com for more lessons and personal feedback)

**Expected result:** 3,000–5,000 students from YouTube by month 6.

---

## Channel 3: Instagram + TikTok

Post daily (takes 15 minutes):
- Grammar tip of the day
- IELTS/TOEFL word of the day
- Student score improvement screenshots
- "Did you know?" IELTS facts

Username: @ahkacademy on all platforms.

---

## Channel 4: Turkish Communities

Find and contribute to:
- Facebook groups: "IELTS Türkiye", "Yurt Dışı Üniversite"
- Ekşi Sözlük entries about IELTS (huge Turkish forum)
- Reddit: r/IELTS (post in English too)

Rule: Give genuinely useful answers. Mention the site naturally, not as spam.

---

## Channel 5: Paid Ads (Start Month 3)

Once content is live and tested:
- Google Ads Turkey: "IELTS kursu", "TOEFL hazırlık" — start $200/month
- Facebook/Instagram Ads: 18–30 year olds in Turkey — start $200/month
- Scale what works, cut what doesn't

Cost per student: $5–$15
At $10 per student × 10,000 = $100,000 total ad spend
Revenue from those students: ₺5,000,000 = ~£140,000
**Return: profitable from month 4.**

---

## Channel 6: Affiliate / Teacher Partnerships

Contact 20 IELTS/TOEFL private tutors in Turkey:
- Offer them 20% commission on every student they refer
- Provide them a unique referral link
- Pay monthly via bank transfer

One teacher with 50 active students can send 5–10 new subscribers/month.

---

## Student Acquisition Timeline

| Month | Students | Main Source |
|-------|----------|-------------|
| 1 | 50 | Friends, family, social media launch post |
| 2 | 200 | First blog posts indexed on Google, YouTube |
| 3 | 500 | SEO growing, first paid ads |
| 4 | 1,500 | Referral program, more SEO, ads optimised |
| 5 | 4,000 | YouTube growing, word of mouth, affiliates |
| 6 | 10,000 | All channels running, strong SEO, referrals |

---

# PART 7: FINANCIAL PROJECTIONS

## Revenue Targets

| Month | Students | Monthly Revenue (₺) | Monthly Revenue (£) |
|-------|----------|---------------------|---------------------|
| 1 | 50 | ₺25,000 | £700 |
| 2 | 200 | ₺100,000 | £2,800 |
| 3 | 500 | ₺250,000 | £7,000 |
| 4 | 1,500 | ₺750,000 | £21,000 |
| 5 | 4,000 | ₺2,000,000 | £56,000 |
| 6 | 10,000 | ₺5,000,000 | £140,000 |

## Monthly Running Costs

| Item | Month 1–2 | Month 6 |
|------|-----------|---------|
| Railway hosting | $0 | $30 |
| Supabase database | $0 | $25 |
| Cloudflare | $0 | $5 |
| Resend email | $0 | $20 |
| Claude API | $0 | $100 |
| Paid advertising | $0 | $500 |
| **Total** | **$0** | **~$680/month** |

**Net profit at 10,000 students: ~£139,000/month**

---

# PART 8: EXPANSION TO OTHER COUNTRIES

## The Playbook (4–8 weeks per new country)

### Phase 2: Pakistan (Month 7–12)
- 240M population, highest IELTS demand for UK/Canada immigration
- Language: Urdu + English content
- Payment: JazzCash, EasyPaisa, bank transfer
- URL: ahkacademy.com/pk
- Price: PKR 3,000/month (~£8)
- Target: 20,000 students by end of year 1

### Phase 3: Saudi Arabia (Month 13–18)
- Highest spending power in region
- IELTS required for many UK/EU visas and jobs
- Language: Arabic + English
- Payment: Mada card, STC Pay
- URL: ahkacademy.com/sa
- Price: SAR 75/month (~£16)

### Phase 4: Egypt, Bangladesh, Malaysia...
- Same playbook repeated
- 2–3 weeks to launch each new country
- Translate content, add local payment, local SEO

### Combined Revenue Projection (Year 2)
| Country | Students | Monthly Revenue |
|---------|----------|----------------|
| Turkey | 25,000 | ₺12,500,000 (~£350k) |
| Pakistan | 20,000 | PKR 60M (~£165k) |
| Saudi Arabia | 5,000 | SAR 375,000 (~£80k) |
| **Total** | **50,000** | **~£595,000/month** |

---

# PART 9: DAILY & WEEKLY CHECKLISTS

## Every Morning (Monday–Friday)

- [ ] Check Railway dashboard — is the site up and green?
- [ ] Check for any student error reports or emails
- [ ] Pull latest code: `git pull origin main`
- [ ] Start local server: `python app.py`
- [ ] Check site at localhost:5000

## Every Working Session

- [ ] Open Claude Code in VS Code
- [ ] Work on current week's task (refer to Month plan above)
- [ ] Test new feature locally
- [ ] Commit and push: `git add . → git commit -m "description" → git push`
- [ ] Verify live at ahkacademy.com within 60 seconds

## Every Week

- [ ] Count new student registrations
- [ ] Check revenue in Stripe + iyzico dashboards
- [ ] Fix any bugs reported by students
- [ ] Publish 1 blog post (for SEO)
- [ ] Post 2 YouTube videos
- [ ] Post daily on Instagram/TikTok
- [ ] Plan next week's features with Ahsan

## Every Month

- [ ] Download revenue report (Stripe + iyzico)
- [ ] Compare students this month vs last month
- [ ] Review top blog posts in Google Search Console
- [ ] Upgrade Railway/Supabase plan if approaching limits
- [ ] Plan next month's content calendar
- [ ] Review ad spend vs student acquisition cost

---

# PART 10: CREDENTIALS — SAVE SECURELY

**Use Bitwarden (free) to store all passwords securely.**

```
GitHub
  Username: _______________
  Password: _______________

Railway
  Login: via GitHub

Supabase
  Email: _______________
  Project name: ahk-academy
  Database URL: _______________
  Database password: _______________

Upstash Redis
  URL: _______________
  Token: _______________

Cloudflare
  Email: _______________
  Password: _______________

Namecheap
  Username: _______________
  Password: _______________
  Domain: ahkacademy.com
  Renewal date: _______________

Stripe
  Email: _______________
  Secret key: _______________

iyzico
  API Key: _______________
  Secret key: _______________

Resend
  API Key: _______________

Claude Code / Anthropic
  Email: _______________
  API Key: _______________
```

---

# PART 11: TROUBLESHOOTING

## Site is Down
1. Go to railway.app → your project → check status
2. Click "View Logs" → read error
3. Tell Claude Code: "Railway shows this error: [paste it]"

## Student Reports a Bug
1. Ask them for exact error message or screenshot
2. Try to reproduce it yourself with a test account
3. Tell Claude Code: "Student gets this error when doing X: [describe]"

## Database Full (Supabase free limit is 500MB)
1. Go to supabase.com → Storage usage
2. If over 400MB, upgrade to $25/month paid plan
3. Tell Claude Code to add indexes if queries are slow

## Payments Failing
1. Check Stripe dashboard → Payments → Failed
2. Check iyzico dashboard for Turkish payment errors
3. Tell Claude Code: "Payments failing with this error: [paste]"

## How to Add a New Teacher Account
1. Login as Admin at ahkacademy.com/admin
2. Users → Add User → Role: Teacher
3. Enter email and temporary password
4. Teacher logs in and changes password

---

# PART 12: HOW TO USE CLAUDE CODE EFFECTIVELY

## Opening Claude Code
Press Ctrl+Shift+P in VS Code → type "Claude" → open chat
OR click Claude icon in left sidebar

## Writing Good Prompts

**For new features:**
> "Add [specific feature] at [URL/location].
> It should do [exact behaviour].
> [User type] can [action].
> Store [data] in the database."

**For bug fixes:**
> "I get this error: [paste full error message]
> It happens when I [describe what you did].
> Here is the relevant code: [paste code or filename]"

**For improvements:**
> "The [page/feature] is slow/ugly/confusing.
> Can you [specific improvement]?"

**For checking work:**
> "Review the login system for security issues"
> "Is the database design correct for 100,000 students?"
> "What would make the homepage convert more visitors to signups?"

## The Golden Rule
**Never say "make it better" — always say exactly what you want.**
Claude will do precisely what you ask, so be specific.

---

# SUMMARY: THE PATH TO 10,000 STUDENTS

```
WEEK 1  ──  ahkacademy.com live, anyone can visit
WEEK 2  ──  Login working, students can create accounts  
WEEK 3  ──  Homepage looks professional, ready to share
WEEK 4  ──  50 beta students testing and giving feedback
WEEK 8  ──  IELTS + TOEFL + Blog live, real content to study
WEEK 12 ──  Practice tests + games, students coming back daily
WEEK 16 ──  Stripe + iyzico live, first ₺500 payments arriving
WEEK 20 ──  SEO bringing 20,000 visitors/month from Google
WEEK 24 ──  10,000 paying students, ₺5M/month revenue
```

**The code is easy — Claude writes it.**
**The content is the work — teach well and post consistently.**
**The students will come.**

---

*Document prepared by Claude Code for AHK Academy*
*Owner: Ahsan Hussain Khan*
*Created: May 2026*
