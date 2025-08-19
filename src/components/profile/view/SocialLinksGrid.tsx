"use client";
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Linkedin,
  Github,
  Twitter,
  Instagram,
  Globe,
  BookOpen,
  Link as LinkIcon,
  Code2,
  Terminal,
} from "lucide-react";

export type SocialInfo = {
  username?: string;
  url?: string;
  is_primary?: boolean;
};

const PLATFORMS: Array<{ key: string; label: string }> = [
  { key: "linkedin", label: "LinkedIn" },
  { key: "github", label: "GitHub" },
  { key: "twitter", label: "Twitter" },
  { key: "instagram", label: "Instagram" },
  { key: "leetcode", label: "LeetCode" },
  { key: "hackerrank", label: "HackerRank" },
  { key: "portfolio", label: "Portfolio" },
  { key: "blog", label: "Blog" },
  { key: "other", label: "Other" },
];

export function SocialLinksGrid({
  links,
  onEdit,
}: {
  links: Record<string, SocialInfo>;
  onEdit?: (platform: string, current?: SocialInfo) => void;
}) {
  const IconFor = (platform: string) => {
    switch (platform) {
      case "linkedin":
        return Linkedin;
      case "github":
        return Github;
      case "twitter":
        return Twitter;
      case "instagram":
        return Instagram;
      case "leetcode":
        return Code2;
      case "hackerrank":
        return Terminal;
      case "portfolio":
        return Globe;
      case "blog":
        return BookOpen;
      default:
        return LinkIcon;
    }
  };
  return (
    <section aria-labelledby="social-section-title" className="space-y-3">
      <div
        id="social-section-title"
        className="text-[11px] uppercase tracking-wide text-zinc-400"
      >
        Social & External Profiles
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {PLATFORMS.map(({ key, label }) => {
          const info = (links || {})[key] || {};
          const hasUrl = !!info.url;
          const Icon = IconFor(key);
          return (
            <div
              key={key}
              className={
                "group rounded-lg border p-3 focus-within:ring-2 focus-within:ring-yellow-500 outline-none " +
                (hasUrl
                  ? "border-yellow-700/60 bg-yellow-900/10 hover:bg-yellow-900/15"
                  : "border-zinc-800 bg-zinc-900/40 opacity-80")
              }
              tabIndex={0}
              aria-label={`${label} card`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      aria-hidden="true"
                      className={
                        "inline-flex h-6 w-6 items-center justify-center rounded-full border text-yellow-200 " +
                        (hasUrl
                          ? "border-yellow-700 bg-yellow-900/30"
                          : "border-zinc-700 bg-zinc-800/60")
                      }
                    >
                      <Icon size={14} />
                    </span>
                    {hasUrl ? (
                      <a
                        href={info.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${label} profile`}
                        className="text-sm font-medium text-yellow-200 hover:text-yellow-100 focus-visible:ring-2 focus-visible:ring-yellow-500 rounded-sm outline-none"
                      >
                        {label}
                      </a>
                    ) : (
                      <span className="text-sm font-medium text-zinc-400">
                        {label}
                      </span>
                    )}
                  </div>
                  {/* Removed raw URL; platform name is the link when available */}
                </div>
                {onEdit && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEdit(key, info)}
                    aria-label={`Edit ${label} link`}
                    className="focus-visible:ring-2 focus-visible:ring-yellow-500"
                  >
                    Edit
                  </Button>
                )}
              </div>
              {hasUrl && info.username && (
                <div className="mt-1 text-[11px] text-zinc-400">
                  @{info.username}
                </div>
              )}
              {hasUrl && info.is_primary && (
                <div className="mt-1 inline-block rounded bg-yellow-800/40 px-2 py-[2px] text-[10px] text-yellow-100">
                  Primary
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
