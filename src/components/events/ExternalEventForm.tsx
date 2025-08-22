"use client";
import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { createExternalEvent } from "@/lib/api/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui";
import { TagInput } from "./TagInput";
import { EventStatusBadge } from "./EventStatusBadge";
import toast from "react-hot-toast";
import { motion, AnimatePresence } from "framer-motion";

const schema = z
  .object({
    title: z.string().min(4).max(180),
    short_description: z.string().max(300).optional(),
    description: z.string().max(8000).optional(),
    start_datetime: z.string().optional(),
    end_datetime: z.string().optional(),
    location: z.string().max(200).optional(),
    organizer_name: z.string().max(255).optional(),
    event_url: z
      .string()
      .url()
      .optional()
      .or(z.literal("").transform(() => undefined)),
    contact_email: z.string().email().optional(),
    tags: z.array(z.string()).max(10).optional(),
    is_featured: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.start_datetime && data.end_datetime) {
        return new Date(data.end_datetime) > new Date(data.start_datetime);
      }
      return true;
    },
    { path: ["end_datetime"], message: "End must be after start" }
  )
  .refine(
    (data) => {
      // at least one of location or event_url
      return !!(data.location?.trim() || data.event_url?.trim());
    },
    { message: "Provide either a location or an event URL", path: ["location"] }
  );

type FormValues = z.infer<typeof schema>;

export function ExternalEventForm({
  onCreated,
}: {
  onCreated?: (id: number) => void;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
    setValue,
    reset,
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { tags: [] },
  });
  const [createdEventId, setCreatedEventId] = useState<number | null>(null);
  const [createdStatus, setCreatedStatus] = useState<string | null>(null);
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const onSubmit = async (values: FormValues) => {
    try {
      const payload = { ...values };
      if (payload.start_datetime && !payload.start_datetime.endsWith("Z")) {
        // assume local -> convert to ISO UTC
        const d = new Date(payload.start_datetime);
        payload.start_datetime = d.toISOString();
      }
      if (payload.end_datetime && !payload.end_datetime.endsWith("Z")) {
        const d = new Date(payload.end_datetime);
        payload.end_datetime = d.toISOString();
      }
      const ev = await createExternalEvent(payload as any);
      toast.success(isAdmin ? "Event published" : "Event submitted for review");
      setCreatedEventId(ev.id);
      setCreatedStatus(ev.status);
      onCreated?.(ev.id);
    } catch (e: any) {
      console.error(e);
      toast.error(e?.response?.data?.detail || "Failed to create event");
    }
  };

  const tags = watch("tags") || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 relative">
      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Section
            title="Basic Info"
            description="Core information about the event."
          >
            <Field label="Title" error={errors.title?.message}>
              <Input
                placeholder="e.g. Company Tech Talk"
                {...register("title")}
              />
            </Field>
            <Field
              label="Short Description"
              error={errors.short_description?.message}
            >
              <Textarea
                rows={2}
                placeholder="One-line teaser"
                {...register("short_description")}
              />
            </Field>
          </Section>
          <Section
            title="Details"
            description="Provide attendees with more context (agenda, speakers, goals)."
          >
            <Field label="Full Description" error={errors.description?.message}>
              <Textarea
                rows={6}
                placeholder="Describe the event goals, agenda, speakers..."
                {...register("description")}
              />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Start" error={errors.start_datetime?.message}>
                <Input type="datetime-local" {...register("start_datetime")} />
              </Field>
              <Field label="End" error={errors.end_datetime?.message}>
                <Input type="datetime-local" {...register("end_datetime")} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Location" error={errors.location?.message}>
                <Input
                  placeholder="Lecture Hall 2 or Remote"
                  {...register("location")}
                />
              </Field>
              <Field label="Event URL" error={errors.event_url?.message}>
                <Input placeholder="https://..." {...register("event_url")} />
              </Field>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field
                label="Organizer Name"
                error={errors.organizer_name?.message}
              >
                <Input
                  placeholder="Company X"
                  {...register("organizer_name")}
                />
              </Field>
              <Field
                label="Contact Email"
                error={errors.contact_email?.message}
              >
                <Input
                  placeholder="events@example.com"
                  {...register("contact_email")}
                />
              </Field>
            </div>
            {isAdmin && (
              <div className="pt-2">
                <label className="inline-flex items-center gap-2 text-xs font-medium text-zinc-300">
                  <input
                    type="checkbox"
                    className="accent-amber-500"
                    {...register("is_featured")}
                  />
                  <span>Mark as Featured (shows prominently if public)</span>
                </label>
              </div>
            )}
          </Section>
          <Section title="Tags" description="Help users discover this event.">
            <TagInput value={tags} onChange={(v) => setValue("tags", v)} />
          </Section>
          <div className="flex flex-wrap gap-4 items-center">
            <Button
              type="submit"
              disabled={isSubmitting}
              className="relative overflow-hidden"
            >
              <span className="relative z-10">Submit Event</span>
              <AnimatePresence>
                {isSubmitting && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gradient-to-r from-amber-500/20 to-yellow-400/10 animate-pulse"
                  />
                )}
              </AnimatePresence>
            </Button>
            {createdStatus && (
              <EventStatusBadge status={createdStatus as any} />
            )}
            {createdEventId && (
              <a
                href="/dashboard/events/mine"
                className="text-xs text-amber-300 hover:underline"
              >
                View My Submissions →
              </a>
            )}
            {createdEventId && (
              <button
                type="button"
                onClick={() => {
                  reset({ tags: [] } as any);
                  setCreatedEventId(null);
                  setCreatedStatus(null);
                }}
                className="text-xs text-zinc-500 hover:text-zinc-300"
              >
                Create another
              </button>
            )}
          </div>
        </div>
        <aside className="space-y-6 md:sticky md:top-24 h-fit">
          <PreviewCard values={watch()} isAdmin={isAdmin} />
          <TipsCard />
        </aside>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative rounded-xl border border-zinc-800/80 bg-zinc-950/40 backdrop-blur-sm p-6 group overflow-hidden">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-br from-amber-500/5 via-transparent to-yellow-400/5 pointer-events-none" />
      <h3 className="text-sm font-semibold tracking-wide text-amber-300/90 mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-xs text-zinc-400 mb-4 leading-relaxed">
          {description}
        </p>
      )}
      <div className="space-y-5">{children}</div>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block text-sm">
      <span className="block mb-1 font-medium text-zinc-200">{label}</span>
      <div className="relative">
        {children}
        {error && (
          <span className="absolute -bottom-5 left-0 text-xs text-rose-400">
            {error}
          </span>
        )}
      </div>
    </label>
  );
}

function PreviewCard({ values, isAdmin }: { values: any; isAdmin: boolean }) {
  const {
    title,
    short_description,
    start_datetime,
    end_datetime,
    tags = [],
    is_featured,
  } = values;
  const dateFmt = (iso?: string) => {
    if (!iso) return "";
    try {
      return new Date(iso).toLocaleString(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return iso;
    }
  };
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-950/60 p-5 space-y-4 shadow-inner">
      <h4 className="text-sm font-semibold text-zinc-300">Live Preview</h4>
      <div>
        <p className="text-lg font-semibold text-zinc-100 line-clamp-2">
          {title || "Event Title"}
        </p>
        <p className="text-xs text-zinc-400 line-clamp-3 mt-1">
          {short_description || "A short teaser will appear here."}
        </p>
      </div>
      <div className="text-xs text-zinc-500 space-y-1">
        {start_datetime && (
          <p>
            <span className="text-zinc-400">Starts:</span>{" "}
            {dateFmt(start_datetime)}
          </p>
        )}
        {end_datetime && (
          <p>
            <span className="text-zinc-400">Ends:</span> {dateFmt(end_datetime)}
          </p>
        )}
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {tags.map((t: string) => (
            <span
              key={t}
              className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-300 text-[11px] tracking-wide"
            >
              {t}
            </span>
          ))}
        </div>
      )}
      <p className="text-[10px] text-zinc-500 pt-2 border-t border-zinc-800">
        {isAdmin
          ? "Admin submissions go live immediately."
          : "Pending moderation after submission."}
      </p>
      {isAdmin && is_featured && (
        <p className="text-[10px] text-amber-300">Featured flag enabled</p>
      )}
    </div>
  );
}

function TipsCard() {
  return (
    <div className="rounded-xl border border-zinc-800 bg-gradient-to-br from-zinc-900/70 to-zinc-950/90 p-5 text-xs space-y-3">
      <h4 className="text-amber-300 font-semibold text-sm">Tips</h4>
      <ul className="list-disc list-inside space-y-1 text-zinc-400">
        <li>Clear, action-oriented title.</li>
        <li>Add start & end times to boost visibility.</li>
        <li>Use tags that describe audience & topic.</li>
      </ul>
    </div>
  );
}
