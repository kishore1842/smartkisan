import CropDisease from "../models/cropDiseaseModel.js";
import User from "../models/usermodels.js";
import { MLDiseaseService } from "../services/mlDiseaseService.js";
import { catchAsyncErrors } from "../middlewares/catchasyncerrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import fs from "fs";
import { getDataWithFallback } from "../services/fallbackService.js";
import { askGemini, GoogleAIService } from "../services/googleAIService.js";

// Diagnose crop disease (prompt + image + fallback)
export const diagnoseCropDisease = catchAsyncErrors(async (req, res, next) => {
  const { prompt, cropName: reqCropName, plantPart: reqPlantPart } = req.body;
  const userId = req.user._id;

  if (!prompt || typeof prompt !== "string" || prompt.trim().length < 5) {
    return next(
      new ErrorHandler(
        "Please provide a valid prompt describing the plant part and your request.",
        400
      )
    );
  }

  let imageBuffer = null;
  let plantPart = reqPlantPart || "leaf";
  let cropName = reqCropName || "Unknown";

  if (req.files?.image) {
    const uploadedFile = req.files.image;
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(uploadedFile.mimetype)) {
      return next(
        new ErrorHandler("Please upload a valid image file (JPEG, PNG, WebP)", 400)
      );
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (uploadedFile.size > maxSize) {
      return next(new ErrorHandler("Image size should be less than 5MB", 400));
    }

    imageBuffer = fs.readFileSync(uploadedFile.tempFilePath);
    fs.unlinkSync(uploadedFile.tempFilePath);
  }

  try {
    const user = await User.findById(userId);
    const language = user?.preferredLanguage || "Kannada";

    // 1. Image-based AI (Gemini Vision)
    if (imageBuffer) {
      try {
        const aiAnalysis = await GoogleAIService.analyzeCropDisease(
          imageBuffer,
          cropName,
          plantPart,
          language
        );
        if (aiAnalysis && (aiAnalysis.plant !== "Unknown" || aiAnalysis.disease !== "Unknown")) {
          return res.status(201).json({
            success: true,
            message: "Crop disease analysis completed (image)",
            data: { aiAnalysis },
            source: "image-ai",
          });
        }
      } catch (err) {
        console.warn("Gemini Vision failed, trying local ML...");
      }
    }

    // 2. Local ML (Prompt + Optional Image)
    try {
      const aiAnalysis = imageBuffer
        ? await MLDiseaseService.analyzePromptWithImage(prompt, imageBuffer, language)
        : await MLDiseaseService.analyzePrompt(prompt, language);

      if (aiAnalysis && (aiAnalysis.plant !== "Unknown" || aiAnalysis.disease !== "Unknown")) {
        return res.status(201).json({
          success: true,
          message: "Crop disease analysis completed (local)",
          data: { aiAnalysis },
          source: "local",
        });
      }
    } catch (err) {
      console.warn("Local ML failed, trying Gemini fallback...");
    }

    // 3. Fallback: Gemini text-based prompt
    const geminiResult = await getDataWithFallback({
      prompt,
      type: "crop-disease",
      dbQuery: {},
      externalApiUrl: "", // not required
      dbModel: CropDisease,
      minDbResults: 1,
      geminiFn: askGemini,
    });

    if (geminiResult.success && geminiResult.data) {
      let parsed = geminiResult.data;
      if (typeof parsed === "string") {
        try {
          parsed = JSON.parse(parsed);
        } catch {
          parsed = {
            plant: "Unknown",
            disease: "Unknown",
            cure: "No cure information available.",
            pro_tip: parsed,
          };
        }
      }

      return res.status(201).json({
        success: true,
        message: "Crop disease analysis completed (fallback)",
        data: { aiAnalysis: parsed },
        source: geminiResult.source || "fallback",
      });
    }

    // 4. Static Fallback (last resort)
    return res.status(200).json({
      success: true,
      message:
        "All AI services and fallbacks are currently unavailable. Please try again later.",
      data: {
        aiAnalysis: {
          plant: "Unknown",
          disease: "Unknown",
          cure: "No cure information available.",
          pro_tip: "No pro tip available.",
        },
      },
      source: "static",
    });
  } catch (error) {
    console.error("Diagnosis error:", error);
    return next(
      new ErrorHandler("Failed to analyze crop disease. Please try again.", 500)
    );
  }
});

// User's disease history
export const getDiseaseHistory = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;
  const { page = 1, limit = 10 } = req.query;

  const diseases = await CropDisease.find({ farmer: userId })
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);

  const count = await CropDisease.countDocuments({ farmer: userId });

  res.status(200).json({
    success: true,
    data: diseases,
    totalPages: Math.ceil(count / limit),
    currentPage: Number(page),
    totalDiseases: count,
  });
});

// Disease details
export const getDiseaseDetails = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const userId = req.user._id;

  const disease = await CropDisease.findOne({ _id: id, farmer: userId });
  if (!disease) {
    return next(new ErrorHandler("Disease record not found", 404));
  }

  res.status(200).json({
    success: true,
    data: disease,
  });
});

// Update status/follow-up
export const updateDiseaseStatus = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, followUp } = req.body;
  const userId = req.user._id;

  const disease = await CropDisease.findOneAndUpdate(
    { _id: id, farmer: userId },
    { status, followUp },
    { new: true }
  );

  if (!disease) {
    return next(new ErrorHandler("Disease record not found", 404));
  }

  res.status(200).json({
    success: true,
    message: "Disease status updated",
    data: disease,
  });
});

// Disease stats for user
export const getDiseaseStats = catchAsyncErrors(async (req, res, next) => {
  const userId = req.user._id;

  const stats = await CropDisease.aggregate([
    { $match: { farmer: userId } },
    {
      $group: {
        _id: "$aiAnalysis.disease.name",
        count: { $sum: 1 },
        avgConfidence: { $avg: "$aiAnalysis.disease.confidence" },
        severityCount: { $push: "$aiAnalysis.severity" },
      },
    },
    { $sort: { count: -1 } },
  ]);

  const totalDiseases = await CropDisease.countDocuments({ farmer: userId });
  const recentDiseases = await CropDisease.find({ farmer: userId })
    .sort({ createdAt: -1 })
    .limit(5);

  res.status(200).json({
    success: true,
    data: {
      stats,
      totalDiseases,
      recentDiseases,
    },
  });
});

// Common diseases by crop
export const getCommonDiseasesByCrop = catchAsyncErrors(async (req, res, next) => {
  const { cropName } = req.params;

  const diseases = await CropDisease.aggregate([
    { $match: { cropName: { $regex: cropName, $options: "i" } } },
    {
      $group: {
        _id: "$aiAnalysis.disease.name",
        count: { $sum: 1 },
        avgConfidence: { $avg: "$aiAnalysis.disease.confidence" },
        severity: { $first: "$aiAnalysis.severity" },
      },
    },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  res.status(200).json({
    success: true,
    data: diseases,
  });
});
