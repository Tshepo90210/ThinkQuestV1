import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { Header } from '@/components/Header';
import StageHintModal from '@/components/StageHintModal';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';
import { personasByProblem } from '@/data/mockData';
import { ArrowLeft, HelpCircle, Send, PlusCircle, Mic, Keyboard, Leaf } from 'lucide-react';
import { toast } from 'sonner';
import stressedFemale from '@/assets/stressed female.png';
import stressedMale from '@/assets/stressed male.png';

import { Streamdown } from 'streamdown';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { nanoid } from 'nanoid';

enum ItemTypes {
  CARD = 'card',
}

interface PostIt {
  id: string;
  text: string;
  column: 'post-its' | 'themes' | 'insights';
  themeName?: string;
  persona?: string;
  activity?: string;
  because?: string;
  but?: string;
}

interface Insight {
  id: string;
  persona: string;
  activity: string;
  because: string;
  but: string;
}

interface PostItCardProps {
  postIt: PostIt;
  index: number;
  moveCard: (id: string, toColumn: 'post-its' | 'themes' | 'insights', newIndex: number) => void;
  editCard: (id: string, newText: string) => void;
  deleteCard: (id: string) => void;
  setThemeName: (id: string, name: string) => void;
  editInsight: (id: string, field: keyof Omit<Insight, 'id'>, value: string) => void;
}

interface ColumnProps {
  title: string;
  columnType: 'post-its' | 'themes' | 'insights';
  postIts: PostIt[];
  moveCard: (id: string, toColumn: 'post-its' | 'themes' | 'insights', newIndex: number) => void;
  editCard: (id: string, newText: string) => void;
  deleteCard: (id: string) => void;
  setThemeName: (id: string, name: string) => void;
  addCard: (column: 'post-its' | 'themes' | 'insights') => void;
  editInsight: (id: string, field: keyof Omit<Insight, 'id'>, value: string) => void;
}

const PostItCard = ({ postIt, index, moveCard, editCard, deleteCard, setThemeName, editInsight }: PostItCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [cardText, setCardText] = useState(postIt.text);
  const [themeName, setThemeNameState] = useState(postIt.themeName || '');
  const [insightFields, setInsightFields] = useState({
    persona: postIt.persona || '',
    activity: postIt.activity || '',
    because: postIt.because || '',
    but: postIt.but || '',
  });

  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.CARD,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { id: string; index: number; column: 'post-its' | 'themes' | 'insights' }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;
      const dragColumn = item.column;
      const hoverColumn = postIt.column;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex && dragColumn === hoverColumn) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%

      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
        return;
      }

      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
        return;
      }

      // Time to actually perform the action
      moveCard(item.id, hoverColumn, hoverIndex);

      // Note: we're mutating the item here!
      // Generally it's better to avoid mutations in render functions,
      // but it's good here for the sake of performance to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.CARD,
    item: () => {
      return { id: postIt.id, index, column: postIt.column };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  drag(drop(ref));

  const handleDoubleClick = () => {
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
    editCard(postIt.id, cardText);
  };

  const handleThemeNameBlur = () => {
    setThemeName(postIt.id, themeName);
  };

  const handleInsightFieldChange = (field: keyof Omit<Insight, 'id'>, value: string) => {
    setInsightFields((prev) => ({
      ...prev,
      [field]: value,
    }));
    editInsight(postIt.id, field, value);
  };

  const handleDelete = () => {
    deleteCard(postIt.id);
  };

  const opacity = isDragging ? 0 : 1;

  return (
    <motion.div
      ref={ref}
      style={{ opacity }}
      className="relative bg-yellow-100 dark:bg-yellow-700 rounded-md p-3 shadow-md cursor-grab mb-2"
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.95, opacity: 0 }}
      whileHover={{ scale: 1.02 }}
      layout
    >
      {postIt.column === 'insights' ? (
        <div className="space-y-2">
          <input
            type="text"
            placeholder="[Persona, character, role]"
            value={insightFields.persona}
            onChange={(e) => handleInsightFieldChange('persona', e.target.value)}
            className="w-full bg-yellow-200 dark:bg-yellow-800 border-b border-yellow-400 dark:border-yellow-600 text-sm text-gray-800 dark:text-gray-100 focus:outline-none"
          />
          <input
            type="text"
            placeholder="[activity, action, situation]"
            value={insightFields.activity}
            onChange={(e) => handleInsightFieldChange('activity', e.target.value)}
            className="w-full bg-yellow-200 dark:bg-yellow-800 border-b border-yellow-400 dark:border-yellow-600 text-sm text-gray-800 dark:text-gray-100 focus:outline-none"
          />
          <input
            type="text"
            placeholder="because [aim, need, outcome]"
            value={insightFields.because}
            onChange={(e) => handleInsightFieldChange('because', e.target.value)}
            className="w-full bg-yellow-200 dark:bg-yellow-800 border-b border-yellow-400 dark:border-yellow-600 text-sm text-gray-800 dark:text-gray-100 focus:outline-none"
          />
          <input
            type="text"
            placeholder="but [restriction, obstacle, friction]"
            value={insightFields.but}
            onChange={(e) => handleInsightFieldChange('but', e.target.value)}
            className="w-full bg-yellow-200 dark:bg-yellow-800 border-b border-yellow-400 dark:border-yellow-600 text-sm text-gray-800 dark:text-gray-100 focus:outline-none"
          />
        </div>
      ) : isEditing ? (
        <Textarea
          value={cardText}
          onChange={(e) => setCardText(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleBlur();
            }
          }}
          autoFocus
          className="w-full h-auto min-h-[60px] bg-yellow-200 dark:bg-yellow-800 border-none focus-visible:ring-0"
        />
      ) : (
        <p onDoubleClick={handleDoubleClick} className="text-sm text-gray-800 dark:text-gray-100 whitespace-pre-wrap">
          {postIt.text}
        </p>
      )}
      {postIt.column === 'themes' && (
        <input
          type="text"
          placeholder="Theme Name"
          value={themeName}
          onChange={(e) => setThemeNameState(e.target.value)}
          onBlur={handleThemeNameBlur}
          className="mt-2 w-full bg-yellow-200 dark:bg-yellow-800 border-b border-yellow-400 dark:border-yellow-600 text-sm text-gray-800 dark:text-gray-100 focus:outline-none"
        />
      )}
      <Button
        variant="ghost"
        size="sm"
        onClick={handleDelete}
        className="absolute top-1 right-1 h-6 w-6 p-0 text-gray-500 hover:text-red-500"
      >
        x
      </Button>
    </motion.div>
  );
};

const Column = ({ title, columnType, postIts, moveCard, editCard, deleteCard, setThemeName, addCard, editInsight }: ColumnProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const [, drop] = useDrop({
    accept: ItemTypes.CARD,
    drop: (item: { id: string; index: number; column: 'post-its' | 'themes' | 'insights' }) => {
      if (item.column !== columnType) {
        moveCard(item.id, columnType, postIts.length); // Move to end of new column
        item.column = columnType;
      }
    },
  });

  drop(ref);

  return (
    <div ref={ref} className="flex-1 bg-green-100/50 dark:bg-green-900/50 rounded-lg p-4 shadow-inner min-h-[300px]">
      <h3 className="text-lg font-bold mb-4 text-green-800 dark:text-green-200 flex items-center justify-between">
        {title}
        <Button variant="ghost" size="icon" onClick={() => addCard(columnType)}>
          <PlusCircle className="h-4 w-4" />
        </Button>
      </h3>
      <AnimatePresence>
        {postIts.map((postIt, index) => (
          <PostItCard
            key={postIt.id}
            index={index}
            postIt={postIt}
            moveCard={moveCard}
            editCard={editCard}
            deleteCard={deleteCard}
            setThemeName={setThemeName}
            editInsight={editInsight}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const Empathize = () => {
  const navigate = useNavigate();
  const { selectedProblem, updateStageData, unlockStage, addTokens, addStars, stageData, appendAiResponseToInterview } = useThinkQuestStore();
  const [currentPersona, setCurrentPersona] = useState<number | null>(null);
  const [chatInput, setChatInput] = useState('');
  const [empathyMapInput, setEmpathyMapInput] = useState('');
  const [reflection, setReflection] = useState('');
  const [showConfetti, setShowConfetti] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [analysisResults, setAnalysisResults] = useState({
    score: 0,
    strengths: '',
    improvements: '',
    suggestions: [],
    overallComment: '',
    errorMessage: '',
  });
  const [showHelpDialog, setShowHelpDialog] = useState(false);
  const [showHintModal, setShowHintModal] = useState(false);
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);

  const [postIts, setPostIts] = useState<PostIt[]>(
    stageData.empathy.kanbanBoard?.postIts || [
      { id: nanoid(), text: 'User struggles with long queues', column: 'post-its' },
      { id: nanoid(), text: 'Wants faster service', column: 'post-its' },
      { id: nanoid(), text: 'Complains about limited food options', column: 'post-its' },
    ]
  );

  const moveCard = useCallback(
    (id: string, toColumn: 'post-its' | 'themes' | 'insights', newIndex: number) => {
      setPostIts((prevPostIts) => {
        const card = prevPostIts.find((p) => p.id === id);
        if (!card) return prevPostIts;

        const updatedPostIts = prevPostIts.filter((p) => p.id !== id);
        const cardsInTargetColumn = updatedPostIts.filter((p) => p.column === toColumn);

        const newCard = { ...card, column: toColumn };
        cardsInTargetColumn.splice(newIndex, 0, newCard);

        return [...updatedPostIts.filter((p) => p.column !== toColumn), ...cardsInTargetColumn];
      });
    },
    []
  );

  const editCard = useCallback((id: string, newText: string) => {
    setPostIts((prevPostIts) =>
      prevPostIts.map((postIt) =>
        postIt.id === id ? { ...postIt, text: newText } : postIt
      )
    );
  }, []);

  const deleteCard = useCallback((id: string) => {
    setPostIts((prevPostIts) => prevPostIts.filter((postIt) => postIt.id !== id));
  }, []);

  const setThemeName = useCallback((id: string, name: string) => {
    setPostIts((prevPostIts) =>
      prevPostIts.map((postIt) =>
        postIt.id === id ? { ...postIt, themeName: name } : postIt
      )
    );
  }, []);

  const editInsight = useCallback((id: string, field: keyof Omit<Insight, 'id'>, value: string) => {
    setPostIts((prevPostIts) =>
      prevPostIts.map((postIt) =>
        postIt.id === id ? { ...postIt, [field]: value } : postIt
      )
    );
  }, []);

  const addCard = useCallback((column: 'post-its' | 'themes' | 'insights') => {
    setPostIts((prevPostIts) => {
      const newCard: PostIt = {
        id: nanoid(),
        text: 'New Note',
        column,
      };
      if (column === 'themes') {
        newCard.themeName = 'New Theme';
      } else if (column === 'insights') {
        newCard.persona = '';
        newCard.activity = '';
        newCard.because = '';
        newCard.but = '';
      }
      return [...prevPostIts, newCard];
    });
  }, []);

  useEffect(() => {
    updateStageData('empathy', { kanbanBoard: { postIts } });
  }, [postIts, updateStageData]);

  useEffect(() => {
    // Initialize SpeechRecognition
    if ('webkitSpeechRecognition' in window) {
              const SpeechRecognition = window.webkitSpeechRecognition;      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US'; // Default language

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = event.results[0][0].transcript;
        setChatInput(transcript);
        setIsRecording(false);
        recognition.stop();
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error('Speech recognition error:', event.error);
        toast.error(`Speech recognition error: ${event.error}`);
        setIsRecording(false);
        recognition.stop();
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    } else {
      console.warn('Web Speech API not supported in this browser.');
      toast.warning('Voice chat not supported in your browser.');
      setIsVoiceMode(false); // Fallback to text mode if not supported
    }

    // Load voices for SpeechSynthesis
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        // Prioritize en-ZA, then en-GB, then any English voice
        let voice = voices.find(v => v.lang === 'en-ZA');
        if (!voice) voice = voices.find(v => v.lang === 'en-GB' && v.name.includes('Google'));
        if (!voice) voice = voices.find(v => v.lang.startsWith('en'));
        setSelectedVoice(voice || null);
      } else {
        window.speechSynthesis.onvoiceschanged = () => {
          const updatedVoices = window.speechSynthesis.getVoices();
          let voice = updatedVoices.find(v => v.lang === 'en-ZA');
          if (!voice) voice = updatedVoices.find(v => v.lang === 'en-GB' && v.name.includes('Google'));
          if (!voice) voice = updatedVoices.find(v => v.lang.startsWith('en'));
          setSelectedVoice(voice || null);
        };
      }
    };

    loadVoices();

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      if (utteranceRef.current) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  if (!selectedProblem) {
    navigate('/map');
    return null;
  }

  const personas = personasByProblem[selectedProblem.id] || [];
  const interviewedCount = Object.keys(stageData.empathy.interviews).length;
  const totalTasks = personas.length + 1; // +1 for Kanban board
  const completedTasks = interviewedCount + (postIts.filter(p => p.column === 'insights' && p.persona && p.activity && p.because && p.but).length > 0 ? 1 : 0);
  const progress = (completedTasks / totalTasks) * 100;

  const getAvatarImage = (avatarPath: string) => {
    switch (avatarPath) {
      case '@/assets/stressed female.png':
        return stressedFemale;
      case '@/assets/stressed male.png':
        return stressedMale;
      default:
        return ''; // Fallback or default image
    }
  };

  const startRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(true);
      setChatInput(''); // Clear previous input
      recognitionRef.current.start();
    } else {
      toast.error('Speech recognition not available.');
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      setIsRecording(false);
      recognitionRef.current.stop();
    }
  };

  const toggleVoiceMode = () => {
    setIsVoiceMode(prev => !prev);
    if (isRecording) {
      stopRecording();
    }
  };

  const handleInterview = (personaId: number) => {
    setCurrentPersona(personaId);
  };

  const handleSendMessage = async () => {
    console.log('handleSendMessage called');
    console.log('chatInput:', chatInput);
    console.log('currentPersona:', currentPersona);

    if (!chatInput.trim() || currentPersona === null) {
      console.log('handleSendMessage returning early: chatInput empty or currentPersona null');
      return;
    }

    const persona = personas.find(p => p.id === currentPersona);
    if (!persona) {
      console.log('handleSendMessage returning early: persona not found');
      return;
    }

    const userQuestion = `Q: ${chatInput}`;
    const currentInterviews = stageData.empathy.interviews[currentPersona] || [];
    const updatedPersonaInterviews = [...currentInterviews, userQuestion];
    updateStageData('empathy', {
      interviews: {
        ...stageData.empathy.interviews,
        [currentPersona]: updatedPersonaInterviews,
      },
    });

    // Add a placeholder for the AI response so appendAiResponseToInterview can update it
    appendAiResponseToInterview(currentPersona, '');

    setChatInput('');

    try {
      console.log('Sending fetch request to /api/gemini-chat');
      const response = await fetch('http://localhost:3001/api/gemini-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: persona.name,
          role: persona.role,
          backstory: persona.backstory,
          question: chatInput,
        }),
      });

      if (!response.ok || !response.body) {
        const errorData = await response.json();
        console.error('Fetch response not OK or body missing:', errorData);
        throw new Error(errorData.error || 'Failed to get AI response');
      }

      console.log('Fetch response received, starting to read stream...');
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let aiResponseContent = '';

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          console.log('Stream finished.');
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        console.log('Received chunk:', chunk);
        aiResponseContent += chunk;

        // Update the last message in the chat history with the streamed content
        appendAiResponseToInterview(currentPersona, aiResponseContent);
      }
      toast.success('Response received!');

      // Text-to-Speech for AI response
      if (isVoiceMode && selectedVoice) {
        const utterance = new SpeechSynthesisUtterance(aiResponseContent.replace(/^A:\s/, ''));
        let voiceToUse = selectedVoice;

        // Assign voice based on persona gender
        const allVoices = window.speechSynthesis.getVoices();
        if (persona.keyTraits.gender === 'male') {
          const maleVoice = allVoices.find(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('zira')));
          if (maleVoice) voiceToUse = maleVoice;
        } else if (persona.keyTraits.gender === 'female' || persona.keyTraits.gender === 'non-binary') {
          const femaleVoice = allVoices.find(v => v.lang.startsWith('en') && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('google uk')));
          if (femaleVoice) voiceToUse = femaleVoice;
        }
        utterance.voice = voiceToUse;
        window.speechSynthesis.speak(utterance);
        utteranceRef.current = utterance;
      }



    } catch (error) {
      console.error('Error sending message to Gemini API:', error);
      toast.error(`Failed to get AI response: ${error.message}`);
      // Revert adding the question if AI response fails or if streaming fails
      updateStageData('empathy', {
        interviews: {
          ...stageData.empathy.interviews,
          [currentPersona]: currentInterviews,
        },
      });
    }
  };

  const handleAnalyze = async () => {
    if (interviewedCount < personas.length) {
      toast.error(`Interview all ${personas.length} personas first!`);
      return;
    }

    const insightsToAnalyze = postIts.filter(p => p.column === 'insights' && p.persona && p.activity && p.because && p.but);
    if (insightsToAnalyze.length === 0) {
      toast.error('Create at least one complete insight on the Kanban board!');
      return;
    }

    if (!empathyMapInput.trim()) {
      toast.error('Fill in the empathy map!');
      return;
    }

    setIsAnalyzing(true);

    try {
      const formattedInsights = insightsToAnalyze.map(p => ({
        persona: p.persona,
        activity: p.activity,
        because: p.because,
        but: p.but,
      }));
      const themes = postIts.filter(p => p.column === 'themes' && p.themeName).map(p => ({ title: p.themeName, description: p.text }));

      console.log('Empathize Stage: formattedInsights being saved:', formattedInsights);
      console.log('Empathize Stage: themes being saved:', themes);

      const response = await fetch('/api/openai-score', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          stage: 'empathy', // Add this line
          empathyMapInput,
          reflection,
          selectedProblem,
          insights: formattedInsights,
          themes,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to get AI score');
      }

      const result = await response.json();
      const score = result.score || 50; // Default to 50 if AI doesn't provide a score
      const strengths = result.strengths || 'N/A';
      const improvements = result.improvements || 'Could not parse detailed feedback.';
      const suggestions = Array.isArray(result.suggestions) ? result.suggestions : ['Ensure your input is clear and concise.'];
      const overallComment = result.overallComment || 'Please try again.';

      updateStageData('empathy', {
        empathyMap: {
          says: [empathyMapInput],
          thinks: [],
          does: [],
          feels: [],
        },
        score,
        reflection,
        strengths,
        improvements,
        suggestions,
        overallComment,
        kanbanBoard: { postIts },
        empathyInsights: formattedInsights, // Save structured insights
        empathyThemes: themes, // Save themes to the store
      });

      setIsAnalyzing(false);
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
        unlockStage(1); // Unlock Define stage
        addTokens(50);
        addStars(1);

        setTimeout(() => {
          setShowConfetti(false);
          navigate('/map');
        }, 300000);
      }
    } catch (error) {
      console.error('Error analyzing empathy map with Gemini API:', error);
      const errorMessage = error.message || 'Failed to analyze empathy map.';
      setIsAnalyzing(false);
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

  return (
    <DndProvider backend={HTML5Backend}>
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
                  <h1 className="text-3xl font-bold">Stage 1: Empathize</h1>
                  <p className="text-muted-foreground">Quest in Empathy Forest</p>
                </div>
              </div>
              <motion.div
                className="relative flex items-center justify-center cursor-pointer"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowHintModal(true)}
              >
                <div className="absolute w-8 h-8 rounded-full bg-green-500 opacity-70" />
                <Leaf className="relative z-10 h-5 w-5 text-white" />
              </motion.div>
            </div>

            {/* Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Tasks: {completedTasks}/{totalTasks}</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Interview Personas */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Interview Personas</h2>
              <div className="flex space-x-4 overflow-x-auto pb-4 hide-scrollbar">
                {personas.map((persona) => (
                  <motion.div
                    key={persona.id}
                    whileHover={{ scale: 1.02 }}
                    className="flex-none w-64 bg-card rounded-xl p-6 shadow-card border border-border"
                  >
                    <div className="flex flex-col items-center text-center space-y-4">
                      <div className="h-32 w-32 rounded-full overflow-hidden bg-muted">
                        <img
                          src={getAvatarImage(persona.avatar)}
                          alt={persona.name}
                          className="h-full w-full object-cover"
                        />
                      </div>
                      <div>
                        <h3 className="font-bold text-lg">{persona.name}</h3>
                        <p className="text-sm text-muted-foreground">{persona.role}</p>
                        {persona.keyTraits?.age && (
                          <p className="text-xs text-muted-foreground">Age: {persona.keyTraits.age}</p>
                        )}
                      </div>
                      <Button
                        onClick={() => handleInterview(persona.id)}
                        variant={stageData.empathy.interviews[persona.id] ? "secondary" : "default"}
                        className="w-full"
                      >
                        {stageData.empathy.interviews[persona.id] ? 'View Interview' : 'Interview'}
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Create Your Insights Kanban Board */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Create Your Insights</h2>
              <p className="text-muted-foreground">
                How to Create Insights: 1. Use the template (e.g., 'Lerato studies by candlelight because she needs light but load shedding restricts it'). 2. Ensure it’s true, surprising, and problem-defining. 3. Edit for clarity.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Column
                  title="Post-Its"
                  columnType="post-its"
                  postIts={postIts.filter((p) => p.column === 'post-its')}
                  moveCard={moveCard}
                  editCard={editCard}
                  deleteCard={deleteCard}
                  setThemeName={setThemeName}
                  addCard={addCard}
                  editInsight={editInsight}
                />
                <Column
                  title="Themes"
                  columnType="themes"
                  postIts={postIts.filter((p) => p.column === 'themes')}
                  moveCard={moveCard}
                  editCard={editCard}
                  deleteCard={deleteCard}
                  setThemeName={setThemeName}
                  addCard={addCard}
                  editInsight={editInsight}
                />
                <Column
                  title="Insights"
                  columnType="insights"
                  postIts={postIts.filter((p) => p.column === 'insights')}
                  moveCard={moveCard}
                  editCard={editCard}
                  deleteCard={deleteCard}
                  setThemeName={setThemeName}
                  addCard={addCard}
                  editInsight={editInsight}
                />
              </div>
            </div>

            {/* Empathy Map */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Empathy Map</h2>
              <Textarea
                placeholder="Divide insights into four quadrants: Says (what the persona verbalizes), Thinks (personas internal thoughts), Does (persona actions and behaviors), and Feels (persona emotions and pain points)."
                value={empathyMapInput}
                onChange={(e) => setEmpathyMapInput(e.target.value)}
                rows={6}
                className="resize-none"
              />
            </div>

            {/* Reflection */}
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Reflection</h2>
              <Textarea
                placeholder="How does this help your persona? What insights did you gain?"
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
                onClick={handleAnalyze}
                disabled={isAnalyzing}
                size="lg"
                className="bg-primary"
              >
                {isAnalyzing ? 'Analyzing...' : 'Analyze & Score'}
              </Button>
            </div>
          </motion.div>
        </div>

        <Dialog open={currentPersona !== null} onOpenChange={() => setCurrentPersona(null)}>
          <DialogContent className="max-w-4xl p-0">
            <div className="flex h-[80vh]">
              {/* Sidebar */}
              <div className="w-1/3 border-r bg-muted/20 p-6 overflow-y-auto">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-bold text-green-700">Persona Details</DialogTitle>
                </DialogHeader>
                {currentPersona && personas.find(p => p.id === currentPersona) && (
                  <div className="space-y-4 text-sm">
                    <p><span className="font-semibold">Name:</span> {personas.find(p => p.id === currentPersona)?.name}</p>
                    <p><span className="font-semibold">Role:</span> {personas.find(p => p.id === currentPersona)?.role}</p>
                    <p><span className="font-semibold">Backstory:</span> {personas.find(p => p.id === currentPersona)?.backstory}</p>
                    {personas.find(p => p.id === currentPersona)?.keyTraits && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-green-600">Key Traits:</h4>
                        <ul className="list-disc list-inside ml-4">
                          {Object.entries(personas.find(p => p.id === currentPersona)?.keyTraits || {}).map(([key, value]) => (
                            <li key={key}><span className="capitalize">{key}:</span> {value}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {personas.find(p => p.id === currentPersona)?.samplePrompts && (
                      <div className="space-y-2">
                        <h4 className="font-semibold text-green-600">Sample Prompts:</h4>
                        <ul className="list-disc list-inside ml-4">
                          {personas.find(p => p.id === currentPersona)?.samplePrompts.map((prompt, index) => (
                            <li key={index}>{prompt}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Chat Area */}
              <div className="flex-1 flex flex-col p-6">
                <DialogHeader className="mb-4">
                  <DialogTitle className="text-2xl font-bold">Interview {personas.find(p => p.id === currentPersona)?.name}</DialogTitle>
                </DialogHeader>
                
                <div className="flex-1 overflow-y-auto space-y-3 p-4 bg-muted/30 rounded-lg mb-4">
                  {currentPersona && stageData.empathy.interviews[currentPersona]?.map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg ${ 
                        msg.startsWith('Q:') ? 'bg-primary text-primary-foreground ml-8' : 'bg-card mr-8'
                      }`}
                    >
                      {(() => {
                        if (msg.startsWith('Q: ')) {
                          return msg.replace('Q: ', '');
                        } else if (msg.startsWith('A: ')) {
                          return <span>{msg.replace('A: ', '')}</span>;
                        }
                        return msg; // Fallback for any other unexpected message format
                      })()}
                    </div>
                  ))}
                </div>

                {/* Input */}
                <div className="flex gap-2 items-end">
                  {isVoiceMode ? (
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      size="icon"
                      className={`h-12 w-12 rounded-full ${isRecording ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-primary hover:bg-primary-dark'}`}
                    >
                      <Mic className="h-6 w-6" />
                    </Button>
                  ) : (
                    <Textarea
                      placeholder="Ask a question..."
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      rows={2}
                      className="flex-1 resize-none"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage();
                        }
                      }}
                    />
                  )}
                  <Button onClick={handleSendMessage} size="icon" className="h-12 w-12">
                    <Send className="h-6 w-6" />
                  </Button>
                  <Button onClick={toggleVoiceMode} size="icon" variant="outline" className="h-12 w-12">
                    {isVoiceMode ? <Keyboard className="h-6 w-6" /> : <Mic className="h-6 w-6" />}
                  </Button>
                </div>
              </div>
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
      <StageHintModal
        isOpen={showHintModal}
        onClose={() => setShowHintModal(false)}
        title="Empathize – How to Complete"
      >
        <ul className="list-disc list-inside space-y-1">
          <li>Interview at least 3 AI personas (text or voice)</li>
          <li>Drag their quotes to Post-Its</li>
          <li>Group into Themes → Craft Insights using: '[Persona] [does activity] because [need] but [obstacle]'</li>
          <li>Fill the Empathy Map & write a reflection</li>
          <li>Aim for deep emotional understanding</li>
          <li>Submit → AI scores your empathy depth (need 70+ to unlock Define)</li>
        </ul>
      </StageHintModal>
    </DndProvider>
  );
};

export default Empathize;