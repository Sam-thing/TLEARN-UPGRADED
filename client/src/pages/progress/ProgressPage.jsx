// src/pages/progress/ProgressPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Download, Calendar, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { progressService } from '@/services/progressService';

// Import your enhanced ProgressReport component
// Note: Place your ProgressReport.jsx file in src/components/progress/
import ProgressReport from '@/components/progress/ProgressReport';

const ProgressPage = () => {
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProgressData();
  }, []);

  const loadProgressData = async () => {
    try {
      const data = await progressService.getProgress();
      setProgressData(data);
    } catch (error) {
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
          <h1 className="DM Mono, monospace text-4xl font-semibold text-text-dark dark:text-foreground mb-1">
            Your <span className="text-green-700">Learning Progress</span>
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

      {/* Quick Stats Overview */}
      <div className="grid md:grid-cols-4 gap-6">
        <QuickStatCard
          icon={TrendingUp}
          label="Total Sessions"
          value={progressData?.statistics?.totalSessions || 0}
          color="from-green-600 to-white-400"
        />
        <QuickStatCard
          icon={Target}
          label="Average Score"
          value={`${progressData?.statistics?.averageScore || 0}%`}
          color="from-green-600 to-white-400"
        />
        <QuickStatCard
          icon={Calendar}
          label="Topics Explored"
          value={progressData?.statistics?.topicsExplored || 0}
          color="from-green-600 to-white-400"
        />
        <QuickStatCard
          icon={TrendingUp}
          label="Current Streak"
          value={`${progressData?.streak?.current || 0} days`}
          color="from-green-600 to-white-400"
        />
      </div>

      {/* Main Progress Report */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="goals">Goals & Achievements</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6 mt-6">
          {/* Use your enhanced ProgressReport component here */}
          <ProgressReport progress={progressData} />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Detailed <span className="text-green-700">Analytics</span> </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-text-medium mb-4">
                Deep dive into your <span className="text-green-700">learning patterns</span> and performance metrics
              </p>
              {/* Your ProgressReport component already has analytics! */}
              <ProgressReport progress={progressData} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="goals" className="space-y-6 mt-6">
          <Card>
            <CardHeader>
              <CardTitle> <span className="text-green-700">Goals</span> & Achievements</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Your ProgressReport component has achievements and goals! */}
              <ProgressReport progress={progressData} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Quick Stat Card Component
const QuickStatCard = ({ icon: Icon, label, value, color }) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
    >
      <Card>
        <CardContent className="p-6">
          <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${color} flex items-center justify-center mb-4`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="DM Mono, monospace text-3xl font-bold text-text-dark dark:text-foreground mb-1">
            {value}
          </div>
          <div className="text-sm text-text-medium">{label}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ProgressPage;