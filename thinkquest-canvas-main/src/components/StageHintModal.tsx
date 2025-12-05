import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { X, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils'; // Assuming cn is available for utility classes

interface StageHintModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  enableSound?: boolean; // New prop for sound toggle
}

const StageHintModal: React.FC<StageHintModalProps> = ({ isOpen, onClose, title, children, enableSound }) => {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [numLeaves, setNumLeaves] = useState(10);
  const audioRef = useRef<HTMLAudioElement | null>(null); // Added this line

  useEffect(() => {
    const handleResize = () => {
      setNumLeaves(window.innerWidth < 768 ? 3 : 10);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    if (isOpen) {
      const newLeaves = Array.from({ length: numLeaves }).map((_, i) => ({
        id: i,
        initial: { x: Math.random() * 200 - 100, y: -50, rotate: Math.random() * 360 },
        animate: {
          x: Math.random() * 200 - 100,
          y: window.innerHeight + 50,
          rotate: Math.random() * 720 + 360,
          opacity: [1, 0],
        },
        transition: {
          duration: Math.random() * 5 + 5,
          delay: Math.random() * 2,
          repeat: Infinity,
          ease: "linear",
        },
        style: {
          left: `${Math.random() * 100}%`,
          fontSize: `${Math.random() * 10 + 10}px`,
          color: `hsl(${Math.random() * 30 + 90}, 70%, 50%)`,
        }
      }));
      setLeaves(newLeaves);
    } else {
      setLeaves([]);
    }

    return () => window.removeEventListener('resize', handleResize);
  }, [isOpen, numLeaves]);

  useEffect(() => { // New useEffect for audio
    if (audioRef.current && enableSound) {
      if (isOpen) {
        audioRef.current.volume = 0.3; // Subtle volume
        audioRef.current.play().catch(e => console.error("Error playing audio:", e));
      } else {
        audioRef.current.pause();
        audioRef.current.currentTime = 0; // Reset audio
      }
    }
  }, [isOpen, enableSound]); // Re-run when isOpen or enableSound changes

  return (
    <>
      <audio ref={audioRef} src="/forest_ambience.mp3" loop preload="auto" /> {/* Added audio tag */}
      <Dialog open={isOpen} onOpenChange={onClose} aria-label='Stage instructions' role='dialog'>
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center" // Backdrop
            >
              {/* Floating Leaves */}
              {leaves.map(leaf => (
                <motion.div
                  key={leaf.id}
                  initial={leaf.initial}
                  animate={leaf.animate}
                  transition={leaf.transition}
                  style={{ position: 'fixed', ...leaf.style, pointerEvents: 'none' }}
                  className="text-green-500 opacity-70"
                >
                  &#10022; {/* Unicode leaf character */}
                </motion.div>
              ))}

              <motion.div
                initial={{ x: '100%', y: '-100%', opacity: 0 }}
                animate={{ x: '0%', y: '0%', opacity: 1 }}
                exit={{ x: '100%', y: '-100%', opacity: 0 }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className={cn(
                  "bg-green-50", // Added background color
                  "fixed inset-0 z-[99] w-full p-4 overflow-y-auto rounded-none", // Default (mobile) styles
                  "md:top-20 md:right-4 md:max-w-lg md:rounded-lg", // Desktop styles for medium screens and up
                  "shadow-xl", // Apply shadow always
                  "before:absolute before:inset-0 before:border-8 before:border-yellow-400 before:rounded-lg before:pointer-events-none" // Original border styling
                )}
              >
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 text-gray-500 hover:text-gray-900"
                  onClick={onClose}
                >
                  <X className="h-6 w-6" />
                </Button>
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-bold text-green-800 flex items-center border-b-2 border-yellow-400 pb-1">
                    <motion.div
                      initial={{ rotate: 0 }}
                      animate={{ rotate: [0, -10, 10, -10, 0] }} // Waving animation
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
                      className="mr-2"
                    >
                      <Leaf className="h-7 w-7 text-yellow-600" />
                    </motion.div>
                    {title}
                  </DialogTitle>
                </DialogHeader>
                <div className="text-green-900 space-y-4 font-sans">
                  {children}
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </Dialog>
    </>
  );
};

export default StageHintModal;