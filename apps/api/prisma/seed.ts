// Seed wypełnia BE-1a w Sprint 1
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

const DEV_ADMIN_PHONE = '+48777777777';

async function main() {
  if (process.env.NODE_ENV !== 'development') {
    console.info('Seed: środowisko nie-developerskie — pomijam dane testowe.');
    return;
  }

  const admin = await prisma.user.upsert({
    where: { phone: DEV_ADMIN_PHONE },
    update: { role: UserRole.ADMIN },
    create: { phone: DEV_ADMIN_PHONE, role: UserRole.ADMIN },
  });
  console.info(`Seed: admin dev → id=${admin.id} phone=${admin.phone} role=${admin.role}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => {
    void prisma.$disconnect();
  });
