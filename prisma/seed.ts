import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create Admin (Ahsan - CEO)
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "ahsan@ahkacademy.com" },
    update: {},
    create: {
      name: "Ahsan",
      email: "ahsan@ahkacademy.com",
      password: adminPassword,
      role: "ADMIN",
    },
  });
  console.log("Created admin:", admin.name);

  // Create Teacher (Brishna - Teaching Head)
  const teacherPassword = await bcrypt.hash("teacher123", 10);
  const teacher = await prisma.user.upsert({
    where: { email: "brishna@ahkacademy.com" },
    update: {},
    create: {
      name: "Brishna",
      email: "brishna@ahkacademy.com",
      password: teacherPassword,
      role: "TEACHER",
    },
  });
  console.log("Created teacher:", teacher.name);

  // Create Departments
  const deptCount = await prisma.department.count();
  if (deptCount === 0) {
    await prisma.department.createMany({
      data: [
        { name: "Marketing", headId: admin.id },
        { name: "Teaching", headId: teacher.id },
        { name: "Sales", headId: admin.id },
      ],
    });
    console.log("Created departments: Marketing, Teaching, Sales");
  }

  // Create English Course
  let course = await prisma.course.findFirst({ where: { title: "English - Beginner" } });
  if (!course) {
    course = await prisma.course.create({
      data: {
        title: "English - Beginner",
        description: "Learn English from scratch — 100 lessons comprehensive course",
        level: "Beginner",
        language: "English",
        price: 0,
      },
    });
    console.log("Created course:", course.title);
  }

  // Create a class
  let englishClass = await prisma.class.findFirst({ where: { name: "English A1 - Morning Batch" } });
  if (!englishClass) {
    englishClass = await prisma.class.create({
      data: {
        name: "English A1 - Morning Batch",
        courseId: course.id,
        teacherId: teacher.id,
        schedule: "Mon/Wed/Fri 10:00 AM + 2 flexible days",
        maxStudents: 30,
      },
    });
    console.log("Created class:", englishClass.name);
  }

  // Create a sample student for testing
  const studentPassword = await bcrypt.hash("student123", 10);
  const student = await prisma.user.upsert({
    where: { email: "student@ahkacademy.com" },
    update: {},
    create: {
      name: "Test Student",
      email: "student@ahkacademy.com",
      password: studentPassword,
      role: "STUDENT",
      phone: "+1234567890",
    },
  });
  console.log("Created test student:", student.name);

  // Enroll test student
  const enrollment = await prisma.enrollment.upsert({
    where: { studentId_classId: { studentId: student.id, classId: englishClass.id } },
    update: {},
    create: {
      studentId: student.id,
      classId: englishClass.id,
      status: "ACTIVE",
    },
  });
  console.log("Enrolled test student in class");

  // Create sample lessons
  const lessonCount = await prisma.lesson.count({ where: { classId: englishClass.id } });
  if (lessonCount === 0) {
    const lessons = [];
    const startDate = new Date("2026-05-01");
    const topics = [
      "Introduction & Greetings",
      "Alphabet & Pronunciation",
      "Numbers & Counting",
      "Days, Months & Time",
      "Common Phrases",
      "Present Tense Basics",
      "Nouns & Articles",
      "Adjectives & Descriptions",
      "Family & Relationships",
      "Food & Drinks",
    ];
    for (let i = 0; i < 10; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i * 2);
      lessons.push({
        classId: englishClass.id,
        title: `Lesson ${i + 1}: ${topics[i]}`,
        topics: topics[i],
        content: `Content for lesson ${i + 1} covering ${topics[i]}`,
        order: i + 1,
        date,
      });
    }
    await prisma.lesson.createMany({ data: lessons });
    console.log("Created 10 sample lessons");

    // Mark attendance for first 5 lessons
    const createdLessons = await prisma.lesson.findMany({
      where: { classId: englishClass.id },
      orderBy: { order: "asc" },
      take: 5,
    });
    for (const lesson of createdLessons) {
      await prisma.attendance.create({
        data: {
          studentId: student.id,
          lessonId: lesson.id,
          status: Math.random() > 0.2 ? "PRESENT" : "ABSENT",
          markedById: teacher.id,
        },
      });
    }
    console.log("Marked attendance for 5 lessons");
  }

  // Create sample payment
  const paymentCount = await prisma.payment.count({ where: { studentId: student.id } });
  if (paymentCount === 0) {
    await prisma.payment.create({
      data: {
        studentId: student.id,
        amount: 500,
        paidAmount: 200,
        status: "PARTIAL",
        method: "bank transfer",
        description: "English Course - Installment 1",
        dueDate: new Date("2026-06-01"),
      },
    });
    console.log("Created sample payment record");
  }

  console.log("\n========= LOGIN CREDENTIALS =========");
  console.log("Admin:   ahsan@ahkacademy.com / admin123");
  console.log("Teacher: brishna@ahkacademy.com / teacher123");
  console.log("Student: student@ahkacademy.com / student123");
  console.log("=====================================\n");
  console.log("Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
