// routes/rooms.js
import { Router } from 'express';
import {
  getRooms, getMatchedRooms, getRoom,
  createRoom, joinRoom, leaveRoom,
  getMessages, sendMessage
} from '../controllers/roomsController.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

router.get ('/',           getRooms);
router.get ('/matched',    getMatchedRooms);
router.get ('/:id',        getRoom);
router.post('/',           createRoom);
router.post('/:id/join',   joinRoom);
router.post('/:id/leave',  leaveRoom);
router.get ('/:id/messages', getMessages);
router.post('/:id/messages', sendMessage);

export default router;