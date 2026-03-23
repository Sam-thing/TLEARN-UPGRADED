// server/services/aiService.js
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize AI clients
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

class AIService {
  // ============================================
  // 1. FIX PUNCTUATION
  // ============================================
  async fixPunctuation(transcript) {
    try {
      console.log('🔧 Fixing punctuation for transcript...');
      
      const prompt = `Add proper punctuation, capitalization, and paragraph breaks to this transcript. Keep the exact same words, just add punctuation. Return ONLY the corrected text with no additional commentary.

Transcript:
${transcript}

Corrected version:`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
        max_tokens: 2000
      });

      const corrected = completion.choices[0]?.message?.content?.trim() || transcript;
      console.log('✅ Punctuation fixed');
      
      return corrected;
    } catch (error) {
      console.error('❌ Punctuation fix failed:', error.message);
      return transcript; // Return original if fails
    }
  }

  // ============================================
  // 2. GENERATE FEEDBACK
  // ============================================
  async generateFeedback(topicName, transcript, subject = 'General') {
    try {
      console.log(`🤖 Generating feedback for topic: ${topicName}`);
      
      const prompt = `You are an expert teacher evaluating a student's teaching session.

**Topic:** ${topicName}
**Subject:** ${subject}

**Student's Teaching Transcript:**
${transcript}

Analyze this teaching session and provide detailed feedback in the following JSON format:

{
  "score": <number 0-100>,
  "summary": "<brief 1-sentence overall assessment>",
  "strengths": [
    "<strength 1>",
    "<strength 2>",
    "<strength 3>"
  ],
  "improvements": [
    "<area to improve 1>",
    "<area to improve 2>",
    "<area to improve 3>"
  ],
  "keyPoints": [
    "<important concept covered>",
    "<important concept covered>"
  ],
  "missingConcepts": [
    "<concept that should have been covered>",
    "<concept that should have been covered>"
  ],
  "clarity": <number 0-100>,
  "accuracy": <number 0-100>,
  "completeness": <number 0-100>
}

Return ONLY valid JSON, no markdown formatting or additional text.`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-70b-versatile', // More powerful model for better analysis
        temperature: 0.5,
        max_tokens: 2000
      });

      const responseText = completion.choices[0]?.message?.content?.trim();
      
      // Remove markdown code blocks if present
      const jsonText = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .trim();
      
      const feedback = JSON.parse(jsonText);
      
      console.log(`✅ Feedback generated - Score: ${feedback.score}%`);
      
      return feedback;
    } catch (error) {
      console.error('❌ Feedback generation failed:', error.message);
      
      // Return fallback feedback
      return {
        score: 70,
        summary: 'Good effort! Keep practicing to improve your teaching skills.',
        strengths: [
          'You covered the main topic',
          'Your explanation was clear',
          'Good use of examples'
        ],
        improvements: [
          'Add more specific details',
          'Organize your points better',
          'Include real-world applications'
        ],
        keyPoints: ['Main concept explained'],
        missingConcepts: [],
        clarity: 70,
        accuracy: 70,
        completeness: 70
      };
    }
  }

  // ============================================
  // 3. GENERATE NOTES
  // ============================================
  async generateNotes(topicName, subject = 'General', additionalContext = '') {
    try {
      console.log(`📝 Generating notes for topic: ${topicName}`);
      
      const prompt = `Create comprehensive study notes for the following topic.

**Topic:** ${topicName}
**Subject:** ${subject}
${additionalContext ? `**Context:** ${additionalContext}` : ''}

Generate detailed study notes in markdown format with the following structure:

# ${topicName}

## Overview
[Brief introduction to the topic]

## Key Concepts
[Main concepts explained clearly]

## Important Details
[Detailed explanations with examples]

## How It Works
[Step-by-step processes or mechanisms]

## Real-World Applications
[Practical examples and use cases]

## Common Misconceptions
[Things people often get wrong]

## Study Tips
[How to remember and understand this topic]

## Practice Questions
[3-5 questions to test understanding]

Make it comprehensive, clear, and easy to understand. Use bullet points, numbered lists, and examples where appropriate.`;

      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const notes = result.response.text();
      
      console.log('✅ Notes generated successfully');
      
      return notes;
    } catch (error) {
      console.error('❌ Notes generation failed:', error.message);
      
      // Return fallback notes
      return `# ${topicName}

## Overview
This topic covers the fundamental concepts of ${topicName} in ${subject}.

## Key Concepts
- Main concept 1
- Main concept 2
- Main concept 3

## Important Details
[Detailed information about ${topicName}]

## Study Tips
- Review regularly
- Practice with examples
- Connect to real-world applications

_Note: These are basic notes. Try regenerating for more detailed content._`;
    }
  }

  // ============================================
  // 4. QUICK SUMMARY
  // ============================================
  async generateSummary(text, maxWords = 100) {
    try {
      const prompt = `Summarize the following text in ${maxWords} words or less. Be concise and capture the main points.

Text:
${text}

Summary:`;

      const completion = await groq.chat.completions.create({
        messages: [{ role: 'user', content: prompt }],
        model: 'llama-3.1-8b-instant',
        temperature: 0.3,
        max_tokens: 200
      });

      return completion.choices[0]?.message?.content?.trim();
    } catch (error) {
      console.error('❌ Summary generation failed:', error.message);
      return text.substring(0, maxWords * 5); // Rough fallback
    }
  }
}

export default new AIService();