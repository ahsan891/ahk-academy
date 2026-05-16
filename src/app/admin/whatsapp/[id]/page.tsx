import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

export default async function WhatsAppConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user?.id || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  const { id } = await params;

  const conversation = await db.whatsappConversation.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          phone: true,
          country: true,
          language: true,
          createdAt: true,
        },
      },
      messages: {
        orderBy: { sentAt: "asc" },
      },
    },
  });

  if (!conversation) {
    notFound();
  }

  // Group messages by date
  const messagesByDate: Record<string, typeof conversation.messages> = {};
  for (const msg of conversation.messages) {
    const dateKey = formatDate(msg.sentAt);
    if (!messagesByDate[dateKey]) {
      messagesByDate[dateKey] = [];
    }
    messagesByDate[dateKey].push(msg);
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/admin/whatsapp"
            className="rounded-md border px-3 py-1.5 text-sm hover:bg-gray-50"
          >
            Back
          </Link>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-gray-900">
                {conversation.user?.name || conversation.phoneNumber}
              </h1>
              <TypeBadge type={conversation.conversationType} />
            </div>
            <p className="text-sm text-gray-500">{conversation.phoneNumber}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Message Thread */}
        <div className="lg:col-span-2">
          <div className="rounded-lg border bg-white shadow-sm">
            <div className="border-b p-4">
              <h2 className="text-lg font-semibold">Messages</h2>
            </div>

            {/* Messages */}
            <div className="h-[500px] overflow-y-auto p-4 space-y-4 bg-gray-50">
              {Object.entries(messagesByDate).map(([date, messages]) => (
                <div key={date}>
                  <div className="flex justify-center mb-3">
                    <span className="rounded-full bg-gray-200 px-3 py-1 text-xs text-gray-600">
                      {date}
                    </span>
                  </div>
                  <div className="space-y-2">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.direction === "OUTBOUND" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[75%] rounded-lg px-3 py-2 ${
                            msg.direction === "OUTBOUND"
                              ? "bg-green-100 text-green-900"
                              : "bg-white text-gray-900 border"
                          }`}
                        >
                          <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                          <p className={`text-xs mt-1 ${msg.direction === "OUTBOUND" ? "text-green-600" : "text-gray-400"}`}>
                            {formatTime(msg.sentAt)}
                            {msg.templateName && (
                              <span className="ml-1 italic">[{msg.templateName}]</span>
                            )}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}

              {conversation.messages.length === 0 && (
                <div className="flex h-full items-center justify-center text-gray-500">
                  No messages yet
                </div>
              )}
            </div>

            {/* Reply Input */}
            <div className="border-t p-4">
              <form action="/api/whatsapp/send" method="POST" className="flex gap-2">
                <input type="hidden" name="phone" value={conversation.phoneNumber} />
                <input
                  type="text"
                  name="message"
                  placeholder="Type a reply..."
                  className="flex-1 rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
                <button
                  type="submit"
                  className="rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* User Info Sidebar */}
        <div className="space-y-4">
          {conversation.user ? (
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">User Info</h3>
              <div className="space-y-2">
                <div>
                  <p className="text-xs text-gray-500">Name</p>
                  <p className="text-sm font-medium">{conversation.user.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Email</p>
                  <p className="text-sm font-medium">{conversation.user.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Role</p>
                  <p className="text-sm font-medium">{conversation.user.role}</p>
                </div>
                {conversation.user.country && (
                  <div>
                    <p className="text-xs text-gray-500">Country</p>
                    <p className="text-sm font-medium">{conversation.user.country}</p>
                  </div>
                )}
                {conversation.user.language && (
                  <div>
                    <p className="text-xs text-gray-500">Language</p>
                    <p className="text-sm font-medium">{conversation.user.language}</p>
                  </div>
                )}
                <div>
                  <p className="text-xs text-gray-500">Joined</p>
                  <p className="text-sm font-medium">{formatDate(conversation.user.createdAt)}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Lead Info</h3>
              <p className="text-sm text-gray-500">
                This phone number is not linked to any user account.
              </p>
              <p className="mt-2 text-sm font-medium">{conversation.phoneNumber}</p>
            </div>
          )}

          {/* Conversation Details */}
          <div className="rounded-lg border bg-white p-4 shadow-sm">
            <h3 className="text-lg font-semibold mb-3">Details</h3>
            <div className="space-y-2">
              <div>
                <p className="text-xs text-gray-500">Type</p>
                <TypeBadge type={conversation.conversationType} />
              </div>
              <div>
                <p className="text-xs text-gray-500">Status</p>
                <p className="text-sm font-medium">
                  {conversation.isActive ? "Active" : "Inactive"}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Messages</p>
                <p className="text-sm font-medium">{conversation.messages.length}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Last Activity</p>
                <p className="text-sm font-medium">{formatDate(conversation.lastMessageAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
