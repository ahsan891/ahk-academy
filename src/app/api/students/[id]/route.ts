import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  if (session.user.role === "STUDENT" && session.user.id !== id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

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
