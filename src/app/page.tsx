"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function HomePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Redirect to appropriate dashboard based on user role
        if (user.role === "student") {
          router.push("/dashboard/student");
        } else if (user.role === "alumni") {
          router.push("/dashboard/alumni");
        } else {
          router.push("/dashboard");
        }
      } else {
        // Redirect to login if not authenticated
        router.push("/auth/login");
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Alumni Portal</h1>
        <p className="text-gray-600 mb-8">
          Connecting students and alumni for networking and career growth
        </p>
        <div className="space-x-4">
          <button
            onClick={() => router.push("/auth/login")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            Login
          </button>
          <button
            onClick={() => router.push("/auth/register")}
            className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
}
