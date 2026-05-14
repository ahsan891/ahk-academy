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

    const { searchParams } = req.nextUrl;
    const bookingId = searchParams.get("bookingId");

    if (bookingId) {
      const booking = await db.mktBooking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      if (
        booking.studentId !== session.user.id &&
        booking.tutorId !== session.user.id
      ) {
        return NextResponse.json(
          { error: "Forbidden: You are not part of this booking" },
          { status: 403 }
        );
      }

      const messages = await db.marketMessage.findMany({
        where: { bookingId },
        include: {
          sender: { select: { id: true, name: true } },
          receiver: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: "asc" },
      });

      return NextResponse.json(messages);
    }

    const messages = await db.marketMessage.findMany({
      where: {
        OR: [
          { senderId: session.user.id },
          { receiverId: session.user.id },
        ],
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
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

    const { receiverId, bookingId, content } = await req.json();

    if (!receiverId || !content) {
      return NextResponse.json(
        { error: "Missing required fields: receiverId, content" },
        { status: 400 }
      );
    }

    if (receiverId === session.user.id) {
      return NextResponse.json(
        { error: "Cannot send a message to yourself" },
        { status: 400 }
      );
    }

    const receiver = await db.user.findUnique({
      where: { id: receiverId },
    });

    if (!receiver) {
      return NextResponse.json(
        { error: "Receiver not found" },
        { status: 404 }
      );
    }

    if (bookingId) {
      const booking = await db.mktBooking.findUnique({
        where: { id: bookingId },
      });

      if (!booking) {
        return NextResponse.json(
          { error: "Booking not found" },
          { status: 404 }
        );
      }

      if (
        booking.studentId !== session.user.id &&
        booking.tutorId !== session.user.id
      ) {
        return NextResponse.json(
          { error: "Forbidden: You are not part of this booking" },
          { status: 403 }
        );
      }
    }

    const message = await db.marketMessage.create({
      data: {
        senderId: session.user.id,
        receiverId,
        bookingId: bookingId || null,
        content,
        isRead: false,
      },
      include: {
        sender: { select: { id: true, name: true } },
        receiver: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}
