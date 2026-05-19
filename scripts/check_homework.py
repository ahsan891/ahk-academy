"""
AHK Academy — Homework Checker

When a student submits homework (via email reply, WhatsApp, or web form),
this script:
  1. Loads the homework questions from DB
  2. Takes the student's answers (from stdin, file, or --answers arg)
  3. Asks Groq to check each answer and give detailed feedback
  4. Saves aiRemarks to DB
  5. Sends feedback email to student

Usage:
    # Interactive — paste answers when prompted:
    python scripts/check_homework.py --student gurkan

    # Pass answers as a text file:
    python scripts/check_homework.py --student gurkan --answers-file gurkan_hw.txt

    # Check a specific homework by token:
    python scripts/check_homework.py --token <hw_token>
"""

import os, sys, re, json, time, smtplib, argparse
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

from pathlib import Path
from datetime import datetime
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
import psycopg2

ENV_FILE     = Path(r"C:\Users\ahk79\AHK_Academy\CODE\ahk-academy\.env")
TEACHER_EMAIL = "ahk7991@gmail.com"

STUDENT_MAP = {
    "gurkan": {"email": "ahmetgurkan@geopaveco.com", "name": "Ahmet Gurkan"},
    "ahmet":  {"email": "ahmetgurkan@geopaveco.com", "name": "Ahmet Gurkan"},
}

# ── Helpers ───────────────────────────────────────────────────────────────────

def get_conn():
    return psycopg2.connect(
        host="localhost", port=5432, dbname="ahk_academy",
        user="postgres", password="Wolverine1997@@"
    )

def get_env(key, prompt_msg="", url_hint=""):
    val = os.environ.get(key, "")
    if val: return val
    if ENV_FILE.exists():
        for line in ENV_FILE.read_text().splitlines():
            if line.startswith(f"{key}="):
                val = line.split("=", 1)[1].strip().strip('"')
                if val: return val
    if prompt_msg:
        print(f"\n  No {key} found.")
        if url_hint: print(f"  Get one at: {url_hint}")
        val = input(f"  Enter {key}: ").strip()
        if val:
            with open(ENV_FILE, "a") as f:
                f.write(f'\n{key}="{val}"\n')
    return val

# ── DB queries ─────────────────────────────────────────────────────────────────

def get_latest_homework(conn, student_email: str):
    cur = conn.cursor()
    cur.execute('SELECT id FROM "User" WHERE email = %s', (student_email,))
    row = cur.fetchone()
    if not row:
        return None
    student_id = row[0]
    cur.execute("""
        SELECT h.id, h.token, h.title, h.content, h."privateLessonId",
               u.name, u.email
        FROM "Homework" h
        JOIN "User" u ON u.id = h."studentId"
        WHERE h."studentId" = %s
          AND h.status = 'PENDING'
          AND h."submittedAt" IS NULL
        ORDER BY h."createdAt" DESC
        LIMIT 1
    """, (student_id,))
    row = cur.fetchone()
    cur.close()
    return row  # (id, token, title, content_json, lesson_id, name, email)

def get_homework_by_token(conn, token: str):
    cur = conn.cursor()
    cur.execute("""
        SELECT h.id, h.token, h.title, h.content, h."privateLessonId",
               u.name, u.email
        FROM "Homework" h
        JOIN "User" u ON u.id = h."studentId"
        WHERE h.token = %s
    """, (token,))
    row = cur.fetchone()
    cur.close()
    return row

def save_remarks(conn, hw_id: str, answers_text: str, remarks: dict):
    cur = conn.cursor()
    cur.execute("""
        UPDATE "Homework"
        SET "submissionContent" = %s,
            "aiRemarks"         = %s,
            "submittedAt"       = NOW(),
            "updatedAt"         = NOW(),
            status              = 'SUBMITTED'
        WHERE id = %s
    """, (answers_text, json.dumps(remarks, ensure_ascii=False), hw_id))
    conn.commit()
    cur.close()

# ── Groq checker ──────────────────────────────────────────────────────────────

CHECKER_PROMPT = """\
You are an expert English language tutor checking a student's homework.

Student: {name} (B2 level, targeting C2, Turkish civil engineer)
Homework title: {title}

Original homework questions:
{homework_json}

Student's submitted answers:
---
{answers}
---

For each exercise, check the student's answers and provide detailed, encouraging feedback.
Return ONLY valid JSON:
{{
  "overall_score": <0-100>,
  "overall_feedback": "2-3 sentences of encouraging overall feedback",
  "exercises": [
    {{
      "number": 1,
      "score": <0-100>,
      "items_feedback": [
        {{
          "question": "original question text",
          "student_answer": "what they wrote",
          "correct": true/false,
          "correct_answer": "the right answer if wrong",
          "explanation": "brief explanation of why"
        }}
      ]
    }}
  ],
  "grammar_errors": ["list of recurring grammar patterns to improve"],
  "vocabulary_highlights": ["words or phrases student used well"],
  "next_focus": "one specific thing to work on next lesson"
}}"""

def check_with_groq(homework: dict, answers: str, student_name: str,
                    hw_title: str, groq_key: str) -> dict:
    from groq import Groq
    client = Groq(api_key=groq_key)

    hw_trimmed = json.dumps(homework, ensure_ascii=False, indent=2)[:2000]

    prompt = CHECKER_PROMPT.format(
        name=student_name,
        title=hw_title,
        homework_json=hw_trimmed,
        answers=answers[:2000],
    )

    resp = client.chat.completions.create(
        model="llama-3.1-8b-instant",
        max_tokens=1500,
        messages=[{"role": "user", "content": prompt}]
    )
    time.sleep(12)

    raw = resp.choices[0].message.content.strip()
    raw = re.sub(r'^```(?:json)?\s*', '', raw, flags=re.MULTILINE)
    raw = re.sub(r'\s*```$', '', raw, flags=re.MULTILINE)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        m = re.search(r'\{.*\}', raw, re.DOTALL)
        if m:
            return json.loads(m.group(0))
        return {"overall_feedback": raw, "overall_score": None, "exercises": []}

# ── Feedback email ─────────────────────────────────────────────────────────────

def build_remarks_html(student_name: str, hw_title: str, remarks: dict) -> str:
    score = remarks.get("overall_score")
    score_color = "#16a34a" if score and score >= 70 else "#d97706" if score and score >= 50 else "#dc2626"
    score_label = "Excellent!" if score and score >= 80 else "Good work!" if score and score >= 60 else "Keep practicing!"

    exercises_html = ""
    for ex in remarks.get("exercises", []):
        items_html = ""
        for item in ex.get("items_feedback", []):
            correct = item.get("correct", False)
            icon    = "✓" if correct else "✗"
            bg      = "#f0fdf4" if correct else "#fef2f2"
            border  = "#bbf7d0" if correct else "#fecaca"
            items_html += f"""
        <div style="margin-bottom:10px; padding:12px; background:{bg};
                    border-radius:6px; border:1px solid {border};">
          <span style="font-weight:700; color:{'#16a34a' if correct else '#dc2626'};">{icon}</span>
          <strong style="color:#374151; margin-left:6px;">{item.get('question','')}</strong><br>
          <span style="color:#64748b; font-size:13px;">Your answer: </span>
          <span style="color:#374151;">{item.get('student_answer','')}</span>
          {"" if correct else f'<br><span style="color:#16a34a; font-size:13px;">Correct: <strong>{item.get("correct_answer","")}</strong></span>'}
          {f'<br><span style="color:#64748b; font-size:12px; font-style:italic;">{item.get("explanation","")}</span>' if item.get("explanation") else ""}
        </div>"""

        exercises_html += f"""
      <div style="margin-bottom:20px; padding:16px; background:#f8f9fa;
                  border-radius:8px; border-left:4px solid #3b82f6;">
        <h3 style="margin:0 0 12px; color:#1e40af;">
          Exercise {ex.get('number','')}
          <span style="font-weight:normal; color:#64748b; font-size:13px;">
            — {ex.get('score', '?')}/100
          </span>
        </h3>
        {items_html}
      </div>"""

    grammar = remarks.get("grammar_errors", [])
    vocab   = remarks.get("vocabulary_highlights", [])
    grammar_html = "".join(f'<li style="color:#92400e;">{g}</li>' for g in grammar)
    vocab_html   = "".join(f'<li style="color:#065f46;">{v}</li>' for v in vocab)

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif; background:#f1f5f9; margin:0; padding:20px;">
  <div style="max-width:620px; margin:0 auto; background:white; border-radius:12px; overflow:hidden; box-shadow:0 2px 8px rgba(0,0,0,0.08);">

    <div style="background:linear-gradient(135deg,#1e40af,#3b82f6); padding:28px 32px; color:white;">
      <h1 style="margin:0 0 4px; font-size:22px;">AHK Academy — Homework Feedback</h1>
      <p style="margin:0; opacity:0.85; font-size:14px;">{hw_title}</p>
    </div>

    <div style="padding:28px 32px;">
      <p style="color:#374151; font-size:15px;">Hi <strong>{student_name}</strong>,</p>

      <!-- Score banner -->
      <div style="text-align:center; padding:20px; background:#f8fafc; border-radius:10px; margin-bottom:24px;">
        <div style="font-size:48px; font-weight:700; color:{score_color};">{score if score else '?'}</div>
        <div style="color:#64748b; font-size:14px;">out of 100 — {score_label}</div>
      </div>

      <!-- Overall feedback -->
      <p style="color:#374151; font-size:15px; background:#eff6ff; padding:16px; border-radius:8px; border-left:4px solid #3b82f6;">
        {remarks.get("overall_feedback", "")}
      </p>

      {exercises_html}

      {f'''
      <div style="display:flex; gap:16px; margin-top:16px;">
        {f\'\'\'<div style="flex:1; background:#fef3c7; border-radius:8px; padding:16px;">
          <h4 style="margin:0 0 8px; color:#92400e;">Grammar to practice:</h4>
          <ul style="margin:0; padding-left:20px;">{grammar_html}</ul>
        </div>\'\'\' if grammar else ""}
        {f\'\'\'<div style="flex:1; background:#d1fae5; border-radius:8px; padding:16px;">
          <h4 style="margin:0 0 8px; color:#065f46;">Well done:</h4>
          <ul style="margin:0; padding-left:20px;">{vocab_html}</ul>
        </div>\'\'\' if vocab else ""}
      </div>
      ''' if grammar or vocab else ""}

      {f'<p style="margin-top:20px; color:#374151; background:#f0fdf4; padding:14px; border-radius:8px;"><strong>Focus for next lesson:</strong> {remarks.get("next_focus","")}</p>' if remarks.get("next_focus") else ""}
    </div>

    <div style="background:#f8fafc; padding:16px 32px; border-top:1px solid #e5e7eb;">
      <p style="margin:0; color:#94a3b8; font-size:12px; text-align:center;">
        AHK Academy &nbsp;·&nbsp; Teacher: Ahsan &nbsp;·&nbsp; {TEACHER_EMAIL}
      </p>
    </div>
  </div>
</body>
</html>"""

def send_email(to_email, to_name, subject, html_body, gmail_user, gmail_pass):
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = f"AHK Academy <{gmail_user}>"
    msg["To"]      = f"{to_name} <{to_email}>"
    msg.attach(MIMEText(html_body, "html", "utf-8"))
    with smtplib.SMTP("smtp.gmail.com", 587) as smtp:
        smtp.ehlo(); smtp.starttls()
        smtp.login(gmail_user, gmail_pass)
        smtp.sendmail(gmail_user, to_email, msg.as_bytes())

# ── Main ──────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--student",      help="Student key e.g. gurkan")
    parser.add_argument("--token",        help="Specific homework token")
    parser.add_argument("--answers-file", help="Text file containing student answers")
    args = parser.parse_args()

    print("=" * 65)
    print("AHK Academy — Homework Checker")
    print("=" * 65)

    groq_key   = get_env("GROQ_API_KEY",      "Groq API key",       "https://console.groq.com/keys")
    gmail_user = get_env("GMAIL_USER",         "Gmail address")
    gmail_pass = get_env("GMAIL_APP_PASSWORD", "Gmail App Password", "https://myaccount.google.com/apppasswords")

    conn = get_conn()

    # Find the homework
    if args.token:
        row = get_homework_by_token(conn, args.token)
    elif args.student:
        student = STUDENT_MAP.get(args.student.lower())
        if not student:
            sys.exit(f"Unknown student: {args.student}")
        row = get_latest_homework(conn, student["email"])
    else:
        sys.exit("Provide --student or --token")

    if not row:
        sys.exit("No pending homework found.")

    hw_id, hw_token, hw_title, hw_content_raw, lesson_id, student_name, student_email = row
    homework = json.loads(hw_content_raw)
    print(f"\nHomework : {hw_title}")
    print(f"Student  : {student_name} <{student_email}>")
    print(f"Token    : {hw_token}")

    # Get student answers
    if args.answers_file:
        answers = Path(args.answers_file).read_text(encoding="utf-8")
    else:
        print("\nPaste Gurkan's answers below (press ENTER twice when done):\n")
        lines = []
        blank_count = 0
        while blank_count < 2:
            try:
                line = input()
                if line == "":
                    blank_count += 1
                else:
                    blank_count = 0
                lines.append(line)
            except EOFError:
                break
        answers = "\n".join(lines).strip()

    if not answers:
        sys.exit("No answers provided.")

    print(f"\n[1/3] Checking answers with Groq ({len(answers)} chars)...")
    remarks = check_with_groq(homework, answers, student_name, hw_title, groq_key)

    print(f"  Score: {remarks.get('overall_score')}/100")
    print(f"  Feedback: {remarks.get('overall_feedback','')[:80]}...")

    print(f"\n[2/3] Saving remarks to DB...")
    save_remarks(conn, hw_id, answers, remarks)

    print(f"\n[3/3] Sending feedback email to {student_email}...")
    subject  = f"AHK Academy — Homework Feedback — {hw_title}"
    html     = build_remarks_html(student_name, hw_title, remarks)
    try:
        send_email(student_email, student_name, subject, html, gmail_user, gmail_pass)
        conn.cursor().execute(
            'UPDATE "Homework" SET "remarksSentAt" = NOW() WHERE id = %s', (hw_id,)
        )
        conn.commit()
        print("  Feedback email sent!")
    except Exception as e:
        print(f"  Email error: {e}")

    conn.close()
    print("\n" + "=" * 65)
    print(f"DONE — Score: {remarks.get('overall_score')}/100")
    print(f"  Remarks saved to DB (Homework.aiRemarks)")
    print("=" * 65)

if __name__ == "__main__":
    main()
