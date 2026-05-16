import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function estimateReadTime(content: string): number {
  const words = content.split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

// Simple markdown to HTML converter for blog content
function markdownToHtml(markdown: string): string {
  let html = markdown
    // Headers
    .replace(/^### (.+)$/gm, "<h3 class=\"text-xl font-semibold text-gray-900 mt-6 mb-3\">$1</h3>")
    .replace(/^## (.+)$/gm, "<h2 class=\"text-2xl font-bold text-gray-900 mt-8 mb-4\">$1</h2>")
    .replace(/^# (.+)$/gm, "<h1 class=\"text-3xl font-bold text-gray-900 mt-8 mb-4\">$1</h1>")
    // Bold and italic
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.+?)\*/g, "<em>$1</em>")
    // Lists
    .replace(/^- (.+)$/gm, "<li class=\"ml-4 list-disc\">$1</li>")
    .replace(/^\d+\. (.+)$/gm, "<li class=\"ml-4 list-decimal\">$1</li>")
    // Paragraphs (lines that aren't headers or list items)
    .replace(/^(?!<[hlo])((?!<li).+)$/gm, "<p class=\"text-gray-700 leading-relaxed mb-4\">$1</p>")
    // Clean up empty paragraphs
    .replace(/<p class="[^"]*"><\/p>/g, "");

  return html;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  const post = await db.blogPost.findUnique({
    where: { slug },
    select: { title: true, metaTitle: true, metaDescription: true, excerpt: true, keywords: true },
  });

  if (!post) {
    return { title: "Post Not Found | AHK Academy" };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt || "",
    keywords: post.keywords || undefined,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt || "",
      type: "article",
      siteName: "AHK Academy",
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const post = await db.blogPost.findUnique({
    where: { slug, status: "PUBLISHED" },
    include: {
      author: { select: { name: true } },
    },
  });

  if (!post) {
    notFound();
  }

  const readTime = estimateReadTime(post.content);
  const contentHtml = markdownToHtml(post.content);
  const keywords = post.keywords ? post.keywords.split(",").map((k) => k.trim()) : [];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-4xl px-4 py-6 flex items-center justify-between">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            AHK Academy
          </Link>
          <Link
            href="/blog"
            className="text-sm text-gray-600 hover:text-blue-600 transition-colors"
          >
            Back to Blog
          </Link>
        </div>
      </header>

      {/* Article */}
      <main className="mx-auto max-w-4xl px-4 py-10">
        <article>
          {/* Post Header */}
          <header className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  post.language === "tr"
                    ? "bg-red-100 text-red-700"
                    : "bg-blue-100 text-blue-700"
                }`}
              >
                {post.language === "tr" ? "Turkce" : "English"}
              </span>
              <span className="text-sm text-gray-500">{readTime} min read</span>
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {post.title}
            </h1>

            <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
              <span>By {post.author.name}</span>
              {post.publishedAt && <span>{formatDate(post.publishedAt)}</span>}
            </div>
          </header>

          {/* Featured Image */}
          {post.featuredImage && (
            <div className="mb-8 rounded-lg overflow-hidden">
              <img
                src={post.featuredImage}
                alt={post.title}
                className="w-full h-auto"
              />
            </div>
          )}

          {/* Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: contentHtml }}
          />

          {/* Keywords Tags */}
          {keywords.length > 0 && (
            <div className="mt-10 pt-6 border-t">
              <div className="flex flex-wrap gap-2">
                {keywords.map((keyword, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                  >
                    {keyword}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Back Link */}
          <div className="mt-10 pt-6 border-t">
            <Link
              href="/blog"
              className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
            >
              &larr; Back to Blog
            </Link>
          </div>
        </article>
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="mx-auto max-w-4xl px-4 py-8 text-center text-sm text-gray-500">
          <p>AHK Academy - Learn English with confidence</p>
          <p className="mt-1">Speaking sessions, personalized lessons, and AI-powered feedback</p>
        </div>
      </footer>
    </div>
  );
}
