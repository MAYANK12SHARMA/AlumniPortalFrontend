// Form Types for different components

import {
  UserRole,
  StudentProgram,
  Industry,
  ExperienceLevel,
  CommunicationMethod,
  AdminTitle,
  ProjectType,
  SocialPlatform,
  JobType,
} from "../models";

// Authentication Forms
export interface LoginFormData {
  email: string;
  password: string;
}

export interface RegisterFormData {
  name: string;
  email: string;
  password: string;
  re_password: string;
  role: UserRole;
}

export interface ActivationFormData {
  uid: string;
  token: string;
}

export interface ResendActivationFormData {
  email: string;
}

// Profile Forms
export interface StudentProfileFormData {
  // Academic Information
  batch_year?: number;
  program?: StudentProgram;
  current_semester?: number;
  cgpa?: number;
  expected_graduation?: string;
  major_coursework?: string[];
  academic_achievements?: string;

  // Personal Information
  first_name?: string;
  last_name?: string;
  bio?: string;
  phone?: string;
  location?: string;

  // Skills and Interests
  technical_skills?: string[];
  soft_skills?: string[];
  interests?: string[];

  // Career Preferences
  career_goals?: string;
  preferred_job_types?: JobType[];
  preferred_locations?: string[];

  // Experience
  has_internship_experience?: boolean;
  internship_details?: string;

  // Additional context
  certifications?: string[];
  extracurricular_activities?: string;
  is_public?: boolean;
}

export interface AlumniProfileFormData {
  // Basic Information
  first_name?: string;
  last_name?: string;
  graduation_year?: number;
  degree?: StudentProgram;
  specialization?: string;

  // Professional Information
  current_company?: string;
  current_position?: string;
  industry?: Industry;
  experience_years?: ExperienceLevel;

  // Contact and Profile
  bio?: string;
  location?: string;
  phone_number?: string;

  // Skills and Expertise
  expertise_areas?: string[];
  willing_to_mentor?: boolean;
  can_provide_referrals?: boolean;
  preferred_mentoring_topics?: string[];

  // Career Journey
  career_path?: Array<{
    company: string;
    position: string;
    start_date?: string;
    end_date?: string;
    description?: string;
  }>;
  notable_achievements?: string;

  // Networking Preferences
  available_for_networking?: boolean;
  preferred_communication?: CommunicationMethod[];

  // Verification
  linkedin_url?: string;
  is_public?: boolean;
}

export interface AdminProfileFormData {
  display_name?: string;
  contact_email?: string;
  phone?: string;
  title?: AdminTitle;
  department?: string;
  responsibilities?: string;
  is_active?: boolean;
}

// Project Forms
export interface ProjectFormData {
  title: string;
  description?: string;
  tech_stack?: string[];
  github_url?: string;
  live_demo_url?: string;
  start_date?: string;
  end_date?: string;
  project_type?: ProjectType;
  is_featured?: boolean;
  is_public?: boolean;
}

// Social Link Forms
export interface SocialLinkFormData {
  platform: SocialPlatform;
  username?: string;
  url: string;
  is_primary?: boolean;
}

// Role Request Forms
export interface RoleRequestFormData {
  requested_role: UserRole;
  profile_data: Record<string, any>;
}

export interface RoleRequestReviewFormData {
  status: "approved" | "rejected";
  admin_notes?: string;
}

// Search and Filter Forms
export interface DirectoryFilterFormData {
  search?: string;
  program?: StudentProgram;
  year?: number;
  industry?: Industry;
  company?: string;
  location?: string;
  is_mentor?: boolean;
  can_provide_referrals?: boolean;
}

export interface SearchFormData {
  query: string;
  profile_types?: ("student" | "alumni" | "admin")[];
  filters?: DirectoryFilterFormData;
}

// Admin Forms
export interface UserManagementFormData {
  is_active?: boolean;
  role?: UserRole;
  is_admin?: boolean;
}

// File Upload Forms
export interface FileUploadFormData {
  file: File;
  upload_type?: "profile_picture" | "verification_docs" | "project_image";
}

// Settings Forms
export interface UserSettingsFormData {
  name?: string;
  email?: string;
  password?: string;
  new_password?: string;
  confirm_password?: string;
}

export interface NotificationSettingsFormData {
  email_notifications?: boolean;
  role_request_notifications?: boolean;
  mentoring_notifications?: boolean;
  system_notifications?: boolean;
}
