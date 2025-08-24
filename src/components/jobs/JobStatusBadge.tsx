import React from "react";
import { cn } from "@/lib/utils"; // normalized alias path
import type { JobStatus } from "@/types";

// Dark theme styles aligned with EventStatusBadge aesthetic (glass + subtle ring)
const statusStyles: Record<JobStatus, string> = {
  pending: "bg-amber-500/10 text-amber-300 ring-amber-500/30",
  approved: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
  expired: "bg-zinc-600/30 text-zinc-300 ring-zinc-500/30",
  removed: "bg-rose-500/15 text-rose-300 ring-rose-500/30",
};

export function JobStatusBadge({ status }: { status: JobStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium capitalize ring-1 ring-inset",
        statusStyles[status]
      )}
    >
      {status}
    </span>
  );
}

export default JobStatusBadge;
