import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  scheme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scheme",
    required: true,
  },
  status: {
    type: String,
    enum: ["Pending", "Under Review", "Approved", "Rejected", "Completed"],
    default: "Pending",
  },
  personalInfo: {
    name: String,
    age: Number,
    gender: String,
    phone: String,
    address: {
      street: String,
      city: String,
      state: String,
      pincode: String,
    },
    occupation: String,
    income: Number,
    education: String,
  },
  documents: [{
    type: {
      type: String,
      required: true,
    },
    documentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Document",
    },
    status: {
      type: String,
      enum: ["Pending", "Verified", "Rejected"],
      default: "Pending",
    },
    remarks: String,
  }],
  applicationData: {
    type: mongoose.Schema.Types.Mixed,
    required: true,
  },
  remarks: {
    type: String,
  },
  adminRemarks: {
    type: String,
  },
  appliedDate: {
    type: Date,
    default: Date.now,
  },
  reviewedDate: {
    type: Date,
  },
  approvedDate: {
    type: Date,
  },
  benefitAmount: {
    type: Number,
  },
  trackingNumber: {
    type: String,
    unique: true,
  },
}, {
  timestamps: true,
});

// Generate tracking number
applicationSchema.pre('save', function(next) {
  if (!this.trackingNumber) {
    this.trackingNumber = 'APP' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
  }
  next();
});

const Application = mongoose.model("Application", applicationSchema);

export default Application; 