"""
Correction script for Ahmet Gürkan — fixes all auto-imported data.

Changes:
  - Re-imports WhatsApp chat from newer file (778 lines, up to 2026-05-18)
  - Deletes wrong 80,000 TRY payment, inserts correct installment plan
  - Inserts all lesson records (Phase 1 + Phase 2) with correct dates
  - Updates StudentProfile notes with correct payment + lesson summary

Run from ahk-academy directory:
    python scripts/fix_gurkan.py
"""

import os
import re
import json
import psycopg2
from datetime import datetime, date
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────

STUDENT_FOLDER = Path(r"C:\Users\ahk79\AHK_Academy\STUDENTS\Gurkan")
WHATSAPP_FILE  = STUDENT_FOLDER / "WhatsApp_New" / "WhatsApp Chat with Gurkan.txt"

# ── Correct attendance records (as provided by Ahsan) ─────────────────────────
#
# Phase 1 — pre-contract (2025, at Amerikanca Kültür / early private)
PHASE1_LESSONS = [
    {"date": date(2025, 11, 21), "status": "COMPLETED"},
    {"date": date(2025, 11, 24), "status": "COMPLETED"},
    {"date": date(2025, 11, 28), "status": "COMPLETED"},
    {"date": date(2025, 12,  5), "status": "COMPLETED"},
    {"date": date(2025, 12,  8), "status": "COMPLETED"},
    {"date": date(2025, 12, 12), "status": "CANCELLED"},
    {"date": date(2025, 12, 15), "status": "COMPLETED"},
    {"date": date(2025, 12, 29), "status": "COMPLETED"},
]

# Phase 2 — private contract (2026)
# "2 lessons finished yusra" x2 = 4 joint sessions with Yusra Khan (late April / May 1)
PHASE2_LESSONS = [
    {"date": date(2026,  3,  1), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  3,  3), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  3,  5), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  3,  8), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  3, 10), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  3, 13), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  3, 15), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  3, 18), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  3, 25), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  3, 30), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  4,  4), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  4,  6), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  4, 26), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  4, 28), "status": "COMPLETED", "notes": "Joint session with Yusra Khan"},
    {"date": date(2026,  4, 30), "status": "COMPLETED", "notes": "Joint session with Yusra Khan"},
    {"date": date(2026,  5,  3), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  5,  5), "status": "COMPLETED", "notes": None},
    {"date": date(2026,  5,  8), "status": "COMPLETED", "notes": None},
]

# ── Payment Plan (correct installment data) ───────────────────────────────────
#
# Total agreed : 80,000 TRY for 100 lessons (800 TRY/lesson)
# Paid so far  : 2 × 20,000 TRY = 40,000 TRY
# Remaining    : 2 × 20,000 TRY (one installment every 25 lessons)
PAYMENT_PLAN = {
    "planType":  "INSTALLMENT",
    "amount":    80000.0,
    "currency":  "TRY",
    "notes": (
        "100 lessons × 800 TRY = 80,000 TRY total. "
        "Installment plan: 20,000 TRY per 25 lessons. "
        "40,000 TRY paid (lessons 1-50 covered). "
        "20,000 TRY due at lesson 51, 20,000 TRY due at lesson 76. "
        "IBAN: TR82 0001 5001 5800 7320 4814 75 (Geopaveco)"
    ),
}

PAYMENTS_MADE = [
    {
        "amount": 20000.0,
        "confirmedAt": datetime(2026, 2, 27),
        "description": "Installment 1/4 — lessons 1-25 (20,000 TRY via IBAN)",
        "referenceCode": "GRK-INST1-20260227",
    },
    {
        "amount": 20000.0,
        "confirmedAt": datetime(2026, 3, 31),
        "description": "Installment 2/4 — lessons 26-50 (20,000 TRY via IBAN)",
        "referenceCode": "GRK-INST2-20260331",
    },
]

# ── DB ────────────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(
        host="localhost", port=5432,
        dbname="ahk_academy", user="postgres",
        password="Wolverine1997@@"
    )

# ── WhatsApp parser ───────────────────────────────────────────────────────────

def parse_whatsapp(filepath):
    messages = []
    pattern = re.compile(
        r'^(\d{1,2}/\d{1,2}/\d{2,4}),\s*(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*([^:]+):\s*(.+)$'
    )
    with open(filepath, encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            m = pattern.match(line)
            if m:
                date_str, time_str, sender, content = m.groups()
                for fmt in ("%m/%d/%y %I:%M %p", "%m/%d/%Y %I:%M %p"):
                    try:
                        dt = datetime.strptime(f"{date_str} {time_str}", fmt)
                        break
                    except ValueError:
                        dt = None
                if dt:
                    messages.append({
                        "sent_at": dt,
                        "sender": sender.strip(),
                        "content": content.strip(),
                        "direction": "outbound" if sender.strip() == "Ahsan" else "inbound",
                    })
    return messages

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    import uuid

    print("=" * 60)
    print("AHK Academy — Gurkan Data CORRECTION")
    print("=" * 60)

    conn = get_conn()
    cur  = conn.cursor()

    # ── Get student ID ────────────────────────────────────────────────────────
    cur.execute('SELECT id FROM "User" WHERE email = %s', ("ahmetgurkan@geopaveco.com",))
    row = cur.fetchone()
    if not row:
        print("ERROR: Gurkan not found — run import_gurkan.py first")
        return
    student_id = row[0]
    print(f"\nStudent ID: {student_id}")

    # ── 1. Fix WhatsApp messages ──────────────────────────────────────────────
    print("\n[1/4] Re-importing WhatsApp messages from new file...")

    messages = parse_whatsapp(WHATSAPP_FILE)
    print(f"    Parsed {len(messages)} messages (up to 2026-05-18)")

    cur.execute('SELECT id FROM "WhatsappConversation" WHERE "userId" = %s', (student_id,))
    convo_row = cur.fetchone()

    if convo_row:
        convo_id = convo_row[0]
        cur.execute('DELETE FROM "WhatsappMessage" WHERE "conversationId" = %s', (convo_id,))
        cur.execute("""
            UPDATE "WhatsappConversation"
            SET "lastMessageAt" = %s
            WHERE id = %s
        """, (messages[-1]["sent_at"] if messages else datetime.now(), convo_id))
        print(f"    Cleared old messages from conversation {convo_id}")
    else:
        convo_id = str(uuid.uuid4())[:25]
        cur.execute("""
            INSERT INTO "WhatsappConversation"
            (id, "phoneNumber", "userId", "conversationType", "lastMessageAt", "isActive", "createdAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            convo_id, "gurkan_ahmet", student_id, "STUDENT",
            messages[-1]["sent_at"] if messages else datetime.now(), True,
            messages[0]["sent_at"] if messages else datetime.now()
        ))

    for msg in messages:
        msg_id = str(uuid.uuid4())[:25]
        cur.execute("""
            INSERT INTO "WhatsappMessage"
            (id, "conversationId", direction, content, "messageType", "sentAt")
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (msg_id, convo_id, msg["direction"], msg["content"], "TEXT", msg["sent_at"]))

    print(f"    ✓ {len(messages)} messages imported (latest: 2026-05-18)")

    # ── 2. Fix payment records ────────────────────────────────────────────────
    print("\n[2/4] Fixing payment records...")

    # Delete old wrong payment plan + transactions
    cur.execute('SELECT id FROM "PaymentPlan" WHERE "studentId" = %s', (student_id,))
    old_plans = cur.fetchall()
    for (old_id,) in old_plans:
        cur.execute('DELETE FROM "PaymentTransaction" WHERE "paymentPlanId" = %s', (old_id,))
        cur.execute('DELETE FROM "PaymentPlan" WHERE id = %s', (old_id,))
    print(f"    Removed {len(old_plans)} old payment plan(s)")

    plan_id = str(uuid.uuid4())[:25]
    cur.execute("""
        INSERT INTO "PaymentPlan"
        (id, "studentId", "planType", amount, currency, notes, "isActive", "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
    """, (
        plan_id, student_id,
        PAYMENT_PLAN["planType"],
        PAYMENT_PLAN["amount"],
        PAYMENT_PLAN["currency"],
        PAYMENT_PLAN["notes"],
        True
    ))

    for p in PAYMENTS_MADE:
        tx_id = str(uuid.uuid4())[:25]
        cur.execute("""
            INSERT INTO "PaymentTransaction"
            (id, "studentId", "paymentPlanId", amount, currency, method, status,
             "referenceCode", "confirmedAt", description, "createdAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            tx_id, student_id, plan_id,
            p["amount"], "TRY", "IBAN", "CONFIRMED",
            p["referenceCode"], p["confirmedAt"], p["description"], p["confirmedAt"]
        ))
        print(f"    ✓ Payment: {p['amount']:,.0f} TRY on {p['confirmedAt'].date()} — {p['description']}")

    # ── 3. Insert lesson records ──────────────────────────────────────────────
    print("\n[3/4] Inserting lesson records...")

    # Clear existing PrivateLesson records for this student
    cur.execute('DELETE FROM "PrivateLesson" WHERE "studentId" = %s', (student_id,))

    p1_num = 0
    for lesson in PHASE1_LESSONS:
        if lesson["status"] == "COMPLETED":
            p1_num += 1
        lesson_id = str(uuid.uuid4())[:25]
        cur.execute("""
            INSERT INTO "PrivateLesson"
            (id, "studentId", "lessonDate", status, phase, "lessonNumber",
             "lessonsCount", "durationMins", notes, "createdAt", "updatedAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            lesson_id, student_id,
            datetime.combine(lesson["date"], datetime.min.time()),
            lesson["status"],
            "PHASE1_PRECONTRACT",
            p1_num if lesson["status"] == "COMPLETED" else None,
            2, 90,
            lesson.get("notes"),
        ))

    p2_num = 0
    for lesson in PHASE2_LESSONS:
        if lesson["status"] == "COMPLETED":
            p2_num += 1
        lesson_id = str(uuid.uuid4())[:25]
        cur.execute("""
            INSERT INTO "PrivateLesson"
            (id, "studentId", "lessonDate", status, phase, "lessonNumber",
             "lessonsCount", "durationMins", notes, "createdAt", "updatedAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            lesson_id, student_id,
            datetime.combine(lesson["date"], datetime.min.time()),
            lesson["status"],
            "PHASE2_CONTRACT",
            p2_num if lesson["status"] == "COMPLETED" else None,
            2, 90,
            lesson.get("notes"),
        ))

    p1_sessions = sum(1 for l in PHASE1_LESSONS if l["status"] == "COMPLETED")
    p1_cancel   = sum(1 for l in PHASE1_LESSONS if l["status"] == "CANCELLED")
    p2_sessions = sum(1 for l in PHASE2_LESSONS if l["status"] == "COMPLETED")
    p2_cancel   = sum(1 for l in PHASE2_LESSONS if l["status"] == "CANCELLED")
    p1_done     = p1_sessions * 2  # 2 lessons per session
    p2_done     = p2_sessions * 2  # 2 lessons per session

    print(f"    Phase 1 (pre-contract): {p1_sessions} sessions = {p1_done} lessons, {p1_cancel} cancelled")
    print(f"    Phase 2 (contract):     {p2_sessions} sessions = {p2_done} lessons, {p2_cancel} cancelled")
    print(f"    Lessons against 100-pack: {p2_done} done, {100 - p2_done} remaining")

    # ── 4. Update StudentProfile notes ───────────────────────────────────────
    print("\n[4/4] Updating StudentProfile notes...")

    summary = {
        "updated": "2026-05-18",
        "payment": {
            "plan": "INSTALLMENT",
            "total_agreed_try": 80000,
            "paid_try": 40000,
            "remaining_try": 40000,
            "installment_size": 20000,
            "installments_paid": 2,
            "installments_remaining": 2,
            "trigger": "every 25 lessons",
            "next_due": "after lesson 51 (due ~2026-06)",
        },
        "lessons": {
            "lessons_per_session": 2,
            "session_duration_mins": 90,
            "phase1_sessions": p1_sessions,
            "phase1_lessons": p1_done,
            "phase1_cancelled_sessions": p1_cancel,
            "phase2_sessions": p2_sessions,
            "phase2_lessons": p2_done,
            "phase2_cancelled_sessions": p2_cancel,
            "contract_lessons_remaining": 100 - p2_done,
            "contract_sessions_remaining": (100 - p2_done) // 2,
            "last_session": str(max(l["date"] for l in PHASE2_LESSONS if l["status"] == "COMPLETED")),
        },
        "whatsapp": {
            "messages": len(messages),
            "last_message": str(messages[-1]["sent_at"].date()) if messages else None,
        }
    }

    correct_notes = (
        "Target: C2. 100 lessons agreed @ 800 TRY/lesson = 80,000 TRY total.\n"
        "Contract signed: 2026-02-27. Geopaveco company, civil/structural engineering professional.\n"
        "Preferred schedule: Mon/Wed/Sat 21:00–22:30 (Microsoft Teams).\n"
        "Pre-contract lessons at Amerikanca Kültür: Nov-Dec 2025.\n\n"
        f"LESSON & PAYMENT SUMMARY (updated {summary['updated']}):\n"
        f"{json.dumps(summary, indent=2, ensure_ascii=False)}"
    )

    cur.execute("""
        UPDATE "StudentProfile" SET notes = %s, "updatedAt" = NOW()
        WHERE "userId" = %s
    """, (correct_notes, student_id))

    conn.commit()
    cur.close()
    conn.close()

    print("\n" + "=" * 60)
    print("✅ CORRECTION COMPLETE — Ahmet Gürkan")
    print("=" * 60)
    print(f"  WhatsApp messages : {len(messages)} (up to 2026-05-18)")
    print(f"  Phase 1           : {p1_sessions} sessions = {p1_done} lessons + {p1_cancel} cancelled")
    print(f"  Phase 2           : {p2_sessions} sessions = {p2_done} / 100 lessons")
    print(f"  Contract remaining: {100 - p2_done} lessons ({(100-p2_done)//2} sessions)")
    print(f"  Paid              : 40,000 TRY (2 × 20,000)")
    print(f"  Remaining debt    : 40,000 TRY (2 × 20,000 — every 25 lessons)")
    print("=" * 60)
    print("\nOpen TablePlus → PrivateLesson table to verify attendance records")

if __name__ == "__main__":
    main()
