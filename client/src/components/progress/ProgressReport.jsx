// src/components/progress/ProgressReport.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Trophy,
  Star,
  Award,
  Target,
  Flame,
  Zap,
  Brain,
  BookOpen,
  Calendar,
  Plus,
  X,
  Check,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const ProgressReport = ({ progress }) => {
  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <StatsOverview progress={progress} />

      {/* Charts Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        <PerformanceAnalysis progress={progress} />
        <DailyActivity progress={progress} />
        <ScoreEvolution progress={progress} />
        <StudyHeatmap progress={progress} />
      </div>

      {/* Top Topics */}
      <TopTopics topics={progress?.topicMastery || []} />

      {/* Achievements */}
      <AchievementManager achievements={progress?.achievements || []} stats={progress?.statistics} />

      {/* Learning Goals */}
      <LearningGoals goals={progress?.goals || []} stats={progress?.statistics} />
    </div>
  );
};

// Stats Overview Component
const StatsOverview = ({ progress }) => {
  const stats = [
    {
      label: 'Total Sessions',
      value: progress?.statistics?.totalSessions || 0,
      icon: BookOpen,
      color: 'from-green-600 to-white-400',
      trend: '+12%'
    },
    {
      label: 'Average Score',
      value: `${progress?.statistics?.averageScore || 0}%`,
      icon: TrendingUp,
      color: 'from-green-600 to-white-400',
      trend: '+5%'
    },
    {
      label: 'Learning Streak',
      value: `${progress?.streak?.current || 0} days`,
      icon: Flame,
      color: 'from-green-600 to-white-400',
      trend: 'Active'
    },
    {
      label: 'Topics Explored',
      value: progress?.statistics?.topicsExplored || 0,
      icon: Brain,
      color: 'from-green-600 to-white-400',
      trend: '+3 new'
    }
  ];

  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.color}`}>
                  <stat.icon className="w-6 h-6 text-white" />
                </div>
                {stat.trend && (
                  <Badge variant="secondary" className="text-green-600">
                    {stat.trend}
                  </Badge>
                )}
              </div>
              <div className="DM Mono, monospace text-3xl font-bold text-text-dark dark:text-foreground mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-text-medium">{stat.label}</div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
};

// src/components/progress/ProgressCharts.jsx - REAL DATA VERSION

// import { CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import { motion } from 'framer-motion';
// import { Calendar } from 'lucide-react';
// import {
//   RadarChart,
//   Radar,
//   PolarGrid,
//   PolarAngleAxis,
//   PolarRadiusAxis,
//   BarChart,
//   Bar,
//   AreaChart,
//   Area,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer
// } from 'recharts';

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

// Daily Activity Chart - USES REAL DATA
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

// Study Heatmap - USES REAL DATA
export const StudyHeatmap = ({ progress }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeks = 4;

  // Generate activity map from real sessions
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

    // Count sessions per day
    sessions.forEach(session => {
      const sessionDate = new Date(session.createdAt).toISOString().split('T')[0];
      if (activityMap[sessionDate] !== undefined) {
        activityMap[sessionDate]++;
      }
    });

    return activityMap;
  };

  const getActivityColor = (count) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-800';
    if (count === 1) return 'bg-green-200 dark:bg-green-900';
    if (count === 2) return 'bg-green-300 dark:bg-green-800';
    if (count >= 3) return 'bg-green-400 dark:bg-green-700';
    return 'bg-green-500 dark:bg-green-600';
  };

  const activityData = getActivityData();
  const dateKeys = Object.keys(activityData).sort();

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
          {/* Day labels */}
          <div className="hidden sm:grid grid-cols-7 gap-2 text-xs text-text-light mb-2">
            {days.map(day => <div key={day} className="text-center">{day}</div>)}
          </div>
          <div className="grid sm:hidden grid-cols-7 gap-1.5 text-[10px] text-text-light mb-2">
            {days.map(day => <div key={day} className="text-center">{day[0]}</div>)}
          </div>
          
          {/* Heatmap grid */}
          {[...Array(weeks)].map((_, week) => (
            <div key={week} className="grid grid-cols-7 gap-1.5 sm:gap-2">
              {dateKeys.slice(week * 7, (week + 1) * 7).map((dateKey, index) => {
                const count = activityData[dateKey] || 0;
                const date = new Date(dateKey);
                return (
                  <div
                    key={`${week}-${index}`}
                    className={`aspect-square rounded ${getActivityColor(count)} transition-all cursor-pointer hover:ring-2 hover:ring-green-500 hover:scale-110`}
                    title={`${date.toLocaleDateString()}: ${count} session${count !== 1 ? 's' : ''}`}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// Top Topics Component
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

// Achievement Manager Component
const AchievementManager = ({ achievements = [], stats }) => {
  const [customAchievements, setCustomAchievements] = useState([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newAchievement, setNewAchievement] = useState({
    title: '',
    description: '',
    icon: 'Trophy'
  });

  const iconOptions = [
    { name: 'Trophy', Icon: Trophy },
    { name: 'Star', Icon: Star },
    { name: 'Award', Icon: Award },
    { name: 'Target', Icon: Target },
    { name: 'Flame', Icon: Flame },
    { name: 'Zap', Icon: Zap },
    { name: 'Brain', Icon: Brain },
    { name: 'BookOpen', Icon: BookOpen }
  ];

  const defaultAchievements = [
    {
      id: 'first-session',
      title: 'Quick Learner',
      description: 'Completed first session',
      icon: 'Trophy',
      earned: (stats?.totalSessions || 0) >= 1
    },
    {
      id: 'consistency',
      title: 'Consistency Champion',
      description: '7+ day streak',
      icon: 'Flame',
      earned: (stats?.streak?.current || 0) >= 7
    },
    {
      id: 'session-master',
      title: 'Session Master',
      description: '10+ sessions completed',
      icon: 'Award',
      earned: (stats?.totalSessions || 0) >= 10
    },
    {
      id: 'high-achiever',
      title: 'High Achiever',
      description: '80%+ average score',
      icon: 'Star',
      earned: (stats?.averageScore || 0) >= 80
    }
  ];

  const allAchievements = [...defaultAchievements, ...customAchievements];

  const handleCreateAchievement = () => {
    if (!newAchievement.title) return;

    setCustomAchievements([
      ...customAchievements,
      {
        ...newAchievement,
        id: `custom-${Date.now()}`,
        earned: false,
        isCustom: true
      }
    ]);

    setNewAchievement({ title: '', description: '', icon: 'Trophy' });
    setIsCreating(false);
  };

  const toggleCustomAchievement = (id) => {
    setCustomAchievements(
      customAchievements.map(a =>
        a.id === id ? { ...a, earned: !a.earned } : a
      )
    );
  };

  const deleteCustomAchievement = (id) => {
    setCustomAchievements(customAchievements.filter(a => a.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Achievements</CardTitle>
            <CardDescription>Your learning milestones</CardDescription>
          </div>
          <Button
            onClick={() => setIsCreating(!isCreating)}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Custom Achievement
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Create Achievement Form */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-4 border-2 border-dashed border-green-300 rounded-xl space-y-3"
            >
              <Input
                placeholder="Achievement Title"
                value={newAchievement.title}
                onChange={(e) => setNewAchievement({ ...newAchievement, title: e.target.value })}
              />
              <Textarea
                placeholder="Description"
                value={newAchievement.description}
                onChange={(e) => setNewAchievement({ ...newAchievement, description: e.target.value })}
                rows={2}
              />
              <div className="grid grid-cols-4 gap-2">
                {iconOptions.map(({ name, Icon }) => (
                  <button
                    key={name}
                    onClick={() => setNewAchievement({ ...newAchievement, icon: name })}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      newAchievement.icon === name
                        ? 'border-green-500 bg-green-50 dark:bg-green-950'
                        : 'border-green-200 hover:border-green-300'
                    }`}
                  >
                    <Icon className="w-5 h-5 mx-auto" />
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateAchievement} className="flex-1" size="sm">
                  Create
                </Button>
                <Button onClick={() => setIsCreating(false)} variant="outline" className="flex-1" size="sm">
                  Cancel
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Achievements Grid */}
        <div className="grid md:grid-cols-2 gap-4">
          {allAchievements.map((achievement, index) => {
            const IconComponent = iconOptions.find(i => i.name === achievement.icon)?.Icon || Trophy;
            
            return (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className={`relative p-4 rounded-xl border-2 transition-all ${
                  achievement.earned
                    ? 'border-green-300 bg-gradient-to-br from-green-50 to-white-50 dark:from-green-950 dark:to-white-950'
                    : 'border-green-200 bg-green-50 dark:bg-green-900 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    achievement.earned
                      ? 'bg-gradient-to-br from-green-400 to-white-500'
                      : 'bg-gray-300'
                  }`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-text-dark dark:text-foreground">
                      {achievement.title}
                    </h4>
                    <p className="text-sm text-text-medium">{achievement.description}</p>
                  </div>
                  {achievement.isCustom && (
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => toggleCustomAchievement(achievement.id)}
                      >
                        {achievement.earned ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => deleteCustomAchievement(achievement.id)}
                      >
                        <X className="w-4 h-4 text-red-500" />
                      </Button>
                    </div>
                  )}
                </div>
                {achievement.earned && (
                  <div className="absolute top-2 right-2">
                    <Check className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

// Learning Goals Component
const LearningGoals = ({ goals = [], stats }) => {
  const [customGoals, setCustomGoals] = useState(goals.filter(g => g.custom) || []);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  const predefinedGoals = [
    {
      id: 'sessions-50',
      goal: 'Complete 50 sessions',
      target: 50,
      current: stats?.totalSessions || 0
    },
    {
      id: 'score-90',
      goal: 'Achieve 90% average score',
      target: 90,
      current: stats?.averageScore || 0
    },
    {
      id: 'streak-30',
      goal: 'Maintain 30-day streak',
      target: 30,
      current: stats?.streak?.current || 0
    }
  ];

  const allGoals = [...predefinedGoals, ...customGoals];

  const handleAddGoal = () => {
    if (!newGoal.trim()) return;

    setCustomGoals([
      ...customGoals,
      {
        id: `custom-${Date.now()}`,
        goal: newGoal,
        custom: true,
        completed: false
      }
    ]);

    setNewGoal('');
    setIsAdding(false);
  };

  const toggleCustomGoal = (id) => {
    setCustomGoals(
      customGoals.map(g =>
        g.id === id ? { ...g, completed: !g.completed } : g
      )
    );
  };

  const deleteCustomGoal = (id) => {
    setCustomGoals(customGoals.filter(g => g.id !== id));
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Learning Goals</CardTitle>
            <CardDescription>Track your progress towards goals</CardDescription>
          </div>
          <Button
            onClick={() => setIsAdding(!isAdding)}
            variant="outline"
            size="sm"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Goal
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add Goal Form */}
        <AnimatePresence>
          {isAdding && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex gap-2"
            >
              <Input
                placeholder="Enter your goal..."
                value={newGoal}
                onChange={(e) => setNewGoal(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddGoal()}
              />
              <Button onClick={handleAddGoal} size="sm">
                Add
              </Button>
              <Button onClick={() => setIsAdding(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Goals List */}
        <div className="space-y-3">
          {allGoals.map((goal, index) => {
            const progress = goal.target ? Math.min((goal.current / goal.target) * 100, 100) : 0;
            const isCompleted = goal.custom ? goal.completed : progress >= 100;

            return (
              <motion.div
                key={goal.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`p-4 rounded-xl border-2 transition-all ${
                  isCompleted
                    ? 'border-green-300 bg-green-50 dark:bg-green-950'
                    : 'border-green-200 bg-green-50 dark:bg-green-950'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Target className={`w-5 h-5 ${isCompleted ? 'text-green-500' : 'text-green-500'}`} />
                    <span className={`font-medium ${isCompleted ? 'line-through text-text-light' : 'text-text-dark dark:text-foreground'}`}>
                      {goal.goal}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {goal.custom && (
                      <>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => toggleCustomGoal(goal.id)}
                        >
                          {isCompleted ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          onClick={() => deleteCustomGoal(goal.id)}
                        >
                          <X className="w-4 h-4 text-red-500" />
                        </Button>
                      </>
                    )}
                    {!goal.custom && (
                      <span className="text-sm font-semibold text-green-600">
                        {goal.current}/{goal.target}
                      </span>
                    )}
                  </div>
                </div>
                {!goal.custom && (
                  <Progress value={progress} className="h-2" />
                )}
              </motion.div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};

export default ProgressReport;