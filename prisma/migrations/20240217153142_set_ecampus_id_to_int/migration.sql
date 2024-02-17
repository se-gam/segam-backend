/*
  Warnings:

  - The `ecampus_id` column on the `course` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Changed the type of `ecampus_id` on the `lecture` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "course" DROP COLUMN "ecampus_id",
ADD COLUMN     "ecampus_id" INTEGER;

-- AlterTable
ALTER TABLE "lecture" DROP COLUMN "ecampus_id",
ADD COLUMN     "ecampus_id" INTEGER NOT NULL;
