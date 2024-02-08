/*
  Warnings:

  - You are about to drop the `Department` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "Department";

-- CreateTable
CREATE TABLE "department" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "department_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "course" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user" (
    "student_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sejong_pid" TEXT NOT NULL,
    "department_id" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_pkey" PRIMARY KEY ("student_id")
);

-- CreateTable
CREATE TABLE "user_course" (
    "id" SERIAL NOT NULL,
    "student_id" TEXT NOT NULL,
    "course_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_course_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "lecture" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "length" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "lecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_lecture" (
    "id" SERIAL NOT NULL,
    "student_id" TEXT NOT NULL,
    "lecture_id" INTEGER NOT NULL,
    "is_done" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_lecture_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "assignment" (
    "id" SERIAL NOT NULL,
    "course_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "week" INTEGER NOT NULL,
    "ends_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_assignment" (
    "id" SERIAL NOT NULL,
    "student_id" TEXT NOT NULL,
    "assignment_id" INTEGER NOT NULL,
    "is_done" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studyroom" (
    "id" SERIAL NOT NULL,
    "sejong_pid" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "operating_hours" TEXT NOT NULL,
    "min_users" INTEGER NOT NULL,
    "max_users" INTEGER NOT NULL,
    "is_cinema" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "studyroom_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studyroom_slot" (
    "id" SERIAL NOT NULL,
    "studyroom_id" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "start_at" TIME NOT NULL,
    "is_reserved" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studyroom_slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "studyroom_reservation" (
    "id" SERIAL NOT NULL,
    "reserveReason" TEXT NOT NULL,
    "cancelReason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "studyroom_reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservation_slot" (
    "id" SERIAL NOT NULL,
    "slot_id" INTEGER NOT NULL,
    "reservation_id" INTEGER NOT NULL,

    CONSTRAINT "reservation_slot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_reservation" (
    "id" SERIAL NOT NULL,
    "student_id" TEXT NOT NULL,
    "reservation_id" INTEGER NOT NULL,
    "is_leader" BOOLEAN NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "user_reservation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "friend" (
    "id" SERIAL NOT NULL,
    "user1_id" TEXT NOT NULL,
    "user2_id" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "friend_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_course_student_id_course_id_key" ON "user_course"("student_id", "course_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_lecture_student_id_lecture_id_key" ON "user_lecture"("student_id", "lecture_id");

-- CreateIndex
CREATE UNIQUE INDEX "reservation_slot_slot_id_reservation_id_key" ON "reservation_slot"("slot_id", "reservation_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_reservation_student_id_reservation_id_key" ON "user_reservation"("student_id", "reservation_id");

-- CreateIndex
CREATE UNIQUE INDEX "friend_user1_id_user2_id_key" ON "friend"("user1_id", "user2_id");

-- AddForeignKey
ALTER TABLE "user" ADD CONSTRAINT "user_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "department"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course" ADD CONSTRAINT "user_course_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_course" ADD CONSTRAINT "user_course_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "lecture" ADD CONSTRAINT "lecture_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lecture" ADD CONSTRAINT "user_lecture_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_lecture" ADD CONSTRAINT "user_lecture_lecture_id_fkey" FOREIGN KEY ("lecture_id") REFERENCES "lecture"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "assignment" ADD CONSTRAINT "assignment_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_assignment" ADD CONSTRAINT "user_assignment_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_assignment" ADD CONSTRAINT "user_assignment_assignment_id_fkey" FOREIGN KEY ("assignment_id") REFERENCES "assignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "studyroom_slot" ADD CONSTRAINT "studyroom_slot_studyroom_id_fkey" FOREIGN KEY ("studyroom_id") REFERENCES "studyroom"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_slot" ADD CONSTRAINT "reservation_slot_slot_id_fkey" FOREIGN KEY ("slot_id") REFERENCES "studyroom_slot"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservation_slot" ADD CONSTRAINT "reservation_slot_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "studyroom_reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reservation" ADD CONSTRAINT "user_reservation_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "user"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_reservation" ADD CONSTRAINT "user_reservation_reservation_id_fkey" FOREIGN KEY ("reservation_id") REFERENCES "studyroom_reservation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_user1_id_fkey" FOREIGN KEY ("user1_id") REFERENCES "user"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "friend" ADD CONSTRAINT "friend_user2_id_fkey" FOREIGN KEY ("user2_id") REFERENCES "user"("student_id") ON DELETE RESTRICT ON UPDATE CASCADE;
