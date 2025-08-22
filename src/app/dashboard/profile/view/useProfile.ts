"use client";

import { useCallback, useEffect, useState } from "react";
import apiClient from "@/lib/api";
import {
  adminProfileApi,
  alumniProfileApi,
  studentProfileApi,
} from "@/lib/api/profile";
import {
  AdminProfile,
  AlumniProfile,
  StudentProfile,
  User,
  UserRole,
} from "@/types";

export type AnyProfile = (AdminProfile | AlumniProfile | StudentProfile) & {
  id?: number;
};

interface UseProfileResult {
  role: UserRole | null;
  profile: AnyProfile | null;
  loading: boolean;
  error: string | null;
  reload: () => Promise<void>;
}

export function useProfile(_expectedRole?: UserRole): UseProfileResult {
  const [role, setRole] = useState<UserRole | null>(null);
  const [profile, setProfile] = useState<AnyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const me = await apiClient.get("/auth/users/me/");
      const user: User = (me as any).data || (me as any);
      const r = (user?.role || "student") as UserRole;
      setRole(r);

      let data: AnyProfile | null = null;
      if (r === "admin") data = await adminProfileApi.get();
      else if (r === "alumni") data = await alumniProfileApi.get();
      else data = await studentProfileApi.get();
      setProfile(data as AnyProfile);
    } catch (e: any) {
      setError(
        e?.response?.data?.error || e?.message || "Failed to load profile"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { role, profile, loading, error, reload: load };
}
