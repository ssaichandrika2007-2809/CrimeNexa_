const anthropicProvider = require('./providers/anthropicProvider');
const groqProvider = require('./providers/groqProvider');

const PROVIDERS = {
  anthropic: anthropicProvider,
  groq: groqProvider
};

function getActiveProvider() {
  const key = (process.env.LLM_PROVIDER || 'anthropic').toLowerCase();
  const provider = PROVIDERS[key];
  if (!provider) {
    throw new Error(
      `Unknown LLM_PROVIDER "${key}". Valid options: ${Object.keys(PROVIDERS).join(', ')}`
    );
  }
  return provider;
}

// Same function signature and same JSON output shape regardless of which
// provider is active — routes/analyze.js never needs to know which one is running.
async function extractEntities(reportText, sourceType) {
  const provider = getActiveProvider();
  return provider.extractEntities(reportText, sourceType);
}

module.exports = { extractEntities, getActiveProvider };
