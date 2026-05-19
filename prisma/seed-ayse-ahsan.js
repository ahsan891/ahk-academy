const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find Ayse and Ahsan
  const ayse = await prisma.user.findFirst({ where: { email: 'ayse@ahkacademy.student' } });
  const ahsan = await prisma.user.findFirst({ where: { email: 'ahsan@ahkacademy.com' } });

  if (!ayse || !ahsan) {
    console.log('Ayse or Ahsan not found!');
    return;
  }
  console.log('Ayse ID:', ayse.id);
  console.log('Ahsan ID:', ahsan.id);

  // Find the course for this class
  const course = await prisma.course.findFirst({ where: { title: { contains: 'A1' } } });
  if (!course) {
    console.log('No A1 course found, using first available...');
  }

  // Create dedicated class for Ayse's sessions with Ahsan
  const existingClass = await prisma.class.findFirst({ where: { name: 'Ayse - Ahsan Sessions' } });
  let ayseClass;

  if (existingClass) {
    console.log('Class already exists:', existingClass.id);
    ayseClass = existingClass;
  } else {
    ayseClass = await prisma.class.create({
      data: {
        name: 'Ayse - Ahsan Sessions',
        courseId: course ? course.id : (await prisma.course.findFirst()).id,
        teacherId: ahsan.id,
        schedule: 'Tue/Wed/Thu afternoons (Nov 2025 - Mar 2026)',
        maxStudents: 1,
      }
    });
    console.log('Created class:', ayseClass.id);

    // Enroll Ayse
    await prisma.enrollment.create({
      data: {
        studentId: ayse.id,
        classId: ayseClass.id,
      }
    });
    console.log('Enrolled Ayse');
  }

  // 30 session dates with Ahsan (all PRESENT)
  // Format: DD/MM/YYYY -> Date objects
  const sessionDates = [
    '2025-11-04', '2025-11-05', '2025-11-06',
    '2025-11-11', '2025-11-12', '2025-11-13',
    '2025-11-18', '2025-11-19', '2025-11-20',
    '2025-11-25', '2025-11-26',
    '2025-12-02', '2025-12-03', '2025-12-04',
    '2025-12-08', '2025-12-15', '2025-12-17', '2025-12-18',
    '2025-12-30', '2025-12-31',
    '2026-01-08', '2026-01-15', '2026-01-19', '2026-01-22', '2026-01-29',
    '2026-02-03', '2026-02-05', '2026-02-06', '2026-02-20',
    '2026-03-06',
  ];

  console.log(`\nCreating ${sessionDates.length} lessons + attendance...`);

  let created = 0;
  let skipped = 0;

  for (let i = 0; i < sessionDates.length; i++) {
    const dateStr = sessionDates[i];
    const date = new Date(dateStr + 'T14:00:00.000Z'); // afternoon sessions
    const sessionNum = i + 1;

    // Check if lesson already exists for this date in this class
    const existing = await prisma.lesson.findFirst({
      where: {
        classId: ayseClass.id,
        date: {
          gte: new Date(dateStr + 'T00:00:00.000Z'),
          lt: new Date(dateStr + 'T23:59:59.000Z'),
        }
      }
    });

    if (existing) {
      skipped++;
      continue;
    }

    // Create lesson
    const lesson = await prisma.lesson.create({
      data: {
        classId: ayseClass.id,
        title: `Ahsan Session ${sessionNum}`,
        topics: `Ahsan Session ${sessionNum}`,
        date: date,
      }
    });

    // Create attendance (all PRESENT)
    await prisma.attendance.create({
      data: {
        studentId: ayse.id,
        lessonId: lesson.id,
        status: 'PRESENT',
        markedById: ahsan.id,
      }
    });

    created++;
  }

  console.log(`Created: ${created} | Skipped: ${skipped}`);

  // Count total attendance
  const totalAttendance = await prisma.attendance.count({ where: { studentId: ayse.id } });
  const presentCount = await prisma.attendance.count({ where: { studentId: ayse.id, status: 'PRESENT' } });
  console.log(`\nAyse total attendance: ${totalAttendance} (${presentCount} present)`);

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
