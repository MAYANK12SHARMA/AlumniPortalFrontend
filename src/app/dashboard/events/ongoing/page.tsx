"use client";
import { useEffect, useState } from "react";
import { listOngoingEvents } from "@/lib/api/events";
import { ExternalEvent } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EventCard } from "@/components/events/EventCard";
import { EventDetailsDialog } from "@/components/events/EventDetailsDialog";

// Client-side classification: live if start <= now AND (no end OR end >= now)
function isLive(ev: ExternalEvent, now: number) {
  if (!ev.start_datetime) return false; // no start -> cannot be live
  const start = new Date(ev.start_datetime).getTime();
  if (start > now) return false; // future
  if (ev.end_datetime) {
    const end = new Date(ev.end_datetime).getTime();
    if (end < now) return false; // already ended
  }
  return true;
}

export default function OngoingEventsPage() {
  const [featured, setFeatured] = useState<ExternalEvent[]>([]);
  const [live, setLive] = useState<ExternalEvent[]>([]); // non-featured ongoing
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ExternalEvent | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        // Fetch approved & apply strict client-side live classification.
        const [featRes, allRes] = await Promise.all([
          listOngoingEvents({
            is_featured: true,
            status: "approved",
            page_size: 48,
            ordering: "start_datetime",
          }),
          listOngoingEvents({
            status: "approved",
            page_size: 400,
            ordering: "start_datetime",
          }),
        ]);
        if (mounted) {
          const now = Date.now();
          const featFiltered = featRes.results.filter((e) => isLive(e, now));
          setFeatured(featFiltered);
          const featIds = new Set(featFiltered.map((e) => e.id));
          setLive(
            allRes.results
              .filter((e) => !featIds.has(e.id))
              .filter((e) => isLive(e, now))
          );
        }
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
            <CardTitle>
              Featured Events
              {loading && (
                <span className="text-xs text-zinc-400 ml-2">Loading…</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
            {!loading && featured.length === 0 && (
              <div className="text-sm text-zinc-400">No featured events.</div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {featured.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  featured
                  onView={() => setSelected(ev)}
                  viewLabel="View Details"
                />
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Live Ongoing Events</CardTitle>
          </CardHeader>
          <CardContent>
            {!loading && live.length === 0 && (
              <div className="text-sm text-zinc-400">No live events.</div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {live.map((ev) => (
                <EventCard
                  key={ev.id}
                  event={ev}
                  compact
                  onView={() => setSelected(ev)}
                  viewLabel="View Details"
                />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
      <EventDetailsDialog event={selected} onClose={() => setSelected(null)} />
    </ProtectedRoute>
  );
}
