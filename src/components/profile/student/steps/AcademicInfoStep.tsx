"use client";

import React from "react";
import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-8"
    >
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-6">
        <div className="absolute -top-16 -right-24 h-44 w-44 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute -bottom-20 -left-24 h-44 w-44 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-amber-300 to-orange-400 mb-2">
            Academic Information
          </h2>
          <p className="text-sm text-zinc-400">
            Tell us about your academic background and current studies.
          </p>
        </div>
      </div>

      {/* Program and Semester */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="program"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            Program *
          </label>
          <select
            id="program"
            {...register("program")}
            className={`w-full px-3 py-2 rounded-md shadow-sm border bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-600 outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 ${
              errors.program ? "border-rose-500/60" : ""
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
            <p className="text-rose-400 text-sm mt-1">
              {errors.program.message as string}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="current_semester"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            Current Semester *
          </label>
          <select
            id="current_semester"
            {...register("current_semester", { valueAsNumber: true })}
            className={`w-full px-3 py-2 rounded-md shadow-sm border bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-600 outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 ${
              errors.current_semester ? "border-rose-500/60" : ""
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
            <p className="text-rose-400 text-sm mt-1">
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
            className="block text-sm font-medium text-zinc-300 mb-2"
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
            className={`bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-600 ${
              errors.batch_year ? "border-rose-500/60" : ""
            }`}
          />
          {errors.batch_year && (
            <p className="text-rose-400 text-sm mt-1">
              {errors.batch_year.message as string}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="cgpa"
            className="block text-sm font-medium text-zinc-300 mb-2"
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
            className={`bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-600 ${
              errors.cgpa ? "border-rose-500/60" : ""
            }`}
          />
          {errors.cgpa && (
            <p className="text-rose-400 text-sm mt-1">
              {errors.cgpa.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Expected Graduation */}
      <div>
        <label
          htmlFor="expected_graduation"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Expected Graduation Date
        </label>
        <Input
          id="expected_graduation"
          type="date"
          {...register("expected_graduation")}
          className={`bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-600 ${
            errors.expected_graduation ? "border-rose-500/60" : ""
          }`}
        />
        {errors.expected_graduation && (
          <p className="text-rose-400 text-sm mt-1">
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
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Academic Achievements
        </label>
        <textarea
          id="academic_achievements"
          {...register("academic_achievements")}
          rows={3}
          placeholder="Dean's List, scholarships, academic awards, research publications, etc."
          className={`w-full px-3 py-2 rounded-md shadow-sm border bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-600 outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 ${
            errors.academic_achievements ? "border-rose-500/60" : ""
          }`}
        />
        {errors.academic_achievements && (
          <p className="text-rose-400 text-sm mt-1">
            {errors.academic_achievements.message as string}
          </p>
        )}
        <p className="text-zinc-500 text-xs mt-1">Maximum 300 characters</p>
      </div>
  </motion.div>
  );
}
