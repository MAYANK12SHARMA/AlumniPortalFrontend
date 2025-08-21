import React from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import ClientCreateEvent from "./ClientCreateEvent";

export const metadata = { title: "Create Event" };

export default function CreateEventPage() {
  return (
    <ProtectedRoute allowedRoles={["admin", "alumni", "student"]}>
      <ClientCreateEvent />
    </ProtectedRoute>
  );
}
