// src/pages/gamification/AchievementsPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Lock, Award } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { gamificationService } from '@/services/gamificationService';
import { ACHIEVEMENTS } from '@/config/achievements'; // You'll need to copy this to frontend too

const AchievementsPage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAchievements();
  }, []);

  const loadAchievements = async () => {
    try {
      const data = await gamificationService.getAchievements();
      setProfile(data);
    } catch (error) {
      console.error('Failed to load achievements:', error);
    } finally {
      setLoading(false);
    }
  };

  const earnedIds = profile?.earned?.map(a => a.id) || [];

  const allAchievements = Object.values(ACHIEVEMENTS);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-2">Achievements</h1>
        <p className="text-text-medium">Track your learning milestones and unlock rewards</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {allAchievements.map((achievement, index) => {
          const isEarned = earnedIds.includes(achievement.id);
          const earnedAchievement = profile?.earned?.find(a => a.id === achievement.id);

          return (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
            >
              <Card className={`h-full transition-all ${isEarned ? 'border-forest/50 bg-forest/5' : 'opacity-75'}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="text-5xl">{achievement.icon}</div>
                    {isEarned && (
                      <Badge className="bg-green-500 text-white">Unlocked</Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4">{achievement.title}</CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-text-medium">{achievement.description}</p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-medium">+{achievement.xpReward} XP</span>
                    </div>
                    <Badge variant="outline" className="capitalize">
                      {achievement.category}
                    </Badge>
                  </div>

                  {isEarned && earnedAchievement?.unlockedAt && (
                    <p className="text-xs text-green-600 dark:text-green-400">
                      Unlocked {new Date(earnedAchievement.unlockedAt).toLocaleDateString()}
                    </p>
                  )}

                  {!isEarned && (
                    <div className="flex items-center gap-2 text-xs text-text-medium">
                      <Lock className="w-4 h-4" />
                      <span>Locked - Keep learning!</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default AchievementsPage;