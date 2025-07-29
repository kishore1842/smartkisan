import natural from 'natural';
import axios from 'axios';
import { JSDOM } from 'jsdom';
import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';
import { WebScrapingService } from './webScrapingService.js';
// Placeholder for local LLM integration
import { localLLMService } from './localLLMService.js';

const execAsync = promisify(exec);

export class OfflineAIService {
  
  // Main processing method - completely dynamic
  static async processQuery(query, language = 'english', context = '') {
    try {
      console.log('Offline AI processing:', query, 'Language:', language);
      let trimmedQuery = query.trim();
      // Clean for 'all details' etc.
      trimmedQuery = this.cleanSummaryQuery(trimmedQuery);
      // 0. Self-awareness/capabilities
      if (this.isSelfAwarenessQuery(trimmedQuery)) {
        return {
          original_query: query,
          response: 'I am KisanAI, your offline agricultural assistant. I can answer questions about crops, diseases, farming techniques, market prices, government schemes, and more. I support voice input/output, work in English, Hindi, and Kannada, and can fetch up-to-date information using local AI and web scraping. I do not require internet or API keys for most features, and I am designed to help farmers and agri-professionals with accurate, context-aware answers.',
          model_used: 'Offline Self-Awareness',
          language,
          confidence: 1.0,
          analysis: { type: 'self_awareness' },
          timestamp: new Date().toISOString()
        };
      }
      // 1. Math evaluation
      if (/^\d+\s*[+\-*/]\s*\d+(\s*[+\-*/]\s*\d+)*$/.test(trimmedQuery)) {
        try {
          // eslint-disable-next-line no-eval
          const result = eval(trimmedQuery);
          return {
            original_query: query,
            response: `The answer is ${result}.`,
            model_used: 'Offline Math Engine',
            language,
            confidence: 1.0,
            analysis: { type: 'math', expression: trimmedQuery, result },
            timestamp: new Date().toISOString()
          };
        } catch {}
      }
      // 2. Greeting/small talk detection
      if (this.isGreeting(trimmedQuery, language)) {
        return {
          original_query: query,
          response: this.getGreetingResponse(language),
          model_used: 'Offline Greeting Engine',
          language,
          confidence: 1.0,
          analysis: { type: 'greeting' },
          timestamp: new Date().toISOString()
        };
      }
      // === [KISANAI LIVE UPDATE: Enhanced Plant/Disease Q&A Logic START] ===
      // Enhanced: Detect if the query is an image-based plant/disease diagnosis request
      if (typeof query === 'object' && query.imageBuffer) {
        // Placeholder: Route to plant disease diagnosis API/service
        // You would call the actual diagnosis service here
        return {
          original_query: query,
          response: 'Image-based plant disease diagnosis is being processed (live logic placeholder).',
          model_used: 'PlantDiseaseDiagnosisAPI',
          language,
          confidence: 0.99,
          analysis: { type: 'image_diagnosis' },
          timestamp: new Date().toISOString()
        };
      }
      // Enhanced: Detect plant/disease Q&A intent and format answer
      if (this.isHowToOrProcessQuery(trimmedQuery) || this.isLikelyFactQuery(trimmedQuery) || /disease|symptom|remedy|treatment|cure|problem|issue|pest|infection|blight|rot|spot|mosaic|virus|fungus|bacteria|wilt|rust|smut|mildew|infestation|crop|plant|leaf|stem|root|fruit|flower|seed/i.test(trimmedQuery)) {
        let entity = this.extractProcessEntity(trimmedQuery) || this.extractFactEntity(trimmedQuery) || trimmedQuery;
        entity = this.fuzzyMatchEntity(entity);
        // Format: short/long/list based on query
        let format = 'short';
        if (/detailed|all details|explain|describe|long|full/i.test(trimmedQuery)) format = 'long';
        if (/list|steps|methods|ways|types|symptoms|remedies|causes|prevention|treatments/i.test(trimmedQuery)) format = 'list';
        // Try to fetch relevant section or summary
        let response = '';
        if (format === 'list') {
          // Try to get a list from Wikipedia section or fallback
          response = await WebScrapingService.fetchWikipediaSection(entity, trimmedQuery) || await this.getWikipediaSummary(entity, language, trimmedQuery);
        } else if (format === 'long') {
          response = await this.getWikipediaSummary(entity, language, trimmedQuery);
        } else {
          // short/definition
          const summary = await this.getWikipediaSummary(entity, language, trimmedQuery);
          response = summary && summary.split(/[\n\.]/)[0];
        }
        if (response && !/sorry|could not find|no information/i.test(response)) {
          return {
            original_query: query,
            response,
            model_used: 'EnhancedPlantDiseaseQnA',
            language,
            confidence: 0.97,
            analysis: { type: 'plant_disease_qna', entity, format },
            timestamp: new Date().toISOString()
          };
        }
        // Fallback to LLM if nothing found
      }
      // === [KISANAI LIVE UPDATE: Enhanced Plant/Disease Q&A Logic END] ===
      // 3. Crop/cultivation queries (e.g., 'about banana crop', 'banana crop', 'banana cultivation')
      if (this.isHowToOrProcessQuery(trimmedQuery) || /\bcrop\b|\bcultivation\b|\bproduction\b|\bagriculture\b/i.test(trimmedQuery)) {
        // Extract main crop/entity
        let entity = this.extractProcessEntity(trimmedQuery);
        if (!entity || entity.length < 2) entity = trimmedQuery.replace(/\bcrop\b|\bcultivation\b|\bproduction\b|\bagriculture\b/gi, '').trim();
        entity = this.fuzzyMatchEntity(entity);
        // Try to fetch the cultivation/farming/production section
        const section = await WebScrapingService.fetchWikipediaSection(entity, trimmedQuery);
        if (section && section.length > 30) {
          return {
            original_query: query,
            response: section,
            model_used: 'Offline Wikipedia Section',
            language,
            confidence: 0.98,
            analysis: { type: 'wiki_section', term: entity },
            timestamp: new Date().toISOString()
          };
        }
        // Fallback: try summary for the crop/entity
        const wikiSummary = await this.getWikipediaSummary(entity, language, trimmedQuery, true); // true = crop mode
        if (wikiSummary && !/sorry/i.test(wikiSummary)) {
          return {
            original_query: query,
            response: wikiSummary,
            model_used: 'Offline Wikipedia Summary',
            language,
            confidence: 0.95,
            analysis: { type: 'wiki_summary', term: entity },
            timestamp: new Date().toISOString()
          };
        }
        // Only if nothing found, fallback to LLM
      }
      // 4. Fact queries (e.g., 'ceo of google')
      if (this.isLikelyFactQuery(trimmedQuery)) {
        let wikiTerm = this.extractFactEntity(trimmedQuery);
        wikiTerm = this.fuzzyMatchEntity(wikiTerm);
        const fact = await this.getWikipediaSummary(wikiTerm, language, trimmedQuery, false, true); // factMode=true
        if (fact && !/sorry/i.test(fact)) {
          return {
            original_query: query,
            response: fact,
            model_used: 'Offline Wikipedia Fact',
            language,
            confidence: 0.98,
            analysis: { type: 'wiki_fact', term: wikiTerm },
            timestamp: new Date().toISOString()
          };
        }
        // Only if nothing found, fallback to LLM
      }
      // 5. Wikipedia summary for single-word, about, or unknown queries
      if (
        trimmedQuery.split(/\s+/).length === 1 ||
        this.isAboutOrDefinitionQuery(trimmedQuery)
      ) {
        let wikiTerm = trimmedQuery;
        if (this.isAboutOrDefinitionQuery(trimmedQuery)) {
          // Remove the about/definition prefix to get the main subject
          wikiTerm = trimmedQuery.replace(/^(about|what is|who is|define|explain|describe|tell me about)\b/i, '').replace(/[?]/g, '').trim();
        }
        wikiTerm = this.fuzzyMatchEntity(wikiTerm);
        if (wikiTerm.length === 0) wikiTerm = trimmedQuery;
        const wikiSummary = await this.getWikipediaSummary(wikiTerm, language, trimmedQuery);
        if (wikiSummary && !/sorry/i.test(wikiSummary)) {
          return {
            original_query: query,
            response: wikiSummary,
            model_used: 'Offline Wikipedia Summary',
            language,
            confidence: 0.95,
            analysis: { type: 'wiki_summary', term: wikiTerm },
            timestamp: new Date().toISOString()
          };
        }
        // Only if nothing found, fallback to LLM
      }
      // 6. Fallback: Use local LLM for any unanswered or open-ended query
      const llmResponse = await localLLMService.generateResponse(query, context);
      if (llmResponse && typeof llmResponse === 'string' && llmResponse.length > 2 && !/sorry|could not find|no information/i.test(llmResponse)) {
        return {
          original_query: query,
          response: llmResponse,
          model_used: 'Offline Local LLM',
          language,
          confidence: 0.9,
          analysis: { type: 'llm_fallback' },
          timestamp: new Date().toISOString()
        };
      }
      // Final fallback
      return {
        original_query: query,
        response: 'Sorry, I could not find relevant information for your question.',
        model_used: 'Offline Fallback',
        language,
        confidence: 0.1,
        analysis: { type: 'final_fallback' },
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Offline AI error:', error);
      return {
        original_query: query,
        response: this.getErrorResponse(language),
        model_used: 'Error',
        language: language,
        confidence: 0.1,
        error: error.message
      };
    }
  }

  // Perform completely dynamic analysis
  static async performDynamicAnalysis(query, language, context) {
    const words = query.toLowerCase().split(/\s+/);
    
    return {
      intent: await this.detectDynamicIntent(query, context),
      entities: await this.extractDynamicEntities(query, context),
      sentiment: this.analyzeDynamicSentiment(query),
      complexity: this.assessDynamicComplexity(query),
      urgency: this.detectDynamicUrgency(query),
      context_relevance: this.analyzeDynamicContext(query, context),
      web_data: await this.fetchRelevantWebData(query),
      system_capabilities: await this.analyzeSystemCapabilities(query),
      confidence: this.calculateDynamicConfidence(query, words)
    };
  }

  // Dynamic intent detection using advanced NLP
  static async detectDynamicIntent(query, context) {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(query.toLowerCase());
    
    const intentPatterns = {
      information_seeking: {
        patterns: ['what', 'how', 'when', 'where', 'why', 'which', 'tell', 'explain', 'describe', 'show'],
        weight: 1.0
      },
      problem_solving: {
        patterns: ['problem', 'issue', 'trouble', 'help', 'fix', 'solve', 'cure', 'treatment', 'disease', 'sick'],
        weight: 1.2
      },
      decision_making: {
        patterns: ['should', 'can', 'could', 'would', 'might', 'best', 'recommend', 'advice', 'choice'],
        weight: 1.1
      },
      system_control: {
        patterns: ['open', 'close', 'start', 'stop', 'run', 'execute', 'launch', 'file', 'folder'],
        weight: 1.3
      },
      data_analysis: {
        patterns: ['analyze', 'calculate', 'compute', 'estimate', 'measure', 'count', 'sum', 'total', 'price', 'market'],
        weight: 1.1
      },
      web_search: {
        patterns: ['search', 'find', 'lookup', 'information', 'latest', 'news', 'update'],
        weight: 1.0
      }
    };

    let maxScore = 0;
    let detectedIntent = 'general_inquiry';

    for (const [intent, config] of Object.entries(intentPatterns)) {
      const score = tokens.reduce((acc, token) => {
        return acc + config.patterns.filter(pattern => token.includes(pattern)).length * config.weight;
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
      }
    }

    return { intent: detectedIntent, confidence: Math.min(maxScore / tokens.length, 1) };
  }

  // Dynamic entity extraction using context and patterns
  static async extractDynamicEntities(query, context) {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(query.toLowerCase());
    
    const entities = {
      crops: [],
      diseases: [],
      locations: [],
      time_references: [],
      measurements: [],
      actions: [],
      technical_terms: [],
      user_requests: []
    };

    // Dynamic entity detection based on patterns and context
    tokens.forEach(token => {
      if (this.isCropRelated(token)) entities.crops.push(token);
      if (this.isDiseaseRelated(token)) entities.diseases.push(token);
      if (this.isLocationRelated(token)) entities.locations.push(token);
      if (this.isTimeRelated(token)) entities.time_references.push(token);
      if (this.isMeasurementRelated(token)) entities.measurements.push(token);
      if (this.isActionRelated(token)) entities.actions.push(token);
      if (this.isTechnicalTerm(token)) entities.technical_terms.push(token);
      if (this.isUserRequest(token)) entities.user_requests.push(token);
    });

    return entities;
  }

  // Dynamic sentiment analysis
  static analyzeDynamicSentiment(query) {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(query.toLowerCase());
    
    const sentimentScores = {
      positive: ['good', 'great', 'excellent', 'successful', 'healthy', 'profitable', 'benefit', 'help', 'improve'],
      negative: ['bad', 'poor', 'sick', 'disease', 'problem', 'loss', 'damage', 'fail', 'error', 'dead'],
      urgent: ['emergency', 'urgent', 'immediate', 'critical', 'serious', 'dying', 'dead', 'help'],
      neutral: ['what', 'how', 'when', 'where', 'why', 'which', 'tell', 'explain']
    };

    let score = 0;
    let sentiment = 'neutral';
    let urgency = 0;

    tokens.forEach(token => {
      if (sentimentScores.positive.some(p => token.includes(p))) score += 1;
      if (sentimentScores.negative.some(n => token.includes(n))) score -= 1;
      if (sentimentScores.urgent.some(u => token.includes(u))) urgency += 1;
    });

    if (score > 0) sentiment = 'positive';
    else if (score < 0) sentiment = 'negative';

    return { sentiment, score, urgency };
  }

  // Dynamic complexity assessment
  static assessDynamicComplexity(query) {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(query);
    
    const complexityFactors = {
      wordCount: tokens.length,
      technicalTerms: tokens.filter(token => this.isTechnicalTerm(token)).length,
      numbers: (query.match(/\d+/g) || []).length,
      questions: (query.match(/\?/g) || []).length,
      specialChars: (query.match(/[^a-zA-Z0-9\s]/g) || []).length
    };

    let complexity = 'simple';
    let score = 0;

    if (complexityFactors.wordCount > 10) score += 1;
    if (complexityFactors.technicalTerms > 2) score += 1;
    if (complexityFactors.numbers > 0) score += 1;
    if (complexityFactors.questions > 0) score += 1;
    if (complexityFactors.specialChars > 3) score += 1;

    if (score >= 3) complexity = 'complex';
    else if (score >= 1) complexity = 'moderate';

    return { complexity, score, factors: complexityFactors };
  }

  // Dynamic urgency detection
  static detectDynamicUrgency(query) {
    const urgentPatterns = [
      'emergency', 'urgent', 'immediate', 'critical', 'serious', 
      'dying', 'dead', 'help', 'quick', 'fast', 'now', 'asap'
    ];
    
    const tokens = query.toLowerCase().split(/\s+/);
    const urgentWords = tokens.filter(token => 
      urgentPatterns.some(pattern => token.includes(pattern))
    );

    const urgencyLevel = urgentWords.length > 0 ? Math.min(urgentWords.length, 5) : 0;

    return {
      isUrgent: urgencyLevel > 0,
      urgencyLevel,
      urgentTerms: urgentWords,
      requiresImmediateAction: urgencyLevel >= 3
    };
  }

  // Dynamic context analysis
  static analyzeDynamicContext(query, context) {
    if (!context) return { relevance: 0.5, contextUsed: false };
    
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const contextWords = new Set(context.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...queryWords].filter(x => contextWords.has(x)));
    const relevance = intersection.size / Math.max(queryWords.size, 1);
    
    return {
      relevance: Math.min(relevance, 1),
      contextUsed: relevance > 0.1,
      sharedTerms: Array.from(intersection),
      contextLength: contextWords.size
    };
  }

  // Fetch relevant web data dynamically
  static async fetchRelevantWebData(query) {
    try {
      const searchTerms = this.extractSearchTerms(query);
      const data = {};

      for (const term of searchTerms.slice(0, 3)) {
        try {
          // Try to fetch from public APIs or scrape relevant data
          const response = await axios.get(`https://api.publicapis.org/entries?title=${term}`, {
            timeout: 5000
          });
          
          if (response.data && response.data.entries) {
            data[term] = response.data.entries.slice(0, 2);
          }
        } catch (error) {
          console.log(`Could not fetch data for term: ${term}`);
        }
      }

      return data;
    } catch (error) {
      console.log('Web data fetching failed:', error.message);
      return {};
    }
  }

  // Analyze system capabilities for the query
  static async analyzeSystemCapabilities(query) {
    const capabilities = {
      file_operations: this.canPerformFileOperations(query),
      system_control: this.canPerformSystemControl(query),
      web_scraping: this.canPerformWebScraping(query),
      data_analysis: this.canPerformDataAnalysis(query),
      voice_processing: this.canPerformVoiceProcessing(query)
    };

    return capabilities;
  }

  // Calculate dynamic confidence score
  static calculateDynamicConfidence(query, words) {
    const factors = {
      queryLength: Math.min(words.length / 10, 1),
      technicalTerms: Math.min(words.filter(w => this.isTechnicalTerm(w)).length / 5, 1),
      clarity: this.assessQueryClarity(query),
      context: this.assessContextAvailability(query)
    };

    const confidence = Object.values(factors).reduce((sum, factor) => sum + factor, 0) / Object.keys(factors).length;
    return Math.min(confidence, 0.95);
  }

  // Generate completely dynamic response
  static async generateDynamicResponse(analysis) {
    const { intent, entities, sentiment, complexity, urgency, web_data, system_capabilities } = analysis;
    
    let response = '';
    
    // Handle urgency first
    if (urgency.isUrgent) {
      response += this.generateUrgentResponse(urgency);
    }
    
    // Generate intent-based response
    switch (intent.intent) {
      case 'information_seeking':
        response += await this.generateInformationResponse(entities, complexity, web_data);
        break;
      case 'problem_solving':
        response += await this.generateProblemSolvingResponse(entities, sentiment);
        break;
      case 'decision_making':
        response += await this.generateDecisionResponse(entities, system_capabilities);
        break;
      case 'system_control':
        response += await this.generateSystemControlResponse(entities, system_capabilities);
        break;
      case 'data_analysis':
        response += await this.generateDataAnalysisResponse(entities, web_data);
        break;
      case 'web_search':
        response += await this.generateWebSearchResponse(entities, web_data);
        break;
      default:
        response += await this.generateGeneralResponse(entities, sentiment, system_capabilities);
    }
    
    return response;
  }

  // Dynamic response generators
  static generateUrgentResponse(urgency) {
    if (urgency.requiresImmediateAction) {
      return 'This appears to be an urgent situation requiring immediate attention. ';
    }
    return 'This requires prompt attention. ';
  }

  static async generateInformationResponse(entities, complexity, web_data) {
    let response = 'I can help you with information about ';
    
    if (entities.crops.length > 0) {
      response += `${entities.crops.join(', ')}. I can provide cultivation techniques, care instructions, and management practices. `;
    }
    
    if (entities.diseases.length > 0) {
      response += `For ${entities.diseases.join(', ')}, I can help with identification, symptoms, and treatment approaches. `;
    }
    
    if (entities.technical_terms.length > 0) {
      response += `Regarding ${entities.technical_terms.join(', ')}, I can explain concepts and provide detailed guidance. `;
    }
    
    if (Object.keys(web_data).length > 0) {
      response += 'I can also search for the latest information and updates on these topics. ';
    }
    
    if (complexity.complexity === 'complex') {
      response += 'This is a detailed topic that may require multiple considerations and steps. ';
    }
    
    return response;
  }

  static async generateProblemSolvingResponse(entities, sentiment) {
    let response = 'I understand you\'re facing a challenge. ';
    
    if (sentiment.sentiment === 'negative') {
      response += 'Let me help you address this issue systematically. ';
    }
    
    if (entities.diseases.length > 0) {
      response += `For ${entities.diseases.join(', ')}, I recommend immediate assessment and treatment planning. `;
    }
    
    if (entities.crops.length > 0) {
      response += `With ${entities.crops.join(', ')}, I can help identify potential issues and solutions. `;
    }
    
    response += 'I can analyze the situation and provide step-by-step guidance. ';
    
    return response;
  }

  static async generateDecisionResponse(entities, system_capabilities) {
    let response = 'I can help you make an informed decision. ';
    
    if (entities.crops.length > 0) {
      response += `For ${entities.crops.join(', ')}, I can analyze factors like market conditions, weather, and best practices. `;
    }
    
    if (system_capabilities.data_analysis) {
      response += 'I can perform data analysis to support your decision-making process. ';
    }
    
    if (system_capabilities.web_scraping) {
      response += 'I can gather current market information and trends to inform your decision. ';
    }
    
    response += 'Let me know what specific factors you\'d like me to consider. ';
    
    return response;
  }

  static async generateSystemControlResponse(entities, system_capabilities) {
    let response = 'I can help you with system operations. ';
    
    if (system_capabilities.file_operations) {
      response += 'I can help with file and folder operations. ';
    }
    
    if (system_capabilities.system_control) {
      response += 'I can assist with launching applications and system tasks. ';
    }
    
    if (entities.actions.length > 0) {
      response += `I can help you ${entities.actions.join(', ')}. `;
    }
    
    response += 'Please specify what you\'d like me to do. ';
    
    return response;
  }

  static async generateDataAnalysisResponse(entities, web_data) {
    let response = 'I can help you with data analysis. ';
    
    if (entities.measurements.length > 0) {
      response += `I can analyze ${entities.measurements.join(', ')} data. `;
    }
    
    if (Object.keys(web_data).length > 0) {
      response += 'I can process and analyze web data for insights. ';
    }
    
    response += 'I can perform calculations, generate reports, and provide analytical insights. ';
    
    return response;
  }

  static async generateWebSearchResponse(entities, web_data) {
    let response = 'I can help you search for information. ';
    
    if (Object.keys(web_data).length > 0) {
      response += 'I can search multiple sources and provide comprehensive results. ';
    }
    
    if (entities.user_requests.length > 0) {
      response += `I can search for ${entities.user_requests.join(', ')}. `;
    }
    
    response += 'I can gather real-time information from various sources. ';
    
    return response;
  }

  static async generateGeneralResponse(entities, sentiment, system_capabilities) {
    let response = 'I\'m here to help you with various tasks. ';
    
    if (entities.crops.length > 0 || entities.diseases.length > 0) {
      response += 'I can assist with agricultural queries and crop management. ';
    }
    
    if (system_capabilities.web_scraping) {
      response += 'I can search for current information and updates. ';
    }
    
    if (system_capabilities.data_analysis) {
      response += 'I can help with data analysis and calculations. ';
    }
    
    response += 'Please let me know what specific assistance you need. ';
    
    return response;
  }

  // Helper methods for entity detection
  static isCropRelated(word) {
    const cropPatterns = ['rice', 'wheat', 'corn', 'maize', 'cotton', 'sugarcane', 'paddy', 'vegetable', 'fruit'];
    return cropPatterns.some(pattern => word.includes(pattern));
  }

  static isDiseaseRelated(word) {
    const diseasePatterns = ['disease', 'fungus', 'virus', 'bacteria', 'pest', 'infection', 'rot', 'blight'];
    return diseasePatterns.some(pattern => word.includes(pattern));
  }

  static isLocationRelated(word) {
    const locationPatterns = ['village', 'city', 'state', 'district', 'region', 'area', 'field', 'farm'];
    return locationPatterns.some(pattern => word.includes(pattern));
  }

  static isTimeRelated(word) {
    const timePatterns = ['today', 'tomorrow', 'yesterday', 'week', 'month', 'year', 'season', 'harvest'];
    return timePatterns.some(pattern => word.includes(pattern));
  }

  static isMeasurementRelated(word) {
    const measurementPatterns = ['kg', 'ton', 'acre', 'hectare', 'price', 'cost', 'yield', 'production'];
    return measurementPatterns.some(pattern => word.includes(pattern));
  }

  static isActionRelated(word) {
    const actionPatterns = ['open', 'close', 'start', 'stop', 'run', 'execute', 'launch', 'create', 'delete'];
    return actionPatterns.some(pattern => word.includes(pattern));
  }

  static isTechnicalTerm(word) {
    const technicalPatterns = ['fertilizer', 'pesticide', 'irrigation', 'soil', 'ph', 'nutrient', 'organic', 'chemical'];
    return technicalPatterns.some(pattern => word.includes(pattern));
  }

  static isUserRequest(word) {
    const requestPatterns = ['help', 'show', 'tell', 'explain', 'find', 'search', 'get', 'need'];
    return requestPatterns.some(pattern => word.includes(pattern));
  }

  // System capability checks
  static canPerformFileOperations(query) {
    const filePatterns = ['file', 'folder', 'document', 'read', 'write', 'save', 'open'];
    return filePatterns.some(pattern => query.toLowerCase().includes(pattern));
  }

  static canPerformSystemControl(query) {
    const systemPatterns = ['open', 'launch', 'start', 'run', 'execute', 'app', 'program'];
    return systemPatterns.some(pattern => query.toLowerCase().includes(pattern));
  }

  static canPerformWebScraping(query) {
    const webPatterns = ['search', 'find', 'information', 'latest', 'news', 'update', 'web'];
    return webPatterns.some(pattern => query.toLowerCase().includes(pattern));
  }

  static canPerformDataAnalysis(query) {
    const analysisPatterns = ['analyze', 'calculate', 'compute', 'estimate', 'measure', 'data'];
    return analysisPatterns.some(pattern => query.toLowerCase().includes(pattern));
  }

  static canPerformVoiceProcessing(query) {
    const voicePatterns = ['speak', 'voice', 'audio', 'listen', 'hear', 'talk'];
    return voicePatterns.some(pattern => query.toLowerCase().includes(pattern));
  }

  // Utility methods
  static extractSearchTerms(query) {
    const tokenizer = new natural.WordTokenizer();
    const tokens = tokenizer.tokenize(query.toLowerCase());
    return tokens.filter(token => token.length > 3);
  }

  static assessQueryClarity(query) {
    const wordCount = query.split(/\s+/).length;
    const hasQuestion = query.includes('?');
    const hasSpecificTerms = this.hasSpecificTerms(query);
    
    let clarity = 0.5;
    if (wordCount >= 3) clarity += 0.2;
    if (hasQuestion) clarity += 0.2;
    if (hasSpecificTerms) clarity += 0.1;
    
    return Math.min(clarity, 1);
  }

  static hasSpecificTerms(query) {
    const specificPatterns = ['crop', 'disease', 'price', 'market', 'scheme', 'help'];
    return specificPatterns.some(pattern => query.toLowerCase().includes(pattern));
  }

  static assessContextAvailability(query) {
    const contextPatterns = ['this', 'that', 'it', 'here', 'there', 'now', 'today'];
    return contextPatterns.some(pattern => query.toLowerCase().includes(pattern)) ? 0.8 : 0.5;
  }

  static getErrorResponse(language) {
    const responses = {
      english: 'I encountered an error processing your request. Please try again with a different approach.',
      kannada: 'ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸಂಸ್ಕರಿಸುವಲ್ಲಿ ದೋಷ ಎದುರಾಯಿತು. ದಯವಿಟ್ಟು ವಿಭಿನ್ನ ವಿಧಾನದೊಂದಿಗೆ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.',
      hindi: 'आपके अनुरोध को संसाधित करने में त्रुटि आई। कृपया अलग तरीके से फिर से कोशिश करें।'
    };
    
    return responses[language] || responses.english;
  }

  // Detect if the query is a greeting
  static isGreeting(query, language) {
    const greetings = {
      english: ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'namaste'],
      kannada: ['ನಮಸ್ಕಾರ', 'ಹಲೋ', 'ನಮಸ್ತೆ', 'ಶುಭೋದಯ', 'ಶುಭ ಸಂಜೆ'],
      hindi: ['नमस्ते', 'हाय', 'हैलो', 'सुप्रभात', 'शुभ संध्या']
    };
    const langGreetings = greetings[language] || greetings.english;
    return langGreetings.some(greet => query.toLowerCase().includes(greet));
  }

  static getGreetingResponse(language) {
    const responses = {
      english: 'Hello! How can I assist you today?',
      kannada: 'ನಮಸ್ಕಾರ! ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?',
      hindi: 'नमस्ते! मैं आपकी कैसे मदद कर सकता हूँ?'
    };
    return responses[language] || responses.english;
  }

  // Detect if the query is likely a fact lookup
  static isLikelyFactQuery(query) {
    // e.g., 'What is Python?', 'Who is Narendra Modi?', 'Define photosynthesis'
    return /^(what|who|define|explain|describe|tell me about)\b/i.test(query);
  }

  // Helper: Detect if query is a general/about/definition query
  static isAboutOrDefinitionQuery(query) {
    return /^(about|what is|who is|define|explain|describe|tell me about)\b/i.test(query.trim());
  }

  // Helper: Extract main subject/entity from fact queries
  static extractFactEntity(query) {
    // Try to extract after 'of' or 'about', else last word
    let match = query.match(/(?:of|about) ([\w\s]+)[?]?$/i);
    if (match && match[1]) {
      return match[1].trim();
    }
    // Remove question words and get last word
    let cleaned = query.replace(/^(what|who|define|explain|describe|tell me about)\b/i, '').replace(/[?]/g, '').trim();
    if (cleaned.split(' ').length > 1) {
      return cleaned.split(' ').slice(-1)[0];
    }
    return cleaned;
  }

  // Helper: For fact queries, extract only the current/most relevant value (e.g., CEO)
  static extractFirstValidFact(fact) {
    if (!fact) return null;
    // If comma/semicolon separated, take the first
    let first = fact.split(/[;,\n]/)[0].trim();
    // Remove parenthetical info
    first = first.replace(/\(.*?\)/g, '').trim();
    // Remove extra words like 'current', 'present', etc.
    first = first.replace(/\b(current|present|incumbent|since \d{4})\b/gi, '').trim();
    // If still too short, fallback to original
    if (first.length < 2) return fact.trim();
    return first;
  }

  // Helper: Try to singularize a word (basic English rules)
  static singularize(word) {
    if (word.endsWith('ies')) return word.slice(0, -3) + 'y';
    if (word.endsWith('es')) return word.slice(0, -2);
    if (word.endsWith('s')) return word.slice(0, -1);
    return word;
  }

  // Helper: Clean query for summary (strip 'all details', 'full details', etc.)
  static cleanSummaryQuery(query) {
    return query.replace(/\b(all|full) details\b/gi, '').replace(/\s+/g, ' ').trim();
  }

  // Helper: Detect if query is a how-to/process/cultivation query
  static isHowToOrProcessQuery(query) {
    return /(how to|process of|steps to|cultivation of|growing|farming|production of|make|grow|cultivate|produce|plant|raise|harvest)/i.test(query);
  }

  // Helper: Extract crop/entity for how-to/process queries
  static extractProcessEntity(query) {
    // Try to extract after 'of', 'for', or last word
    let match = query.match(/(?:of|for) ([\w\s]+?)(?: crop|$)/i);
    if (match && match[1]) return match[1].trim();
    // Remove process keywords and get last word
    let cleaned = query.replace(/(how to|process of|steps to|cultivation of|growing|farming|production of|make|grow|cultivate|produce|plant|raise|harvest)/gi, '').replace(/[?]/g, '').trim();
    if (cleaned.split(' ').length > 1) {
      return cleaned.split(' ').slice(-1)[0];
    }
    return cleaned;
  }

  // Helper: Fuzzy match entity/crop/fruit names using a list of common names
  static fuzzyMatchEntity(term) {
    const commonEntities = [
      'banana', 'apple', 'mango', 'papaya', 'grape', 'grapes', 'orange', 'wheat', 'rice', 'maize', 'corn', 'potato', 'tomato', 'onion', 'cabbage', 'carrot', 'spinach', 'lettuce', 'barley', 'sugarcane', 'cotton', 'soybean', 'groundnut', 'peanut', 'chickpea', 'pea', 'bean', 'millet', 'sorghum', 'mustard', 'sunflower', 'linseed', 'sesame', 'jute', 'tea', 'coffee', 'cocoa', 'rubber', 'coconut', 'cashew', 'almond', 'pistachio', 'date', 'fig', 'lemon', 'lime', 'pomegranate', 'guava', 'pear', 'peach', 'plum', 'apricot', 'cherry', 'strawberry', 'raspberry', 'blueberry', 'blackberry', 'watermelon', 'melon', 'pumpkin', 'cucumber', 'brinjal', 'eggplant', 'okra', 'ladyfinger', 'bottle gourd', 'ridge gourd', 'bitter gourd', 'sweet potato', 'yam', 'ginger', 'garlic', 'turmeric', 'cardamom', 'clove', 'pepper', 'chili', 'capsicum', 'coriander', 'cumin', 'fennel', 'fenugreek', 'basil', 'mint', 'dill', 'oregano', 'thyme', 'rosemary', 'sage', 'bay leaf', 'marjoram', 'tarragon', 'saffron', 'vanilla', 'mustard', 'rapeseed', 'flax', 'hemp', 'sesame', 'castor', 'oil palm', 'olive', 'avocado', 'kiwi', 'lychee', 'longan', 'dragon fruit', 'jackfruit', 'durian', 'starfruit', 'passion fruit', 'persimmon', 'sapota', 'tamarind', 'mulberry', 'gooseberry', 'currant', 'elderberry', 'cranberry', 'quince', 'medlar', 'loquat', 'carambola', 'rambutan', 'mangosteen', 'salak', 'santol', 'langsat', 'pulasan', 'cempedak', 'breadfruit', 'soursop', 'custard apple', 'sugar apple', 'cherimoya', 'atemoya', 'pawpaw', 'pawpaw', 'papaya', 'pappaya', 'grape', 'grapes', 'orange', 'sweet lime', 'mosambi', 'citrus', 'lemon', 'lime', 'mandarin', 'tangerine', 'pomelo', 'grapefruit', 'kumquat', 'calamondin', 'yuzu', 'ugli fruit', 'clementine', 'satsuma', 'bergamot', 'citron', 'finger lime', 'desert lime', 'mountain pepper', 'bush tomato', 'wattleseed', 'macadamia', 'bunya nut', 'illawarra plum', 'muntries', 'quandong', 'riberry', 'davidson plum', 'lemon myrtle', 'lemon aspen', 'native ginger', 'native mint', 'native pepper', 'native raspberry', 'native currant', 'native cherry', 'native grape', 'native plum', 'native peach', 'native apricot', 'native fig', 'native mulberry', 'native gooseberry', 'native elderberry', 'native cranberry', 'native quince', 'native medlar', 'native loquat', 'native carambola', 'native rambutan', 'native mangosteen', 'native salak', 'native santol', 'native langsat', 'native pulasan', 'native cempedak', 'native breadfruit', 'native soursop', 'native custard apple', 'native sugar apple', 'native cherimoya', 'native atemoya', 'native pawpaw', 'native papaya', 'native pappaya', 'native grape', 'native grapes', 'native orange', 'native sweet lime', 'native mosambi', 'native citrus', 'native lemon', 'native lime', 'native mandarin', 'native tangerine', 'native pomelo', 'native grapefruit', 'native kumquat', 'native calamondin', 'native yuzu', 'native ugli fruit', 'native clementine', 'native satsuma', 'native bergamot', 'native citron', 'native finger lime', 'native desert lime', 'native mountain pepper', 'native bush tomato', 'native wattleseed', 'native macadamia', 'native bunya nut', 'native illawarra plum', 'native muntries', 'native quandong', 'native riberry', 'native davidson plum', 'native lemon myrtle', 'native lemon aspen'
    ];
    let best = term;
    let bestScore = 0.8; // Only match if reasonably close
    for (const entity of commonEntities) {
      const score = natural.JaroWinklerDistance(term.toLowerCase(), entity.toLowerCase());
      if (score > bestScore) {
        best = entity;
        bestScore = score;
      }
    }
    return best;
  }

  // Helper: Detect self-awareness/capabilities queries
  static isSelfAwarenessQuery(query) {
    return /\b(who are you|what can you do|your capabilities|about yourself|what is your name|who made you|are you ai|are you an assistant|describe yourself|tell me about yourself|what are you)\b/i.test(query);
  }

  // Fetch Wikipedia summary for a term
  static async getWikipediaSummary(term, language, fullQuery = null, cropMode = false, factMode = false) {
    try {
      // Use the web scraping service for Wikipedia
      let wiki = await WebScrapingService.scrapeWikipedia(term, fullQuery || term);
      // If not found and term is plural, try singular
      if ((!wiki || !wiki.extract) && term.length > 3) {
        const singular = this.singularize(term);
        if (singular !== term) {
          wiki = await WebScrapingService.scrapeWikipedia(singular, fullQuery || singular);
        }
      }
      if (wiki && wiki.extract) {
        // For fact queries, only return the first, most relevant answer (no concatenation)
        if (factMode) {
          const fact = this.extractFirstValidFact(wiki.extract);
          if (fact && fact.length > 2 && !/sorry/i.test(fact)) return fact;
          return 'Sorry, I could not find the answer to your question.';
        }
        // For crop/cultivation queries, prefer summary about the crop, not fallback
        if (cropMode) {
          if (wiki.extract && wiki.extract.length > 10 && !/sorry/i.test(wiki.extract)) return wiki.extract;
          return 'Sorry, I could not find relevant information for your question.';
        }
        // For general/definition queries, return the first line/summary
        if (this.isAboutOrDefinitionQuery(fullQuery || term)) {
          const firstLine = wiki.extract.split(/[\n\.]/)[0].trim();
          if (firstLine && firstLine.length > 2 && !/sorry/i.test(firstLine)) return firstLine;
        }
        return wiki.extract;
      }
    } catch {}
    // If nothing found, return a clear fallback
    return 'Sorry, I could not find relevant information for your question.';
  }

  // Detect if the response is generic
  static isGenericResponse(response) {
    if (!response) return true;
    const genericPhrases = [
      'I\'m here to help you with various tasks',
      'Please let me know what specific assistance you need',
      'I can help you with information about',
      'I can assist with agricultural queries',
      'I am your voice assistant',
      'I can help you with system operations',
      'I can provide you with information',
      'I am here to assist you',
      'Sorry, I could not process your question',
      'I need more information to help answer your question'
    ];
    return genericPhrases.some(phrase => response.toLowerCase().includes(phrase.toLowerCase()));
  }

  // Helper to format web scraping/API data for user-friendly output
  static formatWebDataForUser(data, originalQuery = '') {
    // If this is a fact query and the answer is direct, return only the answer
    if (this.isLikelyFactQuery(originalQuery) && data.summary && !data.summary.toLowerCase().includes('sorry')) {
      return data.summary.trim();
    }
    if (this.isLikelyFactQuery(originalQuery) && data.relevantData) {
      // Try to find a direct answer in relevantData
      for (const key in data.relevantData) {
        const info = data.relevantData[key];
        if (typeof info.content === 'string' && info.content.length > 0 && !info.content.toLowerCase().includes('sorry')) {
          return info.content.trim();
        }
      }
    }
    // For how-to/general queries, keep the current formatting
    let output = '';
    if (data.summary && data.summary.length > 10) {
      output += `Summary: ${data.summary}\n`;
    }
    if (data.keyInsights && Array.isArray(data.keyInsights) && data.keyInsights.length > 0) {
      output += '\nKey Insights:';
      data.keyInsights.slice(0, 3).forEach((insight, i) => {
        output += `\n${i + 1}. ${insight}`;
      });
    }
    if (data.relevantData && Object.keys(data.relevantData).length > 0) {
      output += '\n\nTop Relevant Data:';
      let count = 0;
      for (const [term, info] of Object.entries(data.relevantData)) {
        if (count++ >= 3) break;
        output += `\n- ${term} (source: ${info.source})`;
        if (typeof info.content === 'string') {
          output += `: ${info.content.substring(0, 200)}`;
        } else if (info.content && info.content.title) {
          output += `: ${info.content.title}`;
        }
      }
    }
    if (data.recommendations && data.recommendations.length > 0) {
      output += '\n\nRecommendations:';
      data.recommendations.forEach((rec, i) => {
        output += `\n- ${rec}`;
      });
    }
    if (!output.trim() || (data.summary && data.summary.toLowerCase().includes('sorry'))) {
      output = data.summary && data.summary.toLowerCase().includes('sorry') ? data.summary : 'I searched multiple sources but could not find a clear answer. Please try rephrasing your question.';
    }
    return output.trim();
  }

  // Process chat with history
  static async processChatWithHistory(messages, language = 'english') {
    try {
      const lastMessage = messages[messages.length - 1];
      const context = messages.slice(-3).map(m => m.content).join(' ');
      
      const result = await this.processQuery(lastMessage.content, language, context);
      
      return {
        response: result.response,
        model_used: result.model_used,
        language: language,
        confidence: result.confidence,
        context_used: context.length > 0
      };
      
    } catch (error) {
      console.error('Chat processing error:', error);
      return {
        response: this.getErrorResponse(language),
        model_used: 'Error',
        language: language,
        confidence: 0.1,
        error: error.message
      };
    }
  }
} 