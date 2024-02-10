/*
  Warnings:

  - You are about to drop the column `start_at` on the `studyroom_slot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[studyroom_id,date,starts_at]` on the table `studyroom_slot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `starts_at` to the `studyroom_slot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "studyroom_slot" DROP COLUMN "start_at",
ADD COLUMN     "starts_at" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "studyroom_slot_studyroom_id_date_starts_at_key" ON "studyroom_slot"("studyroom_id", "date", "starts_at");
