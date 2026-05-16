import { db } from "@/lib/db";
import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog | AHK Academy - English Learning Tips & Resources",
  description:
    "Learn English effectively with tips, strategies, and resources from AHK Academy. Articles for Turkish and international English learners.",
};

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

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<{ language?: string }>;
}) {
  const { language } = await searchParams;

  const where: Record<string, unknown> = {
    status: "PUBLISHED",
    publishedAt: { lte: new Date() },
  };

  if (language && language !== "all") {
    where.language = language;
  }

  const posts = await db.blogPost.findMany({
    where,
    include: {
      author: { select: { name: true } },
    },
    orderBy: { publishedAt: "desc" },
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="mx-auto max-w-6xl px-4 py-6">
          <Link href="/" className="text-2xl font-bold text-blue-600">
            AHK Academy
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Blog</h1>
          <p className="mt-2 text-lg text-gray-600">
            Tips, strategies, and resources for English learners
          </p>
        </div>

        {/* Language Filter Tabs */}
        <div className="mb-8 flex gap-2">
          <Link
            href="/blog"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              !language || language === "all"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            All
          </Link>
          <Link
            href="/blog?language=en"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              language === "en"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            English
          </Link>
          <Link
            href="/blog?language=tr"
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              language === "tr"
                ? "bg-blue-600 text-white"
                : "bg-white text-gray-600 border hover:bg-gray-50"
            }`}
          >
            Turkish
          </Link>
        </div>

        {/* Blog Grid */}
        {posts.length === 0 ? (
          <div className="rounded-lg border bg-white p-12 text-center">
            <p className="text-lg text-gray-500">No blog posts published yet. Check back soon!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="group rounded-lg border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                {/* Featured Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-blue-100 to-indigo-100 flex items-center justify-center">
                  {post.featuredImage ? (
                    <img
                      src={post.featuredImage}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-4xl text-blue-300">AHK</span>
                  )}
                </div>

                <div className="p-4">
                  {/* Language Badge */}
                  <div className="mb-2 flex items-center gap-2">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                        post.language === "tr"
                          ? "bg-red-100 text-red-700"
                          : "bg-blue-100 text-blue-700"
                      }`}
                    >
                      {post.language === "tr" ? "Turkce" : "English"}
                    </span>
                    <span className="text-xs text-gray-400">
                      {estimateReadTime(post.content)} min read
                    </span>
                  </div>

                  {/* Title */}
                  <h2 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                    {post.title}
                  </h2>

                  {/* Excerpt */}
                  <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                    {post.excerpt || post.content.slice(0, 150)}
                  </p>

                  {/* Footer */}
                  <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
                    <span>{post.author.name}</span>
                    <span>{post.publishedAt ? formatDate(post.publishedAt) : ""}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-white mt-16">
        <div className="mx-auto max-w-6xl px-4 py-8 text-center text-sm text-gray-500">
          <p>AHK Academy - Learn English with confidence</p>
          <p className="mt-1">Speaking sessions, personalized lessons, and AI-powered feedback</p>
        </div>
      </footer>
    </div>
  );
}
