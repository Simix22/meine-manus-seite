"use client";

import Link from 'next/link';
import { Bell, Menu, Search, X } from 'lucide-react'; // Added X for close icon

interface HeaderProps {
  toggleMobileSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ toggleMobileSidebar }) => {
  return (
    <header className="bg-white shadow-sm p-4 flex justify-between items-center md:hidden sticky top-0 z-50">
      <div className="flex items-center">
        <Link href="/" className="text-2xl font-bold text-purple-600">
          FANFIX
        </Link>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-purple-600">
          <Search size={24} />
        </button>
        <Link href="/notifications" className="text-gray-600 hover:text-purple-600 relative">
          <Bell size={24} />
          {/* Example notification badge - can be made dynamic later */}
          <span className="absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </Link>
        <button 
          className="text-gray-600 hover:text-purple-600 md:hidden" 
          onClick={toggleMobileSidebar} 
          aria-label="Toggle menu"
        >
          <Menu size={24} />
        </button>
      </div>
    </header>
  );
};

export default Header;

