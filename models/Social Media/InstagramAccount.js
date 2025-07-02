import mongoose from 'mongoose';

const instagramAccountSchema = new mongoose.Schema({
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Model',
    required: true,
    unique: true, // one IG per model
  },
  igId: String,
  fbPageId: String,
  pageAccessToken: String,
  accessToken: String,
  tokenExpiresAt: Date,
}, { timestamps: true });

export default mongoose.model('InstagramAccount', instagramAccountSchema);
