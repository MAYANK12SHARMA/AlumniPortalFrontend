"use client";
import { ExternalEvent } from "@/types";
import { EventStatusBadge } from "./EventStatusBadge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";

export interface EventDetailsDialogProps {
  event: ExternalEvent | null;
  onClose: () => void;
  showUrl?: boolean; // hide for upcoming when requested
  showModeration?: boolean; // pending + admin view
  onApprove?: (notes?: string) => Promise<void> | void;
  onReject?: (notes?: string) => Promise<void> | void;
  loadingActionIds?: Set<number>; // optional to show processing
  titleOverride?: string;
  moderationNotes?: string; // external control of notes (for keyboard shortcuts etc.)
  onChangeModerationNotes?: (value: string) => void;
}

export function EventDetailsDialog({
  event,
  onClose,
  showUrl = true,
  showModeration = false,
  onApprove,
  onReject,
  loadingActionIds,
  titleOverride,
  moderationNotes,
  onChangeModerationNotes,
}: EventDetailsDialogProps) {
  const [internalNotes, setInternalNotes] = useState("");
  const notes = moderationNotes !== undefined ? moderationNotes : internalNotes;
  const setNotes = onChangeModerationNotes || setInternalNotes;
  if (!event) return null;
  const processing = loadingActionIds?.has(event.id);
  return (
    <AnimatePresence>
      {event && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => !processing && onClose()}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ type: "spring", stiffness: 170, damping: 22 }}
            className="relative z-10 w-full max-w-4xl max-h-[92vh] overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/85 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_40px_-4px_rgba(0,0,0,0.6)] flex flex-col"
          >
            <div className="flex items-start justify-between px-6 py-4 border-b border-zinc-800/70 bg-gradient-to-r from-zinc-900/70 to-zinc-900/30 gap-4">
              <div className="space-y-1 pr-4">
                <h2 className="text-lg font-semibold text-zinc-100 line-clamp-2">
                  {titleOverride || event.title}
                </h2>
                <div className="flex items-center gap-2 text-[11px] text-zinc-500 flex-wrap">
                  <EventStatusBadge status={event.status} />
                  {event.start_datetime && (
                    <span>
                      Starts: {new Date(event.start_datetime).toLocaleString()}
                    </span>
                  )}
                  {event.end_datetime && (
                    <span>
                      Ends: {new Date(event.end_datetime).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => onClose()}
                  disabled={processing}
                >
                  Close
                </Button>
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scroll">
              <section className="space-y-3">
                <h3 className="text-sm font-medium tracking-wide text-zinc-300 uppercase">
                  Overview
                </h3>
                <p className="text-xs text-zinc-400 leading-relaxed">
                  {event.short_description}
                </p>
                {event.description && (
                  <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-4">
                    <h4 className="text-[11px] font-semibold text-zinc-300 mb-2">
                      Full Description
                    </h4>
                    <pre className="whitespace-pre-wrap text-[12px] text-zinc-300 font-sans">
                      {event.description}
                    </pre>
                  </div>
                )}
              </section>
              <section className="grid grid-cols-2 gap-4 text-[11px]">
                <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3 space-y-1">
                  <p className="text-zinc-500">Start</p>
                  <p className="text-zinc-200 font-medium">
                    {event.start_datetime
                      ? new Date(event.start_datetime).toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3 space-y-1">
                  <p className="text-zinc-500">End</p>
                  <p className="text-zinc-200 font-medium">
                    {event.end_datetime
                      ? new Date(event.end_datetime).toLocaleString()
                      : "—"}
                  </p>
                </div>
                <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3 space-y-1 col-span-2">
                  <p className="text-zinc-500">Location</p>
                  <p className="text-zinc-200 font-medium">
                    {event.location || "—"}
                  </p>
                </div>
                {showUrl && (
                  <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3 space-y-1 col-span-2">
                    <p className="text-zinc-500">Event URL</p>
                    {event.event_url ? (
                      <a
                        href={event.event_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-yellow-300 hover:underline break-all text-[11px]"
                      >
                        {event.event_url}
                      </a>
                    ) : (
                      <span className="text-zinc-200">—</span>
                    )}
                  </div>
                )}
              </section>
              <section className="space-y-3">
                <h3 className="text-sm font-medium tracking-wide text-zinc-300 uppercase">
                  Tags
                </h3>
                <div className="flex flex-wrap gap-2">
                  {event.tags.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-1 rounded-full bg-emerald-500/10 text-emerald-300 text-[11px] border border-emerald-400/20"
                    >
                      {t}
                    </span>
                  ))}
                  {event.tags.length === 0 && (
                    <span className="text-[11px] text-zinc-500">No tags</span>
                  )}
                </div>
              </section>
              {showModeration && (
                <section className="space-y-4">
                  <h3 className="text-sm font-medium tracking-wide text-zinc-300 uppercase">
                    Moderation
                  </h3>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={4}
                    placeholder="Decision Notes (optional)"
                    className="w-full resize-none rounded-md border border-zinc-700 bg-zinc-900/60 p-2 text-[12px] text-zinc-200 focus:outline-none focus:ring-2 focus:ring-yellow-400/40"
                  />
                  <div className="grid grid-cols-3 gap-2">
                    <Button
                      size="sm"
                      variant="success"
                      disabled={processing}
                      onClick={() => onApprove?.(notes || undefined)}
                      className="col-span-1"
                    >
                      {processing ? "Approving..." : "Approve"}
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      disabled={processing}
                      onClick={() => onReject?.(notes || undefined)}
                      className="col-span-1"
                    >
                      {processing ? "Rejecting..." : "Reject"}
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={processing}
                      onClick={() => onClose()}
                      className="col-span-1"
                    >
                      Cancel
                    </Button>
                  </div>
                </section>
              )}
            </div>
            <div className="px-6 py-3 border-t border-zinc-800/70 text-[10px] text-zinc-500 flex items-center justify-end gap-3">
              <Button
                size="sm"
                variant="outline"
                onClick={() => onClose()}
                disabled={processing}
              >
                Close
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
