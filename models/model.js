import mongoose from 'mongoose';

const modelSchema = new mongoose.Schema({
  role: {
    type: String,
    default: 'model',
    immutable: true,
  },
  fullName: {
    type: String,
    required: true,
  },
  profilePhoto: String,
  dob: {
    type: Date,
    required: true,
  },
  agencyId: {
  type: mongoose.Schema.Types.ObjectId,
  ref: 'Agency',
  default: null
},
  country: String,
  city: String,
  category: [String],
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: String,
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
}, { timestamps: true });

const ModelUser = mongoose.model('ModelUser', modelSchema);

export default ModelUser;
