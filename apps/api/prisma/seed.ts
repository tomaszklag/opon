// Seed wypełnia BE-1a w Sprint 1
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // TODO: BE-1a — dodaj dane seedowe
  console.info('Seed placeholder — brak danych do seedowania w tym etapie.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
