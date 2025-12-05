import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useThinkQuestStore } from '../store/useThinkQuestStore';
import { Progress } from '../components/ui/progress';
import { QUIZ } from '../data/quizData';
import { Avatar3DViewer } from '../components/Avatar3DViewer';
import ReactConfetti from 'react-confetti';
import pb from '../lib/pocketbase';

const Quiz = () => {
  const navigate = useNavigate();
  const { user, quiz, setQuizState, addTokens, updateUser } = useThinkQuestStore(); // Added updateUser
  const { passed } = quiz;

  const quizData = QUIZ[0];

  const [showStartScreen, setShowStartScreen] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const hasNavigatedRef = useRef(false);

  const totalQuestions = quizData.questions.length;

  const quizProgress = passed
    ? 100
    : Math.round(((quiz.current + (Object.keys(quiz.answers).length > 0 ? 1 : 0)) / totalQuestions) * 100);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    // Quiz completion/skip navigation is handled by respective handlers.
    // No need for a separate useEffect trigger here to prevent loops.
  }, [user, navigate]);

  const handleStartQuiz = () => {
    setShowStartScreen(false);
    setQuizState({ current: 0, answers: {}, passed: false, score: 0 });
    setShowConfetti(false);
    hasNavigatedRef.current = false;
  };

  const handleAnswerSelect = (questionId: number, option: string) => {
    setQuizState({
      answers: {
        ...quiz.answers,
        [questionId]: option,
      },
    });
  };

  const handleNextQuestion = () => {
    if (quiz.current < totalQuestions - 1) {
      setQuizState({ current: quiz.current + 1 });
    }
  };

  const handlePreviousQuestion = () => {
    if (quiz.current > 0) {
      setQuizState({ current: quiz.current - 1 });
    }
  };

  const handleSubmitQuiz = async () => {
    let correctAnswersCount = 0;
    quizData.questions.forEach((q) => {
      if (quiz.answers[q.id] === q.correct_answer) {
        correctAnswersCount++;
      }
    });

    const calculatedScore = Math.round((correctAnswersCount / totalQuestions) * 100);
    const quizCompletedStatus = true; // Quiz is always considered completed, regardless of score

    setQuizState({
      passed: quizCompletedStatus,
      score: calculatedScore,
      answers: quiz.answers,
    });

    setShowConfetti(true);
    addTokens(50); // Add 50 tokens on completion

    // Update user in PocketBase
    if (user && user.id) {
      try {
        if (!pb.authStore.isValid) {
          pb.authStore.save(user.authToken, user.id, user);
        }

        await pb.collection('users').update(user.id, {
          quizCompleted: quizCompletedStatus,
          quizScore: calculatedScore,
        });
        console.log('PocketBase user updated with quiz data.');

        // Update Zustand user state immediately
        updateUser({ quizCompleted: quizCompletedStatus, quizScore: calculatedScore });

      } catch (error) {
        console.error('Error updating user in PocketBase:', error);
      }
    } else {
      console.warn('User or user ID not available for PocketBase update. Quiz data not saved to DB.');
    }
    // Navigate to home page after quiz completion
    navigate('/');
  };

  const currentQuestion = quizData.questions[quiz.current];

  if (!user) {
    navigate('/login');
    return null;
  }

  // If quiz is passed, return null
  if (passed) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-green-500 to-emerald-700 text-white flex flex-col"
    >
      {showConfetti && <ReactConfetti />}

      <header className="w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-4">
        <div className="container mx-auto px-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-primary">Design Thinking Quiz – Unlock the Quest</h1>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 flex-grow flex flex-col justify-center items-center">
        <div className="w-full max-w-2xl mb-8">
          <Progress value={quizProgress} className="w-full h-2.5 bg-gray-200 dark:bg-gray-700" />
        </div>

        {showStartScreen ? (
          <div className="start-screen text-center p-8 bg-white bg-opacity-20 rounded-lg shadow-lg max-w-xl w-full flex flex-col items-center">
            {user?.fullName && (
              <h2 className="text-3xl font-semibold mb-4">Welcome {user.fullName}!</h2>
            )}
            {user?.avatarUrl && (
              <div className="w-48 h-48 mb-6">
                <Avatar3DViewer glbUrl={user.avatarUrl} fallbackImageUrl="/placeholder.svg" size={192} />
              </div>
            )}
            <p className="text-lg mb-6">Complete this Design Thinking quiz to unlock problem statements.</p>
            <div className="flex flex-col gap-4">
              <button
                onClick={handleStartQuiz}
                className="px-8 py-3 bg-green-500 text-white font-bold rounded-full hover:bg-green-600 transition-colors"
              >
                Start Quiz
              </button>
            </div>
          </div>
        ) : (
          <div className="quiz-container p-8 bg-white bg-opacity-20 rounded-lg shadow-lg max-w-2xl w-full">
            <h2 className="text-2xl font-semibold mb-4">{quizData.quiz_title}</h2>
            <p className="text-lg mb-6">{quizData.scenario_description}</p>

            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <p className="text-sm text-gray-300 mb-2">Phase: {currentQuestion.phase}</p>
              <p
                className="font-semibold text-xl mb-4 sm:text-2xl"
                aria-label={`Question ${quiz.current + 1} of ${totalQuestions}`}
              >
                {quiz.current + 1}. {currentQuestion.question}
              </p>
              <div className="space-y-3 sm:space-y-4">
                {currentQuestion.options.map((option, idx) => (
                  <label
                    key={idx}
                    className="flex items-center cursor-pointer p-3 rounded-lg hover:bg-white hover:bg-opacity-10 transition-colors sm:w-full"
                  >
                    <input
                      type="radio"
                      name={`question-${currentQuestion.id}`}
                      value={option.charAt(0)}
                      checked={quiz.answers[currentQuestion.id] === option.charAt(0)}
                      onChange={() => handleAnswerSelect(currentQuestion.id, option.charAt(0))}
                      className="mr-3 h-5 w-5 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 sm:h-6 sm:w-6"
                      aria-label={`Option ${option.charAt(0)} selected`}
                    />
                    <span className="text-lg sm:text-xl">{option}</span>
                  </label>
                ))}
              </div>
            </motion.div>

            <div className="flex justify-between mt-8">
              <button
                onClick={handlePreviousQuestion}
                disabled={quiz.current === 0}
                className="px-6 py-2 bg-gray-400 text-white font-bold rounded-md hover:bg-gray-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {quiz.current === totalQuestions - 1 ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!quiz.answers[currentQuestion.id]}
                  className="px-6 py-2 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Submit Quiz
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  disabled={!quiz.answers[currentQuestion.id]}
                  className="px-6 py-2 bg-blue-500 text-white font-bold rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default Quiz;