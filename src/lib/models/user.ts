import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  // --- BASIC AUTH & IDENTITY ---
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true }, 
  accessCode: { type: String, required: true }, // 5-digit PIN
  
  // --- SYSTEM STATES ---
  role: { 
    type: String, 
    enum: ["USER", "ADMIN", "DISPATCHER"], 
    default: "USER" 
  },
  
  // Unified Status for the Middleware to check
  // Matches the "PENDING", "APPROVED", "REJECTED" logic in your login/pin pages
  kycStatus: { 
    type: String, 
    enum: ["NONE", "PENDING", "APPROVED", "REJECTED"], 
    default: "NONE" 
  },

  // --- KYC DATA ---
  kyc: {
    idType: { 
      type: String, 
      enum: ["NIN", "VOTERS_CARD", "PASSPORT", "DRIVERS_LICENSE"] 
    },
    idImageUrl: { type: String }, // URL from Cloudinary/S3
    address: { type: String },
    submittedAt: { type: Date }
  },

  // --- SAFETY CIRCLE (Refactored for your specific structure) ---
  emergencyContacts: {
    family: {
      name: { type: String },
      phone: { type: String },
      relation: { type: String } // Father, Mother, Sister, etc.
    },
    friends: [
      {
        name: { type: String },
        phone: { type: String }
      }
    ], // Array of 2 friends
    partner: {
      name: { type: String },
      phone: { type: String }
    }
  },

  // --- METRICS ---
  lastIncidentAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model("User", UserSchema);