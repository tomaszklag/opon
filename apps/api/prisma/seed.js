'use strict';
Object.defineProperty(exports, '__esModule', { value: true });
// Seed wypełnia BE-1a w Sprint 1
const client_1 = require('@prisma/client');
const prisma = new client_1.PrismaClient();
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
