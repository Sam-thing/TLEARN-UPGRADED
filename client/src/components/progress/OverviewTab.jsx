// src/components/progress/OverviewTab.jsx - OVERVIEW: Recent activity + quick insights
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Calendar, Clock, TrendingUp, Award, ChevronRight, Flame } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { StudyHeatmap } from '../../pages/progress/ProgressCharts';

const OverviewTab = ({ progress, onRefresh }) => {
  const navigate = useNavigate();
  const recentSessions = progress?.recentSessions || [];
  const stats = progress?.statistics || {};
  const streak = progress?.streak || { current: 0, longest: 0 };

  return (
    <div className="space-y-6">
      {/* Activity Heatmap */}
      <StudyHeatmap progress={progress} />

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Recent Sessions</CardTitle>
                <CardDescription>Your last 10 teaching sessions</CardDescription>
              </div>
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/sessions')}
              >
                View All
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {recentSessions.length > 0 ? (
              <div className="space-y-3">
                {recentSessions.map((session, i) => (
                  <RecentSessionCard 
                    key={session._id} 
                    session={session} 
                    index={i}
                    navigate={navigate}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <BookOpen className="w-12 h-12 text-text-light mx-auto mb-3" />
                <p className="text-sm text-text-medium">No sessions yet</p>
                <Button 
                  size="sm" 
                  className="mt-3"
                  onClick={() => navigate('/topics')}
                >
                  Start Teaching
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>Key metrics at a glance</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Streak Info */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-gradient-to-br from-green-50 to-white-50 dark:from-green-950 dark:to-white-950">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500 to-white-500 flex items-center justify-center">
                  <Flame className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Current Streak</p>
                  <p className="text-xs text-text-medium">Longest: {streak.longest} days</p>
                </div>
              </div>
              <div className="text-3xl font-bold text-green-600">
                {streak.current}
              </div>
            </div>

            {/* Total Sessions */}
            <InsightCard
              icon={BookOpen}
              label="Total Sessions"
              value={stats.totalSessions || 0}
              sublabel="sessions completed"
              color="from-green-500 to-white-500"
            />

            {/* Average Score */}
            <InsightCard
              icon={TrendingUp}
              label="Average Score"
              value={`${stats.averageScore || 0}%`}
              sublabel="across all sessions"
              color="from-green-500 to-white-500"
            />

            {/* Topics Explored */}
            <InsightCard
              icon={Award}
              label="Topics Explored"
              value={stats.topicsExplored || 0}
              sublabel="different topics"
              color="from-green-500 to-white-500"
            />
          </CardContent>
        </Card>
      </div>

      {/* Study Pattern Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Study Pattern</CardTitle>
          <CardDescription>Your learning consistency</CardDescription>
        </CardHeader>
        <CardContent>
          <StudyPatternSummary sessions={recentSessions} />
        </CardContent>
      </Card>
    </div>
  );
};

// Recent Session Card
const RecentSessionCard = ({ session, index, navigate }) => {
  const score = session.feedback?.score || 0;
  const scoreColor = score >= 80 ? 'text-green-600 bg-green-500/10' : 
                      score >= 60 ? 'text-yellow-600 bg-yellow-500/10' : 
                      'text-red-600 bg-red-500/10';

  return (
    <motion.button
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      onClick={() => navigate(`/sessions/${session._id}`)}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors text-left group"
    >
      <div className="w-10 h-10 rounded-lg bg-forest/10 flex items-center justify-center flex-shrink-0">
        <BookOpen className="w-5 h-5 text-forest" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm truncate">
          {session.topic?.name || 'Untitled'}
        </h4>
        <div className="flex items-center gap-2 text-xs text-text-medium">
          <Clock className="w-3 h-3" />
          {new Date(session.createdAt).toLocaleDateString()}
        </div>
      </div>
      <Badge className={scoreColor}>
        {score}%
      </Badge>
      <ChevronRight className="w-4 h-4 text-text-light group-hover:text-forest group-hover:translate-x-1 transition-all" />
    </motion.button>
  );
};

// Insight Card
const InsightCard = ({ icon: Icon, label, value, sublabel, color }) => {
  return (
    <div className="flex items-center justify-between p-4 rounded-xl border">
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${color} flex items-center justify-center`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm">{label}</p>
          <p className="text-xs text-text-medium">{sublabel}</p>
        </div>
      </div>
      <div className="text-2xl font-bold">
        {value}
      </div>
    </div>
  );
};

// Study Pattern Summary
const StudyPatternSummary = ({ sessions }) => {
  // Calculate study days this week
  const thisWeek = sessions.filter(s => {
    const sessionDate = new Date(s.createdAt);
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return sessionDate > weekAgo;
  });

  // Calculate average session duration
  const avgDuration = sessions.length > 0
    ? Math.round(sessions.reduce((sum, s) => sum + (s.duration || 0), 0) / sessions.length / 60)
    : 0;

  // Most studied day
  const dayCount = {};
  sessions.forEach(s => {
    const day = new Date(s.createdAt).toLocaleDateString('en-US', { weekday: 'long' });
    dayCount[day] = (dayCount[day] || 0) + 1;
  });
  const mostStudiedDay = Object.keys(dayCount).reduce((a, b) => dayCount[a] > dayCount[b] ? a : b, 'N/A');

  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="text-center">
        <div className="text-3xl font-bold text-forest mb-1">{thisWeek.length}</div>
        <p className="text-sm text-text-medium">Sessions this week</p>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-forest mb-1">{avgDuration}min</div>
        <p className="text-sm text-text-medium">Avg session length</p>
      </div>
      <div className="text-center">
        <div className="text-3xl font-bold text-forest mb-1">{mostStudiedDay}</div>
        <p className="text-sm text-text-medium">Most active day</p>
      </div>
    </div>
  );
};

export default OverviewTab;