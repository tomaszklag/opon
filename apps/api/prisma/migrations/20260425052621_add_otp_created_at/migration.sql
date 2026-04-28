-- AlterTable
ALTER TABLE "otp_tokens" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "otp_tokens_phone_createdAt_idx" ON "otp_tokens"("phone", "createdAt");
