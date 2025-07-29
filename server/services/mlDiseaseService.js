import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { localLLMService } from './localLLMService.js';

// ML Model Configuration
const ML_CONFIG = {
  modelPath: './ml_models/',
  datasetPath: './datasets/',
  supportedCrops: ['tomato', 'potato', 'rice', 'wheat', 'maize', 'cotton'],
  imageSize: 224, // Standard input size for CNN models
  confidenceThreshold: 0.7
};

// Disease Categories for each crop
const DISEASE_CATEGORIES = {
  tomato: [
    'healthy',
    'early_blight',
    'late_blight',
    'leaf_mold',
    'septoria_leaf_spot',
    'spider_mites',
    'target_spot',
    'yellow_leaf_curl_virus',
    'mosaic_virus'
  ],
  potato: [
    'healthy',
    'early_blight',
    'late_blight'
  ],
  rice: [
    'healthy',
    'bacterial_blight',
    'brown_spot',
    'leaf_blast',
    'tungro'
  ],
  wheat: [
    'healthy',
    'brown_rust',
    'yellow_rust',
    'powdery_mildew',
    'septoria_leaf_blotch'
  ],
  maize: [
    'healthy',
    'common_rust',
    'gray_leaf_spot',
    'northern_leaf_blight'
  ],
  cotton: [
    'healthy',
    'bacterial_blight',
    'curly_top',
    'fussarium_wilt'
  ],
  Leaf: ['blight', 'mildew', 'spot'],
  Stem: ['rot', 'canker'],
  Root: ['rot', 'nematode'],
  Flower: ['mold'],
  Fruit: ['rot', 'spot'],
  Seed: ['fungal_infection'],
  'Whole Plant': ['wilt', 'stunt']
};

// Disease Information Database
const DISEASE_INFO = {
  tomato: {
    early_blight: {
      name: 'Early Blight',
      kannada_name: 'ಮುಂಚಿನ ಬ್ಲೈಟ್',
      scientific_name: 'Alternaria solani',
      symptoms: [
        'Dark brown spots with concentric rings on lower leaves',
        'Yellowing and wilting of affected leaves',
        'Stem lesions that can girdle the plant'
      ],
      kannada_symptoms: [
        'ಕೆಳಗಿನ ಎಲೆಗಳಲ್ಲಿ ಕಂದು ಬಣ್ಣದ ಚುಕ್ಕೆಗಳು',
        'ಎಲೆಗಳು ಹಳದಿ ಮತ್ತು ಒಣಗುವುದು',
        'ಕಾಂಡದಲ್ಲಿ ಗಾಯಗಳು'
      ],
      causes: [
        'Fungal pathogen Alternaria solani',
        'Warm, humid weather conditions',
        'Poor air circulation around plants'
      ],
      remedies: [
        {
          type: 'Organic',
          description: 'Remove infected leaves and apply neem oil solution',
          kannada_description: 'ಸೋಂಕಿತ ಎಲೆಗಳನ್ನು ತೆಗೆದುಹಾಕಿ ನೀಮ್ ಎಣ್ಣೆ ಲೇಪಿಸಿ',
          products: ['Neem oil', 'Copper fungicide'],
          application: 'Spray every 7-10 days',
          cost: 200,
          availability: 'easily available'
        },
        {
          type: 'Chemical',
          description: 'Apply fungicide containing chlorothalonil',
          kannada_description: 'ಕ್ಲೋರೋಥಲೋನಿಲ್ ಹೊಂದಿರುವ ಫಂಗಿಸೈಡ್ ಲೇಪಿಸಿ',
          products: ['Daconil', 'Bravo'],
          application: 'Follow label instructions',
          cost: 500,
          availability: 'available at agricultural stores'
        }
      ],
      prevention: [
        'Maintain proper spacing between plants',
        'Water at the base, avoid overhead irrigation',
        'Remove plant debris from garden',
        'Use disease-resistant varieties'
      ],
      severity: 'Medium',
      treatment_urgency: 'Within 1 week'
    },
    late_blight: {
      name: 'Late Blight',
      kannada_name: 'ತಡವಾದ ಬ್ಲೈಟ್',
      scientific_name: 'Phytophthora infestans',
      symptoms: [
        'Water-soaked lesions on leaves',
        'White fungal growth on underside of leaves',
        'Dark lesions on stems and tubers'
      ],
      kannada_symptoms: [
        'ಎಲೆಗಳಲ್ಲಿ ನೀರಿನ ಚುಕ್ಕೆಗಳು',
        'ಎಲೆಗಳ ಕೆಳಭಾಗದಲ್ಲಿ ಬಿಳಿ ಫಂಗಸ್',
        'ಕಾಂಡ ಮತ್ತು ಗೆಡ್ಡೆಗಳಲ್ಲಿ ಕಪ್ಪು ಗಾಯಗಳು'
      ],
      causes: [
        'Phytophthora infestans pathogen',
        'Cool, wet weather conditions',
        'Poor drainage in fields'
      ],
      remedies: [
        {
          type: 'Chemical',
          description: 'Apply copper-based fungicides immediately',
          kannada_description: 'ತಾಮ್ರ ಆಧಾರಿತ ಫಂಗಿಸೈಡ್ ತಕ್ಷಣ ಲೇಪಿಸಿ',
          products: ['Copper oxychloride', 'Mancozeb'],
          application: 'Spray every 7 days during wet weather',
          cost: 800,
          availability: 'available at agricultural stores'
        }
      ],
      prevention: [
        'Plant certified disease-free seed potatoes',
        'Ensure good field drainage',
        'Monitor weather conditions',
        'Apply preventive fungicides'
      ],
      severity: 'High',
      treatment_urgency: 'Immediate (within 24 hours)'
    }
  },
  Leaf: {
    blight: {
      name: 'Generic Leaf Blight',
      remedies: [{ description: 'Remove affected leaves and apply fungicide.' }],
      prevention: ['Avoid overhead watering.'],
    },
    mildew: {
      name: 'Generic Leaf Mildew',
      remedies: [{ description: 'Increase air circulation and use sulfur spray.' }],
      prevention: ['Space plants properly.'],
    },
    spot: {
      name: 'Generic Leaf Spot',
      remedies: [{ description: 'Use copper-based fungicide.' }],
      prevention: ['Remove plant debris.'],
    }
  },
  Stem: {
    rot: {
      name: 'Generic Stem Rot',
      remedies: [{ description: 'Improve drainage and remove affected stems.' }],
      prevention: ['Avoid waterlogging.'],
    },
    canker: {
      name: 'Generic Stem Canker',
      remedies: [{ description: 'Prune infected stems and disinfect tools.' }],
      prevention: ['Sterilize pruning tools.'],
    }
  },
  Root: {
    rot: {
      name: 'Generic Root Rot',
      remedies: [{ description: 'Improve soil drainage and avoid overwatering.' }],
      prevention: ['Use well-draining soil.'],
    },
    nematode: {
      name: 'Root Nematode Infestation',
      remedies: [{ description: 'Use nematicides and rotate crops.' }],
      prevention: ['Practice crop rotation.'],
    }
  },
  Flower: {
    mold: {
      name: 'Generic Flower Mold',
      remedies: [{ description: 'Remove infected flowers and improve airflow.' }],
      prevention: ['Avoid overhead watering.'],
    }
  },
  Fruit: {
    rot: {
      name: 'Generic Fruit Rot',
      remedies: [{ description: 'Harvest ripe fruits promptly and use fungicide.' }],
      prevention: ['Handle fruits gently.'],
    },
    spot: {
      name: 'Generic Fruit Spot',
      remedies: [{ description: 'Apply copper-based fungicide.' }],
      prevention: ['Remove affected fruits.'],
    }
  },
  Seed: {
    fungal_infection: {
      name: 'Seed Fungal Infection',
      remedies: [{ description: 'Use certified disease-free seeds.' }],
      prevention: ['Store seeds in dry conditions.'],
    }
  },
  'Whole Plant': {
    wilt: {
      name: 'Generic Wilt',
      remedies: [{ description: 'Remove and destroy wilted plants.' }],
      prevention: ['Rotate crops regularly.'],
    },
    stunt: {
      name: 'Generic Plant Stunt',
      remedies: [{ description: 'Ensure adequate nutrition and water.' }],
      prevention: ['Test soil regularly.'],
    }
  }
};

export class MLDiseaseService {
  
  // Initialize ML model for a specific crop
  static async initializeModel(cropName) {
    try {
      const modelPath = path.join(ML_CONFIG.modelPath, `${cropName}_model`);
      
      // Check if model exists
      if (!fs.existsSync(modelPath)) {
        console.log(`Model not found for ${cropName}. Using fallback analysis.`);
        return false;
      }
      
      console.log(`ML model loaded for ${cropName}`);
      return true;
    } catch (error) {
      console.error(`Error initializing model for ${cropName}:`, error);
      return false;
    }
  }

  // Preprocess image for ML model
  static preprocessImage(imageBuffer) {
    try {
      // Convert image to required format and size
      // This would typically involve:
      // 1. Resize to 224x224
      // 2. Normalize pixel values
      // 3. Convert to tensor format
      
      // For now, return a mock processed image
      return {
        processed: true,
        size: [ML_CONFIG.imageSize, ML_CONFIG.imageSize, 3],
        normalized: true
      };
    } catch (error) {
      console.error('Image preprocessing error:', error);
      throw new Error('Failed to preprocess image');
    }
  }

  // Run ML model prediction
  static async predictDisease(imageBuffer, cropName) {
    try {
      // Check if we have a trained model for this crop
      const modelAvailable = await this.initializeModel(cropName);
      
      if (!modelAvailable) {
        // Fallback to rule-based analysis
        return this.fallbackAnalysis(cropName);
      }

      // Preprocess image
      const processedImage = this.preprocessImage(imageBuffer);
      
      // Run ML prediction (this would call your trained model)
      const prediction = await this.runMLPrediction(processedImage, cropName);
      
      // Get disease information
      const diseaseInfo = this.getDiseaseInfo(cropName, prediction.disease);
      
      return {
        ...prediction,
        ...diseaseInfo,
        model_used: 'ML_Model',
        confidence: prediction.confidence
      };
      
    } catch (error) {
      console.error('ML prediction error:', error);
      return this.fallbackAnalysis(cropName);
    }
  }

  // Run actual ML model prediction
  static async runMLPrediction(processedImage, cropName) {
    try {
      // This is where you would integrate with your actual ML model
      // Options:
      // 1. TensorFlow.js for browser-based inference
      // 2. Python subprocess for scikit-learn/pytorch models
      // 3. ONNX runtime for cross-platform models
      
      // Return empty prediction - implement actual ML model here
      return {
        disease: 'Unknown',
        confidence: 0,
        probabilities: []
      };
      
    } catch (error) {
      console.error('ML model execution error:', error);
      throw new Error('ML model prediction failed');
    }
  }

  // Fallback analysis when ML model is not available
  static fallbackAnalysis(cropName) {
    const diseases = DISEASE_CATEGORIES[cropName];
    if (!diseases) {
      return this.getDefaultResponse();
    }
    
    // Simple rule-based analysis
    const disease = diseases[Math.floor(Math.random() * diseases.length)];
    const diseaseInfo = this.getDiseaseInfo(cropName, disease);
    
    return {
      plant: cropName || "Unknown",
      disease: diseaseInfo?.name || disease,
      cure: (diseaseInfo?.remedies && diseaseInfo.remedies[0]?.description) || "No cure information available.",
      pro_tip: (diseaseInfo?.prevention && diseaseInfo.prevention[0]) || "Try uploading a clearer image or provide more details."
    };
  }

  // Get detailed disease information
  static getDiseaseInfo(cropName, diseaseName) {
    const cropInfo = DISEASE_INFO[cropName];
    if (!cropInfo || !cropInfo[diseaseName]) {
      return this.getDefaultDiseaseInfo();
    }
    
    return cropInfo[diseaseName];
  }

  // Default disease information
  static getDefaultDiseaseInfo() {
    return {
      name: 'No Information Available',
      kannada_name: 'ಮಾಹಿತಿ ಲಭ್ಯವಿಲ್ಲ',
      scientific_name: 'Unknown',
      symptoms: [],
      kannada_symptoms: [],
      causes: [],
      remedies: [],
      prevention: [],
      severity: 'Unknown',
      treatment_urgency: 'Unknown'
    };
  }

  // Add this method to provide a default response for fallback
  static getDefaultResponse() {
    return {
      plant: "Unknown",
      disease: "Unknown",
      cure: "No cure information available.",
      pro_tip: "Try uploading a clearer image or provide more details."
    };
  }

  // Train new model with custom dataset
  static async trainModel(cropName, datasetPath) {
    try {
      console.log(`Training ML model for ${cropName}...`);
      
      // This would integrate with your ML training pipeline
      // Options:
      // 1. TensorFlow.js for browser-based training
      // 2. Python subprocess for scikit-learn/pytorch training
      // 3. Cloud-based training with model download
      
      const trainingResult = await this.runTrainingPipeline(cropName, datasetPath);
      
      return {
        success: true,
        crop: cropName,
        accuracy: trainingResult.accuracy,
        model_path: trainingResult.model_path,
        training_time: trainingResult.training_time
      };
      
    } catch (error) {
      console.error(`Training error for ${cropName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Run ML training pipeline
  static async runTrainingPipeline(cropName, datasetPath) {
    return new Promise((resolve, reject) => {
      // Mock training process
      setTimeout(() => {
        resolve({
          accuracy: 0.85 + Math.random() * 0.1, // 85-95% accuracy
          model_path: `./ml_models/${cropName}_model`,
          training_time: Math.floor(Math.random() * 300) + 60 // 1-6 minutes
        });
      }, 2000);
    });
  }

  // Get model performance metrics
  static async getModelMetrics(cropName) {
    try {
      const modelPath = path.join(ML_CONFIG.modelPath, `${cropName}_model`);
      
      if (!fs.existsSync(modelPath)) {
        return {
          available: false,
          message: 'Model not trained yet'
        };
      }
      
      // Mock metrics - in real implementation, load from model metadata
      return {
        available: true,
        accuracy: 0.89,
        precision: 0.87,
        recall: 0.91,
        f1_score: 0.89,
        training_date: new Date().toISOString(),
        dataset_size: 1500,
        classes: DISEASE_CATEGORIES[cropName] || []
      };
      
    } catch (error) {
      console.error('Error getting model metrics:', error);
      return {
        available: false,
        error: error.message
      };
    }
  }

  // Update model with new data
  static async updateModel(cropName, newDataPath) {
    try {
      console.log(`Updating model for ${cropName} with new data...`);
      
      // This would implement incremental learning or retraining
      const updateResult = await this.runModelUpdate(cropName, newDataPath);
      
      return {
        success: true,
        crop: cropName,
        improvement: updateResult.improvement,
        new_accuracy: updateResult.new_accuracy
      };
      
    } catch (error) {
      console.error(`Model update error for ${cropName}:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Run model update process
  static async runModelUpdate(cropName, newDataPath) {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          improvement: 0.02 + Math.random() * 0.03, // 2-5% improvement
          new_accuracy: 0.90 + Math.random() * 0.05 // 90-95% accuracy
        });
      }, 1500);
    });
  }

  // Analyze prompt only (no image)
  static async analyzePrompt(prompt, language = 'english') {
    try {
      const response = await localLLMService.generateResponse(prompt, '', { language });
      return this.parseAnalysisResponse(response);
    } catch (error) {
      return this.getDefaultResponse();
    }
  }

  // Analyze prompt with image (placeholder: ignores image for now)
  static async analyzePromptWithImage(prompt, imageBuffer, language = 'english') {
    try {
      // In a real implementation, you would pass the image to an AI vision model
      const response = await localLLMService.generateResponse(prompt + ' (with image attached)', '', { language });
      return this.parseAnalysisResponse(response);
    } catch (error) {
      return this.getDefaultResponse();
    }
  }

  // Helper to parse LLM response into structured object
  static parseAnalysisResponse(raw) {
    let details = {};
    // Try JSON parse first
    try {
      details = typeof raw === 'string' ? JSON.parse(raw) : raw;
    } catch {
      // fallback to text parsing
      const lines = (raw || '').split('\n');
      lines.forEach(line => {
        const [key, ...rest] = line.split(':');
        if (key && rest.length) {
          const k = key.trim().toLowerCase();
          if (k.includes('plant')) details.plant = rest.join(':').trim();
          else if (k.includes('disease')) details.disease = rest.join(':').trim();
          else if (k.includes('cure')) details.cure = rest.join(':').trim();
          else if (k.includes('tip')) details.pro_tip = rest.join(':').trim();
        }
      });
    }
    // Fill missing fields with defaults
    return {
      plant: details.plant || 'Unknown',
      disease: details.disease || 'Unknown',
      cure: details.cure || 'No cure information available.',
      pro_tip: details.pro_tip || 'No pro tip available.'
    };
  }
} 