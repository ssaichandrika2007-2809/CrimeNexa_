const anthropicProvider = require('./providers/anthropicProvider');
const groqProvider = require('./providers/groqProvider');
const llamaProvider = require('./providers/llamaProvider');

const PROVIDERS = {
  anthropic: anthropicProvider,
  groq: groqProvider,
  llama: llamaProvider
};

function uniqueItems(items, picker) {
  const seen = new Set();
  return items.filter((item) => {
    const key = picker(item);
    if (!key || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function normalizeValue(value) {
  return String(value || '').trim().replace(/\s+/g, ' ');
}

function fallbackExtractEntities(reportText, sourceType) {
  const text = normalizeValue(reportText || '');
  const names = [...new Set(
    Array.from(text.matchAll(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b/g), (m) => m[1])
  )].filter((name) => !/(Warehouse|Road|Office|Street|Market|Lane|Area|Town|District|Park|Company|Traders|Pvt|Ltd|Swift|Maruti|City|Old|MG|Navi)$/i.test(name));

  const locationMatches = [
    ...new Set(
      Array.from(
        text.matchAll(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Warehouse|Road|Office|Street|Market|Lane|Area|Town|District|Park|Complex))\b/g),
        (m) => m[1]
      )
    )
  ];

  const organizationMatches = [
    ...new Set(
      Array.from(
        text.matchAll(/\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\s+(?:Traders|Group|Company|Corporation|Enterprises|Ltd|LLC|Industries|Private Limited|Pvt Ltd))\b/g),
        (m) => m[1]
      )
    )
  ];

  const phoneMatches = [
    ...new Set(
      Array.from(text.matchAll(/\b(?:\d{4,}x+|\d{8,15})\b/g), (m) => m[0])
    )
  ];

  const vehicleMatches = [
    ...new Set(
      Array.from(
        text.matchAll(/\b(?:white|black|red|blue|silver|gray|grey|yellow|green|maroon)\s+[A-Z][a-z]+(?:\s+[A-Z][a-z]+){0,2}\b/gi),
        (m) => m[0]
      )
    )
  ];

  const people = uniqueItems(
    names.map((name) => ({ name, role: 'person of interest', notes: `Extracted from ${sourceType || 'report'}` })),
    (item) => item.name.toLowerCase()
  );

  const locations = uniqueItems(
    locationMatches.map((name) => ({ name, notes: `Location mentioned in ${sourceType || 'report'}` })),
    (item) => item.name.toLowerCase()
  );

  const organizations = uniqueItems(
    organizationMatches.map((name) => ({ name, notes: `Organization mentioned in ${sourceType || 'report'}` })),
    (item) => item.name.toLowerCase()
  );

  const vehicles = uniqueItems(
    vehicleMatches.map((description) => ({ description, notes: `Vehicle referenced in ${sourceType || 'report'}` })),
    (item) => item.description.toLowerCase()
  );

  const phones = uniqueItems(
    phoneMatches.map((number) => ({ number, owner: people[0]?.name || 'unknown' })),
    (item) => item.number
  );

  const relationships = [];
  if (people.length > 1 && locations.length > 0) {
    relationships.push({
      source: people[0].name,
      target: locations[0].name,
      type: 'met_at',
      description: `${people[0].name} met associates at ${locations[0].name}`
    });
  }

  if (people.length > 1 && organizations.length > 0) {
    relationships.push({
      source: people[1].name,
      target: organizations[0].name,
      type: 'linked_to',
      description: `${people[1].name} is linked to ${organizations[0].name}`
    });
  }

  if (vehicles.length > 0 && people.length > 0) {
    relationships.push({
      source: people[0].name,
      target: vehicles[0].description,
      type: 'owns_vehicle',
      description: `${people[0].name} is connected to ${vehicles[0].description}`
    });
  }

  if (phones.length > 0 && people.length > 0) {
    relationships.push({
      source: people[0].name,
      target: phones[0].number,
      type: 'communicated_with',
      description: `${people[0].name} is associated with ${phones[0].number}`
    });
  }

  const summary = normalizeValue(
    text.length > 220 ? `${text.slice(0, 220)}...` : text || 'No report text was provided.'
  );

  const riskFlags = [];
  if (/cash|transaction|fund|shell|warehouse|handoff|repeated contact|suspect/i.test(text)) {
    riskFlags.push('Shell related activity');
  }
  if (/warehouse|handoff|meeting|met/i.test(text)) {
    riskFlags.push('Location-based coordination');
  }

  return {
    entities: {
      people,
      locations,
      organizations,
      vehicles,
      phones
    },
    relationships,
    summary,
    riskFlags
  };
}

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
  try {
    const provider = getActiveProvider();
    return await provider.extractEntities(reportText, sourceType);
  } catch (error) {
    const message = error?.message || '';
    if (/API_KEY|not set|Unknown LLM_PROVIDER|placeholder|your_/i.test(message)) {
      return fallbackExtractEntities(reportText, sourceType);
    }
    throw error;
  }
}

module.exports = { extractEntities, getActiveProvider, fallbackExtractEntities };
