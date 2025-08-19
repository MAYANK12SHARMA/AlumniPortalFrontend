"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

function humanize(segment: string) {
  const s = segment.replace(/^\[|\]$/g, "");
  return s
    .replace(/[-_]+/g, " ")
    .split(" ")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : ""))
    .join(" ");
}

export default function HeaderBreadcrumbs() {
  const pathname = usePathname() || "/";

  if (!pathname.startsWith("/dashboard")) {
    return <div className="text-sm text-zinc-300">Dashboard</div>;
  }

  const parts = pathname.split("/").filter(Boolean); // e.g., ["dashboard","profile","view"]
  const base = "/dashboard";
  const crumbs: Array<{ label: string; href: string; isLast?: boolean }> = [];

  // Always start with Dashboard
  crumbs.push({ label: "Dashboard", href: base });

  let acc = base;
  for (let i = 1; i < parts.length; i++) {
    const p = parts[i];
    acc += "/" + p;
    crumbs.push({ label: humanize(p), href: acc });
  }
  if (crumbs.length) crumbs[crumbs.length - 1].isLast = true;

  return (
    <nav
      aria-label="Breadcrumb"
      className="relative -ml-1 flex max-w-full items-center gap-1 overflow-x-auto whitespace-nowrap rounded-lg border border-zinc-900/80 bg-black/40 px-2 py-1 text-xs backdrop-blur-md"
    >
      {crumbs.map((c, idx) => (
        <React.Fragment key={c.href}>
          {idx > 0 && (
            <ChevronRight size={14} className="mx-0.5 text-zinc-500" />
          )}
          {idx === 0 ? (
            <Link
              href={c.href}
              className="inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-zinc-300 hover:text-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              title={c.label}
            >
              <Home size={14} />
              <span className="hidden sm:inline">{c.label}</span>
            </Link>
          ) : c.isLast ? (
            <span
              className="rounded px-1.5 py-0.5 text-yellow-200"
              title={c.label}
            >
              {c.label}
            </span>
          ) : (
            <Link
              href={c.href}
              className="rounded px-1.5 py-0.5 text-zinc-300 hover:text-yellow-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              title={c.label}
            >
              {c.label}
            </Link>
          )}
        </React.Fragment>
      ))}
    </nav>
  );
}
