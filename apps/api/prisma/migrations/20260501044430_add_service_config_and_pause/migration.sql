-- AlterTable
ALTER TABLE "providers" ADD COLUMN     "pausedUntil" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "service_configs" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "serviceType" "ServiceType" NOT NULL,
    "durationMinutes" INTEGER NOT NULL DEFAULT 45,

    CONSTRAINT "service_configs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "service_configs_providerId_serviceType_key" ON "service_configs"("providerId", "serviceType");

-- AddForeignKey
ALTER TABLE "service_configs" ADD CONSTRAINT "service_configs_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
