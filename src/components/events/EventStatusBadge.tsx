"use client";
import React from "react";
import { ExternalEvent } from "@/types";
import { cn } from "@/lib/utils";

export function EventStatusBadge({
  status,
}: {
  status: ExternalEvent["status"];
}) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset";
  const map: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-300 ring-amber-500/30 animate-pulse",
    approved: "bg-emerald-500/10 text-emerald-300 ring-emerald-500/30",
    rejected: "bg-rose-500/10 text-rose-300 ring-rose-500/30",
  };
  return <span className={cn(base, map[status])}>{status}</span>;
}
