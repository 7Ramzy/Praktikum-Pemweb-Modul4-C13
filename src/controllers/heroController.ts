import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Ambil semua Hero beserta Skin-nya
export const getAllHeroes = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const heroes = await prisma.hero.findMany({
      include: { skins: true } // Menampilkan relasi skin otomatis
    });
    res.status(200).json({ success: true, data: heroes });
  } catch (error) {
    next(error);
  }
};

// Tambah Hero Baru
export const createHero = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, role, price } = req.body;
    const hero = await prisma.hero.create({
      data: { name, role, price }
    });
    res.status(201).json({ success: true, data: hero });
  } catch (error) {
    next(error);
  }
};

// Tambah Skin Baru untuk Hero tertentu
export const createSkin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, rarity, heroId } = req.body;
    const skin = await prisma.skin.create({
      data: { name, rarity, heroId: Number(heroId) }
    });
    res.status(201).json({ success: true, data: skin });
  } catch (error) {
    next(error);
  }
};