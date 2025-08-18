"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, THead, TH, TR, TD } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/api";
import { DirectoryFilters, DirectoryResponse } from "@/types";
import ProtectedRoute from "@/components/ProtectedRoute";
import {
  Search,
  Filter,
  Download,
  Users,
  Briefcase,
  MapPin,
  GraduationCap,
  Star,
  RefreshCw,
  UserCheck,
  Building,
} from "lucide-react";

interface AlumniProfile {
  id: number;
  user: {
    name: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  first_name?: string;
  last_name?: string;
  current_company?: string;
  current_position?: string;
  job_title?: string;
  industry?: string;
  location?: string;
  graduation_year?: number;
  program?: string;
  is_mentor?: boolean;
  can_provide_referrals?: boolean;
  linkedin_url?: string;
  experience_years?: number;
}

export default function AlumniDirectoryPage() {
  const [alumni, setAlumni] = useState<AlumniProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DirectoryFilters>({
    page: 1,
    page_size: 20,
    search: "",
    industry: "",
    location: "",
    program: "",
    year: undefined,
    is_mentor: undefined,
    can_provide_referrals: undefined,
  });
  const [directoryData, setDirectoryData] = useState<DirectoryResponse | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

  // Fetch alumni directory
  const fetchAlumniDirectory = async (searchFilters: DirectoryFilters) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.getAlumniDirectory(searchFilters);

      if (response.data) {
        const data = response.data as unknown as DirectoryResponse;
        setDirectoryData(data);
        setAlumni(data.profiles || []);
      }
    } catch (err: any) {
      console.error("Error fetching alumni directory:", err);
      setError(
        err.response?.data?.message || "Failed to fetch alumni directory"
      );
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchAlumniDirectory(filters);
  }, []);

  // Handle search
  const handleSearch = (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm, page: 1 };
    setFilters(newFilters);
    fetchAlumniDirectory(newFilters);
  };

  // Handle filter changes
  const handleFilterChange = (
    filterType: keyof DirectoryFilters,
    value: any
  ) => {
    const newFilters = { ...filters, [filterType]: value, page: 1 };
    setFilters(newFilters);
    fetchAlumniDirectory(newFilters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchAlumniDirectory(newFilters);
  };

  // Reset filters
  const resetFilters = () => {
    const newFilters: DirectoryFilters = {
      page: 1,
      page_size: 20,
      search: "",
      industry: "",
      location: "",
      program: "",
      year: undefined,
      is_mentor: undefined,
      can_provide_referrals: undefined,
    };
    setFilters(newFilters);
    fetchAlumniDirectory(newFilters);
  };

  // Export functionality (placeholder)
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export alumni data");
  };

  const renderAlumniCard = (alumnus: AlumniProfile) => (
    <div
      key={alumnus.id}
      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          {/* <h3 className="font-semibold text-lg">
            {`${alumnus.user.first_name || ""} ${alumnus.user.last_name || ""}`.trim() || "—"}
          </h3> */}
          {/* <h3 className="font-semibold text-lg">
            {[alumnus.user.first_name, alumnus.user.last_name]
              .filter(Boolean)
              .join(" ") || "—"}
          </h3> */}

          <div className="space-y-1 mt-2">
            {(alumnus.current_position || alumnus.job_title) && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Briefcase size={14} />
                {alumnus.current_position || alumnus.job_title}
                {alumnus.current_company && ` at ${alumnus.current_company}`}
              </p>
            )}
            {alumnus.industry && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Building size={14} />
                {alumnus.industry}
              </p>
            )}
            {alumnus.location && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin size={14} />
                {alumnus.location}
              </p>
            )}
            {alumnus.program && alumnus.graduation_year && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <GraduationCap size={14} />
                {alumnus.program} • Class of {alumnus.graduation_year}
              </p>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {alumnus.is_mentor && (
            <Badge variant="secondary" className="text-xs">
              <Star size={10} className="mr-1" />
              Mentor
            </Badge>
          )}
          {alumnus.can_provide_referrals && (
            <Badge variant="outline" className="text-xs">
              <UserCheck size={10} className="mr-1" />
              Referrals
            </Badge>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute allowedRoles={["admin"]}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Alumni Directory
            </h1>
            <p className="text-muted-foreground">
              Manage and view all alumni profiles in the system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => fetchAlumniDirectory(filters)}
            >
              <RefreshCw size={16} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Total Alumni
                  </p>
                  <div className="text-2xl font-bold">
                    {directoryData?.pagination?.count || alumni.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Mentors
                  </p>
                  <div className="text-2xl font-bold">
                    {alumni.filter((a) => a.is_mentor).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <UserCheck className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Referral Providers
                  </p>
                  <div className="text-2xl font-bold">
                    {alumni.filter((a) => a.can_provide_referrals).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Building className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Industries
                  </p>
                  <div className="text-2xl font-bold">
                    {directoryData?.filters?.industries?.length || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alumni by name, company, position..."
                  value={filters.search || ""}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
              >
                <Filter size={16} className="mr-2" />
                Filters
              </Button>
              <Button variant="outline" onClick={resetFilters}>
                Reset
              </Button>
            </div>

            {/* Advanced Filters */}
            {showFilters && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 pt-4 border-t">
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Industry
                  </label>
                  <select
                    value={filters.industry || ""}
                    onChange={(e) =>
                      handleFilterChange("industry", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Industries</option>
                    {directoryData?.filters?.industries?.map((industry) => (
                      <option key={industry.value} value={industry.value}>
                        {industry.label} ({industry.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Location
                  </label>
                  <select
                    value={filters.location || ""}
                    onChange={(e) =>
                      handleFilterChange("location", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Locations</option>
                    {directoryData?.filters?.locations?.map((location) => (
                      <option key={location.value} value={location.value}>
                        {location.label} ({location.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Program
                  </label>
                  <select
                    value={filters.program || ""}
                    onChange={(e) =>
                      handleFilterChange("program", e.target.value)
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Programs</option>
                    {directoryData?.filters?.programs?.map((program) => (
                      <option key={program.value} value={program.value}>
                        {program.label} ({program.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    Graduation Year
                  </label>
                  <select
                    value={filters.year || ""}
                    onChange={(e) =>
                      handleFilterChange(
                        "year",
                        e.target.value ? parseInt(e.target.value) : undefined
                      )
                    }
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="">All Years</option>
                    {directoryData?.filters?.graduation_years?.map((year) => (
                      <option key={year.value} value={year.value}>
                        {year.label} ({year.count})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.is_mentor || false}
                      onChange={(e) =>
                        handleFilterChange(
                          "is_mentor",
                          e.target.checked || undefined
                        )
                      }
                      className="mr-2"
                    />
                    Mentors Only
                  </label>
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={filters.can_provide_referrals || false}
                      onChange={(e) =>
                        handleFilterChange(
                          "can_provide_referrals",
                          e.target.checked || undefined
                        )
                      }
                      className="mr-2"
                    />
                    Referral Providers
                  </label>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Alumni Profiles</span>
              {directoryData?.pagination && (
                <span className="text-sm font-normal text-muted-foreground">
                  Showing{" "}
                  {(directoryData.pagination.page - 1) *
                    directoryData.pagination.page_size +
                    1}{" "}
                  to{" "}
                  {Math.min(
                    directoryData.pagination.page *
                      directoryData.pagination.page_size,
                    directoryData.pagination.count
                  )}{" "}
                  of {directoryData.pagination.count} results
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="h-32 rounded-lg" />
                ))}
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
                <Button
                  variant="outline"
                  onClick={() => fetchAlumniDirectory(filters)}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : alumni.length === 0 ? (
              <div className="text-center py-8">
                <Users
                  size={48}
                  className="mx-auto text-muted-foreground mb-4"
                />
                <p className="text-muted-foreground">
                  No alumni found matching your criteria.
                </p>
                <Button
                  variant="outline"
                  onClick={resetFilters}
                  className="mt-4"
                >
                  Clear Filters
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {alumni.map(renderAlumniCard)}
              </div>
            )}

            {/* Pagination */}
            {directoryData?.pagination &&
              directoryData.pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-6 border-t">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      disabled={!directoryData.pagination.previous}
                      onClick={() =>
                        handlePageChange(directoryData.pagination.page - 1)
                      }
                    >
                      Previous
                    </Button>
                    <span className="text-sm text-muted-foreground">
                      Page {directoryData.pagination.page} of{" "}
                      {directoryData.pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      disabled={!directoryData.pagination.next}
                      onClick={() =>
                        handlePageChange(directoryData.pagination.page + 1)
                      }
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  );
}
