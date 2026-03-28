// src/pages/flashcards/FlashcardsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Brain,
  Plus,
  Sparkles,
  Play,
  Edit,
  Trash2,
  Calendar,
  TrendingUp,
  Star,
  Zap
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { flashcardService } from '@/services/flashcardService';
import CreateFlashcardDialog from '@/components/flashcards/CreateFlashcardDialog';
import GenerateFlashcardsDialog from '@/components/flashcards/GenerateFlashcardsDialog';

const FlashcardsPage = () => {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [flashcardsData, statsData] = await Promise.all([
        flashcardService.getAll(),
        flashcardService.getStats()
      ]);
      setFlashcards(flashcardsData.flashcards || []);
      setStats(statsData.stats || {});
    } catch (error) {
      console.error('Failed to load flashcards:', error);
      toast.error('Failed to load flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this flashcard?')) return;

    try {
      await flashcardService.delete(id);
      toast.success('Flashcard deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete flashcard');
    }
  };

  const handleStartReview = () => {
    navigate('/flashcards/review');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-text-dark dark:text-foreground mb-2">
            <span className="text-green-700">Flashcards</span> & Review
          </h1>
          <p className="text-text-medium dark:text-muted-foreground">
            Master your knowledge with spaced repetition
          </p>
        </div>

        <div className="flex gap-2">
          {stats && stats.dueToday > 0 && (
            <Button
              onClick={handleStartReview}
              className="bg-gradient-to-r from-green-500 to-emerald-500 gap-2"
            >
              <Play className="w-5 h-5" />
              Review ({stats.dueToday})
            </Button>
          )}

          <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Sparkles className="w-5 h-5" />
                AI Generate
              </Button>
            </DialogTrigger>
            <GenerateFlashcardsDialog
              onSuccess={() => {
                setGenerateDialogOpen(false);
                loadData();
              }}
              onClose={() => setGenerateDialogOpen(false)}
            />
          </Dialog>

          <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-forest to-forest-light gap-2">
                <Plus className="w-5 h-5" />
                Create
              </Button>
            </DialogTrigger>
            <CreateFlashcardDialog
              onSuccess={() => {
                setCreateDialogOpen(false);
                loadData();
              }}
              onClose={() => setCreateDialogOpen(false)}
            />
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Cards"
            value={stats.totalCards || 0}
            icon={Brain}
            color="blue"
          />
          <StatsCard
            title="Due Today"
            value={stats.dueToday || 0}
            icon={Calendar}
            color="orange"
          />
          <StatsCard
            title="Mastered"
            value={stats.mastered || 0}
            icon={Star}
            color="yellow"
          />
          <StatsCard
            title="Total Reviews"
            value={stats.totalReviews || 0}
            icon={TrendingUp}
            color="green"
          />
        </div>
      )}

      {/* Learning Progress */}
      {stats && stats.totalCards > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Learning Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">New</span>
                  <span className="text-sm text-text-medium">{stats.new || 0}</span>
                </div>
                <Progress value={(stats.new / stats.totalCards) * 100} className="h-2" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Learning</span>
                  <span className="text-sm text-text-medium">{stats.learning || 0}</span>
                </div>
                <Progress value={(stats.learning / stats.totalCards) * 100} className="h-2 bg-blue-200" />
              </div>
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Mastered</span>
                  <span className="text-sm text-text-medium">{stats.mastered || 0}</span>
                </div>
                <Progress value={(stats.mastered / stats.totalCards) * 100} className="h-2 bg-green-200" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Flashcards List */}
      {flashcards.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashcards.map((flashcard) => (
            <FlashcardCard
              key={flashcard._id}
              flashcard={flashcard}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-12 text-center">
            <Brain className="w-16 h-16 text-text-light mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No flashcards yet</h3>
            <p className="text-text-medium mb-4">
              Create your first flashcard or generate them with AI
            </p>
            <div className="flex gap-2 justify-center">
              <Button onClick={() => setCreateDialogOpen(true)}>
                Create Flashcard
              </Button>
              <Button variant="outline" onClick={() => setGenerateDialogOpen(true)}>
                <Sparkles className="w-4 h-4 mr-2" />
                AI Generate
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    orange: 'from-orange-500 to-orange-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-text-dark dark:text-foreground">
            {value}
          </div>
        </div>
        <div className="text-sm font-medium text-text-medium">{title}</div>
      </CardContent>
    </Card>
  );
};

// Flashcard Card Component
const FlashcardCard = ({ flashcard, onDelete }) => {
  const [flipped, setFlipped] = useState(false);

  const difficultyColors = {
    easy: 'bg-green-500/10 text-green-600 border-green-500/20',
    medium: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    hard: 'bg-red-500/10 text-red-600 border-red-500/20'
  };

  const getDueStatus = () => {
    const now = new Date();
    const nextReview = new Date(flashcard.nextReview);
    
    if (nextReview <= now) {
      return { text: 'Due now', color: 'text-red-500' };
    }
    
    const daysDiff = Math.ceil((nextReview - now) / (1000 * 60 * 60 * 24));
    
    if (daysDiff === 0) {
      return { text: 'Due today', color: 'text-orange-500' };
    } else if (daysDiff === 1) {
      return { text: 'Due tomorrow', color: 'text-blue-500' };
    } else {
      return { text: `Due in ${daysDiff} days`, color: 'text-text-medium' };
    }
  };

  const dueStatus = getDueStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <Card
        className="h-full hover:shadow-lg transition-all cursor-pointer"
        onClick={() => setFlipped(!flipped)}
      >
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <Badge className={difficultyColors[flashcard.difficulty]}>
              {flashcard.difficulty}
            </Badge>
            {flashcard.isAIGenerated && (
              <Badge variant="outline" className="gap-1">
                <Sparkles className="w-3 h-3" />
                AI
              </Badge>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Card Content */}
          <div className="min-h-[120px] flex items-center justify-center p-4 bg-muted rounded-lg">
            <p className="text-center text-text-dark dark:text-foreground">
              {flipped ? flashcard.back : flashcard.front}
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-2 text-xs text-text-medium">
            <div>
              <span className="font-medium">Reviews:</span> {flashcard.timesReviewed || 0}
            </div>
            <div>
              <span className="font-medium">Correct:</span> {flashcard.timesCorrect || 0}
            </div>
            <div className="col-span-2">
              <span className="font-medium">Next:</span>{' '}
              <span className={dueStatus.color}>{dueStatus.text}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(flashcard._id)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FlashcardsPage;