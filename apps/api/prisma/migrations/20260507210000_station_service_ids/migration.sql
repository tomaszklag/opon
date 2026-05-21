-- Replace ServiceType[] enum array with plain String[] for service IDs
ALTER TABLE "stations" DROP COLUMN "services";
ALTER TABLE "stations" ADD COLUMN "serviceIds" TEXT[] NOT NULL DEFAULT '{}';
