import React, { useState, useEffect } from 'react';
import { useThinkQuestStore } from '../../store/useThinkQuestStore';
import { useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { ProblemDetailsOverlay } from '../../components/ProblemDetailsOverlay';
import { Button } from '../../components/ui/button';
import { Textarea } from '../../components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Label } from '../../components/ui/label';
import { useToast } from '../../hooks/use-toast';
import { Separator } from '../../components/ui/separator';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../../components/ui/accordion';

// Define types for Idea
interface Idea {
  idea: string;
  rationale: string;
}

const Prototype: React.FC = () => {
  const {
    currentProblem,
    selectedProblem: storedSelectedProblem,
    selectedTop3Ideas: storedSelectedTop3Ideas,
    rationaleMap: storedRationaleMap,
    addPrototypeData,
    posterNotes: storedPosterNotes,
    timelineNotes: storedTimelineNotes,
  } = useThinkQuestStore();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [selectedProblem] = useState(storedSelectedProblem || '');
  const [selectedTop3Ideas] = useState<string[]>(storedSelectedTop3Ideas || []);
  const [rationaleMap] = useState<{ [key: string]: string }>(storedRationaleMap || {});
  const [posterNotes, setPosterNotes] = useState<{ [key: string]: string[] }>(
    storedPosterNotes || {
      'What is it?': [],
      'How does it work?': [],
      'What problem does it solve?': [],
      'Who is it for?': [],
    },
  );
  const [timelineNotes, setTimelineNotes] = useState<{ [key: string]: string[] }>(
    storedTimelineNotes || {
      'Week 1': [],
      'Week 2': [],
      'Week 3': [],
      'Week 4': [],
    },
  );
  const [newPosterNote, setNewPosterNote] = useState<{ key: string; value: string }>({
    key: 'What is it?',
    value: '',
  });
  const [newTimelineNote, setNewTimelineNote] = useState<{ key: string; value: string }>({
    key: 'Week 1',
    value: '',
  });

  const [uploads, setUploads] = useState<
    Array<{ name: string; base64: string; type: string }>
  >([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [problemDetailsOpen, setProblemDetailsOpen] = useState(false);

  useEffect(() => {
    if (!currentProblem || selectedTop3Ideas.length === 0) {
      toast({
        title: 'Missing Information',
        description: 'Please complete previous stages and select top ideas.',
        variant: 'destructive',
      });
      navigate('/map');
    }
  }, [currentProblem, selectedTop3Ideas.length, navigate, toast]);

  if (!currentProblem || selectedTop3Ideas.length === 0) {
    return null; // Or a loading spinner
  }

  const handleAddPosterNote = () => {
    if (newPosterNote.value.trim() && newPosterNote.key) {
      setPosterNotes((prev) => ({
        ...prev,
        [newPosterNote.key]: [...(prev[newPosterNote.key] || []), newPosterNote.value.trim()],
      }));
      setNewPosterNote({ ...newPosterNote, value: '' });
    }
  };

  const handleRemovePosterNote = (key: string, index: number) => {
    setPosterNotes((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleAddTimelineNote = () => {
    if (newTimelineNote.value.trim() && newTimelineNote.key) {
      setTimelineNotes((prev) => ({
        ...prev,
        [newTimelineNote.key]: [...(prev[newTimelineNote.key] || []), newTimelineNote.value.trim()],
      }));
      setNewTimelineNote({ ...newTimelineNote, value: '' });
    }
  };

  const handleRemoveTimelineNote = (key: string, index: number) => {
    setTimelineNotes((prev) => ({
      ...prev,
      [key]: prev[key].filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      Array.from(files).forEach((file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            setUploads((prev) => [
              ...prev,
              {
                name: file.name,
                base64: e.target?.result as string,
                type: file.type,
              },
            ]);
            toast({
              title: 'File Uploaded',
              description: `${file.name} has been added.`,
            });
          }
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const handleRemoveUpload = (index: number) => {
    setUploads((prev) => prev.filter((_, i) => i !== index));
    toast({
      title: 'Upload Removed',
      description: 'The selected file has been removed.',
      variant: 'destructive',
    });
  };

  const handleAnalyze = async () => {
    // Basic validation
    if (
      Object.values(posterNotes).every((arr) => arr.length === 0) &&
      Object.values(timelineNotes).every((arr) => arr.length === 0) &&
      uploads.length === 0
    ) {
      toast({
        title: 'Missing Prototype Details',
        description: 'Please provide some details for your prototype before analyzing.',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const allPosterNotes = Object.entries(posterNotes)
        .map(([key, notes]) => `${key}:\n${notes.map((note) => `- ${note}`).join('\n')}`)
        .join('\n\n');
      const allTimelineNotes = Object.entries(timelineNotes)
        .map(([key, notes]) => `${key}:\n${notes.map((note) => `- ${note}`).join('\n')}`)
        .join('\n\n');

      const prompt = `Selected Idea: ${selectedTop3Ideas.join(', ')}\n\nConcept Poster:\n${allPosterNotes}\n\nTimeline/Roadmap:\n${allTimelineNotes}`;

      const response = await fetch(`/api/gemini-score-prototype`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          selectedIdea: selectedTop3Ideas[0], // Assuming only one selected for score prompt
          poster: allPosterNotes,
          timeline: allTimelineNotes,
          uploads: uploads,
          prompt: prompt, // Sending consolidated prompt
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get score from AI...');
      }

      const result = await response.json();
      console.log('Prototype stage AI score result:', result);

      addPrototypeData({ posterNotes, timelineNotes });

      navigate('/stages/test', { state: { scoreResult: result } });
    } catch (error) {
      console.error('Error analyzing prototype with Gemini API:', error);
      toast({
        title: 'Analysis Failed',
        description: (error as Error).message || 'Failed to analyze prototype with AI.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-100 to-indigo-200 dark:from-gray-800 dark:to-gray-950 text-gray-800 dark:text-gray-200 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex justify-between items-center mb-6">
          <Button onClick={() => navigate('/stages/ideate')} variant="outline" className="flex items-center">
            ← Back to Ideate
          </Button>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-indigo-800 dark:text-indigo-300 text-center">
            Prototype Stage
          </h1>
          <Button onClick={() => setProblemDetailsOpen(true)} variant="outline">
            Problem Details
          </Button>
        </div>

        <ProblemDetailsOverlay
          isOpen={problemDetailsOpen}
          onClose={() => setProblemDetailsOpen(false)}
          problem={currentProblem}
        />

        {/* Selected Idea Display */}
        {selectedTop3Ideas.length > 0 && (
          <Card className="mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
            <CardHeader>
              <CardTitle className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
                Selected Idea for Prototyping
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedTop3Ideas.map((idea, index) => (
                <div key={index} className="mb-4 p-4 border rounded-lg bg-gray-50 dark:bg-gray-700">
                  <p className="font-semibold text-lg text-gray-900 dark:text-gray-100">{idea}</p>
                  <p className="text-gray-700 dark:text-gray-300 mt-2">
                    <strong className="font-medium">Rationale:</strong> {rationaleMap[idea] || 'No rationale provided.'}
                  </p>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Concept Poster Section */}
        <Card className="bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
              Concept Poster
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select
                value={newPosterNote.key}
                onValueChange={(value) => setNewPosterNote({ ...newPosterNote, key: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(posterNotes).map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex space-x-2">
                <Textarea
                  value={newPosterNote.value}
                  onChange={(e) => setNewPosterNote({ ...newPosterNote, value: e.target.value })}
                  placeholder="Add a note for this section..."
                  className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Button onClick={handleAddPosterNote}>Add Note</Button>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="space-y-4">
              {Object.entries(posterNotes).map(([key, notes], sectionIndex) => (
                <div key={key}>
                  <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-300 mb-2">
                    {key}
                  </h3>
                  {notes.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No notes for this section.</p>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1">
                      {notes.map((note, noteIndex) => (
                        <li key={noteIndex} className="flex justify-between items-center text-gray-800 dark:text-gray-200">
                          {note}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemovePosterNote(key, noteIndex)}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Timeline/Roadmap Section */}
        <Card className="mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
              Prototype Timeline / Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <Select
                value={newTimelineNote.key}
                onValueChange={(value) => setNewTimelineNote({ ...newTimelineNote, key: value })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select Week" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(timelineNotes).map((key) => (
                    <SelectItem key={key} value={key}>
                      {key}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="flex space-x-2">
                <Textarea
                  value={newTimelineNote.value}
                  onChange={(e) => setNewTimelineNote({ ...newTimelineNote, value: e.target.value })}
                  placeholder="Add a task for this week..."
                  className="flex-grow p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                />
                <Button onClick={handleAddTimelineNote}>Add Task</Button>
              </div>
            </div>
            <Separator className="my-6" />
            <div className="space-y-4">
              {Object.entries(timelineNotes).map(([key, notes], sectionIndex) => (
                <div key={key}>
                  <h3 className="font-bold text-lg text-indigo-600 dark:text-indigo-300 mb-2">
                    {key}
                  </h3>
                  {notes.length === 0 ? (
                    <p className="text-gray-600 dark:text-gray-400">No tasks for this week.</p>
                  ) : (
                    <ul className="list-disc pl-5 space-y-1">
                      {notes.map((note, noteIndex) => (
                        <li key={noteIndex} className="flex justify-between items-center text-gray-800 dark:text-gray-200">
                          {note}
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleRemoveTimelineNote(key, noteIndex)}
                          >
                            Remove
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* File Upload Section */}
        <Card className="mt-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
              Upload Visuals / Wireframes / Mockups
            </CardTitle>
          </CardHeader>
          <CardContent>
            <input type="file" ref={fileInputRef} onChange={handleFileUpload} multiple className="mb-4" />
            <div className="space-y-2">
              {uploads.length === 0 ? (
                <p className="text-gray-600 dark:text-gray-400 text-center">No files uploaded yet.</p>
              ) : (
                <ul className="space-y-2">
                  {uploads.map((file, index) => (
                    <li key={index} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700 p-3 rounded-lg shadow-sm">
                      <span className="text-gray-900 dark:text-gray-100">{file.name}</span>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRemoveUpload(index)}
                      >
                        Remove
                      </Button>
                    </li>
                  ))}
                </ul>
              )}
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
              'Analyze & Proceed to Test'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Prototype;