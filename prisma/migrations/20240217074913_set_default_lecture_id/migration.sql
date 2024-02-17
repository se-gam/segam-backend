-- AlterTable
CREATE SEQUENCE lecture_id_seq;
ALTER TABLE "lecture" ALTER COLUMN "id" SET DEFAULT nextval('lecture_id_seq');
ALTER SEQUENCE lecture_id_seq OWNED BY "lecture"."id";
