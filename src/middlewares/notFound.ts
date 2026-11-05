import type { RequestHandler } from "express";
import { HttpError } from "../lib/helpers";

export const notFound: RequestHandler = (req) => {
  throw new HttpError(404, `Endpoint ${req.method} ${req.originalUrl} tidak ditemukan`);
};