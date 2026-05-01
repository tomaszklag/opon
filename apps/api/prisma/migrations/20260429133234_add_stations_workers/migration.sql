-- CreateEnum
CREATE TYPE "ServiceType" AS ENUM ('SEASONAL_SWAP', 'WHEEL_SWAP', 'BALANCING', 'PUNCTURE_REPAIR');

-- CreateEnum
CREATE TYPE "SizeTier" AS ENUM ('S', 'M', 'L');

-- CreateEnum
CREATE TYPE "LeaveType" AS ENUM ('VACATION', 'UNPAID', 'SICK', 'OTHER');

-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "stationId" TEXT;

-- CreateTable
CREATE TABLE "stations" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "services" "ServiceType"[],
    "schedule" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "workers" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "role" VARCHAR(100),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "workers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "station_workers" (
    "stationId" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "shiftStart" VARCHAR(5),
    "shiftEnd" VARCHAR(5),

    CONSTRAINT "station_workers_pkey" PRIMARY KEY ("stationId","workerId")
);

-- CreateTable
CREATE TABLE "worker_leaves" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "type" "LeaveType" NOT NULL,
    "startDate" DATE NOT NULL,
    "endDate" DATE NOT NULL,
    "note" VARCHAR(500),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_leaves_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "stations"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stations" ADD CONSTRAINT "stations_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "workers" ADD CONSTRAINT "workers_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "station_workers" ADD CONSTRAINT "station_workers_stationId_fkey" FOREIGN KEY ("stationId") REFERENCES "stations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "station_workers" ADD CONSTRAINT "station_workers_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_leaves" ADD CONSTRAINT "worker_leaves_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
