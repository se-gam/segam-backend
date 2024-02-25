/*
  Warnings:

  - Added the required column `ecampus_id` to the `lecture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "course" ADD COLUMN     "ecampus_id" TEXT;

-- AlterTable
ALTER TABLE "lecture" ADD COLUMN     "ecampus_id" TEXT NOT NULL;
