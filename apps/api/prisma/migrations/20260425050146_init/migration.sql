-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CLIENT', 'PROVIDER_OWNER', 'PROVIDER_STAFF', 'ADMIN');

-- CreateEnum
CREATE TYPE "ProviderType" AS ENUM ('MOBILE', 'STATIONARY');

-- CreateEnum
CREATE TYPE "ProviderStatus" AS ENUM ('PENDING_NIP', 'PENDING_DOCS', 'PENDING_APPROVAL', 'APPROVED', 'SUSPENDED', 'REJECTED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED_BY_CLIENT', 'CANCELLED_BY_PROVIDER', 'CANCELLED_BY_SYSTEM', 'NO_SHOW', 'REJECTED');

-- CreateEnum
CREATE TYPE "ConsentType" AS ENUM ('TERMS', 'PRIVACY', 'MARKETING');

-- CreateEnum
CREATE TYPE "WaitlistRole" AS ENUM ('CLIENT', 'PROVIDER');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "email" VARCHAR(254),
    "role" "UserRole" NOT NULL DEFAULT 'CLIENT',
    "firstName" VARCHAR(100),
    "lastName" VARCHAR(100),
    "noShowCount" INTEGER NOT NULL DEFAULT 0,
    "isBanned" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "nickname" VARCHAR(100) NOT NULL,
    "tireSize" VARCHAR(20) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "providers" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "slug" VARCHAR(100),
    "nip" VARCHAR(10) NOT NULL,
    "type" "ProviderType" NOT NULL DEFAULT 'MOBILE',
    "status" "ProviderStatus" NOT NULL DEFAULT 'PENDING_NIP',
    "description" TEXT,
    "logoUrl" VARCHAR(500),
    "phone" VARCHAR(20),
    "email" VARCHAR(254),
    "ownerId" TEXT NOT NULL,
    "cityCenterLat" DECIMAL(9,6),
    "cityCenterLng" DECIMAL(9,6),
    "serviceRadiusKm" INTEGER NOT NULL DEFAULT 10,
    "avgRating" DECIMAL(3,2) NOT NULL DEFAULT 0,
    "reviewCount" INTEGER NOT NULL DEFAULT 0,
    "bankAccountIban" VARCHAR(34),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approvedAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "providers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "provider_photos" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "url" VARCHAR(500) NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "provider_photos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pricing_tiers" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "rimSizeMin" INTEGER NOT NULL,
    "rimSizeMax" INTEGER NOT NULL,
    "priceSwapPln" DECIMAL(10,2) NOT NULL,
    "priceBalancingPerWheelPln" DECIMAL(10,2),
    "travelFeeFirstKmPln" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "travelFeeExtraKmPln" DECIMAL(10,2) NOT NULL DEFAULT 0,

    CONSTRAINT "pricing_tiers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "working_hours" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "openTime" TIME(6) NOT NULL,
    "closeTime" TIME(6) NOT NULL,
    "slotMinutes" INTEGER NOT NULL DEFAULT 45,
    "isClosed" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "working_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "schedule_exceptions" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "reason" VARCHAR(200) NOT NULL,
    "customOpenTime" TIME(6),
    "customCloseTime" TIME(6),

    CONSTRAINT "schedule_exceptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "referenceCode" VARCHAR(10) NOT NULL,
    "clientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "vehicleId" TEXT,
    "pricingTierId" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "addressLine" VARCHAR(300),
    "addressCity" VARCHAR(100),
    "addressLat" DECIMAL(9,6),
    "addressLng" DECIMAL(9,6),
    "tireSize" VARCHAR(20),
    "basePricePln" DECIMAL(10,2),
    "travelFeePln" DECIMAL(10,2),
    "totalPricePln" DECIMAL(10,2),
    "notes" TEXT,
    "rejectReason" VARCHAR(500),
    "cancelReason" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "confirmedAt" TIMESTAMP(3),
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "cancelledAt" TIMESTAMP(3),

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reviews" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "providerReply" TEXT,
    "providerRepliedAt" TIMESTAMP(3),
    "isReported" BOOLEAN NOT NULL DEFAULT false,
    "isHidden" BOOLEAN NOT NULL DEFAULT false,
    "seenByProvider" BOOLEAN NOT NULL DEFAULT false,
    "editCount" INTEGER NOT NULL DEFAULT 0,
    "lastEditedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otp_tokens" (
    "id" TEXT NOT NULL,
    "phone" VARCHAR(20) NOT NULL,
    "codeHash" VARCHAR(200) NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "otp_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "consent_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "providerId" TEXT,
    "consentType" "ConsentType" NOT NULL,
    "version" VARCHAR(20) NOT NULL,
    "accepted" BOOLEAN NOT NULL,
    "ipAddress" VARCHAR(45),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "consent_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "waitlist_signups" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "city" VARCHAR(100) NOT NULL,
    "role" "WaitlistRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "waitlist_signups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "actorId" TEXT,
    "entity" VARCHAR(50) NOT NULL,
    "entityId" VARCHAR(36) NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "payload" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "vehicles_userId_idx" ON "vehicles"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "providers_slug_key" ON "providers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "providers_nip_key" ON "providers"("nip");

-- CreateIndex
CREATE UNIQUE INDEX "providers_ownerId_key" ON "providers"("ownerId");

-- CreateIndex
CREATE INDEX "provider_photos_providerId_idx" ON "provider_photos"("providerId");

-- CreateIndex
CREATE UNIQUE INDEX "pricing_tiers_providerId_rimSizeMin_rimSizeMax_key" ON "pricing_tiers"("providerId", "rimSizeMin", "rimSizeMax");

-- CreateIndex
CREATE UNIQUE INDEX "working_hours_providerId_dayOfWeek_key" ON "working_hours"("providerId", "dayOfWeek");

-- CreateIndex
CREATE UNIQUE INDEX "schedule_exceptions_providerId_date_key" ON "schedule_exceptions"("providerId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_referenceCode_key" ON "bookings"("referenceCode");

-- CreateIndex
CREATE INDEX "bookings_providerId_startAt_idx" ON "bookings"("providerId", "startAt");

-- CreateIndex
CREATE INDEX "bookings_clientId_startAt_idx" ON "bookings"("clientId", "startAt" DESC);

-- CreateIndex
CREATE UNIQUE INDEX "reviews_bookingId_key" ON "reviews"("bookingId");

-- CreateIndex
CREATE INDEX "reviews_providerId_createdAt_idx" ON "reviews"("providerId", "createdAt" DESC);

-- CreateIndex
CREATE INDEX "otp_tokens_phone_expiresAt_idx" ON "otp_tokens"("phone", "expiresAt");

-- CreateIndex
CREATE INDEX "consent_logs_userId_consentType_idx" ON "consent_logs"("userId", "consentType");

-- CreateIndex
CREATE INDEX "waitlist_signups_city_role_idx" ON "waitlist_signups"("city", "role");

-- CreateIndex
CREATE UNIQUE INDEX "waitlist_signups_email_city_role_key" ON "waitlist_signups"("email", "city", "role");

-- CreateIndex
CREATE INDEX "audit_logs_entity_entityId_idx" ON "audit_logs"("entity", "entityId");

-- CreateIndex
CREATE INDEX "audit_logs_actorId_idx" ON "audit_logs"("actorId");

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "providers" ADD CONSTRAINT "providers_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "provider_photos" ADD CONSTRAINT "provider_photos_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pricing_tiers" ADD CONSTRAINT "pricing_tiers_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "working_hours" ADD CONSTRAINT "working_hours_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "schedule_exceptions" ADD CONSTRAINT "schedule_exceptions_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "vehicles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_pricingTierId_fkey" FOREIGN KEY ("pricingTierId") REFERENCES "pricing_tiers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reviews" ADD CONSTRAINT "reviews_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "consent_logs" ADD CONSTRAINT "consent_logs_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
