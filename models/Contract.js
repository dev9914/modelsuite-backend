// models/Contract.js
import mongoose from 'mongoose';

const contractSchema = new mongoose.Schema({
  recipientName: String,
  recipientEmail: String,
  templateId: String,
  documentId: String,
  status: String,
  sentAt: { type: Date, default: Date.now },
});

export default mongoose.model('Contract', contractSchema);
