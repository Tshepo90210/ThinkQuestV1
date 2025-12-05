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
    *   `appendAiResponseToInterview`: Manages streamed AI responses during interviews.

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
        *   Sends the prompt to Google Gemini API.
        *   Parses Gemini's response to extract a `score`, `strengths`, `improvements`, `suggestions`, and `overallComment`.
    *   **Output:** JSON object containing `score`, `strengths`, `improvements`, `suggestions`, `overallComment`.

*   **`POST /api/gemini-score-prototype`:**
    *   **Purpose:** Handles multimodal AI scoring and feedback for the Prototype stage.
    *   **Input:** `stage: 'prototype'`, `selectedIdea`, `poster` (text content), `uploads` (array of Base64 encoded files with `name`, `base64`, `type`).
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

## 9. Conclusion

ThinkQuest provides a robust and interactive platform for learning Design Thinking. Its modular architecture, reliance on modern web technologies, and strategic integration of Google Gemini AI make it a powerful tool for education and innovation. Rebuilding or extending this project will involve careful attention to prompt engineering, secure API management, and maintaining a consistent, engaging user experience.
