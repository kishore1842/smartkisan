import mongoose from "mongoose";

const marketPriceSchema = new mongoose.Schema({
  commodity: {
    name: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: ["Vegetables", "Fruits", "Grains", "Pulses", "Spices", "Others"],
      required: true,
    },
    unit: {
      type: String,
      enum: ["Quintal", "Kg", "Dozen", "Piece", "Bundle"],
      default: "Kg"
    }
  },
  market: {
    name: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    district: {
      type: String,
      required: true,
    },
    location: {
      type: {
        type: String,
        default: "Point"
      },
      coordinates: [Number] // [longitude, latitude]
    }
  },
  priceData: {
    minPrice: {
      type: Number,
      required: true,
    },
    maxPrice: {
      type: Number,
      required: true,
    },
    modalPrice: {
      type: Number,
      required: true,
    },
    arrivalQuantity: {
      type: Number,
      default: 0
    },
    unit: {
      type: String,
      default: "Quintal"
    }
  },
  date: {
    type: Date,
    required: true,
  },
  source: {
    type: String,
    enum: ["eNAM", "Agmarknet", "Manual", "API"],
    default: "eNAM"
  },
  trend: {
    direction: {
      type: String,
      enum: ["Rising", "Falling", "Stable"],
      default: "Stable"
    },
    percentage: Number,
    prediction: {
      nextWeek: Number,
      nextMonth: Number
    }
  },
  aiAnalysis: {
    summary: String,
    recommendations: [String],
    factors: [String],
    confidence: Number
  }
}, {
  timestamps: true,
});

// Index for efficient queries
marketPriceSchema.index({ "commodity.name": 1, "market.name": 1, date: -1 });
marketPriceSchema.index({ "market.state": 1, "market.district": 1 });
marketPriceSchema.index({ date: -1 });

const MarketPrice = mongoose.model("MarketPrice", marketPriceSchema);

export default MarketPrice; 