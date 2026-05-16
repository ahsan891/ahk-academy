import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { AIService } from "@/lib/ai-service";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { topic, language = "en", targetKeyword } = body;

    if (!topic) {
      return NextResponse.json({ error: "Topic is required" }, { status: 400 });
    }

    const systemPrompt = `You are a professional content writer for AHK Academy, an English language school targeting Turkish and international students. Write SEO-optimized blog content that helps English learners.`;

    const prompt = `Write a 1200-1500 word blog post for AHK Academy targeting Turkish/international English learners.

Topic: ${topic}
Language: ${language === "tr" ? "Turkish" : "English"}
${targetKeyword ? `Target keyword: ${targetKeyword}` : ""}

Requirements:
- Educational and engaging tone
- Include practical examples and tips
- Optimize for SEO with the target keyword naturally integrated
- Include a compelling introduction and conclusion
- Use headers (## and ###) for structure

Return your response as valid JSON with this exact format:
{
  "title": "Blog post title",
  "content": "Full markdown content with headers and paragraphs",
  "excerpt": "2-3 sentence summary for preview cards",
  "metaTitle": "SEO-optimized title (max 60 chars)",
  "metaDescription": "SEO meta description (max 155 chars)",
  "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
}`;

    const aiResponse = await AIService.generate(prompt, systemPrompt);

    // Parse AI response as JSON
    let parsed: {
      title: string;
      content: string;
      excerpt: string;
      metaTitle: string;
      metaDescription: string;
      keywords: string[];
    };

    try {
      // Try to extract JSON from the response (handle cases where AI wraps in markdown)
      const jsonMatch = aiResponse.text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error("No JSON found in AI response");
      }
      parsed = JSON.parse(jsonMatch[0]);
    } catch {
      return NextResponse.json(
        { error: "Failed to parse AI response. Please try again." },
        { status: 500 }
      );
    }

    // Generate unique slug
    let slug = slugify(parsed.title);
    const existing = await db.blogPost.findUnique({ where: { slug } });
    if (existing) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    // Create blog post as DRAFT
    const post = await db.blogPost.create({
      data: {
        title: parsed.title,
        slug,
        content: parsed.content,
        excerpt: parsed.excerpt,
        metaTitle: parsed.metaTitle,
        metaDescription: parsed.metaDescription,
        keywords: Array.isArray(parsed.keywords)
          ? parsed.keywords.join(", ")
          : parsed.keywords || null,
        language,
        status: "DRAFT",
        authorId: session.user.id,
      },
    });

    return NextResponse.json({
      post,
      model: aiResponse.model,
    });
  } catch (error) {
    console.error("[Blog Generate] Error:", error);
    return NextResponse.json(
      { error: "Failed to generate blog post" },
      { status: 500 }
    );
  }
}
