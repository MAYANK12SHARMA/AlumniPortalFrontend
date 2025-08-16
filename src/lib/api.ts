import axios, { AxiosInstance, AxiosResponse } from "axios";

const BASE =
  process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000/api/userprofile";

export async function getAdminDashboardStats(token?: string) {
  const res = await axios.get(`${BASE}/admin/dashboard/stats/`, {
    headers: token ? { Authorization: `JWT ${token}` } : undefined,
  });
  return res.data;
}

export async function getDirectoryStats(token?: string) {
  const res = await axios.get(`${BASE}/directory/stats/`, {
    headers: token ? { Authorization: `JWT ${token}` } : undefined,
  });
  return res.data;
}

export async function getRoleRequests(token?: string, page = 1) {
  const res = await axios.get(`${BASE}/admin/role-requests/?page=${page}`, {
    headers: token ? { Authorization: `JWT ${token}` } : undefined,
  });
  return res.data;
}

export type StatSummary = {
  total_users: number;
  total_admins: number;
  total_students: number;
  total_alumni: number;
  role_requests_pending: number;
  role_requests_accepted: number;
  // New fields for the updated API response
  alumni_mentors?: number;
  alumni_referral_providers?: number;
  students_by_program?: Array<{ program: string; count: number }>;
  alumni_by_industry?: Array<{ industry: string; count: number }>;
};

export function mapStats(data: any): StatSummary {
  // Handle the new API response structure
  const stats = data?.stats || {};
  const alumni = stats?.alumni || {};
  const students = stats?.students || {};

  // Calculate total users from alumni and students
  const totalAlumni = Number(alumni?.total ?? 0);
  const totalStudents = Number(students?.total ?? 0);
  const totalUsers = totalAlumni + totalStudents;

  return {
    total_users: totalUsers,
    total_admins: 0, // Not provided in the new API, defaulting to 0
    total_students: totalStudents,
    total_alumni: totalAlumni,
    role_requests_pending: 0, // Not provided in the new API, defaulting to 0
    role_requests_accepted: 0, // Not provided in the new API, defaulting to 0
    // New optional fields
    alumni_mentors: Number(alumni?.mentors ?? 0),
    alumni_referral_providers: Number(alumni?.referral_providers ?? 0),
    students_by_program: students?.by_program || [],
    alumni_by_industry: alumni?.by_industry || [],
  };
}
import Cookies from "js-cookie";

interface ApiResponse<T = any> {
  data: T;
  message?: string;
  status: number;
}

interface AuthTokens {
  access: string;
  refresh: string;
}

interface User {
  id: number;
  email: string;
  role: "student" | "alumni" | "admin";
  profile_completed: boolean;
}

class ApiClient {
  private client: AxiosInstance;
  private tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "alumni_portal_token";
  private refreshTokenKey =
    process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || "alumni_portal_refresh_token";

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api",
      timeout: 30000, // Increased to 30 seconds for registration
      headers: {
        "Content-Type": "application/json",
      },
    });

    this.setupInterceptors();
  }

  private setupInterceptors() {
    // Request interceptor to add auth token
    this.client.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `JWT ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor for token refresh
    this.client.interceptors.response.use(
      (response) => response,
      async (error) => {
        const original = error.config;

        if (error.response?.status === 401 && !original._retry) {
          original._retry = true;

          try {
            const refreshToken = this.getRefreshToken();
            if (refreshToken) {
              const response = await this.refreshAccessToken(refreshToken);
              // For refresh, we only get new access token
              const newTokens = {
                access: response.data.access,
                refresh: refreshToken, // Keep the same refresh token
              };
              this.setTokens(newTokens);
              return this.client(original);
            }
          } catch (refreshError) {
            this.clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/auth/login";
            }
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Token management
  setTokens(tokens: AuthTokens) {
    if (!tokens || !tokens.access || !tokens.refresh) {
      console.error("Invalid tokens received:", tokens);
      return;
    }
    Cookies.set(this.tokenKey, tokens.access, { expires: 1 }); // 1 day
    Cookies.set(this.refreshTokenKey, tokens.refresh, { expires: 7 }); // 7 days
  }

  getToken(): string | undefined {
    return Cookies.get(this.tokenKey);
  }

  getRefreshToken(): string | undefined {
    return Cookies.get(this.refreshTokenKey);
  }

  clearTokens() {
    Cookies.remove(this.tokenKey);
    Cookies.remove(this.refreshTokenKey);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  // Authentication endpoints
  async login(
    email: string,
    password: string
  ): Promise<ApiResponse<AuthTokens>> {
    const response = await this.client.post("/auth/jwt/create/", {
      email,
      password,
    });
    return response;
  }

  async register(
    email: string,
    password: string,
    role: string = "student"
  ): Promise<ApiResponse<User>> {
    // Client-side domain validation as additional check
    const allowedDomains = ["gmail.com", "gla.ac.in"];
    const emailDomain = email.split("@")[1]?.toLowerCase();

    if (!allowedDomains.includes(emailDomain)) {
      throw new Error(
        "Only gmail.com and gla.ac.in email addresses are allowed"
      );
    }

    // Extract name from email for the name field
    const emailPrefix = email.split("@")[0];
    const name = emailPrefix
      .replace(/[._]/g, " ")
      .replace(/\b\w/g, (l) => l.toUpperCase());

    const payload = {
      name, // Add the required name field
      email,
      password,
      re_password: password, // API requires re_password field
      role,
    };

    console.log("Registration payload:", {
      ...payload,
      password: "***",
      re_password: "***",
    });

    try {
      const response = await this.client.post("/auth/users/", payload);
      return response;
    } catch (error: any) {
      // If it's a timeout error, let's check if the user was actually created
      if (error.code === "ECONNABORTED" || error.message?.includes("timeout")) {
        console.log("Registration timed out, but user might have been created");
        // Re-throw with special handling flag
        const timeoutError = new Error(
          "Registration timeout - please check email"
        );
        timeoutError.name = "REGISTRATION_TIMEOUT";
        throw timeoutError;
      }
      throw error;
    }
  }

  async activateAccount(uid: string, token: string): Promise<ApiResponse<any>> {
    const response = await this.client.post("/auth/users/activation/", {
      // const response = await this.client.post("/auth/activation/", {
      uid,
      token,
    });
    return response;
  }

  async resendActivationEmail(email: string): Promise<ApiResponse<any>> {
    const response = await this.client.post("/auth/users/resend_activation/", {
      email,
    });
    return response;
  }

  async refreshAccessToken(
    refreshToken: string
  ): Promise<ApiResponse<{ access: string }>> {
    const response = await this.client.post("/auth/jwt/refresh/", {
      refresh: refreshToken,
    });
    return response;
  }

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await this.client.get("/auth/users/me/");
    return response;
  }

  async logout() {
    try {
      const refreshToken = this.getRefreshToken();
      if (refreshToken) {
        await this.client.post("/auth/logout/", {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      this.clearTokens();
    }
  }

  // Profile endpoints (NEW unified version)
  async getMyProfile(): Promise<ApiResponse<any>> {
    const response = await this.client.get("/profile/");
    return response;
  }

  async updateMyProfile(data: any): Promise<ApiResponse<any>> {
    const response = await this.client.patch("/profile/update/", data);
    return response;
  }

  async getProfile(
    profileType: "student" | "alumni",
    profileId: number
  ): Promise<ApiResponse<any>> {
    const response = await this.client.get(
      `/profiles/${profileType}/${profileId}/`
    );
    return response;
  }

  async adminUpdateProfile(
    profileType: "student" | "alumni",
    profileId: number,
    data: any
  ): Promise<ApiResponse<any>> {
    const response = await this.client.patch(
      `/admin/profiles/${profileType}/${profileId}/update/`,
      data
    );
    return response;
  }

  // Directory endpoints
  async getAlumniDirectory(filters: any): Promise<ApiResponse<any[]>> {
    const response = await this.client.get("/directory/alumni/", {
      params: filters,
    });
    return response;
  }

  async getStudentDirectory(filters: any): Promise<ApiResponse<any[]>> {
    const response = await this.client.get("/directory/students/", {
      params: filters,
    });
    return response;
  }

  async getDirectoryStats(): Promise<ApiResponse<any>> {
    const response = await this.client.get("/directory/stats/");
    return response;
  }

  // Profile endpoints
  //   async getStudentProfile(): Promise<ApiResponse<any>> {
  //     const response = await this.client.get('/profiles/student/');
  //     return response.data;
  //   }

  //   async updateStudentProfile(data: any): Promise<ApiResponse<any>> {
  //     const response = await this.client.patch('/profiles/student/', data);
  //     return response.data;
  //   }

  //   async getAlumniProfile(): Promise<ApiResponse<any>> {
  //     const response = await this.client.get('/profiles/alumni/');
  //     return response.data;
  //   }

  //   async updateAlumniProfile(data: any): Promise<ApiResponse<any>> {
  //     const response = await this.client.patch('/profiles/alumni/', data);
  //     return response.data;
  //   }

  // Search and networking
  //   async searchAlumni(filters: any): Promise<ApiResponse<any[]>> {
  //     const response = await this.client.get('/profiles/alumni/search/', {
  //       params: filters,
  //     });
  //     return response.data;
  //   }

  //   async searchStudents(filters: any): Promise<ApiResponse<any[]>> {
  //     const response = await this.client.get('/profiles/students/search/', {
  //       params: filters,
  //     });
  //     return response.data;
  //   }

  // Generic HTTP methods
  async get<T = any>(
    endpoint: string,
    params?: any
  ): Promise<AxiosResponse<T>> {
    return this.client.get(endpoint, { params });
  }

  async post<T = any>(endpoint: string, data?: any): Promise<AxiosResponse<T>> {
    return this.client.post(endpoint, data);
  }

  async patch<T = any>(
    endpoint: string,
    data?: any
  ): Promise<AxiosResponse<T>> {
    return this.client.patch(endpoint, data);
  }

  async delete<T = any>(endpoint: string): Promise<AxiosResponse<T>> {
    return this.client.delete(endpoint);
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export default apiClient;
