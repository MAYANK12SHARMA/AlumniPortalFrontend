"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { ProfilePictureUploader } from "@/components/ui/profile-picture-uploader";

export function PersonalInfoStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();
  const profilePicture = watch("profile_picture");

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      {/* Heading */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-950 via-black to-zinc-950 p-6">
        <div className="absolute -top-16 -right-20 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl" />
        <div className="absolute -bottom-16 -left-20 h-40 w-40 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative">
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-2">
            Personal Information
          </h2>
          <p className="text-zinc-400 text-sm">
            Let&apos;s start with your basic details so alumni and peers can
            recognize you.
          </p>
        </div>
      </div>

      {/* Profile Picture */}
      <div className="flex justify-center">
        <ProfilePictureUploader
          currentImageUrl={profilePicture}
          onImageUploaded={(url) => setValue("profile_picture", url)}
          onImageRemoved={() => setValue("profile_picture", "")}
        />
      </div>

      {/* Name Fields */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="first_name"
            className="text-xs uppercase tracking-wide text-zinc-400 font-medium"
          >
            First Name *
          </label>
          <Input
            id="first_name"
            {...register("first_name")}
            placeholder="Your first name"
            className={`bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus-visible:ring-yellow-400/40 ${
              errors.first_name ? "border-rose-500/60" : ""
            }`}
          />
          {errors.first_name && (
            <p className="text-rose-400 text-xs">
              {errors.first_name.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="last_name"
            className="text-xs uppercase tracking-wide text-zinc-400 font-medium"
          >
            Last Name *
          </label>
          <Input
            id="last_name"
            {...register("last_name")}
            placeholder="Your last name"
            className={`bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus-visible:ring-yellow-400/40 ${
              errors.last_name ? "border-rose-500/60" : ""
            }`}
          />
          {errors.last_name && (
            <p className="text-rose-400 text-xs">
              {errors.last_name.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <label
            htmlFor="phone"
            className="text-xs uppercase tracking-wide text-zinc-400 font-medium"
          >
            Phone Number
          </label>
          <Input
            id="phone"
            {...register("phone")}
            placeholder="+1 (555) 123-4567"
            className={`bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus-visible:ring-yellow-400/40 ${
              errors.phone ? "border-rose-500/60" : ""
            }`}
          />
          {errors.phone && (
            <p className="text-rose-400 text-xs">
              {errors.phone.message as string}
            </p>
          )}
        </div>
        <div className="space-y-2">
          <label
            htmlFor="location"
            className="text-xs uppercase tracking-wide text-zinc-400 font-medium"
          >
            Location
          </label>
          <Input
            id="location"
            {...register("location")}
            placeholder="City, State"
            className={`bg-zinc-950/60 border-zinc-800 text-zinc-100 placeholder-zinc-600 focus-visible:ring-yellow-400/40 ${
              errors.location ? "border-rose-500/60" : ""
            }`}
          />
          {errors.location && (
            <p className="text-rose-400 text-xs">
              {errors.location.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Bio */}
      <div className="space-y-2">
        <label
          htmlFor="bio"
          className="text-xs uppercase tracking-wide text-zinc-400 font-medium"
        >
          Bio
        </label>
        <textarea
          id="bio"
          {...register("bio")}
          rows={5}
          placeholder="Tell us about yourself, your interests, and what you're looking to achieve..."
          className={`w-full rounded-md bg-zinc-950/60 border border-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400/40 resize-none ${
            errors.bio ? "border-rose-500/60" : ""
          }`}
        />
        {errors.bio && (
          <p className="text-rose-400 text-xs">
            {errors.bio.message as string}
          </p>
        )}
        <p className="text-[10px] tracking-wide text-zinc-500">
          Maximum 500 characters
        </p>
      </div>
    </motion.div>
  );
}
