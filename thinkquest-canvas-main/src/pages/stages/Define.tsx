import React, { useState, useEffect } from 'react';
import { useThinkQuestStore } from '../../store/useThinkQuestStore';
import { useNavigate, useLocation } from 'react-router-dom';
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

// Define types for HMW statements
interface HowMightWe {
  id: string;
  statement: string;
}

const Define: React.FC = () => {
  const {
    selectedProblem,
    addHmwList,
    addSelectedProblem,
    addThemes,
    addReflection,
    hmwList: storedHmwList,
    selectedProblem: storedSelectedProblem,
    themes: storedThemes,
    reflection: storedReflection,
  } = useThinkQuestStore();
  const navigate = useNavigate();
  const location = useLocation();


  const [hmwList, setHmwList] = useState<HowMightWe[]>(storedHmwList || []);
  const [newHmw, setNewHmw] = useState('');
  const [selectedProblem, setSelectedProblem] = useState(storedSelectedProblem || '');
  const [themes, setThemes] = useState(storedThemes || []);
  const [reflection, setReflection] = useState(storedReflection || '');
  const [isLoading, setIsLoading] = useState(false);
  const [problemDetailsOpen, setProblemDetailsOpen] = useState(false);

  useEffect(() => {
    if (!selectedProblem) {
      toast({
        title: 'No Problem Selected',
        description: 'Please select a problem from the map to start defining.',
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

  const handleAnalyze = async () => {
    if (hmwList.length === 0 || !selectedProblem || themes.length === 0 || !reflection) {
      toast({
        title: 'Missing Information',
        description: 'Please complete all sections before analyzing.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      console.log('Define.tsx: Sending to /api/gemini-score with body:');
      const response = await fetch(`/api/gemini-score`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: 'define',
          hmwList: hmwList.map((hmw) => hmw.statement),
          selectedProblem,
          themes,
          reflection,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get score from AI...');
      }

      const result = await response.json();
      console.log('Define stage AI score result:', result);

      addHmwList(hmwList);
      addSelectedProblem(selectedProblem);
      addThemes(themes);
      addReflection(reflection);

      navigate('/stages/ideate', { state: { scoreResult: result } });
    } catch (error) {
      console.error('Error analyzing define stage with Gemini API:', error);
      toast({
        title: 'Analysis Failed',
        description: (error as Error).message || 'Failed to analyze define stage with AI.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-green-100 to-teal-200 dark:from-gray-800 dark:to-gray-950 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => navigate('/stages/empathize')} variant="outline" className="flex items-center">
            ← Back to Empathize
          </Button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-teal-800 dark:text-teal-300 text-center">
            Define Stage
          </h1>
          <Button onClick={() => setProblemDetailsOpen(true)} variant="outline">
            Problem Details
          </Button>
        </div>

        <ProblemDetailsOverlay
          isOpen={problemDetailsOpen}
          onClose={() => setProblemDetailsOpen(false)}
          problem={selectedProblem}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* How Might We Section */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-teal-700 dark:text-teal-400">
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

          {/* Selected Problem */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-teal-700 dark:text-teal-400">
                Selected Problem Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="selected-problem" className="block text-md font-medium mb-2">
                Reframe the problem based on your insights
              </Label>
              <Textarea
                id="selected-problem"
                value={selectedProblem}
                onChange={(e) => setSelectedProblem(e.target.value)}
                rows={8}
                placeholder="Our users (rural students) struggle with inconsistent access to electricity, leading to disrupted study times..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* Themes Section */}
        <Card className="mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-teal-700 dark:text-teal-400">
              Key Themes from Empathize Stage
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="themes" className="block text-md font-medium mb-2">
              List the overarching themes you identified:
            </Label>
            <Textarea
              id="themes"
              value={themes.map((t: any) => t.title + ': ' + t.description).join('\n')}
              onChange={(e) =>
                setThemes(
                  e.target.value
                    .split('\n')
                    .map((line) => {
                      const [title, description] = line.split(': ');
                      return { title, description };
                    })
                    .filter((t) => t.title && t.description),
                )
              }
              rows={8}
              placeholder="e.g., Digital Divide: Unequal access to technology and resources"
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
            />
          </CardContent>
        </Card>

        {/* Reflection */}
        <Card className="mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-teal-700 dark:text-teal-400">
              Reflection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Label htmlFor="reflection" className="block text-md font-medium mb-2">
              What did you learn from defining the problem?
            </Label>
            <Textarea
              id="reflection"
              value={reflection}
              onChange={(e) => setReflection(e.target.value)}
              rows={8}
              placeholder="Reflect on your problem definition process..."
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-teal-500"
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
              'Analyze & Proceed to Ideate'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Define;