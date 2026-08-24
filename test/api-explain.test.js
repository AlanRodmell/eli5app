import assert from 'node:assert/strict';
import test from 'node:test';
import { generateWithGemini } from '../api/explain.js';

const explanation = {
  title: 'Why the sky is blue',
  kicker: 'Sunlight meeting the atmosphere',
  gist: 'Air scatters blue light more strongly than most other visible colours.',
  analogy: 'Think of air molecules as tiny obstacles that redirect blue light more easily than red light.',
  steps: [
    'Sunlight enters the atmosphere.',
    'That light meets molecules in the air.',
    'Shorter blue wavelengths scatter more strongly.',
    'Scattered blue light reaches our eyes from across the sky.'
  ],
  why: 'It shows how light and matter interact all around us.',
  check: {
    q: 'Why does the daytime sky usually look blue?',
    options: ['Air creates blue paint', 'Blue light scatters strongly', 'The ocean reflects upward'],
    correct: 1,
    explanation: 'Air molecules scatter shorter blue wavelengths strongly.'
  }
};

test('Gemini generation preserves the API response contract', async () => {
  let request;
  const client = {
    interactions: {
      create: async (input) => {
        request = input;
        return { output_text: JSON.stringify(explanation) };
      }
    }
  };

  const result = await generateWithGemini({
    topic: 'Why is the sky blue?',
    profile: { entry: 'analogy', memory: 'quiz' },
    detailGuide: 'Keep it clear.'
  }, client);

  assert.deepEqual(result, explanation);
  assert.equal(request.model, 'gemini-3.7-flash');
  assert.equal(request.store, false);
  assert.equal(request.generation_config.thinking_level, 'low');
  assert.equal(request.response_format[0].mime_type, 'application/json');
  assert.equal(request.response_format[0].schema.properties.steps.minItems, 4);
  assert.match(request.system_instruction, /connects new ideas to familiar comparisons/);
});

test('Gemini generation rejects a response that breaks the schema', async () => {
  const client = {
    interactions: {
      create: async () => ({ output_text: JSON.stringify({ title: 'Incomplete' }) })
    }
  };

  await assert.rejects(() => generateWithGemini({
    topic: 'A topic',
    profile: {},
    detailGuide: 'Keep it clear.'
  }, client));
});
