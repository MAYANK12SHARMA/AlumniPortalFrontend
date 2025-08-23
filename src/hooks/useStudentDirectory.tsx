"use client";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { PaginatedResponse, DirectoryFilters, StudentProfile } from "@/types";

export function useStudentDirectory(filters: DirectoryFilters = {}) {
  const [data, setData] = useState<PaginatedResponse<StudentProfile> | null>(
    null
  );
  const [filterOptions, setFilterOptions] = useState<{
    programs: string[];
    years: number[];
  } | null>(null);
  const [pagination, setPagination] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDirectory = useCallback(
    async (over: DirectoryFilters = {}) => {
      try {
        setLoading(true);
        setError(null);
        const response = await apiClient.getStudentDirectory({
          ...filters,
          ...over,
        });
        const raw: any = response.data;
        let normalized: PaginatedResponse<StudentProfile> = {
          count: 0,
          results: [],
          next: undefined,
          previous: undefined,
        };
        if (raw) {
          if (Array.isArray(raw.results)) {
            normalized = {
              count: raw.count ?? raw.results.length,
              results: raw.results,
              next: raw.next,
              previous: raw.previous,
            };
          } else if (Array.isArray(raw.profiles)) {
            const pag = raw.pagination || {};
            normalized = {
              count: pag.total_count ?? raw.profiles.length,
              results: raw.profiles,
              next: pag.next,
              previous: pag.previous,
            };
            setPagination(pag);
            if (raw.filter_options) setFilterOptions(raw.filter_options);
          }
        }
        setData(normalized);
      } catch (e: any) {
        setError(e?.message || "Failed to fetch student directory");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  return {
    data,
    loading,
    error,
    refetch: fetchDirectory,
    filterOptions,
    pagination,
  };
}
