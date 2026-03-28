// src/pages/exams/TakeExamPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  AlertCircle,
  Send
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { examService } from '@/services/examService';

const TakeExamPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [exam, setExam] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showSubmitDialog, setShowSubmitDialog] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    loadExam();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [id]);

  useEffect(() => {
    if (exam && timeLeft === null) {
      // Initialize timer
      setTimeLeft(exam.timeLimit * 60); // Convert minutes to seconds
    }
  }, [exam]);

  useEffect(() => {
    if (timeLeft !== null && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            handleSubmit(true); // Auto-submit when time runs out
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timerRef.current);
    }
  }, [timeLeft]);

  const loadExam = async () => {
    try {
      const data = await examService.getById(id);
      setExam(data.exam);
      
      // Initialize answers object
      const initialAnswers = {};
      data.exam.questions.forEach(q => {
        initialAnswers[q._id] = '';
      });
      setAnswers(initialAnswers);
    } catch (error) {
      toast.error('Failed to load exam');
      navigate('/exams');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit) {
      setShowSubmitDialog(false);
    }

    setSubmitting(true);
    
    try {
      // Format answers for submission
      const formattedAnswers = Object.entries(answers).map(([questionId, answer]) => ({
        questionId,
        answer: answer.trim()
      }));

      await examService.submit(id, formattedAnswers);
      
      toast.success(autoSubmit ? 'Time\'s up! Exam auto-submitted' : 'Exam submitted successfully!');
      navigate(`/exams/${id}/results`);
    } catch (error) {
      toast.error('Failed to submit exam');
      setSubmitting(false);
    }
  };

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  const nextQuestion = () => {
    if (currentQuestion < exam.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const jumpToQuestion = (index) => {
    setCurrentQuestion(index);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const answeredCount = Object.values(answers).filter(a => a.trim() !== '').length;
  const progress = (answeredCount / exam?.questions.length) * 100;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!exam) return null;

  const question = exam.questions[currentQuestion];
  const isLastQuestion = currentQuestion === exam.questions.length - 1;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header with Timer */}
      <Card className="border-2">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-text-dark dark:text-foreground">
                {exam.title}
              </h1>
              <p className="text-text-medium mt-1">
                Question {currentQuestion + 1} of {exam.questions.length}
              </p>
            </div>
            
            <div className="text-right">
              <div className={`text-3xl font-bold ${timeLeft < 300 ? 'text-red-500' : 'text-forest'}`}>
                <Clock className="w-6 h-6 inline mr-2" />
                {formatTime(timeLeft)}
              </div>
              <p className="text-sm text-text-medium mt-1">
                {answeredCount}/{exam.questions.length} answered
              </p>
              <Progress value={progress} className="h-2 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* Question Navigator */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-sm">Questions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-5 lg:grid-cols-4 gap-2">
              {exam.questions.map((q, index) => (
                <button
                  key={q._id}
                  onClick={() => jumpToQuestion(index)}
                  className={`
                    w-10 h-10 rounded-lg flex items-center justify-center text-sm font-medium transition-all
                    ${currentQuestion === index 
                      ? 'bg-forest text-white' 
                      : answers[q._id]?.trim()
                        ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                        : 'bg-muted hover:bg-muted-foreground/10'
                    }
                  `}
                >
                  {index + 1}
                </button>
              ))}
            </div>
            
            <div className="mt-4 space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-forest" />
                <span>Current</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-green-100 dark:bg-green-900" />
                <span>Answered</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 rounded bg-muted" />
                <span>Not answered</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Question Display */}
        <div className="lg:col-span-3 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <CardTitle>Question {currentQuestion + 1}</CardTitle>
                    <span className="text-sm text-text-medium">
                      {question.points} point{question.points !== 1 ? 's' : ''}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <p className="text-lg text-text-dark dark:text-foreground leading-relaxed">
                    {question.question}
                  </p>

                  {/* Answer Input */}
                  {question.type === 'multiple-choice' && question.options?.length > 0 ? (
                    <RadioGroup
                      value={answers[question._id] || ''}
                      onValueChange={(value) => handleAnswerChange(question._id, value)}
                    >
                      <div className="space-y-3">
                        {question.options.map((option, index) => (
                          <div
                            key={index}
                            className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-muted transition-colors"
                          >
                            <RadioGroupItem value={option} id={`option-${index}`} />
                            <Label
                              htmlFor={`option-${index}`}
                              className="flex-1 cursor-pointer"
                            >
                              {option}
                            </Label>
                          </div>
                        ))}
                      </div>
                    </RadioGroup>
                  ) : question.type === 'true-false' ? (
                    <RadioGroup
                      value={answers[question._id] || ''}
                      onValueChange={(value) => handleAnswerChange(question._id, value)}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-muted transition-colors">
                          <RadioGroupItem value="true" id="true" />
                          <Label htmlFor="true" className="flex-1 cursor-pointer">True</Label>
                        </div>
                        <div className="flex items-center space-x-2 p-4 rounded-lg border hover:bg-muted transition-colors">
                          <RadioGroupItem value="false" id="false" />
                          <Label htmlFor="false" className="flex-1 cursor-pointer">False</Label>
                        </div>
                      </div>
                    </RadioGroup>
                  ) : (
                    <div>
                      <Label htmlFor="answer">Your Answer</Label>
                      <Textarea
                        id="answer"
                        placeholder="Type your answer here..."
                        value={answers[question._id] || ''}
                        onChange={(e) => handleAnswerChange(question._id, e.target.value)}
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                  )}

                  {/* Warning if not answered */}
                  {!answers[question._id]?.trim() && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                      <span className="text-sm text-yellow-700 dark:text-yellow-400">
                        This question hasn't been answered yet
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </AnimatePresence>

          {/* Navigation Buttons */}
          <div className="flex justify-between gap-4">
            <Button
              onClick={previousQuestion}
              disabled={currentQuestion === 0}
              variant="outline"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            {!isLastQuestion ? (
              <Button onClick={nextQuestion}>
                Next
                <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={() => setShowSubmitDialog(true)}
                className="bg-gradient-to-r from-forest to-forest-light"
              >
                <Send className="w-4 h-4 mr-2" />
                Submit Exam
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Submit Confirmation Dialog */}
      <AlertDialog open={showSubmitDialog} onOpenChange={setShowSubmitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Submit Exam?</AlertDialogTitle>
            <AlertDialogDescription>
              {answeredCount === exam.questions.length ? (
                <>You've answered all {exam.questions.length} questions. Are you ready to submit?</>
              ) : (
                <>
                  You've answered {answeredCount} out of {exam.questions.length} questions.{' '}
                  <span className="font-semibold text-yellow-600">
                    {exam.questions.length - answeredCount} question(s) are still unanswered.
                  </span>
                  {' '}Are you sure you want to submit?
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={submitting}>Review</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleSubmit(false)}
              disabled={submitting}
              className="bg-forest hover:bg-forest-light"
            >
              {submitting ? 'Submitting...' : 'Submit Exam'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TakeExamPage;