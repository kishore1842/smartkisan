import axios from 'axios';

// IMPORTANT: Set VITE_API_BASE_URL in your Netlify environment variables to your Render backend URL for production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('API Request:', config.method?.toUpperCase(), config.url, 'Token:', token ? 'Present' : 'Missing');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('API Error:', error.response?.status, error.config?.url, error.response?.data);
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post('/auth/register', userData),
  verifyOTP: (otpData) => api.post('/auth/verifyotp', otpData),
  login: (credentials) => api.post('/auth/login', credentials),
  logout: () => api.get('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
};

// Crop Disease API calls
export const cropDiseaseAPI = {
  diagnose: (formData) => api.post('/crop-disease/diagnose', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getHistory: (params) => api.get('/crop-disease/history', { params }),
  getDetails: (id) => api.get(`/crop-disease/${id}`),
  updateStatus: (id, data) => api.put(`/crop-disease/${id}/status`, data),
  getStats: () => api.get('/crop-disease/stats/overview'),
  getCommonDiseases: (cropName) => api.get(`/crop-disease/common/${cropName}`),
};

// Market Price API calls
export const marketPriceAPI = {
  getPrices: (params) => api.get('/market-prices', { params }),
  getAnalysis: (commodity, market) => api.get(`/market-prices/analysis/${commodity}/${market}`),
  getTrends: (params) => api.get('/market-prices/trends', { params }),
  getMarkets: (params) => api.get('/market-prices/markets', { params }),
  getCommodities: (params) => api.get('/market-prices/commodities', { params }),
  getAlerts: (params) => api.get('/market-prices/alerts', { params }),
  fetchExternal: (params) => api.post('/market-prices/fetch-external', params),
  getStates: () => api.get('/market-prices/states'),
  getHistoryAndPrediction: (params) => api.get('/market-prices/history-and-prediction', { params }),
};

// Voice Assistant API calls
export const voiceAssistantAPI = {
  // New proxy endpoints for FastAPI microservice
  chat: (data) => api.post('/voice-assistant/chat', data),
  speechToText: (formData) => api.post('/voice-assistant/speech-to-text', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  textToSpeech: (data) => api.post('/voice-assistant/text-to-speech', data, {
    responseType: 'blob' // For audio data
  }),
  // Gemini integration
  geminiQuery: (prompt) => api.post('/voice-assistant/gemini', { prompt })
};

// Government Schemes API calls
export const schemesAPI = {
  getAllSchemes: (params) => api.get('/schemes', { params }),
  getSchemeById: (id) => api.get(`/schemes/${id}`),
  getUserApplications: () => api.get('/schemes/applications'),
  applyForScheme: (schemeId, data) => api.post(`/schemes/${schemeId}/apply`, data),
  getApplicationStatus: (applicationId) => api.get(`/schemes/applications/${applicationId}`),
  updateApplication: (applicationId, data) => api.put(`/schemes/applications/${applicationId}`, data),
  deleteApplication: (applicationId) => api.delete(`/schemes/applications/${applicationId}`),
  searchSchemes: (query) => api.get('/schemes/search', { params: { q: query } }),
  getSchemesByCategory: (category) => api.get(`/schemes/category/${category}`),
};

// Documents API calls
export const documentAPI = {
  getUserDocuments: () => api.get('/documents'),
  uploadDocument: (formData) => api.post('/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDocumentById: (id) => api.get(`/documents/${id}`),
  updateDocument: (id, data) => api.put(`/documents/${id}`, data),
  deleteDocument: (id) => api.delete(`/documents/${id}`),
  verifyDocument: (id) => api.post(`/documents/${id}/verify`),
  getDocumentTypes: () => api.get('/documents/types'),
};

export default api; 