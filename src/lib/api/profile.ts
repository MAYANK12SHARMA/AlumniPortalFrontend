// Profile API endpoints

import { AxiosResponse } from "axios";
import {
  ApiResponse,
  StudentProfile,
  AlumniProfile,
  AdminProfile,
  ProfileType,
  ProfileResponse,
  ProfileUpdateRequest,
} from "../../types";

export interface ProfileApiClient {
  getMyProfile(): Promise<AxiosResponse<ProfileResponse>>;
  updateMyProfile(
    data: ProfileUpdateRequest
  ): Promise<AxiosResponse<ProfileResponse>>;
  getProfile(
    profileType: ProfileType,
    profileId: number
  ): Promise<AxiosResponse<any>>;
  adminUpdateProfile(
    profileType: ProfileType,
    profileId: number,
    data: ProfileUpdateRequest
  ): Promise<AxiosResponse<any>>;
}

// // Import the API client from the main API file
import { apiClient } from "../api";

// // Student Profile API
// export const studentProfileApi = {
//   // Get student profile
//   get: async (): Promise<StudentProfile> => {
//     const response = await apiClient.get('/student/profile/');
//     return response.data;
//   },

//   // Create student profile
//   create: async (data: FormData): Promise<StudentProfile> => {
//     const response = await apiClient.post('/student/profile/', data, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },

//   // Update student profile (for autosave)
//   update: async (data: Partial<StudentProfile> | FormData): Promise<StudentProfile> => {
//     const isFormData = data instanceof FormData;
//     const response = await apiClient.patch('/student/profile/', data, {
//       headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
//     });
//     return response.data;
//   },

//   // Delete student profile
//   delete: async (): Promise<void> => {
//     await apiClient.delete('/student/profile/');
//   },
// };

// // Alumni Profile API
// export const alumniProfileApi = {
//   // Get alumni profile
//   get: async (): Promise<AlumniProfile> => {
//     const response = await apiClient.get('/alumni/profile/');
//     return response.data;
//   },

//   // Create alumni profile
//   create: async (data: FormData): Promise<AlumniProfile> => {
//     const response = await apiClient.post('/alumni/profile/', data, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },

//   // Update alumni profile (for autosave)
//   update: async (data: Partial<AlumniProfile> | FormData): Promise<AlumniProfile> => {
//     const isFormData = data instanceof FormData;
//     const response = await apiClient.patch('/alumni/profile/', data, {
//       headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined,
//     });
//     return response.data;
//   },

//   // Delete alumni profile
//   delete: async (): Promise<void> => {
//     await apiClient.delete('/alumni/profile/');
//   },
// };

// // File Upload API
// export const uploadApi = {
//   // Upload profile picture
//   uploadProfilePicture: async (file: File): Promise<{ success: boolean; url: string }> => {
//     const formData = new FormData();
//     formData.append('file', file);

//     const response = await apiClient.post('/upload-profile-picture/', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },

//   // Upload verification documents
//   uploadVerificationDocs: async (file: File): Promise<{ success: boolean; url: string }> => {
//     const formData = new FormData();
//     formData.append('file', file);

//     const response = await apiClient.post('/upload-verification-docs/', formData, {
//       headers: {
//         'Content-Type': 'multipart/form-data',
//       },
//     });
//     return response.data;
//   },
// };

// // Chat Gpt code

function unwrapResponse<T = any>(response: AxiosResponse): T {
  const body = response?.data;
  if (!body) return body as T;

  if (body.profile) return body.profile as T;
  if (body.data) return body.data as T;
  if (body.result) return body.result as T;
  return body as T;
}

/* ---------------- Student Profile API ---------------- */
export const studentProfileApi = {
  // Get student profile
  get: async (): Promise<StudentProfile> => {
    const response = await apiClient.get("/student/profile/");
    return unwrapResponse<StudentProfile>(response);
  },

  // Create student profile (FormData recommended for image upload)
  create: async (data: FormData): Promise<StudentProfile> => {
    // Do NOT set Content-Type manually for FormData — axios/browser sets boundary.
    const response = await apiClient.post("/student/profile/", data);
    return unwrapResponse<StudentProfile>(response);
  },

  // Update student profile (autosave). Accepts JSON partial object OR FormData.
  update: async (
    data: Partial<StudentProfile> | FormData
  ): Promise<StudentProfile> => {
    // safe FormData detection for browsers; avoids crashing on SSR
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;

    // ApiClient.patch(endpoint, data) — forward data directly
    const response = await apiClient.patch("/student/profile/", data as any);
    return unwrapResponse<StudentProfile>(response);
  },

  // Delete student profile
  delete: async (): Promise<void> => {
    await apiClient.delete("/student/profile/");
  },
};

/* ---------------- Alumni Profile API ---------------- */
export const alumniProfileApi = {
  get: async (): Promise<AlumniProfile> => {
    const response = await apiClient.get("/alumni/profile/");
    return unwrapResponse<AlumniProfile>(response);
  },

  create: async (data: FormData): Promise<AlumniProfile> => {
    const response = await apiClient.post("/alumni/profile/", data);
    return unwrapResponse<AlumniProfile>(response);
  },

  update: async (
    data: Partial<AlumniProfile> | FormData
  ): Promise<AlumniProfile> => {
    const isFormData =
      typeof FormData !== "undefined" && data instanceof FormData;

    const response = await apiClient.patch("/alumni/profile/", data as any);
    return unwrapResponse<AlumniProfile>(response);
  },

  delete: async (): Promise<void> => {
    await apiClient.delete("/alumni/profile/");
  },
};

/* ---------------- Admin Profile API ---------------- */
export const adminProfileApi = {
  get: async (): Promise<AdminProfile> => {
    const response = await apiClient.get("/admin/profile/");
    return unwrapResponse<AdminProfile>(response);
  },

  create: async (data: FormData | Partial<AdminProfile>): Promise<AdminProfile> => {
    const response = await apiClient.post("/admin/profile/", data as any);
    return unwrapResponse<AdminProfile>(response);
  },

  update: async (
    data: Partial<AdminProfile> | FormData
  ): Promise<AdminProfile> => {
    const response = await apiClient.patch("/admin/profile/", data as any);
    return unwrapResponse<AdminProfile>(response);
  },

  delete: async (): Promise<void> => {
    await apiClient.delete("/admin/profile/");
  },
};

/* ---------------- File Upload API ---------------- */

async function handleUpload(endpoint: string, formData: FormData) {
  try {
    // Do NOT set Content-Type manually; axios will set the boundary
    const response = await apiClient.post(endpoint, formData);
    return response.data; // unwrap as you need
  } catch (err: any) {
    // axios error structure
    const axiosErr = err;
    if (axiosErr?.response) {
      // Server returned 4xx/5xx — show payload returned by DRF serializer
      console.error(
        "Upload failed, server response:",
        axiosErr.response.status,
        axiosErr.response.data
      );
      // Throw a clearer error for the UI with server message if available
      const serverMessage =
        axiosErr.response.data &&
        (axiosErr.response.data.detail ||
          axiosErr.response.data.error ||
          axiosErr.response.data);
      throw new Error(
        typeof serverMessage === "string"
          ? serverMessage
          : JSON.stringify(serverMessage, null, 2)
      );
    }
    // Network or other error
    console.error("Upload failed (no server response):", axiosErr);
    throw new Error(axiosErr.message || "Upload failed");
  }
}

export const uploadApi = {
  uploadProfilePicture: async (file: File) => {
    if (!file) throw new Error("No file provided");

    // Basic client-side validation
    const maxBytes = 5 * 1024 * 1024; // 5MB
    if (file.size > maxBytes) {
      throw new Error("File too large. Max 5MB allowed.");
    }

    const formData = new FormData();
    // include both field names to be robust to backend expectations
    formData.append("profile_picture", file); // server expects this field
    formData.append("profile_picture", file);

    // Optionally add a hint for the backend (not required)
    formData.append("purpose", "profile_picture");

    const result = await handleUpload("/upload-profile-picture/", formData);
    const normalized = {
      success: !!result?.success,
      url:
        // prefer common keys
        result?.image_url ??
        result?.url ??
        // some backends nest under data
        result?.data?.image_url ??
        null,
      raw: result,
    };

    return normalized;
  },

  uploadVerificationDocs: async (file: File) => {
    if (!file) throw new Error("No file provided");

    const maxBytes = 10 * 1024 * 1024; // 10MB for docs, adjust as needed
    if (file.size > maxBytes) {
      throw new Error("File too large. Max 10MB allowed.");
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("document", file);
    formData.append("purpose", "verification_doc");

    const result = await handleUpload("/upload-verification-docs/", formData);
    return result;
  },
};
