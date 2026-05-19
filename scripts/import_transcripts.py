"""
AHK Academy — Transcript & Recording Import Script
Reads all Teams transcript docx files and recording metadata from OneDrive,
then imports everything into the database.

Handles:
  - Group speaking sessions  → SpeakingSession + SessionParticipant + SessionTranscript
  - Private lesson transcripts → PrivateLesson.transcriptText
  - Recording file paths     → PrivateLesson.meetingLink (local path for now)

Run from ahk-academy directory:
    python scripts/import_transcripts.py
"""

import os, re, json, uuid, hashlib
import psycopg2
from datetime import datetime, date
from pathlib import Path

# ── Config ────────────────────────────────────────────────────────────────────

DOWNLOADS       = Path(r"C:\Users\ahk79\Downloads")
GRABACIONES     = Path(r"C:\Users\ahk79\OneDrive - Universidade de Santiago de Compostela\Grabaciones")
TEACHER_EMAIL   = "ahk7991@gmail.com"
TEACHER_NAME    = "Ahsan"

# ── Known student name → email mapping ───────────────────────────────────────
# Expand this as you add more students.
STUDENT_MAP = {
    # Display name in Teams transcript → (full name, email)
    "Gurkan":          ("Ahmet Gürkan",        "ahmetgurkan@geopaveco.com"),
    "Ahmet G":         ("Ahmet Gürkan",        "ahmetgurkan@geopaveco.com"),
    "AHMET":           ("Ahmet Gürkan",        "ahmetgurkan@geopaveco.com"),
    "Taner":           ("Taner",               "taner@ahk-student.local"),
    "OSMAN":           ("Osman",               "osman@ahk-student.local"),
    "Kübra":           ("Kübra",               "kubra@ahk-student.local"),
    "Kubra":           ("Kübra",               "kubra@ahk-student.local"),
    "Kübra Öztürk":    ("Kübra",               "kubra@ahk-student.local"),
    "Kamer Konuksever":("Kamer Konuksever",    "kamer@ahk-student.local"),
    "ilhan":           ("İlhan",               "ilhan@ahk-student.local"),
    "İlhan":           ("İlhan",               "ilhan@ahk-student.local"),
    "Ceren":           ("Ceren",               "ceren@ahk-student.local"),
    "Ela":             ("Ela",                 "ela@ahk-student.local"),
    "Hiba":            ("Hiba",                "hiba@ahk-student.local"),
    "Alev":            ("Alev",                "alev@ahk-student.local"),
    "Enes":            ("Enes",                "enes@ahk-student.local"),
    "Hatice":          ("Hatice",              "hatice@ahk-student.local"),
    "Tuana":           ("Tuana",               "tuana@ahk-student.local"),
    "Bilal":           ("Bilal",               "bilal@ahk-student.local"),
    "Erdal":           ("Erdal",               "erdal@ahk-student.local"),
    "Mustafa":         ("Mustafa",             "mustafa@ahk-student.local"),
    "Ferdi":           ("Ferdi",               "ferdi@ahk-student.local"),
    "Shahid":          ("Shahid",              "shahid@ahk-student.local"),
    "SHAHID":          ("Shahid",              "shahid@ahk-student.local"),
}

# ── Transcript files to import ────────────────────────────────────────────────
# (filepath, session_type, title_override)
# session_type: "SPEAKING" or "PRIVATE"
TRANSCRIPT_FILES = [
    # Group speaking sessions
    (DOWNLOADS / "speaking session.docx",        "SPEAKING", "Speaking Session — Apr 26"),
    (DOWNLOADS / "speaking session part 2.docx", "SPEAKING", "Speaking Session Part 2 — May 5"),
    # Individual / group lessons
    (DOWNLOADS / "osman and kubra.docx",                              "SPEAKING", "Osman & Kübra Session"),
    (DOWNLOADS / "Meeting with khan ahsan hussain (1).docx",          "PRIVATE",  None),
    (DOWNLOADS / "Meeting with khan ahsan hussain (2).docx",          "PRIVATE",  None),
    (DOWNLOADS / "Meeting with khan ahsan hussain (3).docx",          "PRIVATE",  None),
    (DOWNLOADS / "Meeting with khan ahsan hussain (4).docx",          "PRIVATE",  None),
    (DOWNLOADS / "Meeting with khan ahsan hussain (5).docx",          "PRIVATE",  None),
    (DOWNLOADS / "Meeting with khan ahsan hussain (6).docx",          "PRIVATE",  None),
    (DOWNLOADS / "Meeting with khan ahsan hussain (7).docx",          "PRIVATE",  None),
    (DOWNLOADS / "Meeting with khan ahsan hussain (8).docx",          "PRIVATE",  None),
    (DOWNLOADS / "Meeting with khan ahsan hussain (9).docx",          "PRIVATE",  None),
    (DOWNLOADS / "Meeting with khan ahsan hussain (10).docx",         "PRIVATE",  None),
    (DOWNLOADS / "Meeting with khan ahsan hussain (11).docx",         "PRIVATE",  None),
    (DOWNLOADS / "Meeting with khan ahsan hussain (12).docx",         "PRIVATE",  None),
    (DOWNLOADS / "Meeting with khan ahsan hussain with osman 1.docx", "PRIVATE",  None),
    (DOWNLOADS / "Meeting with ERDAL.docx",                           "PRIVATE",  None),
]

# ── DB ────────────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(
        host="localhost", port=5432,
        dbname="ahk_academy", user="postgres",
        password="Wolverine1997@@"
    )

# ── Transcript parser ─────────────────────────────────────────────────────────

def parse_transcript(filepath):
    """
    Returns dict:
      title, date_str, duration, speakers (set), utterances (list of {speaker, time, text}),
      full_text (str)
    """
    import docx
    doc = docx.Document(str(filepath))
    paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]

    title    = paragraphs[0].strip() if paragraphs else ""
    date_str = paragraphs[1].strip() if len(paragraphs) > 1 else ""
    duration = paragraphs[2].strip() if len(paragraphs) > 2 else ""

    # Parse date
    session_dt = None
    for fmt in ("%B %d, %Y, %I:%M%p", "%B %d, %Y, %I:%M %p"):
        try:
            session_dt = datetime.strptime(date_str, fmt)
            break
        except ValueError:
            pass
    if session_dt is None:
        m = re.search(r'(\w+ \d+, \d{4})', date_str)
        if m:
            try:
                session_dt = datetime.strptime(m.group(1), "%B %d, %Y")
            except ValueError:
                pass

    speakers   = set()
    utterances = []

    for para in paragraphs[3:]:
        # Each paragraph may contain multiple lines: "\nSpeaker   0:05\nText"
        lines = para.split('\n')
        current_speaker = None
        current_time    = None
        current_text    = []

        for line in lines:
            line = line.strip()
            if not line:
                continue
            # Speaker + timestamp line: "Speaker   0:05" (2+ spaces between)
            m = re.match(r'^(.+?)\s{2,}(\d{1,2}:\d{2}(?::\d{2})?)$', line)
            if m:
                if current_speaker and current_text:
                    utterances.append({
                        "speaker": current_speaker,
                        "time": current_time,
                        "text": " ".join(current_text).strip(),
                    })
                current_speaker = m.group(1).strip()
                current_time    = m.group(2)
                current_text    = []
                if current_speaker.lower() not in ("khan ahsan hussain",):
                    speakers.add(current_speaker)
            else:
                if current_speaker:
                    current_text.append(line)

        if current_speaker and current_text:
            utterances.append({
                "speaker": current_speaker,
                "time": current_time,
                "text": " ".join(current_text).strip(),
            })

    # Build full readable transcript
    lines_out = [f"=== {title} ===", f"Date: {date_str}", f"Duration: {duration}", ""]
    for u in utterances:
        lines_out.append(f"[{u['time']}] {u['speaker']}: {u['text']}")
    full_text = "\n".join(lines_out)

    return {
        "title":      title,
        "date_str":   date_str,
        "duration":   duration,
        "session_dt": session_dt,
        "speakers":   speakers,
        "utterances": utterances,
        "full_text":  full_text,
    }

# ── Helpers ───────────────────────────────────────────────────────────────────

def ensure_teacher(cur):
    cur.execute('SELECT id FROM "User" WHERE email = %s', (TEACHER_EMAIL,))
    row = cur.fetchone()
    if row:
        return row[0]
    tid = str(uuid.uuid4())[:25]
    cur.execute("""
        INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
    """, (tid, TEACHER_NAME, TEACHER_EMAIL,
          hashlib.sha256(b"teacher").hexdigest(), "TEACHER"))
    return tid

def ensure_student(cur, display_name):
    """Get or create a student by their Teams display name."""
    info = STUDENT_MAP.get(display_name)
    if not info:
        info = (display_name, f"{display_name.lower().replace(' ','.')}@ahk-student.local")

    full_name, email = info
    cur.execute('SELECT id FROM "User" WHERE email = %s', (email,))
    row = cur.fetchone()
    if row:
        return row[0], full_name
    sid = str(uuid.uuid4())[:25]
    cur.execute("""
        INSERT INTO "User" (id, name, email, password, role, "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, NOW(), NOW())
    """, (sid, full_name, email,
          hashlib.sha256(b"changeme").hexdigest(), "STUDENT"))
    # Also create a basic StudentProfile
    prof_id = str(uuid.uuid4())[:25]
    cur.execute("""
        INSERT INTO "StudentProfile"
        (id, "userId", "trackType", level, "isActive", "enrolledAt", "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, NOW(), NOW(), NOW())
        ON CONFLICT DO NOTHING
    """, (prof_id, sid, "ONE_ON_ONE", "B1", True))
    return sid, full_name

def get_student_id_by_display(cur, display_name):
    info = STUDENT_MAP.get(display_name)
    if info:
        email = info[1]
        cur.execute('SELECT id FROM "User" WHERE email = %s', (email,))
        row = cur.fetchone()
        if row:
            return row[0]
    return None

# ── Import speaking session ───────────────────────────────────────────────────

def import_speaking_session(cur, filepath, title_override, data, teacher_id):
    session_dt = data["session_dt"]
    if not session_dt:
        print(f"    ⚠ Could not parse date from {filepath.name}, skipping")
        return

    title = title_override or data["title"]

    # Skip if already imported (same date + title)
    cur.execute('SELECT id FROM "SpeakingSession" WHERE date = %s AND topic = %s',
                (session_dt, title))
    if cur.fetchone():
        print(f"    ✓ Already imported: {title}")
        return

    # Create SpeakingSession
    sess_id = str(uuid.uuid4())[:25]
    dur_mins = 90
    m = re.search(r'(\d+)h\s*(\d+)m', data["duration"])
    if m:
        dur_mins = int(m.group(1)) * 60 + int(m.group(2))
    else:
        m2 = re.search(r'(\d+)m', data["duration"])
        if m2:
            dur_mins = int(m2.group(1))

    cur.execute("""
        INSERT INTO "SpeakingSession"
        (id, topic, date, duration, status, "createdById", "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s, NOW(), NOW())
    """, (sess_id, title, session_dt, dur_mins, "completed", teacher_id))

    # Add participants
    student_ids = []
    for display_name in sorted(data["speakers"]):
        sid, full_name = ensure_student(cur, display_name)
        cur.execute("""
            INSERT INTO "SessionParticipant"
            (id, "sessionId", "studentId", attended, "createdAt")
            VALUES (%s, %s, %s, %s, NOW())
            ON CONFLICT ("sessionId", "studentId") DO NOTHING
        """, (str(uuid.uuid4())[:25], sess_id, sid, True))
        student_ids.append((sid, full_name))

    # Save transcript
    cur.execute("""
        INSERT INTO "SessionTranscript"
        (id, "sessionId", content, "uploadedById", "createdAt")
        VALUES (%s, %s, %s, %s, NOW())
        ON CONFLICT ("sessionId") DO NOTHING
    """, (str(uuid.uuid4())[:25], sess_id, data["full_text"], teacher_id))

    speakers_list = [f[1] for f in student_ids]
    print(f"    ✓ Speaking session: {title} ({session_dt.date()}) — {dur_mins}min")
    print(f"      Participants: {speakers_list}")
    print(f"      Transcript: {len(data['utterances'])} utterances")

# ── Import private lesson transcript ─────────────────────────────────────────

def import_private_transcript(cur, filepath, data, teacher_id):
    session_dt = data["session_dt"]
    if not session_dt:
        print(f"    ⚠ Could not parse date: {filepath.name}")
        return

    if not data["speakers"]:
        print(f"    ⚠ No students identified in: {filepath.name}")
        return

    lesson_date = session_dt.date()

    # Find the matching PrivateLesson(s) for these students
    for display_name in sorted(data["speakers"]):
        sid = get_student_id_by_display(cur, display_name)
        if not sid:
            sid, _ = ensure_student(cur, display_name)

        # Find lesson on this date (±1 day tolerance)
        from datetime import timedelta
        d_minus = lesson_date - timedelta(days=1)
        d_plus  = lesson_date + timedelta(days=1)

        cur.execute("""
            SELECT id FROM "PrivateLesson"
            WHERE "studentId" = %s
            AND DATE("lessonDate") BETWEEN %s AND %s
            AND "transcriptText" IS NULL
            LIMIT 1
        """, (sid, d_minus, d_plus))
        lesson = cur.fetchone()

        if lesson:
            cur.execute("""
                UPDATE "PrivateLesson"
                SET "transcriptText" = %s, "updatedAt" = NOW()
                WHERE id = %s
            """, (data["full_text"], lesson[0]))
            print(f"    ✓ Linked to {display_name}'s lesson on {lesson_date} ({len(data['utterances'])} utterances)")
        else:
            # No matching private lesson — store as a speaking session instead
            print(f"    ℹ {display_name}: no matching PrivateLesson on {lesson_date} — skipping transcript attachment")

# ── Index recording files ─────────────────────────────────────────────────────

def index_recordings(cur, teacher_id):
    print("\n  Indexing recording files from Grabaciones...")
    recordings = list(GRABACIONES.glob("*.mp4"))

    # Map recording names to student display names and dates
    # Format: "gurkan-20260503_172857-Meeting Recording.mp4"
    # Or: "Meeting with ahmet-20260325_193551-Meeting Recording.mp4"

    linked = 0
    for rec in sorted(recordings):
        name = rec.stem  # without .mp4

        # Extract datetime from filename: YYYYMMDD_HHMMSS
        dt_match = re.search(r'(\d{8})_(\d{6})', name)
        if not dt_match:
            continue
        rec_date = datetime.strptime(dt_match.group(1), "%Y%m%d").date()

        # Identify student from filename
        name_lower = name.lower()
        student_display = None
        if "gurkan" in name_lower or "ahmet" in name_lower:
            student_display = "Gurkan"
        elif "taner" in name_lower:
            student_display = "Taner"
        elif "osman" in name_lower:
            student_display = "OSMAN"
        elif "kubra" in name_lower or "kübra" in name_lower:
            student_display = "Kübra"
        elif "bilal" in name_lower:
            student_display = "Bilal"
        elif "alev" in name_lower:
            student_display = "Alev"
        elif "enes" in name_lower:
            student_display = "Enes"
        elif "hatice" in name_lower:
            student_display = "Hatice"
        elif "tuana" in name_lower:
            student_display = "Tuana"
        elif "erdal" in name_lower:
            student_display = "Erdal"
        elif "shahid" in name_lower:
            student_display = "SHAHID"
        elif "mustafa" in name_lower:
            student_display = "Mustafa"
        elif "ferdi" in name_lower:
            student_display = "Ferdi"
        elif "speaking" in name_lower:
            # Group speaking session — link to SpeakingSession
            continue  # handled via transcripts

        if not student_display:
            continue

        sid = get_student_id_by_display(cur, student_display)
        if not sid:
            continue

        from datetime import timedelta
        cur.execute("""
            SELECT id FROM "PrivateLesson"
            WHERE "studentId" = %s
            AND DATE("lessonDate") BETWEEN %s AND %s
            AND "meetingLink" IS NULL
            LIMIT 1
        """, (sid, rec_date - timedelta(days=1), rec_date + timedelta(days=1)))
        lesson = cur.fetchone()

        if lesson:
            cur.execute("""
                UPDATE "PrivateLesson"
                SET "meetingLink" = %s, "updatedAt" = NOW()
                WHERE id = %s
            """, (str(rec), lesson[0]))
            linked += 1

    print(f"    ✓ Linked {linked} recording files to PrivateLesson records")

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    import docx  # ensure available

    print("=" * 65)
    print("AHK Academy — Transcript & Recording Import")
    print("=" * 65)

    conn = get_conn()
    cur  = conn.cursor()

    teacher_id = ensure_teacher(cur)
    print(f"\nTeacher ID: {teacher_id}")

    imported    = 0
    skipped     = 0
    errors      = 0
    all_students = set()

    print(f"\nProcessing {len(TRANSCRIPT_FILES)} transcript files...\n")

    for filepath, session_type, title_override in TRANSCRIPT_FILES:
        if not filepath.exists():
            print(f"  ⚠ Not found: {filepath.name}")
            skipped += 1
            continue

        print(f"  → {filepath.name}")
        try:
            data = parse_transcript(filepath)
            all_students.update(data["speakers"])

            if session_type == "SPEAKING":
                import_speaking_session(cur, filepath, title_override, data, teacher_id)
            else:
                import_private_transcript(cur, filepath, data, teacher_id)
            imported += 1
        except Exception as e:
            print(f"    ✗ Error: {e}")
            errors += 1

    # Index all recording files
    index_recordings(cur, teacher_id)

    conn.commit()
    cur.close()
    conn.close()

    print("\n" + "=" * 65)
    print("✅ IMPORT COMPLETE")
    print("=" * 65)
    print(f"  Transcripts processed : {imported}")
    print(f"  Skipped (not found)   : {skipped}")
    print(f"  Errors                : {errors}")
    print(f"  All students seen     : {sorted(all_students)}")
    print("\nCheck TablePlus → SpeakingSession, SessionTranscript, PrivateLesson")

if __name__ == "__main__":
    main()
