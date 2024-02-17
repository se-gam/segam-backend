/*
  Warnings:

  - You are about to drop the column `ecampus_id` on the `assignment` table. All the data in the column will be lost.
  - You are about to drop the column `ecampus_id` on the `lecture` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "assignment_ecampus_id_idx";

-- DropIndex
DROP INDEX "assignment_ecampus_id_key";

-- DropIndex
DROP INDEX "lecture_ecampus_id_idx";

-- DropIndex
DROP INDEX "lecture_ecampus_id_key";

-- AlterTable
ALTER TABLE "assignment" DROP COLUMN "ecampus_id";

-- AlterTable
ALTER TABLE "lecture" DROP COLUMN "ecampus_id",
ALTER COLUMN "id" DROP DEFAULT;
DROP SEQUENCE "lecture_id_seq";
