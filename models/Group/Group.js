import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  agencyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Agency',
    required: true,
  },
  modelId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ModelUser',
    required: true,
  },
  // employeeId: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: 'Employee',
  // },
  hasTopics: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export default mongoose.model('Group', groupSchema);
