"use client";
import { useEffect, useMemo, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import apiClient from "@/lib/api";
import Link from "next/link";
import { RefreshCw, X as CloseIcon, Image as ImageIcon, FileText } from "lucide-react";

type AdminProfile = {
  display_name?: string;
  avatar?: any;
  contact_email?: string | null;
  phone?: string;
  title?: string;
  department?: string;
  responsibilities?: string;
  profile_summary_ai?: string | null;
  ai_summary_last_updated?: string | null;
  is_active?: boolean;
  is_verified?: string;
  verification_notes?: string;
  created_at?: string;
  updated_at?: string;
};

function formatDate(dt?: string | null) {
  if (!dt) return "-";
  try {
    return new Date(dt).toLocaleString();
  } catch {
    return String(dt);
  }
}

export default function AdminProfileViewPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // preview
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [previewName, setPreviewName] = useState<string>("");

  function normalizeMedia(input: any): { url: string | null; name?: string } {
    if (!input) return { url: null };
    if (typeof input === "string") return { url: input };
    return { url: input?.url || input?.path || null, name: input?.name };
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/admin/profile/");
      const data = (res as any).data || (res as any) || {};
      setProfile(data);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const avatar = normalizeMedia(profile?.avatar);
  const isActive = !!profile?.is_active;
  const verified = (profile?.is_verified || "none").toLowerCase();

  return (
    <ProtectedRoute requireAuth allowedRoles={["admin"]}>
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="text-xs text-zinc-400">
          <span className="text-zinc-500">dashboard</span>
          <span className="mx-2">›</span>
          <span className="text-zinc-300">dashboard/profile/admin/view</span>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">
              Admin Profile
              {loading ? (
                <span className="text-xs text-zinc-400">Loading…</span>
              ) : (
                <Badge variant={isActive ? "success" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
              )}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => load()} disabled={loading} title="Refresh">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </Button>
              <Link href="/dashboard/profile/admin/update">
                <Button size="sm">Edit Profile</Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-3 text-sm text-red-400 border border-red-900/40 bg-red-900/10 rounded-lg p-3">{error}</div>
            )}

            {!profile ? (
              <div className="p-6 text-center text-zinc-400">{loading ? "Loading profile…" : "No profile"}</div>
            ) : (
              <div className="space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div
                    className="h-16 w-16 shrink-0 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center text-yellow-300"
                    title={avatar.url ? "Click to preview" : "No avatar"}
                    onClick={() => {
                      if (avatar.url) {
                        setPreviewUrl(avatar.url);
                        setPreviewName(profile.display_name || "Avatar");
                        setPreviewOpen(true);
                      }
                    }}
                  >
                    {avatar.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar.url} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-sm">{(profile.display_name || "A").slice(0, 1).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="text-zinc-100 text-sm font-semibold">{profile.display_name || "Admin"}</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                      <Badge variant="secondary" className="capitalize">{profile.title || "No title"}</Badge>
                      {profile.department && <Badge variant="outline">{profile.department}</Badge>}
                      <Badge variant={verified === "approved" ? "success" : verified === "pending" ? "warning" : "secondary"}>
                        {verified}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Details */}
                <div className="grid gap-4 md:grid-cols-3 rounded-lg border border-zinc-800 p-4">
                  {[
                    ["Contact Email", profile.contact_email || "-"],
                    ["Phone", profile.phone || "-"],
                    ["Department", profile.department || "-"],
                    ["Title", profile.title || "-"],
                    ["Active", profile.is_active ? "Yes" : "No"],
                    ["Updated", formatDate(profile.updated_at)],
                  ].map(([label, value]) => (
                    <div key={label as string} className="space-y-1">
                      <div className="text-[11px] uppercase tracking-wide text-zinc-400">{label as string}</div>
                      <div className="text-sm text-zinc-100 break-words">{value as string}</div>
                    </div>
                  ))}
                </div>

                {/* Responsibilities */}
                <div className="rounded-lg border border-zinc-800 p-4">
                  <div className="text-[11px] uppercase tracking-wide text-zinc-400 mb-1">Responsibilities</div>
                  <div className="text-sm text-zinc-100 whitespace-pre-wrap">
                    {profile.responsibilities?.trim() || "-"}
                  </div>
                </div>

                {/* AI Summary */}
                <div className="rounded-lg border border-zinc-800 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="text-[11px] uppercase tracking-wide text-zinc-400">AI Profile Summary</div>
                    <div className="text-[11px] text-zinc-500">{formatDate(profile.ai_summary_last_updated)}</div>
                  </div>
                  <div className="text-sm text-zinc-100 whitespace-pre-wrap">
                    {profile.profile_summary_ai?.trim() || "-"}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Preview modal */}
        {previewOpen && (
          <div className="fixed inset-0 z-50">
            <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setPreviewOpen(false)} />
            <div className="absolute inset-0 flex items-center justify-center p-4">
              <div className="w-full max-w-3xl rounded-xl border border-zinc-800 bg-black/90 shadow-xl overflow-hidden">
                <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
                  <div className="text-sm font-medium text-zinc-200 truncate pr-2">{previewName || "Preview"}</div>
                  <Button variant="ghost" size="icon" onClick={() => setPreviewOpen(false)}>
                    <CloseIcon size={16} />
                  </Button>
                </div>
                <div className="max-h-[80vh] overflow-auto bg-black p-4">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={previewUrl} alt={previewName || "preview"} className="block max-h-[75vh] mx-auto object-contain" />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
