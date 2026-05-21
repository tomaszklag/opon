/*
  Warnings:

  - You are about to drop the `working_hours` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "working_hours" DROP CONSTRAINT "working_hours_providerId_fkey";

-- DropTable
DROP TABLE "working_hours";
