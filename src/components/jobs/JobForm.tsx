"use client";
import React, { useState } from "react";
import { useJobActions } from "@/hooks/useJobs";
import { TagInput } from "@/components/events/TagInput"; // reuse generic TagInput
import type { CreateJobInput } from "@/types";
import toast from "react-hot-toast";

const defaultForm: CreateJobInput = {
  title: "",
  company: "",
  company_logo_url: "",
  location: "",
  job_type: "full_time",
  description: "",
  apply_link: "",
  salary_min: undefined,
  salary_max: undefined,
  salary_currency: "USD",
  tags: [],
  end_date: "",
};

export function JobForm({ onCreated }: { onCreated?: (id: number) => void }) {
  const [form, setForm] = useState<CreateJobInput>(defaultForm);
  const [submitting, setSubmitting] = useState(false);
  const { create } = useJobActions();

  function update<K extends keyof CreateJobInput>(key: K, value: CreateJobInput[K]) {
    setForm(f => ({ ...f, [key]: value }));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (form.salary_min && form.salary_max && form.salary_min > form.salary_max) {
      toast.error("Minimum salary cannot exceed maximum");
      return;
    }
    setSubmitting(true);
    try {
      const payload: CreateJobInput = { ...form, tags: form.tags?.map(t => t.toLowerCase()) };
      if (!payload.company_logo_url) delete (payload as any).company_logo_url;
      if (!payload.apply_link) delete (payload as any).apply_link;
      if (!payload.end_date) delete (payload as any).end_date;
      const job = await create(payload);
      toast.success(job.status === "approved" ? "Opportunity posted" : "Submitted for approval");
      onCreated?.(job.id);
      setForm(defaultForm);
    } catch (e: any) {
      toast.error(e.message || "Failed to create job");
    } finally { setSubmitting(false); }
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium">Title *</label>
          <input required value={form.title} onChange={e => update("title", e.target.value)} className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Company *</label>
            <input required value={form.company} onChange={e => update("company", e.target.value)} className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Location *</label>
          <input required value={form.location} onChange={e => update("location", e.target.value)} className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Job Type *</label>
          <select value={form.job_type} onChange={e => update("job_type", e.target.value as any)} className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm">
            <option value="full_time">Full Time</option>
            <option value="part_time">Part Time</option>
            <option value="internship">Internship</option>
            <option value="contract">Contract</option>
            <option value="temporary">Temporary</option>
            <option value="freelance">Freelance</option>
            <option value="remote">Remote</option>
          </select>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Apply Link</label>
          <input value={form.apply_link || ""} onChange={e => update("apply_link", e.target.value)} placeholder="https://..." className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">End Date</label>
          <input type="date" value={form.end_date || ""} onChange={e => update("end_date", e.target.value)} className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Salary Min</label>
          <input type="number" value={form.salary_min ?? ""} onChange={e => update("salary_min", e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Salary Max</label>
          <input type="number" value={form.salary_max ?? ""} onChange={e => update("salary_max", e.target.value ? Number(e.target.value) : undefined)} className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Currency</label>
          <input value={form.salary_currency || ""} onChange={e => update("salary_currency", e.target.value)} className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm" />
        </div>
        <div className="space-y-2 md:col-span-2">
          <label className="text-sm font-medium">Company Logo URL</label>
          <input value={form.company_logo_url || ""} onChange={e => update("company_logo_url", e.target.value)} className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm" />
        </div>
      </div>
      <div className="space-y-2">
        <label className="text-sm font-medium">Description *</label>
        <textarea required value={form.description} onChange={e => update("description", e.target.value)} rows={6} className="w-full rounded-md bg-zinc-900/60 border border-zinc-700/60 px-3 py-2 text-sm resize-y" />
      </div>
      <div className="space-y-2">
        <TagInput value={form.tags || []} onChange={(v) => update("tags", v)} />
      </div>
      <div className="pt-2 flex items-center gap-3">
        <button disabled={submitting} className="inline-flex items-center rounded-md bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-200 px-4 py-2 text-sm font-medium ring-1 ring-inset ring-indigo-500/30 disabled:opacity-50">{submitting ? "Submitting..." : "Submit"}</button>
        <button type="button" onClick={() => setForm(defaultForm)} disabled={submitting} className="text-xs text-zinc-400 hover:text-zinc-200">Reset</button>
      </div>
    </form>
  );
}

export default JobForm;
