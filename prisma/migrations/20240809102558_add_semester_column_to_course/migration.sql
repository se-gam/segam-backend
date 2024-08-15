-- course 테이블에 semester 컬럼 추가.
-- 이미 있는 데이터는 2024-01로 초기화하기 위해 우선은 nullable하게 하고, 데이터를 업데이트 한 후에 NOT NULL로 변경

ALTER TABLE "course" ADD COLUMN     "semester" TEXT;
UPDATE "course" SET "semester" = '2024-01';
ALTER TABLE "course" ALTER COLUMN "semester" SET NOT NULL;
