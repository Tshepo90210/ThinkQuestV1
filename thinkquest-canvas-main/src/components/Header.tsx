import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Menu, Star, User, LogOut, HelpCircle, Lock, Check } from 'lucide-react';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { motion } from 'framer-motion';
import React from 'react';
import { Avatar3DViewer } from './Avatar3DViewer';

export const Header = () => {
  const { user, tokens, stars, logout, avatarUrl: storeAvatarUrl, quiz } = useThinkQuestStore(); // Renamed avatarUrl from store to storeAvatarUrl to avoid conflict
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Quiz', path: '/quiz' },
    { label: 'Learn', path: '/problems' },
    { label: 'Map', path: '/map' }, // New Map link
    { label: 'Leaderboard', path: '/leaderboard' },
  ];

  // Helper to determine if quiz is passed/skipped from user object
  const isQuizCompleted = user?.quizCompleted ?? false;
  const isQuizSkippedFromStore = quiz.hasSkipped; // Still need this for Quiz.tsx

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-lg">T</span>
          </div>
          <span className="font-bold text-xl text-primary hidden sm:inline">ThinkQuest</span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          {navLinks
            .filter((link, index, self) =>
              index === self.findIndex((l) => l.path === link.path && l.label === link.label)
            )
            .map((link) => {
              const toPath = (link.path === '/quiz' && user && isQuizCompleted) ? '/problems' : link.path;
              const onClickHandler = (link.path === '/quiz' && user && isQuizCompleted)
                ? (e: React.MouseEvent) => {
                    e.preventDefault(); // Prevent default Link navigation
                    toast.info('You have already completed the quiz.');
                    navigate('/problems'); // Manually navigate
                  }
                : undefined;

              return (
                <Link
                  key={link.label}
                  to={toPath}
                  onClick={onClickHandler}
                  className={`text-sm font-medium transition-colors flex items-center ${
                    location.pathname === link.path
                      ? 'text-primary'
                      : 'text-foreground/80 hover:text-primary'
                  }`}
                >
                  {link.label}
                  {link.path === '/quiz' && user && (
                    isQuizCompleted ? (
                      <Check className="ml-1 h-3 w-3 text-green-500" />
                    ) : (
                      <Lock className="ml-1 h-3 w-3 text-red-500" />
                    )
                  )}
                  {(link.path === '/problems' || link.path === '/map' || link.path === '/leaderboard') && !isQuizCompleted && user && (
                    <Lock className="ml-1 h-3 w-3 text-red-500" />
                  )}
                </Link>
              );
            })}
        </nav>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          {user && (
            <motion.div 
              className="hidden sm:flex items-center space-x-3 bg-primary/10 px-4 py-2 rounded-full"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
            >
              <div className="flex items-center space-x-1">
                <Star className="h-4 w-4 text-secondary fill-secondary" />
                <span className="font-semibold text-sm">{stars}</span>
              </div>
              <div className="h-4 w-px bg-border" />
              <div className="flex items-center space-x-1">
                <div className="h-4 w-4 rounded-full bg-secondary" />
                <span className="font-semibold text-sm">{tokens}</span>
              </div>
            </motion.div>
          )}

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center space-x-2 focus:outline-none">
                  {/* Small Avatar next to fullName */}
                  {user.avatarUrl ? (
                    <Avatar3DViewer glbUrl={user.avatarUrl} fallbackImageUrl="/placeholder.svg" size={40} />
                  ) : (
                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-white text-sm">
                       {user.fullName ? user.fullName.charAt(0).toUpperCase() : (user.email ? user.email.charAt(0).toUpperCase() : 'U')}
                    </div>
                  )}
                  <span className="font-semibold text-base hidden sm:inline">{user.fullName}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5">
                  <div className="flex items-center space-x-2">
                    {/* Larger Avatar in Dropdown */}
                    {/* {user.avatarUrl ? (
                      <Avatar3DViewer glbUrl={user.avatarUrl} fallbackImageUrl="/placeholder.svg" size={64} />
                    ) : (
                      <div className="w-16 h-16 bg-gray-300 rounded-full flex items-center justify-center text-white text-xl" />
                    )} */}
                    <div>
                      <p className="text-sm font-semibold">{user.fullName}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              to="/"
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-colors"
            >
              <User className="h-4 w-4" />
              <span>Login</span>
            </Link>
          )}

          {/* Mobile Menu */}
          <Sheet>
            <SheetTrigger asChild className="md:hidden">
              <button className="p-2 hover:bg-muted rounded-lg transition-colors">
                <Menu className="h-6 w-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-64">
              <nav className="flex flex-col space-y-4 mt-8">
                {navLinks
                  .filter((link, index, self) =>
                    index === self.findIndex((l) => l.path === link.path && l.label === link.label)
                  )
                  .map((link) => {
                    const toPath = (link.path === '/quiz' && user && isQuizCompleted) ? '/problems' : link.path;
                    const onClickHandler = (link.path === '/quiz' && user && isQuizCompleted)
                      ? (e: React.MouseEvent) => {
                          e.preventDefault(); // Prevent default Link navigation
                          toast.info('You have already completed the quiz.');
                          navigate('/problems'); // Manually navigate
                        }
                      : undefined;

                    return (
                      <Link
                        key={link.label}
                        to={toPath}
                        onClick={onClickHandler}
                        className={`text-lg font-medium transition-colors flex items-center ${
                          location.pathname === link.path
                            ? 'text-primary'
                            : 'text-foreground/80 hover:text-primary'
                        }`}
                      >
                        {link.label}
                        {link.path === '/quiz' && user && (
                          isQuizCompleted ? (
                            <Check className="ml-2 h-4 w-4 text-green-500" />
                          ) : (
                            <Lock className="ml-2 h-4 w-4 text-red-500" />
                          )
                        )}
                        {(link.path === '/problems' || link.path === '/map' || link.path === '/leaderboard') && !isQuizCompleted && user && (
                          <Lock className="ml-2 h-4 w-4 text-red-500" />
                        )}
                      </Link>
                    );
                  })}
                {user && (
                  <>
                    <div className="border-t pt-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Stars</span>
                        <span className="font-semibold">{stars}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Tokens</span>
                        <span className="font-semibold">{tokens}</span>
                      </div>
                    </div>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};