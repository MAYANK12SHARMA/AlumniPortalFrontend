"use client";

// Central place for all client-side context/providers.
// This allows the root layout to stay a Server Component and still
// compose client providers without forcing the entire tree to be client rendered.

import { AuthProvider } from "@/contexts/AuthContext";
import ClientToaster from "@/components/ClientToaster";
import React from "react";

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <AuthProvider>
      {children}
      <ClientToaster />
    </AuthProvider>
  );
}
