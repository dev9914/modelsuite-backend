// routes/attachmentRoute.js
import express from 'express';
import attachmentUpload from '../middlewares/attachmentMulter.js';

const router = express.Router();

router.post('/upload', attachmentUpload.single('file'), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ error: 'File upload failed' });
  }

const secureUrl = req.file.path.replace('/upload/', '/upload/fl_attachment:false/');
res.status(200).json({
  url: secureUrl,
  type: req.file.mimetype,
  originalName: req.file.originalname,
});
});

export default router;
