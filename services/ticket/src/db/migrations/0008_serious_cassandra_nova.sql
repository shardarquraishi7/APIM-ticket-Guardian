CREATE TABLE "feedback" (
	"id" serial PRIMARY KEY NOT NULL,
	"message_id" uuid NOT NULL,
	"is_positive" boolean NOT NULL,
	"comments" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "feedback" ADD CONSTRAINT "feedback_message_id_messages_id_fk" FOREIGN KEY ("message_id") REFERENCES "public"."messages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "message_id_idx" ON "feedback" USING btree ("message_id");--> statement-breakpoint
CREATE INDEX "is_positive_idx" ON "feedback" USING btree ("is_positive");