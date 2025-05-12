"use client";

import ProfileCard from "@/components/ui/ProfileCard";
import OnboardingQuiz from "@/components/ui/OnboardingQuiz"; // Import the quiz component
import { useState, useEffect } from "react";

// Placeholder data for profiles
const profiles = [
  { id: 1, username: "crazyjamjam", imageUrl: "/placeholder-avatar-1.jpg", isVerified: true, successRate: 23 },
  { id: 2, username: "sadiesink", imageUrl: "/placeholder-avatar-2.jpg", isVerified: false, successRate: 45 },
  { id: 3, username: "modelX", imageUrl: "/placeholder-avatar-1.jpg", isVerified: true, successRate: 60 },
  // Add more profiles as needed
];

interface Quiz {
  id: string; // Unique ID for the quiz, e.g., profileId-quizType
  profileUsername: string;
  quizType: "dating" | "friendship";
}

export default function HomePage() {
  const [activeQuizzes, setActiveQuizzes] = useState<Quiz[]>([]);
  const [expandedQuiz, setExpandedQuiz] = useState<string | null>(null);
  const [showOnboardingQuiz, setShowOnboardingQuiz] = useState(true); // Default to true for new users
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);

  // Simulate checking if quiz was completed before (e.g., using localStorage)
  useEffect(() => {
    const onboardingCompleted = localStorage.getItem("onboardingQuizCompleted");
    if (onboardingCompleted === "true") {
      setShowOnboardingQuiz(false);
      setQuizCompleted(true);
    }
  }, []);

  const handleQuizRequest = (profileUsername: string, quizType: "dating" | "friendship") => {
    const quizId = `${profileUsername}-${quizType}`;
    setExpandedQuiz(expandedQuiz === quizId ? null : quizId);
    if (!activeQuizzes.find(q => q.id === quizId)) {
      setActiveQuizzes(prevQuizzes => [...prevQuizzes, { id: quizId, profileUsername, quizType }]);
    }
  };

  const handleOnboardingComplete = () => {
    localStorage.setItem("onboardingQuizCompleted", "true");
    setQuizCompleted(true);
    setShowOnboardingQuiz(false);
    setShowConfirmation(true);
    // Hide confirmation after a few seconds and show explore feed
    setTimeout(() => {
      setShowConfirmation(false);
    }, 3000); // Show confirmation for 3 seconds
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
  
  // Only render the explore feed if quiz is completed and confirmation is not showing
  if (quizCompleted && !showConfirmation) {
    return (
      <div>
        <h1 className="text-2xl font-semibold mb-6">Explore</h1>
        
        {/* Profile Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          {profiles.map((profile) => (
            <ProfileCard 
              key={profile.id} 
              username={profile.username} 
              imageUrl={profile.imageUrl} 
              isVerified={profile.isVerified} 
              successRate={profile.successRate}
              onQuizRequest={(quizType) => handleQuizRequest(profile.username, quizType)}
            />
          ))}
        </div>

        {/* Expandable Quiz Section - Renders below the feed */}
        {expandedQuiz && (
          <div id={`quiz-section-${expandedQuiz}`} className="mb-10 p-6 bg-white rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">
              {expandedQuiz.includes("dating") ? "Dating Quiz" : "Friendship Quiz"} for @{expandedQuiz.split("-")[0]}
            </h2>
            <p className="text-gray-700">
              Placeholder content for the {expandedQuiz.includes("dating") ? "Dating" : "Friendship"} Quiz.
              Questions and interactive elements will go here.
            </p>
            <button 
              onClick={() => setExpandedQuiz(null)} 
              className="mt-4 bg-gray-200 text-gray-700 hover:bg-gray-300 py-2 px-4 rounded-md"
            >
              Close Quiz
            </button>
          </div>
        )}

        {/* Open Quizzes Section */}
        <div id="open-quizzes-section" className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Open Quizzes</h2>
          {activeQuizzes.length > 0 ? (
            <div className="space-y-4">
              {activeQuizzes.map((quiz) => (
                <div key={quiz.id} className="p-4 bg-white rounded-lg shadow-md">
                  <p className="font-medium">
                    {quiz.quizType === "dating" ? "Dating Quiz" : "Friendship Quiz"} for @{quiz.profileUsername}
                  </p>
                  <p className="text-sm text-gray-600">Status: In Progress (Placeholder)</p>
                  <button 
                    onClick={() => setExpandedQuiz(quiz.id)} 
                    className="mt-2 text-sm text-purple-600 hover:underline"
                  >
                    {expandedQuiz === quiz.id ? "View Questions" : "Expand Quiz"}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-4 bg-white rounded-lg shadow-md">
              <p className="text-gray-500">You have no open quizzes at the moment.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Fallback or loading state if needed, though current logic should cover states.
  return null; 
}

