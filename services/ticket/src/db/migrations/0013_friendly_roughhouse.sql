CREATE INDEX "chat_id_idx" ON "messages" USING btree ("chat_id");--> statement-breakpoint
CREATE INDEX "role_idx" ON "messages" USING btree ("role");--> statement-breakpoint
CREATE UNIQUE INDEX "id_chat_id_idx" ON "messages" USING btree ("id","chat_id");