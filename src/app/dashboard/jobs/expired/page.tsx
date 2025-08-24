"use client";
import React, { useState, Suspense } from "react";
import JobList from "@/components/jobs/JobList";
import { JobDetailPanel } from "@/components/jobs/JobDetailPanel";

export default function ExpiredJobsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold tracking-tight">
        Expired Opportunities
      </h1>
      <Suspense
        fallback={<div className="text-xs text-zinc-500">Loading jobs...</div>}
      >
        <JobList expiredOnly onSelect={(id) => setSelectedId(id)} />
      </Suspense>
      <JobDetailPanel jobId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
