import type { Request, Response } from "express";

export class HttpError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export const sendOk = (
  res: Response,
  code: number,
  message: string,
  data: unknown,
  metadata?: object
) => res.status(code).json({ status: true, message, data, ...(metadata ? { metadata } : {}) });

export const parseId = (raw: unknown, notFoundMsg: string) => {
  const id = Number(String(raw));
  if (!Number.isInteger(id) || id < 1) throw new HttpError(404, notFoundMsg);
  return id;
};

export const getPaging = (query: Request["query"]) => {
  const page = Math.max(parseInt(String(query.page)) || 1, 1);
  const limit = Math.max(parseInt(String(query.limit)) || 10, 1);
  return { page, limit, skip: (page - 1) * limit };
};

export const buildMeta = (page: number, limit: number, totalItems: number) => ({
  currentPage: page,
  limit,
  totalItems,
  totalPages: Math.ceil(totalItems / limit),
});