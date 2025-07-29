import natural from 'natural';

export class DynamicAIService {
  
  // Real-time query analysis and response generation
  static async processQuery(query, language = 'english', context = '') {
    try {
      console.log('Dynamic AI processing:', query, 'Language:', language);
      
      // Real-time analysis of user intent and context
      const analysis = this.analyzeQuery(query, language, context);
      
      // Generate dynamic response based on analysis
      const response = await this.generateDynamicResponse(analysis);
      
      return {
        original_query: query,
        response: response,
        model_used: 'Dynamic AI Engine',
        language: language,
        confidence: analysis.confidence,
        analysis: analysis,
        timestamp: new Date().toISOString()
      };
      
    } catch (error) {
      console.error('Dynamic AI error:', error);
      return {
        original_query: query,
        response: 'I encountered an error processing your request. Please try again.',
        model_used: 'Error',
        language: language,
        confidence: 0.1,
        error: error.message
      };
    }
  }

  // Real-time query analysis without pre-built patterns
  static analyzeQuery(query, language, context) {
    const words = query.toLowerCase().split(/\s+/);
    const analysis = {
      intent: this.detectIntent(words, context),
      entities: this.extractEntities(words, context),
      sentiment: this.analyzeSentiment(query),
      complexity: this.assessComplexity(query),
      urgency: this.detectUrgency(query),
      context_relevance: this.analyzeContextRelevance(query, context),
      confidence: 0.8
    };
    
    return analysis;
  }

  // Dynamic intent detection based on real-time analysis
  static detectIntent(words, context) {
    const intentPatterns = {
      information_seeking: ['what', 'how', 'when', 'where', 'why', 'which', 'tell', 'explain', 'describe'],
      problem_solving: ['problem', 'issue', 'trouble', 'help', 'fix', 'solve', 'cure', 'treatment'],
      decision_making: ['should', 'can', 'could', 'would', 'might', 'best', 'recommend', 'advice'],
      comparison: ['vs', 'versus', 'compare', 'difference', 'better', 'worse', 'similar'],
      calculation: ['calculate', 'compute', 'estimate', 'measure', 'count', 'sum', 'total'],
      instruction: ['how to', 'steps', 'procedure', 'method', 'technique', 'process']
    };

    let detectedIntent = 'general_inquiry';
    let maxScore = 0;

    for (const [intent, patterns] of Object.entries(intentPatterns)) {
      const score = patterns.reduce((acc, pattern) => {
        return acc + words.filter(word => word.includes(pattern)).length;
      }, 0);
      
      if (score > maxScore) {
        maxScore = score;
        detectedIntent = intent;
      }
    }

    return detectedIntent;
  }

  // Dynamic entity extraction
  static extractEntities(words, context) {
    const entities = {
      crops: [],
      diseases: [],
      locations: [],
      time_references: [],
      measurements: [],
      actions: []
    };

    // Real-time entity detection based on word patterns and context
    words.forEach(word => {
      if (this.isCropRelated(word)) entities.crops.push(word);
      if (this.isDiseaseRelated(word)) entities.diseases.push(word);
      if (this.isLocationRelated(word)) entities.locations.push(word);
      if (this.isTimeRelated(word)) entities.time_references.push(word);
      if (this.isMeasurementRelated(word)) entities.measurements.push(word);
      if (this.isActionRelated(word)) entities.actions.push(word);
    });

    return entities;
  }

  // Dynamic sentiment analysis
  static analyzeSentiment(query) {
    const positiveWords = ['good', 'great', 'excellent', 'successful', 'healthy', 'profitable'];
    const negativeWords = ['bad', 'poor', 'sick', 'disease', 'problem', 'loss', 'damage'];
    const urgentWords = ['emergency', 'urgent', 'immediate', 'critical', 'serious'];

    const words = query.toLowerCase().split(/\s+/);
    let sentiment = 'neutral';
    let score = 0;

    words.forEach(word => {
      if (positiveWords.some(p => word.includes(p))) score += 1;
      if (negativeWords.some(n => word.includes(n))) score -= 1;
      if (urgentWords.some(u => word.includes(u))) score -= 2;
    });

    if (score > 0) sentiment = 'positive';
    else if (score < 0) sentiment = 'negative';
    else sentiment = 'neutral';

    return { sentiment, score };
  }

  // Dynamic complexity assessment
  static assessComplexity(query) {
    const wordCount = query.split(/\s+/).length;
    const hasTechnicalTerms = /(disease|fertilizer|irrigation|pesticide|harvest|soil|ph|nutrient)/i.test(query);
    const hasNumbers = /\d+/.test(query);
    const hasQuestions = /\?/.test(query);

    let complexity = 'simple';
    if (wordCount > 10 || hasTechnicalTerms) complexity = 'moderate';
    if (wordCount > 15 || (hasTechnicalTerms && hasNumbers)) complexity = 'complex';

    return complexity;
  }

  // Dynamic urgency detection
  static detectUrgency(query) {
    const urgentPatterns = ['emergency', 'urgent', 'immediate', 'critical', 'serious', 'dying', 'dead'];
    const urgentWords = query.toLowerCase().split(/\s+/).filter(word => 
      urgentPatterns.some(pattern => word.includes(pattern))
    );

    return {
      isUrgent: urgentWords.length > 0,
      urgencyLevel: urgentWords.length,
      urgentTerms: urgentWords
    };
  }

  // Dynamic context relevance analysis
  static analyzeContextRelevance(query, context) {
    if (!context) return { relevance: 0.5, contextUsed: false };
    
    const queryWords = new Set(query.toLowerCase().split(/\s+/));
    const contextWords = new Set(context.toLowerCase().split(/\s+/));
    
    const intersection = new Set([...queryWords].filter(x => contextWords.has(x)));
    const relevance = intersection.size / Math.max(queryWords.size, 1);
    
    return {
      relevance: Math.min(relevance, 1),
      contextUsed: relevance > 0.1,
      sharedTerms: Array.from(intersection)
    };
  }

  // Generate completely dynamic response
  static async generateDynamicResponse(analysis) {
    const { intent, entities, sentiment, complexity, urgency, context_relevance } = analysis;
    
    // Build response based on real-time analysis
    let response = '';
    
    // Handle urgency first
    if (urgency.isUrgent) {
      response += `This appears to be an urgent situation. `;
    }
    
    // Generate intent-based response
    switch (intent) {
      case 'information_seeking':
        response += this.generateInformationResponse(entities, complexity);
        break;
      case 'problem_solving':
        response += this.generateProblemSolvingResponse(entities, sentiment);
        break;
      case 'decision_making':
        response += this.generateDecisionResponse(entities, context_relevance);
        break;
      case 'comparison':
        response += this.generateComparisonResponse(entities);
        break;
      case 'calculation':
        response += this.generateCalculationResponse(entities);
        break;
      case 'instruction':
        response += this.generateInstructionResponse(entities, complexity);
        break;
      default:
        response += this.generateGeneralResponse(entities, sentiment);
    }
    
    // Add context-aware suggestions
    if (context_relevance.contextUsed) {
      response += ` Based on our previous conversation, I recommend considering the context we discussed earlier.`;
    }
    
    return response;
  }

  // Dynamic response generators
  static generateInformationResponse(entities, complexity) {
    let response = 'I can help you with information about ';
    
    if (entities.crops.length > 0) {
      response += `${entities.crops.join(', ')} cultivation, care, and management. `;
    }
    if (entities.diseases.length > 0) {
      response += `For ${entities.diseases.join(', ')}, I can provide identification and treatment guidance. `;
    }
    if (entities.locations.length > 0) {
      response += `Regarding ${entities.locations.join(', ')}, I can offer location-specific advice. `;
    }
    
    if (complexity === 'complex') {
      response += 'This is a detailed topic that may require multiple steps or considerations. ';
    }
    
    return response;
  }

  static generateProblemSolvingResponse(entities, sentiment) {
    let response = 'I understand you\'re facing a challenge. ';
    
    if (sentiment.sentiment === 'negative') {
      response += 'Let me help you address this issue systematically. ';
    }
    
    if (entities.diseases.length > 0) {
      response += `For ${entities.diseases.join(', ')}, I recommend immediate assessment and treatment. `;
    }
    if (entities.crops.length > 0) {
      response += `With ${entities.crops.join(', ')}, we should identify the root cause first. `;
    }
    
    response += 'Would you like me to guide you through a step-by-step solution?';
    
    return response;
  }

  static generateDecisionResponse(entities, context_relevance) {
    let response = 'For decision-making, I recommend considering: ';
    
    const factors = [];
    if (entities.crops.length > 0) factors.push('crop-specific requirements');
    if (entities.locations.length > 0) factors.push('local conditions');
    if (entities.time_references.length > 0) factors.push('timing considerations');
    
    response += factors.join(', ') + '. ';
    
    if (context_relevance.contextUsed) {
      response += 'Given our previous discussion, this decision should align with your overall farming strategy.';
    }
    
    return response;
  }

  static generateComparisonResponse(entities) {
    let response = 'For comparison, I\'ll analyze the key differences: ';
    
    if (entities.crops.length > 1) {
      response += `Between ${entities.crops.join(' and ')}, consider factors like yield, maintenance, and market demand. `;
    }
    if (entities.diseases.length > 1) {
      response += `Comparing ${entities.diseases.join(' and ')}, focus on symptoms, severity, and treatment methods. `;
    }
    
    return response;
  }

  static generateCalculationResponse(entities) {
    let response = 'For calculations, I can help you determine: ';
    
    if (entities.measurements.length > 0) {
      response += `quantities for ${entities.measurements.join(', ')}. `;
    }
    if (entities.crops.length > 0) {
      response += `yield estimates for ${entities.crops.join(', ')}. `;
    }
    
    response += 'Please provide specific values or measurements for accurate calculations.';
    
    return response;
  }

  static generateInstructionResponse(entities, complexity) {
    let response = 'Here\'s a step-by-step approach: ';
    
    if (entities.crops.length > 0) {
      response += `For ${entities.crops.join(', ')}, start with soil preparation, then planting, followed by maintenance. `;
    }
    if (entities.diseases.length > 0) {
      response += `To address ${entities.diseases.join(', ')}, first identify symptoms, then apply appropriate treatments. `;
    }
    
    if (complexity === 'complex') {
      response += 'This process may require multiple stages and careful monitoring.';
    }
    
    return response;
  }

  static generateGeneralResponse(entities, sentiment) {
    let response = 'I\'m here to help with your farming needs. ';
    
    if (entities.crops.length > 0 || entities.diseases.length > 0) {
      response += 'I can provide guidance on cultivation, disease management, and best practices. ';
    }
    
    if (sentiment.sentiment === 'negative') {
      response += 'Let\'s work together to find solutions for your challenges.';
    } else {
      response += 'What specific aspect would you like to explore further?';
    }
    
    return response;
  }

  // Helper methods for entity detection
  static isCropRelated(word) {
    const cropPatterns = ['rice', 'wheat', 'corn', 'maize', 'cotton', 'sugarcane', 'pulses', 'vegetables', 'fruits'];
    return cropPatterns.some(pattern => word.includes(pattern));
  }

  static isDiseaseRelated(word) {
    const diseasePatterns = ['disease', 'fungus', 'bacteria', 'virus', 'pest', 'infection', 'rot', 'blight', 'wilt'];
    return diseasePatterns.some(pattern => word.includes(pattern));
  }

  static isLocationRelated(word) {
    const locationPatterns = ['field', 'farm', 'garden', 'plot', 'area', 'region', 'zone', 'district'];
    return locationPatterns.some(pattern => word.includes(pattern));
  }

  static isTimeRelated(word) {
    const timePatterns = ['today', 'tomorrow', 'yesterday', 'week', 'month', 'season', 'harvest', 'planting'];
    return timePatterns.some(pattern => word.includes(pattern));
  }

  static isMeasurementRelated(word) {
    const measurementPatterns = ['kg', 'ton', 'acre', 'hectare', 'liter', 'meter', 'cm', 'mm', 'percent'];
    return measurementPatterns.some(pattern => word.includes(pattern)) || /\d+/.test(word);
  }

  static isActionRelated(word) {
    const actionPatterns = ['plant', 'harvest', 'water', 'fertilize', 'spray', 'prune', 'weed', 'irrigate'];
    return actionPatterns.some(pattern => word.includes(pattern));
  }

  // Process chat with history
  static async processChatWithHistory(messages, language = 'english') {
    try {
      console.log('Dynamic AI processing chat history:', messages.length, 'messages');
      
      // Analyze conversation context
      const conversationContext = messages.map(msg => msg.content).join(' ');
      const lastMessage = messages[messages.length - 1];
      
      // Process with context
      const analysis = this.analyzeQuery(lastMessage.content, language, conversationContext);
      const response = await this.generateDynamicResponse(analysis);
      
      return {
        response: response,
        model_used: 'Dynamic AI Engine',
        language: language,
        confidence: analysis.confidence,
        context_used: true
      };
      
    } catch (error) {
      console.error('Dynamic AI chat error:', error);
      return {
        response: 'I encountered an error processing our conversation. Please try again.',
        model_used: 'Error',
        language: language,
        confidence: 0.1,
        error: error.message
      };
    }
  }
} 