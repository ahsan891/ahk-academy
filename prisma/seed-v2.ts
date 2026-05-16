import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🚀 Seeding V2 data...");

  // Get existing users
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  const teacher = await prisma.user.findFirst({ where: { role: "TEACHER" } });
  const students = await prisma.user.findMany({ where: { role: "STUDENT" } });

  if (!admin || !teacher || students.length === 0) {
    console.log("❌ Run base seed first (npx tsx prisma/seed.ts)");
    return;
  }

  // Update users with V2 fields
  console.log("📍 Updating user profiles with timezone/country...");
  const studentCountries = ["Turkey", "Turkey", "Turkey", "Turkey", "Turkey", "Azerbaijan", "Kazakhstan", "Saudi Arabia", "UAE", "Germany"];
  const studentTimezones = ["Europe/Istanbul", "Europe/Istanbul", "Europe/Istanbul", "Europe/Istanbul", "Europe/Istanbul", "Asia/Baku", "Asia/Almaty", "Asia/Riyadh", "Asia/Dubai", "Europe/Berlin"];

  for (let i = 0; i < students.length; i++) {
    await prisma.user.update({
      where: { id: students[i].id },
      data: {
        country: studentCountries[i] || "Turkey",
        timezone: studentTimezones[i] || "Europe/Istanbul",
        language: studentCountries[i] === "Turkey" ? "tr" : "en",
        phone: `+90555${String(1000000 + i).slice(1)}`,
      },
    });
  }

  await prisma.user.update({
    where: { id: teacher.id },
    data: { country: "Afghanistan", timezone: "Asia/Kabul", language: "en", phone: "+93700000001" },
  });

  await prisma.user.update({
    where: { id: admin.id },
    data: { country: "Pakistan", timezone: "Asia/Karachi", language: "en", phone: "+923001234567" },
  });

  // Create StudentProfiles
  console.log("👤 Creating student profiles...");
  const levels = ["B1", "B1", "B2", "A2", "B1", "B2", "A2", "B1", "C1", "B1"];
  const tracks = ["FULL_STUDENT", "FULL_STUDENT", "SPEAKING_ONLY", "FULL_STUDENT", "SPEAKING_ONLY", "SPEAKING_ONLY", "FULL_STUDENT", "SPEAKING_ONLY", "SPEAKING_ONLY", "FULL_STUDENT"];

  for (let i = 0; i < students.length; i++) {
    await prisma.studentProfile.upsert({
      where: { userId: students[i].id },
      update: {},
      create: {
        userId: students[i].id,
        trackType: tracks[i],
        level: levels[i],
        teacherId: tracks[i] === "FULL_STUDENT" ? teacher.id : null,
        internationalPreference: true,
        preferredTopics: JSON.stringify(["Travel", "Technology", "Education"]),
        availableSlots: JSON.stringify([
          { dayOfWeek: 1, startTime: "18:00", endTime: "20:00" },
          { dayOfWeek: 3, startTime: "18:00", endTime: "20:00" },
          { dayOfWeek: 5, startTime: "10:00", endTime: "12:00" },
        ]),
        isActive: true,
      },
    });
  }

  // Create TeacherProfile
  console.log("👩‍🏫 Creating teacher profile...");
  await prisma.teacherProfile2.upsert({
    where: { userId: teacher.id },
    update: {},
    create: {
      userId: teacher.id,
      specializations: JSON.stringify(["TOEFL", "IELTS", "Grammar", "Speaking"]),
      bio: "Experienced English teacher specializing in TOEFL preparation and conversational English. Passionate about helping students achieve fluency through interactive methods.",
      isActive: true,
    },
  });

  // Create Payment Plans
  console.log("💳 Creating payment plans...");
  const paymentPlans = [];
  for (let i = 0; i < students.length; i++) {
    const plan = await prisma.paymentPlan.create({
      data: {
        studentId: students[i].id,
        planType: tracks[i] === "FULL_STUDENT" ? "MONTHLY" : "PER_LESSON",
        amount: tracks[i] === "FULL_STUDENT" ? 150.0 : 60.0,
        currency: "USD",
        billingCycleDay: 1,
        nextDueDate: new Date(2026, 5, 1), // June 1, 2026
        isActive: true,
        notes: tracks[i] === "FULL_STUDENT" ? "Full track: lessons + speaking sessions" : "Speaking sessions only",
      },
    });
    paymentPlans.push(plan);
  }

  // Create sample transactions
  console.log("💰 Creating sample transactions...");
  const methods = ["IBAN", "PAPARA", "STRIPE", "IBAN", "PAPARA", "IBAN", "STRIPE", "IBAN", "PAPARA", "IBAN"];
  const statuses = ["CONFIRMED", "CONFIRMED", "CONFIRMED", "CONFIRMED", "PENDING", "CONFIRMED", "CONFIRMED", "CONFIRMED", "PENDING", "CONFIRMED"];

  for (let i = 0; i < students.length; i++) {
    await prisma.paymentTransaction.create({
      data: {
        studentId: students[i].id,
        paymentPlanId: paymentPlans[i].id,
        amount: paymentPlans[i].amount,
        currency: "USD",
        method: methods[i],
        status: statuses[i],
        referenceCode: `AHK-${String(1000 + i)}`,
        confirmedBy: statuses[i] === "CONFIRMED" ? admin.id : null,
        confirmedAt: statuses[i] === "CONFIRMED" ? new Date() : null,
        description: `May 2026 payment - ${tracks[i] === "FULL_STUDENT" ? "Full Track" : "Speaking Only"}`,
      },
    });
  }

  // Create Blog Posts
  console.log("📝 Creating blog posts...");
  const blogPosts = [
    {
      title: "10 Tips to Improve Your English Speaking Skills",
      slug: "10-tips-improve-english-speaking",
      content: "# 10 Tips to Improve Your English Speaking Skills\n\nLearning to speak English fluently is a goal shared by millions of people worldwide. Whether you're preparing for TOEFL, IELTS, or simply want to communicate better, these tips will help you on your journey.\n\n## 1. Practice Every Day\nConsistency is key. Even 15 minutes of daily practice is better than 2 hours once a week.\n\n## 2. Think in English\nTry to form your thoughts in English rather than translating from your native language.\n\n## 3. Listen Actively\nWatch English movies, podcasts, and news. Pay attention to pronunciation and intonation.\n\n## 4. Join Speaking Groups\nPractice with other learners in a safe, supportive environment. AHK Academy's group sessions are perfect for this.\n\n## 5. Record Yourself\nListen back to identify areas for improvement.\n\n## 6. Learn Phrases, Not Just Words\nNative speakers use phrases and collocations. Learn common expressions.\n\n## 7. Don't Be Afraid of Mistakes\nMistakes are a natural part of learning. Embrace them.\n\n## 8. Set Specific Goals\nInstead of \"improve English,\" aim for \"learn 10 new phrasal verbs this week.\"\n\n## 9. Use English in Real Life\nOrder food in English, write emails in English, change your phone language.\n\n## 10. Get Feedback\nWork with a teacher who can provide personalized feedback on your progress.",
      excerpt: "Discover proven strategies to boost your English speaking confidence and fluency with these 10 practical tips.",
      metaTitle: "10 Tips to Improve English Speaking Skills | AHK Academy",
      metaDescription: "Learn 10 proven strategies to improve your English speaking skills. From daily practice to joining speaking groups, boost your fluency today.",
      keywords: JSON.stringify(["english speaking", "improve speaking", "fluency tips", "speaking practice"]),
      language: "en",
      status: "PUBLISHED",
      publishedAt: new Date(2026, 4, 10),
    },
    {
      title: "İngilizce Konuşma Pratiği: Grup Dersleri Neden Etkili?",
      slug: "ingilizce-konusma-pratigi-grup-dersleri",
      content: "# İngilizce Konuşma Pratiği: Grup Dersleri Neden Etkili?\n\nİngilizce öğrenirken en büyük zorluklardan biri konuşma pratiği yapmaktır. Grup derslerinin neden bireysel çalışmadan daha etkili olduğunu keşfedelim.\n\n## Gerçek Diyalog Ortamı\nGrup derslerinde gerçek bir konuşma ortamı yaratılır. Farklı seviyelerden ve ülkelerden öğrencilerle pratik yaparsınız.\n\n## Motivasyon ve Hesap Verebilirlik\nBir grubun parçası olmak sizi düzenli çalışmaya motive eder.\n\n## Farklı Aksanlar\nFarklı ülkelerden öğrencilerle çalışmak, farklı aksanları anlamanıza yardımcı olur.\n\n## Ekonomik\nGrup dersleri, birebir derslerden çok daha uygun fiyatlıdır.\n\n## AHK Academy'de Grup Dersleri\n- 5 kişilik küçük gruplar\n- 1.5 saatlik interaktif oturumlar\n- AI destekli kişisel geri bildirim\n- Seviyenize uygun konu seçimi",
      excerpt: "İngilizce konuşma becerilerinizi grup derslerinde nasıl geliştirebileceğinizi öğrenin.",
      metaTitle: "İngilizce Konuşma Pratiği - Grup Dersleri | AHK Academy",
      metaDescription: "İngilizce konuşma pratiği için grup derslerinin avantajlarını keşfedin. AHK Academy'de 5 kişilik gruplarla etkili İngilizce öğrenin.",
      keywords: JSON.stringify(["ingilizce konuşma", "grup dersi", "ingilizce pratik", "konuşma kursu"]),
      language: "tr",
      status: "PUBLISHED",
      publishedAt: new Date(2026, 4, 12),
    },
    {
      title: "How AI is Revolutionizing English Language Learning",
      slug: "ai-revolutionizing-english-learning",
      content: "# How AI is Revolutionizing English Language Learning\n\nArtificial intelligence is transforming the way we learn languages. At AHK Academy, we use AI to provide personalized learning experiences that adapt to each student's needs.\n\n## Personalized Feedback\nAI analyzes your speaking patterns, identifying specific grammar errors, vocabulary gaps, and pronunciation issues unique to you.\n\n## Smart Group Matching\nOur AI algorithm matches students based on level, timezone, topic preferences, and even personality chemistry scores.\n\n## Automated Homework Generation\nAfter each session, AI generates personalized homework targeting your specific weaknesses.\n\n## Teacher Resources\nAI helps teachers by generating weekly lesson plans, vocabulary lists, and speaking prompts based on their students' progress.\n\n## The Human Touch\nWhile AI handles analysis and personalization, our experienced teachers provide the human connection, motivation, and nuanced feedback that only real educators can offer.\n\n## The Future\nWe're building towards a world where every English learner has access to personalized, affordable, and effective language education.",
      excerpt: "Discover how AHK Academy uses AI to provide personalized English learning experiences with smart group matching and automated feedback.",
      metaTitle: "AI in English Learning - How Technology Transforms Education | AHK Academy",
      metaDescription: "Learn how AI is revolutionizing English language learning with personalized feedback, smart group matching, and automated homework generation.",
      keywords: JSON.stringify(["AI language learning", "personalized learning", "edtech", "english learning technology"]),
      language: "en",
      status: "PUBLISHED",
      publishedAt: new Date(2026, 4, 15),
    },
    {
      title: "TOEFL Speaking Section: Complete Guide 2026",
      slug: "toefl-speaking-section-guide-2026",
      content: "# TOEFL Speaking Section: Complete Guide 2026\n\nThe TOEFL Speaking section tests your ability to communicate effectively in English in an academic setting. Here's everything you need to know.\n\n## Format\n- 4 tasks total\n- 17 minutes\n- Scored 0-30\n\n## Task Types\n\n### Independent Task (1 question)\nExpress your opinion on a familiar topic. You get 15 seconds to prepare and 45 seconds to speak.\n\n### Integrated Tasks (3 questions)\n- Read + Listen + Speak\n- Listen + Speak\n- Academic lecture summarization\n\n## Scoring Criteria\n1. **Delivery**: Clear speech, good pace, natural intonation\n2. **Language Use**: Vocabulary range, grammar accuracy\n3. **Topic Development**: Clear ideas, logical organization\n\n## Tips for Success\n- Use the preparation time to outline your response\n- Give specific examples, not just general statements\n- Practice with a timer\n- Record yourself and listen back\n\n## How AHK Academy Helps\nOur speaking sessions simulate TOEFL-style discussions. You'll practice expressing opinions, summarizing information, and responding under time pressure.",
      excerpt: "Everything you need to know about the TOEFL Speaking section in 2026, including format, scoring, and preparation tips.",
      metaTitle: "TOEFL Speaking Section Guide 2026 | AHK Academy",
      metaDescription: "Complete guide to the TOEFL Speaking section 2026. Learn about format, scoring criteria, and expert tips for achieving a high score.",
      keywords: JSON.stringify(["TOEFL speaking", "TOEFL preparation", "TOEFL 2026", "speaking test tips"]),
      language: "en",
      status: "DRAFT",
      publishedAt: null,
    },
  ];

  for (const post of blogPosts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: {
        ...post,
        authorId: admin.id,
        featuredImage: null,
      },
    });
  }

  // Create sample homework
  console.log("📚 Creating sample homework...");
  const sessions = await prisma.speakingSession.findMany({ take: 3 });
  if (sessions.length > 0) {
    for (let i = 0; i < Math.min(3, students.length); i++) {
      await prisma.homework.create({
        data: {
          studentId: students[i].id,
          sessionId: sessions[0]?.id,
          title: `Speaking Session Homework - Week ${i + 1}`,
          content: JSON.stringify({
            sections: [
              {
                type: "vocabulary",
                title: "New Vocabulary Practice",
                instructions: "Use each word in a sentence of your own",
                exercises: ["consequently", "furthermore", "nevertheless", "albeit", "notwithstanding"],
              },
              {
                type: "grammar",
                title: "Grammar Focus: Conditionals",
                instructions: "Complete these conditional sentences",
                exercises: [
                  "If I had studied harder, I ___",
                  "Were she to arrive early, she ___",
                  "Had they known about the delay, they ___",
                ],
              },
              {
                type: "speaking",
                title: "Speaking Practice",
                instructions: "Record yourself speaking for 2 minutes on this topic",
                exercises: ["Describe a time when you had to adapt to a new situation. What challenges did you face?"],
              },
            ],
            estimatedMinutes: 30,
          }),
          dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          status: i === 0 ? "SUBMITTED" : "PENDING",
          submissionContent: i === 0 ? "Completed all sections. Recorded audio attached." : null,
          grade: i === 0 ? 85 : null,
          feedback: i === 0 ? "Great work! Focus on using more complex sentence structures." : null,
          deliveredViaWhatsapp: true,
          deliveredViaEmail: true,
        },
      });
    }
  }

  // Create Teacher Resources
  console.log("📋 Creating teacher resources...");
  await prisma.teacherResource.create({
    data: {
      teacherId: teacher.id,
      weekOf: new Date(2026, 4, 12), // Week of May 12
      resourceType: "LESSON_PLAN",
      title: "Week 20 Lesson Plan: Conditionals & Hypothetical Situations",
      content: JSON.stringify({
        objectives: ["Master third conditional", "Practice mixed conditionals", "Discuss hypothetical scenarios"],
        activities: [
          { name: "Warm-up: What would you do if...", duration: 10 },
          { name: "Grammar presentation: Third conditional", duration: 20 },
          { name: "Practice exercises in pairs", duration: 15 },
          { name: "Speaking activity: Life decisions discussion", duration: 15 },
        ],
        materials: ["Conditional sentences worksheet", "Discussion cards"],
      }),
      basedOnStudents: JSON.stringify(students.slice(0, 5).map((s) => s.id)),
      targetGrammarPoint: "Third Conditional",
      modelUsed: "gemini-2.0-flash",
    },
  });

  await prisma.teacherResource.create({
    data: {
      teacherId: teacher.id,
      weekOf: new Date(2026, 4, 12),
      resourceType: "VOCABULARY_LIST",
      title: "Academic Vocabulary - Week 20",
      content: JSON.stringify({
        words: [
          { word: "consequently", definition: "as a result", example: "She didn't study; consequently, she failed.", level: "B2" },
          { word: "furthermore", definition: "in addition to what has been said", example: "The hotel was expensive. Furthermore, the service was terrible.", level: "B2" },
          { word: "notwithstanding", definition: "in spite of", example: "Notwithstanding the rain, the event was a success.", level: "C1" },
          { word: "albeit", definition: "although", example: "He accepted the job, albeit reluctantly.", level: "C1" },
          { word: "hitherto", definition: "until now", example: "The species was hitherto unknown to science.", level: "C1" },
        ],
      }),
      basedOnStudents: JSON.stringify(students.slice(0, 5).map((s) => s.id)),
      targetGrammarPoint: null,
      modelUsed: "gemini-2.0-flash",
    },
  });

  // Create Grammar Lesson Log
  console.log("📖 Creating grammar lesson logs...");
  await prisma.grammarLessonLog.create({
    data: {
      teacherId: teacher.id,
      title: "Conditionals Master Class",
      grammarFocus: "Third Conditional & Mixed Conditionals",
      description: "Covered all conditional types with focus on third and mixed. Students practiced with real-life hypothetical scenarios.",
      taughtAt: new Date(2026, 4, 13),
      studentsTargeted: JSON.stringify(students.slice(0, 5).map((s) => s.id)),
    },
  });

  await prisma.grammarLessonLog.create({
    data: {
      teacherId: teacher.id,
      title: "Passive Voice in Academic Writing",
      grammarFocus: "Passive Voice",
      description: "Focused on when and how to use passive voice in academic contexts. TOEFL writing preparation.",
      taughtAt: new Date(2026, 4, 15),
      studentsTargeted: JSON.stringify(students.slice(2, 7).map((s) => s.id)),
    },
  });

  console.log("✅ V2 seed complete!");
  console.log("   - 10 student profiles created");
  console.log("   - 1 teacher profile created");
  console.log("   - 10 payment plans created");
  console.log("   - 10 payment transactions created");
  console.log("   - 4 blog posts created (3 published, 1 draft)");
  console.log("   - 3 homework assignments created");
  console.log("   - 2 teacher resources created");
  console.log("   - 2 grammar lesson logs created");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
