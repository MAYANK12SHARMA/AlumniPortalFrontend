"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Save,
  CheckCircle2,
  Sun,
  Moon,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { studentProfileApi } from "@/lib/api/profile";
import { studentProfileValidation } from "@/lib/validation/profileSchemas";
import { StudentProfile } from "@/types";
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { AcademicInfoStep } from "./steps/AcademicInfoStep";
import { SkillsPreferencesStep } from "./steps/SkillsPreferencesStep";
import { ExperienceUploadsStep } from "./steps/ExperienceUploadsStep";
import { ReviewSubmitStep } from "./steps/ReviewSubmitStep";

// Steps config
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
  initialData?: Partial<StudentProfile>;
  isEditing?: boolean;
  initialStepId?: string;
}

// localStorage keys
const QUEUE_KEY = "studentProfileWizardQueue";
const SNAPSHOT_KEY = "studentProfileWizardSnapshot";

export function StudentProfileWizard({
  initialData,
  isEditing = false,
  initialStepId,
}: Props) {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(() => {
    if (initialStepId) {
      const idx = STEPS.findIndex((s) => s.id === initialStepId);
      if (idx >= 0) return idx;
    }
    return 0;
  });
  const [draftCreated, setDraftCreated] = useState(isEditing);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [online, setOnline] = useState(true);
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const formChangedSinceSave = useRef(false);
  const manualThrottleRef = useRef<number>(0);
  const stepFocusRef = useRef<HTMLDivElement | null>(null);
  const stepEnterTs = useRef<number>(Date.now());
  const analyticsRef = useRef<Record<string, number>>({});

  const methods = useForm<any>({
    defaultValues: {
      first_name: "",
      last_name: "",
      phone: "",
      location: "",
      bio: "",
      profile_picture: "",
      program: "",
      current_semester: undefined,
      batch_year: new Date().getFullYear(),
      cgpa: undefined,
      expected_graduation: "",
      major_coursework: [],
      academic_achievements: "",
      technical_skills: [],
      soft_skills: [],
      interests: [],
      career_goals: "",
      preferred_job_types: [],
      preferred_locations: [],
      certifications: [],
      extracurricular_activities: "",
      has_internship_experience: false,
      internship_details: "",
      ...initialData,
    },
    mode: "onChange", // manual schema validation per step
  });
  const {
    handleSubmit,
    getValues,
    setError,
    clearErrors,
    formState: { isValid },
    reset,
  } = methods;

  // Online status
  useEffect(() => {
    const update = () => setOnline(navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  // Focus management on step change
  useEffect(() => {
    stepFocusRef.current?.focus();
  }, [stepIndex]);

  // Snapshot load (first mount if no initialData override)
  useEffect(() => {
    if (!initialData) {
      try {
        const snap = localStorage.getItem(SNAPSHOT_KEY);
        if (snap) reset(JSON.parse(snap));
      } catch {}
    }
  }, [initialData, reset]);

  // Snapshot save
  useEffect(() => {
    const id = setTimeout(() => {
      try {
        localStorage.setItem(SNAPSHOT_KEY, JSON.stringify(getValues()));
      } catch {}
    }, 1200);
    return () => clearTimeout(id);
  }, [getValues]);

  // Mark changed
  useEffect(() => {
    formChangedSinceSave.current = true;
  }, [getValues]);

  // Validation per step (manual using yup schema)
  const validateStep = useCallback(async () => {
    clearErrors();
    const schema = STEPS[stepIndex].schema as any;
    try {
      await schema.validate(getValues(), { abortEarly: false });
      return true;
    } catch (err: any) {
      if (err?.inner) {
        err.inner.forEach((ve: any) => {
          if (ve.path)
            setError(ve.path, { type: "manual", message: ve.message });
        });
      } else if (err?.path)
        setError(err.path, { type: "manual", message: err.message });
      return false;
    }
  }, [getValues, setError, clearErrors, stepIndex]);

  const normalize = (vals: any) => {
    const out = { ...vals };
    if (
      !out.expected_graduation ||
      (typeof out.expected_graduation === "string" &&
        out.expected_graduation.trim() === "")
    )
      delete out.expected_graduation;
    return out;
  };

  const queueDraft = (payload: any) => {
    try {
      const q = JSON.parse(localStorage.getItem(QUEUE_KEY) || "[]");
      q.push({ ts: Date.now(), payload });
      localStorage.setItem(QUEUE_KEY, JSON.stringify(q));
    } catch {}
  };

  const flushQueue = useCallback(async () => {
    try {
      const raw = localStorage.getItem(QUEUE_KEY);
      if (!raw) return;
      const items: { ts: number; payload: any }[] = JSON.parse(raw);
      if (!items.length) return;
      setSaving(true);
      for (const item of items) {
        const fd = new FormData();
        Object.entries(item.payload).forEach(([k, v]) => {
          if (v == null || v === "") return;
          if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
          else fd.append(k, String(v));
        });
        if (!draftCreated) {
          try {
            await studentProfileApi.create(fd);
            setDraftCreated(true);
          } catch (err: any) {
            if (
              err?.response?.data?.error === "Student profile already exists"
            ) {
              setDraftCreated(true);
              await studentProfileApi.update(fd);
            } else throw err;
          }
        } else {
          await studentProfileApi.update(fd);
        }
      }
      localStorage.removeItem(QUEUE_KEY);
      setLastSaved(new Date());
      toast.success("Offline changes synced");
    } catch (e: any) {
      console.error("Flush failed", e?.response?.data || e);
    } finally {
      setSaving(false);
    }
  }, [draftCreated]);
  useEffect(() => {
    if (online) flushQueue();
  }, [online, flushQueue]);

  const saveDraft = useCallback(
    async (notify = true) => {
      const now = Date.now();
      if (now - manualThrottleRef.current < 3500 && notify === false) return; // throttle passive saves
      manualThrottleRef.current = now;
      const payload = normalize(getValues());
      if (!online) {
        queueDraft(payload);
        if (notify) toast.success("Saved offline");
        formChangedSinceSave.current = false;
        return;
      }
      try {
        setSaving(true);
        const fd = new FormData();
        Object.entries(payload).forEach(([k, v]) => {
          if (v == null || v === "") return;
          if (Array.isArray(v)) fd.append(k, JSON.stringify(v));
          else fd.append(k, String(v));
        });
        if (!draftCreated) {
          try {
            await studentProfileApi.create(fd);
            setDraftCreated(true);
          } catch (err: any) {
            if (
              err?.response?.data?.error === "Student profile already exists"
            ) {
              setDraftCreated(true);
              await studentProfileApi.update(fd);
            } else throw err;
          }
        } else {
          await studentProfileApi.update(fd);
        }
        setLastSaved(new Date());
        formChangedSinceSave.current = false;
        if (notify) toast.success("Progress saved");
      } catch (e: any) {
        console.error(e?.response?.data || e);
        if (notify) toast.error("Save failed");
      } finally {
        setSaving(false);
      }
    },
    [draftCreated, getValues, online]
  );

  // Idle autosave every 15s if changed
  useEffect(() => {
    const id = setInterval(() => {
      if (formChangedSinceSave.current && !saving) saveDraft(false);
    }, 15000);
    return () => clearInterval(id);
  }, [saveDraft, saving]);

  // Analytics: record time spent on current step
  const recordStepTime = useCallback(() => {
    const now = Date.now();
    const delta = now - stepEnterTs.current;
    const id = STEPS[stepIndex].id;
    analyticsRef.current[id] = (analyticsRef.current[id] || 0) + delta;
    stepEnterTs.current = now;
  }, [stepIndex]);

  // Step navigation
  const goNext = useCallback(async () => {
    const ok = await validateStep();
    if (!ok) {
      toast.error("Fix errors to continue");
      return;
    }
    recordStepTime();
    setStepIndex((i) => i + 1);
    saveDraft(false);
  }, [validateStep, saveDraft, recordStepTime]);
  const goBack = useCallback(() => {
    if (stepIndex === 0) return;
    recordStepTime();
    setStepIndex((i) => i - 1);
  }, [stepIndex, recordStepTime]);

  const onSubmit = async () => {
    const ok = await validateStep();
    if (!ok) {
      toast.error("Please resolve errors");
      return;
    }
    recordStepTime();
    await saveDraft(false);
    toast.success("Profile submitted");
    router.push("/dashboard/student");
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        if (stepIndex < STEPS.length - 1) goNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        goBack();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [goNext, goBack, stepIndex]);

  const Current = STEPS[stepIndex].component;

  return (
    <div data-theme={theme} className={theme === "dark" ? "dark" : ""}>
      <div
        className={`min-h-[calc(100vh-4rem)] flex flex-col md:flex-row ${
          theme === "dark"
            ? "bg-gradient-to-br from-zinc-950 via-black to-zinc-950 text-zinc-100"
            : "bg-gradient-to-br from-zinc-50 via-white to-zinc-100 text-zinc-800"
        }`}
      >
        {/* Progress Rail */}
        <nav
          aria-label="Wizard steps"
          className={`md:w-64 border-b md:border-b-0 md:border-r ${
            theme === "dark"
              ? "border-zinc-900/80 bg-zinc-950/40"
              : "border-zinc-200/80 bg-white/70"
          } backdrop-blur-sm`}
        >
          <div className="p-6 space-y-6 sticky top-0">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold tracking-tight">
                  {isEditing ? "Edit Profile" : "Student Profile"}
                </h1>
                <p className="text-xs text-zinc-500 mt-1">
                  Step {stepIndex + 1} / {STEPS.length}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Toggle theme"
                onClick={() =>
                  setTheme((t) => (t === "dark" ? "light" : "dark"))
                }
              >
                {theme === "dark" ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
            </div>
            <ol className="space-y-2" role="list">
              {STEPS.map((s, i) => {
                const active = i === stepIndex;
                const done = i < stepIndex;
                return (
                  <li key={s.id}>
                    <button
                      type="button"
                      aria-current={active ? "step" : undefined}
                      aria-label={`Go to ${s.title}`}
                      onClick={() => {
                        if (i < stepIndex) {
                          recordStepTime();
                          setStepIndex(i);
                        }
                      }}
                      className={`group w-full flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 ${
                        active
                          ? theme === "dark"
                            ? "bg-yellow-400/10 text-yellow-300"
                            : "bg-yellow-200/60 text-yellow-800"
                          : done
                          ? "text-green-500 hover:bg-green-500/10"
                          : theme === "dark"
                          ? "text-zinc-500 hover:text-zinc-300"
                          : "text-zinc-500 hover:text-zinc-700"
                      }`}
                    >
                      <span
                        className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-medium border ${
                          active
                            ? "border-yellow-400"
                            : done
                            ? "border-green-400"
                            : theme === "dark"
                            ? "border-zinc-700"
                            : "border-zinc-300"
                        }`}
                      >
                        {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
                      </span>
                      {s.title}
                    </button>
                  </li>
                );
              })}
            </ol>
            <div
              className={`text-[10px] pt-4 border-t ${
                theme === "dark"
                  ? "border-zinc-800 text-zinc-500"
                  : "border-zinc-200 text-zinc-500"
              }`}
            >
              {online
                ? saving
                  ? "Saving..."
                  : lastSaved
                  ? `Saved ${lastSaved.toLocaleTimeString()}`
                  : "Not saved"
                : "Offline – queued"}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                className="w-full text-xs"
                disabled={saving}
                onClick={() => saveDraft(true)}
              >
                <Save className="w-3 h-3 mr-1" /> Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label="Show analytics"
                onClick={() => {
                  console.table(analyticsRef.current);
                  toast.success("Analytics logged");
                }}
              >
                <BarChart3 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </nav>
        {/* Step Panel */}
        <div className="flex-1 p-4 md:p-10">
          <FormProvider {...methods}>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="max-w-3xl mx-auto"
              aria-live="polite"
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={stepIndex}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35 }}
                  role="tabpanel"
                  tabIndex={-1}
                  ref={stepFocusRef}
                  className="outline-none space-y-8"
                >
                  <Current />
                </motion.div>
              </AnimatePresence>
              <div
                className={`flex items-center justify-between mt-10 pt-6 border-t ${
                  theme === "dark" ? "border-zinc-800" : "border-zinc-200"
                }`}
              >
                <div className="text-xs opacity-70">
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
                    <Button type="submit" disabled={saving || !isValid}>
                      {saving ? (
                        <>
                          <Save className="w-4 h-4 mr-1 animate-spin" /> Saving
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
    </div>
  );
}
          
