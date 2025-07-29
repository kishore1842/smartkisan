import mongoose, { Types } from "mongoose";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true,
  },
  lastName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    lowercase: true,
    unique: true,
  },
  phone: {
    type: String,
    unique: true,
    // required: true, // Make phone optional
  },
  password: {
    type: String,
    required: true,
    select: false,
  },
  role: {
    type: String,
    enum: ["Admin", "Farmer"],
    default: "Farmer", 
  },
  accountverified: { 
    type: Boolean, 
    default: false 
  },
  verificatiocode: Number,
  verificationexpire: Date,
  resetpasswordtoken: String,
  resetpasswordexpire: Date,
  // Voice assistant related fields
  preferredLanguage: {
    type: String,
    enum: ["Kannada", "English", "Hindi", "Telugu", "Tamil"],
    default: "Kannada"
  },
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
  // Farm details for context
  farmDetails: {
    totalArea: {
      type: Number, // in acres
      default: 0
    },
    location: {
      state: {
        type: String,
        default: "Karnataka"
      },
      district: {
        type: String,
        default: ""
      },
      village: {
        type: String,
        default: ""
      }
    }
  }
}, {
  timestamps: true,
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.methods.generateverificationcode = function() {
  function generaterandomfivedigitnumber() {
    const firstdigit = Math.floor(Math.random() * 9) + 1;
    const remainingdigits = Math.floor(Math.random() * 10000).toString().padStart(4, "0");
    return parseInt(firstdigit.toString() + remainingdigits);
  }
  const verificationcode = generaterandomfivedigitnumber();
  this.verificatiocode = verificationcode;
  this.verificationexpire = Date.now() + 15 * 60 * 1000;
}

userSchema.methods.generatetoken = function() {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE,
  });
};

userSchema.methods.getresetpasswordtoken = function() {
  const resettoken = crypto.randomBytes(20).toString("hex");
  this.resetpasswordtoken = crypto.createHash("sha256").update(resettoken).digest("hex");
  this.resetpasswordexpire = Date.now() + 15 * 60 * 1000;
  return resettoken;  
}

const User = mongoose.model("User", userSchema);
export default User;