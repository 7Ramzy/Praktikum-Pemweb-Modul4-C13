import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export const buyHero = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { playerId, heroId } = req.body;

    // 1. Cek ketersediaan Player beserta Hero yang sudah dimilikinya
    const player = await prisma.player.findUnique({
      where: { id: Number(playerId) },
      include: { heroes: true }
    });
    if (!player) {
      res.status(404).json({ success: false, message: 'Player tidak ditemukan' });
      return;
    }

    // 2. Cek ketersediaan Hero
    const hero = await prisma.hero.findUnique({ where: { id: Number(heroId) } });
    if (!hero) {
      res.status(404).json({ success: false, message: 'Hero tidak ditemukan' });
      return;
    }

    // 3. Validasi: Apakah Player sudah punya Hero ini?
    const alreadyOwned = player.heroes.some(ph => ph.heroId === hero.id);
    if (alreadyOwned) {
      res.status(400).json({ success: false, message: 'Player sudah memiliki Hero ini' });
      return;
    }

    // 4. Validasi: Apakah uang Player cukup?
    if (player.balance < hero.price) {
      res.status(400).json({ success: false, message: 'Saldo tidak mencukupi untuk membeli Hero ini' });
      return;
    }

    // 5. Eksekusi Transaksi Database (Potong uang & Simpan relasi kepemilikan)
    const transactionResult = await prisma.$transaction([
      prisma.player.update({
        where: { id: player.id },
        data: { balance: player.balance - hero.price }
      }),
      prisma.playerHero.create({
        data: {
          playerId: player.id,
          heroId: hero.id
        }
      })
    ]);

    res.status(200).json({
      success: true,
      message: 'Pembelian Hero berhasil!',
      data: {
        player: transactionResult[0].name,
        sisaBalance: transactionResult[0].balance,
        heroDibeli: hero.name
      }
    });
  } catch (error) {
    next(error);
  }
};