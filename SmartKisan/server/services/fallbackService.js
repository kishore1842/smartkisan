// fallbackService.js
import axios from 'axios';
import MarketPrice from '../models/marketPriceModel.js';

/**
 * Shared fallback logic for Gemini API, local DB, and external API.
 * @param {Object} options - { prompt, type, dbQuery, externalApiUrl, dbModel, dbMapFn, minDbResults }
 * @returns {Promise<{success: boolean, data: any, source: string}>}
 */
export async function getDataWithFallback({
  prompt,
  type = 'market', // 'market' or 'scheme'
  dbQuery = {},
  externalApiUrl = '',
  dbModel = null,
  dbMapFn = null,
  minDbResults = 1,
  geminiFn = null // async (prompt) => data
}) {
  // 1. Try Gemini API
  if (geminiFn) {
    try {
      const geminiData = await geminiFn(prompt);
      if (geminiData && (Array.isArray(geminiData) ? geminiData.length : Object.keys(geminiData).length)) {
        return { success: true, data: geminiData, source: 'gemini' };
      }
    } catch (e) {
      // continue to fallback
    }
  }
  // 2. Try local DB
  if (dbModel) {
    try {
      const dbResults = await dbModel.find(dbQuery).exec();
      const mapped = dbMapFn ? dbResults.map(dbMapFn) : dbResults;
      if (mapped.length >= minDbResults) {
        return { success: true, data: mapped, source: 'db' };
      }
    } catch (e) {
      // continue to fallback
    }
  }
  // 3. Try external API
  if (externalApiUrl) {
    try {
      const extRes = await axios.get(externalApiUrl);
      if (extRes.data && extRes.data.data && extRes.data.data.length > 0) {
        return { success: true, data: extRes.data.data, source: 'external' };
      }
    } catch (e) {
      // continue to error
    }
  }
  // 4. All failed
  return { success: false, data: null, source: 'none' };
} 