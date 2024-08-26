/*
  Warnings:

  - A unique constraint covering the columns `[course_id,semester]` on the table `course` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "course_course_id_semester_key" ON "course"("course_id", "semester");
