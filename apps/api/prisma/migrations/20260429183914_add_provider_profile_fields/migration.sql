-- AlterEnum
ALTER TYPE "ProviderType" ADD VALUE 'BOTH';

-- AlterTable
ALTER TABLE "providers" ADD COLUMN     "additionalServices" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "address" VARCHAR(300),
ADD COLUMN     "foundedYear" INTEGER,
ADD COLUMN     "showPhone" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "tagline" VARCHAR(80),
ADD COLUMN     "tireSizes" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "vehicleTypes" TEXT[] DEFAULT ARRAY[]::TEXT[];
