"use client";

import { useEffect, useState } from "react";

interface HydrationSafeProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * HydrationSafe component that prevents hydration mismatches
 * by only rendering children after the component has mounted on the client
 */
export default function HydrationSafe({
  children,
  fallback,
}: HydrationSafeProps) {
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);

  if (!hasMounted) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
