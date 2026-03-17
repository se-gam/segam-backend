-- Migration: sync_studyroom_reservation_schema
-- Description: Sync DB schema with current Prisma schema
-- WARNING: This migration is DESTRUCTIVE. Backup required before execution.
--
-- Changes:
-- 1. Drop orphan tables: reservation_slot, user_reservation
-- 2. Restructure studyroom_reservation table to match new schema

-- DropForeignKey
ALTER TABLE "reservation_slot" DROP CONSTRAINT "reservation_slot_reservation_id_fkey";
ALTER TABLE "reservation_slot" DROP CONSTRAINT "reservation_slot_slot_id_fkey";
ALTER TABLE "studyroom_reservation" DROP CONSTRAINT "studyroom_reservation_studyroom_id_fkey";
ALTER TABLE "user_reservation" DROP CONSTRAINT "user_reservation_reservation_id_fkey";
ALTER TABLE "user_reservation" DROP CONSTRAINT "user_reservation_student_id_fkey";

-- DropTable (orphan tables)
DROP TABLE "reservation_slot";
DROP TABLE "user_reservation";

-- TRUNCATE studyroom_reservation (old schema data is incompatible with new schema)
TRUNCATE TABLE "studyroom_reservation" CASCADE;

-- AlterTable: studyroom_reservation
-- Drop old columns
ALTER TABLE "studyroom_reservation" DROP COLUMN "cancelReason";
ALTER TABLE "studyroom_reservation" DROP COLUMN "deletedAt";
ALTER TABLE "studyroom_reservation" DROP COLUMN "pid";
ALTER TABLE "studyroom_reservation" DROP COLUMN "reserveReason";
ALTER TABLE "studyroom_reservation" DROP COLUMN "studyroom_id";

-- Add new columns
ALTER TABLE "studyroom_reservation" ADD COLUMN "booking_id" TEXT;
ALTER TABLE "studyroom_reservation" ADD COLUMN "date" DATE NOT NULL;
ALTER TABLE "studyroom_reservation" ADD COLUMN "deleted_at" TIMESTAMP(3);
ALTER TABLE "studyroom_reservation" ADD COLUMN "duration" INTEGER NOT NULL;
ALTER TABLE "studyroom_reservation" ADD COLUMN "ipid" TEXT;
ALTER TABLE "studyroom_reservation" ADD COLUMN "room_name" TEXT NOT NULL;
ALTER TABLE "studyroom_reservation" ADD COLUMN "starts_at" TEXT NOT NULL;
ALTER TABLE "studyroom_reservation" ADD COLUMN "visitor_id" TEXT NOT NULL;

-- Fix id sequence
CREATE SEQUENCE IF NOT EXISTS studyroom_reservation_id_seq;
ALTER TABLE "studyroom_reservation" ALTER COLUMN "id" SET DEFAULT nextval('studyroom_reservation_id_seq');
ALTER SEQUENCE studyroom_reservation_id_seq OWNED BY "studyroom_reservation"."id";
SELECT setval('studyroom_reservation_id_seq', COALESCE((SELECT MAX(id) FROM "studyroom_reservation"), 1));

-- AddForeignKey
ALTER TABLE "studyroom_reservation" ADD CONSTRAINT "studyroom_reservation_visitor_id_fkey" FOREIGN KEY ("visitor_id") REFERENCES "user"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;
