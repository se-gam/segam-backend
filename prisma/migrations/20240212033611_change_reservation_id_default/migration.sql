/*
  Warnings:

  - A unique constraint covering the columns `[pid]` on the table `studyroom_reservation` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "studyroom_reservation" ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "studyroom_reservation_id_seq";

-- CreateIndex
CREATE UNIQUE INDEX "studyroom_reservation_pid_key" ON "studyroom_reservation"("pid");
