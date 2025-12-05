import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion'; // Import AnimatePresence
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';
import { ArrowLeft, HelpCircle, Leaf } from 'lucide-react';
import { personasByProblem, Persona } from '@/data/mockData';
import { Textarea } from '@/components/ui/textarea'; // Added this line

interface PrototypeData {
  selectedIdea: string | null;
  posterNotes: Record<string, string[]>;
  timelineNotes: Record<string, string[]>;
}
import StageHintModal from '@/components/StageHintModal';

// DisplayNoteCard Component
interface DisplayNoteCardProps {
  id: string;
  text: string;
}

const DisplayNoteCard: React.FC<DisplayNoteCardProps> = ({ id, text }) => {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className="relative bg-yellow-100 border-2 border-green-500 rounded-md p-3 mb-2 text-sm shadow-sm"
    >
      {text}
    </motion.div>
  );
};

// DisplayKanbanColumn Component
interface DisplayKanbanColumnProps {
  boxId: string;
  title: string;
  notes: string[];
}

const DisplayKanbanColumn: React.FC<DisplayKanbanColumnProps> = ({
  title,
  notes,
}) => {
  return (
    <div className="bg-white/90 rounded-xl p-4 shadow-lg flex flex-col h-full">
      <h3 className="text-lg font-bold text-green-700 mb-2">{title}</h3>
      <div className="flex-grow overflow-y-auto pr-2 mb-4">
        <AnimatePresence>
          {notes.map((note, index) => (
            <DisplayNoteCard
              key={index}
              id={note}
              text={note}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

// DisplayTimelineColumn Component
interface DisplayTimelineColumnProps {
  timelineNotes: { [week: string]: string[] };
}

const DisplayTimelineColumn: React.FC<DisplayTimelineColumnProps> = ({
  timelineNotes,
}) => {
  const weeks = ['week1', 'week2', 'week3', 'week4', 'week5', 'week6'];

  return (
    <div className="bg-white/90 rounded-xl p-4 shadow-lg col-span-3 flex flex-col">
      <h3 className="text-lg font-bold text-green-700 mb-2">TIMELINE</h3>
      <div className="flex flex-grow gap-2 overflow-x-auto pb-2">
        {weeks.map((week, index) => (
          <div key={week} className="flex-1 p-2 border rounded-md bg-gray-100 min-h-[100px] flex flex-col">
            <h4 className="text-sm font-semibold mb-2">Week {index + 1}</h4>
            <div className="flex-grow overflow-y-auto">
              <AnimatePresence>
                {timelineNotes[week]?.map((note, noteIndex) => (
                  <DisplayNoteCard
                    key={noteIndex}
                    id={note}
                    text={note}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

interface PersonaFeedbackCardProps {
  persona: Persona; // Use the imported Persona interface
  prototypeData: PrototypeData; // Use the defined PrototypeData interface
  problemTitle: string;
}

const PersonaFeedbackCard: React.FC<PersonaFeedbackCardProps> = ({ persona, prototypeData }) => {
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getPersonaFeedback = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gemini-persona`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ persona, prototypeData }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get persona feedback');
        }

        const result = await response.json();
        setFeedback(result.feedback);
      } catch (err) {
        console.error(`Error getting feedback for ${persona.name}:`, err);
        setError((err as Error).message || 'Failed to load feedback.');
      } finally {
        setIsLoading(false);
      }
    };

    getPersonaFeedback();
  }, [persona, prototypeData]); // Re-run when persona or prototypeData changes

  return (
    <div className="flex items-start space-x-4 p-4 bg-white rounded-lg shadow-md">
      <img src={persona.avatar} alt={persona.name} className="w-16 h-16 rounded-full object-cover" />
      <div className="flex-1">
        <h3 className="font-bold text-lg">{persona.name} <span className="text-sm text-gray-500">({persona.role})</span></h3>
        {isLoading && <p className="text-gray-600">Analyzing...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {feedback && (
          <div
            className="mt-2 p-3 bg-green-100 text-green-800 rounded-lg relative"
            aria-label={`Persona feedback from ${persona.name}`}
            tabIndex={0} // Added this line
          >
            <p>{feedback}</p>
            {/* Speech bubble tail */}
            <div className="absolute left-3 -top-2 w-0 h-0 border-x-8 border-x-transparent border-b-8 border-b-green-100 transform -rotate-45"></div>
          </div>
        )}
      </div>
    </div>
  );
};

const Test = () => {
  const navigate = useNavigate();
  const { selectedProblem, stageData, updateStageData, addTokens, addStars, user } = useThinkQuestStore();
  const [showConfetti, setShowConfetti] = useState(false); // Added this line
  const [isHintModalOpen, setIsHintModalOpen] = useState(false); // Add this line

  // Placeholder for progress calculation - always 100% for this stage
  const progress = 100;

  useEffect(() => {
    if (!selectedProblem) {
      navigate('/map');
    }
  }, [selectedProblem, navigate]);

  const handleSubmit = async () => {
    if (!user || !selectedProblem) {
      console.error('User or selected problem not available.');
      return;
    }

    const stageScores = [
      stageData.empathy.score || 0,
      stageData.define.score || 0,
      stageData.ideate.score || 0,
      stageData.prototype.score || 0,
      stageData.test.score || 0, // Assuming test stage will also have a score
    ];

    const totalScore = stageScores.reduce((sum, score) => sum + score, 0);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/complete-quest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          totalScore,
          problemId: selectedProblem.id,
          userId: user.username, // Assuming username is unique ID
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to complete quest');
      }

      const result = await response.json();
      console.log('Quest completion response:', result);

      // Award tokens and stars
      addTokens(totalScore / 10); // Example: 10 tokens per 100 score
      addStars(Math.floor(totalScore / 100)); // Example: 1 star per 100 score

      setShowConfetti(true);
      toast.success(`Quest Completed! Total Score: ${totalScore}/500`);

      // Optionally navigate or show a modal
    } catch (error) {
      console.error('Error completing quest:', error);
      toast.error(`Error: ${(error as Error).message || 'Failed to complete quest.'}`);
    }
  };

  if (!selectedProblem) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate('/map')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Stage 5: Test – Get Feedback & Reflect</h1>
                <p className="text-muted-foreground">Feedback and Reflection</p>
              </div>
            </div>
            <motion.div
              className="relative flex items-center justify-center cursor-pointer"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsHintModalOpen(true)}
            >
              <div className="absolute w-8 h-8 rounded-full bg-green-500 opacity-70" />
              <Leaf className="relative z-10 h-5 w-5 text-white" />
            </motion.div>
          </div>

          {/* Progress */}
          <div className="space-y-2 mb-8">
            <div className="flex justify-between text-sm">
              <span>Progress: {Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Your Prototype Poster Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold">Your Prototype</h2>
            <div className="concept-poster w-full bg-green-700 p-8 rounded-lg shadow-xl grid grid-cols-1 md:grid-rows-3 md:grid-cols-3 gap-6 min-h-[600px]">
              <DisplayKanbanColumn
                boxId="concept-name"
                title="1. WHAT IS THE CONCEPT CALLED?"
                notes={stageData.prototype.posterNotes['concept-name'] || []}
              />
              <DisplayKanbanColumn
                boxId="who-is-it-for"
                title="2. WHO IS IT FOR?"
                notes={stageData.prototype.posterNotes['who-is-it-for'] || []}
              />
              <DisplayKanbanColumn
                boxId="problem-solved"
                title="3. WHAT PROBLEM DOES IT SOLVE?"
                notes={stageData.prototype.posterNotes['problem-solved'] || []}
              />
              <DisplayKanbanColumn
                boxId="big-idea"
                title="4. WHAT IS THE BIG IDEA?"
                notes={stageData.prototype.posterNotes['big-idea'] || []}
              />
              <DisplayKanbanColumn
                boxId="how-it-works"
                title="5. ILLUSTRATE HOW IT WORKS"
                notes={stageData.prototype.posterNotes['how-it-works'] || []}
              />
              <DisplayKanbanColumn
                boxId="why-fail"
                title="6. WHY MIGHT IT FAIL?"
                notes={stageData.prototype.posterNotes['why-fail'] || []}
              />
              <DisplayKanbanColumn
                boxId="prototype-test"
                title="7. WHAT SHOULD WE PROTOTYPE AND TEST?"
                notes={stageData.prototype.posterNotes['prototype-test'] || []}
              />
              <DisplayKanbanColumn
                boxId="measure-success"
                title="8. HOW MIGHT WE MEASURE SUCCESS?"
                notes={stageData.prototype.posterNotes['measure-success'] || []}
              />
              <DisplayKanbanColumn
                boxId="make-happen"
                title="9. HOW WILL WE MAKE THIS HAPPEN?"
                notes={stageData.prototype.posterNotes['make-happen'] || []}
              />
              <DisplayTimelineColumn
                timelineNotes={stageData.prototype.timelineNotes || {}}
              />
            </div>
          </motion.div>

          {/* Persona Feedback */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold">Persona Feedback</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedProblem && personasByProblem[selectedProblem.id] ? (
                personasByProblem[selectedProblem.id].map((persona: Persona) => (
                  <PersonaFeedbackCard
                    key={persona.id}
                    persona={persona}
                    prototypeData={{
                      selectedIdea: stageData.prototype.selectedIdea,
                      posterNotes: stageData.prototype.posterNotes,
                      timelineNotes: stageData.prototype.timelineNotes,
                    }}
                    problemTitle={selectedProblem.title} // Added this line
                  />
                ))
              ) : (
                <p className="text-muted-foreground">No personas found for this problem, or problem not selected.</p>
              )}
            </div>
          </motion.div>

          {/* Final Reflection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold">Final Reflection</h2>
            <p className="text-muted-foreground">What surprised you? What was difficult? What did you learn?</p>
            <Textarea
              placeholder="Write your reflection here..."
              value={stageData.test.reflection || ''}
              onChange={(e) => updateStageData('test', { reflection: e.target.value })}
              className="min-h-[150px]"
              aria-label="Reflection input" // Added this line
            />
            <p className="text-sm text-muted-foreground">
              Minimum 50 characters. Current: {stageData.test.reflection?.length || 0}
            </p>
          </motion.div>

          {/* Final Submission */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="space-y-4"
          >
            <h2 className="text-2xl font-bold">Final Submission</h2>
            <p className="text-muted-foreground">Click below to complete your quest and see your final score!</p>
            <Button
              size="lg"
              className="bg-blue-500 text-white hover:bg-blue-600"
              onClick={handleSubmit}
              disabled={(stageData.test.reflection?.length || 0) < 50}
            >
              Complete Quest
            </Button>
          </motion.div>

        </motion.div>

        {/* Stage Hint Modal */}
        <StageHintModal
          isOpen={isHintModalOpen}
          onClose={() => setIsHintModalOpen(false)}
          title="Test – Final Stage"
        >
          <ul className="list-disc list-inside space-y-1">
            <li>Your full Concept Poster is displayed</li>
            <li>Real AI personas will now review your prototype and give honest feedback</li>
            <li>Read what they like, worry about, and suggest</li>
            <li>Write your Final Reflection: What surprised you? What was hard? What did you learn?</li>
            <li>Complete Quest → 2× tokens + leaderboard ranking</li>
            <li>Your total score (all 5 stages) determines your final rank!</li>
          </ul>
        </StageHintModal>
      </div>
    </div>
  );
};

export default Test;