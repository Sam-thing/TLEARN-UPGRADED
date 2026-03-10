// src/components/chat/MessageReactions.jsx - Message Reactions
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, Heart, ThumbsUp, Flame, PartyPopper } from 'lucide-react';
import { Button } from '@/components/ui/button';

const REACTIONS = [
  { emoji: '👍', icon: ThumbsUp, label: 'Like' },
  { emoji: '❤️', icon: Heart, label: 'Love' },
  { emoji: '😂', icon: Smile, label: 'Laugh' },
  { emoji: '🔥', icon: Flame, label: 'Fire' },
  { emoji: '🎉', icon: PartyPopper, label: 'Celebrate' }
];

const MessageReactions = ({ messageId, reactions = {}, onReact, currentUserId, isOwn }) => {
  const [showPicker, setShowPicker] = useState(false);

  // Count reactions
  const reactionCounts = {};
  Object.entries(reactions).forEach(([emoji, userIds]) => {
    if (userIds.length > 0) {
      reactionCounts[emoji] = {
        count: userIds.length,
        hasReacted: userIds.includes(currentUserId)
      };
    }
  });

  const handleReaction = (emoji) => {
    onReact(messageId, emoji);
    setShowPicker(false);
  };

  return (
    <div className={`flex items-center gap-1 mt-1 ${isOwn ? 'justify-end' : 'justify-start'}`}>
      {/* Existing Reactions */}
      {Object.entries(reactionCounts).map(([emoji, { count, hasReacted }]) => (
        <motion.button
          key={emoji}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => handleReaction(emoji)}
          className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors ${
            hasReacted
              ? 'bg-blue-100 dark:bg-blue-900/30 border border-blue-300 dark:border-blue-700'
              : 'bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:bg-gray-200 dark:hover:bg-gray-700'
          }`}
        >
          <span>{emoji}</span>
          <span className={`font-medium ${hasReacted ? 'text-blue-600 dark:text-blue-400' : ''}`}>
            {count}
          </span>
        </motion.button>
      ))}

      {/* Add Reaction Button */}
      <div className="relative">
        <Button
          variant="ghost"
          size="sm"
          className="h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-700"
          onClick={() => setShowPicker(!showPicker)}
        >
          <Smile className="w-3.5 h-3.5" />
        </Button>

        {/* Reaction Picker */}
        <AnimatePresence>
          {showPicker && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="absolute bottom-full mb-2 left-0 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex gap-1 z-10"
            >
              {REACTIONS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  onClick={() => handleReaction(emoji)}
                  className="text-xl hover:scale-125 transition-transform p-1"
                  title={label}
                >
                  {emoji}
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MessageReactions;