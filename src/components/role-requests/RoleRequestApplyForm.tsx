"use client";

// Clean rebuild of the Alumni Role Request Apply Form with:
// 1. Pending request pre-check (blocks duplicate submissions)
// 2. Multi-step animated wizard (no absolute positioning -> no clipping)
// 3. Visual polish + accessible structure
// 4. Link to dedicated pending page for viewing / cancelling

import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import {
  Upload,
  FileText,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Clock,
  // XCircle,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Stepper } from "@/components/ui/stepper";
import { ProfilePictureUploader } from "@/components/ui/profile-picture-uploader";
import { cn } from "@/lib/utils";
import apiClient from "@/lib/api";
import useRoleRequestEligibility from "@/hooks/useRoleRequestEligibility";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
// import Image from "next/image";

// ---------- Types ----------

// interface PendingRoleRequest {
//   id: number;
//   status: string; // 'pending' | 'approved' | 'rejected' | ...
//   created_at?: string;
//   updated_at?: string;
//   notes?: string;
// }

type FormState = {
  first_name: string;
  last_name: string;
  graduation_year: number | "";
  degree: string;
  specialization: string;
  current_company: string;
  job_title: string;
  industry: string;
  location: string;
  phone_number: string;
  linkedin_profile: string;
  bio: string;
  mentoring_available: boolean;
  job_referrals_available: boolean;
  profile_picture?: File | null;
  verification_docs?: File | null;
};

// ---------- Constants ----------

const YEARS = Array.from(
  { length: 60 },
  (_, i) => new Date().getFullYear() - i
);
// Backend PROGRAM_CHOICES mapping (value,label)
const DEGREE_OPTIONS: { value: string; label: string }[] = [
  { value: "btech", label: "B.Tech (Bachelor of Technology)" },
  { value: "bcom", label: "B.Com (Bachelor of Commerce)" },
  { value: "bba", label: "BBA (Bachelor of Business Administration)" },
  { value: "bca", label: "BCA (Bachelor of Computer Applications)" },
  { value: "bsc", label: "B.Sc (Bachelor of Science)" },
  { value: "ba", label: "BA (Bachelor of Arts)" },
  { value: "mtech", label: "M.Tech (Master of Technology)" },
  { value: "mba", label: "MBA (Master of Business Administration)" },
  { value: "mca", label: "MCA (Master of Computer Applications)" },
  { value: "msc", label: "M.Sc (Master of Science)" },
  { value: "ma", label: "MA (Master of Arts)" },
  { value: "phd", label: "PhD (Doctor of Philosophy)" },
];
const DEGREE_LABEL_LOOKUP = Object.fromEntries(
  DEGREE_OPTIONS.map((d) => [d.value, d.label])
);
const INDUSTRY_OPTIONS = [
  "software_engineering",
  "data_science",
  "ai_ml",
  "product_management",
  "design_ui_ux",
  "finance",
  "consulting",
  "marketing",
  "entrepreneurship",
  "other",
];

const EMPTY_FORM: FormState = {
  first_name: "",
  last_name: "",
  graduation_year: "",
  degree: "",
  specialization: "",
  current_company: "",
  job_title: "",
  industry: "",
  location: "",
  phone_number: "",
  linkedin_profile: "",
  bio: "",
  mentoring_available: false,
  job_referrals_available: false,
  profile_picture: undefined,
  verification_docs: undefined,
};

const inputClass =
  "bg-zinc-900 border-zinc-700 focus-visible:ring-amber-400/40 focus-visible:border-amber-400/50";

// ---------- Main Component ----------

function RoleRequestApplyForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);
  const [profileImageUrl, setProfileImageUrl] = useState<string | undefined>();
  // Server can return validation errors in mixed shapes (string | string[] | nested object)
  const [errors, setErrors] = useState<Record<string, any>>({});

  // Flatten error object into uniform list for rendering
  const flattenedErrors = useMemo(() => {
    const items: { field: string; message: string }[] = [];
    const walk = (prefix: string, val: any) => {
      if (val == null) return;
      if (Array.isArray(val)) {
        val.forEach((m) => items.push({ field: prefix, message: String(m) }));
      } else if (typeof val === "object") {
        Object.entries(val).forEach(([k, v]) =>
          walk(prefix ? `${prefix}.${k}` : k, v)
        );
      } else {
        items.push({ field: prefix, message: String(val) });
      }
    };
    Object.entries(errors).forEach(([field, val]) => walk(field, val));
    return items;
  }, [errors]);

  // Pending request gating
  const {
    loading: eligibilityLoading,
    eligibility,
    pending,
    error: eligibilityError,
    refresh: refreshEligibility,
  } = useRoleRequestEligibility({ role: "alumni" });

  const totalSteps = 6;

  const update = useCallback((p: Partial<FormState>) => {
    setForm((f) => ({ ...f, ...p }));
  }, []);

  // Fetch eligibility + (optional) detailed pending
  // no local custom effect needed; hook auto fetches

  // Validation for enabling next
  const canProceed = useMemo(() => {
    switch (step) {
      case 1:
        return !!form.first_name && !!form.last_name;
      case 2:
        return !!form.graduation_year && !!form.degree;
      case 3:
        return true; // professional optional
      case 4:
        return form.bio.trim().length >= 20; // require a good bio
      case 5:
        return true; // files optional
      default:
        return true;
    }
  }, [step, form]);

  const next = () => setStep((s) => Math.min(totalSteps, s + 1));
  const prev = () => setStep((s) => Math.max(1, s - 1));

  const handleSubmit = async () => {
    setSubmitting(true);
    setErrors({});
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v === undefined || v === null || v === "") return;
        if (k === "graduation_year" && typeof v === "number") {
          fd.append(k, String(v));
        } else if (v instanceof File) {
          fd.append(k, v);
        } else {
          fd.append(k, v as any);
        }
      });
      // If we have an uploaded profile picture via URL (from uploader) but no file chosen, try to fetch and attach
      if (!form.profile_picture && profileImageUrl) {
        try {
          const blob = await fetch(profileImageUrl).then((r) => r.blob());
          fd.append("profile_picture", blob, "profile-picture.jpg");
        } catch {
          /* ignore */
        }
      }
      await apiClient.post("/role-request/alumni/", fd);
      toast.success("Role request submitted! Pending review.");
      // Re-check eligibility to gate form
      await refreshEligibility();
    } catch (e: any) {
      if (e?.response?.data) {
        const payload = e.response.data as any;
        setErrors(payload.errors || payload);
        // If backend indicates pending request via non_field_errors, refresh eligibility
        const nf =
          payload?.errors?.non_field_errors || payload?.non_field_errors;
        if (
          nf &&
          Array.isArray(nf) &&
          nf.some((m: string) =>
            m.toLowerCase().includes("pending role request")
          )
        ) {
          refreshEligibility();
        }
        toast.error("Please fix highlighted errors.");
      } else {
        toast.error("Submission failed. Try again.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- Pending states ----------

  if (eligibilityLoading) {
    return (
      <Card className="relative border border-zinc-800 bg-zinc-900">
        <CardHeader className="space-y-1">
          <CardTitle className="flex items-center gap-2 text-lg font-semibold">
            <Loader2 className="h-5 w-5 animate-spin text-amber-400" />
            Checking existing request
          </CardTitle>
        </CardHeader>
        <CardContent className="pb-8">
          <p className="text-sm text-zinc-400">
            Verifying eligibility & existing alumni role requests.
          </p>
        </CardContent>
      </Card>
    );
  }

  // Show ineligible (pending) gating
  if (
    eligibility &&
    !eligibility.eligible &&
    (pending || eligibility.pending_request)
  ) {
    return (
      <Card className="relative border border-amber-500/40 bg-zinc-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-base">
            <Clock className="h-5 w-5 text-amber-400" />
            Existing Pending Request
            <Badge className="ml-auto bg-amber-500/15 text-amber-300 border border-amber-400/30">
              Pending
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <p className="text-sm text-zinc-400 leading-relaxed">
            You already have an alumni role request under review. You cannot
            submit another until it’s resolved.
          </p>
          <div className="text-xs grid gap-2 md:grid-cols-2">
            {(pending?.created_at ||
              eligibility.pending_request?.created_at) && (
              <Info
                label="Submitted"
                value={new Date(
                  (pending?.created_at ||
                    eligibility.pending_request?.created_at) as string
                ).toLocaleString()}
              />
            )}
            {pending?.updated_at && (
              <Info
                label="Last Update"
                value={new Date(pending.updated_at).toLocaleString()}
              />
            )}
            <Info
              label="Request ID"
              value={pending?.id || eligibility.pending_request?.id}
            />
            {pending?.notes && <Info label="Notes" value={pending.notes} />}
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              asChild
              variant="outline"
              className="border-amber-400/30 text-amber-300 hover:bg-amber-400/10"
            >
              <Link href="/dashboard/role-requests/pending">
                View / Cancel Request
              </Link>
            </Button>
            <Button
              variant="ghost"
              onClick={async () => {
                // Soft refetch
                try {
                  await refreshEligibility();
                } catch {
                  toast.error("Refresh failed");
                } finally {
                  /* noop */
                }
              }}
            >
              Refresh
            </Button>
          </div>
          {eligibilityError && (
            <p className="text-xs text-red-400/80">{eligibilityError}</p>
          )}
        </CardContent>
      </Card>
    );
  }

  // ---------- Form Steps Content ----------

  return (
    <Card className="relative border border-zinc-800 bg-zinc-900">
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-400" /> Alumni Role
              Application
            </CardTitle>
            <p className="text-xs text-zinc-400 max-w-prose">
              Complete the steps below to apply for Alumni privileges.
            </p>
          </div>
          <div className="ml-auto min-w-[160px]">
            <ProgressGlow step={step} total={totalSteps} />
            <div className="flex items-center justify-between mt-1 text-[10px] uppercase tracking-wide text-zinc-500">
              <span>Step {step}</span>
              <span>{Math.round((step / totalSteps) * 100)}%</span>
            </div>
          </div>
        </div>
        <div className="space-y-4 w-full">
          <Stepper
            orientation="horizontal"
            currentStep={step}
            completedSteps={Array.from({ length: step - 1 }, (_, i) => i + 1)}
            steps={[
              { id: "basic", name: "Basic" },
              { id: "academic", name: "Academic" },
              { id: "professional", name: "Professional" },
              { id: "profile", name: "Profile" },
              { id: "files", name: "Files" },
              { id: "review", name: "Review" },
            ]}
            className="hidden md:block"
          />
          {/* Mobile (vertical) fallback */}
          <Stepper
            orientation="vertical"
            currentStep={step}
            completedSteps={Array.from({ length: step - 1 }, (_, i) => i + 1)}
            steps={[
              { id: "basic", name: "Basic" },
              { id: "academic", name: "Academic" },
              { id: "professional", name: "Professional" },
              { id: "profile", name: "Profile" },
              { id: "files", name: "Files" },
              { id: "review", name: "Review" },
            ]}
            className="md:hidden"
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        <FormStepWrapper step={step}>
          <StepBasic state={form} update={update} />
          <StepAcademic state={form} update={update} />
          <StepProfessional state={form} update={update} />
          <StepProfile
            state={form}
            update={update}
            profileImageUrl={profileImageUrl}
            setProfileImageUrl={setProfileImageUrl}
          />
          <StepFiles state={form} update={update} />
          <StepReview state={form} profileImageUrl={profileImageUrl} />
        </FormStepWrapper>

        {flattenedErrors.length > 0 && (
          <div className="rounded-md border border-red-600/50 bg-red-950/70 p-4 space-y-2">
            <p className="text-sm font-medium text-red-300">Please fix:</p>
            <ul className="text-xs text-red-400 space-y-1 list-disc ml-4">
              {flattenedErrors.map(({ field, message }, i) => (
                <li key={field + i}>
                  <span className="font-semibold">{field}:</span> {message}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-wrap gap-4 justify-between pt-2">
          <div className="flex gap-3">
            {step > 1 && (
              <Button
                type="button"
                variant="outline"
                onClick={prev}
                disabled={submitting}
                className="gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Back
              </Button>
            )}
          </div>
          <div className="flex gap-3 ml-auto">
            {step < totalSteps && (
              <Button
                type="button"
                onClick={next}
                disabled={!canProceed || submitting}
                className="gap-1"
              >
                Next <ArrowRight className="h-4 w-4" />
              </Button>
            )}
            {step === totalSteps && (
              <Button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="gap-2"
              >
                {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
                Submit Request <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/* ---------------- Step Components ---------------- */

function Field({
  label,
  children,
  required = false,
}: {
  label: string;
  children: React.ReactNode;
  required?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium text-zinc-200 flex items-center gap-1">
        {label} {required && <span className="text-amber-400">*</span>}
      </label>
      {children}
    </div>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-5 md:grid-cols-2">{children}</div>;
}

function StepBasic({
  state,
  update,
}: {
  state: FormState;
  update: (p: Partial<FormState>) => void;
}) {
  return (
    <motion.div variants={stepVariants} className="space-y-6">
      <SectionTitle title="Basic Information" desc="Introduce yourself" />
      <Grid>
        <Field label="First Name" required>
          <Input
            value={state.first_name}
            onChange={(e) => update({ first_name: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Last Name" required>
          <Input
            value={state.last_name}
            onChange={(e) => update({ last_name: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Phone Number">
          <Input
            value={state.phone_number}
            onChange={(e) => update({ phone_number: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Location">
          <Input
            value={state.location}
            onChange={(e) => update({ location: e.target.value })}
            className={inputClass}
          />
        </Field>
      </Grid>
    </motion.div>
  );
}

function StepAcademic({
  state,
  update,
}: {
  state: FormState;
  update: (p: Partial<FormState>) => void;
}) {
  return (
    <motion.div variants={stepVariants} className="space-y-6">
      <SectionTitle title="Academic Details" desc="Your graduation info" />
      <Grid>
        <Field label="Graduation Year" required>
          <select
            value={state.graduation_year}
            onChange={(e) =>
              update({ graduation_year: Number(e.target.value) })
            }
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm",
              inputClass
            )}
          >
            <option value="">Select year</option>
            {YEARS.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Degree" required>
          <select
            value={state.degree}
            onChange={(e) => update({ degree: e.target.value })}
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm",
              inputClass
            )}
          >
            <option value="">Select degree</option>
            {DEGREE_OPTIONS.map((d) => (
              <option key={d.value} value={d.value}>
                {d.label}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Specialization">
          <Input
            value={state.specialization}
            onChange={(e) => update({ specialization: e.target.value })}
            className={inputClass}
          />
        </Field>
      </Grid>
    </motion.div>
  );
}

function StepProfessional({
  state,
  update,
}: {
  state: FormState;
  update: (p: Partial<FormState>) => void;
}) {
  return (
    <motion.div variants={stepVariants} className="space-y-6">
      <SectionTitle title="Professional Details" desc="Work & experience" />
      <Grid>
        <Field label="Current Company">
          <Input
            value={state.current_company}
            onChange={(e) => update({ current_company: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Job Title">
          <Input
            value={state.job_title}
            onChange={(e) => update({ job_title: e.target.value })}
            className={inputClass}
          />
        </Field>
        <Field label="Industry">
          <select
            value={state.industry}
            onChange={(e) => update({ industry: e.target.value })}
            className={cn(
              "w-full rounded-md border px-3 py-2 text-sm",
              inputClass
            )}
          >
            <option value="">Select industry</option>
            {INDUSTRY_OPTIONS.map((i) => (
              <option key={i} value={i}>
                {i.replace(/_/g, " ")}
              </option>
            ))}
          </select>
        </Field>
      </Grid>
    </motion.div>
  );
}

function StepProfile({
  state,
  update,
  profileImageUrl,
  setProfileImageUrl,
}: {
  state: FormState;
  update: (p: Partial<FormState>) => void;
  profileImageUrl?: string;
  setProfileImageUrl: (u?: string) => void;
}) {
  return (
    <motion.div variants={stepVariants} className="space-y-6">
      <SectionTitle title="Profile Presentation" desc="Tell your story" />
      <div className="grid gap-8 md:grid-cols-[220px_1fr]">
        <div>
          <ProfilePictureUploader
            currentImageUrl={profileImageUrl}
            onImageUploaded={(url) => {
              setProfileImageUrl(url);
            }}
            onImageRemoved={() => setProfileImageUrl(undefined)}
          />
        </div>
        <div className="space-y-5">
          <Field label="LinkedIn URL">
            <Input
              value={state.linkedin_profile}
              onChange={(e) => update({ linkedin_profile: e.target.value })}
              className={inputClass}
              placeholder="https://linkedin.com/in/username"
            />
          </Field>
          <Field label="Professional Bio" required>
            <Textarea
              value={state.bio}
              onChange={(e) => update({ bio: e.target.value })}
              className={inputClass}
              rows={6}
              placeholder="Summarize your experience, areas of expertise, and what you want to contribute as an alumni..."
            />
            <p className="text-xs text-zinc-500 mt-1">
              {state.bio.length < 20
                ? `Add ${20 - state.bio.length} more characters to continue`
                : `${state.bio.length} characters`}
            </p>
          </Field>
          <div className="flex gap-6 flex-wrap">
            <Toggle
              label="Available for Mentoring"
              value={state.mentoring_available}
              onChange={(v) => update({ mentoring_available: v })}
            />
            <Toggle
              label="Can Provide Referrals"
              value={state.job_referrals_available}
              onChange={(v) => update({ job_referrals_available: v })}
            />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function StepFiles({
  state,
  update,
}: {
  state: FormState;
  update: (p: Partial<FormState>) => void;
}) {
  return (
    <motion.div variants={stepVariants} className="space-y-6">
      <SectionTitle
        title="Supporting Documents"
        desc="Upload verification documents"
      />
      <div className="grid gap-6 md:grid-cols-2">
        <UploadField
          label="Profile Picture (alt upload)"
          accept="image/*"
          file={state.profile_picture}
          onChange={(f) => update({ profile_picture: f })}
          helper="Optional if already uploaded above"
        />
        <UploadField
          label="Verification Document (PDF)"
          accept="application/pdf"
          file={state.verification_docs}
          onChange={(f) => update({ verification_docs: f })}
          helper="Degree / ID proof (PDF, Max 5MB)"
        />
      </div>
      <p className="text-xs text-zinc-500">
        These files help administrators verify your alumni status faster.
      </p>
    </motion.div>
  );
}

function StepReview({
  state,
  profileImageUrl,
}: {
  state: FormState;
  profileImageUrl?: string;
}) {
  const summary = [
    ["Name", `${state.first_name} ${state.last_name}`],
    ["Graduation", state.graduation_year],
    [
      "Degree",
      DEGREE_LABEL_LOOKUP[state.degree as string] || state.degree || "—",
    ],
    ["Specialization", state.specialization || "—"],
    ["Company", state.current_company || "—"],
    ["Title", state.job_title || "—"],
    ["Industry", state.industry || "—"],
    ["Location", state.location || "—"],
    ["Phone", state.phone_number || "—"],
    ["Mentoring", state.mentoring_available ? "Yes" : "No"],
    ["Referrals", state.job_referrals_available ? "Yes" : "No"],
  ];
  const localPreview = React.useMemo(() => {
    if (state.profile_picture instanceof File) {
      return URL.createObjectURL(state.profile_picture);
    }
    return profileImageUrl;
  }, [state.profile_picture, profileImageUrl]);
  useEffect(() => {
    return () => {
      if (state.profile_picture instanceof File && localPreview)
        URL.revokeObjectURL(localPreview);
    };
  }, [localPreview, state.profile_picture]);
  return (
    <motion.div variants={stepVariants} className="space-y-6">
      <SectionTitle
        title="Review & Submit"
        desc="Confirm everything looks right"
      />
      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
            <p className="text-xs font-medium text-zinc-400 uppercase">
              Profile Picture
            </p>
            <div className="aspect-square w-40 rounded-full overflow-hidden border border-zinc-700 bg-zinc-950 mx-auto flex items-center justify-center">
              {localPreview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={localPreview}
                  alt="Profile preview"
                  className="object-cover w-full h-full"
                />
              ) : (
                <span className="text-[10px] text-zinc-500 px-2 text-center">
                  Not provided
                </span>
              )}
            </div>
          </div>
          <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-2">
            <p className="text-xs font-medium text-zinc-400 uppercase">
              Verification Document
            </p>
            {state.verification_docs ? (
              <div className="text-xs text-zinc-300 space-y-1">
                <p className="font-medium break-all">
                  {state.verification_docs.name}
                </p>
                <p className="text-[10px] text-zinc-500">
                  {(state.verification_docs.size / 1024 / 1024).toFixed(2)} MB
                </p>
                <p className="text-[10px] text-amber-400">
                  Will be uploaded with submission
                </p>
              </div>
            ) : (
              <p className="text-[11px] text-zinc-500">No document attached</p>
            )}
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 content-start">
          {summary.map(([k, v]) => (
            <div
              key={k}
              className="p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 text-sm flex justify-between"
            >
              <span className="text-zinc-400">{k}</span>
              <span className="font-medium text-zinc-200 ml-4 text-right">
                {v}
              </span>
            </div>
          ))}
          <div className="md:col-span-2 p-4 rounded-lg bg-zinc-900/40 border border-zinc-800">
            <p className="text-xs font-medium text-zinc-400 uppercase mb-2">
              Bio
            </p>
            <p className="text-sm leading-relaxed text-zinc-300 whitespace-pre-wrap">
              {state.bio || "—"}
            </p>
          </div>
          {state.linkedin_profile && (
            <div className="md:col-span-2 p-3 rounded-lg bg-zinc-900/40 border border-zinc-800 text-xs flex justify-between items-center">
              <span className="text-zinc-400">LinkedIn</span>
              <a
                href={state.linkedin_profile}
                target="_blank"
                rel="noreferrer"
                className="text-amber-400 hover:underline truncate max-w-[70%]"
              >
                {state.linkedin_profile}
              </a>
            </div>
          )}
        </div>
      </div>
      <div className="p-4 rounded-lg bg-gradient-to-r from-amber-500/10 via-yellow-500/10 to-orange-500/10 border border-amber-500/20 text-xs text-amber-200">
        Submitting will create a role request visible to administrators. You
        cannot submit another while one is pending.
      </div>
    </motion.div>
  );
}

/* ---------------- Generic UI Helpers ---------------- */

function Info({ label, value }: { label: string; value: any }) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-zinc-500">{label}</p>
      <p className="text-sm font-medium text-zinc-200 line-clamp-2">
        {value || "—"}
      </p>
    </div>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className={cn(
        "relative inline-flex h-9 items-center gap-2 rounded-lg border px-4 text-sm transition-all",
        value
          ? "border-amber-400/60 bg-amber-400/10 text-amber-300"
          : "border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-zinc-200"
      )}
    >
      <span
        className={cn(
          "h-2.5 w-2.5 rounded-full",
          value
            ? "bg-amber-400 shadow-[0_0_8px_2px_rgba(251,191,36,0.5)]"
            : "bg-zinc-600"
        )}
      ></span>
      {label}
    </button>
  );
}

function UploadField({
  label,
  accept,
  file,
  onChange,
  helper,
}: {
  label: string;
  accept: string;
  file?: File | null;
  onChange: (f: File | null) => void;
  helper?: string;
}) {
  const id = useMemo(
    () => `up-${label.replace(/[^a-z]/gi, "").toLowerCase()}`,
    [label]
  );
  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-zinc-200 flex items-center gap-2">
        <Upload size={16} className="text-amber-400" /> {label}
      </p>
      <label
        htmlFor={id}
        className={cn(
          "group flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed cursor-pointer p-6 text-center transition-all",
          file
            ? "border-amber-400/50 bg-amber-400/5"
            : "border-zinc-700/60 bg-zinc-900/30 hover:border-amber-400/40"
        )}
      >
        <input
          id={id}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] || null)}
        />
        {file ? (
          <>
            <FileText className="h-10 w-10 text-amber-300" />
            <div className="text-xs text-zinc-300 space-y-1">
              <p className="font-medium break-all">{file.name}</p>
              <p className="text-[10px] text-zinc-500">
                {(file.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                type="button"
                className="text-amber-400 hover:underline"
                onClick={(e) => {
                  e.preventDefault();
                  onChange(null);
                }}
              >
                Remove
              </button>
            </div>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-zinc-500 group-hover:text-amber-300 transition-colors" />
            <p className="text-xs text-zinc-400">Click or drag to upload</p>
          </>
        )}
      </label>
      {helper && <p className="text-[11px] text-zinc-500">{helper}</p>}
    </div>
  );
}

function SectionTitle({ title, desc }: { title: string; desc?: string }) {
  return (
    <div className="space-y-1 mb-2">
      <h3 className="text-lg font-semibold tracking-tight text-zinc-100 flex items-center gap-2">
        <span className="relative inline-flex h-5 w-5 items-center justify-center">
          <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400/20 animate-ping" />
          <span className="relative h-3 w-3 rounded-full bg-amber-400" />
        </span>
        {title}
      </h3>
      {desc && <p className="text-sm text-zinc-500">{desc}</p>}
    </div>
  );
}

function FormStepWrapper({
  children,
  step,
}: {
  children: React.ReactNode[];
  step: number;
}) {
  return (
    <div className="relative">
      <AnimatePresence mode="wait" initial={false}>
        {React.Children.map(children, (child, index) => {
          if (index + 1 !== step) return null;
          return (
            <motion.div
              key={index}
              initial="enter"
              animate="center"
              exit="exit"
              variants={pageVariants}
              transition={{
                duration: 0.45,
                type: "spring",
                damping: 24,
                stiffness: 180,
              }}
              className="w-full"
              layout
            >
              {child}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function ProgressGlow({ step, total }: { step: number; total: number }) {
  const pct = (step / total) * 100;
  return (
    <div className="relative h-3 rounded-full bg-zinc-900 overflow-hidden border border-zinc-800">
      <div className="absolute inset-0 bg-gradient-to-r from-amber-500/20 via-yellow-400/10 to-transparent" />
      <motion.div
        className="h-full bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 shadow-[0_0_12px_2px_rgba(251,191,36,0.4)]"
        style={{ width: pct + "%" }}
        layout
        transition={{ type: "spring", stiffness: 120, damping: 20 }}
      />
      <div className="absolute inset-0 backdrop-blur-[1px]" />
    </div>
  );
}

// ---------- Animations ----------
const pageVariants = {
  enter: { opacity: 0, x: 40, scale: 0.98 },
  center: { opacity: 1, x: 0, scale: 1 },
  exit: { opacity: 0, x: -40, scale: 0.98 },
};
const stepVariants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
};

// function AnimatedGradient() {
//   return (
//     <div className="pointer-events-none absolute -inset-px rounded-lg overflow-hidden">
//       <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(251,191,36,0.08),transparent_60%),radial-gradient(circle_at_80%_80%,rgba(250,204,21,0.06),transparent_55%)]" />
//       <div className="absolute inset-0 animate-pulse bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.02),transparent_70%)]" />
//     </div>
//   );
// }

export default RoleRequestApplyForm;
