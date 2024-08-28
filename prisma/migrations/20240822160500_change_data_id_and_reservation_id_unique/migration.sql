/*
  Warnings:

  - A unique constraint covering the columns `[reservation_id]` on the table `godok_revervation` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[data_id]` on the table `godok_slot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "godok_revervation_reservation_id_key" ON "godok_revervation"("reservation_id");

-- CreateIndex
CREATE UNIQUE INDEX "godok_slot_data_id_key" ON "godok_slot"("data_id");
