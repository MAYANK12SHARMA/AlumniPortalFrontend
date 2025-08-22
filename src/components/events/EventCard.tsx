"use client";
import { ExternalEvent } from "@/types";
import { EventStatusBadge } from "./EventStatusBadge";
import { cn } from "@/lib/utils";

type Props = {
  event: ExternalEvent;
  featured?: boolean;
  className?: string;
  compact?: boolean;
  onView?: () => void; // show internal view details button if provided
  viewLabel?: string;
};

export function EventCard({
  event,
  featured,
  className,
  compact,
  onView,
  viewLabel = "View Details",
}: Props) {
  const start = event.start_datetime ? new Date(event.start_datetime) : null;
  const end = event.end_datetime ? new Date(event.end_datetime) : null;
  const now = Date.now();
  let temporal: "upcoming" | "live" | "expired" | null = null;
  if (start && end) {
    if (now < start.getTime()) temporal = "upcoming";
    else if (now <= end.getTime()) temporal = "live";
    else temporal = "expired";
  } else if (start) temporal = now < start.getTime() ? "upcoming" : "live";
  else if (end) temporal = now > end.getTime() ? "expired" : null;

  const status = event.status;
  const context = featured
    ? "featured"
    : status === "pending"
    ? "pending"
    : status === "rejected"
    ? "rejected"
    : temporal || "default";

  const accent: Record<string, string> = {
    featured: "from-yellow-500/20 via-yellow-400/10 to-zinc-900",
    pending: "from-amber-500/20 via-amber-400/10 to-zinc-900",
    rejected: "from-rose-500/20 via-rose-400/10 to-zinc-900",
    live: "from-emerald-500/25 via-emerald-400/10 to-zinc-900",
    upcoming: "from-sky-500/25 via-sky-400/10 to-zinc-900",
    expired: "from-zinc-600/10 via-zinc-700/10 to-zinc-900",
    default: "from-zinc-600/10 via-zinc-500/5 to-zinc-900",
  };

  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-gradient-to-br backdrop-blur-sm overflow-hidden p-6 md:p-7 min-h-[260px] shadow-[0_2px_8px_-2px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.04)] transition duration-300",
        "hover:shadow-[0_4px_18px_-4px_rgba(0,0,0,0.65),0_0_0_1px_rgba(255,255,255,0.08)]",
        accent[context],
        context === "expired" && "opacity-90",
        className
      )}
    >
      {/* Temporal label top-right */}
      {temporal && (
        <span
          className={cn(
            "absolute top-3 right-3 z-10 text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border backdrop-blur-md",
            temporal === "live" &&
              "bg-emerald-500/20 text-emerald-200 border-emerald-400/30",
            temporal === "upcoming" &&
              "bg-sky-500/20 text-sky-200 border-sky-400/30",
            temporal === "expired" &&
              "bg-zinc-700/40 text-zinc-300 border-zinc-600/40"
          )}
        >
          {temporal === "live"
            ? "Live"
            : temporal === "upcoming"
            ? "Upcoming"
            : "Ended"}
        </span>
      )}
      {/* Header */}
      <div className="flex-1 flex flex-col gap-4">
        <header className="space-y-2">
          <h3
            className={cn(
              "font-semibold leading-tight tracking-tight line-clamp-2",
              compact ? "text-base" : "text-lg",
              context === "featured" && "text-yellow-200",
              context === "pending" && "text-amber-200",
              context === "rejected" && "text-rose-200",
              context === "live" && "text-emerald-200",
              context === "upcoming" && "text-sky-200",
              context === "expired" && "text-zinc-300",
              context === "default" && "text-zinc-100"
            )}
            title={event.title}
          >
            {event.title}
          </h3>
          <p
            className={cn(
              "text-zinc-400/90 leading-relaxed line-clamp-4",
              compact ? "text-xs" : "text-sm"
            )}
          >
            {event.short_description || event.description?.slice(0, 240)}
          </p>
        </header>
        {/* Dates */}
        <div
          className={cn(
            "text-[11px] flex flex-wrap items-center gap-x-2 gap-y-1 text-zinc-500 font-medium tracking-wide",
            compact && "text-[10px]"
          )}
        >
          <span className="text-zinc-400/90">
            {start ? start.toLocaleString() : "TBA"}
          </span>
          <span className="opacity-40">→</span>
          <span>{end ? end.toLocaleString() : "TBA"}</span>
        </div>
        {/* Tags */}
        <div className="flex flex-wrap gap-1.5 max-h-14 overflow-hidden pr-1">
          {event.tags?.slice(0, 10).map((t) => (
            <span
              key={t}
              className={cn(
                "px-2 py-0.5 rounded-md text-[11px] font-medium tracking-wide border/30 backdrop-blur-sm",
                context === "rejected" &&
                  "bg-rose-500/15 text-rose-200 border border-rose-400/20",
                context === "pending" &&
                  "bg-amber-500/15 text-amber-200 border border-amber-400/20",
                context === "live" &&
                  "bg-emerald-500/15 text-emerald-200 border border-emerald-400/20",
                context === "upcoming" &&
                  "bg-sky-500/15 text-sky-200 border border-sky-400/20",
                context === "featured" &&
                  "bg-yellow-500/20 text-yellow-100 border border-yellow-400/30",
                context === "expired" &&
                  "bg-zinc-700/30 text-zinc-300 border border-zinc-600/30",
                context === "default" &&
                  "bg-zinc-800/60 text-zinc-300 border border-zinc-700/50"
              )}
            >
              {t}
            </span>
          ))}
          {event.tags && event.tags.length > 10 && (
            <span className="px-2 py-0.5 rounded-md text-[11px] bg-zinc-800/40 text-zinc-400 border border-zinc-700/50">
              +{event.tags.length - 10}
            </span>
          )}
        </div>
      </div>
      {/* Footer */}
      <div className="mt-5 -mx-6 mb-[-.5rem] px-6 pt-3 pb-2 flex flex-wrap items-center gap-2 border-t border-zinc-800/60 bg-zinc-900/50 backdrop-blur-md">
        <EventStatusBadge status={event.status} />
        {temporal === "expired" && (
          <span className="inline-flex items-center rounded-full bg-zinc-700/40 text-zinc-300 px-2 py-0.5 text-[11px] ring-1 ring-inset ring-zinc-500/30">
            Expired
          </span>
        )}
        {(featured || event.is_featured) && (
          <span className="inline-flex items-center rounded-full bg-yellow-500/15 text-yellow-200 px-2 py-0.5 text-[11px] ring-1 ring-inset ring-yellow-400/30 font-medium">
            Featured
          </span>
        )}
        {onView && (
          <button
            type="button"
            onClick={onView}
            className="ml-auto inline-flex items-center rounded-md border border-zinc-700/60 bg-zinc-800/40 hover:bg-zinc-700/50 px-3 py-1 text-[11px] font-medium tracking-wide text-zinc-200 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/60"
          >
            {viewLabel}
          </button>
        )}
      </div>
    </div>
  );
}
