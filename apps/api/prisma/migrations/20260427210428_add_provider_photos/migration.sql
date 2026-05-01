/*
  Warnings:

  - You are about to drop the column `order` on the `provider_photos` table. All the data in the column will be lost.
  - Added the required column `mimeType` to the `provider_photos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `originalName` to the `provider_photos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `size` to the `provider_photos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `storageKey` to the `provider_photos` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type` to the `provider_photos` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PhotoType" AS ENUM ('LOGO', 'VEHICLE', 'WORKSPACE', 'ADDITIONAL');

-- AlterTable
ALTER TABLE "provider_photos" DROP COLUMN "order",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "isPrimary" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mimeType" VARCHAR(100) NOT NULL,
ADD COLUMN     "originalName" VARCHAR(255) NOT NULL,
ADD COLUMN     "size" INTEGER NOT NULL,
ADD COLUMN     "storageKey" VARCHAR(500) NOT NULL,
ADD COLUMN     "type" "PhotoType" NOT NULL;
