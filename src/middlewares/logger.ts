import type { RequestHandler } from "express";

export const logger: RequestHandler = (req, res, next) => {
  res.on("finish", () => console.log(`${req.method} ${req.originalUrl} ${res.statusCode}`));
  next();
};