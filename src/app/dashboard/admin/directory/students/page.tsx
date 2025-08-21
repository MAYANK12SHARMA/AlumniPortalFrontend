"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  BookOpen,
  Calendar,
  Award,
  RefreshCw,
  GraduationCap,
  Target,
  TrendingUp,
} from "lucide-react";

interface StudentProfile {
  id: number;
  user: {
    name: string;
    email: string;
    first_name?: string;
    last_name?: string;
  };
  program?: string;
  current_year?: number;
  year?: number;
  gpa?: number;
  skills?: string[];
  interests?: string[];
  looking_for_internship?: boolean;
  looking_for_mentorship?: boolean;
  expected_graduation?: string;
  student_id?: string;
}

export default function StudentDirectoryPage() {
  const [students, setStudents] = useState<StudentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DirectoryFilters>({
    page: 1,
    page_size: 20,
    search: "",
    program: "",
    year: undefined,
  });
  const [directoryData, setDirectoryData] = useState<DirectoryResponse | null>(
    null
  );
  const [showFilters, setShowFilters] = useState(false);

  // Fetch student directory
  const fetchStudentDirectory = useCallback(
    async (searchFilters: DirectoryFilters) => {
      try {
        setLoading(true);
        setError(null);

        const response = await apiClient.getStudentDirectory(searchFilters);

        if (response.data) {
          const data = response.data as unknown as DirectoryResponse;
          setDirectoryData(data);
          setStudents(data.profiles || []);
        }
      } catch (err: any) {
        console.error("Error fetching student directory:", err);
        setError(
          err.response?.data?.message || "Failed to fetch student directory"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Initial load
  useEffect(() => {
    fetchStudentDirectory(filters);
  }, [fetchStudentDirectory, filters]);

  // Handle search
  const handleSearch = (searchTerm: string) => {
    const newFilters = { ...filters, search: searchTerm, page: 1 };
    setFilters(newFilters);
    fetchStudentDirectory(newFilters);
  };

  // Handle filter changes
  const handleFilterChange = (
    filterType: keyof DirectoryFilters,
    value: any
  ) => {
    const newFilters = { ...filters, [filterType]: value, page: 1 };
    setFilters(newFilters);
    fetchStudentDirectory(newFilters);
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    const newFilters = { ...filters, page };
    setFilters(newFilters);
    fetchStudentDirectory(newFilters);
  };

  // Reset filters
  const resetFilters = () => {
    const newFilters: DirectoryFilters = {
      page: 1,
      page_size: 20,
      search: "",
      program: "",
      year: undefined,
    };
    setFilters(newFilters);
    fetchStudentDirectory(newFilters);
  };

  // Export functionality (placeholder)
  const handleExport = () => {
    // TODO: Implement export functionality
    console.log("Export student data");
  };

  const renderStudentCard = (student: StudentProfile) => (
    <div
      key={student.id}
      className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <h3 className="font-semibold text-lg">
            {student.user.name ||
              `${student.user.first_name || ""} ${
                student.user.last_name || ""
              }`.trim() ||
              "—"}
          </h3>
          <div className="space-y-1 mt-2">
            {student.program && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <BookOpen size={14} />
                {student.program}
              </p>
            )}
            {(student.current_year || student.year) && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Calendar size={14} />
                Year {student.current_year || student.year}
              </p>
            )}
            {student.gpa && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Award size={14} />
                GPA: {student.gpa}
              </p>
            )}
            {student.student_id && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <Target size={14} />
                ID: {student.student_id}
              </p>
            )}
            {student.skills && student.skills.length > 0 && (
              <div className="mt-2">
                <p className="text-xs text-gray-500 mb-1">Skills:</p>
                <div className="flex flex-wrap gap-1">
                  {student.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {student.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{student.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex flex-col gap-1">
          {student.looking_for_internship && (
            <Badge variant="default" className="text-xs">
              <TrendingUp size={10} className="mr-1" />
              Seeking Internship
            </Badge>
          )}
          {student.looking_for_mentorship && (
            <Badge variant="outline" className="text-xs">
              <Users size={10} className="mr-1" />
              Seeking Mentorship
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
              Student Directory
            </h1>
            <p className="text-muted-foreground">
              Manage and view all student profiles in the system
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExport}>
              <Download size={16} className="mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => fetchStudentDirectory(filters)}
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
                    Total Students
                  </p>
                  <div className="text-2xl font-bold">
                    {directoryData?.pagination?.count || students.length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Seeking Internships
                  </p>
                  <div className="text-2xl font-bold">
                    {students.filter((s) => s.looking_for_internship).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Seeking Mentorship
                  </p>
                  <div className="text-2xl font-bold">
                    {students.filter((s) => s.looking_for_mentorship).length}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <BookOpen className="h-4 w-4 text-muted-foreground" />
                <div className="ml-2">
                  <p className="text-sm font-medium text-muted-foreground">
                    Programs
                  </p>
                  <div className="text-2xl font-bold">
                    {directoryData?.filters?.programs?.length || 0}
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
                  placeholder="Search students by name, program, skills..."
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
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pt-4 border-t">
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
                  <label className="text-sm font-medium mb-2 block">Year</label>
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
                    {[1, 2, 3, 4, 5].map((year) => (
                      <option key={year} value={year}>
                        Year {year}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium block">Status</label>
                  <div className="space-y-2">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={false} // TODO: Add filter for internship seekers
                        onChange={() => {}} // TODO: Implement filter
                        className="mr-2"
                        disabled
                      />
                      <span className="text-sm">Seeking Internships</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={false} // TODO: Add filter for mentorship seekers
                        onChange={() => {}} // TODO: Implement filter
                        className="mr-2"
                        disabled
                      />
                      <span className="text-sm">Seeking Mentorship</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Student Profiles</span>
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
                  onClick={() => fetchStudentDirectory(filters)}
                  className="mt-4"
                >
                  Try Again
                </Button>
              </div>
            ) : students.length === 0 ? (
              <div className="text-center py-8">
                <GraduationCap
                  size={48}
                  className="mx-auto text-muted-foreground mb-4"
                />
                <p className="text-muted-foreground">
                  No students found matching your criteria.
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
                {students.map(renderStudentCard)}
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
