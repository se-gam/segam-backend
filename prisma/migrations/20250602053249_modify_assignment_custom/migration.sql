/*
  Warnings:

  - The primary key for the `assignment` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "user_assignment" DROP CONSTRAINT "user_assignment_assignment_id_fkey";

-- AlterTable
ALTER TABLE "assignment" DROP CONSTRAINT "assignment_pkey",
ADD COLUMN     "starts_at" TIMESTAMP(3),
ALTER COLUMN "id" SET DATA TYPE TEXT,
ALTER COLUMN "week" DROP NOT NULL,
ADD CONSTRAINT "assignment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "user_assignment" ALTER COLUMN "assignment_id" SET DATA TYPE TEXT;

-- AddForeignKey
ALTER TABLE "user_assignment" ADD CONSTRAINT "user_assignment_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
