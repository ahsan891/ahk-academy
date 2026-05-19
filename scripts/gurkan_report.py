import psycopg2

conn = psycopg2.connect(host='localhost', port=5432, dbname='ahk_academy',
                        user='postgres', password='Wolverine1997@@')
cur = conn.cursor()

cur.execute('SELECT id, name, email, country, language FROM "User" WHERE email = %s',
            ('ahmetgurkan@geopaveco.com',))
u = cur.fetchone()
uid = u[0]

cur.execute('SELECT level, "trackType", "isActive", "enrolledAt" FROM "StudentProfile" WHERE "userId" = %s', (uid,))
prof = cur.fetchone()

cur.execute('SELECT "planType", amount, currency, notes FROM "PaymentPlan" WHERE "studentId" = %s', (uid,))
plan = cur.fetchone()

cur.execute('''SELECT amount, currency, status, "confirmedAt", description
               FROM "PaymentTransaction" WHERE "studentId" = %s ORDER BY "confirmedAt"''', (uid,))
payments = cur.fetchall()

cur.execute('''SELECT phase, status, COUNT(*), MIN("lessonDate")::date, MAX("lessonDate")::date
               FROM "PrivateLesson" WHERE "studentId" = %s
               GROUP BY phase, status ORDER BY phase, status''', (uid,))
lesson_summary = cur.fetchall()

cur.execute('''SELECT "lessonDate"::date, phase, status, "lessonNumber", notes,
               "meetingLink" IS NOT NULL, "transcriptText" IS NOT NULL
               FROM "PrivateLesson" WHERE "studentId" = %s ORDER BY "lessonDate"''', (uid,))
all_lessons = cur.fetchall()

cur.execute('''SELECT COUNT(*), MIN("sentAt")::date, MAX("sentAt")::date
               FROM "WhatsappMessage" wm
               JOIN "WhatsappConversation" wc ON wm."conversationId" = wc.id
               WHERE wc."userId" = %s''', (uid,))
wa = cur.fetchone()

cur.execute('''SELECT ss.topic, ss.date::date, ss.duration
               FROM "SpeakingSession" ss
               JOIN "SessionParticipant" sp ON ss.id = sp."sessionId"
               WHERE sp."studentId" = %s ORDER BY ss.date''', (uid,))
sessions = cur.fetchall()

cur.close()
conn.close()

# ── Print report ──────────────────────────────────────────────────────────────
print("=" * 60)
print("GURKAN — FULL PROFILE REPORT")
print("=" * 60)

print(f"\n[ STUDENT ]")
print(f"  Name     : {u[1]}")
print(f"  Email    : {u[2]}")
print(f"  Country  : {u[3]}")
print(f"  Language : {u[4]}")
print(f"  Level    : {prof[0]}  →  Target: C2")
print(f"  Track    : {prof[1]}")
print(f"  Active   : {prof[2]}")

print(f"\n[ PAYMENT ]")
print(f"  Plan      : {plan[0]}  |  Total agreed: {plan[1]:,.0f} {plan[2]}")
total_paid = sum(p[0] for p in payments if p[2] == 'CONFIRMED')
print(f"  Paid so far : {total_paid:,.0f} TRY")
for p in payments:
    print(f"    • {p[3].date() if p[3] else '?'}  {p[0]:>8,.0f} TRY  [{p[2]}]  {p[4]}")
remaining = plan[1] - total_paid
print(f"  Remaining : {remaining:,.0f} TRY  ({int(remaining/20000)} installments of 20,000 TRY)")

print(f"\n[ LESSONS ]")
p1_done = p1_cancel = p2_done = p2_cancel = 0
for row in lesson_summary:
    phase, status, count, first, last = row
    label = "Pre-contract" if "PHASE1" in phase else "Contract (100-pack)"
    print(f"  {label:<22} {status:<10} {count:>3} sessions  ({first} → {last})")
    if "PHASE1" in phase and status == "COMPLETED": p1_done = count
    if "PHASE1" in phase and status == "CANCELLED": p1_cancel = count
    if "PHASE2" in phase and status == "COMPLETED": p2_done = count
    if "PHASE2" in phase and status == "CANCELLED": p2_cancel = count

p1_lessons = p1_done * 2
p2_lessons = p2_done * 2
print(f"\n  Phase 1 total  : {p1_done} sessions = {p1_lessons} lessons  (+{p1_cancel} cancelled)")
print(f"  Phase 2 total  : {p2_done} sessions = {p2_lessons} / 100 lessons")
print(f"  Remaining      : {100 - p2_lessons} lessons = {(100-p2_lessons)//2} sessions")
print(f"  Next payment   : after lesson 50  (14 more lessons / 7 sessions away)")

has_rec = sum(1 for l in all_lessons if l[5])
has_tx  = sum(1 for l in all_lessons if l[6])
print(f"\n  Recordings linked   : {has_rec} lessons")
print(f"  Transcripts linked  : {has_tx} lessons")

print(f"\n[ SPEAKING SESSIONS ]")
if sessions:
    for s in sessions:
        print(f"  • {s[1]}  {s[0]}  ({s[2]} min)")
else:
    print("  None recorded yet")

print(f"\n[ WHATSAPP ]")
print(f"  Messages : {wa[0]}  ({wa[1]} → {wa[2]})")

print(f"\n[ ALL LESSONS ]")
print(f"  {'Date':<12} {'Phase':<8} {'Status':<10} {'#':<4} {'Rec':<4} {'Tx':<4}  Notes")
print(f"  {'-'*65}")
for l in all_lessons:
    dt, phase, status, num, notes, has_r, has_t = l
    ph = "P1" if "PHASE1" in phase else "P2"
    r = "✓" if has_r else "-"
    t = "✓" if has_t else "-"
    n = notes[:35] if notes else ""
    print(f"  {str(dt):<12} {ph:<8} {status:<10} {str(num or ''):<4} {r:<4} {t:<4}  {n}")

print("\n" + "=" * 60)
