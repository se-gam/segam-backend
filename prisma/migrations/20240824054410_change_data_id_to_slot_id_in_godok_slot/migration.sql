/*
  Warnings:

  - You are about to drop the column `data_id` on the `godok_slot` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[slot_id]` on the table `godok_slot` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `slot_id` to the `godok_slot` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "godok_slot_data_id_key";

-- AlterTable
ALTER TABLE "godok_slot" DROP COLUMN "data_id",
ADD COLUMN     "slot_id" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "godok_slot_slot_id_key" ON "godok_slot"("slot_id");
