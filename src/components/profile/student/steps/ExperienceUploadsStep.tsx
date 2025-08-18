"use client";

import React from "react";
import { useFormContext } from "react-hook-form";

export function ExperienceUploadsStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const hasInternshipExperience = watch("has_internship_experience");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Experience & Additional Information
        </h2>
        <p className="text-zinc-400 mb-6">
          Tell us about your practical experience and any additional information
          that might be relevant.
        </p>
      </div>

      {/* Internship Experience */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-3">
            Do you have internship experience?
          </label>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                {...register("has_internship_experience")}
                value="true"
                className="h-4 w-4 accent-yellow-400"
              />
              <span className="text-sm text-zinc-300">Yes</span>
            </label>
            <label className="flex items-center space-x-2">
              <input
                type="radio"
                {...register("has_internship_experience")}
                value="false"
                className="h-4 w-4 accent-yellow-400"
              />
              <span className="text-sm text-zinc-300">No</span>
            </label>
          </div>
        </div>

        {/* Internship Details - Show only if user has experience */}
        {hasInternshipExperience === "true" && (
          <div>
            <label
              htmlFor="internship_details"
              className="block text-sm font-medium text-zinc-300 mb-2"
            >
              Internship Details
            </label>
            <textarea
              id="internship_details"
              {...register("internship_details")}
              rows={4}
              placeholder="Please describe your internship experience(s), including:
• Company name and role
• Duration and key responsibilities
• Technologies/skills used
• Key achievements or projects
• What you learned"
              className={`w-full px-3 py-2 rounded-md shadow-sm border bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-500 outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 ${
                errors.internship_details ? "border-rose-500/60" : ""
              }`}
            />
            {errors.internship_details && (
              <p className="text-rose-400 text-sm mt-1">
                {errors.internship_details.message as string}
              </p>
            )}
            <p className="text-zinc-500 text-sm mt-1">Maximum 500 characters</p>
          </div>
        )}
      </div>

      {/* Additional Guidance */}
      <div className="rounded-lg p-4 border border-zinc-800 bg-zinc-950/40 backdrop-blur-sm">
        <h3 className="text-sm font-medium text-yellow-300 mb-2">
          💡 Profile Tips
        </h3>
        <ul className="text-sm text-zinc-300 space-y-1">
          <li>
            • A complete profile increases your visibility to alumni mentors
          </li>
          <li>
            • Be specific about your skills and interests to get better matches
          </li>
          <li>• Update your profile regularly as you learn new skills</li>
          <li>
            • Connect with alumni in your field of interest for career guidance
          </li>
        </ul>
      </div>

      {/* Data Privacy Notice */}
      <div className="rounded-lg p-4 border border-zinc-800 bg-zinc-950/40 backdrop-blur-sm">
        <h3 className="text-sm font-medium text-zinc-200 mb-2">
          🔒 Privacy & Data Usage
        </h3>
        <p className="text-sm text-zinc-400">
          Your profile information will be used to connect you with relevant
          alumni, opportunities, and resources. You can control the visibility
          of your profile and update your information at any time. We respect
          your privacy and will never share your data without your consent.
        </p>
      </div>
    </div>
  );
}
