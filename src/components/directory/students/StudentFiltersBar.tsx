"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronDown, Filter, RefreshCcw } from "lucide-react";

export interface StudentDirectoryFiltersState {
  search?: string;
  program?: string;
  current_semester?: string; // keep as string for inputs then cast by API layer
  skills?: string; // comma separated
  page?: number;
}

interface Props {
  onChange: (f: StudentDirectoryFiltersState) => void;
  filterOptions: { programs: string[]; years: number[] } | null;
  loading: boolean;
  current: StudentDirectoryFiltersState;
}

export const StudentFiltersBar: React.FC<Props> = ({
  onChange,
  filterOptions,
  loading: _loading,
  current,
}) => {
  const [open, setOpen] = useState(false);
  const set = (k: keyof StudentDirectoryFiltersState, v: any) => {
    onChange({ ...current, [k]: v || undefined, page: 1 });
  };
  const clearAll = () => onChange({});
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Search name, program, skills..."
            className="w-full h-10 rounded-md bg-zinc-900/70 border border-zinc-700/60 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-400/40"
            defaultValue={current.search || ""}
            onChange={(e) => set("search", e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setOpen((o) => !o)}
          className="gap-1"
        >
          <Filter className="h-4 w-4" /> Filters{" "}
          <ChevronDown className="h-3 w-3" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={clearAll}
          className="text-xs"
        >
          <RefreshCcw className="h-3 w-3 mr-1" /> Reset
        </Button>
      </div>
      {open && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 p-4 rounded-lg border border-zinc-800 bg-zinc-900/70">
          <SelectInput
            label="Program"
            value={current.program}
            options={filterOptions?.programs || []}
            onChange={(v) => set("program", v)}
            allowEmpty
          />
          <SelectInput
            label="Semester"
            value={current.current_semester}
            options={(filterOptions?.years || []).map(String)}
            onChange={(v) => set("current_semester", v)}
            allowEmpty
          />
          <TextInput
            label="Skills (comma)"
            value={current.skills}
            onChange={(v) => set("skills", v)}
            placeholder="python, react"
          />
        </div>
      )}
    </div>
  );
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="text-[11px] uppercase tracking-wide text-zinc-500 font-medium flex gap-1 items-center">
    {children}
  </label>
);

const TextInput = ({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    <input
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full h-9 rounded-md bg-zinc-950/60 border border-zinc-700/50 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
    />
  </div>
);

const SelectInput = ({
  label,
  value,
  onChange,
  options,
  allowEmpty,
}: {
  label: string;
  value?: string;
  onChange: (v: string) => void;
  options: string[];
  allowEmpty?: boolean;
}) => (
  <div className="space-y-1">
    <Label>{label}</Label>
    <select
      value={value || ""}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-9 rounded-md bg-zinc-950/60 border border-zinc-700/50 px-2 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-400/40"
    >
      {allowEmpty && <option value="">All</option>}
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);
