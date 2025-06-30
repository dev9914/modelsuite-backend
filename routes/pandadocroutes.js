import express from "express";
import {
  getTemplates,
  createDocument,
  getDocumentById,
   } from "../controllers/pandadoccontroller.js";

const router = express.Router();

router.get("/templates", getTemplates);
router.post("/documents", createDocument);
router.get("/documents/:id", getDocumentById);



export default router;
