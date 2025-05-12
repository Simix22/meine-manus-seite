"use client";

import { useState } from 'react';

interface QuizQuestion {
  id: number;
  question: string;
  option1: string;
  option2: string;
}

const quizQuestions: QuizQuestion[] = [
  { id: 1, question: "Do you prefer romantic movies or action movies?", option1: "Romantic Movies", option2: "Action Movies" },
  { id: 2, question: "Would you rather eat pineapple on pizza or no pineapple?", option1: "Pineapple on Pizza", option2: "No Pineapple" },
  { id: 3, question: "Are you more of a morning person or a night owl?", option1: "Morning Person", option2: "Night Owl" },
  { id: 4, question: "Do you enjoy the beach or the mountains more?", option1: "Beach", option2: "Mountains" },
  { id: 5, question: "Do you prefer dogs or cats?", option1: "Dogs", option2: "Cats" },
  { id: 6, question: "Are you into Marvel or DC?", option1: "Marvel", option2: "DC" },
  { id: 7, question: "Do you like spicy food or mild food?", option1: "Spicy Food", option2: "Mild Food" },
  { id: 8, question: "Would you rather go to a party or stay in for a movie night?", option1: "Party", option2: "Movie Night In" },
  { id: 9, question: "Do you enjoy coffee or tea more?", option1: "Coffee", option2: "Tea" },
  { id: 10, question: "Would you rather travel to Japan or Italy?", option1: "Japan", option2: "Italy" },
  { id: 11, question: "Do you prefer summer or winter?", option1: "Summer", option2: "Winter" },
  { id: 12, question: "Are you more of a book reader or a gamer?", option1: "Book Reader", option2: "Gamer" },
  { id: 13, question: "Do you like city life or country life?", option1: "City Life", option2: "Country Life" },
  { id: 14, question: "Do you enjoy cooking or ordering food?", option1: "Cooking", option2: "Ordering Food" },
  { id: 15, question: "Are you more into TikTok or Instagram?", option1: "TikTok", option2: "Instagram" },
];

interface OnboardingQuizProps {
  onQuizComplete: () => void;
}

const OnboardingQuiz: React.FC<OnboardingQuizProps> = ({ onQuizComplete }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [answers, setAnswers] = useState<string[]>([]); // We don't store answers for now, just track progress

  const handleAnswer = (answer: string) => {
    setAnswers(prev => [...prev, answer]); // Store answer if needed later
    if (currentQuestionIndex < quizQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      onQuizComplete();
    }
  };

  const currentQuestion = quizQuestions[currentQuestionIndex];
  const progressPercentage = ((currentQuestionIndex + 1) / quizQuestions.length) * 100;

  return (
    <div className="w-full max-w-xl mx-auto bg-white p-6 md:p-8 rounded-xl shadow-2xl my-8">
      <h2 className="text-2xl font-bold text-center text-purple-700 mb-2">Welcome!</h2>
      <p className="text-center text-gray-600 mb-6">Let&apos;s get to know you a bit better.</p>
      
      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 mb-6">
        <div 
          className="bg-purple-600 h-2.5 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>

      <div className="text-center mb-8">
        <p className="text-lg font-semibold text-gray-800 mb-1">Question {currentQuestionIndex + 1} of {quizQuestions.length}</p>
        <p className="text-xl text-gray-700">{currentQuestion.question}</p>
      </div>

      <div className="space-y-4">
        <button 
          onClick={() => handleAnswer(currentQuestion.option1)}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-opacity-75"
        >
          {currentQuestion.option1}
        </button>
        <button 
          onClick={() => handleAnswer(currentQuestion.option2)}
          className="w-full bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold py-3 px-4 rounded-lg shadow-md transition-all duration-150 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-75"
        >
          {currentQuestion.option2}
        </button>
      </div>
    </div>
  );
};

export default OnboardingQuiz;

