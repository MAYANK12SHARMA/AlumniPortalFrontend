import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function StudentDirectoryPage() {
  return (
    <ProtectedRoute requireAuth>
      <div className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold">Student Directory</h1>
        <p className="text-sm text-zinc-400">Browse student profiles.</p>
        <div className="text-sm text-zinc-500">Directory coming soon.</div>
      </div>
    </ProtectedRoute>
  );
}
