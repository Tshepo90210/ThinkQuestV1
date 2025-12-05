import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import pb from '../lib/pocketbase'; // Import pb client

export interface User {
  id: string;
  fullName: string;
  email: string;
  grade?: string; // Made optional
  schoolName?: string; // New optional property
  avatarUrl?: string; // Made optional
  authToken: string;
  quizCompleted: boolean; // Not optional, default false
  quizScore: number; // Not optional, default 0
  lastLogin: Date; // New field
}

export interface Problem {
  id: number;
  title: string;
  context: string;
  keyChallenges?: string[];
  category: string;
  difficulty: string;
  image?: string;
}

export interface Persona {
  id: number;
  name: string;
  role: string;
  avatar: string;
  backstory: string;
  keyTraits?: {
    age: number;
    gender: string;
    language: string;
    location: string;
    motivations: string;
  };
  samplePrompts?: string[];
  responses?: { [key: string]: string };
}

export interface PostIt {
  id: string;
  text: string;
  column: 'post-its' | 'themes' | 'insights';
  themeName?: string;
  persona?: string;
  activity?: string;
  because?: string;
  but?: string;
}

export interface Insight {
  id: string;
  persona: string;
  activity: string;
  because: string;
  but: string;
}

export interface StageData {
  empathy: {
    interviews: { [personaId: number]: string[] };
    empathyMap: {
      says: string[];
      thinks: string[];
      does: string[];
      feels: string[];
    };
    score?: number;
    reflection?: string;
    kanbanBoard?: { postIts: PostIt[] };
    empathyInsights?: Insight[];
    empathyThemes?: { title: string; description: string }[];
  };
  define: {
    hmwStatement?: string;
    addedHmwQuestions?: string[];
    score?: number;
    reflection?: string;
  };
  ideate: {
    ideas: string[];
    top3: string[];
    rationale?: string;
    score?: number;
    reflection?: string;
    hmwQuestions: string[]; // Made non-optional
    selectedHmw: string | null; // Made non-optional
  };
  prototype: {
    sketch?: string;
    photo?: string;
    checklists: {
      functionality: boolean;
      design: boolean;
      feedback: boolean;
    };
    score?: number;
    reflection?: string;
    selectedIdea?: string;
    posterNotes?: { [boxId: string]: string[] };
    timelineNotes?: { [week: string]: string[] };
    uploads?: UploadedFileMetadata[]; // New: Store uploaded files metadata
    uploadPreviews?: string[]; // New: Store preview URLs for uploaded files
  };
  test: {
    iterations: number;
    feedback: { ease: number; notes: string }[];
    score?: number;
    reflection: string;
  };
}

export interface UploadedFileMetadata {
  name: string;
  type: string;
  size: number;
  preview: string; // URL.createObjectURL
}

interface ThinkQuestStore {
  user: User | null;
  selectedProblem: Problem | null;
  stagesUnlocked: boolean[];
  tokens: number;
  stars: number;
  stageData: StageData;
  avatarUrl: string; // New avatarUrl property
  quiz: {
    current: number;
    answers: Record<number, string>;
    passed: boolean;
    score: number;
    // hasSkipped: boolean; // Removed property
  };
  
  // Actions
  setUser: (user: User | null) => void;
  logout: () => void;
  updateUser: (userUpdates: Partial<User>) => void; // New action
  selectProblem: (problem: Problem) => void;
  unlockStage: (stageIndex: number) => void;
  addTokens: (amount: number) => void;
  addStars: (amount: number) => void;
  updateStageData: <T extends keyof StageData>(stage: T, data: Partial<StageData[T]>) => void;
  appendAiResponseToInterview: (personaId: number, content: string) => void;
  resetQuest: () => void;
  setAvatarUrl: (url: string) => void; // New setAvatarUrl action
  setHmwQuestions: (questions: string[]) => void;
  setSelectedHmw: (q: string | null) => void;
  setQuizState: (state: Partial<ThinkQuestStore['quiz']>) => void;
}

const initialStageData: StageData = {
  empathy: {
    interviews: {},
    empathyMap: { says: [], thinks: [], does: [], feels: [] },
    kanbanBoard: { postIts: [] },
    empathyInsights: [],
    empathyThemes: [],
  },
  define: {
    hmwStatement: '',
    addedHmwQuestions: [],
  },
  ideate: {
    ideas: [],
    top3: [],
    hmwQuestions: [],
    selectedHmw: null,
  },
  prototype: {
    checklists: { functionality: false, design: false, feedback: false },
    posterNotes: {},
    timelineNotes: {},
    uploads: [], // Initialize as empty array
    uploadPreviews: [], // Initialize as empty array
  },
  test: {
    iterations: 0,
    feedback: [],
    reflection: '', // Added this line
  },
};

export const useThinkQuestStore = create<ThinkQuestStore>()(
  persist(
    (set) => ({
      user: null,
      selectedProblem: null,
      stagesUnlocked: [true, false, false, false, false],
      tokens: 0,
      stars: 0,
      stageData: initialStageData,
      avatarUrl: "", // Default value for avatarUrl
      quiz: {
        current: 0,
        answers: {},
        passed: false,
        score: 0,
        // hasSkipped: false, // Removed property
      },

      setUser: (user) => {
        set((state) => {
          if (user) {
            const updatedUser: User = {
              ...user,
              quizCompleted: user.quizCompleted ?? false, // Default to false if undefined
              quizScore: user.quizScore ?? 0, // Default to 0 if undefined
              lastLogin: new Date(), // Set lastLogin to current date
            };

            const updatedQuizState = {
              current: state.quiz.current,
              answers: state.quiz.answers,
              passed: updatedUser.quizCompleted,
              score: updatedUser.quizScore,
            };
            // Logic related to updatedQuizState.hasSkipped removed

            return {
              user: updatedUser,
              avatarUrl: updatedUser.avatarUrl || state.avatarUrl,
              quiz: updatedQuizState,
            };
          } else {
            // User is logging out, reset to initial state (including quiz state)
            return {
              user: null,
              avatarUrl: "", // Ensure avatarUrl is reset on logout
              quiz: { current: 0, answers: {}, passed: false, score: 0 }, // Removed hasSkipped
            };
          }
        });
      },
      
      logout: () => {
        set((state) => ({
            user: null,
            selectedProblem: null,
            stagesUnlocked: [true, false, false, false, false],
            tokens: 0,
            stars: 0,
            stageData: initialStageData,
            avatarUrl: "", // Reset avatarUrl on logout
            quiz: { current: 0, answers: {}, passed: false, score: 0 }, // Removed hasSkipped
        }));
        pb.authStore.clear(); // Clear PocketBase's auth store
      },
      
      selectProblem: (problem) => set({ selectedProblem: problem }),
      
      unlockStage: (stageIndex) => set((state) => {
        const newUnlocked = [...state.stagesUnlocked];
        newUnlocked[stageIndex] = true;
        return { stagesUnlocked: newUnlocked };
      }),
      
      addTokens: (amount) => set((state) => ({ tokens: state.tokens + amount })),
      
      addStars: (amount) => set((state) => ({ stars: state.stars + amount })),
      
      updateStageData: <T extends keyof StageData>(stage: T, data: Partial<StageData[T]>) => set((state) => ({
        stageData: {
          ...state.stageData,
          [stage]: { ...state.stageData[stage], ...data },
        },
      })),

      appendAiResponseToInterview: (personaId, content) => set((state) => {
        const newInterviews = { ...state.stageData.empathy.interviews };
        let personaInterviews = newInterviews[personaId] ? [...newInterviews[personaId]] : [];

        // If the last message is an AI response placeholder, update it
        if (personaInterviews.length > 0 && personaInterviews[personaInterviews.length - 1].startsWith('A: ')) {
          personaInterviews[personaInterviews.length - 1] = `A: ${content}`;
        } else {
          // Otherwise, add a new AI response
          personaInterviews.push(`A: ${content}`);
        }
        newInterviews[personaId] = personaInterviews;

        return {
          stageData: {
            ...state.stageData,
            empathy: {
              ...state.stageData.empathy,
              interviews: newInterviews,
            },
          },
        };
      }),
      
      resetQuest: () => set({
        selectedProblem: null,
        stagesUnlocked: [true, false, false, false, false],
        stageData: initialStageData,
      }),

      setAvatarUrl: (url) => {
        set({ avatarUrl: url });
      }, // Implementation for setAvatarUrl

      setQuizState: (newState) => set((state) => ({
        quiz: { ...state.quiz, ...newState },
      })),

      updateUser: (userUpdates) => set((state) => {
        if (!state.user) return state;
        return {
          user: { ...state.user, ...userUpdates },
        };
      }),

      setHmwQuestions: (questions) => set((state) => ({
        stageData: {
          ...state.stageData,
          ideate: { ...state.stageData.ideate, hmwQuestions: questions },
        },
      })),

      setSelectedHmw: (q) => set((state) => {
        console.log('useThinkQuestStore: Setting selectedHmw to:', q);
        return {
          stageData: {
            ...state.stageData,
            ideate: { ...state.stageData.ideate, selectedHmw: q },
          },
        };
      }),
    }),
    {
      name: 'thinkquest-storage',
      version: 3, // Increment version when schema changes
      migrate: (persistedState: ThinkQuestStore, version) => {
        console.log('Zustand Migrate: old version', version);
        console.log('Zustand Migrate: persistedState before migration', persistedState);

        if (version === 0) {
          // Ensure empathyInsights, empathyThemes, and addedHmwQuestions are initialized
          persistedState.stageData.empathy.empathyInsights = persistedState.stageData.empathy.empathyInsights || [];
          persistedState.stageData.empathy.empathyThemes = persistedState.stageData.empathy.empathyThemes || [];
          persistedState.stageData.define.addedHmwQuestions = persistedState.stageData.define.addedHmwQuestions || [];
          // Add new initializations for ideate stage
          persistedState.stageData.ideate.hmwQuestions = persistedState.stageData.ideate.hmwQuestions || [];
          persistedState.stageData.ideate.selectedHmw = persistedState.stageData.ideate.selectedHmw || null;
        }

        console.log('Zustand Migrate: persistedState after migration', persistedState);
        return persistedState;
      },
      partialize: (state) => {
        // Exclude authToken from the persisted user object
        const userWithoutAuthToken = state.user ? { ...state.user } : null;
        if (userWithoutAuthToken) {
          delete userWithoutAuthToken.authToken;
        }

        return {
          user: userWithoutAuthToken, // Persist user without authToken
          selectedProblem: state.selectedProblem,
          stagesUnlocked: state.stagesUnlocked,
          tokens: state.tokens,
          stars: state.stars,
          stageData: { // Include uploads and uploadPreviews in partialize
            ...state.stageData,
            prototype: {
              ...state.stageData.prototype,
              uploads: state.stageData.prototype.uploads,
              uploadPreviews: state.stageData.prototype.uploadPreviews,
            },
          },
          avatarUrl: state.avatarUrl, // Include avatarUrl in persisted state
          quiz: state.quiz, // Persist the entire quiz object (without hasSkipped)
        };
      },
    }
  )
);