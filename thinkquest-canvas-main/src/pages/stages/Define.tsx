import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';
import { generateAIResponse, PROBLEM_IMAGES, problems } from '@/data/mockData';
import { ArrowLeft, HelpCircle, Sparkles, Leaf } from 'lucide-react'; // Import Leaf icon
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import StageHintModal from '@/components/StageHintModal'; // Import StageHintModal

const STOP_WORDS = [
  "a", "an", "the", "with", "is", "are", "to", "of", "in", "on", "at", "for", "from", "by", "about", "as", "into", "like", "through", "after", "before", "over", "under", "again", "further", "then", "once", "here", "there", "when", "where", "why", "how", "all", "any", "both", "each", "few", "more", "most", "other", "some", "such", "no", "nor", "not", "only", "own", "same", "so", "than", "too", "very", "s", "t", "can", "will", "just", "don", "should", "now",
];

const Define = () => {
  const navigate = useNavigate();
  const { selectedProblem, updateStageData, unlockStage, addTokens, addStars, stageData, setHmwQuestions } = useThinkQuestStore();
  const empathyThemes = stageData.empathy.empathyThemes || []; // Access from stageData
  const [hmwStatement, setHmwStatement] = useState(stageData.define.hmwStatement || '');
  const [reflection, setReflection] = useState(stageData.define.reflection || '');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({
    score: 0,
    strengths: '',
    improvements: '',
    suggestions: [],
    overallComment: '',
    errorMessage: '',
  });
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [isHintModalOpen, setIsHintModalOpen] = useState(false); // New state for hint modal
  const [highlightedCardId, setHighlightedCardId] = useState<string | null>(null);
  const [selectedInsight, setSelectedInsight] = useState<any | null>(null); // Stores the full insight object
  const [selectedVerb, setSelectedVerb] = useState('');
  const [typedPersona, setTypedPersona] = useState('');
  const [typedOutcome, setTypedOutcome] = useState('');
  const [hmwQuestion, setHmwQuestion] = useState('');
  const [addedHmwQuestions, setAddedHmwQuestions] = useState<string[]>(stageData.define.addedHmwQuestions || []);
  const [selectedTheme, setSelectedTheme] = useState<any | null>(null);
  const [showThemeDialog, setShowThemeDialog] = useState(false);

  if (!selectedProblem) {
    navigate('/map');
    return null;
  }

  const problemImage = PROBLEM_IMAGES[selectedProblem.id];

  // Calculate progress based on added HMW questions
  const progress = (addedHmwQuestions.length > 0 ? 1 : 0) * 100;

  useEffect(() => {
    const currentPersona = typedPersona || selectedInsight?.persona || 'user';
    const currentOutcome = typedOutcome || selectedInsight?.because || '';

    if (currentPersona && selectedVerb && currentOutcome) {
      setHmwQuestion(`How might we help ${currentPersona} ${selectedVerb} so that ${currentOutcome}?`);
    } else if (currentPersona && selectedVerb) {
      setHmwQuestion(`How might we help ${currentPersona} ${selectedVerb} so that [outcome]?`);
    } else if (currentPersona && currentOutcome) {
      setHmwQuestion(`How might we help ${currentPersona} [verb] so that ${currentOutcome}?`);
    } else if (selectedVerb && currentOutcome) {
      setHmwQuestion(`How might we help [persona] ${selectedVerb} so that ${currentOutcome}?`);
    } else if (currentPersona) {
      setHmwQuestion(`How might we help ${currentPersona} [verb] so that [outcome]?`);
    } else if (selectedVerb) {
      setHmwQuestion(`How might we help [persona] ${selectedVerb} so that [outcome]?`);
    } else if (currentOutcome) {
      setHmwQuestion(`How might we help [persona] [verb] so that ${currentOutcome}?`);
    } else {
      setHmwQuestion('');
    }
  }, [selectedInsight, selectedVerb, typedPersona, typedOutcome]);

  const handleRefine = () => {
    // Refine logic for the current hmwQuestion
    if (!hmwQuestion) {
      toast.error('Generate an HMW question first!');
      return;
    }
    const result = generateAIResponse('refine', { hmw: hmwQuestion }) as { suggestion: string; improvements: string[] };
    toast.success('AI Suggestions', {
      description: result.suggestion,
    });
  };

      const handleSubmit = async () => {
      if (addedHmwQuestions.length === 0) {
        toast.error('Add at least one HMW question first!');
        return;
      }
  
      setIsSubmitting(true);
  
      try {
        console.log('Define.tsx: Sending to /api/gemini-score with body:');
        console.log('  stage:', 'define');
        console.log('  hmwList:', addedHmwQuestions);
        console.log('  selectedProblem:', selectedProblem);
        console.log('  themes:', empathyThemes);
        console.log('  reflection:', reflection);

        const response = await fetch(`/api/gemini-score`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            stage: 'define',
            hmwList: addedHmwQuestions,
            selectedProblem: selectedProblem,
            themes: empathyThemes,
            reflection: reflection,
          }),
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
  
      console.log('Define.tsx: Submitting with addedHmwQuestions:', addedHmwQuestions);

      updateStageData('define', {
        hmwStatement: addedHmwQuestions.join(' '), // Save combined HMW for stageData
        addedHmwQuestions, // Save all added HMW questions
        score,
        reflection,
      });
      console.log('Define.tsx: After updateStageData for define, addedHmwQuestions:', addedHmwQuestions);

      // Carry HMW to Ideate stage regardless of score
      setHmwQuestions(addedHmwQuestions);
      console.log('Define.tsx: After setHmwQuestions for ideate, addedHmwQuestions:', addedHmwQuestions);

        if (score >= 70) {
          setShowConfetti(true);
          unlockStage(2); // Unlock Ideate stage
          addTokens(50);
          addStars(1);
          toast.success(`Stage Complete! Score: ${score}/100`);
        }
      } catch (error) {
        console.error('Error analyzing HMW questions with Gemini API:', error);
        const errorMessage = (error as Error).message || 'Failed to analyze HMW questions.';
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
  const handleCardClick = (item: any) => {
    setSelectedInsight(item);
    setHighlightedCardId(item.id);
    setSelectedVerb(''); // Reset verb when a new insight is selected
    setTypedPersona(item.persona || ''); // Pre-fill typedPersona
    setTypedOutcome(item.because || ''); // Pre-fill typedOutcome
  };

  const handleAddHmw = () => {
    if (hmwQuestion.trim()) {
      setAddedHmwQuestions(prev => [...prev, hmwQuestion]);
      setHmwQuestion(''); // Clear current HMW question
      setSelectedInsight(null); // Clear selected insight
      setHighlightedCardId(null); // Clear highlighted card
      setSelectedVerb(''); // Clear selected verb
      setTypedPersona(''); // Clear typedPersona
      setTypedOutcome(''); // Clear typedOutcome
      toast.success('HMW question added!');
    } else {
      toast.error('Please generate an HMW question first.');
    }
  };

  const allInsights = [
    ...(stageData.empathy.empathyInsights ?? []).map((insight, index) => ({
      id: `insight-${insight.id || index}`,
      title: insight.persona + ' ' + insight.activity,
      text: `${insight.persona} ${insight.activity} because ${insight.because} but ${insight.but}`,
      persona: insight.persona,
      activity: insight.activity,
      because: insight.because,
      but: insight.but,
    })),
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {showConfetti && <Confetti />}

      <div className="container max-w-6xl mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" onClick={() => navigate('/map')}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-3xl font-bold">Stage 2: Define</h1>
                <p className="text-muted-foreground">Define Mountain</p>
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
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Build HMW Statement: {addedHmwQuestions.length > 0 ? 1 : 0}/1</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
          
          {/* Stage Hint Modal */}
          <StageHintModal
            isOpen={isHintModalOpen}
            onClose={() => setIsHintModalOpen(false)}
            title="Define – How to Complete"
          >
            <ul className="list-disc list-inside space-y-2">
              <li>Review your Empathy insights on the left</li>
              <li>Write a clear Problem Statement (POV): User + Need + Insight</li>
              <li>Craft at least 3 strong How Might We (HMW) questions</li>
              <li>They must be open, positive, and actionable</li>
              <li>Select your favorite HMW as the main one</li>
              <li>Reflect: 'How does this focus your thinking?'</li>
              <li>Submit → AI checks framing quality (70+ unlocks Ideate)</li>
            </ul>
          </StageHintModal>

          {/* Main Content Area */}
          <div className="flex flex-col lg:flex-row gap-8">
            {/* NEW: Far Left Column for Static Themes */}
            <div className="lg:w-1/5 space-y-4">
              <h2 className="text-2xl font-bold">Empathy Themes</h2>
              {stageData.empathy.empathyThemes && stageData.empathy.empathyThemes.length > 0 ? (
                <div className="space-y-3">
                  {stageData.empathy.empathyThemes.map((theme, index) => (
                    <div
                      key={index}
                      className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                      onClick={() => {
                        setSelectedTheme(theme);
                        setShowThemeDialog(true);
                      }}
                    >
                      <h3 className="font-semibold">{theme.title}</h3>
                      <p className="text-sm text-muted-foreground">{theme.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No themes yet. Complete the Empathize stage first.</p>
              )}
            </div>

            {/* Left Panel: Empathy Insights (now middle panel) */}
            <div className="lg:w-2/5 sticky top-0 h-screen overflow-y-auto pr-4 space-y-4">
              <h2 className="text-2xl font-bold">Your Empathy Insights</h2>
              {problemImage && (
                <img src={problemImage} alt={selectedProblem.title} className="w-full h-48 object-cover rounded-lg" />
              )}
              <div className="space-y-3">
                {allInsights.length > 0 ? (
                  allInsights.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-all duration-200",
                        "hover:shadow-md",
                        highlightedCardId === item.id ? "bg-green-100 border-green-500 shadow-lg" : "bg-card"
                      )}
                      onClick={() => handleCardClick(item)}
                    >
                      <h3 className="font-semibold">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.text}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-muted-foreground">No insights or themes yet. Complete the Empathize stage first.</p>
                )}
              </div>
            </div>

            {/* Right Panel: HMW Builder */}
            <div className="lg:w-2/5 space-y-6">
              <h2 className="text-2xl font-bold">How Might We (HMW) Statement Builder</h2>

              {/* Selected Empathy Insights */}
              {selectedInsight && (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold">Selected Empathy Insight</h3>
                  <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-lg shadow-sm">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <span className="font-semibold">{selectedInsight.persona}</span> needs to <span className="font-semibold">{selectedInsight.activity}</span> because <span className="font-semibold">{selectedInsight.because}</span> but <span className="font-semibold">{selectedInsight.but}</span>.
                    </p>
                  </div>
                </div>
              )}

              {/* Step 1: Choose an important need */}
              <div className="space-y-2">
               <label className="text-sm font-large">Step 1: Create a Clear Problem Statement</label><br /><br />
                <label className="text-sm font-medium">Type an important need (verb)</label>
                <Input
                  placeholder="e.g., 'eat quickly', 'study quietly'"
                  value={selectedVerb}
                  onChange={(e) => setSelectedVerb(e.target.value)}
                />
              </div>

              {/* Step 1: Type a persona */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type a persona</label>
                <Input
                  placeholder="e.g., 'students', 'commuters'"
                  value={typedPersona}
                  onChange={(e) => setTypedPersona(e.target.value)}
                />
              </div>

              {/* Step 1: Type an outcome */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Type an insight</label>
                <Input
                  placeholder="e.g., 'they can focus better', 'they save time'"
                  value={typedOutcome}
                  onChange={(e) => setTypedOutcome(e.target.value)}
                />
              </div>

              {/* Step 2: Turn into a "How Might We" question */}
              <div className="space-y-2">
                <label className="text-sm font-large">Step 2: Turn into a "How Might We" question</label><br /><br />
                <label className="text-sm font-medium">Create a "How Might We" question based on the Problem Statement</label>
                <Textarea
                  placeholder="How might we help [persona] [verb] so that [outcome]? (Live Preview)"
                  value={hmwQuestion}
                  onChange={(e) => setHmwQuestion(e.target.value)}
                  rows={3}
                  className="resize-none font-mono"
                />
              </div>

              <Button
                onClick={handleAddHmw}
                className="w-full bg-yellow-500 text-white hover:bg-yellow-600 text-lg py-6"
                disabled={!hmwQuestion}
              >
                Add HMW
              </Button>

              {/* Added HMW Questions List */}
              <div className="space-y-2">
                <h3 className="text-xl font-bold">Added HMW Questions</h3>
                <div className="p-4 bg-muted rounded-lg min-h-[100px] max-h-[200px] overflow-y-auto space-y-2">
                  {addedHmwQuestions.length > 0 ? (
                    addedHmwQuestions.map((hmw, index) => (
                      <p key={index} className="text-sm bg-card p-2 rounded-md">{hmw}</p>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No HMW questions added yet.</p>
                  )}
                </div>
              </div>



              {/* Score Display */}
              {stageData.define.score && (
                <div className="space-y-2">
                  <h2 className="text-xl font-bold">Score</h2>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Specificity</span>
                      <span>{stageData.define.score}/100</span>
                    </div>
                    <Progress value={stageData.define.score} className="h-3" />
                  </div>
                </div>
              )}

              {/* Reflection */}
              <div className="space-y-4">
                <h2 className="text-2xl font-bold">Reflection</h2>
                <Textarea
                  placeholder="How does this HMW statement help address the problem?"
                  value={reflection}
                  onChange={(e) => setReflection(e.target.value)}
                  rows={4}
                  className="resize-none"
                />
              </div>

              {/* Actions */}
              <div className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/map')}>
                  Back to Map
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={isSubmitting || addedHmwQuestions.length === 0}
                  size="lg"
                  className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                >
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
        {/* Theme Details Dialog */}
        <Dialog open={showThemeDialog} onOpenChange={setShowThemeDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedTheme?.title}</DialogTitle>
            </DialogHeader>
            <div className="py-4">
              <p className="text-sm text-muted-foreground">{selectedTheme?.text}</p>
            </div>
            <div className="flex justify-end">
              <Button onClick={() => setShowThemeDialog(false)}>Close</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Analysis Results Dialog */}
        <Dialog open={showAnalysisDialog} onOpenChange={setShowAnalysisDialog}>
          <DialogContent className="max-w-2xl">
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

export default Define;
