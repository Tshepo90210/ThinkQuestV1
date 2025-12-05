import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';
import { Lock, Users, Mountain, Lightbulb, Wrench, ClipboardCheck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import React, { useEffect, useState, Suspense, useRef, useMemo } from 'react';
const Avatar3DViewer = React.lazy(() => import('@/components/Avatar3DViewer').then(module => ({ default: module.Avatar3DViewer })));


const stages = [
  { id: 0, name: 'Empathize', path: '/stages/empathize', icon: Users, stageKey: 'empathy' },
  { id: 1, name: 'Define', path: '/stages/define', icon: Mountain, stageKey: 'define' },
  { id: 2, name: 'Ideate', path: '/stages/ideate', icon: Lightbulb, stageKey: 'ideate' },
  { id: 3, name: 'Prototype', path: '/stages/prototype', icon: Wrench, stageKey: 'prototype' },
  { id: 4, name: 'Test', path: '/stages/test', icon: ClipboardCheck, stageKey: 'test' },
] as const;


const CircularProgress = ({ progress, size = 80, strokeWidth = 8 }: { progress: number, size?: number, strokeWidth?: number }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle
        className="text-gray-300/30"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
      />
      <circle
        className="text-green-500"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="transparent"
        r={radius}
        cx={size / 2}
        cy={size / 2}
        style={{ strokeDasharray: circumference, strokeDashoffset: offset, transition: 'stroke-dashoffset 0.5s ease-in-out' }}
      />
    </svg>
  );
};


const Leaf = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute text-green-400/50 text-2xl" style={style}>
    &#10047;
  </div>
);

const SpinningLeaf = () => (
    <div className="w-20 h-20 flex items-center justify-center">
        <div className="animate-spin text-green-400 text-4xl">&#10047;</div>
    </div>
);

function usePrevious(value: any) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}


const Map = () => {
  const { selectedProblem, stagesUnlocked, resetQuest, user, stageData, avatarUrl } = useThinkQuestStore();
  const navigate = useNavigate();

  const [avatarSize, setAvatarSize] = useState(80);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [particles, setParticles] = useState<any[]>([]);
  const stageRefs = useRef<(HTMLDivElement | null)[]>([]);

  const activeStage = useMemo(() => {
    const index = stagesUnlocked.findIndex(unlocked => !unlocked);
    return index === -1 ? stages.length - 1 : index;
  }, [stagesUnlocked]);

  const prevActiveStage = usePrevious(activeStage);

  useEffect(() => {
    if (prevActiveStage !== undefined && prevActiveStage !== activeStage) {
      const fromEl = stageRefs.current[prevActiveStage];
      const toEl = stageRefs.current[activeStage];

      if (fromEl && toEl) {
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        
        const newParticles = Array.from({ length: 10 }).map((_, i) => ({
          id: Math.random(),
          from: {
            x: fromRect.left + fromRect.width / 2,
            y: fromRect.top + fromRect.height / 2,
          },
          to: {
            x: toRect.left + toRect.width / 2,
            y: toRect.top + toRect.height / 2,
          },
          delay: i * 0.05,
        }));
        setParticles(newParticles);
      }
    }
  }, [activeStage, prevActiveStage]);


  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setAvatarSize(120);
      } else {
        setAvatarSize(80);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, []);


  useEffect(() => {
    if (!selectedProblem) {
      navigate('/problems');
    }
  }, [selectedProblem, navigate]);

  if (!selectedProblem) {
    return null;
  }

  const handleStageClick = (stage: typeof stages[0]) => {
    if (stagesUnlocked[stage.id]) {
      navigate(stage.path);
    } else {
      toast.error('Complete the previous stage to unlock this one!');
    }
  };

  const handleReset = () => {
    resetQuest();
    navigate('/problems');
    toast.success('Quest reset! Choose a new problem.');
  };

  const leaves = useMemo(() => Array.from({ length: 15 }).map((_, i) => ({
    id: i,
    style: {
      left: `${Math.random() * 100}%`,
      animation: `fall ${10 + Math.random() * 10}s linear ${Math.random() * 10}s infinite`,
      transform: `scale(${0.5 + Math.random() * 0.5})`,
      opacity: 0.2 + Math.random() * 0.5,
    } as React.CSSProperties,
  })), []);


  return (
    <div 
      className="min-h-screen text-white overflow-hidden relative"
      style={{
        background: `linear-gradient(to bottom, #065f46, #ecfccb)`,
      }}
    >
      <div 
        className="absolute inset-0 bg-[url('/map-background.jpg')] bg-cover bg-center opacity-30" 
      ></div>

      <Header />
      <style>{`
        @keyframes fall {
          0% { top: -10%; transform: translateX(0) rotate(0deg); }
          100% { top: 110%; transform: translateX(${Math.random() * 200 - 100}px) rotate(720deg); }
        }
      `}</style>

      <AnimatePresence>
        {particles.map(p => (
            <motion.div
                key={p.id}
                className="absolute text-green-400 text-2xl z-50"
                initial={{ x: p.from.x, y: p.from.y, opacity: 1, scale: 1 }}
                animate={{ x: p.to.x, y: p.to.y, opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.8, delay: p.delay, ease: "easeInOut" }}
                onAnimationComplete={() => setParticles(ps => ps.filter(particle => particle.id !== p.id))}
            >
                &#10047;
            </motion.div>
        ))}
      </AnimatePresence>

      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center items-center p-4 md:p-8">
        {leaves.map(leaf => <Leaf key={leaf.id} style={leaf.style} />)}

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8 z-10"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {selectedProblem.title}
          </h1>
          <p className="text-white/80 max-w-2xl mx-auto">
            Your journey begins. Progress through all 5 stages of design thinking.
          </p>
        </motion.div>

        <div className="relative w-full max-w-7xl z-10">

          <div className="absolute left-1/2 top-0 -translate-x-1/2 h-full w-2 bg-black/20 rounded-full md:hidden"></div>
          
          <div className="flex flex-col md:flex-row justify-between items-center space-y-16 md:space-y-0 md:space-x-4">
            {stages.map((stage) => {
              const isUnlocked = stagesUnlocked[stage.id];
              const score = stageData[stage.stageKey]?.score || 0;
              const Icon = stage.icon;
              
              const isCurrent = isUnlocked && stage.id === activeStage;
              const isCompleted = isUnlocked && stage.id < activeStage;
              const isLocked = !isUnlocked;
              const isUpcoming = isUnlocked && !isCurrent && !isCompleted;
              
              const isAvatarOnThisStage = isCurrent;

              return (
                <motion.div
                  key={stage.id}
                  ref={(el) => (stageRefs.current[stage.id] = el)}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: stage.id * 0.15 }}
                  className="relative flex flex-col items-center"
                  whileHover={{ scale: 1.05 }}
                >
                  {isCurrent && (
                    <span className="sr-only" aria-live="polite">
                        You are currently on the {stage.name} stage.
                    </span>
                  )}
                  <div
                    onClick={() => handleStageClick(stage)}
                    className={cn(
                      "relative w-48 h-48 md:w-56 md:h-56 rounded-full flex flex-col items-center justify-center p-4 border-8 transition-all duration-300 cursor-pointer group",
                      {
                        'bg-[#065f46]/50 border-[#10b981] shadow-lg': isUnlocked,
                        'grayscale bg-gray-800/50 border-gray-600': isLocked,
                        'border-yellow-400 animate-pulse': isCurrent,
                        'bg-[#065f46] border-[#10b981]': isCompleted,
                        'opacity-75': isUpcoming
                      }
                    )}
                  >
                    {isLocked ? (
                      <Lock className="w-16 h-16 text-gray-400" />
                    ) : isCompleted ? (
                      <CheckCircle className="w-16 h-16 text-[#ecfccb]" />
                    ) : (
                      <>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20">
                           <Icon className="w-24 h-24 text-white" />
                        </div>
                        <div className="absolute top-0 left-0">
                          <CircularProgress progress={score} size={180} strokeWidth={10} />
                        </div>
                        <Icon className="w-12 h-12 text-white mb-2 z-10" />
                      </>
                    )}
                    <h3 className="text-xl font-bold text-center z-10 mt-2">
                      {stage.name}
                    </h3>
                  </div>

                  {isAvatarOnThisStage && (
                    <motion.div
                      className="absolute z-20 flex justify-center w-full"
                      style={{ bottom: '-30px' }}
                      aria-label={`Your avatar on stage ${stages[activeStage].name}`}
                      initial={{ y: 0, rotate: 0 }}
                      animate={{
                        y: [0, -10, 0],
                        rotate: [0, 5, -5, 0],
                      }}
                      transition={{
                        y: { repeat: Infinity, repeatType: "loop", duration: 3, ease: "easeInOut" },
                        rotate: { repeat: Infinity, repeatType: "loop", duration: 5, ease: "easeInOut" },
                      }}
                    >
                      {avatarUrl ? (
                        <Suspense fallback={<SpinningLeaf />}>
                          <Avatar3DViewer
                            glbUrl={avatarUrl}
                            fallbackImageUrl="/placeholder.svg"
                            size={avatarSize}
                          />
                        </Suspense>
                      ) : (
                        <div 
                          className="bg-green-500 rounded-full flex items-center justify-center border-4 border-white shadow-xl"
                          style={{ width: avatarSize, height: avatarSize }}
                        >
                          <span className="text-white font-bold text-3xl">
                            {user?.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>

        <div className="flex justify-center mt-16 z-10">
          <Button
            onClick={handleReset}
            variant="outline"
            size="lg"
            className="bg-white/10 backdrop-blur-sm text-white border-white/30 hover:bg-white/20"
          >
            Reset Quest
          </Button>
        </div>
      </div>
      
      <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-20 md:hidden">
        <Button 
            onClick={() => {
                stageRefs.current[activeStage]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }}
        >
            Continue Journey
        </Button>
      </div>
    </div>
  );
};

export default Map;
