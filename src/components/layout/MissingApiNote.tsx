"use client";
import { cn } from "@/lib/utils";

export default function MissingApiNote({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 rounded-md border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] text-amber-300",
        className
      )}
    >
      Add an API for this navigation
    </div>
  );
}
