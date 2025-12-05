import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';

interface RequireQuizProps {
  children?: React.ReactNode;
}

export const RequireQuiz = ({ children }: RequireQuizProps) => {
  const quizPassed = useThinkQuestStore((state) => state.quiz.passed);

  if (!quizPassed) {
    return <Navigate to="/quiz" replace />;
  }

  return children ? <>{children}</> : <Outlet />;
};
