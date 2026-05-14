import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const studentProfile = await db.studentMarketProfile.findFirst({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const transactions = await db.transaction.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      creditsBalance: studentProfile.creditsBalance,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching wallet:", error);
    return NextResponse.json(
      { error: "Failed to fetch wallet" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { amount, credits } = await req.json();

    if (!amount || !credits || amount <= 0 || credits <= 0) {
      return NextResponse.json(
        { error: "Invalid amount or credits. Both must be positive numbers." },
        { status: 400 }
      );
    }

    const studentProfile = await db.studentMarketProfile.findFirst({
      where: { userId: session.user.id },
    });

    if (!studentProfile) {
      return NextResponse.json(
        { error: "Student profile not found" },
        { status: 404 }
      );
    }

    const result = await db.$transaction(async (tx) => {
      const transaction = await tx.transaction.create({
        data: {
          userId: session.user.id,
          type: "CREDIT_PURCHASE",
          amount,
          currency: "USD",
          status: "COMPLETED",
          description: `Purchased ${credits} credits for $${amount}`,
        },
      });

      const updatedProfile = await tx.studentMarketProfile.update({
        where: { id: studentProfile.id },
        data: {
          creditsBalance: { increment: credits },
        },
      });

      return { transaction, creditsBalance: updatedProfile.creditsBalance };
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Error adding credits:", error);
    return NextResponse.json(
      { error: "Failed to add credits" },
      { status: 500 }
    );
  }
}
