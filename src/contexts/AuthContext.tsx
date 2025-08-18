"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { apiClient } from "@/lib/api";
import { User } from "@/types";
import toast from "react-hot-toast";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (
    email: string,
    password: string,
    role?: string
  ) => Promise<boolean>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
  routeAfterAuthCheck: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);

  const isAuthenticated = isClient && !!user && apiClient.isAuthenticated();

  useEffect(() => {
    // Set client flag to avoid hydration mismatch
    setIsClient(true);

    // Check if user is already logged in on app start
    const initializeAuth = async () => {
      if (typeof window !== "undefined" && apiClient.isAuthenticated()) {
        try {
          await refreshUser();
        } catch (error) {
          console.error("Failed to refresh user:", error);
          apiClient.clearTokens();
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      setLoading(true);
      console.log("Starting login process...");
      const response = await apiClient.login(email, password);
      console.log("Login API response received:", response);

      apiClient.setTokens(response.data);
      console.log("Tokens set, refreshing user...");

      // Get user details after successful login
      await refreshUser();
      console.log("User refreshed successfully:", user);

      toast.success("Login successful!");
      return true;
    } catch (error: any) {
      console.error("Login error:", error);

      // Parse login errors from backend
      let message = "Login failed. Please try again.";

      if (error.response?.data) {
        const errorData = error.response.data;

        if (errorData.detail) {
          message = errorData.detail;
        } else if (errorData.non_field_errors) {
          message = Array.isArray(errorData.non_field_errors)
            ? errorData.non_field_errors.join(", ")
            : errorData.non_field_errors;
        } else if (errorData.email) {
          message = `Email: ${
            Array.isArray(errorData.email)
              ? errorData.email.join(", ")
              : errorData.email
          }`;
        } else if (errorData.password) {
          message = `Password: ${
            Array.isArray(errorData.password)
              ? errorData.password.join(", ")
              : errorData.password
          }`;
        }
      }

      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Decide where to send the user based on profile status
  const routeAfterAuthCheck = async (): Promise<string | null> => {
    try {
      const statusRes = await apiClient.getProfileStatus();
      const data =
        (statusRes.data as any).data || (statusRes as any).data?.data;
      if (!data) return null;

      const { has_profile, verification_status, message } = data;
      const profile_type = (data.profile_type || user?.role || null) as any;

      // No profile created yet: send to corresponding profile page
      if (!has_profile) {
        if (profile_type === "student") return "/profile/student";
        if (profile_type === "alumni") return "/profile/alumni";
        if (profile_type === "admin") return "/dashboard/admin"; // admins might not need a profile
        return "/";
      }

      // Pending review: show a message and send to holding page
      if (verification_status === "pending") {
        toast("Your profile is under review", { icon: "⏳" });
        return "/profile/under-review";
      }

      // Verified/approved: route to dashboard by type
      if (
        verification_status === "verified" ||
        verification_status === "approved"
      ) {
        if (profile_type === "student") return "/dashboard/student";
        if (profile_type === "alumni") return "/dashboard/alumni";
        if (profile_type === "admin") return "/dashboard/admin";
      }

      // Rejected: show message and route to info page
      if (verification_status === "rejected") {
        toast.error(
          message || "Your profile was rejected. Please contact administration."
        );
        return "/profile/rejected";
      }

      return null;
    } catch (e) {
      console.error("Profile status check failed", e);
      return null;
    }
  };

  const register = async (
    email: string,
    password: string,
    role: string = "student"
  ): Promise<boolean> => {
    try {
      setLoading(true);
      await apiClient.register(email, password, role);

      // Don't auto-login after registration - user needs to verify email first
      toast.success(
        "Registration successful! Please check your email to activate your account."
      );
      return true;
    } catch (error: any) {
      console.error("Registration error:", error);
      console.error("Error response data:", error.response?.data);
      console.error("Error status:", error.response?.status);
      console.error("Error config URL:", error.config?.url);

      // Handle timeout errors specially
      if (
        error.name === "REGISTRATION_TIMEOUT" ||
        error.code === "ECONNABORTED" ||
        error.message?.includes("timeout")
      ) {
        // The request timed out, but registration might have succeeded
        toast.success(
          "Registration is processing. Please check your email for activation link. If you don't receive it, try registering again."
        );
        return true; // Assume success for timeout
      }

      // Parse validation errors from backend
      let message = "Registration failed. Please try again.";

      if (error.response?.data) {
        const errorData = error.response.data;
        const errors = [];

        // Handle field-specific errors
        if (errorData.email) {
          errors.push(
            `Email: ${
              Array.isArray(errorData.email)
                ? errorData.email.join(", ")
                : errorData.email
            }`
          );
        }
        if (errorData.password) {
          errors.push(
            `Password: ${
              Array.isArray(errorData.password)
                ? errorData.password.join(", ")
                : errorData.password
            }`
          );
        }
        if (errorData.re_password) {
          errors.push(
            `Password confirmation: ${
              Array.isArray(errorData.re_password)
                ? errorData.re_password.join(", ")
                : errorData.re_password
            }`
          );
        }
        if (errorData.role) {
          errors.push(
            `Role: ${
              Array.isArray(errorData.role)
                ? errorData.role.join(", ")
                : errorData.role
            }`
          );
        }
        if (errorData.non_field_errors) {
          errors.push(
            Array.isArray(errorData.non_field_errors)
              ? errorData.non_field_errors.join(", ")
              : errorData.non_field_errors
          );
        }

        // Use parsed errors or fallback to generic message
        if (errors.length > 0) {
          message = errors.join(" | ");
        } else if (errorData.detail) {
          message = errorData.detail;
        }
      }

      toast.error(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
      await apiClient.logout();
      setUser(null);
      toast.success("Logged out successfully");

      // Redirect to login page
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    } catch (error) {
      console.error("Logout error:", error);
      // Clear tokens even if logout request fails
      apiClient.clearTokens();
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async (): Promise<void> => {
    try {
      console.log("Refreshing user...");
      const response = await apiClient.getCurrentUser();
      console.log("getCurrentUser response:", response);
      setUser(response.data);
      console.log("User set:", response.data);
    } catch (error) {
      console.error("Failed to refresh user:", error);
      apiClient.clearTokens();
      setUser(null);
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    refreshUser,
    isAuthenticated,
    routeAfterAuthCheck,
  };

  // Provide consistent initial values for SSR
  if (!isClient) {
    const ssrValue: AuthContextType = {
      user: null,
      loading: true,
      login,
      register,
      logout,
      refreshUser,
      isAuthenticated: false,
      routeAfterAuthCheck: async () => null,
    };
    return (
      <AuthContext.Provider value={ssrValue}>{children}</AuthContext.Provider>
    );
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
