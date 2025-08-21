"use client";

import React from "react";
import { useFormContext } from "react-hook-form";
import { SkillsInput } from "@/components/ui/skills-input";
import { Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const EXPERTISE_SUGGESTIONS = [
  "Software Development",
  "Data Science",
  "Machine Learning",
  "AI/ML",
  "Cybersecurity",
  "Cloud Computing",
  "DevOps",
  "Product Management",
  "Project Management",
  "Agile/Scrum",
  "Business Strategy",
  "Digital Marketing",
  "Financial Analysis",
  "Investment Banking",
  "Consulting",
  "Sales",
  "Customer Success",
  "HR/Recruiting",
  "Legal",
  "Healthcare",
  "Research & Development",
  "Quality Assurance",
  "UX/UI Design",
  "Mobile Development",
  "Web Development",
  "Database Management",
  "Network Security",
  "Business Intelligence",
];

const MENTORING_TOPICS_SUGGESTIONS = [
  "Career Planning",
  "Interview Preparation",
  "Resume Review",
  "Job Search Strategy",
  "Technical Skills Development",
  "Leadership Skills",
  "Communication Skills",
  "Networking",
  "Work-Life Balance",
  "Entrepreneurship",
  "Startup Advice",
  "Industry Insights",
  "Company Culture",
  "Salary Negotiation",
  "Career Transition",
  "Graduate School Advice",
  "Certification Guidance",
  "Portfolio Development",
];

const COMMUNICATION_METHODS = [
  { value: "email", label: "Email" },
  { value: "linkedin", label: "LinkedIn Messages" },
  { value: "phone", label: "Phone Calls" },
  { value: "video_call", label: "Video Calls (Zoom, Teams)" },
  { value: "in_person", label: "In-Person Meetings" },
  { value: "whatsapp", label: "WhatsApp" },
];

interface CareerPathItem {
  company: string;
  position: string;
  start_date: string;
  end_date: string;
  description: string;
}

export function AlumniSkillsNetworkingStep() {
  const {
    register,
    watch,
    setValue,
    formState: { errors: _errors },
  } = useFormContext();

  const expertiseAreas = watch("expertise_areas") || [];
  const preferredMentoringTopics = watch("preferred_mentoring_topics") || [];
  const willingToMentor = watch("willing_to_mentor");
  // const canProvideReferrals = watch("can_provide_referrals"); // not directly used; kept for potential future logic
  const availableForNetworking = watch("available_for_networking");
  const preferredCommunication = watch("preferred_communication") || [];
  const careerPath = watch("career_path") || [];

  const handleCommunicationChange = (method: string, checked: boolean) => {
    if (checked) {
      setValue("preferred_communication", [...preferredCommunication, method]);
    } else {
      setValue(
        "preferred_communication",
        preferredCommunication.filter((m: string) => m !== method)
      );
    }
  };

  const addCareerPathItem = () => {
    const newItem: CareerPathItem = {
      company: "",
      position: "",
      start_date: "",
      end_date: "",
      description: "",
    };
    setValue("career_path", [...careerPath, newItem]);
  };

  const removeCareerPathItem = (index: number) => {
    setValue(
      "career_path",
      careerPath.filter((_: any, i: number) => i !== index)
    );
  };

  const updateCareerPathItem = (
    index: number,
    field: keyof CareerPathItem,
    value: string
  ) => {
    const updated = [...careerPath];
    updated[index] = { ...updated[index], [field]: value };
    setValue("career_path", updated);
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Skills & Networking Preferences
        </h2>
        <p className="text-gray-600 mb-6">
          Help students understand your expertise and how you&apos;d like to
          contribute to the alumni network.
        </p>
      </div>

      {/* Expertise Areas */}
      <SkillsInput
        label="Expertise Areas"
        value={expertiseAreas}
        onChange={(areas) => setValue("expertise_areas", areas)}
        placeholder="Add an expertise area..."
        maxSkills={15}
        suggestions={EXPERTISE_SUGGESTIONS}
      />

      {/* Mentoring Preferences */}
      <div className="space-y-4">
        <div className="flex items-center space-x-6">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register("willing_to_mentor")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              I&apos;m willing to mentor students
            </span>
          </label>

          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              {...register("can_provide_referrals")}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <span className="text-sm font-medium text-gray-700">
              I can provide job referrals
            </span>
          </label>
        </div>

        {willingToMentor && watch("can_provide_referrals") && (
          <SkillsInput
            label="Preferred Mentoring Topics"
            value={preferredMentoringTopics}
            onChange={(topics) =>
              setValue("preferred_mentoring_topics", topics)
            }
            placeholder="Add a mentoring topic..."
            maxSkills={10}
            suggestions={MENTORING_TOPICS_SUGGESTIONS}
          />
        )}
      </div>

      {/* Networking Availability */}
      <div className="space-y-4">
        <label className="flex items-center space-x-2">
          <input
            type="checkbox"
            {...register("available_for_networking")}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <span className="text-sm font-medium text-gray-700">
            I&apos;m available for networking with students and other alumni
          </span>
        </label>

        {availableForNetworking && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Preferred Communication Methods
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COMMUNICATION_METHODS.map((method) => (
                <label
                  key={method.value}
                  className="flex items-center space-x-2"
                >
                  <input
                    type="checkbox"
                    checked={preferredCommunication.includes(method.value)}
                    onChange={(e) =>
                      handleCommunicationChange(method.value, e.target.checked)
                    }
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <span className="text-sm text-gray-700">{method.label}</span>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Career Path */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <label className="block text-sm font-medium text-gray-700">
            Career Path (Optional)
          </label>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addCareerPathItem}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Position
          </Button>
        </div>

        <p className="text-gray-500 text-sm">
          Share your career journey to help students understand potential career
          progressions.
        </p>

        {careerPath.map((item: CareerPathItem, index: number) => (
          <div
            key={index}
            className="bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-900">
                Position {index + 1}
              </h4>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeCareerPathItem(index)}
                className="text-red-600 hover:text-red-700"
              >
                <Minus className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                placeholder="Company name"
                value={item.company}
                onChange={(e) =>
                  updateCareerPathItem(index, "company", e.target.value)
                }
              />
              <Input
                placeholder="Position/Role"
                value={item.position}
                onChange={(e) =>
                  updateCareerPathItem(index, "position", e.target.value)
                }
              />
              <Input
                type="month"
                placeholder="Start date"
                value={item.start_date}
                onChange={(e) =>
                  updateCareerPathItem(index, "start_date", e.target.value)
                }
              />
              <Input
                type="month"
                placeholder="End date"
                value={item.end_date}
                onChange={(e) =>
                  updateCareerPathItem(index, "end_date", e.target.value)
                }
              />
            </div>
            <textarea
              placeholder="Brief description of role and key achievements..."
              value={item.description}
              onChange={(e) =>
                updateCareerPathItem(index, "description", e.target.value)
              }
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        ))}
      </div>

      {/* Mentoring Impact */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-purple-800 mb-2">
          🌟 Your Impact as a Mentor
        </h3>
        <p className="text-sm text-purple-700">
          As an alumni mentor, you have the unique opportunity to shape the next
          generation of professionals. Your guidance can help students navigate
          career decisions, develop skills, and build confidence in their chosen
          fields.
        </p>
      </div>

      {/* Networking Benefits */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
        <h3 className="text-sm font-medium text-green-800 mb-2">
          🤝 Networking Benefits
        </h3>
        <ul className="text-sm text-green-700 space-y-1">
          <li>
            • Connect with talented students for potential hiring opportunities
          </li>
          <li>
            • Expand your professional network within the alumni community
          </li>
          <li>• Give back to your alma mater and support student success</li>
          <li>
            • Stay connected with industry trends through student perspectives
          </li>
        </ul>
      </div>
    </div>
  );
}
