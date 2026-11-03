import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// [1] CREATE: Menambahkan Player Baru
export const createPlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, balance } = req.body;
    const player = await prisma.player.create({
      data: { name, balance: balance || 0 },
    });
    res.status(201).json({ success: true, data: player });
  } catch (error) {
    next(error); // Melempar error ke middleware errorHandler
  }
};

// [2] READ: Mengambil Semua Data Player
export const getAllPlayers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const players = await prisma.player.findMany({
      include: { heroes: true } // Akan menampilkan relasi hero nanti
    });
    res.status(200).json({ success: true, data: players });
  } catch (error) {
    next(error);
  }
};

// [3] READ: Mengambil Satu Player Berdasarkan ID
export const getPlayerById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { id } = req.params;
    const player = await prisma.player.findUnique({
      where: { id: Number(id) },
      include: { heroes: true }
    });
    
    if (!player) {
      res.status(404).json({ success: false, message: 'Player tidak ditemukan' });
      return;
    }
    res.status(200).json({ success: true, data: player });
  } catch (error) {
    next(error);
  }
};

// [4] UPDATE: Mengubah Data Player (Nama / Balance)
export const updatePlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, balance } = req.body;
    const player = await prisma.player.update({
      where: { id: Number(id) },
      data: { name, balance },
    });
    res.status(200).json({ success: true, data: player });
  } catch (error) {
    next(error);
  }
};

// [5] DELETE: Menghapus Player
export const deletePlayer = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    await prisma.player.delete({
      where: { id: Number(id) },
    });
    res.status(200).json({ success: true, message: 'Player berhasil dihapus' });
  } catch (error) {
    next(error);
  }
};

// [6] STATS: Statistik Player (Total Player & Total Keseluruhan Balance)
export const getPlayerStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const totalPlayers = await prisma.player.count();
    const aggregate = await prisma.player.aggregate({
      _sum: { balance: true }
    });

    res.status(200).json({
      success: true,
      data: {
        totalPlayers,
        totalBalanceInSystem: aggregate._sum.balance || 0
      }
    });
  } catch (error) {
    next(error);
  }
};