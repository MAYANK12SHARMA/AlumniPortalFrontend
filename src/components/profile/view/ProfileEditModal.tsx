"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AdminProfile, AlumniProfile, StudentProfile, UserRole } from "@/types";
import {
  adminProfileApi,
  alumniProfileApi,
  studentProfileApi,
} from "@/lib/api/profile";
import { Button } from "@/components/ui/button";
import { SocialInfo } from "./SocialLinksGrid";

// A lightweight, fullscreen landscape modal for in-place editing across roles.
export function ProfileEditModal({
  open,
  onOpenChange,
  role,
  initial,
  onSaved,
  socialEdit,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  role: UserRole | null;
  initial: Partial<AdminProfile & AlumniProfile & StudentProfile> | null;
  onSaved: () => void;
  socialEdit?: { platform: string; current?: SocialInfo } | null;
}) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [errorSocialPrimary, setErrorSocialPrimary] = useState<string | null>(
    null
  );
  // Local social editor fields when editing a single platform
  const [socialPlatform, setSocialPlatform] = useState<string>("");
  const [socialUsername, setSocialUsername] = useState<string>("");
  const [socialUrl, setSocialUrl] = useState<string>("");
  const [socialPrimary, setSocialPrimary] = useState<boolean>(false);

  useEffect(() => {
    setForm(initial || {});
  }, [initial, open]);

  // Prefill social edit fields when a platform is selected
  useEffect(() => {
    if (socialEdit) {
      setSocialPlatform(socialEdit.platform);
      setSocialUsername(socialEdit.current?.username || "");
      setSocialUrl(socialEdit.current?.url || "");
      setSocialPrimary(!!socialEdit.current?.is_primary);
    } else {
      setSocialPlatform("");
      setSocialUsername("");
      setSocialUrl("");
      setSocialPrimary(false);
    }
    setErrorSocialPrimary(null);
    setErrorBanner(null);
  }, [socialEdit]);

  function setField<K extends string>(key: K, value: any) {
    setForm((p: any) => ({ ...p, [key]: value }));
  }

  async function save() {
    if (!role) return;
    setSaving(true);
    setErrorBanner(null);
    setErrorSocialPrimary(null);
    try {
      // If we're editing a specific social platform, only patch social_links
      if (socialEdit && socialPlatform) {
        const nextLinks: Record<string, SocialInfo> = {
          ...((form?.social_links as Record<string, SocialInfo>) || {}),
          [socialPlatform]: {
            username: socialUsername || undefined,
            url: socialUrl || undefined,
            is_primary: !!socialPrimary,
          },
        };
        const payload: any = { social_links: nextLinks };
        if (role === "admin") await adminProfileApi.update(payload);
        if (role === "alumni") await alumniProfileApi.update(payload);
        if (role === "student") await studentProfileApi.update(payload);
      } else {
        const payload = { ...form } as any;
        if (payload.profile_picture === "") delete payload.profile_picture;
        if (payload.avatar === "") delete payload.avatar;
        if (role === "admin") await adminProfileApi.update(payload);
        if (role === "alumni") await alumniProfileApi.update(payload);
        if (role === "student") await studentProfileApi.update(payload);
      }
      onSaved();
    } catch (e) {
      const data = (e as any)?.response?.data || {};
      const socialMsgs = data?.details?.social_links;
      if (socialEdit && Array.isArray(socialMsgs) && socialMsgs.length) {
        setErrorSocialPrimary(socialMsgs.join(" "));
      }
      const bannerMsg =
        data?.error ||
        data?.detail ||
        (Array.isArray(data?.non_field_errors)
          ? data.non_field_errors.join(" ")
          : undefined) ||
        (Array.isArray(socialMsgs) ? socialMsgs.join(" ") : undefined) ||
        (e as any)?.message ||
        "Failed to save profile";
      setErrorBanner(bannerMsg);
    } finally {
      setSaving(false);
    }
  }

  // Field sets by role; landscape layout — declare hooks unconditionally
  const fields: Array<{ key: string; label: string; type?: string }> =
    useMemo(() => {
      if (role === "admin")
        return [
          { key: "display_name", label: "Display Name" },
          { key: "contact_email", label: "Contact Email", type: "email" },
          { key: "phone", label: "Phone" },
          { key: "title", label: "Title" },
          { key: "department", label: "Department" },
          { key: "responsibilities", label: "Responsibilities" },
        ];
      if (role === "alumni")
        return [
          { key: "first_name", label: "First Name" },
          { key: "last_name", label: "Last Name" },
          { key: "current_company", label: "Current Company" },
          { key: "current_position", label: "Current Position" },
          { key: "degree", label: "Degree" },
          { key: "graduation_year", label: "Graduation Year" },
          { key: "bio", label: "Bio" },
        ];
      // student default
      return [
        { key: "first_name", label: "First Name" },
        { key: "last_name", label: "Last Name" },
        { key: "program", label: "Program" },
        { key: "batch_year", label: "Batch Year" },
        { key: "current_semester", label: "Current Semester" },
        { key: "cgpa", label: "CGPA" },
        { key: "bio", label: "Bio" },
      ];
    }, [role]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-edit-title"
    >
      <div
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => onOpenChange(false)}
        aria-label="Close modal"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-5xl h-[75vh] rounded-xl border border-zinc-800 bg-black/90 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between border-b border-zinc-800 px-4 py-3">
            <div
              id="profile-edit-title"
              className="text-sm font-medium text-zinc-200 truncate pr-2"
            >
              Edit {socialEdit ? `${socialPlatform} link` : role || "Profile"}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
          {errorBanner && (
            <div
              role="alert"
              aria-live="polite"
              className="mx-4 mt-3 rounded border border-red-900 bg-red-900/20 p-2 text-sm text-red-200"
            >
              {errorBanner}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 overflow-y-auto h-[calc(75vh-48px)]">
            {socialEdit ? (
              <div
                className="md:col-span-2 space-y-3"
                aria-label="Edit social link section"
              >
                <div className="text-[11px] uppercase tracking-wide text-zinc-400">
                  Platform
                </div>
                <div className="text-sm text-zinc-100 capitalize">
                  {socialPlatform}
                </div>

                <div className="space-y-1">
                  <label
                    className="text-[11px] uppercase tracking-wide text-zinc-400"
                    htmlFor="social-url"
                  >
                    URL
                  </label>
                  <input
                    id="social-url"
                    type="url"
                    className="w-full rounded-md border border-zinc-700 bg-black/40 p-2 text-sm text-zinc-100 focus-visible:ring-2 focus-visible:ring-yellow-500"
                    value={socialUrl}
                    onChange={(e) => setSocialUrl(e.target.value)}
                    placeholder="https://"
                  />
                </div>

                <div className="space-y-1">
                  <label
                    className="text-[11px] uppercase tracking-wide text-zinc-400"
                    htmlFor="social-username"
                  >
                    Username
                  </label>
                  <input
                    id="social-username"
                    type="text"
                    className="w-full rounded-md border border-zinc-700 bg-black/40 p-2 text-sm text-zinc-100 focus-visible:ring-2 focus-visible:ring-yellow-500"
                    value={socialUsername}
                    onChange={(e) => setSocialUsername(e.target.value)}
                    placeholder="your-handle"
                  />
                </div>

                <label className="inline-flex items-center gap-2 text-sm text-zinc-200">
                  <input
                    type="checkbox"
                    checked={socialPrimary}
                    onChange={(e) => setSocialPrimary(e.target.checked)}
                    className="h-4 w-4 rounded border-zinc-600"
                    aria-label="Mark as primary"
                  />
                  Primary link
                </label>
                {errorSocialPrimary && (
                  <p
                    className="text-xs text-red-300"
                    role="alert"
                    aria-live="polite"
                  >
                    {errorSocialPrimary}
                  </p>
                )}
              </div>
            ) : (
              fields.map((f) => (
                <div key={f.key} className="space-y-1">
                  <label
                    className="text-[11px] uppercase tracking-wide text-zinc-400"
                    htmlFor={`field-${f.key}`}
                  >
                    {f.label}
                  </label>
                  {f.key === "bio" || f.key === "responsibilities" ? (
                    <textarea
                      id={`field-${f.key}`}
                      className="w-full rounded-md border border-zinc-700 bg-black/40 p-2 text-sm text-zinc-100 focus-visible:ring-2 focus-visible:ring-yellow-500"
                      rows={5}
                      value={form[f.key] ?? ""}
                      onChange={(e) => setField(f.key, e.target.value)}
                    />
                  ) : (
                    <input
                      id={`field-${f.key}`}
                      type={f.type || "text"}
                      className="w-full rounded-md border border-zinc-700 bg-black/40 p-2 text-sm text-zinc-100 focus-visible:ring-2 focus-visible:ring-yellow-500"
                      value={form[f.key] ?? ""}
                      onChange={(e) => setField(f.key, e.target.value)}
                    />
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
