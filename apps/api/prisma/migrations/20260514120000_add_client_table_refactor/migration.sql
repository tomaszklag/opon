-- Migration: add_client_table_refactor
-- Creates a dedicated Client table (per-provider CRM) and migrates
-- Booking.clientId, Review.clientId, TireSet.clientId from User → Client.

-- ── 1. Create clients table ───────────────────────────────────────────────────

CREATE TABLE "clients" (
  "id"         UUID         NOT NULL DEFAULT gen_random_uuid(),
  "providerId" TEXT         NOT NULL,
  "phone"      VARCHAR(20)  NOT NULL,
  "firstName"  VARCHAR(100),
  "lastName"   VARCHAR(100),
  "notes"      TEXT,
  "userId"     TEXT,
  "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "clients_providerId_phone_key" ON "clients"("providerId", "phone");
CREATE INDEX "clients_providerId_lastName_idx"    ON "clients"("providerId", "lastName");

-- ── 2. Populate clients from bookings (each unique provider+phone pair) ───────

INSERT INTO "clients" ("providerId", "phone", "firstName", "lastName", "userId", "createdAt", "updatedAt")
SELECT DISTINCT ON (b."providerId", u."phone")
  b."providerId",
  u."phone",
  u."firstName",
  u."lastName",
  u."id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "bookings" b
JOIN "users" u ON u."id" = b."clientId"
ON CONFLICT ("providerId", "phone") DO NOTHING;

-- ── 3. Add temporary new-FK columns (nullable) ────────────────────────────────

ALTER TABLE "bookings"  ADD COLUMN "clientIdNew" UUID;
ALTER TABLE "reviews"   ADD COLUMN "clientIdNew" UUID;
ALTER TABLE "tire_sets" ADD COLUMN "clientIdNew" UUID;

-- ── 4. Populate bookings.clientIdNew ─────────────────────────────────────────

UPDATE "bookings"
SET "clientIdNew" = c."id"
FROM "clients" c, "users" u
WHERE u."id" = "bookings"."clientId"
  AND c."providerId" = "bookings"."providerId"
  AND c."phone" = u."phone";

-- ── 5. Populate reviews.clientIdNew ──────────────────────────────────────────

UPDATE "reviews"
SET "clientIdNew" = c."id"
FROM "clients" c, "users" u
WHERE u."id" = "reviews"."clientId"
  AND c."providerId" = "reviews"."providerId"
  AND c."phone" = u."phone";

-- ── 6. Populate clients from tire_sets (may add new entries not in bookings) ──

INSERT INTO "clients" ("providerId", "phone", "firstName", "lastName", "userId", "createdAt", "updatedAt")
SELECT
  ts."providerId",
  ts."clientPhone",
  split_part(ts."clientName", ' ', 1),
  NULLIF(TRIM(SUBSTRING(ts."clientName" FROM LENGTH(split_part(ts."clientName", ' ', 1)) + 2)), ''),
  u."id",
  CURRENT_TIMESTAMP,
  CURRENT_TIMESTAMP
FROM "tire_sets" ts
LEFT JOIN "users" u ON u."phone" = ts."clientPhone"
WHERE ts."clientPhone" IS NOT NULL AND ts."clientPhone" <> ''
ON CONFLICT ("providerId", "phone") DO NOTHING;

-- Link tire_sets.clientIdNew from matching client records
UPDATE "tire_sets"
SET "clientIdNew" = c."id"
FROM "clients" c
WHERE c."providerId" = "tire_sets"."providerId"
  AND c."phone" = "tire_sets"."clientPhone";

-- Fallback for tire_sets that had a userId-based clientId but no clientPhone
UPDATE "tire_sets"
SET "clientIdNew" = c."id"
FROM "clients" c, "users" u
WHERE u."id" = "tire_sets"."clientId"
  AND c."providerId" = "tire_sets"."providerId"
  AND c."phone" = u."phone"
  AND "tire_sets"."clientIdNew" IS NULL;

-- ── 7. Drop old FK constraints ────────────────────────────────────────────────

ALTER TABLE "bookings"  DROP CONSTRAINT IF EXISTS "bookings_clientId_fkey";
ALTER TABLE "reviews"   DROP CONSTRAINT IF EXISTS "reviews_clientId_fkey";
ALTER TABLE "tire_sets" DROP CONSTRAINT IF EXISTS "tire_sets_clientId_fkey";

DROP INDEX IF EXISTS "bookings_clientId_startAt_idx";
DROP INDEX IF EXISTS "tire_sets_providerId_clientPhone_idx";

-- ── 8. Drop legacy columns from tire_sets ────────────────────────────────────

ALTER TABLE "tire_sets" DROP COLUMN IF EXISTS "clientName";
ALTER TABLE "tire_sets" DROP COLUMN IF EXISTS "clientPhone";

-- ── 9. Swap old clientId → new clientId ──────────────────────────────────────

ALTER TABLE "bookings"  DROP COLUMN "clientId";
ALTER TABLE "reviews"   DROP COLUMN "clientId";
ALTER TABLE "tire_sets" DROP COLUMN "clientId";

ALTER TABLE "bookings"  RENAME COLUMN "clientIdNew" TO "clientId";
ALTER TABLE "reviews"   RENAME COLUMN "clientIdNew" TO "clientId";
ALTER TABLE "tire_sets" RENAME COLUMN "clientIdNew" TO "clientId";

-- ── 10. Add NOT NULL constraints ──────────────────────────────────────────────

ALTER TABLE "bookings"  ALTER COLUMN "clientId" SET NOT NULL;
ALTER TABLE "reviews"   ALTER COLUMN "clientId" SET NOT NULL;
ALTER TABLE "tire_sets" ALTER COLUMN "clientId" SET NOT NULL;

-- ── 11. Add FK constraints pointing to clients ────────────────────────────────

ALTER TABLE "clients" ADD CONSTRAINT "clients_providerId_fkey"
  FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "clients" ADD CONSTRAINT "clients_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE "bookings" ADD CONSTRAINT "bookings_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "reviews" ADD CONSTRAINT "reviews_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "tire_sets" ADD CONSTRAINT "tire_sets_clientId_fkey"
  FOREIGN KEY ("clientId") REFERENCES "clients"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── 12. Add new indexes ───────────────────────────────────────────────────────

CREATE INDEX "bookings_clientId_idx"             ON "bookings"("clientId");
CREATE INDEX "tire_sets_providerId_clientId_idx" ON "tire_sets"("providerId", "clientId");
