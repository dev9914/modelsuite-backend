import mongoose from 'mongoose';

const topicSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'creatorModel',
  },
  creatorModel: {
    type: String,
    required: true,
    enum: ['Agency', 'Employee'], // For now, only 'Agency'
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Topic', topicSchema);
