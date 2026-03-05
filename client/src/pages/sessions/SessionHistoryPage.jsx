// FIXED: Now uses sessionService instead of direct axios
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, Clock, Search, Filter, TrendingUp, 
  BookOpen, Target, Award, ChevronRight, X, Flame, Download
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { sessionService } from '@/services/sessionService'; // FIX: Use service!

const SessionHistoryPage = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [filteredSessions, setFilteredSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterScore, setFilterScore] = useState('all');
  const [filterDate, setFilterDate] = useState('all');

  useEffect(() => {
    loadSessions();
  }, []);

  useEffect(() => {
    filterSessions();
  }, [sessions, searchQuery, filterScore, filterDate]);

  // FIX: Use sessionService like Dashboard does
  const loadSessions = async () => {
    try {
      console.log('🔍 Loading all sessions...');
      
      // Use sessionService.getAll() or getRecent() with high limit
      const response = await sessionService.getRecent(100); // Get last 100 sessions
      
      console.log('📦 Raw response:', response);
      
      // Handle different response structures (same as Dashboard)
      const sessionsData = response?.sessions || response || [];
      const sessionsArray = Array.isArray(sessionsData) ? sessionsData : [];
      
      console.log('✅ Sessions loaded:', sessionsArray.length);
      console.log('📋 First session:', sessionsArray[0]);
      
      setSessions(sessionsArray);
      setFilteredSessions(sessionsArray);
    } catch (error) {
      console.error('❌ Error loading sessions:', error);
      console.error('Error response:', error.response?.data);
      toast.error('Failed to load sessions');
      setSessions([]);
      setFilteredSessions([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSessions = () => {
    let filtered = Array.isArray(sessions) ? [...sessions] : [];

    if (searchQuery) {
      filtered = filtered.filter(session =>
        session.topic?.name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterScore !== 'all') {
      filtered = filtered.filter(session => {
        const score = session.feedback?.score || 0;
        switch (filterScore) {
          case 'excellent': return score >= 90;
          case 'good': return score >= 70 && score < 90;
          case 'average': return score >= 50 && score < 70;
          case 'needsWork': return score < 50;
          default: return true;
        }
      });
    }

    if (filterDate !== 'all') {
      const now = new Date();
      filtered = filtered.filter(session => {
        const sessionDate = new Date(session.createdAt);
        const daysDiff = Math.floor((now - sessionDate) / (1000 * 60 * 60 * 24));
        
        switch (filterDate) {
          case 'today': return daysDiff === 0;
          case 'week': return daysDiff <= 7;
          case 'month': return daysDiff <= 30;
          default: return true;
        }
      });
    }

    setFilteredSessions(filtered);
  };

  const getScoreColor = (score) => {
    if (score >= 90) return 'from-green-500 to-emerald-400';
    if (score >= 70) return 'from-blue-500 to-cyan-400';
    if (score >= 50) return 'from-yellow-500 to-orange-400';
    return 'from-red-500 to-pink-400';
  };

  const getScoreBadge = (score) => {
    if (score >= 90) return '🌟 Excellent';
    if (score >= 70) return '👍 Good';
    if (score >= 50) return '📚 Average';
    return '💪 Keep Learning';
  };

  const clearFilters = () => {
    setSearchQuery('');
    setFilterScore('all');
    setFilterDate('all');
  };

  const handleExportSessions = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tlearn-sessions-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Sessions data exported!');
  };

  const hasActiveFilters = searchQuery || filterScore !== 'all' || filterDate !== 'all';

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div>
          <h1 className="DM Mono, monospace text-4xl font-semibold text-text-dark dark:text-foreground mb-1">
            Session <span className="text-green-700">History</span>
          </h1>
          <p className="text-text-medium dark:text-muted-foreground">
            Track your learning progress and review past sessions
          </p>
        </div>

        <Button onClick={handleExportSessions} variant="outline">
          <Download className="w-5 h-5 mr-2" />
          Export Data
        </Button>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-4 gap-6">
        <QuickStatCard icon={BookOpen} label="Total Sessions" value={sessions.length} />
        <QuickStatCard icon={Target} label="Average Score" value={`${sessions.length > 0 ? Math.round(sessions.reduce((acc, s) => acc + (s.feedback?.score || 0), 0) / sessions.length) : 0}%`} />
        <QuickStatCard icon={Award} label="Best Score" value={`${sessions.length > 0 ? Math.max(...sessions.map(s => s.feedback?.score || 0)) : 0}%`} />
        <QuickStatCard icon={Flame} label="This Week" value={sessions.filter(s => Math.floor((new Date() - new Date(s.createdAt)) / (1000 * 60 * 60 * 24)) <= 7).length} />
      </div>

      {/* Filters */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-forest" />
                Filter Sessions
              </CardTitle>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>
                  <X className="w-4 h-4 mr-2" />
                  Clear Filters
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-text-dark dark:text-foreground mb-2 block">Search Topics</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-light" />
                  <Input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder="Search by topic name..." className="pl-10" />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-text-dark dark:text-foreground mb-2 block">Score Range</label>
                <Select value={filterScore} onValueChange={setFilterScore}>
                  <SelectTrigger><SelectValue placeholder="All Scores" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Scores</SelectItem>
                    <SelectItem value="excellent">Excellent (90%+)</SelectItem>
                    <SelectItem value="good">Good (70-89%)</SelectItem>
                    <SelectItem value="average">Average (50-69%)</SelectItem>
                    <SelectItem value="needsWork">Needs Work (&lt;50%)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-text-dark dark:text-foreground mb-2 block">Time Period</label>
                <Select value={filterDate} onValueChange={setFilterDate}>
                  <SelectTrigger><SelectValue placeholder="All Time" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="today">Today</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Sessions List */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="space-y-4">
        {filteredSessions.length > 0 ? (
          filteredSessions.map((session, index) => (
            <motion.div key={session._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
              <Card className="cursor-pointer hover:border-forest transition-all group" onClick={() => navigate(`/sessions/${session._id}`)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-2xl font-semibold text-text-dark dark:text-foreground mb-2 group-hover:text-forest transition-colors">
                        {session.topic?.name || 'Unknown Topic'}
                      </h3>
                      <div className="flex items-center gap-4 text-sm text-text-medium">
                        <span className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {new Date(session.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                        </span>
                        <span className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {Math.floor(session.duration / 60)}m {session.duration % 60}s
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className={`color-green px-6 py-3 rounded-lg text-lg font-bold bg-gradient-to-br ${getScoreColor(session.feedback?.score || 0)} text-white`}>
                          {session.feedback?.score || 0}%
                        </div>
                        <p className="text-xs text-text-medium mt-1">{getScoreBadge(session.feedback?.score || 0)}</p>
                      </div>
                      <ChevronRight className="w-6 h-6 text-text-light group-hover:text-forest group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-border">
                    <div className="text-center">
                      <p className="text-sm text-text-medium mb-1">Accuracy</p>
                      <p className="text-xl font-bold text-forest">{session.feedback?.accuracyScore || 0}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-text-medium mb-1">Clarity</p>
                      <p className="text-xl font-bold text-forest">{session.feedback?.clarityScore || 0}%</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm text-text-medium mb-1">Confidence</p>
                      <p className="text-xl font-bold text-forest">{session.feedback?.confidenceScore || 0}%</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        ) : (
          <Card>
            <CardContent className="text-center py-16">
              <BookOpen className="w-16 h-16 text-text-light mx-auto mb-4" />
              <h3 className="text-2xl font-semibold text-text-dark dark:text-foreground mb-2">
                {hasActiveFilters ? 'No sessions match your filters' : 'No sessions yet'}
              </h3>
              <p className="text-text-medium mb-6">
                {hasActiveFilters ? 'Try adjusting your filters to see more results' : 'Start your first teaching session to see your progress here'}
              </p>
              {hasActiveFilters ? (
                <Button onClick={clearFilters} variant="outline">Clear Filters</Button>
              ) : (
                <Button onClick={() => navigate('/topics')}>Browse Topics</Button>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
};

const QuickStatCard = ({ icon: Icon, label, value }) => (
  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} whileHover={{ scale: 1.02 }}>
    <Card>
      <CardContent className="p-6">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-green-400 flex items-center justify-center mb-4">
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="DM Mono, monospace text-3xl font-bold text-text-dark dark:text-foreground mb-1">{value}</div>
        <div className="text-sm text-text-medium">{label}</div>
      </CardContent>
    </Card>
  </motion.div>
);

export default SessionHistoryPage;