"use client";

import { useEffect, useState, FormEvent } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, Paperclip, Mic, AlertCircle, Loader2, Check, X as XIcon } from "lucide-react";
import Image from "next/image";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface ChatMessage {
  id: string;
  senderId: string; // "user" or the other person's ID
  text: string;
  timestamp: string;
  avatarUrl?: string;
  type: "text" | "image" | "audio";
}

interface ChatParticipant {
    id: string;
    name: string;
    avatarUrl: string;
    isVerified: boolean;
    isOnline: boolean;
}

// Placeholder data - replace with actual data fetching
const placeholderChatParticipants: Record<string, ChatParticipant> = {
    "1": { id: "1", name: "Kinsley", avatarUrl: "/placeholder-avatar.png", isVerified: true, isOnline: true },
    "2": { id: "2", name: "Oda", avatarUrl: "/placeholder-avatar.png", isVerified: true, isOnline: false },
    "3": { id: "3", name: "senyamarinalt", avatarUrl: "/placeholder-avatar.png", isVerified: false, isOnline: true },
    "4": { id: "4", name: "Nadya", avatarUrl: "/placeholder-avatar.png", isVerified: true, isOnline: true },
    "5": { id: "5", name: "Anna", avatarUrl: "/placeholder-avatar.png", isVerified: true, isOnline: false },
};

const placeholderChatHistory: Record<string, ChatMessage[]> = {
    "1": [
        { id: "c1-m1", senderId: "1", text: "Hey there!", timestamp: "10:00 AM", type: "text", avatarUrl: "/placeholder-avatar.png" },
        { id: "c1-m2", senderId: "user", text: "Hi Kinsley! How are you?", timestamp: "10:01 AM", type: "text" },
        { id: "c1-m3", senderId: "1", text: "Doing great! You?", timestamp: "10:02 AM", type: "text", avatarUrl: "/placeholder-avatar.png" },
        { id: "c1-m4", senderId: "1", text: "I don't turn you on?", timestamp: "13:16", type: "text", avatarUrl: "/placeholder-avatar.png" },
    ],
    "2": [
        { id: "c2-m1", senderId: "user", text: "Hello Oda!", timestamp: "11:00 AM", type: "text" },
        { id: "c2-m2", senderId: "2", text: "I need your help rn ", timestamp: "13:11", type: "text", avatarUrl: "/placeholder-avatar.png" },
    ],
    // Add more placeholder history for other chat IDs if needed
};

const CREDIT_COSTS = {
    text: 1,
    image: 5,
    audio: 10,
};

export default function ChatPage() {
  const supabase = createSupabaseBrowserClient();
  const router = useRouter();
  const params = useParams();
  const chatId = params.chatId as string;

  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatPartner, setChatPartner] = useState<ChatParticipant | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [userCredits, setUserCredits] = useState(100); // Placeholder credits
  const [showCreditPrompt, setShowCreditPrompt] = useState(false);

  useEffect(() => {
    const getSessionAndChatData = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error || !session) {
        router.push("/login");
        return;
      }
      setUser(session.user);

      // Fetch chat partner details and message history (placeholder)
      const partner = placeholderChatParticipants[chatId];
      const history = placeholderChatHistory[chatId] || [];
      
      if (partner) {
        setChatPartner(partner);
        setMessages(history);
      } else {
        // Handle chat not found, maybe redirect or show an error
        console.error("Chat partner not found for ID:", chatId);
        // router.push("/messages"); // Or a 404 page
      }
      setLoading(false);
    };

    if (chatId) {
        getSessionAndChatData();
    }
  }, [supabase, router, chatId]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement> | MouseEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user || !chatPartner) return;

    const cost = CREDIT_COSTS.text; // Assuming text message for now

    if (userCredits < cost) {
      setShowCreditPrompt(true);
      return;
    }

    setSending(true);
    setShowCreditPrompt(false);

    const messageToSend: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: user.id, // "user" or actual user ID
      text: newMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      type: "text",
    };

    // Simulate sending message
    await new Promise(resolve => setTimeout(resolve, 500));
    setMessages(prev => [...prev, messageToSend]);
    setUserCredits(prev => prev - cost);
    setNewMessage("");
    setSending(false);
  };

  if (loading) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-100">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600" />
        <p className="mt-4 text-lg text-gray-600">Loading chat...</p>
      </div>
    );
  }

  if (!chatPartner) {
    return (
      <div className="h-screen flex flex-col items-center justify-center bg-gray-100 p-4 text-center">
         <AlertCircle size={48} className="text-red-500 mb-4" />
        <p className="text-xl font-semibold text-gray-700 mb-2">Chat not found</p>
        <p className="text-gray-500 mb-6">The conversation you are looking for does not exist or has been moved.</p>
        <Button onClick={() => router.push("/messages")} variant="outline">
          <ArrowLeft size={18} className="mr-2" /> Go back to Messages
        </Button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm p-3 sm:p-4 flex items-center sticky top-0 z-10">
        <Button variant="ghost" size="icon" className="mr-2 sm:mr-3 text-gray-600 hover:text-purple-600" onClick={() => router.push("/messages")}>
          <ArrowLeft size={24} />
        </Button>
        <Image src={chatPartner.avatarUrl} alt={chatPartner.name} width={40} height={40} className="rounded-full w-10 h-10 object-cover" />
        <div className="ml-3">
          <h2 className="font-semibold text-gray-800 text-sm sm:text-base flex items-center">
            {chatPartner.name}
            {chatPartner.isVerified && <Check size={14} className="ml-1 text-blue-500 flex-shrink-0" />}
          </h2>
          {/* <p className="text-xs text-gray-500">{chatPartner.isOnline ? "Online" : "Offline"}</p> */}
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.senderId === user?.id || msg.senderId === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`flex items-end max-w-[70%] ${msg.senderId === user?.id || msg.senderId === "user" ? "flex-row-reverse" : "flex-row" }`}>
              {(msg.senderId !== user?.id && msg.senderId !== "user" && msg.avatarUrl) && (
                <Image src={msg.avatarUrl} alt="Sender" width={28} height={28} className="rounded-full w-7 h-7 object-cover mr-2 self-start" />
              )}
              <div
                className={`p-2.5 sm:p-3 rounded-xl ${msg.senderId === user?.id || msg.senderId === "user"
                    ? "bg-purple-600 text-white rounded-br-none"
                    : "bg-white text-gray-800 shadow-sm rounded-bl-none border border-gray-200"
                  }`}
              >
                <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                <p className={`text-xs mt-1 ${msg.senderId === user?.id || msg.senderId === "user" ? "text-purple-200" : "text-gray-400"} text-right`}>
                  {msg.timestamp}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Credit Prompt */}
      {showCreditPrompt && (
        <div className="p-3 bg-yellow-100 border-t border-yellow-300 text-center">
          <p className="text-sm text-yellow-700">
            You don"t have enough credits to send this message. 
            <Button variant="link" className="p-0 h-auto text-yellow-700 hover:text-yellow-800 underline ml-1" onClick={() => alert("Redirect to credit purchase page (placeholder)")}>
              Purchase Credits
            </Button>
          </p>
        </div>
      )}

      {/* Input Area */}
      <footer className="bg-white border-t border-gray-200 p-3 sm:p-4 sticky bottom-0 z-10">
        <form onSubmit={handleSendMessage} className="flex items-center space-x-2 sm:space-x-3">
          <Button variant="ghost" size="icon" className="text-gray-500 hover:text-purple-600 flex-shrink-0">
            <Paperclip size={22} />
          </Button>
          <Input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 h-10 sm:h-11 rounded-full px-4 focus-visible:ring-purple-500"
            disabled={sending}
          />
          {newMessage.trim() ? (
            <Button type="submit" size="icon" className="bg-purple-600 hover:bg-purple-700 text-white rounded-full w-10 h-10 sm:w-11 sm:h-11 flex-shrink-0" disabled={sending}>
              {sending ? <Loader2 className="animate-spin h-5 w-5" /> : <Send size={20} />}
            </Button>
          ) : (
            <Button type="button" size="icon" className="text-gray-500 hover:text-purple-600 flex-shrink-0">
              <Mic size={22} />
            </Button>
          )}
        </form>
      </footer>
    </div>
  );
}

