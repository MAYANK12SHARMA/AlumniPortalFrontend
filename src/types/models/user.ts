// User and Authentication Models - maps to accounts_app models

export interface User {
  id: number;
  email: string;
  name?: string;
  role: UserRole;
  is_active: boolean;
  is_admin: boolean;
  profile_completed?: boolean; // Added for frontend compatibility
  created_at: string;
  updated_at: string;
}

export type UserRole = "student" | "alumni" | "admin";

export const USER_ROLE_CHOICES: Array<{ value: UserRole; label: string }> = [
  { value: "student", label: "Student" },
  { value: "alumni", label: "Alumni" },
  { value: "admin", label: "Admin" },
];

// Authentication related types
export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface UserCreateData {
  name?: string;
  email: string;
  password: string;
  re_password: string;
  role: UserRole;
}

export interface UserUpdateData {
  name?: string;
  email?: string;
  is_active?: boolean;
  role?: UserRole;
}
