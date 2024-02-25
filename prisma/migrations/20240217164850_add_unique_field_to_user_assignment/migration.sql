/*
  Warnings:

  - A unique constraint covering the columns `[student_id,assignment_id]` on the table `user_assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "user_assignment_student_id_assignment_id_key" ON "user_assignment"("student_id", "assignment_id");
