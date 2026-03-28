// src/components/flashcards/GenerateFlashcardsDialog.jsx
import { useState, useEffect } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { toast } from 'sonner';
import { flashcardService } from '@/services/flashcardService';
import { topicService } from '@/services/topicService';
import { notesService } from '@/services/notesService';

const GenerateFlashcardsDialog = ({ onSuccess, onClose }) => {
  const [topics, setTopics] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    sourceType: 'topic',
    topicId: '',
    noteId: '',
    count: 10
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [topicsData, notesData] = await Promise.all([
        topicService.getAll(),
        notesService.getAll()
      ]);
      setTopics(Array.isArray(topicsData) ? topicsData : []);
      setNotes(Array.isArray(notesData) ? notesData : notesData.notes || []);
    } catch (error) {
      console.error('Failed to load data:', error);
    }
  };

  const handleGenerate = async () => {
    if (formData.sourceType === 'topic' && !formData.topicId) {
      toast.error('Please select a topic');
      return;
    }

    if (formData.sourceType === 'note' && !formData.noteId) {
      toast.error('Please select a note');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        count: formData.count
      };

      if (formData.sourceType === 'topic') {
        payload.topicId = formData.topicId;
      } else {
        payload.noteId = formData.noteId;
      }

      const result = await flashcardService.generate(payload);
      
      toast.success(`Generated ${result.count || formData.count} flashcards!`);
      onSuccess();
    } catch (error) {
      console.error('Failed to generate flashcards:', error);
      toast.error('Failed to generate flashcards');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-green-500" />
          Generate Flashcards with AI
        </DialogTitle>
        <DialogDescription>
          Let AI create flashcards from your topics or notes
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-6 py-4">
        {/* Source Type */}
        <div>
          <Label>Generate from:</Label>
          <RadioGroup
            value={formData.sourceType}
            onValueChange={(value) => setFormData({ ...formData, sourceType: value })}
            className="mt-2"
          >
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="topic" id="topic" />
              <Label htmlFor="topic" className="cursor-pointer">Topic</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="note" id="note" />
              <Label htmlFor="note" className="cursor-pointer">Note</Label>
            </div>
          </RadioGroup>
        </div>

        {/* Topic Selection */}
        {formData.sourceType === 'topic' && (
          <div>
            <Label htmlFor="topic-select">Select Topic *</Label>
            <Select
              value={formData.topicId}
              onValueChange={(value) => setFormData({ ...formData, topicId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.length > 0 ? (
                  topics.map((topic) => (
                    <SelectItem key={topic._id} value={topic._id}>
                      {topic.name} - {topic.subject}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-topics" disabled>
                    No topics available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Note Selection */}
        {formData.sourceType === 'note' && (
          <div>
            <Label htmlFor="note-select">Select Note *</Label>
            <Select
              value={formData.noteId}
              onValueChange={(value) => setFormData({ ...formData, noteId: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Choose a note" />
              </SelectTrigger>
              <SelectContent>
                {notes.length > 0 ? (
                  notes.map((note) => (
                    <SelectItem key={note._id} value={note._id}>
                      {note.title}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-notes" disabled>
                    No notes available
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Number of Cards */}
        <div>
          <Label>Number of Flashcards: {formData.count}</Label>
          <Slider
            value={[formData.count]}
            onValueChange={([value]) => setFormData({ ...formData, count: value })}
            min={5}
            max={30}
            step={1}
            className="mt-2"
          />
          <p className="text-xs text-text-medium mt-1">
            5-30 flashcards
          </p>
        </div>

        {/* Preview Info */}
        <div className="p-4 bg-muted rounded-lg space-y-2">
          <h4 className="font-semibold text-sm">Generation Preview:</h4>
          <div className="text-sm space-y-1">
            <p>🃏 {formData.count} flashcards will be created</p>
            <p>
              📚 From:{' '}
              {formData.sourceType === 'topic'
                ? topics.find(t => t._id === formData.topicId)?.name || 'Select a topic'
                : notes.find(n => n._id === formData.noteId)?.title || 'Select a note'}
            </p>
            <p>✨ AI-generated with explanations</p>
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
            disabled={loading || (formData.sourceType === 'topic' ? !formData.topicId : !formData.noteId)}
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
                Generate Flashcards
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default GenerateFlashcardsDialog;