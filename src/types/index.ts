// Main types export file - Re-exports all types from organized modules

// Model types (Django model mappings)
export * from "./models";

// API types (requests and responses)
export * from "./api";

// Form types (form data structures)
export * from "./forms";

// Legacy types for backward compatibility (these are now defined in models)
export type {
  User,
  UserRole,
  AuthTokens,
  StudentProfile,
  AlumniProfile,
  AdminProfile,
  ProfileType,
  RoleRequest,
  RoleRequestStatus,
} from "./models";

export type {
  ApiResponse,
  DirectoryFilters,
  PaginatedResponse,
  ApiError,
} from "./api";

// Dashboard Statistics Types (keeping for backward compatibility)
export interface StatSummary {
  total_users: number;
  total_admins: number;
  total_students: number;
  total_alumni: number;
  role_requests_pending: number;
  role_requests_accepted: number;
  // New fields for the updated API response
  alumni_mentors?: number;
  alumni_referral_providers?: number;
  students_by_program?: Array<{ program: string; count: number }>;
  alumni_by_industry?: Array<{ industry: string; count: number }>;
  // Additional admin dashboard metrics
  pending_role_requests?: number;
  verified_alumni?: number;
  active_admins?: number;
}

// Directory and Search Types (keeping for backward compatibility)
export interface DirectoryStats {
  total_alumni: number;
  total_students: number;
  programs: Array<{ program: string; count: number }>;
  industries: Array<{ industry: string; count: number }>;
  graduation_years: Array<{ year: number; count: number }>;
}

// Generic types for common use cases
export type RequestStatus = "pending" | "approved" | "rejected";

// Utility types
export type Nullable<T> = T | null;
export type Optional<T> = T | undefined;
export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredBy<T, K extends keyof T> = T & Required<Pick<T, K>>;
