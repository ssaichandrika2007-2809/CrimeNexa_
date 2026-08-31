const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { readDB, writeDB } = require('../db');
const { extractEntities } = require('../services/nlpService');

const router = express.Router();

function upsertByName(list, item) {
  const existing = list.find(
    (x) => x.name && item.name && x.name.toLowerCase() === item.name.toLowerCase()
  );
  if (existing) {
    existing.mentions = (existing.mentions || 1) + 1;
    if (item.notes && !existing.notes?.includes(item.notes)) {
      existing.notes = [existing.notes, item.notes].filter(Boolean).join(' | ');
    }
    return existing.id;
  }
  const id = uuidv4();
  list.push({ id, mentions: 1, createdAt: new Date().toISOString(), ...item });
  return id;
}

router.post('/', async (req, res, next) => {
  try {
    const { text, sourceType, caseId } = req.body || {};

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Report text is required.' });
    }

    const extracted = await extractEntities(text, sourceType);
    const db = readDB();
    const nameToId = {};

    (extracted.entities?.people || []).forEach((p) => {
      nameToId[p.name] = upsertByName(db.people, {
        name: p.name,
        role: p.role || '',
        notes: p.notes || ''
      });
    });

    (extracted.entities?.locations || []).forEach((l) => {
      nameToId[l.name] = upsertByName(db.locations, { name: l.name, notes: l.notes || '' });
    });

    (extracted.entities?.organizations || []).forEach((o) => {
      nameToId[o.name] = upsertByName(db.organizations, { name: o.name, notes: o.notes || '' });
    });

    (extracted.entities?.vehicles || []).forEach((v) => {
      nameToId[v.description] = upsertByName(db.vehicles, {
        name: v.description,
        notes: v.notes || ''
      });
    });

    (extracted.entities?.phones || []).forEach((ph) => {
      nameToId[ph.number] = upsertByName(db.phones, { name: ph.number, notes: ph.owner || '' });
    });

    (extracted.relationships || []).forEach((rel) => {
      db.relationships.push({
        id: uuidv4(),
        sourceId: nameToId[rel.source] || null,
        targetId: nameToId[rel.target] || null,
        sourceName: rel.source,
        targetName: rel.target,
        type: rel.type || 'associate',
        description: rel.description || '',
        caseId: caseId || null,
        createdAt: new Date().toISOString()
      });
    });

    const reportRecord = {
      id: uuidv4(),
      sourceType: sourceType || 'unspecified',
      text,
      summary: extracted.summary || '',
      riskFlags: extracted.riskFlags || [],
      caseId: caseId || null,
      createdAt: new Date().toISOString()
    };

    if (caseId) {
      const targetCase = db.cases.find((c) => c.id === caseId);
      if (targetCase) {
        targetCase.reports = targetCase.reports || [];
        targetCase.reports.push(reportRecord.id);
      }
    }

    db.reports.push(reportRecord);
    writeDB(db);

    res.json({ report: reportRecord, extracted });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
