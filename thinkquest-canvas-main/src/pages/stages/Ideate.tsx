import React, { useState, useEffect } from 'react';
import { useThinkQuestStore } from '../../store/useThinkQuestStore';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProblemDetailsOverlay from '../../components/ProblemDetailsOverlay';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { toast } from '../../hooks/use-toast';
import { Separator } from '../../components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';

// Define type for How Might We statements
interface HowMightWe {
  id: string;
  statement: string;
}

const Ideate: React.FC = () => {
  const {
    selectedProblem, // Directly use selectedProblem from the store
    reflection: storedReflection,
    empathyMapInput: storedEmpathyMapInput,
    insights: storedInsights,
    themes: storedThemes,
    addIdeationData,
    rationaleMap: storedRationaleMap,
  } = useThinkQuestStore();
  const navigate = useNavigate();


  const [hmwList, setHmwList] = useState<HowMightWe[]>(storedHmwList || []);
  const [newHmw, setNewHmw] = useState('');
  const [ideas, setIdeas] = useState<string[]>([]);
  const [newIdea, setNewIdea] = useState('');
  const [selectedTop3Ideas, setSelectedTop3Ideas] = useState<string[]>([]);
  const [rationaleMap, setRationaleMap] = useState<{ [key: string]: string }>(
    storedRationaleMap || {},
  );
  const [reflection, setReflection] = useState(storedReflection || '');
  const [isLoading, setIsLoading] = useState(false);
  const [problemDetailsOpen, setProblemDetailsOpen] = useState(false);

  useEffect(() => {
    if (!selectedProblem) {
      toast({
        title: 'No Problem Selected',
        description: 'Please select a problem from the map to start ideating.',
        variant: 'destructive',
      });
      navigate('/map');
    }
  }, [selectedProblem, navigate, toast]);

  if (!selectedProblem) {
    return null; // Or a loading spinner, as the useEffect will redirect
  }

  const addHmw = () => {
    if (newHmw.trim()) {
      setHmwList([...hmwList, { id: Date.now().toString(), statement: newHmw.trim() }]);
      setNewHmw('');
    }
  };

  const removeHmw = (id: string) => {
    setHmwList(hmwList.filter((hmw) => hmw.id !== id));
  };

  const addIdea = () => {
    if (newIdea.trim()) {
      setIdeas([...ideas, newIdea.trim()]);
      setNewIdea('');
    }
  };

  const removeIdea = (ideaToRemove: string) => {
    setIdeas(ideas.filter((idea) => idea !== ideaToRemove));
    setSelectedTop3Ideas(selectedTop3Ideas.filter((idea) => idea !== ideaToRemove));
    const newRationaleMap = { ...rationaleMap };
    delete newRationaleMap[ideaToRemove];
    setRationaleMap(newRationaleMap);
  };

  const toggleTop3Idea = (idea: string) => {
    setSelectedTop3Ideas((prev) => {
      if (prev.includes(idea)) {
        const newSelection = prev.filter((i) => i !== idea);
        const newRationaleMap = { ...rationaleMap };
        delete newRationaleMap[idea];
        setRationaleMap(newRationaleMap);
        return newSelection;
      } else if (prev.length < 3) {
        return [...prev, idea];
      } else {
        toast({
          title: 'Too Many Ideas',
          description: 'You can select a maximum of 3 top ideas.',
          variant: 'destructive',
        });
        return prev;
      }
    });
  };

  const handleAnalyze = async () => {
    // Temporarily disabled for debugging and development
    addIdeationData({
      hmwList,
      ideas,
      selectedTop3Ideas,
      rationaleMap,
      reflection,
      selectedProblem: selectedProblem,
    });

    const dummyScoreResult = {
      score: 100,
      feedback: 'AI analysis bypassed for development.',
    };

    navigate('/stages/prototype', { state: { scoreResult: dummyScoreResult } });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-yellow-100 to-orange-200 dark:from-gray-800 dark:to-gray-950 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => navigate('/stages/empathize')} variant="outline" className="flex items-center">
            ← Back to Empathize
          </Button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-orange-800 dark:text-orange-300 text-center">
            Ideate Stage
          </h1>
          <Button onClick={() => setProblemDetailsOpen(true)} variant="outline">
            Problem Details
          </Button>
        </div>

        {problemDetailsOpen && (
          <ProblemDetailsOverlay
            problem={selectedProblem}
            onClose={() => setProblemDetailsOpen(false)}
          />
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* How Might We Section */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-orange-700 dark:text-orange-400">
                How Might We Statements
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Textarea
                  value={newHmw}
                  onChange={(e) => setNewHmw(e.target.value)}
                  placeholder="How might we make learning accessible during power outages?"
                  className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Button onClick={addHmw}>Add HMW</Button>
              </div>
              <Separator className="my-6" />
              <div className="space-y-2">
                {hmwList.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center">No HMWs added yet.</p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {hmwList.map((hmw, index) => (
                      <AccordionItem key={hmw.id} value={`hmw-item-${index}`}>
                        <AccordionTrigger>HMW {index + 1}</AccordionTrigger>
                        <AccordionContent>
                          <Card className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                            <p className="text-gray-900 dark:text-gray-100">{hmw.statement}</p>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => removeHmw(hmw.id)}
                              className="mt-2"
                            >
                              Remove
                            </Button>
                          </Card>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Idea Generation Section */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-orange-700 dark:text-orange-400">
                Idea Generation (Brainstorm)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex space-x-2 mb-4">
                <Textarea
                  value={newIdea}
                  onChange={(e) => setNewIdea(e.target.value)}
                  placeholder="Develop a solar-powered learning tablet..."
                  className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Button onClick={addIdea}>Add Idea</Button>
              </div>
              <Separator className="my-6" />
              <div className="space-y-2">
                {ideas.length === 0 ? (
                  <p className="text-gray-600 dark:text-gray-400 text-center">No ideas added yet.</p>
                ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {ideas.map((idea, index) => (
                      <AccordionItem key={index} value={`idea-item-${index}`}>
                        <AccordionTrigger>Idea {index + 1}</AccordionTrigger>
                        <AccordionContent>
                          <Card className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                            <p className="text-gray-900 dark:text-gray-100">{idea}</p>
                            <div className="flex justify-between items-center mt-2">
                              <div className="flex items-center space-x-2">
                                <input
                                  type="checkbox"
                                  id={`top3-${index}`}
                                  checked={selectedTop3Ideas.includes(idea)}
                                  onChange={() => toggleTop3Idea(idea)}
                                  className="form-checkbox h-4 w-4 text-orange-600"
                                />
                                <Label htmlFor={`top3-${index}`} className="text-sm">
                                  Select as Top Idea
                                </Label>
                              </div>
                              <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => removeIdea(idea)}
                              >
                                Remove
                              </Button>
                            </div>
                            {selectedTop3Ideas.includes(idea) && (
                              <div className="mt-4">
                                <Label htmlFor={`rationale-${index}`} className="block text-sm font-medium mb-1">
                                  Rationale for this Top Idea
                                </Label>
                                <Textarea
                                  id={`rationale-${index}`}
                                  value={rationaleMap[idea] || ''}
                                  onChange={(e) =>
                                    setRationaleMap({ ...rationaleMap, [idea]: e.target.value })
                                  }
                                  placeholder="Why is this a top idea? How does it address the problem?"
                                  rows={3}
                                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                                />
                              </div>
                            )}
                          </Card>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Reflection */}
        <Card className="mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-orange-700 dark:text-orange-400">
              Reflection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="reflection" className="block text-md font-medium mb-2">
              What challenges did you face? What did you learn?
            </Label>
            <Textarea
              id="reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={8}
              placeholder="Reflect on your ideation process..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-orange-500"
            />
          </CardContent>
        </Card>

        <div className="flex justify-center mt-8">
          <Button onClick={handleAnalyze} disabled={isLoading} className="px-8 py-3 text-lg">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Analyzing...
              </>
            ) : (
              'Analyze & Proceed to Prototype'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Ideate;
