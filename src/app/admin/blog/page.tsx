import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

function formatDate(date: Date | null): string {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    PUBLISHED: "bg-green-100 text-green-800",
    DRAFT: "bg-gray-100 text-gray-800",
    SCHEDULED: "bg-blue-100 text-blue-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || "bg-gray-100 text-gray-800"}`}>
      {status}
    </span>
  );
}

function LanguageBadge({ language }: { language: string }) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
        language === "tr" ? "bg-red-100 text-red-700" : "bg-blue-100 text-blue-700"
      }`}
    >
      {language === "tr" ? "TR" : "EN"}
    </span>
  );
}

export default async function AdminBlogPage() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [posts, totalPosts, publishedPosts, draftPosts] = await Promise.all([
    db.blogPost.findMany({
      include: { author: { select: { name: true } } },
      orderBy: { createdAt: "desc" },
    }),
    db.blogPost.count(),
    db.blogPost.count({ where: { status: "PUBLISHED" } }),
    db.blogPost.count({ where: { status: "DRAFT" } }),
  ]);

  const enPosts = posts.filter((p) => p.language === "en").length;
  const trPosts = posts.filter((p) => p.language === "tr").length;

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          <p className="mt-1 text-gray-500">Create and manage blog posts for SEO and engagement.</p>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Posts</p>
          <p className="text-2xl font-bold text-gray-900">{totalPosts}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Published</p>
          <p className="text-2xl font-bold text-green-600">{publishedPosts}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Drafts</p>
          <p className="text-2xl font-bold text-gray-600">{draftPosts}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Languages</p>
          <p className="text-2xl font-bold text-blue-600">
            {enPosts} EN / {trPosts} TR
          </p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mb-6 flex flex-wrap gap-3">
        <details className="relative">
          <summary className="cursor-pointer rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 transition-colors list-none">
            Generate with AI
          </summary>
          <div className="absolute left-0 top-full z-10 mt-2 w-96 rounded-lg border bg-white p-4 shadow-lg">
            <h3 className="text-sm font-semibold mb-3">AI Blog Generator</h3>
            <form action="/api/blog/generate" method="POST" className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Topic</label>
                <input
                  type="text"
                  name="topic"
                  placeholder="e.g., Common English mistakes Turkish speakers make"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
                <select
                  name="language"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                >
                  <option value="en">English</option>
                  <option value="tr">Turkish</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  Target Keyword (optional)
                </label>
                <input
                  type="text"
                  name="targetKeyword"
                  placeholder="e.g., learn English online Turkey"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
              >
                Generate Blog Post
              </button>
            </form>
          </div>
        </details>

        <details className="relative">
          <summary className="cursor-pointer rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors list-none">
            Create Post
          </summary>
          <div className="absolute left-0 top-full z-10 mt-2 w-96 rounded-lg border bg-white p-4 shadow-lg">
            <h3 className="text-sm font-semibold mb-3">Create Blog Post</h3>
            <form action="/api/blog" method="POST" className="space-y-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Blog post title"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Content</label>
                <textarea
                  name="content"
                  rows={4}
                  placeholder="Write your blog post content (supports Markdown)..."
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Excerpt</label>
                <input
                  type="text"
                  name="excerpt"
                  placeholder="Short summary for preview cards"
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Language</label>
                  <select
                    name="language"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="en">English</option>
                    <option value="tr">Turkish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                  <select
                    name="status"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                  </select>
                </div>
              </div>
              <button
                type="submit"
                className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
              >
                Create Post
              </button>
            </form>
          </div>
        </details>
      </div>

      {/* Posts Table */}
      <div className="rounded-lg border bg-white shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-gray-50">
                <th className="px-4 py-3 text-left font-medium text-gray-700">Title</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Language</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Status</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Published</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {posts.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                    No blog posts yet. Use &quot;Generate with AI&quot; or &quot;Create Post&quot; to get started.
                  </td>
                </tr>
              ) : (
                posts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900 truncate max-w-xs">
                          {post.title}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-xs">
                          /{post.slug}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <LanguageBadge language={post.language} />
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={post.status} />
                    </td>
                    <td className="px-4 py-3 text-gray-500">
                      {formatDate(post.publishedAt)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Link
                          href={`/blog/${post.slug}`}
                          className="text-xs text-blue-600 hover:underline"
                          target="_blank"
                        >
                          View
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
