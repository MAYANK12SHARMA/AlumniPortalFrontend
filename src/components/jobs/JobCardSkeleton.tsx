"use client";
import React from "react";
import { cn } from "@/lib/utils";

export function JobCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-gradient-to-br from-zinc-700/20 via-zinc-800/30 to-zinc-900 backdrop-blur-sm overflow-hidden p-6 md:p-7 min-h-[260px]",
        "shadow-[0_2px_8px_-2px_rgba(0,0,0,0.45),0_0_0_1px_rgba(255,255,255,0.05)]",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_2.2s_infinite] before:bg-[linear-gradient(110deg,transparent,rgba(255,255,255,0.06),transparent)]",
        className
      )}
      aria-hidden="true"
    >
      <div className="flex-1 flex flex-col gap-4">
        <header className="space-y-2">
          <div className="h-5 w-3/4 rounded-md bg-zinc-700/50" />
          <div className="space-y-1">
            <div className="h-3 w-full rounded bg-zinc-700/40" />
            <div className="h-3 w-5/6 rounded bg-zinc-700/30" />
            <div className="h-3 w-2/3 rounded bg-zinc-700/30" />
          </div>
        </header>
        <div className="flex flex-wrap gap-1.5 mt-auto">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className="h-5 w-14 rounded-md bg-zinc-700/40 inline-block"
            />
          ))}
        </div>
      </div>
      <div className="mt-5 -mx-6 mb-[-.5rem] px-6 pt-3 pb-2 flex flex-wrap items-center gap-2 border-t border-zinc-800/60 bg-zinc-900/50 backdrop-blur-md">
        <span className="h-5 w-16 rounded-full bg-zinc-700/50" />
        <span className="h-5 w-12 rounded-full bg-zinc-700/40" />
      </div>
    </div>
  );
}

export default JobCardSkeleton;
