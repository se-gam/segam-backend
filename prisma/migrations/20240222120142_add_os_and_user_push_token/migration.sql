/*
  Warnings:

  - Added the required column `os` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "os" AS ENUM ('IOS', 'ANDROID');

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "os" "os" NOT NULL,
ADD COLUMN     "push_token" TEXT;
