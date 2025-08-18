"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
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
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-zinc-100 mb-4">
          Skills & Career Preferences
        </h2>
        <p className="text-zinc-400 mb-6">
          Help us understand your skills and career aspirations to connect you
          with relevant opportunities.
        </p>
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
      <div>
        <label
          htmlFor="career_goals"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Career Goals
        </label>
        <textarea
          id="career_goals"
          {...register("career_goals")}
          rows={3}
          placeholder="Describe your short-term and long-term career goals..."
          className={`w-full px-3 py-2 rounded-md shadow-sm border bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-500 outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 ${
            errors.career_goals ? "border-rose-500/60" : ""
          }`}
        />
        {errors.career_goals && (
          <p className="text-rose-400 text-sm mt-1">
            {errors.career_goals.message as string}
          </p>
        )}
        <p className="text-zinc-500 text-sm mt-1">Maximum 300 characters</p>
      </div>

      {/* Preferred Job Types */}
      <div>
        <label className="block text-sm font-medium text-zinc-300 mb-3">
          Preferred Job Types
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {JOB_TYPE_CHOICES.map((jobType) => (
            <label
              key={jobType.value}
              className="flex items-center gap-2 rounded-md border border-zinc-800 bg-zinc-950/40 px-3 py-2 hover:bg-zinc-900/50 transition-colors"
            >
              <input
                type="checkbox"
                checked={preferredJobTypes.includes(jobType.value)}
                onChange={(e) =>
                  handleJobTypeChange(jobType.value, e.target.checked)
                }
                className="h-4 w-4 accent-yellow-400 rounded"
              />
              <span className="text-sm text-zinc-200">{jobType.label}</span>
            </label>
          ))}
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
      <div>
        <label
          htmlFor="extracurricular_activities"
          className="block text-sm font-medium text-zinc-300 mb-2"
        >
          Extracurricular Activities
        </label>
        <textarea
          id="extracurricular_activities"
          {...register("extracurricular_activities")}
          rows={3}
          placeholder="Clubs, societies, volunteer work, sports, etc."
          className={`w-full px-3 py-2 rounded-md shadow-sm border bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-500 outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 ${
            errors.extracurricular_activities ? "border-rose-500/60" : ""
          }`}
        />
        {errors.extracurricular_activities && (
          <p className="text-rose-400 text-sm mt-1">
            {errors.extracurricular_activities.message as string}
          </p>
        )}
        <p className="text-zinc-500 text-sm mt-1">Maximum 300 characters</p>
      </div>
    </div>
  );
}
