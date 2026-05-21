-- ServiceVariant: dodaj pola ceny i czasu per koło (null = dziedziczone z zestawu / 4)

ALTER TABLE "service_variants"
  ADD COLUMN "pricePerWheelPln"        DECIMAL(10, 2),
  ADD COLUMN "durationPerWheelMinutes" INTEGER;
