/*
  Warnings:

  - A unique constraint covering the columns `[request_user_id,receive_user_id]` on the table `friend` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "friend_request_user_id_receive_user_id_key" ON "friend"("request_user_id", "receive_user_id");
