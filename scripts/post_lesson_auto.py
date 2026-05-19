"""
AHK Academy — Post-Lesson Automation Pipeline

After each lesson this script:
  1. Finds today's recording / .vtt transcript in OneDrive Grabaciones
  2. Extracts transcript text (.vtt first → Whisper fallback)
  3. Groq AI → lesson summary + structured homework exercises
  4. Saves everything to PostgreSQL
  5. Emails homework to student (Gmail SMTP)
  6. Generates submission link (once deployed to Railway)

Usage:
    python scripts/post_lesson_auto.py                        # auto-detect today
    python scripts/post_lesson_auto.py --date 2026-05-18      # specific date
    python scripts/post_lesson_auto.py --student gurkan       # specific student
    python scripts/post_lesson_auto.py --date 2026-05-18 --student gurkan
"""

import os, sys, re, json, time, uuid, smtplib, argparse
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from pathlib import Path
from datetime import datetime, date, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import psycopg2

# ── Config ────────────────────────────────────────────────────────────────────

GRABACIONES = Path(r"C:\Users\ahk79\OneDrive - Universidade de Santiago de Compostela\Grabaciones")
ENV_FILE    = Path(r"C:\Users\ahk79\AHK_Academy\CODE\ahk-academy\.env")

# Map name patterns in filenames → student info
STUDENT_MAP = {
    "gurkan": {
        "email":    "ahmetgurkan@geopaveco.com",
        "name":     "Ahmet Gurkan",
        "phone":    "905XXXXXXXXX",   # add Gurkan's WhatsApp number with country code
        "level":    "B2 → C2",
        "profession": "Civil Engineer",
    },
    "ahmet": {
        "email":    "ahmetgurkan@geopaveco.com",
        "name":     "Ahmet Gurkan",
        "phone":    "905XXXXXXXXX",
        "level":    "B2 → C2",
        "profession": "Civil Engineer",
    },
}

TEACHER_EMAIL   = "ahk7991@gmail.com"
TEACHER_NAME    = "Ahsan"
APP_BASE_URL    = "http://localhost:3000"  # change to Railway URL once deployed

# ── DB ─────────────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(
        host="localhost", port=5432, dbname="ahk_academy",
        user="postgres", password="Wolverine1997@@"
    )

# ── Env helpers ───────────────────────────────────────────────────────────────

def get_env(key, prompt_msg, url_hint=""):
    val = os.environ.get(key, "")
    if val:
        return val
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            if line.startswith(f"{key}="):
                val = line.split("=", 1)[1].strip().strip('"')
                if val:
                    return val
    print(f"\n  No {key} found.")
    if url_hint:
        print(f"  Get one at: {url_hint}")
    val = input(f"  Paste {key}: ").strip()
    if val:
        with open(ENV_FILE, "a") as f:
            f.write(f'\n{key}="{val}"\n')
        print(f"  Saved to .env")
    return val

# ── File detection ─────────────────────────────────────────────────────────────

def find_lesson_files(target_date: date, student_key: str = None):
    """
    Returns (vtt_path, mp4_path, matched_student_key) for the given date.
    Looks for .vtt files first, then Meeting Recording .mp4 files.
    """
    date_str = target_date.strftime("%Y%m%d")
    vtt_files = list(GRABACIONES.glob(f"*{date_str}*.vtt"))
    mp4_recordings = []
    mp4_transcripts = []

    for f in GRABACIONES.glob(f"*{date_str}*.mp4"):
        if "Transcript" in f.name:
            mp4_transcripts.append(f)
        elif "Recording" in f.name:
            mp4_recordings.append(f)

    # Filter by student if specified
    def matches_student(path):
        if not student_key:
            return True
        name_lower = path.name.lower()
        return any(k in name_lower for k in (student_key, *STUDENT_MAP.get(student_key, {}).keys()))

    # Detect student from filenames
    detected_key = student_key
    all_files = vtt_files + mp4_recordings + mp4_transcripts
    if not detected_key and all_files:
        for f in all_files:
            for k in STUDENT_MAP:
                if k in f.name.lower():
                    detected_key = k
                    break

    vtt   = next((f for f in vtt_files     if matches_student(f)), None)
    rec   = next((f for f in mp4_recordings if matches_student(f)), None)
    trans = next((f for f in mp4_transcripts if matches_student(f)), None)

    return vtt, rec, trans, detected_key

# ── Transcript parsing ─────────────────────────────────────────────────────────

def parse_vtt(vtt_path: Path) -> str:
    """Parse WebVTT file into timestamped plain text."""
    content = vtt_path.read_text(encoding="utf-8", errors="replace")
    lines_out = []
    current_speaker = ""
    for line in content.splitlines():
        line = line.strip()
        if not line or line.startswith("WEBVTT") or re.match(r'^\d+$', line):
            continue
        if "-->" in line:
            # Extract MM:SS from timecode
            m = re.match(r'(\d+):(\d+):(\d+)', line)
            if m:
                h, mn, s = int(m.group(1)), int(m.group(2)), int(m.group(3))
                current_time = f"{h*60+mn:02d}:{s:02d}"
            else:
                current_time = ""
            current_speaker = current_time
            continue
        # Strip XML tags (speaker names in Teams VTT: <v Speaker>text</v>)
        speaker_m = re.match(r'<v\s+([^>]+)>(.*)', line)
        if speaker_m:
            spk  = speaker_m.group(1).strip()
            text = re.sub(r'<[^>]+>', '', speaker_m.group(2)).strip()
            if text:
                lines_out.append(f"[{current_speaker}] {spk}: {text}")
        else:
            text = re.sub(r'<[^>]+>', '', line).strip()
            if text:
                lines_out.append(f"[{current_speaker}] {text}")
    return "\n".join(lines_out)

def transcribe_with_whisper(mp4_path: Path) -> str:
    """Fallback: transcribe using faster-whisper locally."""
    print("    [Whisper] Loading model base...")
    from faster_whisper import WhisperModel
    model = WhisperModel("base", device="cpu", compute_type="int8")
    print(f"    [Whisper] Transcribing {mp4_path.name} ({mp4_path.stat().st_size//1024//1024} MB)...")
    segments, _ = model.transcribe(str(mp4_path), language="en", beam_size=5)
    lines = []
    for seg in segments:
        ts = str(timedelta(seconds=int(seg.start)))[2:]
        lines.append(f"[{ts}] {seg.text.strip()}")
    transcript = "\n".join(lines)
    print(f"    [Whisper] Done: {len(lines)} segments, {len(transcript)} chars")
    return transcript

from datetime import timedelta

# ── Groq AI calls ─────────────────────────────────────────────────────────────

def trim_transcript(text: str, max_chars: int = 3000) -> str:
    if len(text) <= max_chars:
        return text
    chunk = max_chars // 3
    mid = len(text) // 2
    return text[:chunk] + "\n...[middle]...\n" + text[mid:mid+chunk] + "\n...[end]...\n" + text[-chunk:]

SUMMARY_PROMPT = """\
You are an expert English language tutor assistant.
Analyze this lesson transcript and return a JSON summary.

Student: {name} ({level}, {profession})
Date: {lesson_date}
Lesson type: Private 1-on-1 lesson

Transcript:
---
{transcript}
---

Return ONLY valid JSON with these fields:
{{
  "topics_covered": ["list of grammar/vocabulary/skills covered"],
  "vocabulary_taught": ["key words or phrases introduced"],
  "student_strengths": ["what the student did well"],
  "areas_to_improve": ["specific weaknesses to work on"],
  "fluency_score": <1-10>,
  "participation_score": <1-10>,
  "overall_notes": "2-3 sentence summary of the session",
  "next_lesson_focus": "what to prioritize next time"
}}"""

HOMEWORK_PROMPT = """\
You are an expert English language tutor creating homework for a student.

Student: {name} ({level}, {profession})
Today's lesson date: {lesson_date}
Topics covered in today's lesson: {topics}
Areas the student needs to improve: {areas}

Create engaging, practical homework. Return ONLY valid JSON:
{{
  "title": "Homework - Lesson {lesson_num} - {lesson_date}",
  "due_note": "Please complete before our next session",
  "exercises": [
    {{
      "number": 1,
      "type": "fill_in_blank",
      "instruction": "Fill in the blanks with the correct word or form:",
      "items": [
        {{"q": "sentence with ___ blank", "answer": "correct answer"}},
        {{"q": "another sentence ___", "answer": "answer"}}
      ]
    }},
    {{
      "number": 2,
      "type": "writing",
      "instruction": "Write 4-5 sentences on the topic below. Use vocabulary from today's lesson.",
      "topic": "specific writing topic relevant to today",
      "example_vocab": ["word1", "word2", "word3"]
    }},
    {{
      "number": 3,
      "type": "correction",
      "instruction": "Find and correct the mistake in each sentence:",
      "items": [
        {{"q": "sentence with an error", "answer": "corrected sentence"}},
        {{"q": "another sentence with error", "answer": "corrected sentence"}}
      ]
    }}
  ]
}}

Make questions relevant to a civil engineer at B2 level targeting C2. Be specific and useful."""

def call_groq(prompt: str, groq_key: str) -> dict:
    from groq import Groq
    client = Groq(api_key=groq_key)
    resp = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )
    time.sleep(12)  # respect free-tier TPM
    raw = resp.choices[0].message.content.strip()
    # Strip markdown code fences if present
    raw = re.sub(r'^```(?:json)?\s*', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'\s*```$', '', raw, flags=re.MULTILINE)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r'\{.*\}', raw, re.DOTALL)
        if m:
            return json.loads(m.group(0))
        return {"error": "parse failed", "_raw": raw}

# ── Email ──────────────────────────────────────────────────────────────────────

def build_homework_html(student_name: str, lesson_date: str, lesson_num: int,
                        homework: dict, submission_url: str) -> str:
    exercises_html = ""
    for ex in homework.get("exercises", []):
        ex_type = ex.get("type", "")
        instructions = ex.get("instruction", "")
        exercises_html += f"""
        <div style="margin-bottom:24px; padding:16px; background:#f8f9fa; border-radius:8px; border-left:4px solid #2563eb;">
          <h3 style="margin:0 0 8px; color:#1e40af; font-size:15px;">
            Exercise {ex.get('number', '')}
            <span style="font-weight:normal; color:#64748b; font-size:13px;">
              — {ex_type.replace('_', ' ').title()}
            </span>
          </h3>
          <p style="margin:0 0 12px; color:#374151;">{instructions}</p>"""

        if ex_type == "fill_in_blank" or ex_type == "correction":
            for i, item in enumerate(ex.get("items", []), 1):
                q = item.get("q", "")
                exercises_html += f"""
          <div style="margin-bottom:8px; padding:8px; background:white; border-radius:4px; border:1px solid #e5e7eb;">
            <span style="color:#374151; font-weight:500;">{i}. </span>
            <span style="color:#1f2937;">{q}</span>
            <div style="margin-top:6px;">
              <span style="color:#94a3b8; font-size:12px;">Your answer: </span>
              <span style="display:inline-block; border-bottom:1px solid #9ca3af; min-width:200px;">&nbsp;</span>
            </div>
          </div>"""

        elif ex_type == "writing":
            topic  = ex.get("topic", "")
            vocab  = ex.get("example_vocab", [])
            vocab_str = ", ".join(f"<em>{w}</em>" for w in vocab)
            exercises_html += f"""
          <p style="color:#374151; font-style:italic;">Topic: <strong>{topic}</strong></p>
          {f'<p style="color:#64748b; font-size:13px;">Try to use: {vocab_str}</p>' if vocab else ''}
          <div style="background:white; border:1px solid #d1d5db; border-radius:4px; padding:12px; min-height:80px; color:#94a3b8; font-size:13px;">
            Write your answer here (or reply to this email with your response)
          </div>"""

        exercises_html += "</div>"

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f1f5f9; margin:0; padding:20px;">
  <div style="max-width:620px; margin:0 auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <!-- Header -->
    <div style="background:linear-gradient(135deg,#1e40af,#3b82f6); padding:28px 32px; color:white;">
      <h1 style="margin:0 0 4px; font-size:22px;">AHK Academy</h1>
      <p style="margin:0; opacity:0.85; font-size:14px;">Homework — Lesson {lesson_num} — {lesson_date}</p>
    </div>

    <!-- Body -->
    <div style="padding:28px 32px;">
      <p style="color:#374151; font-size:15px;">Hi <strong>{student_name}</strong>,</p>
      <p style="color:#374151;">Great lesson today! Here is your homework. Please complete it before our next session.</p>

      {exercises_html}

      <!-- Submit button -->
      <div style="margin-top:28px; text-align:center;">
        <a href="{submission_url}"
           style="display:inline-block; background:#2563eb; color:white; padding:12px 28px;
                  border-radius:8px; text-decoration:none; font-weight:600; font-size:15px;">
          Submit Homework Online
        </a>
        <p style="color:#94a3b8; font-size:12px; margin-top:10px;">
          Or simply reply to this email with your answers.
        </p>
      </div>
    </div>

    <!-- Footer -->
    <div style="background:#f8fafc; padding:16px 32px; border-top:1px solid #e5e7eb;">
      <p style="margin:0; color:#94a3b8; font-size:12px; text-align:center;">
        AHK Academy &nbsp;·&nbsp; Teacher: Ahsan &nbsp;·&nbsp; {TEACHER_EMAIL}
      </p>
    </div>
  </div>
</body>
</html>"""

def send_email(to_email: str, to_name: str, subject: str,
               html_body: str, gmail_user: str, gmail_app_password: str):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"AHK Academy <{gmail_user}>"
    msg["To"]      = f"{to_name} <{to_email}>"
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.ehlo()
        smtp.starttls()
        smtp.login(gmail_user, gmail_app_password)
        smtp.sendmail(gmail_user, to_email, msg.as_bytes())
    print(f"    Email sent to {to_email}")

# ── DB save ────────────────────────────────────────────────────────────────────

def save_lesson(conn, lesson_id: str, transcript: str, summary: dict):
    cur = conn.cursor()
    cur.execute("""
        UPDATE "PrivateLesson"
        SET "transcriptText" = %s, "aiSummary" = %s, "updatedAt" = NOW()
        WHERE id = %s
    """, (transcript, json.dumps(summary, ensure_ascii=False), lesson_id))
    conn.commit()
    cur.close()

def save_homework(conn, lesson_id: str, student_id: str,
                  homework: dict, lesson_date: str, lesson_num: int) -> tuple[str, str]:
    cur = conn.cursor()
    hw_id    = str(uuid.uuid4()).replace("-", "")[:25]
    hw_token = str(uuid.uuid4()).replace("-", "")[:25]
    title    = homework.get("title", f"Homework - {lesson_date}")
    content  = json.dumps(homework, ensure_ascii=False, indent=2)

    cur.execute("""
        INSERT INTO "Homework"
          (id, token, "studentId", "privateLessonId", title, content,
           status, "createdAt", "updatedAt")
        VALUES (%s, %s, %s, %s, %s, %s, 'PENDING', NOW(), NOW())
    """, (hw_id, hw_token, student_id, lesson_id, title, content))

    cur.execute("""
        UPDATE "PrivateLesson"
        SET "homeworkGiven" = %s, "homeworkStatus" = 'PENDING', "updatedAt" = NOW()
        WHERE id = %s
    """, (title, lesson_id))

    conn.commit()
    cur.close()
    return hw_id, hw_token

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--date",    help="Lesson date YYYY-MM-DD (default: today)")
    parser.add_argument("--student", help="Student key e.g. gurkan (default: auto-detect)")
    args = parser.parse_args()

    target_date   = date.fromisoformat(args.date) if args.date else date.today()
    student_key   = args.student

    print("=" * 65)
    print(f"AHK Academy — Post-Lesson Automation — {target_date}")
    print("=" * 65)

    # Load credentials
    groq_key    = get_env("GROQ_API_KEY",        "Groq API key",          "https://console.groq.com/keys")
    gmail_user  = get_env("GMAIL_USER",           "Gmail address",         "")
    gmail_pass  = get_env("GMAIL_APP_PASSWORD",   "Gmail App Password",    "https://myaccount.google.com/apppasswords")

    # Find recording/transcript files
    print(f"\n[1/5] Scanning Grabaciones for {target_date}...")
    vtt, rec, trans, detected_key = find_lesson_files(target_date, student_key)

    if not detected_key:
        print("  No student-matching files found for this date.")
        print(f"  Files found: {list(GRABACIONES.glob(f'*{target_date.strftime(\"%Y%m%d\")}*'))}")
        sys.exit(1)

    student = STUDENT_MAP[detected_key]
    print(f"  Student: {student['name']}")

    if vtt:
        print(f"  Found .vtt transcript: {vtt.name}")
        transcript = parse_vtt(vtt)
        print(f"  Parsed: {len(transcript)} chars")
    elif rec:
        print(f"  No .vtt found — using Whisper on: {rec.name}")
        transcript = transcribe_with_whisper(rec)
    elif trans:
        print(f"  Only a Transcript.mp4 found (video) — using Whisper on: {trans.name}")
        transcript = transcribe_with_whisper(trans)
    else:
        print(f"  ERROR: No recording or transcript file found for {target_date}")
        sys.exit(1)

    if not transcript.strip():
        print("  WARNING: Empty transcript — check the file")
        transcript = "(no transcript available)"

    # Find lesson in DB
    print(f"\n[2/5] Looking up lesson in database...")
    conn = get_conn()
    cur  = conn.cursor()

    cur.execute('SELECT id FROM "User" WHERE email = %s', (student["email"],))
    row = cur.fetchone()
    if not row:
        sys.exit(f"  Student not found in DB: {student['email']}")
    student_id = row[0]

    cur.execute("""
        SELECT id, "lessonNumber", "transcriptText", "aiSummary"
        FROM "PrivateLesson"
        WHERE "studentId" = %s AND DATE("lessonDate") = %s
        LIMIT 1
    """, (student_id, target_date))
    lesson_row = cur.fetchone()

    if not lesson_row:
        print(f"  No PrivateLesson record for {target_date} — creating one...")
        lesson_id = str(uuid.uuid4()).replace("-", "")[:25]
        cur.execute("""
            INSERT INTO "PrivateLesson"
              (id, "studentId", "lessonDate", status, phase, "lessonsCount", "durationMins", "createdAt", "updatedAt")
            VALUES (%s, %s, %s, 'COMPLETED', 'PHASE2_CONTRACT', 2, 90, NOW(), NOW())
        """, (lesson_id, student_id, target_date))
        conn.commit()
        lesson_num       = None
        existing_tx      = None
        existing_summary = None
    else:
        lesson_id, lesson_num, existing_tx, existing_summary = lesson_row

    print(f"  Lesson ID: {lesson_id}  |  Lesson #{lesson_num}")

    # Generate AI summary
    print(f"\n[3/5] Generating lesson summary with Groq...")
    if existing_summary:
        print("  Summary already exists in DB — regenerating...")
    summary = call_groq(SUMMARY_PROMPT.format(
        name=student["name"],
        level=student["level"],
        profession=student["profession"],
        lesson_date=str(target_date),
        transcript=trim_transcript(transcript),
    ), groq_key)
    save_lesson(conn, lesson_id, transcript, summary)
    print(f"  Summary saved. Topics: {summary.get('topics_covered', [])[:3]}")
    print(f"  Fluency: {summary.get('fluency_score')}/10  |  Participation: {summary.get('participation_score')}/10")

    # Generate homework
    print(f"\n[4/5] Generating homework with Groq...")
    homework = call_groq(HOMEWORK_PROMPT.format(
        name=student["name"],
        level=student["level"],
        profession=student["profession"],
        lesson_date=str(target_date),
        lesson_num=lesson_num or "?",
        topics=", ".join(summary.get("topics_covered", ["general English"])),
        areas=", ".join(summary.get("areas_to_improve", ["fluency"])),
    ), groq_key)

    if "error" in homework:
        print(f"  WARNING: Groq returned an error: {homework}")
        homework = {
            "title": f"Homework - {target_date}",
            "exercises": [{
                "number": 1, "type": "writing",
                "instruction": "Write 5 sentences about your work this week.",
                "topic": "Your engineering projects",
                "example_vocab": summary.get("vocabulary_taught", [])[:3]
            }]
        }

    hw_id, hw_token = save_homework(conn, lesson_id, student_id,
                                    homework, str(target_date), lesson_num or 0)
    submission_url = f"{APP_BASE_URL}/homework/{hw_token}"
    print(f"  Homework saved. Token: {hw_token}")
    print(f"  Submission URL: {submission_url}")

    # Send email
    print(f"\n[5/5] Sending homework email to {student['email']}...")
    subject = f"AHK Academy — Homework Lesson {lesson_num or '?'} — {target_date}"
    html    = build_homework_html(
        student_name=student["name"],
        lesson_date=str(target_date),
        lesson_num=lesson_num or 0,
        homework=homework,
        submission_url=submission_url,
    )
    try:
        send_email(student["email"], student["name"], subject, html, gmail_user, gmail_pass)
        cur.execute("""
            UPDATE "Homework" SET "deliveredViaEmail" = TRUE, "updatedAt" = NOW()
            WHERE id = %s
        """, (hw_id,))
        conn.commit()
        print("  Email delivered successfully!")
    except Exception as e:
        print(f"  Email failed: {e}")
        print(f"  Homework content saved to DB — can resend manually.")

    cur.close()
    conn.close()

    print("\n" + "=" * 65)
    print(f"DONE — Lesson {lesson_num} processed")
    print(f"  Transcript : {len(transcript)} chars saved")
    print(f"  Summary    : fluency={summary.get('fluency_score')}/10")
    print(f"  Homework   : {len(homework.get('exercises', []))} exercises")
    print(f"  Email      : sent to {student['email']}")
    print(f"  Submit URL : {submission_url}")
    print("=" * 65)

if __name__ == "__main__":
    main()
