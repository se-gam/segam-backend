/*
  Warnings:

  - Added the required column `starts_at` to the `lecture` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "lecture" ADD COLUMN     "starts_at" TIMESTAMP(3) NOT NULL;
