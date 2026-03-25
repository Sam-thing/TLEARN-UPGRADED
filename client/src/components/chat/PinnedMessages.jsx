// src/components/chat/PinnedMessages.jsx
import { useState, useEffect } from 'react';
import { Pin, ChevronUp, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/utils/axios';        // ← Use your configured axios

const PinnedMessages = ({ roomId, onNavigate }) => {
  const [pinnedMessages, setPinnedMessages] = useState([]);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (roomId) {
      loadPinnedMessages();
    }
  }, [roomId]);

  const loadPinnedMessages = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/messages/room/${roomId}/pinned`);
      
      // Handle different possible response structures
      const messages = response.pinnedMessages || 
                      response.messages || 
                      response || [];

      setPinnedMessages(Array.isArray(messages) ? messages : []);
    } catch (error) {
      console.warn('Failed to load pinned messages:', error.message || error);
      setPinnedMessages([]);
    } finally {
      setLoading(false);
    }
  };

  // Auto-refresh pinned messages when a pin event happens
  useEffect(() => {
    const handleReload = () => loadPinnedMessages();
    window.addEventListener('reload-pinned', handleReload);
    
    return () => window.removeEventListener('reload-pinned', handleReload);
  }, []);

  if (pinnedMessages.length === 0) return null;

  const currentMessage = pinnedMessages[currentIndex];

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % pinnedMessages.length);
  };

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? pinnedMessages.length - 1 : prev - 1));
  };

  return (
    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-b border-yellow-200 dark:border-yellow-800">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Pin className="w-5 h-5 text-yellow-600 dark:text-yellow-500 flex-shrink-0" />
            
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100 truncate">
                {currentMessage.sender?.name || currentMessage.userName || 'Someone'} pinned:
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300 line-clamp-1">
                {currentMessage.content || currentMessage.message}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            {pinnedMessages.length > 1 && (
              <div className="flex items-center gap-1 text-xs text-yellow-700 dark:text-yellow-300 mr-2">
                <span>{currentIndex + 1} / {pinnedMessages.length}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handlePrevious}
                  className="h-7 w-7 p-0"
                >
                  <ChevronUp className="w-3 h-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleNext}
                  className="h-7 w-7 p-0"
                >
                  <ChevronDown className="w-3 h-3" />
                </Button>
              </div>
            )}

            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate(currentMessage._id)}
              className="text-xs hover:bg-yellow-100 dark:hover:bg-yellow-900"
            >
              Jump to message
            </Button>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-7 w-7 p-0"
            >
              {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
              className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-2"
            >
              {pinnedMessages.map((msg, index) => (
                <div
                  key={msg._id}
                  className="flex items-start gap-3 p-3 bg-white dark:bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    setCurrentIndex(index);
                    onNavigate(msg._id);
                    setIsExpanded(false);
                  }}
                >
                  <Pin className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {msg.sender?.name || msg.userName || 'Someone'}
                    </p>
                    <p className="text-sm text-gray-700 dark:text-gray-300 line-clamp-2">
                      {msg.content || msg.message}
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