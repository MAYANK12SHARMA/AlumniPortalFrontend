"use client";
import React from "react";
import { ExternalEventForm } from "@/components/events/ExternalEventForm";
import { useAuth } from "@/contexts/AuthContext";

export default function ClientCreateEvent() {
  const { user } = useAuth();
  const role = user?.role;
  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
      <header className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-100">
          Create Opportunity
        </h1>
        {role === "admin" ? (
          <p className="text-sm text-zinc-400">
            Select event type below. Internal event form coming soon. External
            events are immediately public when created by admins.
          </p>
        ) : (
          <p className="text-sm text-zinc-400">
            Submit an external opportunity. It will appear after admin approval.
          </p>
        )}
      </header>
      {role === "admin" && <AdminEventTypeTabs />}
      <ExternalEventForm />
    </div>
  );
}

function AdminEventTypeTabs() {
  return (
    <div className="flex gap-2 text-xs">
      <span className="px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
        External
      </span>
      <span className="px-3 py-1 rounded-full bg-zinc-800 text-zinc-400 border border-zinc-700 cursor-not-allowed">
        Internal (soon)
      </span>
    </div>
  );
}
