import express from 'express';
import schemeController from '../controllers/schemeController.js';

const router = express.Router();

// Live Gemini-powered schemes endpoint
router.use('/', schemeController);

export default router; 