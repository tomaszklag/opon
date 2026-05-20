-- Migration: mobile_support
-- Changes:
-- 1. Vehicle: make nickname optional, add make/model/year
-- 2. Add ProviderWaitlistEntry model
-- Note: id columns in this DB are TEXT (not UUID), matching the existing schema pattern

-- AlterTable: vehicles — make nickname optional, add new columns
ALTER TABLE "vehicles" ALTER COLUMN "nickname" DROP NOT NULL;
ALTER TABLE "vehicles" ADD COLUMN "make" VARCHAR(100);
ALTER TABLE "vehicles" ADD COLUMN "model" VARCHAR(100);
ALTER TABLE "vehicles" ADD COLUMN "year" INTEGER;

-- CreateTable: provider_waitlist_entries
CREATE TABLE "provider_waitlist_entries" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "userId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "provider_waitlist_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "provider_waitlist_entries_userId_idx" ON "provider_waitlist_entries"("userId");

-- CreateUniqueIndex
CREATE UNIQUE INDEX "provider_waitlist_entries_userId_providerId_key" ON "provider_waitlist_entries"("userId", "providerId");

-- AddForeignKey
ALTER TABLE "provider_waitlist_entries" ADD CONSTRAINT "provider_waitlist_entries_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_waitlist_entries" ADD CONSTRAINT "provider_waitlist_entries_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
