"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import ProtectedRoute from "@/components/ProtectedRoute";
import Link from "next/link";
import { alumniProfileApi } from "@/lib/api/profile";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AiSummaryPanel } from "@/components/profile/view/AiSummaryPanel";
import { SocialLinksGrid } from "@/components/profile/view/SocialLinksGrid";
import { ProfileEditModal } from "@/components/profile/view/ProfileEditModal";

export default function AlumniProfileCompletionPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const [profile, setProfile] = useState<any | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  // Removed unused socialEdit state

  useEffect(() => {
    checkExistingProfile();
  }, []);

  const checkExistingProfile = async () => {
    try {
      const p = await alumniProfileApi.get();
      if (p) {
        setHasProfile(true);
        setProfile(p);
      }
    } catch (error) {
      console.error("Error fetching alumni profile:", error);
      // No profile exists, user needs to create one
      setHasProfile(false);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProfile = () => {
    router.push("/profile/alumni/create");
  };

  const reload = async () => {
    setLoading(true);
    try {
      const p = await alumniProfileApi.get();
      setProfile(p);
      setHasProfile(!!p);
    } catch {
      setHasProfile(false);
      setProfile(null);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requireAuth allowedRoles={["alumni"]}>
        <div className="min-h-screen flex items-center justify-center bg-black/80">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-300"></div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requireAuth allowedRoles={["alumni"]}>
      <div className="space-y-4">
        {!hasProfile ? (
          <div className="min-h-screen flex items-center justify-center bg-black/80">
            <div className="max-w-2xl w-full border border-zinc-800 rounded-xl p-8 bg-black/60 text-zinc-100">
              <h1 className="text-2xl font-semibold mb-2">
                Complete Your Alumni Profile
              </h1>
              <p className="text-zinc-400 mb-6">
                Please provide your professional details to unlock mentoring,
                referrals, and networking features.
              </p>
              <div className="rounded-lg border border-zinc-800 p-6 mb-6">
                <h3 className="font-medium text-zinc-200 mb-2">
                  What you&apos;ll include:
                </h3>
                <ul className="text-sm text-zinc-400 space-y-1">
                  <li>• Professional information and current role</li>
                  <li>• Educational background and graduation details</li>
                  <li>• Expertise areas and mentoring preferences</li>
                  <li>• Optional: Verification documents and achievements</li>
                </ul>
                <div className="mt-4 p-3 bg-blue-900/20 border border-blue-800 rounded-lg">
                  <p className="text-xs text-blue-300">
                    <strong>Note:</strong> Alumni profiles require verification
                    for mentoring and referral features.
                  </p>
                </div>
              </div>
              <div className="space-y-4">
                <button
                  onClick={handleCreateProfile}
                  className="w-full bg-yellow-600 hover:bg-yellow-700 text-black font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Create Alumni Profile
                </button>
                <Link
                  href="/dashboard/alumni"
                  className="block w-full text-center border border-zinc-600 hover:border-zinc-500 text-zinc-100 font-medium py-3 px-4 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </Link>
              </div>
              <div className="text-xs text-zinc-500 mt-4">
                Need help?{" "}
                <Link href="/help" className="text-yellow-300 hover:underline">
                  Contact support
                </Link>
              </div>
            </div>
          </div>
        ) : (
          // Full profile view
          <div className="p-4">
            <Card>
              <CardHeader className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-3">
                  Alumni Profile
                  <Badge variant="secondary">Alumni</Badge>
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={reload}
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
                <div className="space-y-6">
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-1 space-y-3">
                      <div className="flex items-start gap-4">
                        <div
                          className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center text-yellow-300"
                          aria-label="Profile avatar"
                        >
                          {(() => {
                            const url =
                              profile?.avatar || profile?.profile_picture;
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
                              profile?.display_name ||
                              profile?.first_name ||
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
                            {profile?.display_name ||
                              `${profile?.first_name || ""} ${
                                profile?.last_name || ""
                              }`}
                          </div>
                          <div className="text-zinc-400 text-sm">
                            {profile?.current_position
                              ? `${profile.current_position} @ ${profile.current_company}`
                              : profile?.degree}
                          </div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                            {profile?.industry && (
                              <Badge variant="secondary" className="capitalize">
                                {profile.industry}
                              </Badge>
                            )}
                            {profile?.graduation_year && (
                              <Badge variant="outline">
                                Grad {profile.graduation_year}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 rounded-lg border border-zinc-800 p-4">
                        <div className="space-y-1">
                          <div className="text-[11px] uppercase tracking-wide text-zinc-400">
                            Current company
                          </div>
                          <div className="text-sm text-zinc-100">
                            {profile?.current_company || "-"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] uppercase tracking-wide text-zinc-400">
                            Current position
                          </div>
                          <div className="text-sm text-zinc-100">
                            {profile?.current_position || "-"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] uppercase tracking-wide text-zinc-400">
                            Experience
                          </div>
                          <div className="text-sm text-zinc-100">
                            {profile?.experience_years || "-"}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <div className="text-[11px] uppercase tracking-wide text-zinc-400">
                            Location
                          </div>
                          <div className="text-sm text-zinc-100">
                            {profile?.location || "-"}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2 space-y-4">
                      <div>
                        <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                          AI Profile Summary
                        </div>
                        <AiSummaryPanel
                          summary={profile?.profile_summary_ai}
                          updatedAt={profile?.ai_summary_last_updated}
                        />
                      </div>

                      <SocialLinksGrid
                        links={profile?.social_links || {}}
                        onEdit={() => {
                          setEditOpen(true);
                        }}
                      />

                      <div className="rounded-lg border border-zinc-800 p-4 space-y-4">
                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                            About
                          </div>
                          <div className="text-sm text-zinc-100 whitespace-pre-wrap">
                            {profile?.bio?.trim() || "-"}
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                            Specialization & Expertise
                          </div>
                          <div className="text-sm text-zinc-100">
                            {profile?.specialization || "-"}
                          </div>
                          {profile?.expertise_areas &&
                            profile.expertise_areas.length > 0 && (
                              <div className="mt-2 flex flex-wrap gap-2">
                                {profile.expertise_areas.map(
                                  (e: any, i: number) => (
                                    <Badge
                                      key={i}
                                      variant="outline"
                                      className="capitalize"
                                    >
                                      {e}
                                    </Badge>
                                  )
                                )}
                              </div>
                            )}
                        </div>

                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                            Mentoring & Networking
                          </div>
                          <div className="text-sm text-zinc-100">
                            Willing to mentor:{" "}
                            {profile?.willing_to_mentor ? "Yes" : "No"} • Can
                            provide referrals:{" "}
                            {profile?.can_provide_referrals ? "Yes" : "No"}
                          </div>
                          {profile?.preferred_mentoring_topics &&
                            profile.preferred_mentoring_topics.length > 0 && (
                              <div className="mt-2 text-sm text-zinc-100">
                                <strong>Preferred mentoring topics:</strong>{" "}
                                {profile.preferred_mentoring_topics.join(", ")}
                              </div>
                            )}
                        </div>

                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                            Career path
                          </div>
                          <div className="text-sm text-zinc-100 whitespace-pre-wrap">
                            {profile?.career_path && profile.career_path.length
                              ? profile.career_path.map((c: any, i: number) => (
                                  <div key={i}>• {c}</div>
                                ))
                              : "-"}
                          </div>
                        </div>

                        <div>
                          <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                            Notable achievements
                          </div>
                          <div className="text-sm text-zinc-100 whitespace-pre-wrap">
                            {profile?.notable_achievements?.trim() || "-"}
                          </div>
                        </div>
                      </div>

                      <div className="rounded-lg border border-zinc-800 p-4">
                        <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                          Preferences & availability
                        </div>
                        <div className="text-sm text-zinc-100">
                          Available for networking:{" "}
                          {profile?.available_for_networking ? "Yes" : "No"}
                        </div>
                        {profile?.preferred_communication &&
                          profile.preferred_communication.length > 0 && (
                            <div className="mt-2 text-sm text-zinc-100">
                              Preferred communication:{" "}
                              {profile.preferred_communication.join(", ")}
                            </div>
                          )}
                      </div>

                      <div className="rounded-lg border border-zinc-800 p-4">
                        <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">
                          Account & verification
                        </div>
                        <div className="grid grid-cols-1 gap-2 text-sm text-zinc-100">
                          <div>Phone: {profile?.phone_number || "-"}</div>
                          <div>Degree: {profile?.degree || "-"}</div>
                          <div>
                            Has social account:{" "}
                            {typeof profile?.has_social_account === "boolean"
                              ? profile.has_social_account
                                ? "Yes"
                                : "No"
                              : profile?.has_social_account ?? "-"}
                          </div>
                          <div>
                            Public profile:{" "}
                            {typeof profile?.is_public === "boolean"
                              ? profile.is_public
                                ? "Yes"
                                : "No"
                              : profile?.is_public ?? "-"}
                          </div>
                          <div>
                            Verification status:
                            <span
                              className={
                                "inline-block ml-2 text-xs px-2 py-1 rounded " +
                                (profile?.is_verified === "approved"
                                  ? "bg-green-800 text-green-200"
                                  : profile?.is_verified === "pending"
                                  ? "bg-yellow-800 text-yellow-200"
                                  : "bg-zinc-800 text-zinc-300")
                              }
                            >
                              {profile?.is_verified ?? "-"}
                            </span>
                          </div>
                          {profile?.verification_notes && (
                            <div>
                              Verification notes: {profile.verification_notes}
                            </div>
                          )}
                          {profile?.verified_at && (
                            <div>
                              Verified at:{" "}
                              {new Date(profile.verified_at).toLocaleString()}
                            </div>
                          )}
                          <div>
                            Created:{" "}
                            {profile?.created_at
                              ? new Date(profile.created_at).toLocaleString()
                              : "-"}
                          </div>
                          <div>
                            Updated:{" "}
                            {profile?.updated_at
                              ? new Date(profile.updated_at).toLocaleString()
                              : "-"}
                          </div>
                          <div>User id: {profile?.user ?? "-"}</div>
                          <div>
                            Alumni verified by:{" "}
                            {profile?.alumni_verified_by ?? "-"}
                          </div>
                          <div>
                            Verification docs:{" "}
                            {profile?.verification_docs ? "Uploaded" : "None"}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <ProfileEditModal
              open={editOpen}
              onOpenChange={setEditOpen}
              role="alumni"
              initial={profile}
              socialEdit={undefined}
              onSaved={() => {
                setEditOpen(false);
                // social edit removed
                reload();
              }}
            />
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
