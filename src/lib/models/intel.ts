import mongoose, { Schema, model, models } from 'mongoose';

const IntelSchema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true, unique: true },
  uid: { type: String, required: true, unique: true },
  riskLevel: { type: String, default: 'LOW' },
  status: { type: String, default: 'ACTIVE' },
  lastSeen: { type: Date, default: Date.now }
});

const Intel = models.Intel || model('Intel', IntelSchema);
export default Intel;