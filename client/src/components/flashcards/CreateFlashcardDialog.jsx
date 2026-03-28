// src/components/flashcards/CreateFlashcardDialog.jsx
import { useState, useEffect } from 'react';
import { Brain } from 'lucide-react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { flashcardService } from '@/services/flashcardService';
import { topicService } from '@/services/topicService';

const CreateFlashcardDialog = ({ onSuccess, onClose }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    front: '',
    back: '',
    topic: '',
    difficulty: 'medium',
    tags: []
  });
  const [tagInput, setTagInput] = useState('');

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

  const handleAddTag = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      if (!formData.tags.includes(tagInput.trim())) {
        setFormData({
          ...formData,
          tags: [...formData.tags, tagInput.trim()]
        });
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleCreate = async () => {
    if (!formData.front.trim() || !formData.back.trim()) {
      toast.error('Front and back are required');
      return;
    }

    setLoading(true);
    try {
      await flashcardService.create({
        front: formData.front,
        back: formData.back,
        topic: formData.topic || undefined,
        difficulty: formData.difficulty,
        tags: formData.tags
      });

      toast.success('Flashcard created!');
      onSuccess();
    } catch (error) {
      console.error('Failed to create flashcard:', error);
      toast.error('Failed to create flashcard');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-green-500" />
          Create Flashcard
        </DialogTitle>
        <DialogDescription>
          Add a new flashcard to your study collection
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Front */}
        <div>
          <Label htmlFor="front">Front (Question) *</Label>
          <Textarea
            id="front"
            placeholder="e.g., What is photosynthesis?"
            value={formData.front}
            onChange={(e) => setFormData({ ...formData, front: e.target.value })}
            rows={3}
            className="mt-1"
          />
        </div>

        {/* Back */}
        <div>
          <Label htmlFor="back">Back (Answer) *</Label>
          <Textarea
            id="back"
            placeholder="e.g., The process by which plants convert light energy into chemical energy..."
            value={formData.back}
            onChange={(e) => setFormData({ ...formData, back: e.target.value })}
            rows={4}
            className="mt-1"
          />
        </div>

        {/* Topic */}
        <div>
          <Label htmlFor="topic">Topic (Optional)</Label>
          <Select
            value={formData.topic}
            onValueChange={(value) => setFormData({ ...formData, topic: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a topic" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">None</SelectItem>
              {topics.map((topic) => (
                <SelectItem key={topic._id} value={topic._id}>
                  {topic.name} - {topic.subject}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Difficulty */}
        <div>
          <Label htmlFor="difficulty">Difficulty</Label>
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
            </SelectContent>
          </Select>
        </div>

        {/* Tags */}
        <div>
          <Label htmlFor="tags">Tags (Optional)</Label>
          <Input
            id="tags"
            placeholder="Type a tag and press Enter"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            className="mt-1"
          />
          {formData.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {formData.tags.map(tag => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-1 px-2 py-1 bg-muted rounded text-sm"
                >
                  {tag}
                  <button
                    onClick={() => handleRemoveTag(tag)}
                    className="hover:text-destructive"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4">
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
            onClick={handleCreate}
            disabled={loading || !formData.front.trim() || !formData.back.trim()}
            className="flex-1 bg-gradient-to-r from-forest to-forest-light"
          >
            {loading ? 'Creating...' : 'Create Flashcard'}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default CreateFlashcardDialog;