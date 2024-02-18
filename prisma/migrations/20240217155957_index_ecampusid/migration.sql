/*
  Warnings:

  - A unique constraint covering the columns `[ecampus_id]` on the table `course` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[ecampus_id]` on the table `lecture` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "course_ecampus_id_key" ON "course"("ecampus_id");

-- CreateIndex
CREATE INDEX "course_ecampus_id_idx" ON "course"("ecampus_id");

-- CreateIndex
CREATE UNIQUE INDEX "lecture_ecampus_id_key" ON "lecture"("ecampus_id");

-- CreateIndex
CREATE INDEX "lecture_ecampus_id_idx" ON "lecture"("ecampus_id");
