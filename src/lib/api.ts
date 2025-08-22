import axios, { AxiosInstance, AxiosResponse, AxiosError } from "axios";
import {
  ApiResponse,
  AuthTokens,
  User,
  StatSummary,
  ProfileType,
  DirectoryFilters,
} from "../types";

const BASE = process.env.NEXT_PUBLIC_API_BASE || "http://127.0.0.1:8000/api/";

export async function getAdminDashboardStats() {
  const res = await apiClient.get("/admin/dashboard/");
  return res.data;
}

export async function getDirectoryStats(token?: string) {
  const res = await axios.get(`${BASE}/directory/stats/`, {
    headers: token ? { Authorization: `JWT ${token}` } : undefined,
  });
  return res.data;
}

export function mapStats(data: any): StatSummary {
  // Handle the new API response structure
  const metrics = data?.metrics || {};
  const totalUsers = metrics?.total_users || {};

  return {
    total_users: Number(totalUsers?.total_users ?? 0),
    total_admins: Number(totalUsers?.admin ?? 0),
    total_students: Number(totalUsers?.student ?? 0),
    total_alumni: Number(totalUsers?.alumni ?? 0),
    role_requests_pending: Number(metrics?.pending_role_requests ?? 0),
    pending_role_requests: Number(metrics?.pending_role_requests ?? 0),
    role_requests_accepted: 0, // Not provided in the API response
    verified_alumni: Number(metrics?.verified_alumni ?? 0),
    active_admins: Number(metrics?.active_admins ?? 0),
    // Legacy fields for backward compatibility
    alumni_mentors: 0,
    alumni_referral_providers: 0,
    students_by_program: [],
    alumni_by_industry: [],
  };
}
import Cookies from "js-cookie";

class ApiClient {
  private client: AxiosInstance;
  private tokenKey = process.env.NEXT_PUBLIC_TOKEN_KEY || "alumni_portal_token";
  private refreshTokenKey =
    process.env.NEXT_PUBLIC_REFRESH_TOKEN_KEY || "alumni_portal_refresh_token";

  constructor() {
    this.client = axios.create({
      baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000/api",
      timeout: 30000, // Increased to 30 seconds for registration
      // headers: {
      //   "Content-Type": "application/json",
      // },
      headers: {
        Accept: "application/json",
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
      // async (error) => {
      //   const original = error.config;
      async (error: AxiosError & { config?: any }) => {
        const original = error.config;
        if (!original) return Promise.reject(error);

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
            console.error("Token refresh failed:", refreshError);
            this.clearTokens();
            if (typeof window !== "undefined") {
              window.location.href = "/login";
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

  // Profile status check (for post-activation/login flow)
  async getProfileStatus(): Promise<
    ApiResponse<import("../types").ProfileStatusResponse>
  > {
    const response = await this.client.get("/profile/status/");
    return response as any;
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
    profileType: ProfileType,
    profileId: number
  ): Promise<ApiResponse<any>> {
    const response = await this.client.get(
      `/profiles/${profileType}/${profileId}/`
    );
    return response;
  }

  async adminUpdateProfile(
    profileType: ProfileType,
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
  async getAlumniDirectory(
    filters: DirectoryFilters
  ): Promise<ApiResponse<any[]>> {
    const response = await this.client.get("/directory/alumni/", {
      params: filters,
    });
    return response;
  }

  async getStudentDirectory(
    filters: DirectoryFilters
  ): Promise<ApiResponse<any[]>> {
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
