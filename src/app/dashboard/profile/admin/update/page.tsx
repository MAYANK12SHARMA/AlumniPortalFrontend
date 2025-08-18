"use client";
import { useEffect, useRef, useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api";
import Link from "next/link";
import { Camera, RefreshCw, Save, X as CloseIcon } from "lucide-react";
import toast from "react-hot-toast";

type AdminProfile = {
  display_name?: string;
  avatar?: any;
  contact_email?: string | null;
  phone?: string;
  title?: string;
  department?: string;
  responsibilities?: string;
  is_active?: boolean;
};

const TITLE_CHOICES = [
  ["", "Select Title"],
  ["portal_admin", "Portal Administrator"],
  ["super_admin", "Super Administrator"],
  ["alumni_coordinator", "Alumni Coordinator"],
  ["student_coordinator", "Student Coordinator"],
  ["placement_officer", "Placement Officer"],
  ["academic_coordinator", "Academic Coordinator"],
  ["hr_manager", "HR Manager"],
  ["it_support", "IT Support"],
  ["other", "Other"],
] as const;

function field(v: any) {
  return v ?? "";
}

export default function AdminProfileUpdatePage() {
  const [initial, setInitial] = useState<AdminProfile | null>(null);
  const [form, setForm] = useState<AdminProfile>({});
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);

  function normalizeMedia(input: any): { url: string | null } {
    if (!input) return { url: null };
    if (typeof input === "string") return { url: input };
    return { url: input?.url || input?.path || null };
  }

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiClient.get("/admin/profile/");
      const data = (res as any).data || (res as any) || {};
      setInitial(data);
      setForm({
        display_name: data.display_name || "",
        contact_email: data.contact_email || "",
        phone: data.phone || "",
        title: data.title || "",
        department: data.department || "",
        responsibilities: data.responsibilities || "",
        is_active: !!data.is_active,
      });
      const av = normalizeMedia(data.avatar);
      setAvatarPreview(av.url);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Failed to load profile");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  function onChange<K extends keyof AdminProfile>(key: K, value: AdminProfile[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  function onPickAvatar() {
    fileRef.current?.click();
  }

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setAvatarPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  async function onSave() {
    setSaving(true);
    setError(null);
    try {
      // If avatar file selected, use multipart/form-data with PATCH
      const file = fileRef.current?.files?.[0] || null;
      if (file) {
        const fd = new FormData();
        fd.append("display_name", field(form.display_name));
        fd.append("contact_email", field(form.contact_email));
        fd.append("phone", field(form.phone));
        fd.append("title", field(form.title));
        fd.append("department", field(form.department));
        fd.append("responsibilities", field(form.responsibilities));
        fd.append("is_active", String(!!form.is_active));
        fd.append("avatar", file);
        await apiClient.patch("/admin/profile/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        } as any);
      } else {
        await apiClient.patch("/admin/profile/", {
          display_name: form.display_name,
          contact_email: form.contact_email,
          phone: form.phone,
          title: form.title,
          department: form.department,
          responsibilities: form.responsibilities,
          is_active: !!form.is_active,
        });
      }
      toast.success("Profile updated");
    } catch (e: any) {
      const msg = e?.response?.data?.error || e?.message || "Failed to update";
      toast.error(msg);
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  const avatar = normalizeMedia(initial?.avatar);

  return (
    <ProtectedRoute requireAuth allowedRoles={["admin"]}>
      <div className="space-y-4">
        {/* Breadcrumb */}
        <div className="text-xs text-zinc-400">
          <span className="text-zinc-500">dashboard</span>
          <span className="mx-2">›</span>
          <span className="text-zinc-300">dashboard/profile/admin/update</span>
        </div>

        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-3">Edit Admin Profile</CardTitle>
            <div className="flex items-center gap-2">
              <Link href="/dashboard/profile/admin/view">
                <Button variant="outline" size="sm">Back to Profile</Button>
              </Link>
              <Button variant="outline" size="sm" onClick={() => load()} disabled={loading} title="Refresh">
                <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-3 text-sm text-red-400 border border-red-900/40 bg-red-900/10 rounded-lg p-3">{error}</div>
            )}

            {!initial ? (
              <div className="p-6 text-center text-zinc-400">{loading ? "Loading profile…" : "No profile"}</div>
            ) : (
              <div className="space-y-6">
                {/* Avatar picker */}
                <div className="flex items-center gap-4">
                  <div className="h-20 w-20 rounded-full overflow-hidden border border-zinc-800 bg-zinc-900 flex items-center justify-center">
                    {avatarPreview ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatarPreview} alt="avatar" className="h-full w-full object-cover" />
                    ) : avatar.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={avatar.url} alt="avatar" className="h-full w-full object-cover" />
                    ) : (
                      <span className="text-xs text-zinc-400">No avatar</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onFileSelected} />
                    <Button onClick={onPickAvatar} variant="outline" size="sm">
                      <Camera size={16} className="mr-1" /> Change Avatar
                    </Button>
                    {avatarPreview && (
                      <Button variant="ghost" size="sm" onClick={() => { setAvatarPreview(null); if (fileRef.current) fileRef.current.value = ""; }}>
                        <CloseIcon size={16} className="mr-1" /> Reset
                      </Button>
                    )}
                  </div>
                </div>

                {/* Form */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Display Name</label>
                    <input
                      className="w-full rounded-md border border-zinc-800 bg-black/40 p-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-yellow-400/40"
                      value={form.display_name || ""}
                      onChange={(e) => onChange("display_name", e.target.value)}
                      placeholder="Your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Contact Email</label>
                    <input
                      type="email"
                      className="w-full rounded-md border border-zinc-800 bg-black/40 p-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-yellow-400/40"
                      value={form.contact_email || ""}
                      onChange={(e) => onChange("contact_email", e.target.value)}
                      placeholder="email@example.com"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Phone</label>
                    <input
                      className="w-full rounded-md border border-zinc-800 bg-black/40 p-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-yellow-400/40"
                      value={form.phone || ""}
                      onChange={(e) => onChange("phone", e.target.value)}
                      placeholder="+1 555 0100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Department</label>
                    <input
                      className="w-full rounded-md border border-zinc-800 bg-black/40 p-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-yellow-400/40"
                      value={form.department || ""}
                      onChange={(e) => onChange("department", e.target.value)}
                      placeholder="Department"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-400 mb-1">Title</label>
                    <select
                      className="w-full rounded-md border border-zinc-800 bg-black/40 p-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-yellow-400/40"
                      value={form.title || ""}
                      onChange={(e) => onChange("title", e.target.value)}
                    >
                      {TITLE_CHOICES.map(([value, label]) => (
                        <option key={value} value={value} className="bg-black">{label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-xs text-zinc-400 mb-1">Responsibilities</label>
                    <textarea
                      rows={4}
                      className="w-full rounded-md border border-zinc-800 bg-black/40 p-2 text-sm text-zinc-100 outline-none focus:ring-2 focus:ring-yellow-400/40"
                      value={form.responsibilities || ""}
                      onChange={(e) => onChange("responsibilities", e.target.value)}
                      placeholder="Short note of responsibilities"
                    />
                  </div>
                  <div>
                    <label className="inline-flex items-center gap-2 text-xs text-zinc-400">
                      <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-zinc-700 bg-black"
                        checked={!!form.is_active}
                        onChange={(e) => onChange("is_active", e.target.checked)}
                      />
                      Active
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <Button onClick={onSave} disabled={saving}>
                    <Save size={16} className="mr-1" /> {saving ? "Saving…" : "Save Changes"}
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
