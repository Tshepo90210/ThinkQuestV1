# Google AI Studio Prompts for Rebuilding ThinkQuest App

This document provides a structured set of detailed prompts designed to guide Google AI Studio in recreating the ThinkQuest application. The app's full specification (`SPEC.md`) is provided as initial context for all prompts. The tasks are broken down into logical categories, and individual prompts focus on specific files, components, or functionalities.

---

## **GLOBAL CONTEXT: ThinkQuest Application Specification**

```markdown
# ThinkQuest Application Specification

## 1. Introduction

### 1.1. App Overview
ThinkQuest is an interactive, gamified web application designed to guide users through the Design Thinking process. It aims to make complex problem-solving engaging and accessible by breaking it down into distinct, structured stages: Empathize, Define, Ideate, Prototype, and Test. Users select a real-world problem, then progress through these stages, interacting with AI personas, brainstorming ideas, building prototypes, and receiving AI-driven feedback. The application tracks user progress, awards tokens and stars, and features a leaderboard to foster engagement.

### 1.2. Core Aim
The primary goal of ThinkQuest is to empower users to develop problem-solving skills, critical thinking, and creativity through hands-on application of the Design Thinking methodology. It leverages AI to provide dynamic interactions, personalized feedback, and a structured learning environment, preparing users for innovation challenges.

### 1.3. Problem Solved
ThinkQuest addresses the challenge of making Design Thinking accessible and engaging for learners. Traditional methods can be abstract or require significant resources. By gamifying the process and integrating AI, ThinkQuest offers a scalable, interactive platform for practicing human-centered design, providing immediate feedback and a clear progression path.

## 2. Technologies Used

### 2.1. Frontend
*   **Framework:** React (SPA - Single Page Application)
*   **Language:** TypeScript
*   **State Management:** Zustand (with persistence middleware for local storage)
*   **Routing:** React Router DOM
*   **Styling:** Tailwind CSS for utility-first styling, Shadcn UI for accessible and customizable React components.
*   **Animations:** Framer Motion
*   **Drag & Drop:** React DND (React DnD HTML5 Backend)
*   **Speech Recognition/Synthesis:** Web Speech API (Browser native)
*   **Utility Functions:** `clsx` and `tailwind-merge` (`cn` from `@/lib/utils.ts`)

### 2.2. Backend / API / Database
*   **Backend for Milestones/User Auth:** PocketBase (self-hosted or cloud-hosted backend-as-a-service)
    *   Handles user authentication, quiz completion status, and potentially leaderboard data.
*   **AI Integration (Local Server):** Node.js/Express.js (`server.ts`)
    *   Acts as a proxy for Google Gemini API calls.
    *   Manages API keys securely on the server-side.
    *   Handles persona-based chat interactions.
    *   Processes stage submissions for AI scoring and feedback.
*   **AI Model:** Google Gemini (via `@google/generative-ai` library).

### 2.3. Development Tools
*   **Build Tool:** Vite
*   **Linter:** ESLint (with TypeScript and React plugins)
*   **Type Checker:** TypeScript

## 3. User Interactions and Flow (Page Mapping)

The application follows a linear progression through Design Thinking stages, with gates for completion and a mandatory onboarding quiz.

### 3.1. Main Pages/Routes

*   **`/` (Index/Home Page):**
    *   Landing page for the application.
    *   Features a "Start Your Journey" button.
    *   Integrates `AuthModal` for user login/registration.
    *   If user is logged in, prompts to take the quiz if not already passed.
*   **`/quiz` (Quiz Page):**
    *   Mandatory onboarding quiz.
    *   Questions loaded from `quizData.ts`.
    *   Submission triggers PocketBase update for `quiz.passed`.
    *   Completion unlocks access to the main stages.
*   **`/problems` (Problem Selection Page):**
    *   Users select a design thinking problem from a list (mocked in `mockData.ts`).
    *   Selection updates global state (`selectedProblem`).
    *   Gated by `RequireQuiz` component (user must pass quiz).
*   **`/map` (Stage Map / Navigation Page):**
    *   Visual representation of the 5 Design Thinking stages.
    *   Stages are locked/unlocked based on `stageData` progress.
    *   Allows navigation to unlocked stages.
    *   Gated by `ProtectedRoute` (user must be logged in).
*   **`/stages/empathize` (Empathize Stage):**
    *   Core Empathize activities: persona interviews, Kanban board for insights, empathy map, reflection.
    *   AI persona interaction via chat (text/voice).
    *   Submits data to backend for AI scoring.
    *   Completion (score >= 70) unlocks "Define" stage.
*   **`/stages/define` (Define Stage):**
    *   Core Define activities: reviewing empathy insights, crafting Problem Statement (POV), generating How Might We (HMW) questions.
    *   AI feedback on HMW quality.
    *   Submits data to backend for AI scoring.
    *   Completion (score >= 70) unlocks "Ideate" stage.
*   **`/stages/ideate` (Ideate Stage):**
    *   Core Ideate activities: brainstorming ideas based on selected HMW, selecting top 3 ideas, providing rationales, reflection.
    *   Submits data to backend for AI scoring.
    *   Completion (score >= 70) unlocks "Prototype" stage.
*   **`/stages/prototype` (Prototype Stage):**
    *   Core Prototype activities: selecting a top idea, filling Concept Poster sections with notes (Kanban), dragging tasks to a 6-week timeline, uploading visual wireframes/photos.
    *   AI analyzes poster content and uploaded images (multimodal).
    *   Submits data to backend for AI scoring.
    *   Completion (score >= 70) unlocks "Test" stage.
*   **`/stages/test` (Test Stage):**
    *   Core Test activities: reviewing the final Concept Poster, receiving AI persona feedback on the prototype, writing a final reflection.
    *   Final quest submission calculates overall score and updates leaderboard/rewards.
*   **`/leaderboard` (Leaderboard Page):**
    *   Displays user rankings based on total scores.
    *   Gated by `ProtectedRoute`.
*   **`*` (NotFound Page):**
    *   Generic 404 page.

### 3.2. Authentication Flow
1.  User clicks "Start Your Journey" on `/`.
2.  `AuthModal` appears for login/registration.
3.  Successful login/registration sets `user` in global state and navigates to `/quiz` (if quiz not passed) or `/map`.

### 3.3. Stage Progression
*   Stages are linear: Empathize -> Define -> Ideate -> Prototype -> Test.
*   Each stage requires a minimum AI score (70/100) to unlock the next stage.
*   Progress is saved in `useThinkQuestStore` and potentially persisted to PocketBase.

## 4. UI/UX and Components

### 4.1. General Principles
*   **Gamified Aesthetic:** Employs visual elements and progression metaphors (e.g., "Quest," "Forest," "Mountain," "Storm").
*   **Clean & Modern:** Leverages Tailwind CSS and Shadcn UI for a consistent, modern look.
*   **Responsive:** Designed to adapt to different screen sizes (mobile-first approach where applicable, e.g., `StageHintModal`).
*   **Interactive:** Heavy use of `framer-motion` for smooth transitions and animations.
*   **Accessibility:** Use of `aria-labels`, `role` attributes for screen reader compatibility.

### 4.2. Key UI Components
*   **`Header.tsx`:** Global navigation, user info (tokens, stars, username), mobile menu.
*   **`AuthModal.tsx`:** User login/registration form.
*   **`ProblemDetailsOverlay.tsx`:** (Implied, for showing details of selected problem).
*   **`ProtectedRoute.tsx`:** HOC for routes requiring user authentication.
*   **`RequireQuiz.tsx`:** HOC for routes requiring quiz completion.
*   **`StageHintModal.tsx`:**
    *   Consistent green circle with `Leaf` icon button.
    *   Hover pulse animation on the icon.
    *   Opens a full-height, scrollable modal (mobile responsive).
    *   Features subtle forest ambiance audio on open (optional).
    *   `Leaf` icon in title has a waving animation.
    *   Modal title has a "glowing leaf" underline.
    *   All text uses a brand-consistent sans-serif font with green/yellow highlights.
    *   `aria-label='Stage instructions'`, `role='dialog'` for accessibility.
    *   Reduced floating leaf particles on mobile.
*   **`Avatar3DViewer.tsx` / `RPMCreatorModal.tsx`:** For displaying/creating user avatars (Ready Player Me integration).
*   **`components/ui/*`:** Shadcn UI components (buttons, inputs, dialogs, progress bars, etc.) for standardized UI elements.

## 5. Functions and Logic

### 5.1. Global State Management (`useThinkQuestStore.ts`)
*   **Zustand Store:** Centralized state for the entire application.
*   **Persisted State:** Uses `persist` middleware to save state to local storage (e.g., user progress, selected problem).
*   **Key State Properties:**
    *   `user`: User authentication details.
    *   `selectedProblem`: The problem currently being worked on.
    *   `stageData`: Object containing detailed progress and data for each stage (empathy, define, ideate, prototype, test).
    *   `tokens`, `stars`: Gamification rewards.
    *   `quiz`: `{ passed: boolean }`.
    *   `avatarUrl`: User's avatar URL.
*   **Actions:**
    *   `setUser`, `logout`: User session management.
    *   `selectProblem`: Sets the active problem.
    *   `updateStageData`: Generic function to update data for any stage.
    *   `unlockStage`: Updates the `unlockedStages` array.
    *   `addTokens`, `addStars`: Rewards management.
    *   `setHmwQuestions`: Specifically for passing HMWs from Define to Ideate.
    *   `setSelectedHmw(hmw: string)`: Sets the selected HMW in Ideate stage data.
    *   `appendAiResponseToInterview`: Manages streamed AI responses during interviews.
    *   `resetStageData()`: Resets all stage-specific data.

### 5.2. Stage-Specific Logic
*   **Empathize:**
    *   Manages Kanban board for post-its, themes, insights.
    *   Handles AI persona chat interaction via `handleSendMessage`.
    *   Speech recognition/synthesis integration.
    *   `handleAnalyze` sends empathy data to AI for scoring.
*   **Define:**
    *   Displays empathy insights/themes from previous stage.
    *   HMW (How Might We) question builder logic (`useEffect` for live preview).
    *   `handleSubmit` sends HMWs to AI for scoring.
*   **Ideate:**
    *   Displays selected HMW from previous stage.
    *   Idea generation and selection (Top 3).
    *   Rationale input for selected ideas.
    *   `handleSubmit` sends ideas/rationales to AI for scoring.
*   **Prototype:**
    *   Selection of one top idea from Ideate stage.
    *   Interactive Concept Poster (Kanban-style for 9 sections).
    *   6-week Timeline for tasks (DnD enabled).
    *   File upload for wireframes/photos (`react-dropzone`).
    *   `handleSubmit` sends poster content and uploaded files (Base64) to AI for multimodal scoring.
*   **Test:**
    *   Displays final Concept Poster and prototype data.
    *   Fetches AI persona feedback (`PersonaFeedbackCard`) for the prototype.
    *   Final reflection input.
    *   `handleSubmit` (Complete Quest) sends overall stage scores to backend, updates user rewards, and potentially leaderboard.

## 6. API Usage and Server-Side Details

The application relies on a Node.js/Express.js backend (`server.ts`) to interact with the Google Gemini API, ensuring API keys are securely managed server-side.

### 6.1. Backend Endpoints (`server.ts`)

*   **`POST /api/gemini-chat`:**
    *   **Purpose:** Handles AI persona chat interactions for the Empathize stage.
    *   **Input:** `name`, `role`, `backstory` (of persona), `question` (user's input).
    *   **Logic:**
        *   Constructs a Gemini prompt incorporating persona details and user's question.
        *   Sends the prompt to Google Gemini API (likely `gemini-pro` for text).
        *   Streams the AI's response back to the frontend.
    *   **Output:** Streamed text response from Gemini.

*   **`POST /api/gemini-score`:**
    *   **Purpose:** Provides AI-driven scoring and feedback for Empathize, Define, and Ideate stages.
    *   **Input (varies by stage):**
        *   **Empathize:** `stage: 'empathy'`, `empathyMapInput`, `reflection`, `selectedProblem`, `insights`, `themes`.
        *   **Define:** `stage: 'define'`, `hmwList`, `selectedProblem`, `themes`, `reflection`.
        *   **Ideate:** `stage: 'ideate'`, `hmw`, `selectedTop3Ideas`, `rationaleMap`, `reflection`, `selectedProblem`.
    *   **Logic:**
        *   Constructs a context-rich prompt for Gemini based on the submitted stage data.
        *   Instructs Gemini to act as an expert Design Thinking judge, provide a score (0-100), strengths, improvements, and suggestions in a JSON format.
        *   Use `gemini-pro` model.
        *   Parses Gemini's JSON response.
        *   Handle errors.
    *   **Output:** JSON object containing `score`, `strengths`, `improvements`, `suggestions`, `overallComment`.

*   **`POST /api/gemini-score-prototype`:**
    *   **Purpose:** Handles multimodal AI scoring and feedback for the Prototype stage.
    *   **Input:** `selectedIdea`, `poster` (text), `uploads` (array of Base64 encoded files with `name`, `base64`, `type`). Use `multer` to handle file uploads, converting them to Base64 *before* sending to Gemini.
    *   **Logic:**
        *   Constructs a multimodal prompt for Gemini (likely `gemini-pro-vision`) using text from the Concept Poster and Base64 encoded images.
        *   Sends the prompt to Google Gemini API.
        *   Parses Gemini's response for `score`, `strengths`, `improvements`, `suggestions`, `overallComment`, and potentially `visualFeedback`, `addressesProblem`.
    *   **Output:** JSON object similar to `/api/gemini-score` but with additional visual feedback fields.

*   **`POST /api/complete-quest`:**
    *   **Purpose:** Finalizes the quest, calculates total score, and updates user/leaderboard data.
    *   **Input:** `totalScore` (sum of all stage scores), `problemId`, `userId`.
    *   **Logic:**
        *   Interacts with PocketBase to save the user's total score for the specific problem.
        *   Updates user's global tokens/stars in PocketBase.
        *   Manages leaderboard ranking logic (potentially a PocketBase collection).
    *   **Output:** Confirmation of quest completion and any rewards.

### 6.2. Google Gemini API Interaction
*   The `server.ts` uses the `@google/generative-ai` library.
*   API key is loaded from `.env` on the server-side, never exposed to the frontend.
*   Models used: `gemini-pro` for text-based interactions (chat, basic scoring) and `gemini-pro-vision` for multimodal interactions (prototype scoring with images).

## 7. Development Considerations for Google AI Studio

To rebuild this project in Google AI Studio, the primary focus will be on the backend (`server.ts`) and its interaction with the Gemini API.

### 7.1. Gemini API Integration
*   **Model Selection:** Carefully choose between `gemini-pro` and `gemini-pro-vision` based on the input requirements (text-only vs. text+image).
*   **Prompt Engineering:** The quality of AI scoring and persona feedback heavily depends on well-crafted system prompts and user prompts sent to the Gemini API. These prompts must clearly define the AI's role, desired output format (e.g., JSON for scoring), and constraints.
*   **Streaming:** For persona chat, ensure the Gemini API response streaming functionality is utilized to provide a real-time feel.
*   **Function Calling (Optional Enhancement):** Future iterations could explore Gemini's function calling capabilities to integrate AI with other internal or external tools (e.g., a "search for competitor products" function for Ideate).

### 7.2. Frontend Integration
*   The existing frontend (React/TypeScript) is designed to make HTTP requests to the backend endpoints (e.g., `/api/gemini-chat`).
*   Ensure the `VITE_API_BASE_URL` environment variable correctly points to the deployed backend.

### 7.3. Database/Auth
*   PocketBase can be self-hosted or run on a cloud instance. Its API is used directly from the frontend for user management and data storage.

## 8. UI/UX Elements and Assets

### 8.1. Branding
*   **Color Palette:** Primarily green and yellow tones with complementary neutrals.
*   **Typography:** A sans-serif font family used throughout for readability and modern aesthetic.
*   **Icons:** `lucide-react` for vector icons.

### 8.2. Assets
*   **Images:** Problem-specific images, persona avatars, background images (`public/assets`, `public/images`).
*   **3D Models:** GLB files for avatars (`public/models`).
*   **Audio:** `forest_ambience.mp3` for modal background sound (expected in `public/`).

## 9. Conclusion

ThinkQuest provides a robust and interactive platform for learning Design Thinking. Its modular architecture, reliance on modern web technologies, and strategic integration of Google Gemini AI make it a powerful tool for education and innovation. Rebuilding or extending this project will involve careful attention to prompt engineering, secure API management, and maintaining a consistent, engaging user experience.
```

---

## **PROMPT CATEGORY 1: Project Setup (Initial Files)**

**Goal:** Generate the foundational project files for a React/TypeScript application using Vite, Tailwind CSS, and Shadcn UI. This includes `package.json`, Tailwind config, Vite config, TypeScript config, and the main entry points (`index.html`, `main.tsx`, `App.tsx`) with basic routing and global styling.

### **Prompt 1.1: Generate Core Project Files**

```text
As an expert React/TypeScript/Tailwind/Zustand developer, your task is to initialize a new web project called "ThinkQuest". Based on the provided "GLOBAL CONTEXT: ThinkQuest Application Specification", generate the following core project files. Ensure all paths are correct for a typical Vite React project structure.

**Files to Generate:**

1.  **`package.json`**:
    *   `name`: "thinkquest", `private`: true, `version`: "0.0.0", `type`: "module".
    *   **Scripts:**
        *   `"dev": "vite"`
        *   `"build": "vite build"`
        *   `"build:dev": "vite build --mode development"`
        *   `"lint": "eslint ."`
        *   `"preview": "vite preview"`
        *   `"start-server": "ts-node server.ts"`
    *   **Dependencies (use up-to-date stable versions):**
        *   `@google/generative-ai`, `@hookform/resolvers`, `@radix-ui/react-*` (for common Shadcn components like accordion, alert-dialog, avatar, button, checkbox, collapsible, context-menu, dialog, dropdown-menu, hover-card, label, menubar, navigation-menu, popover, progress, radio-group, scroll-area, select, separator, slider, slot, switch, tabs, toast, toggle, toggle-group, tooltip), `@react-spring/three`, `@react-three/drei`, `@react-three/fiber`, `@readyplayerme/react-avatar-creator`, `@tanstack/react-query`, `axios`, `class-variance-authority`, `clsx`, `cmdk`, `cors`, `date-fns`, `dotenv`, `embla-carousel-react`, `express`, `file-type`, `framer-motion`, `input-otp`, `jwt-decode`, `leva`, `lucide-react`, `multer`, `next-themes`, `pocketbase`, `react`, `react-confetti`, `react-day-picker`, `react-dnd`, `react-dnd-html5-backend`, `react-dom`, `react-dropzone`, `react-hook-form`, `react-resizable-panels`, `react-router-dom`, `react-sketch-canvas`, `recharts`, `sonner`, `tailwind-merge`, `tailwindcss-animate`, `three`, `vaul`, `zod`, `zustand`.
    *   **Dev Dependencies (use up-to-date stable versions):**
        *   `@eslint/js`, `@tailwindcss/typography`, `@types/node`, `@types/react`, `@types/react-dom`, `@vitejs/plugin-react-swc`, `autoprefixer`, `eslint`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`, `globals`, `lovable-tagger`, `postcss`, `tailwindcss`, `ts-node`, `typescript`, `typescript-eslint`, `vite`.

2.  **`tailwind.config.ts`**:
    *   Standard Tailwind configuration.
    *   `content`: Scan `index.html` and `src/**/*.{js,ts,jsx,tsx}`.
    *   `theme`:
        *   `container`: Center with padding.
        *   `extend`:
            *   `colors`: Define a green/yellow/gray palette consistent with a "nature/forest" theme. Use `primary`, `secondary`, `destructive`, `muted`, `accent`, `popover`, `card`, `border`, `input`, `ring`, `background`, `foreground`, `primary-foreground`, `secondary-foreground`, `destructive-foreground`, `muted-foreground`, `accent-foreground`, `popover-foreground`, `card-foreground`. Ensure these are defined using HSL values with fallbacks for light/dark mode if possible, following Shadcn UI's convention. Example: `primary: "hsl(var(--primary))"`.
            *   `borderRadius`: `lg`, `md`, `sm`.
            *   `keyframes`: `accordion-down`, `accordion-up`, `collapsible-down`, `collapsible-up`, `caret-blink`.
            *   `animation`: Link keyframes (`accordion-down: "accordion-down 0.2s ease-out"`).
    *   `plugins`: Include `tailwindcss-animate`.

3.  **`postcss.config.js`**:
    *   Standard configuration: `plugins: { tailwindcss: {}, autoprefixer: {} }`.

4.  **`tsconfig.json`**:
    *   `compilerOptions`:
        *   `target`: "ES2022", `lib`: ["DOM", "DOM.Iterable", "ESNext"], `allowJs`: true.
        *   `skipLibCheck`: true, `esModuleInterop`: true, `allowSyntheticDefaultImports`: true.
        *   `strict`: true, `forceConsistentCasingInFileNames`: true, `module`: "ESNext", `moduleResolution`: "bundler".
        *   `resolveJsonModule`: true, `isolatedModules`: true, `noEmit`: true, `jsx`: "react-jsx".
        *   `paths`: `"@/*": ["./src/*"]`.
    *   `include`: ["src"], `references`: [{ "path": "./tsconfig.node.json" }] (assume `tsconfig.node.json` for server).

5.  **`tsconfig.app.json`**:
    *   `extends`: "./tsconfig.json".
    *   `compilerOptions`: `composite`: true, `tsBuildInfoFile`: "./node_modules/.tsbuildinfo".
    *   `include`: ["src/**/*.ts", "src/**/*.tsx", "src/types.d.ts"].
    *   `exclude`: ["node_modules"].

6.  **`vite.config.ts`**:
    *   `import { defineConfig } from 'vite';`
    *   `import react from '@vitejs/plugin-react-swc';`
    *   `import path from 'path';`
    *   `defineConfig({ plugins: [react()], resolve: { alias: { '@': path.resolve(__dirname, './src') } } })`.

7.  **`index.html`**:
    *   Basic HTML5 structure. `lang="en"`.
    *   `<head>`: `charset`, `viewport`, `title` ("ThinkQuest - Design Thinking Journey").
    *   `<body>`: `<div id="root"></div>`, `<script type="module" src="/src/main.tsx"></script>`.

8.  **`src/main.tsx`**:
    *   `import React from 'react';`
    *   `import ReactDOM from 'react-dom/client';`
    *   `import App from './App.tsx';`
    *   `import './index.css';`
    *   `ReactDOM.createRoot(document.getElementById('root')!).render(<React.StrictMode><App /></React.StrictMode>);`.

9.  **`src/index.css`**:
    *   Standard Tailwind directives: `@tailwind base; @tailwind components; @tailwind utilities;`.
    *   Add CSS variables for the Shadcn UI colors defined in `tailwind.config.ts` (e.g., `--background: 0 0% 100%;`). Provide both light and dark mode variables (prefers-color-scheme).
    *   Add global styles for HTML, body, and basic font (e.g., `font-family: ui-sans-serif, system-ui, sans-serif;`).

10. **`src/App.tsx`**:
    *   `import { BrowserRouter, Routes, Route } from 'react-router-dom';`
    *   `import { lazy, Suspense } from 'react';`
    *   `import { Toaster } from './components/ui/sonner';`
    *   `import { Header } from './components/Header';` (Assume Header is created later).
    *   `import ProtectedRoute from './components/ProtectedRoute';` (Assume ProtectedRoute is created later).
    *   `import RequireQuiz from './components/RequireQuiz';` (Assume RequireQuiz is created later).
    *   **Lazy Load Components:** Use `lazy` and `Suspense` for all page components (`Index`, `Quiz`, `Problems`, `Map`, `Empathize`, `Define`, `Ideate`, `Prototype`, `Test`, `Leaderboard`, `NotFound`).
    *   **Routes:**
        *   `Route path="/" element={<Index />} />`
        *   `Route path="/quiz" element={<Quiz />} />`
        *   `Route path="/problems" element={<Problems />} />`
        *   `Route element={<ProtectedRoute />}>` (Wrapper for protected routes)
            *   `Route element={<RequireQuiz />}>` (Wrapper for quiz-gated routes)
                *   `Route path="/map" element={<Map />} />`
                *   `Route path="/leaderboard" element={<Leaderboard />} />`
                *   `Route path="/stages/empathize" element={<Empathize />} />`
                *   `Route path="/stages/define" element={<Define />} />`
                *   `Route path="/stages/ideate" element={<Ideate />} />`
                *   `Route path="/stages/prototype" element={<Prototype />} />`
                *   `Route path="/stages/test" element={<Test />} />`
            *   `</Route>` (closing RequireQuiz)
        *   `</Route>` (closing ProtectedRoute)
        *   `Route path="*" element={<NotFound />} />`
    *   Include `<Header />` above the `Routes` within `BrowserRouter`.
    *   Include `<Toaster />` at the root of the `App` component.
    *   Add a simple `<footer>` div for now.

11. **`src/types.d.ts`**:
    *   Declare `/// <reference types="vite/client" />`.
    *   Augment `Window` interface to include:
        *   `webkitSpeechRecognition: typeof SpeechRecognition;`
        *   `webkitSpeechGrammarList: typeof SpeechGrammarList;`
        *   `webkitSpeechRecognitionEvent: typeof SpeechRecognitionEvent;`

Provide the full content for each file. Assume Shadcn UI components will be generated later, so `Header`, `ProtectedRoute`, `RequireQuiz`, and all page components can be empty functional components for now, returning `<div>{ComponentName}</div>`.


**End of Prompt 1.1**
```

---

## **PROMPT CATEGORY 2: Core State Management (Zustand)**

**Goal:** Generate the global state management store using Zustand, including persistence for local storage, and define the core data models for users, problems, and stage-specific data.

### **Prompt 2.1: Generate `src/store/useThinkQuestStore.ts`**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the Zustand store for the ThinkQuest application. This store will manage all global state, including user authentication, selected problems, stage progress, and gamification elements.

**File to Generate:**

1.  **`src/store/useThinkQuestStore.ts`**:
    *   **Imports:** `create` from 'zustand', `persist` from 'zustand/middleware', `PocketBase` from 'pocketbase' (assume PocketBase is set up and available via an environment variable). `immer` middleware for immutability (`devtools` is optional but good practice).
    *   **PocketBase Client:** Instantiate `const pb = new PocketBase(import.meta.env.VITE_PB_URL);`
    *   **Data Models (Interfaces):**
        *   `User` interface: `id`, `email`, `username`, `name`, `avatarUrl`, `isNewUser`, `currentProblemId` (nullable string), `quizPassed` (boolean).
        *   `Problem` interface: `id` (string), `title`, `description`, `imageUrl`, `type`, `difficulty`.
        *   `EmpathyStageData` interface: `interviews` (Record<number, string[]>), `kanbanBoard` (object with `postIts` array), `empathyMap` (object with `says`, `thinks`, `does`, `feels` arrays), `score`, `reflection`, `strengths`, `improvements`, `suggestions`, `overallComment`, `empathyInsights` (array of objects), `empathyThemes` (array of objects).
        *   `DefineStageData` interface: `hmwStatement`, `addedHmwQuestions` (string[]), `score`, `reflection`.
        *   `IdeateStageData` interface: `selectedHmw`, `ideas` (string[]), `top3` (string[]), `rationale` (Record<string, string>), `reflection`, `score`.
        *   `UploadedFileMetadata` interface: `name`, `type`, `size`, `preview`, `file` (File object).
        *   `PrototypeStageData` interface: `selectedIdea`, `posterNotes` (Record<string, string[]>), `timelineNotes` (Record<string, string[]>), `uploads` (UploadedFileMetadata[]), `uploadPreviews` (string[]), `score`, `reflection`.
        *   `TestStageData` interface: `reflection` (string), `score`.
        *   `StageData` interface: `{ empathy: EmpathyStageData; define: DefineStageData; ideate: IdeateStageData; prototype: PrototypeStageData; test: TestStageData; }`
        *   `ThinkQuestStore` interface: Combines all state properties and actions.
    *   **State Properties:**
        *   `pb`: PocketBase instance.
        *   `user`: `User | null`.
        *   `tokens`: `number`.
        *   `stars`: `number`.
        *   `unlockedStages`: `number[]` (represents stage IDs).
        *   `selectedProblem`: `Problem | null`.
        *   `stageData`: `StageData`.
        *   `quiz`: `{ passed: boolean; completedAt: string | null; }`.
    *   **Actions:**
        *   `setUser(user: User | null)`: Sets the current user.
        *   `logout()`: Logs out user, clears state, navigates to home.
        *   `addTokens(amount: number)`: Increases token count.
        *   `addStars(amount: number)`: Increases star count.
        *   `unlockStage(stageId: number)`: Adds stageId to `unlockedStages`.
        *   `selectProblem(problem: Problem | null)`: Sets the selected problem.
        *   `updateStageData(stage: keyof StageData, data: Partial<EmpathyStageData | DefineStageData | IdeateStageData | PrototypeStageData | TestStageData>)`: Generic updater for stage-specific data.
        *   `setQuizPassed(passed: boolean)`: Updates quiz status.
        *   `setHmwQuestions(hmwQuestions: string[])`: Sets HMW questions for Ideate.
        *   `setSelectedHmw(hmw: string)`: Sets the selected HMW in Ideate stage data.
        *   `appendAiResponseToInterview(personaId: number, response: string)`: Appends streamed AI response.
        *   `resetStageData()`: Resets all stage-specific data.
    *   **Zustand `create` call:**
        *   Use `persist` middleware for `user`, `tokens`, `stars`, `unlockedStages`, `selectedProblem`, `stageData`, `quiz`.
        *   Use `name: 'thinkquest-store'` for persistence.
        *   Initialize all state properties with sensible defaults (e.g., `user: null`, `tokens: 0`).
        *   Ensure all actions correctly update the state using `set`. Use `get` for deriving state if needed.

Provide the full TypeScript code for `src/store/useThinkQuestStore.ts`.
```

---

## **PROMPT CATEGORY 3: UI Utilities & Shadcn Components**

**Goal:** Set up the utility function for combining Tailwind CSS classes and generate the essential Shadcn UI components that are used across the application.

### **Prompt 3.1: Generate `src/lib/utils.ts` and Shadcn UI Components**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to generate the utility function for combining Tailwind CSS classes and a selection of Shadcn UI components. These components are fundamental building blocks for the application's UI.

**Files to Generate:**

1.  **`src/lib/utils.ts`**:
    *   Export a `cn` function that combines `clsx` and `tailwind-merge` for conditional and intelligent merging of Tailwind classes. This is a standard Shadcn UI utility.

2.  **`src/components/ui/button.tsx`**:
    *   Generate a Shadcn UI `Button` component.
    *   Include `variant` (default, destructive, outline, secondary, ghost, link, green, yellow, blue, red) and `size` (default, sm, lg, icon) props.
    *   Use `cva` for class-variance-authority and `cn` for utility merging.
    *   Ensure it forwards refs and supports HTML button props.

3.  **`src/components/ui/dialog.tsx`**:
    *   Generate a Shadcn UI `Dialog` component (Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription).
    *   Ensure it uses `@radix-ui/react-dialog`.
    *   Include standard styling.

4.  **`src/components/ui/input.tsx`**:
    *   Generate a Shadcn UI `Input` component.
    *   Ensure it forwards refs and supports HTML input props.
    *   Include standard styling for focus states.

5.  **`src/components/ui/textarea.tsx`**:
    *   Generate a Shadcn UI `Textarea` component.
    *   Ensure it forwards refs and supports HTML textarea props.
    *   Include standard styling.

6.  **`src/components/ui/progress.tsx`**:
    *   Generate a Shadcn UI `Progress` component.
    *   Ensure it uses `@radix-ui/react-progress`.
    *   Include styling for a progress bar.

7.  **`src/components/ui/sonner.tsx`**:
    *   Generate a Shadcn UI `Toaster` component for toasts using `sonner`.
    *   Include `Toaster` export.

8.  **`src/components/ui/toast.tsx`**:
    *   Generate a Shadcn UI `Toast` components (Toast, ToastProvider, ToastViewport, ToastTitle, ToastDescription, ToastClose, ToastAction) using `@radix-ui/react-toast`.
    *   Include `use-toast.ts` hook for imperative toast calls.

9.  **`src/components/ui/select.tsx`**:
    *   Generate a Shadcn UI `Select` component (Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator).
    *   Ensure it uses `@radix-ui/react-select`.

10. **`src/components/ui/radio-group.tsx`**:
    *   Generate a Shadcn UI `RadioGroup` component (RadioGroup, RadioGroupItem).
    *   Ensure it uses `@radix-ui/react-radio-group`.

11. **`src/components/ui/label.tsx`**:
    *   Generate a Shadcn UI `Label` component.
    *   Ensure it uses `@radix-ui/react-label`.

12. **`src/components/ui/checkbox.tsx`**:
    *   Generate a Shadcn UI `Checkbox` component.
    *   Ensure it uses `@radix-ui/react-checkbox`.

13. **`src/components/ui/card.tsx`**:
    *   Generate a Shadcn UI `Card` component (Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent).
    *   Include standard styling.

14. **`src/components/ui/avatar.tsx`**:
    *   Generate a Shadcn UI `Avatar` component (Avatar, AvatarFallback, AvatarImage).
    *   Ensure it uses `@radix-ui/react-avatar`.

For each component, provide the complete TypeScript React code, including imports, `cn` usage, and default styling consistent with the ThinkQuest green/yellow theme where applicable.
```

---

## **PROMPT CATEGORY 4: Shared Components (Core)**

**Goal:** Generate key reusable components that are used across multiple pages of the application.

### **Prompt 4.1: Generate `src/components/Header.tsx`**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the `Header` component. This component will serve as the global navigation and display user information.

**File to Generate:**

1.  **`src/components/Header.tsx`**:
    *   **Imports:** React hooks (`Link`, `useNavigate`, `useLocation`) from 'react-router-dom', `Menu`, `Star`, `User`, `LogOut`, `HelpCircle`, `Lock`, `Check` from 'lucide-react', `useThinkQuestStore` from '@/store/useThinkQuestStore'.
    *   Shadcn UI components: `DropdownMenu` (DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger), `Sheet` (Sheet, SheetContent, SheetTrigger), `Avatar`, `AvatarFallback`, `Button`.
    *   `motion` from 'framer-motion'.
    *   **State/Hooks:**
        *   `user`, `tokens`, `stars`, `logout`, `avatarUrl`, `quiz` from `useThinkQuestStore`.
        *   `useNavigate`, `useLocation`.
    *   **`navLinks` array:** Define an array of navigation objects `{ label: string, path: string }` including "Home", "Quiz", "Learn", "Explore", "Map", "Leaderboard". Filter out duplicates and adjust as necessary.
    *   **`handleLogout` function:** Calls `logout()` from store and navigates to `/`.
    *   **JSX Structure:**
        *   Main `<header>` element with `sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur`.
        *   **Logo (Left):** `Link` to home (`/`). Displays "T" in a green circle and "ThinkQuest" text.
        *   **Desktop Navigation (Center):** Hidden on small screens (`hidden md:flex`). Iterates `navLinks`, using `Link` components. Apply active link styling based on `location.pathname`.
            *   Add `Check` icon (green) next to "Quiz" if `quiz.passed` is true (and user logged in).
            *   Add `Lock` icon (red) next to "Quiz", "Learn", "Explore", "Map", "Leaderboard" if `quiz.passed` is false and user is logged in.
        *   **Right Side:** Flex container for user info and mobile menu.
            *   **User Tokens/Stars (Desktop):** `motion.div` displaying `stars` and `tokens` (green/yellow themed) when `user` is logged in. Use `framer-motion` `initial` and `animate` for a subtle entrance animation. Hidden on small screens (`hidden sm:flex`).
            *   **User Dropdown (Logged In):** `DropdownMenu` triggered by a button displaying user's avatar (or `AvatarFallback` with initial) and username.
                *   Dropdown content: User's email, a separator, and a "Logout" `DropdownMenuItem` with `LogOut` icon.
                *   Avatar display: If `avatarUrl` exists, use `Avatar3DViewer` (assume this component is external or created later, for now just a placeholder `div` or `Avatar` if simpler). Otherwise, display `AvatarFallback` with username initial.
            *   **Login Button (Logged Out):** `Link` to home page styled as a login button (`bg-primary`).
            *   **Mobile Menu (Hamburger Icon):** `Sheet` component triggered by a `Menu` icon (`md:hidden`).
                *   `SheetContent` on the right side.
                *   Navigates through `navLinks` vertically.
                *   Displays user tokens/stars vertically in the mobile menu when logged in.
    *   **Styling:** Apply Tailwind CSS classes for layout, colors, typography, and responsiveness according to the ThinkQuest aesthetic.
    *   **Accessibility:** Ensure interactive elements have proper `aria-labels` where appropriate.

Provide the full TypeScript React code for `src/components/Header.tsx`.
```

---

### **Prompt 4.2: Generate `src/components/StageHintModal.tsx`**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the `StageHintModal` component. This modal provides stage-specific instructions and features several "Magic Touch" enhancements.

**File to Generate:**

1.  **`src/components/StageHintModal.tsx`**:
    *   **Imports:** `React`, `useEffect`, `useState`, `useRef` from 'react', `motion`, `AnimatePresence` from 'framer-motion', `Dialog` components from Shadcn UI (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`), `Button` from Shadcn UI, `X`, `Leaf` from 'lucide-react', `cn` from '@/lib/utils'.
    *   **`StageHintModalProps` Interface:**
        *   `isOpen: boolean;`
        *   `onClose: () => void;`
        *   `title: string;`
        *   `children: React.ReactNode;` (for the hint content list)
        *   `enableSound?: boolean;` (New prop for sound toggle).
    *   **State & Refs:**
        *   `leaves` state (`any[]`) for floating leaf animation.
        *   `numLeaves` state (`number`) for responsive leaf count (10 for desktop, 3 for mobile).
        *   `audioRef` (`HTMLAudioElement | null`) for sound playback.
    *   **`useEffect` (Responsive Leaves & Generation):**
        *   Initializes `numLeaves` based on `window.innerWidth` (e.g., `<768px` for mobile).
        *   Adds a `resize` event listener to update `numLeaves`.
        *   Generates `leaves` array (objects with `id`, `initial`, `animate`, `transition`, `style`) when `isOpen` is true, using `numLeaves` for array length.
        *   Clears `leaves` when `isOpen` is false.
        *   Cleans up event listener on unmount.
        *   Include `isOpen` and `numLeaves` in the dependency array.
    *   **`useEffect` (Audio Playback):**
        *   Plays audio (`audioRef.current.play()`) if `isOpen` is true and `enableSound` is true. Set `volume` to 0.3.
        *   Pauses audio and resets `currentTime` to 0 if modal closes.
        *   Include `isOpen` and `enableSound` in the dependency array.
    *   **JSX Structure:**
        *   **Root Element:** Wrap the `audio` tag and `Dialog` in a React Fragment (`<>...</>`).
        *   **Audio Tag:** `<audio ref={audioRef} src="/forest_ambience.mp3" loop preload="auto" />` (Assume `forest_ambience.mp3` is in `public` directory).
        *   **Dialog Component:** `<Dialog open={isOpen} onOpenChange={onClose} aria-label='Stage instructions' role='dialog'>`
        *   **AnimatePresence:** Wrap the modal content for `framer-motion` exit animations.
        *   **Backdrop (`motion.div`):** `fixed inset-0 z-40 bg-black/50 backdrop-blur-sm flex items-center justify-center`.
        *   **Floating Leaves:** Map over `leaves` state, rendering `motion.div` elements with a Unicode leaf character (`&#10022;`) and associated animations/styles.
        *   **Modal Content (`motion.div` - Main Body):**
            *   `initial={{ x: '100%', y: '-100%', opacity: 0 }}`
            *   `animate={{ x: '0%', y: '0%', opacity: 1 }}`
            *   `exit={{ x: '100%', y: '-100%', opacity: 0 }}`
            *   `transition={{ type: 'spring', damping: 25, stiffness: 200 }}`
            *   **`className` (using `cn`):**
                *   Default (mobile) styles: `fixed inset-0 z-[99] w-full p-4 overflow-y-auto rounded-none`.
                *   Desktop styles (md: screens): `md:top-20 md:right-4 md:max-w-lg md:rounded-lg`.
                *   `shadow-xl`.
                *   `bg-green-50` (subtle pale green background).
                *   `before:absolute before:inset-0 before:border-8 before:border-yellow-400 before:rounded-lg before:pointer-events-none` (Original border styling).
        *   **Close Button (`Button`):** `absolute top-4 right-4 text-gray-500 hover:text-gray-900` with `X` icon.
        *   **DialogHeader:**
            *   `DialogTitle`: `text-2xl font-bold text-green-800 flex items-center border-b-2 border-yellow-400 pb-1`.
            *   **Waving Leaf Icon:** `motion.div` wrapping `Leaf` icon (`h-7 w-7 text-yellow-600`) with `initial`, `animate` (waving `rotate`), and `transition` properties. `className="mr-2"`.
            *   Display `{title}` prop.
        *   **Main Content Area:** `div` with `className="text-green-900 space-y-4 font-sans"`. Renders `{children}`.

Provide the full TypeScript React code for `src/components/StageHintModal.tsx`.
```

---

### **Prompt 4.3: Generate `src/components/AuthModal.tsx`**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the `AuthModal` component. This modal handles user login and registration using PocketBase.

**File to Generate:**

1.  **`src/components/AuthModal.tsx`**:
    *   **Imports:** `React`, `useState` from 'react', `Dialog` components from Shadcn UI, `Input`, `Button`, `Label`. `useThinkQuestStore` from '@/store/useThinkQuestStore', `z` from 'zod', `useForm` from 'react-hook-form', `zodResolver` from '@hookform/resolvers/zod'. `toast` from 'sonner'. `User` interface from `useThinkQuestStore`.
    *   **`AuthModalProps` Interface:** `isOpen: boolean; onClose: () => void;`
    *   **State:** `isLogin` (boolean, to toggle between login/register forms), `isLoading` (boolean for form submission).
    *   **Zod Schema:** Define `loginSchema` (email, password) and `registerSchema` (email, password, confirmPassword, username) for form validation.
    *   **Form Hooks:** `useForm` for both login and register forms, integrating `zodResolver`.
    *   **`handleLogin` function (async):**
        *   Uses `pb.collection('users').authWithPassword` to authenticate.
        *   If successful, fetch authenticated user details (e.g., `pb.authStore.model`) and map to `User` interface. Set `user` in store (`setUser`). Close modal.
        *   Handles errors with `toast.error`.
    *   **`handleRegister` function (async):**
        *   Uses `pb.collection('users').create` for registration.
        *   After creation, automatically authenticate using `pb.collection('users').authWithPassword`.
        *   If successful, fetch authenticated user details and map to `User` interface. Set `user` in store (`setUser`). Close modal.
        *   Handles errors with `toast.error`.
    *   **JSX Structure:**
        *   **Dialog Component:** `Dialog open={isOpen} onOpenChange={onClose}`.
        *   **DialogContent:**
            *   **Close Button:** Standard Shadcn UI dialog close button (`X` icon).
            *   **Header:** `DialogHeader` with `DialogTitle` (Login/Register based on `isLogin` state).
            *   **Form:** Use conditional rendering for login and registration forms.
                *   Each form uses Shadcn UI `Input` components for email, password, username, confirmPassword.
                *   Display form validation errors.
                *   Each form has a `Button` for submission, with loading state.
                *   Toggle link: "Don't have an account? Register" or "Already have an account? Login" to switch `isLogin` state.
    *   **Styling:** Apply Tailwind CSS classes for layout and visual appeal.

Provide the full TypeScript React code for `src/components/AuthModal.tsx`.
```

---

### **Prompt 4.4: Generate `src/components/ProtectedRoute.tsx` and `src/components/RequireQuiz.tsx`**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create two Higher-Order Components (HOCs) for route protection: `ProtectedRoute` and `RequireQuiz`.

**Files to Generate:**

1.  **`src/components/ProtectedRoute.tsx`**:
    *   **Imports:** `useThinkQuestStore` from '@/store/useThinkQuestStore', `Navigate`, `Outlet` from 'react-router-dom', `React`.
    *   **Component Logic:**
        *   Get `user` from `useThinkQuestStore`.
        *   If `user` is null (not logged in), redirect to `/` (home page) using `<Navigate to="/" replace />`.
        *   Otherwise, render `<Outlet />` to continue rendering nested routes.
    *   **Export:** Default export `ProtectedRoute`.

2.  **`src/components/RequireQuiz.tsx`**:
    *   **Imports:** `useThinkQuestStore` from '@/store/useThinkQuestStore', `Navigate`, `Outlet` from 'react-router-dom', `React`.
    *   **Component Logic:**
        *   Get `quiz.passed` from `useThinkQuestStore`.
        *   If `quiz.passed` is false, redirect to `/quiz` using `<Navigate to="/quiz" replace />`.
        *   Otherwise, render `<Outlet />` to continue rendering nested routes.
    *   **Export:** Default export `RequireQuiz`.

Provide the full TypeScript React code for both `src/components/ProtectedRoute.tsx` and `src/components/RequireQuiz.tsx`.
```

---

## **PROMPT CATEGORY 5: Data Files (Mock)**

**Goal:** Generate mock data files for problems, personas, and quiz questions. This data will be used by the frontend for display and initial state.

### **Prompt 5.1: Generate `src/data/mockData.ts` and `src/data/quizData.ts`**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create mock data files for the application. These files will provide static data for problems, personas, and quiz questions.

**Files to Generate:**

1.  **`src/data/mockData.ts`**:
    *   **Interfaces:**
        *   `Problem`: `id` (string), `title`, `description`, `imageUrl`, `type`, `difficulty`.
        *   `PersonaTrait`: `age` (string), `gender` (string), `occupation` (string), `location` (string), `painPoints` (string[]).
        *   `Persona`: `id` (number), `name`, `role`, `backstory`, `avatar` (path to image), `keyTraits` (PersonaTrait), `samplePrompts` (string[]).
        *   `Theme`: `title` (string), `description` (string).
    *   **`problems` Array:** Export `const problems: Problem[]`. Include at least 3 diverse problems related to common challenges (e.g., "Food Waste in Schools", "Limited Access to Clean Water", "Digital Divide in Rural Areas"). Populate all fields, including `imageUrl` (use placeholder paths like '@/assets/problem-cafeteria.jpg').
    *   **`PROBLEM_IMAGES` Object:** Export `const PROBLEM_IMAGES: Record<string, string>`. Map `problem.id` to `problem.imageUrl` for easy lookup.
    *   **`personasByProblem` Object:** Export `const personasByProblem: Record<string, Persona[]>`. Map `problem.id` to an array of 2-3 `Persona` objects relevant to that problem. Include diverse traits and pain points for each persona. Use placeholder `avatar` paths like '@/assets/avatar-jamie.jpg'.
    *   **`VERBS_FOR_HMW` Array:** Export `const VERBS_FOR_HMW: string[]`. Include a list of action verbs suitable for HMW questions (e.g., "improve", "create", "reduce", "enable").
    *   **`HMW_EXAMPLES` Array:** Export `const HMW_EXAMPLES: string[]`. Provide a few examples of well-formed HMW questions.
    *   **`generateAIResponse(type: string, data: any)` Function:**
        *   A mock function that simulates an AI response.
        *   Takes `type` ('refine', 'feedback', etc.) and `data`.
        *   Returns a mock AI response (e.g., a suggestion, list of improvements). This function is for frontend use until the real backend is integrated.
    *   **Asset Imports:** Import all images used in `problems` and `personasByProblem` from `src/assets`.

2.  **`src/data/quizData.ts`**:
    *   **`QUIZ_QUESTIONS` Array:** Export `const QUIZ_QUESTIONS`.
    *   Each question object should have: `id`, `question` (string), `options` (string[]), `correctAnswer` (string).
    *   Include at least 5 multiple-choice questions related to Design Thinking concepts (e.g., "What is the first stage of Design Thinking?", "Which of these is NOT a characteristic of a good HMW question?").

For placeholder image imports (`@/assets/...`), use actual imports at the top of the `mockData.ts` file (e.g., `import problemCafeteria from '@/assets/problem-cafeteria.jpg';`).

Provide the full TypeScript code for both `src/data/mockData.ts` and `src/data/quizData.ts`.
```

---

## **PROMPT CATEGORY 6: Backend Server (Node.js/Express/Gemini)**

**Goal:** Generate the Node.js/Express server that acts as a secure proxy for the Google Gemini API, handling AI chat interactions and AI scoring logic.

### **Prompt 6.1: Generate `server.ts` and `.env.example`**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the Node.js/Express backend server for the ThinkQuest application. This server will securely handle Google Gemini API interactions and provide API endpoints for the frontend.

**Files to Generate:**

1.  **`.env.example`**:
    *   Provide example environment variables:
        *   `GOOGLE_API_KEY=YOUR_GOOGLE_GEMINI_API_KEY`
        *   `VITE_PB_URL=YOUR_POCKETBASE_URL` (e.g., `http://127.0.0.1:8090`)
        *   `VITE_API_BASE_URL=http://localhost:3001` (frontend API base URL for consistency)

2.  **`server.ts`**:
    *   **Imports:** `express`, `cors`, `dotenv`, `GoogleGenerativeAI` from `@google/generative-ai`, `multer`. (Ensure `@google/generative-ai` is correctly imported as named imports if needed, or default).
    *   **Configuration:**
        *   Load environment variables: `dotenv.config()`.
        *   Initialize Express app.
        *   Configure CORS for frontend origin (e.g., `http://localhost:5173`).
        *   Set up JSON body parsing.
        *   Initialize `GoogleGenerativeAI` with `process.env.GOOGLE_API_KEY`.
        *   Get `gemini-pro` and `gemini-pro-vision` models.
        *   `multer` middleware for handling file uploads (for prototype stage).
    *   **Endpoint: `POST /api/gemini-chat`**:
        *   **Purpose:** Chat with an AI persona.
        *   **Request Body:** `name`, `role`, `backstory` (of persona), `question`.
        *   **Logic:**
            *   Create a generative model chat session.
            *   Construct a detailed prompt for Gemini, instructing it to role-play as the provided persona and answer the user's question.
            *   Use `startChat` and `sendMessageStream` to stream responses back to the client.
            *   Handle errors, including potential API key issues.
        *   **Response:** Streams text chunks.

    *   **Endpoint: `POST /api/gemini-score`**:
        *   **Purpose:** AI scoring and feedback for Empathize, Define, Ideate stages.
        *   **Request Body:** `stage`, `selectedProblem`, `reflection`, and stage-specific data (`empathyMapInput`, `insights`, `themes` for Empathize; `hmwList` for Define; `hmw`, `selectedTop3Ideas`, `rationaleMap` for Ideate).
        *   **Logic:**
            *   Construct a comprehensive Gemini prompt based on the `stage` and provided data.
            *   Instruct Gemini to act as an expert Design Thinking judge, provide a score (0-100), strengths, improvements, and suggestions in a JSON format.
            *   Use `gemini-pro` model.
            *   Parse Gemini's JSON response, validate its structure.
            *   Handle errors, including potential API key issues.
        *   **Response:** JSON object with `score`, `strengths`, `improvements`, `suggestions`, `overallComment`.

    *   **Endpoint: `POST /api/gemini-score-prototype`**:
        *   **Purpose:** Multimodal AI scoring and feedback for the Prototype stage.
        *   **Request Body:** `selectedIdea`, `poster` (text), `uploads` (array of objects with `name`, `base64`, `type`). Use `multer` to handle file uploads, converting them to Base64 *before* sending to Gemini.
        *   **Logic:**
            *   Construct a multimodal prompt for Gemini (`gemini-pro-vision`), combining the text description of the poster and `parts` for Base64 image data.
            *   Instruct Gemini to analyze the prototype for clarity, feasibility, alignment with the problem/idea, and visual quality, returning a score, feedback, and visual-specific comments in JSON.
            *   Handle errors.
        *   **Response:** JSON object with `score`, `strengths`, `improvements`, `suggestions`, `overallComment`, `visualFeedback` (array of objects), `addressesProblem`.

    *   **Endpoint: `POST /api/gemini-persona`**:
        *   **Purpose:** Generates specific feedback from an AI persona on the user's prototype.
        *   **Request Body:** `persona` (Persona object), `prototypeData` (selectedIdea, posterNotes, timelineNotes), `problemTitle`.
        *   **Logic:**
            *   Construct a detailed prompt for Gemini, instructing it to role-play as the `persona` and provide constructive feedback on the `prototypeData` in relation to the `problemTitle`.
            *   Use `gemini-pro` model.
            *   Handle errors.
        *   **Response:** JSON object with `feedback` (string).

    *   **Endpoint: `POST /api/complete-quest`**:
        *   **Purpose:** Finalizes the quest. This endpoint would ideally interact with PocketBase. For now, it can simulate success or be a placeholder.
        *   **Request Body:** `totalScore`, `problemId`, `userId`.
        *   **Logic:**
            *   (Placeholder for PocketBase interaction to save score and user data).
            *   Return success.
        *   **Response:** JSON confirmation.

    *   **Error Handling:** Implement basic error handling for all endpoints.
    *   **Server Start:** Listen on port 3001 (or from env, `process.env.PORT`).

Provide the full TypeScript/Node.js code for `server.ts` and the content for `.env.example`.
```

---

## **PROMPT CATEGORY 7: Stage Pages**

**Goal:** Generate the individual stage pages of the ThinkQuest application, integrating shared components, state management, and specific stage logic.

### **Prompt 7.1: Generate `src/pages/Index.tsx` (Home Page)**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the `Index` (Home) page component. This page serves as the landing point for the application.

**File to Generate:**

1.  **`src/pages/Index.tsx`**:
    *   **Imports:** `useState` from 'react', `useThinkQuestStore` from '@/store/useThinkQuestStore', `useNavigate` from 'react-router-dom', `motion` from 'framer-motion', `Button` from '@/components/ui/button', `AuthModal` from '@/components/AuthModal'.
    *   **State/Hooks:**
        *   `user`, `quiz.passed` from `useThinkQuestStore`.
        *   `useNavigate`.
        *   `showAuthModal` state (`boolean`).
    *   **`handleStartJourney` function:**
        *   If `user` is null, open `AuthModal` by setting `showAuthModal(true)`.
        *   If `user` is logged in:
            *   If `quiz.passed` is false, navigate to `/quiz`.
            *   Else, navigate to `/map`.
    *   **JSX Structure:**
        *   Main `div` with `min-h-screen flex items-center justify-center bg-cover bg-center` styling. Use a background image from `public/forest-bg.jpg` or a suitable placeholder if not provided.
        *   **Header:** (Assumed global, so don't render here).
        *   **Hero Content:**
            *   `motion.div` for animated entrance of text and button. Use `initial={{ opacity: 0, y: 50 }}` and `animate={{ opacity: 1, y: 0 }}`.
            *   Large, bold title: "Embark on Your Design Thinking Quest".
            *   Tagline: "Solve real-world problems with AI-powered guidance."
            *   `Button` for "Start Your Journey": calls `handleStartJourney`, styled `bg-primary text-primary-foreground`.
        *   **AuthModal:** Render `AuthModal` component, passing `isOpen={showAuthModal}` and `onClose={() => setShowAuthModal(false)}`.
    *   **Styling:** Apply Tailwind CSS for a visually appealing, responsive landing page. Use the app's green/yellow aesthetic.

Provide the full TypeScript React code for `src/pages/Index.tsx`.
```

---

### **Prompt 7.2: Generate `src/pages/Quiz.tsx` (Onboarding Quiz Page)**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the `Quiz` page component. This page hosts the mandatory onboarding quiz.

**File to Generate:**

1.  **`src/pages/Quiz.tsx`**:
    *   **Imports:** `useState`, `useEffect` from 'react', `useNavigate` from 'react-router-dom', `useThinkQuestStore` from '@/store/useThinkQuestStore', `motion` from 'framer-motion', `Button` from '@/components/ui/button', `RadioGroup`, `RadioGroupItem` from '@/components/ui/radio-group', `Label` from '@/components/ui/label', `Progress` from '@/components/ui/progress'. `QUIZ_QUESTIONS` from '@/data/quizData', `toast` from 'sonner'.
    *   **State/Hooks:**
        *   `user`, `quiz.passed`, `setQuizPassed` from `useThinkQuestStore`.
        *   `useNavigate`.
        *   `currentQuestionIndex` (`number`, default 0).
        *   `selectedAnswers` (`Record<number, string>`).
        *   `showResults` (`boolean`, default false).
        *   `score` (`number`, default 0).
    *   **`useEffect`:**
        *   If `!user`, navigate to `/` (redirect unauthenticated users).
        *   If `quiz.passed` is true, navigate to `/map`.
    *   **`handleAnswerSelect(questionId: number, answer: string)`:** Updates `selectedAnswers` for the current question.
    *   **`handleNextQuestion`:** Increments `currentQuestionIndex`.
    *   **`handlePreviousQuestion`:** Decrements `currentQuestionIndex`.
    *   **`handleSubmitQuiz` function:**
        *   Calculates the `score` by iterating through `QUIZ_QUESTIONS` and comparing `selectedAnswers` with `correctAnswer`.
        *   Sets `showResults` to true.
        *   If score is sufficient (e.g., >= 80% correct), call `setQuizPassed(true)` and show success toast "Quiz Passed!".
        *   Else, show failure toast "Quiz Failed. Please try again."
    *   **`handleRestartQuiz` function:** Resets `currentQuestionIndex`, `selectedAnswers`, `showResults`, `score`.
    *   **JSX Structure:**
        *   Main `div` with `min-h-screen flex flex-col items-center justify-center bg-gray-100` styling.
        *   **Header:** (Assumed global).
        *   **Quiz Card/Container:** `motion.div` for animated entrance. Styled as a prominent card.
            *   Title: "Design Thinking Onboarding Quiz".
            *   **Question Display (conditional `showResults` is false):**
                *   `Progress` bar showing `(currentQuestionIndex + 1) / QUIZ_QUESTIONS.length`.
                *   Current question number.
                *   `h2` for `QUIZ_QUESTIONS[currentQuestionIndex].question`.
                *   `RadioGroup` for options, using `handleAnswerSelect`.
                *   Navigation `Button`s: "Previous" (disabled on first question), "Next" (disabled if no answer selected for current question, or if on last question), "Submit Quiz" (only on last question).
            *   **Results Display (conditional `showResults` is true):**
                *   `h2` "Quiz Results".
                *   Display `score` and total questions.
                *   Conditional message: "Congratulations! You passed." or "Keep trying!"
                *   "Retake Quiz" `Button` (calls `handleRestartQuiz`).
                *   "Continue to Map" `Button` (only if passed, navigates to `/map`).
    *   **Styling:** Apply Tailwind CSS classes for a clean, gamified quiz interface. Use app's green/yellow theme.

Provide the full TypeScript React code for `src/pages/Quiz.tsx`.
```

---

### **Prompt 7.3: Generate `src/pages/Problems.tsx` (Problem Selection Page)**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the `Problems` page component. This page allows users to select a design thinking problem.

**File to Generate:**

1.  **`src/pages/Problems.tsx`**:
    *   **Imports:** `useThinkQuestStore` from '@/store/useThinkQuestStore', `useNavigate` from 'react-router-dom', `motion` from 'framer-motion', `Button` from '@/components/ui/button', `Card` components from Shadcn UI (`Card`, `CardHeader`, `CardContent`, `CardTitle`, `CardDescription`), `problems`, `Problem` from '@/data/mockData'.
    *   **State/Hooks:**
        *   `selectedProblem`, `selectProblem` from `useThinkQuestStore`.
        *   `useNavigate`.
    *   **`handleSelectProblem(problem: Problem)`:**
        *   Calls `selectProblem(problem)` from the store.
        *   Navigates to `/map`.
    *   **JSX Structure:**
        *   Main `div` with `min-h-screen bg-background` styling.
        *   **Header:** (Assumed global).
        *   **Page Title:** `motion.h1` for "Choose Your Quest Problem" with animated entrance.
        *   **Problem Grid:** `motion.div` for animated entrance, displaying problems in a responsive grid (`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6`).
            *   Map `problems` array.
            *   Each problem is a `Card` component.
            *   `CardHeader` for `CardTitle` (`problem.title`).
            *   `CardContent` containing `img` (`problem.imageUrl`), `CardDescription` (`problem.description`), and "Select Problem" `Button`.
            *   Highlight currently `selectedProblem` using conditional styling on the `Card`.
            *   "Select Problem" `Button` (calls `handleSelectProblem`).
    *   **Styling:** Apply Tailwind CSS for a visually engaging problem selection interface. Use app's green/yellow aesthetic.

Provide the full TypeScript React code for `src/pages/Problems.tsx`.
```

---

### **Prompt 7.4: Generate `src/pages/Map.tsx` (Stage Map Page)**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the `Map` page component. This page visually represents the Design Thinking stages and allows navigation.

**File to Generate:**

1.  **`src/pages/Map.tsx`**:
    *   **Imports:** `useThinkQuestStore` from '@/store/useThinkQuestStore', `useNavigate` from 'react-router-dom', `motion` from 'framer-motion', `Lock`, `Check` from 'lucide-react', `Button` from '@/components/ui/button', `Card` from '@/components/ui/card'.
    *   **State/Hooks:**
        *   `selectedProblem`, `unlockedStages` from `useThinkQuestStore`.
        *   `useNavigate`.
    *   **`stages` Array:** Define an array of stage objects: `id` (number, 0-indexed), `name` (string), `path` (string), `description` (string), `icon` (Lucide React component name or custom icon).
        *   Example stages: Empathize (id 0, path `/stages/empathize`), Define (id 1, path `/stages/define`), Ideate (id 2), Prototype (id 3), Test (id 4).
    *   **`handleNavigateToStage(stagePath: string, stageId: number)`:**
        *   If `unlockedStages` includes `stageId`, navigate to `stagePath`.
        *   Else, show a toast error "Stage is locked! Complete previous stages first." (use `toast` from `sonner`).
    *   **JSX Structure:**
        *   Main `div` with `min-h-screen bg-cover bg-center` styling. Use a suitable background image (`public/forest-path-mobile.png` or `public/forest-bg.jpg`).
        *   **Header:** (Assumed global).
        *   **Page Title:** `motion.h1` for "Your Design Thinking Journey" with animated entrance.
        *   **Selected Problem Display:** `Card` component displaying `selectedProblem.title`. If `!selectedProblem`, prompt user to select a problem.
        *   **Stage Grid/Layout:** `motion.div` for animated entrance.
            *   Arrange stages visually (e.g., a path, vertical stack, or grid).
            *   Map `stages` array.
            *   Each stage represented as a clickable `motion.div` or `Card`.
            *   Conditional rendering:
                *   If `stage` is locked (`!unlockedStages.includes(stage.id)`): greyed out, `Lock` icon overlay, disabled click.
                *   If `stage` is unlocked: vibrant, `Check` icon, clickable.
            *   `Button` or `motion.div` for each stage, calling `handleNavigateToStage`.
        *   **Back to Problems Button:** `Button` to navigate back to `/problems`.
    *   **Styling:** Apply Tailwind CSS for a gamified map aesthetic. Use `framer-motion` for stage animations (e.g., hover effects, entrance).

Provide the full TypeScript React code for `src/pages/Map.tsx`.
```

---

### **Prompt 7.5: Generate `src/pages/stages/Empathize.tsx` (Empathize Stage Page)**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the `Empathize` stage page component. This page guides users through persona interviews and empathy mapping.

**File to Generate:**

1.  **`src/pages/stages/Empathize.tsx`**:
    *   **Imports:** `useState`, `useRef`, `useCallback`, `useEffect` from 'react', `useNavigate` from 'react-router-dom', `motion`, `AnimatePresence` from 'framer-motion', `Confetti` from 'react-confetti'.
    *   `Header` from '@/components/Header', `StageHintModal` from '@/components/StageHintModal'.
    *   Shadcn UI components: `Button`, `Textarea`, `Dialog` (Dialog, DialogContent, DialogHeader, DialogTitle), `Progress`.
    *   `useThinkQuestStore` from '@/store/useThinkQuestStore', `personasByProblem`, `Persona` from '@/data/mockData'.
    *   `ArrowLeft`, `HelpCircle`, `Send`, `PlusCircle`, `Mic`, `Keyboard`, `Leaf` from 'lucide-react'. `toast` from 'sonner'.
    *   `stressedFemale`, `stressedMale` from '@/assets/' (for avatar images).
    *   `DndProvider`, `useDrag`, `useDrop` from 'react-dnd', `HTML5Backend` from 'react-dnd-html5-backend'. `nanoid` from 'nanoid'.
    *   **Global Type Augmentation:** Ensure `src/types.d.ts` is correctly set up for `webkitSpeechRecognition`.
    *   **`ItemTypes` Enum:** `CARD`.
    *   **`PostIt` Interface:** `id`, `text`, `column` ('post-its' | 'themes' | 'insights'), `themeName?`, `persona?`, `activity?`, `because?`, `but?`.
    *   **`Insight` Interface:** `id`, `persona`, `activity`, `because`, `but`. (Ensure Omit<Insight, 'id'> is used correctly for fields).
    *   **`PostItCardProps` & `ColumnProps` Interfaces:** Define props for sub-components (`PostItCard`, `Column`).

    *   **`PostItCard` Component:** (Internal sub-component to `Empathize`)
        *   Displays an individual draggable post-it note.
        *   Handles editing (`isEditing` state, `Textarea` or `Input`), deleting, setting theme names, and editing insight fields.
        *   Uses `useDrag`, `useDrop` for DND functionality (drag and hover logic to reorder within column).
        *   Renders different forms based on `postIt.column` (Textarea for generic, Inputs for Insight fields).
        *   Includes a delete button (`X` icon).
        *   `motion.div` for animations (`initial`, `animate`, `exit`, `whileHover`, `layout`).

    *   **`Column` Component:** (Internal sub-component to `Empathize`)
        *   A Kanban-style column (`Post-Its`, `Themes`, `Insights`).
        *   Uses `useDrop` to accept `PostItCard`s (logic to move cards between columns).
        *   Displays `PostItCard`s, handles adding new cards to its column (`PlusCircle` button).
        *   `AnimatePresence` for notes within the column.

    *   **`Empathize` Component (Main):**
        *   **State/Hooks:**
            *   `navigate`, `selectedProblem`, `updateStageData`, `unlockStage`, `addTokens`, `addStars`, `stageData`, `appendAiResponseToInterview` from `useThinkQuestStore`.
            *   `currentPersona` (`number | null`, default `null`).
            *   `chatInput` (`string`, default `''`).
            *   `empathyMapInput` (`string`, default `''`).
            *   `reflection` (`string`, default `''`).
            *   `showConfetti` (`boolean`, default `false`).
            *   `isAnalyzing` (`boolean`, default `false`).
            *   `showAnalysisDialog` (`boolean`, default `false`).
            *   `analysisResults` (object for AI feedback, including `score`, `strengths`, `improvements`, `suggestions`, `overallComment`, `errorMessage`).
            *   `showHintModal` (`boolean`, default `false`).
            *   `isVoiceMode` (`boolean`, default `false`).
            *   `isRecording` (`boolean`, default `false`).
            *   `recognitionRef` (`useRef<SpeechRecognition | null>`).
            *   `utteranceRef` (`useRef<SpeechSynthesisUtterance | null>`).
            *   `selectedVoice` (`SpeechSynthesisVoice | null`).
            *   `postIts` (`PostIt[]`, initialized from `stageData.empathy.kanbanBoard?.postIts` or defaults).
        *   **`moveCard`, `editCard`, `deleteCard`, `setThemeName`, `editInsight`, `addCard`:** `useCallback` functions for managing `postIts` state for the Kanban board.
        *   **`useEffect` (Speech API Init):**
            *   Initializes `webkitSpeechRecognition` (if available in window). Sets `onresult`, `onerror`, `onend` handlers.
            *   Loads `SpeechSynthesisVoice` (prioritizing 'en-ZA', then 'en-GB' Google voice, then any 'en').
            *   Cleans up event listeners on unmount.
        *   **`if (!selectedProblem)`:** Redirect to `/map`.
        *   **`personas`:** Derived from `personasByProblem[selectedProblem.id]`.
        *   **`getAvatarImage(avatarPath: string)`:** Maps specific avatar asset strings to imported images.
        *   **`startRecording`, `stopRecording`, `toggleVoiceMode`:** Functions for controlling voice input.
        *   **`handleInterview(personaId: number)`:** Sets `currentPersona` to open interview dialog.
        *   **`handleSendMessage` (async):**
            *   Validates `chatInput` and `currentPersona`.
            *   Constructs user question `Q: ${chatInput}` and appends to `stageData.empathy.interviews`.
            *   Adds a placeholder for AI response.
            *   Calls backend `POST /api/gemini-chat` endpoint, passing persona details and user question.
            *   Streams AI response chunks, updating the last interview entry via `appendAiResponseToInterview`.
            *   Integrates Text-to-Speech (`SpeechSynthesisUtterance`) for AI response if `isVoiceMode` is enabled, attempting to match voice gender to persona traits.
        *   **`handleAnalyze` (async):**
            *   Validates completion of all persona interviews, at least one complete insight on Kanban, and empathy map input.
            *   Formats `insights` and `themes` for AI submission.
            *   Calls backend `POST /api/gemini-score` endpoint with `stage: 'empathy'`.
            *   Parses AI response, updates `stageData` and `analysisResults`.
            *   If score >= 70, calls `unlockStage(1)`, `addTokens`, `addStars`, triggers `Confetti`, navigates to `/map`.
        *   **JSX Structure (within `DndProvider` with `HTML5Backend`):**
            *   Main `div` with `min-h-screen bg-background`.
            *   **Header:** (Assumed global).
            *   **Confetti:** Conditional rendering of `Confetti`.
            *   **Page Header:** Title "Stage 1: Empathize", "Quest in Empathy Forest".
                *   "Back to Map" `Button`.
                *   **Hint Button:** `motion.div` with green circle, waving `Leaf` icon, `onClick` to `setShowHintModal(true)`. (As standardized).
            *   **Progress Bar:** Displays interviewed count / total tasks.
            *   **"Interview Personas" Section:** Responsive grid of `motion.div` cards for each `Persona`.
                *   Displays persona image (via `getAvatarImage`), name, role, traits.
                *   "Interview" `Button` (calls `handleInterview`, variant changes if already interviewed).
            *   **"Create Your Insights" Kanban Board:** Displays instructions.
                *   Three `Column` components (`Post-Its`, `Themes`, `Insights`) for drag-and-drop functionality.
            *   **"Empathy Map" Section:** `Textarea` for `empathyMapInput`.
            *   **"Reflection" Section:** `Textarea` for `reflection`.
            *   **Actions:** "Back to Map" `Button`, "Analyze & Score" `Button` (calls `handleAnalyze`, disabled if `isAnalyzing`).
            *   **Interview Dialog:** `Dialog` for persona chat (`currentPersona !== null`).
                *   **Sidebar:** Displays detailed persona info (name, role, backstory, traits, sample prompts).
                *   **Chat Area:** Scrolls `stageData.empathy.interviews[currentPersona]` messages.
                    *   Styles messages differently for user questions (`Q:`) and AI responses (`A:`).
                *   **Input Area:** `Textarea` for `chatInput` or voice input controls (Mic/Keyboard toggle, Record/Stop recording buttons).
                *   `Send` button (`handleSendMessage`).
            *   **Analysis Results Dialog:** `Dialog` to display AI scoring results (`analysisResults`).
            *   **Stage Hint Modal:** Render `StageHintModal` component, passing `isOpen={showHintModal}`, `onClose`, `title="Empathize – How to Complete"`, `enableSound` (true), and `children` (bulleted instructions).

Provide the full TypeScript React code for `src/pages/stages/Empathize.tsx`, including all DND logic, speech API integration, and stage-specific UI/UX elements.
```

---

### **Prompt 7.6: Generate `src/pages/stages/Define.tsx` (Define Stage Page)**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the `Define` stage page component. This page guides users in defining their problem statement and generating How Might We (HMW) questions.

**File to Generate:**

1.  **`src/pages/stages/Define.tsx`**:
    *   **Imports:** `useState`, `useEffect` from 'react', `useNavigate` from 'react-router-dom', `motion`, `Confetti` from 'react-confetti'.
    *   `Header` from '@/components/Header', `StageHintModal` from '@/components/StageHintModal'.
    *   Shadcn UI components: `Button`, `Input`, `Textarea`, `Select` (Select, SelectContent, SelectItem, SelectTrigger, SelectValue), `Dialog` (Dialog, DialogContent, DialogHeader, DialogTitle), `Progress`.
    *   `useThinkQuestStore` from '@/store/useThinkQuestStore', `generateAIResponse`, `PROBLEM_IMAGES`, `problems`, `VERBS_FOR_HMW` from '@/data/mockData'.
    *   `ArrowLeft`, `HelpCircle`, `Sparkles`, `Leaf` from 'lucide-react', `toast` from 'sonner', `cn` from '@/lib/utils'.
    *   **`STOP_WORDS` Array:** Define an array of common stop words (if used for AI prompt engineering).
    *   **State/Hooks:**
        *   `navigate`, `selectedProblem`, `updateStageData`, `unlockStage`, `addTokens`, `addStars`, `stageData`, `setHmwQuestions` from `useThinkQuestStore`.
        *   `empathyThemes` from `stageData.empathy.empathyThemes`.
        *   `hmwStatement` (`string`, default `stageData.define.hmwStatement`).
        *   `reflection` (`string`, default `stageData.define.reflection`).
        *   `showConfetti` (`boolean`, default `false`).
        *   `isSubmitting` (`boolean`, default `false`).
        *   `analysisResults` (object for AI feedback).
        *   `showAnalysisDialog` (`boolean`, default `false`).
        *   `isHintModalOpen` (`boolean`, default `false`).
        *   `highlightedCardId` (`string | null`).
        *   `selectedInsight` (`any | null`).
        *   `selectedVerb` (`string`).
        *   `typedPersona` (`string`).
        *   `typedOutcome` (`string`).
        *   `hmwQuestion` (`string`).
        *   `addedHmwQuestions` (`string[]`, default `stageData.define.addedHmwQuestions`).
        *   `selectedTheme` (`any | null`).
        *   `showThemeDialog` (`boolean`).
    *   **`useEffect` (HMW Question Builder):** Constructs `hmwQuestion` string dynamically based on `selectedInsight`, `selectedVerb`, `typedPersona`, `typedOutcome`.
    *   **`if (!selectedProblem)`:** Redirect to `/map`.
    *   **`problemImage`:** Derived from `PROBLEM_IMAGES[selectedProblem.id]`.
    *   **`progress`:** Calculated based on `addedHmwQuestions.length`.
    *   **`handleRefine`:** (Mock function for AI refinement, if used - this might be removed if only backend AI is used).
    *   **`handleSubmit` (async):**
        *   Validates that at least one HMW question is added.
        *   Calls backend `POST /api/gemini-score` endpoint with `stage: 'define'`.
        *   Parses AI response, updates `stageData` with score, reflection, etc.
        *   `setHmwQuestions(addedHmwQuestions)` to pass HMWs to Ideate stage.
        *   If score >= 70, calls `unlockStage(2)`, `addTokens`, `addStars`, triggers `Confetti`. Shows success toast.
    *   **`handleCardClick(item: any)`:** Sets `selectedInsight`, `highlightedCardId`, pre-fills `typedPersona`, `typedOutcome`.
    *   **`handleAddHmw`:** Adds `hmwQuestion` to `addedHmwQuestions`, clears inputs, shows toast.
    *   **`allInsights`:** Memoized array combining empathy insights for display.
    *   **JSX Structure:**
        *   Main `div` with `min-h-screen bg-background`.
        *   **Header:** (Assumed global).
        *   **Confetti:** Conditional rendering.
        *   **Page Header:** Title "Stage 2: Define", "Define Mountain".
            *   "Back to Map" `Button`.
            *   **Hint Button:** `motion.div` with green circle, waving `Leaf` icon, `onClick` to `setIsHintModalOpen(true)`. (As standardized).
        *   **Progress Bar:** Based on HMW statements added.
        *   **Stage Hint Modal:** Render `StageHintModal` component with title "Define – How to Complete" and bulleted instructions (as per GLOBAL CONTEXT).
        *   **Main Content Area (`flex flex-col lg:flex-row gap-8`):**
            *   **Far Left Column (`lg:w-1/5`):** "Empathy Themes" (static display from `stageData.empathy.empathyThemes`). Clickable cards for themes, opening a `Dialog` (`showThemeDialog`) for more details.
            *   **Left Panel (`lg:w-2/5 sticky`):** "Your Empathy Insights". Displays `problemImage`.
                *   Maps `allInsights` into clickable `Card` components.
                *   Highlights `selectedInsight`.
            *   **Right Panel (`lg:w-2/5`):** "How Might We (HMW) Statement Builder".
                *   **Selected Empathy Insight:** Displays `selectedInsight` details.
                *   **Step 1: Create a Clear Problem Statement:** `Label`s and `Input` fields for "Type an important need (verb)", "Type a persona", "Type an insight" (`typedPersona`, `selectedVerb`, `typedOutcome`).
                *   **Step 2: Turn into a "How Might We" question:** `Label` and `Textarea` displaying live-preview `hmwQuestion`.
                *   "Add HMW" `Button` (calls `handleAddHmw`).
                *   "Added HMW Questions" list (`addedHmwQuestions`).
                *   "Score" section with `Progress` bar if `stageData.define.score` exists.
                *   **Reflection:** `Textarea` for `reflection`.
                *   **Actions:** "Back to Map" `Button`, "Submit" `Button` (calls `handleSubmit`, disabled if `isSubmitting` or no HMWs added).
        *   **Theme Details Dialog:** `Dialog` for displaying `selectedTheme` details.
        *   **Analysis Results Dialog:** `Dialog` to display AI scoring results (`analysisResults`).

Provide the full TypeScript React code for `src/pages/stages/Define.tsx`.
```

---

### **Prompt 7.7: Generate `src/pages/stages/Ideate.tsx` (Ideate Stage Page)**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the `Ideate` stage page component. This page guides users in brainstorming and selecting ideas based on their HMW questions.

**File to Generate:**

1.  **`src/pages/stages/Ideate.tsx`**:
    *   **Imports:** `useState`, `useEffect` from 'react', `useNavigate` from 'react-router-dom', `motion` from 'framer-motion', `Confetti` from 'react-confetti'.
    *   `Header` from '@/components/Header', `StageHintModal` from '@/components/StageHintModal'.
    *   Shadcn UI components: `Button`, `Input`, `Textarea`, `Checkbox`, `Progress`, `Dialog` (Dialog, DialogContent, DialogHeader, DialogTitle).
    *   `useThinkQuestStore` from '@/store/useThinkQuestStore', `PROBLEM_IMAGES` from '@/data/mockData'.
    *   `ArrowLeft`, `Plus`, `Trash2`, `Lightbulb`, `Leaf` from 'lucide-react'. `toast` from 'sonner', `cn` from '@/lib/utils'.
    *   **State/Hooks:**
        *   `navigate`, `selectedProblem`, `updateStageData`, `unlockStage`, `addTokens`, `addStars`, `stageData`, `setSelectedHmw` from `useThinkQuestStore`.
        *   `hmwQuestions` from `stageData.ideate.hmwQuestions` (or `stageData.define.addedHmwQuestions`).
        *   `selectedHmw` from `stageData.ideate.selectedHmw`.
        *   `currentIdea` (`string`).
        *   `ideas` (`string[]`, default `stageData.ideate.ideas`).
        *   `selectedTop3Ideas` (`string[]`, default `stageData.ideate.top3`).
        *   `rationaleMap` (`Record<string, string>`, default `stageData.ideate.rationale`).
        *   `reflection` (`string`, default `stageData.ideate.reflection`).
        *   `isSubmitting` (`boolean`).
        *   `showConfetti` (`boolean`).
        *   `analysisResults` (object for AI feedback).
        *   `showAnalysisDialog` (`boolean`).
        *   `isHintModalOpen` (`boolean`).
    *   **`useEffect` (Initial HMW Selection & Redirect):**
        *   If `!selectedProblem`, navigate to `/map`.
        *   If `hmwQuestions` are available and `selectedHmw` is not set, set `selectedHmw` to the first HMW question using `setSelectedHmw` from the store.
    *   **`progress` calculation:** Based on number of ideas, top 3 selected, and reflection length (e.g., Min 5 ideas for 40%, 3 top ideas for 30%, reflection for 30%).
    *   **`handleAddIdea`:** Adds `currentIdea` to `ideas` state, clears input, updates `stageData`.
    *   **`handleRemoveIdea(index: number)`:** Removes idea from `ideas`, `selectedTop3Ideas`, and `rationaleMap`, updates `stageData`.
    *   **`handleToggleTop3(idea: string)`:** Adds/removes idea from `selectedTop3Ideas`. Limits to 3 ideas. Initializes/removes rationale from `rationaleMap`.
    *   **`canProceedToNextStep`:** Boolean for requiring a minimum number of ideas (e.g., 5).
    *   **`canSubmit`:** Boolean for validating all submission criteria (3 top ideas, all rationales, reflection).
    *   **`handleSubmit` (async):**
        *   Validates `canSubmit`.
        *   Calls backend `POST /api/gemini-score` endpoint with `stage: 'ideate'`.
        *   Passes `selectedHmw`, `selectedTop3Ideas`, `rationaleMap`, `reflection`, `selectedProblem`.
        *   Parses AI response, updates `stageData` with score, strengths, improvements, etc.
        *   If score >= 70, calls `unlockStage(3)`, `addTokens`, `addStars`, triggers `Confetti`.
    *   **`handleHmwClick(hmw: string)`:** Sets `selectedHmw` in the store when an HMW question is clicked.
    *   **JSX Structure:**
        *   Main `div` with `min-h-screen bg-background`.
        *   **Header:** (Assumed global).
        *   **Confetti:** Conditional rendering.
        *   **Page Header:** Title "Stage 3: Ideate", "Ideation Storm".
            *   "Back to Map" `Button`.
            *   **Hint Button:** `motion.div` with green circle, waving `Leaf` icon, `onClick` to `setIsHintModalOpen(true)`. (As standardized).
        *   **Progress Bar:**
        *   **Stage Hint Modal:** Render `StageHintModal` component with title "Ideate – How to Complete" and bulleted instructions (as per GLOBAL CONTEXT).
        *   **Main Content Area (`flex flex-col lg:flex-row gap-8`):**
            *   **Left Column (`lg:w-[35%] sticky`):** "Your HMW Questions".
                *   Displays `problemImage` (from `PROBLEM_IMAGES`).
                *   Problem Title.
                *   Maps `hmwQuestions` (from `stageData.ideate.hmwQuestions`) into clickable `div`s.
                *   Highlights `selectedHmw`. Calls `handleHmwClick`.
            *   **Right Column (`lg:w-[65%]`):** "Ideation Process".
                *   **Selected HMW Header:** Displays `selectedHmw`.
                *   **"Generate Ideas" Section:** `Lightbulb` icon. `Textarea` for `currentIdea`, "Add Idea" `Button` (calls `handleAddIdea`).
                *   **"Your Ideas" List:** Displays `ideas` array. Each idea in a `motion.div` with a `Trash2` button to remove.
                *   **"Select Top 3 Ideas" Section:** `Checkbox`es for `ideas`, limited to 3 selections (`handleToggleTop3`). Disabled until `canProceedToNextStep` (e.g., 5 ideas added).
                *   **"Rationale for Top 3 Ideas" Section:** Appears only if `selectedTop3Ideas.length > 0`. `Textarea` for rationale for each selected idea.
                *   **"Reflection" Section:** `Textarea` for `reflection`.
                *   **Actions:** "Back to Map" `Button`, "Submit & Score" `Button` (calls `handleSubmit`, disabled if `isSubmitting` or `!canSubmit`).
        *   **Analysis Results Dialog:** `Dialog` to display AI scoring results (`analysisResults`).

Provide the full TypeScript React code for `src/pages/stages/Ideate.tsx`.
```

---

### **Prompt 7.8: Generate `src/pages/stages/Prototype.tsx` (Prototype Stage Page)**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the `Prototype` stage page component. This page guides users in building a concept poster and timeline, and uploading prototype visuals.

**File to Generate:**

1.  **`src/pages/stages/Prototype.tsx`**:
    *   **Imports:** `useState`, `useEffect`, `useRef`, `useCallback`, `useMemo` from 'react', `useNavigate` from 'react-router-dom', `motion`, `AnimatePresence` from 'framer-motion'.
    *   `Header` from '@/components/Header', `StageHintModal` from '@/components/StageHintModal'.
    *   Shadcn UI components: `Button`, `Progress`, `RadioGroup`, `RadioGroupItem`, `Label`, `Card`, `Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `Select` (Select, SelectContent, SelectItem, SelectTrigger, SelectValue), `Input`, `Textarea`.
    *   `useThinkQuestStore`, `UploadedFileMetadata` from '@/store/useThinkQuestStore'.
    *   `ArrowLeft`, `HelpCircle`, `Plus`, `X`, `Leaf`, `UploadCloud`, `FileText`, `Check` from 'lucide-react'. `toast` from 'sonner', `cn` from '@/lib/utils'.
    *   `useDrag`, `useDrop` from 'react-dnd', `useDropzone` from 'react-dropzone', `HTML5Backend` from 'react-dnd-html5-backend'.
    *   **`ItemTypes` Enum:** `NOTE`.
    *   **`NoteCardProps` Interface:** `id`, `text`, `index`, `boxId`, `moveNote`, `deleteNote`.
    *   **`NoteCard` Component:** (Internal sub-component to `Prototype`)
        *   Individual draggable sticky note. Uses `useDrag`, `useDrop` for DND, includes a delete button (`X` icon).
        *   `motion.div` for animations.
    *   **`KanbanColumnProps` Interface:** `boxId`, `title`, `notes`, `addNote`, `deleteNote`, `moveNote`, `handleDropNote`.
    *   **`KanbanColumn` Component:** (Internal sub-component to `Prototype`)
        *   A section of the Concept Poster. Displays notes, allows adding new notes (`Input`, `Plus` button), and is a drop target for notes.
    *   **`TimelineDropZoneProps` Interface:** `weekId`, `title`, `notes`, `deleteNote`, `moveNote`, `handleDropNote`.
    *   **`TimelineDropZone` Component:** (Internal sub-component to `Prototype`)
        *   A single week in the timeline, acts as a drop target. Displays notes.
    *   **`TimelineColumnProps` Interface:** `boxId`, `title`, `timelineNotes` (Record<string, string[]>), `addNoteToTimeline`, `deleteNoteFromTimeline`, `moveNote`, `handleDropNote`.
    *   **`TimelineColumn` Component:** (Internal sub-component to `Prototype`)
        *   Container for the 6-week timeline (`flex flex-grow gap-2 overflow-x-auto`).
        *   Displays `TimelineDropZone`s for each week.
        *   Includes a single input (`Input`, `Select` for week, `Button`) to add notes to a selected week in the timeline.

    *   **`Prototype` Component (Main):**
        *   **State/Hooks:**
            *   `navigate`, `selectedProblem`, `stageData`, `updateStageData`, `unlockStage`, `addTokens`, `addStars` from `useThinkQuestStore`.
            *   `ideateTop3`, `ideateRationaleMap` from `stageData.ideate`.
            *   `posterNotes`, `timelineNotes`, `uploadedFiles`, `uploadedPreviews` from `stageData.prototype`.
            *   `selectedIdea` (`string`, default `stageData.prototype.selectedIdea`).
            *   `progress` (calculated, e.g., 50% if idea selected, more for content).
            *   `isSubmitting` (`boolean`).
            *   `showConfetti` (`boolean`).
            *   `analysisResults` (object for AI feedback, including `visualFeedback`, `addressesProblem`).
            *   `showAnalysisDialog` (`boolean`).
            *   `showDigitalSolutionWarning` (`boolean`).
            *   `isHintModalOpen` (`boolean`).
        *   **`isDigitalSolution` (`useMemo`):** Detects if `selectedIdea` contains keywords like 'app', 'website', 'digital'.
        *   **`onDrop(acceptedFiles: File[])` (`useCallback`):**
            *   Handles file uploads using `react-dropzone`.
            *   Filters for allowed types (JPG, PNG, PDF), limits to 5 files, size limit (5MB).
            *   Creates `UploadedFileMetadata` and updates `stageData.prototype.uploads` and `uploadedPreviews`.
            *   Dismisses `showDigitalSolutionWarning` if files are uploaded.
        *   **`useDropzone` hook:** Configured with `onDrop`, `accept` (image/jpeg, image/png, application/pdf), `maxFiles`, `maxSize`, `multiple`.
        *   **`handleRemoveFile(fileName: string)`:** Removes file from `uploadedFiles` and cleans up `URL.revokeObjectURL`.
        *   **`useEffect` (Cleanup Preview URLs):** Revokes `objectURL`s on component unmount.
        *   **`fileToBase64(file: File)`:** Helper function to convert `File` objects to Base64 strings (Promise).
        *   **`handleSubmit` (async):**
            *   Checks `isDigitalSolution` and `uploadedFiles.length` for digital solution warning, prevents submission if warning is active.
            *   Shows loading toast "AI analyzing your poster + files...".
            *   Constructs `posterContent` from `posterNotes` and `timelineNotes`.
            *   Converts `uploadedFiles` to Base64 using `fileToBase64`.
            *   Calls backend `POST /api/gemini-score-prototype` endpoint.
            *   Parses AI response, updates `stageData` and `analysisResults` (including `visualFeedback`, `addressesProblem`).
            *   If score >= 70, calls `unlockStage(4)`, `addTokens`, `addStars`, triggers `Confetti`.
            *   Handles errors and loading toasts.
        *   **`handleIdeaSelection(idea: string)`:** Sets `selectedIdea` and updates `stageData`.
        *   **`addNoteToPoster`, `deleteNoteFromPoster` (`useCallback`):** For managing notes in Concept Poster.
        *   **`addNoteToTimeline`, `deleteNoteFromTimeline` (`useCallback`):** For managing notes in Timeline.
        *   **`moveNote` (`useCallback`):** Handles DND logic for moving notes within or between poster boxes and timeline weeks.
        *   **`handleDropNote` (`useCallback`):** Handles dropping notes from one box/week to another.
        *   **`if (!selectedProblem)`:** Redirect to `/map`.
        *   **JSX Structure (within `DndProvider` with `HTML5Backend`):**
            *   Main `div` with `min-h-screen bg-background`.
            *   **Header:** (Assumed global).
            *   **Confetti:** Conditional rendering.
            *   **Page Header:** Title "Stage 4: Prototype", "Concept Poster".
                *   "Back to Map" `Button`.
                *   **Hint Button:** `motion.div` with green circle, waving `Leaf` icon, `onClick` to `setIsHintModalOpen(true)`. (As standardized).
            *   **Progress Bar:**
            *   **Stage Hint Modal:** Render `StageHintModal` component with title "Prototype – How to Complete" and bulleted instructions (as per GLOBAL CONTEXT).
            *   **"Select Your Idea" Section:** Displays `ideateTop3` ideas as `RadioGroup` options.
                *   Highlights `selectedIdea`.
            *   **"Selected Idea Card":** Displays `selectedIdea` and its rationale in a `Card`.
            *   **"Sci-Bono Concept Poster":** `div` with `grid grid-rows-3 grid-cols-3` layout.
                *   Nine `KanbanColumn` components for each poster section (Concept Name, Who is it for, Problem Solved, Big Idea, How it Works, Why Might It Fail, Prototype & Test, Measure Success, Make Happen).
                *   One `TimelineColumn` component for the 6-week timeline (spans 3 columns).
            *   **"File Upload Section":**
                *   Informational `Card` with `Leaf` icon and instructions for uploading wireframes/photos.
                *   `div` for `react-dropzone` (`getRootProps`, `getInputProps`), with drag-active styling.
                *   Displays uploaded files as previews (`img` for images, `FileText` icon for PDF) with remove `Button`.
                *   Conditional warning `showDigitalSolutionWarning`.
            *   **Actions:** "Back to Map" `Button`, "Submit Poster" `Button` (calls `handleSubmit`, disabled if `isSubmitting` or `!selectedIdea`).
            *   **Analysis Results Dialog:** `Dialog` to display AI scoring results (`analysisResults`), including `visualFeedback`.

Provide the full TypeScript React code for `src/pages/stages/Prototype.tsx`.
```

---

### **Prompt 7.9: Generate `src/pages/stages/Test.tsx` (Test Stage Page)**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the `Test` stage page component. This is the final stage where users receive feedback and reflect on their journey.

**File to Generate:**

1.  **`src/pages/stages/Test.tsx`**:
    *   **Imports:** `useState`, `useEffect` from 'react', `useNavigate` from 'react-router-dom', `motion`, `AnimatePresence` from 'framer-motion'.
    *   `Header` from '@/components/Header', `StageHintModal` from '@/components/StageHintModal'.
    *   Shadcn UI components: `Button`, `Progress`, `Textarea`, `Dialog` (Dialog, DialogContent, DialogHeader, DialogTitle).
    *   `useThinkQuestStore` from '@/store/useThinkQuestStore', `ArrowLeft`, `HelpCircle`, `Leaf` from 'lucide-react'.
    *   `personasByProblem`, `Persona` from '@/data/mockData'.
    *   `toast` from 'sonner'.
    *   **`PrototypeData` Interface:** (Re-define or import from `useThinkQuestStore` if available globally) `selectedIdea`, `posterNotes` (Record<string, string[]>), `timelineNotes` (Record<string, string[]>).
    *   **`DisplayNoteCardProps` Interface:** `id`, `text`.
    *   **`DisplayNoteCard` Component:** (Internal sub-component)
        *   Displays a static note, used for the Concept Poster and Timeline. `motion.div` for animations.
    *   **`DisplayKanbanColumnProps` Interface:** `boxId`, `title`, `notes`.
    *   **`DisplayKanbanColumn` Component:** (Internal sub-component)
        *   Displays a static column of notes for the Concept Poster.
    *   **`DisplayTimelineColumnProps` Interface:** `timelineNotes` (Record<string, string[]>).
    *   **`DisplayTimelineColumn` Component:** (Internal sub-component)
        *   Displays the static 6-week timeline with notes.
    *   **`PersonaFeedbackCardProps` Interface:** `persona` (Persona), `prototypeData` (PrototypeData), `problemTitle`.
    *   **`PersonaFeedbackCard` Component:** (Internal sub-component)
        *   Fetches AI feedback for a given persona and prototype data using `POST /api/gemini-persona` endpoint.
        *   Displays persona avatar, name, role, and the AI-generated feedback.
        *   Handles `isLoading`, `error` states. Speech bubble styling for feedback. Uses `useEffect` for fetching.

    *   **`Test` Component (Main):**
        *   **State/Hooks:**
            *   `navigate`, `selectedProblem`, `stageData`, `updateStageData`, `addTokens`, `addStars`, `user` from `useThinkQuestStore`.
            *   `showConfetti` (`boolean`).
            *   `isHintModalOpen` (`boolean`).
        *   **`progress`:** Always 100% for this final stage.
        *   **`useEffect` (Problem Selection):** If `!selectedProblem`, navigate to `/map`.
        *   **`handleSubmit` (async - "Complete Quest"):**
            *   Validates `user` and `selectedProblem`.
            *   Calculates `totalScore` from all `stageData` scores.
            *   Calls backend `POST /api/complete-quest` endpoint.
            *   Awards `tokens` and `stars` based on `totalScore`.
            *   Triggers `Confetti`. Shows success toast.
        *   **JSX Structure:**
            *   Main `div` with `min-h-screen bg-background`.
            *   **Header:** (Assumed global).
            *   **Confetti:** Conditional rendering.
            *   **Page Header:** Title "Stage 5: Test – Get Feedback & Reflect", "Feedback and Reflection".
                *   "Back to Map" `Button`.
                *   **Hint Button:** `motion.div` with green circle, waving `Leaf` icon, `onClick` to `setIsHintModalOpen(true)`. (As standardized).
            *   **Progress Bar:**
            *   **Stage Hint Modal:** Render `StageHintModal` component with title "Test – Final Stage" and bulleted instructions (as per GLOBAL CONTEXT).
            *   **"Your Prototype Poster Display" Section:** `motion.div` for animated entrance.
                *   Title: "Your Prototype".
                *   Displays the Concept Poster using `DisplayKanbanColumn` components for each section, showing `stageData.prototype.posterNotes`.
                *   Displays the Timeline using `DisplayTimelineColumn` component, showing `stageData.prototype.timelineNotes`.
                *   (Optionally display uploaded images from `stageData.prototype.uploadedPreviews` if available).
            *   **"Persona Feedback" Section:** `motion.div` for animated entrance.
                *   Title: "Persona Feedback".
                *   Maps `personasByProblem[selectedProblem.id]` to render `PersonaFeedbackCard` for each persona, passing `prototypeData` (from `stageData.prototype`) and `problemTitle`.
            *   **"Final Reflection" Section:** `motion.div` for animated entrance.
                *   Title: "Final Reflection".
                *   `Textarea` for `stageData.test.reflection`, allowing user to write their final thoughts. Includes character count/minimum validation.
            *   **"Final Submission" Section:** `motion.div` for animated entrance.
                *   Title: "Final Submission".
                *   "Complete Quest" `Button` (calls `handleSubmit`, disabled if reflection is too short).
        *   **Confetti:** (Assumed global).

Provide the full TypeScript React code for `src/pages/stages/Test.tsx`, including all display components for poster/timeline and PersonaFeedbackCard logic.
```

---

## **PROMPT CATEGORY 8: Other Pages & Components**

**Goal:** Generate the remaining application pages and any other necessary components.

### **Prompt 8.1: Generate `src/pages/Leaderboard.tsx` and `src/pages/NotFound.tsx`**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to create the `Leaderboard` and `NotFound` page components.

**Files to Generate:**

1.  **`src/pages/Leaderboard.tsx`**:
    *   **Imports:** `useState`, `useEffect` from 'react', `useThinkQuestStore` from '@/store/useThinkQuestStore', `useNavigate` from 'react-router-dom', `motion` from 'framer-motion', `Table` components from Shadcn UI (`Table`, `TableHeader`, `TableRow`, `TableHead`, `TableBody`, `TableCell`).
    *   **State/Hooks:**
        *   `pb` from `useThinkQuestStore`.
        *   `navigate`.
        *   `leaderboardData` state (`any[]`, initialized empty).
        *   `isLoading` state (`boolean`, default true).
        *   `error` state (`string | null`, default null).
    *   **`useEffect` (Fetch Leaderboard Data):**
        *   Fetches data from PocketBase (`pb.collection('users').getFullList({ sort: '-total_score' })`) or a dedicated 'leaderboard' collection.
        *   Maps PocketBase records to a more suitable format for display.
        *   Updates `leaderboardData` state.
        *   Handles `isLoading` and `error` states.
    *   **JSX Structure:**
        *   Main `div` with `min-h-screen bg-background`.
        *   **Header:** (Assumed global).
        *   **Page Title:** `motion.h1` for "Global ThinkQuest Leaderboard" with animated entrance.
        *   **Loading/Error State:** Conditional rendering for loading spinner or error message.
        *   **Leaderboard Table:** `motion.div` for animated entrance.
            *   Use Shadcn UI `Table` components.
            *   Columns: Rank, Username, Total Score, Problems Solved, Stars, Tokens.
            *   Maps `leaderboardData` to `TableRow`s.
    *   **Styling:** Apply Tailwind CSS for a clean, competitive display.

2.  **`src/pages/NotFound.tsx`**:
    *   **Imports:** `useNavigate` from 'react-router-dom', `motion` from 'framer-motion', `Button` from '@/components/ui/button'.
    *   **Component Logic:**
        *   `useNavigate`.
        *   `handleGoHome` function: Navigates to `/`.
    *   **JSX Structure:**
        *   Full-screen `div` with `min-h-screen flex flex-col items-center justify-center bg-background text-foreground` styling.
        *   `motion.h1` with animated entrance for "404 - Page Not Found".
        *   Descriptive message: "Oops! The quest path you followed led to uncharted territory."
        *   "Go Home" `Button` that calls `handleGoHome`, styled `bg-primary text-primary-foreground`.
    *   **Styling:** Simple, clear, and consistent with the app's aesthetic.

Provide the full TypeScript React code for both `src/pages/Leaderboard.tsx` and `src/pages/NotFound.tsx`.
```

---

### **Prompt 8.2: Generate `src/components/ProblemDetailsOverlay.tsx`, `src/components/Avatar3DViewer.tsx`, `src/components/RPMCreatorModal.tsx`**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", your task is to generate additional utility and display components.

**Files to Generate:**

1.  **`src/components/ProblemDetailsOverlay.tsx`**:
    *   **Imports:** `Dialog` components from Shadcn UI (`Dialog`, `DialogContent`, `DialogHeader`, `DialogTitle`, `DialogDescription`), `Button`, `useThinkQuestStore`, `React`, `useNavigate` from 'react-router-dom'. `Problem` interface from `useThinkQuestStore`.
    *   **`ProblemDetailsOverlayProps` Interface:** `isOpen: boolean; onClose: () => void; problem: Problem | null;`
    *   **Component Logic:**
        *   Get `selectProblem` from `useThinkQuestStore`.
        *   `useNavigate`.
        *   `handleSelectAndClose`: Calls `selectProblem(problem)`, then `onClose()`, then navigates to `/map`.
    *   **JSX Structure:**
        *   **Dialog Component:** `<Dialog open={isOpen} onOpenChange={onClose}>`. Render `null` if `!problem`.
        *   `DialogContent`:
            *   `DialogHeader` with `DialogTitle` (`problem.title`).
            *   Image: `img src={problem.imageUrl}`.
            *   `DialogDescription`: `problem.description`.
            *   "Start Quest with this Problem" `Button` (calls `handleSelectAndClose`).
            *   Close button (`X` icon).
    *   **Styling:** Responsive and visually appealing.

2.  **`src/components/Avatar3DViewer.tsx`**:
    *   **Imports:** `useRef`, `Suspense` from 'react', `Canvas` from '@react-three/fiber', `OrbitControls`, `useGLTF`, `Box`, `Html` from '@react-three/drei', `three`.
    *   **`Avatar3DViewerProps` Interface:** `glbUrl: string; fallbackImageUrl?: string; size?: number;`.
    *   **Component Logic:**
        *   `useGLTF` to load GLB model.
        *   Error handling for GLB loading (e.g., display fallback image if GLB fails).
    *   **JSX Structure:**
        *   `div` wrapper (`w-full h-full` or specified `size`).
        *   `Canvas` for 3D rendering (`camera={{ position: [0, 1.5, 3], fov: 75 }}`).
        *   `Suspense fallback={fallbackImageUrl ? <img src={fallbackImageUrl} /> : <Html>Loading 3D Model...</Html>}`
        *   **Model Renderer Component (internal):**
            *   Loads `useGLTF(glbUrl)`.
            *   Renders `model.scene` in `primitive` (scaled and positioned).
            *   `OrbitControls` for user interaction.
            *   `ambientLight`, `spotLight` for illumination.
    *   **Styling:** Configurable size, centered.

3.  **`src/components/RPMCreatorModal.tsx`**:
    *   **Imports:** `useState`, `useEffect` from 'react', `Dialog` components from Shadcn UI, `useThinkQuestStore`, `useReadyPlayerMe` from '@readyplayerme/react-avatar-creator', `toast` from 'sonner', `Button`. `User` interface from `useThinkQuestStore`.
    *   **`RPMCreatorModalProps` Interface:** `isOpen: boolean; onClose: () => void;`.
    *   **Component Logic:**
        *   `pb`, `user`, `setUser` from `useThinkQuestStore`.
        *   `onAvatarExported` callback:
            *   Receives `avatarUrl`.
            *   Updates `user.avatarUrl` in `useThinkQuestStore`.
            *   Saves `avatarUrl` to PocketBase user record (`pb.collection('users').update(user.id, { avatarUrl })`).
            *   Shows success toast.
            *   Closes modal.
        *   `useReadyPlayerMe` hook provides `iframeSrc` and `onAvatarExported` event listener setup.
        *   Handles loading state for the iframe.
    *   **JSX Structure:**
        *   **Dialog Component:** `Dialog open={isOpen} onOpenChange={onClose}`.
        *   `DialogContent`:
            *   Title: "Create Your Avatar".
            *   Render the Ready Player Me iframe (`iframeSrc`).
            *   Loading indicator while iframe loads.
            *   Close button (`Button` with `X` icon).
    *   **Styling:** Full-width, full-height for the iframe, responsive.

Provide the full TypeScript React code for all three files: `src/components/ProblemDetailsOverlay.tsx`, `src/components/Avatar3DViewer.tsx`, and `src/components/RPMCreatorModal.tsx`.
```

---

## **PROMPT CATEGORY 9: Refinement and Polish**

**Goal:** Address any remaining UI, accessibility, or integration details. This category will involve smaller, targeted prompts as needed once the core application is built.

### **Prompt 9.1: Refine Global Styles and Theming**

```text
Based on the "GLOBAL CONTEXT: ThinkQuest Application Specification", review and refine the global styling in `src/index.css`.

**File to Refine:**

1.  **`src/index.css`**:
    *   Ensure the custom CSS variables for Shadcn UI colors are correctly set for both light and dark modes (using `@media (prefers-color-scheme: dark)`).
    *   Verify that the `body` styles (e.g., `font-family`, `background-color`) align with the app's aesthetic.
    *   Add any global utility classes or base styles that might be missing for overall theme consistency.

Provide the full and updated content for `src/index.css`.
```

---

**Instructions for the User (when using these prompts):**

1.  **Start with Project Setup:** Begin by submitting Prompt 1.1 to Google AI Studio.
2.  **Iterate Categories:** Move through the categories sequentially.
3.  **One Prompt at a Time:** Submit only one detailed prompt at a time to Google AI Studio.
4.  **Review and Integrate:** After each prompt generates code, carefully review it. You will need to copy the generated code into the specified file paths within your project.
5.  **Manual Adjustments:** Be prepared to make minor manual adjustments. AI-generated code might need slight tweaks for perfect integration (e.g., resolving conflicting imports, adjusting a specific path, or handling edge cases).
6.  **Assets:** You will need to provide the actual image (`.jpg`, `.png`), 3D model (`.glb`), and audio (`.mp3`) assets in the `public/` or `src/assets/` folders as referenced in the prompts and `SPEC.md`. For a quick start, you can use placeholder images/audio.
7.  **PocketBase Setup:** Set up your PocketBase instance and update the `.env` file with `VITE_PB_URL` and `GOOGLE_API_KEY`.
8.  **Backend Dependencies:** After generating `package.json` for the backend, remember to run `npm install` in your `server` directory (or wherever `server.ts` resides) and install `ts-node` globally or locally if not already done.
9.  **Vite API Base URL:** Ensure the `VITE_API_BASE_URL` in your frontend's `.env` (or `import.meta.env`) correctly points to where your Node.js backend (`server.ts`) is running.

By following these detailed prompts and the iterative process, you should be able to effectively rebuild the ThinkQuest application using Google AI Studio.
