import fs from 'fs';
import path from 'path';

// Crop Disease Knowledge Base - Empty for now
const cropDiseaseDatabase = {};

// Market Price Knowledge Base - Empty for now
const marketPriceDatabase = {};

// Government Schemes Database - Empty for now
const governmentSchemesDatabase = [];

export class CustomAIService {
  // Crop Disease Analysis
  static async analyzeCropDisease(imageBuffer, cropName, plantPart, language = 'Kannada') {
    try {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const cropKey = cropName.toLowerCase();
      const cropData = cropDiseaseDatabase[cropKey];
      
      if (!cropData) {
        return this.getDefaultResponse(language);
      }
      
      // Get the most common disease for this crop
      const diseaseKey = Object.keys(cropData)[0];
      const disease = cropData[diseaseKey];
      
      return {
        disease: {
          name: language === 'Kannada' ? disease.kannada_name : disease.name,
          confidence: disease.confidence,
          description: language === 'Kannada' ? disease.kannada_description || disease.description : disease.description
        },
        symptoms: language === 'Kannada' ? disease.kannada_symptoms : disease.symptoms,
        causes: disease.causes,
        remedies: disease.remedies.map(remedy => ({
          ...remedy,
          description: language === 'Kannada' ? remedy.kannada_description : remedy.description
        })),
        prevention: disease.prevention,
        severity: disease.severity
      };
    } catch (error) {
      console.error('Custom AI analysis error:', error);
      return this.getDefaultResponse(language);
    }
  }
  
  // Market Price Analysis
  static async analyzeMarketPrices(commodity, market, priceData, language = 'Kannada') {
    try {
      const commodityKey = commodity.toLowerCase();
      const marketData = marketPriceDatabase[commodityKey];
      
      if (!marketData) {
        return {
          current_price: 0,
          trend: 'unknown',
          forecast: 'Data not available',
          recommendations: []
        };
      }
      
      return {
        current_price: marketData.current_price,
        unit: marketData.unit,
        trend: language === 'Kannada' ? marketData.kannada_trend : marketData.trend,
        forecast: language === 'Kannada' ? marketData.kannada_forecast : marketData.forecast,
        recommendations: [
          language === 'Kannada' ? 'ಬೆಲೆಗಳನ್ನು ನಿಗದಿತವಾಗಿ ಪರಿಶೀಲಿಸಿ' : 'Monitor prices regularly',
          language === 'Kannada' ? 'ಸರಕುಗಳನ್ನು ಸರಿಯಾದ ಸಮಯದಲ್ಲಿ ಮಾರಾಟ ಮಾಡಿ' : 'Sell produce at optimal time'
        ]
      };
    } catch (error) {
      console.error('Market analysis error:', error);
      return {
        current_price: 0,
        trend: 'unknown',
        forecast: 'Analysis failed',
        recommendations: []
      };
    }
  }
  
  // Government Schemes Analysis
  static async analyzeGovernmentSchemes(query, farmerProfile, language = 'Kannada') {
    try {
      const relevantSchemes = governmentSchemesDatabase.filter(scheme => 
        query.toLowerCase().includes(scheme.name.toLowerCase()) ||
        query.toLowerCase().includes('scheme') ||
        query.toLowerCase().includes('benefit') ||
        query.toLowerCase().includes('subsidy')
      );
      
      if (relevantSchemes.length === 0) {
        return {
          schemes: governmentSchemesDatabase.map(scheme => ({
            name: language === 'Kannada' ? scheme.kannada_name : scheme.name,
            description: language === 'Kannada' ? scheme.kannada_description : scheme.description,
            eligibility: language === 'Kannada' ? scheme.kannada_eligibility : scheme.eligibility,
            benefits: language === 'Kannada' ? scheme.kannada_benefits : scheme.benefits,
            application_process: language === 'Kannada' ? scheme.kannada_application : scheme.application_process
          })),
          recommendations: [
            language === 'Kannada' ? 'ನಿಮ್ಮ ಅರ್ಹತೆಗೆ ತಕ್ಕ ಯೋಜನೆಗಳನ್ನು ಆಯ್ಕೆಮಾಡಿ' : 'Choose schemes based on your eligibility',
            language === 'Kannada' ? 'ಅರ್ಜಿ ಸಲ್ಲಿಸುವ ಮೊದಲು ಎಲ್ಲಾ ದಾಖಲೆಗಳನ್ನು ಸಿದ್ಧಪಡಿಸಿ' : 'Prepare all documents before applying'
          ]
        };
      }
      
      return {
        schemes: relevantSchemes.map(scheme => ({
          name: language === 'Kannada' ? scheme.kannada_name : scheme.name,
          description: language === 'Kannada' ? scheme.kannada_description : scheme.description,
          eligibility: language === 'Kannada' ? scheme.kannada_eligibility : scheme.eligibility,
          benefits: language === 'Kannada' ? scheme.kannada_benefits : scheme.benefits,
          application_process: language === 'Kannada' ? scheme.kannada_application : scheme.application_process
        })),
        recommendations: [
          language === 'Kannada' ? 'ಈ ಯೋಜನೆಗಳಿಗೆ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' : 'Apply for these schemes',
          language === 'Kannada' ? 'ಅಧಿಕೃತ ವೆಬ್ಸೈಟ್ ಮೂಲಕ ಅರ್ಜಿ ಸಲ್ಲಿಸಿ' : 'Apply through official website'
        ]
      };
    } catch (error) {
      console.error('Scheme analysis error:', error);
      return {
        schemes: [],
        recommendations: [language === 'Kannada' ? 'ಯೋಜನೆಗಳನ್ನು ಹುಡುಕಲು ಸಾಧ್ಯವಿಲ್ಲ' : 'Unable to find schemes']
      };
    }
  }
  
  // General Query Processing
  static async generalQuery(query, context, language = 'Kannada') {
    try {
      const queryLower = query.toLowerCase();
      
      // Pattern matching for different types of queries
      if (queryLower.includes('disease') || queryLower.includes('ರೋಗ')) {
        return {
          type: 'disease_info',
          response: language === 'Kannada' ? 
            'ಬೆಳೆ ರೋಗಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿಗಾಗಿ, ದಯವಿಟ್ಟು ಬೆಳೆ ಹೆಸರು ಮತ್ತು ಫೋಟೋ ಅಪ್ಲೋಡ್ ಮಾಡಿ' :
            'For crop disease information, please upload crop name and photo'
        };
      }
      
      if (queryLower.includes('price') || queryLower.includes('ಬೆಲೆ')) {
        return {
          type: 'price_info',
          response: language === 'Kannada' ? 
            'ಮಾರುಕಟ್ಟೆ ಬೆಲೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿಗಾಗಿ, ದಯವಿಟ್ಟು ಬೆಳೆ ಹೆಸರು ನಮೂದಿಸಿ' :
            'For market price information, please enter crop name'
        };
      }
      
      if (queryLower.includes('scheme') || queryLower.includes('ಯೋಜನೆ')) {
        return {
          type: 'scheme_info',
          response: language === 'Kannada' ? 
            'ಸರ್ಕಾರಿ ಯೋಜನೆಗಳ ಬಗ್ಗೆ ಮಾಹಿತಿಗಾಗಿ, ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ನಮೂದಿಸಿ' :
            'For government scheme information, please enter your question'
        };
      }
      
      // Default response
      return {
        type: 'general',
        response: language === 'Kannada' ? 
          'ನಿಮ್ಮ ಪ್ರಶ್ನೆಗೆ ಉತ್ತರಿಸಲು ನನಗೆ ಸಹಾಯ ಮಾಡಲು ಹೆಚ್ಚು ಮಾಹಿತಿ ಬೇಕು. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಪ್ರಶ್ನೆಯನ್ನು ಸ್ಪಷ್ಟವಾಗಿ ನಮೂದಿಸಿ.' :
          'I need more information to help answer your question. Please provide more details.'
      };
    } catch (error) {
      console.error('Query processing error:', error);
      return {
        type: 'error',
        response: language === 'Kannada' ? 
          'ಪ್ರಶ್ನೆಯನ್ನು ಸಂಸ್ಕರಿಸಲು ಸಾಧ್ಯವಿಲ್ಲ' :
          'Unable to process query'
      };
    }
  }
  
  // Default response for unknown crops/diseases
  static getDefaultResponse(language) {
    return {
      disease: {
        name: language === 'Kannada' ? 'ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ' : 'No Information Available',
        confidence: 0,
        description: language === 'Kannada' ? 
          'ಈ ಬೆಳೆಯ ಬಗ್ಗೆ ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ' :
          'No information available for this crop.'
      },
      symptoms: [],
      causes: [],
      remedies: [],
      prevention: [],
      severity: 'Unknown'
    };
  }
} 