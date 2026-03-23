// server/routes/ai.js
import { Router } from 'express';
import aiService from '../services/aiService.js';
import { protect } from '../middleware/auth.js';

const router = Router();
router.use(protect);

// POST /api/ai/fix-punctuation - Fix punctuation in transcript
router.post('/fix-punctuation', async (req, res) => {
  try {
    const { transcript } = req.body;
    
    if (!transcript) {
      return res.status(400).json({ message: 'Transcript is required' });
    }
    
    const corrected = await aiService.fixPunctuation(transcript);
    
    res.json({ corrected });
  } catch (error) {
    console.error('Error fixing punctuation:', error);
    res.status(500).json({ message: 'Failed to fix punctuation' });
  }
});

// POST /api/ai/feedback - Generate AI feedback
router.post('/feedback', async (req, res) => {
  try {
    const { topicName, transcript, subject } = req.body;
    
    if (!topicName || !transcript) {
      return res.status(400).json({ 
        message: 'Topic name and transcript are required' 
      });
    }
    
    const feedback = await aiService.generateFeedback(
      topicName, 
      transcript, 
      subject
    );
    
    res.json({ feedback });
  } catch (error) {
    console.error('Error generating feedback:', error);
    res.status(500).json({ message: 'Failed to generate feedback' });
  }
});

// POST /api/ai/generate-notes - Generate study notes
router.post('/generate-notes', async (req, res) => {
  try {
    const { topicName, subject, context } = req.body;
    
    if (!topicName) {
      return res.status(400).json({ message: 'Topic name is required' });
    }
    
    const notes = await aiService.generateNotes(
      topicName, 
      subject, 
      context
    );
    
    res.json({ notes });
  } catch (error) {
    console.error('Error generating notes:', error);
    res.status(500).json({ message: 'Failed to generate notes' });
  }
});

// POST /api/ai/summarize - Summarize text
router.post('/summarize', async (req, res) => {
  try {
    const { text, maxWords } = req.body;
    
    if (!text) {
      return res.status(400).json({ message: 'Text is required' });
    }
    
    const summary = await aiService.generateSummary(text, maxWords);
    
    res.json({ summary });
  } catch (error) {
    console.error('Error generating summary:', error);
    res.status(500).json({ message: 'Failed to generate summary' });
  }
});

export default router;