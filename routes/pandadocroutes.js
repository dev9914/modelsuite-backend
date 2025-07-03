import express from "express";
import {
  getTemplates,
  createDocument,
  getDocumentById,
  getAllDocuments,
  getDocumentsByModel,
   } from "../controllers/pandadoccontroller.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/templates", verifyToken, getTemplates);
router.post("/create-document/:modelId", verifyToken, createDocument);
router.get("/documents/:id", verifyToken, getDocumentById);
router.get("/documents", verifyToken, getAllDocuments);
router.get("/documents/model/:modelId", verifyToken, getDocumentsByModel);



export default router;
