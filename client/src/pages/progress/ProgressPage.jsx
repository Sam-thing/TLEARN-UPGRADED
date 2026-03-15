// src/pages/progress/ProgressPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Download, Brain, Target, Trophy } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { progressService } from '@/services/progressService';

// Import tab components
import OverviewTab from '@/components/progress/OverviewTab';
import AnalyticsTab from '@/components/progress/AnalyticsTab';
import GoalsTab from '@/components/progress/GoalsTab';

const ProgressPage = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const data = await progressService.getProgress();
      
      // Extract data properly
      const progressResult = data?.data || data;
      console.log('📊 Progress data loaded:', progressResult);
      
      setProgressData(progressResult);
    } catch (error) {
      console.error('Failed to load progress:', error);
      toast.error('Failed to load progress data');
    } finally {
      setLoading(false);
    }
  };

  const handleExportData = () => {
    // Export progress data as JSON
    const dataStr = JSON.stringify(progressData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `tlearn-progress-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    toast.success('Progress data exported!');
  };

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
          <h1 className="text-4xl font-bold text-text-dark dark:text-foreground mb-2">
            Your Learning <span className="text-green-700">Progress</span>
          </h1>
          <p className="text-text-medium dark:text-muted-foreground">
            Track your journey and celebrate your achievements
          </p>
        </div>

        <Button onClick={handleExportData} variant="outline">
          <Download className="w-5 h-5 mr-2" />
          Export Data
        </Button>
      </motion.div>

      {/* Main Tabs */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            <span className="hidden sm:inline">Goals & Achievements</span>
          </TabsTrigger>
        </TabsList>

        {/* OVERVIEW TAB - Quick stats, recent sessions, heatmap, quick achievements */}
        <TabsContent value="overview" className="space-y-6">
          <OverviewTab progress={progressData} />
        </TabsContent>

        {/* ANALYTICS TAB - Deep dive charts, insights, topic mastery */}
        <TabsContent value="analytics" className="space-y-6">
          <AnalyticsTab progress={progressData} />
        </TabsContent>

        {/* GOALS TAB - Full achievements list, learning goals, challenges */}
        <TabsContent value="goals" className="space-y-6">
          <GoalsTab progress={progressData} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProgressPage;