import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useThinkQuestStore, UploadedFileMetadata } from '@/store/useThinkQuestStore'; // Import UploadedFileMetadata
import { ArrowLeft, HelpCircle, Plus, X, Leaf, UploadCloud, FileText } from 'lucide-react';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useDrag, useDrop } from 'react-dnd';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import StageHintModal from '@/components/StageHintModal'; // Add this line
import { useDropzone } from 'react-dropzone'; // Import useDropzone

const ItemTypes = {
  NOTE: 'note',
};

interface NoteCardProps {
  id: string;
  text: string;
  index: number;
  boxId: string;
  moveNote: (boxId: string, dragIndex: number, hoverIndex: number) => void;
  deleteNote: (boxId: string, id: string) => void;
}

const NoteCard: React.FC<NoteCardProps> = ({ id, text, index, boxId, moveNote, deleteNote }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ handlerId }, drop] = useDrop({
    accept: ItemTypes.NOTE,
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover(item: { id: string; index: number; boxId: string }, monitor) {
      if (!ref.current) {
        return;
      }
      const dragIndex = item.index;
      const hoverIndex = index;

      // Don't replace items with themselves
      if (dragIndex === hoverIndex && item.boxId === boxId) {
        return;
      }

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      // Get vertical middle
      const hoverMiddleY =
        (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      // Get pixels to the top
      const hoverClientY = clientOffset!.y - hoverBoundingRect.top;

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
      moveNote(boxId, dragIndex, hoverIndex);

      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations, but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;
    },
  });

  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.NOTE,
    item: () => {
      // Determine sourceType based on boxId (if it's a timeline week, then 'timeline', else 'poster')
      const sourceType = boxId.startsWith('week') ? 'timeline' : 'poster';
      return { id, index, boxId, sourceType };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const opacity = isDragging ? 0 : 1;
  drag(drop(ref));

  return (
    <motion.div
      ref={ref}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
      style={{ opacity }}
      className="relative bg-yellow-100 border-2 border-green-500 rounded-md p-3 mb-2 text-sm shadow-sm cursor-grab active:cursor-grabbing"
      data-handler-id={handlerId}
    >
      {text}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1 right-1 h-5 w-5 text-gray-500 hover:text-red-500"
        onClick={() => deleteNote(boxId, id)}
      >
        <X className="h-3 w-3" />
      </Button>
    </motion.div>
  );
};

interface KanbanColumnProps {
  boxId: string;
  title: string;
  notes: string[];
  addNote: (boxId: string, note: string) => void;
  deleteNote: (boxId: string, id: string) => void;
  moveNote: (sourceType: 'poster' | 'timeline', sourceId: string, dragIndex: number, hoverIndex: number, targetType: 'poster' | 'timeline', targetId: string) => void;
  handleDropNote: (item: { id: string; boxId: string; sourceType: 'poster' | 'timeline' }, targetBoxId: string, targetType: 'poster' | 'timeline') => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  boxId,
  title,
  notes,
  addNote,
  deleteNote,
  moveNote,
  handleDropNote,
}) => {
  const [newNoteText, setNewNoteText] = useState('');
  const [, drop] = useDrop({
    accept: ItemTypes.NOTE,
    drop: (item: { id: string; boxId: string; sourceType: 'poster' | 'timeline' }) => {
      handleDropNote(item, boxId, 'poster');
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const handleAddNote = () => {
    if (newNoteText.trim()) {
      addNote(boxId, newNoteText.trim());
      setNewNoteText('');
    } else {
      toast.error('Note cannot be empty!');
    }
  };

  return (
    <div ref={drop} className="bg-white/80 rounded-xl p-4 shadow-md flex flex-col h-full">
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <div className="flex-grow overflow-y-auto pr-2 mb-4">
        <AnimatePresence>
          {notes.map((note, index) => (
            <NoteCard
              key={note} // Using note text as key, assuming unique notes within a column
              id={note}
              text={note}
              index={index}
              boxId={boxId}
              moveNote={(dragIndex, hoverIndex) => moveNote('poster', boxId, dragIndex, hoverIndex, 'poster', boxId)}
              deleteNote={deleteNote}
            />
          ))}
        </AnimatePresence>
      </div>
      <div className="flex gap-2 mt-auto">
        <Input
          type="text"
          placeholder="Add a note..."
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddNote();
            }
          }}
          className="flex-grow"
        />
        <Button onClick={handleAddNote} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};



interface TimelineDropZoneProps {
  weekId: string;
  title: string;
  notes: string[];
  deleteNote: (weekId: string, id: string) => void;
  moveNote: (sourceType: 'poster' | 'timeline', sourceId: string, dragIndex: number, hoverIndex: number, targetType: 'poster' | 'timeline', targetId: string) => void;
  handleDropNote: (item: { id: string; boxId: string; sourceType: 'poster' | 'timeline' }, targetBoxId: string, targetType: 'poster' | 'timeline') => void;
}

const TimelineDropZone: React.FC<TimelineDropZoneProps> = ({
  weekId,
  title,
  notes,
  deleteNote,
  moveNote,
  handleDropNote,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  const [{ isOver, canDrop }, drop] = useDrop({
    accept: ItemTypes.NOTE,
    drop: (item: { id: string; boxId: string; sourceType: 'poster' | 'timeline' }) => {
      handleDropNote(item, weekId, 'timeline');
    },
    collect: (monitor) => ({
      isOver: monitor.isOver(),
      canDrop: monitor.canDrop(),
    }),
  });

  const isActive = isOver && canDrop;
  let backgroundColor = 'bg-gray-100';
  if (isActive) {
    backgroundColor = 'bg-green-200';
  } else if (canDrop) {
    backgroundColor = 'bg-gray-200';
  }

  return (
    <div ref={drop} className={`flex-1 p-2 border rounded-md ${backgroundColor} min-h-[100px] flex flex-col`}>
      <h4 className="text-sm font-semibold mb-2">{title}</h4>
      <div className="flex-grow overflow-y-auto">
        <AnimatePresence>
          {notes.map((note, index) => (
            <NoteCard
              key={note}
              id={note}
              text={note}
              index={index}
              boxId={weekId} // Use weekId as boxId for NoteCard
              moveNote={(dragIndex, hoverIndex) => moveNote('timeline', weekId, dragIndex, hoverIndex, 'timeline', weekId)}
              deleteNote={deleteNote}
            />
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

interface TimelineColumnProps {
  boxId: string; // This will be 'timeline'
  title: string;
  timelineNotes: { [week: string]: string[] };
  addNoteToTimeline: (weekId: string, note: string) => void;
  deleteNoteFromTimeline: (weekId: string, id: string) => void;
  moveNote: (sourceType: 'poster' | 'timeline', sourceId: string, dragIndex: number, hoverIndex: number, targetType: 'poster' | 'timeline', targetId: string) => void;
  handleDropNote: (item: { id: string; boxId: string; sourceType: 'poster' | 'timeline' }, targetBoxId: string, targetType: 'poster' | 'timeline') => void;
}

const TimelineColumn: React.FC<TimelineColumnProps> = ({
  boxId,
  title,
  timelineNotes,
  addNoteToTimeline,
  deleteNoteFromTimeline,
  moveNote,
  handleDropNote,
}) => {
  const weeks = ['week1', 'week2', 'week3', 'week4', 'week5', 'week6'];
  const [newNoteText, setNewNoteText] = useState('');
  const [selectedWeek, setSelectedWeek] = useState(weeks[0]); // State for selected week

  const handleAddNote = () => {
    if (newNoteText.trim() && selectedWeek) {
      addNoteToTimeline(selectedWeek, newNoteText.trim());
      setNewNoteText('');
    } else {
      toast.error('Note cannot be empty or no week selected!');
    }
  };

  return (
    <div className="bg-white/80 rounded-xl p-4 shadow-md col-span-3 flex flex-col">
      <h3 className="text-lg font-bold text-gray-800 mb-2">{title}</h3>
      <div className="flex flex-grow gap-2 overflow-x-auto pb-2">
        {weeks.map((week, index) => (
          <TimelineDropZone
            key={week}
            weekId={week}
            title={`Week ${index + 1}`}
            notes={timelineNotes[week] || []}
            deleteNote={deleteNoteFromTimeline}
            moveNote={moveNote}
            handleDropNote={handleDropNote}
          />
        ))}
      </div>
      {/* Single Add Note input and button for the entire timeline */}
      <div className="flex gap-2 mt-4 p-2 border rounded-md bg-gray-50">
        <Input
          type="text"
          placeholder="Add a note to timeline..."
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleAddNote();
            }
          }}
          className="flex-grow"
        />
        <Select onValueChange={setSelectedWeek} defaultValue={selectedWeek}>
          <SelectTrigger className="w-[120px]">
            <SelectValue placeholder="Select Week" />
          </SelectTrigger>
          <SelectContent>
            {weeks.map((week, index) => (
              <SelectItem key={week} value={week}>Week {index + 1}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={handleAddNote} size="icon">
          <Plus className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};


const Prototype = () => {
  const navigate = useNavigate();
  const { selectedProblem, stageData, updateStageData, unlockStage, addTokens, addStars } = useThinkQuestStore();

  const ideateTop3 = stageData.ideate.top3 || [];
  const ideateRationaleMap = stageData.ideate.rationale || {};
  const posterNotes = stageData.prototype.posterNotes || {};
  const timelineNotes = stageData.prototype.timelineNotes || {};
  const uploadedFiles = stageData.prototype.uploads || []; // Get from Zustand
  const uploadedPreviews = stageData.prototype.uploadPreviews || []; // Get from Zustand

  const [selectedIdea, setSelectedIdea] = useState<string>(stageData.prototype.selectedIdea || '');

  // Placeholder for progress calculation
  const progress = selectedIdea ? 50 : 0; // 50% if an idea is selected

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [analysisResults, setAnalysisResults] = useState<{
    score: number;
    strengths: string;
    improvements: string;
    suggestions: string[];
    overallComment: string;
    errorMessage: string;
    visualFeedback?: { quote: string; sentiment: 'positive' | 'negative' }[]; // New property
    addressesProblem?: boolean; // Also add this from API response
  }>({
    score: 0,
    strengths: '',
    improvements: '',
    suggestions: [],
    overallComment: '',
    errorMessage: '',
  });
  const [showAnalysisDialog, setShowAnalysisDialog] = useState(false);
  const [showDigitalSolutionWarning, setShowDigitalSolutionWarning] = useState(false); // New state for warning
  const [isHintModalOpen, setIsHintModalOpen] = useState(false); // Add this line

  // Helper to detect if the selected idea is a digital solution
  const isDigitalSolution = useMemo(() => {
    if (!selectedIdea) return false;
    const lowerCaseIdea = selectedIdea.toLowerCase();
    const digitalKeywords = ['app', 'website', 'digital', 'mobile', 'software'];
    return digitalKeywords.some(keyword => lowerCaseIdea.includes(keyword));
  }, [selectedIdea]);

  // useDropzone hook
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    const validFiles = acceptedFiles.filter(file => allowedTypes.includes(file.type));

    if (validFiles.length !== acceptedFiles.length) {
      toast.error('Only JPG, PNG, and PDF files are allowed.');
    }

    const filesToAdd = validFiles.slice(0, 5 - uploadedFiles.length);

    if (uploadedFiles.length + filesToAdd.length > 5) {
      toast.error('You can only upload up to 5 files. Some files were not added.');
    }

    const newUploadsMetadata: UploadedFileMetadata[] = filesToAdd.map(file => ({
      name: file.name,
      type: file.type,
      size: file.size,
      preview: URL.createObjectURL(file),
      file: file, // Keep reference to File object
    }));
    
    // Combine with existing uploads
    const combinedUploads = [...uploadedFiles, ...newUploadsMetadata];

    // Extract just the preview URLs for the dedicated preview array (if needed)
    const combinedPreviews = combinedUploads.map(upload => upload.preview);

    updateStageData('prototype', { uploads: combinedUploads, uploadPreviews: combinedPreviews });
    setShowDigitalSolutionWarning(false); // Dismiss warning if files are uploaded
  }, [uploadedFiles, updateStageData]); // Depend on uploadedFiles from store

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/jpeg': ['.jpeg', '.jpg'],
      'image/png': ['.png'],
      'application/pdf': ['.pdf'],
    },
    maxFiles: 5,
    maxSize: 5 * 1024 * 1024, // 5MB
    multiple: true
  });


  const handleRemoveFile = (fileName: string) => {
    const fileToRemove = uploadedFiles.find(file => file.name === fileName);
    if (fileToRemove) {
      URL.revokeObjectURL(fileToRemove.preview); // Clean up preview URL
    }

    const newUploads = uploadedFiles.filter(file => file.name !== fileName);
    const newUploadPreviews = newUploads.map(upload => upload.preview);
    updateStageData('prototype', { uploads: newUploads, uploadPreviews: newUploadPreviews });
  };
  
  // Clean up preview URLs when component unmounts
  useEffect(() => {
    return () => uploadedFiles.forEach(file => URL.revokeObjectURL(file.preview));
  }, [uploadedFiles]); // Depend on uploadedFiles from store


  // Helper function to convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
    });
  };

  const handleSubmit = async () => {
    // Check for digital solution and no uploads
    if (isDigitalSolution && uploadedFiles.length === 0) {
      setShowDigitalSolutionWarning(true);
      toast.error('Please upload wireframes/photos for digital solutions to get full score!');
      return; // Prevent submission
    }

    setIsSubmitting(true);
    let loadingToastId;
    try {
      loadingToastId = toast.loading('AI analyzing your poster + files...');

      const posterContent = `Concept Poster Notes:\n${Object.entries(posterNotes).map(([boxId, notes]) => `  ${boxId}: ${notes.join(', ')}`).join('\n')}\n\nTimeline Notes:\n${Object.entries(timelineNotes).map(([weekId, notes]) => `  ${weekId}: ${notes.join(', ')}`).join('\n')}`;

      const uploadedFilesBase64 = await Promise.all(
        uploadedFiles.map(async (fileMetadata) => {
          if (fileMetadata.file) {
            const base64 = await fileToBase64(fileMetadata.file);
            return {
              name: fileMetadata.name,
              base64: base64,
              type: fileMetadata.type,
            };
          }
          return null;
        })
      );

      const requestBody = {
        stage: 'prototype',
        selectedIdea: selectedIdea,
        poster: posterContent,
        uploads: uploadedFilesBase64.filter(Boolean), // Filter out nulls if any
      };

      const response = await fetch(`/api/openai-score-prototype`, { // New endpoint
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
      const visualFeedback = Array.isArray(result.visualFeedback) ? result.visualFeedback : undefined; // Extract new property
      const addressesProblem = typeof result.addressesProblem === 'boolean' ? result.addressesProblem : false; // Extract new property

      updateStageData('prototype', {
        score,
        reflection: overallComment, // Store overall comment as reflection
      });

      setIsSubmitting(false);

      setAnalysisResults({
        score,
        strengths,
        improvements,
        suggestions,
        overallComment,
        errorMessage: '',
        visualFeedback, // Include in state
        addressesProblem, // Include in state
      });
      setShowAnalysisDialog(true);

      if (score >= 70) {
        setShowConfetti(true);
        unlockStage(4); // Unlock Test stage
        addTokens(50);
        addStars(1);
        toast.success(`Stage Complete! Score: ${score}/100`);
      }
    } catch (error) {
      console.error('Error analyzing prototype with Gemini API:', error);
      const errorMessage = (error as Error).message || 'Failed to analyze prototype.';
      setIsSubmitting(false);
      setAnalysisResults({
        score: 50,
        strengths: 'N/A',
        improvements: 'Could not parse detailed feedback.',
        suggestions: ['Check your internet connection or try again later.'],
        overallComment: 'An error occurred.',
        errorMessage: errorMessage,
        addressesProblem: false, // Fallback
        visualFeedback: [], // Fallback
      });
      setShowAnalysisDialog(true);
    } finally {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
    }
  };

  const handleIdeaSelection = (idea: string) => {
    setSelectedIdea(idea);
    updateStageData('prototype', { selectedIdea: idea });
  };

  const addNoteToPoster = useCallback((boxId: string, note: string) => {
    const currentNotes = posterNotes[boxId] || [];
    if (!currentNotes.includes(note)) { // Prevent duplicate notes
      const updatedNotes = {
        ...posterNotes,
        [boxId]: [...currentNotes, note],
      };
      updateStageData('prototype', { posterNotes: updatedNotes });
    }
  }, [posterNotes, updateStageData]);

  const deleteNoteFromPoster = useCallback((boxId: string, id: string) => {
    const currentNotes = posterNotes[boxId] || [];
    const updatedNotes = {
      ...posterNotes,
      [boxId]: currentNotes.filter(note => note !== id),
    };
    updateStageData('prototype', { posterNotes: updatedNotes });
  }, [posterNotes, updateStageData]);

  const addNoteToTimeline = useCallback((weekId: string, note: string) => {
    const currentNotes = timelineNotes[weekId] || [];
    if (!currentNotes.includes(note)) {
      const updatedNotes = {
        ...timelineNotes,
        [weekId]: [...currentNotes, note],
      };
      updateStageData('prototype', { timelineNotes: updatedNotes });
    }
  }, [timelineNotes, updateStageData]);

  const deleteNoteFromTimeline = useCallback((weekId: string, id: string) => {
    const currentNotes = timelineNotes[weekId] || [];
    const updatedNotes = {
      ...timelineNotes,
      [weekId]: currentNotes.filter(note => note !== id),
    };
    updateStageData('prototype', { timelineNotes: updatedNotes });
  }, [timelineNotes, updateStageData]);

  const moveNote = useCallback((
    sourceType: 'poster' | 'timeline',
    sourceId: string, // boxId or weekId
    dragIndex: number,
    hoverIndex: number,
    targetType: 'poster' | 'timeline',
    targetId: string, // boxId or weekId
  ) => {
    // Helper to get notes array based on type and ID
    const getNotesArray = (type: 'poster' | 'timeline', id: string) => {
      return type === 'poster' ? (posterNotes[id] || []) : (timelineNotes[id] || []);
    };

    // Helper to update state based on type and ID
    const updateNotesState = (type: 'poster' | 'timeline', id: string, newNotes: string[]) => {
      if (type === 'poster') {
        updateStageData('prototype', { posterNotes: { ...posterNotes, [id]: newNotes } });
      } else {
        updateStageData('prototype', { timelineNotes: { ...timelineNotes, [id]: newNotes } });
      }
    };

    const sourceNotes = getNotesArray(sourceType, sourceId);
    const targetNotes = getNotesArray(targetType, targetId);

    // If moving within the same list
    if (sourceType === targetType && sourceId === targetId) {
      const dragNote = sourceNotes[dragIndex];
      const updatedNotesArray = [...sourceNotes];
      updatedNotesArray.splice(dragIndex, 1);
      updatedNotesArray.splice(hoverIndex, 0, dragNote);
      updateNotesState(sourceType, sourceId, updatedNotesArray);
    } else {
      // Moving between different lists
      const [dragNote] = sourceNotes.splice(dragIndex, 1);
      targetNotes.splice(hoverIndex, 0, dragNote);
      updateNotesState(sourceType, sourceId, sourceNotes);
      updateNotesState(targetType, targetId, targetNotes);
    }
  }, [posterNotes, timelineNotes, updateStageData]);

  const handleDropNote = useCallback(( 
    item: { id: string; boxId: string; sourceType: 'poster' | 'timeline' },
    targetId: string, // boxId or weekId
    targetType: 'poster' | 'timeline',
  ) => {
    // If dropping into the same column, do nothing (moveNote handles reordering)
    if (item.boxId === targetId && item.sourceType === targetType) {
      return;
    }

    // Remove from source
    if (item.sourceType === 'poster') {
      deleteNoteFromPoster(item.boxId, item.id);
    } else {
      deleteNoteFromTimeline(item.boxId, item.id);
    }

    // Add to target
    if (targetType === 'poster') {
      addNoteToPoster(targetId, item.id);
    } else {
      addNoteToTimeline(targetId, item.id);
    }
  }, [addNoteToPoster, deleteNoteFromPoster, addNoteToTimeline, deleteNoteFromTimeline]);

  useEffect(() => {
    if (!selectedProblem) {
      navigate('/map');
    }
  }, [selectedProblem, navigate]);




  if (!selectedProblem) {
    return null;
  }

  const currentSelectedIdeaRationale = selectedIdea ? ideateRationaleMap[selectedIdea] : '';

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
                <h1 className="text-3xl font-bold">Stage 4: Prototype</h1>
                <p className="text-muted-foreground">Concept Poster</p>
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

          {/* Select Your Idea Section */}
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Select Your Idea</h2>
            {ideateTop3.length > 0 ? (
              <RadioGroup value={selectedIdea} onValueChange={handleIdeaSelection} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {ideateTop3.map((idea, index) => (
                  <div key={index} className="flex items-center space-x-2 p-4 border rounded-lg">
                    <RadioGroupItem value={idea} id={`idea-${index}`} />
                    <Label htmlFor={`idea-${index}`} className="flex flex-col">
                      <span className="font-medium">{idea}</span>
                      <span className="text-sm text-muted-foreground">{ideateRationaleMap[idea]}</span>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            ) : (
              <p className="text-muted-foreground">No top ideas found. Please complete the Ideate stage.</p>
            )}
          </div>

          {/* Display Selected Idea Card */}
          {selectedIdea && (
            <Card className="p-4 bg-green-100 border-green-500 text-green-800 dark:bg-green-900 dark:text-green-100">
              <h3 className="text-xl font-bold mb-2">Selected Idea:</h3>
              <p className="font-medium">{selectedIdea}</p>
              <p className="text-sm text-green-700 dark:text-green-200">{currentSelectedIdeaRationale}</p>
            </Card>
          )}

          {/* Sci-Bono Concept Poster */}
          <div className="concept-poster w-full bg-green-700 p-8 rounded-lg shadow-xl grid grid-rows-3 grid-cols-3 gap-6 min-h-[600px]">
            <KanbanColumn
              boxId="concept-name"
              title="1. WHAT IS THE CONCEPT CALLED?"
              notes={posterNotes['concept-name'] || []}
              addNote={addNoteToPoster}
              deleteNote={deleteNoteFromPoster}
              moveNote={moveNote}
              handleDropNote={handleDropNote}
            />
            <KanbanColumn
              boxId="who-is-it-for"
              title="2. WHO IS IT FOR?"
              notes={posterNotes['who-is-it-for'] || []}
              addNote={addNoteToPoster}
              deleteNote={deleteNoteFromPoster}
              moveNote={moveNote}
              handleDropNote={handleDropNote}
            />
            <KanbanColumn
              boxId="problem-solved"
              title="3. WHAT PROBLEM DOES IT SOLVE?"
              notes={posterNotes['problem-solved'] || []}
              addNote={addNoteToPoster}
              deleteNote={deleteNoteFromPoster}
              moveNote={moveNote}
              handleDropNote={handleDropNote}
            />
            <KanbanColumn
              boxId="big-idea"
              title="4. WHAT IS THE BIG IDEA?"
              notes={posterNotes['big-idea'] || []}
              addNote={addNoteToPoster}
              deleteNote={deleteNoteFromPoster}
              moveNote={moveNote}
              handleDropNote={handleDropNote}
            />
            <KanbanColumn
              boxId="how-it-works"
              title="5. EXPLAIN HOW IT WORKS"
              notes={posterNotes['how-it-works'] || []}
              addNote={addNoteToPoster}
              deleteNote={deleteNoteFromPoster}
              moveNote={moveNote}
              handleDropNote={handleDropNote}
            />
            <KanbanColumn
              boxId="why-fail"
              title="6. WHY MIGHT IT FAIL?"
              notes={posterNotes['why-fail'] || []}
              addNote={addNoteToPoster}
              deleteNote={deleteNoteFromPoster}
              moveNote={moveNote}
              handleDropNote={handleDropNote}
            />
            <KanbanColumn
              boxId="prototype-test"
              title="7. WHAT SHOULD WE PROTOTYPE AND TEST?"
              notes={posterNotes['prototype-test'] || []}
              addNote={addNoteToPoster}
              deleteNote={deleteNoteFromPoster}
              moveNote={moveNote}
              handleDropNote={handleDropNote}
            />
            <KanbanColumn
              boxId="measure-success"
              title="8. HOW MIGHT WE MEASURE SUCCESS?"
              notes={posterNotes['measure-success'] || []}
              addNote={addNoteToPoster}
              deleteNote={deleteNoteFromPoster}
              moveNote={moveNote}
              handleDropNote={handleDropNote}
            />
            <KanbanColumn
              boxId="make-happen"
              title="9. HOW WILL WE MAKE THIS HAPPEN?"
              notes={posterNotes['make-happen'] || []}
              addNote={addNoteToPoster}
              deleteNote={deleteNoteFromPoster}
              moveNote={moveNote}
              handleDropNote={handleDropNote}
            />
            {/* Timeline - now a TimelineColumn spanning 3 columns */}
            <TimelineColumn
              boxId="timeline"
              title="TIMELINE"
              timelineNotes={timelineNotes}
              addNoteToTimeline={addNoteToTimeline} // Added this prop
              deleteNoteFromTimeline={deleteNoteFromTimeline}
              moveNote={moveNote}
              handleDropNote={handleDropNote}
            />
          </div> {/* Closing tag for concept-poster */}

          {/* File Upload Section */}
          <div className="space-y-4 mt-8">
            <h2 className="text-2xl font-bold">Upload Your Wireframes / Prototype (Optional but Recommended)</h2>
            <Card className="p-4 border-l-4 border-yellow-500 bg-green-50 text-green-800 flex items-start space-x-3">
              <Leaf className="h-6 w-6 text-yellow-600 flex-shrink-0" />
              <div>
                <p className="font-medium">Instructions:</p>
                <p className="text-sm">
                  Create a wireframe in Visily or Figma (for apps/websites) OR take photos/drawings of your physical prototype.
                  Upload up to 5 images (JPG, PNG, PDF). The AI will analyze your poster + these files together.
                </p>
              </div>
            </Card>

            <div {...getRootProps()} className="dropzone p-8 border-2 border-dashed border-green-500 rounded-lg text-center cursor-pointer hover:bg-green-50 transition-colors">
              <input {...getInputProps()} />
              {
                isDragActive ?
                  <p className="text-green-700">Drop the files here ...</p> :
                  <p className="text-gray-500">Drag 'n' drop some files here, or click to select files</p>
              }
              <p className="text-sm text-gray-400 mt-2">(Max 5 files: JPG, PNG, PDF, up to 5MB each)</p>
            </div>

            {uploadedFiles.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                {uploadedFiles.map((fileMetadata, index) => (
                  <div key={fileMetadata.name} className="relative group bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-all duration-300">
                    <img src={fileMetadata.preview} alt={fileMetadata.name} className="w-full h-32 object-cover" />
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <Button variant="destructive" size="icon" onClick={() => handleRemoveFile(fileMetadata.name)}>
                        <X className="h-5 w-5" />
                      </Button>
                    </div>
                    <p className="p-2 text-sm text-gray-700 truncate">{fileMetadata.name}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex justify-between mt-8">
            <Button variant="outline" onClick={() => navigate('/map')}>
              Back to Map
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !selectedIdea} // Disable if no idea selected
              size="lg"
              className="bg-blue-500 text-white hover:bg-blue-600"
            >
              {isSubmitting ? 'Submitting...' : 'Submit Poster'}
            </Button>
          </div>

        </motion.div>

        {/* Stage Hint Modal */}
        <StageHintModal
          isOpen={isHintModalOpen}
          onClose={() => setIsHintModalOpen(false)}
          title="Prototype – How to Complete"
        >
          <ul className="list-disc list-inside space-y-1">
            <li>Choose one of your Top 3 ideas</li>
            <li>Fill all 9 sections of the Concept Poster with detailed sticky notes</li>
            <li>Drag tasks into the 6-week Timeline</li>
            <li>Upload wireframes (Visily/Figma) OR photos of physical prototype</li>
            <li>→ Digital solutions without visuals = lower score!</li>
            <li>The AI will analyze your poster + actual images using vision</li>
            <li>Submit → strict multimodal scoring (70+ unlocks Test)</li>
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

              {uploadedFiles.length > 0 && analysisResults.visualFeedback && analysisResults.visualFeedback.length > 0 && (
                <div>
                  <h3 className="font-bold mb-2">AI Feedback on Your Wireframes/Photos:</h3>
                  <div className="space-y-2">
                    {analysisResults.visualFeedback.map((feedback, index) => (
                      <div key={index} className="flex items-start space-x-2">
                        {feedback.sentiment === 'positive' ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <X className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                        )}
                        <p className="text-sm">{feedback.quote}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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

export default Prototype;
