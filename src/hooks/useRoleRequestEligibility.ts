import { useCallback, useEffect, useRef, useState } from "react";
import apiClient from "@/lib/api";

export interface PendingRoleRequest {
  id: number;
  status: string;
  created_at?: string;
  updated_at?: string;
  notes?: string;
  requested_role?: string;
}

export interface RoleRequestEligibilityResponse {
  eligible: boolean;
  reason?: string;
  current_role?: string;
  target_role?: string;
  pending_request?: {
    id: number;
    requested_role: string;
    created_at: string;
  } | null;
}

interface UseRoleRequestEligibilityOptions {
  role?: string; // target role (default alumni)
  auto?: boolean; // auto fetch on mount
  fetchPendingDetails?: boolean; // whether to fetch detailed pending info
}

export function useRoleRequestEligibility(
  options: UseRoleRequestEligibilityOptions = {}
) {
  const { role = "alumni", auto = true, fetchPendingDetails = true } = options;
  const [loading, setLoading] = useState(auto);
  const [error, setError] = useState<string | null>(null);
  const [eligibility, setEligibility] =
    useState<RoleRequestEligibilityResponse | null>(null);
  const [pending, setPending] = useState<PendingRoleRequest | null>(null);
  const inflightRef = useRef<Promise<void> | null>(null);

  const refresh = useCallback(async () => {
    if (inflightRef.current) return inflightRef.current; // de-dupe
    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        setEligibility(null);
        const res = await apiClient.get(
          `/check-role-request-eligibility/?role=${encodeURIComponent(role)}`
        );
        const el = res.data as RoleRequestEligibilityResponse;
        setEligibility(el);
        if (!el.eligible && el.pending_request && fetchPendingDetails) {
          try {
            const pr = await apiClient.get("/role-requests/pending/");
            setPending(pr.data as PendingRoleRequest);
          } catch (e: any) {
            console.log(`Get the error ${e?.response?.data?.message || e}`);
            // If 404 or other, fall back to minimal pending info
            setPending({
              id: el.pending_request.id,
              status: "pending",
              created_at: el.pending_request.created_at,
              requested_role: el.pending_request.requested_role,
            });
          }
        } else {
          setPending(null);
        }
      } catch (e: any) {
        setError(e?.response?.data?.message || "Failed to check eligibility");
      } finally {
        setLoading(false);
        inflightRef.current = null;
      }
    };
    const p = run();
    inflightRef.current = p;
    return p;
  }, [role, fetchPendingDetails]);

  useEffect(() => {
    if (auto) {
      refresh();
    }
  }, [auto, refresh]);

  const hasPending = !!(
    !eligibility?.eligible &&
    (pending || eligibility?.pending_request)
  );
  const canApply = !!eligibility?.eligible && !hasPending;

  return {
    loading,
    error,
    eligibility,
    pending,
    hasPending,
    canApply,
    refresh,
  } as const;
}

export default useRoleRequestEligibility;
