import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const language = searchParams.get("language");
    const status = searchParams.get("status");

    const where: Record<string, unknown> = {};

    // Public access only sees published posts
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      where.status = "PUBLISHED";
      where.publishedAt = { lte: new Date() };
    } else if (status) {
      where.status = status;
    }

    if (language) {
      where.language = language;
    }

    const posts = await db.blogPost.findMany({
      where,
      include: {
        author: {
          select: { id: true, name: true },
        },
      },
      orderBy: { publishedAt: "desc" },
    });

    return NextResponse.json({ posts });
  } catch (error) {
    console.error("[Blog List] Error:", error);
    return NextResponse.json({ error: "Failed to fetch posts" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      content,
      excerpt,
      language = "en",
      status = "DRAFT",
      keywords,
      metaTitle,
      metaDescription,
      featuredImage,
    } = body;

    if (!title || !content) {
      return NextResponse.json(
        { error: "Title and content are required" },
        { status: 400 }
      );
    }

    // Generate unique slug
    let slug = slugify(title);
    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const post = await db.blogPost.create({
      data: {
        title,
        slug,
        content,
        excerpt: excerpt || content.slice(0, 160),
        metaTitle: metaTitle || title,
        metaDescription: metaDescription || excerpt || content.slice(0, 160),
        keywords: keywords || null,
        language,
        status,
        publishedAt: status === "PUBLISHED" ? new Date() : null,
        authorId: session.user.id,
        featuredImage: featuredImage || null,
      },
    });

    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("[Blog Create] Error:", error);
    return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
  }
}
