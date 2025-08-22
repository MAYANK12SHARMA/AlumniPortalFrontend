"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { StudentProfileWizard } from "@/components/profile/student/StudentProfileWizard";
import { studentProfileApi } from "@/lib/api/profile";
import { StudentProfile } from "@/types";

function EditStudentProfilePageInner() {
  const qp = useSearchParams();
  const step = qp.get("step") || undefined;
  const [initial, setInitial] = useState<Partial<StudentProfile> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await studentProfileApi.get();
        if (mounted) setInitial(data as any);
      } catch (e: any) {
        if (mounted)
          setError(e?.response?.data?.error || "Failed to load profile");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-32 text-sm text-zinc-400">
        Loading profile...
      </div>
    );
  if (error)
    return (
      <div className="max-w-md mx-auto rounded-lg border border-red-900/40 bg-red-900/10 p-6 text-sm text-red-300 text-center">
        {error}
      </div>
    );
  return (
    <StudentProfileWizard
      initialData={initial || undefined}
      isEditing
      initialStepId={step}
    />
  );
}

export default function EditStudentProfilePage() {
  return (
    <ProtectedRoute requireAuth allowedRoles={["student"]}>
      <div className="min-h-screen py-10 px-4 md:px-8">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-32 text-sm text-zinc-400">
              Loading...
            </div>
          }
        >
          <EditStudentProfilePageInner />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
