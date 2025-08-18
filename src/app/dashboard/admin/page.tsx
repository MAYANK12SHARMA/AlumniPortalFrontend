"use client";
import { useEffect, useState } from "react";
import {
  StatCard,
  RoleRequestsPanel,
  DirectoryPanel,
} from "@/components/widgets";
import {
  Users,
  Shield,
  GraduationCap,
  Clock,
  CheckCircle2,
  Briefcase,
  UserCheck,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import apiClient, { getAdminDashboardStats, mapStats } from "@/lib/api";
import { StatSummary } from "@/types";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import dynamic from "next/dynamic";

const ResponsiveContainer = dynamic<any>(
  () => import("recharts").then((m) => m.ResponsiveContainer as any),
  { ssr: false }
);
const AreaChart = dynamic<any>(
  () => import("recharts").then((m) => m.AreaChart as any),
  { ssr: false }
);
const Area = dynamic<any>(() => import("recharts").then((m) => m.Area as any), {
  ssr: false,
});
const XAxis = dynamic<any>(
  () => import("recharts").then((m) => m.XAxis as any),
  { ssr: false }
);
const YAxis = dynamic<any>(
  () => import("recharts").then((m) => m.YAxis as any),
  { ssr: false }
);
const Tooltip = dynamic<any>(
  () => import("recharts").then((m) => m.Tooltip as any),
  { ssr: false }
);

export default function AdminDashboardPage() {
  const { isAuthenticated } = useAuth();
  const [stats, setStats] = useState<StatSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        const [statsRes, reqRes] = await Promise.allSettled([
          getAdminDashboardStats().catch((err) => {
            console.error("Admin dashboard stats error:", err);
            return { stats: {} } as any;
          }),
          apiClient
            .get("/admin/role-requests/", { status: "pending", page: 1 } as any)
            .catch((err) => {
              console.error("Role requests error:", err);
              return { data: { data: [], requests: [] } } as any;
            }),
        ]);

        if (!mounted) return;

        // map stats
        const rawStats =
          statsRes.status === "fulfilled" ? statsRes.value : (statsRes as any);
        const mapped = mapStats(rawStats);
        setStats(mapped);

        // extract list (support multiple shapes)
        if (reqRes.status === "fulfilled") {
          const payload =
            (reqRes.value as any).data || (reqRes.value as any) || {};
          const list =
            payload.data ||
            payload.requests ||
            payload.items ||
            payload.results ||
            [];
          // keep only pending for dashboard relevance and limit to 5
          const pendingOnly = (list as any[])
            .filter((r) => (r?.status || "").toLowerCase() === "pending")
            .slice(0, 5);
          setRequests(pendingOnly);
        } else {
          setRequests([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [isAuthenticated]);

  const chartData = [
    { name: "Mon", users: 20 },
    { name: "Tue", users: 45 },
    { name: "Wed", users: 32 },
    { name: "Thu", users: 58 },
    { name: "Fri", users: 40 },
    { name: "Sat", users: 62 },
    { name: "Sun", users: 55 },
  ];

  return (
    <ProtectedRoute requireAuth allowedRoles={["admin"]}>
      {/* Metrics */}
      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-6">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))
        ) : (
          <>
            <StatCard
              label="Total Users"
              value={stats?.total_users ?? 0}
              delta="+4.2% this week"
              icon={<Users size={18} />}
            />
            <StatCard
              label="Active Admins"
              value={stats?.active_admins ?? 0}
              delta="Stable"
              icon={<Shield size={18} />}
            />
            <StatCard
              label="Students"
              value={stats?.total_students ?? 0}
              delta="+2.1%"
              icon={<GraduationCap size={18} />}
            />
            <StatCard
              label="Alumni"
              value={stats?.total_alumni ?? 0}
              delta="+1.1%"
              icon={<UserCheck size={18} />}
            />
            <StatCard
              label="Pending Requests"
              value={stats?.role_requests_pending ?? 0}
              delta="-1.3%"
              icon={<Clock size={18} />}
            />
            <StatCard
              label="Verified Alumni"
              value={stats?.verified_alumni ?? 0}
              delta="+0.6%"
              icon={<CheckCircle2 size={18} />}
            />
          </>
        )}
      </section>

      {/* Content grid */}
      <section className="mt-6 grid gap-6 xl:grid-cols-3">
        {/* Left: chart + jobs placeholder */}
        <div className="space-y-6 xl:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Weekly New Users</CardTitle>
            </CardHeader>
            <CardContent className="h-64">
              <div className="h-full w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{ left: 0, right: 0, top: 8, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id="yGlow" x1="0" y1="0" x2="0" y2="1">
                        <stop
                          offset="5%"
                          stopColor="#facc15"
                          stopOpacity={0.5}
                        />
                        <stop
                          offset="95%"
                          stopColor="#facc15"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="name"
                      stroke="#a1a1aa"
                      tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="#a1a1aa"
                      tick={{ fill: "#a1a1aa", fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0a0a0a",
                        border: "1px solid #27272a",
                        color: "#fafafa",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="users"
                      stroke="#facc15"
                      fill="url(#yGlow)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase size={16} className="text-yellow-400" /> Example Jobs
                (Coming Soon)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <THead>
                  <TR>
                    <TH>Role</TH>
                    <TH>Company</TH>
                    <TH>Location</TH>
                    <TH>Status</TH>
                  </TR>
                </THead>
                <TBody>
                  {[
                    {
                      role: "Frontend Engineer",
                      company: "Acme Corp",
                      location: "Remote",
                      status: "Draft",
                    },
                    {
                      role: "Data Analyst",
                      company: "Globex",
                      location: "NYC",
                      status: "Scheduled",
                    },
                    {
                      role: "Product Manager",
                      company: "Initech",
                      location: "Bengaluru",
                      status: "Closed",
                    },
                  ].map((j, i) => (
                    <TR key={i}>
                      <TD>{j.role}</TD>
                      <TD>{j.company}</TD>
                      <TD>{j.location}</TD>
                      <TD>
                        <Badge
                          variant={
                            j.status === "Closed" ? "secondary" : "outline"
                          }
                        >
                          {j.status}
                        </Badge>
                      </TD>
                    </TR>
                  ))}
                </TBody>
              </Table>
            </CardContent>
          </Card>

          {/* Directories */}
          <div id="directory" className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            <DirectoryPanel kind="alumni" />
            <DirectoryPanel kind="students" />
          </div>
        </div>

        {/* Right: recent role requests */}
        <div className="space-y-6">
          {/* <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-zinc-100">Role Requests</h3>
              <Link
                href="/dashboard/role-requests/admin/pending"
                className="text-xs text-yellow-300 hover:underline"
              >
                View all pending →
              </Link>
            </div> */}
          <RoleRequestsPanel title="Role Requests" requests={requests} />
        </div>
      </section>
    </ProtectedRoute>
  );
}
