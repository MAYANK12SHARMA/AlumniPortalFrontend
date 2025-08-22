"use client";
import React from "react";
import RoleRequestApplyForm from "@/components/role-requests/RoleRequestApplyForm";
import ProtectedRoute from "@/components/ProtectedRoute";
import { motion } from "framer-motion";

export default function ApplyRoleRequestPage() {
  return (
    <ProtectedRoute allowedRoles={["student"]}>
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-amber-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
            Become an Alumni
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Submit your alumni details to unlock mentorship features, networking
            visibility, and opportunities to guide current students. Provide
            accurate academic and professional information for faster approval.
          </p>
        </motion.div>
        <RoleRequestApplyForm />
      </div>
    </ProtectedRoute>
  );
}
