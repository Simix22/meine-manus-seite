"use client";

import ProfileCard from "@/components/ui/ProfileCard";
import OnboardingQuiz from "@/components/ui/OnboardingQuiz";
import { useState, useEffect } from "react";

// Placeholder data for profiles
const profiles = [
  { id: "crazyjamjam", username: "crazyjamjam", imageUrl: "/placeholder-avatar-1.jpg", isVerified: true, successRate: 23 },
  { id: "sadiesink", username: "sadiesink", imageUrl: "/placeholder-avatar-2.jpg", isVerified: false, successRate: 45 },
  { id: "modelX", username: "modelX", imageUrl: "/placeholder-avatar-1.jpg", isVerified: true, successRate: 60 },
  // Add more profiles as needed
];

export default function HomePage() {
  const [showOnboardingQuiz, setShowOnboardingQuiz] = useState(true);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboardingQuizCompleted");
    if (onboardingCompleted === "true") {
      setShowOnboardingQuiz(false);
      setQuizCompleted(true);
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboardingQuizCompleted", "true");
    setQuizCompleted(true);
    setShowOnboardingQuiz(false);
    setShowConfirmation(true);
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000);
  };

  if (showOnboardingQuiz) {
    return <OnboardingQuiz onQuizComplete={handleOnboardingComplete} />;
  }

  if (showConfirmation) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-200px)] text-center p-4">
        <h2 className="text-2xl font-bold text-purple-700 mb-4">Thanks! Your preferences have been saved.</h2>
        <p className="text-lg text-gray-600">You can now explore profiles.</p>
      </div>
    );
  }
  
  if (quizCompleted && !showConfirmation) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">Explore</h1>
        
        {/* Profile Cards Section - Uses updated ProfileCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {profiles.map((profile) => (
            <ProfileCard 
              key={profile.id} 
              username={profile.username} 
              imageUrl={profile.imageUrl} 
              isVerified={profile.isVerified} 
              successRate={profile.successRate}
              // onQuizRequest is handled by the button inside ProfileCard now
            />
          ))}
        </div>

        {/* "Open Quizzes" section REMOVED from here as per new requirements */}
      </div>
    );
  }

  return null; 
}

