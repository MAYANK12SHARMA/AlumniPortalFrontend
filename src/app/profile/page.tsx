"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";

export default function ProfileRedirectPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push("/auth/login");
      return;
    }

    // Redirect based on user role
    const userRole = user.role?.toLowerCase();

    switch (userRole) {
      case "student":
        router.push("/profile/student/create");
        break;
      case "alumni":
        router.push("/profile/alumni/create");
        break;
      case "admin":
        router.push("/dashboard/admin");
        break;
      default:
        setError("Unable to determine user role. Please contact support.");
        break;
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="max-w-md mx-auto p-6 mt-20">
        <Card className="p-8">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3 text-gray-600">Loading...</span>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-md mx-auto p-6 mt-20">
        <Card className="p-8">
          <div className="text-center">
            <h1 className="text-xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Go to Dashboard
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto p-6 mt-20">
      <Card className="p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Redirecting...</span>
        </div>
      </Card>
    </div>
  );
}
