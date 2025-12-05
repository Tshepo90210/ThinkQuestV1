import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RequireQuiz } from "./components/RequireQuiz";
import Index from "./pages/Index";
import Problems from "./pages/Problems";
import Map from "./pages/Map";
import Quiz from "./pages/Quiz";
import Empathize from "./pages/stages/Empathize";
import Define from "./pages/stages/Define";
import Ideate from "./pages/stages/Ideate";
import Prototype from "./pages/stages/Prototype";
import Test from "./pages/stages/Test";
import Leaderboard from "./pages/Leaderboard"; // Added this line
import NotFound from "./pages/NotFound";
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <DndProvider backend={HTML5Backend}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/quiz" element={<ProtectedRoute><Quiz /></ProtectedRoute>} /> {/* Added for Quiz page */}
            {/* Routes requiring quiz completion */}
            <Route element={<ProtectedRoute><RequireQuiz /></ProtectedRoute>}>
              <Route path="/problems" element={<Problems />} />
              <Route path="/map" element={<Map />} />
              <Route path="/stages/empathize" element={<Empathize />} />
              <Route path="/stages/define" element={<Define />} />
              <Route path="/stages/ideate" element={<Ideate />} />
              <Route path="/stages/prototype" element={<Prototype />} />
              <Route path="/stages/test" element={<Test />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
            </Route>
            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </DndProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
