// server/services/aiService.js - SAFE & LAZY INITIALIZATION
import Groq from 'groq-sdk';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Lazy clients - only created when first used
let groq = null;
let genAI = null;

const getGroq = () => {
  if (!groq) {
    if (!process.env.GROQ_API_KEY) {
      console.error("❌ GROQ_API_KEY is missing or empty in .env file!");
      throw new Error("GROQ_API_KEY is not configured. Check your .env file.");
    }
    groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    console.log("✅ Groq client initialized successfully");
  }
  return groq;
};

const getGenAI = () => {
  if (!genAI) {
    genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');
  }
  return genAI;
};

class AIService {

  async addPunctuation(text) {
    try {
      const genAIClient = getGenAI();
      const model = genAIClient.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `Add proper punctuation, capitalization, paragraph breaks to this transcript. Return ONLY the corrected text:

${text}`;

      const result = await model.generateContent(prompt);
      return result.response.text().trim() || text;
    } catch (error) {
      console.error('Error adding punctuation:', error.message);
      return text;
    }
  }

  async generateFeedback(topicName, transcript, subject = '') {
    try {
      const groqClient = getGroq();

      const completion = await groqClient.chat.completions.create({
        model: "llama-3.1-8b-instant",        // Using lighter model to save tokens
        messages: [
          {
            role: "system",
            content: "You are an expert education analyst. Always respond with valid JSON only."
          },
          {
            role: "user",
            content: `Topic: ${topicName}${subject ? `\nSubject: ${subject}` : ''}

Transcript:
${transcript}

Return ONLY this exact JSON:
{
  "score": <number 0-100>,
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "improvements": ["improvement 1", "improvement 2", "improvement 3"],
  "summary": "brief encouraging summary"
}`
          }
        ],
        temperature: 0.5,
        max_tokens: 800,
        response_format: { type: "json_object" }
      });

      let text = completion.choices[0]?.message?.content?.trim() || '';
      text = text.replace(/```json|```/gi, '').trim();

      const feedback = JSON.parse(text);

      return {
        score: Math.min(100, Math.max(0, Number(feedback.score) || 75)),
        strengths: Array.isArray(feedback.strengths) ? feedback.strengths : [],
        improvements: Array.isArray(feedback.improvements) ? feedback.improvements : [],
        summary: feedback.summary || "Good effort overall.",
        model: 'groq-llama-3.1-8b-instant'
      };
    } catch (error) {
      console.error('Error generating feedback:', error.message || error);
      return {
        score: 68,
        strengths: ["Attempted the topic", "Basic explanation given"],
        improvements: ["Add more examples", "Speak more clearly"],
        summary: "Solid effort! Keep practicing."
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