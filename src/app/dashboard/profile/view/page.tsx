"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  adminProfileApi,
  alumniProfileApi,
  studentProfileApi,
} from "@/lib/api/profile";
import {
  AdminProfile,
  AlumniProfile,
  StudentProfile,
  User,
  UserRole,
} from "@/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiSummaryPanel } from "@/components/profile/view/AiSummaryPanel";
import { SocialLinksGrid } from "@/components/profile/view/SocialLinksGrid";
import { ProfileEditModal } from "@/components/profile/view/ProfileEditModal";
import AlumniDetails from "@/components/profile/view/AlumniDetails";
import apiClient from "@/lib/api";

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

type AnyP = (AdminProfile | AlumniProfile | StudentProfile) & { id?: number };

export default function ProfileViewPage() {
  const [profile, setProfile] = useState<AnyP | null>(null);
  const [role, setRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [socialEdit, setSocialEdit] = useState<{
    platform: string;
    current?: any;
  } | null>(null);
  const [targetFields, setTargetFields] = useState<string[] | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      // Get current user to determine role
      const me = await apiClient.get("/auth/users/me/");
      const user: User = (me as any).data || (me as any);
      const r = (user?.role || "student") as UserRole;
      setRole(r);

      let data: AnyP | null = null;
      if (r === "admin") {
        data = await adminProfileApi.get();
      } else if (r === "alumni") {
        data = await alumniProfileApi.get();
      } else {
        data = await studentProfileApi.get();
      }
      setProfile(data as AnyP);
    } catch (e: any) {
      setError(
        e?.response?.data?.error || e?.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const headerTitle = useMemo(() => {
    if (!role) return "Profile";
    return `${role[0].toUpperCase()}${role.slice(1)} Profile`;
  }, [role]);

  return (
    <ProtectedRoute requireAuth allowedRoles={["admin", "alumni", "student"]}>
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
                onClick={() => load()}
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
                {/* Top layout: avatar + identity on left; socials on right (stacks on small screens) */}
                <div className="grid gap-4 lg:grid-cols-3">
                  <div className="lg:col-span-1 space-y-3">
                    <div className="flex items-start gap-4">
                      <div
                        className="relative h-16 w-16 shrink-0 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center text-yellow-300"
                        aria-label="Profile avatar"
                      >
                        {(() => {
                          const url =
                            (profile as any).avatar ||
                            (profile as any).profile_picture;
                          if (typeof url === "string" && url) {
                            return (
                              <Image
                                src={url}
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
                        <div className="text-zinc-100 text-sm font-semibold">
                          {(profile as any).email ||
                            ((profile as any).email &&
                              `${(profile as any).first_name} ${
                                (profile as any).last_name || ""
                              }`) ||
                            "Mayank"}
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                          {role === "admin" &&
                            (profile as AdminProfile).department && (
                              <Badge variant="outline">
                                {(profile as AdminProfile).department}
                              </Badge>
                            )}
                          {role === "admin" &&
                            (profile as AdminProfile).title && (
                              <Badge variant="secondary" className="capitalize">
                                {(profile as AdminProfile).title}
                              </Badge>
                            )}
                          {role === "alumni" &&
                            (profile as AlumniProfile).industry && (
                              <Badge variant="secondary" className="capitalize">
                                {(profile as AlumniProfile).industry}
                              </Badge>
                            )}
                          {role === "student" &&
                            (profile as StudentProfile).program && (
                              <Badge variant="secondary" className="capitalize">
                                {(profile as StudentProfile).program}
                              </Badge>
                            )}
                        </div>
                      </div>
                    </div>

                    {/* Key fields */}
                    <div className="grid gap-4 rounded-lg border border-zinc-800 p-4">
                      {role === "admin" && (
                        <>
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
                        </>
                      )}
                      {role === "alumni" && (
                        <>
                          {[
                            "current_company",
                            "current_position",
                            "degree",
                            "graduation_year",
                            "experience_years",
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
                        </>
                      )}
                      {role === "student" && (
                        <>
                          {[
                            "program",
                            "batch_year",
                            "current_semester",
                            "cgpa",
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
                        </>
                      )}
                    </div>
                  </div>

                  <div className="lg:col-span-2">
                    <SocialLinksGrid
                      links={(profile as any).social_links || {}}
                      onEdit={(platform, current) => {
                        // open modal with prefilled social edit context
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

                {/* Freeform sections */}
                {role === "admin" && (
                  <div className="rounded-lg border border-zinc-800 p-4">
                    <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                      Responsibilities
                    </div>
                    <div className="text-sm text-zinc-100 whitespace-pre-wrap">
                      {(profile as any).responsibilities?.trim() || "-"}
                    </div>
                  </div>
                )}
                {role === "alumni" ? (
                  <AlumniDetails
                    profile={profile}
                    onEditSection={(keys: string[]) => {
                      // Pre-fill modal with only these fields editable
                      setTargetFields(keys);
                      setSocialEdit(null);
                      setEditOpen(true);
                    }}
                    onEditSocial={(platform: string, current?: any) => {
                      setSocialEdit({ platform, current });
                      setTargetFields(null);
                      setEditOpen(true);
                    }}
                  />
                ) : null}
                {role === "student" && (
                  <div className="rounded-lg border border-zinc-800 p-4 space-y-3">
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                        Bio
                      </div>
                      <div className="text-sm text-zinc-100 whitespace-pre-wrap">
                        {(profile as any).bio?.trim() || "-"}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                        Career Goals
                      </div>
                      <div className="text-sm text-zinc-100 whitespace-pre-wrap">
                        {(profile as any).career_goals?.trim() || "-"}
                      </div>
                    </div>
                  </div>
                )}
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
          targetFields={targetFields}
          onSaved={() => {
            setEditOpen(false);
            setSocialEdit(null);
            load();
          }}
        />
      </div>
    </ProtectedRoute>
  );
}
