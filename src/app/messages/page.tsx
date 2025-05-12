import { Search, Plus } from "lucide-react";
import Image from "next/image";

// Define a type for a message
interface Message {
  id: number;
  sender: string;
  avatar: string;
  message: string;
  timestamp: string;
  online: boolean;
  verified: boolean;
}

// Messages array is now initially empty and uses the Message type
const messages: Message[] = [];

export default function MessagesPage() {
  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-semibold">Messages</h1>
        <div className="flex items-center space-x-3">
          <button className="text-gray-600 hover:text-purple-600">
            <Search size={24} />
          </button>
          <button className="text-gray-600 hover:text-purple-600">
            <Plus size={28} />
          </button>
        </div>
      </div>
      {/* Placeholder for Message filter dropdown */}
      <div className="mb-4">
        <select className="p-2 border rounded-md bg-white shadow-sm">
          <option>All Messages</option>
        </select>
      </div>
      {/* Placeholder for Messages list */}
      <div className="bg-white rounded-lg shadow min-h-[300px] flex flex-col items-center justify-center">
        {messages.length === 0 ? (
          <p className="p-4 text-gray-500">No messages yet.</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg.id}
              className="flex items-center p-4 border-b last:border-b-0 w-full"
            >
              <div className="relative mr-3">
                <Image
                  src={msg.avatar}
                  alt={`${msg.sender} avatar`}
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                {msg.online && (
                  <span className="absolute bottom-0 right-0 block h-3 w-3 bg-green-500 rounded-full ring-2 ring-white"></span>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center">
                  <p className="font-semibold text-sm mr-1">{msg.sender}</p>
                  {msg.verified && (
                    <span className="text-purple-500">✓</span>
                  )}{/* Placeholder for verified icon */}
                </div>
                <p className="text-gray-600 text-sm truncate">
                  {msg.message}
                </p>
              </div>
              <div className="text-right ml-2">
                <p className="text-xs text-gray-500 mb-1">
                  {msg.timestamp}
                </p>
                {!msg.online && (
                  <span className="block h-2 w-2 bg-red-500 rounded-full ml-auto"></span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

