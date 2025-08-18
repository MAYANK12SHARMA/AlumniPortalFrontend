"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { STUDENT_PROGRAM_CHOICES } from "@/types";

// Generate graduation year choices from 1990 to current year + 5
const currentYear = new Date().getFullYear();
const GRADUATION_YEAR_CHOICES = Array.from(
  { length: currentYear - 1989 },
  (_, i) => {
    const year = currentYear - i;
    return { value: year, label: year.toString() };
  }
);

export function AlumniAcademicBackgroundStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Academic Background
        </h2>
        <p className="text-gray-600 mb-6">
          Tell us about your educational background. This helps students
          understand your academic journey.
        </p>
      </div>

      {/* Graduation Year and Degree */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="graduation_year"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Graduation Year *
          </label>
          <select
            id="graduation_year"
            {...register("graduation_year", { valueAsNumber: true })}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.graduation_year ? "border-red-500" : ""
            }`}
          >
            <option value="">Select graduation year</option>
            {GRADUATION_YEAR_CHOICES.map((year) => (
              <option key={year.value} value={year.value}>
                {year.label}
              </option>
            ))}
          </select>
          {errors.graduation_year && (
            <p className="text-red-500 text-sm mt-1">
              {errors.graduation_year.message as string}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="degree"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Degree Program *
          </label>
          <select
            id="degree"
            {...register("degree")}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.degree ? "border-red-500" : ""
            }`}
          >
            <option value="">Select your degree</option>
            {STUDENT_PROGRAM_CHOICES.map((program) => (
              <option key={program.value} value={program.value}>
                {program.label}
              </option>
            ))}
          </select>
          {errors.degree && (
            <p className="text-red-500 text-sm mt-1">
              {errors.degree.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Specialization */}
      <div>
        <label
          htmlFor="specialization"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Specialization/Major
        </label>
        <Input
          id="specialization"
          {...register("specialization")}
          placeholder="e.g., Computer Science, Information Technology, Finance, Marketing"
          className={errors.specialization ? "border-red-500" : ""}
        />
        {errors.specialization && (
          <p className="text-red-500 text-sm mt-1">
            {errors.specialization.message as string}
          </p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          Specify your field of study or specialization within your degree
          program
        </p>
      </div>

      {/* Academic Context Note */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-gray-800 mb-2">
          📚 Why Academic Background Matters
        </h3>
        <p className="text-sm text-gray-600">
          Your academic background helps students understand your educational
          journey and connect with alumni who share similar academic paths.
          Students often seek guidance from alumni who have graduated from the
          same program or have expertise in their field of interest.
        </p>
      </div>

      {/* Additional Academic Info Placeholder */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          💡 Academic Journey Tips
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>
            • Your degree information helps students find relevant mentors
          </li>
          <li>
            • Specialization details help match you with students in similar
            fields
          </li>
          <li>• This information is used for alumni directory filtering</li>
          <li>
            • Students often search for alumni by graduation year and program
          </li>
        </ul>
      </div>
    </div>
  );
}
