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
import { alumniProfileApi } from "@/lib/api/profile";
import { alumniProfileValidation } from "@/lib/validation/profileSchemas";
import { AlumniProfile } from "@/types";

// Import step components
import { AlumniPersonalInfoStep } from "./steps/AlumniPersonalInfoStep";
import { AlumniAcademicBackgroundStep } from "./steps/AlumniAcademicBackgroundStep";
import { AlumniProfessionalInfoStep } from "./steps/AlumniProfessionalInfoStep";
import { AlumniSkillsNetworkingStep } from "./steps/AlumniSkillsNetworkingStep";
import { AlumniReviewSubmitStep } from "./steps/AlumniReviewSubmitStep";

const STEPS = [
  {
    id: "personal",
    name: "Personal Info",
    description: "Basic information",
    component: AlumniPersonalInfoStep,
    validation: alumniProfileValidation.personalInfo,
  },
  {
    id: "academic",
    name: "Academic Background",
    description: "Education details",
    component: AlumniAcademicBackgroundStep,
    validation: alumniProfileValidation.academicBackground,
  },
  {
    id: "professional",
    name: "Professional Info",
    description: "Career details",
    component: AlumniProfessionalInfoStep,
    validation: alumniProfileValidation.professionalInfo,
  },
  {
    id: "skills",
    name: "Skills & Networking",
    description: "Expertise & mentoring",
    component: AlumniSkillsNetworkingStep,
    validation: alumniProfileValidation.skillsAndNetworking,
  },
  {
    id: "review",
    name: "Review",
    description: "Review & submit",
    component: AlumniReviewSubmitStep,
    validation: alumniProfileValidation.complete,
  },
];

interface AlumniProfileWizardProps {
  initialData?: Partial<AlumniProfile>;
  isEditing?: boolean;
}

export function AlumniProfileWizard({
  initialData,
  isEditing = false,
}: AlumniProfileWizardProps) {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form with default values
  const methods = useForm<any>({
    resolver: yupResolver(STEPS[currentStep - 1].validation as any) as any,
    defaultValues: {
      // Personal Info
      first_name: "",
      last_name: "",
      phone_number: "",
      location: "",
      bio: "",
      profile_picture: "",
      linkedin_url: "",

      // Academic Background
      graduation_year: undefined,
      degree: "",
      specialization: "",

      // Professional Info
      current_company: "",
      current_position: "",
      industry: "",
      experience_years: "",
      notable_achievements: "",

      // Skills & Networking
      expertise_areas: [],
      willing_to_mentor: false,
      can_provide_referrals: false,
      preferred_mentoring_topics: [],
      available_for_networking: true,
      preferred_communication: [],
      career_path: [],

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
  const autoSave = useCallback(async () => {
    if (isSaving) return;
    setIsSaving(true);
    const values = getValues();

    const fileKeys = new Set(["profile_picture"]);
    const hasRealFile = (val: any) =>
      typeof File !== "undefined" && val instanceof File;

    const jsonPatch: Record<string, any> = {};
    Object.entries(values).forEach(([key, value]) => {
      if (fileKeys.has(key) && !hasRealFile(value)) return;
      jsonPatch[key] = value;
    });

    try {
      if (hasRealFile(values.profile_picture)) {
        const fd = new FormData();
        Object.entries(values).forEach(([key, value]) => {
          if (value === undefined || value === null) return;
          if (Array.isArray(value)) fd.append(key, JSON.stringify(value));
          else if (hasRealFile(value)) fd.append(key, value as any);
          else fd.append(key, String(value));
        });
        await alumniProfileApi.update(fd);
      } else {
        await alumniProfileApi.update(jsonPatch);
      }
      toast.success("Progress saved automatically", { duration: 1500 });
    } catch (err: any) {
      const status = err?.response?.status;
      // If no profile exists yet, create it with current values
      if (!isEditing && status === 404) {
        try {
          const fd = new FormData();
          Object.entries(values).forEach(([key, value]) => {
            if (value === undefined || value === null) return;
            if (Array.isArray(value)) fd.append(key, JSON.stringify(value));
            else if (hasRealFile(value)) fd.append(key, value as any);
            else if (fileKeys.has(key))
              return; // skip non-file value for file fields
            else fd.append(key, String(value));
          });
          await alumniProfileApi.create(fd);
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
  }, [getValues, isEditing, isSaving]);

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
    [handleBack, handleNext]
  );

  useEffect(() => {
    window.addEventListener("keydown", onKeyDown as any);
    return () => window.removeEventListener("keydown", onKeyDown as any);
  }, [onKeyDown]);

  const handleFinalSubmit = async (data: any) => {
    try {
      setIsSubmitting(true);

      // Create FormData for final submission
      const formData = new FormData();

      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            formData.append(key, JSON.stringify(value));
          } else if (typeof value === "object" && value instanceof File) {
            formData.append(key, value);
          } else {
            formData.append(key, String(value));
          }
        }
      });

      if (isEditing) {
        await alumniProfileApi.update(formData);
      } else {
        await alumniProfileApi.create(formData);
      }

      toast.success(
        "Profile submitted successfully! It will be reviewed by our admins."
      );
      router.push("/dashboard/alumni");
    } catch (error: any) {
      console.error("Submit failed:", error);

      // Handle validation errors
      if (error.response?.data) {
        const errors = error.response.data;
        Object.entries(errors).forEach(([field, messages]) => {
          if (Array.isArray(messages)) {
            messages.forEach((message: string) => {
              toast.error(`${field}: ${message}`);
            });
          }
        });
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
      title={isEditing ? "Edit Alumni Profile" : "Create Alumni Profile"}
      subtitle="Share your professional journey and connect with students seeking mentorship and guidance."
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
      {/* Top inline progress bar for extra feedback on mobile */}
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
