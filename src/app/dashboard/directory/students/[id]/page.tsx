"use client";
import React, { useEffect, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useParams } from "next/navigation";
import { apiClient } from "@/lib/api";
import {
  StudentDetailView,
  StudentDetailSkeleton,
} from "@/components/directory/students/StudentDetailView";

export default function StudentDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [profile, setProfile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Use the plural students list endpoint and then select by id (backend currently list style)
        const res = await apiClient.get(`/dashboard/directory/student/`, {
          id,
        });
        const data = (res as any).data;
        if (Array.isArray(data.profiles)) {
          const p = data.profiles.find((p: any) => String(p.id) === id);
          setProfile(p || null);
        } else if (data.profile) setProfile(data.profile);
        else setError("Profile not found");
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message || "Error");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);
  return (
    <ProtectedRoute requireAuth>
      {loading ? (
        <StudentDetailSkeleton />
      ) : error ? (
        <div className="text-sm text-red-400 px-4 py-10">{error}</div>
      ) : profile ? (
        <StudentDetailView profile={profile} />
      ) : (
        <div className="py-20 text-sm text-zinc-400 text-center">
          Profile not found
        </div>
      )}
    </ProtectedRoute>
  );
}
