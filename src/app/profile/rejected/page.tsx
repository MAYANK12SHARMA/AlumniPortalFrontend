"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { AlertTriangle } from "lucide-react";

export default function ProfileRejectedPage() {
  return (
    <ProtectedRoute requireAuth>
      <div className="min-h-screen flex items-center justify-center bg-black/80">
        <div className="max-w-md w-full border border-zinc-800 rounded-xl p-8 bg-black/60 text-zinc-100">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-500/10 text-red-400">
            <AlertTriangle size={28} />
          </div>
          <h1 className="text-xl font-semibold mb-2">Profile Rejected</h1>
          <p className="text-zinc-400">
            Your profile was rejected by the administrator. Please contact the
            administration for details and next steps.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
