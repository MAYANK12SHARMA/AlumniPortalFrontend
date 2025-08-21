// API Request Types for different endpoints

import { DirectoryFilters } from "./responses";

// Authentication requests
export interface AuthLoginRequest {
  email: string;
  password: string;
}
 
export interface AuthRegisterRequest {
  name: string;
  email: string;
  password: string;
  re_password: string;
  role: "student" | "alumni" | "admin";
}

export interface AuthActivationRequest {
  uid: string;
  token: string;
}

export interface AuthRefreshRequest {
  refresh: string;
}

export interface AuthResendActivationRequest {
  email: string;
}

// Profile requests
export interface ProfileUpdateRequest {
  [key: string]: any; // Generic for profile updates
}

export interface ProfileCreateRequest {
  [key: string]: any; // Generic for profile creation
}

// Directory requests
// Use an intersection type instead of an empty extending interface
export type DirectorySearchRequest = DirectoryFilters & {
  // Additional search parameters can be added here
};

// Role request requests
export interface RoleRequestCreateRequest {
  requested_role: "student" | "alumni" | "admin";
  profile_data: Record<string, any>;
}

export interface RoleRequestReviewRequest {
  status: "approved" | "rejected";
  admin_notes?: string;
}

// Admin requests
export interface AdminUserUpdateRequest {
  is_active?: boolean;
  role?: "student" | "alumni" | "admin";
  is_admin?: boolean;
}

// File upload requests
export interface FileUploadRequest {
  file: File;
  upload_type?: "profile_picture" | "verification_docs" | "project_image";
}

// Generic pagination request
export interface PaginationRequest {
  page?: number;
  page_size?: number;
  ordering?: string;
}

// Search requests
export interface SearchRequest {
  query: string;
  profile_types?: ("student" | "alumni" | "admin")[];
  filters?: DirectoryFilters;
  limit?: number;
}
