/*
  Warnings:

  - A unique constraint covering the columns `[ecampus_id]` on the table `assignment` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `ecampus_id` to the `assignment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "assignment" ADD COLUMN     "ecampus_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "assignment_ecampus_id_key" ON "assignment"("ecampus_id");

-- CreateIndex
CREATE INDEX "assignment_ecampus_id_idx" ON "assignment"("ecampus_id");
