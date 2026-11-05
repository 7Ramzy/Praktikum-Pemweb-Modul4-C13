import { Router } from "express";
import { prisma } from "../lib/prisma";
import { Role, Lane } from "../generated/prisma/client";
import { HttpError, sendOk, parseId, getPaging, buildMeta } from "../lib/helpers";

const router = Router();

router.get("/", async (req, res) => {
  const { page, limit, skip } = getPaging(req.query);
  const search = String(req.query.search ?? "").trim();
  const role = req.query.role ? String(req.query.role).toUpperCase() : undefined;

  if (role && !Object.values(Role).includes(role as Role)) {
    throw new HttpError(400, "Role tidak valid");
  }

  const where = {
    ...(search && { name: { contains: search, mode: "insensitive" as const } }),
    ...(role && { role: role as Role }),
  };

  const [heroes, total] = await Promise.all([
    prisma.hero.findMany({ where, skip, take: limit, orderBy: { id: "asc" } }),
    prisma.hero.count({ where }),
  ]);

  sendOk(res, 200, "Berhasil mengambil data hero", heroes, buildMeta(page, limit, total));
});

router.get("/:hero_id", async (req, res) => {
  const id = parseId(req.params.hero_id, "Hero tidak ditemukan");
  const hero = await prisma.hero.findUnique({ where: { id }, include: { skins: true } });
  if (!hero) throw new HttpError(404, "Hero tidak ditemukan");

  sendOk(res, 200, "Berhasil mengambil detail hero", hero);
});

router.post("/", async (req, res) => {
  const { name, role, lane, releaseYear, priceBP, priceDiamond } = req.body ?? {};

  if (
    !name || !role || !lane || releaseYear == null ||
    !Object.values(Role).includes(role) ||
    !Object.values(Lane).includes(lane)
  ) {
    throw new HttpError(400, "name, role, lane, dan releaseYear wajib diisi dengan benar");
  }

  const sudahAda = await prisma.hero.findUnique({ where: { name } });
  if (sudahAda) throw new HttpError(409, "Nama hero sudah dipakai");

  const hero = await prisma.hero.create({
    data: {
      name,
      role,
      lane,
      releaseYear,
      priceBP: priceBP ?? null,
      priceDiamond: priceDiamond ?? null,
    },
  });

  sendOk(res, 201, "Hero berhasil dibuat", hero);
});

export default router;