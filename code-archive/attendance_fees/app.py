import csv
import io
from datetime import date, datetime
from flask import Flask, render_template, request, redirect, url_for, flash, Response
from db import (get_db, init_db, get_students_summary, get_student_detail,
                get_dashboard_stats, get_all_packages, compute_milestone_status,
                get_student_by_token)

app = Flask(__name__)
app.secret_key = 'attendance-fees-secret-2024'


@app.template_filter('currency')
def currency_filter(value):
    try:
        return f"£{float(value):,.2f}"
    except (ValueError, TypeError):
        return "£0.00"


@app.template_filter('tl')
def tl_filter(value):
    try:
        return f"₺{float(value):,.0f}"
    except (ValueError, TypeError):
        return "₺0"


@app.template_filter('date_fmt')
def date_fmt(value):
    if not value:
        return '—'
    try:
        return datetime.strptime(value[:10], '%Y-%m-%d').strftime('%d %b %Y')
    except ValueError:
        return value


# ── Dashboard ────────────────────────────────────────────────────────────────

@app.route('/')
def dashboard():
    stats = get_dashboard_stats()
    return render_template('dashboard.html', stats=stats)


# ── Packages ──────────────────────────────────────────────────────────────────

@app.route('/packages')
def packages():
    all_packages = get_all_packages()
    return render_template('packages.html', packages=all_packages)


@app.route('/packages/new', methods=['GET', 'POST'])
def package_new():
    if request.method == 'POST':
        name = request.form['name'].strip()
        if not name:
            flash('Package name is required.', 'danger')
            return redirect(url_for('package_new'))
        conn = get_db()
        conn.execute('''
            INSERT INTO packages (name, total_lessons, total_price, payment_interval, currency, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            name,
            int(request.form['total_lessons']),
            float(request.form['total_price']),
            int(request.form.get('payment_interval', 25)),
            request.form.get('currency', 'TL'),
            request.form.get('notes', '').strip(),
        ))
        conn.commit()
        conn.close()
        flash(f'Package "{name}" created.', 'success')
        return redirect(url_for('packages'))
    return render_template('package_form.html', package=None)


@app.route('/packages/<int:package_id>/edit', methods=['GET', 'POST'])
def package_edit(package_id):
    conn = get_db()
    pkg = conn.execute('SELECT * FROM packages WHERE id = ?', (package_id,)).fetchone()
    if not pkg:
        conn.close()
        flash('Package not found.', 'danger')
        return redirect(url_for('packages'))
    if request.method == 'POST':
        name = request.form['name'].strip()
        conn.execute('''
            UPDATE packages SET name=?, total_lessons=?, total_price=?,
                payment_interval=?, currency=?, notes=?
            WHERE id=?
        ''', (
            name,
            int(request.form['total_lessons']),
            float(request.form['total_price']),
            int(request.form.get('payment_interval', 25)),
            request.form.get('currency', 'TL'),
            request.form.get('notes', '').strip(),
            package_id,
        ))
        conn.commit()
        conn.close()
        flash(f'Package "{name}" updated.', 'success')
        return redirect(url_for('packages'))
    p = dict(pkg)
    conn.close()
    return render_template('package_form.html', package=p)


@app.route('/packages/<int:package_id>/delete', methods=['POST'])
def package_delete(package_id):
    conn = get_db()
    row = conn.execute('SELECT name FROM packages WHERE id=?', (package_id,)).fetchone()
    if row:
        # Unassign students on this package before deleting
        conn.execute('UPDATE students SET package_id=NULL WHERE package_id=?', (package_id,))
        conn.execute('DELETE FROM packages WHERE id=?', (package_id,))
        conn.commit()
        flash(f'Package "{row["name"]}" deleted.', 'success')
    conn.close()
    return redirect(url_for('packages'))


# ── Students ─────────────────────────────────────────────────────────────────

@app.route('/students')
def students():
    search = request.args.get('q', '').strip().lower()
    all_students = get_students_summary()
    if search:
        all_students = [s for s in all_students if search in s['name'].lower()
                        or search in (s['subject'] or '').lower()
                        or search in (s['email'] or '').lower()]
    return render_template('students.html', students=all_students, search=search)


@app.route('/students/new', methods=['GET', 'POST'])
def student_new():
    if request.method == 'POST':
        name = request.form['name'].strip()
        if not name:
            flash('Student name is required.', 'danger')
            return redirect(url_for('student_new'))
        package_id = request.form.get('package_id') or None
        if package_id:
            package_id = int(package_id)
        conn = get_db()
        conn.execute('''
            INSERT INTO students (name, email, phone, start_date, fee_per_lesson,
                                  subject, lessons_planned, notes, package_id)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            name,
            request.form.get('email', '').strip(),
            request.form.get('phone', '').strip(),
            request.form['start_date'],
            float(request.form.get('fee_per_lesson', 0) or 0),
            request.form.get('subject', '').strip(),
            int(request.form.get('lessons_planned', 0) or 0),
            request.form.get('notes', '').strip(),
            package_id,
        ))
        conn.commit()
        conn.close()
        flash(f'Student "{name}" added successfully!', 'success')
        return redirect(url_for('students'))
    all_packages = get_all_packages()
    return render_template('student_form.html', student=None,
                           packages=all_packages, today=date.today().isoformat())


@app.route('/students/<int:student_id>')
def student_detail(student_id):
    student, lessons, payments, package = get_student_detail(student_id)
    if not student:
        flash('Student not found.', 'danger')
        return redirect(url_for('students'))

    lessons_completed = sum(1 for l in lessons if l['status'] == 'completed')
    lessons_scheduled = sum(1 for l in lessons if l['status'] == 'scheduled')
    total_paid = sum(p['amount'] for p in payments)

    if package:
        ms = compute_milestone_status(lessons_completed, package)
        total_owed = ms['amount_due']
        milestone_status = ms
    else:
        ms = None
        total_owed = student['fee_per_lesson'] * lessons_completed
        milestone_status = None

    balance = total_owed - total_paid
    lessons_planned = student.get('lessons_planned') or (package['total_lessons'] if package else 0)
    lesson_pct = round(lessons_completed / lessons_planned * 100) if lessons_planned else 0
    pay_pct = round(total_paid / total_owed * 100) if total_owed else 100

    return render_template('student_detail.html',
                           student=student,
                           package=package,
                           milestone_status=milestone_status,
                           lessons=lessons,
                           payments=payments,
                           lessons_completed=lessons_completed,
                           lessons_scheduled=lessons_scheduled,
                           total_paid=total_paid,
                           total_owed=total_owed,
                           balance=balance,
                           lesson_pct=lesson_pct,
                           pay_pct=pay_pct)


@app.route('/students/<int:student_id>/edit', methods=['GET', 'POST'])
def student_edit(student_id):
    conn = get_db()
    student = conn.execute('SELECT * FROM students WHERE id = ?', (student_id,)).fetchone()
    if not student:
        conn.close()
        flash('Student not found.', 'danger')
        return redirect(url_for('students'))
    if request.method == 'POST':
        name = request.form['name'].strip()
        package_id = request.form.get('package_id') or None
        if package_id:
            package_id = int(package_id)
        conn.execute('''
            UPDATE students SET name=?, email=?, phone=?, start_date=?,
                fee_per_lesson=?, subject=?, lessons_planned=?, notes=?, package_id=?
            WHERE id=?
        ''', (
            name,
            request.form.get('email', '').strip(),
            request.form.get('phone', '').strip(),
            request.form['start_date'],
            float(request.form.get('fee_per_lesson', 0) or 0),
            request.form.get('subject', '').strip(),
            int(request.form.get('lessons_planned', 0) or 0),
            request.form.get('notes', '').strip(),
            package_id,
            student_id,
        ))
        conn.commit()
        conn.close()
        flash(f'Student "{name}" updated.', 'success')
        return redirect(url_for('student_detail', student_id=student_id))
    s = dict(student)
    conn.close()
    all_packages = get_all_packages()
    return render_template('student_form.html', student=s,
                           packages=all_packages, today=date.today().isoformat())


@app.route('/students/<int:student_id>/delete', methods=['POST'])
def student_delete(student_id):
    conn = get_db()
    row = conn.execute('SELECT name FROM students WHERE id=?', (student_id,)).fetchone()
    if row:
        conn.execute('DELETE FROM students WHERE id=?', (student_id,))
        conn.commit()
        flash(f'Student "{row["name"]}" deleted.', 'success')
    conn.close()
    return redirect(url_for('students'))


# ── Lessons ───────────────────────────────────────────────────────────────────

@app.route('/lessons/new', methods=['GET', 'POST'])
def lesson_new():
    student_id = request.args.get('student_id') or request.form.get('student_id')
    if request.method == 'POST':
        conn = get_db()
        conn.execute('''
            INSERT INTO lessons (student_id, lesson_date, status, topic, duration_minutes, notes)
            VALUES (?, ?, ?, ?, ?, ?)
        ''', (
            int(request.form['student_id']),
            request.form['lesson_date'],
            request.form.get('status', 'scheduled'),
            request.form.get('topic', '').strip(),
            int(request.form.get('duration_minutes', 60) or 60),
            request.form.get('notes', '').strip(),
        ))
        conn.commit()
        conn.close()
        flash('Lesson added.', 'success')
        return redirect(url_for('student_detail', student_id=int(request.form['student_id'])))

    conn = get_db()
    all_students = conn.execute('SELECT id, name FROM students ORDER BY name').fetchall()
    conn.close()
    return render_template('lesson_form.html',
                           lesson=None,
                           students=all_students,
                           preselected_student=student_id,
                           today=date.today().isoformat())


@app.route('/lessons/<int:lesson_id>/edit', methods=['GET', 'POST'])
def lesson_edit(lesson_id):
    conn = get_db()
    lesson = conn.execute('SELECT * FROM lessons WHERE id=?', (lesson_id,)).fetchone()
    if not lesson:
        conn.close()
        flash('Lesson not found.', 'danger')
        return redirect(url_for('students'))
    if request.method == 'POST':
        conn.execute('''
            UPDATE lessons SET lesson_date=?, status=?, topic=?, duration_minutes=?, notes=?
            WHERE id=?
        ''', (
            request.form['lesson_date'],
            request.form['status'],
            request.form.get('topic', '').strip(),
            int(request.form.get('duration_minutes', 60) or 60),
            request.form.get('notes', '').strip(),
            lesson_id,
        ))
        conn.commit()
        sid = lesson['student_id']
        conn.close()
        flash('Lesson updated.', 'success')
        return redirect(url_for('student_detail', student_id=sid))
    l = dict(lesson)
    all_students = conn.execute('SELECT id, name FROM students ORDER BY name').fetchall()
    conn.close()
    return render_template('lesson_form.html', lesson=l, students=all_students,
                           preselected_student=l['student_id'],
                           today=date.today().isoformat())


@app.route('/lessons/<int:lesson_id>/complete', methods=['POST'])
def lesson_complete(lesson_id):
    conn = get_db()
    row = conn.execute('SELECT student_id FROM lessons WHERE id=?', (lesson_id,)).fetchone()
    if row:
        conn.execute("UPDATE lessons SET status='completed' WHERE id=?", (lesson_id,))
        conn.commit()
        flash('Lesson marked as completed.', 'success')
    conn.close()
    return redirect(url_for('student_detail', student_id=row['student_id']))


@app.route('/lessons/<int:lesson_id>/delete', methods=['POST'])
def lesson_delete(lesson_id):
    conn = get_db()
    row = conn.execute('SELECT student_id FROM lessons WHERE id=?', (lesson_id,)).fetchone()
    if row:
        conn.execute('DELETE FROM lessons WHERE id=?', (lesson_id,))
        conn.commit()
        flash('Lesson deleted.', 'success')
    conn.close()
    return redirect(url_for('student_detail', student_id=row['student_id']))


# ── Payments ──────────────────────────────────────────────────────────────────

@app.route('/payments/new', methods=['GET', 'POST'])
def payment_new():
    student_id = request.args.get('student_id') or request.form.get('student_id')
    if request.method == 'POST':
        conn = get_db()
        conn.execute('''
            INSERT INTO payments (student_id, amount, payment_date, payment_method, notes)
            VALUES (?, ?, ?, ?, ?)
        ''', (
            int(request.form['student_id']),
            float(request.form['amount']),
            request.form['payment_date'],
            request.form.get('payment_method', 'IBAN'),
            request.form.get('notes', '').strip(),
        ))
        conn.commit()
        conn.close()
        flash('Payment recorded.', 'success')
        return redirect(url_for('student_detail', student_id=int(request.form['student_id'])))

    conn = get_db()
    all_students = conn.execute('SELECT id, name FROM students ORDER BY name').fetchall()
    conn.close()
    return render_template('payment_form.html',
                           payment=None,
                           students=all_students,
                           preselected_student=student_id,
                           today=date.today().isoformat())


@app.route('/payments/<int:payment_id>/delete', methods=['POST'])
def payment_delete(payment_id):
    conn = get_db()
    row = conn.execute('SELECT student_id FROM payments WHERE id=?', (payment_id,)).fetchone()
    if row:
        conn.execute('DELETE FROM payments WHERE id=?', (payment_id,))
        conn.commit()
        flash('Payment deleted.', 'success')
    conn.close()
    return redirect(url_for('student_detail', student_id=row['student_id']))


# ── Student Portal ───────────────────────────────────────────────────────────

@app.route('/portal/<token>')
def student_portal(token):
    student, lessons, payments, package = get_student_by_token(token)
    if not student:
        return render_template('portal_404.html'), 404

    completed = [l for l in lessons if l['status'] == 'completed']
    absent    = [l for l in lessons if l['status'] == 'cancelled']
    scheduled = [l for l in lessons if l['status'] == 'scheduled']
    total_lessons = len(lessons)
    attend_rate = round(len(completed) / total_lessons * 100) if total_lessons else 100

    # Streak: count consecutive completed sessions from most recent backwards
    streak = 0
    for l in lessons:  # already ordered DESC by date
        if l['status'] == 'completed':
            streak += 1
        else:
            break

    total_paid = sum(p['amount'] for p in payments)

    if package:
        ms = compute_milestone_status(len(completed), package)
        total_owed = ms['amount_due']
        milestone_status = ms
    else:
        ms = None
        total_owed = student['fee_per_lesson'] * len(completed)
        milestone_status = None

    balance = total_owed - total_paid
    total_planned = package['total_lessons'] if package else (student['lessons_planned'] or 0)
    lesson_pct = round(len(completed) / total_planned * 100) if total_planned else 0

    return render_template('student_portal.html',
                           student=student,
                           package=package,
                           milestone_status=milestone_status,
                           lessons=lessons,
                           completed=completed,
                           absent=absent,
                           scheduled=scheduled,
                           attend_rate=attend_rate,
                           streak=streak,
                           payments=payments,
                           total_paid=total_paid,
                           total_owed=total_owed,
                           balance=balance,
                           lesson_pct=lesson_pct,
                           total_planned=total_planned)


# ── Export ────────────────────────────────────────────────────────────────────

@app.route('/export/students')
def export_students():
    students = get_students_summary()
    buf = io.StringIO()
    writer = csv.writer(buf)
    writer.writerow(['Name', 'Email', 'Phone', 'Subject', 'Start Date',
                     'Package', 'Lessons Planned', 'Lessons Completed',
                     'Total Owed', 'Total Paid', 'Balance', 'Currency'])
    for s in students:
        currency = s.get('pkg_currency', 'GBP') if s['package_id'] else 'GBP'
        pkg_name = s.get('package_name', '') or ''
        writer.writerow([
            s['name'], s['email'], s['phone'], s['subject'], s['start_date'],
            pkg_name,
            s.get('lessons_planned', ''), s['lessons_completed'],
            round(s['total_owed'], 2), round(s['total_paid'], 2),
            round(s['balance'], 2), currency,
        ])
    output = buf.getvalue()
    return Response(output, mimetype='text/csv',
                    headers={'Content-Disposition': 'attachment; filename=students.csv'})


if __name__ == '__main__':
    init_db()
    print("\n  Attendance & Fees System running at: http://127.0.0.1:5000\n")
    app.run(debug=True, port=5000)
