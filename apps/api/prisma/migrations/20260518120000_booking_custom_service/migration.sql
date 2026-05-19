-- AlterTable: custom service fields on bookings
ALTER TABLE "bookings"
  ADD COLUMN "isCustomService"       BOOLEAN       NOT NULL DEFAULT false,
  ADD COLUMN "customPricePln"        DECIMAL(10,2),
  ADD COLUMN "customDurationMinutes" INTEGER;

-- Index for autocomplete history queries (provider-scoped, custom only)
CREATE INDEX "bookings_providerId_isCustomService_serviceName_idx"
  ON "bookings" ("providerId", "isCustomService", "serviceName");
