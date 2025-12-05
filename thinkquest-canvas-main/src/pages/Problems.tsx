import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Header } from '@/components/Header';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useThinkQuestStore } from '@/store/useThinkQuestStore';
import { problems } from '@/data/mockData';
import { Search, ArrowRight } from 'lucide-react';
import rsaProblems from '@/assets/rsa problems.png';
import loadshedding from '@/assets/loadshedding.png';
import noWater from '@/assets/no water.png';
import walkingStudent from '@/assets/walking stuudent.png';
import languageBarrier from '@/assets/language barrier.png';
import practicalSkills from '@/assets/practical skills.png';
import bully from '@/assets/bully.png';
import mentalHealth from '@/assets/mental health.png';
import disabledKids from '@/assets/disabled kids.png'; // Import the new image
import ProblemDetailsOverlay from '@/components/ProblemDetailsOverlay';

const Problems = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);
  const [expandedProblemId, setExpandedProblemId] = useState<number | null>(null);
  const { selectProblem } = useThinkQuestStore();
  const navigate = useNavigate();

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch = problem.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          problem.context.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = !selectedFilter || problem.category === selectedFilter || problem.difficulty === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleSelectProblem = (problem: typeof problems[0]) => {
    selectProblem(problem);
    navigate('/map');
  };

  const filters = ['Current problems', 'Moderate'];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <div className="container max-w-6xl mx-auto px-4 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold text-primary">
              Choose Your Quest!
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Select a real-world problem to solve using design thinking
            </p>
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for quests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 h-12 text-lg bg-muted/50"
              />
            </div>

            <div className="flex gap-2 flex-wrap">
              {filters.map((filter) => (
                <Badge
                  key={filter}
                  variant={selectedFilter === filter ? "default" : "outline"}
                  className="cursor-pointer px-4 py-2 text-sm"
                  onClick={() => setSelectedFilter(selectedFilter === filter ? null : filter)}
                >
                  {filter}
                </Badge>
              ))}
            </div>
          </div>

          {/* Problems Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredProblems.map((problem, index) => (
              <motion.div
                key={problem.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-card rounded-2xl overflow-hidden shadow-card hover:shadow-elevated transition-all duration-300 border border-border/50">
                  {/* Image */}
                  <div className="relative h-96 overflow-hidden">
                    <motion.img
                      src={problem.image || rsaProblems} // Use problem.image or fallback to rsaProblems
                      alt={problem.title}
                      className="w-full h-full object-cover"
                      whileHover={{ scale: 1.05 }}
                      transition={{ duration: 0.3 }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                    <div className="absolute bottom-3 left-3 right-3 flex gap-2">
                      <Badge className="bg-primary/90">{problem.category}</Badge>
                      <Badge variant="secondary" className="bg-secondary/90 text-secondary-foreground">
                        {problem.difficulty}
                      </Badge>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-xl font-bold group-hover:text-primary transition-colors">
                      {problem.title}
                    </h3>
                    <p className="text-muted-foreground">
                      {problem.context.substring(0, 150)}...
                    </p>
                    <Button
                      variant="link"
                      className="px-0 text-primary hover:text-primary-dark"
                      onClick={() => setExpandedProblemId(problem.id)}
                    >
                      Read More
                    </Button>
                    <Button
                      onClick={() => handleSelectProblem(problem)}
                      className="w-full group-hover:bg-primary group-hover:text-primary-foreground"
                    >
                      Select Quest
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredProblems.length === 0 && (
            <div className="text-center py-12">
              <p className="text-lg text-muted-foreground">No quests found. Try adjusting your search or filters.</p>
            </div>
          )}
        </motion.div>
      </div>

      {expandedProblemId !== null && (
        <ProblemDetailsOverlay
          problem={problems.find((p) => p.id === expandedProblemId) || null}
          onClose={() => setExpandedProblemId(null)}
        />
      )}
    </div>
  );
};

export default Problems;
