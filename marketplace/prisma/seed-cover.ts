import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const db = new PrismaClient();

const REQUIRED = ["IDENTITY", "DEGREE", "CRIMINAL_RECORD", "REFERENCE", "DEMO_LESSON"];

async function upsertUser(name: string, email: string, role: string, phone: string) {
  return db.user.upsert({
    where: { email },
    update: { role, phone },
    create: { name, email, role, phone, password: bcrypt.hashSync("cover123", 10) },
  });
}

async function main() {
  console.log("Seeding cover network demo data...");

  const admin = await upsertUser("AHK Admin", "admin@ahkacademy.com", "ADMIN", "+90 500 000 00 00");
  const head = await upsertUser("Ayşe Demir", "head@kadikoyenglish.com", "HEAD_TEACHER", "+90 532 111 22 33");

  let institution = await db.institution.findFirst({ where: { ownerId: head.id } });
  if (!institution) {
    institution = await db.institution.create({
      data: {
        ownerId: head.id,
        name: "Kadıköy English Academy",
        city: "İstanbul",
        district: "Kadıköy",
        address: "Caferağa Mah. Moda Cad. No:10",
        phone: "+90 216 555 00 11",
      },
    });
  }

  const teachers = [
    { name: "Mehmet Yılmaz", email: "mehmet@teachers.com", city: "İstanbul", district: "Üsküdar", inPerson: true, online: true, certs: "CELTA", years: 6, verified: true },
    { name: "Hannah Clarke", email: "hannah@teachers.com", city: "İstanbul", district: "Beşiktaş", inPerson: true, online: false, certs: "DELTA", years: 9, verified: true, country: "United Kingdom" },
    { name: "Zeynep Kaya", email: "zeynep@teachers.com", city: "Ankara", district: "Çankaya", inPerson: false, online: true, certs: "TESOL", years: 3, verified: false },
  ];

  for (const t of teachers) {
    const user = await upsertUser(t.name, t.email, "TUTOR", "+90 555 000 00 00");
    const profile = await db.tutorProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        bio: `${t.name} has taught English for ${t.years} years.`,
        specialties: "General English, IELTS Prep",
        certifications: t.certs,
        yearsExperience: t.years,
        country: t.country ?? "Türkiye",
        city: t.city,
        district: t.district,
        teachesInPerson: t.inPerson,
        teachesOnline: t.online,
        levels: "B1, B2, C1",
        ageGroups: "Adults",
      },
    });

    const types = t.country ? [...REQUIRED, "WORK_PERMIT"] : REQUIRED;
    for (const type of types) {
      await db.verificationCheck.upsert({
        where: { tutorProfileId_type: { tutorProfileId: profile.id, type } },
        update: {},
        create: {
          tutorProfileId: profile.id,
          type,
          documentUrl: "https://drive.google.com/example",
          status: t.verified ? "APPROVED" : "SUBMITTED",
          submittedAt: new Date(),
          ...(t.verified ? { reviewedAt: new Date(), reviewedById: admin.id } : {}),
        },
      });
    }
    if (t.verified) {
      await db.tutorProfile.update({
        where: { id: profile.id },
        data: { verifiedAt: new Date(), isApproved: true, approvalStatus: "approved" },
      });
    }
  }

  const existing = await db.coverRequest.count({ where: { institutionId: institution.id } });
  if (existing === 0) {
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000);
    tomorrow.setUTCHours(15, 0, 0, 0); // 18:00 in Turkey
    await db.coverRequest.create({
      data: {
        institutionId: institution.id,
        createdById: head.id,
        kind: "SUBSTITUTE",
        level: "B2",
        ageGroup: "Adults",
        mode: "IN_PERSON",
        city: "İstanbul",
        district: "Kadıköy",
        startsAt: tomorrow,
        durationMinutes: 90,
        payPerSession: 1500,
        notes: "Speakout B2, Unit 6. Group of 12 adults.",
      },
    });
  }

  console.log("Done. All demo passwords are cover123:");
  console.log("  admin@ahkacademy.com (admin), head@kadikoyenglish.com (head teacher),");
  console.log("  mehmet@teachers.com, hannah@teachers.com (verified), zeynep@teachers.com (in review)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
