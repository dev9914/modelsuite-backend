import mongoose from 'mongoose';

const agencyToModelMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderModel',
  },
  senderModel: {
    type: String,
    enum: ['Agency', 'ModelUser'], // match exact model names
    required: true,
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'receiverModel',
  },
  receiverModel: {
    type: String,
    enum: ['Agency', 'ModelUser'],
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('AgencyToModelMessage', agencyToModelMessageSchema);
