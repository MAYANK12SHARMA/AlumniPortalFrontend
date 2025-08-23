"use client";
import React, { useState } from "react";
import ProtectedRoute from "@/components/ProtectedRoute";
import { StudentDirectoryGrid } from "@/components/directory/students/StudentDirectoryGrid";
import { useStudentDirectory } from "@/hooks/useStudentDirectory";
import { Input } from "@/components/ui/input";
import { Search, RefreshCw, Filter } from "lucide-react";
import type { DirectoryFilters } from "@/types";

type StudentFilters = DirectoryFilters & { page_size: number };

export default function StudentDirectoryPage() {
  const [filters, setFilters] = useState<StudentFilters>({
    page: 1,
    page_size: 20,
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const { filterOptions } = useStudentDirectory(filters); // leverage for available programs/years

  return (
    <ProtectedRoute requireAuth allowedRoles={["student", "alumni", "admin"]}>
      <div className="px-6 py-10 space-y-10 max-w-7xl mx-auto">
        <header className="space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight bg-gradient-to-r from-emerald-300 via-teal-300 to-cyan-300 bg-clip-text text-transparent">
            Student Directory
          </h1>
          <p className="text-sm text-zinc-400 max-w-2xl">
            Explore students, discover emerging talent, and build meaningful
            academic & professional connections.
          </p>
          <div className="flex flex-wrap gap-3 items-center">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search name, program, skill..."
                className="pl-8 bg-zinc-900/60 border-zinc-800 focus-visible:ring-emerald-400/40 w-56 md:w-72"
                value={filters.search}
                onChange={(e) =>
                  setFilters((f) => ({ ...f, search: e.target.value, page: 1 }))
                }
              />
            </div>
            <button
              onClick={() => setShowFilters((s) => !s)}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-zinc-900/60 border border-zinc-700 hover:border-emerald-400/40 text-zinc-300 hover:text-emerald-300 transition-colors"
            >
              <Filter className="h-4 w-4" /> Filters
            </button>
            <button
              onClick={() => setFilters({ page: 1, page_size: 20, search: "" })}
              className="inline-flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md bg-zinc-900/60 border border-zinc-700 hover:border-emerald-400/40 text-zinc-300 hover:text-emerald-300 transition-colors"
            >
              <RefreshCw className="h-4 w-4" /> Reset
            </button>
          </div>
          {showFilters && (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900/70">
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wide text-zinc-500 font-medium">
                  Program
                </label>
                <select
                  value={filters.program || ""}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      program: e.target.value || undefined,
                      page: 1,
                    }))
                  }
                  className="w-full h-9 rounded-md bg-zinc-950/60 border border-zinc-700/50 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
                >
                  <option value="">All</option>
                  {(filterOptions?.programs || []).map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] uppercase tracking-wide text-zinc-500 font-medium">
                  Semester
                </label>
                <select
                  value={filters.current_semester ?? ""}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      current_semester: e.target.value
                        ? Number(e.target.value)
                        : undefined,
                      page: 1,
                    }))
                  }
                  className="w-full h-9 rounded-md bg-zinc-950/60 border border-zinc-700/50 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
                >
                  <option value="">All</option>
                  {(filterOptions?.years || []).map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1 md:col-span-2">
                <label className="text-[11px] uppercase tracking-wide text-zinc-500 font-medium">
                  Skills (comma separated)
                </label>
                <input
                  value={filters.skills || ""}
                  onChange={(e) =>
                    setFilters((f) => ({
                      ...f,
                      skills: e.target.value,
                      page: 1,
                    }))
                  }
                  placeholder="python, react"
                  className="w-full h-9 rounded-md bg-zinc-950/60 border border-zinc-700/50 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
                />
              </div>
            </div>
          )}
        </header>
        <StudentDirectoryGrid
          filters={filters}
          onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
        />
      </div>
    </ProtectedRoute>
  );
}
