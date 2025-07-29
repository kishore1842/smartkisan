import mongoose from "mongoose";

const cropDiseaseSchema = new mongoose.Schema({
  farmer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Farmer",
    required: true,
  },
  cropName: {
    type: String,
    required: false,
    trim: true,
  },
  plantPart: {
    type: String,
    enum: ["Leaf", "Stem", "Root", "Flower", "Fruit", "Seed", "Whole Plant"],
    required: true,
  },
  image: {
    public_id: String,
    url: String,
  },
  aiAnalysis: {
    disease: {
      name: { type: String, default: "Unknown" },
      confidence: { type: Number, default: 0 },
      description: String,
    },
    plant: { type: String, default: "Unknown" },
    symptoms: [String],
    causes: [String],
    remedies: [
      {
        type: {
          type: String,
          enum: ["Organic", "Chemical", "Cultural", "Biological"],
          required: true,
        },
        description: String,
        products: [String],
        application: String,
        cost: Number,
        availability: String,
      },
    ],
    prevention: [String],
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
  },
  localRecommendations: {
    pesticides: [
      {
        name: String,
        brand: String,
        dosage: String,
        availability: String,
        cost: Number,
      },
    ],
    organicAlternatives: [String],
    localExperts: [
      {
        name: String,
        contact: String,
        location: String,
      },
    ],
  },
  status: {
    type: String,
    enum: ["Analyzed", "Treatment Applied", "Monitoring", "Resolved"],
    default: "Analyzed",
  },
  followUp: {
    isRequired: { type: Boolean, default: false },
    date: Date,
    notes: String,
  },
  costAnalysis: {
    treatmentCost: Number,
    potentialLoss: Number,
    savings: Number,
  },
}, {
  timestamps: true,
});

// Indexes for performance on common queries
cropDiseaseSchema.index({ farmer: 1, createdAt: -1 });
cropDiseaseSchema.index({ cropName: 1, "aiAnalysis.disease.name": 1 });

const CropDisease = mongoose.model("CropDisease", cropDiseaseSchema);

export default CropDisease;
