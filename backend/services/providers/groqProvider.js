const OpenAI = require('openai');
const { EXTRACTION_SYSTEM_PROMPT, buildUserMessage, parseExtractionJSON } = require('../extractionPrompt');

let client = null;
function getClient() {
  if (!process.env.GROQ_API_KEY) {
    throw new Error('GROQ_API_KEY is not set. Add it to backend/.env');
  }
  if (!client) {
    // Groq exposes an OpenAI-compatible API, so the official `openai` SDK
    // works as a drop-in client — just point it at Groq's base URL.
    client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1'
    });
  }
  return client;
}

async function extractEntities(reportText, sourceType) {
  const groq = getClient();

  const completion = await groq.chat.completions.create({
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    temperature: 0.2,
    messages: [
      { role: 'system', content: EXTRACTION_SYSTEM_PROMPT },
      { role: 'user', content: buildUserMessage(reportText, sourceType) }
    ]
  });

  const rawText = completion.choices?.[0]?.message?.content || '';
  return parseExtractionJSON(rawText);
}

module.exports = { extractEntities, name: 'groq' };
