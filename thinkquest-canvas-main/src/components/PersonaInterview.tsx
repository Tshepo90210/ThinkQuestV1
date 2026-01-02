import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useThinkQuestStore, Persona } from '../store/useThinkQuestStore';
import { personasByProblem } from '../data/mockData';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Textarea } from './ui/textarea';
import { Mic, Send, Volume2, VolumeX, Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useSpeech } from '../hooks/useSpeech';

export const PersonaInterview: React.FC = () => {
  const { selectedProblem } = useThinkQuestStore();
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [interviewLog, setInterviewLog] = useState<{ user: string; persona: string }[]>([]);
  const [userInput, setUserInput] = useState('');
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const handleTranscript = useCallback((transcript: string) => {
    setUserInput(prev => prev + transcript);
  }, []);

  const { isRecording, startRecording, stopRecording, speak } = useSpeech(handleTranscript);

  const interviewLogEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    interviewLogEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [interviewLog]);

  if (!selectedProblem) {
    return null; // Don't render if no problem is selected
  }

  const personas = personasByProblem[selectedProblem.id] || [];

  const handlePersonaSelect = (personaId: string) => {
    const persona = personas.find((p) => p.id.toString() === personaId);
    setSelectedPersona(persona || null);
    setInterviewLog([]);
  };

  const handleSendMessage = async () => {
    if (!userInput.trim() || !selectedPersona) return;

    const newInterviewLog = [...interviewLog, { user: userInput, persona: '...' }];
    setInterviewLog(newInterviewLog);
    const message = userInput;
    setUserInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/gemini-interview', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          persona: {
            name: selectedPersona.name,
            role: selectedPersona.role,
            backstory: selectedPersona.backstory,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI');
      }

      const data = await response.json();
      const aiResponse = data.response;

      setInterviewLog([...newInterviewLog.slice(0, -1), { user: message, persona: aiResponse }]);
      if (isTtsEnabled) {
        speak(aiResponse);
      }

    } catch (error) {
      console.error('Error interviewing persona:', error);
      const errorMessage = 'Sorry, I am having trouble responding right now.';
      setInterviewLog([...newInterviewLog.slice(0, -1), { user: message, persona: errorMessage }]);
      if (isTtsEnabled) {
        speak(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleMicToggle = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  const handleTtsToggle = () => {
    setIsTtsEnabled(!isTtsEnabled);
  };

  return (
    <Card className="mb-8 bg-white dark:bg-gray-800 shadow-lg rounded-xl">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-indigo-700 dark:text-indigo-400">
          AI Persona Interview
        </CardTitle>
      </CardHeader>
      <CardContent>
        {!selectedPersona ? (
          <div>
            <p className="mb-4 text-gray-700 dark:text-gray-300">
              Select a persona to start the interview.
            </p>
            <Select onValueChange={handlePersonaSelect}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose a persona..." />
              </SelectTrigger>
              <SelectContent>
                {personas.map((persona) => (
                  <SelectItem key={persona.id} value={persona.id.toString()}>
                    <div className="flex items-center gap-4">
                      <Avatar>
                        <AvatarImage src={persona.avatar} alt={persona.name} />
                        <AvatarFallback>{persona.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-semibold">{persona.name}</p>
                        <p className="text-sm text-gray-500">{persona.role}</p>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <Avatar className="w-16 h-16">
                  <AvatarImage src={selectedPersona.avatar} alt={selectedPersona.name} />
                  <AvatarFallback>{selectedPersona.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedPersona.name}</h3>
                  <p className="text-sm text-gray-500">{selectedPersona.role}</p>
                </div>
              </div>
              <Button variant="outline" onClick={() => setSelectedPersona(null)}>
                Change Persona
              </Button>
            </div>
            <p className="mb-4 text-sm text-gray-600 dark:text-gray-400 italic">
              {selectedPersona.backstory}
            </p>
            
            <div className="h-64 overflow-y-auto p-4 border rounded-lg mb-4 bg-gray-50 dark:bg-gray-700">
              {interviewLog.map((entry, index) => (
                <div key={index} className="mb-4">
                  <p className="font-semibold text-blue-600 dark:text-blue-400">You:</p>
                  <p className="mb-2 whitespace-pre-wrap">{entry.user}</p>
                  <p className="font-semibold text-green-600 dark:text-green-400">{selectedPersona.name}:</p>
                  <p className="whitespace-pre-wrap">{entry.persona}</p>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-gray-500" />
                  <p className="text-gray-500">Thinking...</p>
                </div>
              )}
              <div ref={interviewLogEndRef} />
            </div>

            <div className="flex items-center gap-2">
              <Textarea
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your question or use the microphone..."
                className="flex-grow"
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                disabled={isLoading}
              />
              <Button onClick={handleSendMessage} size="icon" disabled={isLoading}>
                <Send className="w-4 h-4" />
              </Button>
              <Button onClick={handleMicToggle} size="icon" variant={isRecording ? 'destructive' : 'outline'} disabled={isLoading}>
                <Mic className="w-4 h-4" />
              </Button>
              <Button onClick={handleTtsToggle} size="icon" variant="outline" disabled={isLoading}>
                {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
