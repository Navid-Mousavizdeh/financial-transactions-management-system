import { NextFunction, Request, Response } from "express";
import { config } from "./config";

const delayMiddleware = (req: Request, res: Response, next: NextFunction) => {
  setTimeout(() => next(), config.delay);
};

export default delayMiddleware;
