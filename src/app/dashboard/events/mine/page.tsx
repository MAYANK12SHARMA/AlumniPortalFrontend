import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { MyEventsClient } from "./view-client";

export const metadata = { title: "My Event Submissions" };

export default function MyEventsPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "alumni", "student"]}>
      <MyEventsClient />
    </ProtectedRoute>
  );
}
