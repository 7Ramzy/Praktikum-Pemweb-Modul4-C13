import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Memulai proses seeding dan pembaruan data...');

  // Menggunakan upsert agar data dengan ID 1, 2, dan 3 otomatis diperbarui jika sudah ada
  await prisma.player.upsert({
    where: { id: 1 },
    update: { name: 'Alif Ramzy', balance: 5000 },
    create: { id: 1, name: 'Alif Ramzy', balance: 5000 },
  });

  await prisma.player.upsert({
    where: { id: 2 },
    update: { name: 'Fida', balance: 3000 },
    create: { id: 2, name: 'Fida', balance: 3000 },
  });

  await prisma.player.upsert({
    where: { id: 3 },
    update: { name: 'Yovi', balance: 1000 },
    create: { id: 3, name: 'Yovi', balance: 1000 },
  });

  console.log('Berhasil memperbarui data Player: Alif Ramzy, Fida, dan Yovi.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });