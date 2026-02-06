import mongoose, { Schema, model, models } from 'mongoose';

const IncidentSchema = new Schema({

  type: { type: String, default: 'EMERGENCY_SOS' },

  status: {
    type: String,
    enum: ['PENDING', 'ACTIVE', 'MOVING', 'RESOLVED', 'CANCELLED'],
    default: 'PENDING'
  },

  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },

  identifier: String,

  // 📍 Current Location
  coordinates: {
    lat: Number,
    lng: Number,
    accuracy: Number,
    updatedAt: Date
  },

  // 📜 History
  locationHistory: [{
    lat: Number,
    lng: Number,
    accuracy: Number,
    timestamp: Date
  }],

  // 🎥 Evidence
  evidence: {
    audioUrl: String,
    snapshotUrl: String,
    recordingStarted: Date
  },

  // 📲 Contacts
  notifiedContacts: [{
    phone: String,
    status: {
      type: String,
      enum: ['SENT','DELIVERED','READ','FAILED'],
      default: 'SENT'
    }
  }],

  description: String,

  startedAt: { type: Date, default: Date.now },
  endedAt: Date

});

const Incident = models.Incident || model('Incident', IncidentSchema);
export default Incident;