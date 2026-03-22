// server/controllers/notificationsController.js
import notificationService from '../services/notificationService.js';

// When session completes:
await notificationService.sessionCompleted(
  userId,
  sessionId,
  85, // score
  'Photosynthesis' // topic name
);

// When user is invited to room:
await notificationService.roomInvite(
  userId,
  roomId,
  'Study Group A',
  'John Doe' // inviter name
);