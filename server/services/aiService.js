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
   * Add punctuation - FIXED: Use correct Gemini model (gemini-2.5-flash is now stable)
   */
  async addPunctuation(text) {
      try {
        // Use the current stable fast model for punctuation
        const model = genAI.getGenerativeModel({ 
          model: "gemini-2.5-flash"   // ← This should work now (March 2026)
        });

        const prompt = `You are an expert transcriber. Add proper punctuation, capitalization, paragraph breaks, and fix obvious grammar/spelling issues.
  Return **ONLY** the corrected text. No explanations, no quotes, no markdown.

  Original transcript:
  ${text}`;

        const result = await model.generateContent(prompt);
        let correctedText = result.response.text().trim();

        // Safety fallback
        if (!correctedText || correctedText.length < text.length * 0.5) {
          correctedText = text;
        }

        return correctedText;
      } catch (error) {
        console.error('Error adding punctuation:', error.message || error);
        // Return original so the frontend doesn't break
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
            content: `You are an expert education analyst. Always respond with **valid JSON only** and nothing else.
Do not add explanations, markdown, code blocks, or any extra text.

Rules:
- score: integer between 0 and 100
- strengths: exactly 3 strings
- improvements: exactly 3 strings
- summary: one short encouraging sentence (max 100 words)`
          },
          {
            role: "user",
            content: `Topic: ${topicName}${subject ? `\nSubject: ${subject}` : ''}

Transcript:
${transcript}

Analyze this teaching session and output **only** this exact JSON (no extra text):

{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "summary": "brief encouraging summary here"
}`
          }
        ],
        temperature: 0.5,        // lower = more consistent
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      let rawText = completion.choices[0]?.message?.content?.trim() || '';

      // Aggressive cleaning - Groq sometimes wraps output
      rawText = rawText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*$/gi, '')
        .replace(/<function=json>.*?<\/function>/gis, '')
        .trim();

      // If still not starting with {, try to extract JSON
      const jsonMatch = rawText.match(/(\{[\s\S]*\})/);
      const jsonText = jsonMatch ? jsonMatch[1] : rawText;

      const feedback = JSON.parse(jsonText);

      return {
        score: Math.min(100, Math.max(0, Number(feedback.score) || 70)),
        strengths: Array.isArray(feedback.strengths) ? feedback.strengths.slice(0, 3) : ["Clear attempt at explanation", "Topic introduced", "Student engagement"],
        improvements: Array.isArray(feedback.improvements) ? feedback.improvements.slice(0, 3) : ["Add more examples", "Check understanding", "Improve pacing"],
        summary: feedback.summary || "Good effort! Keep refining your delivery.",
        model: 'groq-llama-3.3-70b-versatile'
      };
    } catch (error) {
      console.error('Error generating feedback:', error.message || error);
      
      // Safe fallback so frontend never crashes
      return {
        score: 68,
        strengths: ["You covered the main topic", "Attempted clear explanation", "Used some examples"],
        improvements: ["Add more real-world examples", "Engage students with questions", "Improve pacing and clarity"],
        summary: "Solid foundation! With small tweaks this will be excellent.",
        model: 'fallback'
      };
    }
  }

  /**
   * Generate comprehensive study notes for a topic
   */
  async generateNotes(topicName, subject = '', additionalContext = '') {
    try {
      // ✅ USE THIS MODEL:
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
        model: 'gemini-2.5-flash'
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
      const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
            content: `You are an expert at analyzing educational transcripts. Always respond with **valid JSON only** and nothing else.
No explanations, no markdown, no extra text.`
          },
          {
            role: "user",
            content: `Expected main topic: ${expectedTopic}

Transcript:
${transcript}

Extract the topics and return **only** this exact JSON:

{
  "topicsCovered": ["topic1", "topic2", "..."],
  "missingTopics": ["missing1", "missing2", "..."],
  "coveragePercentage": <integer between 0 and 100>
}`
          }
        ],
        temperature: 0.3,
        max_tokens: 600,
        response_format: { type: "json_object" }
      });

      let rawText = completion.choices[0]?.message?.content?.trim() || '';

      // Same cleaning as above
      rawText = rawText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*$/gi, '')
        .replace(/<function=.*?>.*?<\/function>/gis, '')
        .trim();

      const jsonMatch = rawText.match(/(\{[\s\S]*\})/);
      const jsonText = jsonMatch ? jsonMatch[1] : rawText;

      const analysis = JSON.parse(jsonText);

      return {
        topicsCovered: Array.isArray(analysis.topicsCovered) ? analysis.topicsCovered : [],
        missingTopics: Array.isArray(analysis.missingTopics) ? analysis.missingTopics : [],
        coveragePercentage: Math.min(100, Math.max(0, Number(analysis.coveragePercentage) || 0))
      };
    } catch (error) {
      console.error('Error analyzing topics:', error.message || error);
      return {
        topicsCovered: [],
        missingTopics: [expectedTopic],
        coveragePercentage: 0
      };
    }
  }
}

export default new AIService();