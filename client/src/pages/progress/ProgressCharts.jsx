// src/components/progress/ProgressCharts.jsx - REAL DATA VERSION

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { motion } from 'framer-motion';
import { Calendar } from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  BarChart,
  Bar,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

// Performance Analysis Chart - USES REAL DATA
export const PerformanceAnalysis = ({ progress }) => {
  // Extract real performance metrics from sessions
  const calculatePerformanceMetrics = () => {
    const sessions = progress?.recentSessions || [];
    
    if (sessions.length === 0) {
      return [
        { subject: 'Accuracy', value: 0 },
        { subject: 'Clarity', value: 0 },
        { subject: 'Confidence', value: 0 },
        { subject: 'Completeness', value: 0 },
        { subject: 'Organization', value: 0 }
      ];
    }

    // Calculate averages from actual session feedback
    const totals = { accuracy: 0, clarity: 0, confidence: 0, completeness: 0, organization: 0 };
    let count = 0;

    sessions.forEach(session => {
      if (session.feedback) {
        totals.accuracy += session.feedback.accuracy || 0;
        totals.clarity += session.feedback.clarity || 0;
        totals.confidence += session.feedback.confidence || 0;
        totals.completeness += session.feedback.completeness || 0;
        totals.organization += session.feedback.organization || 0;
        count++;
      }
    });

    if (count === 0) return [
      { subject: 'Accuracy', value: 0 },
      { subject: 'Clarity', value: 0 },
      { subject: 'Confidence', value: 0 },
      { subject: 'Completeness', value: 0 },
      { subject: 'Organization', value: 0 }
    ];

    return [
      { subject: 'Accuracy', value: Math.round(totals.accuracy / count) },
      { subject: 'Clarity', value: Math.round(totals.clarity / count) },
      { subject: 'Confidence', value: Math.round(totals.confidence / count) },
      { subject: 'Completeness', value: Math.round(totals.completeness / count) },
      { subject: 'Organization', value: Math.round(totals.organization / count) }
    ];
  };

  const data = calculatePerformanceMetrics();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Performance Analysis</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Your teaching skills breakdown</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <RadarChart data={data}>
            <PolarGrid stroke="#059669" opacity={0.2} />
            <PolarAngleAxis dataKey="subject" stroke="#059669" tick={{ fontSize: 10 }} />
            <PolarRadiusAxis stroke="#059669" tick={{ fontSize: 10 }} />
            <Radar name="Performance" dataKey="value" stroke="#059669" fill="#059669" fillOpacity={0.6} />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Daily Activity Chart
export const DailyActivity = ({ progress }) => {
  // Generate last 7 days activity from real sessions
  const generateDailyActivity = () => {
    const sessions = progress?.recentSessions || [];
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const today = new Date();
    const last7Days = [];

    // Initialize last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      last7Days.push({
        date: dayName,
        fullDate: date.toISOString().split('T')[0],
        sessions: 0
      });
    }

    // Count sessions per day
    sessions.forEach(session => {
      const sessionDate = new Date(session.createdAt).toISOString().split('T')[0];
      const dayData = last7Days.find(d => d.fullDate === sessionDate);
      if (dayData) {
        dayData.sessions++;
      }
    });

    return last7Days;
  };

  const data = generateDailyActivity();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Daily Activity</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Sessions completed this week</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis dataKey="date" stroke="#059669" tick={{ fontSize: 10 }} />
            <YAxis stroke="#059669" tick={{ fontSize: 10 }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #059669',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Bar dataKey="sessions" fill="#059669" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Score Evolution Chart - USES REAL DATA
export const ScoreEvolution = ({ progress }) => {
  // Generate score evolution from actual sessions
  const generateScoreEvolution = () => {
    const sessions = progress?.recentSessions || [];
    
    if (sessions.length === 0) {
      return [{ session: 1, score: 0 }];
    }

    // Sort sessions by date
    const sortedSessions = [...sessions].sort((a, b) => 
      new Date(a.createdAt) - new Date(b.createdAt)
    );

    // Map to chart data
    return sortedSessions.map((session, index) => ({
      session: index + 1,
      score: session.feedback?.score || 0,
      date: new Date(session.createdAt).toLocaleDateString()
    }));
  };

  const data = generateScoreEvolution();

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Score Evolution</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Your improvement over time</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <ResponsiveContainer width="100%" height={250} className="sm:h-[300px]">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#059669" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#059669" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.3} />
            <XAxis dataKey="session" stroke="#059669" tick={{ fontSize: 10 }} />
            <YAxis stroke="#059669" tick={{ fontSize: 10 }} domain={[0, 100]} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#ffffff',
                border: '1px solid #059669',
                borderRadius: '8px',
                fontSize: '12px'
              }}
            />
            <Area
              type="monotone"
              dataKey="score"
              stroke="#059669"
              strokeWidth={2}
              fillOpacity={1}
              fill="url(#scoreGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

// Study Heatmap - USES REAL DATA (same as Dashboard ActivityCalendar)
export const StudyHeatmap = ({ progress }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeks = 4;

  // Generate activity map from real sessions - SAME AS DASHBOARD
  const getActivityData = () => {
    const sessions = progress?.recentSessions || [];
    const activityMap = {};
    const today = new Date();

    // Initialize last 28 days
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      activityMap[dateKey] = 0;
    }

    // Count sessions per day - REAL DATA
    if (Array.isArray(sessions)) {
      sessions.forEach(session => {
        if (session.createdAt) {
          const sessionDate = new Date(session.createdAt).toISOString().split('T')[0];
          if (activityMap[sessionDate] !== undefined) {
            activityMap[sessionDate]++;
          }
        }
      });
    }

    return activityMap;
  };

  // Dynamic color based on actual session count
  const getActivityColor = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count === 2) return 'bg-green-300 dark:bg-green-800';
    if (count >= 3) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-500 dark:bg-green-600';
  };

  const activityData = getActivityData();
  const dateKeys = Object.keys(activityData).sort();
  
  // Split into weeks
  const weekData = [];
  for (let week = 0; week < weeks; week++) {
    weekData.push(dateKeys.slice(week * 7, (week + 1) * 7));
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="flex items-center gap-2 text-lg sm:text-xl">
          <Calendar className="w-4 h-4 sm:w-5 sm:h-5" />
          Study Time Heatmap
        </CardTitle>
        <CardDescription className="text-xs sm:text-sm">Your study consistency</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-2 sm:space-y-3">
          {/* Day labels - responsive */}
          <div className="hidden sm:grid grid-cols-7 gap-2 text-xs text-text-light mb-2">
            {days.map(day => <div key={day} className="text-center">{day}</div>)}
          </div>
          <div className="grid sm:hidden grid-cols-7 gap-1.5 text-[10px] text-text-light mb-2">
            {days.map(day => <div key={day} className="text-center">{day[0]}</div>)}
          </div>
          
          {/* Heatmap grid - REAL DATA */}
          {weekData.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {week.map((dateKey, dayIndex) => {
                const count = activityData[dateKey] || 0;
                const date = new Date(dateKey);
                const isToday = new Date().toISOString().split('T')[0] === dateKey;
                
                return (
                  <div
                    key={`${weekIndex}-${dayIndex}`}
                    className={`
                      aspect-square rounded transition-all cursor-pointer relative group
                      ${getActivityColor(count)}
                      hover:ring-2 hover:ring-green-500 hover:scale-110
                      ${isToday ? 'ring-2 ring-green-500' : ''}
                    `}
                    title={`${date.toLocaleDateString()}: ${count} session${count !== 1 ? 's' : ''}`}
                  >
                    {/* Tooltip */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-[10px] sm:text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: <span className="font-semibold">{count}</span> session{count !== 1 ? 's' : ''}
                    </div>
                    
                    {/* Today indicator */}
                    {isToday && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white shadow-sm" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
          
          {/* Legend */}
          <div className="flex items-center justify-between pt-3 border-t">
            <span className="text-[10px] sm:text-xs text-text-light">Less</span>
            <div className="flex items-center gap-1 sm:gap-1.5">
              {[0, 1, 2, 3, 5].map(level => (
                <div
                  key={level}
                  className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded ${getActivityColor(level)}`}
                  title={level === 0 ? 'No sessions' : level === 5 ? '5+ sessions' : `${level} session${level > 1 ? 's' : ''}`}
                />
              ))}
            </div>
            <span className="text-[10px] sm:text-xs text-text-light">More</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// Top Topics Component - USES REAL DATA
export const TopTopics = ({ topics }) => {
  const topTopics = Array.isArray(topics) ? topics.slice(0, 5) : [];

  if (topTopics.length === 0) {
    return (
      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Top Topics</CardTitle>
          <CardDescription className="text-xs sm:text-sm">Your best performing subjects</CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 pt-0">
          <div className="text-center py-8">
            <p className="text-sm text-text-medium">No topics data yet. Complete more sessions to see your top topics!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl">Top Topics</CardTitle>
        <CardDescription className="text-xs sm:text-sm">Your best performing subjects</CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6 pt-0">
        <div className="space-y-3 sm:space-y-4">
          {topTopics.map((topic, index) => (
            <motion.div
              key={topic.topic?._id || index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950 dark:to-violet-950 hover:shadow-md transition-shadow"
            >
              <div className="flex-shrink-0">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                  #{index + 1}
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-sm sm:text-base text-text-dark dark:text-foreground mb-1 truncate">
                  {topic.topic?.name || 'Unknown Topic'}
                </h4>
                <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-text-medium">
                  <span>{topic.sessionsCompleted || 0} sessions</span>
                  <span className="hidden sm:inline">•</span>
                  <Badge variant="outline" className="text-xs">{topic.topic?.subject || 'General'}</Badge>
                </div>
              </div>
              <div className="flex-shrink-0 text-right w-full sm:w-auto">
                <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-400">
                  {topic.averageScore || 0}%
                </div>
                <Progress value={topic.averageScore || 0} className="w-full sm:w-20 h-2 mt-1" />
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};