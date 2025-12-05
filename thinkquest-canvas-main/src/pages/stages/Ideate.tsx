import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import Confetti from 'react-confetti';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';
import {
  PROBLEM_IMAGES,
  // generateAIResponse // This is not needed as we will call our own API
} from '@/data/mockData';
import { ArrowLeft, HelpCircle, Plus, Trash2, Lightbulb, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import StageHintModal from '@/components/StageHintModal';

const Ideate = () => {
  const navigate = useNavigate();
  const { selectedProblem, updateStageData, unlockStage, addTokens, addStars, stageData, setSelectedHmw } = useThinkQuestStore();

  const selectedHmw = useThinkQuestStore((state) => state.stageData.ideate.selectedHmw);

  const hmwQuestions = stageData.ideate.hmwQuestions; // Access directly from stageData

  console.log('Ideate.tsx: Initial render - hmwQuestions:', hmwQuestions);
  console.log('Ideate.tsx: Initial render - stageData.define.addedHmwQuestions:', stageData.define.addedHmwQuestions);

  const [currentIdea, setCurrentIdea] = useState('');
  const [ideas, setIdeas] = useState<string[]>(stageData.ideate.ideas || []);
  const [selectedTop3Ideas, setSelectedTop3Ideas] = useState<string[]>(stageData.ideate.top3 || []);
  const [rationaleMap, setRationaleMap] = useState<Record<string, string>>({});
  const [reflection, setReflection] = useState(stageData.ideate.reflection || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({
    score: 0,
    strengths: '',
    improvements: '',
    suggestions: [],
    overallComment: '',
    errorMessage: '',
  });
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false);

  useEffect(() => {
    console.log('Ideate.tsx: useEffect running.');
    console.log('Ideate.tsx: useEffect - hmwQuestions:', hmwQuestions);
    console.log('Ideate.tsx: useEffect - stageData.define.addedHmwQuestions:', stageData.define.addedHmwQuestions);

    if (!selectedProblem) {
      navigate('/map');
      return; // Exit early if no problem selected
    }

    // Only select the first HMW if HMW questions are available and none is currently selected
    if (hmwQuestions && hmwQuestions.length > 0 && !selectedHmw) {
        setSelectedHmw(hmwQuestions[0]);
    }
  }, [selectedProblem, navigate, hmwQuestions, selectedHmw, setSelectedHmw]);

  if (!selectedProblem) {
    return null; // Should navigate away due to useEffect
  }

  const problemImage = PROBLEM_IMAGES[selectedProblem.id];

  // Progress calculation - e.g., 5 ideas + 3 selected + reflection
  const progress = Math.min(((ideas.length / 5) * 40) + ((selectedTop3Ideas.length / 3) * 30) + (reflection.length > 0 ? 30 : 0), 100); // Example progress

  const handleAddIdea = () => {
    if (currentIdea.trim()) {
      const updatedIdeas = [...ideas, currentIdea.trim()];
      setIdeas(updatedIdeas);
      setCurrentIdea('');
      updateStageData('ideate', { ideas: updatedIdeas });
    } else {
      toast.error('Idea cannot be empty!');
    }
  };

  const handleRemoveIdea = (index: number) => {
    const filteredIdeas = ideas.filter((_, i) => i !== index);
    setIdeas(filteredIdeas);
    // Also remove from selectedTop3Ideas if it was there
    setSelectedTop3Ideas(prev => prev.filter(idea => idea !== ideas[index]));
    // Also remove rationale
    setRationaleMap(prev => {
        const newMap = { ...prev };
        delete newMap[ideas[index]];
        return newMap;
    });
    updateStageData('ideate', { ideas: filteredIdeas });
  };

  const handleToggleTop3 = (idea: string) => {
    setSelectedTop3Ideas(prevSelected => {
      const newSelected = prevSelected.includes(idea)
        ? prevSelected.filter(item => item !== idea)
        : [...prevSelected, idea];

      if (newSelected.length > 3) {
        toast.error('You can only select up to 3 ideas!');
        return prevSelected;
      }
      // Initialize rationale for newly selected idea
      if (!prevSelected.includes(idea) && newSelected.includes(idea)) {
        setRationaleMap(prev => ({ ...prev, [idea]: '' }));
      }
      // Remove rationale for deselected idea
      if (prevSelected.includes(idea) && !newSelected.includes(idea)) {
        setRationaleMap(prev => {
            const newMap = { ...prev };
            delete newMap[idea];
            return newMap;
        });
      }
      return newSelected;
    });
  };

  const canProceedToNextStep = ideas.length >= 5;
  const canSubmit = selectedTop3Ideas.length === 3 && Object.values(rationaleMap).every(r => r.trim() !== '') && reflection.trim() !== '';

  const handleSubmit = async () => {
    if (!canSubmit) {
      toast.error('Please complete all fields and select exactly 3 top ideas with rationales and reflection.');
      return;
    }

    setIsSubmitting(true);
    try {
      const requestBody = {
        stage: 'ideate',
        hmw: selectedHmw,
        selectedTop3Ideas: selectedTop3Ideas,
        rationaleMap: rationaleMap,
        reflection: reflection,
        selectedProblem: selectedProblem,
      };
      console.log('Ideate.tsx: Sending to Gemini API:', requestBody);
      console.log('Ideate.tsx: Debugging requestBody - hmw:', requestBody.hmw);
      console.log('Ideate.tsx: Debugging requestBody - selectedTop3Ideas:', requestBody.selectedTop3Ideas);
      console.log('Ideate.tsx: Debugging requestBody - rationaleMap:', requestBody.rationaleMap);
      console.log('Ideate.tsx: Debugging requestBody - reflection:', requestBody.reflection);
      console.log('Ideate.tsx: Debugging requestBody - problem:', requestBody.problem);

      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/gemini-score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI score');
      }

      const result = await response.json();
      const score = result.score || 50;
      const strengths = result.strengths || 'N/A';
      const improvements = result.improvements || 'Could not parse detailed feedback.';
      const suggestions = Array.isArray(result.suggestions) ? result.suggestions : ['Ensure your input is clear and concise.'];
      const overallComment = result.overallComment || 'Please try again.';

      updateStageData('ideate', {
        ideas,
        top3: selectedTop3Ideas,
        rationale: rationaleMap, // Store rationale as a map
        reflection,
        score,
      });

      setIsSubmitting(false);

      setAnalysisResults({
        score,
        strengths,
        improvements,
        suggestions,
        overallComment,
        errorMessage: '',
      });
      setShowAnalysisDialog(true);

      if (score >= 70) {
        setShowConfetti(true);
        unlockStage(3); // Unlock Prototype stage
        addTokens(50);
        addStars(1);
        toast.success(`Stage Complete! Score: ${score}/100`);
      }
    } catch (error) {
      console.error('Error analyzing ideas with Gemini API:', error);
      const errorMessage = (error as Error).message || 'Failed to analyze ideas.';
      setIsSubmitting(false);
      setAnalysisResults({
        score: 50,
        strengths: 'N/A',
        improvements: 'Could not parse detailed feedback.',
        suggestions: ['Check your internet connection or try again later.'],
        overallComment: 'An error occurred.',
        errorMessage: errorMessage,
      });
      setShowAnalysisDialog(true);
    }
  };

  const handleHmwClick = (hmw: string) => {
    console.log('Ideate.tsx: handleHmwClick triggered with HMW:', hmw);

    // Always set the selected HMW when clicked
    setSelectedHmw(hmw);
    console.log('Ideate.tsx: After setSelectedHmw, current selectedHmw from store (stale value): ', selectedHmw);

    // Temporarily remove the complex logic for clearing ideas to isolate the selectedHmw display issue
    // We will re-introduce and refine this logic once selectedHmw is reliably displayed.
    // if (selectedHmw && selectedHmw !== hmw) {
    //     setIdeas([]);
    //     setSelectedTop3Ideas([]);
    //     setRationaleMap({});
    //     setReflection('');
    //     updateStageData('ideate', { ideas: [], top3: [], rationale: {}, reflection: '' });
    // }
};

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {showConfetti && <Confetti />}

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
                <h1 className="text-3xl font-bold">Stage 3: Ideate</h1>
                <p className="text-muted-foreground">Ideation Storm</p>
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

          {/* Main Content Area - Two Columns */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Left Column: Your HMW Questions */}
            <div className="lg:w-[35%] lg:sticky lg:top-8 h-fit lg:max-h-[calc(100vh-64px)] overflow-y-auto pr-4 space-y-4">
              <h2 className="text-2xl font-bold">Your HMW Questions</h2>
              {problemImage && (
                <img src={problemImage} alt={selectedProblem.title} className="w-full h-48 object-cover rounded-lg mb-4" />
              )}
              <h3 className="text-xl font-semibold mb-4">Problem: {selectedProblem.title}</h3>

              <div className="space-y-3">
                {hmwQuestions && hmwQuestions.length > 0 ? (
                  hmwQuestions.map((hmw, index) => (
                    <div
                      key={index}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                        "hover:shadow-md hover:border-green-500",
                        selectedHmw === hmw ? "bg-yellow-100 dark:bg-yellow-900 border-yellow-500 shadow-lg" : "bg-card"
                      )}
                      onClick={() => handleHmwClick(hmw)}
                    >
                      <p className="text-sm font-medium">{hmw}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No How-Might-We questions found. Please complete the Define stage.</p>
                )}
              </div>
            </div>

            {/* Right Column: Ideation Process */}
            <div className="lg:w-[65%] space-y-8">
              {/* Selected HMW Header */}
              {selectedHmw && (
                <div className="bg-primary-foreground p-4 rounded-lg shadow-sm">
                  <h2 className="text-xl font-bold text-primary">Selected HMW:</h2>
                  <p className="text-lg text-primary mt-2">{selectedHmw}</p>
                </div>
              )}

              {/* Generate Ideas */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Lightbulb className="h-6 w-6" /> Generate Ideas
                </h2>
                <Textarea
                  placeholder="Type your idea here... (e.g., 'Develop a mobile app for collaborative note-taking')"
                  value={currentIdea}
                  onChange={(e) => setCurrentIdea(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
                <Button onClick={handleAddIdea} className="w-full">
                  <Plus className="h-4 w-4 mr-2" /> Add Idea
                </Button>
              </div>

              {/* Ideas List */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Your Ideas ({ideas.length})</h3>
                <div className="p-4 bg-muted rounded-lg min-h-[100px] max-h-[300px] overflow-y-auto space-y-2">
                  {ideas.length > 0 ? (
                    ideas.map((idea, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex items-center gap-3 p-3 bg-card rounded-md border"
                      >
                        <span className="flex-1 text-sm">{idea}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveIdea(index)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </motion.div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No ideas added yet. Start brainstorming!</p>
                  )}
                </div>
              </div>

              {/* Select Top 3 Ideas */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Select Top 3 Ideas</h2>
                {!canProceedToNextStep && (
                  <p className="text-red-500">Add at least 5 ideas to enable selecting your top 3.</p>
                )}
                <div className="space-y-2">
                  {ideas.map((idea, index) => (
                    <div
                      key={index}
                      className={cn(
                        "flex items-center gap-3 p-3 bg-card rounded-md border",
                        !canProceedToNextStep && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <Checkbox
                        checked={selectedTop3Ideas.includes(idea)}
                        onCheckedChange={() => handleToggleTop3(idea)}
                        disabled={!canProceedToNextStep || (selectedTop3Ideas.length >= 3 && !selectedTop3Ideas.includes(idea))}
                      />
                      <span className="flex-1 text-sm">{idea}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Rationale for Top 3 Ideas */}
              {selectedTop3Ideas.length > 0 && (
                <div className="space-y-4">
                  <h2 className="text-2xl font-bold">Rationale for Top 3 Ideas</h2>
                  {selectedTop3Ideas.map((idea, index) => (
                    <div key={index} className="space-y-2">
                      <h3 className="text-xl font-semibold">Idea {index + 1}: {idea}</h3>
                      <Textarea
                        placeholder="Rationale for this idea..."
                        value={rationaleMap[idea] || ''}
                        onChange={(e) => setRationaleMap(prev => ({ ...prev, [idea]: e.target.value }))}
                        rows={3}
                        className="resize-none"
                      />
                    </div>
                  ))}
                </div>
              )}

              {/* Reflection */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Reflection</h2>
                <Textarea
                  placeholder="How do your top 3 ideas solve the selected HMW and original problem?"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between mt-8">
                <Button variant="outline" onClick={() => navigate('/map')}>
                  Back to Map
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || !canSubmit}
                  size="lg"
                  className="bg-yellow-500 text-white hover:bg-yellow-600"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit & Score'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stage Hint Modal */}
        <StageHintModal
          isOpen={isHintModalOpen}
          onClose={() => setIsHintModalOpen(false)}
          title="Ideate – How to Complete"
        >
          <ul className="list-disc list-inside space-y-1">
            <li>Select your favorite HMW question</li>
            <li>Brainstorm at least 7 wild ideas (quantity over quality!)</li>
            <li>Pick your Top 3</li>
            <li>Write a clear rationale for each: Why this idea? How does it solve the HMW?</li>
            <li>Reflect on your ideation process</li>
            <li>Be creative — the crazier, the better!</li>
            <li>Submit → AI scores creativity & justification (70+ unlocks Prototype)</li>
          </ul>
        </StageHintModal>

        {/* Analysis Results Dialog */}
        <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
          <DialogContent className={cn("max-w-2xl", analysisResults.score >= 70 && "bg-green-100 dark:bg-green-900")}>
            <DialogHeader>
              <DialogTitle>Analysis Results</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-4">
              {analysisResults.errorMessage && (
                <p className="text-red-500 font-bold">Error: {analysisResults.errorMessage}</p>
              )}
              <p className="text-lg font-semibold">Score: {analysisResults.score}/100</p>
              <div>
                <h3 className="font-bold">Strengths:</h3>
                <p>{analysisResults.strengths}</p>
              </div>
              <div>
                <h3 className="font-bold">Improvements:</h3>
                <p>{analysisResults.improvements}</p>
              </div>
              <div>
                <h3 className="font-bold">Suggestions:</h3>
                <ul className="list-disc list-inside ml-4">
                  {analysisResults.suggestions.map((suggestion, index) => (
                    <li key={index}>{suggestion}</li>
                  ))}
                </ul>
              </div>
              <div>
                <h3 className="font-bold">Overall Comment:</h3>
                <p>{analysisResults.overallComment}</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowAnalysisDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Ideate;