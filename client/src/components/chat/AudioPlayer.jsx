// src/components/chat/AudioPlayer.jsx - Voice Message Player
import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AudioPlayer = ({ audioUrl, duration, waveformData = [], isOwn }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(false);
  const audioRef = useRef(null);

  // Check if audioUrl is valid
  if (!audioUrl || audioUrl === 'undefined') {
    console.error('❌ AudioPlayer: Invalid audioUrl:', audioUrl);
    return (
      <div className="p-3 rounded-2xl bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-800">
        <p className="text-xs text-red-600 dark:text-red-400">
          Voice message failed to load
        </p>
      </div>
    );
  }

  // Construct full URL if needed
  const fullAudioUrl = audioUrl.startsWith('http') 
    ? audioUrl 
    : `${import.meta.env.VITE_SERVER_URL || 'https://tlearnapp.onrender.com'}${audioUrl}`;

  console.log('🎵 AudioPlayer rendering:', {
    audioUrl,
    fullAudioUrl,
    duration,
    hasWaveform: waveformData.length > 0
  });

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error('❌ Audio error:', e);
      console.error('Audio src:', audio.src);
      setError(true);
    };
    const handleCanPlay = () => {
      console.log('✅ Audio can play');
      setError(false);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || error) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play().catch(err => {
        console.error('Play failed:', err);
        setError(true);
      });
    }
    setIsPlaying(!isPlaying);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl min-w-[250px] max-w-[350px] ${
      isOwn
        ? 'bg-green-600 text-white'
        : 'bg-white dark:bg-card border'
    }`}>
      <audio ref={audioRef} src={fullAudioUrl} preload="metadata" />
      
      {error && (
        <div className="text-xs text-red-500">
          Failed to load audio
        </div>
      )}
      
      {/* Play/Pause Button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        disabled={error}
        className={`flex-shrink-0 ${
          isOwn 
            ? 'hover:bg-green-700 text-white' 
            : 'hover:bg-gray-100 dark:hover:bg-gray-800'
        }`}
      >
        {isPlaying ? (
          <Pause className="w-5 h-5" fill="currentColor" />
        ) : (
          <Play className="w-5 h-5" fill="currentColor" />
        )}
      </Button>

      {/* Waveform & Progress */}
      <div className="flex-1">
        {/* Waveform Visualization */}
        <div className="flex items-center gap-0.5 h-8 mb-1">
          {waveformData.length > 0 ? (
            waveformData.slice(0, 40).map((amplitude, i) => {
              const barProgress = (i / 40) * 100;
              const isPassed = barProgress <= progress;
              
              return (
                <div
                  key={i}
                  className={`flex-1 rounded-full transition-colors ${
                    isOwn
                      ? isPassed ? 'bg-white' : 'bg-white/40'
                      : isPassed ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700'
                  }`}
                  style={{
                    height: `${10 + amplitude * 20}px`,
                    minWidth: '2px'
                  }}
                />
              );
            })
          ) : (
            // Fallback if no waveform data
            Array(30).fill(0).map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full ${
                  isOwn ? 'bg-white/40' : 'bg-gray-300 dark:bg-gray-700'
                }`}
                style={{
                  height: `${15 + Math.random() * 15}px`,
                  minWidth: '2px'
                }}
              />
            ))
          )}
        </div>

        {/* Time Display */}
        <div className={`flex justify-between text-xs ${
          isOwn ? 'text-white/80' : 'text-gray-500 dark:text-gray-400'
        }`}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;