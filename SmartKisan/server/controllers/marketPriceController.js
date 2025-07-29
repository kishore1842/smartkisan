import MarketPrice from "../models/marketPriceModel.js";
import User from "../models/usermodels.js";
import { MLMarketService } from "../services/mlMarketService.js";
import { catchAsyncErrors } from "../middlewares/catchasyncerrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import axios from "axios";

// Get real-time market prices
export const getMarketPrices = catchAsyncErrors(async (req, res, next) => {
  const { commodity, market, state, district } = req.query;
  const { page = 1, limit = 20 } = req.query;

  let query = {};
  
  if (commodity) query["commodity.name"] = { $regex: commodity, $options: 'i' };
  if (market) query["market.name"] = { $regex: market, $options: 'i' };
  if (state) query["market.state"] = { $regex: state, $options: 'i' };
  if (district) query["market.district"] = { $regex: district, $options: 'i' };

  // Get latest prices (today's data)
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  query.date = { $gte: today };

  const prices = await MarketPrice.find(query)
    .sort({ date: -1, "priceData.modalPrice": -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .exec();

  const count = await MarketPrice.countDocuments(query);

  res.status(200).json({
    success: true,
    data: prices,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalPrices: count,
  });
});

// Get price analysis for specific commodity
export const getPriceAnalysis = catchAsyncErrors(async (req, res, next) => {
  const { commodity, market } = req.params;
  const userId = req.user._id;

  // Get user profile for language preference
  const user = await User.findById(userId);
  const language = user?.preferredLanguage || 'Kannada';

  // Get recent price data (last 30 days)
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const priceHistory = await MarketPrice.find({
    "commodity.name": { $regex: commodity, $options: 'i' },
    "market.name": { $regex: market, $options: 'i' },
    date: { $gte: thirtyDaysAgo }
  }).sort({ date: 1 });

  if (priceHistory.length === 0) {
    return next(new ErrorHandler("No price data found for this commodity and market", 404));
  }

  // Get latest price data
  const latestPrice = priceHistory[priceHistory.length - 1];

  // Analyze prices using ML Market Service
  const aiAnalysis = await MLMarketService.predictMarketPrices(
    commodity,
    market,
    30
  );

  // Update user's recent queries
  await User.findByIdAndUpdate(userId, {
    $push: {
      recentQueries: {
        query: `Market price analysis for ${commodity} in ${market}`,
        type: "market",
        response: aiAnalysis.summary
      }
    }
  });

  res.status(200).json({
    success: true,
    data: {
      commodity: latestPrice.commodity,
      market: latestPrice.market,
      currentPrice: latestPrice.priceData,
      priceHistory,
      aiAnalysis,
    },
  });
});

// Fetch prices from external APIs (eNAM/Agmarknet)
export const fetchExternalPrices = catchAsyncErrors(async (req, res, next) => {
  const { commodity, market } = req.query;

  try {
    // Generate 10 days of mock data for demonstration
    const today = new Date();
    const history = [];
    let basePrice = 1800 + Math.floor(Math.random() * 500); // random base
    for (let i = 9; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      // Simulate price fluctuation
      const modalPrice = basePrice + Math.floor(Math.random() * 200 - 100);
      history.push({
        commodity: commodity || "Tomato",
        market: market || "Bangalore",
        priceData: {
          minPrice: modalPrice - 100,
          maxPrice: modalPrice + 100,
          modalPrice: modalPrice,
          arrivalQuantity: 100 + Math.floor(Math.random() * 50),
          unit: "Quintal"
        },
        date: date,
        source: "Agmarknet"
      });
    }
    res.status(200).json({
      success: true,
      message: "Fetched external price data successfully",
      data: history,
    });
  } catch (error) {
    console.error("External API error:", error);
    return next(new ErrorHandler("Failed to fetch external prices", 500));
  }
});

// Get price trends
export const getPriceTrends = catchAsyncErrors(async (req, res, next) => {
  const { commodity, market, days = 30 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));

  const trends = await MarketPrice.aggregate([
    {
      $match: {
        "commodity.name": { $regex: commodity, $options: 'i' },
        "market.name": { $regex: market, $options: 'i' },
        date: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$date" }
        },
        avgPrice: { $avg: "$priceData.modalPrice" },
        minPrice: { $min: "$priceData.minPrice" },
        maxPrice: { $max: "$priceData.maxPrice" },
        totalArrival: { $sum: "$priceData.arrivalQuantity" }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: trends,
  });
});

// Get market list
export const getMarkets = catchAsyncErrors(async (req, res, next) => {
  const { state, district } = req.query;

  let query = {};
  if (state) query["market.state"] = { $regex: state, $options: 'i' };
  if (district) query["market.district"] = { $regex: district, $options: 'i' };

  const markets = await MarketPrice.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          name: "$market.name",
          state: "$market.state",
          district: "$market.district"
        }
      }
    },
    { $sort: { "_id.name": 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: markets.map(m => m._id),
  });
});

// Get commodity list
export const getCommodities = catchAsyncErrors(async (req, res, next) => {
  const { category } = req.query;

  let query = {};
  if (category) query["commodity.category"] = category;

  const commodities = await MarketPrice.aggregate([
    { $match: query },
    {
      $group: {
        _id: {
          name: "$commodity.name",
          category: "$commodity.category",
          unit: "$commodity.unit"
        }
      }
    },
    { $sort: { "_id.name": 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: commodities.map(c => c._id),
  });
});

// Get price alerts (prices above/below threshold)
export const getPriceAlerts = catchAsyncErrors(async (req, res, next) => {
  const { threshold, direction = "above" } = req.query;
  const userId = req.user._id;

  // Get user's location
  const user = await User.findById(userId);
  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let priceQuery = {
    "market.district": user.farmDetails?.location?.district || "Dharwad",
    date: { $gte: today }
  };

  if (direction === "above") {
    priceQuery["priceData.modalPrice"] = { $gte: parseFloat(threshold) };
  } else {
    priceQuery["priceData.modalPrice"] = { $lte: parseFloat(threshold) };
  }

  const alerts = await MarketPrice.find(priceQuery)
    .sort({ "priceData.modalPrice": direction === "above" ? -1 : 1 })
    .limit(20);

  res.status(200).json({
    success: true,
    data: alerts,
  });
}); 

// Get all unique states
export const getStates = catchAsyncErrors(async (req, res, next) => {
  const states = await MarketPrice.distinct("market.state");
  res.status(200).json({
    success: true,
    data: states.sort(),
  });
}); 

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

// Utility to call Gemini with fallback to second key
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

export const getPriceHistoryAndPrediction = catchAsyncErrors(async (req, res, next) => {
  const { commodity, state, marketType } = req.query;

  // Improved prompt for Gemini
  const prompt = `Give me the past 10 days and next 2 days price data for ${commodity} in ${state} in ${marketType}. Respond ONLY in valid JSON format as:\n{\n  \"history\": [\n    { \"date\": \"YYYY-MM-DD\", \"modalPrice\": number },\n    ...\n  ],\n  \"prediction\": { \"tomorrow\": number, \"dayAfter\": number }\n}\nDo not include any explanation or extra text.`;

  try {
    // Try Gemini first
    const parsed = await callGeminiWithFallback(prompt);
    return res.status(200).json({ success: true, data: parsed });
  } catch (error) {
    console.warn('[Gemini fallback] Gemini failed, trying external API or DB for real data...');
    try {
      // Try fetching from local DB (last 10 days)
      const today = new Date();
      const tenDaysAgo = new Date();
      tenDaysAgo.setDate(today.getDate() - 9);
      const historyDocs = await MarketPrice.find({
        "commodity.name": { $regex: commodity, $options: 'i' },
        "market.state": { $regex: state, $options: 'i' },
        "market.type": { $regex: marketType, $options: 'i' },
        date: { $gte: tenDaysAgo, $lte: today }
      }).sort({ date: 1 });
      let history = historyDocs.map(doc => ({
        date: doc.date.toISOString().split('T')[0],
        modalPrice: doc.priceData.modalPrice
      }));
      // If not enough data in DB, try external API (Agmarknet/eNAM)
      if (history.length < 7) {
        // Example: Replace with real Agmarknet API call if available
        // const response = await axios.get(`https://api.agmarknet.gov.in/commodity-prices?commodity=${commodity}&state=${state}`);
        // history = response.data.map(...)
        // For now, try fetchExternalPrices logic (mocked)
        const extRes = await axios.get(`${process.env.API_BASE_URL || 'http://localhost:4000/api/v1'}/market-prices/fetch-external`, {
          params: { commodity, market: state }
        });
        if (extRes.data && extRes.data.data && extRes.data.data.length > 0) {
          // Add all 10 days from external data
          history.push(
            ...extRes.data.data.map(item => ({
              date: new Date(item.date).toISOString().split('T')[0],
              modalPrice: item.priceData.modalPrice
            }))
          );
        }
      }
      // Prediction: simple average of last 3 days as tomorrow, last 2 as day after (fallback logic)
      let prediction = { tomorrow: null, dayAfter: null };
      if (history.length >= 2) {
        prediction.tomorrow = Math.round((history.slice(-3).reduce((sum, h) => sum + h.modalPrice, 0) / Math.min(3, history.length)));
        prediction.dayAfter = Math.round((history.slice(-2).reduce((sum, h) => sum + h.modalPrice, 0) / Math.min(2, history.length)));
      }
      if (history.length > 0) {
        return res.status(200).json({ success: true, data: { history, prediction } });
      } else {
        return res.status(404).json({ success: false, message: 'No real-time data available from DB or external API.' });
      }
    } catch (fallbackErr) {
      console.error('[Gemini fallback] Both Gemini and real-time fallback failed:', fallbackErr);
      return res.status(500).json({ success: false, message: 'Failed to fetch data from Gemini and real-time sources.' });
    }
  }
}); 