"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useProfile } from "../useProfile";
import { StudentProfile, UserRole } from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProfileEditModal } from "@/components/profile/view/ProfileEditModal";
import { StudentProfileDashboardView } from "@/components/profile/student/view/StudentProfileDashboardView";

export default function StudentProfileViewPage() {
  const { role, profile, loading, error, reload } = useProfile();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const headerTitle = useMemo(() => "Student Profile", []);

  useEffect(() => {
    if (!loading && role && role !== "student") {
      router.replace(`/dashboard/profile/view/${role}`);
    }
  }, [role, loading, router]);

  return (
    <ProtectedRoute requireAuth allowedRoles={["student"]}>
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              {headerTitle}
              {loading ? (
                <span className="text-xs text-zinc-400">Loading…</span>
              ) : null}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => reload()}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button size="sm" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-3 text-sm text-red-400 border border-red-900/40 bg-red-900/10 rounded-lg p-3">
                {error}
              </div>
            )}
            {!profile ? (
              <div className="p-6 text-center text-zinc-400">
                {loading ? "Loading profile…" : "No profile"}
              </div>
            ) : (
              <StudentProfileDashboardView
                profile={profile as StudentProfile}
                onUpdated={(p) => {
                  // silent local update without full reload
                  (profile as any) = p; // not strictly necessary; modal reload will handle
                  reload();
                }}
              />
            )}
          </CardContent>
        </Card>
        <ProfileEditModal
          open={editOpen}
          onOpenChange={setEditOpen}
          role={role as UserRole}
          initial={profile as any}
          socialEdit={null}
          targetFields={null}
          onSaved={() => {
            setEditOpen(false);
            reload();
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
