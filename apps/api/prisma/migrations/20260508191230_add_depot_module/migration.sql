-- CreateEnum
CREATE TYPE "TireType" AS ENUM ('SUMMER', 'WINTER', 'ALL_SEASON');

-- CreateEnum
CREATE TYPE "TireCondition" AS ENUM ('GOOD', 'WORN', 'CRITICAL');

-- CreateEnum
CREATE TYPE "TireSetStatus" AS ENUM ('IN_DEPOT', 'PICKED_UP');

-- DropForeignKey
ALTER TABLE "addons" DROP CONSTRAINT "addons_providerId_fkey";

-- DropForeignKey
ALTER TABLE "service_addon_links" DROP CONSTRAINT "service_addon_links_addonId_fkey";

-- DropForeignKey
ALTER TABLE "service_addon_links" DROP CONSTRAINT "service_addon_links_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "service_sub_links" DROP CONSTRAINT "service_sub_links_parentId_fkey";

-- DropForeignKey
ALTER TABLE "service_sub_links" DROP CONSTRAINT "service_sub_links_subId_fkey";

-- DropForeignKey
ALTER TABLE "service_variants" DROP CONSTRAINT "service_variants_serviceId_fkey";

-- DropForeignKey
ALTER TABLE "services" DROP CONSTRAINT "services_providerId_fkey";

-- DropIndex
DROP INDEX "service_addon_links_addonId_idx";

-- DropIndex
DROP INDEX "service_addon_links_serviceId_idx";

-- AlterTable
ALTER TABLE "service_variants" ALTER COLUMN "rimSizes" DROP DEFAULT;

-- AlterTable
ALTER TABLE "stations" ALTER COLUMN "serviceIds" DROP DEFAULT;

-- CreateTable
CREATE TABLE "depot_slots" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "section" VARCHAR(10) NOT NULL,
    "row" INTEGER NOT NULL,
    "position" INTEGER NOT NULL,
    "label" VARCHAR(50),

    CONSTRAINT "depot_slots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tire_sets" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "clientId" TEXT,
    "clientName" VARCHAR(200) NOT NULL,
    "clientPhone" VARCHAR(20) NOT NULL,
    "vehicleName" VARCHAR(100),
    "licensePlate" VARCHAR(20),
    "brand" VARCHAR(100),
    "model" VARCHAR(100),
    "tireSize" VARCHAR(20) NOT NULL,
    "tireType" "TireType" NOT NULL,
    "isOnRims" BOOLEAN NOT NULL DEFAULT true,
    "dotCode" VARCHAR(20),
    "treadDepthMm" DOUBLE PRECISION,
    "condition" "TireCondition" NOT NULL DEFAULT 'GOOD',
    "slotId" TEXT,
    "status" "TireSetStatus" NOT NULL DEFAULT 'IN_DEPOT',
    "storagePricePln" DECIMAL(10,2),
    "sourceBookingId" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tire_sets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "storage_periods" (
    "id" TEXT NOT NULL,
    "tireSetId" TEXT NOT NULL,
    "storedAt" TIMESTAMP(3) NOT NULL,
    "releaseDue" TIMESTAMP(3),
    "pickedUpAt" TIMESTAMP(3),
    "pricePln" DECIMAL(10,2),
    "notes" TEXT,

    CONSTRAINT "storage_periods_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "depot_slots_providerId_idx" ON "depot_slots"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "depot_slots_providerId_section_row_position_key" ON "depot_slots"("providerId", "section", "row", "position");

-- CreateIndex
CREATE INDEX "tire_sets_providerId_status_idx" ON "tire_sets"("providerId", "status");

-- CreateIndex
CREATE INDEX "tire_sets_providerId_clientPhone_idx" ON "tire_sets"("providerId", "clientPhone");

-- CreateIndex
CREATE INDEX "storage_periods_tireSetId_idx" ON "storage_periods"("tireSetId");

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_variants" ADD CONSTRAINT "service_variants_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_sub_links" ADD CONSTRAINT "service_sub_links_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_sub_links" ADD CONSTRAINT "service_sub_links_subId_fkey" FOREIGN KEY ("subId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addons" ADD CONSTRAINT "addons_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_addon_links" ADD CONSTRAINT "service_addon_links_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_addon_links" ADD CONSTRAINT "service_addon_links_addonId_fkey" FOREIGN KEY ("addonId") REFERENCES "addons"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "depot_slots" ADD CONSTRAINT "depot_slots_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tire_sets" ADD CONSTRAINT "tire_sets_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tire_sets" ADD CONSTRAINT "tire_sets_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tire_sets" ADD CONSTRAINT "tire_sets_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "depot_slots"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tire_sets" ADD CONSTRAINT "tire_sets_sourceBookingId_fkey" FOREIGN KEY ("sourceBookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "storage_periods" ADD CONSTRAINT "storage_periods_tireSetId_fkey" FOREIGN KEY ("tireSetId") REFERENCES "tire_sets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
