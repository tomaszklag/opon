-- AlterTable
ALTER TABLE "bookings" ADD COLUMN     "workerId" VARCHAR(36);

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
