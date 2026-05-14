import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function GET() {
  const teachers = await db.user.findMany({
    where: { role: "TEACHER" },
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { teacherClasses: true } },
    },
  });
  return NextResponse.json(teachers);
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, email, phone, password } = body;

  const exists = await db.user.findUnique({ where: { email } });
  if (exists) {
    return NextResponse.json({ error: "Email already exists" }, { status: 400 });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const teacher = await db.user.create({
    data: {
      name,
      email,
      phone: phone || null,
      password: hashedPassword,
      role: "TEACHER",
    },
  });

  return NextResponse.json(teacher, { status: 201 });
}
