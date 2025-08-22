"use client";

// This page now only determines the user's role and redirects to role-specific profile view pages.
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import apiClient from "@/lib/api";
import { User, UserRole } from "@/types";

export default function ProfileViewRedirectPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function go() {
      setLoading(true);
      setError(null);
      try {
        const me = await apiClient.get("/auth/users/me/");
        const user: User = (me as any).data || (me as any);
        const r = (user?.role || "student") as UserRole;
        if (!cancelled) router.replace(`/dashboard/profile/view/${r}`);
      } catch (e: any) {
        if (!cancelled)
          setError(e?.response?.data?.error || e?.message || "Failed to determine role");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    go();
    return () => {
      cancelled = true;
    };
  }, [router]);

  return (
    <ProtectedRoute requireAuth allowedRoles={["admin", "alumni", "student"]}>
      <div className="p-6 text-center text-sm text-zinc-400">
        {loading ? "Loading profile…" : error ? error : "Redirecting..."}
      </div>
    </ProtectedRoute>
  );
}

