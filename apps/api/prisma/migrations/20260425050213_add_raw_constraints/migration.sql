-- Partial unique index: zapobiega double-bookingowi na poziomie DB
-- Tylko jeden booking w statusie PENDING/CONFIRMED/IN_PROGRESS może zajmować
-- dany slot u danego providera w tym samym czasie.
CREATE UNIQUE INDEX "bookings_no_double_booking"
  ON "bookings" ("providerId", "startAt")
  WHERE status IN ('PENDING', 'CONFIRMED', 'IN_PROGRESS');

-- CHECK constraint: ocena musi być w zakresie 1-5
ALTER TABLE "reviews"
  ADD CONSTRAINT "reviews_rating_range"
  CHECK (rating BETWEEN 1 AND 5);
