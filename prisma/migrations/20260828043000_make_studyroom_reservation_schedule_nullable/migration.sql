ALTER TABLE "studyroom_reservation"
  ALTER COLUMN "starts_at" DROP NOT NULL,
  ALTER COLUMN "duration" DROP NOT NULL;
