import express from 'express';
import upload from '../middlewares/multer.js';

const router = express.Router();

router.post('/profile-photo', upload.single('image'), (req, res) => {
  const imageUrl = req.file.path; // secure Cloudinary URL
  res.status(200).json({ imageUrl });
});

export default router;
