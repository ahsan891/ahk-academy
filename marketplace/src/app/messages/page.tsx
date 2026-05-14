"use client";

import { Suspense, useState, useEffect, useRef, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { getInitials } from "@/lib/utils";
import {
  MessageSquare,
  Send,
  RefreshCw,
  Search,
  Loader2,
  User,
} from "lucide-react";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender: { id: string; name: string; avatar: string | null };
  receiver: { id: string; name: string; avatar: string | null };
}

interface Conversation {
  partnerId: string;
  partnerName: string;
  partnerAvatar: string | null;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="flex h-[600px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-600" /></div>}>
      <MessagesContent />
    </Suspense>
  );
}

function MessagesContent() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const initialPartner = searchParams.get("with");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string | null>(
    initialPartner
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = session?.user?.id;

  // Scroll to bottom of messages
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  // Fetch conversations
  const fetchConversations = useCallback(async () => {
    if (!userId) return;
    try {
      const res = await fetch("/api/messages/conversations");
      if (res.ok) {
        const data = await res.json();
        setConversations(data);
      }
    } catch {
      // Silently handle error
    }
  }, [userId]);

  // Fetch messages for a conversation
  const fetchMessages = useCallback(
    async (partnerId: string) => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/messages?partnerId=${partnerId}`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
          // Mark as read
          await fetch("/api/messages/read", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ partnerId }),
          });
        }
      } catch {
        // Silently handle error
      }
    },
    [userId]
  );

  // Initial load
  useEffect(() => {
    async function init() {
      setLoading(true);
      await fetchConversations();
      if (initialPartner) {
        await fetchMessages(initialPartner);
      }
      setLoading(false);
    }
    if (userId) init();
  }, [userId, initialPartner, fetchConversations, fetchMessages]);

  // When selected conversation changes
  useEffect(() => {
    if (selectedPartnerId) {
      fetchMessages(selectedPartnerId);
    }
  }, [selectedPartnerId, fetchMessages]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Send a message
  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !selectedPartnerId || sending) return;

    setSending(true);
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          receiverId: selectedPartnerId,
          content: newMessage.trim(),
        }),
      });

      if (res.ok) {
        const message = await res.json();
        setMessages((prev) => [...prev, message]);
        setNewMessage("");
        // Update conversation list
        fetchConversations();
      }
    } catch {
      // Silently handle error
    } finally {
      setSending(false);
    }
  }

  // Refresh messages
  async function handleRefresh() {
    setRefreshing(true);
    await fetchConversations();
    if (selectedPartnerId) {
      await fetchMessages(selectedPartnerId);
    }
    setRefreshing(false);
  }

  // Get selected partner info
  const selectedConversation = conversations.find(
    (c) => c.partnerId === selectedPartnerId
  );

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) =>
    c.partnerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time for messages
  function formatMessageTime(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return date.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
    } else if (diffDays === 1) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return date.toLocaleDateString("en-US", { weekday: "short" });
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    }
  }

  if (!session?.user) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <p className="text-gray-500">Please sign in to view messages.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-[600px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
          <p className="mt-1 text-gray-500">Chat with your tutors.</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing}>
          <RefreshCw
            className={`mr-2 h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
          />
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden">
        <div className="flex h-[600px]">
          {/* Conversations Sidebar */}
          <div className="w-80 shrink-0 border-r">
            {/* Search */}
            <div className="border-b p-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  placeholder="Search conversations..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            {/* Conversation List */}
            <div className="overflow-y-auto" style={{ height: "calc(100% - 57px)" }}>
              {filteredConversations.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-8 text-center">
                  <MessageSquare className="h-10 w-10 text-gray-300" />
                  <p className="mt-3 text-sm text-gray-500">
                    {searchQuery
                      ? "No conversations found."
                      : "No messages yet. Start a conversation with a tutor!"}
                  </p>
                </div>
              ) : (
                filteredConversations.map((conv) => (
                  <button
                    key={conv.partnerId}
                    onClick={() => setSelectedPartnerId(conv.partnerId)}
                    className={`flex w-full items-start gap-3 border-b p-4 text-left transition-colors ${
                      selectedPartnerId === conv.partnerId
                        ? "bg-indigo-50"
                        : "hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                      {conv.partnerAvatar ? (
                        <img
                          src={conv.partnerAvatar}
                          alt={conv.partnerName}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        getInitials(conv.partnerName)
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between">
                        <p className="truncate text-sm font-semibold text-gray-900">
                          {conv.partnerName}
                        </p>
                        <span className="shrink-0 text-xs text-gray-400">
                          {formatMessageTime(conv.lastMessageAt)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <p className="mt-0.5 truncate text-xs text-gray-500">
                          {conv.lastMessage}
                        </p>
                        {conv.unreadCount > 0 && (
                          <Badge className="ml-2 shrink-0">
                            {conv.unreadCount}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Message Panel */}
          <div className="flex flex-1 flex-col">
            {!selectedPartnerId ? (
              <div className="flex flex-1 flex-col items-center justify-center text-center">
                <MessageSquare className="h-16 w-16 text-gray-200" />
                <p className="mt-4 text-lg font-medium text-gray-400">
                  Select a conversation
                </p>
                <p className="mt-1 text-sm text-gray-300">
                  Choose a conversation from the left to start messaging.
                </p>
              </div>
            ) : (
              <>
                {/* Chat Header */}
                <div className="flex items-center gap-3 border-b px-5 py-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
                    {selectedConversation?.partnerAvatar ? (
                      <img
                        src={selectedConversation.partnerAvatar}
                        alt={selectedConversation.partnerName}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      selectedConversation
                        ? getInitials(selectedConversation.partnerName)
                        : <User className="h-4 w-4" />
                    )}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">
                      {selectedConversation?.partnerName || "Conversation"}
                    </p>
                    <p className="text-xs text-gray-400">Tutor</p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-5">
                  {messages.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-center">
                      <MessageSquare className="h-10 w-10 text-gray-200" />
                      <p className="mt-3 text-sm text-gray-400">
                        No messages yet. Start the conversation!
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {messages.map((msg) => {
                        const isOwn = msg.senderId === userId;
                        return (
                          <div
                            key={msg.id}
                            className={`flex ${isOwn ? "justify-end" : "justify-start"}`}
                          >
                            <div
                              className={`max-w-[70%] rounded-2xl px-4 py-2.5 ${
                                isOwn
                                  ? "bg-indigo-600 text-white"
                                  : "bg-gray-100 text-gray-900"
                              }`}
                            >
                              <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                              <p
                                className={`mt-1 text-right text-xs ${
                                  isOwn ? "text-indigo-200" : "text-gray-400"
                                }`}
                              >
                                {formatMessageTime(msg.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                {/* Message Input */}
                <div className="border-t p-4">
                  <form onSubmit={handleSend} className="flex gap-2">
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                      disabled={sending}
                    />
                    <Button
                      type="submit"
                      disabled={sending || !newMessage.trim()}
                      size="icon"
                    >
                      {sending ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Send className="h-4 w-4" />
                      )}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}
