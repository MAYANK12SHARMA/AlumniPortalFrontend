"use client";

import { useMemo, useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import { useProfile } from "../useProfile";
import { AdminProfile, UserRole } from "@/types";
import { normalizeMediaUrl } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiSummaryPanel } from "@/components/profile/view/AiSummaryPanel";
import { SocialLinksGrid } from "@/components/profile/view/SocialLinksGrid";
import { ProfileEditModal } from "@/components/profile/view/ProfileEditModal";

function formatDate(dt?: string | null) {
  if (!dt) return "-";
  try {
    const d = new Date(dt);
    return d.toLocaleString(undefined, {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
      timeZoneName: "short",
    });
  } catch {
    return String(dt);
  }
}

export default function AdminProfileViewPage() {
  const { role, profile, loading, error, reload } = useProfile();
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [socialEdit, setSocialEdit] = useState<{
    platform: string;
    current?: any;
  } | null>(null);

  // Redirect if role doesn't match
  useEffect(() => {
    if (!loading && role && role !== "admin") {
      router.replace(`/dashboard/profile/view/${role}`);
    }
  }, [role, loading, router]);

  const headerTitle = useMemo(() => "Admin Profile", []);

  return (
    <ProtectedRoute requireAuth allowedRoles={["admin"]}>
      <div className="space-y-4">
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              {headerTitle}
              {loading ? (
                <span className="text-xs text-zinc-400">Loading…</span>
              ) : profile && "is_active" in profile ? (
                <Badge
                  variant={
                    (profile as AdminProfile).is_active
                      ? "success"
                      : "secondary"
                  }
                >
                  {(profile as AdminProfile).is_active ? "Active" : "Inactive"}
                </Badge>
              ) : null}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => reload()}
                disabled={loading}
              >
                Refresh
              </Button>
              <Button size="sm" onClick={() => setEditOpen(true)}>
                Edit
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-3 text-sm text-red-400 border border-red-900/40 bg-red-900/10 rounded-lg p-3">
                {error}
              </div>
            )}
            {!profile ? (
              <div className="p-6 text-center text-zinc-400">
                {loading ? "Loading profile…" : "No profile"}
              </div>
            ) : (
              <div className="space-y-6">
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-1 space-y-3">
                    <div className="flex items-start gap-4">
                      <div
                        className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center text-yellow-300"
                        aria-label="Profile avatar"
                      >
                        {(() => {
                          const raw =
                            (profile as any).avatar ||
                            (profile as any).profile_picture;
                          const fixed = normalizeMediaUrl(raw);
                          if (typeof fixed === "string" && fixed) {
                            return (
                              <Image
                                src={fixed}
                                alt="avatar"
                                fill
                                className="object-cover"
                              />
                            );
                          }
                          const dn =
                            (profile as any).display_name ||
                            (profile as any).first_name ||
                            "U";
                          return (
                            <span className="text-sm">
                              {String(dn).slice(0, 1).toUpperCase()}
                            </span>
                          );
                        })()}
                      </div>
                      <div className="flex-1">
                        <div className="text-zinc-100 text-sm font-semibold">
                          {(profile as any).display_name ||
                            ((profile as any).first_name &&
                              `${(profile as any).first_name} ${
                                (profile as any).last_name || ""
                              }`) ||
                            "User"}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          {(profile as AdminProfile).department && (
                            <Badge variant="outline">
                              {(profile as AdminProfile).department}
                            </Badge>
                          )}
                          {(profile as AdminProfile).title && (
                            <Badge variant="secondary" className="capitalize">
                              {(profile as AdminProfile).title}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="grid gap-4 rounded-lg border border-zinc-800 p-4">
                      {[
                        "contact_email",
                        "phone",
                        "department",
                        "title",
                        "updated_at",
                      ].map((k) => (
                        <div key={k} className="space-y-1">
                          <div className="text-[11px] uppercase tracking-wide text-zinc-400">
                            {k.replace(/_/g, " ")}
                          </div>
                          <div className="text-sm text-zinc-100 break-words">
                            {k.endsWith("_at")
                              ? formatDate((profile as any)[k])
                              : String((profile as any)[k] ?? "-")}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="lg:col-span-2">
                    <SocialLinksGrid
                      links={(profile as any).social_links || {}}
                      onEdit={(platform, current) => {
                        setEditOpen(true);
                        setSocialEdit({ platform, current });
                      }}
                    />
                    <div className="mt-4">
                      <AiSummaryPanel
                        summary={(profile as any).profile_summary_ai}
                        updatedAt={(profile as any).ai_summary_last_updated}
                      />
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border border-zinc-800 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                    Responsibilities
                  </div>
                  <div className="text-sm text-zinc-100 whitespace-pre-wrap">
                    {(profile as any).responsibilities?.trim() || "-"}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        <ProfileEditModal
          open={editOpen}
          onOpenChange={setEditOpen}
          role={role as UserRole}
          initial={profile as any}
          socialEdit={socialEdit}
          targetFields={null}
          onSaved={() => {
            setEditOpen(false);
            reload();
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
