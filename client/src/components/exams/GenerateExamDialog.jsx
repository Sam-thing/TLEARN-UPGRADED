// src/components/exams/GenerateExamDialog.jsx
import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { examService } from '@/services/examService';
import { topicService } from '@/services/topicService';

const GenerateExamDialog = ({ onSuccess, onClose }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedTopics, setSelectedTopics] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    difficulty: 'medium',
    questionCount: 10,
    timeLimit: 30
  });

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = async () => {
    try {
      const data = await topicService.getAll();
      setTopics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  const handleTopicToggle = (topicId) => {
    setSelectedTopics(prev =>
      prev.includes(topicId)
        ? prev.filter(id => id !== topicId)
        : [...prev, topicId]
    );
  };

  const handleGenerate = async () => {
    if (selectedTopics.length === 0) {
      toast.error('Please select at least one topic');
      return;
    }

    if (!formData.title.trim()) {
      toast.error('Please enter an exam title');
      return;
    }

    setLoading(true);
    try {
      await examService.generate({
        title: formData.title,
        topicIds: selectedTopics,
        difficulty: formData.difficulty,
        questionCount: formData.questionCount,
        timeLimit: formData.timeLimit
      });

      toast.success('Exam generated successfully!');
      onSuccess();
    } catch (error) {
      console.error('Failed to generate exam:', error);
      toast.error('Failed to generate exam');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-500" />
          Generate AI Exam
        </DialogTitle>
        <DialogDescription>
          Let AI create a comprehensive exam from your selected topics
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Exam Title */}
        <div>
          <Label htmlFor="title">Exam Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Biology Midterm Exam"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Select Topics */}
        <div>
          <Label>Select Topics * (Choose 1-3)</Label>
          <div className="mt-2 max-h-48 overflow-y-auto border rounded-lg p-4 space-y-2">
            {topics.length > 0 ? (
              topics.map((topic) => (
                <div key={topic._id} className="flex items-center space-x-2">
                  <Checkbox
                    id={topic._id}
                    checked={selectedTopics.includes(topic._id)}
                    onCheckedChange={() => handleTopicToggle(topic._id)}
                  />
                  <label
                    htmlFor={topic._id}
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex-1"
                  >
                    {topic.name} - {topic.subject}
                  </label>
                </div>
              ))
            ) : (
              <p className="text-sm text-text-medium text-center py-4">
                No topics available. Create some topics first!
              </p>
            )}
          </div>
          <p className="text-xs text-text-medium mt-1">
            Selected: {selectedTopics.length} topic(s)
          </p>
        </div>

        {/* Difficulty */}
        <div>
          <Label htmlFor="difficulty">Difficulty Level</Label>
          <Select
            value={formData.difficulty}
            onValueChange={(value) => setFormData({ ...formData, difficulty: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="easy">Easy</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="hard">Hard</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Number of Questions */}
        <div>
          <Label>Number of Questions: {formData.questionCount}</Label>
          <Slider
            value={[formData.questionCount]}
            onValueChange={([value]) => setFormData({ ...formData, questionCount: value })}
            min={5}
            max={30}
            step={1}
            className="mt-2"
          />
          <p className="text-xs text-text-medium mt-1">
            5-30 questions
          </p>
        </div>

        {/* Time Limit */}
        <div>
          <Label>Time Limit: {formData.timeLimit} minutes</Label>
          <Slider
            value={[formData.timeLimit]}
            onValueChange={([value]) => setFormData({ ...formData, timeLimit: value })}
            min={10}
            max={120}
            step={5}
            className="mt-2"
          />
          <p className="text-xs text-text-medium mt-1">
            10-120 minutes
          </p>
        </div>

        {/* Preview Info */}
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Exam Preview:</h4>
          <div className="text-sm space-y-1">
            <p>📝 {formData.questionCount} questions</p>
            <p>⏱️ {formData.timeLimit} minute time limit</p>
            <p>🎯 {formData.difficulty.charAt(0).toUpperCase() + formData.difficulty.slice(1)} difficulty</p>
            <p>📚 {selectedTopics.length} topic(s) covered</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            className="flex-1"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleGenerate}
            disabled={loading || selectedTopics.length === 0}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Generate Exam
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default GenerateExamDialog;