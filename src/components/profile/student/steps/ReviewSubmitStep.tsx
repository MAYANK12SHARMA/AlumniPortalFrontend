"use client";

import React from "react";
import { motion } from "framer-motion";
import { useFormContext } from "react-hook-form";
import {
  Edit2,
  User,
  GraduationCap,
  Target,
  Briefcase,
  ImageOff,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  STUDENT_PROGRAM_CHOICES,
  SEMESTER_CHOICES,
  JOB_TYPE_CHOICES,
} from "@/types";
import Image from "next/image";

export function ReviewSubmitStep() {
  const { watch } = useFormContext();

  const formData = watch();

  // Helper functions to get display labels
  const getProgramLabel = (value: string) => {
    return (
      STUDENT_PROGRAM_CHOICES.find((p) => p.value === value)?.label || value
    );
  };

  const getSemesterLabel = (value: number) => {
    return (
      SEMESTER_CHOICES.find((s) => s.value === value)?.label ||
      `${value}th Semester`
    );
  };

  const getJobTypeLabels = (values: string[]) => {
    return values.map(
      (value) => JOB_TYPE_CHOICES.find((j) => j.value === value)?.label || value
    );
  };

  const handleEditStep = (_stepNumber: number) => {
    // This would be handled by the parent wizard component
    // For now, we'll just scroll to top
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
  <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-6">
        <div className="absolute -top-16 -right-16 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-16 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-xl md:text-2xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-2">
            Review Your Profile
          </h2>
          <p className="text-zinc-400">
            Check your details below. You can go back to edit any section before
            submitting.
          </p>
        </div>
      </div>

      {/* Personal Information Section */}
  <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-medium text-zinc-100">
              Personal Information
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleEditStep(1)}
            className="text-yellow-400 hover:text-yellow-300"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Picture and Basic Info */}
          <div className="space-y-4">
            <div className="flex justify-center">
              <div className="w-24 h-24 rounded-full overflow-hidden border border-zinc-800 bg-zinc-950 flex items-center justify-center">
                {formData.profile_picture ? (
                  typeof formData.profile_picture === "string" &&
                  formData.profile_picture.startsWith("http") ? (
                    // external URL: use img to avoid next/image remote issues
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={formData.profile_picture}
                      alt="Profile"
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <Image
                      src={formData.profile_picture}
                      alt="Profile"
                      width={96}
                      height={96}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <ImageOff className="h-8 w-8 text-zinc-600" />
                )}
              </div>
            </div>
            <div>
              <p className="text-sm text-zinc-500">Name</p>
              <p className="font-medium text-zinc-100">
                {formData.first_name} {formData.last_name}
              </p>
            </div>
            {formData.phone && (
              <div>
                <p className="text-sm text-zinc-500">Phone</p>
                <p className="font-medium text-zinc-100">{formData.phone}</p>
              </div>
            )}
            {formData.location && (
              <div>
                <p className="text-sm text-zinc-500">Location</p>
                <p className="font-medium text-zinc-100">{formData.location}</p>
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            {formData.bio && (
              <div>
                <p className="text-sm text-zinc-500">Bio</p>
                <p className="text-zinc-100">{formData.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Academic Information Section */}
  <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-medium text-zinc-100">
              Academic Information
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleEditStep(2)}
            className="text-yellow-400 hover:text-yellow-300"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-zinc-500">Program</p>
              <p className="font-medium text-zinc-100">
                {getProgramLabel(formData.program)}
              </p>
            </div>
            {formData.current_semester && (
              <div>
                <p className="text-sm text-zinc-500">Current Semester</p>
                <p className="font-medium text-zinc-100">
                  {getSemesterLabel(formData.current_semester)}
                </p>
              </div>
            )}
            {formData.batch_year && (
              <div>
                <p className="text-sm text-zinc-500">Batch Year</p>
                <p className="font-medium text-zinc-100">
                  {formData.batch_year}
                </p>
              </div>
            )}
            {formData.cgpa && (
              <div>
                <p className="text-sm text-zinc-500">CGPA</p>
                <p className="font-medium text-zinc-100">{formData.cgpa}</p>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {formData.major_coursework &&
              formData.major_coursework.length > 0 && (
                <div>
                  <p className="text-sm text-zinc-500 mb-2">Major Coursework</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.major_coursework.map((course: string) => (
                      <Badge
                        key={course}
                        variant="default"
                        className="text-[11px]"
                      >
                        {course}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            {formData.academic_achievements && (
              <div>
                <p className="text-sm text-zinc-500">Academic Achievements</p>
                <p className="text-zinc-100">
                  {formData.academic_achievements}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Skills & Preferences Section */}
  <div className="rounded-xl border border-zinc-800 bg-zinc-950/50 backdrop-blur p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-medium text-zinc-100">
              Skills & Career Preferences
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleEditStep(3)}
            className="text-yellow-400 hover:text-yellow-300"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        <div className="space-y-6">
          {/* Skills */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {formData.technical_skills &&
              formData.technical_skills.length > 0 && (
                <div>
                  <p className="text-sm text-zinc-500 mb-2">Technical Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {formData.technical_skills.map((skill: string) => (
                      <Badge
                        key={skill}
                        variant="default"
                        className="text-[11px]"
                      >
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            {formData.soft_skills && formData.soft_skills.length > 0 && (
              <div>
                <p className="text-sm text-zinc-500 mb-2">Soft Skills</p>
                <div className="flex flex-wrap gap-2">
                  {formData.soft_skills.map((skill: string) => (
                    <Badge
                      key={skill}
                      variant="secondary"
                      className="text-[11px]"
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {formData.interests && formData.interests.length > 0 && (
              <div>
                <p className="text-sm text-zinc-500 mb-2">Interests</p>
                <div className="flex flex-wrap gap-2">
                  {formData.interests.map((interest: string) => (
                    <Badge
                      key={interest}
                      variant="outline"
                      className="text-[11px]"
                    >
                      {interest}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Career Goals */}
          {formData.career_goals && (
            <div>
              <p className="text-sm text-zinc-500">Career Goals</p>
              <p className="text-zinc-100">{formData.career_goals}</p>
            </div>
          )}

          {/* Job Preferences */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.preferred_job_types &&
              formData.preferred_job_types.length > 0 && (
                <div>
                  <p className="text-sm text-zinc-500 mb-2">
                    Preferred Job Types
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {getJobTypeLabels(formData.preferred_job_types).map(
                      (type: string) => (
                        <Badge
                          key={type}
                          variant="warning"
                          className="text-[11px]"
                        >
                          {type}
                        </Badge>
                      )
                    )}
                  </div>
                </div>
              )}

            {formData.preferred_locations &&
              formData.preferred_locations.length > 0 && (
                <div>
                  <p className="text-sm text-zinc-500 mb-2">
                    Preferred Locations
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {formData.preferred_locations.map((location: string) => (
                      <Badge
                        key={location}
                        variant="success"
                        className="text-[11px]"
                      >
                        {location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
          </div>
        </div>
      </div>

      {/* Experience Section */}
      <div className="rounded-xl border border-zinc-800 bg-black/60 backdrop-blur p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-yellow-400" />
            <h3 className="text-lg font-medium text-zinc-100">Experience</h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleEditStep(4)}
            className="text-yellow-400 hover:text-yellow-300"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        <div>
          <p className="text-sm text-zinc-500">Internship Experience</p>
          <p className="font-medium text-zinc-100 mb-3">
            {String(formData.has_internship_experience) === "true" ||
            formData.has_internship_experience === true
              ? "Yes"
              : "No"}
          </p>

          {(String(formData.has_internship_experience) === "true" ||
            formData.has_internship_experience === true) &&
            formData.internship_details && (
              <div>
                <p className="text-sm text-zinc-500">Details</p>
                <p className="text-zinc-100">{formData.internship_details}</p>
              </div>
            )}
        </div>
      </div>

      {/* Submission Notice */}
  <div className="rounded-xl border border-emerald-700/40 bg-emerald-900/20 p-5">
        <h3 className="text-sm font-medium text-emerald-300 mb-2">
          🎉 Ready to Submit
        </h3>
        <p className="text-sm text-emerald-200">
          Once you submit your profile, it will be reviewed and made visible to
          other users in the alumni network. You can always update your
          information later from your dashboard.
        </p>
      </div>
  </motion.div>
  );
}
