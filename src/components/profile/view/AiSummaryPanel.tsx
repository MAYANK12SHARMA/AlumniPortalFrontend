import React from "react";

export function AiSummaryPanel({
  summary,
  updatedAt,
}: {
  summary?: string | null;
  updatedAt?: string | null;
}) {
  const formatted = (() => {
    if (!updatedAt) return "-";
    try {
      return new Date(updatedAt).toLocaleString();
    } catch {
      return String(updatedAt);
    }
  })();

  return (
    <div className="rounded-lg border border-yellow-800/40 bg-yellow-900/10 p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-[11px] uppercase tracking-wide text-yellow-300">
          AI Profile Summary
        </div>
        <div className="text-[11px] text-yellow-200/70">{formatted}</div>
      </div>
      <div className="text-sm text-yellow-100 whitespace-pre-wrap">
        {summary?.trim() || "No AI summary available yet."}
      </div>
    </div>
  );
}
