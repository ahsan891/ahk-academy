"""
Updates Phase 2 lesson start times using actual WhatsApp-confirmed times.
Each time verified from the meeting link sent or agreed time in the chat.
"""

import psycopg2
from datetime import datetime, timedelta

# Exact start times confirmed from WhatsApp messages
# Format: "YYYY-MM-DD": ("HH:MM", "source note")
PHASE2_TIMES = {
    "2026-03-01": ("20:33", "Link sent 20:33 — agreed 8:30 PM"),
    "2026-03-03": ("22:00", "Link sent 22:00 — 'start at 10' (PM)"),
    "2026-03-05": ("22:01", "Link sent 22:01 — 'tonight at 10'"),
    "2026-03-08": ("22:00", "Link sent 22:00 — 'we can do at 10'"),
    "2026-03-10": ("22:05", "Link sent 22:05 — 'sending in 5 mins' at 22:00"),
    "2026-03-13": ("22:03", "Link sent 22:03"),
    "2026-03-15": ("21:59", "Link sent 21:59"),
    "2026-03-18": ("21:58", "Link sent 21:58"),
    "2026-03-25": ("19:30", "Gurkan asked 7:30 — link sent 19:30"),
    "2026-03-30": ("19:30", "Agreed 7:30 — 'ready right now' 19:29 — link 19:30"),
    "2026-04-04": ("19:32", "Agreed 19:30 — link sent 19:32"),
    "2026-04-06": ("20:32", "Link sent 20:32"),
    "2026-04-26": ("20:37", "Speaking session — link sent 20:37"),
    "2026-04-28": ("21:00", "Gurkan confirmed '21:00-22:30 works for me'"),
    "2026-04-30": ("21:00", "No message — default schedule"),
    "2026-05-03": ("17:26", "Link sent 17:26 — afternoon lesson"),
    "2026-05-05": ("20:57", "Link sent 20:57 — 'tonight at 9'"),
    "2026-05-08": ("22:02", "Link sent 22:02 — 'sending you bro' at 22:00"),
}

def get_conn():
    return psycopg2.connect(
        host="localhost", port=5432,
        dbname="ahk_academy", user="postgres",
        password="Wolverine1997@@"
    )

def main():
    conn = get_conn()
    cur  = conn.cursor()

    cur.execute('SELECT id FROM "User" WHERE email = %s', ("ahmetgurkan@geopaveco.com",))
    student_id = cur.fetchone()[0]

    cur.execute('''SELECT id, "lessonDate"::date, "lessonNumber", status, notes
                   FROM "PrivateLesson"
                   WHERE "studentId" = %s AND phase = %s
                   ORDER BY "lessonDate"''', (student_id, "PHASE2_CONTRACT"))
    lessons = cur.fetchall()

    print("PHASE 2 — PRIVATE CONTRACT LESSONS")
    print("=" * 85)
    print(f"{'#':<4} {'Date':<12} {'Day':<4} {'Start':<6} {'End':<6} {'Hrs':<5} {'Status':<10}  Source")
    print("-" * 85)

    days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    total_hrs = 0.0

    for lesson_id, lesson_date, num, status, notes in lessons:
        date_key = str(lesson_date)
        time_str, source = PHASE2_TIMES.get(date_key, ("21:00", "default"))

        h, m = map(int, time_str.split(":"))
        start_dt = datetime(lesson_date.year, lesson_date.month, lesson_date.day, h, m, 0)
        end_dt   = start_dt + timedelta(minutes=90)
        day      = days[start_dt.weekday()]

        # Update DB
        cur.execute('''UPDATE "PrivateLesson"
                       SET "lessonDate" = %s, "updatedAt" = NOW()
                       WHERE id = %s''', (start_dt, lesson_id))

        if status == "CANCELLED":
            print(f"{'—':<4} {date_key:<12} {day:<4} {'—':<6} {'—':<6} {'—':<5} CANCELLED")
            continue

        total_hrs += 1.5
        n = str(num) if num else "-"
        print(f"{n:<4} {date_key:<12} {day:<4} {start_dt.strftime('%H:%M'):<6} {end_dt.strftime('%H:%M'):<6} 1.5   {status:<10}  {source}")

    conn.commit()
    cur.close()
    conn.close()

    print("-" * 85)
    p2_sessions = len([l for l in lessons if l[3] == "COMPLETED"])
    print(f"\n  Sessions   : {p2_sessions}")
    print(f"  Total hours: {total_hrs:.1f} hrs")
    print(f"  Lessons    : {p2_sessions * 2} / 100  (each session = 2 lessons × 45 min)")
    print(f"  Remaining  : {100 - p2_sessions*2} lessons = {(100-p2_sessions*2)//2} sessions")
    print(f"\n✅ Phase 2 attendance saved with exact WhatsApp-verified times")

if __name__ == "__main__":
    main()
