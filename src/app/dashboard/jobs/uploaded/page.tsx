"use client";
import React, { useState, Suspense } from "react";
import JobList from "@/components/jobs/JobList";
import { JobDetailPanel } from "@/components/jobs/JobDetailPanel";

export default function UploadedJobsPage() {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold tracking-tight">
          Uploaded Opportunities
        </h1>
      </div>
      {/**
       * Note: Previously we passed `mine` prop unconditionally which forced the list
       * to call /dashboard/jobs/request/ (user's own submissions) and thus hid all
       * approved jobs. Now we rely on the optional ?mine=1 query param handled
       * internally by JobList so this page shows ALL jobs by default, and only
       * switches to "My Submissions" when that param is present.
       */}
      <Suspense
        fallback={<div className="text-xs text-zinc-500">Loading jobs...</div>}
      >
        <JobList approvedOnly onSelect={(id) => setSelectedId(id)} />
      </Suspense>
      <JobDetailPanel jobId={selectedId} onClose={() => setSelectedId(null)} />
    </div>
  );
}
