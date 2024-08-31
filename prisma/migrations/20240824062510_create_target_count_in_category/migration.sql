/*
  Warnings:

  - Added the required column `target_count` to the `book_category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "book_category" ADD COLUMN     "target_count" INTEGER NOT NULL;
