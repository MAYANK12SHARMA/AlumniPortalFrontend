"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { AlumniProfileWizard } from "@/components/profile/alumni/AlumniProfileWizard";
import { alumniProfileApi } from "@/lib/api/profile";
import { AlumniProfile } from "@/types";
import { Card } from "@/components/ui/card";

export default function AlumniProfileCreatePage() {
  const router = useRouter();
  const initialData = undefined as Partial<AlumniProfile> | undefined; // no preloaded data
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkExistingProfile = async () => {
      try {
        // Try to fetch existing profile
        const existingProfile = await alumniProfileApi.get();

        if (existingProfile) {
          // If profile exists, redirect to edit mode
          router.push("/profile/alumni/edit");
          return;
        }
      } catch (error: any) {
        // If 404, user doesn't have a profile yet - continue with creation
        if (error.response?.status !== 404) {
          console.error("Error checking existing profile:", error);
          setError("Failed to check existing profile");
          toast.error("Failed to check existing profile");
        }
      } finally {
        setIsLoading(false);
      }
    };

    checkExistingProfile();
  }, [router]);

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8">
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        </Card>
      </div>
    );
  }

  return <AlumniProfileWizard initialData={initialData} isEditing={false} />;
}
