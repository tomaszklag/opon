ALTER TABLE "bookings" DROP COLUMN IF EXISTS "serviceType";
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "sizeTier";
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "tpmsRequired";
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "pricingTierId";
DROP TABLE IF EXISTS "pricing_tiers";
DROP TYPE IF EXISTS "SizeTier";
