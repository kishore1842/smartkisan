import mongoose from "mongoose";

const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
  },
  location: {
    state: {
      type: String,
      required: true,
      default: "Karnataka"
    },
    district: {
      type: String,
      required: true,
    },
    village: {
      type: String,
      required: true,
    },
    pincode: {
      type: String,
      required: true,
    }
  },
  preferredLanguage: {
    type: String,
    enum: ["Kannada", "English", "Hindi", "Telugu", "Tamil"],
    default: "Kannada"
  },
  farmDetails: {
    totalArea: {
      type: Number, // in acres
      required: true,
    },
    irrigationType: {
      type: String,
      enum: ["Drip", "Sprinkler", "Flood", "Manual", "None"],
      default: "Manual"
    },
    soilType: {
      type: String,
      enum: ["Red Soil", "Black Soil", "Alluvial", "Laterite", "Mountain", "Desert"],
      default: "Red Soil"
    }
  },
  cropHistory: [{
    cropName: String,
    season: String,
    year: Number,
    area: Number,
    yield: Number,
    issues: [String],
    solutions: [String]
  }],
  recentQueries: [{
    query: String,
    type: {
      type: String,
      enum: ["disease", "market", "scheme", "general"],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    },
    response: String
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationOTP: {
    code: String,
    expiresAt: Date
  },
  profileImage: {
    public_id: String,
    url: String
  },
  subscription: {
    type: {
      type: String,
      enum: ["Free", "Basic", "Premium"],
      default: "Free"
    },
    validUntil: Date
  }
}, {
  timestamps: true,
});

// Index for phone number queries
farmerSchema.index({ phone: 1 });
farmerSchema.index({ "location.district": 1 });

const Farmer = mongoose.model("Farmer", farmerSchema);

export default Farmer; 