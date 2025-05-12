import { CheckCircle } from 'lucide-react';

interface ProfileCardProps {
  username: string;
  imageUrl: string;
  isVerified?: boolean;
}

const ProfileCard: React.FC<ProfileCardProps> = ({ username, imageUrl, isVerified }) => {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-xs mx-auto relative pb-16">
      <div className="h-48 w-full bg-gray-200 relative">
        {/* Placeholder for background image if any */}
        <img src={imageUrl} alt={username} className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full border-4 border-white rounded-full overflow-hidden w-24 h-24 bg-gray-300">
        <img src={imageUrl} alt={username} className="w-full h-full object-cover" />
      </div>
      <div className="p-4 text-center mt-10">
        <div className="flex items-center justify-center">
          <h3 className="text-lg font-semibold text-gray-800 mr-1">@{username}</h3>
          {isVerified && <CheckCircle size={18} className="text-purple-500" />}
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-4/5">
        <button className="w-full bg-white text-purple-600 border-2 border-purple-600 hover:bg-purple-50 font-semibold py-2 px-4 rounded-full transition-colors">
          Follow
        </button>
      </div>
    </div>
  );
};

export default ProfileCard;

