-- CreateTable
CREATE TABLE "worker_tasks" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "workerId" TEXT,
    "title" VARCHAR(200) NOT NULL,
    "startAt" TIMESTAMP(3) NOT NULL,
    "endAt" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worker_tasks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "worker_tasks_providerId_startAt_idx" ON "worker_tasks"("providerId", "startAt");

-- AddForeignKey
ALTER TABLE "worker_tasks" ADD CONSTRAINT "worker_tasks_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worker_tasks" ADD CONSTRAINT "worker_tasks_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "workers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
