// src/pages/exams/ExamResultsPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Trophy,
  CheckCircle,
  XCircle,
  RefreshCw,
  Share2,
  Download,
  TrendingUp,
  Clock,
  Target,
  Award
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { examService } from '@/services/examService';

const ExamResultsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [exam, setExam] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExam();
  }, [id]);

  const loadExam = async () => {
    try {
      const data = await examService.getById(id);
      setExam(data.exam);
    } catch (error) {
      toast.error('Failed to load exam results');
      navigate('/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleRetake = () => {
    navigate(`/exams/${id}/take`);
  };

  const getScoreColor = (score) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-blue-500';
    if (score >= 40) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreGrade = (score) => {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B';
    if (score >= 60) return 'C';
    if (score >= 50) return 'D';
    return 'F';
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!exam || exam.status !== 'graded') {
    return (
      <div className="text-center py-12">
        <p>Exam not found or not yet graded</p>
        <Button onClick={() => navigate('/exams')} className="mt-4">
          Back to Exams
        </Button>
      </div>
    );
  }

  const correctCount = exam.correctAnswers || 0;
  const totalCount = exam.totalQuestions || 0;
  const score = exam.score || 0;
  const passed = exam.passed;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/exams')}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Exams
        </Button>
      </div>

      {/* Score Card */}
      <Card className="border-2">
        <CardContent className="p-8">
          <div className="text-center mb-6">
            {passed ? (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 dark:bg-green-900 mb-4"
              >
                <Trophy className="w-10 h-10 text-green-600" />
              </motion.div>
            ) : (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-100 dark:bg-red-900 mb-4"
              >
                <XCircle className="w-10 h-10 text-red-600" />
              </motion.div>
            )}
            
            <h1 className="text-3xl font-bold mb-2">
              {passed ? 'Congratulations!' : 'Keep Practicing!'}
            </h1>
            <p className="text-text-medium">
              {passed ? "You've passed the exam!" : "Don't give up, you can do better!"}
            </p>
          </div>

          <div className="flex items-center justify-center gap-8 mb-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(score)}`}>
                {score}%
              </div>
              <Badge className="mt-2 text-lg px-4 py-1">
                Grade: {getScoreGrade(score)}
              </Badge>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <StatCard
              icon={CheckCircle}
              label="Correct"
              value={correctCount}
              color="green"
            />
            <StatCard
              icon={XCircle}
              label="Incorrect"
              value={totalCount - correctCount}
              color="red"
            />
            <StatCard
              icon={Clock}
              label="Time Taken"
              value={formatTime(exam.timeSpent || 0)}
              color="blue"
            />
          </div>
        </CardContent>
      </Card>

      {/* Performance Breakdown */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Target className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold">{score}%</span>
            </div>
            <p className="text-sm font-medium text-text-medium">Accuracy</p>
            <Progress value={score} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <TrendingUp className="w-8 h-8 text-blue-500" />
              <span className="text-2xl font-bold">
                {totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0}%
              </span>
            </div>
            <p className="text-sm font-medium text-text-medium">Completion Rate</p>
            <Progress value={(correctCount / totalCount) * 100} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Award className="w-8 h-8 text-yellow-500" />
              <span className="text-2xl font-bold">{passed ? 'PASS' : 'FAIL'}</span>
            </div>
            <p className="text-sm font-medium text-text-medium">Status</p>
            <Progress value={passed ? 100 : 0} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Review Answers */}
      <Card>
        <CardHeader>
          <CardTitle>Review Your Answers</CardTitle>
          <CardDescription>
            See what you got right and where you can improve
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="all">All ({totalCount})</TabsTrigger>
              <TabsTrigger value="correct">Correct ({correctCount})</TabsTrigger>
              <TabsTrigger value="incorrect">Incorrect ({totalCount - correctCount})</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-4 mt-6">
              {exam.questions?.map((question, index) => (
                <QuestionReview
                  key={question._id}
                  question={question}
                  index={index}
                />
              ))}
            </TabsContent>

            <TabsContent value="correct" className="space-y-4 mt-6">
              {exam.questions?.filter(q => q.isCorrect).map((question, index) => (
                <QuestionReview
                  key={question._id}
                  question={question}
                  index={exam.questions.indexOf(question)}
                />
              ))}
            </TabsContent>

            <TabsContent value="incorrect" className="space-y-4 mt-6">
              {exam.questions?.filter(q => !q.isCorrect).map((question, index) => (
                <QuestionReview
                  key={question._id}
                  question={question}
                  index={exam.questions.indexOf(question)}
                />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-3">
        <Button
          onClick={handleRetake}
          className="flex-1 bg-gradient-to-r from-forest to-forest-light"
        >
          <RefreshCw className="w-5 h-5 mr-2" />
          Retake Exam
        </Button>
        <Button variant="outline">
          <Share2 className="w-5 h-5 mr-2" />
          Share
        </Button>
        <Button variant="outline">
          <Download className="w-5 h-5 mr-2" />
          Export
        </Button>
      </div>
    </div>
  );
};

// Stat Card Component
const StatCard = ({ icon: Icon, label, value, color }) => {
  const colorMap = {
    green: 'text-green-500',
    red: 'text-red-500',
    blue: 'text-blue-500'
  };

  return (
    <div className="flex items-center gap-3 p-4 bg-muted rounded-lg">
      <Icon className={`w-6 h-6 ${colorMap[color]}`} />
      <div>
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-text-medium">{label}</div>
      </div>
    </div>
  );
};

// Question Review Component
const QuestionReview = ({ question, index }) => {
  const isCorrect = question.isCorrect;

  return (
    <Card className={isCorrect ? 'border-green-200 dark:border-green-900' : 'border-red-200 dark:border-red-900'}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${isCorrect ? 'bg-green-100 dark:bg-green-900' : 'bg-red-100 dark:bg-red-900'}`}>
              {isCorrect ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
            </div>
            <span className="font-semibold">Question {index + 1}</span>
          </div>
          <Badge variant={isCorrect ? 'default' : 'destructive'}>
            {isCorrect ? 'Correct' : 'Incorrect'}
          </Badge>
        </div>

        <p className="text-lg mb-4 text-text-dark dark:text-foreground">
          {question.question}
        </p>

        {question.type === 'multiple-choice' && question.options && (
          <div className="space-y-2 mb-4">
            {question.options.map((option, i) => {
              const isUserAnswer = option === question.userAnswer;
              const isCorrectAnswer = option === question.correctAnswer;

              return (
                <div
                  key={i}
                  className={`p-3 rounded-lg border ${
                    isCorrectAnswer
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-500'
                      : isUserAnswer && !isCorrect
                      ? 'bg-red-50 dark:bg-red-900/20 border-red-500'
                      : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{option}</span>
                    {isCorrectAnswer && (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    )}
                    {isUserAnswer && !isCorrect && (
                      <XCircle className="w-4 h-4 text-red-600" />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {question.type === 'short-answer' && (
          <div className="space-y-3 mb-4">
            <div className={`p-3 rounded-lg border ${isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : 'border-red-500 bg-red-50 dark:bg-red-900/20'}`}>
              <p className="text-sm font-medium mb-1">Your Answer:</p>
              <p>{question.userAnswer || '(No answer provided)'}</p>
            </div>
            {!isCorrect && (
              <div className="p-3 rounded-lg border border-green-500 bg-green-50 dark:bg-green-900/20">
                <p className="text-sm font-medium mb-1">Correct Answer:</p>
                <p>{question.correctAnswer}</p>
              </div>
            )}
          </div>
        )}

        {question.explanation && (
          <>
            <Separator className="my-4" />
            <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
              <p className="text-sm font-semibold mb-2 text-blue-700 dark:text-blue-400">
                💡 Explanation
              </p>
              <p className="text-sm text-text-dark dark:text-foreground">
                {question.explanation}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default ExamResultsPage;