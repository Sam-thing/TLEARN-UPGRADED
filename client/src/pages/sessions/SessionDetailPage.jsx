// src/pages/sessions/SessionDetailPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  CheckCircle,
  XCircle,
  Lightbulb,
  Award,
  Clock,
  BarChart3,
  RefreshCw,
  Share2,
  Download
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { sessionService } from '@/services/sessionService';

const SessionDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSession();
  }, [id]);

  const loadSession = async () => {
    try {
      const data = await sessionService.getById(id);
      setSession(data);
    } catch (error) {
      toast.error('Failed to load session');
      navigate('/sessions');
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async () => {
    try {
      await sessionService.retry(session.topic._id);
      navigate(`/teach/${session.topic._id}`);
    } catch (error) {
      toast.error('Failed to start retry');
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const score = session.feedback?.score || 0;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/sessions')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to <span className="text-green-700">Sessions</span>
        </Button>
      </div>

      {/* Session Overview */}
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">{session.topic?.name}</CardTitle>
              <CardDescription className="text-base">
                Completed on {new Date(session.createdAt).toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </CardDescription>
            </div>
            <div className="text-center">
              <div className={`DM Mono, monospace text-6xl font-bold ${getScoreColor(score)} mb-2`}>
                {score}%
              </div>
              <Badge className="text-lg px-4 py-1">
                Grade: {getScoreGrade(score)}
              </Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Performance Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <PerformanceCard
          title="Accuracy"
          score={session.feedback?.accuracyScore || 0}
          icon={CheckCircle}
          color="green"
        />
        <PerformanceCard
          title="Clarity"
          score={session.feedback?.clarityScore || 0}
          icon={BarChart3}
          color="green"
        />
        <PerformanceCard
          title="Confidence"
          score={session.feedback?.confidenceScore || 75}
          icon={Award}
          color="green"
        />
      </div>

      {/* Detailed Feedback */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Strengths */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              Strengths
            </CardTitle>
          </CardHeader>
          <CardContent>
            {session.feedback?.strengths?.length > 0 ? (
              <ul className="space-y-3">
                {session.feedback.strengths.map((strength, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                    <span className="text-text-dark dark:text-foreground">{strength}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-medium italic">No strengths recorded</p>
            )}
          </CardContent>
        </Card>

        {/* Areas for Improvement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <TrendingDown className="w-5 h-5" />
              Areas for Improvement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {session.feedback?.improvements?.length > 0 ? (
              <ul className="space-y-3">
                {session.feedback.improvements.map((improvement, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <Lightbulb className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                    <span className="text-text-dark dark:text-foreground">{improvement}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-text-medium italic">Great job! No major improvements needed.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Missing Concepts */}
      {session.feedback?.missingPoints?.length > 0 && (
        <Card className="border-red-200 dark:border-red-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Missing Concepts
            </CardTitle>
            <CardDescription>
              Important points you didn't cover in your explanation
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {session.feedback.missingPoints.map((point, index) => (
                <li key={index} className="flex items-start gap-3">
                  <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                  <span className="text-text-dark dark:text-foreground">{point}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {/* AI Feedback Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Overall Feedback</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-text-dark dark:text-foreground leading-relaxed">
            {session.feedback?.overall || 'No detailed feedback available.'}
          </p>
        </CardContent>
      </Card>

      {/* Your Transcript */}
      <Card>
        <CardHeader>
          <CardTitle>Your Explanation</CardTitle>
          <CardDescription>
            What you said during the teaching session
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-muted rounded-lg p-4">
            <p className="text-text-dark dark:text-foreground leading-relaxed whitespace-pre-wrap">
              {session.transcript}
            </p>
          </div>
          
          {/* Session Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-forest">
                {Math.floor(session.duration / 60)}:{(session.duration % 60).toString().padStart(2, '0')}
              </div>
              <div className="text-sm text-text-medium">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-forest">
                {(session.transcript?.split(' ')?.length) || 0}
              </div>
              <div className="text-sm text-text-medium">Words</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-forest">
                {session.analysis?.fillerWords || 0}
              </div>
              <div className="text-sm text-text-medium">Filler Words</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleRetry}
          className="flex-1 bg-gradient-to-r from-forest to-forest-light"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Retry This Topic
        </Button>
        <Button variant="outline">
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>
        <Button variant="outline">
          <Download className="w-5 h-5 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};

// Performance Card Component
const PerformanceCard = ({ title, score, icon: Icon, color }) => {
  const colorMap = {
    green: 'from-green-500 to-white-500',
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-text-dark dark:text-foreground">
            {score}%
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium text-text-medium">{title}</div>
          <Progress value={score} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );
};

export default SessionDetailPage;