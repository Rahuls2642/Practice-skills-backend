import express from "express";
import { getQuestions } from "../controllers/question.controller";
import { protect } from "../middleware/auth.middleware";
const router=express.Router()
router.get("/",protect,getQuestions);
export default router;