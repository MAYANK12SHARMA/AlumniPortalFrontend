"use client";
import React, { useMemo } from "react";
import { useJobs } from "@/hooks/useJobs";
import { JobCard } from "./JobCard";
import { JobCardSkeleton } from "./JobCardSkeleton";
import type { JobFilters } from "@/types";
import { cn } from "@/lib/utils";
import { useSearchParams } from "next/navigation";

export interface JobListProps {
  filters?: JobFilters;
  pendingOnly?: boolean;
  expiredOnly?: boolean;
  mine?: boolean;
  approvedOnly?: boolean; // force status=approved (for public/all jobs view)
  auto?: boolean;
  pollMs?: number;
  className?: string;
  onSelect?: (id: number) => void;
  adminActions?: boolean; // show inline approve / expire / remove buttons
}

export function JobList(props: JobListProps) {
  const {
    filters,
    pendingOnly,
    expiredOnly,
    mine,
    approvedOnly,
    auto,
    pollMs,
    className,
    onSelect,
    adminActions,
  } = props;
  const search = useSearchParams();
  const derived: JobFilters = useMemo(() => {
    const f: JobFilters = { ...(filters || {}) };
    const statusParam = search?.get("status");
    if (statusParam && !f.status) f.status = statusParam as any;
    const mineParam = search?.get("mine");
    const isMine = mine || mineParam === "1";
    // If forcing approvedOnly and not in a mine view and no explicit status provided, set approved
    if (approvedOnly && !isMine && !f.status) {
      f.status = "approved" as any;
    }
    return f;
  }, [filters, search, mine, approvedOnly]);

  const mineFlag = mine || search?.get("mine") === "1";

  const { data, loading, error, refetch } = useJobs({
    filters: derived,
    pendingOnly,
    expiredOnly,
    mine: mineFlag,
    auto,
    pollMs,
  });

  return (
    <div
      className={cn("space-y-4", className)}
      role="region"
      aria-live="polite"
      aria-busy={loading}
    >
      {error && (
        <div className="p-3 rounded-md bg-rose-600/15 text-rose-200 text-sm border border-rose-500/30">
          Error: {error}
          <button className="ml-3 underline" onClick={() => refetch()}>
            Retry
          </button>
        </div>
      )}
      {loading && !data && (
        <div
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          aria-label="Loading jobs"
        >
          {Array.from({ length: 6 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      )}
      {data &&
        Array.isArray(data.results) &&
        data.results.length === 0 &&
        !loading && (
          <div className="text-sm text-zinc-400 px-2">No jobs found.</div>
        )}
      {data && Array.isArray(data.results) && data.results.length > 0 && (
        <div
          className="grid gap-4 md:grid-cols-2 xl:grid-cols-3"
          aria-label="Job results"
        >
          {data.results!.map((job) => (
            <JobCard
              key={job.id}
              job={job as any}
              onView={onSelect ? () => onSelect(job.id) : undefined}
              featured={job.tags?.includes("featured")}
              onApprove={
                adminActions
                  ? () => {
                      /* integrate action outside via onSelect detail */
                    }
                  : undefined
              }
            />
          ))}
        </div>
      )}
      {data && (data.next || data.previous) && (
        <div className="flex items-center gap-2 pt-2">
          <button
            disabled={loading || !data.previous}
            onClick={() => {
              const prev = data.previous?.match(/[?&]page=(\d+)/);
              const page = prev ? Number(prev[1]) : (filters?.page || 1) - 1;
              refetch({ ...(filters || {}), page });
            }}
            className="px-3 py-1 rounded-md text-[11px] font-medium bg-zinc-800/60 disabled:opacity-40"
          >
            Prev
          </button>
          <button
            disabled={loading || !data.next}
            onClick={() => {
              const nxt = data.next?.match(/[?&]page=(\d+)/);
              const page = nxt ? Number(nxt[1]) : (filters?.page || 1) + 1;
              refetch({ ...(filters || {}), page });
            }}
            className="px-3 py-1 rounded-md text-[11px] font-medium bg-zinc-800/60 disabled:opacity-40"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}

export default JobList;
