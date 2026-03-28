// server/controllers/calendarController.js
import StudyEvent from '../models/StudyEvent.js';
import { catchAsync } from '../middleware/errorHandler.js';

/**
 * POST /api/calendar
 * Create a new study event
 */
export const createEvent = catchAsync(async (req, res) => {
  const {
    title,
    description,
    type,
    topic,
    startDate,
    endDate,
    allDay,
    recurring,
    recurrencePattern,
    reminders,
    color,
    priority,
    notes
  } = req.body;

  if (!title || !startDate || !endDate) {
    return res.status(400).json({ 
      message: 'Title, start date, and end date are required' 
    });
  }

  const event = await StudyEvent.create({
    user: req.user._id,
    title,
    description,
    type: type || 'study-session',
    topic,
    startDate: new Date(startDate),
    endDate: new Date(endDate),
    allDay: allDay || false,
    recurring: recurring || false,
    recurrencePattern,
    reminders: reminders || [],
    color: color || '#10b981',
    priority: priority || 'medium',
    notes
  });

  await event.populate('topic', 'name subject');

  res.status(201).json({ event });
});

/**
 * GET /api/calendar
 * Get all events for current user with optional filters
 */
export const getEvents = catchAsync(async (req, res) => {
  const { startDate, endDate, type, completed } = req.query;

  const filter = { user: req.user._id };

  // Date range filter
  if (startDate && endDate) {
    filter.startDate = {
      $gte: new Date(startDate),
      $lte: new Date(endDate)
    };
  } else if (startDate) {
    filter.startDate = { $gte: new Date(startDate) };
  } else if (endDate) {
    filter.startDate = { $lte: new Date(endDate) };
  }

  if (type) filter.type = type;
  if (completed !== undefined) filter.completed = completed === 'true';

  const events = await StudyEvent.find(filter)
    .populate('topic', 'name subject')
    .populate('exam', 'title')
    .sort({ startDate: 1 });

  res.json({ events });
});

/**
 * GET /api/calendar/upcoming
 * Get upcoming events (next 7 days)
 */
export const getUpcoming = catchAsync(async (req, res) => {
  const { limit = 10 } = req.query;

  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const events = await StudyEvent.find({
    user: req.user._id,
    startDate: {
      $gte: now,
      $lte: nextWeek
    },
    completed: false
  })
    .populate('topic', 'name subject')
    .populate('exam', 'title')
    .sort({ startDate: 1 })
    .limit(parseInt(limit));

  res.json({ events });
});

/**
 * GET /api/calendar/:id
 * Get single event by ID
 */
export const getEventById = catchAsync(async (req, res) => {
  const event = await StudyEvent.findOne({
    _id: req.params.id,
    user: req.user._id
  })
    .populate('topic', 'name subject')
    .populate('exam', 'title');

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  res.json({ event });
});

/**
 * PUT /api/calendar/:id
 * Update an event
 */
export const updateEvent = catchAsync(async (req, res) => {
  const event = await StudyEvent.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  const {
    title,
    description,
    type,
    topic,
    startDate,
    endDate,
    allDay,
    recurring,
    recurrencePattern,
    reminders,
    color,
    priority,
    notes
  } = req.body;

  if (title) event.title = title;
  if (description !== undefined) event.description = description;
  if (type) event.type = type;
  if (topic !== undefined) event.topic = topic;
  if (startDate) event.startDate = new Date(startDate);
  if (endDate) event.endDate = new Date(endDate);
  if (allDay !== undefined) event.allDay = allDay;
  if (recurring !== undefined) event.recurring = recurring;
  if (recurrencePattern) event.recurrencePattern = recurrencePattern;
  if (reminders) event.reminders = reminders;
  if (color) event.color = color;
  if (priority) event.priority = priority;
  if (notes !== undefined) event.notes = notes;

  await event.save();
  await event.populate('topic', 'name subject');

  res.json({ event });
});

/**
 * PATCH /api/calendar/:id/complete
 * Mark event as completed
 */
export const completeEvent = catchAsync(async (req, res) => {
  const { actualDuration } = req.body;

  const event = await StudyEvent.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  event.completed = true;
  event.completedAt = new Date();
  if (actualDuration) event.actualDuration = actualDuration;

  await event.save();
  await event.populate('topic', 'name subject');

  res.json({ event });
});

/**
 * DELETE /api/calendar/:id
 * Delete an event
 */
export const deleteEvent = catchAsync(async (req, res) => {
  const event = await StudyEvent.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!event) {
    return res.status(404).json({ message: 'Event not found' });
  }

  res.json({ message: 'Event deleted successfully' });
});