"""Check WhatsApp messages around each Phase 2 lesson to find real start times."""
import re
from datetime import datetime, timedelta

LESSON_DATES = [
    "2026-03-01","2026-03-03","2026-03-05","2026-03-08","2026-03-10",
    "2026-03-13","2026-03-15","2026-03-18","2026-03-25","2026-03-30",
    "2026-04-04","2026-04-06","2026-04-26","2026-04-28","2026-04-30",
    "2026-05-03","2026-05-05","2026-05-08",
]

CHAT_FILE = r"C:\Users\ahk79\AHK_Academy\STUDENTS\Gurkan\WhatsApp_New\WhatsApp Chat with Gurkan.txt"

pattern = re.compile(
    r'^(\d{1,2}/\d{1,2}/\d{2,4}),\s*(\d{1,2}:\d{2}\s*[AP]M)\s*-\s*([^:]+):\s*(.+)$'
)

messages = []
with open(CHAT_FILE, encoding="utf-8") as f:
    for line in f:
        m = pattern.match(line.strip())
        if m:
            date_str, time_str, sender, content = m.groups()
            for fmt in ("%m/%d/%y %I:%M %p", "%m/%d/%Y %I:%M %p"):
                try:
                    dt = datetime.strptime(f"{date_str} {time_str}", fmt)
                    messages.append((dt, sender.strip(), content.strip()))
                    break
                except:
                    pass

KEYWORDS = ["meet","lesson","join","link","tonight","ready","start",
            "21","22","20","19","18","17","9 pm","10 pm","8 pm","lesson"]

for ld in LESSON_DATES:
    target = datetime.strptime(ld, "%Y-%m-%d").date()
    # Messages from eve before + day of
    window = [(dt, s, c) for dt, s, c in messages
              if target - timedelta(days=1) <= dt.date() <= target]
    # Evening + keyword filter
    relevant = [(dt, s, c) for dt, s, c in window
                if dt.hour >= 17 or any(k in c.lower() for k in KEYWORDS)]
    if relevant:
        print(f"\n{'='*55}")
        print(f"  {ld}")
        print(f"{'='*55}")
        for dt, s, c in relevant[-10:]:
            direction = "→" if s == "Ahsan" else "←"
            print(f"  {dt.strftime('%m/%d %H:%M')}  {direction}  {c[:80]}")
    else:
        print(f"\n  {ld}  — no evening messages found")
