"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { ProfilePictureUploader } from "@/components/ui/profile-picture-uploader";

export function AlumniPersonalInfoStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors },
  } = useFormContext();

  const profilePicture = watch("profile_picture");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Personal Information
        </h2>
        <p className="text-gray-600 mb-6">
          Tell us about yourself. This information will help students and other
          alumni connect with you.
        </p>
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="first_name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            First Name *
          </label>
          <Input
            id="first_name"
            {...register("first_name")}
            placeholder="Enter your first name"
            className={errors.first_name ? "border-red-500" : ""}
          />
          {errors.first_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.first_name.message as string}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="last_name"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Last Name *
          </label>
          <Input
            id="last_name"
            {...register("last_name")}
            placeholder="Enter your last name"
            className={errors.last_name ? "border-red-500" : ""}
          />
          {errors.last_name && (
            <p className="text-red-500 text-sm mt-1">
              {errors.last_name.message as string}
            </p>
          )}
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label
            htmlFor="phone_number"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Phone Number
          </label>
          <Input
            id="phone_number"
            {...register("phone_number")}
            placeholder="+1 (555) 123-4567"
            className={errors.phone_number ? "border-red-500" : ""}
          />
          {errors.phone_number && (
            <p className="text-red-500 text-sm mt-1">
              {errors.phone_number.message as string}
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Current Location
          </label>
          <Input
            id="location"
            {...register("location")}
            placeholder="City, State/Country"
            className={errors.location ? "border-red-500" : ""}
          />
          {errors.location && (
            <p className="text-red-500 text-sm mt-1">
              {errors.location.message as string}
            </p>
          )}
        </div>
      </div>

      {/* LinkedIn URL */}
      <div>
        <label
          htmlFor="linkedin_url"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          LinkedIn Profile URL
        </label>
        <Input
          id="linkedin_url"
          {...register("linkedin_url")}
          placeholder="https://linkedin.com/in/yourprofile"
          className={errors.linkedin_url ? "border-red-500" : ""}
        />
        {errors.linkedin_url && (
          <p className="text-red-500 text-sm mt-1">
            {errors.linkedin_url.message as string}
          </p>
        )}
        <p className="text-gray-500 text-sm mt-1">
          This will help with profile verification and networking
        </p>
      </div>

      {/* Bio */}
      <div>
        <label
          htmlFor="bio"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Professional Bio
        </label>
        <textarea
          id="bio"
          {...register("bio")}
          rows={4}
          placeholder="Share your professional journey, achievements, and what you're passionate about. This will be one of the first things students see about you..."
          className={`w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 ${
            errors.bio ? "border-red-500" : ""
          }`}
        />
        {errors.bio && (
          <p className="text-red-500 text-sm mt-1">
            {errors.bio.message as string}
          </p>
        )}
        <p className="text-gray-500 text-sm mt-1">Maximum 500 characters</p>
      </div>

      {/* Professional Tip */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          💡 Professional Profile Tips
        </h3>
        <ul className="text-sm text-blue-700 space-y-1">
          <li>• Use a professional photo that represents you well</li>
          <li>
            • Write a compelling bio that highlights your unique value
            proposition
          </li>
          <li>
            • Include your LinkedIn profile for credibility and networking
          </li>
          <li>
            • Keep your contact information current for networking opportunities
          </li>
        </ul>
      </div>
    </div>
  );
}
