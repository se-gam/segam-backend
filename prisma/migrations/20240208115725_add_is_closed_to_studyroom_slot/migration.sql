/*
  Warnings:

  - Added the required column `is_closed` to the `studyroom_slot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "studyroom_slot" ADD COLUMN     "is_closed" BOOLEAN NOT NULL;
