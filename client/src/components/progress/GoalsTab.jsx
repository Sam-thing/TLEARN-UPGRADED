// src/components/progress/GoalsTab.jsx
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Trophy, Star, Award, Target, Flame, Zap, Brain, BookOpen,
  Plus, X, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

const GoalsTab = ({ progress, onRefresh }) => {
  const achievements = progress?.achievements || [];
  const goals = progress?.goals || [];
  const stats = progress?.statistics || {};
  const streak = progress?.streak || { current: 0 };

  return (
    <div className="space-y-6">
      {/* Achievements Section */}
      <AchievementManager 
        achievements={achievements} 
        stats={stats} 
        streak={streak}
      />

      {/* Learning Goals Section */}
      <LearningGoals 
        goals={goals} 
        stats={stats} 
        streak={streak}
      />
    </div>
  );
};

// Achievement Manager Component
const AchievementManager = ({ achievements, stats, streak }) => {
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

  const allAchievements = [...achievements, ...customAchievements];

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
              className="p-4 border-2 border-dashed border-forest/30 rounded-xl space-y-3"
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
                        ? 'border-forest bg-forest/10'
                        : 'border-border hover:border-forest/40'
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
                    ? 'border-forest/40 bg-gradient-to-br from-forest/5 to-emerald/5'
                    : 'border-border bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    achievement.earned
                      ? 'bg-gradient-to-br from-forest to-emerald-600'
                      : 'bg-muted'
                  }`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold">
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
                    <Check className="w-5 h-5 text-forest" />
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
const LearningGoals = ({ goals, stats, streak }) => {
  const [customGoals, setCustomGoals] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newGoal, setNewGoal] = useState('');

  const allGoals = [...goals, ...customGoals];

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
                    ? 'border-forest/40 bg-forest/5'
                    : 'border-border'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-1">
                    <Target className={`w-5 h-5 flex-shrink-0 ${isCompleted ? 'text-forest' : 'text-text-medium'}`} />
                    <span className={`font-medium ${isCompleted ? 'line-through text-text-light' : ''}`}>
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
                      <span className="text-sm font-semibold text-forest">
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

export default GoalsTab;