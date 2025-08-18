// Profile Models - maps to UserProfile app models

import { User } from "./user";

// Base Profile Interface
export interface BaseProfile {
  id: number;
  user: User;
  created_at: string;
  updated_at: string;
  is_public: boolean;
  profile_summary_ai?: string;
  ai_summary_last_updated?: string;
}

// Student Profile Types
export interface StudentProfile extends BaseProfile {
  // Academic Information
  batch_year?: number;
  program?: StudentProgram;
  current_semester?: number;
  cgpa?: number;
  expected_graduation?: string;
  major_coursework: string[];
  academic_achievements?: string;

  // Personal Information
  first_name?: string;
  last_name?: string;
  bio?: string;
  profile_picture?: string;
  phone?: string;
  location?: string;

  // Skills and Interests
  technical_skills: string[];
  soft_skills: string[];
  interests: string[];

  // Career Preferences
  career_goals?: string;
  preferred_job_types: string[];
  preferred_locations: string[];

  // Experience
  has_internship_experience: boolean;
  internship_details?: string;

  // Additional context
  certifications: string[];
  extracurricular_activities?: string;
}

export type StudentProgram =
  | "btech"
  | "bcom"
  | "bba"
  | "bca"
  | "bsc"
  | "ba"
  | "mtech"
  | "mba"
  | "mca"
  | "msc"
  | "ma"
  | "phd";

export const STUDENT_PROGRAM_CHOICES: Array<{
  value: StudentProgram;
  label: string;
}> = [
  { value: "btech", label: "B.Tech (Bachelor of Technology)" },
  { value: "bcom", label: "B.Com (Bachelor of Commerce)" },
  { value: "bba", label: "BBA (Bachelor of Business Administration)" },
  { value: "bca", label: "BCA (Bachelor of Computer Applications)" },
  { value: "bsc", label: "B.Sc (Bachelor of Science)" },
  { value: "ba", label: "BA (Bachelor of Arts)" },
  { value: "mtech", label: "M.Tech (Master of Technology)" },
  { value: "mba", label: "MBA (Master of Business Administration)" },
  { value: "mca", label: "MCA (Master of Computer Applications)" },
  { value: "msc", label: "M.Sc (Master of Science)" },
  { value: "ma", label: "MA (Master of Arts)" },
  { value: "phd", label: "PhD (Doctor of Philosophy)" },
];

export const SEMESTER_CHOICES: Array<{ value: number; label: string }> = [
  { value: 1, label: "1st Semester" },
  { value: 2, label: "2nd Semester" },
  { value: 3, label: "3rd Semester" },
  { value: 4, label: "4th Semester" },
  { value: 5, label: "5th Semester" },
  { value: 6, label: "6th Semester" },
  { value: 7, label: "7th Semester" },
  { value: 8, label: "8th Semester" },
  { value: 9, label: "9th Semester" },
  { value: 10, label: "10th Semester" },
  { value: 11, label: "11th Semester" },
  { value: 12, label: "12th Semester" },
];

export type JobType =
  | "full_time"
  | "part_time"
  | "internship"
  | "freelance"
  | "contract"
  | "remote"
  | "hybrid";

export const JOB_TYPE_CHOICES: Array<{ value: JobType; label: string }> = [
  { value: "full_time", label: "Full Time" },
  { value: "part_time", label: "Part Time" },
  { value: "internship", label: "Internship" },
  { value: "freelance", label: "Freelance" },
  { value: "contract", label: "Contract" },
  { value: "remote", label: "Remote" },
  { value: "hybrid", label: "Hybrid" },
];

// Alumni Profile Types
export interface AlumniProfile extends BaseProfile {
  // Basic Information
  first_name: string;
  last_name: string;
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
  profile_picture?: string;
  location?: string;
  phone_number?: string;

  // Skills and Expertise
  expertise_areas: string[];
  willing_to_mentor: boolean;
  can_provide_referrals: boolean;
  preferred_mentoring_topics: string[];

  // Career Journey
  career_path: CareerPathItem[];
  notable_achievements?: string;

  // Networking Preferences
  available_for_networking: boolean;
  preferred_communication: CommunicationMethod[];

  // Verification
  linkedin_url?: string;
  verification_docs?: string;
}

export type Industry =
  | "technology"
  | "finance"
  | "healthcare"
  | "education"
  | "consulting"
  | "manufacturing"
  | "retail"
  | "media"
  | "automotive"
  | "telecommunications"
  | "government"
  | "non_profit"
  | "real_estate"
  | "energy"
  | "agriculture"
  | "other";

export const INDUSTRY_CHOICES: Array<{ value: Industry; label: string }> = [
  { value: "technology", label: "Technology" },
  { value: "finance", label: "Finance & Banking" },
  { value: "healthcare", label: "Healthcare" },
  { value: "education", label: "Education" },
  { value: "consulting", label: "Consulting" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "retail", label: "Retail & E-commerce" },
  { value: "media", label: "Media & Entertainment" },
  { value: "automotive", label: "Automotive" },
  { value: "telecommunications", label: "Telecommunications" },
  { value: "government", label: "Government & Public Sector" },
  { value: "non_profit", label: "Non-Profit" },
  { value: "real_estate", label: "Real Estate" },
  { value: "energy", label: "Energy & Utilities" },
  { value: "agriculture", label: "Agriculture" },
  { value: "other", label: "Other" },
];

export type ExperienceLevel = "0-1" | "1-3" | "3-5" | "5-10" | "10-15" | "15+";

export const EXPERIENCE_CHOICES: Array<{
  value: ExperienceLevel;
  label: string;
}> = [
  { value: "0-1", label: "0-1 years" },
  { value: "1-3", label: "1-3 years" },
  { value: "3-5", label: "3-5 years" },
  { value: "5-10", label: "5-10 years" },
  { value: "10-15", label: "10-15 years" },
  { value: "15+", label: "15+ years" },
];

export type CommunicationMethod =
  | "email"
  | "linkedin"
  | "phone"
  | "video_call"
  | "in_person"
  | "whatsapp";

export const COMMUNICATION_CHOICES: Array<{
  value: CommunicationMethod;
  label: string;
}> = [
  { value: "email", label: "Email" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "phone", label: "Phone" },
  { value: "video_call", label: "Video Call" },
  { value: "in_person", label: "In Person" },
  { value: "whatsapp", label: "WhatsApp" },
];

export interface CareerPathItem {
  company: string;
  position: string;
  start_date?: string;
  end_date?: string;
  description?: string;
}

// Admin Profile Types
export interface AdminProfile extends BaseProfile {
  display_name?: string;
  avatar?: string;
  contact_email?: string;
  phone?: string;
  title?: AdminTitle;
  department?: string;
  responsibilities?: string;
  is_active: boolean;
}

export type AdminTitle =
  | "portal_admin"
  | "super_admin"
  | "alumni_coordinator"
  | "student_coordinator"
  | "placement_officer"
  | "academic_coordinator"
  | "hr_manager"
  | "it_support"
  | "other";

export const ADMIN_TITLE_CHOICES: Array<{ value: AdminTitle; label: string }> =
  [
    { value: "portal_admin", label: "Portal Administrator" },
    { value: "super_admin", label: "Super Administrator" },
    { value: "alumni_coordinator", label: "Alumni Coordinator" },
    { value: "student_coordinator", label: "Student Coordinator" },
    { value: "placement_officer", label: "Placement Officer" },
    { value: "academic_coordinator", label: "Academic Coordinator" },
    { value: "hr_manager", label: "HR Manager" },
    { value: "it_support", label: "IT Support" },
    { value: "other", label: "Other" },
  ];

// Project Types
export interface Project {
  id: number;
  student: number; // StudentProfile ID
  title: string;
  description?: string;
  tech_stack: string[];
  github_url?: string;
  live_demo_url?: string;
  start_date?: string;
  end_date?: string;
  project_type: ProjectType;
  featured_image?: string;
  ai_enhanced_description?: string;
  created_at: string;
  updated_at: string;
  is_featured: boolean;
  is_public: boolean;
}

export type ProjectType =
  | "academic"
  | "personal"
  | "internship"
  | "hackathon"
  | "freelance";

export const PROJECT_TYPE_CHOICES: Array<{
  value: ProjectType;
  label: string;
}> = [
  { value: "academic", label: "Academic Project" },
  { value: "personal", label: "Personal Project" },
  { value: "internship", label: "Internship Project" },
  { value: "hackathon", label: "Hackathon Project" },
  { value: "freelance", label: "Freelance Project" },
];

// Social Link Types
export interface SocialLink {
  id: number;
  student: number; // StudentProfile ID
  platform: SocialPlatform;
  username?: string;
  url: string;
  is_primary: boolean;
  created_at: string;
}

export type SocialPlatform =
  | "linkedin"
  | "github"
  | "twitter"
  | "instagram"
  | "portfolio"
  | "blog"
  | "other";

export const SOCIAL_PLATFORM_CHOICES: Array<{
  value: SocialPlatform;
  label: string;
}> = [
  { value: "linkedin", label: "LinkedIn" },
  { value: "github", label: "GitHub" },
  { value: "twitter", label: "Twitter" },
  { value: "instagram", label: "Instagram" },
  { value: "portfolio", label: "Portfolio" },
  { value: "blog", label: "Blog" },
  { value: "other", label: "Other" },
];

// Form Data Types for Profile Updates
export interface StudentProfileUpdateData {
  batch_year?: number;
  program?: StudentProgram;
  current_semester?: number;
  cgpa?: number;
  expected_graduation?: string;
  major_coursework?: string[];
  academic_achievements?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  phone?: string;
  location?: string;
  technical_skills?: string[];
  soft_skills?: string[];
  interests?: string[];
  career_goals?: string;
  preferred_job_types?: string[];
  preferred_locations?: string[];
  has_internship_experience?: boolean;
  internship_details?: string;
  certifications?: string[];
  extracurricular_activities?: string;
  is_public?: boolean;
}

export interface AlumniProfileUpdateData {
  first_name?: string;
  last_name?: string;
  graduation_year?: number;
  degree?: StudentProgram;
  specialization?: string;
  current_company?: string;
  current_position?: string;
  industry?: Industry;
  experience_years?: ExperienceLevel;
  bio?: string;
  location?: string;
  phone_number?: string;
  expertise_areas?: string[];
  willing_to_mentor?: boolean;
  can_provide_referrals?: boolean;
  preferred_mentoring_topics?: string[];
  career_path?: CareerPathItem[];
  notable_achievements?: string;
  available_for_networking?: boolean;
  preferred_communication?: CommunicationMethod[];
  linkedin_url?: string;
  is_public?: boolean;
}

export interface AdminProfileUpdateData {
  display_name?: string;
  contact_email?: string;
  phone?: string;
  title?: AdminTitle;
  department?: string;
  responsibilities?: string;
  is_active?: boolean;
}

// Union type for all profiles
export type ProfileType = "student" | "alumni" | "admin";
export type AnyProfile = StudentProfile | AlumniProfile | AdminProfile;
