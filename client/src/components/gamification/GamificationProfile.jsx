// src/components/gamification/GamificationProfile.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Star, Target, Flame, Award, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { gamificationService } from '@/services/gamificationService';
import { toast } from 'sonner';

const GamificationProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await gamificationService.getProfile();
      setProfile(data.profile);
    } catch (error) {
      toast.error("Failed to load gamification profile");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-12"><div className="animate-spin w-8 h-8 border-4 border-forest border-t-transparent rounded-full" /></div>;
  }

  if (!profile) return <div>No gamification data</div>;

  const progress = (profile.currentLevelXP / profile.xpToNextLevel) * 100;

  return (
    <div className="max-w-5xl mx-auto space-y-8 p-6">
      {/* Level Header */}
      <div className="text-center">
        <div className="inline-flex items-center gap-3 mb-4">
          <div className="text-6xl">🏆</div>
          <div>
            <div className="text-5xl font-bold text-forest">{profile.level}</div>
            <div className="text-xl font-semibold text-text-dark dark:text-white">{profile.title}</div>
          </div>
        </div>

        <div className="max-w-md mx-auto">
          <Progress value={progress} className="h-3 mb-2" />
          <div className="flex justify-between text-sm text-text-medium">
            <span>{profile.currentLevelXP} XP</span>
            <span>{profile.xpToNextLevel} XP to next level</span>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6 text-center">
            <Flame className="w-10 h-10 mx-auto mb-3 text-orange-500" />
            <div className="text-3xl font-bold">{profile.weeklyPoints}</div>
            <div className="text-sm text-text-medium">This Week</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Trophy className="w-10 h-10 mx-auto mb-3 text-yellow-500" />
            <div className="text-3xl font-bold">{profile.totalXP}</div>
            <div className="text-sm text-text-medium">Total XP</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Star className="w-10 h-10 mx-auto mb-3 text-purple-500" />
            <div className="text-3xl font-bold">{profile.achievementCount}</div>
            <div className="text-sm text-text-medium">Achievements</div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 text-center">
            <Award className="w-10 h-10 mx-auto mb-3 text-blue-500" />
            <div className="text-3xl font-bold">#{profile.rank || '?'}</div>
            <div className="text-sm text-text-medium">Global Rank</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Achievements */}
      {profile.achievements && profile.achievements.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Achievements</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {profile.achievements.slice(0, 6).map((ach, i) => (
                <motion.div
                  key={ach.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="p-4 border rounded-xl flex gap-4 items-start bg-gradient-to-br from-forest/5 to-transparent"
                >
                  <div className="text-4xl">{ach.icon}</div>
                  <div>
                    <h4 className="font-semibold">{ach.title}</h4>
                    <p className="text-sm text-text-medium line-clamp-2">{ach.description}</p>
                    <p className="text-xs text-forest mt-1">+{ach.xpReward} XP</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default GamificationProfile;