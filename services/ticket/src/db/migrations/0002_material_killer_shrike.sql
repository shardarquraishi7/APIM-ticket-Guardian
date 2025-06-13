ALTER TABLE "repo_document_embeddings" DROP CONSTRAINT "repo_document_embeddings_document_id_repo_documents_id_fk";
--> statement-breakpoint
ALTER TABLE "repo_documents" DROP CONSTRAINT "repo_documents_repo_id_repos_id_fk";
--> statement-breakpoint
ALTER TABLE "repo_document_embeddings" ADD CONSTRAINT "repo_document_embeddings_document_id_repo_documents_id_fk" FOREIGN KEY ("document_id") REFERENCES "public"."repo_documents"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "repo_documents" ADD CONSTRAINT "repo_documents_repo_id_repos_id_fk" FOREIGN KEY ("repo_id") REFERENCES "public"."repos"("id") ON DELETE cascade ON UPDATE no action;