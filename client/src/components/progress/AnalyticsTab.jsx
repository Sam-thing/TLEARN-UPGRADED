// src/components/progress/AnalyticsTab.jsx
import { motion } from 'framer-motion';
import { TrendingUp, Brain, Clock, Calendar, Target, Zap } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  PerformanceAnalysis,
  DailyActivity,
  ScoreEvolution,
  TopTopics
} from '../../pages/progress/ProgressCharts';

const AnalyticsTab = ({ progress }) => {
  const sessions = progress?.recentSessions || [];
  const stats = progress?.statistics || {};
  const topicMastery = progress?.topicMastery || [];

  return (
    <div className="space-y-6">
      {/* Performance Breakdown - NEW! */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Breakdown</CardTitle>
          <CardDescription>Detailed analysis of your teaching skills</CardDescription>
        </CardHeader>
        <CardContent>
          <PerformanceBreakdown stats={stats} />
        </CardContent>
      </Card>

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PerformanceAnalysis progress={progress} />
        <ScoreEvolution progress={progress} />
        <DailyActivity progress={progress} />
        <TopTopics topics={topicMastery} />
      </div>

      {/* Time Analytics - NEW! */}
      <Card>
        <CardHeader>
          <CardTitle>Time Analytics</CardTitle>
          <CardDescription>When and how long you study</CardDescription>
        </CardHeader>
        <CardContent>
          <TimeAnalytics sessions={sessions} />
        </CardContent>
      </Card>

      {/* Improvement Insights - NEW! */}
      <Card>
        <CardHeader>
          <CardTitle>Improvement Insights</CardTitle>
          <CardDescription>Track your progress over time</CardDescription>
        </CardHeader>
        <CardContent>
          <ImprovementInsights sessions={sessions} />
        </CardContent>
      </Card>

      {/* Difficulty Analysis - NEW! */}
      <Card>
        <CardHeader>
          <CardTitle>Topic Difficulty Analysis</CardTitle>
          <CardDescription>Your performance by difficulty level</CardDescription>
        </CardHeader>
        <CardContent>
          <DifficultyAnalysis topics={topicMastery} sessions={sessions} />
        </CardContent>
      </Card>
    </div>
  );
};

// Performance Breakdown - UNIQUE TO ANALYTICS
const PerformanceBreakdown = ({ stats }) => {
  const metrics = [
    {
      name: 'Accuracy',
      score: stats.averageAccuracy || 0,
      icon: Target,
      color: 'from-white-600 to-green-400'
    },
    {
      name: 'Clarity',
      score: stats.averageClarity || 0,
      icon: Brain,
      color: 'from-white-600 to-green-400'
    },
    {
      name: 'Confidence',
      score: stats.averageConfidence || 0,
      icon: Zap,
      color: 'from-white-600 to-green-400'
    }
  ];

  return (
    <div className="grid md:grid-cols-3 gap-6">
      {metrics.map((metric, i) => (
        <motion.div
          key={metric.name}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
          className="text-center"
        >
          <div className={`w-16 h-16 mx-auto rounded-full bg-gradient-to-br ${metric.color} flex items-center justify-center mb-4`}>
            <metric.icon className="w-8 h-8 text-white" />
          </div>
          <div className="text-4xl font-bold mb-2">{metric.score}%</div>
          <div className="text-sm text-text-medium mb-3">{metric.name}</div>
          <Progress value={metric.score} className="h-2" />
        </motion.div>
      ))}
    </div>
  );
};

// Time Analytics - NEW!
const TimeAnalytics = ({ sessions }) => {
  // Calculate best time of day
  const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
  sessions.forEach(s => {
    const hour = new Date(s.createdAt).getHours();
    if (hour >= 6 && hour < 12) timeDistribution.morning++;
    else if (hour >= 12 && hour < 17) timeDistribution.afternoon++;
    else if (hour >= 17 && hour < 21) timeDistribution.evening++;
    else timeDistribution.night++;
  });

  const bestTime = Object.keys(timeDistribution).reduce((a, b) => 
    timeDistribution[a] > timeDistribution[b] ? a : b, 'morning'
  );

  // Average session length
  const avgLength = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length / 60)
    : 0;

  // Total study time
  const totalMinutes = Math.round(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / 60);
  const totalHours = Math.floor(totalMinutes / 60);

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
        <Clock className="w-10 h-10 mx-auto mb-3 text-purple-600" />
        <div className="text-3xl font-bold mb-1">{totalHours}h {totalMinutes % 60}m</div>
        <p className="text-sm text-text-medium">Total Study Time</p>
      </div>

      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950 dark:to-cyan-950">
        <Zap className="w-10 h-10 mx-auto mb-3 text-blue-600" />
        <div className="text-3xl font-bold mb-1">{avgLength} min</div>
        <p className="text-sm text-text-medium">Avg Session Length</p>
      </div>

      <div className="text-center p-4 rounded-xl bg-gradient-to-br from-orange-50 to-yellow-50 dark:from-orange-950 dark:to-yellow-950">
        <Calendar className="w-10 h-10 mx-auto mb-3 text-orange-600" />
        <div className="text-3xl font-bold mb-1 capitalize">{bestTime}</div>
        <p className="text-sm text-text-medium">Best Time to Study</p>
      </div>
    </div>
  );
};

// Improvement Insights - NEW!
const ImprovementInsights = ({ sessions }) => {
  if (sessions.length < 2) {
    return (
      <div className="text-center py-8 text-text-medium">
        <p>Complete more sessions to see improvement insights</p>
      </div>
    );
  }

  // Compare first 3 and last 3 sessions
  const sortedSessions = [...sessions].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  const firstThree = sortedSessions.slice(0, Math.min(3, sessions.length));
  const lastThree = sortedSessions.slice(Math.max(0, sessions.length - 3));

  const firstAvg = Math.round(firstThree.reduce((sum, s) => sum + (s.feedback?.score || 0), 0) / firstThree.length);
  const lastAvg = Math.round(lastThree.reduce((sum, s) => sum + (s.feedback?.score || 0), 0) / lastThree.length);
  const improvement = lastAvg - firstAvg;

  return (
    <div className="text-center">
      <div className="grid md:grid-cols-3 gap-6 mb-6">
        <div>
          <div className="text-2xl font-bold text-text-medium mb-1">{firstAvg}%</div>
          <p className="text-sm text-text-medium">Starting Score</p>
        </div>
        <div>
          <div className={`text-4xl font-bold mb-1 ${improvement >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {improvement >= 0 ? '+' : ''}{improvement}%
          </div>
          <p className="text-sm text-text-medium">Improvement</p>
        </div>
        <div>
          <div className="text-2xl font-bold text-forest mb-1">{lastAvg}%</div>
          <p className="text-sm text-text-medium">Current Score</p>
        </div>
      </div>
      
      {improvement >= 0 ? (
        <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
          <TrendingUp className="w-4 h-4 mr-1" />
          You're improving! Keep it up!
        </Badge>
      ) : (
        <Badge className="bg-orange-500/10 text-orange-600 border-orange-500/20">
          Practice more to boost your score
        </Badge>
      )}
    </div>
  );
};

// Difficulty Analysis - NEW!
const DifficultyAnalysis = ({ topics, sessions }) => {
  const difficultyStats = {
    beginner: { count: 0, totalScore: 0, avgScore: 0 },
    intermediate: { count: 0, totalScore: 0, avgScore: 0 },
    advanced: { count: 0, totalScore: 0, avgScore: 0 }
  };

  sessions.forEach(session => {
    const difficulty = session.topic?.difficulty?.toLowerCase();
    if (difficulty && difficultyStats[difficulty]) {
      difficultyStats[difficulty].count++;
      difficultyStats[difficulty].totalScore += (session.feedback?.score || 0);
    }
  });

  // Calculate averages
  Object.keys(difficultyStats).forEach(key => {
    const stat = difficultyStats[key];
    stat.avgScore = stat.count > 0 ? Math.round(stat.totalScore / stat.count) : 0;
  });

  return (
    <div className="space-y-4">
      {Object.entries(difficultyStats).map(([difficulty, stats]) => (
        <div key={difficulty} className="p-4 rounded-xl border">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h4 className="font-semibold capitalize">{difficulty}</h4>
              <p className="text-xs text-text-medium">{stats.count} sessions</p>
            </div>
            <div className="text-2xl font-bold">
              {stats.avgScore}%
            </div>
          </div>
          <Progress value={stats.avgScore} className="h-2" />
        </div>
      ))}
    </div>
  );
};

export default AnalyticsTab;