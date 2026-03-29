// src/pages/teach/TeachPage.jsx - FIXED VERSION
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mic, 
  MicOff, 
  Send, 
  BookOpen,
  ArrowLeft,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { topicService } from '@/services/topicService';
import { sessionService } from '@/services/sessionService';
import { useAudioRecorder } from '@/hooks/useAudioRecorder';
import { aiService } from '@/services/aiService';
import { useSpeechToText } from '@/hooks/useSpeechToText';
import api from '@/utils/axios';

const TeachPage = () => {
  const { topicId } = useParams();
  const navigate = useNavigate();
  const [topic, setTopic] = useState(null);
  const [phase, setPhase] = useState('prep'); // prep, teaching, feedback
  const [timer, setTimer] = useState(0);
  const [timerActive, setTimerActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [finalTranscript, setFinalTranscript] = useState('');
  
  const { 
    isRecording, 
    audioBlob, 
    startRecording, 
    stopRecording, 
    audioUrl 
  } = useAudioRecorder();
  
  const { 
    transcript, 
    isListening, 
    startListening, 
    stopListening,
  } = useSpeechToText();

  useEffect(() => {
    loadTopic();
  }, [topicId]);

  useEffect(() => {
    let interval;
    if (timerActive) {
      interval = setInterval(() => {
        setTimer(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [timerActive]);

  const loadTopic = async () => {
    try {
      const data = await topicService.getById(topicId);
      setTopic(data.topic || data);
    } catch (error) {
      toast.error('Failed to load topic');
      navigate('/topics');
    }
  };

  const handleStartTeaching = async () => {
    // Track session start
    try {
      await api.post(`/topics/${topicId}/start-session`);
      console.log('✅ Session tracked');
    } catch (error) {
      console.error('Failed to track session:', error);
    }

    // Start teaching
    setPhase('teaching');
    setTimerActive(true);
    startRecording();
    startListening();
  };

  const handleSessionComplete = async (sessionData) => {
    try {
      await gamificationService.trackActivity('session_completed', {
        duration: sessionData.duration,
        topicId: sessionData.topicId,
        score: sessionData.feedback?.score
      });

      toast.success(`Session completed! +10 XP`);
    } catch (error) {
      console.error('Failed to track session activity:', error);
    }
  };

  const handleStopTeaching = async () => {
    setTimerActive(false);
    stopRecording();
    stopListening();
  
    // ✅ STEP 1: Add punctuation to transcript
    if (transcript && transcript.trim().length > 0) {
      try {
        toast.loading('Processing transcript...');
        const correctedTranscript = await aiService.addPunctuation(transcript);
        setFinalTranscript(correctedTranscript);
        toast.dismiss();
        toast.success('Transcript processed!');
      } catch (error) {
        console.error('Punctuation failed:', error);
        setFinalTranscript(transcript); // Use original if AI fails
        toast.dismiss();
      }
    }
    
    setPhase('feedback');
  };

  const handleSaveDraft = async () => {
    if (!transcript || transcript.trim().length === 0) {
      toast.error('No content to save');
      return;
    }

    try {
      const draft = {
        topicId,
        topicName: topic?.name,
        transcript,
        duration: timer,
        timestamp: Date.now()
      };

      const existingDrafts = JSON.parse(localStorage.getItem('teachingDrafts') || '[]');
      existingDrafts.push(draft);
      localStorage.setItem('teachingDrafts', JSON.stringify(existingDrafts));

      toast.success('Draft saved! You can continue later.');
      navigate('/topics');
    } catch (error) {
      console.error('Failed to save draft:', error);
      toast.error('Failed to save draft');
    }
  };

  const handleSubmit = async () => {
    const transcriptToUse = finalTranscript || transcript;
    
    if (!audioBlob || !transcriptToUse) {
      toast.error('Please record your explanation first');
      return;
    }
 
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('audio', audioBlob);
      formData.append('transcript', transcriptToUse);  // ✅ Use corrected transcript
      formData.append('topicId', topicId);
      formData.append('duration', timer);
 
      const response = await sessionService.create(formData);
      
      // Track completion
      try {
        await api.post(`/topics/${topicId}/complete`);
      } catch (error) {
        console.error('Failed to track completion:', error);
      }
      
      const sessionData = response.session || response;
      const sessionId = sessionData._id;
      
      toast.success('Session completed! Getting your feedback...');
      
      setTimeout(() => {
        navigate(`/sessions/${sessionId}`);
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('Failed to submit session');
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!topic) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/topics')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Topics
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">{topic.name}</CardTitle>
              <p className="text-text-medium mt-2">{topic.description}</p>
            </div>
            <Badge>{topic.subject}</Badge>
          </div>
        </CardHeader>
      </Card>

      {phase === 'prep' && (
        <PrepPhase topic={topic} onStart={handleStartTeaching} />
      )}

      {phase === 'teaching' && (
        <TeachingPhase
          isRecording={isRecording}
          transcript={transcript}
          timer={timer}
          onStop={handleStopTeaching}
          onSaveDraft={handleSaveDraft}
        />
      )}

      {phase === 'feedback' && (
        <FeedbackPhase
          transcript={finalTranscript || transcript}
          audioUrl={audioUrl}
          duration={timer}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
};

// Prep Phase Component
const PrepPhase = ({ topic, onStart }) => {
  return (
    <Tabs defaultValue="notes" className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="notes">
          <BookOpen className="w-4 h-4 mr-2" />
          Prep Notes
        </TabsTrigger>
        <TabsTrigger value="tips">
          <Lightbulb className="w-4 h-4 mr-2" />
          Teaching Tips
        </TabsTrigger>
      </TabsList>

      <TabsContent value="notes" className="space-y-4">
        <Card>
          <CardHeader>
            <CardTitle>Key Points to Cover</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {topic.content?.keyPoints?.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-forest/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-semibold text-forest">{index + 1}</span>
                  </div>
                  <p className="text-text-dark dark:text-foreground">{point}</p>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div className="flex justify-center">
          <Button
            size="lg"
            onClick={onStart}
            className="bg-gradient-to-r from-forest to-forest-light"
          >
            <Mic className="w-5 h-5 mr-2" />
            Start Teaching
          </Button>
        </div>
      </TabsContent>

      <TabsContent value="tips">
        <Card>
          <CardHeader>
            <CardTitle>Tips for Better Teaching</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              <li className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-sand flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Speak Clearly</p>
                  <p className="text-sm text-text-medium">Enunciate and maintain steady pace</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-sand flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Use Examples</p>
                  <p className="text-sm text-text-medium">Real-world examples help understanding</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-sand flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Explain Concepts</p>
                  <p className="text-sm text-text-medium">Don't just list facts, explain why</p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};

// Teaching Phase Component
const TeachingPhase = ({ isRecording, transcript, timer, onStop, onSaveDraft }) => {
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      <Card className="border-red-500">
        <CardContent className="p-8">
          <div className="flex flex-col items-center gap-6">
            <motion.div
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="w-24 h-24 rounded-full bg-gradient-to-br from-red-500 to-green-600 flex items-center justify-center"
            >
              <Mic className="w-12 h-12 text-white" />
            </motion.div>

            <div className="text-center">
              <div className="flex items-center gap-2 justify-center mb-2">
                <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                <span className="text-lg font-semibold">Recording in Progress</span>
              </div>
              <div className="font-mono text-4xl font-bold text-forest">
                {formatTime(timer)}
              </div>
            </div>

            <Button size="lg" variant="destructive" onClick={onStop}>
              <MicOff className="w-5 h-5 mr-2" />
              Stop Teaching
            </Button>
            <Button variant="outline" size="lg" onClick={onSaveDraft}>
              <BookOpen className="w-5 h-5 mr-2" />
              Save as Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Live Transcript</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 min-h-[200px] max-h-[400px] overflow-y-auto">
            {transcript ? (
              <p className="text-text-dark dark:text-foreground leading-relaxed">
                {transcript}
              </p>
            ) : (
              <p className="text-text-light italic">
                Start speaking and your words will appear here...
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Feedback Phase Component
const FeedbackPhase = ({ transcript, audioUrl, duration, onSubmit, submitting }) => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Review Your Teaching</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {audioUrl && (
            <div>
              <label className="text-sm font-medium mb-2 block">Audio Recording</label>
              <audio controls src={audioUrl} className="w-full" />
            </div>
          )}

          <div>
            <label className="text-sm font-medium mb-2 block">Your Explanation</label>
            <div className="bg-muted rounded-lg p-4 max-h-[300px] overflow-y-auto">
              <p className="text-text-dark dark:text-foreground leading-relaxed">
                {transcript}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 p-4 bg-muted rounded-lg">
            <div>
              <div className="text-2xl font-bold text-forest">
                {Math.floor(duration / 60)}:{(duration % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-text-medium">Duration</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-forest">
                {transcript.split(' ').length}
              </div>
              <div className="text-sm text-text-medium">Words</div>
            </div>
          </div>

          <Button
            onClick={onSubmit}
            disabled={submitting}
            className="w-full bg-gradient-to-r from-forest to-forest-light"
            size="lg"
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Getting AI Feedback...
              </>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit for Feedback
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeachPage;