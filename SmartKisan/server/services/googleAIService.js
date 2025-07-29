import { VertexAI } from '@google-cloud/vertexai';
import speech from '@google-cloud/speech';
import textToSpeech from '@google-cloud/text-to-speech';
import { Storage } from '@google-cloud/storage';
import axios from 'axios';

// Debug: Print all Gemini keys at module load time
console.log('ENV KEYS:',
  '1:', process.env.GEMINI_KEY_1,
  '2:', process.env.GEMINI_KEY_2,
  '3:', process.env.GEMINI_KEY_3,
  '4:', process.env.GEMINI_KEY_4,
  '5:', process.env.GEMINI_KEY_5,
  '6:', process.env.GEMINI_KEY_6,
  '7:', process.env.GEMINI_KEY_7
);

// Initialize Google Cloud services
let vertexAI, geminiModel, geminiVisionModel, speechClient, ttsClient, storage;

// Check if Google Cloud is configured
const isGoogleCloudConfigured = process.env.GOOGLE_CLOUD_PROJECT_ID && 
                               process.env.GOOGLE_CLOUD_PROJECT_ID !== 'your-google-cloud-project-id';

if (isGoogleCloudConfigured) {
  vertexAI = new VertexAI({
    project: process.env.GOOGLE_CLOUD_PROJECT_ID,
    location: process.env.GOOGLE_CLOUD_LOCATION || 'us-central1',
  });

  // Gemini model for text generation
  geminiModel = vertexAI.preview.getGenerativeModel({
    model: 'gemini-pro',
  });

  // Gemini Vision model for image analysis
  geminiVisionModel = vertexAI.preview.getGenerativeModel({
    model: 'gemini-pro-vision',
  });

  speechClient = new speech.SpeechClient();
  ttsClient = new textToSpeech.TextToSpeechClient();
  storage = new Storage();
}

// Remove mock AI responses - use actual Google AI or return empty responses
const getEmptyCropDiseaseResponse = () => {
  return {
    disease: {
      name: "Unknown",
      confidence: 0,
      description: "No disease information available"
    },
    symptoms: [],
    causes: [],
    remedies: [],
    prevention: [],
    severity: "Unknown"
  };
};

// Enhanced Gemini API configuration with all 7 keys
const API_KEYS = [
  process.env.GEMINI_KEY_1 || "AIzaSyDjkzsTy6cxG25rsy7RQNdlgq-gvSekCG0",
  process.env.GEMINI_KEY_2 || "AIzaSyBeMJ9ZH-jZQgvL40HiiySfo24na7zlfKY", 
  process.env.GEMINI_KEY_3 || "AIzaSyC3crJtP38l9oblrEPd6rzKX96DYDuBS3o",
  process.env.GEMINI_KEY_4 || "AIzaSyD2ak5rmAlu5DKDohgQ_Mz9zfCD6TLiv-U",
  process.env.GEMINI_KEY_5 || "AIzaSyBKowBO6qabm3hR6awwCp-D5lI-LrXCICQ",
  process.env.GEMINI_KEY_6 || "AIzaSyCVuzM-5PLXO6Am1d_fqPf8APVFxNkbokY",
  process.env.GEMINI_KEY_7 || "AIzaSyCMJtQpYtwg5HTB2Ij5rR7UObg2HllldRs",
  process.env.GEMINI_KEY_8 || "AIzaSyCexUJkufEU7iPmKHNpv67UhMNPY88R_Yc"
].filter(Boolean);

console.log('Loaded Gemini API keys:', API_KEYS.map((k, i) => `#${i+1}: ${k ? k.slice(0, 10) + '...' : 'undefined'}`));
const MODEL = "gemini-1.5-flash";

// Key rotation and rate limit tracking
let currentKeyIndex = 0;
const keyUsageStats = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 15; // Conservative limit per key

// Initialize key usage tracking
API_KEYS.forEach((_, index) => {
  keyUsageStats.set(index, {
    requests: 0,
    lastReset: Date.now(),
    errors: 0,
    lastError: null
  });
});

/**
 * Get next available API key with intelligent rotation
 */
function getNextAvailableKey() {
  const now = Date.now();
  
  // Reset counters if window has passed
  for (let i = 0; i < API_KEYS.length; i++) {
    const stats = keyUsageStats.get(i);
    if (now - stats.lastReset > RATE_LIMIT_WINDOW) {
      stats.requests = 0;
      stats.lastReset = now;
    }
  }
  
  // Find key with lowest usage and no recent errors
  let bestKeyIndex = 0;
  let bestScore = -1;
  
  for (let i = 0; i < API_KEYS.length; i++) {
    const stats = keyUsageStats.get(i);
    const timeSinceLastError = stats.lastError ? now - stats.lastError : Infinity;
    const score = (MAX_REQUESTS_PER_MINUTE - stats.requests) + (timeSinceLastError > 30000 ? 10 : 0);
    
    if (score > bestScore) {
      bestScore = score;
      bestKeyIndex = i;
    }
  }
  
  return bestKeyIndex;
}

/**
 * Update key usage statistics
 */
function updateKeyStats(keyIndex, success, error = null) {
  const stats = keyUsageStats.get(keyIndex);
  if (success) {
    stats.requests++;
  } else {
    stats.errors++;
    stats.lastError = Date.now();
  }
}

/**
 * Enhanced Gemini API call with intelligent fallback
 */
export async function askGeminiWithIntelligentFallback(prompt, model = MODEL, maxRetries = 3) {
  let lastError;
  let attempts = 0;
  
  while (attempts < maxRetries) {
    const keyIndex = getNextAvailableKey();
    const key = API_KEYS[keyIndex];
    
    console.log(`[Gemini] Attempt ${attempts + 1}: Using API key #${keyIndex + 1} (${key.slice(0, 10)}...)`);
    
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`;
    
    try {
      const response = await axios.post(endpoint, {
        contents: [{ role: 'user', parts: [{ text: prompt }] }]
      }, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const text = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (text.trim()) {
        updateKeyStats(keyIndex, true);
        console.log(`[Gemini] Success with key #${keyIndex + 1}`);
        return { text, usedKey: keyIndex + 1 };
      } else {
        throw new Error('Empty response from Gemini');
      }
      
    } catch (error) {
      lastError = error;
      updateKeyStats(keyIndex, false, error);
      
      console.error(`[Gemini] Key #${keyIndex + 1} failed:`, error.response?.status, error.response?.statusText);
      
      // If it's a rate limit error, mark this key as temporarily unavailable
      if (error.response?.status === 429) {
        console.log(`[Gemini] Key #${keyIndex + 1} rate limited, will retry with different key`);
        // Don't increment attempts for rate limit errors
        continue;
      }
      
      // For other errors, increment attempts
      attempts++;
      
      // If we've tried all keys, wait a bit before retrying
      if (attempts >= API_KEYS.length) {
        console.log('[Gemini] All keys tried, waiting 2 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts = 0; // Reset attempts for next round
      }
    }
  }
  
  throw new Error(`All Gemini API keys failed after ${maxRetries} retries. Last error: ${lastError?.message || 'Unknown error'}`);
}

// Update askGemini to use intelligent fallback
export async function askGemini(prompt, model = MODEL) {
  try {
    const result = await askGeminiWithIntelligentFallback(prompt, model);
    return result.text;
  } catch (error) {
    console.error('[Gemini] All fallbacks failed:', error.message);
    throw error;
  }
}

export class GoogleAIService {
  // Enhanced Crop Disease Diagnosis with intelligent key rotation
  static async analyzeCropDisease(imageBuffer, cropName, plantPart, language = 'English') {
    try {
      // Convert image to base64
      const base64Image = imageBuffer.toString('base64');
      
      // Compose prompt
      const prompt = `You are an expert plant pathologist. Analyze the following image (base64 encoded) which shows the ${plantPart.toLowerCase()} of a plant. Your task is to:
1. Identify the plant species (name).
2. Detect and name any disease or abnormality present (if healthy, say 'Healthy').
3. Provide a detailed, practical cure or treatment plan (step-by-step).
4. Give a pro tip for maintaining this crop and preventing future issues.

Respond ONLY in valid JSON in this format:
{
  "plant": "Plant name (e.g., Tomato, Mango, Wheat, etc.)",
  "disease": "Disease name or 'Healthy'",
  "cure": "Step-by-step cure or treatment plan",
  "pro_tip": "Short, actionable tip for the farmer"
}

Image (base64): ${base64Image}`;

      // Use intelligent fallback system
      const result = await askGeminiWithIntelligentFallback(prompt);
      
      // Parse the response
      let analysis;
      try {
        const match = result.text.match(/\{[\s\S]*\}/);
        analysis = match ? JSON.parse(match[0]) : {};
      } catch (parseError) {
        console.warn('[Gemini] Failed to parse JSON response:', parseError.message);
        analysis = {};
      }
      
      // Fill missing fields with defaults
      return {
        plant: analysis.plant || cropName || 'Unknown',
        disease: analysis.disease || 'Unknown',
        cure: analysis.cure || 'No cure information available.',
        pro_tip: analysis.pro_tip || 'No pro tip available.'
      };
      
    } catch (error) {
      console.error('Crop disease analysis error:', error);
      
      // Return a helpful fallback response
      return {
        plant: cropName || 'Unknown',
        disease: 'Analysis temporarily unavailable',
        cure: 'Please try again in a few minutes or consult a local agricultural expert.',
        pro_tip: 'For immediate assistance, contact your local agricultural extension office.'
      };
    }
  }

  // Market Price Analysis using Gemini
  static async analyzeMarketPrices(commodity, market, priceData, language = 'Kannada') {
    try {
      const prompt = `You are a market analyst specializing in Indian agricultural markets.
      
      Analyze the following market data for ${commodity} in ${market}:
      - Current prices: Min: ₹${priceData.minPrice}, Max: ₹${priceData.maxPrice}, Modal: ₹${priceData.modalPrice}
      - Arrival quantity: ${priceData.arrivalQuantity} quintals
      
      Provide:
      1. Market trend analysis
      2. Price prediction for next week and month
      3. Factors affecting prices
      4. Recommendations for farmers
      5. Best time to sell
      
      Respond in ${language} language. Be practical and actionable.
      
      Format as JSON:
      {
        "summary": "market summary",
        "trend": {
          "direction": "Rising/Falling/Stable",
          "percentage": 5.2,
          "prediction": {
            "nextWeek": 2500,
            "nextMonth": 2800
          }
        },
        "factors": ["factor1", "factor2"],
        "recommendations": ["rec1", "rec2"],
        "bestTimeToSell": "recommendation"
      }`;

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Market analysis error:', error);
      throw new Error('Failed to analyze market prices');
    }
  }

  // Government Scheme Analysis
  static async analyzeGovernmentSchemes(query, farmerProfile, language = 'Kannada') {
    try {
      const prompt = `You are an expert on Indian government agricultural schemes and subsidies.
      
      Farmer Profile:
      - Location: ${farmerProfile.location.state}, ${farmerProfile.location.district}
      - Farm size: ${farmerProfile.farmDetails.totalArea} acres
      - Irrigation: ${farmerProfile.farmDetails.irrigationType}
      - Soil type: ${farmerProfile.farmDetails.soilType}
      
      Query: ${query}
      
      Provide:
      1. Relevant government schemes
      2. Eligibility criteria
      3. Application process
      4. Subsidy amounts
      5. Contact information
      6. Required documents
      
      Respond in ${language} language. Be specific to the farmer's location and profile.
      
      Format as JSON:
      {
        "schemes": [
          {
            "name": "scheme name",
            "description": "description",
            "eligibility": ["criteria1", "criteria2"],
            "subsidy": "amount details",
            "application": "process",
            "documents": ["doc1", "doc2"],
            "contact": "contact info",
            "deadline": "if applicable"
          }
        ],
        "summary": "overall summary"
      }`;

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return JSON.parse(text);
    } catch (error) {
      console.error('Scheme analysis error:', error);
      throw new Error('Failed to analyze government schemes');
    }
  }

  // Speech-to-Text conversion
  static async speechToText(audioBuffer, language = 'kn-IN') {
    try {
      const audio = {
        content: audioBuffer.toString('base64'),
      };
      
      const config = {
        encoding: 'LINEAR16',
        sampleRateHertz: 16000,
        languageCode: language,
        alternativeLanguageCodes: ['en-IN', 'hi-IN', 'te-IN'],
      };
      
      const request = {
        audio: audio,
        config: config,
      };

      const [response] = await speechClient.recognize(request);
      const transcription = response.results
        .map(result => result.alternatives[0].transcript)
        .join('\n');

      return transcription;
    } catch (error) {
      console.error('Speech-to-text error:', error);
      throw new Error('Failed to convert speech to text');
    }
  }

  // Text-to-Speech conversion
  static async textToSpeech(text, language = 'kn-IN', voice = 'kn-IN-Standard-A') {
    try {
      const request = {
        input: { text: text },
        voice: {
          languageCode: language,
          name: voice,
        },
        audioConfig: { audioEncoding: 'MP3' },
      };

      const [response] = await ttsClient.synthesizeSpeech(request);
      return response.audioContent;
    } catch (error) {
      console.error('Text-to-speech error:', error);
      throw new Error('Failed to convert text to speech');
    }
  }

  // General AI Assistant
  static async generalQuery(query, context, language = 'Kannada') {
    try {
      const prompt = `You are Kisan, an AI assistant for Indian farmers. 
      
      Context: ${context}
      Query: ${query}
      
      Provide helpful, practical advice in ${language} language. 
      Focus on Indian agriculture, local practices, and farmer-friendly solutions.
      
      Keep responses concise but informative.`;

      const result = await geminiModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('General query error:', error);
      throw new Error('Failed to process query');
    }
  }

  // Upload image to Google Cloud Storage
  static async uploadImage(imageBuffer, fileName) {
    try {
      const bucketName = process.env.GOOGLE_CLOUD_STORAGE_BUCKET;
      const bucket = storage.bucket(bucketName);
      const file = bucket.file(`crop-images/${fileName}`);

      await file.save(imageBuffer, {
        metadata: {
          contentType: 'image/jpeg',
        },
      });

      const publicUrl = `https://storage.googleapis.com/${bucketName}/crop-images/${fileName}`;
      return publicUrl;
    } catch (error) {
      console.error('Image upload error:', error);
      throw new Error('Failed to upload image');
    }
  }
}

export default GoogleAIService; 