import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";

// This file provides a global 404 (Not Found) page for the App Router.
// Next.js automatically uses `not-found.tsx` when `notFound()` is thrown
// or a route segment isn't matched.
export default function NotFound() {
  return (
    <main className="relative flex min-h-[calc(100vh-0px)] flex-col items-center justify-center overflow-hidden px-6 py-24 text-center">
      {/* Ambient gradient blobs */}
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(circle_at_center,black,transparent)]">
        <div className="absolute left-1/2 top-1/2 h-[55rem] w-[55rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[conic-gradient(from_180deg_at_50%_50%,#FF7A18_0deg,#FFD24C_140deg,#222_320deg,#FF7A18_360deg)] opacity-[0.08] blur-3xl" />
        <div className="absolute left-0 top-0 h-80 w-80 -translate-x-1/3 -translate-y-1/3 rounded-full bg-yellow-400/10 blur-2xl" />
        <div className="absolute bottom-0 right-0 h-96 w-96 translate-x-1/3 translate-y-1/3 rounded-full bg-orange-500/10 blur-2xl" />
      </div>

      <Card className="mx-auto w-full max-w-xl border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl">
        <CardContent className="space-y-8 pt-10">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/60 shadow-inner">
            <div className="relative h-12 w-12">
              <Image
                src="/globe.svg"
                fill
                alt="404 Illustration"
                className="opacity-80"
              />
            </div>
          </div>
          <div className="space-y-4">
            <h1 className="text-5xl font-bold tracking-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-400 to-yellow-300 bg-clip-text text-transparent">
                404
              </span>{" "}
              Page not found
            </h1>
            <p className="mx-auto max-w-md text-sm leading-relaxed text-zinc-400">
              Sorry, we couldn&apos;t find the page you&apos;re looking for. It
              may have been moved, renamed, or no longer exists.
            </p>
          </div>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            <Button
              asChild
              variant="primary"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/">Go to Dashboard</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="w-full sm:w-auto"
            >
              <Link href="/directory/alumni">Browse Directory</Link>
            </Button>
          </div>
          <div className="pt-4 text-xs text-zinc-500">
            <p className="font-mono">
              <span className="text-zinc-400">ErrorCode:</span> NOT_FOUND
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Decorative grid overlay */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.08),transparent_70%)]" />
      <div className="pointer-events-none absolute inset-0 -z-10 [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_85%,transparent)]">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>
    </main>
  );
}
