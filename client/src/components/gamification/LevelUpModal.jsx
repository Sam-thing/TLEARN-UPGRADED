// src/components/gamification/LevelUpModal.jsx
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Star, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

const LevelUpModal = ({ isOpen, onClose, newLevel, newTitle, xpGained }) => {
  // Trigger confetti when modal opens
  React.useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white dark:bg-gray-900 rounded-3xl p-10 max-w-md w-full text-center relative overflow-hidden"
          >
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 text-8xl">🎉</div>

            <div className="mt-12">
              <div className="text-7xl font-bold text-forest mb-2">LEVEL UP!</div>
              <div className="text-5xl font-bold mb-6">{newLevel}</div>
              
              <div className="text-2xl font-semibold mb-8 text-text-dark dark:text-white">
                {newTitle}
              </div>

              <div className="bg-forest/10 rounded-2xl p-6 mb-8">
                <p className="text-sm text-text-medium mb-1">You earned</p>
                <p className="text-4xl font-bold text-forest">+{xpGained} XP</p>
              </div>
            </div>

            <Button onClick={onClose} size="lg" className="w-full bg-forest hover:bg-forest/90">
              Continue Learning
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default LevelUpModal;