"use client";

import Link from 'next/link';
import { Home, MessageSquare, Image, Bell, Settings, Info, LogOut, CheckCircle, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

interface SidebarProps {
  isMobileOpen: boolean;
  toggleMobileSidebar: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, toggleMobileSidebar }) => {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Home", icon: Home, badge: null },
    { href: "/messages", label: "Messages", icon: MessageSquare, badge: 2 },
    { href: "/gallery", label: "Gallery", icon: Image, badge: null },
    { href: "/notifications", label: "Notifications", icon: Bell, badge: 3 },
  ];

  const bottomNavItems = [
    { href: "/settings", label: "Settings", icon: Settings },
    { href: "/contact-us", label: "Contact Us", icon: Info },
    { href: "/sign-out", label: "Sign Out", icon: LogOut },
  ];

  const sidebarClasses = `
    flex flex-col w-64 bg-white shadow-lg p-6 space-y-4 fixed top-0 left-0 h-full z-50 transition-transform duration-300 ease-in-out
    md:translate-x-0 md:flex
    ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
  `;

  return (
    <aside className={sidebarClasses}>
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center">
          <CheckCircle className="text-purple-600 mr-2" size={28} aria-label="Fanfix Logo Checkmark"/>
          <Link href="/" className="text-3xl font-bold text-purple-600">
            FANFIX
          </Link>
        </div>
        <button onClick={toggleMobileSidebar} className="md:hidden text-gray-600 hover:text-purple-600" aria-label="Close menu">
          <X size={24} />
        </button>
      </div>
      <nav className="flex-1 space-y-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href === "/gallery" && pathname.startsWith("/gallery"));
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={isMobileOpen ? toggleMobileSidebar : undefined} // Close sidebar on mobile nav click
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive
                  ? "font-semibold bg-purple-100 text-purple-600"
                  : "text-gray-700 hover:bg-purple-100 hover:text-purple-600"
              }`}
            >
              <item.icon size={20} className="mr-3" aria-hidden="true" />
              {item.label}
              {item.badge && (
                <span className="ml-auto bg-purple-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {item.badge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto space-y-2">
        {bottomNavItems.map((item) => {
           const isActive = pathname === item.href;
          return (
            <Link
              key={item.label}
              href={item.href}
              onClick={isMobileOpen ? toggleMobileSidebar : undefined} // Close sidebar on mobile nav click
              className={`flex items-center p-3 rounded-lg transition-colors ${
                isActive
                  ? "font-semibold bg-purple-100 text-purple-600"
                  : "text-gray-700 hover:bg-purple-100 hover:text-purple-600"
              }`}
            >
              <item.icon size={20} className="mr-3" aria-hidden="true" />
              {item.label}
            </Link>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;

