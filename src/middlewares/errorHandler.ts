import type { ErrorRequestHandler } from "express";
import { HttpError } from "../lib/helpers";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof HttpError) {
    return res.status(err.status).json({ status: false, message: err.message });
  }
  if (err?.type === "entity.parse.failed") {
    return res.status(400).json({ status: false, message: "Body JSON tidak valid" });
  }
  console.error(err);
  res.status(500).json({ status: false, message: "Terjadi kesalahan pada server" });
};