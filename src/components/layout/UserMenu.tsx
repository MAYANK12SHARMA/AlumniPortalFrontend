"use client";
import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { LogOut, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const displayName =
    (user as any)?.name ||
    (user as any)?.full_name ||
    (user as any)?.username ||
    (user as any)?.email ||
    "User";
  const email = (user as any)?.email || "";
  const avatarUrl =
    (user as any)?.avatar_url ||
    (user as any)?.avatar ||
    (user as any)?.profile_picture ||
    "";
  const initial = String(displayName).trim().charAt(0).toUpperCase();

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-9 w-9 items-center justify-center overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 text-yellow-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
        )}
        title={displayName}
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={avatarUrl}
            alt="avatar"
            className="h-full w-full object-cover"
          />
        ) : (
          <span className="text-sm">{initial || <UserRound size={14} />}</span>
        )}
      </button>
      {open && (
        <div
          role="menu"
          aria-label="User menu"
          className="absolute right-0 mt-2 w-64 overflow-hidden rounded-lg border border-zinc-800 bg-black/90 shadow-xl backdrop-blur-md"
        >
          <div className="flex items-center gap-3 border-b border-zinc-800 p-3">
            <div className="h-10 w-10 overflow-hidden rounded-full border border-zinc-800 bg-zinc-900 text-yellow-200 flex items-center justify-center">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="h-full w-full object-cover"
                />
              ) : (
                <span className="text-sm">{initial}</span>
              )}
            </div>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium text-zinc-100">
                {displayName}
              </div>
              {email && (
                <div className="truncate text-xs text-zinc-400">{email}</div>
              )}
            </div>
          </div>
          <div className="p-1">
            <Link
              href="/dashboard/profile/view"
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm text-zinc-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              role="menuitem"
              onClick={() => setOpen(false)}
            >
              <UserRound size={16} /> View profile
            </Link>
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-2 py-2 text-left text-sm text-zinc-200 hover:bg-zinc-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-500"
              role="menuitem"
              onClick={async () => {
                setOpen(false);
                await logout();
              }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
