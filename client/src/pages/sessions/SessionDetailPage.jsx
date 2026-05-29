// src/pages/sessions/SessionDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft, TrendingUp, TrendingDown, CheckCircle,
  XCircle, Lightbulb, Award, Clock, BarChart3,
  RefreshCw, Share2, Download, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { sessionService } from '@/services/sessionService';

export default function SessionDetailPage() {
  const { id }     = useParams();
  const navigate   = useNavigate();
  const [session, setSession]       = useState(null);
  const [loading, setLoading]       = useState(true);
  const [retrying, setRetrying]     = useState(false);
  const [notFound, setNotFound]     = useState(false);

  useEffect(() => {
    if (!id) { navigate('/sessions'); return; }
    loadSession();
  }, [id]);

  const loadSession = async () => {
    setLoading(true);
    try {
      const data = await sessionService.getById(id);
      // API may return { session: {...} } or the object directly
      const s = data?.session ?? data;
      if (!s?._id) { setNotFound(true); return; }
      setSession(s);
    } catch (err) {
      const status = err?.response?.status ?? err?.status;
      if (status === 404 || status === 403) {
        setNotFound(true);
      } else {
        toast.error('Failed to load session');
        navigate('/sessions');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    const topicId = session?.topic?._id;
    if (!topicId) { toast.error('Topic information missing'); return; }
    setRetrying(true);
    try {
      await sessionService.retry(topicId);
      navigate(`/teach/${topicId}`);
    } catch {
      toast.error('Failed to start retry — please try again');
    } finally {
      setRetrying(false);
    }
  };

  // ── Loading ──────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  // ── Not found ────────────────────────────────────────────────────────────────
  if (notFound || !session) {
    return (
      <div className="max-w-xl mx-auto text-center py-24 space-y-4">
        <XCircle className="w-14 h-14 text-text-light mx-auto" />
        <h2 className="text-2xl font-bold">Session not found</h2>
        <p className="text-text-medium">It may have been deleted or you don't have access.</p>
        <Button onClick={() => navigate('/sessions')}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Back to Sessions
        </Button>
      </div>
    );
  }

  // ── Safe accessors — all feedback fields may be missing on old/pending sessions
  const fb        = session.feedback   ?? {};
  const analysis  = session.analysis   ?? {};
  const topic     = session.topic      ?? {};

  const score          = fb.score          ?? 0;
  const accuracyScore  = fb.accuracyScore  ?? 0;
  const clarityScore   = fb.clarityScore   ?? 0;
  const confidenceScore= fb.confidenceScore?? 0;
  const strengths      = Array.isArray(fb.strengths)    ? fb.strengths    : [];
  const improvements   = Array.isArray(fb.improvements) ? fb.improvements : [];
  const missingPoints  = Array.isArray(fb.missingPoints)? fb.missingPoints: [];
  const overall        = fb.overall ?? fb.summary ?? '';
  const transcript     = session.transcript ?? '';
  const duration       = session.duration   ?? 0;
  const wordCount      = analysis.wordCount  ?? transcript.split(/\s+/).filter(Boolean).length;
  const fillerWords    = analysis.fillerWords ?? 0;

  const getScoreColor = (s) => s >= 80 ? 'text-green-500' : s >= 60 ? 'text-yellow-500' : 'text-red-500';
  const getGrade      = (s) => s >= 90 ? 'A+' : s >= 80 ? 'A' : s >= 70 ? 'B' : s >= 60 ? 'C' : s >= 50 ? 'D' : 'F';

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-5xl mx-auto space-y-6">

      {/* Back */}
      <Button variant="ghost" size="sm" onClick={() => navigate('/sessions')}>
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to <span className="text-green-700 ml-1">Sessions</span>
      </Button>

      {/* Score card */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-1">
                {topic.name ?? 'Session'}
              </CardTitle>
              <CardDescription className="text-base">
                {session.createdAt
                  ? new Date(session.createdAt).toLocaleDateString('en-US', {
                      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    })
                  : ''}
              </CardDescription>
              {session.status && session.status !== 'analyzed' && (
                <Badge variant="outline" className="mt-2 capitalize">{session.status}</Badge>
              )}
            </div>
            <div className="text-center shrink-0">
              <div className={`text-6xl font-bold ${getScoreColor(score)}`}>{score}%</div>
              <Badge className="mt-2 text-lg px-4 py-1">Grade: {getGrade(score)}</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <PerfCard title="Accuracy"   score={accuracyScore}   icon={CheckCircle} color="green" />
        <PerfCard title="Clarity"    score={clarityScore}    icon={BarChart3}   color="green" />
        <PerfCard title="Confidence" score={confidenceScore} icon={Award}       color="green" />
      </div>

      {/* Strengths + Improvements */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" /> Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {strengths.length > 0 ? (
              <ul className="space-y-3">
                {strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-medium italic">No strengths recorded yet.</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <TrendingDown className="w-5 h-5" /> Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {improvements.length > 0 ? (
              <ul className="space-y-3">
                {improvements.map((imp, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
                    <span>{imp}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-medium italic">No improvements noted — great job!</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Missing concepts */}
      {missingPoints.length > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" /> Missing Concepts
            </CardTitle>
            <CardDescription>Important points not covered in your explanation</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {missingPoints.map((pt, i) => (
                <li key={i} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* Overall feedback */}
      {overall && (
        <Card>
          <CardHeader><CardTitle>Overall Feedback</CardTitle></CardHeader>
          <CardContent>
            <p className="leading-relaxed">{overall}</p>
          </CardContent>
        </Card>
      )}

      {/* Transcript */}
      <Card>
        <CardHeader>
          <CardTitle>Your Explanation</CardTitle>
          <CardDescription>What you said during the teaching session</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4 max-h-72 overflow-y-auto">
            {transcript ? (
              <p className="leading-relaxed whitespace-pre-wrap">{transcript}</p>
            ) : (
              <p className="text-text-light italic">No transcript available.</p>
            )}
          </div>

          {/* Session stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-forest">
                {Math.floor(duration / 60)}:{String(duration % 60).padStart(2, '0')}
              </div>
              <div className="text-sm text-text-medium">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-forest">{wordCount}</div>
              <div className="text-sm text-text-medium">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-forest">{fillerWords}</div>
              <div className="text-sm text-text-medium">Filler Words</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleRetry}
          disabled={retrying}
          className="flex-1 bg-gradient-to-r from-forest to-forest-light"
        >
          {retrying
            ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Starting…</>
            : <><RefreshCw className="w-5 h-5 mr-2" />Retry This Topic</>}
        </Button>
        <Button variant="outline" onClick={() => {
          const text = `T.Learn Session: ${topic.name ?? ''}\nScore: ${score}%\n\n${transcript}`;
          navigator.clipboard?.writeText(text);
          toast.success('Copied to clipboard');
        }}>
          <Share2 className="w-5 h-5 mr-2" /> Share
        </Button>
        <Button variant="outline" onClick={() => {
          const blob = new Blob(
            [`Topic: ${topic.name}\nScore: ${score}%\nDate: ${session.createdAt}\n\nTranscript:\n${transcript}`],
            { type: 'text/plain' }
          );
          const a = document.createElement('a');
          a.href = URL.createObjectURL(blob);
          a.download = `session-${id}.txt`;
          a.click();
        }}>
          <Download className="w-5 h-5 mr-2" /> Export
        </Button>
      </div>
    </div>
  );
}

// ── Sub-components ─────────────────────────────────────────────────────────────
function PerfCard({ title, score, icon: Icon }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-green-500 to-emerald-400">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold">{score}%</div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-text-medium">{title}</div>
          <Progress value={score} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
}