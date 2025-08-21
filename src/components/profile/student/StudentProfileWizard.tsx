"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useForm, FormProvider } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-hot-toast";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { Button } from "@/components/ui/button";
import { ProgressIndicator } from "@/components/ui/progress-indicator";
import ProfileWizardShell from "@/components/profile/ProfileWizardShell";
import { studentProfileApi } from "@/lib/api/profile";
import { studentProfileValidation } from "@/lib/validation/profileSchemas";
import { StudentProfile } from "@/types";

// Import step components
import { PersonalInfoStep } from "./steps/PersonalInfoStep";
import { AcademicInfoStep } from "./steps/AcademicInfoStep";
import { SkillsPreferencesStep } from "./steps/SkillsPreferencesStep";
import { ExperienceUploadsStep } from "./steps/ExperienceUploadsStep";
import { ReviewSubmitStep } from "./steps/ReviewSubmitStep";

const STEPS = [
  {
    id: "personal",
    name: "Personal Info",
    description: "Basic information",
    component: PersonalInfoStep,
    validation: studentProfileValidation.personalInfo,
  },
  {
    id: "academic",
    name: "Academic Info",
    description: "Program & courses",
    component: AcademicInfoStep,
    validation: studentProfileValidation.academicInfo,
  },
  {
    id: "skills",
    name: "Skills & Goals",
    description: "Skills & preferences",
    component: SkillsPreferencesStep,
    validation: studentProfileValidation.skillsAndPreferences,
  },
  {
    id: "experience",
    name: "Experience",
    description: "Internships & uploads",
    component: ExperienceUploadsStep,
    validation: studentProfileValidation.experience,
  },
  {
    id: "review",
    name: "Review",
    description: "Review & submit",
    component: ReviewSubmitStep,
    validation: studentProfileValidation.complete,
  },
];

interface StudentProfileWizardProps {
  initialData?: Partial<StudentProfile>;
  isEditing?: boolean;
}

export function StudentProfileWizard({
  initialData,
  isEditing = false,
}: StudentProfileWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileExists, setProfileExists] = useState(isEditing);

  // Check if profile exists when component mounts
  useEffect(() => {
    const checkProfileExists = async () => {
      try {
        await studentProfileApi.get();
        setProfileExists(true);
      } catch (error: any) {
        if (error.response?.status === 404) {
          setProfileExists(false);
        }
      }
    };

    if (!isEditing) {
      checkProfileExists();
    }
  }, [isEditing]);

  // Initialize form with default values
  const methods = useForm<any>({
    // Use loose typing for step-based schemas to avoid TS widening issues
    resolver: yupResolver(STEPS[currentStep - 1].validation as any) as any,
    defaultValues: {
      // Personal Info
      first_name: "",
      last_name: "",
      phone: "",
      location: "",
      bio: "",
      profile_picture: "",

      // Academic Info
      program: "",
      current_semester: undefined,
      batch_year: new Date().getFullYear(),
      cgpa: undefined,
      expected_graduation: "",
      major_coursework: [],
      academic_achievements: "",

      // Skills & Preferences
      technical_skills: [],
      soft_skills: [],
      interests: [],
      career_goals: "",
      preferred_job_types: [],
      preferred_locations: [],
      certifications: [],
      extracurricular_activities: "",

      // Experience
      has_internship_experience: false,
      internship_details: "",

      ...initialData,
    },
    mode: "onChange",
  });

  const {
    handleSubmit,
    getValues,
    trigger,
    formState: { isValid },
  } = methods;

  // Auto-save functionality
  // Helper to normalize form values (especially dates) for API
  const normalizeValues = (vals: any) => {
    const out: any = { ...vals };

    // expected_graduation should be YYYY-MM-DD or omitted
    const eg = vals?.expected_graduation;
    const toIsoYmd = (d: Date) => d.toISOString().slice(0, 10);
    const isValidDate = (d: any) => d instanceof Date && !isNaN(d.getTime());

    if (
      eg === undefined ||
      eg === null ||
      (typeof eg === "string" && eg.trim() === "")
    ) {
      delete out.expected_graduation;
    } else if (eg instanceof Date) {
      out.expected_graduation = toIsoYmd(eg);
    } else if (typeof eg === "string") {
      // If already in YYYY-MM-DD, keep it; else try to parse
      if (/^\d{4}-\d{2}-\d{2}$/.test(eg)) {
        out.expected_graduation = eg;
      } else {
        const parsed = new Date(eg);
        if (isValidDate(parsed)) out.expected_graduation = toIsoYmd(parsed);
        else delete out.expected_graduation; // omit invalid date
      }
    }

    return out;
  };

  const autoSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    const valuesRaw = getValues();
    const values = normalizeValues(valuesRaw);

    // Build a safe JSON patch payload, omitting file fields unless they are real Files
    const fileKeys = new Set(["profile_picture"]);
    const hasRealFile = (val: any) =>
      typeof File !== "undefined" && val instanceof File;

    const jsonPatch: Record<string, any> = {};
    Object.entries(values).forEach(([key, value]) => {
      if (fileKeys.has(key) && !hasRealFile(value)) {
        // Skip non-file value for file field to avoid 400 from DRF
        return;
      }
      jsonPatch[key] = value;
    });

    try {
      // Try update existing profile
      // If we have a real file, send as FormData; else send JSON
      if (hasRealFile(values.profile_picture)) {
        const fd = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          if (Array.isArray(value)) fd.append(key, JSON.stringify(value));
          else if (hasRealFile(value)) fd.append(key, value as any);
          else fd.append(key, String(value));
        });
        await studentProfileApi.update(fd);
      } else {
        await studentProfileApi.update(jsonPatch);
      }
      toast.success("Progress saved automatically", { duration: 1500 });
    } catch (err: any) {
      const status = err?.response?.status;
      if (!isEditing && status === 404) {
        // No profile yet — create a draft
        try {
          const fd = new FormData();
          Object.entries(values).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (Array.isArray(value)) fd.append(key, JSON.stringify(value));
            else if (hasRealFile(value)) fd.append(key, value as any);
            else if (fileKeys.has(key)) {
              // Skip non-file values for file fields on create
              return;
            } else fd.append(key, String(value));
          });
          await studentProfileApi.create(fd);
          toast.success("Draft created", { duration: 1500 });
        } catch (createErr: any) {
          console.error(
            "Auto-save create failed:",
            createErr?.response?.data || createErr
          );
          toast.error("Failed to save progress");
        }
      } else if (status === 400) {
        console.error("Auto-save failed (validation):", err?.response?.data);
        toast.error("Please check required fields");
      } else {
        console.error("Auto-save failed:", err);
        toast.error("Failed to save progress");
      }
    } finally {
      setIsSaving(false);
    }
  }, [isSaving, getValues, isEditing]);

  // Auto-save on step change
  useEffect(() => {
    const saveTimeout = setTimeout(() => {
      if (currentStep > 1) {
        autoSave();
      }
    }, 1000);
    return () => clearTimeout(saveTimeout);
  }, [currentStep, autoSave]);

  const handleNext = useCallback(async () => {
    const isStepValid = await trigger();

    if (isStepValid) {
      setCompletedSteps((prev) => [...new Set([...prev, currentStep])]);

      if (currentStep < STEPS.length) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      toast.error("Please fix the errors before continuing");
    }
  }, [currentStep, trigger]);

  const handleBack = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  }, [currentStep]);

  // Keyboard navigation for accessibility
  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        handleNext();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        handleBack();
      }
    },
    [handleNext, handleBack]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown as any);
    return () => window.removeEventListener("keydown", onKeyDown as any);
  }, [onKeyDown]);

  const handleFinalSubmit = async (data: any) => {
    // Create FormData for final submission - declare here so it's accessible in catch block
    const formData = new FormData();

    try {
      setIsSubmitting(true);

      console.log("Raw form data:", data);

      // normalize values (dates etc.)
      const normalized = normalizeValues(data);
      console.log("Normalized data:", normalized);

      const fileKeys = new Set(["profile_picture"]);
      // Proper type guard so TS knows value is a File inside the branch
      const isRealFile = (v: any): v is File =>
        typeof File !== "undefined" && v instanceof File;

      // Add all form fields
      Object.entries(normalized).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          console.log(`Processing field ${key}:`, value, typeof value);

          if (Array.isArray(value)) {
            // Always send arrays, even if empty - let backend handle empty arrays
            const jsonValue = JSON.stringify(value);
            console.log(`Appending array field ${key}:`, jsonValue);
            formData.append(key, jsonValue);
          } else if (isRealFile(value)) {
            console.log(`Appending file field ${key}:`, value);
            formData.append(key, value as File); // value narrowed to File by type guard
          } else if (fileKeys.has(key)) {
            // skip non-file values for file fields
            console.log(
              `Skipping non-file value for file field ${key}:`,
              value
            );
            return;
          } else if (typeof value === "boolean") {
            // Handle boolean values explicitly
            console.log(`Appending boolean field ${key}:`, value);
            formData.append(key, String(value));
          } else if (typeof value === "number") {
            // Handle numeric values
            console.log(`Appending number field ${key}:`, value);
            formData.append(key, String(value));
          } else {
            // Skip empty strings for optional fields, but allow required fields
            const stringValue = String(value);
            const requiredFields = [
              "first_name",
              "last_name",
              "program",
              "current_semester",
            ];
            if (stringValue.trim() !== "" || requiredFields.includes(key)) {
              console.log(`Appending string field ${key}:`, stringValue);
              formData.append(key, stringValue);
            } else {
              console.log(`Skipping empty string field ${key}`);
            }
          }
        } else {
          console.log(`Skipping null/undefined field ${key}:`, value);
        }
      });

      // Final debug: Log what we're sending
      console.log("Final FormData contents:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value, typeof value);
      }

      if (isEditing || profileExists) {
        console.log("Calling studentProfileApi.update...");
        await studentProfileApi.update(formData);
      } else {
        console.log("Calling studentProfileApi.create...");
        await studentProfileApi.create(formData);
      }

      toast.success("Profile submitted successfully!");
      router.push("/dashboard/student");
    } catch (error: any) {
      console.error("Submit failed:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error headers:", error.response?.headers);

      // Log the FormData contents for debugging
      console.log("FormData contents:");
      for (const [key, value] of formData.entries()) {
        console.log(`${key}:`, value, typeof value);
      }

      // Handle specific error cases
      if (error.response?.data?.error === "Student profile already exists") {
        console.log("Profile already exists, switching to update mode...");
        setProfileExists(true);
        try {
          // Retry with update instead of create
          await studentProfileApi.update(formData);
          toast.success("Profile updated successfully!");
          router.push("/dashboard/student");
          return; // Exit early on success
        } catch (updateError: any) {
          console.error("Update also failed:", updateError);
          toast.error("Failed to update existing profile. Please try again.");
          return;
        }
      }

      // Handle validation errors
      if (error.response?.data) {
        const errors = error.response.data;
        console.error("Validation errors:", errors);

        // Check if errors is an object with field-specific errors
        if (typeof errors === "object" && errors !== null) {
          Object.entries(errors).forEach(([field, messages]) => {
            if (Array.isArray(messages)) {
              messages.forEach((message: string) => {
                toast.error(`${field}: ${message}`);
              });
            } else if (typeof messages === "string") {
              toast.error(`${field}: ${messages}`);
            } else {
              toast.error(`${field}: ${JSON.stringify(messages)}`);
            }
          });
        } else {
          // If errors is not an object or is a string
          toast.error(
            typeof errors === "string" ? errors : JSON.stringify(errors)
          );
        }
      } else {
        toast.error("Failed to submit profile. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const CurrentStepComponent = STEPS[currentStep - 1].component;

  return (
    <ProfileWizardShell
      title={isEditing ? "Edit Student Profile" : "Create Student Profile"}
      subtitle="Complete your profile to connect with alumni and discover opportunities."
      steps={STEPS}
      currentStep={currentStep}
      completedSteps={completedSteps}
      headerRight={
        isSaving ? (
          <div className="flex items-center text-sm text-zinc-400">
            <Save className="animate-spin w-4 h-4 mr-2" /> Saving...
          </div>
        ) : null
      }
    >
      <ProgressIndicator
        steps={STEPS}
        currentStep={currentStep}
        completedSteps={completedSteps}
        className="mb-6 md:hidden"
      />

      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(handleFinalSubmit)}>
          <div className="mb-8" aria-live="polite">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <CurrentStepComponent />
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center justify-between pt-6 border-t border-zinc-800">
            <div className="text-xs text-zinc-500">
              Step {currentStep} of {STEPS.length}
            </div>

            <div className="flex gap-3">
              {currentStep > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={isSubmitting}
                >
                  <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
              )}

              {currentStep < STEPS.length ? (
                <Button
                  type="button"
                  onClick={handleNext}
                  disabled={!isValid || isSaving}
                  variant="primary"
                >
                  Next <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={!isValid || isSubmitting}
                  variant="primary"
                >
                  {isSubmitting ? (
                    <>
                      <Save className="animate-spin w-4 h-4 mr-2" />{" "}
                      Submitting...
                    </>
                  ) : (
                    "Submit Profile"
                  )}
                </Button>
              )}
            </div>
          </div>
        </form>
      </FormProvider>
    </ProfileWizardShell>
  );
}
