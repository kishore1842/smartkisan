import express from "express";
import { config } from "dotenv";
import cors from "cors"
import cookieParser from "cookie-parser";
import connect from "./database/db.js"
import { errorMiddleware } from "./middlewares/errorMiddlewares.js";
import { authenticate } from "./middlewares/authmiddleware.js";
import authRouter from "./routs/authrout.js";
import cropDiseaseRouter from "./routs/cropDiseaseRoute.js";
import marketPriceRouter from "./routs/marketPriceRoute.js";
import voiceAssistantRouter from "./routs/voiceAssistantRoute.js";
import documentRouter from "./routs/documentRoute.js";
import schemeRoute from './routs/schemeRoute.js';

export const app=express();
config({path:"./config/config.env"})

// CORS configuration
// IMPORTANT: Set FRONTEND_URL in your environment variables to your Netlify site URL for production
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE"],
}));

app.use(cookieParser());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({extended:true, limit: '50mb'}));

// Routes
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/crop-disease", cropDiseaseRouter);
app.use("/api/v1/market-prices", marketPriceRouter);
app.use("/api/v1/voice-assistant", voiceAssistantRouter);
app.use("/api/v1/documents", documentRouter);
app.use('/api/v1/schemes', schemeRoute);

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Project Kisan Server is running",
    timestamp: new Date().toISOString(),
    version: "1.0.0"
  });
});

// Test authentication endpoint
app.get("/api/v1/test-auth", authenticate, (req, res) => {
  res.status(200).json({
    success: true,
    message: "Authentication working",
    user: {
      id: req.user._id,
      name: req.user.firstName + ' ' + req.user.lastName,
      email: req.user.email,
      role: req.user.role
    }
  });
});

connect();
app.use(errorMiddleware);