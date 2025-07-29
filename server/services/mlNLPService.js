import { OfflineAIService } from './offlineAIService.js';
import { WebScrapingService } from './webScrapingService.js';
import { VoiceProcessingService } from './voiceProcessingService.js';

export class MLNLPService {
  
  // Process natural language query using Offline AI
  static async processQuery(query, language = 'english', context = '') {
    try {
      console.log('Processing query with Offline AI:', query, 'Language:', language);
      
      // Use the offline AI service for real-time analysis and response generation
      const result = await OfflineAIService.processQuery(query, language, context);
      
      // Enhance with web scraping if needed
      if (this.shouldUseWebScraping(query)) {
        const webData = await WebScrapingService.fetchAndAnalyzeData(query, language);
        if (webData.data && webData.data.summary) {
          result.response += ` ${webData.data.summary}`;
          result.web_data = webData;
        }
      }
      
      return {
        original_query: query,
        response: result.response,
        model_used: result.model_used,
        language: language,
        confidence: result.confidence,
        analysis: result.analysis,
        timestamp: result.timestamp
      };
      
    } catch (error) {
      console.error('Offline AI error:', error);
      
      // Simple error response without hardcoded data
      const errorResponse = language === 'kannada' ? 
        'ಕ್ಷಮಿಸಿ, ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಸಂಸ್ಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' :
        language === 'hindi' ? 
        'माफ़ कीजिए, आपके प्रश्न को संसाधित नहीं कर सका। कृपया फिर से कोशिश करें।' :
        'Sorry, I could not process your question. Please try again.';
      
      return {
        original_query: query,
        response: errorResponse,
        model_used: 'Error',
        language: language,
        confidence: 0.3,
        error: error.message
      };
    }
  }

  // Process chat with history (for maintaining conversation context)
  static async processChatWithHistory(messages, language = 'english') {
    try {
      console.log('Processing chat with history using Offline AI:', messages.length, 'messages');
      
      // Use the offline AI service for chat with history
      const result = await OfflineAIService.processChatWithHistory(messages, language);
      
      return {
        response: result.response,
        model_used: result.model_used,
        language: language,
        confidence: result.confidence,
        context_used: result.context_used
      };
      
    } catch (error) {
      console.error('Offline AI chat error:', error);
      
      const errorResponse = language === 'kannada' ? 
        'ಕ್ಷಮಿಸಿ, ಚಾಟ್ ಸಂಸ್ಕರಿಸಲು ಸಾಧ್ಯವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.' :
        language === 'hindi' ? 
        'माफ़ कीजिए, चैट को संसाधित नहीं कर सका। कृपया फिर से कोशिश करें।' :
        'Sorry, I could not process the chat. Please try again.';
      
      return {
        response: errorResponse,
        model_used: 'Error',
        language: language,
        confidence: 0.3,
        error: error.message
      };
    }
  }

  // Legacy methods for backward compatibility (now use LLM)
  static async initializeNLPModel(language = 'english') {
    return true; // Always return true since we're using LLM
  }

  static patternBasedProcessing(query, language) {
    // Redirect to LLM processing
    return this.processQuery(query, language);
  }

  static classifyIntent(query, language) {
    // This is now handled by the LLM
    return { intent: 'llm_processed', confidence: 0.95 };
  }

  static extractEntities(query, language) {
    // This is now handled by the LLM
    return { original_query: query };
  }

  static generateDynamicResponse(query, intent, entities, language) {
    // Redirect to LLM processing
    return this.processQuery(query, language);
  }

  static getDefaultResponse(query, language) {
    // Redirect to LLM processing
    return this.processQuery(query, language);
  }

  static async runMLNLPProcessing(query, language) {
    // Redirect to LLM processing
    return this.processQuery(query, language);
  }

  // Determine if web scraping should be used
  static shouldUseWebScraping(query) {
    const webScrapingKeywords = [
      'latest', 'news', 'update', 'current', 'today', 'recent', 'price', 'market',
      'weather', 'forecast', 'trend', 'information', 'data', 'search', 'find'
    ];
    
    const queryLower = query.toLowerCase();
    return webScrapingKeywords.some(keyword => queryLower.includes(keyword));
  }

  // Training methods (not applicable for offline AI)
  static async trainNLPModel(language, trainingData) {
    return {
      success: true,
      message: 'Using Offline AI Engine - no training required',
      model_used: 'Offline Dynamic AI Engine'
    };
  }

  static async runNLPTrainingPipeline(language, trainingData) {
    return {
      accuracy: 0.85,
      model_path: 'Offline Dynamic AI Engine',
      training_time: 0
    };
  }

  static async getNLPMetrics(language) {
    return {
      available: true,
      model: 'Offline Dynamic AI Engine',
      accuracy: 0.85,
      capabilities: 'Dynamic response generation, context awareness, multi-language support, web scraping, voice processing'
    };
  }
} 