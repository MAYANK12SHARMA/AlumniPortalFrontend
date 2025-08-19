"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { navForRole, Role, NavNode } from "@/config/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MissingApiNote from "./MissingApiNote";

type Props = {
  role: Role;
  onNavigate?: () => void; // close mobile sidebar after click
  className?: string;
};

export default function RoleSidebar({ role, onNavigate, className }: Props) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const items = useMemo<NavNode[]>(() => navForRole(role), [role]);
  const [open, setOpen] = useState<Record<string, boolean>>({});

  const toggle = (key: string) => setOpen((o) => ({ ...o, [key]: !o[key] }));

  const activeMatch = (path: string) =>
    path !== "#" && pathname.startsWith(path);

  // Auto-open any section that contains the active route
  useEffect(() => {
    const nextOpen: Record<string, boolean> = {};
    navForRole(role).forEach((node: NavNode) => {
      if (!node.children) return;
      const leaves = (node.children || []).filter((c: any) =>
        c.roles?.includes(role)
      );
      const anyActive = leaves.some((c: any) => activeMatch(c.path));
      if (anyActive) nextOpen[node.label] = true;
    });
    setOpen((o) => ({ ...o, ...nextOpen }));
  }, [pathname, role]);

  return (
    <aside
      className={cn(
        "h-full w-72 border-r border-zinc-900/90 bg-black/60 backdrop-blur-md p-4 text-zinc-100",
        className
      )}
    >
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold">
          <Shield size={18} className="text-yellow-400" />
          <span>Alumni Portal</span>
        </div>
      </div>

      <nav className="space-y-2">
        {items.map((node) => {
          const key = node.label;
          const isOpen = open[key];

          // Single link node via pathByRole
          if (node.pathByRole) {
            const target = node.pathByRole[role] || "#";
            const needsApi = target === "#";
            return (
              <div key={key}>
                <Link
                  href={needsApi ? pathname : target}
                  onClick={() => {
                    if (needsApi) return;
                    onNavigate?.();
                  }}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors border",
                    activeMatch(target)
                      ? "bg-yellow-400 text-black shadow border-yellow-500/50"
                      : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 border-transparent"
                  )}
                >
                  <span className="text-yellow-400">{node.icon}</span>
                  <span>{node.label}</span>
                </Link>
                {needsApi && <MissingApiNote className="mt-1" />}
              </div>
            );
          }

          // Section with children
          const leaves = (node.children || []).filter((c: any) =>
            c.roles?.includes(role)
          );
          const anyActive = leaves.some((c: any) => activeMatch(c.path));
          return (
            <div key={key}>
              <button
                onClick={() => toggle(key)}
                className={cn(
                  "w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors border",
                  anyActive
                    ? "bg-yellow-400 text-black shadow border-yellow-500/50"
                    : isOpen
                    ? "bg-zinc-900 text-zinc-100 border-zinc-800"
                    : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 border-transparent"
                )}
              >
                <span
                  className={cn(anyActive ? "text-black" : "text-yellow-400")}
                >
                  {node.icon}
                </span>
                <span className="flex-1 text-left">{node.label}</span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "transition-transform",
                    (isOpen || anyActive) && "rotate-180"
                  )}
                />
              </button>
              {isOpen || anyActive ? (
                <ul className="mt-1 ml-2 space-y-1">
                  {leaves.map((leaf: any) => {
                    const blocked = leaf.path === "#";
                    return (
                      <li key={leaf.label}>
                        <Link
                          href={blocked ? pathname : leaf.path}
                          onClick={() => {
                            if (blocked) return;
                            // Ensure this parent stays open when navigating to a child
                            setOpen((o) => ({ ...o, [key]: true }));
                            onNavigate?.();
                          }}
                          className={cn(
                            "flex items-center gap-2 rounded-md px-3 py-2 text-sm border",
                            activeMatch(leaf.path)
                              ? "bg-yellow-400/10 text-yellow-300 border-yellow-500/30"
                              : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900 border-transparent"
                          )}
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                          <span>{leaf.label}</span>
                        </Link>
                        {(leaf as any).requiresApi || leaf.path === "#" ? (
                          <MissingApiNote className="ml-5 mt-1" />
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              ) : null}
            </div>
          );
        })}
      </nav>

      {/* Spacer for future sections */}
      <div className="mt-6 rounded-lg border border-zinc-900 bg-zinc-950/60 p-3 text-xs text-zinc-400">
        <div className="font-medium text-zinc-300">More coming soon</div>
        <div>Space reserved for future sections.</div>
      </div>

      <div className="mt-4">
        <Button
          variant="outline"
          onClick={logout}
          className="w-full flex items-center gap-2 text-zinc-300 hover:text-red-400 hover:border-red-400/50"
        >
          <LogOut size={14} />
          Logout
        </Button>
      </div>
    </aside>
  );
}
