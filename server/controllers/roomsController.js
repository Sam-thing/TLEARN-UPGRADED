// controllers/roomsController.js
import Room  from '../models/Room.js';
import notificationService from '../services/notificationService.js';
import { catchAsync, AppError } from '../middleware/errorHandler.js';

// GET /api/rooms
export const getRooms = catchAsync(async (req, res) => {
  const { topic, type, search } = req.query;

  const filter = { isActive: true };
  if (topic)  filter.topic = topic;
  if (type)   filter.type  = type;
  if (search) filter.name  = new RegExp(search, 'i');

  const rooms = await Room.find(filter)
    .populate('topic',     'name subject')
    .populate('createdBy', 'name')
    .populate('members.user', 'name avatar')
    .sort({ createdAt: -1 });

  // Add compatibility score (simple — same topic = higher match)
  const roomsWithScore = rooms.map((room) => ({
    ...room.toObject(),
    compatibilityScore: Math.floor(Math.random() * 30) + 70 // placeholder
  }));

  res.json({ rooms: roomsWithScore });
});

// GET /api/rooms/matched
export const getMatchedRooms = catchAsync(async (req, res) => {
  const { topicId } = req.query;

  const rooms = await Room.find({
    topic: topicId,
    isActive: true,
    $expr: { $lt: [{ $size: '$members' }, '$maxMembers'] }
  })
    .populate('topic',     'name subject')
    .populate('createdBy', 'name')
    .limit(5);

  res.json({ rooms });
});

// GET /api/rooms/:id
export const getRoom = catchAsync(async (req, res) => {
  const room = await Room.findById(req.params.id)
    .populate('topic',        'name subject difficulty')
    .populate('createdBy',    'name avatar')
    .populate('members.user', 'name avatar')
    .populate('messages.user','name avatar');

  if (!room) throw new AppError('Room not found', 404);
  res.json({ room });
});

// POST /api/rooms
export const createRoom = catchAsync(async (req, res) => {
  const { name, topicId, description, type, maxMembers } = req.body;

  const room = await Room.create({
    name, description, type,
    topic:      topicId,
    maxMembers: maxMembers || 10,
    createdBy:  req.user._id,
    members: [{ user: req.user._id, role: 'owner' }]
  });

  await room.populate('topic', 'name subject');
  res.status(201).json({ room });
});

// POST /api/rooms/:id/join
export const joinRoom = catchAsync(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw new AppError('Room not found', 404);

  const alreadyMember = room.members.some(
    (m) => m.user.toString() === req.user._id.toString()
  );
  if (alreadyMember) return res.json({ room, message: 'Already a member' });

  if (room.members.length >= room.maxMembers) {
    throw new AppError('Room is full', 400);
  }

  room.members.push({ user: req.user._id });
  await room.save();
  await room.populate('topic', 'name subject');

    // Notify existing members about the new user
    if (room.createdBy.toString() !== req.user.id) {
    await notificationService.roomInvite(
      room.createdBy,  // Notify room creator
      room._id,
      room.name,
      req.user.name    // Person who joined
    );
  }

  res.json({ room });
});

// POST /api/rooms/:id/leave
export const leaveRoom = catchAsync(async (req, res) => {
  const room = await Room.findById(req.params.id);
  if (!room) throw new AppError('Room not found', 404);

  room.members = room.members.filter(
    (m) => m.user.toString() !== req.user._id.toString()
  );
  await room.save();

  res.json({ message: 'Left room' });
});

// GET /api/rooms/:id/messages
export const getMessages = catchAsync(async (req, res) => {
  const room = await Room.findById(req.params.id)
    .populate('messages.user', 'name avatar')
    .select('messages');

  if (!room) throw new AppError('Room not found', 404);

  const messages = room.messages.slice(-100); // last 100
  res.json({ messages });
});

// POST /api/rooms/:id/messages
export const sendMessage = catchAsync(async (req, res) => {
  const { content } = req.body;
  if (!content?.trim()) throw new AppError('Message content required', 400);

  const room = await Room.findById(req.params.id);
  if (!room) throw new AppError('Room not found', 404);

  const message = { user: req.user._id, content: content.trim() };
  room.messages.push(message);
  await room.save();

  const populated = await Room.findById(room._id)
    .populate('messages.user', 'name avatar')
    .select('messages');

  const newMsg = populated.messages[populated.messages.length - 1];
  res.status(201).json({ message: newMsg });
});