TRUNCATE TABLE "godok_slot" RESTART IDENTITY; -- 삭제해도 다음 크론잡에 생성하므로 상관X

DROP INDEX "godok_slot_slot_id_key";

-- AlterTable
ALTER TABLE "godok_slot" ALTER COLUMN "slot_id" DROP NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "godok_slot_starts_at_key" ON "godok_slot"("starts_at");
