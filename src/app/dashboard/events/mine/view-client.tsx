"use client";
import React, { useEffect, useState } from "react";
import { listExternalEvents } from "@/lib/api/events";
import { ExternalEvent } from "@/types";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

export function MyEventsClient() {
  const [events, setEvents] = useState<ExternalEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selected, setSelected] = useState<ExternalEvent | null>(null);

  useEffect(() => {
    let active = true;
    async function load() {
      setLoading(true);
      try {
        const res = await listExternalEvents({
          mine: true,
          status: statusFilter === "all" ? undefined : statusFilter,
        });
        if (!active) return;
        setEvents(res.results);
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => {
      active = false;
    };
  }, [statusFilter]);

  const statuses: { label: string; value: string }[] = [
    { label: "All", value: "all" },
    { label: "Pending", value: "pending" },
    { label: "Approved", value: "approved" },
    { label: "Rejected", value: "rejected" },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          My Submissions
        </h1>
        <p className="text-sm text-zinc-400">
          Track approval status of events you submitted.
        </p>
      </header>
      <div className="flex flex-wrap gap-2">
        {statuses.map((s) => (
          <Button
            key={s.value}
            variant={statusFilter === s.value ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(s.value)}
          >
            {s.label}
          </Button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {loading &&
            Array.from({ length: 6 }).map((_, i) => (
              <motion.div
                key={"s" + i}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-48 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse"
              />
            ))}
          {!loading && events.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="col-span-full text-sm text-zinc-400 py-16 text-center border border-dashed border-zinc-700 rounded-xl"
            >
              No events found.
            </motion.div>
          )}
          {!loading &&
            events.map((ev) => {
              const rejectedNote = ev.review_notes && ev.status === "rejected";
              return (
                <motion.button
                  key={ev.id}
                  type="button"
                  onClick={() => setSelected(ev)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(ev);
                    }
                  }}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="group text-left relative rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950/70 to-zinc-900/50 p-5 flex flex-col gap-3 outline-none focus:ring-2 focus:ring-yellow-400/60 transition"
                >
                  <div className="flex items-start gap-3">
                    <div className="flex-1 space-y-1">
                      <h3 className="font-semibold text-zinc-100 text-sm line-clamp-2">
                        {ev.title}
                      </h3>
                      <p className="text-[11px] text-zinc-400 line-clamp-3">
                        {ev.short_description}
                      </p>
                    </div>
                    <EventStatusBadge status={ev.status} />
                  </div>
                  <div className="flex flex-wrap gap-1 min-h-[20px]">
                    {ev.tags.slice(0, 4).map((t) => (
                      <span
                        key={t}
                        className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px]"
                      >
                        {t}
                      </span>
                    ))}
                    {ev.tags.length > 4 && (
                      <span className="text-[10px] text-zinc-500">
                        +{ev.tags.length - 4}
                      </span>
                    )}
                  </div>
                  <div className="mt-auto flex justify-between items-center text-[10px] text-zinc-500 pt-2 border-t border-zinc-800">
                    <span>{new Date(ev.created_at).toLocaleDateString()}</span>
                    {rejectedNote && <ReviewNotes notes={ev.review_notes!} />}
                  </div>
                  <span className="pointer-events-none absolute inset-x-0 bottom-0 translate-y-full opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition text-[10px] text-center text-zinc-500 py-1">
                    View details ▸
                  </span>
                </motion.button>
              );
            })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/70 backdrop-blur-sm"
              onClick={() => setSelected(null)}
            />
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 170, damping: 22 }}
              className="relative z-10 w-full max-w-3xl max-h-[90vh] overflow-hidden rounded-2xl border border-zinc-800/80 bg-zinc-950/80 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_8px_40px_-4px_rgba(0,0,0,0.6)] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/70 bg-gradient-to-r from-zinc-900/70 to-zinc-900/30">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-zinc-100 line-clamp-2">
                    {selected.title}
                  </h2>
                  <p className="text-[11px] text-zinc-500">
                    Submitted {new Date(selected.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <EventStatusBadge status={selected.status} />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelected(null)}
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
                    {selected.short_description}
                  </p>
                  {selected.description && (
                    <div className="rounded-xl border border-zinc-800/70 bg-zinc-900/40 p-4">
                      <h4 className="text-[11px] font-semibold text-zinc-300 mb-2">
                        Full Description
                      </h4>
                      <pre className="whitespace-pre-wrap text-[12px] text-zinc-300 font-sans">
                        {selected.description}
                      </pre>
                    </div>
                  )}
                </section>
                <section className="grid grid-cols-2 gap-4 text-[11px]">
                  <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3 space-y-1">
                    <p className="text-zinc-500">Start</p>
                    <p className="text-zinc-200 font-medium">
                      {selected.start_datetime
                        ? new Date(selected.start_datetime).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3 space-y-1">
                    <p className="text-zinc-500">End</p>
                    <p className="text-zinc-200 font-medium">
                      {selected.end_datetime
                        ? new Date(selected.end_datetime).toLocaleString()
                        : "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3 space-y-1 col-span-2">
                    <p className="text-zinc-500">Location</p>
                    <p className="text-zinc-200 font-medium">
                      {selected.location || "—"}
                    </p>
                  </div>
                  <div className="rounded-lg border border-zinc-800/70 bg-zinc-900/30 p-3 space-y-1 col-span-2">
                    <p className="text-zinc-500">Event URL</p>
                    {selected.event_url ? (
                      <a
                        href={selected.event_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-yellow-300 hover:underline break-all text-[11px]"
                      >
                        {selected.event_url}
                      </a>
                    ) : (
                      <span className="text-zinc-200">—</span>
                    )}
                  </div>
                </section>
                <section className="space-y-3">
                  <h3 className="text-sm font-medium tracking-wide text-zinc-300 uppercase">
                    Tags
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selected.tags.map((t) => (
                      <span
                        key={t}
                        className="px-2 py-1 rounded-full bg-amber-500/10 text-amber-300 text-[11px] border border-amber-400/20"
                      >
                        {t}
                      </span>
                    ))}
                    {selected.tags.length === 0 && (
                      <span className="text-[11px] text-zinc-500">No tags</span>
                    )}
                  </div>
                </section>
                <section className="space-y-3">
                  <h3 className="text-sm font-medium tracking-wide text-zinc-300 uppercase">
                    Status & Messages
                  </h3>
                  {selected.status === "pending" && (
                    <div className="rounded-lg border border-yellow-400/30 bg-yellow-500/5 p-3 text-[11px] text-yellow-300">
                      Your event is pending review by an administrator.
                    </div>
                  )}
                  {selected.status !== "pending" && selected.review_notes && (
                    <div
                      className={`rounded-lg p-3 text-[11px] space-y-2 border ${
                        selected.status === "approved"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : "border-rose-500/40 bg-rose-500/10 text-rose-300"
                      }`}
                    >
                      <p className="font-medium text-[11px] tracking-wide uppercase">
                        {selected.status === "approved"
                          ? "Approval Message"
                          : "Rejection Reason"}
                      </p>
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1 custom-scroll">
                        {selected.review_notes
                          .split("\n")
                          .filter(Boolean)
                          .map((n, i) => (
                            <div
                              key={i}
                              className="text-[11px] leading-relaxed"
                            >
                              {n}
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                  {selected.status !== "pending" && !selected.review_notes && (
                    <div className="rounded-lg border border-zinc-700 bg-zinc-800/50 p-3 text-[11px] text-zinc-400">
                      No message provided.
                    </div>
                  )}
                </section>
              </div>
              <div className="px-6 py-3 border-t border-zinc-800/70 text-[10px] text-zinc-500 flex items-center justify-between">
                <span>Press Esc to close.</span>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setSelected(null)}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function ReviewNotes({ notes }: { notes: string }) {
  const lastLine = notes.trim().split(/\n/).filter(Boolean).slice(-1)[0];
  return (
    <span className="text-rose-300/80" title={notes}>
      {lastLine}
    </span>
  );
}
