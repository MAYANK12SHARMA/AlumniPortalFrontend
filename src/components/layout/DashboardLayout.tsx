"use client";
import { useState, Suspense } from "react";
import { useAuth } from "@/contexts/AuthContext";
import RoleSidebar from "./RoleSidebar";
import { Button } from "@/components/ui/button";
import { Menu, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import UserMenu from "./UserMenu";
import HeaderBreadcrumbs from "./HeaderBreadcrumbs";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const role = (user?.role || "student") as "admin" | "alumni" | "student";

  return (
    <div className="min-h-screen bg-[radial-gradient(80%_120%_at_10%_10%,#0a0a0a,rgba(0,0,0,1)_70%)] text-zinc-100">
      {/* Subtle overlay */}
      <div className="pointer-events-none fixed inset-0 [background:repeating-linear-gradient(45deg,rgba(250,204,21,0.03)_0_16px,transparent_16px_32px)]" />
      <div className="flex">
        {/* Desktop sidebar */}
        <div className="hidden md:block sticky top-0 h-screen">
          <Suspense
            fallback={
              <div className="w-72 h-screen border-r border-zinc-800/80 bg-zinc-950/40 p-4 text-xs text-zinc-500">
                Loading navigation...
              </div>
            }
          >
            <RoleSidebar role={role} />
          </Suspense>
        </div>

        {/* Mobile sidebar */}
        {mobileOpen && (
          <div className="fixed inset-0 z-20 md:hidden">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setMobileOpen(false)}
            />
            <div className="relative z-20 h-full w-80">
              <Suspense
                fallback={
                  <div className="w-80 h-full border-r border-zinc-800/80 bg-zinc-950/40 p-4 text-xs text-zinc-500">
                    Loading navigation...
                  </div>
                }
              >
                <RoleSidebar
                  role={role}
                  onNavigate={() => setMobileOpen(false)}
                  className="h-full"
                />
              </Suspense>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="flex-1">
          {/* Top bar */}
          <header className="sticky top-0 z-10 border-b border-zinc-900/90 bg-black/60 backdrop-blur-md">
            <div className="mx-auto flex max-w-7xl items-center gap-3 px-4 py-3">
              <Button
                variant="outline"
                size="icon"
                className="md:hidden"
                onClick={() => setMobileOpen((v) => !v)}
              >
                <Menu size={16} />
              </Button>
              <HeaderBreadcrumbs />
              <div className="ml-auto flex items-center gap-3">
                <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-400">
                  <span>Welcome, {user?.name || user?.email || role}</span>
                </div>
                <div className="hidden sm:block">
                  <UserMenu />
                </div>
                {/* Fallback logout on xs screens */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className={cn(
                    "sm:hidden flex items-center gap-2 text-zinc-300 hover:text-red-400 hover:border-red-400/50"
                  )}
                >
                  <LogOut size={14} />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </header>

          {/* Content */}
          <div className="mx-auto max-w-7xl px-4 py-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
