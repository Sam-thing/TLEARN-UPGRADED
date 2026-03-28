// src/pages/exams/ExamsPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Plus,
  Sparkles,
  Clock,
  CheckCircle,
  XCircle,
  Trophy,
  TrendingUp,
  Calendar,
  BarChart3,
  Play,
  Eye,
  Trash2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { examService } from '@/services/examService';
import GenerateExamDialog from '@/components/exams/GenerateExamDialog';

const ExamsPage = () => {
  const navigate = useNavigate();
  const [exams, setExams] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [examsData, statsData] = await Promise.all([
        examService.getAll(),
        examService.getStats()
      ]);
      setExams(examsData.exams || []);
      setStats(statsData.stats || {});
    } catch (error) {
      console.error('Failed to load exams:', error);
      toast.error('Failed to load exams');
    } finally {
      setLoading(false);
    }
  };

  const handleStartExam = async (examId) => {
    try {
      await examService.start(examId);
      navigate(`/exams/${examId}/take`);
    } catch (error) {
      toast.error('Failed to start exam');
    }
  };

  const handleViewResults = (examId) => {
    navigate(`/exams/${examId}/results`);
  };

  const handleDeleteExam = async (examId) => {
    if (!confirm('Are you sure you want to delete this exam?')) return;

    try {
      await examService.delete(examId);
      toast.success('Exam deleted');
      loadData();
    } catch (error) {
      toast.error('Failed to delete exam');
    }
  };

  const filteredExams = exams.filter(exam => {
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return exam.status === 'active' || exam.status === 'draft';
    if (activeTab === 'completed') return exam.status === 'graded' || exam.status === 'completed';
    return true;
  });

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-text-dark dark:text-foreground mb-2">
            <span className="text-green-700">Exams</span> & Tests
          </h1>
          <p className="text-text-medium dark:text-muted-foreground">
            Test your knowledge and track your progress
          </p>
        </div>

        <div className="flex gap-2">
          <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2">
                <Sparkles className="w-5 h-5" />
                AI Generate
              </Button>
            </DialogTrigger>
            <GenerateExamDialog 
              onSuccess={() => {
                setGenerateDialogOpen(false);
                loadData();
              }}
              onClose={() => setGenerateDialogOpen(false)}
            />
          </Dialog>

          <Button 
            className="bg-gradient-to-r from-forest to-forest-light gap-2"
            onClick={() => navigate('/exams/create')}
          >
            <Plus className="w-5 h-5" />
            Create Exam
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4">
          <StatsCard
            title="Total Exams"
            value={stats.totalExams || 0}
            icon={GraduationCap}
            color="blue"
          />
          <StatsCard
            title="Average Score"
            value={`${stats.averageScore || 0}%`}
            icon={TrendingUp}
            color="green"
          />
          <StatsCard
            title="Passed"
            value={stats.passedExams || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Best Score"
            value={`${stats.bestScore || 0}%`}
            icon={Trophy}
            color="yellow"
          />
        </div>
      )}

      {/* Exams List */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full md:w-auto grid-cols-3">
          <TabsTrigger value="all">All Exams</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {filteredExams.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredExams.map((exam) => (
                <ExamCard
                  key={exam._id}
                  exam={exam}
                  onStart={handleStartExam}
                  onViewResults={handleViewResults}
                  onDelete={handleDeleteExam}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <GraduationCap className="w-16 h-16 text-text-light mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No exams yet</h3>
                <p className="text-text-medium mb-4">
                  Create your first exam or generate one with AI
                </p>
                <div className="flex gap-2 justify-center">
                  <Button onClick={() => navigate('/exams/create')}>
                    Create Exam
                  </Button>
                  <Button variant="outline" onClick={() => setGenerateDialogOpen(true)}>
                    <Sparkles className="w-4 h-4 mr-2" />
                    AI Generate
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Stats Card Component
const StatsCard = ({ title, value, icon: Icon, color }) => {
  const colorMap = {
    blue: 'from-blue-500 to-blue-600',
    green: 'from-green-500 to-green-600',
    yellow: 'from-yellow-500 to-yellow-600',
    red: 'from-red-500 to-red-600'
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[color]}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div className="text-3xl font-bold text-text-dark dark:text-foreground">
            {value}
          </div>
        </div>
        <div className="text-sm font-medium text-text-medium">{title}</div>
      </CardContent>
    </Card>
  );
};

// Exam Card Component
const ExamCard = ({ exam, onStart, onViewResults, onDelete }) => {
  const statusColors = {
    draft: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    active: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    completed: 'bg-green-500/10 text-green-600 border-green-500/20',
    graded: 'bg-green-500/10 text-green-600 border-green-500/20'
  };

  const isCompleted = exam.status === 'graded' || exam.status === 'completed';
  const isPassed = exam.passed;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
    >
      <Card className="h-full hover:shadow-lg transition-all">
        <CardHeader>
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gradient-to-br from-forest/10 to-forest-light/10 rounded-lg">
                <GraduationCap className="w-5 h-5 text-forest" />
              </div>
              {exam.isAIGenerated && (
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  AI
                </Badge>
              )}
            </div>
            <Badge className={statusColors[exam.status]}>
              {exam.status}
            </Badge>
          </div>
          
          <CardTitle className="text-xl line-clamp-2">{exam.title}</CardTitle>
          
          {exam.description && (
            <CardDescription className="line-clamp-2">
              {exam.description}
            </CardDescription>
          )}
        </CardHeader>

        <CardContent className="space-y-4">
          {/* Exam Info */}
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-text-medium" />
              <span className="text-text-medium">
                {exam.questions?.length || 0} questions
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-text-medium" />
              <span className="text-text-medium">{exam.timeLimit} min</span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-text-medium" />
              <span className="text-text-medium">
                {new Date(exam.createdAt).toLocaleDateString()}
              </span>
            </div>
            {exam.difficulty && (
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {exam.difficulty}
                </Badge>
              </div>
            )}
          </div>

          {/* Score Display (if completed) */}
          {isCompleted && (
            <div className="p-4 bg-muted rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Your Score</span>
                <div className="flex items-center gap-2">
                  {isPassed ? (
                    <CheckCircle className="w-4 h-4 text-green-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-red-500" />
                  )}
                  <span className="text-2xl font-bold">{exam.score}%</span>
                </div>
              </div>
              <Progress value={exam.score} className="h-2" />
              <div className="text-xs text-text-medium mt-1">
                {exam.correctAnswers}/{exam.totalQuestions} correct
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            {!isCompleted ? (
              <Button
                onClick={() => onStart(exam._id)}
                className="flex-1 bg-gradient-to-r from-forest to-forest-light"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Exam
              </Button>
            ) : (
              <Button
                onClick={() => onViewResults(exam._id)}
                variant="outline"
                className="flex-1"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Results
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onDelete(exam._id)}
            >
              <Trash2 className="w-4 h-4 text-destructive" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ExamsPage;