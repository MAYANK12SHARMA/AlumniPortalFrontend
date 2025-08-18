// AI Services Models - maps to ai_services app models

import { User } from "./user";

export interface ProfileEmbedding {
  id: number;
  content_type: number;
  object_id: number;
  content_object: any; // Generic foreign key
  user: User;
  profile_type: "student" | "alumni" | "admin";
  embedding_vector?: number[]; // For PostgreSQL + pgvector
  embedding_json?: number[]; // For SQLite mode
  text_content: string;
  embedding_model: string;
  is_pending: boolean;
  embedding_error?: string;
  created_at: string;
  updated_at: string;
}

export interface EmbeddingSearchLog {
  id: number;
  query_text: string;
  query_embedding: number[];
  profile_type_filter?: string;
  search_mode: SearchMode;
  results_count: number;
  search_time_ms: number;
  user?: User;
  timestamp: string;
}

export type SearchMode = "brute_force" | "pgvector_ivfflat" | "pgvector_hnsw";

export const SEARCH_MODE_CHOICES: Array<{ value: SearchMode; label: string }> =
  [
    { value: "brute_force", label: "Brute Force (SQLite)" },
    { value: "pgvector_ivfflat", label: "PGVector IVFFlat" },
    { value: "pgvector_hnsw", label: "PGVector HNSW" },
  ];

// Search request and response types
export interface SemanticSearchRequest {
  query: string;
  profile_type?: "student" | "alumni" | "admin";
  limit?: number;
  similarity_threshold?: number;
  filters?: Record<string, any>;
}

export interface SemanticSearchResult {
  profile: any; // The actual profile object
  similarity_score: number;
  text_content: string;
  profile_type: "student" | "alumni" | "admin";
}

export interface SemanticSearchResponse {
  results: SemanticSearchResult[];
  total_count: number;
  search_time_ms: number;
  search_mode: SearchMode;
  query: string;
}

// Embedding generation types
export interface EmbeddingGenerationRequest {
  profile_id: number;
  profile_type: "student" | "alumni" | "admin";
  force_regenerate?: boolean;
}

export interface EmbeddingGenerationResponse {
  success: boolean;
  embedding_id?: number;
  error_message?: string;
  text_content?: string;
  embedding_dimensions?: number;
}
