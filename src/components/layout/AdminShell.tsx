"use client";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Menu,
  Users,
  Settings,
  Shield,
  Briefcase,
  School,
  Activity,
  Home,
  X,
  LogOut,
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NavItem = ({
  icon: Icon,
  label,
  href,
  active = false,
}: {
  icon: any;
  label: string;
  href: string;
  active?: boolean;
}) => (
  <a
    href={href}
    className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
      active
        ? "bg-yellow-400 text-black shadow border border-yellow-500/50"
        : "text-zinc-300 hover:bg-zinc-900 hover:text-zinc-100 border border-transparent"
    )}
  >
    <Icon size={16} />
    <span>{label}</span>
  </a>
);

export function AdminShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = useState(false);
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen bg-[radial-gradient(80%_120%_at_10%_10%,#0a0a0a,rgba(0,0,0,1)_70%)] text-zinc-100">
      {/* Subtle overlay lines */}
      <div className="pointer-events-none fixed inset-0 [background:repeating-linear-gradient(45deg,rgba(250,204,21,0.03)_0_16px,transparent_16px_32px)]" />

      <div className="flex">
        {/* Sidebar */}


        {/* Mobile Sidebar */}
        {open && (
          <div className="fixed inset-0 z-20 md:hidden">
            <div
              className="absolute inset-0 bg-black/70"
              onClick={() => setOpen(false)}
            />
            <aside className="relative z-20 h-full w-72 border-r border-zinc-900/90 bg-black/80 backdrop-blur-md p-4">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2 font-semibold">
                  <Shield size={18} className="text-yellow-400" />
                  <span>Alumni Admin</span>
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setOpen(false)}
                >
                  <X size={16} />
                </Button>
              </div>
              <nav className="space-y-1">
                <NavItem
                  icon={Home}
                  label="Dashboard"
                  href="/dashboard/admin"
                  active
                />
                <NavItem icon={Users} label="Users" href="#users" />
                <NavItem icon={Briefcase} label="Jobs" href="#jobs" />
                <NavItem
                  icon={School}
                  label="Directory"
                  href="/dashboard/admin/directory"
                />
                <NavItem
                  icon={Activity}
                  label="Activity Logs"
                  href="#activity"
                />
                <NavItem icon={Settings} label="Settings" href="#settings" />
              </nav>
              <div className="mt-6">
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
                onClick={() => setOpen((v) => !v)}
              >
                <Menu size={16} />
              </Button>
              <div className="text-sm text-zinc-300">Dashboard Overview</div>
              <div className="ml-auto flex items-center gap-3">
                <input
                  placeholder="Search (users, jobs, achievements)"
                  className="w-64 rounded-lg border border-zinc-800 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:ring-2 focus:ring-yellow-400/40"
                />
                <div className="hidden sm:flex items-center gap-2 text-sm text-zinc-400">
                  <span>Welcome, {user?.name || "Admin"}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center gap-2 text-zinc-300 hover:text-red-400 hover:border-red-400/50"
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
