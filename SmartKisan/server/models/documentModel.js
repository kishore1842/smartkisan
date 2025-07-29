import mongoose from "mongoose";

const documentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  documentType: {
    type: String,
    required: true,
    enum: [
      "Aadhar Card", "PAN Card", "Voter ID", "Driving License", "Passport",
      "Birth Certificate", "Income Certificate", "Caste Certificate",
      "Domicile Certificate", "Other",
      "Identity Documents", "Land Records", "Bank Documents",
      "Crop Certificates", "Insurance Papers"
    ],
  },
  fileType: {
    type: String,
    required: false,
  },
  documentNumber: {
    type: String,
    required: true,
  },
  documentImage: {
    path: { type: String, required: true },
    public_id: { type: String },
  },
  status: {
    type: String,
    enum: ["Pending", "Processing", "Verified", "Rejected"],
    default: "Pending",
  },
  aiVerification: {
    confidence: {
      type: Number,
      min: 0,
      max: 100,
    },
    extractedData: {
      name: String,
      number: String,
      dateOfBirth: Date,
      address: String,
      other: mongoose.Schema.Types.Mixed,
    },
    verificationResult: {
      type: String,
      enum: ["Valid", "Invalid", "Uncertain"],
    },
    processingTime: Number,
  },
  manualVerification: {
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    verifiedAt: Date,
    remarks: String,
  },
  expiryDate: {
    type: Date,
  },
  issuedDate: {
    type: Date,
  },
  issuingAuthority: {
    type: String,
  },
  remarks: {
    type: String,
  },
  rejectionReason: {
    type: String,
  },
}, {
  timestamps: true,
});

const Document = mongoose.model("Document", documentSchema);

export default Document; 