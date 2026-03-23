// server/services/aiService.js - COMPLETE FIXED VERSION
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize AI clients
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

class AIService {
  /**
   * Add punctuation to transcript using AI
   */
  async addPunctuation(text) {  // ✅ RENAMED from fixPunctuation
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const prompt = `Add proper punctuation, capitalization, and paragraph breaks to this transcript. Return ONLY the corrected text, no explanations:

${text}`;

      const result = await model.generateContent(prompt);
      const correctedText = result.response.text().trim();
      
      return correctedText;
    } catch (error) {
      console.error('Error adding punctuation:', error);
      // Return original text if punctuation fails
      return text;
    }
  }

  /**
   * Generate AI feedback for teaching session
   */
  async generateFeedback(topicName, transcript, subject = '') {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are an expert education analyst. Evaluate teaching sessions and provide constructive feedback.
            
Your task:
1. Score the explanation (0-100)
2. Identify 3 key strengths
3. Identify 3 areas for improvement
4. Provide a brief summary

Be encouraging but honest. Focus on clarity, accuracy, and completeness.`
          },
          {
            role: "user",
            content: `Topic: ${topicName}${subject ? `\nSubject: ${subject}` : ''}

Transcript:
${transcript}

Please analyze this teaching session and provide feedback in this exact JSON format:
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "summary": "brief summary of performance"
}`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000,
        response_format: { type: "json_object" }
      });

      const feedbackText = completion.choices[0]?.message?.content;
      const feedback = JSON.parse(feedbackText);

      return {
        score: Math.min(100, Math.max(0, feedback.score)),
        strengths: feedback.strengths || [],
        improvements: feedback.improvements || [],
        summary: feedback.summary || '',
        model: 'groq-llama-3.3-70b'
      };
    } catch (error) {
      console.error('Error generating feedback:', error);
      throw new Error('Failed to generate AI feedback');
    }
  }

  /**
   * Generate comprehensive study notes for a topic
   */
  async generateNotes(topicName, subject = '', additionalContext = '') {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

      const prompt = `Create comprehensive study notes for: "${topicName}"${subject ? ` in ${subject}` : ''}

${additionalContext ? `Additional context: ${additionalContext}\n` : ''}
Generate detailed, well-structured study notes in Markdown format.

Include:
1. Overview/Introduction
2. Key Concepts (with clear explanations)
3. Important Details
4. Examples
5. Common Misconceptions (if applicable)
6. Study Tips

Use proper Markdown formatting with headers (##), bullet points, and emphasis.
Make it comprehensive but clear and organized.`;

      const result = await model.generateContent(prompt);
      const notes = result.response.text();

      return {
        content: notes,
        model: 'gemini-1.5-pro'
      };
    } catch (error) {
      console.error('Error generating notes:', error);
      throw new Error('Failed to generate study notes');
    }
  }

  /**
   * Generate AI questions based on topic
   */
  async generateQuestions(topicName, subject = '', difficulty = 'medium', count = 5) {
    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Generate ${count} ${difficulty} difficulty questions about: "${topicName}"${subject ? ` in ${subject}` : ''}

Return ONLY a JSON array of questions in this exact format:
[
  {
    "question": "Question text here?",
    "type": "open-ended" or "specific",
    "hint": "Optional hint for the student"
  }
]

Make questions thought-provoking and test deep understanding.`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Extract JSON from markdown code blocks if present
      const jsonMatch = responseText.match(/```json\n([\s\S]*?)\n```/) || 
                       responseText.match(/```\n([\s\S]*?)\n```/);
      const jsonText = jsonMatch ? jsonMatch[1] : responseText;
      
      const questions = JSON.parse(jsonText);

      return questions;
    } catch (error) {
      console.error('Error generating questions:', error);
      throw new Error('Failed to generate questions');
    }
  }

  /**
   * Analyze transcript for key topics covered
   */
  async analyzeTopicsCovered(transcript, expectedTopic) {
    try {
      const completion = await groq.chat.completions.create({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: "You extract key topics and concepts discussed in educational transcripts."
          },
          {
            role: "user",
            content: `Expected topic: ${expectedTopic}

Transcript:
${transcript}

Extract the main topics/concepts covered. Return JSON:
{
  "topicsCovered": ["topic1", "topic2", ...],
  "missingTopics": ["topic1", "topic2", ...],
  "coveragePercentage": <0-100>
}`
          }
        ],
        temperature: 0.5,
        max_tokens: 500,
        response_format: { type: "json_object" }
      });

      const analysisText = completion.choices[0]?.message?.content;
      return JSON.parse(analysisText);
    } catch (error) {
      console.error('Error analyzing topics:', error);
      return {
        topicsCovered: [],
        missingTopics: [],
        coveragePercentage: 0
      };
    }
  }
}

export default new AIService();