-- AlterTable
CREATE SEQUENCE assignment_id_seq;
ALTER TABLE "assignment" ALTER COLUMN "id" SET DEFAULT nextval('assignment_id_seq'),
ALTER COLUMN "week" DROP NOT NULL;
ALTER SEQUENCE assignment_id_seq OWNED BY "assignment"."id";
