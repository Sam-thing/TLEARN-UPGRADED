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
            content: `You are a helpful and honest education coach. Analyze the teaching session and always respond in valid JSON only.

Rules:
- Score must be integer 0-100
- Always return exactly 3 strengths and 3 improvements
- Summary should be 1-2 encouraging sentences`
          },
          {
            role: "user",
            content: `Topic: ${topicName}${subject ? `\nSubject: ${subject}` : ''}

Transcript:
${transcript}

Return your analysis in this exact JSON format (no extra text):

{
  "score": <number>,
  "strengths": ["strength one", "strength two", "strength three"],
  "improvements": ["improvement one", "improvement two", "improvement three"],
  "summary": "brief encouraging summary"
}`
          }
        ],
        temperature: 0.6,
        max_tokens: 1200,
        response_format: { type: "json_object" }
      });

      let feedbackText = completion.choices[0]?.message?.content?.trim();

      if (!feedbackText) {
        throw new Error("Empty response from Groq");
      }

      // Extra cleaning in case Groq adds markdown or extra text
      feedbackText = feedbackText.replace(/```json\n?/g, '').replace(/```\s*$/g, '').trim();

      const feedback = JSON.parse(feedbackText);

      return {
        score: Math.min(100, Math.max(0, Number(feedback.score) || 75)),
        strengths: Array.isArray(feedback.strengths) ? feedback.strengths.slice(0, 3) : [],
        improvements: Array.isArray(feedback.improvements) ? feedback.improvements.slice(0, 3) : [],
        summary: feedback.summary || "Good session overall. Keep practicing!",
        model: 'groq-llama-3.3-70b-versatile'
      };
    } catch (error) {
      console.error('Error generating feedback:', error.message || error);
      
      // Return a safe fallback instead of crashing the route
      return {
        score: 65,
        strengths: ["You attempted the topic", "Student engagement attempted", "Basic explanation given"],
        improvements: ["Add more examples", "Speak slower", "Check student understanding"],
        summary: "Solid effort! With a few improvements this will be excellent.",
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