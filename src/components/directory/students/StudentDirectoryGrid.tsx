"use client";
import React from "react";
import { useStudentDirectory } from "@/hooks/useStudentDirectory";
import { StudentCard } from "./StudentCard";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface Props {
  filters: any;
  onPageChange: (p: number) => void;
}

export const StudentDirectoryGrid: React.FC<Props> = ({
  filters,
  onPageChange,
}) => {
  const { data, loading, error } = useStudentDirectory(filters);

  if (loading) return <SkeletonGrid />;
  if (error) return <div className="text-sm text-red-400">{error}</div>;
  if (!data || data.results.length === 0)
    return (
      <div className="text-sm text-zinc-400 py-16 text-center border rounded-lg border-dashed border-zinc-700">
        No student profiles match the current filters.
      </div>
    );

  const currentPage = filters.page || 1;

  return (
    <div className="space-y-10">
      <motion.div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {data.results.map((p: any, idx: number) => (
          <StudentCard key={p.id} profile={p} index={idx} />
        ))}
      </motion.div>
      <PaginationBar
        current={currentPage}
        totalPages={Math.max(
          1,
          Math.ceil((data.count || 0) / (filters.page_size || 20))
        )}
        onPageChange={onPageChange}
      />
    </div>
  );
};

const SkeletonGrid = () => (
  <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="h-56 rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden relative"
      >
        <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-zinc-800/40 via-zinc-900/40 to-zinc-800/40" />
      </div>
    ))}
  </div>
);

const PaginationBar = ({
  current,
  totalPages,
  onPageChange,
}: {
  current: number;
  totalPages: number;
  onPageChange: (p: number) => void;
}) => {
  if (totalPages <= 1) return null;
  const prev = () => current > 1 && onPageChange(current - 1);
  const next = () => current < totalPages && onPageChange(current + 1);
  const windowPages = Array.from(
    { length: totalPages },
    (_, i) => i + 1
  ).filter((p) => p === 1 || p === totalPages || Math.abs(p - current) <= 2);
  const pages: (number | "ellipsis")[] = [];
  windowPages.forEach((p, idx) => {
    if (idx === 0) pages.push(p);
    else {
      const prevP = windowPages[idx - 1];
      if (p - prevP > 1) pages.push("ellipsis");
      pages.push(p);
    }
  });
  return (
    <div className="flex items-center justify-center gap-2">
      <button
        onClick={prev}
        disabled={current === 1}
        className="px-2.5 py-1.5 text-[11px] rounded-md bg-zinc-900/60 border border-zinc-700 disabled:opacity-40 hover:border-emerald-400/40 transition-colors"
      >
        Prev
      </button>
      {pages.map((p, i) =>
        p === "ellipsis" ? (
          <span key={i} className="px-1 text-xs text-zinc-500">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={cn(
              "px-3 py-1.5 text-[11px] rounded-md border transition-colors",
              p === current
                ? "bg-emerald-500/10 border-emerald-400/40 text-emerald-300"
                : "bg-zinc-900/60 border-zinc-700 hover:border-emerald-400/40"
            )}
          >
            {p}
          </button>
        )
      )}
      <button
        onClick={next}
        disabled={current === totalPages}
        className="px-2.5 py-1.5 text-[11px] rounded-md bg-zinc-900/60 border border-zinc-700 disabled:opacity-40 hover:border-emerald-400/40 transition-colors"
      >
        Next
      </button>
    </div>
  );
};
