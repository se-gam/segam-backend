/*
  Warnings:

  - Made the column `sejong_pid` on table `user` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "user" ALTER COLUMN "sejong_pid" SET NOT NULL;
