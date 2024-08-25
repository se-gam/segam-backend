BEGIN;
	-- course에 새 id 컬럼 생성
	ALTER TABLE course RENAME COLUMN id TO course_id;
	ALTER TABLE course ADD COLUMN id TEXT;
	CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
	UPDATE course set id = uuid_generate_v4();
	ALTER TABLE course ADD CONSTRAINT course_tmp_id UNIQUE (id);
	DROP EXTENSION "uuid-ossp";
	
	
	-- lecture 마이그레이션
	ALTER TABLE lecture DROP CONSTRAINT lecture_course_id_fkey;
	ALTER TABLE lecture RENAME COLUMN course_id TO course_old_id;
	ALTER TABLE lecture ALTER COLUMN course_old_id DROP NOT NULL;
	ALTER TABLE lecture ADD COLUMN course_id text;
	UPDATE lecture SET course_id = course.id
	FROM course WHERE lecture.course_old_id = course.course_id;
	
	
	-- assignment 마이그레이션
	ALTER TABLE assignment DROP CONSTRAINT assignment_course_id_fkey;
	ALTER TABLE assignment RENAME COLUMN course_id TO course_old_id;
	ALTER TABLE assignment ALTER COLUMN course_old_id DROP NOT NULL;
	ALTER TABLE assignment ADD COLUMN course_id text;
	UPDATE assignment SET course_id = course.id
	FROM course WHERE assignment.course_old_id = course.course_id;
	
	
	-- user_course 마이그레이션
	ALTER TABLE user_course DROP CONSTRAINT user_course_course_id_fkey;
	DROP INDEX user_course_student_id_course_id_key;
	ALTER TABLE user_course RENAME COLUMN course_id TO course_old_id;
	ALTER TABLE user_course ALTER COLUMN course_old_id DROP NOT NULL;
	ALTER TABLE user_course ADD COLUMN course_id text;
	UPDATE user_course SET course_id = course.id
	FROM course WHERE user_course.course_old_id = course.course_id;
	
	-- course에 새 id를 pk로 만듬
	ALTER TABLE course DROP CONSTRAINT course_pkey;
	ALTER TABLE course ADD CONSTRAINT course_pkey PRIMARY KEY (id);
	ALTER TABLE course DROP CONSTRAINT course_tmp_id;
	
	ALTER TABLE lecture ADD CONSTRAINT lecture_course_id_fkey FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE RESTRICT ON UPDATE CASCADE;
	ALTER TABLE lecture ALTER COLUMN course_id SET NOT NULL;
	
	ALTER TABLE assignment ADD CONSTRAINT assignment_course_id_fkey FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE RESTRICT ON UPDATE CASCADE;
	ALTER TABLE assignment ALTER COLUMN course_id SET NOT NULL;
	
	ALTER TABLE user_course ADD CONSTRAINT user_course_course_id_fkey FOREIGN KEY (course_id) REFERENCES course(id) ON DELETE RESTRICT ON UPDATE CASCADE;
	ALTER TABLE user_course ADD CONSTRAINT user_course_student_id_course_id_key UNIQUE (student_id, course_id);
	ALTER TABLE user_course ALTER COLUMN course_id SET NOT NULL;
COMMIT;
