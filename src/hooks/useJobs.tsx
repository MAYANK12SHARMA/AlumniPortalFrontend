"use client";
import { useState, useEffect, useCallback, useRef } from "react";
import type { Job, JobFilters, PaginatedJobs } from "@/types";
import jobsApi from "@/lib/api/jobs";

export interface UseJobsOptions {
  auto?: boolean; // auto fetch
  pollMs?: number; // polling interval (e.g. pending list for admin)
  filters?: JobFilters;
  pendingOnly?: boolean;
  expiredOnly?: boolean;
  mine?: boolean; // use listMyJobRequests endpoint
}

export function useJobs(opts: UseJobsOptions = {}) {
  const { auto = true, pollMs, filters, pendingOnly, expiredOnly, mine } = opts;
  const [data, setData] = useState<PaginatedJobs | null>(null);
  const [loading, setLoading] = useState<boolean>(auto);
  const [error, setError] = useState<string | null>(null);
  const timer = useRef<any>(null);

  const fetcher = useCallback(async (override?: JobFilters) => {
    setLoading(true);
    setError(null);
    try {
      let res: PaginatedJobs;
      const merged = { ...filters, ...override };
      if (pendingOnly) res = await jobsApi.listPendingJobs(merged);
      else if (expiredOnly) res = await jobsApi.listExpiredJobs(merged);
      else if (mine) res = await jobsApi.listMyJobRequests(merged);
      else res = await jobsApi.listJobs(merged);
      setData(res);
    } catch (e: any) {
      setError(e.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  }, [filters, pendingOnly, expiredOnly, mine]);

  useEffect(() => {
    if (auto) fetcher();
  }, [auto, fetcher]);

  useEffect(() => {
    if (pollMs) {
      timer.current = setInterval(() => fetcher(), pollMs);
      return () => clearInterval(timer.current);
    }
  }, [pollMs, fetcher]);

  const refetch = (override?: JobFilters) => fetcher(override);

  return { data, loading, error, refetch };
}

export function useJobDetail(jobId?: number) {
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState<boolean>(!!jobId);
  const [error, setError] = useState<string | null>(null);

  const fetchJob = useCallback(async () => {
    if (!jobId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await jobsApi.getJob(jobId);
      setJob(res);
    } catch (e: any) {
      setError(e.message || "Failed to load job");
    } finally {
      setLoading(false);
    }
  }, [jobId]);

  useEffect(() => { fetchJob(); }, [fetchJob]);
  return { job, loading, error, refetch: fetchJob, setJob };
}

// Mutation helpers (optimistic optional)
export function useJobActions(job?: Job | null, setJob?: (j: Job) => void) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function run(mut: () => Promise<Job>) {
    setLoading(true); setError(null);
    try {
      const updated = await mut();
      setJob?.(updated);
      return updated;
    } catch (e: any) {
      setError(e.message || "Job action failed");
      throw e;
    } finally { setLoading(false); }
  }

  return {
    loading, error,
    approve: (id: number, notes?: string) => run(() => jobsApi.approveJob(id, notes)),
    expire: (id: number, notes?: string) => run(() => jobsApi.expireJob(id, notes)),
    remove: (id: number, notes?: string) => run(() => jobsApi.removeJob(id, notes)),
    update: (id: number, data: any) => run(() => jobsApi.updateJob(id, data)),
    create: (data: any) => run(() => jobsApi.createJob(data)),
  };
}
