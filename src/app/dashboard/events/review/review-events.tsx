"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  listExternalEvents,
  approveExternalEvent,
  rejectExternalEvent,
} from "@/lib/api/events";
import type { ExternalEvent } from "@/types";
import { Button } from "@/components/ui/button";
import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ModerationTarget extends ExternalEvent {
  selecting?: boolean;
}

// Single canonical component (removed duplicate review-client.tsx + d.ts)
export default function ReviewEventsClient() {
  const [pending, setPending] = useState<ModerationTarget[]>([]);
  const [approved, setApproved] = useState<ExternalEvent[]>([]);
  const [filter, setFilter] = useState("");
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"pending" | "approved">("pending");
  const [bulkNotes, setBulkNotes] = useState("");
  const [selected, setSelected] = useState<ExternalEvent | null>(null);
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [submittingIds, setSubmittingIds] = useState<Set<number>>(new Set());
  const [selectionMode, setSelectionMode] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [p, a] = await Promise.all([
        listExternalEvents({ status: "pending", page_size: 100 }),
        listExternalEvents({ status: "approved", page_size: 50 }),
      ]);
      setPending(p.results);
      setApproved(a.results);
    } catch (e) {
      console.error("Failed to load events:", e);
      toast.error("Failed to load events");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const sourceList = view === "pending" ? pending : approved;
  const filteredList = sourceList.filter(
    (ev) =>
      !filter ||
      ev.title.toLowerCase().includes(filter.toLowerCase()) ||
      (ev.short_description || "").toLowerCase().includes(filter.toLowerCase())
  );

  const moderate = useCallback(
    async (id: number, action: "approve" | "reject", notes?: string) => {
      if (submittingIds.has(id)) return; // prevent duplicate rapid clicks
      setActionLoading(true);
      setSubmittingIds((s) => new Set([...s, id]));
      try {
        if (action === "approve") await approveExternalEvent(id, notes);
        else await rejectExternalEvent(id, notes);
        toast.success(action === "approve" ? "Approved" : "Rejected");
        setSelected(null);
        setNotes("");
        // Update local list optimistically instead of full reload for snappier UX
        setPending((prev) => prev.filter((p) => p.id !== id));
        if (action === "approve") {
          const ev = pending.find((p) => p.id === id);
          if (ev) {
            setApproved((a) => [
              {
                ...ev,
                status: "approved",
                review_notes: notes || ev.review_notes,
              },
              ...a,
            ]);
          }
        }
      } catch (e: any) {
        toast.error(e?.response?.data?.detail || "Action failed");
        // fallback to reload to sync
        load();
      } finally {
        setActionLoading(false);
        setSubmittingIds((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        });
      }
    },
    [pending, submittingIds, load]
  );

  const bulkApprove = async () => {
    const targets = pending.filter((p) => p.selecting);
    if (targets.length === 0) {
      toast("Select events first");
      return;
    }
    for (const ev of targets) {
      await moderate(ev.id, "approve", bulkNotes);
    }
    setBulkNotes("");
  };

  const toggleSelect = (id: number) => {
    setPending((prev) =>
      prev.map((p) => (p.id === id ? { ...p, selecting: !p.selecting } : p))
    );
  };

  // keyboard shortcuts when modal open
  // Keyboard shortcuts only when modal focused & no textarea is active
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!selected) return;
      const active = document.activeElement;
      if (
        active &&
        (active.tagName === "TEXTAREA" || active.tagName === "INPUT")
      ) {
        return; // don't hijack typing
      }
      if (e.key === "Escape") {
        setSelected(null);
      } else if (e.key.toLowerCase() === "a") {
        moderate(selected.id, "approve", notes || undefined);
      } else if (e.key.toLowerCase() === "r") {
        moderate(selected.id, "reject", notes || undefined);
      }
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [selected, notes, moderate]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10 space-y-8">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div className="space-y-2">
          <h1 className="text-2xl font-semibold text-zinc-100">
            Review Events
          </h1>
          <p className="text-sm text-zinc-400">
            Moderate pending submissions from alumni and students.
          </p>
          <div className="flex gap-2 text-xs">
            <Button
              variant={view === "pending" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("pending")}
            >
              Pending ({pending.length})
            </Button>
            <Button
              variant={view === "approved" ? "default" : "outline"}
              size="sm"
              onClick={() => setView("approved")}
            >
              Recently Approved ({approved.length})
            </Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <Input
            placeholder="Search..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-56"
          />
          {view === "pending" && (
            <div className="flex items-center gap-2">
              <Input
                placeholder="Bulk notes (optional)"
                value={bulkNotes}
                onChange={(e) => setBulkNotes(e.target.value)}
                className="w-56"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={bulkApprove}
                disabled={pending.every((p) => !p.selecting)}
              >
                Bulk Approve
              </Button>
            </div>
          )}
          {view === "pending" && (
            <Button
              variant={selectionMode ? "default" : "outline"}
              size="sm"
              onClick={() => {
                // turning off selection mode clears selections
                if (selectionMode) {
                  setPending((prev) =>
                    prev.map((p) => ({ ...p, selecting: false }))
                  );
                }
                setSelectionMode((s) => !s);
              }}
            >
              {selectionMode ? "Done Selecting" : "Select Multiple"}
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </Button>
        </div>
      </header>

      <AnimatePresence mode="popLayout">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 md:grid-cols-2 lg:grid-cols-3"
          >
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-56 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse"
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!loading && filteredList.length === 0 && (
        <div className="text-sm text-zinc-400 border border-dashed border-zinc-700 rounded-xl p-10 text-center">
          No events.
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout">
          {filteredList.map((evRaw) => {
            const ev = evRaw as ModerationTarget;
            return (
              <motion.button
                key={ev.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onClick={() => {
                  if (selectionMode) {
                    toggleSelect(ev.id);
                    return;
                  }
                  setSelected(ev);
                  setNotes("");
                }}
                className={cn(
                  "text-left relative rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950/70 to-zinc-900/50 p-5 flex flex-col gap-3 group outline-none focus:ring-2 focus:ring-yellow-400/60 transition",
                  selected?.id === ev.id &&
                    !selectionMode &&
                    "ring-2 ring-yellow-400/60",
                  selectionMode &&
                    ev.selecting &&
                    "ring-2 ring-emerald-500/60 border-emerald-600"
                )}
              >
                {selectionMode && (
                  <div className="absolute top-2 left-2 z-10">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleSelect(ev.id);
                      }}
                      className={cn(
                        "h-5 w-5 rounded border flex items-center justify-center text-[10px] font-medium",
                        ev.selecting
                          ? "bg-emerald-500 border-emerald-500 text-black"
                          : "bg-zinc-900/70 border-zinc-600 text-zinc-400 hover:border-zinc-400"
                      )}
                      aria-pressed={!!ev.selecting}
                    >
                      {ev.selecting ? "✓" : ""}
                    </button>
                  </div>
                )}
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
                <div className="text-[10px] text-zinc-500 space-y-1">
                  {ev.start_datetime && (
                    <p>Start: {new Date(ev.start_datetime).toLocaleString()}</p>
                  )}
                  {ev.end_datetime && (
                    <p>End: {new Date(ev.end_datetime).toLocaleString()}</p>
                  )}
                </div>
                <div className="flex flex-wrap gap-1 min-h-[20px]">
                  {ev.tags.slice(0, 5).map((t) => (
                    <span
                      key={t}
                      className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px]"
                    >
                      {t}
                    </span>
                  ))}
                  {ev.tags.length > 5 && (
                    <span className="text-[10px] text-zinc-500">
                      +{ev.tags.length - 5}
                    </span>
                  )}
                </div>
                <div className="flex items-center justify-between pt-1">
                  {view === "pending" && (
                    <span className="text-[10px] text-zinc-500">
                      Click to review ▸
                    </span>
                  )}
                  {view === "approved" && ev.review_notes && (
                    <p className="text-[10px] text-emerald-400 line-clamp-1 flex-1 text-right">
                      Latest: {ev.review_notes.split("\n").slice(-1)[0]}
                    </p>
                  )}
                </div>
              </motion.button>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="absolute inset-0 bg-black/75 backdrop-blur-sm"
              onClick={() => !actionLoading && setSelected(null)}
            />
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
              transition={{ type: "spring", stiffness: 170, damping: 22 }}
              role="dialog"
              aria-modal="true"
              className="relative z-10 w-full max-w-5xl max-h-[92vh] overflow-hidden rounded-2xl border border-zinc-700/70 bg-gradient-to-br from-zinc-950/90 via-zinc-900/80 to-zinc-950/80 backdrop-blur-xl shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_12px_55px_-10px_rgba(0,0,0,0.65)] flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/70 bg-zinc-900/60">
                <div className="space-y-1">
                  <h2 className="text-lg font-semibold text-zinc-100">
                    {selected.title}
                  </h2>
                  <p className="text-[11px] text-zinc-400">{selected.slug}</p>
                </div>
                <div className="flex items-center gap-2">
                  <EventStatusBadge status={selected.status} />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelected(null)}
                    disabled={actionLoading}
                  >
                    Close
                  </Button>
                </div>
              </div>
              <div className="flex-1 grid md:grid-cols-[1fr_300px] gap-0 overflow-hidden">
                <div className="relative overflow-y-auto p-6 space-y-6 custom-scroll">
                  <section className="space-y-3">
                    <h3 className="text-sm font-medium tracking-wide text-zinc-300 uppercase">
                      Overview
                    </h3>
                    <div className="text-xs text-zinc-400 leading-relaxed">
                      {selected.short_description}
                    </div>
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
                        <span className="text-[11px] text-zinc-500">
                          No tags
                        </span>
                      )}
                    </div>
                  </section>
                  <section className="space-y-3">
                    <h3 className="text-sm font-medium tracking-wide text-zinc-300 uppercase">
                      Submission
                    </h3>
                    <ul className="text-[11px] text-zinc-400 space-y-1">
                      <li>
                        <span className="text-zinc-500">Posted By:</span>{" "}
                        <span className="text-zinc-300">
                          {selected.posted_by_email || selected.posted_by_id}
                        </span>
                      </li>
                      <li>
                        <span className="text-zinc-500">Created:</span>{" "}
                        {new Date(selected.created_at).toLocaleString()}
                      </li>
                      <li>
                        <span className="text-zinc-500">Updated:</span>{" "}
                        {new Date(selected.updated_at).toLocaleString()}
                      </li>
                      {/* type field not present on ExternalEvent type in frontend; backend includes maybe; display status instead */}
                      <li>
                        <span className="text-zinc-500">Status:</span>{" "}
                        {selected.status}
                      </li>
                    </ul>
                  </section>
                </div>
                <div className="relative border-t md:border-t-0 md:border-l border-zinc-800/70 bg-zinc-900/40 flex flex-col">
                  <div className="sticky top-0 z-10 px-5 py-4 border-b border-zinc-800/70 bg-zinc-950/70 backdrop-blur-sm">
                    <p className="text-[11px] font-medium tracking-wide text-zinc-400 uppercase">
                      Moderation
                    </p>
                  </div>
                  <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scroll">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-zinc-300">
                        Decision Notes (optional)
                      </label>
                      <Textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        rows={6}
                        placeholder="Add context for the submitter..."
                        className="resize-none text-xs"
                      />
                      <p className="text-[10px] text-zinc-500">
                        Visible to submitter. Short, clear, constructive
                        feedback.
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <Button
                        onClick={() =>
                          moderate(selected.id, "approve", notes || undefined)
                        }
                        disabled={actionLoading}
                        variant="success"
                        className="h-9 text-xs"
                      >
                        {submittingIds.has(selected.id) && actionLoading
                          ? "Approving..."
                          : "Approve (A)"}
                      </Button>
                      <Button
                        onClick={() =>
                          moderate(selected.id, "reject", notes || undefined)
                        }
                        disabled={actionLoading}
                        variant="danger"
                        className="h-9 text-xs"
                      >
                        {submittingIds.has(selected.id) && actionLoading
                          ? "Rejecting..."
                          : "Reject (R)"}
                      </Button>
                      <Button
                        onClick={() => {
                          setSelected(null);
                          setNotes("");
                        }}
                        variant="outline"
                        className="col-span-2 h-8 text-[11px]"
                        disabled={actionLoading}
                      >
                        Cancel / Close (Esc)
                      </Button>
                    </div>
                    {selected.review_notes && (
                      <div className="space-y-2">
                        <p className="text-[11px] font-medium text-zinc-300">
                          Previous Notes
                        </p>
                        <div className="space-y-2 max-h-40 overflow-y-auto pr-1 custom-scroll">
                          {selected.review_notes
                            .split("\n")
                            .filter(Boolean)
                            .map((n, i) => (
                              <div
                                key={i}
                                className="rounded-md border border-zinc-800/70 bg-zinc-900/60 p-2 text-[11px] text-zinc-400"
                              >
                                {n}
                              </div>
                            ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-3 border-t border-zinc-800/70 flex items-center justify-between text-[10px] text-zinc-500">
                    <span>Shortcuts: A approve, R reject, Esc close</span>
                    {actionLoading && (
                      <span className="text-amber-400 animate-pulse">
                        Processing...
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
