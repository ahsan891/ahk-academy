"""
AHK Academy — Brishna teacher + student setup

Creates:
  - Brishna as TEACHER in User table
  - 6 student User records (placeholder emails, update later)
  - All PrivateLesson records from Monthly Report + individual sheets
  - StudentProfile for each student
  - TeacherProfile2 for Brishna

Run:
    python scripts/setup_brishna.py
"""

import psycopg2, sys, uuid, io
from datetime import datetime, date, timedelta

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

def get_conn():
    return psycopg2.connect(
        host="localhost", port=5432, dbname="ahk_academy",
        user="postgres", password="Wolverine1997@@"
    )

def cuid():
    return str(uuid.uuid4()).replace("-", "")[:25]

def parse_date(raw) -> date | None:
    """Handle both datetime objects and string dates like '27.4.26'."""
    if raw is None:
        return None
    if isinstance(raw, (datetime,)):
        return raw.date()
    s = str(raw).strip()
    for fmt in ("%d.%m.%y", "%d.%m.%Y", "%Y-%m-%d"):
        try:
            return datetime.strptime(s, fmt).date()
        except ValueError:
            continue
    return None

# ── Master data ────────────────────────────────────────────────────────────────

BRISHNA = {
    "name":  "Brishna",
    "email": "brishna@ahkacademy.teacher",   # update with real email
    "phone": None,
    "role":  "TEACHER",
}

# Each student: (display_name, placeholder_email, level, total_lessons_done, package_size, schedule_str)
STUDENTS = {
    "mustafa": {
        "name":         "Mustafa",
        "email":        "mustafa@ahkacademy.student",
        "level":        "B1",
        "lessons_done": 63,
        "package":      100,
        "schedule":     "Mon/Wed/Fri 09:30-11:00",
        "notes":        "63 lessons done before April 2026 records",
    },
    "fatimagul": {
        "name":         "Fatima Gul",
        "email":        "fatimagul@ahkacademy.student",
        "level":        "B1",
        "lessons_done": 92,
        "package":      100,
        "schedule":     "Mon/Fri 11:00-12:30",
        "notes":        "92 lessons done total. First lesson by Ahsan, rest by Brishna",
    },
    "ayse": {
        "name":         "Ayse",
        "email":        "ayse@ahkacademy.student",
        "level":        "A2",
        "lessons_done": 46,
        "package":      100,
        "schedule":     "Mon/Fri 12:30-14:00",
        "notes":        "46 lessons done total",
    },
    "taner_b": {
        "name":         "Taner (Brishna)",
        "email":        "taner.brishna@ahkacademy.student",
        "level":        "B2",
        "lessons_done": 8,
        "package":      100,
        "schedule":     "Mon/Wed 22:00-23:30",
        "notes":        "TOEFL student. 100-lesson contract started May 4 2026. Pre-contract: Apr 8-29",
    },
    "esra": {
        "name":         "Esra",
        "email":        "esra@ahkacademy.student",
        "level":        "A2",
        "lessons_done": 16,
        "package":      100,
        "schedule":     "Mon/Wed/Fri 20:00-21:30",
        "notes":        "16 lessons done total",
    },
    "bilal_b": {
        "name":         "Bilal (Brishna)",
        "email":        "bilal.brishna@ahkacademy.student",
        "level":        "A2",
        "lessons_done": 16,
        "package":      100,
        "schedule":     "Tue/Thu 09:00-10:30",
        "notes":        "16 lessons done total",
    },
}

# Lesson history per student from Excel
# Format: (date_str, status, topic, lesson_number)
# lesson_number = the sequential number in that student's individual sheet
LESSON_HISTORY = {
    "mustafa": [
        ("2026-04-06", "COMPLETED",  "Parts of speech",   1),
        ("2026-04-10", "COMPLETED",  "Noun and types",    2),
        ("2026-04-13", "NO_SHOW",    "—",                 3),
        ("2026-04-27", "COMPLETED",  "Pronouns and types",4),
        ("2026-04-29", "COMPLETED",  "Verbs and types",   5),
    ],
    "fatimagul": [
        ("2026-04-10", "COMPLETED",  "Parts of speech",   2),  # row 1 = Ahsan did
        ("2026-04-13", "COMPLETED",  "Noun and types",    3),
        ("2026-04-20", "COMPLETED",  "Pronouns and types",4),
        ("2026-04-24", "COMPLETED",  "Verbs and forms",   5),
        ("2026-04-28", "COMPLETED",  "Simple tenses",     6),
        ("2026-04-30", "COMPLETED",  "Continuous tenses", 7),
        ("2026-05-07", "COMPLETED",  "Quiz and speaking", 8),
        ("2026-05-08", "COMPLETED",  "Past perfect",      9),
        ("2026-05-12", "COMPLETED",  "Gerunds and infinitives", 10),
    ],
    "ayse": [
        ("2026-04-13", "COMPLETED",  "Parts of speech",         1),
        ("2026-04-20", "COMPLETED",  "Noun and types",          2),
        ("2026-04-25", "COMPLETED",  "Verb and types",          3),
        ("2026-04-28", "COMPLETED",  "Simple tenses",           4),
        ("2026-05-05", "COMPLETED",  "Continuous tenses",       5),
        ("2026-05-07", "COMPLETED",  "Quiz and speaking",       6),
        ("2026-05-12", "COMPLETED",  "Gerunds and infinitives", 7),
        ("2026-05-18", "COMPLETED",  "Gerunds and infinitives", 8),
    ],
    "taner_b": [
        # Pre-contract (Phase 1)
        ("2026-04-08", "COMPLETED",  "TOEFL Introduction",      1),
        ("2026-04-13", "COMPLETED",  "TOEFL reading practice",  2),
        ("2026-04-17", "COMPLETED",  "TOEFL reading practice",  3),
        ("2026-04-20", "COMPLETED",  "TOEFL reading practice",  4),
        ("2026-04-22", "COMPLETED",  "Listening",               5),
        ("2026-04-27", "COMPLETED",  "Listening",               6),
        ("2026-04-29", "COMPLETED",  "Speaking",                7),
        # Contract starts (Phase 2 — 100-pack)
        ("2026-05-04", "COMPLETED",  "Writing",                 8),
        ("2026-05-06", "COMPLETED",  "Writing task 1 and 3",    9),
        ("2026-05-11", "COMPLETED",  "Writing task 3",          10),
        ("2026-05-13", "COMPLETED",  "Test 1",                  11),
    ],
    "esra": [
        ("2026-04-10", "COMPLETED",  "Parts of speech",    1),
        ("2026-04-13", "COMPLETED",  "Noun and types",     2),
        ("2026-04-20", "COMPLETED",  "Pronoun and types",  3),
        ("2026-04-22", "COMPLETED",  "Verbs and forms",    4),
        ("2026-04-27", "COMPLETED",  "Simple tenses",      5),
        ("2026-04-29", "COMPLETED",  "Continuous tenses",  6),
        ("2026-05-06", "COMPLETED",  "Quiz and writing",   7),
        ("2026-05-11", "COMPLETED",  "Perfect tenses",     8),
    ],
    "bilal_b": [
        ("2026-04-14", "COMPLETED",  "Introduction",     1),
        ("2026-04-28", "COMPLETED",  "Simple tenses",    2),
        ("2026-05-07", "COMPLETED",  "Continuous",       3),
    ],
}

# Which lessons are pre-contract vs contract for Taner
TANER_CONTRACT_START = 8  # lesson_number >= 8 is Phase 2

def get_phase(student_key: str, lesson_number: int) -> str:
    if student_key == "taner_b" and lesson_number >= TANER_CONTRACT_START:
        return "PHASE2_CONTRACT"
    if student_key == "taner_b":
        return "PHASE1_PRECONTRACT"
    # For all others, everything recorded here is Phase 2
    return "PHASE2_CONTRACT"

# ── Insert helpers ─────────────────────────────────────────────────────────────

def upsert_user(cur, key: str, data: dict) -> str:
    cur.execute('SELECT id FROM "User" WHERE email = %s', (data["email"],))
    row = cur.fetchone()
    if row:
        print(f"  User already exists: {data['email']}")
        return row[0]
    uid = cuid()
    cur.execute("""
        INSERT INTO "User" (id, name, email, password, role, phone, "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
    """, (uid, data["name"], data["email"],
          "$2b$10$placeholder_hash_update_later",
          data.get("role", "STUDENT"),
          data.get("phone")))
    print(f"  Created user: {data['name']} <{data['email']}>")
    return uid

def ensure_student_profile(cur, user_id: str, data: dict, teacher_id: str):
    cur.execute('SELECT id FROM "StudentProfile" WHERE "userId" = %s', (user_id,))
    if cur.fetchone():
        return
    cur.execute("""
        INSERT INTO "StudentProfile"
          (id, "userId", "trackType", level, "teacherId", "isActive", notes,
           "enrolledAt", "createdAt", "updatedAt")
        VALUES (%s, %s, 'PRIVATE_LESSONS', %s, %s, TRUE, %s, NOW(), NOW(), NOW())
    """, (cuid(), user_id, data["level"], teacher_id, data.get("notes", "")))

def ensure_teacher_profile(cur, user_id: str):
    cur.execute('SELECT id FROM "TeacherProfile2" WHERE "userId" = %s', (user_id,))
    if cur.fetchone():
        return
    cur.execute("""
        INSERT INTO "TeacherProfile2"
          (id, "userId", specializations, bio, "isActive", "createdAt", "updatedAt")
        VALUES (%s, %s, 'General English, TOEFL', 'Brishna — AHK Academy teacher', TRUE, NOW(), NOW())
    """, (cuid(), user_id))

def insert_lessons(cur, student_id: str, teacher_id: str,
                   student_key: str, lessons: list):
    inserted = 0
    for lesson_date_str, status, topic, lesson_num in lessons:
        lesson_date = datetime.strptime(lesson_date_str, "%Y-%m-%d")
        phase = get_phase(student_key, lesson_num)

        # Check if already exists
        cur.execute("""
            SELECT id FROM "PrivateLesson"
            WHERE "studentId" = %s AND DATE("lessonDate") = %s
        """, (student_id, lesson_date.date()))
        if cur.fetchone():
            continue

        cur.execute("""
            INSERT INTO "PrivateLesson"
              (id, "studentId", "lessonDate", status, phase,
               "lessonNumber", "lessonsCount", "durationMins",
               notes, "createdAt", "updatedAt")
            VALUES (%s, %s, %s, %s, %s, %s, 2, 90, %s, NOW(), NOW())
        """, (cuid(), student_id, lesson_date,
              "CANCELLED" if status == "NO_SHOW" else "COMPLETED",
              phase, lesson_num, topic))
        inserted += 1
    return inserted

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 65)
    print("AHK Academy — Brishna + Students Setup")
    print("=" * 65)

    conn = get_conn()
    cur  = conn.cursor()

    # 1. Create Brishna
    print("\n[1/3] Creating Brishna teacher account...")
    brishna_id = upsert_user(cur, "brishna", BRISHNA)
    ensure_teacher_profile(cur, brishna_id)
    conn.commit()
    print(f"  Brishna ID: {brishna_id}")

    # 2. Create students + lesson records
    print("\n[2/3] Creating student accounts and lesson records...")
    student_ids = {}
    for key, data in STUDENTS.items():
        print(f"\n  [{key}] {data['name']}")
        uid = upsert_user(cur, key, data)
        ensure_student_profile(cur, uid, data, brishna_id)
        student_ids[key] = uid

        lessons = LESSON_HISTORY.get(key, [])
        n = insert_lessons(cur, uid, brishna_id, key, lessons)
        print(f"  Lessons inserted: {n} / {len(lessons)} (rest already existed)")
        conn.commit()

    # 3. Summary
    print("\n[3/3] Summary")
    print("-" * 55)
    for key, uid in student_ids.items():
        s = STUDENTS[key]
        cur.execute("""
            SELECT COUNT(*), COUNT(CASE WHEN status='COMPLETED' THEN 1 END)
            FROM "PrivateLesson" WHERE "studentId" = %s
        """, (uid,))
        total, done = cur.fetchone()
        print(f"  {s['name']:<18} {done} completed / {total} total lessons in DB")

    cur.close()
    conn.close()

    print("\n" + "=" * 65)
    print("DONE — Brishna portal ready to generate")
    print("  Run next: python scripts/generate_brishna_portal.py")
    print("=" * 65)
    print()
    print("NOTE: Update placeholder emails once you have real ones:")
    for k, s in STUDENTS.items():
        print(f"  {s['name']:<18} {s['email']}")
    print(f"  {'Brishna':<18} {BRISHNA['email']}")

if __name__ == "__main__":
    main()
