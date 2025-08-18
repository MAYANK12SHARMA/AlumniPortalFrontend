"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Stepper, Step } from "@/components/ui/stepper";

interface ProfileWizardShellProps {
  title: string;
  subtitle?: string;
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  headerRight?: React.ReactNode;
  children: React.ReactNode;
}

export function ProfileWizardShell({
  title,
  subtitle,
  steps,
  currentStep,
  completedSteps,
  headerRight,
  children,
}: ProfileWizardShellProps) {
  return (
    <div className="max-w-6xl mx-auto p-6">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-gradient-to-br from-zinc-900 via-black to-zinc-950">
        <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-gradient-to-tr from-yellow-500/10 to-orange-500/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-gradient-to-tr from-amber-400/10 to-yellow-500/10 blur-3xl" />

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between p-8 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400">
              {title}
            </h1>
            {subtitle && (
              <p className="mt-2 text-zinc-400 max-w-2xl">{subtitle}</p>
            )}
          </div>
          {headerRight}
        </div>
      </div>

      {/* Main Content */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar Steps */}
        <Card className="p-4">
          <Stepper
            steps={steps}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </Card>

        {/* Form Content */}
        <Card className="p-0 overflow-hidden">
          <div className="p-6 md:p-8">{children}</div>
        </Card>
      </div>
    </div>
  );
}

export default ProfileWizardShell;
