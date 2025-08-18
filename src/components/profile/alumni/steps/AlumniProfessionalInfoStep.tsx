"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { INDUSTRY_CHOICES, EXPERIENCE_CHOICES } from "@/types";

export function AlumniProfessionalInfoStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Professional Information
        </h2>
        <p className="text-gray-600 mb-6">
          Share your current professional status and career journey. This helps
          students understand your expertise areas.
        </p>
      </div>

      {/* Current Role Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="current_company"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Current Company
          </label>
          <Input
            id="current_company"
            {...register("current_company")}
            placeholder="e.g., Google, Microsoft, Accenture"
            className={errors.current_company ? "border-red-500" : ""}
          />
          {errors.current_company && (
            <p className="text-red-500 text-sm mt-1">
              {errors.current_company.message as string}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="current_position"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Current Position/Title
          </label>
          <Input
            id="current_position"
            {...register("current_position")}
            placeholder="e.g., Software Engineer, Product Manager, Consultant"
            className={errors.current_position ? "border-red-500" : ""}
          />
          {errors.current_position && (
            <p className="text-red-500 text-sm mt-1">
              {errors.current_position.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Industry and Experience */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="industry"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Industry
          </label>
          <select
            id="industry"
            {...register("industry")}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.industry ? "border-red-500" : ""
            }`}
          >
            <option value="">Select industry</option>
            {INDUSTRY_CHOICES.map((industry) => (
              <option key={industry.value} value={industry.value}>
                {industry.label}
              </option>
            ))}
          </select>
          {errors.industry && (
            <p className="text-red-500 text-sm mt-1">
              {errors.industry.message as string}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="experience_years"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Years of Experience
          </label>
          <select
            id="experience_years"
            {...register("experience_years")}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.experience_years ? "border-red-500" : ""
            }`}
          >
            <option value="">Select experience range</option>
            {EXPERIENCE_CHOICES.map((experience) => (
              <option key={experience.value} value={experience.value}>
                {experience.label}
              </option>
            ))}
          </select>
          {errors.experience_years && (
            <p className="text-red-500 text-sm mt-1">
              {errors.experience_years.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Notable Achievements */}
      <div>
        <label
          htmlFor="notable_achievements"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Notable Achievements
        </label>
        <textarea
          id="notable_achievements"
          {...register("notable_achievements")}
          rows={4}
          placeholder="Share your key professional achievements, awards, recognitions, successful projects, leadership roles, etc. This helps students understand your impact and expertise."
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.notable_achievements ? "border-red-500" : ""
          }`}
        />
        {errors.notable_achievements && (
          <p className="text-red-500 text-sm mt-1">
            {errors.notable_achievements.message as string}
          </p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          Examples: Led a team of 10, increased sales by 30%, published research
          papers, won innovation awards, promoted to senior role, started own
          company, etc.
        </p>
      </div>

      {/* Professional Journey Context */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-800 mb-2">
          🚀 Professional Impact
        </h3>
        <p className="text-sm text-green-700">
          Your professional information is crucial for students who want to
          understand potential career paths and learn from your experiences. Be
          specific about your role and achievements to provide valuable insights
          for students planning their careers.
        </p>
      </div>

      {/* Industry Guidance */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          💼 Career Insights
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • Industry information helps students explore different career paths
          </li>
          <li>
            • Your experience level helps set realistic expectations for
            students
          </li>
          <li>• Achievements showcase what's possible in your field</li>
          <li>• Students often seek mentors in their target industries</li>
        </ul>
      </div>
    </div>
  );
}
