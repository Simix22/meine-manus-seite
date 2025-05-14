"use client";

import { useEffect, useState } from "react";
import { redirect, useRouter } from "next/navigation"; // Import useRouter
import Link from "next/link"; // Import Link
import { Search, Edit3, MessageCircle, Loader2, Check, X as XIcon, Dot } from "lucide-react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface MessageItem {
  id: string;
  senderName: string;
  senderHandle: string;
  avatarUrl: string;
  messagePreview: string;
  timestamp: string;
  isOnline: boolean;
  isVerified: boolean;
  isUnread: boolean;
}

const placeholderMessages: MessageItem[] = [
  {
    id: "1",
    senderName: "Kinsley",
    senderHandle: "kinsleyalyse",
    avatarUrl: "/placeholder-avatar.png",
    messagePreview: "I don't turn you on?",
    timestamp: "13:16",
    isOnline: true,
    isVerified: true,
    isUnread: true,
  },
  {
    id: "2",
    senderName: "Oda",
    senderHandle: "odarochka",
    avatarUrl: "/placeholder-avatar.png",
    messagePreview: "I need your help rn ",
    timestamp: "13:11",
    isOnline: false,
    isVerified: true,
    isUnread: true,
  },
  {
    id: "3",
    senderName: "senyamarinalt",
    senderHandle: "hiitssenya",
    avatarUrl: "/placeholder-avatar.png",
    messagePreview: "hey are you lost?",
    timestamp: "10:24",
    isOnline: true,
    isVerified: false,
    isUnread: true,
  },
  {
    id: "4",
    senderName: "Nadya",
    senderHandle: "nadya.yereminn",
    avatarUrl: "/placeholder-avatar.png",
    messagePreview: "should i give u a chance?",
    timestamp: "6:33",
    isOnline: true,
    isVerified: true,
    isUnread: false,
  },
  {
    id: "5",
    senderName: "Anna",
    senderHandle: "maligoshik",
    avatarUrl: "/placeholder-avatar.png",
    messagePreview: "wanna fuck me? ",
    timestamp: "2:17",
    isOnline: false,
    isVerified: true,
    isUnread: false,
  },
];

export default function MessagesPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter(); // Initialize useRouter
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [filter, setFilter] = useState<"all" | "unread">("all");

  useEffect(() => {
    const getSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        redirect("/login");
        return;
      }
      setUser(session.user);
      setTimeout(() => {
        setMessages(placeholderMessages);
        setLoading(false);
      }, 500);
    };
    getSession();
  }, [supabase]);

  const unreadCount = messages.filter(m => m.isUnread).length;
  const filteredMessages = filter === "unread" ? messages.filter(m => m.isUnread) : messages;

  const handleDeleteMessage = (messageId: string) => {
    console.log("Delete message:", messageId);
    setMessages(prevMessages => prevMessages.filter(msg => msg.id !== messageId));
  };

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        <p className="mt-4 text-lg text-gray-600">Loading messages...</p>
      </div>
    );
  }

  if (!user) {
    return (
        <div className="min-h-[calc(100vh-150px)] flex flex-col items-center justify-center p-4">
            <p className="text-red-500">User not authenticated. Redirecting...</p>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-lg font-semibold text-gray-700">NEUESTES ZUERST</h1>
        </div>
        <div className="flex items-center space-x-2 mb-6">
          <Button
            variant={filter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("all")}
            className={`rounded-full px-4 py-1.5 text-sm h-auto ${filter === "all" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Alle
          </Button>
          <Button
            variant={filter === "unread" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter("unread")}
            className={`rounded-full px-4 py-1.5 text-sm h-auto flex items-center ${filter === "unread" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-gray-200 text-gray-700 hover:bg-gray-300"}`}
          >
            Ungelesen
            {unreadCount > 0 && (
              <Badge variant="default" className="ml-2 bg-blue-600 text-white rounded-full px-1.5 py-0.5 text-xs h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </Badge>
            )}
          </Button>
          <button className="ml-auto p-2 text-gray-500 hover:text-purple-600">
            <Edit3 size={20} />
          </button>
        </div>

        {filteredMessages.length === 0 ? (
          <div className="p-10 text-center text-gray-500 bg-white rounded-xl shadow-md">
            <MessageCircle size={48} className="mx-auto mb-4 text-gray-400" />
            <p className="text-lg font-medium">No messages here.</p>
            <p className="text-sm">{filter === "unread" ? "You have no unread messages." : "Start a new conversation to see messages."}</p>
          </div>
        ) : (
          <ul className="bg-white rounded-xl shadow-md divide-y divide-gray-100">
            {filteredMessages.map((msg) => (
              <li key={msg.id}>
                <Link href={`/messages/${msg.id}`} className="block p-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="relative flex-shrink-0">
                      <Image
                        src={msg.avatarUrl}
                        alt={`${msg.senderName} avatar`}
                        width={48}
                        height={48}
                        className="rounded-full object-cover w-12 h-12 ring-1 ring-gray-200"
                      />
                      {msg.isOnline && (
                        <span className="absolute bottom-0 right-0 block h-3 w-3 bg-green-400 rounded-full ring-2 ring-white"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center">
                        <p className="text-sm font-semibold text-gray-800 truncate">
                          {msg.senderName}
                        </p>
                        {msg.isVerified && (
                          <Check size={14} className="ml-1 text-blue-500 flex-shrink-0" />
                        )}
                        <p className="ml-1 text-xs text-gray-500 truncate">@{msg.senderHandle}</p>
                      </div>
                      <p className={`mt-0.5 text-sm text-gray-600 truncate ${msg.isUnread ? "font-semibold text-gray-800" : ""}`}>
                        {msg.messagePreview}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-1 ml-2 text-xs text-gray-500 whitespace-nowrap flex-shrink-0">
                      <p>{msg.timestamp}</p>
                      <div className="flex items-center">
                          {msg.isUnread && (
                              <span className="block h-2.5 w-2.5 bg-blue-500 rounded-full mr-1.5"></span>
                          )}
                          <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleDeleteMessage(msg.id); }} className="text-gray-400 hover:text-red-500">
                              <XIcon size={16} />
                          </button>
                      </div>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
