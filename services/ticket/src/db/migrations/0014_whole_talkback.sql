ALTER TABLE "messages" DROP CONSTRAINT "messages_chat_id_chats_id_fk";
--> statement-breakpoint
ALTER TABLE "chats" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "messages" ALTER COLUMN "created_at" SET DEFAULT now();--> statement-breakpoint
ALTER TABLE "repos" ADD COLUMN "owner" text DEFAULT 'telus' NOT NULL;--> statement-breakpoint
ALTER TABLE "repos" ADD COLUMN "ref" text DEFAULT 'main' NOT NULL;--> statement-breakpoint
ALTER TABLE "repos" ADD COLUMN "last_commit_sha" text;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_chat_id_chats_id_fk" FOREIGN KEY ("chat_id") REFERENCES "public"."chats"("id") ON DELETE cascade ON UPDATE no action;