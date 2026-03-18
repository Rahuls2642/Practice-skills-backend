import express from "express";
import { startSession } from "../controllers/session.controller";
import { submitAnswer } from "../controllers/session.controller";
import { protect } from "../middleware/auth.middleware";

const router = express.Router();

router.post("/start", protect, startSession);
router.post("/answer", protect, submitAnswer);


export default router;