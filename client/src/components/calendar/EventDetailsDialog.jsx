// src/components/calendar/EventDetailsDialog.jsx
import { useState } from 'react';
import { CheckCircle, Edit, Trash2, Calendar, Clock, Tag } from 'lucide-react';
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
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
import { calendarService } from '@/services/calendarService';

const EventDetailsDialog = ({ event, onSuccess, onClose }) => {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!event) return null;

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDuration = () => {
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    const diff = end - start;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  const handleComplete = async () => {
    setLoading(true);
    try {
      await calendarService.complete(event._id);
      toast.success('Event marked as completed!');
      onSuccess();
    } catch (error) {
      toast.error('Failed to complete event');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    setLoading(true);
    try {
      await calendarService.delete(event._id);
      toast.success('Event deleted');
      setDeleteDialogOpen(false);
      onSuccess();
    } catch (error) {
      toast.error('Failed to delete event');
    } finally {
      setLoading(false);
    }
  };

  const typeEmojis = {
    'study-session': '📚',
    'exam': '📝',
    'review': '🔄',
    'assignment': '📋',
    'deadline': '⏰',
    'custom': '✨'
  };

  const priorityColors = {
    low: 'bg-gray-500/10 text-gray-600 border-gray-500/20',
    medium: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    high: 'bg-red-500/10 text-red-600 border-red-500/20'
  };

  return (
    <>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-start justify-between">
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <span className="text-3xl">{typeEmojis[event.type]}</span>
              {event.title}
            </DialogTitle>
            <div
              className="w-4 h-12 rounded"
              style={{ backgroundColor: event.color }}
            />
          </div>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Status & Priority */}
          <div className="flex items-center gap-2">
            {event.completed ? (
              <Badge className="bg-green-500/10 text-green-600 border-green-500/20">
                <CheckCircle className="w-3 h-3 mr-1" />
                Completed
              </Badge>
            ) : (
              <Badge variant="outline">Pending</Badge>
            )}
            <Badge className={priorityColors[event.priority]}>
              {event.priority.charAt(0).toUpperCase() + event.priority.slice(1)} Priority
            </Badge>
            <Badge variant="outline">{event.type.replace('-', ' ')}</Badge>
          </div>

          <Separator />

          {/* Date & Time */}
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <Calendar className="w-5 h-5 text-text-medium mt-0.5" />
              <div>
                <p className="font-medium">When</p>
                {event.allDay ? (
                  <p className="text-sm text-text-medium">
                    {new Date(event.startDate).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                    {' - All day'}
                  </p>
                ) : (
                  <>
                    <p className="text-sm text-text-medium">
                      {formatDateTime(event.startDate)}
                    </p>
                    <p className="text-sm text-text-medium">
                      to {formatTime(event.endDate)}
                    </p>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="w-5 h-5 text-text-medium mt-0.5" />
              <div>
                <p className="font-medium">Duration</p>
                <p className="text-sm text-text-medium">{getDuration()}</p>
              </div>
            </div>

            {event.topic && (
              <div className="flex items-start gap-3">
                <Tag className="w-5 h-5 text-text-medium mt-0.5" />
                <div>
                  <p className="font-medium">Related Topic</p>
                  <p className="text-sm text-text-medium">
                    {event.topic.name} - {event.topic.subject}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Description */}
          {event.description && (
            <>
              <Separator />
              <div>
                <p className="font-medium mb-2">Description</p>
                <p className="text-sm text-text-medium whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            </>
          )}

          {/* Notes */}
          {event.notes && (
            <>
              <Separator />
              <div>
                <p className="font-medium mb-2">Notes</p>
                <p className="text-sm text-text-medium whitespace-pre-wrap">
                  {event.notes}
                </p>
              </div>
            </>
          )}

          {/* Completion Info */}
          {event.completed && event.completedAt && (
            <>
              <Separator />
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-sm text-green-700 dark:text-green-400">
                  ✓ Completed on {formatDateTime(event.completedAt)}
                </p>
                {event.actualDuration && (
                  <p className="text-sm text-green-700 dark:text-green-400 mt-1">
                    Actual time spent: {event.actualDuration} minutes
                  </p>
                )}
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            {!event.completed && (
              <Button
                onClick={handleComplete}
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Mark Complete
              </Button>
            )}
            
            <Button
              variant="outline"
              className="flex-1"
              disabled={loading}
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            
            <Button
              variant="destructive"
              onClick={() => setDeleteDialogOpen(true)}
              disabled={loading}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </DialogContent>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Event?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{event.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={loading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={loading}
              className="bg-destructive hover:bg-destructive/90"
            >
              {loading ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default EventDetailsDialog;