# 세감 Backend API

## 로컬 개발환경 세팅

1. `.local.env` 파일 루트 디렉토리에 추가
2. `.local.env` 파일에 DATABASE_URL="postgresql://segam:segam@db:5432/segam"
3. `init.sql` 파일 루트 디렉토리에 추가
4. 서버 시작: `docker compose up -d`
5. 문서 접속: http://localhost:3000/delicious-segam-docs
6. /v1/godok/books-update 고전독서 도서 목록 업데이트 API 최초 1회 실행
7. 서버 종료: `docker compose down --rmi local`
