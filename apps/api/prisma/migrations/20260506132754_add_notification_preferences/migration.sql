-- CreateTable
CREATE TABLE "notification_preferences" (
    "id" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "newBookingSms" BOOLEAN NOT NULL DEFAULT true,
    "newBookingEmail" BOOLEAN NOT NULL DEFAULT false,
    "newBookingPush" BOOLEAN NOT NULL DEFAULT true,
    "cancelationSms" BOOLEAN NOT NULL DEFAULT true,
    "cancelationEmail" BOOLEAN NOT NULL DEFAULT false,
    "cancelationPush" BOOLEAN NOT NULL DEFAULT true,
    "reminder30Sms" BOOLEAN NOT NULL DEFAULT true,
    "reminder30Email" BOOLEAN NOT NULL DEFAULT false,
    "reminder30Push" BOOLEAN NOT NULL DEFAULT true,
    "newReviewSms" BOOLEAN NOT NULL DEFAULT false,
    "newReviewEmail" BOOLEAN NOT NULL DEFAULT true,
    "newReviewPush" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReportSms" BOOLEAN NOT NULL DEFAULT false,
    "weeklyReportEmail" BOOLEAN NOT NULL DEFAULT true,
    "weeklyReportPush" BOOLEAN NOT NULL DEFAULT false,
    "platformNewsSms" BOOLEAN NOT NULL DEFAULT false,
    "platformNewsEmail" BOOLEAN NOT NULL DEFAULT false,
    "platformNewsPush" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "notification_preferences_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "notification_preferences_providerId_key" ON "notification_preferences"("providerId");

-- AddForeignKey
ALTER TABLE "notification_preferences" ADD CONSTRAINT "notification_preferences_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "providers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
