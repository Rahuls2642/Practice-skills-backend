import { Request, Response } from "express";
import Question from "../models/Question";

export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { skill, type } = req.query;

    const query: any = {};

    if (skill) query.skill = skill;
    if (type) query.type = type;

    const questions = await Question.find(query).limit(10);

    res.json(questions);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};