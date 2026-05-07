-- Redesign: zastąpienie ServiceGroup/ServiceVariant/RimTier/SubServiceConfig/Surcharge
-- nowym modelem Service (FLAT | VARIANTS | RIM_SIZES) + Addon + linki

-- ── Usuń stare tabele (kolejność wg FK) ──────────────────────────────────────

DROP TABLE IF EXISTS "sub_service_configs";
DROP TABLE IF EXISTS "rim_tiers";
DROP TABLE IF EXISTS "service_variants";
DROP TABLE IF EXISTS "service_groups";
DROP TABLE IF EXISTS "surcharges";

-- ── Usuń stary enum ───────────────────────────────────────────────────────────

DROP TYPE IF EXISTS "SurchargeScope";

-- ── Nowy enum ─────────────────────────────────────────────────────────────────

CREATE TYPE "ServicePricingType" AS ENUM ('FLAT', 'VARIANTS', 'RIM_SIZES');

-- ── Nowe tabele ───────────────────────────────────────────────────────────────

CREATE TABLE "services" (
    "id"          TEXT                NOT NULL,
    "providerId"  TEXT                NOT NULL,
    "name"        VARCHAR(200)        NOT NULL,
    "description" VARCHAR(1000),
    "pricingType" "ServicePricingType" NOT NULL DEFAULT 'FLAT',
    "sortOrder"   INTEGER             NOT NULL DEFAULT 0,
    "createdAt"   TIMESTAMP(3)        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   TIMESTAMP(3)        NOT NULL,
    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "service_variants" (
    "id"              TEXT         NOT NULL,
    "serviceId"       TEXT         NOT NULL,
    "name"            VARCHAR(200),
    "rimSizes"        TEXT[]       NOT NULL DEFAULT ARRAY[]::TEXT[],
    "pricePln"        DECIMAL(10,2) NOT NULL,
    "durationMinutes" INTEGER      NOT NULL,
    "sortOrder"       INTEGER      NOT NULL DEFAULT 0,
    CONSTRAINT "service_variants_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "service_sub_links" (
    "id"        TEXT    NOT NULL,
    "parentId"  TEXT    NOT NULL,
    "subId"     TEXT    NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "service_sub_links_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "addons" (
    "id"              TEXT         NOT NULL,
    "providerId"      TEXT         NOT NULL,
    "name"            VARCHAR(200) NOT NULL,
    "pricePln"        DECIMAL(10,2) NOT NULL,
    "durationMinutes" INTEGER,
    "sortOrder"       INTEGER      NOT NULL DEFAULT 0,
    "createdAt"       TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "addons_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "service_addon_links" (
    "serviceId" TEXT    NOT NULL,
    "addonId"   TEXT    NOT NULL,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "service_addon_links_pkey" PRIMARY KEY ("serviceId","addonId")
);

-- ── Indeksy ───────────────────────────────────────────────────────────────────

CREATE INDEX "services_providerId_idx"            ON "services"("providerId");
CREATE INDEX "service_variants_serviceId_idx"     ON "service_variants"("serviceId");
CREATE UNIQUE INDEX "service_sub_links_parentId_subId_key" ON "service_sub_links"("parentId","subId");
CREATE INDEX "service_sub_links_parentId_idx"     ON "service_sub_links"("parentId");
CREATE INDEX "addons_providerId_idx"              ON "addons"("providerId");
CREATE INDEX "service_addon_links_addonId_idx"   ON "service_addon_links"("addonId");

-- ── Klucze obce ───────────────────────────────────────────────────────────────

ALTER TABLE "services"
    ADD CONSTRAINT "services_providerId_fkey"
    FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE;

ALTER TABLE "service_variants"
    ADD CONSTRAINT "service_variants_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE;

ALTER TABLE "service_sub_links"
    ADD CONSTRAINT "service_sub_links_parentId_fkey"
    FOREIGN KEY ("parentId") REFERENCES "services"("id") ON DELETE CASCADE;

ALTER TABLE "service_sub_links"
    ADD CONSTRAINT "service_sub_links_subId_fkey"
    FOREIGN KEY ("subId") REFERENCES "services"("id") ON DELETE CASCADE;

ALTER TABLE "addons"
    ADD CONSTRAINT "addons_providerId_fkey"
    FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE;

ALTER TABLE "service_addon_links"
    ADD CONSTRAINT "service_addon_links_serviceId_fkey"
    FOREIGN KEY ("serviceId") REFERENCES "services"("id") ON DELETE CASCADE;

ALTER TABLE "service_addon_links"
    ADD CONSTRAINT "service_addon_links_addonId_fkey"
    FOREIGN KEY ("addonId") REFERENCES "addons"("id") ON DELETE CASCADE;
