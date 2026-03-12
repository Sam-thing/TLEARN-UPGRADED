// server/routes/topics.js
import express from 'express';
import { protect } from '../middleware/auth.js';
import Topic from '../models/Topic.js';

const router = express.Router();

// Get all topics
router.get('/', protect, async (req, res) => {
  try {
    const { subject, difficulty, search } = req.query;
    
    const query = { isPublic: true };
    
    if (subject) query.subject = subject;
    if (difficulty) query.difficulty = difficulty;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    const topics = await Topic.find(query)
      .sort({ createdAt: -1 })
      .lean();
    
    res.json({ topics });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get popular topics
router.get('/popular', protect, async (req, res) => {
  try {
    const popularTopics = await Topic.getPopular(6);
    res.json({ topics: popularTopics });
  } catch (error) {
    console.error('Error fetching popular topics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get recommended topics (personalized - can enhance later)
router.get('/recommended', protect, async (req, res) => {
  try {
    // For now, return recent topics
    // TODO: Enhance with user preferences and history
    const topics = await Topic.find({ isPublic: true })
      .sort({ createdAt: -1 })
      .limit(6)
      .lean();
    
    res.json({ topics });
  } catch (error) {
    console.error('Error fetching recommended topics:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single topic by ID (TRACKS VIEW!)
router.get('/:id', protect, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Increment view count (unless it's the creator viewing)
    if (topic.createdBy?.toString() !== req.user.id) {
      await topic.incrementViews();
    }
    
    res.json(topic);
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create new topic
router.post('/', protect, async (req, res) => {
  try {
    console.log('📝 Creating topic - Request body:', req.body);
    console.log('👤 User:', req.user);
    
    const { name, subject, difficulty, description, content } = req.body;
    
    // Validate required fields
    if (!name || !subject || !difficulty) {
      console.error('❌ Missing required fields');
      return res.status(400).json({ 
        message: 'Name, subject, and difficulty are required',
        received: { name, subject, difficulty }
      });
    }
    
    const topic = await Topic.create({
      name,
      subject,
      difficulty,
      description,
      content,
      createdBy: req.user.id
    });
    
    console.log('✅ Topic created:', topic._id);
    
    res.status(201).json(topic);
  } catch (error) {
    console.error('❌ Error creating topic:', error);
    console.error('Error details:', error.message);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update topic
router.put('/:id', protect, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Only creator can update
    if (topic.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    const { name, subject, difficulty, description, content } = req.body;
    
    topic.name = name || topic.name;
    topic.subject = subject || topic.subject;
    topic.difficulty = difficulty || topic.difficulty;
    topic.description = description || topic.description;
    topic.content = content || topic.content;
    
    await topic.save();
    
    res.json(topic);
  } catch (error) {
    console.error('Error updating topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete topic
router.delete('/:id', protect, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    // Only creator can delete
    if (topic.createdBy?.toString() !== req.user.id) {
      return res.status(403).json({ message: 'Not authorized' });
    }
    
    await topic.deleteOne();
    
    res.json({ message: 'Topic deleted' });
  } catch (error) {
    console.error('Error deleting topic:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track study session started
router.post('/:id/start-session', protect, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    await topic.incrementSessions();
    
    res.json({ message: 'Session started', popularity: topic.popularity });
  } catch (error) {
    console.error('Error starting session:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Track completion
router.post('/:id/complete', protect, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.id);
    
    if (!topic) {
      return res.status(404).json({ message: 'Topic not found' });
    }
    
    await topic.incrementCompletions();
    
    res.json({ message: 'Completion recorded', popularity: topic.popularity });
  } catch (error) {
    console.error('Error recording completion:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

export default router;