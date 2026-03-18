import express from "express";
import { generateReport } from "../controllers/report.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/:sessionId", protect, generateReport);

export default router;