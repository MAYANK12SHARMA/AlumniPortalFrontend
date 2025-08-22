"use client";
import React, { useCallback, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { StudentProfile } from "@/types";
import { studentProfileApi } from "@/lib/api/profile";
import { normalizeMediaUrl } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, Loader2, Edit3, Wand2, Sparkles } from "lucide-react";
import { SocialLinksGrid } from "@/components/profile/view/SocialLinksGrid";
import { ProfileEditModal } from "@/components/profile/view/ProfileEditModal";
import { SocialInfo } from "@/components/profile/view/SocialLinksGrid";

type SectionId =
  | "identity"
  | "ai"
  | "academics"
  | "skills"
  | "career"
  | "experience"
  | "credentials"
  | "contact"
  | "meta";

interface StudentProfileDashboardViewProps {
  profile: StudentProfile;
  onUpdated?: (p: StudentProfile) => void;
}

interface FieldConfig {
  key: keyof StudentProfile | string;
  label: string;
  type?: "text" | "textarea" | "array" | "boolean" | "number" | "date";
  placeholder?: string;
  dependsOnTrue?: string; // only show if boolean field true
}

interface SectionConfig {
  id: SectionId;
  title: string;
  description?: string;
  accent?: string;
  editable: boolean;
  fields: FieldConfig[]; // used for editing form
}

const SECTIONS: SectionConfig[] = [
  {
    id: "academics",
    title: "Academic Profile",
    description: "Program details & achievements",
    accent: "from-emerald-400/20 to-emerald-600/10",
    editable: true,
    fields: [
      { key: "program", label: "Program", type: "text" },
      { key: "batch_year", label: "Batch Year", type: "number" },
      { key: "current_semester", label: "Current Semester", type: "number" },
      {
        key: "expected_graduation",
        label: "Expected Graduation",
        type: "date",
      },
      { key: "cgpa", label: "CGPA", type: "number" },
      {
        key: "major_coursework",
        label: "Major Coursework (comma separated)",
        type: "array",
      },
      {
        key: "academic_achievements",
        label: "Academic Achievements",
        type: "textarea",
      },
    ],
  },
  {
    id: "skills",
    title: "Skills & Interests",
    description: "Technical & soft skills",
    accent: "from-indigo-400/20 to-indigo-600/10",
    editable: true,
    fields: [
      { key: "technical_skills", label: "Technical Skills", type: "array" },
      { key: "soft_skills", label: "Soft Skills", type: "array" },
      { key: "interests", label: "Interests", type: "array" },
    ],
  },
  {
    id: "career",
    title: "Career Preferences",
    description: "Goals & preferred roles",
    accent: "from-amber-400/20 to-amber-600/10",
    editable: true,
    fields: [
      { key: "career_goals", label: "Career Goals", type: "textarea" },
      {
        key: "preferred_job_types",
        label: "Preferred Job Types",
        type: "array",
      },
      {
        key: "preferred_locations",
        label: "Preferred Locations",
        type: "array",
      },
    ],
  },
  {
    id: "experience",
    title: "Experience",
    description: "Internships & practical work",
    accent: "from-pink-400/20 to-pink-600/10",
    editable: true,
    fields: [
      {
        key: "has_internship_experience",
        label: "Has Internship Experience",
        type: "boolean",
      },
      {
        key: "internship_details",
        label: "Internship Details",
        type: "textarea",
        dependsOnTrue: "has_internship_experience",
      },
    ],
  },
  {
    id: "credentials",
    title: "Credentials & Activities",
    description: "Certifications & extracurriculars",
    accent: "from-cyan-400/20 to-cyan-600/10",
    editable: true,
    fields: [
      { key: "certifications", label: "Certifications", type: "array" },
      {
        key: "extracurricular_activities",
        label: "Extracurricular Activities",
        type: "textarea",
      },
    ],
  },
  {
    id: "contact",
    title: "Contact & Location",
    description: "How people can reach you",
    accent: "from-rose-400/20 to-rose-600/10",
    editable: true,
    fields: [
      { key: "phone", label: "Phone", type: "text" },
      { key: "location", label: "Location", type: "text" },
      { key: "bio", label: "Short Bio", type: "textarea" },
    ],
  },
];

function formatDate(d?: string | null) {
  if (!d) return "-";
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}

const fadeIn = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0 },
};

export const StudentProfileDashboardView: React.FC<
  StudentProfileDashboardViewProps
> = ({ profile, onUpdated }) => {
  const [editing, setEditing] = useState<SectionConfig | null>(null);
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<SectionId | null>(null);
  const [socialEdit, setSocialEdit] = useState<{
    platform: string;
    current?: SocialInfo;
  } | null>(null);
  const [showSummaryPrompt, setShowSummaryPrompt] = useState(false);
  const [summaryPrompt, setSummaryPrompt] = useState("");
  const [generatingSummary, setGeneratingSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  // Removed socialSaving state (was unused beyond set calls)

  const avatarUrl = normalizeMediaUrl(profile.profile_picture);
  const fullName =
    `${profile.first_name || ""} ${profile.last_name || ""}`.trim() ||
    "Student";

  // Removed explicit CGPA radial gauge per request; still show value textually in academics section

  const openEdit = useCallback(
    (section: SectionConfig) => {
      const initial: Record<string, any> = {};
      section.fields.forEach((f) => {
        const raw = (profile as any)[f.key];
        if (Array.isArray(raw)) initial[f.key] = raw.join(", ");
        else if (f.type === "boolean") initial[f.key] = Boolean(raw);
        else initial[f.key] = raw ?? "";
      });
      setFormState(initial);
      setEditing(section);
      setError(null);
    },
    [profile]
  );

  const updateField = (k: string, v: any) =>
    setFormState((s) => ({ ...s, [k]: v }));

  const submit = async () => {
    if (!editing) return;
    setSubmitting(true);
    setError(null);
    try {
      const patch: Record<string, any> = {};
      editing.fields.forEach((f) => {
        let val = formState[f.key];
        if (f.type === "array") {
          if (typeof val === "string") {
            val = val
              .split(",")
              .map((s: string) => s.trim())
              .filter(Boolean);
          }
        }
        if (f.type === "number") {
          const num = Number(val);
          if (!isNaN(num)) val = num;
          else if (val === "") val = null;
        }
        if (f.type === "date") {
          if (!val) val = null;
          else val = String(val).slice(0, 10);
        }
        if (f.dependsOnTrue) {
          // if controlling boolean false, skip
          if (!formState[f.dependsOnTrue]) return;
        }
        patch[f.key] = val;
      });
      const updated = await studentProfileApi.update(patch as any);
      onUpdated?.(updated);
      setEditing(null);
    } catch (e: any) {
      setError(e?.response?.data?.error || e?.message || "Update failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="relative space-y-10">
      {/* Hero Section */}
      <motion.section
        initial={{ opacity: 0, y: 28, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
        className="relative overflow-hidden rounded-3xl border border-zinc-800/60 bg-gradient-to-br from-zinc-950 via-zinc-900/70 to-zinc-950 backdrop-blur-xl p-8 shadow-[0_0_0_1px_rgba(255,255,255,0.04)]"
      >
        {/* animated ambient layers */}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute -inset-20 opacity-60"
          initial={{ rotate: 15 }}
          animate={{ rotate: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_30%,rgba(250,204,21,0.08),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.04),transparent_55%)]" />
        </motion.div>
        <div className="flex flex-col md:flex-row md:items-start gap-10 relative">
          <div className="relative h-40 w-40 shrink-0">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-yellow-400/20 via-yellow-500/10 to-transparent blur-2xl" />
            <div className="relative h-full w-full rounded-2xl ring-1 ring-zinc-700/60 overflow-hidden bg-zinc-900 flex items-center justify-center text-4xl font-semibold text-yellow-200">
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={fullName}
                  fill
                  className="object-cover"
                  sizes="160px"
                />
              ) : (
                fullName.charAt(0).toUpperCase()
              )}
            </div>
          </div>
          <div className="flex-1 space-y-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-100">
                {fullName}
              </h1>
              <div className="mt-3 flex flex-wrap gap-3 text-sm">
                {profile.program && (
                  <Badge variant="secondary" className="capitalize">
                    {profile.program}
                  </Badge>
                )}
                {profile.batch_year && (
                  <Badge variant="outline">Batch {profile.batch_year}</Badge>
                )}
                {profile.current_semester && (
                  <Badge variant="outline">
                    Sem {profile.current_semester}
                  </Badge>
                )}
                {profile.expected_graduation && (
                  <Badge variant="success">
                    Grad {formatDate(profile.expected_graduation)}
                  </Badge>
                )}
              </div>
            </div>
            {/* AI Summary */}
            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.15,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.995 }}
              className="relative group rounded-xl border border-yellow-400/30 bg-gradient-to-br from-yellow-500/15 via-yellow-500/5 to-yellow-300/0 p-[1px]"
            >
              <div className="relative rounded-[0.9rem] bg-zinc-950/90 p-5">
                <div className="flex items-start justify-between gap-4">
                  <h2 className="text-[11px] uppercase tracking-widest text-yellow-300 font-medium flex items-center gap-2">
                    <span className="inline-block h-2 w-2 rounded-full bg-yellow-400 animate-pulse" />
                    AI Profile Summary
                  </h2>
                  <button
                    onClick={() => {
                      setSummaryPrompt("");
                      setSummaryError(null);
                      setShowSummaryPrompt(true);
                    }}
                    className="text-[10px] px-2 py-1 rounded-md border border-yellow-500/30 text-yellow-300 hover:bg-yellow-400/10 transition-colors inline-flex items-center gap-1"
                  >
                    <Wand2 className="h-3.5 w-3.5" /> Regenerate
                  </button>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-yellow-100/90 whitespace-pre-wrap">
                  {profile.profile_summary_ai?.trim() || (
                    <span className="text-yellow-200/50">
                      No AI summary yet.
                    </span>
                  )}
                </p>
                {profile.ai_summary_last_updated && (
                  <div className="mt-3 text-[10px] tracking-wide text-yellow-300/60">
                    Updated {formatDate(profile.ai_summary_last_updated)}
                  </div>
                )}
                <motion.div
                  aria-hidden
                  className="absolute -inset-px rounded-[0.9rem] pointer-events-none"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.35 }}
                  transition={{ delay: 0.8 }}
                  style={{
                    background:
                      "radial-gradient(circle at 30% 20%,rgba(250,204,21,0.15),transparent 60%)",
                  }}
                />
              </div>
            </motion.div>

            {/* Social Links */}
            <motion.div
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: 0.25,
                duration: 0.55,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              <SocialLinksGrid
                links={(profile as any).social_links || {}}
                onEdit={(platform, current) => {
                  // open inline social edit modal (reusing shared ProfileEditModal)
                  setEditing(null); // ensure section edit modal closed
                  setSocialEdit({ platform, current });
                }}
              />
            </motion.div>
          </div>
          {/* Decorative side gradient bar */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{
              delay: 0.35,
              duration: 0.65,
              ease: [0.16, 1, 0.3, 1],
            }}
            className="hidden md:block w-2 rounded-full bg-gradient-to-b from-yellow-500/50 via-yellow-400/20 to-transparent self-stretch mt-2"
          />
        </div>
      </motion.section>

      {/* Grid sections */}
      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
        {SECTIONS.map((section, i) => {
          const values: Record<string, any> = {};
          section.fields.forEach(
            (f) => (values[f.key] = (profile as any)[f.key])
          );
          const expanded = expandedId === section.id;

          // derive condensed preview content
          const previewItems: React.ReactNode[] = [];
          for (const f of section.fields) {
            const raw = values[f.key];
            if (Array.isArray(raw) && raw.length) {
              previewItems.push(
                <div
                  key={String(f.key)}
                  className="flex flex-wrap gap-1 max-h-9 overflow-hidden"
                >
                  {raw.slice(0, 4).map((r: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-2 py-0.5 rounded-md bg-zinc-800/70 text-[10px] tracking-wide text-zinc-300 border border-zinc-700/40"
                    >
                      {r}
                    </span>
                  ))}
                  {raw.length > 4 && (
                    <span className="text-[10px] text-zinc-500 px-1">
                      +{raw.length - 4}
                    </span>
                  )}
                </div>
              );
            } else if (typeof raw === "string" && raw.trim()) {
              previewItems.push(
                <p
                  key={String(f.key)}
                  className="text-xs text-zinc-400 line-clamp-2 leading-snug"
                >
                  {raw.slice(0, 120)}
                  {raw.length > 120 ? "…" : ""}
                </p>
              );
            }
            if (previewItems.length >= 2) break;
          }

          return (
            <ProfileExpandableCard
              key={section.id}
              section={section}
              values={values}
              index={i}
              expanded={expanded}
              preview={previewItems}
              onToggle={() => setExpandedId(expanded ? null : section.id)}
              onEdit={() => openEdit(section)}
            />
          );
        })}
      </div>

      {/* Shared social links edit modal (reuses cross-role modal) */}
      <ProfileEditModal
        open={!!socialEdit}
        onOpenChange={(v) => {
          if (!v) setSocialEdit(null);
        }}
        role="student"
        initial={profile as any}
        socialEdit={socialEdit}
        onSaved={async () => {
          const fresh = await studentProfileApi.get();
          onUpdated?.(fresh);
          setSocialEdit(null);
        }}
        targetFields={null}
      />

      {/* AI Summary Prompt Modal */}
      {showSummaryPrompt && (
        <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => !generatingSummary && setShowSummaryPrompt(false)}
          />
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <div className="w-full max-w-lg rounded-2xl border border-yellow-500/30 bg-zinc-950/90 shadow-xl overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3 border-b border-yellow-500/20 bg-gradient-to-r from-yellow-500/10 to-transparent">
                <div className="flex items-center gap-2 text-sm font-semibold text-yellow-200">
                  <Sparkles className="h-4 w-4" /> Customize AI Summary
                </div>
                <button
                  onClick={() =>
                    !generatingSummary && setShowSummaryPrompt(false)
                  }
                  className="text-zinc-400 hover:text-zinc-100"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-xs text-zinc-400 leading-relaxed">
                  Enter an optional prompt highlighting aspects you want
                  emphasized (e.g. focus on research projects, leadership roles,
                  or specific technologies). The AI will regenerate your summary
                  incorporating this context.
                </p>
                {summaryError && (
                  <div className="rounded-md border border-red-800/60 bg-red-900/30 px-3 py-2 text-xs text-red-200">
                    {summaryError}
                  </div>
                )}
                <div className="space-y-1">
                  <label className="text-[11px] uppercase tracking-wide text-zinc-500 font-medium">
                    Additional Prompt
                  </label>
                  <textarea
                    rows={5}
                    value={summaryPrompt}
                    onChange={(e) => setSummaryPrompt(e.target.value)}
                    placeholder="e.g. Highlight my machine learning internship and open-source contributions"
                    className="w-full rounded-md border border-yellow-500/30 bg-black/40 p-3 text-sm text-yellow-100 placeholder:text-zinc-600 focus-visible:ring-2 focus-visible:ring-yellow-500"
                  />
                </div>
              </div>
              <div className="px-5 pb-5 flex justify-end gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={generatingSummary}
                  onClick={() => setShowSummaryPrompt(false)}
                >
                  Cancel
                </Button>
                <Button
                  size="sm"
                  disabled={generatingSummary || !summaryPrompt.trim()}
                  onClick={async () => {
                    setGeneratingSummary(true);
                    setSummaryError(null);
                    try {
                      const res = await studentProfileApi.generateSummary(
                        summaryPrompt.trim()
                      );
                      if (!res.success) {
                        setSummaryError(
                          res.message || "Failed to generate summary"
                        );
                      } else {
                        // refresh profile to pick up new summary
                        const fresh = await studentProfileApi.get();
                        onUpdated?.(fresh);
                        setShowSummaryPrompt(false);
                      }
                    } catch (e: any) {
                      setSummaryError(
                        e?.response?.data?.message ||
                          e?.message ||
                          "Error generating summary"
                      );
                    } finally {
                      setGeneratingSummary(false);
                    }
                  }}
                  className="inline-flex items-center gap-2"
                >
                  {generatingSummary && (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  )}
                  Generate
                </Button>
              </div>
              {generatingSummary && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm">
                  <div className="flex items-center gap-2 rounded-md border border-yellow-500/30 bg-zinc-900/80 px-4 py-2 text-xs text-yellow-200">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating summary…
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metadata footer */}
      <div className="text-[10px] tracking-wide text-zinc-500 text-right space-y-1">
        <div>Profile Created: {formatDate(profile.created_at)}</div>
        <div>Last Updated: {formatDate(profile.updated_at)}</div>
      </div>

      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            aria-modal
            role="dialog"
          >
            <motion.div
              initial={{ opacity: 0, y: 40, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="relative w-full max-w-xl rounded-2xl border border-zinc-800 bg-zinc-950/90 p-6 shadow-xl"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold tracking-wide text-zinc-100 flex items-center gap-2">
                    <Edit3 className="h-4 w-4 text-yellow-300" /> Edit{" "}
                    {editing.title}
                  </h2>
                  {editing.description && (
                    <p className="mt-1 text-[11px] text-zinc-500">
                      {editing.description}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setEditing(null)}
                  className="p-2 rounded-lg hover:bg-zinc-800/80 text-zinc-400 hover:text-zinc-200 transition-colors"
                  aria-label="Close edit dialog"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              {error && (
                <div className="mb-3 text-xs text-red-400 border border-red-900/40 bg-red-900/10 rounded-md p-2">
                  {error}
                </div>
              )}
              <div className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
                {editing.fields.map((f) => {
                  if (f.dependsOnTrue && !formState[f.dependsOnTrue])
                    return null;
                  const val = formState[f.key];
                  return (
                    <div key={f.key} className="space-y-1">
                      <label className="text-[11px] uppercase tracking-wide text-zinc-400 block">
                        {f.label}
                      </label>
                      {f.type === "textarea" ? (
                        <textarea
                          value={val || ""}
                          onChange={(e) => updateField(f.key, e.target.value)}
                          rows={4}
                          className="w-full resize-none rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40"
                        />
                      ) : f.type === "boolean" ? (
                        <div className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={!!val}
                            onChange={(e) =>
                              updateField(f.key, e.target.checked)
                            }
                            className="h-4 w-4 accent-yellow-400"
                          />
                          <span className="text-zinc-300">
                            {val ? "Yes" : "No"}
                          </span>
                        </div>
                      ) : f.type === "number" ? (
                        <input
                          type="number"
                          value={val ?? ""}
                          onChange={(e) => updateField(f.key, e.target.value)}
                          className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40"
                        />
                      ) : f.type === "date" ? (
                        <input
                          type="date"
                          value={val ? String(val).slice(0, 10) : ""}
                          onChange={(e) => updateField(f.key, e.target.value)}
                          className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40"
                        />
                      ) : (
                        <input
                          type="text"
                          value={val || ""}
                          onChange={(e) => updateField(f.key, e.target.value)}
                          className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-yellow-400/40 focus:border-yellow-400/40"
                        />
                      )}
                      {f.type === "array" && (
                        <p className="text-[10px] text-zinc-500">
                          Comma separated values
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
              <div className="mt-6 flex items-center justify-end gap-3">
                <Button
                  variant="outline"
                  type="button"
                  disabled={submitting}
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  type="button"
                  disabled={submitting}
                  onClick={submit}
                  className="min-w-[120px] justify-center"
                >
                  {submitting ? (
                    <span className="flex items-center gap-2 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving…
                    </span>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default StudentProfileDashboardView;

/* ------------------ Internal Expandable Card Component ------------------ */
interface ProfileExpandableCardProps {
  section: SectionConfig;
  values: Record<string, any>;
  expanded: boolean;
  preview: React.ReactNode[];
  index: number;
  onToggle: () => void;
  onEdit: () => void;
}

const ProfileExpandableCard: React.FC<ProfileExpandableCardProps> = ({
  section,
  values,
  expanded,
  preview,
  index,
  onToggle,
  onEdit,
}) => {
  const [tilt, setTilt] = useState<{ rx: number; ry: number }>({
    rx: 0,
    ry: 0,
  });

  const handleMove = (e: React.MouseEvent) => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const rx = (y / rect.height - 0.5) * -8; // tilt range
    const ry = (x / rect.width - 0.5) * 8;
    setTilt({ rx, ry });
  };
  const resetTilt = () => setTilt({ rx: 0, ry: 0 });

  return (
    <motion.article
      variants={fadeIn}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, amount: 0.3 }}
      transition={{
        duration: 0.55,
        ease: [0.16, 1, 0.3, 1],
        delay: index * 0.07,
      }}
      onMouseMove={handleMove}
      onMouseLeave={resetTilt}
      onClick={onToggle}
      aria-expanded={expanded}
      className="group relative cursor-pointer select-none rounded-2xl border border-zinc-800/70 bg-gradient-to-br from-zinc-950 via-zinc-900/70 to-zinc-950 p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.04)] focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40"
      style={{
        transform: `perspective(900px) rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
        transition: expanded
          ? "transform 0.6s cubic-bezier(0.16,1,0.3,1)"
          : "transform 0.3s ease",
      }}
    >
      {/* Glow layer */}
      <div
        className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br ${section.accent} pointer-events-none`}
      />
      <motion.div
        layout
        className={`relative h-full rounded-[1rem] flex flex-col border border-zinc-800/50 bg-zinc-950/80 backdrop-blur-sm overflow-hidden ${
          expanded
            ? "shadow-[0_8px_32px_-8px_rgba(250,204,21,0.25)]"
            : "group-hover:shadow-[0_4px_24px_-8px_rgba(250,204,21,0.15)]"
        }`}
        transition={{ layout: { duration: 0.55, ease: [0.16, 1, 0.3, 1] } }}
      >
        <div className="p-5 pb-4 flex items-start justify-between gap-4">
          <div>
            <motion.h3
              layout
              className="text-sm font-semibold tracking-wide text-zinc-100 flex items-center gap-2"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-zinc-500 group-hover:bg-yellow-400 transition-colors" />
              {section.title}
            </motion.h3>
            {section.description && (
              <motion.p
                layout
                className="mt-1 text-[11px] text-zinc-500"
                initial={false}
                animate={{ opacity: expanded ? 1 : 0.85 }}
              >
                {section.description}
              </motion.p>
            )}
          </div>
          <div className="flex gap-2 shrink-0">
            {section.editable && (
              <Button
                size="sm"
                variant="outline"
                className="h-7 px-2 text-[11px] gap-1"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit();
                }}
              >
                <Edit3 className="h-3.5 w-3.5" /> Edit
              </Button>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-[11px] text-zinc-400 hover:text-yellow-300"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              {expanded ? "Close" : "Open"}
            </Button>
          </div>
        </div>
        {/* Preview (collapsed) */}
        {!expanded && preview.length > 0 && (
          <div className="px-5 pb-4 space-y-2">
            {preview.map((p, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * idx }}
              >
                {p}
              </motion.div>
            ))}
            <div className="h-1 rounded-full bg-gradient-to-r from-yellow-400/0 via-yellow-400/40 to-yellow-400/0 opacity-30 group-hover:opacity-60 transition-opacity" />
          </div>
        )}
        {/* Expanded Content */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              key="expanded"
              initial="collapsed"
              animate="open"
              exit="collapsed"
              variants={{
                open: { opacity: 1, height: "auto" },
                collapsed: { opacity: 0, height: 0 },
              }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="px-5 pb-6"
            >
              <div className="space-y-4 text-sm">
                {section.fields.map((f, idx) => {
                  const raw = values[f.key];
                  return (
                    <motion.div
                      key={String(f.key)}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 * idx }}
                      className="space-y-1"
                    >
                      <div className="text-[10px] uppercase tracking-wide text-zinc-500 flex items-center gap-2">
                        {f.label}
                        <span className="h-px flex-1 bg-zinc-800/60" />
                      </div>
                      {Array.isArray(raw) ? (
                        raw.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {raw.map((r: string, k) => (
                              <span
                                key={k}
                                className="px-2 py-0.5 rounded-md bg-zinc-800/70 text-[11px] tracking-wide text-zinc-200 border border-zinc-700/50 hover:border-yellow-400/40 hover:text-yellow-200 transition-colors"
                              >
                                {r}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-zinc-600 text-xs">
                            — None —
                          </span>
                        )
                      ) : f.type === "boolean" ? (
                        <span className="text-[11px] font-medium">
                          {raw ? (
                            <span className="text-emerald-400">Yes</span>
                          ) : (
                            <span className="text-zinc-500">No</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-zinc-300 whitespace-pre-wrap">
                          {raw?.toString()?.trim() || (
                            <span className="text-zinc-600 text-xs">
                              — Not provided —
                            </span>
                          )}
                        </span>
                      )}
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.article>
  );
};
