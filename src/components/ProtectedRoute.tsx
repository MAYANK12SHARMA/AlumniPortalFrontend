"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect, useState } from "react";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
  allowedRoles?: string[];
}

const LoadingSpinner = () => (
  <div
    className="min-h-screen flex items-center justify-center"
    suppressHydrationWarning
  >
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
  </div>
);

export default function ProtectedRoute({
  children,
  requireAuth = true,
  redirectTo = "/login",
  allowedRoles,
}: ProtectedRouteProps) {
  const { user, loading, isAuthenticated, routeAfterAuthCheck } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient || loading) return; // Wait for client hydration and auth state to load

    // If authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // If user is authenticated but shouldn't be (e.g., on login page)
    if (!requireAuth && isAuthenticated) {
      const defaultRedirect =
        user?.role === "student"
          ? "/dashboard/student"
          : user?.role === "alumni"
          ? "/dashboard/alumni"
          : "/dashboard/admin";
      router.push(defaultRedirect);
      return;
    }

    // Check role-based access
    if (allowedRoles && user && !allowedRoles.includes(user.role)) {
      router.push("/unauthorized");
      return;
    }

    // Enforce profile status gating on dashboard routes
    if (requireAuth && isAuthenticated && pathname?.startsWith("/dashboard")) {
      (async () => {
        const route = await routeAfterAuthCheck();
        if (route && route !== pathname) {
          router.push(route);
        }
      })();
    }
  }, [
    user,
    loading,
    isAuthenticated,
    requireAuth,
    redirectTo,
    allowedRoles,
    router,
    isClient,
    pathname,
    routeAfterAuthCheck,
  ]);

  // Return the hydration-safe content
  if (loading) {
    return <LoadingSpinner />;
  }

  // If auth is required but user is not authenticated, render nothing (redirect effect will fire)
  if (requireAuth && !isAuthenticated) return null;

  // If auth is not required but user is authenticated (e.g. login page), render nothing
  if (!requireAuth && isAuthenticated) return null;

  // Role check
  if (allowedRoles && user && !allowedRoles.includes(user.role)) return null;

  return <>{children}</>;
}
