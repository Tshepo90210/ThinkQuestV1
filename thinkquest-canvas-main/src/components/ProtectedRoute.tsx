import { Navigate, useLocation } from 'react-router-dom';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const user = useThinkQuestStore((state) => state.user);
  const userQuizCompleted = user?.quizCompleted ?? false; // Use user.quizCompleted from PocketBase
  const quizHasSkipped = useThinkQuestStore((state) => state.quiz?.hasSkipped ?? false); // Get hasSkipped from local store
  const location = useLocation();

  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Define routes that require quiz completion or skipping
  const routesRequiringQuizOrSkip = [
    '/problems',
    '/map',
    '/stages/empathize',
    '/stages/define',
    '/stages/ideate',
    '/stages/prototype',
    '/stages/test',
    '/leaderboard',
  ];

  // If user is logged in but hasn't completed the quiz NOR skipped it, and is trying to access a quiz-required route
  // And the current location is not the quiz page itself
  if (!(userQuizCompleted || quizHasSkipped) && routesRequiringQuizOrSkip.includes(location.pathname) && location.pathname !== '/quiz') {
    return <Navigate to="/quiz" replace />;
  }

  return <>{children}</>;
};