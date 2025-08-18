"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Shield, CheckCircle, XCircle, Loader2, ArrowLeft } from "lucide-react";
import toast from "react-hot-toast";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";

type ActivationState = "loading" | "success" | "error" | "expired";

export default function ActivateAccountPage() {
  const [activationState, setActivationState] =
    useState<ActivationState>("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const activateAccount = async () => {
      try {
        // Get the activation token from URL parameters
        const uid = searchParams.get("uid");
        const token = searchParams.get("token");

        console.log("Activation attempt:", { uid, token });

        if (!uid || !token) {
          console.error("Missing activation parameters:", { uid, token });
          setActivationState("error");
          setErrorMessage(
            "Invalid activation link. Please check your email for the correct link."
          );
          return;
        }

        // Call the activation API endpoint
        console.log("Calling activation API...");
        await apiClient.activateAccount(uid, token);
        console.log("Activation successful!");

        setActivationState("success");
        toast.success("Account activated successfully! You can now log in.");

        // Redirect to login page after 3 seconds
        setTimeout(() => {
          router.push("/login");
        }, 3000);
      } catch (error: unknown) {
        console.error("Account activation failed:", error);

        if (error instanceof Error && "response" in error) {
          const axiosError = error as {
            response?: { status?: number; data?: any };
          };
          if (axiosError.response?.status === 400) {
            const errorData = axiosError.response.data;
            //
            if (
              errorData.detail?.includes("expired") ||
              errorData.token?.[0]?.includes("expired")
            ) {
              setActivationState("expired");
              setErrorMessage(
                "This activation link has expired. Please register again to get a new activation link."
              );
            } else if (
              errorData.detail?.includes("invalid") ||
              errorData.token?.[0]?.includes("invalid")
            ) {
              setActivationState("error");
              setErrorMessage(
                "Invalid activation link. Please check your email for the correct link."
              );
            } else {
              setActivationState("error");
              setErrorMessage(
                "This account may already be activated or the link is invalid."
              );
            }
          } else {
            setActivationState("error");
            setErrorMessage(
              "An error occurred during activation. Please try again or contact support."
            );
          }
        } else {
          setActivationState("error");
          setErrorMessage(
            "An error occurred during activation. Please try again or contact support."
          );
        }

        toast.error("Account activation failed. Please try again.");
      }
    };

    activateAccount();
  }, [searchParams, router]);

  const renderContent = () => {
    switch (activationState) {
      case "loading":
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-500/10 text-yellow-400">
              <Loader2 size={32} className="animate-spin" />
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">
              Activating Your Account
            </h2>
            <p className="text-zinc-400 leading-relaxed">
              Please wait while we activate your account...
            </p>
          </div>
        );

      case "success":
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 text-green-400">
              <CheckCircle size={32} />
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">
              Account Activated!
            </h2>
            <p className="text-zinc-400 mb-4 leading-relaxed">
              Your account has been successfully activated.
              <br />
              You will be redirected to the login page in a few seconds.
            </p>
            <Button
              onClick={() => router.push("/login")}
              className="w-full"
            >
              Go to Login
            </Button>
          </div>
        );

      case "expired":
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-500/10 text-orange-400">
              <XCircle size={32} />
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">
              Link Expired
            </h2>
            <p className="text-zinc-400 mb-4 leading-relaxed">{errorMessage}</p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/register")}
                className="w-full"
              >
                Register Again
              </Button>
              <div className="flex items-center justify-center gap-2">
                <ArrowLeft size={14} />
                <Link
                  href="/login"
                  className="text-sm text-yellow-300 hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        );

      case "error":
      default:
        return (
          <div className="text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <XCircle size={32} />
            </div>
            <h2 className="text-xl font-semibold text-zinc-100 mb-2">
              Activation Failed
            </h2>
            <p className="text-zinc-400 mb-4 leading-relaxed">{errorMessage}</p>
            <div className="space-y-3">
              <Button
                onClick={() => router.push("/register")}
                className="w-full"
                variant="outline"
              >
                Try Registering Again
              </Button>
              <div className="flex items-center justify-center gap-2">
                <ArrowLeft size={14} />
                <Link
                  href="/login"
                  className="text-sm text-yellow-300 hover:underline"
                >
                  Back to Login
                </Link>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <ProtectedRoute requireAuth={false}>
      <div
        className="relative min-h-screen overflow-hidden bg-[radial-gradient(80%_120%_at_10%_10%,#0a0a0a,rgba(0,0,0,1)_70%)]"
        suppressHydrationWarning
      >
        {/* Subtle diagonal lines */}
        <div className="pointer-events-none absolute inset-0 [background:repeating-linear-gradient(45deg,rgba(250,204,21,0.035)_0_16px,transparent_16px_32px)]" />

        {/* Floating orbs animation */}
        <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl orb" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl orb2" />
        <div className="absolute top-1/2 left-1/3 h-64 w-64 -translate-y-1/2 rounded-full bg-yellow-200/5 blur-3xl orb3" />

        <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10">
          <div className="w-full max-w-md">
            {/* Brand Header */}
            <div className="mb-8 text-center">
              <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-yellow-500/40 bg-yellow-400/10 text-yellow-300">
                <Shield size={24} />
              </div>
              <div className="text-sm tracking-wide text-yellow-400">
                Alumni Portal
              </div>
            </div>

            {/* Activation Card */}
            <Card className="border-zinc-800 bg-black/60 backdrop-blur">
              <CardContent className="p-6 sm:p-8">
                {renderContent()}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Local styles for floating animation */}
        <style jsx>{`
          @keyframes float {
            0%,
            100% {
              transform: translate3d(0, 0, 0);
            }
            50% {
              transform: translate3d(8px, -12px, 0);
            }
          }
          .orb {
            animation: float 9s ease-in-out infinite;
          }
          .orb2 {
            animation: float 11s ease-in-out infinite;
          }
          .orb3 {
            animation: float 13s ease-in-out infinite;
          }
        `}</style>
      </div>
    </ProtectedRoute>
  );
}
