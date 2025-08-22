"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { studentProfileValidation } from "@/lib/validation/profileSchemas";
import { studentProfileApi } from "@/lib/api/profile";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Save,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Upload,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { AcademicInfoStep } from "./steps/AcademicInfoStep";
import { SkillsPreferencesStep } from "./steps/SkillsPreferencesStep";
import { ExperienceUploadsStep } from "./steps/ExperienceUploadsStep";
import { ReviewSubmitStep } from "./steps/ReviewSubmitStep";

/**
 * First-time onboarding wizard (refactored):
 * - Pre-fetch existing profile to determine create vs update
 * - Manual validation per step using dynamic Yup schema (no resolver churn)
 * - Throttled manual save (button) + gentle interval reminder (20s)
 * - Graceful handling of race where profile already exists (switch to update seamlessly)
 * - Redesigned layout inspired by role request form: central card, horizontal progress
 * - Rich but lightweight animation & accessibility (ARIA current step, progress bar)
 */

const STEPS = [
  {
    id: "personal",
    title: "Personal",
    component: PersonalInfoStep,
    schema: studentProfileValidation.personalInfo,
  },
  {
    id: "academic",
    title: "Academic",
    component: AcademicInfoStep,
    schema: studentProfileValidation.academicInfo,
  },
  {
    id: "skills",
    title: "Skills",
    component: SkillsPreferencesStep,
    schema: studentProfileValidation.skillsAndPreferences,
  },
  {
    id: "experience",
    title: "Experience",
    component: ExperienceUploadsStep,
    schema: studentProfileValidation.experience,
  },
  {
    id: "review",
    title: "Review",
    component: ReviewSubmitStep,
    schema: studentProfileValidation.complete,
  },
];

interface Props {
  initialData?: any;
}

export default function FirstTimeStudentOnboarding({ initialData }: Props) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [profileExists, setProfileExists] = useState(false);
  const lastManualSave = useRef<number>(0);
  const mountedRef = useRef(false);
  const [initializing, setInitializing] = useState(true);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string>
  >({});

  const methods = useForm<any>({
    defaultValues: {
      first_name: "",
      last_name: "",
      program: "",
      current_semester: undefined,
      profile_picture: "",
      technical_skills: [],
      soft_skills: [],
      interests: [],
      preferred_job_types: [],
      preferred_locations: [],
      certifications: [],
      has_internship_experience: false,
      internship_details: "",
      ...initialData,
    },
    mode: "onChange",
  });

  const { handleSubmit, getValues, setError, clearErrors } = methods;

  const Current = STEPS[stepIndex].component;

  // Prefetch existing profile (mount)
  useEffect(() => {
    if (mountedRef.current) return; // only once
    mountedRef.current = true;
    (async () => {
      try {
        const existing = await studentProfileApi.get();
        if (existing) {
          // fill defaults
          methods.reset({ ...getValues(), ...existing });
          setProfileExists(true);
        }
      } catch (e: any) {
        if (e?.response?.status !== 404) {
          console.warn("Profile prefetch failed", e?.response?.data || e);
        }
      } finally {
        setInitializing(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const buildFormData = (vals: any) => {
    const fd = new FormData();
    Object.entries(vals).forEach(([k, v]) => {
      if (v === undefined || v === null || v === "") return;
      if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
      else fd.append(k, String(v));
    });
    return fd;
  };

  const doSaveDraft = useCallback(
    async (notify = true) => {
      const now = Date.now();
      if (now - lastManualSave.current < 4000 && notify === false) return;
      lastManualSave.current = now;
      setSaving(true);
      const vals = getValues();
      const fd = buildFormData(vals);
      try {
        if (!profileExists) {
          try {
            await studentProfileApi.create(fd);
            setProfileExists(true);
          } catch (ce: any) {
            // If already exists, switch to update path
            if (
              ce?.response?.data?.error === "Student profile already exists"
            ) {
              setProfileExists(true);
              await studentProfileApi.update(fd);
            } else throw ce;
          }
        } else {
          await studentProfileApi.update(fd);
        }
        setLastSaved(new Date());
        if (notify) toast.success("Progress saved");
      } catch (e: any) {
        console.error(e?.response?.data || e);
        if (notify) toast.error("Save failed");
      } finally {
        setSaving(false);
      }
    },
    [getValues, profileExists]
  );

  // Gentle interval save (every 20s)
  useEffect(() => {
    const id = setInterval(() => {
      if (!saving) doSaveDraft(false);
    }, 20000);
    return () => clearInterval(id);
  }, [doSaveDraft, saving]);

  const validateCurrentStep = useCallback(async () => {
    clearErrors();
    setValidationErrors({});
    const schema = STEPS[stepIndex].schema as any;
    try {
      await schema.validate(getValues(), { abortEarly: false });
      return true;
    } catch (err: any) {
      if (err.inner) {
        const errMap: Record<string, string> = {};
        err.inner.forEach((ve: any) => {
          if (!errMap[ve.path]) errMap[ve.path] = ve.message;
          setError(ve.path, { message: ve.message });
        });
        setValidationErrors(errMap);
      } else if (err.path) {
        setError(err.path, { message: err.message });
        setValidationErrors({ [err.path]: err.message });
      }
      return false;
    }
  }, [stepIndex, getValues, setError, clearErrors]);

  const goNext = async () => {
    const ok = await validateCurrentStep();
    if (!ok) return toast.error("Fix errors to continue");
    if (stepIndex < STEPS.length - 1) setStepIndex((i) => i + 1);
  };
  const goBack = () => setStepIndex((i) => Math.max(0, i - 1));

  const onSubmitFinal = async () => {
    const ok = await validateCurrentStep();
    if (!ok) return toast.error("Resolve errors before finishing");
    await doSaveDraft(true);
    toast.success("Profile completed!");
    router.push("/dashboard/student");
  };

  if (initializing) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center text-sm text-zinc-400">
        Initializing profile wizard...
      </div>
    );
  }

  return (
    <div className="relative min-h-[calc(100vh-4rem)] bg-[radial-gradient(circle_at_30%_20%,#1e1e23,transparent_60%),radial-gradient(circle_at_80%_60%,#27272f,transparent_55%)] from-zinc-950 via-black to-zinc-950 text-zinc-100 px-4 py-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex flex-wrap items-center gap-4 justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2">
              {" "}
              <Sparkles className="w-5 h-5 text-amber-400" />{" "}
              {profileExists
                ? "Complete Your Student Profile"
                : "Create Your Student Profile"}{" "}
            </h1>
            <p className="text-sm text-zinc-400 mt-1 flex items-center gap-2">
              {" "}
              <ShieldCheck className="w-4 h-4" /> Your information helps alumni
              connect & mentor effectively.
            </p>
          </div>
          <div className="flex items-center gap-3 text-[11px] text-zinc-500">
            {saving
              ? "Saving…"
              : lastSaved
              ? `Saved ${lastSaved.toLocaleTimeString()}`
              : "Not saved yet"}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => doSaveDraft(true)}
              disabled={saving}
              className="h-7 text-xs"
            >
              <Save className="w-3 h-3 mr-1" /> Save
            </Button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative mb-8">
          <div className="h-2 rounded-full bg-zinc-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-500 transition-all duration-500"
              style={{ width: `${(stepIndex / (STEPS.length - 1)) * 100}%` }}
            />
          </div>
          <div className="mt-2 flex justify-between text-[11px] uppercase tracking-wide">
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                disabled={i > stepIndex}
                onClick={() => i < stepIndex && setStepIndex(i)}
                className={`relative group flex flex-col items-center ${
                  i === stepIndex
                    ? "text-amber-300"
                    : i < stepIndex
                    ? "text-green-400"
                    : "text-zinc-500"
                }`}
                aria-current={i === stepIndex ? "step" : undefined}
              >
                <span
                  className={`w-6 h-6 mb-1 flex items-center justify-center rounded-full border text-[11px] font-medium ${
                    i === stepIndex
                      ? "border-amber-400"
                      : i < stepIndex
                      ? "border-green-500"
                      : "border-zinc-700"
                  }`}
                >
                  {i < stepIndex ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                </span>
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Card */}
        <FormProvider {...methods}>
          <form
            onSubmit={handleSubmit(onSubmitFinal)}
            className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-6 md:p-10 shadow-xl backdrop-blur-sm relative overflow-hidden"
          >
            <div className="absolute inset-0 pointer-events-none [mask-image:radial-gradient(circle_at_40%_35%,black,transparent_70%)]">
              <div className="absolute -top-16 -right-24 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl" />
              <div className="absolute bottom-0 -left-24 w-72 h-72 rounded-full bg-orange-500/10 blur-3xl" />
            </div>
            <AnimatePresence mode="wait">
              <motion.div
                key={stepIndex}
                initial={{ opacity: 0, y: 28 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -18 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="relative space-y-8"
              >
                <Current />
                {Object.keys(validationErrors).length > 0 && (
                  <div className="text-xs text-red-400/80 bg-red-950/30 border border-red-900/40 rounded-md p-3">
                    <p className="font-medium mb-1">
                      Please address the following:
                    </p>
                    <ul className="space-y-0.5 list-disc list-inside">
                      {Object.entries(validationErrors)
                        .slice(0, 6)
                        .map(([f, m]) => (
                          <li key={f}>{m}</li>
                        ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-between mt-10 pt-6 border-t border-zinc-800">
              <div className="text-xs text-zinc-500">
                Step {stepIndex + 1} of {STEPS.length}
              </div>
              <div className="flex gap-3">
                {stepIndex > 0 && (
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={goBack}
                    disabled={saving}
                  >
                    <ArrowLeft className="w-4 h-4 mr-1" /> Back
                  </Button>
                )}
                {stepIndex < STEPS.length - 1 ? (
                  <Button type="button" onClick={goNext} disabled={saving}>
                    Next <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                ) : (
                  <Button type="submit" disabled={saving}>
                    {saving ? (
                      <>
                        <Upload className="w-4 h-4 mr-1 animate-spin" /> Saving
                      </>
                    ) : (
                      "Finish"
                    )}
                  </Button>
                )}
              </div>
            </div>
          </form>
        </FormProvider>
      </div>
    </div>
  );
}
