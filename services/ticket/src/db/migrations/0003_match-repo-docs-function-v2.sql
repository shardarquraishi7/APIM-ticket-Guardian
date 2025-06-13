-- Custom SQL migration file, put your code below! --

CREATE OR REPLACE FUNCTION match_repo_document_embeddings(
  query_embedding vector,
  match_threshold double precision,
  match_count integer
)
RETURNS TABLE(content text, similarity double precision)
LANGUAGE sql
AS $function$
  SELECT
    content,
    1 - (l2_normalize(embedding) <=> l2_normalize(query_embedding))^2 AS similarity
  FROM repo_document_embeddings
  WHERE 1 - (l2_normalize(embedding) <=> l2_normalize(query_embedding))^2 > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$function$
;
