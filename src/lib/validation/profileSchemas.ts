import * as yup from "yup";

// Common validation patterns
const requiredString = yup.string().required("This field is required");
const optionalString = yup.string();
const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;

// Student Profile Validation Schema
export const studentProfileValidation = {
  // Step 1: Personal Information
  personalInfo: yup.object({
    first_name: requiredString.max(
      50,
      "First name must be less than 50 characters"
    ),
    last_name: requiredString.max(
      50,
      "Last name must be less than 50 characters"
    ),
    phone: optionalString.matches(phoneRegex, "Phone number is not valid"),
    location: optionalString.max(
      100,
      "Location must be less than 100 characters"
    ),
    bio: optionalString.max(500, "Bio must be less than 500 characters"),
  }),

  // Step 2: Academic Information
  academicInfo: yup.object({
    program: requiredString.oneOf(
      [
        "btech",
        "bcom",
        "bba",
        "bca",
        "bsc",
        "ba",
        "mtech",
        "mba",
        "mca",
        "msc",
        "ma",
        "phd",
      ],
      "Please select a valid program"
    ),
    current_semester: yup
      .number()
      .required("Current semester is required")
      .min(1, "Semester must be between 1 and 12")
      .max(12, "Semester must be between 1 and 12"),
    batch_year: yup
      .number()
      .min(2000, "Batch year must be between 2000 and 2030")
      .max(2030, "Batch year must be between 2000 and 2030"),
    cgpa: yup
      .number()
      .min(0, "CGPA must be between 0 and 10")
      .max(10, "CGPA must be between 0 and 10"),
    expected_graduation: yup.date(),
    major_coursework: yup.array().of(yup.string()),
    academic_achievements: optionalString.max(
      300,
      "Academic achievements must be less than 300 characters"
    ),
  }),

  // Step 3: Skills and Preferences
  skillsAndPreferences: yup.object({
    technical_skills: yup.array().of(yup.string()),
    soft_skills: yup.array().of(yup.string()),
    interests: yup.array().of(yup.string()),
    career_goals: optionalString.max(
      300,
      "Career goals must be less than 300 characters"
    ),
    preferred_job_types: yup
      .array()
      .of(
        yup
          .string()
          .oneOf([
            "full_time",
            "part_time",
            "internship",
            "freelance",
            "contract",
            "remote",
            "hybrid",
          ])
      ),
    preferred_locations: yup.array().of(yup.string()),
    certifications: yup.array().of(yup.string()),
    extracurricular_activities: optionalString.max(
      300,
      "Extracurricular activities must be less than 300 characters"
    ),
  }),

  // Step 4: Experience
  experience: yup.object({
    has_internship_experience: yup.boolean(),
    internship_details: optionalString.max(
      500,
      "Internship details must be less than 500 characters"
    ),
  }),

  // Complete profile validation (all required fields)
  complete: yup.object({
    first_name: requiredString,
    last_name: requiredString,
    program: requiredString,
    current_semester: yup.number().required(),
  }),
};

// Alumni Profile Validation Schema
export const alumniProfileValidation = {
  // Step 1: Personal Information
  personalInfo: yup.object({
    first_name: requiredString.max(
      50,
      "First name must be less than 50 characters"
    ),
    last_name: requiredString.max(
      50,
      "Last name must be less than 50 characters"
    ),
    phone_number: optionalString.matches(
      phoneRegex,
      "Phone number is not valid"
    ),
    location: optionalString.max(
      100,
      "Location must be less than 100 characters"
    ),
    bio: optionalString.max(500, "Bio must be less than 500 characters"),
    linkedin_url: yup.string().url("Please enter a valid LinkedIn URL"),
  }),

  // Step 2: Academic Background
  academicBackground: yup.object({
    graduation_year: yup
      .number()
      .required("Graduation year is required")
      .min(1990, "Graduation year must be between 1990 and 2030")
      .max(2030, "Graduation year must be between 1990 and 2030"),
    degree: requiredString.oneOf(
      [
        "btech",
        "bcom",
        "bba",
        "bca",
        "bsc",
        "ba",
        "mtech",
        "mba",
        "mca",
        "msc",
        "ma",
        "phd",
      ],
      "Please select a valid degree"
    ),
    specialization: optionalString.max(
      200,
      "Specialization must be less than 200 characters"
    ),
  }),

  // Step 3: Professional Information
  professionalInfo: yup.object({
    current_company: optionalString.max(
      100,
      "Company name must be less than 100 characters"
    ),
    current_position: optionalString.max(
      100,
      "Position must be less than 100 characters"
    ),
    industry: optionalString.oneOf(
      [
        "technology",
        "finance",
        "healthcare",
        "education",
        "consulting",
        "manufacturing",
        "retail",
        "media",
        "automotive",
        "telecommunications",
        "government",
        "non_profit",
        "real_estate",
        "energy",
        "agriculture",
        "other",
      ],
      "Please select a valid industry"
    ),
    experience_years: optionalString.oneOf(
      ["0-1", "1-3", "3-5", "5-10", "10-15", "15+"],
      "Please select a valid experience range"
    ),
    notable_achievements: optionalString,
  }),

  // Step 4: Skills and Networking
  skillsAndNetworking: yup.object({
    expertise_areas: yup.array().of(yup.string()),
    willing_to_mentor: yup.boolean(),
    can_provide_referrals: yup.boolean(),
    preferred_mentoring_topics: yup.array().of(yup.string()),
    available_for_networking: yup.boolean(),
    preferred_communication: yup
      .array()
      .of(
        yup
          .string()
          .oneOf([
            "email",
            "linkedin",
            "phone",
            "video_call",
            "in_person",
            "whatsapp",
          ])
      ),
    career_path: yup.array().of(
      yup.object({
        company: yup.string(),
        position: yup.string(),
        start_date: yup.string(),
        end_date: yup.string(),
        description: yup.string(),
      })
    ),
  }),

  // Complete profile validation (all required fields)
  complete: yup.object({
    first_name: requiredString,
    last_name: requiredString,
    graduation_year: yup.number().required(),
    degree: requiredString,
  }),
};

// File validation
export const fileValidation = {
  profilePicture: yup
    .mixed()
    .test("fileSize", "File size must be less than 5MB", (value) => {
      if (!value) return true;
      return value.size <= 5 * 1024 * 1024; // 5MB
    })
    .test("fileType", "Only image files are allowed", (value) => {
      if (!value) return true;
      return ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(
        value.type
      );
    }),

  verificationDocs: yup
    .mixed()
    .test("fileSize", "File size must be less than 10MB", (value) => {
      if (!value) return true;
      return value.size <= 10 * 1024 * 1024; // 10MB
    })
    .test("fileType", "Only PDF, DOC, DOCX files are allowed", (value) => {
      if (!value) return true;
      return [
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      ].includes(value.type);
    }),
};
