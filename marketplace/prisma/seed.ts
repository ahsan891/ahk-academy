import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient({
  datasources: { db: { url: "file:../../prisma/dev.db" } },
});

async function main() {
  console.log("Seeding marketplace data...");

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // Create tutor users
  const tutors = [
    { name: "Sarah Johnson", email: "sarah@tutors.com", password: hash("tutor123"), role: "TUTOR", avatar: null, phone: null },
    { name: "Michael Chen", email: "michael@tutors.com", password: hash("tutor123"), role: "TUTOR", avatar: null, phone: null },
    { name: "Emma Williams", email: "emma@tutors.com", password: hash("tutor123"), role: "TUTOR", avatar: null, phone: null },
    { name: "James Brown", email: "james@tutors.com", password: hash("tutor123"), role: "TUTOR", avatar: null, phone: null },
    { name: "Olivia Davis", email: "olivia@tutors.com", password: hash("tutor123"), role: "TUTOR", avatar: null, phone: null },
    { name: "David Wilson", email: "david@tutors.com", password: hash("tutor123"), role: "TUTOR", avatar: null, phone: null },
    { name: "Sophie Taylor", email: "sophie@tutors.com", password: hash("tutor123"), role: "TUTOR", avatar: null, phone: null },
    { name: "Ryan Martinez", email: "ryan@tutors.com", password: hash("tutor123"), role: "TUTOR", avatar: null, phone: null },
  ];

  const tutorUsers = [];
  for (const t of tutors) {
    const user = await db.user.upsert({
      where: { email: t.email },
      update: {},
      create: t,
    });
    tutorUsers.push(user);
  }

  // Create tutor profiles
  const profiles = [
    { userId: tutorUsers[0].id, hourlyRate: 20, specialties: "Conversation,Business English,Interview Prep", accent: "American", education: "MA TESOL, Columbia University", certifications: "CELTA, DELTA", yearsExperience: 8, totalLessons: 1250, averageRating: 4.9, isAvailableInstantly: true, isApproved: true, approvalStatus: "approved", bio: "Hi! I'm Sarah, a passionate English teacher with 8 years of experience. I specialize in business English and helping professionals ace their interviews. My lessons are fun, interactive, and tailored to your specific needs.", country: "United States", teachingLanguages: "English,Spanish" },
    { userId: tutorUsers[1].id, hourlyRate: 18, specialties: "IELTS Prep,Academic Writing,Grammar", accent: "British", education: "PhD Applied Linguistics, Cambridge", certifications: "CELTA", yearsExperience: 6, totalLessons: 890, averageRating: 4.8, isAvailableInstantly: false, isApproved: true, approvalStatus: "approved", bio: "Cambridge-educated linguist with a focus on academic English. I've helped over 500 students achieve their target IELTS scores. Let's work together to reach your goals!", country: "United Kingdom", teachingLanguages: "English,Mandarin" },
    { userId: tutorUsers[2].id, hourlyRate: 15, specialties: "Conversation,Kids English,Pronunciation", accent: "Australian", education: "BA Education, University of Sydney", certifications: "TESOL", yearsExperience: 4, totalLessons: 620, averageRating: 4.7, isAvailableInstantly: true, isApproved: true, approvalStatus: "approved", bio: "G'day! I make learning English fun for all ages. Specialized in working with kids and beginners. My relaxed teaching style helps students feel comfortable and confident.", country: "Australia", teachingLanguages: "English" },
    { userId: tutorUsers[3].id, hourlyRate: 25, specialties: "Business English,TOEFL Prep,Academic Writing", accent: "American", education: "MBA, Harvard Business School", certifications: "CELTA, Business English Certificate", yearsExperience: 10, totalLessons: 2100, averageRating: 5.0, isAvailableInstantly: false, isApproved: true, approvalStatus: "approved", bio: "Former Wall Street executive turned English teacher. I bring real-world business experience to every lesson. Perfect for professionals who need English for their career.", country: "United States", teachingLanguages: "English,French" },
    { userId: tutorUsers[4].id, hourlyRate: 12, specialties: "Conversation,Grammar,Pronunciation", accent: "Canadian", education: "BA English Literature, McGill University", certifications: "TEFL", yearsExperience: 3, totalLessons: 340, averageRating: 4.6, isAvailableInstantly: true, isApproved: true, approvalStatus: "approved", bio: "Friendly and patient Canadian teacher. I love helping students build confidence in everyday English conversation. Affordable rates for quality lessons!", country: "Canada", teachingLanguages: "English,French" },
    { userId: tutorUsers[5].id, hourlyRate: 22, specialties: "IELTS Prep,TOEFL Prep,Academic Writing", accent: "British", education: "MA Applied Linguistics, Oxford", certifications: "CELTA, IELTS Examiner", yearsExperience: 12, totalLessons: 3200, averageRating: 4.9, isAvailableInstantly: false, isApproved: true, approvalStatus: "approved", bio: "Certified IELTS examiner with 12 years of teaching experience. I know exactly what examiners are looking for and can help you maximize your score.", country: "United Kingdom", teachingLanguages: "English" },
    { userId: tutorUsers[6].id, hourlyRate: 16, specialties: "Conversation,Kids English,Grammar", accent: "Irish", education: "BA Education, Trinity College Dublin", certifications: "CELTA", yearsExperience: 5, totalLessons: 750, averageRating: 4.8, isAvailableInstantly: true, isApproved: true, approvalStatus: "approved", bio: "Creative and energetic teacher from Dublin. I use games, stories, and real-world scenarios to make English learning enjoyable and effective.", country: "Ireland", teachingLanguages: "English,Irish" },
    { userId: tutorUsers[7].id, hourlyRate: 14, specialties: "Conversation,Pronunciation,Interview Prep", accent: "American", education: "BA Communications, UCLA", certifications: "TEFL, Pronunciation Specialist", yearsExperience: 4, totalLessons: 480, averageRating: 4.5, isAvailableInstantly: true, isApproved: true, approvalStatus: "approved", bio: "LA-based teacher specializing in American pronunciation and accent reduction. Perfect for students who want to sound natural and confident in English.", country: "United States", teachingLanguages: "English,Spanish" },
  ];

  for (const p of profiles) {
    await db.tutorProfile.upsert({
      where: { userId: p.userId },
      update: p,
      create: p,
    });
  }

  // Create availability for each tutor
  const timeSlots = [
    { startTime: "09:00", endTime: "12:00" },
    { startTime: "14:00", endTime: "17:00" },
    { startTime: "18:00", endTime: "21:00" },
  ];

  for (const tutorUser of tutorUsers) {
    const profile = await db.tutorProfile.findUnique({ where: { userId: tutorUser.id } });
    if (!profile) continue;

    // Delete existing availability
    await db.tutorAvailability.deleteMany({ where: { tutorProfileId: profile.id } });

    // Add availability for weekdays (Mon-Fri = 1-5), each tutor gets 2-3 random slots
    for (let day = 1; day <= 5; day++) {
      const numSlots = 1 + Math.floor(Math.random() * 2);
      const shuffled = [...timeSlots].sort(() => Math.random() - 0.5);
      for (let i = 0; i < numSlots; i++) {
        await db.tutorAvailability.create({
          data: {
            tutorProfileId: profile.id,
            dayOfWeek: day,
            startTime: shuffled[i].startTime,
            endTime: shuffled[i].endTime,
            isRecurring: true,
          },
        });
      }
    }
  }

  // Create a test student
  const studentUser = await db.user.upsert({
    where: { email: "student@marketplace.com" },
    update: {},
    create: { name: "Test Student", email: "student@marketplace.com", password: hash("student123"), role: "STUDENT" },
  });

  await db.studentMarketProfile.upsert({
    where: { userId: studentUser.id },
    update: { creditsBalance: 50 },
    create: { userId: studentUser.id, creditsBalance: 50, learningLanguage: "English", proficiencyLevel: "intermediate", learningGoals: "Improve conversation skills for work" },
  });

  // Create some sample bookings and reviews
  const sampleBookings = [
    { studentId: studentUser.id, tutorId: tutorUsers[0].id, status: "completed", scheduledAt: new Date("2025-01-10T10:00:00Z"), durationMinutes: 30, priceCharged: 10, tutorEarnings: 8, platformFee: 2, lessonType: "scheduled" },
    { studentId: studentUser.id, tutorId: tutorUsers[1].id, status: "completed", scheduledAt: new Date("2025-01-12T14:00:00Z"), durationMinutes: 60, priceCharged: 18, tutorEarnings: 14.4, platformFee: 3.6, lessonType: "scheduled" },
    { studentId: studentUser.id, tutorId: tutorUsers[2].id, status: "completed", scheduledAt: new Date("2025-01-15T09:00:00Z"), durationMinutes: 30, priceCharged: 7.5, tutorEarnings: 6, platformFee: 1.5, lessonType: "instant" },
    { studentId: studentUser.id, tutorId: tutorUsers[0].id, status: "confirmed", scheduledAt: new Date("2026-06-20T10:00:00Z"), durationMinutes: 30, priceCharged: 10, tutorEarnings: 8, platformFee: 2, lessonType: "scheduled" },
    { studentId: studentUser.id, tutorId: tutorUsers[3].id, status: "confirmed", scheduledAt: new Date("2026-06-22T15:00:00Z"), durationMinutes: 60, priceCharged: 25, tutorEarnings: 20, platformFee: 5, lessonType: "scheduled" },
  ];

  for (const b of sampleBookings) {
    await db.mktBooking.create({ data: b });
  }

  // Create reviews for completed bookings
  const completedBookings = await db.mktBooking.findMany({
    where: { studentId: studentUser.id, status: "completed" },
  });

  const reviewComments = [
    "Amazing teacher! Very patient and professional. Highly recommend!",
    "Great lesson structure. Helped me improve my IELTS writing score significantly.",
    "Fun and engaging lesson. My daughter loved it!",
  ];

  for (let i = 0; i < completedBookings.length; i++) {
    await db.review.create({
      data: {
        bookingId: completedBookings[i].id,
        studentId: studentUser.id,
        tutorId: completedBookings[i].tutorId,
        rating: 4 + Math.round(Math.random()),
        comment: reviewComments[i % reviewComments.length],
      },
    });
  }

  // Create sample transactions
  await db.transaction.create({
    data: { userId: studentUser.id, type: "credit_purchase", amount: 49, status: "completed", description: "Purchased 5 credits - Starter package" },
  });
  await db.transaction.create({
    data: { userId: studentUser.id, type: "credit_purchase", amount: 179, status: "completed", description: "Purchased 20 credits - Popular package" },
  });

  console.log("Marketplace seed complete!");
  console.log("  8 tutors created (password: tutor123)");
  console.log("  1 test student: student@marketplace.com / student123");
  console.log("  5 sample bookings, 3 reviews, 2 transactions");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => db.$disconnect());
