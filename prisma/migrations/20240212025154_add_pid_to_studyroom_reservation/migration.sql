/*
  Warnings:

  - Added the required column `pid` to the `studyroom_reservation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "studyroom_reservation" ADD COLUMN     "pid" INTEGER NOT NULL;
