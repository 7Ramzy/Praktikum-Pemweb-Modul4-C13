import { Router } from "express";
import { prisma } from "../lib/prisma";
import { sendOk } from "../lib/helpers";

const router = Router();

router.get("/", async (_req, res) => {
  const [totalPlayers, totalHeroesOwned, sum, topHero, perRole] = await Promise.all([
    prisma.player.count(),
    prisma.playerHero.count(),
    prisma.player.aggregate({ _sum: { diamond: true } }),
    prisma.playerHero.groupBy({
      by: ["heroId"],
      _count: { heroId: true },
      orderBy: [{ _count: { heroId: "desc" } }, { heroId: "asc" }],
      take: 1,
    }),
    prisma.hero.groupBy({
      by: ["role"],
      _count: { _all: true },
      orderBy: { _count: { role: "desc" } },
    }),
  ]);

  let mostOwnedHero = null;
  if (topHero.length > 0) {
    const hero = await prisma.hero.findUnique({ where: { id: topHero[0].heroId } });
    mostOwnedHero = {
      heroId: topHero[0].heroId,
      name: hero?.name,
      owners: topHero[0]._count.heroId,
    };
  }

  sendOk(res, 200, "Berhasil mengambil statistik", {
    totalPlayers,
    totalHeroesOwned,
    totalDiamond: sum._sum.diamond ?? 0,
    mostOwnedHero,
    heroesPerRole: perRole.map((r) => ({ role: r.role, total: r._count._all })),
  });
});

export default router;