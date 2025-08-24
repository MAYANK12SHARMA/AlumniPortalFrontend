"use client";
import React, { useState, useEffect } from "react";
import { useJobDetail, useJobActions } from "@/hooks/useJobs";
import { JobStatusBadge } from "./JobStatusBadge";
import jobsApi from "@/lib/api/jobs";
import { cn } from "@/lib/utils";

export interface JobDetailPanelProps {
  jobId: number | null;
  onClose: () => void;
}

export function JobDetailPanel({ jobId, onClose }: JobDetailPanelProps) {
  const { job, loading, error, refetch, setJob } = useJobDetail(jobId || undefined);
  const actions = useJobActions(job, (j) => setJob(j));
  const [logs, setLogs] = useState<any[] | null>(null);
  const [logsOpen, setLogsOpen] = useState(false);

  useEffect(() => {
    if (jobId && logsOpen) {
      jobsApi.getJobAuditLogs(jobId).then(setLogs).catch(() => setLogs([]));
    }
  }, [jobId, logsOpen]);

  if (!jobId) return null;

  return (
    <div className={cn("fixed inset-0 z-50 flex", !job && "pointer-events-none")}>      
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative ml-auto h-full w-full max-w-xl bg-zinc-950/95 border-l border-zinc-800/60 flex flex-col">
        <div className="p-5 flex items-start gap-4 border-b border-zinc-800/60">
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-semibold leading-tight tracking-tight mb-1 line-clamp-2">{job?.title || (loading ? "Loading..." : "Not found")}</h2>
            {job && (
              <div className="flex flex-wrap gap-2 items-center text-xs text-zinc-400">
                <span>{job.company}</span>
                <span className="opacity-40">•</span>
                <span>{job.location}</span>
                {job.end_date && (
                  <>
                    <span className="opacity-40">•</span>
                    <span>Ends {new Date(job.end_date).toLocaleDateString()}</span>
                  </>
                )}
              </div>
            )}
          </div>
          {job && <JobStatusBadge status={job.status} />}
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-6 text-sm leading-relaxed">
          {loading && <p className="text-zinc-400">Loading details...</p>}
          {error && <p className="text-rose-300">{error}</p>}
          {job && (
            <>
              <section className="space-y-2">
                <h3 className="text-xs uppercase tracking-wide font-semibold text-zinc-400">Description</h3>
                <p className="whitespace-pre-wrap text-zinc-300">{job.description}</p>
              </section>
              <section className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <div className="text-zinc-500">Salary</div>
                  <div className="text-zinc-300">
                    {job.salary_min || job.salary_max ? (
                      job.salary_min && job.salary_max ? `${job.salary_min} - ${job.salary_max} ${job.salary_currency || ""}` : job.salary_min ? `From ${job.salary_min} ${job.salary_currency || ""}+` : `Up to ${job.salary_max} ${job.salary_currency || ""}`
                    ) : <span className="opacity-50">Not provided</span>}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500">Apply Link</div>
                  <div className="truncate max-w-[180px]">
                    {job.apply_link ? <a className="text-indigo-300 hover:underline" href={job.apply_link} target="_blank" rel="noopener noreferrer">{job.apply_link}</a> : <span className="opacity-50">N/A</span>}
                  </div>
                </div>
                <div>
                  <div className="text-zinc-500">Posted</div>
                  <div className="text-zinc-300">{new Date(job.created_at).toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-zinc-500">Updated</div>
                  <div className="text-zinc-300">{new Date(job.updated_at).toLocaleString()}</div>
                </div>
              </section>
              <section className="space-y-2">
                <h3 className="text-xs uppercase tracking-wide font-semibold text-zinc-400">Tags</h3>
                <div className="flex flex-wrap gap-2">
                  {job.tags?.length ? job.tags.map(t => (
                    <span key={t} className="px-2 py-0.5 rounded-md bg-zinc-800/60 text-zinc-300 text-[11px] border border-zinc-700/50">{t}</span>
                  )) : <span className="text-[11px] text-zinc-500">No tags</span>}
                </div>
              </section>
              <section className="space-y-2">
                <h3 className="text-xs uppercase tracking-wide font-semibold text-zinc-400">Meta</h3>
                <div className="grid grid-cols-2 gap-3 text-[11px] text-zinc-400">
                  <div><span className="text-zinc-500">Poster:</span> {job.posted_by_email || "?"}</div>
                  <div><span className="text-zinc-500">Approver:</span> {job.approved_by_email || <span className="opacity-50">—</span>}</div>
                  <div><span className="text-zinc-500">Approved:</span> {job.approved_at ? new Date(job.approved_at).toLocaleString() : <span className="opacity-50">—</span>}</div>
                  <div><span className="text-zinc-500">Expired:</span> {job.expired_at ? new Date(job.expired_at).toLocaleString() : <span className="opacity-50">—</span>}</div>
                </div>
              </section>
            </>
          )}
        </div>
        {/* Footer actions */}
        {job && (
          <div className="p-4 border-t border-zinc-800/60 flex items-center gap-2">
            {job.status === "pending" && job.can_approve && (
              <button onClick={() => actions.approve(job.id).then(refetch)} disabled={actions.loading} className="px-3 py-1.5 text-[11px] rounded-md bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-200 ring-1 ring-inset ring-emerald-500/30 disabled:opacity-50">Approve</button>
            )}
            {job.status === "approved" && (
              <>
                <button onClick={() => actions.expire(job.id).then(refetch)} disabled={actions.loading} className="px-3 py-1.5 text-[11px] rounded-md bg-zinc-700/40 hover:bg-zinc-700/60 text-zinc-300 ring-1 ring-inset ring-zinc-500/30 disabled:opacity-50">Expire</button>
                <button onClick={() => actions.remove(job.id).then(refetch)} disabled={actions.loading} className="px-3 py-1.5 text-[11px] rounded-md bg-rose-600/30 hover:bg-rose-600/40 text-rose-200 ring-1 ring-inset ring-rose-500/30 disabled:opacity-50">Remove</button>
              </>
            )}
            {job.status === "expired" && (
              <button onClick={() => actions.remove(job.id).then(refetch)} disabled={actions.loading} className="px-3 py-1.5 text-[11px] rounded-md bg-rose-600/30 hover:bg-rose-600/40 text-rose-200 ring-1 ring-inset ring-rose-500/30 disabled:opacity-50">Remove</button>
            )}
            <button onClick={() => setLogsOpen(o => !o)} className="ml-auto px-3 py-1.5 text-[11px] rounded-md bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-200 ring-1 ring-inset ring-indigo-500/30">{logsOpen ? "Hide" : "Audit Log"}</button>
            <button onClick={onClose} className="px-3 py-1.5 text-[11px] rounded-md bg-zinc-700/30 hover:bg-zinc-700/50 text-zinc-300">Close</button>
          </div>
        )}
        {logsOpen && (
          <div className="border-t border-zinc-800/60 max-h-48 overflow-y-auto text-[11px] divide-y divide-zinc-800/80">
            {!logs && <div className="p-3 text-zinc-400">Loading logs...</div>}
            {logs && logs.length === 0 && <div className="p-3 text-zinc-500">No audit log entries.</div>}
            {logs && logs.map(l => (
              <div key={l.id} className="px-4 py-2 flex items-start gap-3">
                <span className="text-zinc-500 uppercase tracking-wide font-semibold w-20 truncate">{l.action}</span>
                <div className="flex-1">
                  <div className="text-zinc-300">{l.actor_email || "System"}</div>
                  <div className="text-zinc-500">{new Date(l.created_at).toLocaleString()}</div>
                  {l.notes && <div className="text-zinc-400 mt-1">{l.notes}</div>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDetailPanel;
