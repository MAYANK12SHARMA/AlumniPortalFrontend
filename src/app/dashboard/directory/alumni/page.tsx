"use client";
import React, { useEffect, useState, useCallback } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { apiClient } from "@/lib/api";
import { AlumniDirectoryGrid } from "@/components/directory/alumni/AlumniDirectoryGrid";
import {
  AlumniFiltersBar,
  DirectoryFiltersState,
} from "@/components/directory/alumni/AlumniFiltersBar";
import { Button } from "@/components/ui/button";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface DirectoryResponse {
  success: boolean;
  profiles: any[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_count: number;
    page_size: number;
    has_next: boolean;
    has_previous: boolean;
  };
  filter_options: { industries: string[]; experience_levels: string[] };
}

export default function AlumniDirectoryPage() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [filters, setFilters] = useState<DirectoryFiltersState>({});
  const [pagination, setPagination] = useState<
    DirectoryResponse["pagination"] | null
  >(null);
  const [filterOptions, setFilterOptions] = useState<
    DirectoryResponse["filter_options"] | null
  >(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (incoming?: Partial<DirectoryFiltersState>) => {
      const merged = incoming ? ({ ...filters, ...incoming } as any) : filters;
      // Only update filters state if caller passed overrides to avoid duplicate initial fetch
      if (incoming && Object.keys(incoming).length) setFilters(merged);
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        Object.entries(merged).forEach(([k, v]) => {
          if (v) params.append(k, String(v));
        });
        const res = await apiClient.get(
          `dashboard/directory/alumni/?${params.toString()}`
        );
        const data = (res as any).data as DirectoryResponse;
        if (data.success) {
          setProfiles(data.profiles || []);
          setPagination(data.pagination);
          setFilterOptions(data.filter_options);
        } else setError("Failed to load directory");
      } catch (e: any) {
        setError(e?.response?.data?.message || e.message || "Error");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const changePage = (dir: 1 | -1) => {
    if (!pagination) return;
    const next = pagination.current_page + dir;
    if (next < 1 || next > pagination.total_pages) return;
    fetchData({ page: next });
  };

  return (
    <ProtectedRoute requireAuth allowedRoles={["student", "alumni", "admin"]}>
      <div className="min-h-[calc(100vh-4rem)] px-4 py-8 space-y-8 max-w-7xl mx-auto">
        <AlumniFiltersBar
          onChange={(f) => fetchData(f)}
          filterOptions={filterOptions}
          loading={loading}
          current={filters}
        />
        {error && <div className="text-sm text-red-400">{error}</div>}
        {loading ? (
          <div className="py-20 flex items-center justify-center text-zinc-400 text-sm gap-2">
            <Loader2 className="h-5 w-5 animate-spin" /> Loading directory…
          </div>
        ) : (
          <AlumniDirectoryGrid profiles={profiles} />
        )}
        {pagination && pagination.total_pages > 1 && (
          <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
            <div className="text-[11px] text-zinc-500">
              Page {pagination.current_page} of {pagination.total_pages} ·{" "}
              {pagination.total_count} results
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!pagination.has_previous}
                onClick={() => changePage(-1)}
                className="gap-1"
              >
                <ChevronLeft className="h-4 w-4" /> Prev
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!pagination.has_next}
                onClick={() => changePage(1)}
                className="gap-1"
              >
                Next <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}
