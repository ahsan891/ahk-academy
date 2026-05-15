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

  // ============ SPEAKING SESSION SYSTEM ============
  console.log("\nSeeding speaking session system...");

  // Create more students for speaking groups
  const studentNames = [
    { name: "Elif Yilmaz", email: "elif@students.com" },
    { name: "Mehmet Kaya", email: "mehmet@students.com" },
    { name: "Ayse Demir", email: "ayse@students.com" },
    { name: "Fatma Ozturk", email: "fatma@students.com" },
    { name: "Ali Celik", email: "ali@students.com" },
    { name: "Zeynep Arslan", email: "zeynep@students.com" },
    { name: "Emre Yildiz", email: "emre@students.com" },
    { name: "Selin Koc", email: "selin@students.com" },
    { name: "Burak Sahin", email: "burak@students.com" },
    { name: "Deniz Aydin", email: "deniz@students.com" },
  ];

  const students = [student];
  for (const s of studentNames) {
    const u = await prisma.user.upsert({
      where: { email: s.email },
      update: {},
      create: { name: s.name, email: s.email, password: studentPassword, role: "STUDENT" },
    });
    students.push(u);

    // Enroll in Brishna's class
    await prisma.enrollment.upsert({
      where: { studentId_classId: { studentId: u.id, classId: englishClass.id } },
      update: {},
      create: { studentId: u.id, classId: englishClass.id, status: "ACTIVE" },
    });
  }
  console.log("Created 10 Turkish students");

  // Create speaking profiles
  const levels = ["beginner", "elementary", "intermediate", "upper_intermediate"];
  const tracks = ["speaking_only", "full_student", "full_student", "speaking_only", "full_student"];
  for (let i = 0; i < students.length; i++) {
    await prisma.studentSpeakingProfile.upsert({
      where: { userId: students[i].id },
      update: {},
      create: {
        userId: students[i].id,
        track: tracks[i % tracks.length],
        level: levels[i % levels.length],
        totalSessions: Math.floor(Math.random() * 15),
        averageRating: 3.5 + Math.random() * 1.5,
      },
    });
  }
  console.log("Created speaking profiles");

  // Create Topics
  const topicData = [
    { title: "Describe Your Dream Vacation", category: "Conversation", level: "intermediate", description: "Practice using future tense and conditional sentences while describing ideal travel destinations.", preparationTips: "Think about 3 places you'd love to visit. Prepare vocabulary about travel, accommodation, and activities.", isSystemGenerated: true },
    { title: "Job Interview Practice", category: "Interview", level: "upper_intermediate", description: "Role-play common job interview questions and practice professional English.", preparationTips: "Prepare your 'Tell me about yourself' answer. Think about your strengths and weaknesses in English.", isSystemGenerated: true },
    { title: "Debate: Social Media Impact", category: "Debate", level: "intermediate", description: "Discuss whether social media has a positive or negative impact on society.", preparationTips: "List 3 advantages and 3 disadvantages of social media. Practice phrases like 'In my opinion', 'I disagree because'.", isSystemGenerated: true },
    { title: "Ordering Food at a Restaurant", category: "Conversation", level: "beginner", description: "Practice ordering food, asking questions about the menu, and making requests.", preparationTips: "Learn food vocabulary. Practice 'Could I have...', 'I would like...', 'What do you recommend?'", isSystemGenerated: true },
    { title: "Conditional Sentences in Daily Life", category: "Grammar", level: "intermediate", description: "Practice using first, second, and third conditionals in real conversation.", preparationTips: "Review if/then structures. Think of 5 'What would you do if...' questions to ask your group.", isSystemGenerated: false, createdById: teacher.id },
    { title: "Turkish Culture Show & Tell", category: "Culture", level: "elementary", description: "Share something about Turkish culture, traditions, or food with your group in English.", preparationTips: "Choose one Turkish tradition or dish you love. Prepare to describe it in simple English.", isSystemGenerated: false, createdById: teacher.id },
    { title: "Breaking News Discussion", category: "Current Events", level: "upper_intermediate", description: "Discuss recent news events and practice expressing opinions on current affairs.", preparationTips: "Read one English news article today. Prepare to summarize it and share your opinion.", isSystemGenerated: true },
    { title: "Past Tense Storytelling", category: "Grammar", level: "beginner", description: "Tell stories about past experiences using simple past and past continuous.", preparationTips: "Think of an interesting experience from last week. Practice telling it in the past tense.", isSystemGenerated: false, createdById: teacher.id },
  ];

  for (const t of topicData) {
    const existing = await prisma.topic.findFirst({ where: { title: t.title } });
    if (!existing) {
      await prisma.topic.create({ data: t });
    }
  }
  console.log("Created 8 speaking topics");

  // Create Speaking Sessions
  const sessions = [
    {
      topic: "Describe Your Dream Vacation",
      topicDetails: "Each student describes their ideal vacation destination. Practice future tense and conditionals.",
      date: new Date("2026-05-10T14:00:00Z"),
      status: "completed",
      duration: 90,
      sourceType: "system",
      createdById: admin.id,
      participantIndices: [0, 1, 2, 3, 4],
    },
    {
      topic: "Conditional Sentences in Daily Life",
      topicDetails: "Practice using conditionals naturally in conversation. Connected to Brishna's grammar lesson.",
      date: new Date("2026-05-12T14:00:00Z"),
      status: "completed",
      duration: 90,
      sourceType: "teacher",
      createdById: teacher.id,
      participantIndices: [0, 5, 6, 7, 8],
    },
    {
      topic: "Job Interview Practice",
      topicDetails: "Mock interviews and professional English practice.",
      date: new Date("2026-05-17T10:00:00Z"),
      status: "scheduled",
      duration: 90,
      sourceType: "system",
      createdById: admin.id,
      participantIndices: [1, 3, 5, 7, 9],
    },
    {
      topic: "Debate: Social Media Impact",
      topicDetails: "Two teams debate the pros and cons of social media.",
      date: new Date("2026-05-19T14:00:00Z"),
      status: "scheduled",
      duration: 90,
      sourceType: "system",
      createdById: admin.id,
      participantIndices: [0, 2, 4, 6, 10],
    },
    {
      topic: "Past Tense Storytelling",
      topicDetails: "Each student tells a story about their week using past tense. Connected to Brishna's lesson.",
      date: new Date("2026-05-20T14:00:00Z"),
      status: "scheduled",
      duration: 90,
      sourceType: "teacher",
      createdById: teacher.id,
      participantIndices: [0, 1, 8, 9, 10],
    },
  ];

  for (const s of sessions) {
    const existing = await prisma.speakingSession.findFirst({
      where: { topic: s.topic, date: s.date },
    });
    if (!existing) {
      const session = await prisma.speakingSession.create({
        data: {
          topic: s.topic,
          topicDetails: s.topicDetails,
          date: s.date,
          status: s.status,
          duration: s.duration,
          sourceType: s.sourceType,
          createdById: s.createdById,
          meetingLink: "https://teams.microsoft.com/meet/ahkacademy",
          maxStudents: 5,
        },
      });

      // Add participants
      for (const idx of s.participantIndices) {
        if (students[idx]) {
          await prisma.sessionParticipant.create({
            data: {
              sessionId: session.id,
              studentId: students[idx].id,
              attended: s.status === "completed",
              rating: s.status === "completed" ? 3 + Math.floor(Math.random() * 3) : null,
            },
          });
        }
      }

      // Add transcript and analysis for completed sessions
      if (s.status === "completed") {
        const transcript = await prisma.sessionTranscript.create({
          data: {
            sessionId: session.id,
            content: `[Session Transcript - ${s.topic}]\n\nAhsan: Welcome everyone! Today we're going to practice ${s.topic.toLowerCase()}.\n\nElif: Thank you! I'm excited about today's topic.\n\nMehmet: Me too. I've been preparing some ideas.\n\nAhsan: Great! Let's start. Who wants to go first?\n\nElif: I'll go first. So, if I could travel anywhere...\n\n[Full transcript continues for 90 minutes with all participants speaking, asking questions, and discussing the topic. Students practiced vocabulary, grammar structures, and natural conversation flow.]`,
            uploadedById: admin.id,
            analyzedAt: new Date(),
          },
        });

        // Create per-student analyses
        for (const idx of s.participantIndices) {
          if (students[idx]) {
            const vocabSets = [
              '["destination","accommodation","itinerary","departure","reservation"]',
              '["conditional","hypothesis","consequence","possibility","assumption"]',
              '["profession","qualification","achievement","responsibility","opportunity"]',
            ];
            await prisma.sessionAnalysis.create({
              data: {
                transcriptId: transcript.id,
                sessionId: session.id,
                studentId: students[idx].id,
                summary: `${students[idx].name} participated actively in the discussion about ${s.topic}. Showed good engagement and asked relevant questions to other participants.`,
                vocabularyUsed: vocabSets[idx % vocabSets.length],
                grammarNotes: idx % 2 === 0
                  ? "Consistent use of present tense when past tense was needed. Article usage (a/an/the) needs improvement."
                  : "Good use of conditional structures. Minor subject-verb agreement errors with third person.",
                pronunciationNotes: "Clear pronunciation overall. Needs work on 'th' sounds and word stress in longer words.",
                participationScore: 60 + Math.floor(Math.random() * 35),
                strengths: "Active listener, asks good follow-up questions, comfortable initiating conversation",
                areasToImprove: "Needs more complex vocabulary, should practice linking words (however, moreover, although)",
                homework: `1. Write a short paragraph (100 words) about ${s.topic.toLowerCase()} using at least 5 new vocabulary words.\n2. Practice the grammar points noted above with 10 example sentences.\n3. Record yourself speaking about the topic for 2 minutes and listen back.`,
              },
            });
          }
        }

        // Create teacher insights for completed sessions
        for (const idx of s.participantIndices) {
          if (students[idx] && s.sourceType === "teacher") {
            await prisma.teacherInsight.create({
              data: {
                teacherId: teacher.id,
                studentId: students[idx].id,
                sessionId: session.id,
                type: idx % 3 === 0 ? "grammar_weakness" : idx % 3 === 1 ? "vocabulary_gap" : "recommendation",
                content: idx % 3 === 0
                  ? `${students[idx].name} consistently struggles with conditional sentences. Recommend extra practice exercises.`
                  : idx % 3 === 1
                  ? `${students[idx].name} has limited vocabulary for academic topics. Suggest vocabulary building exercises.`
                  : `${students[idx].name} is ready to move to more advanced speaking topics. Consider upper-intermediate content.`,
                priority: idx % 3 === 0 ? "high" : "medium",
              },
            });
          }
        }
      }
    }
  }
  console.log("Created 5 speaking sessions with participants, transcripts, and analyses");

  // Create chemistry scores between some students
  for (let i = 0; i < 5; i++) {
    for (let j = i + 1; j < 5; j++) {
      const existing = await prisma.chemistryScore.findFirst({
        where: { student1Id: students[i].id, student2Id: students[j].id },
      });
      if (!existing) {
        await prisma.chemistryScore.create({
          data: {
            student1Id: students[i].id,
            student2Id: students[j].id,
            score: 50 + Math.floor(Math.random() * 50),
            sessionCount: 1 + Math.floor(Math.random() * 3),
            lastSession: new Date("2026-05-12"),
          },
        });
      }
    }
  }
  console.log("Created chemistry scores");

  console.log("\n========= LOGIN CREDENTIALS =========");
  console.log("Admin:   ahsan@ahkacademy.com / admin123");
  console.log("Teacher: brishna@ahkacademy.com / teacher123");
  console.log("Student: student@ahkacademy.com / student123");
  console.log("Turkish students: elif@students.com, mehmet@students.com, etc. / student123");
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
