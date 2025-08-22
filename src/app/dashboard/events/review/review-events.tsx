"use client";
import React, { useEffect, useState, useCallback } from "react";
import {
  listExternalEvents,
  approveExternalEvent,
  rejectExternalEvent,
} from "@/lib/api/events";
import type { ExternalEvent } from "@/types";
import { Button } from "@/components/ui/button";
// import { EventStatusBadge } from "@/components/events/EventStatusBadge";
import { EventCard } from "@/components/events/EventCard";
import { EventDetailsDialog } from "@/components/events/EventDetailsDialog";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
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
  // Removed actionLoading state (was not used in UI)
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
  // action start
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
  // action end
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
        {filteredList.map((evRaw) => {
          const ev = evRaw as ModerationTarget;
          return (
            <div key={ev.id} className="relative">
              {selectionMode && (
                <button
                  type="button"
                  onClick={() => toggleSelect(ev.id)}
                  className={cn(
                    "absolute top-2 left-2 z-10 h-5 w-5 rounded border flex items-center justify-center text-[10px] font-medium",
                    ev.selecting
                      ? "bg-emerald-500 border-emerald-500 text-black"
                      : "bg-zinc-900/70 border-zinc-600 text-zinc-400 hover:border-zinc-400"
                  )}
                  aria-pressed={!!ev.selecting}
                >
                  {ev.selecting ? "✓" : ""}
                </button>
              )}
              <EventCard
                event={ev}
                onView={() => {
                  if (selectionMode) {
                    toggleSelect(ev.id);
                    return;
                  }
                  setSelected(ev);
                  setNotes("");
                }}
                viewLabel={view === "pending" ? "Review" : "View"}
              />
              {view === "approved" && ev.review_notes && (
                <p className="mt-1 text-[10px] text-emerald-400 line-clamp-1">
                  Latest: {ev.review_notes.split("\n").slice(-1)[0]}
                </p>
              )}
            </div>
          );
        })}
      </div>

      <EventDetailsDialog
        event={selected}
        onClose={() => {
          setSelected(null);
          setNotes("");
        }}
        showModeration={view === "pending"}
        onApprove={(n) => {
          if (selected) {
            void moderate(selected.id, "approve", n);
          }
        }}
        onReject={(n) => {
          if (selected) {
            void moderate(selected.id, "reject", n);
          }
        }}
        moderationNotes={notes}
        onChangeModerationNotes={setNotes}
      />
    </div>
  );
}
