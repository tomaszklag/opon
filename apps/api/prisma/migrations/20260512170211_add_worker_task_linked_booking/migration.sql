-- AlterTable
ALTER TABLE "worker_tasks" ADD COLUMN     "linkedBookingId" VARCHAR(36);

-- AddForeignKey
ALTER TABLE "worker_tasks" ADD CONSTRAINT "worker_tasks_linkedBookingId_fkey" FOREIGN KEY ("linkedBookingId") REFERENCES "bookings"("id") ON DELETE SET NULL ON UPDATE CASCADE;
