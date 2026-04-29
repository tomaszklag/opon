-- AlterTable: PricingTier — zastąp rimSizeMin/rimSizeMax przez sizeTier (SizeTier enum)
ALTER TABLE "pricing_tiers" DROP CONSTRAINT IF EXISTS "pricing_tiers_providerId_rimSizeMin_rimSizeMax_key";

ALTER TABLE "pricing_tiers"
  ADD COLUMN "sizeTier" "SizeTier";

-- Przenieś istniejące dane: mapowanie rim size -> SizeTier
UPDATE "pricing_tiers"
  SET "sizeTier" = CASE
    WHEN "rimSizeMax" <= 15 THEN 'S'::"SizeTier"
    WHEN "rimSizeMin" >= 16 AND "rimSizeMax" <= 17 THEN 'M'::"SizeTier"
    ELSE 'L'::"SizeTier"
  END;

-- Ustaw NOT NULL po wypełnieniu danych
ALTER TABLE "pricing_tiers"
  ALTER COLUMN "sizeTier" SET NOT NULL;

-- Usuń stare kolumny
ALTER TABLE "pricing_tiers"
  DROP COLUMN "rimSizeMin",
  DROP COLUMN "rimSizeMax";

-- Nowy unique constraint
ALTER TABLE "pricing_tiers"
  ADD CONSTRAINT "pricing_tiers_providerId_sizeTier_key" UNIQUE ("providerId", "sizeTier");

-- AlterTable: Booking — dodaj serviceType, sizeTier, tpmsRequired
ALTER TABLE "bookings"
  ADD COLUMN "serviceType" "ServiceType",
  ADD COLUMN "sizeTier" "SizeTier",
  ADD COLUMN "tpmsRequired" BOOLEAN NOT NULL DEFAULT false;

-- Index: StationWorker — dodaj indeks na workerId
CREATE INDEX "station_workers_workerId_idx" ON "station_workers"("workerId");
