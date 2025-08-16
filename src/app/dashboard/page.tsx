"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function DashboardPage() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      // Redirect to role-specific dashboard
      const redirectPath =
        user.role === "student"
          ? "/dashboard/student"
          : user.role === "alumni"
          ? "/dashboard/alumni"
          : "/dashboard/admin";
      router.push(redirectPath);
    }
  }, [user, router]);

  return (
    <ProtectedRoute requireAuth={true}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    </ProtectedRoute>
  );
}
