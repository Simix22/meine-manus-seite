"use client";

import { CheckCircle } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';

interface ProfileCardProps {
  username: string;
  imageUrl: string;
  isVerified?: boolean;
  successRate?: number; // New prop for success rate
  onQuizRequest: (quizType: 'dating' | 'friendship') => void; // New prop for button click
}

const ProfileCard: React.FC<ProfileCardProps> = ({ username, imageUrl, isVerified, successRate, onQuizRequest }) => {
  const [showOverlay, setShowOverlay] = useState(true);

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden w-full max-w-xs mx-auto relative pb-28"> {/* Increased pb for buttons */}
      {/* Image and Profile Picture Section */}
      <div className="h-48 w-full bg-gray-200 relative">
        <Image src={imageUrl} alt={`${username} background`} layout="fill" objectFit="cover" />
      </div>
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-full border-4 border-white rounded-full overflow-hidden w-24 h-24 bg-gray-300">
        <Image src={imageUrl} alt={`${username} profile picture`} width={96} height={96} className="object-cover" />
      </div>

      {/* Overlay */}
      {showOverlay && (
        <div 
          className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white p-4 text-center cursor-pointer"
          onClick={() => setShowOverlay(false)} // Allow closing overlay on click for now
        >
          <p>Dieses Profil wird bald verfügbar sein.</p>
        </div>
      )}

      {/* Content Section - only visible if overlay is not shown */}
      {!showOverlay && (
        <>
          <div className="p-4 text-center mt-10">
            <div className="flex items-center justify-center">
              <h3 className="text-lg font-semibold text-gray-800 mr-1">@{username}</h3>
              {isVerified && <CheckCircle size={18} className="text-purple-500" />}
            </div>
            {successRate !== undefined && (
              <p className="text-xs text-gray-500 mt-1">{successRate}% of users completed this quiz successfully.</p>
            )}
          </div>
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-11/12 px-2 space-y-2">
            <button 
              onClick={() => onQuizRequest('dating')}
              className="w-full bg-purple-600 text-white hover:bg-purple-700 font-semibold py-2 px-4 rounded-full transition-colors text-sm"
            >
              Request for Dating
            </button>
            <button 
              onClick={() => onQuizRequest('friendship')}
              className="w-full bg-pink-500 text-white hover:bg-pink-600 font-semibold py-2 px-4 rounded-full transition-colors text-sm"
            >
              Request for Friendship
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileCard;

