// src/components/chat/PinnedMessages.jsx - Display Pinned Messages
import { useState, useEffect } from 'react';
import { Pin, X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const PinnedMessages = ({ roomId, onNavigate }) => {
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    loadPinnedMessages();
  }, [roomId]);

  const loadPinnedMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `https://tlearn-upgraded.vercel.app/api/messages/room/${roomId}/pinned`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setPinnedMessages(response.data.pinnedMessages || []);
    } catch (error) {
      console.error('Failed to load pinned messages:', error);
    }
  };

  if (pinnedMessages.length === 0) return null;

  const currentMessage = pinnedMessages[currentIndex];

  const handleNext = () => {
    const nextIndex = (currentIndex + 1) % pinnedMessages.length;
    setCurrentIndex(nextIndex);
  };

  const handlePrevious = () => {
    const prevIndex = currentIndex === 0 ? pinnedMessages.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Pin className="w-4 h-4 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 truncate">
                {currentMessage.sender?.name || 'Someone'} pinned a message
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 truncate">
                {currentMessage.content}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {pinnedMessages.length > 1 && (
              <div className="flex items-center gap-1 text-xs text-yellow-700 dark:text-yellow-300">
                <span>{currentIndex + 1}/{pinnedMessages.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="h-6 w-6 p-0"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  className="h-6 w-6 p-0"
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(currentMessage._id)}
              className="text-xs"
            >
              View
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Expanded List */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="mt-3 space-y-2 max-h-60 overflow-y-auto"
            >
              {pinnedMessages.map((msg, index) => (
                <div
                  key={msg._id}
                  className="flex items-start gap-2 p-2 bg-white dark:bg-gray-800 rounded cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => {
                    setCurrentIndex(index);
                    onNavigate(msg._id);
                    setIsExpanded(false);
                  }}
                >
                  <Pin className="w-3 h-3 text-yellow-600 flex-shrink-0 mt-1" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {msg.sender?.name || 'Someone'}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 truncate">
                      {msg.content}
                    </p>
                  </div>
                </div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PinnedMessages;