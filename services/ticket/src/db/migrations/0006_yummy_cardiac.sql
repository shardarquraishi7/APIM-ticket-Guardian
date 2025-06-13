CREATE TABLE IF NOT EXISTS "chat_feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"messages" jsonb NOT NULL,
	"is_positive" boolean NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
