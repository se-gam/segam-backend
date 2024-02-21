/*
  Warnings:

  - The primary key for the `department` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `department` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "user" DROP CONSTRAINT "user_department_id_fkey";

-- AlterTable
ALTER TABLE "department" DROP CONSTRAINT "department_pkey",
DROP COLUMN "id",
ADD CONSTRAINT "department_pkey" PRIMARY KEY ("name");

-- AlterTable
ALTER TABLE "user" ALTER COLUMN "department_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("name") ON DELETE SET NULL ON UPDATE CASCADE;
