"use client";
import { useEffect, useState } from "react";
import { listExpiredEvents } from "@/lib/api/events";
import { ExternalEvent } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EventCard } from "@/components/events/EventCard";
import { EventDetailsDialog } from "@/components/events/EventDetailsDialog";

export default function ExpiredEventsPage() {
  const [events, setEvents] = useState<ExternalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ExternalEvent | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await listExpiredEvents({
          status: "approved",
          page_size: 200,
          ordering: "-end_datetime",
        });
        if (mounted) setEvents(res.results);
      } catch (e: any) {
        if (mounted) setError(e?.message || "Failed to load events");
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ProtectedRoute requireAuth allowedRoles={["admin", "alumni", "student"]}>
      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Expired Events
              {loading && (
                <span className="text-xs text-zinc-400 ml-2">Loading…</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
            {!loading && events.length === 0 && (
              <div className="text-sm text-zinc-500">No expired events.</div>
            )}
            {loading && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div
                    key={i}
                    className="h-40 rounded-xl border border-zinc-800 bg-zinc-900/40 animate-pulse"
                  />
                ))}
              </div>
            )}
            {!loading && events.length > 0 && (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
                {events.map((ev) => (
                  <EventCard
                    key={ev.id}
                    event={ev}
                    compact
                    onView={() => setSelected(ev)}
                    viewLabel="View Details"
                  />
                ))}
              </div>
            )}
            {!loading && events.length > 0 && (
              <div className="mt-6 text-[10px] uppercase tracking-wider text-zinc-500 text-center">
                Ended events show a muted style for clarity.
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      <EventDetailsDialog event={selected} onClose={() => setSelected(null)} />
    </ProtectedRoute>
  );
}
