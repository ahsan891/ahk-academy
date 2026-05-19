"""
AHK Academy — Transcribe recordings + generate AI summaries for Gurkan.

Steps:
  1. Transcribes .mp4 recordings using faster-whisper (runs locally, free)
  2. Fetches speaking session transcripts already in DB
  3. Sends each transcript to Groq API → generates structured lesson summary
  4. Saves transcript + aiSummary back to PrivateLesson / SessionAnalysis tables

Groq free tier: https://console.groq.com/ (no credit card needed)

Run:
    python scripts/transcribe_and_summarize.py
"""

import os, sys, psycopg2, json
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')
from pathlib import Path
from datetime import datetime, timedelta, date

# ── Config ────────────────────────────────────────────────────────────────────

GRABACIONES = Path(r"C:\Users\ahk79\OneDrive - Universidade de Santiago de Compostela\Grabaciones")
ENV_FILE    = Path(r"C:\Users\ahk79\AHK_Academy\CODE\ahk-academy\.env")

# Gurkan's recordings — (filename, lesson_date)
GURKAN_RECORDINGS = [
    ("Meeting with ahmet-20260325_193551-Meeting Recording.mp4",  date(2026, 3, 25)),
    ("Meeting with gurkan and ilhan-20260330_193129-Meeting Recording.mp4", date(2026, 3, 30)),
    ("gurkan-20260503_172857-Meeting Recording.mp4",              date(2026, 5,  3)),
    # Apr 4 and Apr 6 only have "Transcript.mp4" (short video) — skip for now
]

WHISPER_MODEL = "base"  # tiny/base/small — base is good quality, ~150MB

# ── Helpers ───────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(
        host="localhost", port=5432, dbname="ahk_academy",
        user="postgres", password="Wolverine1997@@"
    )

def get_api_key():
    """Read or prompt for Groq API key, save to .env."""
    key = os.environ.get("GROQ_API_KEY", "")
    if key:
        return key
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            if line.startswith("GROQ_API_KEY="):
                key = line.split("=", 1)[1].strip().strip('"')
                if key:
                    return key
    print("\n⚠  No GROQ_API_KEY found.")
    print("   Get a FREE key at https://console.groq.com/keys")
    print("   (No credit card required)")
    key = input("   Paste your Groq key here: ").strip()
    if key:
        with open(ENV_FILE, "a") as f:
            f.write(f'\nGROQ_API_KEY="{key}"\n')
        print("   ✓ Saved to .env")
        return key
    sys.exit("No API key provided.")

# ── Transcription ─────────────────────────────────────────────────────────────

def transcribe_recording(filepath: Path) -> str:
    """Transcribe mp4 using faster-whisper. Returns full text."""
    print(f"    Loading Whisper model ({WHISPER_MODEL})...")
    from faster_whisper import WhisperModel
    model = WhisperModel(WHISPER_MODEL, device="cpu", compute_type="int8")

    print(f"    Transcribing {filepath.name} ({filepath.stat().st_size // 1024 // 1024} MB)...")
    segments, info = model.transcribe(str(filepath), language="en", beam_size=5)

    lines = []
    for seg in segments:
        start = str(timedelta(seconds=int(seg.start)))[2:]  # MM:SS
        lines.append(f"[{start}] {seg.text.strip()}")

    transcript = "\n".join(lines)
    print(f"    ✓ Transcribed: {len(lines)} segments, {len(transcript)} chars")
    return transcript

# ── AI Summary ────────────────────────────────────────────────────────────────

SUMMARY_PROMPT = """You are an expert English language tutor assistant for AHK Academy.
Analyze this lesson transcript and provide a structured summary.

Student: Ahmet Gürkan (B2 level, targeting C2, Turkish civil engineer, age ~57)
Lesson type: {lesson_type}
Date: {lesson_date}

Transcript:
---
{transcript}
---

Provide a JSON summary with these exact fields:
{{
  "topics_covered": ["list of main topics/grammar points discussed"],
  "vocabulary_taught": ["key words or phrases introduced"],
  "student_strengths": ["what the student did well"],
  "areas_to_improve": ["specific weaknesses observed"],
  "homework_recommended": ["suggested homework tasks"],
  "fluency_score": <1-10 estimate>,
  "participation_score": <1-10 estimate>,
  "overall_notes": "2-3 sentence summary of the lesson",
  "next_lesson_focus": "what to prioritize next session"
}}

Return only valid JSON, no markdown."""

def trim_transcript(transcript: str, max_chars: int = 3200) -> str:
    """Take beginning + middle + end to stay under Groq free-tier token limit."""
    if len(transcript) <= max_chars:
        return transcript
    chunk = max_chars // 3
    start  = transcript[:chunk]
    mid_s  = len(transcript) // 2 - chunk // 2
    middle = transcript[mid_s : mid_s + chunk]
    end    = transcript[-chunk:]
    return start + "\n...\n" + middle + "\n...\n" + end

def generate_summary(transcript: str, lesson_type: str, lesson_date: str, api_key: str) -> dict:
    """Call Groq API (free tier) to generate a structured lesson summary."""
    import time
    from groq import Groq
    client = Groq(api_key=api_key)

    prompt = SUMMARY_PROMPT.format(
        lesson_type=lesson_type,
        lesson_date=lesson_date,
        transcript=trim_transcript(transcript),
    )

    response = client.chat.completions.create(
        model="llama-3.1-8b-instant",  # free, fast, good quality
        max_tokens=1024,
        messages=[{"role": "user", "content": prompt}]
    )

    time.sleep(12)  # Groq free tier: ~5 req/min, wait to avoid TPM limit

    raw = response.choices[0].message.content.strip()
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        import re
        m = re.search(r'\{.*\}', raw, re.DOTALL)
        if m:
            return json.loads(m.group(0))
        return {"overall_notes": raw, "error": "could not parse JSON"}

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    print("=" * 65)
    print("AHK Academy — Transcribe & Summarize — Ahmet Gürkan")
    print("=" * 65)

    api_key = get_api_key()
    conn = get_conn()
    cur  = conn.cursor()

    cur.execute('SELECT id FROM "User" WHERE email = %s', ("ahmetgurkan@geopaveco.com",))
    student_id = cur.fetchone()[0]

    cur.execute('SELECT id FROM "User" WHERE email = %s', ("ahk7991@gmail.com",))
    teacher_row = cur.fetchone()
    teacher_id  = teacher_row[0] if teacher_row else None

    # ── 1. Private lesson recordings ─────────────────────────────────────────
    print(f"\n[1/2] Processing {len(GURKAN_RECORDINGS)} private lesson recordings...")

    for filename, lesson_date in GURKAN_RECORDINGS:
        filepath = GRABACIONES / filename
        if not filepath.exists():
            print(f"  ⚠ Not found: {filename}")
            continue

        print(f"\n  → {lesson_date} — {filename[:50]}...")

        # Check if already done
        cur.execute('''SELECT id, "transcriptText", "aiSummary" FROM "PrivateLesson"
                       WHERE "studentId" = %s AND DATE("lessonDate") = %s''',
                    (student_id, lesson_date))
        lesson = cur.fetchone()
        if not lesson:
            print(f"    ⚠ No PrivateLesson record for {lesson_date}")
            continue

        lesson_id, existing_tx, existing_summary = lesson

        # Transcribe if not already done
        if existing_tx:
            print(f"    ✓ Transcript already in DB ({len(existing_tx)} chars)")
            transcript = existing_tx
        else:
            transcript = transcribe_recording(filepath)
            cur.execute('''UPDATE "PrivateLesson" SET "transcriptText" = %s, "updatedAt" = NOW()
                           WHERE id = %s''', (transcript, lesson_id))
            print(f"    ✓ Transcript saved")

        # Generate summary
        if existing_summary:
            print(f"    ✓ AI summary already exists")
        else:
            print(f"    Generating AI summary...")
            summary = generate_summary(transcript, "Private 1-on-1 lesson", str(lesson_date), api_key)
            summary_text = json.dumps(summary, indent=2, ensure_ascii=False)
            cur.execute('''UPDATE "PrivateLesson" SET "aiSummary" = %s, "updatedAt" = NOW()
                           WHERE id = %s''', (summary_text, lesson_id))
            print(f"    ✓ AI summary saved")
            print(f"    Topics: {summary.get('topics_covered', [])[:3]}")
            print(f"    Fluency score: {summary.get('fluency_score')}/10")

        conn.commit()

    # ── 2. Speaking session transcripts ──────────────────────────────────────
    print(f"\n[2/2] Generating summaries for speaking session transcripts...")

    cur.execute('''
        SELECT ss.id, ss.topic, ss.date::date, st.id as tx_id, st.content
        FROM "SpeakingSession" ss
        JOIN "SessionTranscript" st ON ss.id = st."sessionId"
        JOIN "SessionParticipant" sp ON ss.id = sp."sessionId"
        WHERE sp."studentId" = %s
        ORDER BY ss.date
    ''', (student_id,))
    sessions = cur.fetchall()

    for sess_id, topic, sess_date, tx_id, transcript in sessions:
        print(f"\n  → {sess_date} — {topic}")

        # Check if student already has an analysis
        cur.execute('''SELECT id FROM "SessionAnalysis"
                       WHERE "sessionId" = %s AND "studentId" = %s''',
                    (sess_id, student_id))
        if cur.fetchone():
            print(f"    ✓ Analysis already exists")
            continue

        # Generate summary for this student specifically
        # Filter transcript to only Gurkan's lines
        lines = []
        for line in transcript.split("\n"):
            if any(n in line for n in ["Gurkan","Ahmet G","AHMET","khan ahsan hussain"]):
                lines.append(line)
        gurkan_lines = "\n".join(lines[:200]) if lines else transcript[:8000]

        print(f"    Generating AI summary ({len(gurkan_lines)} chars of Gurkan's speech)...")
        summary = generate_summary(gurkan_lines, f"Group speaking session — {topic}", str(sess_date), api_key)

        import uuid
        analysis_id = str(uuid.uuid4())[:25]
        cur.execute('''
            INSERT INTO "SessionAnalysis"
            (id, "transcriptId", "sessionId", "studentId",
             summary, "vocabularyUsed", "grammarNotes", "strengths",
             "areasToImprove", homework, "participationScore", "createdAt")
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, NOW())
        ''', (
            analysis_id, tx_id, sess_id, student_id,
            summary.get("overall_notes", ""),
            json.dumps(summary.get("vocabulary_taught", []), ensure_ascii=False),
            json.dumps(summary.get("topics_covered", []), ensure_ascii=False),
            json.dumps(summary.get("student_strengths", []), ensure_ascii=False),
            json.dumps(summary.get("areas_to_improve", []), ensure_ascii=False),
            json.dumps(summary.get("homework_recommended", []), ensure_ascii=False),
            summary.get("participation_score"),
        ))
        conn.commit()
        print(f"    ✓ Analysis saved")
        print(f"    Participation: {summary.get('participation_score')}/10")
        print(f"    Strengths: {summary.get('student_strengths', [])[:2]}")

    cur.close()
    conn.close()

    print("\n" + "=" * 65)
    print("✅ DONE — transcripts and AI summaries saved")
    print("   Check TablePlus → PrivateLesson.aiSummary")
    print("   Check TablePlus → SessionAnalysis")
    print("=" * 65)

if __name__ == "__main__":
    main()
