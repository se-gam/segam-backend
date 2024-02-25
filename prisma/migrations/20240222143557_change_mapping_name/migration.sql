/*
  Warnings:

  - You are about to drop the column `department_id` on the `user` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_department_id_fkey";

-- AlterTable
ALTER TABLE "user" DROP COLUMN "department_id",
ADD COLUMN     "department_name" TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_department_name_fkey" FOREIGN KEY ("department_name") REFERENCES "department"("name") ON DELETE SET NULL ON UPDATE CASCADE;
