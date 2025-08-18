"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { alumniProfileApi } from "@/lib/api/profile";

export default function AlumniProfileCompletionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const profile = await alumniProfileApi.get();
      if (profile) {
        setHasProfile(true);
      }
    } catch (error) {
      // No profile exists, user needs to create one
      setHasProfile(false);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    router.push("/profile/alumni/create");
  };

  const handleEditProfile = () => {
    router.push("/profile/alumni/edit");
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth allowedRoles={["alumni"]}>
        <div className="min-h-screen flex items-center justify-center bg-black/80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-300"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth allowedRoles={["alumni"]}>
      <div className="min-h-screen flex items-center justify-center bg-black/80">
        <div className="max-w-2xl w-full border border-zinc-800 rounded-xl p-8 bg-black/60 text-zinc-100">
          {hasProfile ? (
            // User has a profile - show edit options
            <>
              <h1 className="text-2xl font-semibold mb-2">
                Your Alumni Profile
              </h1>
              <p className="text-zinc-400 mb-6">
                Your professional profile is complete! Keep it updated to help
                students and connect with fellow alumni.
              </p>
              <div className="space-y-4">
                <button
                  onClick={handleEditProfile}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Edit Profile
                </button>
                <Link
                  href="/dashboard/alumni"
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
                Complete Your Alumni Profile
              </h1>
              <p className="text-zinc-400 mb-6">
                Please provide your professional details to unlock mentoring,
                referrals, and networking features.
              </p>
              <div className="rounded-lg border border-zinc-800 p-6 mb-6">
                <h3 className="font-medium text-zinc-200 mb-2">
                  What you'll include:
                </h3>
                <ul className="text-sm text-zinc-400 space-y-1">
                  <li>• Professional information and current role</li>
                  <li>• Educational background and graduation details</li>
                  <li>• Expertise areas and mentoring preferences</li>
                  <li>• Optional: Verification documents and achievements</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-300">
                    <strong>Note:</strong> Alumni profiles require verification
                    for mentoring and referral features.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCreateProfile}
                className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-3 px-4 rounded-lg transition-colors mb-4"
              >
                Create Alumni Profile
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
