"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { SkillsInput } from "@/components/ui/skills-input";
import { JOB_TYPE_CHOICES } from "@/types";

const TECHNICAL_SKILLS_SUGGESTIONS = [
  "JavaScript",
  "Python",
  "Java",
  "C++",
  "C#",
  "TypeScript",
  "Go",
  "Rust",
  "React",
  "Vue.js",
  "Angular",
  "Node.js",
  "Express.js",
  "Django",
  "Flask",
  "SQL",
  "MongoDB",
  "PostgreSQL",
  "MySQL",
  "Redis",
  "AWS",
  "Azure",
  "Google Cloud",
  "Docker",
  "Kubernetes",
  "Git",
  "Linux",
  "HTML/CSS",
  "REST APIs",
  "GraphQL",
  "Machine Learning",
  "Data Science",
  "Artificial Intelligence",
  "Mobile Development",
  "iOS",
  "Android",
  "React Native",
  "Flutter",
  "DevOps",
  "CI/CD",
  "Testing",
  "Agile",
  "Scrum",
];

const SOFT_SKILLS_SUGGESTIONS = [
  "Communication",
  "Leadership",
  "Teamwork",
  "Problem Solving",
  "Time Management",
  "Adaptability",
  "Critical Thinking",
  "Creativity",
  "Presentation Skills",
  "Public Speaking",
  "Negotiation",
  "Conflict Resolution",
  "Project Management",
  "Analytical Thinking",
  "Attention to Detail",
  "Customer Service",
  "Emotional Intelligence",
  "Mentoring",
];

const INTERESTS_SUGGESTIONS = [
  "Technology",
  "Innovation",
  "Startups",
  "Entrepreneurship",
  "Data Science",
  "AI/ML",
  "Cybersecurity",
  "Web Development",
  "Mobile Apps",
  "Game Development",
  "IoT",
  "Blockchain",
  "Finance",
  "Marketing",
  "Business Strategy",
  "Consulting",
  "Research",
  "Teaching",
  "Mentoring",
  "Community Service",
  "Travel",
  "Photography",
  "Music",
  "Sports",
  "Reading",
];

const LOCATION_SUGGESTIONS = [
  "Remote",
  "Hybrid",
  "New York, NY",
  "San Francisco, CA",
  "Seattle, WA",
  "Austin, TX",
  "Boston, MA",
  "Chicago, IL",
  "Los Angeles, CA",
  "Mumbai, India",
  "Bangalore, India",
  "Delhi, India",
  "Pune, India",
  "London, UK",
  "Toronto, Canada",
  "Berlin, Germany",
  "Singapore",
];

export function SkillsPreferencesStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const technicalSkills = watch("technical_skills") || [];
  const softSkills = watch("soft_skills") || [];
  const interests = watch("interests") || [];
  const preferredJobTypes = watch("preferred_job_types") || [];
  const preferredLocations = watch("preferred_locations") || [];
  const certifications = watch("certifications") || [];

  const handleJobTypeChange = (jobType: string, checked: boolean) => {
    if (checked) {
      setValue("preferred_job_types", [...preferredJobTypes, jobType]);
    } else {
      setValue(
        "preferred_job_types",
        preferredJobTypes.filter((type: string) => type !== jobType)
      );
    }
  };

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
            Skills & Career Preferences
          </h2>
          <p className="text-sm text-zinc-400">
            Help us understand your skills and aspirations for better matches.
          </p>
        </div>
      </div>

      {/* Technical Skills */}
      <SkillsInput
        label="Technical Skills"
        value={technicalSkills}
        onChange={(skills) => setValue("technical_skills", skills)}
        placeholder="Add a technical skill..."
        maxSkills={20}
        suggestions={TECHNICAL_SKILLS_SUGGESTIONS}
      />

      {/* Soft Skills */}
      <SkillsInput
        label="Soft Skills"
        value={softSkills}
        onChange={(skills) => setValue("soft_skills", skills)}
        placeholder="Add a soft skill..."
        maxSkills={15}
        suggestions={SOFT_SKILLS_SUGGESTIONS}
      />

      {/* Interests */}
      <SkillsInput
        label="Interests"
        value={interests}
        onChange={(skills) => setValue("interests", skills)}
        placeholder="Add an interest..."
        maxSkills={15}
        suggestions={INTERESTS_SUGGESTIONS}
      />

      {/* Career Goals */}
      <div className="space-y-2">
        <label htmlFor="career_goals" className="text-xs uppercase tracking-wide text-zinc-400 font-medium">
          Career Goals
        </label>
        <textarea
          id="career_goals"
          {...register("career_goals")}
          rows={4}
          placeholder="Describe your short-term and long-term career goals..."
          className={`w-full rounded-md bg-zinc-950/60 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 resize-none ${errors.career_goals ? "border-rose-500/60" : ""}`}
        />
        {errors.career_goals && (<p className="text-rose-400 text-xs">{errors.career_goals.message as string}</p>)}
        <p className="text-[10px] tracking-wide text-zinc-500">Maximum 300 characters</p>
      </div>

      {/* Preferred Job Types */}
      <div className="space-y-2">
        <label className="text-xs uppercase tracking-wide text-zinc-400 font-medium">Preferred Job Types</label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {JOB_TYPE_CHOICES.map(jobType => {
            const active = preferredJobTypes.includes(jobType.value);
            return (
              <button
                key={jobType.value}
                type="button"
                onClick={() => handleJobTypeChange(jobType.value, !active)}
                className={`group relative rounded-md border px-3 py-2 text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 ${active ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-200" : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"}`}
              >
                <span className="relative z-10">{jobType.label}</span>
                {active && <span className="absolute inset-0 rounded-md bg-gradient-to-br from-yellow-400/10 to-amber-500/10" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preferred Locations */}
      <SkillsInput
        label="Preferred Work Locations"
        value={preferredLocations}
        onChange={(locations) => setValue("preferred_locations", locations)}
        placeholder="Add a location..."
        maxSkills={10}
        suggestions={LOCATION_SUGGESTIONS}
      />

      {/* Certifications */}
      <SkillsInput
        label="Certifications"
        value={certifications}
        onChange={(certs) => setValue("certifications", certs)}
        placeholder="Add a certification..."
        maxSkills={10}
      />

      {/* Extracurricular Activities */}
      <div className="space-y-2">
        <label htmlFor="extracurricular_activities" className="text-xs uppercase tracking-wide text-zinc-400 font-medium">
          Extracurricular Activities
        </label>
        <textarea
          id="extracurricular_activities"
          {...register("extracurricular_activities")}
          rows={4}
          placeholder="Clubs, societies, volunteer work, sports, etc."
          className={`w-full rounded-md bg-zinc-950/60 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 resize-none ${errors.extracurricular_activities ? "border-rose-500/60" : ""}`}
        />
        {errors.extracurricular_activities && (<p className="text-rose-400 text-xs">{errors.extracurricular_activities.message as string}</p>)}
        <p className="text-[10px] tracking-wide text-zinc-500">Maximum 300 characters</p>
      </div>
    </motion.div>
  );
}
