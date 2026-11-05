import { readFileSync } from "node:fs";
import { parse } from "csv-parse/sync";
import { prisma } from "../src/lib/prisma";

const bacaCsv = (file: string) =>
  parse(readFileSync(`data/${file}`, "utf-8"), {
    columns: true,
    skip_empty_lines: true,
    bom: true,
  }) as Record<string, string>[];

const angka = (v?: string) => {
  if (v === undefined || v.trim() === "" || v.trim().toLowerCase() === "null") return null;
  return Number(v);
};

async function main() {
  await prisma.$executeRawUnsafe(
    `TRUNCATE "PlayerHero", "Player", "Skin", "Hero" RESTART IDENTITY CASCADE`
  );

  const heroes = bacaCsv("heroes.csv").map((h) => ({
    name: h.name.trim(),
    role: h.primaryRole.trim().toUpperCase() as any,
    lane: h.primaryLane.trim().toUpperCase() as any,
    releaseYear: Number(h.releaseYear),
    priceBP: angka(h.priceBP),
    priceDiamond: angka(h.priceDiamond),
  }));
  await prisma.hero.createMany({ data: heroes });

  const skins = bacaCsv("skins.csv").map((s) => ({
    name: s.name.trim(),
    heroId: Number(s.heroId),
    rarity: s.rarity.trim().toUpperCase() as any,
    priceDiamond: angka(s.priceDiamond),
  }));
  await prisma.skin.createMany({ data: skins });

  await prisma.player.createMany({
    data: [
      { id: 1, nickname: "ArekITS", bp: 1500, diamond: 75 },
      { id: 2, nickname: "SangPushRank", bp: 13000, diamond: 2892 },
      { id: 3, nickname: "MageSurabaya", bp: 10000, diamond: 0 },
    ],
  });

  await prisma.$executeRawUnsafe(
    `SELECT setval(pg_get_serial_sequence('"Player"', 'id'), (SELECT MAX(id) FROM "Player"))`
  );

  await prisma.playerHero.createMany({
    data: [
      { playerId: 1, heroId: 18, currency: "BP", pricePaid: 2000 },
      { playerId: 1, heroId: 1, currency: "BP", pricePaid: 10800 },
      { playerId: 2, heroId: 84, currency: "DIAMOND", pricePaid: 599 },
      { playerId: 2, heroId: 56, currency: "BP", pricePaid: 32000 },
    ],
  });

  console.log("Seed selesai");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());