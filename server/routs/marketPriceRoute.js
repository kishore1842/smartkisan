import express from "express";
import {
  getMarketPrices,
  getPriceAnalysis,
  fetchExternalPrices,
  getPriceTrends,
  getMarkets,
  getCommodities,
  getPriceAlerts,
  getStates,
  getPriceHistoryAndPrediction,
} from "../controllers/marketPriceController.js";
import { authenticate } from "../middlewares/authmiddleware.js";

const router = express.Router();

// Public routes (market data can be accessed without login)
router.get("/", getMarketPrices);
router.get("/markets", getMarkets);
router.get("/commodities", getCommodities);
router.get("/states", getStates);
router.get("/trends", getPriceTrends);
router.get("/history-and-prediction", getPriceHistoryAndPrediction);
router.get("/fetch-external", fetchExternalPrices);

// Protected routes
router.get("/analysis/:commodity/:market", authenticate, getPriceAnalysis);
router.post("/fetch-external", authenticate, fetchExternalPrices);
router.get("/alerts", authenticate, getPriceAlerts);

export default router; 