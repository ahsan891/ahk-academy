"""
Import script for Ahmet Gürkan — AHK Academy student data importer.
Reads WhatsApp chat, agreement, homework, and meeting transcript,
then inserts everything into the PostgreSQL database.

Run from the ahk-academy directory:
    python scripts/import_gurkan.py
"""

import os
import re
import json
import psycopg2
from datetime import datetime, date
from pathlib import Path
import sys

# ── Config ────────────────────────────────────────────────────────────────────

DB_URL = "postgresql://postgres:Wolverine1997@@localhost:5432/ahk_academy"
STUDENT_FOLDER = Path(r"C:\Users\ahk79\AHK_Academy\STUDENTS\Gurkan")
WHATSAPP_FILE  = STUDENT_FOLDER / "WhatsApp Chat with Gurkan" / "WhatsApp Chat with Gurkan.txt"

# ── DB Connection ─────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(
        host="localhost", port=5432,
        dbname="ahk_academy", user="postgres",
        password="Wolverine1997@@"
    )

# ── Parse WhatsApp Chat ───────────────────────────────────────────────────────

def parse_whatsapp(filepath):
    """Parse WhatsApp export .txt into list of message dicts."""
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
                try:
                    dt = datetime.strptime(f"{date_str} {time_str}", "%m/%d/%y %I:%M %p")
                except ValueError:
                    try:
                        dt = datetime.strptime(f"{date_str} {time_str}", "%m/%d/%Y %I:%M %p")
                    except ValueError:
                        continue
                messages.append({
                    "sent_at": dt,
                    "sender": sender.strip(),
                    "content": content.strip(),
                    "direction": "outbound" if sender.strip() == "Ahsan" else "inbound"
                })
    return messages

# ── Extract Lesson Dates from WhatsApp ───────────────────────────────────────

def extract_lesson_dates(messages):
    """Find dates where a Google Meet or Teams link was sent = lesson happened."""
    lessons = []
    meet_pattern = re.compile(r'https://(meet\.google\.com|teams\.microsoft\.com)/\S+')
    for msg in messages:
        if meet_pattern.search(msg["content"]):
            lessons.append({
                "date": msg["sent_at"].date(),
                "platform": "Google Meet" if "meet.google" in msg["content"] else "Microsoft Teams",
                "link": meet_pattern.search(msg["content"]).group(0)
            })
    return lessons

# ── Main Import ───────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("AHK Academy — Gurkan Data Import")
    print("=" * 60)

    conn = get_conn()
    cur  = conn.cursor()

    # ── 1. Create student profile ─────────────────────────────────────────────
    print("\n[1/5] Creating student profile...")

    cur.execute("SELECT id FROM \"User\" WHERE email = %s", ("ahmetgurkan@geopaveco.com",))
    existing = cur.fetchone()

    if existing:
        student_id = existing[0]
        print(f"    ✓ Student already exists: {student_id}")
    else:
        import uuid, hashlib
        student_id = str(uuid.uuid4())[:25]

        cur.execute("""
            INSERT INTO "User" (id, name, email, password, role, phone, country, language, "createdAt", "updatedAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            student_id,
            "Ahmet Gürkan",
            "ahmetgurkan@geopaveco.com",
            hashlib.sha256(b"changeme123").hexdigest(),  # placeholder password
            "STUDENT",
            None,
            "Turkey",
            "Turkish"
        ))
        print(f"    ✓ Student created: Ahmet Gürkan (id: {student_id})")

    # ── 2. Create StudentProfile ──────────────────────────────────────────────
    print("\n[2/5] Creating student profile details...")

    cur.execute('SELECT id FROM "StudentProfile" WHERE "userId" = %s', (student_id,))
    if not cur.fetchone():
        profile_id = str(uuid.uuid4())[:25]
        cur.execute("""
            INSERT INTO "StudentProfile" (id, "userId", "trackType", level, "isActive", notes, "enrolledAt", "createdAt", "updatedAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            profile_id,
            student_id,
            "ONE_ON_ONE",
            "B2",
            True,
            "Target: C2. 100 lessons agreed. 80,000 TL paid upfront on 2026-02-27. "
            "Contract signed 2026-01-05. Geopaveco company, engineering professional. "
            "Preferred schedule: Mon/Wed/Sat 21:00-22:30.",
            datetime(2025, 10, 14)  # first contact date
        ))
        print(f"    ✓ Profile created: B2 level, target C2, 100 lessons")
    else:
        print(f"    ✓ Profile already exists")

    # ── 3. Create PaymentPlan & Transaction ───────────────────────────────────
    print("\n[3/5] Recording payment...")

    cur.execute('SELECT id FROM "PaymentPlan" WHERE "studentId" = %s', (student_id,))
    if not cur.fetchone():
        plan_id = str(uuid.uuid4())[:25]
        cur.execute("""
            INSERT INTO "PaymentPlan" (id, "studentId", "planType", amount, currency, notes, "isActive", "createdAt", "updatedAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, NOW(), NOW())
        """, (
            plan_id,
            student_id,
            "FULL_UPFRONT",
            80000.0,
            "TRY",
            "100 lessons @ 800 TL each = 80,000 TL. Special discount plan. "
            "Paid in full on 2026-02-27 via IBAN TR82 0001 5001 5800 7320 4814 75"
        ,
            True
        ))

        tx_id = str(uuid.uuid4())[:25]
        import random, string
        ref_code = "GRK-" + ''.join(random.choices(string.ascii_uppercase + string.digits, k=8))
        cur.execute("""
            INSERT INTO "PaymentTransaction"
            (id, "studentId", "paymentPlanId", amount, currency, method, status,
             "referenceCode", "confirmedAt", description, "createdAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (
            tx_id, student_id, plan_id,
            80000.0, "TRY", "IBAN", "CONFIRMED",
            ref_code,
            datetime(2026, 2, 27),
            "Full payment for 100-lesson package",
            datetime(2026, 2, 27)
        ))
        print(f"    ✓ Payment recorded: 80,000 TRY on 2026-02-27 (ref: {ref_code})")
    else:
        print(f"    ✓ Payment already recorded")

    # ── 4. Import WhatsApp messages ───────────────────────────────────────────
    print("\n[4/5] Importing WhatsApp chat...")

    messages = parse_whatsapp(WHATSAPP_FILE)
    print(f"    Found {len(messages)} messages")

    cur.execute('SELECT id FROM "WhatsappConversation" WHERE "phoneNumber" = %s', ("gurkan_ahmet",))
    convo = cur.fetchone()

    if not convo:
        convo_id = str(uuid.uuid4())[:25]
        cur.execute("""
            INSERT INTO "WhatsappConversation"
            (id, "phoneNumber", "userId", "conversationType", "lastMessageAt", "isActive", "createdAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (
            convo_id, "gurkan_ahmet", student_id,
            "STUDENT", messages[-1]["sent_at"] if messages else datetime.now(), True,
            messages[0]["sent_at"] if messages else datetime.now()
        ))
        print(f"    ✓ Conversation created")
    else:
        convo_id = convo[0]
        print(f"    ✓ Conversation already exists")

    cur.execute('SELECT COUNT(*) FROM "WhatsappMessage" WHERE "conversationId" = %s', (convo_id,))
    existing_count = cur.fetchone()[0]

    if existing_count == 0:
        for msg in messages:
            msg_id = str(uuid.uuid4())[:25]
            cur.execute("""
                INSERT INTO "WhatsappMessage"
                (id, "conversationId", direction, content, "messageType", "sentAt")
                VALUES (%s, %s, %s, %s, %s, %s)
            """, (
                msg_id, convo_id,
                msg["direction"], msg["content"], "TEXT", msg["sent_at"]
            ))
        print(f"    ✓ {len(messages)} messages imported")
    else:
        print(f"    ✓ Messages already imported ({existing_count} existing)")

    # ── 5. Record lesson attendance ───────────────────────────────────────────
    print("\n[5/5] Recording lesson attendance...")

    lesson_dates = extract_lesson_dates(messages)
    print(f"    Found {len(lesson_dates)} lessons from meeting links")

    # Label Phase 1 (pre-contract) and Phase 2 (contract)
    contract_start = date(2026, 3, 1)
    phase1 = [l for l in lesson_dates if l["date"] < contract_start]
    phase2 = [l for l in lesson_dates if l["date"] >= contract_start]

    print(f"    Phase 1 (pre-contract): {len(phase1)} lessons")
    print(f"    Phase 2 (active contract): {len(phase2)} lessons")
    print(f"    Lessons remaining under contract: {100 - len(phase2)} of 100")

    # Summary JSON saved to DB notes
    summary = {
        "total_lessons": len(lesson_dates),
        "phase1_precontract": len(phase1),
        "phase2_contract": len(phase2),
        "lessons_remaining": 100 - len(phase2),
        "lesson_dates": [str(l["date"]) for l in lesson_dates],
        "last_lesson": str(lesson_dates[-1]["date"]) if lesson_dates else None
    }

    cur.execute("""
        UPDATE "StudentProfile"
        SET notes = notes || %s
        WHERE "userId" = %s
    """, (
        f"\n\nLESSON SUMMARY (auto-imported):\n{json.dumps(summary, indent=2)}",
        student_id
    ))

    conn.commit()
    cur.close()
    conn.close()

    print("\n" + "=" * 60)
    print("✅ IMPORT COMPLETE — Ahmet Gürkan")
    print("=" * 60)
    print(f"  Student ID   : {student_id}")
    print(f"  Level        : B2 → C2")
    print(f"  Total lessons: {len(lesson_dates)}")
    print(f"  Contract start: 2026-03-01")
    print(f"  Lessons done : {len(phase2)} / 100")
    print(f"  Remaining    : {100 - len(phase2)} lessons")
    print(f"  Payment      : 80,000 TRY ✅ CONFIRMED")
    print(f"  WhatsApp msgs: {len(messages)}")
    print(f"\n  Open TablePlus → ahk_academy → User table to see Gurkan")
    print("=" * 60)

if __name__ == "__main__":
    main()
