"use client";

import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { StudentProfileShowcase } from "@/components/profile/student/view/StudentProfileShowcase";

export default function StudentProfileViewPage() {
  return (
    <ProtectedRoute requireAuth allowedRoles={["student"]}>
      <div className="min-h-screen pb-24 pt-10 px-4 md:px-8 bg-gradient-to-b from-black via-zinc-950 to-black text-zinc-100">
        <StudentProfileShowcase />
      </div>
    </ProtectedRoute>
  );
}
