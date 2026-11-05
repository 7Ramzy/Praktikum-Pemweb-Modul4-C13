import { Router } from "express";
import { prisma } from "../lib/prisma";
import { Currency } from "../generated/prisma/client";
import { HttpError, sendOk, parseId } from "../lib/helpers";

const router = Router();

const cariPlayer = async (id: number) => {
  const player = await prisma.player.findUnique({ where: { id } });
  if (!player) throw new HttpError(404, "Player tidak ditemukan");
  return player;
};

const nicknameValid = (n: unknown): n is string => typeof n === "string" && n.trim() !== "";

router.post("/", async (req, res) => {
  const nickname = req.body?.nickname;
  if (!nicknameValid(nickname)) throw new HttpError(400, "nickname wajib diisi");

  const sudahAda = await prisma.player.findUnique({ where: { nickname: nickname.trim() } });
  if (sudahAda) throw new HttpError(409, "Nickname sudah dipakai");

  const player = await prisma.player.create({ data: { nickname: nickname.trim() } });
  sendOk(res, 201, "Player berhasil dibuat", player);
});

router.get("/:player_id", async (req, res) => {
  const id = parseId(req.params.player_id, "Player tidak ditemukan");
  const player = await prisma.player.findUnique({
    where: { id },
    include: { heroes: { include: { hero: { select: { name: true } } } } },
  });
  if (!player) throw new HttpError(404, "Player tidak ditemukan");

  const data = {
    id: player.id,
    nickname: player.nickname,
    bp: player.bp,
    diamond: player.diamond,
    createdAt: player.createdAt,
    heroes: player.heroes.map((ph) => ({
      heroId: ph.heroId,
      name: ph.hero.name,
      currency: ph.currency,
      pricePaid: ph.pricePaid,
    })),
  };
  sendOk(res, 200, "Berhasil mengambil data player", data);
});

router.patch("/:player_id", async (req, res) => {
  const id = parseId(req.params.player_id, "Player tidak ditemukan");
  await cariPlayer(id);

  const nickname = req.body?.nickname;
  if (!nicknameValid(nickname)) throw new HttpError(400, "nickname wajib diisi");

  const dipakai = await prisma.player.findUnique({ where: { nickname: nickname.trim() } });
  if (dipakai && dipakai.id !== id) throw new HttpError(409, "Nickname sudah dipakai");

  const player = await prisma.player.update({ where: { id }, data: { nickname: nickname.trim() } });
  sendOk(res, 200, "Player berhasil diperbarui", player);
});

router.delete("/:player_id", async (req, res) => {
  const id = parseId(req.params.player_id, "Player tidak ditemukan");
  await cariPlayer(id);

  await prisma.player.delete({ where: { id } });
  sendOk(res, 200, "Player berhasil dihapus", null);
});

router.post("/:player_id/topup", async (req, res) => {
  const amount = req.body?.amount;

  if (typeof amount !== "number" || !Number.isInteger(amount) || amount <= 0) {
    throw new HttpError(400, "amount harus bilangan bulat lebih dari 0");
  }
  const id = parseId(req.params.player_id, "Player tidak ditemukan");
  await cariPlayer(id);

  const player = await prisma.player.update({
    where: { id },
    data: { diamond: { increment: amount } },
  });
  sendOk(res, 200, "Top up berhasil", { playerId: id, amount, diamond: player.diamond });
});

router.post("/:player_id/matches", async (req, res) => {
  const result = req.body?.result;

  if (result !== "WIN" && result !== "LOSE") {
    throw new HttpError(400, "result harus WIN atau LOSE");
  }
  const id = parseId(req.params.player_id, "Player tidak ditemukan");
  await cariPlayer(id);

  const bpEarned = result === "WIN" ? 300 : 100;
  const player = await prisma.player.update({
    where: { id },
    data: { bp: { increment: bpEarned } },
  });
  sendOk(res, 200, "Hadiah match berhasil ditambahkan", {
    playerId: id,
    result,
    bpEarned,
    bp: player.bp,
  });
});

router.post("/:player_id/heroes", async (req, res) => {
  const { heroId, currency } = req.body ?? {};

  if (!Number.isInteger(heroId) || !Object.values(Currency).includes(currency)) {
    throw new HttpError(400, "heroId wajib diisi dan currency harus BP atau DIAMOND");
  }

  const playerId = parseId(req.params.player_id, "Player tidak ditemukan");
  const player = await cariPlayer(playerId);

  const hero = await prisma.hero.findUnique({ where: { id: heroId } });
  if (!hero) throw new HttpError(404, "Hero tidak ditemukan");

  const price = currency === "BP" ? hero.priceBP : hero.priceDiamond;
  if (price === null) {
    throw new HttpError(400, `Hero ${hero.name} tidak bisa dibeli dengan ${currency}`);
  }

  const sudahPunya = await prisma.playerHero.findUnique({
    where: { playerId_heroId: { playerId, heroId } },
  });
  if (sudahPunya) throw new HttpError(409, `Player sudah memiliki hero ${hero.name}`);

  const saldo = currency === "BP" ? player.bp : player.diamond;
  if (saldo < price) throw new HttpError(400, `Saldo ${currency} tidak cukup`);

  const [updated] = await prisma.$transaction([
    prisma.player.update({
      where: { id: playerId },
      data: currency === "BP" ? { bp: { decrement: price } } : { diamond: { decrement: price } },
    }),
    prisma.playerHero.create({
      data: { playerId, heroId, currency, pricePaid: price },
    }),
  ]);

  sendOk(res, 201, "Hero berhasil dibeli", {
    hero: { id: hero.id, name: hero.name },
    currency,
    pricePaid: price,
    balance: { bp: updated.bp, diamond: updated.diamond },
  });
});

export default router;