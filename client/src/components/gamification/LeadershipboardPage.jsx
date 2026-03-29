// src/pages/gamification/LeaderboardPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Medal, Award, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { gamificationService } from '@/services/gamificationService';
import { toast } from 'sonner';

const LeaderboardPage = () => {
  const [leaderboards, setLeaderboards] = useState({
    weekly: [],
    monthly: [],
    allTime: []
  });
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('weekly');

  useEffect(() => {
    loadLeaderboard(activeTab);
  }, [activeTab]);

  const loadLeaderboard = async (type) => {
    try {
      setLoading(true);
      const data = await gamificationService.getLeaderboard(type);
      
      setLeaderboards(prev => ({
        ...prev,
        [type]: data.leaderboard || []
      }));
      
      if (data.userRank) setUserRank(data.userRank);
    } catch (error) {
      toast.error("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank) => {
    if (rank === 1) return <Trophy className="w-6 h-6 text-yellow-500" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400" />;
    if (rank === 3) return <Award className="w-6 h-6 text-amber-600" />;
    return <span className="font-bold text-lg">#{rank}</span>;
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold mb-2">🏆 Leaderboards</h1>
        <p className="text-text-medium">Compete with other learners worldwide</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="weekly">This Week</TabsTrigger>
          <TabsTrigger value="monthly">This Month</TabsTrigger>
          <TabsTrigger value="allTime">All Time</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                {activeTab === 'weekly' && "Weekly Leaders"}
                {activeTab === 'monthly' && "Monthly Leaders"}
                {activeTab === 'allTime' && "All-Time Legends"}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboards[activeTab]?.map((entry, index) => (
                  <motion.div
                    key={entry.user._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.03 }}
                    className={`flex items-center gap-4 p-4 rounded-xl border ${
                      entry.user._id === 'current-user-id-placeholder' ? 'bg-forest/10 border-forest' : 'hover:bg-muted'
                    }`}
                  >
                    <div className="w-10 text-center font-bold text-lg">
                      {getRankIcon(entry.rank)}
                    </div>

                    <div className="flex-1 flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-forest to-emerald-600 flex items-center justify-center text-white font-semibold">
                        {entry.user.name?.[0] || '?'}
                      </div>
                      <div>
                        <p className="font-semibold">{entry.user.name}</p>
                        <p className="text-sm text-text-medium">{entry.title}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-xl font-bold text-forest">{entry.xp || entry.weeklyPoints}</p>
                      <p className="text-xs text-text-medium">XP</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LeaderboardPage;