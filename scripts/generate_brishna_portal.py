"""
Generate Brishna's teacher portal — standalone HTML, works offline.
Shows all 6 students, their lesson history, progress, topics.

Run:
    python scripts/generate_brishna_portal.py
"""

import psycopg2, json, sys, io
from datetime import datetime, date
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')

OUTPUT = Path(r"C:\Users\ahk79\AHK_Academy\CODE\ahk-academy\brishna_portal.html")

STUDENT_EMAILS = [
    "mustafa@ahkacademy.student",
    "fatimagul@ahkacademy.student",
    "ayse@ahkacademy.student",
    "taner.brishna@ahkacademy.student",
    "esra@ahkacademy.student",
    "bilal.brishna@ahkacademy.student",
]

PACKAGE_SIZE = 100
LESSON_RATE  = 2  # lessons per session

def get_conn():
    return psycopg2.connect(
        host="localhost", port=5432, dbname="ahk_academy",
        user="postgres", password="Wolverine1997@@"
    )

def fetch_data():
    conn = get_conn()
    cur  = conn.cursor()

    students = []
    for email in STUDENT_EMAILS:
        cur.execute('SELECT id, name FROM "User" WHERE email = %s', (email,))
        row = cur.fetchone()
        if not row:
            continue
        uid, name = row

        cur.execute("""
            SELECT id, DATE("lessonDate"), "lessonDate"::time, status, phase,
                   "lessonNumber", notes, "transcriptText", "aiSummary",
                   "homeworkGiven", "homeworkStatus"
            FROM "PrivateLesson"
            WHERE "studentId" = %s
            ORDER BY "lessonDate"
        """, (uid,))
        lessons = cur.fetchall()

        cur.execute("""
            SELECT "trackType", level, notes, "enrolledAt"
            FROM "StudentProfile" WHERE "userId" = %s
        """, (uid,))
        profile = cur.fetchone()

        cur.execute("""
            SELECT COUNT(*) FROM "Homework" WHERE "studentId" = %s
        """, (uid,))
        hw_count = cur.fetchone()[0]

        cur.execute("""
            SELECT COUNT(*) FROM "StudentDocument" WHERE "studentId" = %s
        """, (uid,))
        doc_count = cur.fetchone()[0]

        completed = [l for l in lessons if l[3] == "COMPLETED"]
        cancelled = [l for l in lessons if l[3] == "CANCELLED"]
        phase2    = [l for l in completed if l[4] == "PHASE2_CONTRACT"]

        students.append({
            "id":          uid,
            "name":        name,
            "email":       email,
            "level":       profile[1] if profile else "—",
            "notes":       profile[2] if profile else "",
            "enrolled_at": str(profile[3].date()) if profile and profile[3] else "—",
            "lessons":     [
                {
                    "date":       str(l[1]),
                    "time":       str(l[2])[:5] if l[2] else "—",
                    "status":     l[3],
                    "phase":      l[4],
                    "num":        l[5],
                    "topic":      l[6] or "—",
                    "has_tx":     bool(l[7]),
                    "has_ai":     bool(l[8]),
                    "homework":   l[9] or "",
                    "hw_status":  l[10] or "",
                }
                for l in lessons
            ],
            "completed":   len(completed),
            "cancelled":   len(cancelled),
            "phase2_done": len(phase2),
            "package":     PACKAGE_SIZE,
            "hw_count":    hw_count,
            "doc_count":   doc_count,
        })

    cur.close()
    conn.close()
    return students

def generate_html(students):
    today = date.today().strftime("%d %B %Y")
    total_lessons = sum(s["completed"] for s in students)
    total_students = len(students)

    # colours per student (for tab indicators)
    COLORS = ["#3b82f6","#8b5cf6","#10b981","#f59e0b","#ef4444","#06b6d4"]

    # ── Student tab buttons ─────────────────────────────────────────────────
    tabs_html = ""
    panels_html = ""

    for i, s in enumerate(students):
        color    = COLORS[i % len(COLORS)]
        pct      = round(s["phase2_done"] / PACKAGE_SIZE * 100)
        active   = "active" if i == 0 else ""
        tabs_html += f"""
        <button class="tab-btn {active}" data-tab="s{i}"
                style="--c:{color}">
          <span class="tab-dot" style="background:{color}"></span>
          <span>{s['name'].split()[0]}</span>
          <span class="tab-count">{s['phase2_done']}/{PACKAGE_SIZE}</span>
        </button>"""

        # lesson rows
        rows = ""
        for l in s["lessons"]:
            phase_badge = (
                '<span class="badge phase2">Contract</span>'
                if l["phase"] == "PHASE2_CONTRACT"
                else '<span class="badge phase1">Pre</span>'
            )
            status_icon = (
                '<span class="dot green"></span>' if l["status"] == "COMPLETED"
                else '<span class="dot red"></span>'
            )
            tx_icon  = '<span class="icon-yes">📝</span>' if l["has_tx"]  else '<span class="icon-no">—</span>'
            ai_icon  = '<span class="icon-yes">🤖</span>' if l["has_ai"]  else '<span class="icon-no">—</span>'
            rows += f"""
            <tr>
              <td>{l['num'] or '—'}</td>
              <td>{l['date']}</td>
              <td>{l['time']}</td>
              <td>{status_icon} {l['status'].replace('_',' ').title()}</td>
              <td>{phase_badge}</td>
              <td class="topic">{l['topic']}</td>
              <td>{tx_icon}</td>
              <td>{ai_icon}</td>
              <td>{l['homework'] or '—'}</td>
            </tr>"""

        bar_width = max(pct, 2)
        panels_html += f"""
        <div class="panel {'active' if i == 0 else ''}" id="s{i}">
          <!-- Student header -->
          <div class="student-header" style="border-left:4px solid {color}">
            <div>
              <h2>{s['name']}</h2>
              <p class="sub">{s['email']}</p>
            </div>
            <div class="stat-row">
              <div class="stat-box">
                <div class="stat-num" style="color:{color}">{s['completed']}</div>
                <div class="stat-lbl">Sessions</div>
              </div>
              <div class="stat-box">
                <div class="stat-num" style="color:{color}">{s['phase2_done']}</div>
                <div class="stat-lbl">Contract</div>
              </div>
              <div class="stat-box">
                <div class="stat-num" style="color:{color}">{PACKAGE_SIZE - s['phase2_done']}</div>
                <div class="stat-lbl">Remaining</div>
              </div>
              <div class="stat-box">
                <div class="stat-num" style="color:{color}">{s['hw_count']}</div>
                <div class="stat-lbl">Homeworks</div>
              </div>
              <div class="stat-box">
                <div class="stat-num" style="color:{color}">{s['doc_count']}</div>
                <div class="stat-lbl">Documents</div>
              </div>
            </div>
          </div>

          <!-- Progress bar -->
          <div class="progress-wrap">
            <div class="progress-label">
              <span>Contract progress</span>
              <span>{s['phase2_done']} / {PACKAGE_SIZE} lessons ({pct}%)</span>
            </div>
            <div class="progress-bg">
              <div class="progress-fill" style="width:{bar_width}%; background:{color}"></div>
            </div>
          </div>

          <!-- Notes -->
          {f'<div class="note-box">{s["notes"]}</div>' if s["notes"] else ""}

          <!-- Lesson table -->
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th><th>Date</th><th>Time</th><th>Status</th>
                  <th>Phase</th><th>Topic</th><th>TX</th><th>AI</th><th>Homework</th>
                </tr>
              </thead>
              <tbody>{rows}</tbody>
            </table>
          </div>

          <!-- Add lesson placeholder -->
          <div class="add-lesson">
            <span>+ Add lesson manually → run: <code>python scripts/add_lesson.py --student {s['email'].split('@')[0]}</code></span>
          </div>
        </div>"""

    return f"""<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Brishna — Teacher Portal | AHK Academy</title>
<style>
  *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0f172a; color: #e2e8f0; min-height: 100vh; }}

  /* ── Header ── */
  .header {{ background: linear-gradient(135deg,#1e3a5f,#1e40af);
             padding: 28px 36px; display: flex; justify-content: space-between;
             align-items: center; box-shadow: 0 2px 20px rgba(0,0,0,0.4); }}
  .header h1 {{ font-size: 22px; font-weight: 700; }}
  .header .sub {{ color: #93c5fd; font-size: 13px; margin-top: 3px; }}
  .header .date {{ color: #94a3b8; font-size: 13px; }}

  /* ── Top stats ── */
  .top-stats {{ display: flex; gap: 16px; padding: 20px 36px; flex-wrap: wrap; }}
  .top-card {{ background: #1e293b; border-radius: 12px; padding: 18px 24px;
               flex: 1; min-width: 140px; border: 1px solid #334155; }}
  .top-card .num {{ font-size: 32px; font-weight: 700; color: #60a5fa; }}
  .top-card .lbl {{ color: #94a3b8; font-size: 12px; margin-top: 2px; }}

  /* ── Tabs ── */
  .tabs-container {{ padding: 0 36px; }}
  .tabs {{ display: flex; gap: 8px; overflow-x: auto; padding-bottom: 4px; }}
  .tab-btn {{ display: flex; align-items: center; gap: 8px; padding: 10px 18px;
              background: #1e293b; border: 1px solid #334155; border-radius: 10px;
              color: #94a3b8; cursor: pointer; font-size: 13px; font-weight: 500;
              white-space: nowrap; transition: all .2s; }}
  .tab-btn:hover {{ border-color: var(--c); color: #e2e8f0; }}
  .tab-btn.active {{ background: #0f172a; border-color: var(--c);
                     color: #e2e8f0; box-shadow: 0 0 0 1px var(--c); }}
  .tab-dot {{ width: 8px; height: 8px; border-radius: 50%; flex-shrink: 0; }}
  .tab-count {{ background: #334155; border-radius: 20px; padding: 1px 8px;
                font-size: 11px; color: #94a3b8; }}

  /* ── Panels ── */
  .panels {{ padding: 20px 36px 40px; }}
  .panel {{ display: none; }}
  .panel.active {{ display: block; }}

  .student-header {{ background: #1e293b; border-radius: 14px; padding: 20px 24px;
                     display: flex; justify-content: space-between; align-items: flex-start;
                     flex-wrap: wrap; gap: 16px; margin-bottom: 16px; }}
  .student-header h2 {{ font-size: 20px; font-weight: 700; }}
  .student-header .sub {{ color: #64748b; font-size: 13px; margin-top: 3px; }}
  .stat-row {{ display: flex; gap: 12px; flex-wrap: wrap; }}
  .stat-box {{ background: #0f172a; border-radius: 10px; padding: 12px 18px; text-align: center; }}
  .stat-num {{ font-size: 22px; font-weight: 700; }}
  .stat-lbl {{ font-size: 11px; color: #64748b; margin-top: 2px; }}

  /* ── Progress ── */
  .progress-wrap {{ background: #1e293b; border-radius: 12px; padding: 16px 20px;
                    margin-bottom: 16px; }}
  .progress-label {{ display: flex; justify-content: space-between;
                     font-size: 13px; color: #94a3b8; margin-bottom: 10px; }}
  .progress-bg {{ background: #0f172a; border-radius: 99px; height: 10px; overflow: hidden; }}
  .progress-fill {{ height: 100%; border-radius: 99px; transition: width .6s ease; }}

  .note-box {{ background: #1e293b; border-left: 3px solid #f59e0b; border-radius: 8px;
               padding: 12px 16px; color: #fcd34d; font-size: 13px; margin-bottom: 16px; }}

  /* ── Table ── */
  .table-wrap {{ background: #1e293b; border-radius: 14px; overflow: hidden;
                 border: 1px solid #334155; margin-bottom: 12px; overflow-x: auto; }}
  table {{ width: 100%; border-collapse: collapse; font-size: 13px; }}
  thead th {{ background: #0f172a; color: #64748b; font-weight: 600; font-size: 11px;
              text-transform: uppercase; letter-spacing: .05em;
              padding: 12px 14px; text-align: left; white-space: nowrap; }}
  tbody tr {{ border-top: 1px solid #1e293b; }}
  tbody tr:hover {{ background: #263548; }}
  tbody td {{ padding: 11px 14px; color: #cbd5e1; vertical-align: middle; }}
  td.topic {{ max-width: 200px; white-space: nowrap; overflow: hidden;
              text-overflow: ellipsis; color: #e2e8f0; }}

  .dot {{ display: inline-block; width: 8px; height: 8px; border-radius: 50%;
          vertical-align: middle; margin-right: 4px; }}
  .dot.green {{ background: #22c55e; }}
  .dot.red   {{ background: #ef4444; }}

  .badge {{ display: inline-block; padding: 2px 8px; border-radius: 20px;
            font-size: 11px; font-weight: 600; }}
  .badge.phase2 {{ background: #1d4ed8; color: #bfdbfe; }}
  .badge.phase1 {{ background: #374151; color: #9ca3af; }}

  .icon-yes {{ font-size: 14px; }}
  .icon-no  {{ color: #334155; }}

  .add-lesson {{ color: #475569; font-size: 12px; padding: 8px 4px; }}
  .add-lesson code {{ background: #1e293b; padding: 2px 6px; border-radius: 4px; color: #7dd3fc; }}

  ::-webkit-scrollbar {{ width: 6px; height: 6px; }}
  ::-webkit-scrollbar-track {{ background: #1e293b; }}
  ::-webkit-scrollbar-thumb {{ background: #334155; border-radius: 3px; }}
</style>
</head>
<body>

<div class="header">
  <div>
    <h1>Brishna — Teacher Portal</h1>
    <p class="sub">AHK Academy &nbsp;·&nbsp; {total_students} Students &nbsp;·&nbsp; {total_lessons} Sessions Completed</p>
  </div>
  <div class="date">Generated: {today}</div>
</div>

<div class="top-stats">
  <div class="top-card">
    <div class="num">{total_students}</div>
    <div class="lbl">Active Students</div>
  </div>
  <div class="top-card">
    <div class="num">{total_lessons}</div>
    <div class="lbl">Total Sessions</div>
  </div>
  <div class="top-card">
    <div class="num">{sum(s['phase2_done'] for s in students)}</div>
    <div class="lbl">Contract Lessons</div>
  </div>
  <div class="top-card">
    <div class="num">{sum(PACKAGE_SIZE - s['phase2_done'] for s in students)}</div>
    <div class="lbl">Lessons Remaining</div>
  </div>
  <div class="top-card">
    <div class="num">{sum(s['hw_count'] for s in students)}</div>
    <div class="lbl">Homeworks Given</div>
  </div>
</div>

<div class="tabs-container">
  <div class="tabs">{tabs_html}</div>
</div>

<div class="panels">{panels_html}</div>

<script>
  document.querySelectorAll('.tab-btn').forEach(btn => {{
    btn.addEventListener('click', () => {{
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      document.getElementById(btn.dataset.tab).classList.add('active');
    }});
  }});
</script>
</body>
</html>"""

def main():
    print("Fetching data from DB...")
    students = fetch_data()
    print(f"Found {len(students)} students")
    html = generate_html(students)
    OUTPUT.write_text(html, encoding="utf-8")
    print(f"Portal saved: {OUTPUT}")
    print(f"Open in browser: file:///{str(OUTPUT).replace(chr(92),'/')}")

if __name__ == "__main__":
    main()
