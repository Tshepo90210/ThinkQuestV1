import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Problem } from '@/store/useThinkQuestStore'; // Assuming Problem type is exported
import { Button } from '@/components/ui/button'; // Import Button component

interface ProblemDetailsOverlayProps {
  problem: Problem | null;
  onClose: () => void;
}

const ProblemDetailsOverlay = ({ problem, onClose }: ProblemDetailsOverlayProps) => {
  if (!problem) return null;

  return (
    <AnimatePresence>
      {problem && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
          onClick={onClose} // Close when clicking outside the content
        >
          <motion.div
            initial={{ y: "100vh", opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100vh", opacity: 0 }}
            transition={{ type: "spring", damping: 20, stiffness: 100 }}
            className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-lg bg-white p-6 shadow-lg dark:bg-gray-800 md:p-8"
            onClick={(e) => e.stopPropagation()} // Prevent overlay from closing when clicking inside content
          >
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              onClick={onClose}
            >
              <X className="h-6 w-6" />
            </Button>

            <h2 className="mb-4 text-3xl font-bold text-green-800 dark:text-green-400">
              {problem.title}
            </h2>
            <p className="mb-6 text-gray-700 dark:text-gray-300">
              {problem.context}
            </p>

            <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-lg font-semibold text-green-700 dark:text-green-300">
                  Key Challenges
                </h3>
                <ul className="list-disc space-y-1 pl-5 text-gray-600 dark:text-gray-400">
                  {problem.keyChallenges.map((challenge, index) => (
                    <li key={index}>{challenge}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="mb-2 text-lg font-semibold text-green-700 dark:text-green-300">
                  Details
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Category:</span> {problem.category}
                </p>
                <p className="text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Difficulty:</span> {problem.difficulty}
                </p>
              </div>
            </div>

            <div className="mt-6 text-right">
              <Button onClick={onClose} className="bg-green-600 hover:bg-green-700 text-white">
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ProblemDetailsOverlay;
