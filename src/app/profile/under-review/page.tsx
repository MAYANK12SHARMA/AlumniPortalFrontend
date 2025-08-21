"use client";

import ProtectedRoute from "@/components/ProtectedRoute";
import { Clock } from "lucide-react";

export default function UnderReviewPage() {
  return (
    <ProtectedRoute requireAuth>
      <div className="min-h-screen flex items-center justify-center bg-black/80">
        <div className="max-w-md w-full border border-zinc-800 rounded-xl p-8 bg-black/60 text-zinc-100">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400">
            <Clock size={28} />
          </div>
          <h1 className="text-xl font-semibold mb-2">Profile Under Review</h1>
          <p className="text-zinc-400">
            Your profile has been submitted and is currently under review by the
            administrators. You&apos;ll be notified once it&apos;s approved.
          </p>
        </div>
      </div>
    </ProtectedRoute>
  );
}
