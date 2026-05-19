import sqlite3
import os
import secrets

DB_PATH = os.path.join(os.path.dirname(__file__), 'attendance.db')


def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    conn = get_db()
    conn.executescript('''
        CREATE TABLE IF NOT EXISTS students (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            start_date TEXT NOT NULL,
            fee_per_lesson REAL NOT NULL DEFAULT 0,
            subject TEXT,
            lessons_planned INTEGER NOT NULL DEFAULT 0,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS lessons (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            lesson_date TEXT NOT NULL,
            status TEXT NOT NULL DEFAULT 'scheduled',
            topic TEXT,
            duration_minutes INTEGER DEFAULT 60,
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            amount REAL NOT NULL,
            payment_date TEXT NOT NULL,
            payment_method TEXT DEFAULT 'IBAN',
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS packages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            total_lessons INTEGER NOT NULL,
            total_price REAL NOT NULL,
            payment_interval INTEGER NOT NULL DEFAULT 25,
            currency TEXT NOT NULL DEFAULT 'TL',
            notes TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );
    ''')
    conn.commit()

    # Safe migration: add package_id to students if not already present
    try:
        conn.execute('ALTER TABLE students ADD COLUMN package_id INTEGER REFERENCES packages(id)')
        conn.commit()
    except Exception:
        pass

    conn.close()


def compute_milestone_status(lessons_completed, package):
    """Calculate how much is due, how much paid, and what's next based on lesson milestones."""
    interval = package['payment_interval']
    total = package['total_lessons']
    price = package['total_price']
    num_installments = total // interval
    installment = price / num_installments
    milestones_passed = lessons_completed // interval
    amount_due = milestones_passed * installment
    next_milestone = (milestones_passed + 1) * interval
    if next_milestone > total:
        next_milestone = None  # package fully unlocked
    return {
        'installment': installment,
        'milestones_passed': milestones_passed,
        'milestones_total': num_installments,
        'amount_due': amount_due,
        'next_milestone_lesson': next_milestone,
        'currency': package['currency'],
        'total_price': price,
        'total_lessons': total,
        'payment_interval': interval,
    }


def get_student_by_token(token):
    conn = get_db()
    s = conn.execute('SELECT * FROM students WHERE portal_token = ?', (token,)).fetchone()
    if not s:
        conn.close()
        return None, [], [], None
    sid = s['id']
    lessons = conn.execute(
        'SELECT * FROM lessons WHERE student_id = ? ORDER BY lesson_date DESC',
        (sid,)
    ).fetchall()
    payments = conn.execute(
        'SELECT * FROM payments WHERE student_id = ? ORDER BY payment_date DESC',
        (sid,)
    ).fetchall()
    package = None
    if s['package_id']:
        pkg = conn.execute('SELECT * FROM packages WHERE id = ?', (s['package_id'],)).fetchone()
        if pkg:
            package = dict(pkg)
    conn.close()
    return dict(s), [dict(l) for l in lessons], [dict(p) for p in payments], package


def ensure_portal_tokens():
    conn = get_db()
    students = conn.execute('SELECT id FROM students WHERE portal_token IS NULL').fetchall()
    for s in students:
        conn.execute('UPDATE students SET portal_token=? WHERE id=?',
                     (secrets.token_urlsafe(16), s['id']))
    if students:
        conn.commit()
    conn.close()


def get_all_packages():
    conn = get_db()
    rows = conn.execute('''
        SELECT p.*, COUNT(s.id) AS student_count
        FROM packages p
        LEFT JOIN students s ON s.package_id = p.id
        GROUP BY p.id
        ORDER BY p.name
    ''').fetchall()
    conn.close()
    return [dict(r) for r in rows]


def get_students_summary():
    conn = get_db()
    rows = conn.execute('''
        SELECT
            s.*,
            pkg.name         AS package_name,
            pkg.total_lessons        AS pkg_total_lessons,
            pkg.total_price          AS pkg_total_price,
            pkg.payment_interval     AS pkg_payment_interval,
            pkg.currency             AS pkg_currency,
            COALESCE(lc.completed, 0)  AS lessons_completed,
            COALESCE(lc.scheduled, 0)  AS lessons_scheduled,
            COALESCE(pc.paid, 0.0)     AS total_paid
        FROM students s
        LEFT JOIN packages pkg ON s.package_id = pkg.id
        LEFT JOIN (
            SELECT student_id,
                   SUM(CASE WHEN status = "completed" THEN 1 ELSE 0 END) AS completed,
                   SUM(CASE WHEN status = "scheduled" THEN 1 ELSE 0 END) AS scheduled
            FROM lessons GROUP BY student_id
        ) lc ON s.id = lc.student_id
        LEFT JOIN (
            SELECT student_id, SUM(amount) AS paid
            FROM payments GROUP BY student_id
        ) pc ON s.id = pc.student_id
        ORDER BY s.name
    ''').fetchall()
    conn.close()

    result = []
    for r in rows:
        row = dict(r)
        completed = row['lessons_completed']
        paid = row['total_paid']

        if row['package_id']:
            ms = compute_milestone_status(completed, {
                'total_lessons': row['pkg_total_lessons'],
                'total_price': row['pkg_total_price'],
                'payment_interval': row['pkg_payment_interval'],
                'currency': row['pkg_currency'],
            })
            row['total_owed'] = ms['amount_due']
            row['balance'] = ms['amount_due'] - paid
            row['billing_type'] = 'package'
            row['milestone_status'] = ms
        else:
            row['total_owed'] = row['fee_per_lesson'] * completed
            row['balance'] = row['total_owed'] - paid
            row['billing_type'] = 'per_lesson'
            row['milestone_status'] = None

        result.append(row)
    return result


def get_student_detail(student_id):
    conn = get_db()
    s = conn.execute('SELECT * FROM students WHERE id = ?', (student_id,)).fetchone()
    if not s:
        conn.close()
        return None, [], [], None
    lessons = conn.execute(
        'SELECT * FROM lessons WHERE student_id = ? ORDER BY lesson_date DESC',
        (student_id,)
    ).fetchall()
    payments = conn.execute(
        'SELECT * FROM payments WHERE student_id = ? ORDER BY payment_date DESC',
        (student_id,)
    ).fetchall()
    package = None
    if s['package_id']:
        pkg = conn.execute('SELECT * FROM packages WHERE id = ?', (s['package_id'],)).fetchone()
        if pkg:
            package = dict(pkg)
    conn.close()
    return dict(s), [dict(l) for l in lessons], [dict(p) for p in payments], package


def get_dashboard_stats():
    conn = get_db()
    total_students = conn.execute('SELECT COUNT(*) FROM students').fetchone()[0]
    lessons_this_week = conn.execute(
        "SELECT COUNT(*) FROM lessons WHERE status='completed' AND lesson_date >= date('now','-7 days')"
    ).fetchone()[0]
    revenue_this_month = conn.execute(
        "SELECT COALESCE(SUM(amount),0) FROM payments WHERE payment_date >= date('now','start of month')"
    ).fetchone()[0]

    # Monthly lesson counts for chart (last 6 months)
    monthly = conn.execute('''
        SELECT strftime('%Y-%m', lesson_date) AS month, COUNT(*) AS cnt
        FROM lessons WHERE status='completed'
        AND lesson_date >= date('now','-6 months')
        GROUP BY month ORDER BY month
    ''').fetchall()

    # Recent payments
    recent_payments = conn.execute('''
        SELECT p.*, s.name AS student_name
        FROM payments p JOIN students s ON p.student_id = s.id
        ORDER BY p.payment_date DESC LIMIT 8
    ''').fetchall()

    # Upcoming lessons
    upcoming = conn.execute('''
        SELECT l.*, s.name AS student_name
        FROM lessons l JOIN students s ON l.student_id = s.id
        WHERE l.status = 'scheduled' AND l.lesson_date >= date('now')
        ORDER BY l.lesson_date ASC LIMIT 8
    ''').fetchall()

    conn.close()

    # Outstanding balances — computed in Python to handle both billing models
    summary = get_students_summary()
    outstanding_tl = sum(s['balance'] for s in summary if s['balance'] > 0 and s['billing_type'] == 'package')
    outstanding_gbp = sum(s['balance'] for s in summary if s['balance'] > 0 and s['billing_type'] == 'per_lesson')

    return {
        'total_students': total_students,
        'lessons_this_week': lessons_this_week,
        'revenue_this_month': revenue_this_month,
        'outstanding_tl': outstanding_tl,
        'outstanding_gbp': outstanding_gbp,
        'monthly': [dict(r) for r in monthly],
        'recent_payments': [dict(r) for r in recent_payments],
        'upcoming': [dict(r) for r in upcoming],
    }
