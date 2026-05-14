import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const student = await db.user.findUnique({
    where: { id },
    include: {
      enrollments: {
        include: {
          class: {
            include: { course: true, teacher: true },
          },
        },
      },
      payments: { orderBy: { createdAt: "desc" } },
      attendances: {
        include: { lesson: true },
        orderBy: { createdAt: "desc" },
      },
      submissions: {
        include: { assignment: true },
        orderBy: { submittedAt: "desc" },
      },
    },
  });

  if (!student) {
    return NextResponse.json({ error: "Student not found" }, { status: 404 });
  }

  return NextResponse.json(student);
}
