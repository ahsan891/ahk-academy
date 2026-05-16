import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diff = now.getTime() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function TypeBadge({ type }: { type: string }) {
  const colors: Record<string, string> = {
    LEAD: "bg-yellow-100 text-yellow-800",
    STUDENT: "bg-blue-100 text-blue-800",
    TEACHER: "bg-green-100 text-green-800",
    SUPPORT: "bg-purple-100 text-purple-800",
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[type] || "bg-gray-100 text-gray-800"}`}>
      {type}
    </span>
  );
}

export default async function WhatsAppDashboard() {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const [conversations, stats] = await Promise.all([
    db.whatsappConversation.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: { orderBy: { sentAt: "desc" }, take: 1 },
      },
      orderBy: { lastMessageAt: "desc" },
      take: 50,
    }),
    Promise.all([
      db.whatsappConversation.count(),
      db.whatsappConversation.count({ where: { conversationType: "LEAD", isActive: true } }),
      db.whatsappConversation.count({ where: { conversationType: "STUDENT" } }),
      db.whatsappMessage.count({ where: { direction: "INBOUND", readAt: null } }),
    ]),
  ]);

  const [totalConversations, activeLeads, studentChats, unreadCount] = stats;

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">WhatsApp Dashboard</h1>
        <p className="mt-1 text-gray-500">Manage conversations and leads via WhatsApp.</p>
      </div>

      {/* Stats */}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Total Conversations</p>
          <p className="text-2xl font-bold text-gray-900">{totalConversations}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Active Leads</p>
          <p className="text-2xl font-bold text-yellow-600">{activeLeads}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Student Chats</p>
          <p className="text-2xl font-bold text-blue-600">{studentChats}</p>
        </div>
        <div className="rounded-lg border bg-white p-4 shadow-sm">
          <p className="text-sm text-gray-500">Unread Messages</p>
          <p className="text-2xl font-bold text-red-600">{unreadCount}</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Conversation List */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">Conversations</h2>
            </div>
            <div className="divide-y">
              {conversations.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  No conversations yet. Leads will appear here when they message your WhatsApp number.
                </div>
              ) : (
                conversations.map((conv) => (
                  <Link
                    key={conv.id}
                    href={`/admin/whatsapp/${conv.id}`}
                    className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-green-100 text-green-700 font-medium">
                        {conv.user?.name?.charAt(0) || conv.phoneNumber.slice(-2)}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {conv.user?.name || conv.phoneNumber}
                          </p>
                          <TypeBadge type={conv.conversationType} />
                        </div>
                        <p className="text-xs text-gray-500 truncate">
                          {conv.messages[0]?.content || "No messages"}
                        </p>
                      </div>
                    </div>
                    <span className="shrink-0 text-xs text-gray-400 ml-2">
                      {formatRelativeTime(conv.lastMessageAt)}
                    </span>
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Quick Send */}
        <div>
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-4">Quick Send</h3>
            <form action="/api/whatsapp/send" method="POST">
              <div className="space-y-3">
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    placeholder="+905xxxxxxxxx"
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    rows={3}
                    placeholder="Type your message..."
                    className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  Send Message
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
