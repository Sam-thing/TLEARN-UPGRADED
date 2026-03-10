// src/components/chat/VoiceRecorder.jsx - Voice Recording UI
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, X, Send, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';

const VoiceRecorder = ({ onSend, onCancel }) => {
  const {
    isRecording,
    audioBlob,
    audioUrl,
    duration,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    resetRecording
  } = useAudioRecorder();

  const [waveform, setWaveform] = useState(Array(40).fill(0));

  // Simulate waveform animation while recording
  useEffect(() => {
    if (isRecording) {
      const interval = setInterval(() => {
        setWaveform(prev => {
          const newWave = [...prev.slice(1), Math.random()];
          return newWave;
        });
      }, 100);
      return () => clearInterval(interval);
    }
  }, [isRecording]);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSend = () => {
    if (audioBlob) {
      onSend({ audioBlob, duration, waveform });
      resetRecording();
    }
  };

  const handleCancel = () => {
    cancelRecording();
    onCancel();
  };

  const handleDelete = () => {
    resetRecording();
  };

  useEffect(() => {
    // Auto-start recording when component mounts
    startRecording();
  }, []);

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 rounded-lg"
      >
        <p className="text-sm text-red-600 dark:text-red-400 flex-1">{error}</p>
        <Button variant="ghost" size="sm" onClick={handleCancel}>
          Close
        </Button>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 border border-green-200 dark:border-green-900 rounded-lg"
    >
      {/* Cancel Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={handleCancel}
        className="flex-shrink-0"
      >
        <X className="w-5 h-5" />
      </Button>

      {/* Recording Indicator or Audio Player */}
      {isRecording ? (
        <>
          {/* Animated Mic Icon */}
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="flex-shrink-0"
          >
            <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center">
              <Mic className="w-5 h-5 text-white" />
            </div>
          </motion.div>

          {/* Waveform Visualization */}
          <div className="flex items-center gap-0.5 flex-1 h-10">
            {waveform.map((amplitude, i) => (
              <motion.div
                key={i}
                className="flex-1 bg-green-600 dark:bg-green-500 rounded-full"
                style={{
                  height: `${10 + amplitude * 25}px`,
                  minWidth: '2px'
                }}
                animate={{ height: `${10 + amplitude * 25}px` }}
                transition={{ duration: 0.1 }}
              />
            ))}
          </div>

          {/* Duration */}
          <span className="text-sm font-mono font-semibold text-green-700 dark:text-green-400 flex-shrink-0 min-w-[50px]">
            {formatDuration(duration)}
          </span>

          {/* Stop Button */}
          <Button
            onClick={stopRecording}
            className="bg-green-600 hover:bg-green-700 flex-shrink-0"
          >
            Stop
          </Button>
        </>
      ) : audioUrl ? (
        <>
          {/* Audio Player */}
          <audio controls src={audioUrl} className="flex-1 h-10" />

          {/* Duration */}
          <span className="text-sm font-mono text-gray-600 dark:text-gray-400 flex-shrink-0">
            {formatDuration(duration)}
          </span>

          {/* Delete Button */}
          <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            className="flex-shrink-0"
          >
            <Trash2 className="w-5 h-5" />
          </Button>

          {/* Send Button */}
          <Button
            onClick={handleSend}
            className="bg-green-600 hover:bg-green-700 flex-shrink-0"
          >
            <Send className="w-5 h-5" />
          </Button>
        </>
      ) : null}
    </motion.div>
  );
};

export default VoiceRecorder;