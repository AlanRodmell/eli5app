import { GoogleGenAI } from '@google/genai';
import OpenAI from 'openai';
import { zodTextFormat } from 'openai/helpers/zod';
import { z } from 'zod';

const Explanation = z.object({
  title: z.string(),
  kicker: z.string(),
  gist: z.string(),
  analogy: z.string(),
  steps: z.array(z.string()).length(4),
  why: z.string(),
  check: z.object({
    q: z.string(),
    options: z.array(z.string()).length(3),
    correct: z.number().int().min(0).max(2),
    explanation: z.string()
  })
});

const { $schema: _schemaVersion, ...ExplanationJsonSchema } = z.toJSONSchema(Explanation);

const ALLOWED_ORIGINS = new Set([
  'https://alanrodmell.github.io',
  'http://127.0.0.1:5173',
  'http://localhost:5173'
]);

const requestBuckets = new Map();

function allowRequest(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const current = requestBuckets.get(ip);
  if (!current || now - current.startedAt > windowMs) {
    requestBuckets.set(ip, { startedAt: now, count: 1 });
    return true;
  }
  current.count += 1;
  return current.count <= 15;
}

function profileDescription(profile = {}) {
  const entry = {
    analogy: 'connects new ideas to familiar comparisons',
    map: 'needs the big picture and relationships between parts first',
    visual: 'learns by forming a clear mental picture',
    practice: 'learns through concrete examples and doing'
  }[profile.entry] || 'likes clear, familiar examples';
  const memory = {
    story: 'remembers short stories and situations',
    diagram: 'remembers compact visual maps and spatial relationships',
    quiz: 'remembers by checking their understanding'
  }[profile.memory] || 'benefits from a quick knowledge check';
  return `${entry}; ${memory}`;
}

function explanationInstructions(profile, detailGuide) {
  return `You create accurate, warm explanations for curious adults. Never sound childish or condescending. Begin with the core mental model, use ordinary language, define unavoidable technical terms, and favour concrete examples. The learner ${profileDescription(profile)}. ${detailGuide} The analogy must illuminate the real mechanism and briefly acknowledge where it stops matching. The four steps must form a causal sequence. The quiz must test the central idea, not trivia. Return plain text without Markdown inside each response field.`;
}

export async function generateWithGemini({ topic, profile, detailGuide }, client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })) {
  const interaction = await client.interactions.create({
    model: process.env.GEMINI_MODEL || 'gemini-3.5-flash-lite',
    store: false,
    system_instruction: explanationInstructions(profile, detailGuide),
    input: `Explain this topic: ${topic}`,
    generation_config: {
      thinking_level: 'minimal',
      max_output_tokens: 1400
    },
    response_format: [{
      type: 'text',
      mime_type: 'application/json',
      schema: ExplanationJsonSchema
    }]
  }, { timeout: 30000, maxRetries: 0 });

  return Explanation.parse(JSON.parse(interaction.output_text));
}

async function generateWithOpenAI({ topic, profile, detailGuide }) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const result = await client.responses.parse({
    model: process.env.OPENAI_MODEL || 'gpt-5.6-luna',
    store: false,
    reasoning: { effort: 'low' },
    max_output_tokens: 1400,
    input: [
      {
        role: 'system',
        content: explanationInstructions(profile, detailGuide)
      },
      {
        role: 'user',
        content: `Explain this topic: ${topic}`
      }
    ],
    text: {
      verbosity: 'low',
      format: zodTextFormat(Explanation, 'personalised_explanation')
    }
  });

  return result.output_parsed;
}

export default async function handler(request, response) {
  const origin = request.headers.origin;
  const configuredOrigin = process.env.APP_ORIGIN;
  const originAllowed = !origin || ALLOWED_ORIGINS.has(origin) || origin === configuredOrigin || origin.endsWith('.vercel.app');

  if (originAllowed && origin) response.setHeader('Access-Control-Allow-Origin', origin);
  response.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  response.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  response.setHeader('Vary', 'Origin');

  if (request.method === 'OPTIONS') return response.status(204).end();
  if (request.method !== 'POST') return response.status(405).json({ error: 'Method not allowed.' });
  if (!originAllowed) return response.status(403).json({ error: 'This origin is not allowed.' });

  const ip = String(request.headers['x-forwarded-for'] || request.socket?.remoteAddress || 'unknown').split(',')[0].trim();
  if (!allowRequest(ip)) return response.status(429).json({ error: 'Too many explanations at once. Please try again in a few minutes.' });

  const { topic, profile, detail } = request.body || {};
  if (typeof topic !== 'string' || topic.trim().length < 2 || topic.trim().length > 180) {
    return response.status(400).json({ error: 'Please enter a topic between 2 and 180 characters.' });
  }
  if (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY) {
    return response.status(503).json({ error: 'The explanation service has not been connected yet.' });
  }

  const detailGuide = {
    tiny: 'Use extremely short sentences. Assume no prior knowledge. Keep every section concise.',
    clear: 'Give enough context to understand the mechanism while avoiding jargon.',
    deeper: 'Add one layer of useful nuance and explain important cause-and-effect relationships.'
  }[detail] || 'Give enough context to understand the mechanism while avoiding jargon.';

  try {
    const input = { topic: topic.trim(), profile, detailGuide };
    const explanation = process.env.GEMINI_API_KEY
      ? await generateWithGemini(input)
      : await generateWithOpenAI(input);

    return response.status(200).json(explanation);
  } catch (error) {
    console.error('Explanation generation failed', error);
    const status = error?.status === 429 ? 429 : 500;
    return response.status(status).json({
      error: status === 429 ? 'The explanation service is busy. Please wait a moment and try again.' : 'We could not create that explanation. Please try again.'
    });
  }
}
