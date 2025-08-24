"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { navForRole, Role, NavNode } from "@/config/nav";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ChevronDown, LogOut, Shield } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import MissingApiNote from "./MissingApiNote";
import { motion, AnimatePresence } from "framer-motion";

type Props = {
  role: Role;
  onNavigate?: () => void; // close mobile sidebar after click
  className?: string;
};

export default function RoleSidebar({ role, onNavigate, className }: Props) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const items = useMemo<NavNode[]>(() => navForRole(role), [role]);
  // single-open accordion key
  const [openKey, setOpenKey] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const toggle = (key: string) =>
    setOpenKey((current) => (current === key ? null : key));

  const searchParams = useSearchParams();

  // Parse a nav leaf path (may contain ?query)
  function parseNavPath(p: string) {
    const [rawPath, query = ""] = p.split("?");
    const params: Record<string, string> = {};
    if (query) {
      for (const part of query.split("&")) {
        if (!part) continue;
        const [k, v = ""] = part.split("=");
        params[decodeURIComponent(k)] = decodeURIComponent(v);
      }
    }
    return { path: rawPath.replace(/\/$/, ""), params };
  }

  const buildCurrentParamMap = useCallback(() => {
    const map: Record<string, string> = {};
    searchParams?.forEach((value, key) => {
      map[key] = value;
    });
    return map;
  }, [searchParams]);

  const currentParamMap = buildCurrentParamMap();
  const normalizedPathname = pathname.replace(/\/$/, "");

  // Determine if a leaf is active considering query params.
  const isLeafActive = useCallback(
    (leafPath: string, siblingLeafs: string[]): boolean => {
      if (!leafPath || leafPath === "#") return false;
      const { path, params } = parseNavPath(leafPath);
      if (path !== normalizedPathname) return false;
      const paramKeys = Object.keys(params);
      if (paramKeys.length > 0) {
        // All params in leaf must match current (exact value)
        return paramKeys.every((k) => currentParamMap[k] === params[k]);
      }
      // Leaf has no query params: only active if NO sibling with params is satisfied (to avoid duplicate highlighting)
      const anySpecificSiblingActive = siblingLeafs.some((sib) => {
        if (sib === leafPath) return false;
        const { path: sibPath, params: sibParams } = parseNavPath(sib);
        if (sibPath !== normalizedPathname) return false;
        const sibKeys = Object.keys(sibParams);
        if (sibKeys.length === 0) return false;
        return sibKeys.every((k) => currentParamMap[k] === sibParams[k]);
      });
      return !anySpecificSiblingActive;
    },
    [normalizedPathname, currentParamMap]
  );

  // Auto-open section containing active route ONLY if user hasn't manually opened something
  useEffect(() => {
    let found: string | null = null;
    navForRole(role).forEach((node: NavNode) => {
      if (found || !node.children) return;
      const leaves = (node.children || []).filter((c: any) =>
        c.roles?.includes(role)
      );
      const leafPaths = leaves.map((l: any) => l.path);
      if (leaves.some((c: any) => isLeafActive(c.path, leafPaths))) {
        found = node.label;
      }
    });
    if (!openKey && found) setOpenKey(found); // don't override manual toggle
  }, [pathname, role, isLeafActive, openKey]);

  return (
    <aside
      ref={containerRef}
      className={cn(
        "group/sidebar relative h-full w-72 border-r border-zinc-800/80 bg-gradient-to-b from-zinc-950/80 via-zinc-950/40 to-black/70 backdrop-blur-xl p-4 text-zinc-100 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]",
        "[mask-image:linear-gradient(to_bottom,rgba(0,0,0,1),rgba(0,0,0,.85)_60%,rgba(0,0,0,.4))]",
        className
      )}
    >
      {/* Glow accent */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-yellow-400/15 to-transparent opacity-60" />
      <div className="relative mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold tracking-wide">
          <div className="relative">
            <div className="absolute inset-0 animate-pulse rounded-full bg-yellow-400/20 blur" />
            <Shield
              size={20}
              className="relative text-yellow-400 drop-shadow"
            />
          </div>
          <span className="bg-gradient-to-r from-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Alumni Portal
          </span>
        </div>
      </div>

      <nav className="relative space-y-1">
        {items.map((node) => {
          const key = node.label;
          const isOpen = openKey === key;

          // Single link node via pathByRole
          if (node.pathByRole) {
            const target = node.pathByRole[role] || "#";
            const needsApi = target === "#";
            const isActiveSingle =
              normalizedPathname === target.replace(/\/$/, "");
            return (
              <div key={key}>
                <Link
                  href={needsApi ? pathname : target}
                  onClick={() => {
                    if (needsApi) return;
                    onNavigate?.();
                  }}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2 text-sm border relative overflow-hidden",
                    "before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-400/0 before:via-yellow-400/5 before:to-yellow-400/0 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
                    isActiveSingle
                      ? "bg-zinc-900/60 border-yellow-500/40 shadow-inner shadow-yellow-500/10 ring-1 ring-yellow-500/30"
                      : "border-transparent hover:border-zinc-700/60 hover:bg-zinc-900/40"
                  )}
                >
                  <span
                    className={cn(
                      "text-yellow-400 transition-transform duration-300 group-hover:scale-110",
                      isActiveSingle && "scale-110"
                    )}
                  >
                    {node.icon}
                  </span>
                  <span className="font-medium tracking-wide">
                    {node.label}
                  </span>
                </Link>
                {needsApi && <MissingApiNote className="mt-1" />}
              </div>
            );
          }

          // Section with children
          const leaves = (node.children || []).filter((c: any) =>
            c.roles?.includes(role)
          );
          const leafPaths = leaves.map((l: any) => l.path);
          const anyActive = leaves.some((c: any) =>
            isLeafActive(c.path, leafPaths)
          );
          return (
            <div key={key} className="relative">
              <button
                onClick={() => toggle(key)}
                className={cn(
                  "group w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm border relative overflow-hidden",
                  "before:absolute before:inset-0 before:bg-gradient-to-r before:from-yellow-400/0 before:via-yellow-400/5 before:to-yellow-400/0 before:opacity-0 before:transition-opacity before:duration-500 hover:before:opacity-100",
                  anyActive
                    ? "bg-gradient-to-r from-yellow-400/70 to-yellow-500/80 text-black font-medium border-yellow-400/70 shadow-[0_0_0_1px_rgba(255,255,255,0.2)]"
                    : isOpen
                    ? "bg-zinc-900/60 text-zinc-100 border-zinc-700/60"
                    : "text-zinc-300 hover:text-zinc-100 border-transparent hover:border-zinc-700/60 hover:bg-zinc-900/40"
                )}
              >
                <span
                  className={cn(
                    anyActive
                      ? "text-black"
                      : "text-yellow-400 group-hover:scale-110 transition-transform duration-300"
                  )}
                >
                  {node.icon}
                </span>
                <span className="flex-1 text-left font-medium tracking-wide">
                  {node.label}
                </span>
                <ChevronDown
                  size={16}
                  className={cn(
                    "transition-transform duration-300 text-zinc-500 group-hover:text-zinc-300",
                    (isOpen || anyActive) && "rotate-180",
                    anyActive && "text-black"
                  )}
                />
                {/* Active glow ring */}
                {anyActive && (
                  <span className="pointer-events-none absolute inset-0 rounded-lg ring-2 ring-yellow-300/60 ring-offset-0" />
                )}
              </button>
              <AnimatePresence initial={false}>
                {(isOpen || anyActive) && (
                  <motion.ul
                    key="content"
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { height: "auto", opacity: 1 },
                      collapsed: { height: 0, opacity: 0 },
                    }}
                    transition={{ duration: 0.35, ease: [0.65, 0, 0.35, 1] }}
                    className="relative ml-1 mt-1 space-y-1 overflow-hidden pl-2"
                  >
                    {leaves.map((leaf: any, idx: number) => {
                      const blocked = leaf.path === "#";
                      const selected = isLeafActive(leaf.path, leafPaths);
                      return (
                        <motion.li
                          key={leaf.label}
                          initial={{ x: -8, opacity: 0 }}
                          animate={{ x: 0, opacity: 1 }}
                          transition={{ delay: 0.03 * idx }}
                        >
                          <Link
                            href={blocked ? pathname : leaf.path}
                            onClick={() => {
                              if (blocked) return;
                              onNavigate?.();
                            }}
                            className={cn(
                              "group/leaf relative flex items-center gap-2 rounded-md px-3 py-2 text-xs font-medium tracking-wide border backdrop-blur-sm",
                              "transition-colors duration-300",
                              selected
                                ? "bg-yellow-400/15 text-yellow-200 border-yellow-500/30 shadow-inner shadow-yellow-500/10"
                                : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border-transparent hover:border-zinc-700/60"
                            )}
                          >
                            <span
                              className={cn(
                                "flex h-4 w-4 items-center justify-center rounded-md",
                                selected
                                  ? "bg-yellow-400 text-black shadow"
                                  : "bg-zinc-800/80 text-yellow-400 group-hover/leaf:bg-zinc-700"
                              )}
                            >
                              {leaf.icon || (
                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-400" />
                              )}
                            </span>
                            <span className="flex-1">{leaf.label}</span>
                            {selected && (
                              <span className="absolute inset-y-0 left-0 w-0.5 rounded-full bg-gradient-to-b from-yellow-300 to-yellow-500" />
                            )}
                          </Link>
                          {(leaf as any).requiresApi || leaf.path === "#" ? (
                            <MissingApiNote className="ml-6 mt-1" />
                          ) : null}
                        </motion.li>
                      );
                    })}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </nav>
      <div className="mt-8 space-y-3 pt-4">
        <div className="rounded-lg border border-dashed border-zinc-800/70 bg-zinc-950/40 p-3 text-[10px] leading-relaxed text-zinc-500">
          <div className="mb-0.5 font-medium text-zinc-300/90">
            Platform roadmap
          </div>
          More features are being incubated. Stay tuned ✨
        </div>
        <Button
          variant="outline"
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 border-zinc-700/60 bg-zinc-900/40 text-zinc-300 hover:text-red-400 hover:border-red-400/50 hover:bg-red-950/20 transition-colors"
        >
          <LogOut size={14} />
          Logout
        </Button>
      </div>
    </aside>
  );
}
