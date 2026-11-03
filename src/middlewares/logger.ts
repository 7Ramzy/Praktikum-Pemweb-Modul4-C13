import { Request, Response, NextFunction } from 'express';

export const logger = (req: Request, res: Response, next: NextFunction) => {
  const time = new Date().toLocaleString('id-ID');
  console.log(`[${time}] ${req.method} ${req.url}`);
  next(); // Lanjut ke proses berikutnya
};