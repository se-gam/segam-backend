-- AlterTable
CREATE SEQUENCE notice_id_seq;
ALTER TABLE "notice" ALTER COLUMN "id" SET DEFAULT nextval('notice_id_seq');
ALTER SEQUENCE notice_id_seq OWNED BY "notice"."id";
