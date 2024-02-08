/*
  Warnings:

  - The primary key for the `studyroom_slot` table will be changed. If it partially fails, the table could be left without primary key constraint.

*/
-- DropForeignKey
ALTER TABLE "reservation_slot" DROP CONSTRAINT "reservation_slot_slot_id_fkey";

-- AlterTable
ALTER TABLE "reservation_slot" ALTER COLUMN "slot_id" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "studyroom_slot" DROP CONSTRAINT "studyroom_slot_pkey",
ALTER COLUMN "id" DROP DEFAULT,
ALTER COLUMN "id" SET DATA TYPE TEXT,
ADD CONSTRAINT "studyroom_slot_pkey" PRIMARY KEY ("id");
DROP SEQUENCE "studyroom_slot_id_seq";

-- AddForeignKey
ALTER TABLE "reservation_slot" ADD CONSTRAINT "reservation_slot_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "studyroom_slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
