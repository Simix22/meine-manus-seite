import { Search, Plus } from 'lucide-react';

// Placeholder data for messages
const messages = [
  {
    id: 1,
    sender: "rachelbrockman",
    avatar: "/placeholder-avatar-1.jpg", // Replace with actual avatar path or component
    message: "hii Simon just checking innn I hav...",
    timestamp: "Yesterday",
    online: true,
    verified: true,
  },
  {
    id: 2,
    sender: "brookemonk",
    avatar: "/placeholder-avatar-2.jpg", // Replace with actual avatar path or component
    message: "Happy Monday!! What was the highligh...",
    timestamp: "4w ago",
    online: false,
    verified: true,
  },
];

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
      <div className="bg-white rounded-lg shadow">
        {messages.map((msg) => (
          <div key={msg.id} className="flex items-center p-4 border-b last:border-b-0">
            <div className="relative mr-3">
              {/* Placeholder for avatar image - ideally use Next/Image */}
              <img src={msg.avatar} alt={msg.sender} className="w-12 h-12 rounded-full object-cover" />
              {msg.online && (
                <span className="absolute bottom-0 right-0 block h-3 w-3 bg-green-500 rounded-full ring-2 ring-white"></span>
              )}
            </div>
            <div className="flex-1">
              <div className="flex items-center">
                <p className="font-semibold text-sm mr-1">{msg.sender}</p>
                {msg.verified && <span className="text-purple-500">✓</span>}{/* Placeholder for verified icon */}
              </div>
              <p className="text-gray-600 text-sm truncate">{msg.message}</p>
            </div>
            <div className="text-right ml-2">
              <p className="text-xs text-gray-500 mb-1">{msg.timestamp}</p>
              {!msg.online && <span className="block h-2 w-2 bg-red-500 rounded-full ml-auto"></span>}
            </div>
          </div>
        ))}
        {messages.length === 0 && (
            <p className="p-4 text-gray-500">No messages yet.</p>
        )}
      </div>
    </div>
  );
}

