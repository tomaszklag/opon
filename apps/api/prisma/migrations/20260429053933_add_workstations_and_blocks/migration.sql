-- AlterTable
ALTER TABLE "working_hours" ADD COLUMN     "blocks" JSONB,
ADD COLUMN     "workstations" INTEGER NOT NULL DEFAULT 1;
