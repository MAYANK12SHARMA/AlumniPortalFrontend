// API Response and Request Types

// Generic API Response wrapper
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

// Paginated response wrapper
export interface PaginatedResponse<T = any> {
  count: number;
  next?: string;
  previous?: string;
  results: T[];
}

// Error response
export interface ApiError {
  detail?: string;
  message?: string;
  errors?: Record<string, string[]>;
  non_field_errors?: string[];
}

// Authentication API Response types
export interface LoginResponse {
  access: string;
  refresh: string;
  user: any; // User object
}

export interface RegisterResponse {
  id: number;
  email: string;
  role: string;
}

export interface RefreshTokenResponse {
  access: string;
}

export interface ActivationResponse {
  detail: string;
}

// Profile API types
export interface ProfileResponse<T = any> {
  profile: T;
  profile_completed: boolean;
  profile_completeness_score: number;
}

// Dashboard API types
export interface DashboardStatsResponse {
  stats: {
    alumni: {
      total: number;
      mentors: number;
      referral_providers: number;
      by_industry: Array<{ industry: string; count: number }>;
    };
    students: {
      total: number;
      by_program: Array<{ program: string; count: number }>;
    };
  };
}

// Directory API types
export interface DirectoryFilters {
  // Common
  search?: string;
  page?: number;
  page_size?: number;
  // Alumni specific
  industry?: string;
  graduation_year?: number; // replaces legacy 'year'
  experience_years?: string;
  location?: string;
  willing_to_mentor?: boolean; // replaces legacy 'is_mentor'
  can_provide_referrals?: boolean;
  // Student specific
  program?: string;
  current_semester?: number; // could map from 'year'
  skills?: string; // comma separated
  // Legacy / deprecated (mapped client-side)
  year?: number;
  is_mentor?: boolean;
  company?: string; // backward compatibility
}

export interface DirectoryResponse<T = any> {
  profiles: T[];
  filters: {
    programs: Array<{ value: string; label: string; count: number }>;
    industries: Array<{ value: string; label: string; count: number }>;
    locations: Array<{ value: string; label: string; count: number }>;
    graduation_years: Array<{ value: number; label: string; count: number }>;
  };
  pagination: {
    count: number;
    page: number;
    pages: number;
    page_size: number;
    next?: string;
    previous?: string;
  };
}

// Role Request API types
export interface RoleRequestListResponse {
  requests: any[];
  pagination: {
    count: number;
    page: number;
    pages: number;
    page_size: number;
  };
  stats: {
    pending: number;
    approved: number;
    rejected: number;
  };
}

// File upload types
export interface FileUploadResponse {
  url: string;
  filename: string;
  size: number;
}

// Search API types
export interface SearchResponse<T = any> {
  results: T[];
  total_count: number;
  search_time_ms: number;
  suggestions?: string[];
}

// Profile status types
export type VerificationStatus =
  | "none"
  | "pending"
  | "verified"
  | "approved"
  | "rejected";

export interface ProfileStatusData {
  has_profile: boolean;
  profile_type: "student" | "alumni" | "admin" | null;
  verification_status: VerificationStatus;
  message?: string;
}

export interface ProfileStatusResponse {
  success: boolean;
  data: ProfileStatusData;
}
