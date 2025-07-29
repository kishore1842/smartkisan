// Placeholder for voiceAssistantRoute.js
import express from 'express';
import { processVoiceQuery, processChatWithHistory, getNLPStatus, testNLPService } from '../controllers/voiceAssistantController.js';

const router = express.Router();

router.post('/voice-assistant', processVoiceQuery);
router.post('/chat-history', processChatWithHistory);
router.get('/nlp-status', getNLPStatus);
router.post('/test-nlp', testNLPService);

export default router; 