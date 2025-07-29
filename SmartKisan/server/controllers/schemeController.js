import express from 'express';
import axios from 'axios';
import Scheme from '../models/schemeModel.js';
const router = express.Router();

// In-memory demo data
const demoSchemes = [
  { _id: '1', title: 'PM-KISAN', description: 'Direct income support to farmers', category: 'Income Support' },
  { _id: '2', title: 'PM-Fasal Bima Yojana', description: 'Crop insurance scheme', category: 'Crop Insurance' },
  { _id: '3', title: 'Kisan Credit Card', description: 'Credit facility for farmers', category: 'Finance' }
];
const demoApplications = [
  { _id: 'a1', schemeId: '1', status: 'Approved', appliedDate: '2024-06-01' },
  { _id: 'a2', schemeId: '2', status: 'Pending', appliedDate: '2024-06-10' }
];

const GEMINI_API_KEYS = [
  process.env.GEMINI_KEY_1 || "AIzaSyDjkzsTy6cxG25rsy7RQNdlgq-gvSekCG0",
  process.env.GEMINI_KEY_2 || "AIzaSyBeMJ9ZH-jZQgvL40HiiySfo24na7zlfKY",
  process.env.GEMINI_KEY_3 || "AIzaSyC3crJtP38l9oblrEPd6rzKX96DYDuBS3o",
  process.env.GEMINI_KEY_4 || "AIzaSyD2ak5rmAlu5DKDohgQ_Mz9zfCD6TLiv-U",
  process.env.GEMINI_KEY_5 || "AIzaSyBKowBO6qabm3hR6awwCp-D5lI-LrXCICQ",
  process.env.GEMINI_KEY_6 || "AIzaSyCVuzM-5PLXO6Am1d_fqPf8APVFxNkbokY",
  process.env.GEMINI_KEY_7 || "AIzaSyCMJtQpYtwg5HTB2Ij5rR7UObg2HllldRs",
  process.env.GEMINI_KEY_8 || "AIzaSyCexUJkufEU7iPmKHNpv67UhMNPY88R_Yc"
].filter(Boolean);
const GEMINI_MODEL = "gemini-1.5-flash";

async function callGeminiWithFallback(prompt) {
  let lastError;
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const key = GEMINI_API_KEYS[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
    console.log(`[Gemini] Trying API key #${i + 1}`);
    try {
      const geminiRes = await axios.post(endpoint, {
        contents: [{ parts: [{ text: prompt }] }]
      });
      // Parse Gemini's response
      const text = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch (err) {
        // Try to extract JSON from text if not pure JSON
        const match = text.match(/\{[\s\S]*\}/);
        if (match) {
          try {
            parsed = JSON.parse(match[0]);
          } catch (jsonErr) {
            console.error(`[Gemini] API key #${i + 1} response (malformed JSON):`, text);
            lastError = new Error('Gemini API did not return valid JSON.');
            continue;
          }
        } else {
          console.error(`[Gemini] API key #${i + 1} response (not JSON):`, text);
          lastError = new Error('Gemini API did not return JSON.');
          continue;
        }
      }
      console.log(`[Gemini] Success with API key #${i + 1}`);
      return parsed;
    } catch (error) {
      lastError = error;
      if (error.response && error.response.status === 429) {
        console.warn(`[Gemini] API key #${i + 1} quota exceeded (429). Trying next key if available.`);
      } else {
        console.error(`[Gemini] API key #${i + 1} error:`, error?.response?.data || error.message);
      }
      continue;
    }
  }
  console.error('[Gemini] All API keys failed.');
  throw lastError || new Error('All Gemini API keys failed.');
}

// REST: Get all schemes
router.get('/', (req, res) => {
  res.status(200).json({ success: true, schemes: demoSchemes });
});

// REST: Get user applications
router.get('/applications', (req, res) => {
  res.status(200).json({ success: true, applications: demoApplications });
});

// REST: Apply for a scheme (placeholder)
router.post('/:schemeId/apply', (req, res) => {
  res.status(201).json({ success: true, message: 'Application submitted (demo).' });
});

// Debug/test endpoint for Gemini keys and connectivity
router.get('/live/test', async (req, res) => {
  const keys = GEMINI_API_KEYS.map((k, i) => ({ index: i + 1, key: k ? k.slice(0, 8) + '...' : null }));
  // Try a simple Gemini call if keys exist
  if (GEMINI_API_KEYS.length === 0) {
    return res.status(200).json({ success: false, message: 'No Gemini API keys set.', keys });
  }
  const testPrompt = 'Say "pong" as a JSON string.';
  let lastError;
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const key = GEMINI_API_KEYS[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
    try {
      const geminiRes = await axios.post(endpoint, {
        contents: [{ role: 'user', parts: [{ text: testPrompt }] }]
      }, { timeout: 10000 });
      const text = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      return res.status(200).json({ success: true, key: keys[i], response: text });
    } catch (error) {
      lastError = error;
      continue;
    }
  }
  return res.status(200).json({ success: false, message: 'All Gemini keys failed.', keys, error: lastError?.message });
});

// Live schemes endpoint (Gemini-powered, strict Gemini-only fallback)
router.get('/live', async (req, res) => {
  console.log('--- /live endpoint hit ---', req.query);
  const { q } = req.query;
  if (!q || q.trim().length < 3) {
    console.log('Query too short');
    return res.status(400).json({ success: false, message: 'Query too short.' });
  }
  console.log('GEMINI_API_KEYS:', GEMINI_API_KEYS.map((k, i) => `#${i+1}: ${k ? k.slice(0, 8) + '...' : 'undefined'}`));
  const prompt = `You are an expert on Indian government agricultural schemes. List the top 10 current Indian government schemes related to '${q.trim()}'. For each scheme, provide:\n- Name\n- Short description\n- Eligibility\n- Start date (if available)\n- End date (if available)\n- Official working website link\nRespond ONLY as a JSON array in this format:\n[\n  {\n    "name": "",\n    "description": "",\n    "eligibility": "",\n    "start_date": "",\n    "end_date": "",\n    "website": ""\n  }\n]`;
  let lastError;
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const key = GEMINI_API_KEYS[i];
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
    console.log(`[Gemini] Trying API key #${i + 1} at endpoint: ${endpoint}`);
    console.log('[Gemini] Prompt:', prompt);
    try {
      console.log('Calling Gemini API...');
      const geminiRes = await axios.post(endpoint, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      }, { timeout: 10000 });
      console.log('Gemini API responded');
      const text = geminiRes.data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('[Gemini] Raw response:', text);
      let schemes = [];
      try {
        const arrayMatch = text.match(/\[\s*{[\s\S]*?}\s*\]/);
        if (arrayMatch) {
          const jsonArray = JSON.parse(arrayMatch[0]);
          if (Array.isArray(jsonArray)) {
            schemes = jsonArray.map(s => ({
              title: s.name || s.title || 'Scheme',
              desc: s.description || s.desc || '',
              eligibility: s.eligibility || '',
              startDate: s.start_date || '',
              endDate: s.end_date || '',
              link: s.website || s.link || ''
            }));
          }
        }
      } catch (e) {
        console.log('JSON parse error:', e.message);
      }
      if (schemes.length > 0) {
        console.log('Returning schemes:', schemes.length);
        return res.status(200).json({ success: true, schemes, source: 'gemini' });
      }
      if (typeof text === 'string' && text.trim().length > 0) {
        console.log('Returning plain text fallback');
        return res.status(200).json({ success: true, schemes: [{ title: q, desc: text }], source: 'gemini' });
      }
      lastError = new Error('Gemini returned no usable data');
    } catch (error) {
      lastError = error;
      if (error.code === 'ECONNABORTED') {
        console.log(`[Gemini] API key #${i + 1} timed out (ECONNABORTED). Skipping this key.`);
        continue;
      }
      console.log(`[Gemini] API key #${i + 1} error:`, error?.response?.data || error.message);
      continue;
    }
  }
  console.log('All Gemini keys failed or no usable data');
  return res.status(200).json({ success: false, message: 'No relevant schemes found (Gemini failed).', error: lastError?.message });
});

export default router; 