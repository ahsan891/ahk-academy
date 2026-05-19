"""
Updates Gurkan's PrivateLesson records with correct start times.
- Lessons with recordings: use timestamp from recording filename
- All others: use scheduled time 21:00 (Mon/Wed/Sat preferred schedule)
End time = start + 90 min (2 lessons × 45 min each)
"""

import psycopg2, re
from datetime import datetime, timedelta
from pathlib import Path

GRABACIONES = Path(r"C:\Users\ahk79\OneDrive - Universidade de Santiago de Compostela\Grabaciones")

# Times known from recording filenames (date → HH:MM start)
RECORDING_TIMES = {
    # Gurkan-specific recordings — use earliest timestamp per date
    "2026-03-25": "19:31",   # Meeting with ahmet-20260325_193158
    "2026-03-30": "19:31",   # Meeting with gurkan and ilhan-20260330_193129
    "2026-04-04": "19:43",   # Meeting with ahmet-20260404_194348
    "2026-04-06": "20:32",   # Meeting withAHMET-20260406_203250
    "2026-05-03": "17:28",   # gurkan-20260503_172857
}

DEFAULT_TIME = "21:00"   # stated preferred schedule

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

    cur.execute('''SELECT id, "lessonDate"::date, phase, status, "lessonNumber"
                   FROM "PrivateLesson" WHERE "studentId" = %s ORDER BY "lessonDate"''',
                (student_id,))
    lessons = cur.fetchall()

    print(f"{'#':<4} {'Date':<12} {'Phase':<4} {'Status':<10} {'Start':<6} {'End':<6}  {'Source'}")
    print("-" * 65)

    updated = 0
    for lesson_id, lesson_date, phase, status, num in lessons:
        date_key = str(lesson_date)
        time_str = RECORDING_TIMES.get(date_key, DEFAULT_TIME)
        source   = "recording" if date_key in RECORDING_TIMES else "scheduled"

        h, m = map(int, time_str.split(":"))
        start_dt = datetime(lesson_date.year, lesson_date.month, lesson_date.day, h, m, 0)
        end_dt   = start_dt + timedelta(minutes=90)

        cur.execute('''UPDATE "PrivateLesson"
                       SET "lessonDate" = %s, "updatedAt" = NOW()
                       WHERE id = %s''',
                    (start_dt, lesson_id))
        updated += 1

        ph = "P1" if "PHASE1" in phase else "P2"
        n  = str(num) if num else " "
        print(f"{n:<4} {date_key:<12} {ph:<4} {status:<10} {time_str:<6} {end_dt.strftime('%H:%M'):<6}  {source}")

    conn.commit()
    cur.close()
    conn.close()

    print(f"\n✅ Updated {updated} lessons with start/end times")
    print("\nFULL ATTENDANCE SUMMARY")
    print("=" * 65)

    # Reprint as clean attendance sheet
    conn = get_conn()
    cur  = conn.cursor()
    cur.execute('''
        SELECT "lessonDate", phase, status, "lessonNumber", "lessonsCount", "durationMins", notes
        FROM "PrivateLesson" WHERE "studentId" = %s ORDER BY "lessonDate"
    ''', (student_id,))
    rows = cur.fetchall()

    print(f"\n{'No':<4} {'Date':<12} {'Day':<4} {'Start':<6} {'End':<6} {'Hrs':<5} {'Phase':<4} {'Status':<10}  Notes")
    print("-" * 80)

    days = ["Mon","Tue","Wed","Thu","Fri","Sat","Sun"]
    total_hours = 0.0
    p2_count = 0

    for start_dt, phase, status, num, lessons_count, dur_mins, notes in rows:
        if status == "CANCELLED":
            day = days[start_dt.weekday()]
            print(f"{'—':<4} {str(start_dt.date()):<12} {day:<4} {'—':<6} {'—':<6} {'—':<5} {'P1' if 'PHASE1' in phase else 'P2':<4} CANCELLED")
            continue

        end_dt    = start_dt + timedelta(minutes=dur_mins)
        hrs       = dur_mins / 60
        total_hours += hrs
        day       = days[start_dt.weekday()]
        ph        = "P1" if "PHASE1" in phase else "P2"
        n         = str(num) if num else " "
        note_str  = notes[:30] if notes else ""
        if ph == "P2":
            p2_count += 1

        print(f"{n:<4} {str(start_dt.date()):<12} {day:<4} {start_dt.strftime('%H:%M'):<6} {end_dt.strftime('%H:%M'):<6} {hrs:<5.1f} {ph:<4} {status:<10}  {note_str}")

    cur.close()
    conn.close()

    print("-" * 80)
    print(f"\nTotal sessions  : {len([r for r in rows if r[2]=='COMPLETED'])}")
    print(f"Total hours     : {total_hours:.1f} hours")
    print(f"Contract lessons: {p2_count * 2} / 100  ({p2_count} sessions × 2 lessons)")
    print(f"Remaining       : {100 - p2_count*2} lessons = {(100-p2_count*2)//2} sessions")

if __name__ == "__main__":
    main()
