"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Shield, Mail, Lock, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const { login, user, loading } = useAuth();
  const router = useRouter();

  // Redirect if user is already authenticated
  useEffect(() => {
    if (!loading && user) {
      const redirectPath =
        user.role === "student"
          ? "/dashboard/student"
          : user.role === "alumni"
          ? "/dashboard/alumni"
          : "/dashboard/admin";
      router.push(redirectPath);
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Clear previous errors
    setFieldErrors({});

    // Basic validation
    const errors: Record<string, string> = {};
    if (!email) errors.email = "Email is required";
    if (!password) errors.password = "Password is required";

    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors);
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    try {
      const success = await login(email, password);
      if (success) {
        // Redirect will happen via useEffect when user state updates
      }
    } catch (error) {
      console.error("Login failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Show loading if checking auth state
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        suppressHydrationWarning
      >
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  return (
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

      <div className="relative z-10 mx-auto grid min-h-screen max-w-7xl grid-cols-1 items-center gap-8 px-4 py-10 md:grid-cols-2">
        {/* Left: Brand */}
        <div className="hidden md:block">
          <div className="flex items-center gap-3 text-yellow-400">
            <Shield size={22} />
            <span className="text-sm tracking-wide">Alumni Portal</span>
          </div>
          <h1 className="mt-4 text-4xl font-semibold leading-tight text-zinc-100">
            Welcome back,
            <br />
            let’s continue your journey.
          </h1>
          <p className="mt-3 max-w-md text-zinc-400">
            Connect students and alumni, mentor and get mentored, and grow the
            community together.
          </p>
        </div>

        {/* Right: Login Card */}
        <div className="mx-auto w-full max-w-md">
          <Card className="border-zinc-800 bg-black/60 backdrop-blur">
            <CardContent className="p-6 sm:p-7">
              <div className="mb-6 text-center">
                <div className="mx-auto mb-3 flex h-10 w-10 items-center justify-center rounded-lg border border-yellow-500/40 bg-yellow-400/10 text-yellow-300">
                  <Shield size={18} />
                </div>
                <h2 className="text-lg font-semibold text-zinc-100">
                  Sign in to Alumni Portal
                </h2>
                <p className="mt-1 text-xs text-zinc-400">
                  Don’t have an account?
                  <Link
                    href="/auth/register"
                    className="ml-1 text-yellow-300 hover:underline"
                  >
                    Create one
                  </Link>
                </p>
              </div>

              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-3">
                  <label
                    htmlFor="email"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Email address
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
                      <Mail size={14} />
                    </div>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      placeholder="you@example.com"
                      className={`pl-9 ${
                        fieldErrors.email
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : ""
                      }`}
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldErrors.email) {
                          setFieldErrors({ ...fieldErrors, email: "" });
                        }
                      }}
                    />
                  </div>
                  {fieldErrors.email && (
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <AlertCircle size={12} />
                      {fieldErrors.email}
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label
                    htmlFor="password"
                    className="block text-xs font-medium text-zinc-300"
                  >
                    Password
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-zinc-500">
                      <Lock size={14} />
                    </div>
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      placeholder="••••••••"
                      className={`pl-9 ${
                        fieldErrors.password
                          ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
                          : ""
                      }`}
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) {
                          setFieldErrors({ ...fieldErrors, password: "" });
                        }
                      }}
                    />
                  </div>
                  {fieldErrors.password && (
                    <div className="flex items-center gap-2 text-xs text-red-400">
                      <AlertCircle size={12} />
                      {fieldErrors.password}
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <div />
                  <Link
                    href="/auth/forgot-password"
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button type="submit" disabled={isLoading} className="w-full">
                  {isLoading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black" />
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
          <div className="mt-6 text-center text-xs text-zinc-500">
            Protected area • Authorized users only
          </div>
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
  );
}
