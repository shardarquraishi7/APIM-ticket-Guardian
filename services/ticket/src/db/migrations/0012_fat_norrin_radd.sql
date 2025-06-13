ALTER TABLE "chats" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "chats" RENAME COLUMN "userId" TO "user_id";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "chatId" TO "chat_id";--> statement-breakpoint
ALTER TABLE "messages" RENAME COLUMN "createdAt" TO "created_at";--> statement-breakpoint
ALTER TABLE "messages" DROP CONSTRAINT "messages_chatId_chats_id_fk";
--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE no action ON UPDATE no action;