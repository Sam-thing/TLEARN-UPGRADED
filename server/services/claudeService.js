// services/claudeService.js
import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// ── Analyse a teaching session transcript ──────────────────────────────────
export const analyseSession = async ({ transcript, topicName, keyPoints = [] }) => {
  const keyPointsList = keyPoints.length
    ? keyPoints.map((k, i) => `${i + 1}. ${k}`).join('\n')
    : 'No specific key points provided.';

  const prompt = `You are an expert educational AI that evaluates how well a student has explained a topic.

TOPIC: ${topicName}

EXPECTED KEY POINTS:
${keyPointsList}

STUDENT'S EXPLANATION:
"${transcript}"

Analyse the student's explanation and respond ONLY with a valid JSON object — no markdown, no extra text.

{
  "score": <overall 0-100>,
  "accuracyScore": <0-100, how factually correct>,
  "clarityScore": <0-100, how clearly explained>,
  "confidenceScore": <0-100, inferred from language confidence>,
  "overall": "<2-3 sentence paragraph summarising performance>",
  "strengths": ["<specific thing done well>", "..."],
  "improvements": ["<specific thing to improve>", "..."],
  "missingPoints": ["<important concept not mentioned>", "..."],
  "quizQuestions": [
    { "question": "<follow-up question to test deeper understanding>", "answer": "<concise answer>" },
    { "question": "...", "answer": "..." },
    { "question": "...", "answer": "..." }
  ]
}

Scoring guide:
- 90-100: Exceptional — all key points covered, clear, accurate
- 75-89:  Good — most key points covered, minor gaps
- 60-74:  Fair — some key points covered, notable gaps
- 40-59:  Developing — significant gaps or inaccuracies
- 0-39:   Needs major work

Be constructive and encouraging. Strengths and improvements should be specific and actionable.`;

  const message = await client.messages.create({
    model:      'claude-opus-4-5-20251101',
    max_tokens: 1024,
    messages:   [{ role: 'user', content: prompt }]
  });

  const raw  = message.content[0].text.trim();
  const json = JSON.parse(raw);

  return {
    score:           clamp(json.score),
    accuracyScore:   clamp(json.accuracyScore),
    clarityScore:    clamp(json.clarityScore),
    confidenceScore: clamp(json.confidenceScore),
    overall:         json.overall         || '',
    strengths:       json.strengths       || [],
    improvements:    json.improvements    || [],
    missingPoints:   json.missingPoints   || [],
    quizQuestions:   json.quizQuestions   || []
  };
};

// ── Generate prep notes for a topic ───────────────────────────────────────
export const generatePrepNotes = async ({ topicName, subject, keyPoints = [], difficulty }) => {
  const prompt = `You are an expert educational content creator.

Generate comprehensive prep notes for a student about to teach the following topic.

TOPIC: ${topicName}
SUBJECT: ${subject}
DIFFICULTY: ${difficulty}
KEY POINTS TO COVER: ${keyPoints.length ? keyPoints.join(', ') : 'General overview'}

Respond ONLY with a valid JSON object:

{
  "title": "${topicName} — Prep Notes",
  "summary": "<2-3 sentence overview of the topic>",
  "sections": [
    {
      "heading": "<section heading>",
      "content": "<detailed explanation, 2-4 sentences>",
      "keyFacts": ["<memorable fact>", "<memorable fact>"]
    }
  ],
  "commonMistakes": ["<mistake students often make>", "..."],
  "tipsForExplaining": ["<how to explain this well>", "..."],
  "analogies": ["<helpful analogy>", "..."]
}

Make it dense, useful, and structured for someone who needs to teach this topic confidently.`;

  const message = await client.messages.create({
    model:      'claude-opus-4-5-20251101',
    max_tokens: 2048,
    messages:   [{ role: 'user', content: prompt }]
  });

  const raw = message.content[0].text.trim();
  return JSON.parse(raw);
};

// ── Generate study notes from a topic ─────────────────────────────────────
export const generateStudyNotes = async ({ topicName, subject, keyPoints = [] }) => {
  const prompt = `Create concise, well-structured study notes for the following topic.

TOPIC: ${topicName}
SUBJECT: ${subject}
${keyPoints.length ? `KEY POINTS: ${keyPoints.join(', ')}` : ''}

Respond ONLY with a valid JSON object:

{
  "title": "<note title>",
  "content": "<full markdown-formatted notes, detailed and useful>"
}

Use markdown headings (##), bullet points, and bold text for clarity.`;

  const message = await client.messages.create({
    model:      'claude-opus-4-5-20251101',
    max_tokens: 2048,
    messages:   [{ role: 'user', content: prompt }]
  });

  const raw = message.content[0].text.trim();
  return JSON.parse(raw);
};

// helper
const clamp = (n) => Math.max(0, Math.min(100, Math.round(Number(n) || 0)));