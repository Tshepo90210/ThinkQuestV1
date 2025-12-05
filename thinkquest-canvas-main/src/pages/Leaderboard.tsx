import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';
import { ArrowLeft, HelpCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from 'sonner';

interface LeaderboardEntry {
  rank: number;
  avatar: string;
  username: string;
  problemTitle: string;
  solutionIdea: string;
  totalScore: number;
}

const Leaderboard = () => {
  const navigate = useNavigate();
  const { selectedProblem } = useThinkQuestStore();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      if (!selectedProblem) {
        setError('No problem selected to display leaderboard.');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/api/leaderboard?problemId=${selectedProblem.id}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch leaderboard data');
        }
        const data = await response.json();
        setLeaderboardData(data);
      } catch (err: any) {
        console.error('Error fetching leaderboard:', err);
        setError(err.message || 'Failed to load leaderboard.');
        toast.error(`Error: ${err.message || 'Failed to load leaderboard.'}`);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [selectedProblem]);

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
                <h1 className="text-3xl font-bold">Leaderboard – Top Innovators</h1>
                <p className="text-muted-foreground">See how you stack up against other problem solvers!</p>
              </div>
            </div>
            <Button variant="outline" size="icon">
              <HelpCircle className="h-4 w-4" />
            </Button>
          </div>

          {/* Leaderboard Table */}
          <div className="bg-white/80 rounded-xl p-4 shadow-lg overflow-x-auto">
            {isLoading && <p className="text-center text-gray-600">Loading leaderboard...</p>}
            {error && <p className="text-center text-red-500">Error: {error}</p>}
            {!isLoading && !error && leaderboardData.length === 0 && (
              <p className="text-center text-gray-600">No entries yet. Be the first to complete a quest!</p>
            )}
            {!isLoading && !error && leaderboardData.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-600 hover:bg-green-700 text-white">
                    <TableHead className="text-white">Rank</TableHead>
                    <TableHead className="text-white">Avatar</TableHead>
                    <TableHead className="text-white">Username</TableHead>
                    <TableHead className="text-white">Problem</TableHead>
                    <TableHead className="text-white">Solution</TableHead>
                    <TableHead className="text-white">Total Score</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leaderboardData.map((entry) => (
                    <TableRow key={entry.rank}>
                      <TableCell className="font-medium">{entry.rank}</TableCell>
                      <TableCell>
                        <img src={entry.avatar} alt={entry.username} className="w-8 h-8 rounded-full object-cover" />
                      </TableCell>
                      <TableCell>{entry.username}</TableCell>
                      <TableCell>{entry.problemTitle}</TableCell>
                      <TableCell>{entry.solutionIdea}</TableCell>
                      <TableCell>{entry.totalScore}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

        </motion.div>
      </div>
    </div>
  );
};

export default Leaderboard;