/*
  Warnings:

  - You are about to drop the column `user1_id` on the `friend` table. All the data in the column will be lost.
  - You are about to drop the column `user2_id` on the `friend` table. All the data in the column will be lost.
  - Added the required column `receive_user_id` to the `friend` table without a default value. This is not possible if the table is not empty.
  - Added the required column `request_user_id` to the `friend` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "friend" DROP CONSTRAINT "friend_user1_id_fkey";

-- DropForeignKey
ALTER TABLE "friend" DROP CONSTRAINT "friend_user2_id_fkey";

-- DropIndex
DROP INDEX "friend_user1_id_user2_id_key";

-- AlterTable
ALTER TABLE "friend" DROP COLUMN "user1_id",
DROP COLUMN "user2_id",
ADD COLUMN     "receive_user_id" TEXT NOT NULL,
ADD COLUMN     "request_user_id" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_request_user_id_fkey" FOREIGN KEY ("request_user_id") REFERENCES "user"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_receive_user_id_fkey" FOREIGN KEY ("receive_user_id") REFERENCES "user"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;
