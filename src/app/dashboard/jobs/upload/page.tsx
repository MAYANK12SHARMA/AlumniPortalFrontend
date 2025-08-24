"use client";
import React from "react";
import { JobForm } from "@/components/jobs/JobForm";

export default function UploadJobPage() {
  return (
    <div className="max-w-3xl">
      <h1 className="text-xl font-semibold tracking-tight mb-6">Upload Opportunity</h1>
      <JobForm />
    </div>
  );
}
