"use client";
import React, { useState, Suspense } from "react";
import JobList from "@/components/jobs/JobList";
import { JobDetailPanel } from "@/components/jobs/JobDetailPanel";

export default function PendingJobsAdminPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          Pending Opportunities
        </h1>
        <p className="text-xs text-zinc-500">Auto-refresh every 45s</p>
      </div>
      <Suspense
        fallback={<div className="text-xs text-zinc-500">Loading jobs...</div>}
      >
        <JobList
          pendingOnly
          pollMs={45000}
          adminActions
          onSelect={(id) => setSelectedId(id)}
        />
      </Suspense>
      <JobDetailPanel jobId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
