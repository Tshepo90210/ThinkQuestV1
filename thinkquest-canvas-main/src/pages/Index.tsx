import { useState, useEffect } from 'react'; // Added useEffect
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { AuthModal } from '@/components/AuthModal';
import { Button } from '@/components/ui/button';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';
import heroCollaboration from '@/assets/hero-collaboration.jpg';
import collabImg2 from '@/assets/collab img2.png';
import journeyStart from '@/assets/journey-start.jpg';
import journey1 from '@/assets/journey1.png';
import q2 from '@/assets/q2.jpeg';
import { Lightbulb, Users, Target } from 'lucide-react';

const Index = () => {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { user } = useThinkQuestStore();
  const navigate = useNavigate();

  const [topInnovators, setTopInnovators] = useState<any[]>([]);
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(true);
  const [errorLeaderboard, setErrorLeaderboard] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopInnovators = async () => {
      try {
        setIsLoadingLeaderboard(true);
        setErrorLeaderboard(null);
        // Assuming problemId 1 for the landing page preview
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/leaderboard?problemId=1`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch top innovators');
        }
        const data = await response.json();
        setTopInnovators(data.slice(0, 3)); // Take top 3
      } catch (err: any) {
        console.error('Error fetching top innovators:', err);
        setErrorLeaderboard(err.message || 'Failed to load top innovators.');
      } finally {
        setIsLoadingLeaderboard(false);
      }
    };

    fetchTopInnovators();
  }, []); // Empty dependency array to run once on mount

  const handleStartJourney = () => {
    if (user) {
      navigate('/problems'); // Redirect to problems page
    } else {
      setAuthModalOpen(true);
    }
  };

  const features = [
    {
      icon: Target,
      title: "What It Does",
      description: "Solve real problems like cafeteria chaos, design a better school event, or improve your study habits.",
      image: collabImg2,
    },
    {
      icon: Users,
      title: "How It Works",
      description: "Select your avatar, pick a problem, complete stage quests, and earn tokens for your innovative solutions.",
      image: journey1,
    },
    {
      icon: Lightbulb,
      title: "Join the Adventure",
      description: "Embark on exciting quests, collaborate with AI personas, and unlock your design thinking potential.",
      image: q2,
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="gradient-hero min-h-[600px] flex items-center justify-center px-4 py-20">
          <motion.div
            className="container max-w-4xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <motion.h1
              className="text-5xl md:text-7xl font-bold text-white mb-6"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              Unlock Your Inner Innovator!
            </motion.h1>
            <motion.p
              className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              Gamify Design Thinking: Empathize, Define, Ideate, Prototype, and Test through fun quests with AI personas.
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
            >
              <Button
                size="lg"
                onClick={handleStartJourney}
                className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 rounded-full font-bold shadow-elevated animate-pulse-glow"
              >
                {user ? 'Start Journey' : 'Login/Signup'}
              </Button>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Wave divider */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Explore ThinkQuest Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Explore ThinkQuest
          </motion.h2>

          <div className="space-y-16">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                className={`flex flex-col ${
                  index % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } items-center gap-8 md:gap-12`}
                initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-primary flex items-center justify-center">
                      <feature.icon className="h-6 w-6 text-primary-foreground" />
                    </div>
                    <h3 className="text-2xl font-bold">{feature.title}</h3>
                  </div>
                  <p className="text-lg text-primary/80 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
                <div className="flex-1">
                  <motion.div
                    className="rounded-2xl overflow-hidden shadow-elevated"
                    whileHover={{ scale: 1.02 }}
                    transition={{ duration: 0.2 }}
                  >
                    <img
                      src={feature.image}
                      alt={feature.title}
                      className="w-full h-96 object-cover"
                    />
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              onClick={handleStartJourney}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 rounded-full font-bold"
            >
              Get Started Now
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Top Innovators Section */}
      <section className="py-20 px-4 bg-background">
        <div className="container max-w-6xl mx-auto">
          <motion.h2
            className="text-4xl md:text-5xl font-bold text-center mb-16"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            Top Innovators
          </motion.h2>

          {isLoadingLeaderboard && <p className="text-center text-gray-600">Loading top innovators...</p>}
          {errorLeaderboard && <p className="text-center text-red-500">Error: {errorLeaderboard}</p>}
          {!isLoadingLeaderboard && !errorLeaderboard && topInnovators.length === 0 && (
            <p className="text-center text-gray-600">No top innovators yet. Complete a quest to appear here!</p>
          )}

          {!isLoadingLeaderboard && !errorLeaderboard && topInnovators.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {topInnovators.map((entry) => (
                <motion.div
                  key={entry.userId}
                  className="bg-green-100 border-2 border-green-500 rounded-xl p-6 shadow-lg flex flex-col items-center text-center space-y-4"
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5 }}
                >
                  <img src={entry.avatar} alt={entry.username} className="w-24 h-24 rounded-full object-cover border-4 border-green-600" />
                  <h3 className="text-xl font-bold text-green-800">{entry.username}</h3>
                  <p className="text-sm text-green-700">{entry.problemTitle}</p>
                  <p className="text-lg font-semibold text-green-900">Score: {entry.totalScore}</p>
                </motion.div>
              ))}
            </div>
          )}

          <motion.div
            className="text-center mt-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <Button
              size="lg"
              onClick={() => navigate('/leaderboard')}
              className="bg-primary hover:bg-primary/90 text-lg px-8 py-6 rounded-full font-bold"
            >
              View Full Leaderboard
            </Button>
          </motion.div>
        </div>
      </section>

      <AuthModal open={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default Index;
