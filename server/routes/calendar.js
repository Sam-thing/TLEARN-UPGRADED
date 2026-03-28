// server/routes/calendar.js
import { Router } from 'express';
import {
  createEvent,
  getEvents,
  getEventById,
  getUpcoming,
  updateEvent,
  completeEvent,
  deleteEvent
} from '../controllers/calendarController.js';
import { protect } from '../middleware/auth.js';
 
const router = Router();
router.use(protect);
 
router.post('/', createEvent);
router.get('/', getEvents);
router.get('/upcoming', getUpcoming);
router.get('/:id', getEventById);
router.put('/:id', updateEvent);
router.patch('/:id/complete', completeEvent);
router.delete('/:id', deleteEvent);
 
export default router;