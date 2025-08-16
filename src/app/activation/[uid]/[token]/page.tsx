"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";

export default function ActivationRedirectPage() {
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    // Extract uid and token from URL parameters
    const uid = params.uid as string;
    const token = params.token as string;

    console.log("Redirect page received:", { uid, token });

    if (uid && token) {
      // Redirect to the actual activation page with query parameters
      const redirectUrl = `/auth/activate?uid=${uid}&token=${token}`;
      console.log("Redirecting to:", redirectUrl);
      router.replace(redirectUrl);
    } else {
      console.error("Missing parameters for activation:", { uid, token });
      // If parameters are missing, redirect to registration
      router.replace("/auth/register");
    }
  }, [params, router]);

  // Show loading state while redirecting
  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-400 mx-auto mb-2"></div>
        <p className="text-zinc-400">Redirecting...</p>
      </div>
    </div>
  );
}
