"use client";
import React, { useMemo, useRef, useEffect } from "react";
import { Job } from "@/types";
import { cn, normalizeMediaUrl } from "@/lib/utils";
import { JobStatusBadge } from "./JobStatusBadge";
import { ExternalLink } from "lucide-react"; // if installed; otherwise replace icon

export interface JobCardProps {
  job: Job;
  className?: string;
  compact?: boolean;
  featured?: boolean; // could highlight curated / high priority jobs
  onView?: () => void; // open detail sidebar / dialog
  viewLabel?: string;
  onApprove?: () => void; // admin quick action
  onExpire?: () => void;
  onRemove?: () => void;
  loadingAction?: boolean;
}

function formatSalary(job: Job): string | null {
  const { salary_min, salary_max, salary_currency } = job;
  if (!salary_min && !salary_max) return null;
  const cur = salary_currency || "";
  if (salary_min && salary_max)
    return `${salary_min.toLocaleString()} – ${salary_max.toLocaleString()} ${cur}`.trim();
  if (salary_min) return `From ${salary_min.toLocaleString()} ${cur}+`.trim();
  if (salary_max) return `Up to ${salary_max.toLocaleString()} ${cur}`.trim();
  return null;
}

function companyInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export function JobCard({
  job,
  className,
  compact,
  featured,
  onView,
  viewLabel = "Details",
  onApprove,
  onExpire,
  onRemove,
  loadingAction,
}: JobCardProps) {
  const prevStatus = useRef(job.status);
  const statusChanged = prevStatus.current !== job.status;
  useEffect(() => {
    prevStatus.current = job.status;
  }, [job.status]);
  const endDate = job.end_date ? new Date(job.end_date) : null;
  const now = Date.now();
  const isLikelyExpiring =
    !!endDate && endDate.getTime() < now && job.status === "approved";

  const salaryText = useMemo(() => formatSalary(job), [job]);
  const logoUrl = normalizeMediaUrl(job.company_logo_url || undefined);

  // accent context logic similar to EventCard
  const context = featured
    ? "featured"
    : job.status === "pending"
    ? "pending"
    : job.status === "removed"
    ? "removed"
    : job.status === "expired"
    ? "expired"
    : "default";

  const accent: Record<string, string> = {
    featured: "from-indigo-500/25 via-indigo-400/10 to-zinc-900",
    pending: "from-amber-500/20 via-amber-400/10 to-zinc-900",
    removed: "from-rose-600/25 via-rose-500/10 to-zinc-900",
    expired: "from-zinc-600/10 via-zinc-700/10 to-zinc-900",
    default: "from-zinc-600/10 via-zinc-500/5 to-zinc-900",
  };

  return (
    <div
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-gradient-to-br backdrop-blur-sm overflow-hidden p-6 md:p-7 min-h-[260px]",
        "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)]",
        "transition-all duration-400 ease-out will-change-transform",
        "hover:shadow-[0_6px_24px_-6px_rgba(0,0,0,0.7),0_0_0_1px_rgba(255,255,255,0.08)] hover:-translate-y-0.5",
        "focus-within:ring-2 focus-within:ring-indigo-400/60 focus-within:ring-offset-2 focus-within:ring-offset-zinc-900",
        accent[context],
        context === "expired" && "opacity-90",
        statusChanged && "animate-pulse",
        className
      )}
      tabIndex={0}
      aria-label={`${job.title} at ${job.company}. Status ${job.status}. ${
        salaryText || "Salary not provided"
      }`}
    >
      {/* Expiry badge */}
      {isLikelyExpiring && (
        <span
          className="absolute top-3 right-3 z-10 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border backdrop-blur-md bg-amber-500/20 text-amber-100 border-amber-400/40 flex items-center gap-1 animate-pulse"
          aria-label="Likely Expiring"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400/70 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-300" />
          </span>
          Expiring
        </span>
      )}
      <div className="flex-1 flex flex-col gap-4">
        <header className="flex items-start gap-3">
          {/* Logo */}
          <div className="shrink-0 w-12 h-12 rounded-xl border border-zinc-700/60 bg-zinc-800/60 flex items-center justify-center overflow-hidden text-sm font-semibold tracking-wide text-zinc-200">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={logoUrl}
                alt={job.company}
                className="w-full h-full object-cover"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              companyInitials(job.company)
            )}
          </div>
          <div className="space-y-1.5 flex-1 min-w-0">
            <h3
              className={cn(
                "font-semibold leading-tight tracking-tight line-clamp-2",
                compact ? "text-base" : "text-lg",
                context === "featured" && "text-indigo-200",
                context === "pending" && "text-amber-200",
                context === "removed" && "text-rose-200",
                context === "expired" && "text-zinc-300",
                context === "default" && "text-zinc-100"
              )}
              title={job.title}
            >
              {job.title}
            </h3>
            <div
              className={cn(
                "flex flex-wrap gap-x-2 gap-y-1 text-[11px] font-medium tracking-wide text-zinc-400/90",
                compact && "text-[10px]"
              )}
            >
              <span className="truncate max-w-[10rem]" title={job.company}>
                {job.company}
              </span>
              <span className="opacity-40">•</span>
              <span className="truncate max-w-[8rem]" title={job.location}>
                {job.location}
              </span>
              <span className="opacity-40">•</span>
              <span className="capitalize">
                {job.job_type.replace(/_/g, " ")}
              </span>
            </div>
            {salaryText && (
              <div className="text-[11px] text-zinc-400/80 font-medium tracking-wide">
                {salaryText}
              </div>
            )}
          </div>
        </header>
        <p
          className={cn(
            "text-zinc-400/90 leading-relaxed line-clamp-4 text-sm transition-colors duration-300",
            compact && "text-xs",
            "group-hover:text-zinc-300"
          )}
        >
          {job.description?.slice(0, 220)}
        </p>
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 max-h-14 overflow-hidden pr-1 mt-auto">
          {job.tags?.slice(0, 10).map((t) => (
            <span
              key={t}
              className={cn(
                "px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide border/30 backdrop-blur-sm transition-colors duration-300",
                context === "removed" &&
                  "bg-rose-500/15 text-rose-200 border border-rose-400/20",
                context === "pending" &&
                  "bg-amber-500/15 text-amber-200 border border-amber-400/20",
                context === "featured" &&
                  "bg-indigo-500/20 text-indigo-100 border border-indigo-400/30",
                context === "expired" &&
                  "bg-zinc-700/30 text-zinc-300 border border-zinc-600/30",
                context === "default" &&
                  "bg-zinc-800/60 text-zinc-300 border border-zinc-700/50 group-hover:bg-zinc-700/60"
              )}
              aria-label={`Tag ${t}`}
            >
              {t}
            </span>
          ))}
          {job.tags && job.tags.length > 10 && (
            <span className="px-2 py-0.5 rounded-md text-[11px] bg-zinc-800/40 text-zinc-400 border border-zinc-700/50">
              +{job.tags.length - 10}
            </span>
          )}
        </div>
      </div>
      {/* Footer */}
      <div className="mt-5 -mx-6 mb-[-.5rem] px-6 pt-3 pb-2 flex flex-wrap items-center gap-2 border-t border-zinc-800/60 bg-zinc-900/50 backdrop-blur-md transition-colors duration-300 group-hover:bg-zinc-900/60">
        <JobStatusBadge status={job.status} />
        {featured && (
          <span className="inline-flex items-center rounded-full bg-indigo-500/15 text-indigo-200 px-2 py-0.5 text-[11px] ring-1 ring-inset ring-indigo-400/30 font-medium">
            Featured
          </span>
        )}
        {job.status === "approved" && job.apply_link && (
          <a
            href={job.apply_link}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-auto inline-flex items-center gap-1 rounded-md border border-zinc-700/60 bg-zinc-800/40 hover:bg-indigo-600/30 hover:border-indigo-500/40 px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
            aria-label={`Apply for ${job.title}`}
          >
            Apply <ExternalLink className="w-3 h-3" />
          </a>
        )}
        {onView && (
          <button
            type="button"
            onClick={onView}
            className="ml-auto inline-flex items-center rounded-md border border-zinc-700/60 bg-zinc-800/40 hover:bg-zinc-700/50 px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400/60"
            aria-label={`View details for ${job.title}`}
          >
            {viewLabel}
          </button>
        )}
        {/* Admin quick actions */}
        {(onApprove || onExpire || onRemove) && (
          <div className="ml-auto flex items-center gap-1">
            {onApprove && job.status === "pending" && (
              <button
                onClick={onApprove}
                disabled={loadingAction}
                className="inline-flex items-center rounded-md bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-200 px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ring-emerald-400/30 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60"
                aria-label="Approve job"
              >
                Approve
              </button>
            )}
            {onExpire && job.status === "approved" && (
              <button
                onClick={onExpire}
                disabled={loadingAction}
                className="inline-flex items-center rounded-md bg-zinc-700/40 hover:bg-zinc-700/60 text-zinc-300 px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ring-zinc-500/30 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-400/60"
                aria-label="Expire job"
              >
                Expire
              </button>
            )}
            {onRemove && job.status !== "removed" && (
              <button
                onClick={onRemove}
                disabled={loadingAction}
                className="inline-flex items-center rounded-md bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 px-2.5 py-1 text-[11px] font-medium ring-1 ring-inset ring-rose-400/30 disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400/60"
                aria-label="Remove job"
              >
                Remove
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobCard;
