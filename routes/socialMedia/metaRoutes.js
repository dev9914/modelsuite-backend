import express from "express";
import { connectMeta, handleMetaCallback } from "../../controllers/socialMedia/metaController.js";

const router = express.Router();

router.get("/connect", connectMeta);
router.get("/oauth/callback", handleMetaCallback);

export default router;
