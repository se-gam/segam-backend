DELETE FROM "studyroom_reservation"
WHERE "starts_at" IS NULL OR "duration" IS NULL;

ALTER TABLE "studyroom_reservation"
  ALTER COLUMN "starts_at" SET NOT NULL,
  ALTER COLUMN "duration" SET NOT NULL;
