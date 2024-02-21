/*
  Warnings:

  - The primary key for the `course` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "assignment" DROP CONSTRAINT "assignment_course_id_fkey";

-- DropForeignKey
ALTER TABLE "lecture" DROP CONSTRAINT "lecture_course_id_fkey";

-- DropForeignKey
ALTER TABLE "user_course" DROP CONSTRAINT "user_course_course_id_fkey";

-- AlterTable
ALTER TABLE "assignment" ALTER COLUMN "course_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "course" DROP CONSTRAINT "course_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "course_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "course_id_seq";

-- AlterTable
ALTER TABLE "lecture" ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "course_id" SET DATA TYPE TEXT;
DROP SEQUENCE "lecture_id_seq";

-- AlterTable
ALTER TABLE "user_course" ALTER COLUMN "course_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "user_course" ADD CONSTRAINT "user_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecture" ADD CONSTRAINT "lecture_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
