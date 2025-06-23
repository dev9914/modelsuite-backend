import mongoose from 'mongoose';

const agencySchema = new mongoose.Schema({
  role: {
    type: String,
    default: 'agency',
    immutable: true,
  },
  agencyName: {
    type: String,
    required: true,
  },
  profilePhoto: String,
  agencyEmail: {
    type: String,
    required: true,
    unique: true,
  },
  phone: String,
  website: String,
  country: String,
  city: String,
  username: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  category: String,
  companySize: String,
  agencyType: String,
  certificate: String, // file path or URL (for now just text)
  socialLink: String,
}, { timestamps: true });

const Agency = mongoose.model('Agency', agencySchema);

export default Agency;
