import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { cropDiseaseAPI } from '../services/api';
import { toast } from 'react-toastify';
import { 
  Camera, 
  Upload, 
  Leaf, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Shield,
  Zap,
  Target,
  Sparkles,
  Microscope,
  FileImage,
  Smartphone,
  Brain,
  TrendingUp,
  Award,
  ArrowRight,
  Play,
  Download,
  Share2,
  BookOpen,
  Lightbulb,
  X,
  Image as ImageIcon,
  AlertCircle,
  Info,
  Crown,
  Droplets,
  Thermometer,
  Sun,
  Wind
} from 'lucide-react';
import './CropDiseaseDiagnosis.css';

// Gemini API constants and helper with all 7 keys
const GEMINI_API_KEYS = [
  "AIzaSyDjkzsTy6cxG25rsy7RQNdlgq-gvSekCG0",
  "AIzaSyBeMJ9ZH-jZQgvL40HiiySfo24na7zlfKY",
  "AIzaSyC3crJtP38l9oblrEPd6rzKX96DYDuBS3o",
  "AIzaSyD2ak5rmAlu5DKDohgQ_Mz9zfCD6TLiv-U",
  "AIzaSyBKowBO6qabm3hR6awwCp-D5lI-LrXCICQ",
  "AIzaSyCVuzM-5PLXO6Am1d_fqPf8APVFxNkbokY",
  "AIzaSyCMJtQpYtwg5HTB2Ij5rR7UObg2HllldRs",
  "AIzaSyCexUJkufEU7iPmKHNpv67UhMNPY88R_Yc"
];
const GEMINI_MODEL = "gemini-1.5-flash";

// Key rotation tracking
let currentKeyIndex = 0;
const keyUsageStats = new Map();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_MINUTE = 15; // Conservative limit per key

// Initialize key usage tracking
GEMINI_API_KEYS.forEach((_, index) => {
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
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
    const stats = keyUsageStats.get(i);
    if (now - stats.lastReset > RATE_LIMIT_WINDOW) {
      stats.requests = 0;
      stats.lastReset = now;
    }
  }
  
  // Find key with lowest usage and no recent errors
  let bestKeyIndex = 0;
  let bestScore = -1;
  
  for (let i = 0; i < GEMINI_API_KEYS.length; i++) {
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
async function callGeminiWithIntelligentFallback(parts, maxRetries = 3) {
  let lastError;
  let attempts = 0;
  
  while (attempts < maxRetries) {
    const keyIndex = getNextAvailableKey();
    const key = GEMINI_API_KEYS[keyIndex];
    
    console.log(`[Frontend Gemini] Attempt ${attempts + 1}: Using API key #${keyIndex + 1}`);
    
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${key}`;
    
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts }] })
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      
      if (text.trim()) {
        updateKeyStats(keyIndex, true);
        console.log(`[Frontend Gemini] Success with key #${keyIndex + 1}`);
        return { text, usedKey: keyIndex + 1 };
      } else {
        throw new Error('Empty response from Gemini');
      }
      
    } catch (error) {
      lastError = error;
      updateKeyStats(keyIndex, false, error);
      
      console.error(`[Frontend Gemini] Key #${keyIndex + 1} failed:`, error.message);
      
      // If it's a rate limit error, mark this key as temporarily unavailable
      if (error.message.includes('429')) {
        console.log(`[Frontend Gemini] Key #${keyIndex + 1} rate limited, will retry with different key`);
        // Don't increment attempts for rate limit errors
        continue;
      }
      
      // For other errors, increment attempts
      attempts++;
      
      // If we've tried all keys, wait a bit before retrying
      if (attempts >= GEMINI_API_KEYS.length) {
        console.log('[Frontend Gemini] All keys tried, waiting 2 seconds before retry...');
        await new Promise(resolve => setTimeout(resolve, 2000));
        attempts = 0; // Reset attempts for next round
      }
    }
  }
  
  throw new Error(`All Gemini API keys failed after ${maxRetries} retries. Last error: ${lastError?.message || 'Unknown error'}`);
}

function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

const CropDiseaseDiagnosis = () => {
  const { isAuthenticated, user } = useAuth(); // Add user for personalization
  const [selectedImage, setSelectedImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [plantPart, setPlantPart] = useState('Leaf');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  const plantParts = [
    'Leaf', 'Stem', 'Root', 'Flower', 'Fruit', 'Seed', 'Whole Plant'
  ];

  const features = [];

  const recentDiagnoses = [];

  const weatherConditions = [];

  const validateAndSetImage = (file) => {
    if (!file) return false;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (JPEG, PNG, WebP)');
      return false;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size should be less than 5MB');
      return false;
    }

    setSelectedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setAnalysisResult(null);
    return true;
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    validateAndSetImage(file);
  };

  const handleDragOver = (event) => {
    event.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (event) => {
    event.preventDefault();
    setIsDragOver(false);
    
    const files = event.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      validateAndSetImage(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setShowCamera(true);
      }
    } catch (error) {
      toast.error('Unable to access camera. Please check permissions.');
      console.error('Camera error:', error);
    }
  };

  const captureImage = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext('2d');
      canvasRef.current.width = videoRef.current.videoWidth;
      canvasRef.current.height = videoRef.current.videoHeight;
      context.drawImage(videoRef.current, 0, 0);

      canvasRef.current.toBlob((blob) => {
        const file = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
        setSelectedImage(file);
        setPreviewUrl(URL.createObjectURL(blob));
        setShowCamera(false);
        setAnalysisResult(null);
        
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(track => track.stop());
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject;
      stream.getTracks().forEach(track => track.stop());
    }
    setShowCamera(false);
  };

  const handleDiagnosis = async () => {
    if (!selectedImage) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      toast.error('Please select an image');
      return;
    }

    setIsAnalyzing(true);
    setShowError(false);
    setShowSuccess(false);
    let aiAnalysis = null;
    let geminiFailed = false;
    try {
      // Build the improved prompt using the selected plant part
      const prompt = `You are an expert plant pathologist. Analyze the attached image, which shows the ${plantPart.toLowerCase()} of a crop. Your tasks are:\n\n1. Identify the plant species (give the most likely name, e.g., Tomato, Potato, etc.).\n2. Detect and name any disease or abnormality present (if healthy, say 'Healthy').\n3. Provide a detailed, practical cure or treatment plan (step-by-step, actionable for a farmer in India).\n4. Give one pro tip for maintaining this crop and preventing future issues.\n\nRespond ONLY in valid JSON in this format:\n{\n  \"plant\": \"Plant name (e.g., Tomato, Mango, Wheat, etc.)\",\n  \"disease\": \"Disease name or 'Healthy'\",\n  \"cure\": \"Step-by-step cure or treatment plan\",\n  \"pro_tip\": \"Short, actionable tip for the farmer\"\n}\n\nIf you are not confident or cannot identify, say 'Unknown' for each field. Do not guess. Focus on accuracy and clarity. The image is of the ${plantPart.toLowerCase()} of the plant.`;

      // 1. Try Gemini API first
      try {
        const base64 = await fileToBase64(selectedImage);
        const parts = [
          { text: prompt },
          {
            inlineData: {
              mimeType: selectedImage.type,
              data: base64.split(",")[1]
            }
          }
        ];
        const response = await callGeminiWithIntelligentFallback(parts);
        const text = response.text;
        let jsonStart = text.indexOf('{');
        let jsonEnd = text.lastIndexOf('}');
        if (jsonStart !== -1 && jsonEnd !== -1) {
          let jsonString = text.substring(jsonStart, jsonEnd + 1);
          try {
            aiAnalysis = JSON.parse(jsonString);
          } catch (parseErr) {
            aiAnalysis = null;
          }
        }
      } catch (err) {
        geminiFailed = true;
      }

      // 2. If Gemini fails, fallback to backend
      if (!aiAnalysis && geminiFailed) {
        try {
          const formData = new FormData();
          formData.append('prompt', prompt);
          formData.append('image', selectedImage);
          let response = await cropDiseaseAPI.diagnose(formData);
          aiAnalysis = response.data?.data?.aiAnalysis;
        } catch (error) {
          // If the main API fails, try backend fallback (same as voice assistant)
          try {
            const fallbackFormData = new FormData();
            fallbackFormData.append('file', selectedImage);
            fallbackFormData.append('prompt', prompt);
            const fallbackResponse = await fetch('/api/v1/voice-assistant/voice-assistant', {
              method: 'POST',
              body: fallbackFormData
            });
            const fallbackData = await fallbackResponse.json();
            if (fallbackResponse.ok && fallbackData.success && fallbackData.analysis) {
              aiAnalysis = fallbackData.analysis;
            } else {
              aiAnalysis = null;
            }
          } catch (fallbackError) {
            aiAnalysis = null;
          }
        }
      }

      if (aiAnalysis) {
        setAnalysisResult(aiAnalysis);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
        toast.success('Disease analysis completed successfully!');
      } else {
        setAnalysisResult({
          plant: 'Unknown',
          disease: 'Unknown',
          cure: 'No cure information available.',
          pro_tip: 'No pro tip available.'
        });
        setShowError(true);
        setTimeout(() => setShowError(false), 3000);
        toast.error('No analysis data received.');
      }
    } catch (error) {
      setShowError(true);
      setTimeout(() => setShowError(false), 3000);
      const errorMessage = error.response?.data?.message || 
                          error.message || 
                          'Failed to analyze disease. Please try again.';
      toast.error(errorMessage);
      console.error('Diagnosis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return 'disease-severity-low';
      case 'medium': return 'disease-severity-medium';
      case 'high': return 'disease-severity-high';
      case 'critical': return 'disease-severity-critical';
      default: return 'disease-severity-unknown';
    }
  };

  const getSeverityIcon = (severity) => {
    switch (severity?.toLowerCase()) {
      case 'low': return <CheckCircle className="disease-severity-icon" />;
      case 'medium': return <AlertTriangle className="disease-severity-icon" />;
      case 'high': return <AlertTriangle className="disease-severity-icon" />;
      case 'critical': return <AlertCircle className="disease-severity-icon" />;
      default: return <Info className="disease-severity-icon" />;
    }
  };

  const formatConfidence = (confidence) => {
    return Math.round(confidence || 0);
  };

  if (!isAuthenticated) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="disease-auth-required">
            <div className="disease-auth-icon">
              <Shield className="disease-auth-icon-svg" />
            </div>
            <h1 className="disease-auth-title">Authentication Required</h1>
            <p className="disease-auth-description">
              Please log in to access AI-powered crop disease diagnosis.
            </p>
            <button 
              className="btn btn-primary btn-lg"
              onClick={() => window.location.href = '/?showLogin=true'}
            >
              Sign In to Continue
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="crop-diagnosis-page-unique">
      {/* Animated Background with Floating Leaves */}
      <div className="diagnosis-animated-bg">
        <svg className="floating-leaf leaf1" width="60" height="60" viewBox="0 0 60 60"><ellipse cx="30" cy="30" rx="28" ry="14" fill="#a7f3d0" opacity="0.18"/></svg>
        <svg className="floating-leaf leaf2" width="40" height="40" viewBox="0 0 40 40"><ellipse cx="20" cy="20" rx="18" ry="8" fill="#bae6fd" opacity="0.15"/></svg>
        <svg className="floating-leaf leaf3" width="50" height="50" viewBox="0 0 50 50"><ellipse cx="25" cy="25" rx="22" ry="10" fill="#fef9c3" opacity="0.13"/></svg>
      </div>

      {/* Personalized Badge */}
      {isAuthenticated && (
        <div className="diagnosis-personalized-badge diagnosis-elevated">
          <span role="img" aria-label="user">🌱</span> Personalized for <b>{user?.name || 'You'}</b>
        </div>
      )}

      {/* Stepper/Progress Bar with Shadow */}
      <div className="diagnosis-stepper diagnosis-elevated">
        <div className="step active">1</div>
        <div className="step-line"></div>
        <div className={`step${selectedImage ? ' active' : ''}`}>2</div>
        <div className="step-line"></div>
        <div className={`step${analysisResult ? ' active' : ''}`}>3</div>
      </div>

      {/* Pro Tips Section */}
      <div className="diagnosis-pro-tips-unique">
        <div className="pro-tip-chip"><Camera className="pro-tip-icon" /> Take photos in good lighting for better accuracy</div>
        <div className="pro-tip-chip"><Target className="pro-tip-icon" /> Focus on the affected area of the plant</div>
        <div className="pro-tip-chip"><Clock className="pro-tip-icon" /> Check your crops regularly for early detection</div>
        <div className="pro-tip-chip"><Sparkles className="pro-tip-icon" /> Clean your camera lens for clearer images</div>
      </div>

      {/* Main Flex Row with fade-in */}
      <div className="diagnosis-main-flex-unique diagnosis-fadein">
        {/* Recent Diagnoses Timeline (larger) */}
        <div className="diagnosis-timeline-unique diagnosis-timeline-large">
          <h4>Recent Diagnoses</h4>
          <div className="diagnosis-timeline-list">
            {recentDiagnoses.map((d, idx) => (
              <div key={idx} className={`timeline-card timeline-${d.color}`}> 
                <div className="timeline-dot"></div>
                <div className="timeline-content">
                  <div className="timeline-crop">{d.crop}</div>
                  <div className="timeline-disease">{d.disease}</div>
                  <div className="timeline-confidence">
                    <span className="timeline-confidence-ring" style={{'--confidence': d.confidence}}></span>
                    {d.confidence}%
                  </div>
                  <div className="timeline-meta">{d.severity} • {d.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Upload Card with Unique Style (larger) */}
        <div className="diagnosis-upload-card-unique glassmorphic-card diagnosis-upload-large">
          <div className="diagnosis-upload-title">
            <ImageIcon /> Upload or Capture Image
          </div>
          <div className="diagnosis-upload-area-unique">
            {!previewUrl ? (
              <div
                className={`diagnosis-upload-circle${isDragOver ? ' dragover' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleUploadClick}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="diagnosis-file-input"
                />
                <div className="diagnosis-upload-svg-placeholder">
                  <ImageIcon className="diagnosis-upload-svg-icon" />
                </div>
                <div className="diagnosis-upload-text">
                  <h3>Drop image here or click to upload</h3>
                  <p>Supports JPEG, PNG, WebP (Max 5MB)</p>
                </div>
              </div>
            ) : (
              <div className="diagnosis-image-preview-frame">
                <img src={previewUrl} alt="Preview" className="diagnosis-preview-image-unique" />
                <button
                  onClick={e => { e.stopPropagation(); setSelectedImage(null); setPreviewUrl(null); }}
                  className="diagnosis-remove-image-btn"
                >
                  <X />
                </button>
              </div>
            )}
            <button type="button" className="diagnosis-take-photo-btn-unique" onClick={startCamera}>
              <Camera /> Take Photo
            </button>
          </div>
          {/* Crop Info Form */}
          <div className="diagnosis-crop-info-unique">
            <div className="diagnosis-crop-inputs-unique">
              <div className="diagnosis-input-group-unique">
                {/* <label>Plant Part</label> */}
                <select value={plantPart} onChange={e => setPlantPart(e.target.value)}>
                  {plantParts.map(part => (
                    <option key={part} value={part}>{part}</option>
                  ))}
                </select>
              </div>
            </div>
            <button
              onClick={handleDiagnosis}
              disabled={!selectedImage || isAnalyzing}
              className="diagnosis-analyze-btn-unique"
            >
              {isAnalyzing ? <><div className="spinner"></div>Analyzing...</> : <><Microscope /> Analyze Disease</>}
            </button>
          </div>
          {/* Fun Fact Card */}
          <div className="diagnosis-fun-fact-card">
            <Sparkles /> <b>Did you know?</b> Some crop diseases can be prevented by simple crop rotation!
          </div>
        </div>
      </div>

      {/* Results Section (modern, centered below upload) */}
      {analysisResult && (
        <div className="disease-results-section-modern">
          <div className="disease-results-card-modern">
            <h2 className="disease-results-title">
              <CheckCircle className="disease-results-title-icon" />
              Analysis Results
            </h2>
            <div className="disease-results-grid">
              <div className="disease-result-item">
                <Leaf className="disease-result-icon" />
                <div>
                  <div className="disease-result-label">Plant Type</div>
                  <div className="disease-result-value">{analysisResult.plant || '-'}</div>
                </div>
              </div>
              <div className="disease-result-item">
                <Microscope className="disease-result-icon" />
                <div>
                  <div className="disease-result-label">Disease</div>
                  <div className="disease-result-value">{analysisResult.disease || '-'}</div>
                </div>
              </div>
              <div className="disease-result-item">
                <Shield className="disease-result-icon" />
                <div>
                  <div className="disease-result-label">How to Cure</div>
                  <div className="disease-result-value">{analysisResult.cure || '-'}</div>
                </div>
              </div>
              <div className="disease-result-item">
                <Sparkles className="disease-result-icon" />
                <div>
                  <div className="disease-result-label">Pro Tip</div>
                  <div className="disease-result-value">{analysisResult.pro_tip || '-'}</div>
                </div>
              </div>
            </div>
            <div className="disease-result-actions-modern">
              <button className="btn btn-outline">
                <Download className="disease-action-icon" />
                Download Report
              </button>
              <button className="btn btn-outline">
                <Share2 className="disease-action-icon" />
                Share Results
              </button>
              <button className="btn btn-primary">
                <BookOpen className="disease-action-icon" />
                View Details
              </button>
            </div>
          </div>
        </div>
      )}

        {/* Camera Modal, Success/Error Notifications (unchanged) */}
        {showCamera && (
          <div className="disease-camera-modal">
            <div className="disease-camera-container">
              <div className="disease-camera-header">
                <h3 className="disease-camera-title">Take Photo</h3>
                <button onClick={stopCamera} className="disease-camera-close">
                  <X className="disease-camera-close-icon" />
                </button>
              </div>
              <div className="disease-camera-content">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="disease-camera-video"
                />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
                <div className="disease-camera-controls">
                  <button onClick={captureImage} className="btn btn-primary btn-lg">
                    <Camera className="disease-capture-icon" />
                    Capture
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Success/Error Notifications */}
        {showSuccess && (
          <div className="disease-notification disease-notification-success">
            <CheckCircle className="disease-notification-icon" />
            <span>Analysis completed successfully!</span>
          </div>
        )}

        {showError && (
          <div className="disease-notification disease-notification-error">
            <AlertCircle className="disease-notification-icon" />
            <span>Please select an image</span>
          </div>
        )}
    </div>
  );
};

export default CropDiseaseDiagnosis; 