"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { SkillsInput } from "@/components/ui/skills-input";
import { STUDENT_PROGRAM_CHOICES, SEMESTER_CHOICES } from "@/types";

const COMMON_COURSEWORK = [
  "Data Structures and Algorithms",
  "Computer Networks",
  "Database Management Systems",
  "Operating Systems",
  "Software Engineering",
  "Object-Oriented Programming",
  "Web Development",
  "Machine Learning",
  "Artificial Intelligence",
  "Computer Graphics",
  "Cybersecurity",
  "Mobile App Development",
  "Cloud Computing",
  "Data Science",
  "Business Analytics",
  "Financial Accounting",
  "Marketing Management",
  "Operations Research",
  "Project Management",
  "Digital Marketing",
];

export function AcademicInfoStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const majorCoursework = watch("major_coursework") || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Academic Information
        </h2>
        <p className="text-gray-600 mb-6">
          Tell us about your academic background and current studies.
        </p>
      </div>

      {/* Program and Semester */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="program"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Program *
          </label>
          <select
            id="program"
            {...register("program")}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.program ? "border-red-500" : ""
            }`}
          >
            <option value="">Select your program</option>
            {STUDENT_PROGRAM_CHOICES.map((program) => (
              <option key={program.value} value={program.value}>
                {program.label}
              </option>
            ))}
          </select>
          {errors.program && (
            <p className="text-red-500 text-sm mt-1">
              {errors.program.message as string}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="current_semester"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Current Semester *
          </label>
          <select
            id="current_semester"
            {...register("current_semester", { valueAsNumber: true })}
            className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
              errors.current_semester ? "border-red-500" : ""
            }`}
          >
            <option value="">Select semester</option>
            {SEMESTER_CHOICES.map((semester) => (
              <option key={semester.value} value={semester.value}>
                {semester.label}
              </option>
            ))}
          </select>
          {errors.current_semester && (
            <p className="text-red-500 text-sm mt-1">
              {errors.current_semester.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Batch Year and CGPA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="batch_year"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Batch Year
          </label>
          <Input
            id="batch_year"
            type="number"
            {...register("batch_year", { valueAsNumber: true })}
            placeholder="2024"
            min="2000"
            max="2030"
            className={errors.batch_year ? "border-red-500" : ""}
          />
          {errors.batch_year && (
            <p className="text-red-500 text-sm mt-1">
              {errors.batch_year.message as string}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="cgpa"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Current CGPA
          </label>
          <Input
            id="cgpa"
            type="number"
            step="0.01"
            {...register("cgpa", { valueAsNumber: true })}
            placeholder="8.5"
            min="0"
            max="10"
            className={errors.cgpa ? "border-red-500" : ""}
          />
          {errors.cgpa && (
            <p className="text-red-500 text-sm mt-1">
              {errors.cgpa.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Expected Graduation */}
      <div>
        <label
          htmlFor="expected_graduation"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Expected Graduation Date
        </label>
        <Input
          id="expected_graduation"
          type="date"
          {...register("expected_graduation")}
          className={errors.expected_graduation ? "border-red-500" : ""}
        />
        {errors.expected_graduation && (
          <p className="text-red-500 text-sm mt-1">
            {errors.expected_graduation.message as string}
          </p>
        )}
      </div>

      {/* Major Coursework */}
      <SkillsInput
        label="Major Coursework"
        value={majorCoursework}
        onChange={(coursework) => setValue("major_coursework", coursework)}
        placeholder="Add a course..."
        maxSkills={15}
        suggestions={COMMON_COURSEWORK}
      />

      {/* Academic Achievements */}
      <div>
        <label
          htmlFor="academic_achievements"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Academic Achievements
        </label>
        <textarea
          id="academic_achievements"
          {...register("academic_achievements")}
          rows={3}
          placeholder="Dean's List, scholarships, academic awards, research publications, etc."
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.academic_achievements ? "border-red-500" : ""
          }`}
        />
        {errors.academic_achievements && (
          <p className="text-red-500 text-sm mt-1">
            {errors.academic_achievements.message as string}
          </p>
        )}
        <p className="text-gray-500 text-sm mt-1">Maximum 300 characters</p>
      </div>
    </div>
  );
}
