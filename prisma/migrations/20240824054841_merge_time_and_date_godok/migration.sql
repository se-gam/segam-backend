/*
  Warnings:

  - You are about to drop the column `date` on the `godok_revervation` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `godok_revervation` table. All the data in the column will be lost.
  - You are about to drop the column `date` on the `godok_slot` table. All the data in the column will be lost.
  - You are about to drop the column `time` on the `godok_slot` table. All the data in the column will be lost.
  - Added the required column `starts_at` to the `godok_revervation` table without a default value. This is not possible if the table is not empty.
  - Added the required column `starts_at` to the `godok_slot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "godok_revervation" DROP COLUMN "date",
DROP COLUMN "time",
ADD COLUMN     "starts_at" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "godok_slot" DROP COLUMN "date",
DROP COLUMN "time",
ADD COLUMN     "starts_at" TIMESTAMP(3) NOT NULL;
