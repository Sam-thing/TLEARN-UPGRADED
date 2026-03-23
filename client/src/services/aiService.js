// src/services/aiService.js
import api from '@/utils/axios';

export const aiService = {
  /**
   * Add punctuation to text
   */
  async addPunctuation(text) {
    const response = await api.post('/ai/fix-punctuate', { text });
    return response.corrected;
  },

  /**
   * Generate AI feedback for teaching session
   */
  async generateFeedback(topicName, transcript, subject = '') {
    const response = await api.post('/ai/feedback', {
      topicName,
      transcript,
      subject
    });
    return response.feedback;
  },

  /**
   * Generate study notes for a topic
   */
  async generateNotes(topicName, subject = '', additionalContext = '') {
    const response = await api.post('/ai/generate-notes', {
      topicName,
      subject,
      additionalContext
    });
    return response.notes;
  },

  /**
   * Generate practice questions
   */
  async generateQuestions(topicName, subject = '', difficulty = 'medium', count = 5) {
    const response = await api.post('/ai/generate-questions', {
      topicName,
      subject,
      difficulty,
      count
    });
    return response.questions;
  },

  /**
   * Analyze topic coverage
   */
  async analyzeTopicCoverage(transcript, expectedTopic) {
    const response = await api.post('/ai/analyze-coverage', {
      transcript,
      expectedTopic
    });
    return response.analysis;
  }
};