"use client";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
  targetFields,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  role: UserRole | null;
  initial: Partial<AdminProfile & AlumniProfile & StudentProfile> | null;
  onSaved: () => void;
  socialEdit?: { platform: string; current?: SocialInfo } | null;
  // optional explicit targeted fields for focused editing
  targetFields?: string[] | null;
}) {
  const [form, setForm] = useState<any>({});
  const [saving, setSaving] = useState(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);
  const [errorSocialPrimary, setErrorSocialPrimary] = useState<string | null>(
    null
  );
  const [activeSection, setActiveSection] = useState<string>("identity");
  const contentRef = useRef<HTMLDivElement | null>(null);
  const firstFieldRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);

  // Focus first input when modal opens (except social edit mode)
  useEffect(() => {
    if (open && !socialEdit) {
      const t = setTimeout(() => {
        firstFieldRef.current?.focus();
      }, 50);
      return () => clearTimeout(t);
    }
  }, [open, socialEdit, activeSection, targetFields]);

  // Small tags input component (no external libs)
  function TagsInput({
    value,
    onChange,
    max = 24,
    placeholder = "Type and press Enter",
  }: {
    value: string[];
    onChange: (v: string[]) => void;
    max?: number;
    placeholder?: string;
  }) {
    const [items, setItems] = useState<string[]>(Array.isArray(value) ? value : []);
    const [input, setInput] = useState("");
    const [dup, setDup] = useState<string | null>(null);
    useEffect(() => setItems(Array.isArray(value) ? value : []), [value]);
    const addItem = useCallback((val: string) => {
      const t = val.trim();
      if (!t) return;
      if (items.includes(t)) {
        setDup(t);
        setTimeout(() => setDup(null), 600);
        setInput("");
        return;
      }
      if (items.length >= max) return;
      const next = [...items, t];
      setItems(next);
      onChange(next);
      setInput("");
    }, [items, max, onChange]);
    const removeItem = useCallback((i: number) => {
      const next = items.slice(0, i).concat(items.slice(i + 1));
      setItems(next);
      onChange(next);
    }, [items, onChange]);
    return (
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {items.map((it, idx) => (
            <span
              key={idx}
              className={
                "group inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium transition " +
                (dup === it
                  ? "border-red-500 bg-red-500/10 animate-pulse"
                  : "border-zinc-700/60 bg-zinc-800/60 hover:border-zinc-500")
              }
            >
              <span className="select-none">{it}</span>
              <button
                type="button"
                aria-label={`Remove ${it}`}
                onClick={() => removeItem(idx)}
                className="text-zinc-400 hover:text-zinc-100"
              >
                ×
              </button>
            </span>
          ))}
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addItem(input);
              } else if (e.key === "Backspace" && !input && items.length) {
                removeItem(items.length - 1);
              }
            }}
            onBlur={() => {
              if (input) addItem(input);
            }}
            placeholder={items.length ? "" : placeholder}
            className="min-w-[8ch] flex-1 bg-transparent px-1 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none"
            aria-label="Add tag"
          />
        </div>
        <div className="flex justify-between">
          <span className="text-[10px] text-zinc-500">{items.length}/{max}</span>
          {dup && (
            <span className="text-[10px] text-red-400">Duplicate: {dup}</span>
          )}
        </div>
      </div>
    );
  }

  const Toggle = ({
    checked,
    onChange,
    label,
    id,
  }: { checked: boolean; onChange: (v: boolean) => void; label: string; id: string }) => (
    <div className="flex items-center justify-between gap-4 rounded-md border border-zinc-800 bg-zinc-900/40 px-3 py-2">
      <label htmlFor={id} className="text-sm text-zinc-200 select-none">
        {label}
      </label>
      <button
        type="button"
        id={id}
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={
          "relative inline-flex h-5 w-9 items-center rounded-full transition " +
          (checked ? "bg-yellow-500/90" : "bg-zinc-700")
        }
      >
        <span
          className={
            "inline-block h-4 w-4 transform rounded-full bg-white shadow transition " +
            (checked ? "translate-x-5" : "translate-x-1")
          }
        />
      </button>
    </div>
  );
  const [socialPlatform, setSocialPlatform] = useState<string>("");
  const [socialUsername, setSocialUsername] = useState<string>("");
  const [socialUrl, setSocialUrl] = useState<string>("");
  const [socialPrimary, setSocialPrimary] = useState<boolean>(false);
  const [savingSuccess, setSavingSuccess] = useState(false);

  useEffect(() => {
    setForm(initial || {});
  }, [initial, open]);

  // Small helper: ensure arrays are present for known array fields
  useEffect(() => {
    if (!initial) return;
    const arrFields = [
      "expertise_areas",
      "preferred_mentoring_topics",
      "career_path",
      "preferred_communication",
    ];
    const patch: any = {};
    const init = initial as any;
    arrFields.forEach((k) => {
      if (init[k] && !Array.isArray(init[k])) {
        try {
          patch[k] = JSON.parse(init[k]);
        } catch {
          patch[k] = Array.isArray(init[k]) ? init[k] : [];
        }
      } else if (!init[k]) {
        patch[k] = [];
      }
    });
    if (Object.keys(patch).length) setForm((p: any) => ({ ...patch, ...p }));
  }, [initial]);

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
      // show small success animation before closing
      setSavingSuccess(true);
      setTimeout(() => {
        setSavingSuccess(false);
        onSaved();
      }, 450);
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
  const fields: Array<{ key: string; label: string; type?: string; group?: string; spanFull?: boolean }> = useMemo(() => {
    if (role === "admin")
      return [
        { key: "display_name", label: "Display Name", group: "identity" },
        { key: "contact_email", label: "Contact Email", type: "email", group: "identity" },
        { key: "phone", label: "Phone", group: "identity" },
        { key: "title", label: "Title", group: "career" },
        { key: "department", label: "Department", group: "career" },
        { key: "responsibilities", label: "Responsibilities", group: "career", spanFull: true },
      ];
    if (role === "alumni") {
      return [
        // Identity
        { key: "first_name", label: "First Name", group: "identity" },
        { key: "last_name", label: "Last Name", group: "identity" },
        { key: "bio", label: "Bio", group: "identity", spanFull: true },
        { key: "profile_picture", label: "Profile Picture", group: "identity" },
        // Education
        { key: "degree", label: "Degree", group: "education" },
        { key: "graduation_year", label: "Graduation Year", group: "education" },
        // Career
        { key: "current_company", label: "Current Company", group: "career" },
        { key: "current_position", label: "Current Position", group: "career" },
        { key: "industry", label: "Industry", group: "career" },
        { key: "experience_years", label: "Experience Years", group: "career" },
        { key: "career_path", label: "Career Path", group: "career", spanFull: true },
        // Expertise
        { key: "expertise_areas", label: "Expertise Areas", group: "expertise", spanFull: true },
        { key: "notable_achievements", label: "Achievements", group: "expertise", spanFull: true },
        // Mentoring & Networking
        { key: "willing_to_mentor", label: "Willing To Mentor", group: "mentoring" },
        { key: "preferred_mentoring_topics", label: "Mentoring Topics", group: "mentoring", spanFull: true },
        { key: "can_provide_referrals", label: "Can Provide Referrals", group: "mentoring" },
        { key: "available_for_networking", label: "Available for Networking", group: "mentoring" },
        { key: "preferred_communication", label: "Preferred Communication", group: "mentoring", spanFull: true },
        // Verification
        { key: "verification_docs", label: "Verification Docs", group: "verification", spanFull: true },
      ];
    }
    // student
    return [
      { key: "first_name", label: "First Name", group: "identity" },
      { key: "last_name", label: "Last Name", group: "identity" },
      { key: "program", label: "Program", group: "education" },
      { key: "batch_year", label: "Batch Year", group: "education" },
      { key: "current_semester", label: "Current Semester", group: "education" },
      { key: "cgpa", label: "CGPA", group: "education" },
      { key: "bio", label: "Bio", group: "identity", spanFull: true },
    ];
  }, [role]);

  const sectionOrder = useMemo(() => {
    if (role === "alumni")
      return [
        ["identity", "Identity"],
        ["education", "Education"],
        ["career", "Career"],
        ["expertise", "Expertise"],
        ["mentoring", "Mentoring & Networking"],
        ["verification", "Verification"],
        ["social", "Social Links"],
      ] as [string, string][];
    if (role === "admin")
      return [
        ["identity", "Identity"],
        ["career", "Role"],
        ["social", "Social Links"],
      ] as [string, string][];
    return [
      ["identity", "Identity"],
      ["education", "Education"],
      ["social", "Social Links"],
    ] as [string, string][];
  }, [role]);

  // Determine targeted fields: prefer explicit prop, otherwise fall back to legacy socialEdit.platform JSON trick
  const targetedFieldKeys: string[] | null = useMemo(() => {
    if (Array.isArray(targetFields) && targetFields.length > 0)
      return targetFields;
    if (!socialEdit?.platform) return null;
    try {
      const parsed = JSON.parse(socialEdit.platform);
      if (Array.isArray(parsed)) return parsed as string[];
    } catch {
      return null;
    }
    return null;
  }, [targetFields, socialEdit]);

  // DO NOT early-return before all hooks: render gating later to preserve hook order.

  // Render field control depending on key (handles alumni specialization)
  const renderControl = (f: { key: string; type?: string; label: string }) => {
    if (role === "alumni") {
      switch (f.key) {
        case "degree": {
          const programs = [
            ["btech", "B.Tech"],
            ["bcom", "B.Com"],
            ["bba", "BBA"],
            ["bca", "BCA"],
            ["bsc", "B.Sc"],
            ["ba", "BA"],
            ["mtech", "M.Tech"],
            ["mba", "MBA"],
            ["mca", "MCA"],
            ["msc", "M.Sc"],
            ["ma", "MA"],
            ["phd", "PhD"],
          ];
          return (
            <select
              id={`field-${f.key}`}
              value={form[f.key] ?? ""}
              onChange={(e) => setField(f.key, e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-black/40 p-2 text-sm text-zinc-100 focus-visible:ring-2 focus-visible:ring-yellow-500"
            >
              <option value="">Select degree</option>
              {programs.map((p) => (
                <option key={p[0]} value={p[0]}>
                  {p[1]}
                </option>
              ))}
            </select>
          );
        }
        case "industry": {
          const industries = [
            ["technology", "Technology"],
            ["finance", "Finance"],
            ["healthcare", "Healthcare"],
            ["education", "Education"],
            ["consulting", "Consulting"],
            ["manufacturing", "Manufacturing"],
            ["retail", "Retail"],
            ["media", "Media"],
            ["automotive", "Automotive"],
            ["telecommunications", "Telecom"],
            ["government", "Government"],
            ["non_profit", "Non-Profit"],
            ["real_estate", "Real Estate"],
            ["energy", "Energy"],
            ["agriculture", "Agriculture"],
            ["other", "Other"],
          ];
          return (
            <select
              id={`field-${f.key}`}
              value={form[f.key] ?? ""}
              onChange={(e) => setField(f.key, e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-black/40 p-2 text-sm text-zinc-100 focus-visible:ring-2 focus-visible:ring-yellow-500"
            >
              <option value="">Select industry</option>
              {industries.map((p) => (
                <option key={p[0]} value={p[0]}>
                  {p[1]}
                </option>
              ))}
            </select>
          );
        }
        case "experience_years": {
          const exp = [
            ["0-1", "0-1"],
            ["1-3", "1-3"],
            ["3-5", "3-5"],
            ["5-10", "5-10"],
            ["10-15", "10-15"],
            ["15+", "15+"],
          ];
          return (
            <select
              id={`field-${f.key}`}
              value={form[f.key] ?? ""}
              onChange={(e) => setField(f.key, e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-black/40 p-2 text-sm text-zinc-100 focus-visible:ring-2 focus-visible:ring-yellow-500"
            >
              <option value="">Experience</option>
              {exp.map((p) => (
                <option key={p[0]} value={p[0]}>
                  {p[1]} years
                </option>
              ))}
            </select>
          );
        }
        case "graduation_year": {
          const years = Array.from({ length: 2031 - 1990 }, (_, i) => 1990 + i);
          return (
            <select
              id={`field-${f.key}`}
              value={form[f.key] ?? ""}
              onChange={(e) => setField(f.key, e.target.value ? Number(e.target.value) : "")}
              className="w-full rounded-md border border-zinc-700 bg-black/40 p-2 text-sm text-zinc-100 focus-visible:ring-2 focus-visible:ring-yellow-500"
            >
              <option value="">Year</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  {y}
                </option>
              ))}
            </select>
          );
        }
        case "preferred_communication": {
          const comm = [
            ["email", "Email"],
            ["linkedin", "LinkedIn"],
            ["phone", "Phone"],
            ["video_call", "Video Call"],
            ["in_person", "In Person"],
            ["whatsapp", "WhatsApp"],
          ];
          return (
            <div className="flex flex-wrap gap-2">
              {comm.map((c) => {
                const active = Array.isArray(form.preferred_communication) && form.preferred_communication.includes(c[0]);
                return (
                  <button
                    type="button"
                    key={c[0]}
                    onClick={() => {
                      const arr = Array.isArray(form.preferred_communication) ? [...form.preferred_communication] : [];
                      if (active) {
                        const i = arr.indexOf(c[0]);
                        if (i >= 0) arr.splice(i, 1);
                      } else arr.push(c[0]);
                      setField("preferred_communication", arr);
                    }}
                    className={
                      "rounded-full border px-3 py-1 text-xs font-medium transition " +
                      (active
                        ? "border-yellow-500/80 bg-yellow-500/10 text-yellow-200"
                        : "border-zinc-700 bg-zinc-800/50 text-zinc-300 hover:border-zinc-500")
                    }
                    aria-pressed={active}
                  >
                    {c[1]}
                  </button>
                );
              })}
            </div>
          );
        }
        case "expertise_areas":
        case "preferred_mentoring_topics":
        case "career_path":
          return (
            <TagsInput
              value={form[f.key] ?? []}
              onChange={(v: string[]) => setField(f.key, v)}
              max={30}
            />
          );
        case "willing_to_mentor":
        case "can_provide_referrals":
        case "available_for_networking":
          return (
            <Toggle
              id={`toggle-${f.key}`}
              label={f.label}
              checked={!!form[f.key]}
              onChange={(v) => setField(f.key, v)}
            />
          );
        case "verification_docs":
        case "profile_picture":
          return (
            <div className="text-xs text-zinc-400">
              <div className="mb-1 text-sm text-zinc-200">
                {form[f.key] ? String(form[f.key]) : "No file"}
              </div>
              File upload handled separately.
            </div>
          );
        case "bio":
        case "notable_achievements":
        case "responsibilities":
          return (
            <textarea
              id={`field-${f.key}`}
              ref={firstFieldRef as any}
              rows={6}
              value={form[f.key] ?? ""}
              onChange={(e) => setField(f.key, e.target.value)}
              className="w-full resize-y rounded-md border border-zinc-700 bg-black/40 p-3 text-sm text-zinc-100 focus-visible:ring-2 focus-visible:ring-yellow-500"
            />
          );
        default:
          return (
            <input
              id={`field-${f.key}`}
              ref={firstFieldRef as any}
              type={f.type || "text"}
              value={form[f.key] ?? ""}
              onChange={(e) => setField(f.key, e.target.value)}
              className="w-full rounded-md border border-zinc-700 bg-black/40 p-2 text-sm text-zinc-100 focus-visible:ring-2 focus-visible:ring-yellow-500"
            />
          );
      }
    }
    // Other roles generic
    if (f.key === "bio" || f.key === "responsibilities")
      return (
        <textarea
          id={`field-${f.key}`}
          ref={firstFieldRef as any}
            rows={6}
          value={form[f.key] ?? ""}
          onChange={(e) => setField(f.key, e.target.value)}
          className="w-full resize-y rounded-md border border-zinc-700 bg-black/40 p-3 text-sm text-zinc-100 focus-visible:ring-2 focus-visible:ring-yellow-500"
        />
      );
    return (
      <input
        id={`field-${f.key}`}
        ref={firstFieldRef as any}
        type={f.type || "text"}
        value={form[f.key] ?? ""}
        onChange={(e) => setField(f.key, e.target.value)}
        className="w-full rounded-md border border-zinc-700 bg-black/40 p-2 text-sm text-zinc-100 focus-visible:ring-2 focus-visible:ring-yellow-500"
      />
    );
  };

  const visibleFields = useMemo(() => {
    if (socialEdit) return [];
    if (targetedFieldKeys && targetedFieldKeys.length) {
      return targetedFieldKeys
        .map((k) => fields.find((f) => f.key === k) || { key: k, label: k }) as any[];
    }
    // Filter by active section (except social which is handled separately)
    if (activeSection === "social") return [];
    return fields.filter((f) => f.group === activeSection);
  }, [socialEdit, targetedFieldKeys, fields, activeSection]);

  const showSidebar = !socialEdit && !targetedFieldKeys;
  const [animateIn, setAnimateIn] = useState(false);
  useEffect(() => {
    if (open) {
      // next frame to allow initial styles to apply
      const id = requestAnimationFrame(() => setAnimateIn(true));
      return () => cancelAnimationFrame(id);
    } else {
      setAnimateIn(false);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title">
      <div
        className={
          "absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 " +
          (animateIn ? "opacity-100" : "opacity-0")
        }
        onClick={() => onOpenChange(false)}
        aria-label="Close modal"
      />
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          className={
            "flex h-[85vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-950/90 via-zinc-950/80 to-zinc-900/70 shadow-2xl transform-gpu transition-all duration-300 ease-out " +
            (animateIn
              ? "opacity-100 scale-100 translate-y-0"
              : "opacity-0 scale-[0.97] translate-y-4")
          }
        >
          {/* Header */}
          <div className="sticky top-0 z-10 flex items-center justify-between border-b border-zinc-800/80 bg-zinc-950/70 px-6 py-4 backdrop-blur">
            <div className="flex min-w-0 items-center gap-3" id="profile-edit-title">
              <div className="text-sm font-semibold text-zinc-200">{socialEdit ? "Edit Social" : "Edit Profile"}</div>
              <div className="truncate text-xs text-zinc-500">
                {socialEdit
                  ? socialPlatform
                  : targetedFieldKeys && targetedFieldKeys.length
                  ? `Focused (${targetedFieldKeys.length})`
                  : role || "profile"}
              </div>
              {savingSuccess && <div className="ml-2 text-xs text-green-300">Saved ✓</div>}
            </div>
            {/* Actions removed here to avoid duplicate with footer */}
          </div>
          {errorBanner && (
            <div className="mx-4 mt-3 rounded-md border border-red-900/60 bg-red-900/20 px-3 py-2 text-xs text-red-200" role="alert">
              {errorBanner}
            </div>
          )}
          {/* Body */}
          <div className="flex min-h-0 flex-1 overflow-hidden">
            {showSidebar && (
              <nav className="hidden w-52 flex-none border-r border-zinc-800/60 bg-zinc-950/40 p-4 md:flex md:flex-col gap-1 overflow-y-auto" aria-label="Profile sections">
                {sectionOrder.map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setActiveSection(id)}
                    className={
                      "group flex w-full items-center justify-between rounded-md px-3 py-2 text-left text-xs font-medium tracking-wide transition " +
                      (activeSection === id
                        ? "bg-zinc-800/70 text-zinc-100 ring-1 ring-yellow-500/40"
                        : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-100")
                    }
                    aria-current={activeSection === id ? "page" : undefined}
                  >
                    <span className="truncate">{label}</span>
                  </button>
                ))}
              </nav>
            )}
            <div ref={contentRef} className="relative flex-1 overflow-y-auto px-6 pb-32 pt-6">
              {socialEdit ? (
                <div className="mx-auto max-w-xl space-y-4" aria-label="Edit social link section">
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-medium capitalize text-zinc-200">{socialPlatform}</div>
                    {errorSocialPrimary && (
                      <span className="text-xs text-red-400" role="alert">
                        {errorSocialPrimary}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="social-url" className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
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
                    <label htmlFor="social-username" className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
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
                  <Toggle
                    id="primary-social"
                    label="Primary Link"
                    checked={socialPrimary}
                    onChange={(v) => setSocialPrimary(v)}
                  />
                </div>
              ) : targetedFieldKeys && targetedFieldKeys.length ? (
                <div className="mx-auto max-w-2xl">
                  <div className="mb-6 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    Focused Edit
                  </div>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {visibleFields.map((f: any, i: number) => (
                      console.log("Rendering field:", i),
                      <div
                        key={f.key}
                        className={"flex flex-col gap-1 " + (f.spanFull ? "sm:col-span-2" : "")}
                      >
                        <label htmlFor={`field-${f.key}`} className="text-[11px] font-medium uppercase tracking-wide text-zinc-400">
                          {f.label}
                        </label>
                        {renderControl(f)}
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeSection === "social" ? (
                <div className="mx-auto max-w-lg text-sm text-zinc-400">
                  Social links are edited from the profile view. Select a link to edit.
                </div>
              ) : (
                <div className="mx-auto max-w-5xl space-y-10">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {visibleFields.map((f, i) => (
                      console.log("Rendering field:", i),
                      <div
                        key={f.key}
                        className={
                          "flex flex-col gap-1 " +
                          (f.spanFull ? "sm:col-span-2" : "")
                        }
                      >
                        <label
                          htmlFor={`field-${f.key}`}
                          className="text-[11px] font-medium uppercase tracking-wide text-zinc-400"
                        >
                          {f.label}
                        </label>
                        {renderControl(f)}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          {/* Footer */}
          <div className="pointer-events-none sticky bottom-0 z-10 mt-auto w-full bg-gradient-to-t from-zinc-950/95 via-zinc-950/60 to-transparent p-4">
            <div className="pointer-events-auto mx-auto flex max-w-5xl justify-end gap-2">
              <Button variant="outline" size="sm" onClick={() => onOpenChange(false)} disabled={saving}>
                Cancel
              </Button>
              <Button size="sm" onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
          {saving && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
              <div className="rounded-md border border-zinc-700 bg-zinc-900/80 px-4 py-3 text-sm text-zinc-300 shadow-lg">
                Saving…
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
