import Link from 'next/link';
import { Home, MessageSquare, Image, Bell, Settings, Info, LogOut, CheckCircle } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="hidden md:flex flex-col w-64 bg-white shadow-lg p-6 space-y-4 fixed top-0 left-0 h-full z-40">
      <div className="flex items-center mb-8">
        <CheckCircle className="text-purple-600 mr-2" size={28}/>
        <Link href="/" className="text-3xl font-bold text-purple-600">
          FANFIX
        </Link>
      </div>
      <nav className="flex-1 space-y-2">
        <Link href="/" className="flex items-center p-3 text-gray-700 hover:bg-purple-100 hover:text-purple-600 rounded-lg transition-colors">
          <Home size={20} className="mr-3" />
          Home
        </Link>
        <Link href="/messages" className="flex items-center p-3 text-gray-700 hover:bg-purple-100 hover:text-purple-600 rounded-lg transition-colors relative">
          <MessageSquare size={20} className="mr-3" />
          Messages
          <span className="ml-auto bg-purple-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">2</span>
        </Link>
        <Link href="/gallery" className="flex items-center p-3 text-gray-700 font-semibold bg-purple-100 text-purple-600 rounded-lg transition-colors">
          <Image size={20} className="mr-3" />
          Gallery
        </Link>
        <Link href="/notifications" className="flex items-center p-3 text-gray-700 hover:bg-purple-100 hover:text-purple-600 rounded-lg transition-colors relative">
          <Bell size={20} className="mr-3" />
          Notifications
          <span className="ml-auto bg-purple-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">3</span>
        </Link>
      </nav>
      <div className="mt-auto space-y-2">
        <Link href="/settings" className="flex items-center p-3 text-gray-700 hover:bg-purple-100 hover:text-purple-600 rounded-lg transition-colors">
          <Settings size={20} className="mr-3" />
          Settings
        </Link>
        <Link href="/contact-us" className="flex items-center p-3 text-gray-700 hover:bg-purple-100 hover:text-purple-600 rounded-lg transition-colors">
          <Info size={20} className="mr-3" />
          Contact Us
        </Link>
        <Link href="/sign-out" className="flex items-center p-3 text-gray-700 hover:bg-purple-100 hover:text-purple-600 rounded-lg transition-colors">
          <LogOut size={20} className="mr-3" />
          Sign Out
        </Link>
      </div>
    </aside>
  );
};

export default Sidebar;

