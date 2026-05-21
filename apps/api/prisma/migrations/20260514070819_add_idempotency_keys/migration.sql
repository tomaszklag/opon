-- CreateTable
CREATE TABLE "idempotency_keys" (
    "scopedKey" VARCHAR(200) NOT NULL,
    "payloadHash" VARCHAR(64) NOT NULL,
    "statusCode" INTEGER NOT NULL,
    "response" JSONB NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "idempotency_keys_pkey" PRIMARY KEY ("scopedKey")
);

-- CreateIndex
CREATE INDEX "idempotency_keys_expiresAt_idx" ON "idempotency_keys"("expiresAt");
