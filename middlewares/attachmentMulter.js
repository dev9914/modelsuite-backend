// middlewares/attachmentMulter.js
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../config/cloudinary.js';

const attachmentStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    // Always use raw for files like pdf/docx/txt
    let resourceType = "raw";

    if (file.mimetype.startsWith("image/")) resourceType = "image";
    else if (file.mimetype.startsWith("video/")) resourceType = "video";

    // Remove file extension completely
    const baseName = file.originalname.replace(/\.[^/.]+$/, "");

    return {
      folder: "modelsuite/attachments",
      resource_type: resourceType,
      allowed_formats: ["jpg", "jpeg", "png", "mp4", "mov", "pdf", "docx", "txt"],
      public_id: `${baseName}-${Date.now()}`, // no .pdf here
    };
  },
});

const attachmentUpload = multer({ storage: attachmentStorage });

export default attachmentUpload;
