import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const enrollments = await db.enrollment.findMany({
    where: { studentId: session.user.id },
    include: {
      class: {
        include: {
          course: true,
          teacher: true,
          _count: { select: { enrollments: true, lessons: true } },
        },
      },
    },
  });

  return NextResponse.json(enrollments);
}
