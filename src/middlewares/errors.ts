import { NextFunction, Request, Response } from "express";
import { AppError } from "../core/errors";

export const errorHandler = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ errorMessage: err.message });
  } else {
    res.status(500).json({ errorMessage: "Server error" })
  }
};

export const notFoundHandler = (req: Request) => {
  throw new AppError(`path ${req.path} is not found`, 404);
};