import { MLNLPService } from '../services/mlNLPService.js';
import { VoiceProcessingService } from '../services/voiceProcessingService.js';
import { WebScrapingService } from '../services/webScrapingService.js';
import { catchAsyncError } from '../middlewares/catchAsyncError.js';
import ErrorHandler from '../utils/errorHandler.js';
import { askGemini } from '../services/googleAIService.js';
import { GoogleAIService } from '../services/googleAIService.js';
import { getDataWithFallback } from '../services/fallbackService.js';
import MarketPrice from '../models/marketPriceModel.js';
import Scheme from '../models/schemeModel.js';

// Process voice query with LLM
export const processVoiceQuery = catchAsyncError(async (req, res, next) => {
  try {
    let { query, language = 'english', context = '' } = req.body;

    if (!query || query.trim() === '') {
      return next(new ErrorHandler('Query is required', 400));
    }

    // Log the full original query for debugging
    console.log(`[VoiceAssistant] Query: '${query}'`);

    // Detect if the query is about schemes
    const isSchemeQuery = /scheme|yojana|subsidy|government/i.test(query);
    const dbModel = isSchemeQuery ? Scheme : MarketPrice;
    const dbQuery = isSchemeQuery
      ? {
        $or: [
          { name: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } },
          { category: { $regex: query, $options: 'i' } }
        ]
      }
      : {};
    const externalApiUrl = [
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
    const result = await getDataWithFallback({
      prompt: query,
      type: isSchemeQuery ? 'scheme' : 'market',
      dbQuery,
      externalApiUrl,
      dbModel,
      minDbResults: 1,
      geminiFn: askGemini
    });
    if (result.success && result.data) {
      return res.status(200).json({
        success: true,
        data: {
          response: result.data,
          source: result.source,
          model_used: result.source,
          confidence: 0.9,
          timestamp: new Date().toISOString()
        }
      });
    }
    // 2. Try MLNLPService
    try {
      const nlpResult = await MLNLPService.processQuery(query, language, context);
      if (nlpResult && nlpResult.response) {
        return res.status(200).json({
          success: true,
          data: {
            response: nlpResult.response,
            source: 'MLNLPService',
            model_used: nlpResult.model_used,
            confidence: nlpResult.confidence,
            timestamp: nlpResult.timestamp || new Date().toISOString()
          }
        });
      }
    } catch (e) { }
    // 3. Try WebScrapingService
    try {
      const webResult = await WebScrapingService.fetchAndAnalyzeData(query, language);
      if (webResult && webResult.data && webResult.data.summary) {
        return res.status(200).json({
          success: true,
          data: {
            response: webResult.data.summary,
            source: 'WebScrapingService',
            model_used: 'WebScrapingService',
            confidence: webResult.data.confidence || 0.5,
            timestamp: new Date().toISOString()
          }
        });
      }
    } catch (e) { }
    // 4. Final static fallback
    return res.status(200).json({
      success: true,
      data: {
        response: 'Sorry, all AI services and fallbacks are currently unavailable. Please try again later.',
        source: 'static',
        model_used: 'static',
        confidence: 0.1,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Voice query processing error:', error);
    return next(new ErrorHandler('Failed to process voice query', 500));
  }
});

// Process chat with conversation history
export const processChatWithHistory = catchAsyncError(async (req, res, next) => {
  try {
    const { messages, language = 'english' } = req.body;

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return next(new ErrorHandler('Messages array is required', 400));
    }

    console.log('Processing chat with history:', { messageCount: messages.length, language });

    // Process chat using LLM with history
    const result = await MLNLPService.processChatWithHistory(messages, language);

    res.status(200).json({
      success: true,
      data: {
        response: result.response,
        model_used: result.model_used,
        language: result.language,
        confidence: result.confidence,
        processing_time: result.processing_time || 0,
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Chat processing error:', error);
    return next(new ErrorHandler('Failed to process chat', 500));
  }
});

// Get NLP service status
export const getNLPStatus = catchAsyncError(async (req, res, next) => {
  try {
    const { language = 'english' } = req.query;

    const metrics = await MLNLPService.getNLPMetrics(language);

    res.status(200).json({
      success: true,
      data: {
        service: 'Kai Voice Assistant',
        model: metrics.model,
        accuracy: metrics.accuracy,
        capabilities: metrics.capabilities,
        language_support: ['english', 'kannada', 'hindi'],
        status: 'active',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('NLP status error:', error);
    return next(new ErrorHandler('Failed to get NLP status', 500));
  }
});

// Test NLP service
export const testNLPService = catchAsyncError(async (req, res, next) => {
  try {
    const { query = 'Hello, how are you?', language = 'english' } = req.body;

    console.log('Testing NLP service:', { query, language });

    // Test the service with a simple query
    const result = await MLNLPService.processQuery(query, language);

    res.status(200).json({
      success: true,
      data: {
        test_query: query,
        response: result.response,
        model_used: result.model_used,
        language: result.language,
        confidence: result.confidence,
        processing_time: result.processing_time || 0,
        status: 'working',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('NLP test error:', error);
    return next(new ErrorHandler('NLP service test failed', 500));
  }
}); 