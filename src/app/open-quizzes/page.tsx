"use client";

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState, Suspense } from 'react'; // Added Suspense
import ProfileCard from '@/components/ui/ProfileCard';
import OnboardingQuiz from '@/components/ui/OnboardingQuiz';

interface Profile {
  id: string;
  username: string;
  imageUrl: string;
  isVerified?: boolean;
  successRate?: number;
}

const getProfileById = (id: string | null): Profile | null => {
  if (!id) return null;
  const profiles: Profile[] = [
    { id: "crazyjamjam", username: "crazyjamjam", imageUrl: "/placeholder-avatar-1.jpg", isVerified: true, successRate: 23 },
    { id: "sadiesink", username: "sadiesink", imageUrl: "/placeholder-avatar-2.jpg", isVerified: false, successRate: 45 },
    { id: "modelX", username: "modelX", imageUrl: "/placeholder-avatar-1.jpg", isVerified: true, successRate: 60 },
  ];
  return profiles.find(p => p.username === id) || null;
};

function OpenQuizzesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const profileId = searchParams.get('profileId');

  const [profile, setProfile] = useState<Profile | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizPassed, setQuizPassed] = useState(false);

  useEffect(() => {
    if (profileId) {
      const fetchedProfile = getProfileById(profileId);
      setProfile(fetchedProfile);
    } else {
      router.push('/');
    }
  }, [profileId, router]);

  const handleBeginQuiz = () => {
    setQuizStarted(true);
  };

  const handleQuizComplete = () => {
    setQuizPassed(true);
    setQuizStarted(false);
    console.log(`Quiz passed for ${profile?.username}. Added to friends. Chat enabled.`);
    const friends = JSON.parse(localStorage.getItem("friendsList") || "[]");
    if (profile && !friends.includes(profile.username)) {
      friends.push(profile.username);
      localStorage.setItem("friendsList", JSON.stringify(friends));
    }
  };

  if (!profile) {
    return <div className="p-4 text-center">Loading profile or profile not found...</div>;
  }

  if (quizPassed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">You passed the quiz!</h2>
        <p className="text-lg text-gray-600">
          @{profile.username} has been added to your Friends list. You can now message them.
        </p>
        <button 
          onClick={() => router.push("/messages")}
          className="mt-6 bg-purple-600 text-white hover:bg-purple-700 font-semibold py-2 px-4 rounded-lg transition-colors"
        >
          Go to Messages
        </button>
        <button 
          onClick={() => router.push("/")}
          className="mt-2 text-purple-600 hover:underline"
        >
          Back to Explore
        </button>
      </div>
    );
  }

  if (quizStarted) {
    return <OnboardingQuiz onQuizComplete={handleQuizComplete} />;
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold text-center mb-8">Quiz for @{profile.username}</h1>
      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-xl">
        <ProfileCard 
          username={profile.username} 
          imageUrl={profile.imageUrl} 
          isVerified={profile.isVerified}
          successRate={profile.successRate}
        />
        <div className="mt-6 text-center">
          <button 
            onClick={handleBeginQuiz}
            className="w-full bg-green-500 text-white hover:bg-green-600 font-semibold py-3 px-6 rounded-lg transition-colors text-lg shadow-md"
          >
            Begin Quiz
          </button>
        </div>
      </div>
    </div>
  );
}

export default function OpenQuizzesPage() {
  return (
    <Suspense fallback={<div className="p-4 text-center">Loading page...</div>}>
      <OpenQuizzesContent />
    </Suspense>
  );
}

