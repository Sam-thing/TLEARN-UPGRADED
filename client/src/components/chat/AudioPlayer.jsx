// src/components/chat/AudioPlayer.jsx - FIXED
import { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { Button } from '@/components/ui/button';

const AudioPlayer = ({ audioUrl, duration = 0, waveformData = [], isOwn }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [error, setError] = useState(false);
  const audioRef = useRef(null);

  if (!audioUrl) {
    return <div className="text-xs text-red-500 p-2">No audio available</div>;
  }

  // ✅ Use VITE_SERVER_URL from your .env
  const fullAudioUrl = audioUrl.startsWith('http') 
    ? audioUrl 
    : `${import.meta.env.VITE_SERVER_URL || 'https://tlearnapp.onrender.com'}${audioUrl}`;

  console.log('🎵 Playing audio from:', fullAudioUrl);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => setCurrentTime(audio.currentTime);
    const handleEnded = () => setIsPlaying(false);
    const handleError = (e) => {
      console.error('❌ Audio playback error:', e);
      setError(true);
    };

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

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

  const progress = duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

  return (
    <div className={`flex items-center gap-3 p-3 rounded-2xl min-w-[260px] ${
      isOwn ? 'bg-green-600 text-white' : 'bg-white dark:bg-card border'
    }`}>
      <audio ref={audioRef} src={fullAudioUrl} preload="metadata" />

      <Button
        variant="ghost"
        size="icon"
        onClick={togglePlay}
        disabled={error}
        className={`flex-shrink-0 ${isOwn ? 'hover:bg-green-700 text-white' : ''}`}
      >
        {isPlaying ? <Pause className="w-5 h-5" fill="currentColor" /> : <Play className="w-5 h-5" fill="currentColor" />}
      </Button>

      <div className="flex-1 min-w-0">
        {/* Waveform */}
        <div className="flex items-center gap-0.5 h-8 mb-1">
          {waveformData.length > 0 ? (
            waveformData.slice(0, 40).map((amp, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full transition-all min-w-[2px] ${
                  isOwn 
                    ? (i / 40 * 100 <= progress ? 'bg-white' : 'bg-white/40')
                    : (i / 40 * 100 <= progress ? 'bg-green-600' : 'bg-gray-300 dark:bg-gray-700')
                }`}
                style={{ height: `${8 + amp * 18}px` }}
              />
            ))
          ) : (
            Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className={`flex-1 rounded-full min-w-[2px] ${isOwn ? 'bg-white/40' : 'bg-gray-300 dark:bg-gray-700'}`}
                style={{ height: `${12 + Math.random() * 16}px` }}
              />
            ))
          )}
        </div>

        {/* Time */}
        <div className={`flex justify-between text-xs ${isOwn ? 'text-white/80' : 'text-gray-500'}`}>
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>
    </div>
  );
};

export default AudioPlayer;