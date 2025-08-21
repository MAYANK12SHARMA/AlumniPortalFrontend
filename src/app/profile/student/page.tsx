"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { studentProfileApi } from "@/lib/api/profile";

export default function StudentProfileCompletionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const profile = await studentProfileApi.get();
      if (profile) {
        setHasProfile(true);
      }
    } catch (error) {
      console.error("Failed to check profile", error);
      // No profile exists, user needs to create one
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    router.push("/profile/student/create");
  };

  const handleEditProfile = () => {
    router.push("/profile/student/edit");
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth allowedRoles={["student"]}>
        <div className="min-h-screen flex items-center justify-center bg-black/80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-300"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth allowedRoles={["student"]}>
      <div className="min-h-screen flex items-center justify-center bg-black/80">
        <div className="max-w-2xl w-full border border-zinc-800 rounded-xl p-8 bg-black/60 text-zinc-100">
          {hasProfile ? (
            // User has a profile - show edit options
            <>
              <h1 className="text-2xl font-semibold mb-2">
                Your Student Profile
              </h1>
              <p className="text-zinc-400 mb-6">
                Your profile is complete! You can update your information
                anytime.
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleEditProfile}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
                <Link
                  href="/dashboard/student"
                  className="block w-full text-center border border-zinc-600 hover:border-zinc-500 text-zinc-100 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
            </>
          ) : (
            // User doesn't have a profile - show creation option
            <>
              <h1 className="text-2xl font-semibold mb-2">
                Complete Your Student Profile
              </h1>
              <p className="text-zinc-400 mb-6">
                Please complete your student profile to continue. This helps us
                personalize your experience and connect you with the right
                opportunities.
              </p>
              <div className="rounded-lg border border-zinc-800 p-6 mb-6">
                <h3 className="font-medium text-zinc-200 mb-2">
                  What you&apos;ll need:
                </h3>
                <ul className="text-sm text-zinc-400 space-y-1">
                  <li>• Personal information and contact details</li>
                  <li>• Academic information (program, semester, CGPA)</li>
                  <li>• Skills and career preferences</li>
                  <li>• Optional: Profile picture and certifications</li>
                </ul>
              </div>
              <button
                onClick={handleCreateProfile}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-3 px-4 rounded-lg transition-colors mb-4"
              >
                Create Profile
              </button>
            </>
          )}
          <div className="text-xs text-zinc-500">
            Need help?{" "}
            <Link href="/help" className="text-yellow-300 hover:underline">
              Contact support
            </Link>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
