"use client";
import { useState, useEffect, useCallback } from "react";
import { apiClient } from "@/lib/api";
import { PaginatedResponse, DirectoryFilters, AlumniProfile } from "@/types";

/**
 * Custom hook example showing how to use types with API calls
 * This demonstrates proper typing for API responses and error handling
 */
export function useAlumniDirectory(filters: DirectoryFilters = {}) {
  const [data, setData] = useState<PaginatedResponse<AlumniProfile> | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDirectory = useCallback(
    async (newFilters: DirectoryFilters = {}) => {
      try {
        setLoading(true);
        setError(null);

        // Call API (currently typed loosely). Response could be:
        // 1) Array<AlumniProfile>
        // 2) { results: AlumniProfile[], count, next, previous }
        // 3) { profiles: AlumniProfile[], pagination: { count, next, previous } }
        const response = await apiClient.getAlumniDirectory({
          ...filters,
          ...newFilters,
        });

        const raw = (response as any).data;
        let normalized: PaginatedResponse<AlumniProfile>;

        if (Array.isArray(raw)) {
          normalized = {
            count: raw.length,
            results: raw,
            next: undefined,
            previous: undefined,
          };
        } else if (raw && typeof raw === "object") {
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
              count: pag.count ?? raw.profiles.length,
              results: raw.profiles,
              next: pag.next,
              previous: pag.previous,
            };
          } else {
            // Fallback: treat unknown shape as empty list
            normalized = {
              count: 0,
              results: [],
              next: undefined,
              previous: undefined,
            };
          }
        } else {
          normalized = {
            count: 0,
            results: [],
            next: undefined,
            previous: undefined,
          };
        }

        setData(normalized);
      } catch (err: any) {
        setError(err.message || "Failed to fetch alumni directory");
      } finally {
        setLoading(false);
      }
    },
    [filters]
  );

  useEffect(() => {
    fetchDirectory();
  }, [fetchDirectory]);

  const refetch = (newFilters?: DirectoryFilters) => {
    fetchDirectory(newFilters);
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
}

/**
 * Component using the custom hook
 */
export function AlumniDirectoryExample() {
  const { data, loading, error, refetch } = useAlumniDirectory({
    page_size: 10,
    is_mentor: true,
  });

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!data) return <div>No data</div>;

  return (
    <div>
      <h2>Alumni Directory ({data.count} total)</h2>

      <div className="grid gap-4">
        {data.results.map((alumni) => {
          const mentorFlag =
            (alumni as any).is_mentor || alumni.willing_to_mentor;
          return (
            <div key={alumni.id} className="border p-4 rounded">
              <h3>{alumni.user?.name}</h3>
              <p>
                {alumni.current_company || ""}
                {alumni.current_company && alumni.current_position ? " - " : ""}
                {alumni.current_position || ""}
              </p>
              <p>{alumni.industry || ""}</p>
              {mentorFlag && (
                <span className="bg-yellow-100 px-2 py-1 rounded">Mentor</span>
              )}
            </div>
          );
        })}
      </div>

      {(data.next || data.previous) && (
        <button
          onClick={() => {
            // crude next page estimation if server provided next url with ?page=
            const nextPageMatch = data.next?.match(/[?&]page=(\d+)/);
            const currentPageFromPrev = data.previous?.match(/[?&]page=(\d+)/);
            const currentPage = nextPageMatch
              ? Number(nextPageMatch[1]) - 1
              : currentPageFromPrev
              ? Number(currentPageFromPrev[1]) + 1
              : 1;
            refetch({ page: currentPage + 1 });
          }}
          className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Load More
        </button>
      )}
    </div>
  );
}
