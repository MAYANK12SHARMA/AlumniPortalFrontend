import { useState, useEffect } from "react";
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

  const fetchDirectory = async (newFilters: DirectoryFilters = {}) => {
    try {
      setLoading(true);
      setError(null);

      // Use the typed API client
      const response = await apiClient.getAlumniDirectory({
        ...filters,
        ...newFilters,
      });

      // Response is properly typed thanks to our type definitions
      setData(response.data);
    } catch (err: any) {
      setError(err.message || "Failed to fetch alumni directory");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDirectory();
  }, []);

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
        {data.results.map((alumni) => (
          <div key={alumni.id} className="border p-4 rounded">
            <h3>{alumni.user.name}</h3>
            <p>
              {alumni.current_company} - {alumni.current_position}
            </p>
            <p>{alumni.industry}</p>
            {alumni.is_mentor && (
              <span className="bg-yellow-100 px-2 py-1 rounded">Mentor</span>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => refetch({ page: (data.page || 1) + 1 })}
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
      >
        Load More
      </button>
    </div>
  );
}
