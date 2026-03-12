// src/components/chat/MessageSearch.jsx - Search Messages
import { useState, useRef, useEffect } from 'react';
import { Search, X, ChevronUp, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

const MessageSearch = ({ messages, onNavigate, onClose }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setResults([]);
      setCurrentIndex(0);
      return;
    }

    // Search through messages
    const searchResults = messages
      .filter(msg => 
        msg.type === 'text' && 
        msg.content?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .reverse(); // Most recent first

    setResults(searchResults);
    setCurrentIndex(0);

    // Navigate to first result
    if (searchResults.length > 0) {
      onNavigate(searchResults[0]._id);
    }
  }, [searchTerm, messages]);

  const handleNext = () => {
    if (results.length === 0) return;
    const nextIndex = (currentIndex + 1) % results.length;
    setCurrentIndex(nextIndex);
    onNavigate(results[nextIndex]._id);
  };

  const handlePrevious = () => {
    if (results.length === 0) return;
    const prevIndex = currentIndex === 0 ? results.length - 1 : currentIndex - 1;
    setCurrentIndex(prevIndex);
    onNavigate(results[prevIndex]._id);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-card border rounded-lg shadow-lg p-3 min-w-[400px]"
    >
      <div className="flex items-center gap-2">
        <Search className="w-4 h-4 text-gray-400" />
        
        <Input
          ref={inputRef}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search messages..."
          className="flex-1 border-none focus-visible:ring-0 px-2"
        />

        {results.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <span>
              {currentIndex + 1} / {results.length}
            </span>
            
            <div className="flex gap-1">
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
          </div>
        )}

        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="h-6 w-6 p-0"
        >
          <X className="w-4 h-4" />
        </Button>
      </div>

      {searchTerm && results.length === 0 && (
        <p className="text-xs text-gray-500 mt-2">No messages found</p>
      )}
    </motion.div>
  );
};

export default MessageSearch;