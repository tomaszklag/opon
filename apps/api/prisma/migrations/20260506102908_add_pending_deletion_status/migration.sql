-- AlterEnum
ALTER TYPE "ProviderStatus" ADD VALUE 'PENDING_DELETION';

-- AlterTable
ALTER TABLE "providers" ADD COLUMN     "deletionRequestedAt" TIMESTAMP(3);
