// src/components/calendar/CreateEventDialog.jsx
import { useState, useEffect } from 'react';
import { Calendar, Plus } from 'lucide-react';
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
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { calendarService } from '@/services/calendarService';
import { topicService } from '@/services/topicService';

const CreateEventDialog = ({ onSuccess, onClose }) => {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'study-session',
    topic: '',
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    allDay: false,
    color: '#10b981',
    priority: 'medium',
    notes: ''
  });

  useEffect(() => {
    loadTopics();
    // Set default date to today
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const currentTime = now.toTimeString().slice(0, 5);
    setFormData(prev => ({
      ...prev,
      startDate: today,
      startTime: currentTime,
      endDate: today,
      endTime: currentTime
    }));
  }, []);

  const loadTopics = async () => {
    try {
      const data = await topicService.getAll();
      setTopics(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to load topics:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('Title is required');
      return;
    }

    if (!formData.startDate || !formData.endDate) {
      toast.error('Start and end dates are required');
      return;
    }

    setLoading(true);
    try {
      // Combine date and time
      const startDateTime = formData.allDay
        ? new Date(formData.startDate).toISOString()
        : new Date(`${formData.startDate}T${formData.startTime}`).toISOString();
      
      const endDateTime = formData.allDay
        ? new Date(formData.endDate).toISOString()
        : new Date(`${formData.endDate}T${formData.endTime}`).toISOString();

      await calendarService.create({
        title: formData.title,
        description: formData.description,
        type: formData.type,
        topic: formData.topic || undefined,
        startDate: startDateTime,
        endDate: endDateTime,
        allDay: formData.allDay,
        color: formData.color,
        priority: formData.priority,
        notes: formData.notes
      });

      toast.success('Event created!');
      onSuccess();
    } catch (error) {
      console.error('Failed to create event:', error);
      toast.error('Failed to create event');
    } finally {
      setLoading(false);
    }
  };

  return (
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-green-500" />
          Create Study Event
        </DialogTitle>
        <DialogDescription>
          Plan your study sessions and track your schedule
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Title */}
        <div>
          <Label htmlFor="title">Title *</Label>
          <Input
            id="title"
            placeholder="e.g., Study Biology - Chapter 5"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          />
        </div>

        {/* Type */}
        <div>
          <Label htmlFor="type">Event Type</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="study-session">📚 Study Session</SelectItem>
              <SelectItem value="exam">📝 Exam</SelectItem>
              <SelectItem value="review">🔄 Review</SelectItem>
              <SelectItem value="assignment">📋 Assignment</SelectItem>
              <SelectItem value="deadline">⏰ Deadline</SelectItem>
              <SelectItem value="custom">✨ Custom</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Topic */}
        <div>
          <Label htmlFor="topic">Related Topic (Optional)</Label>
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

        {/* All Day Checkbox */}
        <div className="flex items-center space-x-2">
          <Checkbox
            id="allDay"
            checked={formData.allDay}
            onCheckedChange={(checked) => setFormData({ ...formData, allDay: checked })}
          />
          <Label htmlFor="allDay" className="cursor-pointer">
            All day event
          </Label>
        </div>

        {/* Date and Time */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date *</Label>
            <Input
              id="startDate"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            />
          </div>
          {!formData.allDay && (
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="time"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
              />
            </div>
          )}
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="endDate">End Date *</Label>
            <Input
              id="endDate"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            />
          </div>
          {!formData.allDay && (
            <div>
              <Label htmlFor="endTime">End Time</Label>
              <Input
                id="endTime"
                type="time"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Priority */}
        <div>
          <Label htmlFor="priority">Priority</Label>
          <Select
            value={formData.priority}
            onValueChange={(value) => setFormData({ ...formData, priority: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Color */}
        <div>
          <Label htmlFor="color">Color</Label>
          <div className="flex gap-2 mt-2">
            {['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(color => (
              <button
                key={color}
                onClick={() => setFormData({ ...formData, color })}
                className={`w-10 h-10 rounded-lg border-2 ${formData.color === color ? 'border-gray-900 dark:border-white' : 'border-transparent'}`}
                style={{ backgroundColor: color }}
              />
            ))}
          </div>
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            placeholder="Add details about this event..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes (Optional)</Label>
          <Textarea
            id="notes"
            placeholder="Any additional notes..."
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            rows={2}
          />
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
            disabled={loading || !formData.title.trim()}
            className="flex-1 bg-gradient-to-r from-forest to-forest-light"
          >
            {loading ? 'Creating...' : (
              <>
                <Plus className="w-4 h-4 mr-2" />
                Create Event
              </>
            )}
          </Button>
        </div>
      </div>
    </DialogContent>
  );
};

export default CreateEventDialog;