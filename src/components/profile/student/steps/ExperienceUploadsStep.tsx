"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";

export function ExperienceUploadsStep() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext();

  const hasInternshipExperience = watch("has_internship_experience");

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
            Experience & Additional Information
          </h2>
          <p className="text-sm text-zinc-400">
            Share your practical experience and relevant supporting details.
          </p>
        </div>
      </div>

      {/* Internship Experience */}
      <div className="space-y-6">
        <div>
          <label className="text-xs uppercase tracking-wide text-zinc-400 font-medium mb-3 block">Internship Experience</label>
          <div className="flex flex-wrap gap-4">
            {[["true","Yes"],["false","No"]].map(([val,label]) => {
              const checked = String(hasInternshipExperience) === val;
              return (
                <button
                  type="button"
                  key={val}
                  onClick={() => (document.getElementById(val+"_internship_radio") as HTMLInputElement)?.click()}
                  className={`relative px-4 py-2 rounded-md border text-xs font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 ${checked ? "border-yellow-400/60 bg-yellow-400/10 text-yellow-200" : "border-zinc-800 bg-zinc-950/40 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"}`}
                >
                  <span className="relative z-10">{label}</span>
                  <input id={val+"_internship_radio"} className="hidden" type="radio" value={val} {...register("has_internship_experience")} />
                  {checked && <span className="absolute inset-0 rounded-md bg-gradient-to-br from-yellow-400/10 to-amber-500/10" />}
                </button>
              );
            })}
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
      <div className="rounded-lg p-5 border border-zinc-800 bg-zinc-950/40 backdrop-blur-sm">
        <h3 className="text-sm font-medium text-yellow-300 mb-2">💡 Profile Tips</h3>
        <ul className="text-xs text-zinc-300 space-y-1 leading-relaxed">
          <li>• Complete profiles get more alumni engagement</li>
          <li>• Be specific about skills & interests for better matches</li>
          <li>• Update frequently as you gain new experience</li>
          <li>• Reach out to alumni mentors early</li>
        </ul>
      </div>

      {/* Data Privacy Notice */}
      <div className="rounded-lg p-5 border border-zinc-800 bg-zinc-950/40 backdrop-blur-sm">
        <h3 className="text-sm font-medium text-zinc-200 mb-2">🔒 Privacy & Data Usage</h3>
        <p className="text-xs text-zinc-400 leading-relaxed">
          Your profile helps us surface the most relevant alumni connections & opportunities. You retain control and can update or remove content at any time.
        </p>
      </div>
    </motion.div>
  );
}
