import React, { useState, useEffect, useRef } from 'react';
import { useThinkQuestStore } from '../../store/useThinkQuestStore';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProblemDetailsOverlay from '../../components/ProblemDetailsOverlay';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../components/ui/select';
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
import { PersonaInterview } from '../../components/PersonaInterview';

// Define types for insights
interface Insight {
  persona: string;
  activity: string;
  because: string;
  but: string;
}

interface Theme {
  title: string;
  description: string;
}

const Empathize: React.FC = () => {
  const {
    selectedProblem,
    addEmpathyMapInput,
    addReflection,
    addInsights,
    addThemes,
    empathyMapInput: storedEmpathyMapInput,
    reflection: storedReflection,
    insights: storedInsights,
    themes: storedThemes,
  } = useThinkQuestStore();
  const navigate = useNavigate();


  const [empathyMapInput, setEmpathyMapInput] = useState(storedEmpathyMapInput || '');
  const [reflection, setReflection] = useState(storedReflection || '');
  const [insights, setInsights] = useState<Insight[]>(storedInsights || []);
  const [themes, setThemes] = useState<Theme[]>(storedThemes || []);

  const [currentInsight, setCurrentInsight] = useState<Insight>({
    persona: '',
    activity: '',
    because: '',
    but: '',
  });
  const [currentTheme, setCurrentTheme] = useState<Theme>({ title: '', description: '' });

  const [isLoading, setIsLoading] = useState(false);
  const [problemDetailsOpen, setProblemDetailsOpen] = useState(false);

  const insightsEndRef = useRef<HTMLDivElement>(null);
  const themesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    insightsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [insights]);

  useEffect(() => {
    themesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [themes]);

  if (!selectedProblem) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-gray-100 dark:bg-gray-900">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">No Problem Selected</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-gray-700 dark:text-gray-300">
              Please go back to the map to select a problem to work on.
            </p>
            <Button onClick={() => navigate('/map')} className="mt-4">
              Go to Map
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const addInsight = () => {
    if (
      currentInsight.persona &&
      currentInsight.activity &&
      currentInsight.because &&
      currentInsight.but
    ) {
      setInsights([...insights, currentInsight]);
      setCurrentInsight({ persona: '', activity: '', because: '', but: '' });
      toast({
        title: 'Insight Added',
        description: 'Your insight has been added to the list.',
      });
    } else {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all insight fields.',
        variant: 'destructive',
      });
    }
  };

  const removeInsight = (index: number) => {
    setInsights(insights.filter((_, i) => i !== index));
    toast({
      title: 'Insight Removed',
      description: 'Your insight has been removed.',
      variant: 'destructive',
    });
  };

  const addTheme = () => {
    if (currentTheme.title && currentTheme.description) {
      setThemes([...themes, currentTheme]);
      setCurrentTheme({ title: '', description: '' });
      toast({
        title: 'Theme Added',
        description: 'Your theme has been added to the list.',
      });
    } else {
      toast({
        title: 'Missing Fields',
        description: 'Please fill in all theme fields.',
        variant: 'destructive',
      });
    }
  };

  const removeTheme = (index: number) => {
    setThemes(themes.filter((_, i) => i !== index));
    toast({
      title: 'Theme Removed',
      description: 'Your theme has been removed.',
      variant: 'destructive',
    });
  };

  const handleAnalyze = async () => {
    // Temporarily disabled for debugging and development
    addEmpathyMapInput(empathyMapInput);
    addReflection(reflection);
    addInsights(insights);
    addThemes(themes);

    const dummyScoreResult = {
      score: 100,
      feedback: 'AI analysis bypassed for development.',
    };

    navigate('/stages/define', { state: { scoreResult: dummyScoreResult } });
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-purple-100 to-indigo-200 dark:from-gray-800 dark:to-gray-950 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => navigate('/map')} variant="outline" className="flex items-center">
            ← Back to Map
          </Button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-800 dark:text-indigo-300 text-center">
            Empathize Stage
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

        <PersonaInterview />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Empathy Map Input */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                Empathy Map Input
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="empathy-map-input" className="block text-md font-medium mb-2">
                What did you hear, see, think, and feel from your user research?
              </Label>
              <Textarea
                id="empathy-map-input"
                value={empathyMapInput}
                onChange={(e) => setEmpathyMapInput(e.target.value)}
                rows={8}
                placeholder="Summarize your empathy map findings here..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
              />
            </CardContent>
          </Card>

          {/* Reflection */}
          <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                Reflection
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Label htmlFor="reflection" className="block text-md font-medium mb-2">
                What new understanding or perspective did you gain?
              </Label>
              <Textarea
                id="reflection"
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                rows={8}
                placeholder="Reflect on your discoveries and learnings..."
                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-indigo-500"
              />
            </CardContent>
          </Card>
        </div>

        {/* Insights Section */}
        <Card className="mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
              User Insights (Persona + Activity + Because + But)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div>
                <Label htmlFor="persona" className="block text-sm font-medium mb-1">
                  Persona
                </Label>
                <Textarea
                  id="persona"
                  value={currentInsight.persona}
                  onChange={(e) =>
                    setCurrentInsight({ ...currentInsight, persona: e.target.value })
                  }
                  placeholder="e.g., A rural student"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="activity" className="block text-sm font-medium mb-1">
                  Activity
                </Label>
                <Textarea
                  id="activity"
                  value={currentInsight.activity}
                  onChange={(e) =>
                    setCurrentInsight({ ...currentInsight, activity: e.target.value })
                  }
                  placeholder="e.g., studies at night"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="because" className="block text-sm font-medium mb-1">
                  Because
                </Label>
                <Textarea
                  id="because"
                  value={currentInsight.because}
                  onChange={(e) =>
                    setCurrentInsight({ ...currentInsight, because: e.target.value })
                  }
                  placeholder="e.g., exams require homework completion"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="but" className="block text-sm font-medium mb-1">
                  But
                </Label>
                <Textarea
                  id="but"
                  value={currentInsight.but}
                  onChange={(e) => setCurrentInsight({ ...currentInsight, but: e.target.value })}
                  placeholder="e.g., load shedding removes light"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <Button onClick={addInsight} className="w-full md:w-auto">
              Add Insight
            </Button>

            <Separator className="my-6" />

            <div className="space-y-4">
              {insights.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center">No insights added yet.</p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {insights.map((insight, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger>
                        Insight {index + 1}: {insight.persona} - {insight.activity}
                      </AccordionTrigger>
                      <AccordionContent>
                        <Card className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                          <p>
                            <strong className="font-semibold">Persona:</strong> {insight.persona}
                          </p>
                          <p>
                            <strong className="font-semibold">Activity:</strong> {insight.activity}
                          </p>
                          <p>
                            <strong className="font-semibold">Because:</strong> {insight.because}
                          </p>
                          <p>
                            <strong className="font-semibold">But:</strong> {insight.but}
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeInsight(index)}
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
              <div ref={insightsEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Themes Section */}
        <Card className="mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
              Identified Themes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <Label htmlFor="theme-title" className="block text-sm font-medium mb-1">
                  Theme Title
                </Label>
                <Textarea
                  id="theme-title"
                  value={currentTheme.title}
                  onChange={(e) => setCurrentTheme({ ...currentTheme, title: e.target.value })}
                  placeholder="e.g., Digital Divide"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <Label htmlFor="theme-description" className="block text-sm font-medium mb-1">
                  Description
                </Label>
                <Textarea
                  id="theme-description"
                  value={currentTheme.description}
                  onChange={(e) =>
                    setCurrentTheme({ ...currentTheme, description: e.target.value })
                  }
                  placeholder="e.g., Unequal access to technology and resources"
                  className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
            <Button onClick={addTheme} className="w-full md:w-auto">
              Add Theme
            </Button>

            <Separator className="my-6" />

            <div className="space-y-4">
              {themes.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center">No themes added yet.</p>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  {themes.map((theme, index) => (
                    <AccordionItem key={index} value={`theme-item-${index}`}>
                      <AccordionTrigger>
                        Theme {index + 1}: {theme.title}
                      </AccordionTrigger>
                      <AccordionContent>
                        <Card className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg shadow-sm">
                          <p>
                            <strong className="font-semibold">Title:</strong> {theme.title}
                          </p>
                          <p>
                            <strong className="font-semibold">Description:</strong> {theme.description}
                          </p>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeTheme(index)}
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
              <div ref={themesEndRef} />
            </div>
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
              'Analyze & Proceed to Define'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Empathize;
