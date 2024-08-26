-- CreateTable
CREATE TABLE "godok_status" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "counts" INTEGER[],

    CONSTRAINT "godok_status_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "godok_status_student_id_key" ON "godok_status"("student_id");

-- AddForeignKey
ALTER TABLE "godok_status" ADD CONSTRAINT "godok_status_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;
