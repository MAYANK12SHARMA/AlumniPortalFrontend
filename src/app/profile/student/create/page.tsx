"use client";
import React, { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { StudentProfileWizard } from "@/components/profile/student/StudentProfileWizard";
import FirstTimeStudentOnboarding from "@/components/profile/student/FirstTimeStudentOnboarding";
import { studentProfileApi } from "@/lib/api/profile";
import { StudentProfile } from "@/types";

function CreateStudentProfilePageInner() {
  const qp = useSearchParams();
  const step = qp.get("step") || undefined;
  const [initial, setInitial] = useState<Partial<StudentProfile> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await studentProfileApi.get();
        if (mounted) setInitial(data as any);
      } catch {
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
        Loading draft...
      </div>
    );
  return initial ? (
    <StudentProfileWizard initialData={initial} initialStepId={step} />
  ) : (
    <FirstTimeStudentOnboarding />
  );
}

export default function CreateStudentProfilePage() {
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
          <CreateStudentProfilePageInner />
        </Suspense>
      </div>
    </ProtectedRoute>
  );
}
