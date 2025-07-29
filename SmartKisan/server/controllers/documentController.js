import Document from "../models/documentModel.js";
import { catchAsyncErrors } from "../middlewares/catchasyncerrors.js";
import ErrorHandler from "../middlewares/errorMiddlewares.js";
import { v2 as cloudinary } from "cloudinary";
import fs from 'fs';
import path from 'path';
import axios from 'axios';

// AI Document Processing (Mock implementation)
const processDocumentWithAI = async (documentId) => {
  try {
    const document = await Document.findById(documentId);
    if (!document) return;

    // Simulate AI processing
    document.status = "Processing";
    await document.save();

    // Simulate processing time
    setTimeout(async () => {
      // Return empty AI verification data
      document.aiVerification = {
        confidence: 0,
        extractedData: {},
        verificationResult: "Unknown",
        processingTime: 0,
      };

      document.status = "Unknown";
      await document.save();
    }, 3000); // Simulate 3-second processing time

  } catch (error) {
    console.error("AI processing error:", error);
  }
};

// Get document status
export const getDocumentStatus = catchAsyncErrors(async (req, res, next) => {
  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new ErrorHandler("Document not found", 404));
  }

  // Check if user owns this document or is admin
  if (document.user.toString() !== req.user._id.toString() && req.user.role !== "Admin") {
    return next(new ErrorHandler("Not authorized to view this document", 403));
  }

  res.status(200).json({
    success: true,
    document,
  });
});

// Get user's documents
export const getUserDocuments = catchAsyncErrors(async (req, res, next) => {
  const documents = await Document.find({ user: req.user._id })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    documents,
  });
});

// Verify document manually (Admin only)
export const verifyDocument = catchAsyncErrors(async (req, res, next) => {
  const { id } = req.params;
  const { status, remarks } = req.body;

  const document = await Document.findById(id);
  if (!document) {
    return next(new ErrorHandler("Document not found", 404));
  }

  document.status = status;
  document.manualVerification = {
    verifiedBy: req.user._id,
    verifiedAt: Date.now(),
    remarks,
  };

  if (status === "Rejected") {
    document.rejectionReason = remarks;
  }

  await document.save();

  res.status(200).json({
    success: true,
    message: "Document verification updated successfully",
    document,
  });
});

// Delete document
export const deleteDocument = catchAsyncErrors(async (req, res, next) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const document = await Document.findById(req.params.id);

  if (!document) {
    return next(new ErrorHandler("Document not found", 404));
  }

  // Check if user owns this document
  if (document.user.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Not authorized to delete this document", 403));
  }

  // Delete from Cloudinary
  if (document.documentImage.public_id) {
    await cloudinary.uploader.destroy(document.documentImage.public_id);
  }

  await Document.findByIdAndDelete(req.params.id);

  res.status(200).json({
    success: true,
    message: "Document deleted successfully",
  });
});

// Admin: Get all documents
export const getAllDocuments = catchAsyncErrors(async (req, res, next) => {
  const { page = 1, limit = 10, status, documentType } = req.query;
  
  const query = {};
  if (status) query.status = status;
  if (documentType) query.documentType = documentType;

  const documents = await Document.find(query)
    .populate("user", "name email")
    .limit(limit * 1)
    .skip((page - 1) * limit)
    .sort({ createdAt: -1 })
    .exec();

  const count = await Document.countDocuments(query);

  res.status(200).json({
    success: true,
    documents,
    totalPages: Math.ceil(count / limit),
    currentPage: page,
    totalDocuments: count,
  });
}); 

// Secure document download endpoint
export const downloadDocument = catchAsyncErrors(async (req, res, next) => {
  const document = await Document.findById(req.params.id);
  console.log("Download request for document:", document);
  if (!document || !document.documentImage || !document.documentImage.path) {
    console.error("Document not found or missing URL");
    return next(new ErrorHandler("Document not found", 404));
  }
  // Check accessibility before redirecting
  try {
    const head = await axios.head(document.documentImage.path);
    if (head.status >= 400) throw new Error("Inaccessible URL");
    console.log("✅ Valid Cloudinary URL:", document.documentImage.path);
    return res.redirect(document.documentImage.path);
  } catch (err) {
    console.error("❌ Cloudinary file missing or not public:", document.documentImage.path);
    return next(new ErrorHandler("File not found or is not public in Cloudinary.", 404));
  }
}); 

// Helper to upload from buffer
const uploadFromBuffer = (fileBuffer, userId, uniqueId) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: `user_documents/${userId}`,
        resource_type: 'auto',
        use_filename: true,
        unique_filename: false,
        public_id: uniqueId,
        type: 'upload', // ensures public upload
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    );
    stream.end(fileBuffer);
  });
};

export const uploadDocument = catchAsyncErrors(async (req, res, next) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log('Cloudinary Upload ENV:', process.env.CLOUDINARY_CLOUD_NAME, process.env.CLOUDINARY_API_KEY, process.env.CLOUDINARY_API_SECRET);

  const { documentType, documentNumber, expiryDate, issuedDate, issuingAuthority } = req.body;

  if (!req.files || !req.files.file) {
    return next(new ErrorHandler("Please upload a document file", 400));
  }

  const file = req.files.file;
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const uniqueId = `doc-${Date.now()}`;

  let cloudinaryResponse;
  try {
    cloudinaryResponse = await cloudinary.uploader.upload(file.tempFilePath, {
      folder: `user_documents/${req.user._id}`,
      resource_type: 'auto',
      use_filename: true,
      unique_filename: false,
      public_id: uniqueId,
      type: 'upload', // ensures public upload
    });
    console.log("Cloudinary Upload Response:", cloudinaryResponse);
    console.log("Cloudinary Uploaded File URL:", cloudinaryResponse.secure_url);
    // Check accessibility
    if (!cloudinaryResponse.secure_url || cloudinaryResponse.secure_url.includes("image/upload/")) {
      const testUrl = cloudinaryResponse.secure_url;
      const response = await axios.head(testUrl).catch(() => null);
      if (!response || response.status >= 400) {
        return next(new ErrorHandler("Uploaded file is not publicly accessible", 500));
      }
    }
  } catch (error) {
    console.error("cloudinary error", error);
    return next(new ErrorHandler("Failed to upload document", 500));
  }

  if (!cloudinaryResponse || cloudinaryResponse.error) {
    console.error("cloudinary error", cloudinaryResponse.error || "unknown cloudinary error");
    return next(new ErrorHandler("Failed to upload document", 500));
  }

  const document = await Document.create({
    user: req.user._id,
    documentType,
    fileType: fileExtension,
    documentNumber,
    documentImage: {
      path: cloudinaryResponse.secure_url,
      public_id: cloudinaryResponse.public_id,
    },
    expiryDate,
    issuedDate,
    issuingAuthority,
  });

  console.log("Final document path saved to DB:", document.documentImage.path);
  console.log("Cloudinary public_id saved:", document.documentImage.public_id);

  res.status(201).json({
    success: true,
    message: "Document uploaded successfully",
    document,
  });
}); 