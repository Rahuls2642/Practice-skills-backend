import { Request, Response, NextFunction } from "express";

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error("ERROR:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong",
  });
};