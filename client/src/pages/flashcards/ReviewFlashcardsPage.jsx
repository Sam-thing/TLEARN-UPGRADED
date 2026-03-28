// src/pages/flashcards/ReviewFlashcardsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft,
  RotateCw,
  CheckCircle,
  XCircle,
  Brain,
  Zap,
  Trophy
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { flashcardService } from '@/services/flashcardService';

const ReviewFlashcardsPage = () => {
  const navigate = useNavigate();
  const [flashcards, setFlashcards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [reviewing, setReviewing] = useState(false);
  const [sessionStats, setSessionStats] = useState({
    total: 0,
    reviewed: 0,
    correct: 0
  });

  useEffect(() => {
    loadDueCards();
  }, []);

  const loadDueCards = async () => {
    try {
      const data = await flashcardService.getDue(20);
      const cards = data.flashcards || [];
      
      if (cards.length === 0) {
        toast.info('No cards due for review!');
        navigate('/flashcards');
        return;
      }

      setFlashcards(cards);
      setSessionStats({ total: cards.length, reviewed: 0, correct: 0 });
    } catch (error) {
      toast.error('Failed to load flashcards');
      navigate('/flashcards');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (quality) => {
    // quality: 0=Again, 1=Hard, 2=Good, 3=Easy
    // Map to 0-5 scale for backend (SM-2 algorithm)
    const qualityMap = { 0: 1, 1: 3, 2: 4, 3: 5 };
    const mappedQuality = qualityMap[quality];

    setReviewing(true);

    try {
      const currentCard = flashcards[currentIndex];
      await flashcardService.review(currentCard._id, mappedQuality);

      // Update session stats
      setSessionStats(prev => ({
        ...prev,
        reviewed: prev.reviewed + 1,
        correct: quality >= 2 ? prev.correct + 1 : prev.correct
      }));

      // Move to next card
      if (currentIndex < flashcards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setFlipped(false);
      } else {
        // Session complete!
        handleSessionComplete();
      }
    } catch (error) {
      toast.error('Failed to save review');
    } finally {
      setReviewing(false);
    }
  };

  const handleSessionComplete = () => {
    const accuracy = Math.round((sessionStats.correct / sessionStats.total) * 100);
    
    toast.success(
      `Session complete! Reviewed ${sessionStats.total} cards with ${accuracy}% accuracy!`,
      { duration: 5000 }
    );
    
    navigate('/flashcards');
  };

  const handleFlip = () => {
    setFlipped(!flipped);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (flashcards.length === 0) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">All caught up!</h2>
        <p className="text-text-medium mb-4">No cards due for review right now.</p>
        <Button onClick={() => navigate('/flashcards')}>
          Back to Flashcards
        </Button>
      </div>
    );
  }

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => navigate('/flashcards')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Exit Review
        </Button>

        <div className="text-sm text-text-medium">
          Card {currentIndex + 1} of {flashcards.length}
        </div>
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex justify-between text-sm">
          <span className="text-text-medium">Session Progress</span>
          <span className="font-medium">
            {sessionStats.reviewed}/{sessionStats.total} reviewed
          </span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{flashcards.length}</div>
            <div className="text-sm text-text-medium">Total</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">{sessionStats.correct}</div>
            <div className="text-sm text-text-medium">Correct</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-orange-500">
              {sessionStats.reviewed - sessionStats.correct}
            </div>
            <div className="text-sm text-text-medium">To Review</div>
          </CardContent>
        </Card>
      </div>

      {/* Flashcard */}
      <div className="relative" style={{ minHeight: '400px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard._id + (flipped ? '-back' : '-front')}
            initial={{ rotateY: flipped ? -90 : 90, opacity: 0 }}
            animate={{ rotateY: 0, opacity: 1 }}
            exit={{ rotateY: flipped ? 90 : -90, opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleFlip}
            className="cursor-pointer"
            style={{ transformStyle: 'preserve-3d' }}
          >
            <Card className="border-2 hover:shadow-xl transition-shadow">
              <CardContent className="p-12">
                <div className="text-center space-y-6">
                  {/* Card Side Indicator */}
                  <div className="text-sm font-medium text-text-medium">
                    {flipped ? 'Answer' : 'Question'}
                  </div>

                  {/* Card Content */}
                  <div className="min-h-[200px] flex items-center justify-center">
                    <p className="text-2xl text-text-dark dark:text-foreground leading-relaxed">
                      {flipped ? currentCard.back : currentCard.front}
                    </p>
                  </div>

                  {/* Flip Instruction */}
                  <div className="flex items-center justify-center gap-2 text-text-medium">
                    <RotateCw className="w-4 h-4" />
                    <span className="text-sm">Click to flip</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Quality Buttons (only show when flipped) */}
      {flipped && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="grid grid-cols-4 gap-3"
        >
          <Button
            onClick={() => handleReview(0)}
            disabled={reviewing}
            variant="outline"
            className="flex-col h-24 border-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
          >
            <XCircle className="w-6 h-6 text-red-500 mb-2" />
            <span className="font-semibold">Again</span>
            <span className="text-xs text-text-medium">&lt;1 min</span>
          </Button>

          <Button
            onClick={() => handleReview(1)}
            disabled={reviewing}
            variant="outline"
            className="flex-col h-24 border-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20"
          >
            <Brain className="w-6 h-6 text-orange-500 mb-2" />
            <span className="font-semibold">Hard</span>
            <span className="text-xs text-text-medium">&lt;6 min</span>
          </Button>

          <Button
            onClick={() => handleReview(2)}
            disabled={reviewing}
            variant="outline"
            className="flex-col h-24 border-green-500 hover:bg-green-50 dark:hover:bg-green-900/20"
          >
            <CheckCircle className="w-6 h-6 text-green-500 mb-2" />
            <span className="font-semibold">Good</span>
            <span className="text-xs text-text-medium">&lt;10 min</span>
          </Button>

          <Button
            onClick={() => handleReview(3)}
            disabled={reviewing}
            variant="outline"
            className="flex-col h-24 border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20"
          >
            <Zap className="w-6 h-6 text-blue-500 mb-2" />
            <span className="font-semibold">Easy</span>
            <span className="text-xs text-text-medium">4 days</span>
          </Button>
        </motion.div>
      )}

      {/* Keyboard Shortcuts Hint */}
      <div className="text-center text-sm text-text-medium">
        💡 Tip: Flip the card to see answer, then rate how well you knew it
      </div>
    </div>
  );
};

export default ReviewFlashcardsPage;