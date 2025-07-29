import express from "express";
import {
  uploadDocument,
  getDocumentStatus,
  getUserDocuments,
  verifyDocument,
  deleteDocument,
  getAllDocuments,
  downloadDocument,
} from "../controllers/documentController.js";
import { authenticate } from "../middlewares/authmiddleware.js";
import { authorizeRoles } from "../middlewares/authorizeRoles.js";
import fileUpload from "express-fileupload";

const router = express.Router();

// Middleware for file upload
router.use(fileUpload({
  useTempFiles: true,
  tempFileDir: "/tmp/",
}));

// Protected routes
router.post("/upload", authenticate, uploadDocument);
router.get("/", authenticate, getUserDocuments);
router.get("/:id", authenticate, getDocumentStatus);
router.delete("/:id", authenticate, deleteDocument);
router.get("/download/:id", authenticate, downloadDocument);

// Admin routes
router.get("/admin", authenticate, authorizeRoles("Admin"), getAllDocuments);
router.post("/:id/verify", authenticate, authorizeRoles("Admin"), verifyDocument);

export default router; 