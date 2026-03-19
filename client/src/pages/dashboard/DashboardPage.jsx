// src/pages/dashboard/DashboardPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  BookOpen,
  TrendingUp,
  Users,
  Zap,
  Calendar,
  Clock,
  Award,
  ArrowRight,
  Target,
  Flame,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { sessionService } from '@/services/sessionService';
import { topicService } from '@/services/topicService';
import { useTranslation } from 'react-i18next';

const DashboardPage = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [recentSessions, setRecentSessions] = useState([]);
  const [recommendedTopics, setRecommendedTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Load each service with individual error handling
      const [statsData, sessionsData, topicsData] = await Promise.all([
        sessionService.getStats().catch(err => {
          console.error('Stats failed:', err);
          return null;
        }),
        sessionService.getRecent(5).catch(err => {
          console.error('Sessions failed:', err);
          return { sessions: [] };
        }),
        topicService.getRecommended().catch(err => {
          console.error('Topics failed:', err);
          return { topics: [] };
        })
      ]);
      
      setStats(statsData || {});
      
      const sessions = sessionsData?.sessions || sessionsData || [];
      const topics = topicsData?.topics || topicsData || [];
      
      setRecentSessions(Array.isArray(sessions) ? sessions : []);
      setRecommendedTopics(Array.isArray(topics) ? topics : []);
      
    } catch (error) {
      console.error('Failed to load dashboard:', error);
      setRecentSessions([]);
      setRecommendedTopics([]);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      icon: BookOpen,
      title: "Browse Topics",
      description: "Find new subjects to learn",
      action: () => navigate('/topics'),
      gradient: 'from-white-600 to-green-400'
    },
    {
      icon: Users,
      title: "Study Rooms",
      description: "Join peer learning sessions",
      action: () => navigate('/rooms'),
      gradient: 'from-white-600 to-green-400'
    },
    {
      icon: Target,
      title: "My Progress",
      description: "View your analytics",
      action: () => navigate('/progress'),
      gradient: 'from-white-600 to-green-400'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-[oklch(0.62_0.17_158)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pb-12">
      {/* Welcome Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative"
      >
        {/* Subtle grid background */}
          <div
            className="absolute inset-0 opacity-[0.02] pointer-events-none"
            style={{
              backgroundImage: `
                linear-gradient(oklch(0.14_0.012_255) 1px, transparent 1px),
                linear-gradient(90deg, oklch(0.14_0.012_255) 1px, transparent 1px)
              `,
              backgroundSize: '48px 48px'
            }}
          />

          <div className="relative flex items-start justify-between">
            <div>
              <div
                className="text-xs font-semibold text-[oklch(0.62_0.17_158)] uppercase tracking-[0.15em] mb-3"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                — Your vault
              </div>
              <h1
                className="font-black text-5xl tracking-[-0.04em] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] mb-2"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {t('dashboard.welcome')}, <span className="text-green-700">{user?.name?.split(' ')[0] || 'Learner'}.</span>
    
              </h1>
              <p className="text-[oklch(0.36_0.010_255)] dark:text-[oklch(0.60_0.008_255)] text-lg">
                Ready to <span className="text-green-700">level up</span> your understanding?
              </p>
              
            </div>

            {/* Status badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-[oklch(0.62_0.17_158/10%)] dark:bg-[oklch(0.62_0.17_158/15%)] border border-[oklch(0.62_0.17_158/25%)]">
            <span className="w-2 h-2 rounded-full bg-[oklch(0.62_0.17_158)] animate-pulse" />
            <span className="text-sm font-medium text-[oklch(0.62_0.17_158)]" style={{ fontFamily: 'DM Mono, monospace' }}>
              Active
            </span>
          </div>
        </div>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={BookOpen}
          title={t('dashboard.stats.sessions')}
          value={stats?.totalSessions || 0}
          trend="+12%"
          gradient="from-white-600 to-green-400"
        />
        <StatCard
          icon={TrendingUp}
          title={t('dashboard.stats.avgScore')}
          value={`${stats?.averageScore || 0}%`}
          trend="+5%"
          gradient="from-white-600 to-green-400"
        />
        <StatCard
          icon={Flame}
          title={t('dashboard.stats.streak')}
          value={`${stats?.streak?.current || 0} days`}
          subtitle="Don't break the chain!"
          gradient="from-white-600 to-green-400"
        />
        <StatCard
          icon={Award}
          title={t('dashboard.stats.achievements')}
          value={stats?.achievements || 0}
          subtitle="Unlocked"
          gradient="from-white-600 to-green-400"
        />
      </div>

      {/* Quick Actions */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2
            className="font-bold text-2xl tracking-[-0.02em] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)]"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
           Quick Actions
          </h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <motion.button
              key={action.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.08 }}
              onClick={action.action}
              className="card-vault group p-6 rounded-xl cursor-pointer text-left hover:bg-[oklch(0.96_0.004_240)] dark:hover:bg-[oklch(0.20_0.008_255)] transition-colors"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <action.icon className="w-5 h-5 text-white" />
              </div>
              <h3
                className="font-bold text-lg text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] mb-2 tracking-[-0.02em]"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {action.title}
              </h3>
              <p className="text-sm text-[oklch(0.52_0.008_255)] dark:text-[oklch(0.58_0.008_255)] leading-relaxed">
                {action.description}
              </p>
              <div className="flex items-center text-sm font-medium text-[oklch(0.62_0.17_158)] opacity-0 group-hover:opacity-100 transition-opacity mt-2">
                Open
                <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Recent Sessions & Recommended Topics */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Recent Sessions */}
        <div className="card-vault p-6 rounded-xl">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3
                className="font-bold text-xl tracking-[-0.02em] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)]"
                style={{ fontFamily: 'DM Mono, monospace' }}
              >
                {t('dashboard.stats.sessions')}
              </h3>
              <p className="text-sm text-[oklch(0.52_0.008_255)] mt-0.5">
                Last {recentSessions.length} completed
              </p>
            </div>
            <button
              onClick={() => navigate('/sessions')}
              className="text-sm font-medium text-[oklch(0.62_0.17_158)] hover:text-[oklch(0.50_0.17_158)] flex items-center gap-1"
            >
              {t('common.viewAll')}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          
          <div className="space-y-3">
            {recentSessions.length > 0 ? (
              recentSessions.map((session, i) => (
                <motion.div
                  key={session._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <SessionCard session={session} navigate={navigate} />
                </motion.div>
              ))
            ) : (
              <EmptyState
                icon={BookOpen}
                message="No sessions yet. Start teaching to see them here."
                action={() => navigate('/topics')}
                actionText="Browse Topics"
              />
            )}
          </div>
        </div>

        {/* Recommended Topics */}
        <div className="card-vault p-6 rounded-xl">
          <div className="mb-5">
            <h3
              className="font-bold text-xl tracking-[-0.02em] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] mb-1"
              style={{ fontFamily: 'Cabinet Grotesk, DM Sans, sans-serif' }}
            >
              {t("dashboard.recommendedTopics")}
            </h3>
            <p className="text-sm text-[oklch(0.52_0.008_255)]">
              Based on your learning path
            </p>
          </div>
          
          <div className="space-y-2">
            {Array.isArray(recommendedTopics) && recommendedTopics.length > 0 ? (
              recommendedTopics.slice(0, 5).map((topic, i) => {
                // DEBUG: Check if topic has valid ID
                const topicId = topic._id || topic.id;
                console.log('Recommended Topic:', topic.name, 'ID:', topicId);
                
                // Skip topics without valid IDs
                if (!topicId || topicId === 'undefined') {
                  console.warn('Skipping topic without valid ID:', topic);
                  return null;
                }
                
                return (
                  <motion.div
                    key={topicId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                  >
                    <TopicRecommendation topic={topic} navigate={navigate} />
                  </motion.div>
                );
              })
            ) : (
              <EmptyState
                icon={Sparkles}
                message="Complete a few sessions to get recommendations."
              />
            )}
          </div>
        </div>
      </div>

      {/* Learning Calendar */}
      <div className="card-vault p-6 rounded-xl">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[oklch(0.62_0.17_158)]" />
            <h3
              className="font-bold text-xl tracking-[-0.02em] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)]"
              style={{ fontFamily: 'DM Mono, monospace' }}
            >
              Activity Heatmap
            </h3>
          </div>
          <span
            className="text-xs text-[oklch(0.56_0.008_255)] uppercase tracking-widest"
            style={{ fontFamily: 'DM Mono, monospace' }}
          >
            Last 4 weeks
          </span>
        </div>
        <ActivityCalendar sessions={recentSessions} />
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, title, value, trend, subtitle, gradient }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="card-vault p-6 rounded-xl"
    >
      <div className="flex items-start justify-between mb-4">
        <div className={`w-11 h-11 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shadow-lg`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        {trend && (
          <span className="text-xs font-DM Mono, monospace text-green-600 dark:text-green-400 px-2 py-1 bg-green-50 dark:bg-green-950/50 rounded-full">
            {trend}
          </span>
        )}
      </div>
      <div>
        <div
          className="font-black text-3xl tracking-[-0.02em] text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] mb-1"
          style={{ fontFamily: 'DM Mono, monospace' }}
        >
          {value}
        </div>
        <div className="text-xs text-[oklch(0.56_0.008_255)] uppercase tracking-widest" style={{ fontFamily: 'DM Mono, monospace' }}>
          {title}
        </div>
        {subtitle && (
          <div className="text-xs text-[oklch(0.72_0.005_255)] mt-1">{subtitle}</div>
        )}
      </div>
    </motion.div>
  );
};

// Session Card Component
const SessionCard = ({ session, navigate }) => {
  const score = session.feedback?.score || 0;
  const scoreColor = score >= 80 ? 'text-green-600' : score >= 60 ? 'text-yellow-600' : 'text-orange-600';

  return (
    <button
      onClick={() => navigate(`/sessions/${session._id}`)}
      className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-[oklch(0.96_0.004_240)] dark:hover:bg-[oklch(0.20_0.008_255)] transition-colors group text-left"
    >
      <div className="w-10 h-10 rounded-lg bg-[oklch(0.62_0.17_158/10%)] dark:bg-[oklch(0.62_0.17_158/15%)] flex items-center justify-center flex-shrink-0">
        <BookOpen className="w-5 h-5 text-[oklch(0.62_0.17_158)]" />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] truncate">
          {session.topic?.name || 'Untitled Session'}
        </h4>
        <div className="flex items-center gap-2 text-xs text-[oklch(0.56_0.008_255)]">
          <Clock className="w-3 h-3" />
          {new Date(session.createdAt).toLocaleDateString()}
        </div>
      </div>
      <div className="text-right flex-shrink-0">
        <div className={`font-bold text-lg ${scoreColor}`}>
          {score}%
        </div>
      </div>
    </button>
  );
};

// Topic Recommendation Component
const TopicRecommendation = ({ topic, navigate }) => {
  return (
    <button
      onClick={() => {
        const topicId = topic._id || topic.id;
        if (topicId && topicId !== 'undefined') {
          navigate(`/topics/${topicId}`);
        }
      }}
      className="w-full flex items-center justify-between p-3 rounded-lg border border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)] hover:border-[oklch(0.62_0.17_158/40%)] hover:bg-[oklch(0.96_0.004_240)] dark:hover:bg-[oklch(0.20_0.008_255)] transition-all group text-left"
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="w-9 h-9 rounded-lg bg-[oklch(0.80_0.17_72/15%)] flex items-center justify-center flex-shrink-0">
          <Sparkles className="w-4 h-4 text-[oklch(0.80_0.17_72)]" />
        </div>
        <div className="min-w-0">
          <h4 className="font-semibold text-sm text-[oklch(0.14_0.012_255)] dark:text-[oklch(0.96_0.004_240)] truncate">
            {topic.name}
          </h4>
          <p className="text-xs text-[oklch(0.56_0.008_255)]">{topic.subject}</p>
        </div>
      </div>
      <ChevronRight className="w-4 h-4 text-[oklch(0.62_0.17_158)] flex-shrink-0 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
    </button>
  );
};

// Activity Calendar Component - Responsive & Data-Driven
const ActivityCalendar = ({ sessions = [] }) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const weeks = 4;
  
  // Create activity map from real session data
  const getActivityData = () => {
    const activityMap = {};
    const today = new Date();
    
    // Initialize last 28 days with 0 sessions
    for (let i = 27; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toISOString().split('T')[0];
      activityMap[dateKey] = 0;
    }
    
    // Count actual sessions per day
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
    if (count === 0) return 'bg-[oklch(0.96_0.004_240)] dark:bg-[oklch(0.20_0.008_255)]';
    if (count === 1) return 'bg-[oklch(0.62_0.17_158/20%)]';
    if (count === 2) return 'bg-[oklch(0.62_0.17_158/40%)]';
    if (count >= 3) return 'bg-[oklch(0.62_0.17_158/60%)]';
    if (count >= 5) return 'bg-[oklch(0.62_0.17_158)]';
    return 'bg-[oklch(0.62_0.17_158)]';
  };
  
  const activityData = getActivityData();
  const dateKeys = Object.keys(activityData).sort();
  
  // Split into weeks
  const weekData = [];
  for (let week = 0; week < weeks; week++) {
    weekData.push(dateKeys.slice(week * 7, (week + 1) * 7));
  }

  return (
    <div className="space-y-3">
      {/* Day labels - Responsive: hide on xs, abbreviated on sm, full on md+ */}
      <div className="hidden md:grid grid-cols-7 gap-2 text-xs text-[oklch(0.56_0.008_255)]" style={{ fontFamily: 'DM Mono, monospace' }}>
        {days.map(day => (
          <div key={day} className="text-center">{day}</div>
        ))}
      </div>
      
      {/* Abbreviated labels on small screens */}
      <div className="grid md:hidden grid-cols-7 gap-1.5 sm:gap-2 text-[10px] sm:text-xs text-[oklch(0.56_0.008_255)]" style={{ fontFamily: 'DM Mono, monospace' }}>
        {days.map(day => (
          <div key={day} className="text-center">{day[0]}</div>
        ))}
      </div>

      {/* Calendar grid - Responsive gaps */}
      {weekData.map((week, weekIndex) => (
        <div key={weekIndex} className="grid grid-cols-7 gap-1.5 sm:gap-2 md:gap-2.5">
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
                  hover:ring-2 hover:ring-[oklch(0.62_0.17_158)] 
                  hover:scale-110 sm:hover:scale-125
                  ${isToday ? 'ring-2 ring-[oklch(0.62_0.17_158)] ring-offset-1' : ''}
                `}
                title={`${date.toLocaleDateString()}: ${count} session${count !== 1 ? 's' : ''}`}
              >
                {/* Tooltip - only show on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-[oklch(0.14_0.012_255)] text-white text-[10px] sm:text-xs rounded shadow-lg opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                  {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}: <span className="font-semibold">{count}</span> session{count !== 1 ? 's' : ''}
                </div>
                
                {/* Today dot indicator */}
                {isToday && (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-white dark:bg-[oklch(0.96_0.004_240)] shadow-sm" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
      
      {/* Legend - Responsive sizing */}
      <div className="flex items-center justify-between pt-3 border-t border-[oklch(0.91_0.004_240)] dark:border-[oklch(1_0_0/9%)]">
        <span className="text-[10px] sm:text-xs text-[oklch(0.56_0.008_255)]" style={{ fontFamily: 'DM Mono, monospace' }}>
          Less
        </span>
        <div className="flex items-center gap-1 sm:gap-1.5">
          {[0, 1, 2, 3, 5].map(level => (
            <div
              key={level}
              className={`w-3 h-3 sm:w-3.5 sm:h-3.5 md:w-4 md:h-4 rounded ${getActivityColor(level)}`}
              title={level === 0 ? 'No sessions' : level === 5 ? '5+ sessions' : `${level} session${level > 1 ? 's' : ''}`}
            />
          ))}
        </div>
        <span className="text-[10px] sm:text-xs text-[oklch(0.56_0.008_255)]" style={{ fontFamily: 'DM Mono, monospace' }}>
          More
        </span>
      </div>
      
      {/* Session count summary - only on larger screens */}
      <div className="hidden sm:flex items-center justify-center gap-2 pt-2">
        <span className="text-xs text-[oklch(0.56_0.008_255)]">
          {sessions.length} total sessions in last 28 days
        </span>
      </div>
    </div>
  );
};

// Empty State Component
const EmptyState = ({ icon: Icon, message, action, actionText }) => {
  return (
    <div className="text-center py-10">
      <div className="w-12 h-12 rounded-xl bg-[oklch(0.96_0.004_240)] dark:bg-[oklch(0.20_0.008_255)] flex items-center justify-center mx-auto mb-3">
        <Icon className="w-6 h-6 text-[oklch(0.56_0.008_255)]" />
      </div>
      <p className="text-sm text-[oklch(0.56_0.008_255)] mb-4 max-w-xs mx-auto">
        {message}
      </p>
      {action && (
        <button
          onClick={action}
          className="text-sm font-semibold text-[oklch(0.62_0.17_158)] hover:text-[oklch(0.50_0.17_158)] flex items-center gap-1 mx-auto"
        >
          {actionText}
          <ArrowRight className="w-4 h-4" />
        </button>
      )}
    </div>
  );
};

export default DashboardPage;