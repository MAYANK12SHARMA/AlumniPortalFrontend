import { apiClient } from "../api";
import {
  Job,
  CreateJobInput,
  UpdateJobInput,
  JobFilters,
  JobAuditLogEntry,
  PaginatedJobs,
} from "@/types";

// Helpers to serialize filters for GET /dashboard/jobs/
function buildQuery(filters: JobFilters = {}): Record<string, any> {
  const q: Record<string, any> = {};
  if (filters.page) q.page = filters.page;
  if (filters.page_size) q.page_size = filters.page_size;
  if (filters.job_type)
    q.job_type = Array.isArray(filters.job_type)
      ? filters.job_type.join(",")
      : filters.job_type;
  if (filters.location) q.location = filters.location;
  if (filters.tag)
    q.tag = Array.isArray(filters.tag) ? filters.tag.join(",") : filters.tag;
  if (filters.ordering) q.ordering = filters.ordering;
  if (filters.status) q.status = filters.status;
  if (filters.search) q.search = filters.search;
  return q;
}

export async function listJobs(
  filters: JobFilters = {}
): Promise<PaginatedJobs> {
  const res = await apiClient.get<PaginatedJobs>(
    "/dashboard/jobs/",
    buildQuery(filters)
  );
  return res.data as any;
}

export async function listPendingJobs(params: Omit<JobFilters, "status"> = {}) {
  const res = await apiClient.get<any>(
    "/dashboard/jobs/pending/",
    buildQuery(params)
  );
  // Backend returns a plain list (no pagination) for this endpoint; normalize to PaginatedJobs
  const data = res.data;
  if (Array.isArray(data)) {
    return {
      count: data.length,
      results: data,
      next: null,
      previous: null,
    } as PaginatedJobs;
  }
  return data as PaginatedJobs;
}

export async function listExpiredJobs(params: Omit<JobFilters, "status"> = {}) {
  const res = await apiClient.get<any>(
    "/dashboard/jobs/expired/",
    buildQuery(params)
  );
  const data = res.data;
  if (Array.isArray(data)) {
    return {
      count: data.length,
      results: data,
      next: null,
      previous: null,
    } as PaginatedJobs;
  }
  return data as PaginatedJobs;
}

export async function listMyJobRequests(params: JobFilters = {}) {
  const res = await apiClient.get<any>(
    "/dashboard/jobs/request/",
    buildQuery(params)
  );
  const data = res.data;
  if (Array.isArray(data)) {
    return {
      count: data.length,
      results: data,
      next: null,
      previous: null,
    } as PaginatedJobs;
  }
  return data as PaginatedJobs;
}

export async function getJob(id: number): Promise<Job> {
  const res = await apiClient.get<Job>(`/dashboard/jobs/status/${id}/`);
  return res.data as any;
}

export async function createJob(data: CreateJobInput): Promise<Job> {
  const res = await apiClient.post<Job>("/dashboard/jobs/", data);
  return res.data as any;
}

export async function updateJob(
  id: number,
  data: UpdateJobInput
): Promise<Job> {
  const res = await apiClient.patch<Job>(`/dashboard/jobs/status/${id}/`, data);
  return res.data as any;
}

// State-changing actions
export async function approveJob(id: number, notes?: string) {
  // Ensure trailing slash to avoid redirect issues on POST
  const res = await apiClient.post<Job>(
    `/dashboard/jobs/${id}/approve/`,
    notes ? { notes } : undefined
  );
  return res.data as any;
}

export async function expireJob(id: number, notes?: string) {
  const res = await apiClient.post<Job>(
    `/dashboard/jobs/${id}/expire/`,
    notes ? { notes } : undefined
  );
  return res.data as any;
}

export async function removeJob(id: number, notes?: string) {
  const res = await apiClient.post<Job>(
    `/dashboard/jobs/${id}/remove/`,
    notes ? { notes } : undefined
  );
  return res.data as any;
}

export async function getJobAuditLogs(id: number): Promise<JobAuditLogEntry[]> {
  const res = await apiClient.get<JobAuditLogEntry[]>(
    `/dashboard/jobs/${id}/audit-logs/`
  );
  return res.data as any;
}

export const jobsApi = {
  listJobs,
  listPendingJobs,
  listExpiredJobs,
  listMyJobRequests,
  getJob,
  createJob,
  updateJob,
  approveJob,
  expireJob,
  removeJob,
  getJobAuditLogs,
};

export default jobsApi;
