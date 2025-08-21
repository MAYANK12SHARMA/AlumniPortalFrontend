// Basic Alumni Directory page placeholder to satisfy Next.js build
import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { AlumniDirectoryExample } from "@/hooks/useAlumniDirectory";

export default function AlumniDirectoryPage() {
  return (
    <ProtectedRoute requireAuth>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Alumni Directory</h1>
        <p className="text-sm text-zinc-400">
          Browse verified alumni profiles.
        </p>
        <AlumniDirectoryExample />
      </div>
    </ProtectedRoute>
  );
}
