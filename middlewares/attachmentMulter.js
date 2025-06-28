// middlewares/attachmentMulter.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const attachmentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let resourceType = 'raw'; // default for docs

    if (file.mimetype.startsWith('image/')) resourceType = 'image';
    else if (file.mimetype.startsWith('video/')) resourceType = 'video';

    return {
      folder: 'modelsuite/attachments',
      resource_type: resourceType,
      allowed_formats: ['jpg', 'jpeg', 'png', 'mp4', 'mov', 'pdf', 'docx', 'txt'],
    };
  },
});

const attachmentUpload = multer({ storage: attachmentStorage });

export default attachmentUpload;
