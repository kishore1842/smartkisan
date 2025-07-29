import express from "express";
import {
  diagnoseCropDisease,
  getDiseaseHistory,
  getDiseaseDetails,
  updateDiseaseStatus,
  getDiseaseStats,
  getCommonDiseasesByCrop,
} from "../controllers/cropDiseaseController.js";
import { authenticate } from "../middlewares/authmiddleware.js";
import fileUpload from "express-fileupload";

const router = express.Router();

// Middleware for file upload
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));

// Protected routes
router.post("/diagnose", authenticate, diagnoseCropDisease);
router.get("/history", authenticate, getDiseaseHistory);
router.get("/:id", authenticate, getDiseaseDetails);
router.put("/:id/status", authenticate, updateDiseaseStatus);
router.get("/stats/overview", authenticate, getDiseaseStats);
router.get("/common/:cropName", authenticate, getCommonDiseasesByCrop);

export default router; 