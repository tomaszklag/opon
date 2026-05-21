-- CreateEnum
CREATE TYPE "SurchargeScope" AS ENUM ('PER_WHEEL', 'PER_SENSOR');

-- AlterEnum
ALTER TYPE "SizeTier" ADD VALUE 'XL';

-- AlterTable
ALTER TABLE "providers" ADD COLUMN     "tpmsPricePln" DECIMAL(10,2),
ADD COLUMN     "travelFeeZone1Pln" DECIMAL(10,2) NOT NULL DEFAULT 0,
ADD COLUMN     "travelFeeZone2Pln" DECIMAL(10,2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "service_groups" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "pricingMode" VARCHAR(20) NOT NULL DEFAULT 'PER_SET',
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_variants" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "rim_tiers" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "rimSizes" TEXT[],
    "pricePln" DECIMAL(10,2) NOT NULL,
    "durationMinutes" INTEGER NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "rim_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sub_service_configs" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "included" BOOLEAN NOT NULL DEFAULT false,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "fromCatalog" BOOLEAN NOT NULL DEFAULT false,
    "pricePln" DECIMAL(10,2),
    "durationMinutes" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "sub_service_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "surcharges" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT true,
    "scope" "SurchargeScope" NOT NULL DEFAULT 'PER_WHEEL',
    "pricePln" DECIMAL(10,2) NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "surcharges_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "service_groups_providerId_idx" ON "service_groups"("providerId");

-- CreateIndex
CREATE INDEX "service_variants_groupId_idx" ON "service_variants"("groupId");

-- CreateIndex
CREATE INDEX "rim_tiers_variantId_idx" ON "rim_tiers"("variantId");

-- CreateIndex
CREATE INDEX "sub_service_configs_variantId_idx" ON "sub_service_configs"("variantId");

-- CreateIndex
CREATE INDEX "surcharges_providerId_idx" ON "surcharges"("providerId");

-- AddForeignKey
ALTER TABLE "service_groups" ADD CONSTRAINT "service_groups_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_variants" ADD CONSTRAINT "service_variants_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "service_groups"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "rim_tiers" ADD CONSTRAINT "rim_tiers_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "service_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sub_service_configs" ADD CONSTRAINT "sub_service_configs_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "service_variants"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "surcharges" ADD CONSTRAINT "surcharges_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
