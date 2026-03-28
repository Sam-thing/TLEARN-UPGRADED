// src/pages/calendar/CalendarPage.jsx
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar as CalendarIcon,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle,
  List,
  Grid3x3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogTrigger,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { calendarService } from '@/services/calendarService';
import CreateEventDialog from '@/components/calendar/CreateEventDialog';
import EventDetailsDialog from '@/components/calendar/EventDetailsDialog';

const CalendarPage = () => {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [view, setView] = useState('month'); // month, week, day, list
  const [loading, setLoading] = useState(true);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);

  useEffect(() => {
    loadEvents();
  }, [selectedDate, view]);

  const loadEvents = async () => {
    try {
      let data;
      if (view === 'month') {
        data = await calendarService.getByMonth(
          selectedDate.getFullYear(),
          selectedDate.getMonth()
        );
      } else {
        data = await calendarService.getAll();
      }
      setEvents(data.events || []);
    } catch (error) {
      console.error('Failed to load events:', error);
      toast.error('Failed to load events');
    } finally {
      setLoading(false);
    }
  };

  const handleEventClick = (event) => {
    setSelectedEvent(event);
    setDetailsDialogOpen(true);
  };

  const handlePrevious = () => {
    const newDate = new Date(selectedDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    setSelectedDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(selectedDate);
    if (view === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (view === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    setSelectedDate(newDate);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 border-forest border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold text-text-dark dark:text-foreground mb-2">
            Study <span className="text-green-700">Calendar</span>
          </h1>
          <p className="text-text-medium dark:text-muted-foreground">
            Plan and track your study sessions
          </p>
        </div>

        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-forest to-forest-light gap-2">
              <Plus className="w-5 h-5" />
              Add Event
            </Button>
          </DialogTrigger>
          <CreateEventDialog
            onSuccess={() => {
              setCreateDialogOpen(false);
              loadEvents();
            }}
            onClose={() => setCreateDialogOpen(false)}
          />
        </Dialog>
      </div>

      {/* Calendar Controls */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={handlePrevious}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={handleToday}>
                Today
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>

            <h2 className="text-2xl font-bold">
              {getMonthName(selectedDate)}
            </h2>

            <Tabs value={view} onValueChange={setView}>
              <TabsList>
                <TabsTrigger value="month">
                  <Grid3x3 className="w-4 h-4 mr-2" />
                  Month
                </TabsTrigger>
                <TabsTrigger value="list">
                  <List className="w-4 h-4 mr-2" />
                  List
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardContent>
      </Card>

      {/* Calendar Views */}
      <Tabs value={view} className="w-full">
        <TabsContent value="month">
          <MonthView
            selectedDate={selectedDate}
            events={events}
            onEventClick={handleEventClick}
          />
        </TabsContent>

        <TabsContent value="list">
          <ListView
            events={events}
            onEventClick={handleEventClick}
          />
        </TabsContent>
      </Tabs>

      {/* Event Details Dialog */}
      <Dialog open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen}>
        <EventDetailsDialog
          event={selectedEvent}
          onSuccess={() => {
            setDetailsDialogOpen(false);
            loadEvents();
          }}
          onClose={() => setDetailsDialogOpen(false)}
        />
      </Dialog>
    </div>
  );
};

// Month View Component
const MonthView = ({ selectedDate, events, onEventClick }) => {
  const getDaysInMonth = () => {
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  const getEventsForDay = (date) => {
    if (!date) return [];
    return events.filter(event => {
      const eventDate = new Date(event.startDate);
      return (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const isToday = (date) => {
    if (!date) return false;
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };

  const days = getDaysInMonth();
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <Card>
      <CardContent className="p-6">
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map(day => (
            <div key={day} className="text-center font-semibold text-sm p-2">
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((date, index) => (
            <div
              key={index}
              className={`
                min-h-24 p-2 border rounded-lg
                ${!date ? 'bg-muted/50' : 'hover:bg-muted/50 cursor-pointer'}
                ${isToday(date) ? 'border-forest border-2 bg-forest/5' : ''}
              `}
            >
              {date && (
                <>
                  <div className={`text-sm font-medium mb-1 ${isToday(date) ? 'text-forest' : ''}`}>
                    {date.getDate()}
                  </div>
                  <div className="space-y-1">
                    {getEventsForDay(date).slice(0, 3).map(event => (
                      <div
                        key={event._id}
                        onClick={() => onEventClick(event)}
                        className="text-xs p-1 rounded truncate"
                        style={{ backgroundColor: event.color + '20', color: event.color }}
                      >
                        {event.title}
                      </div>
                    ))}
                    {getEventsForDay(date).length > 3 && (
                      <div className="text-xs text-text-medium">
                        +{getEventsForDay(date).length - 3} more
                      </div>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

// List View Component
const ListView = ({ events, onEventClick }) => {
  const sortedEvents = [...events].sort((a, b) => 
    new Date(a.startDate) - new Date(b.startDate)
  );

  const upcomingEvents = sortedEvents.filter(e => new Date(e.startDate) >= new Date());
  const pastEvents = sortedEvents.filter(e => new Date(e.startDate) < new Date());

  const typeIcons = {
    'study-session': '📚',
    'exam': '📝',
    'review': '🔄',
    'assignment': '📋',
    'deadline': '⏰',
    'custom': '✨'
  };

  return (
    <div className="space-y-6">
      {/* Upcoming Events */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Events ({upcomingEvents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingEvents.length > 0 ? (
            <div className="space-y-3">
              {upcomingEvents.map(event => (
                <EventListItem
                  key={event._id}
                  event={event}
                  icon={typeIcons[event.type]}
                  onClick={() => onEventClick(event)}
                />
              ))}
            </div>
          ) : (
            <p className="text-text-medium text-center py-8">No upcoming events</p>
          )}
        </CardContent>
      </Card>

      {/* Past Events */}
      {pastEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Past Events ({pastEvents.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pastEvents.slice(0, 10).map(event => (
                <EventListItem
                  key={event._id}
                  event={event}
                  icon={typeIcons[event.type]}
                  onClick={() => onEventClick(event)}
                  isPast
                />
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

// Event List Item Component
const EventListItem = ({ event, icon, onClick, isPast = false }) => {
  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <motion.div
      whileHover={{ x: 4 }}
      onClick={onClick}
      className={`
        flex items-center gap-4 p-4 border rounded-lg cursor-pointer
        hover:bg-muted/50 transition-colors
        ${isPast ? 'opacity-60' : ''}
      `}
    >
      <div className="text-2xl">{icon}</div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <h3 className="font-semibold">{event.title}</h3>
          {event.completed && (
            <CheckCircle className="w-4 h-4 text-green-500" />
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-text-medium">
          <div className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDateTime(event.startDate)}
          </div>
          {event.topic && (
            <Badge variant="outline">{event.topic.name}</Badge>
          )}
        </div>
      </div>

      <div
        className="w-3 h-12 rounded"
        style={{ backgroundColor: event.color }}
      />
    </motion.div>
  );
};

export default CalendarPage;