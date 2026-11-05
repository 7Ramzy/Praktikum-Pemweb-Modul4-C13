import { Router } from "express";
import { prisma } from "../lib/prisma";
import { Rarity } from "../generated/prisma/client";
import { HttpError, sendOk, parseId, getPaging, buildMeta } from "../lib/helpers";

const router = Router();

router.get("/", async (req, res) => {
  const { page, limit, skip } = getPaging(req.query);
  const rarity = req.query.rarity ? String(req.query.rarity).toUpperCase() : undefined;
  const heroId = req.query.heroId ? Number(req.query.heroId) : undefined;

  if (rarity && !Object.values(Rarity).includes(rarity as Rarity)) {
    throw new HttpError(400, "Rarity tidak valid");
  }
  if (heroId !== undefined && !Number.isInteger(heroId)) {
    throw new HttpError(400, "heroId harus berupa angka");
  }

  const where = {
    ...(heroId !== undefined && { heroId }),
    ...(rarity && { rarity: rarity as Rarity }),
  };

  const [skins, total] = await Promise.all([
    prisma.skin.findMany({
      where,
      skip,
      take: limit,
      orderBy: { id: "asc" },
      include: { hero: { select: { name: true } } },
    }),
    prisma.skin.count({ where }),
  ]);

  sendOk(res, 200, "Berhasil mengambil data skin", skins, buildMeta(page, limit, total));
});

router.get("/:skin_id", async (req, res) => {
  const id = parseId(req.params.skin_id, "Skin tidak ditemukan");
  const skin = await prisma.skin.findUnique({
    where: { id },
    include: { hero: { select: { name: true } } },
  });
  if (!skin) throw new HttpError(404, "Skin tidak ditemukan");

  sendOk(res, 200, "Berhasil mengambil detail skin", skin);
});

export default router;