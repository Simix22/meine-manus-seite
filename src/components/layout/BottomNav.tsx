"use client"; // Required for usePathname

import Link from 'next/link';
import { Home, MessageSquare, UserCircle } from 'lucide-react'; // Added UserCircle
import { usePathname } from 'next/navigation'; // Import usePathname

const BottomNav = () => {
  const pathname = usePathname(); // Get current path

  const navItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/messages", label: "Messages", icon: MessageSquare },
    { href: "/profile", label: "My Profile", icon: UserCircle }, // Added My Profile
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-t border-t border-gray-200 p-3 flex justify-around items-center z-50">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center transition-colors ${
              isActive
                ? "text-purple-600 font-semibold"
                : "text-gray-600 hover:text-purple-600"
            }`}
          >
            <item.icon size={24} aria-label={`${item.label} icon`} />
            <span className="text-xs mt-1">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

export default BottomNav;

