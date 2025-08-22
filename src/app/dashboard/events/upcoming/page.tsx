"use client";
import { useEffect, useState } from "react";
import { listUpcomingEvents } from "@/lib/api/events";
import { ExternalEvent } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { EventCard } from "@/components/events/EventCard";
import { EventDetailsDialog } from "@/components/events/EventDetailsDialog";

export default function UpcomingEventsPage() {
  const [featured, setFeatured] = useState<ExternalEvent[]>([]);
  const [upcoming, setUpcoming] = useState<ExternalEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<ExternalEvent | null>(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [featRes, allRes] = await Promise.all([
          listUpcomingEvents({
            status: "approved",
            is_featured: true,
            page_size: 48,
            ordering: "start_datetime",
          }),
          listUpcomingEvents({
            status: "approved",
            page_size: 400,
            ordering: "start_datetime",
          }),
        ]);
        if (mounted) {
          const now = Date.now();
          // classify client side: upcoming = start > now
          const classifyUpcoming = (ev: ExternalEvent) => {
            if (!ev.start_datetime) return false; // no start can't be upcoming by definition
            const startTs = new Date(ev.start_datetime).getTime();
            return startTs > now; // strictly future
          };
          const featFiltered = featRes.results.filter(classifyUpcoming);
          setFeatured(featFiltered);
          const featIds = new Set(featFiltered.map((e) => e.id));
          setUpcoming(
            allRes.results
              .filter((e) => !featIds.has(e.id))
              .filter(classifyUpcoming)
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
              Upcoming Featured Events
              {loading && (
                <span className="text-xs text-zinc-400 ml-2">Loading…</span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {error && <div className="mb-3 text-sm text-red-400">{error}</div>}
            {!loading && featured.length === 0 && (
              <div className="text-sm text-zinc-400">
                No featured upcoming events.
              </div>
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
            <CardTitle>All Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            {!loading && upcoming.length === 0 && (
              <div className="text-sm text-zinc-400">No upcoming events.</div>
            )}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
              {upcoming.map((ev) => (
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
      <EventDetailsDialog
        event={selected}
        onClose={() => setSelected(null)}
        showUrl={false}
      />
    </ProtectedRoute>
  );
}
