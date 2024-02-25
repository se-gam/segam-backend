/*
  Warnings:

  - Added the required column `studyroom_id` to the `studyroom_reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "studyroom_reservation" ADD COLUMN     "studyroom_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "studyroom_reservation" ADD CONSTRAINT "studyroom_reservation_studyroom_id_fkey" FOREIGN KEY ("studyroom_id") REFERENCES "studyroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
