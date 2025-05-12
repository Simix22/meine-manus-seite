import Link from 'next/link';
import { Home, MessageSquare, Image } from 'lucide-react'; // Removed unused User import

const BottomNav = () => {
  // TODO: Add active state based on current route
  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white shadow-t border-t border-gray-200 p-3 flex justify-around items-center z-50">
      <Link href="/" className="flex flex-col items-center text-gray-600 hover:text-purple-600">
        <Home size={24} aria-label="Home icon" />
        <span className="text-xs mt-1">Home</span>
      </Link>
      <Link href="/messages" className="flex flex-col items-center text-purple-600 font-semibold">
        <MessageSquare size={24} aria-label="Messages icon" />
        <span className="text-xs mt-1">Messages</span>
      </Link>
      <Link href="/gallery" className="flex flex-col items-center text-gray-600 hover:text-purple-600">
        {/* Added aria-label for the Image icon from lucide-react as per linting warning */}
        <Image size={24} aria-label="Gallery icon" /> 
        <span className="text-xs mt-1">Gallery</span>
      </Link>
      {/* Placeholder for Profile/User link if needed in bottom nav based on images */}
      {/* <Link href="/profile" className="flex flex-col items-center text-gray-600 hover:text-purple-600">
        <User size={24} />
        <span className="text-xs mt-1">Profile</span>
      </Link> */}
    </nav>
  );
};

export default BottomNav;

