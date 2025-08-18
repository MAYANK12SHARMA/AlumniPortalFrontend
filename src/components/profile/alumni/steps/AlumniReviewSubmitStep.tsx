"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import {
  Edit2,
  User,
  GraduationCap,
  Briefcase,
  Target,
  Shield,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  STUDENT_PROGRAM_CHOICES,
  INDUSTRY_CHOICES,
  EXPERIENCE_CHOICES,
} from "@/types";
import Image from "next/image";

export function AlumniReviewSubmitStep() {
  const { watch } = useFormContext();

  const formData = watch();

  // Helper functions to get display labels
  const getProgramLabel = (value: string) => {
    return (
      STUDENT_PROGRAM_CHOICES.find((p) => p.value === value)?.label || value
    );
  };

  const getIndustryLabel = (value: string) => {
    return INDUSTRY_CHOICES.find((i) => i.value === value)?.label || value;
  };

  const getExperienceLabel = (value: string) => {
    return EXPERIENCE_CHOICES.find((e) => e.value === value)?.label || value;
  };

  const getCommunicationLabels = (values: string[]) => {
    const methods = [
      { value: "email", label: "Email" },
      { value: "linkedin", label: "LinkedIn" },
      { value: "phone", label: "Phone" },
      { value: "video_call", label: "Video Call" },
      { value: "in_person", label: "In Person" },
      { value: "whatsapp", label: "WhatsApp" },
    ];
    return values.map(
      (value) => methods.find((m) => m.value === value)?.label || value
    );
  };

  const handleEditStep = (stepNumber: number) => {
    // This would be handled by the parent wizard component
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Review Your Alumni Profile
        </h2>
        <p className="text-gray-600 mb-6">
          Please review all the information below. Your profile will be
          submitted for admin review before being made visible to students.
        </p>
      </div>

      {/* Personal Information Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <User className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Personal Information
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleEditStep(1)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Profile Picture and Basic Info */}
          <div className="space-y-4">
            {formData.profile_picture && (
              <div className="flex justify-center">
                <div className="w-24 h-24 rounded-full overflow-hidden">
                  <Image
                    src={formData.profile_picture}
                    alt="Profile"
                    width={96}
                    height={96}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium">
                {formData.first_name} {formData.last_name}
              </p>
            </div>
            {formData.phone_number && (
              <div>
                <p className="text-sm text-gray-600">Phone</p>
                <p className="font-medium">{formData.phone_number}</p>
              </div>
            )}
            {formData.location && (
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-medium">{formData.location}</p>
              </div>
            )}
            {formData.linkedin_url && (
              <div>
                <p className="text-sm text-gray-600">LinkedIn</p>
                <a
                  href={formData.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm break-all"
                >
                  {formData.linkedin_url}
                </a>
              </div>
            )}
          </div>

          {/* Bio */}
          <div>
            {formData.bio && (
              <div>
                <p className="text-sm text-gray-600">Professional Bio</p>
                <p className="text-gray-900">{formData.bio}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Academic Background Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Academic Background
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleEditStep(2)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {formData.graduation_year && (
            <div>
              <p className="text-sm text-gray-600">Graduation Year</p>
              <p className="font-medium">{formData.graduation_year}</p>
            </div>
          )}
          {formData.degree && (
            <div>
              <p className="text-sm text-gray-600">Degree</p>
              <p className="font-medium">{getProgramLabel(formData.degree)}</p>
            </div>
          )}
          {formData.specialization && (
            <div>
              <p className="text-sm text-gray-600">Specialization</p>
              <p className="font-medium">{formData.specialization}</p>
            </div>
          )}
        </div>
      </div>

      {/* Professional Information Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Professional Information
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleEditStep(3)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        <div className="space-y-6">
          {/* Current Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {formData.current_company && (
              <div>
                <p className="text-sm text-gray-600">Current Company</p>
                <p className="font-medium">{formData.current_company}</p>
              </div>
            )}
            {formData.current_position && (
              <div>
                <p className="text-sm text-gray-600">Current Position</p>
                <p className="font-medium">{formData.current_position}</p>
              </div>
            )}
            {formData.industry && (
              <div>
                <p className="text-sm text-gray-600">Industry</p>
                <p className="font-medium">
                  {getIndustryLabel(formData.industry)}
                </p>
              </div>
            )}
            {formData.experience_years && (
              <div>
                <p className="text-sm text-gray-600">Experience</p>
                <p className="font-medium">
                  {getExperienceLabel(formData.experience_years)}
                </p>
              </div>
            )}
          </div>

          {/* Achievements */}
          {formData.notable_achievements && (
            <div>
              <p className="text-sm text-gray-600">Notable Achievements</p>
              <p className="text-gray-900">{formData.notable_achievements}</p>
            </div>
          )}

          {/* Career Path */}
          {formData.career_path && formData.career_path.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-3">Career Path</p>
              <div className="space-y-3">
                {formData.career_path.map((item: any, index: number) => (
                  <div key={index} className="bg-gray-50 rounded-md p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium text-sm">{item.position}</p>
                      <p className="text-xs text-gray-500">
                        {item.start_date} - {item.end_date || "Present"}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{item.company}</p>
                    {item.description && (
                      <p className="text-xs text-gray-500">
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Skills & Networking Section */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-medium text-gray-900">
              Skills & Networking
            </h3>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => handleEditStep(4)}
            className="text-blue-600 hover:text-blue-700"
          >
            <Edit2 className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>

        <div className="space-y-6">
          {/* Expertise Areas */}
          {formData.expertise_areas && formData.expertise_areas.length > 0 && (
            <div>
              <p className="text-sm text-gray-600 mb-2">Expertise Areas</p>
              <div className="flex flex-wrap gap-2">
                {formData.expertise_areas.map((area: string) => (
                  <Badge key={area} variant="outline" className="text-xs">
                    {area}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Mentoring & Referrals */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <p className="text-sm text-gray-600">Willing to Mentor</p>
              <p className="font-medium text-sm">
                {formData.willing_to_mentor ? "Yes" : "No"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Can Provide Referrals</p>
              <p className="font-medium text-sm">
                {formData.can_provide_referrals ? "Yes" : "No"}
              </p>
            </div>
          </div>

          {/* Mentoring Topics */}
          {formData.willing_to_mentor &&
            formData.preferred_mentoring_topics &&
            formData.preferred_mentoring_topics.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Preferred Mentoring Topics
                </p>
                <div className="flex flex-wrap gap-2">
                  {formData.preferred_mentoring_topics.map((topic: string) => (
                    <Badge key={topic} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

          {/* Communication Preferences */}
          {formData.available_for_networking &&
            formData.preferred_communication &&
            formData.preferred_communication.length > 0 && (
              <div>
                <p className="text-sm text-gray-600 mb-2">
                  Preferred Communication
                </p>
                <div className="flex flex-wrap gap-2">
                  {getCommunicationLabels(formData.preferred_communication).map(
                    (method: string) => (
                      <Badge key={method} variant="outline" className="text-xs">
                        {method}
                      </Badge>
                    )
                  )}
                </div>
              </div>
            )}
        </div>
      </div>

      {/* Verification Notice */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-start space-x-3">
          <Shield className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div>
            <h3 className="text-sm font-medium text-yellow-800 mb-2">
              Profile Verification Process
            </h3>
            <p className="text-sm text-yellow-700">
              Your alumni profile will be reviewed by our administrators to
              ensure authenticity. This process typically takes 1-3 business
              days. You'll receive an email notification once your profile is
              approved and made visible to students.
            </p>
          </div>
        </div>
      </div>

      {/* Submission Benefits */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-800 mb-2">
          🎉 Ready to Make an Impact
        </h3>
        <p className="text-sm text-green-700 mb-3">
          Once approved, your profile will help students:
        </p>
        <ul className="text-sm text-green-700 space-y-1">
          <li>• Find mentors in their field of interest</li>
          <li>• Learn about career paths and opportunities</li>
          <li>• Connect with professionals for networking</li>
          <li>• Get guidance on skills and career development</li>
        </ul>
      </div>
    </div>
  );
}
