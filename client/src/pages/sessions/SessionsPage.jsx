// src/pages/sessions/SessionsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  BookOpen,
  TrendingUp,
  Award,
  Play,
  Trash2,
  Filter,
  Search
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { sessionService } from '@/services/sessionService';

const SessionsPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [searchQuery, filterType, sessions]);

  const loadSessions = async () => {
    try {
      const data = await sessionService.getAll();
      
      // Extract sessions array from response
      let sessionsArray = [];
      if (Array.isArray(data)) {
        sessionsArray = data;
      } else if (data?.sessions && Array.isArray(data.sessions)) {
        sessionsArray = data.sessions;
      } else if (data?.data && Array.isArray(data.data)) {
        sessionsArray = data.data;
      }
      
      console.log('📚 Loaded sessions:', sessionsArray);
      setSessions(sessionsArray);
    } catch (error) {
      console.error('Failed to load sessions:', error);
      toast.error('Failed to load sessions');
      setSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = [...sessions];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.topic?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        session.transcript?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Type filter (you can add more filters like date range, score, etc.)
    if (filterType !== 'all') {
      // Example: filter by score range
      if (filterType === 'high') {
        filtered = filtered.filter(session => (session.feedback?.score || 0) >= 80);
      } else if (filterType === 'medium') {
        filtered = filtered.filter(session => {
          const score = session.feedback?.score || 0;
          return score >= 50 && score < 80;
        });
      } else if (filterType === 'low') {
        filtered = filtered.filter(session => (session.feedback?.score || 0) < 50);
      }
    }

    setFilteredSessions(filtered);
  };

  const handleDelete = async (sessionId) => {
    if (!confirm('Delete this session?')) return;

    try {
      await sessionService.delete(sessionId);
      toast.success('Session deleted');
      loadSessions(); // Reload
    } catch (error) {
      toast.error('Failed to delete session');
    }
  };

  const calculateStats = () => {
    return {
      total: sessions.length,
      avgScore: sessions.length > 0
        ? Math.round(
            sessions.reduce((sum, s) => sum + (s.feedback?.score || 0), 0) / sessions.length
          )
        : 0,
      totalTime: sessions.reduce((sum, s) => sum + (s.duration || 0), 0),
      thisWeek: sessions.filter(s => {
        const sessionDate = new Date(s.createdAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return sessionDate > weekAgo;
      }).length
    };
  };

  const stats = calculateStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-text-dark dark:text-foreground mb-2">
          Teaching <span className="text-forest">Sessions</span>
        </h1>
        <p className="text-text-medium dark:text-muted-foreground">
          Review your progress and improve your teaching
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-medium">Total Sessions</p>
                <p className="text-3xl font-bold text-forest">{stats.total}</p>
              </div>
              <BookOpen className="w-10 h-10 text-forest/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-medium">Avg Score</p>
                <p className="text-3xl font-bold text-forest">{stats.avgScore}%</p>
              </div>
              <Award className="w-10 h-10 text-forest/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-medium">Total Time</p>
                <p className="text-3xl font-bold text-forest">
                  {Math.floor(stats.totalTime / 60)}m
                </p>
              </div>
              <Clock className="w-10 h-10 text-forest/20" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-text-medium">This Week</p>
                <p className="text-3xl font-bold text-forest">{stats.thisWeek}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-forest/20" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-light" />
              <Input
                placeholder="Search sessions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by score" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sessions</SelectItem>
                <SelectItem value="high">High Score (80%+)</SelectItem>
                <SelectItem value="medium">Medium Score (50-79%)</SelectItem>
                <SelectItem value="low">Needs Improvement (&lt;50%)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Sessions List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <p className="text-text-medium">
            {filteredSessions.length} session{filteredSessions.length !== 1 ? 's' : ''} found
          </p>
        </div>

        {filteredSessions.length > 0 ? (
          <div className="space-y-4">
            {filteredSessions.map((session) => (
              <SessionCard
                key={session._id}
                session={session}
                onView={() => navigate(`/sessions/${session._id}`)}
                onDelete={() => handleDelete(session._id)}
              />
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-12 text-center">
              <BookOpen className="w-16 h-16 text-text-light mx-auto mb-4" />
              <h3 className="font-semibold text-lg mb-2">No sessions found</h3>
              <p className="text-text-medium mb-4">
                Start teaching to see your sessions here
              </p>
              <Button onClick={() => navigate('/topics')}>
                Browse Topics
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

// Session Card Component
const SessionCard = ({ session, onView, onDelete }) => {
  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-600 bg-green-500/10 border-green-500/20';
    if (score >= 50) return 'text-yellow-600 bg-yellow-500/10 border-yellow-500/20';
    return 'text-red-600 bg-red-500/10 border-red-500/20';
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
    >
      <Card className="hover:shadow-lg transition-all">
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            {/* Left: Topic Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-2 bg-forest/10 rounded-lg">
                  <BookOpen className="w-5 h-5 text-forest" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-lg text-text-dark dark:text-foreground truncate">
                    {session.topic?.name || 'Unknown Topic'}
                  </h3>
                  <p className="text-sm text-text-medium">
                    {formatDate(session.createdAt)}
                  </p>
                </div>
              </div>

              {/* Transcript Preview */}
              <p className="text-sm text-text-medium line-clamp-2 mb-3">
                {session.transcript || 'No transcript available'}
              </p>

              {/* Metadata */}
              <div className="flex items-center gap-4 text-sm text-text-light">
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDuration(session.duration || 0)}
                </div>
                <div className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  {formatDate(session.createdAt)}
                </div>
              </div>
            </div>

            {/* Right: Score & Actions */}
            <div className="flex flex-col items-end gap-3">
              {/* Score Badge */}
              {session.feedback?.score !== undefined && (
                <Badge className={`text-lg font-bold px-4 py-2 ${getScoreColor(session.feedback.score)}`}>
                  {session.feedback.score}%
                </Badge>
              )}

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onView}
                >
                  <Play className="w-4 h-4 mr-2" />
                  View Details
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onDelete}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SessionsPage;