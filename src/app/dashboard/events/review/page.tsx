import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ReviewEventsClient from "./review-events";

export const metadata = { title: "Review Events" };

export default function ReviewEventsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin","alumni","student"]}>
      <ReviewEventsClient />
    </ProtectedRoute>
  );
}
