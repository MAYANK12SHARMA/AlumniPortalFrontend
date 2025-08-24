// Job model & related types

export type JobStatus = "pending" | "approved" | "expired" | "removed";
export type JobPostingType = "full_time" | "part_time" | "internship" | "contract" | "temporary" | "freelance" | "remote";

export interface Job {
  id: number;
  title: string;
  company: string;
  company_logo_url?: string | null;
  location: string;
  job_type: JobPostingType;
  description: string; // markdown / rich text
  apply_link?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null; // ISO 4217 code
  tags: string[];
  end_date?: string | null; // ISO Date
  status: JobStatus;
  posted_by: number;
  posted_by_email?: string;
  approved_by_email?: string | null;
  approved_at?: string | null;
  expired_at?: string | null;
  created_at: string;
  updated_at: string;
  can_approve?: boolean;
  can_edit?: boolean;
}

export interface JobAuditLogEntry {
  id: number;
  action: string; // created, approved, expired, removed, updated, etc.
  actor_email?: string;
  notes?: string;
  created_at: string; // ISO
}

export interface CreateJobInput {
  title: string;
  company: string;
  company_logo_url?: string | null;
  location: string;
  job_type: JobPostingType;
  description: string;
  apply_link?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  salary_currency?: string | null;
  tags?: string[];
  end_date?: string | null; // date only
}

export interface UpdateJobInput extends Partial<CreateJobInput> {}

export interface JobFilters {
  page?: number;
  page_size?: number;
  job_type?: JobPostingType | JobPostingType[]; // support multi-select
  location?: string;
  tag?: string | string[];
  ordering?: string; // e.g. -created_at, end_date
  status?: JobStatus; // admin only
  search?: string; // free text search in title/company
}

export interface PaginatedJobs {
  count: number;
  next?: string | null;
  previous?: string | null;
  results: Job[];
}
