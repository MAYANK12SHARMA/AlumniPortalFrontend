// Role Request Models - maps to RoleRequest model in UserProfile app

import { User, UserRole } from "./user";

export interface RoleRequest {
  id: number;
  user: User;
  requested_role: UserRole;
  current_role: UserRole;
  status: RoleRequestStatus;
  profile_data: Record<string, any>;
  admin_notes?: string;
  reviewed_by?: User;
  requested_at: string;
  reviewed_at?: string;
  updated_at: string;
}

export type RoleRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export const ROLE_REQUEST_STATUS_CHOICES: Array<{
  value: RoleRequestStatus;
  label: string;
}> = [
  { value: "pending", label: "Pending Review" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "cancelled", label: "Cancelled by User" },
];

// Form data for creating role requests
export interface RoleRequestCreateData {
  requested_role: UserRole;
  profile_data: Record<string, any>;
}

// Form data for admin review
export interface RoleRequestReviewData {
  status: "approved" | "rejected";
  admin_notes?: string;
}

// Validation response type
export interface ProfileValidationResult {
  is_valid: boolean;
  message: string;
}

// Role request statistics for admin dashboard
export interface RoleRequestStats {
  total_pending: number;
  total_approved: number;
  total_rejected: number;
  total_cancelled: number;
  pending_by_role: {
    student: number;
    alumni: number;
    admin: number;
  };
  recent_requests: RoleRequest[];
}
