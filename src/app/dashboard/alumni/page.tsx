"use client";

import { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { StatCard, DirectoryPanel } from "@/components/widgets";
import { Users, Briefcase, MessageSquare } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import apiClient from "@/lib/api";

export default function AlumniDashboard() {
  // Auth context not currently needed; can be reintroduced if user-specific logic is added
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      try {
        const res = await apiClient
          .get("/alumni/dashboard-stats")
          .catch(() => ({ data: null }));
        if (!mounted) return;
        setStats(
          res?.data || {
            students_mentored: 0,
            referrals: 0,
            jobs_posted: 0,
            mentoring_requests_pending: 0,
          }
        );
      } catch (e) {
        console.log("Failed to load alumni stats", e);
        if (!mounted) return;
        setStats({ students_mentored: 0, referrals: 0, jobs_posted: 0 });
      } finally {
        if (mounted) setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <ProtectedRoute requireAuth={true} allowedRoles={["alumni"]}>
      <div className="space-y-6 animate-fadeIn">
        {/* Stats */}
        <section className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Students Mentored"
            value={loading ? "—" : stats?.students_mentored ?? 0}
            icon={<Users size={18} />}
          />
          <StatCard
            label="Referrals"
            value={loading ? "—" : stats?.referrals ?? 0}
            icon={<Briefcase size={18} />}
          />
          <StatCard
            label="Jobs Posted"
            value={loading ? "—" : stats?.jobs_posted ?? 0}
            icon={<Briefcase size={18} />}
          />
          <StatCard
            label="Mentoring Requests"
            value={loading ? "—" : stats?.mentoring_requests_pending ?? 0}
            icon={<MessageSquare size={18} />}
          />
        </section>

        {/* Quick Actions */}
        <section className="grid gap-6 xl:grid-cols-3">
          <div className="xl:col-span-2 space-y-6">
            <Card className="transition-all duration-300 hover:shadow-lg">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Link
                    href="/profile/alumni"
                    className="block rounded-lg border border-zinc-800 p-4 hover:bg-zinc-900 transition-colors duration-200"
                  >
                    <div className="text-sm font-semibold text-zinc-100">
                      Update profile
                    </div>
                    <div className="text-xs text-zinc-400">
                      Keep your professional info current
                    </div>
                  </Link>
                  <Link
                    href="/mentoring"
                    className="block rounded-lg border border-zinc-800 p-4 hover:bg-zinc-900 transition-colors duration-200"
                  >
                    <div className="text-sm font-semibold text-zinc-100">
                      Mentor students
                    </div>
                    <div className="text-xs text-zinc-400">
                      Respond to mentoring requests
                    </div>
                  </Link>
                  <Link
                    href="/jobs"
                    className="block rounded-lg border border-zinc-800 p-4 hover:bg-zinc-900 transition-colors duration-200"
                  >
                    <div className="text-sm font-semibold text-zinc-100">
                      Post jobs
                    </div>
                    <div className="text-xs text-zinc-400">
                      Share openings and referrals
                    </div>
                  </Link>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-zinc-400">
                  No recent activity yet — engage by mentoring or posting
                  opportunities to see updates here.
                </div>
              </CardContent>
            </Card>

            <div
              id="directory"
              className="grid grid-cols-1 gap-6 lg:grid-cols-2"
            >
              <DirectoryPanel kind="alumni" />
              <DirectoryPanel kind="students" />
            </div>
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <Card className="transition-all duration-300 hover:shadow-md">
              <CardHeader>
                <CardTitle>Support & Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm text-zinc-400 space-y-2">
                  <div>Need help verifying your profile or using features?</div>
                  <div className="flex gap-2 mt-3">
                    <Link
                      href="/help"
                      className="text-sm text-yellow-300 hover:underline"
                    >
                      Contact support
                    </Link>
                  </div>
                </div>
              </CardContent>
            </Card>
          </aside>
        </section>
      </div>
    </ProtectedRoute>
  );
}
