"use client";

import React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Step {
  id: string;
  name: string;
  description?: string;
}

interface StepperProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

export function Stepper({
  steps,
  currentStep,
  completedSteps,
  className,
}: StepperProps) {
  return (
    <nav className={cn("relative", className)} aria-label="Progress">
      <ol className="space-y-3">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;

          return (
            <li key={step.id} className="flex items-start">
              {/* Connector line */}
              <div className="relative mr-3">
                <div
                  className={cn(
                    "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                    isCompleted
                      ? "border-yellow-400 bg-yellow-400 text-black"
                      : isCurrent
                      ? "border-yellow-400 bg-black text-yellow-400 ring-2 ring-yellow-400/60 ring-offset-2 ring-offset-black"
                      : "border-zinc-800 bg-zinc-950 text-zinc-400"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <CheckIcon className="h-5 w-5" /> : stepNumber}
                </div>

                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-9 -ml-[1px] h-6 w-[2px] bg-zinc-800" />
                )}
              </div>

              <div className="pt-1.5">
                <p
                  className={cn(
                    "text-sm font-medium",
                    isCompleted || isCurrent ? "text-zinc-100" : "text-zinc-400"
                  )}
                >
                  {step.name}
                </p>
                {step.description && (
                  <p className="text-xs text-zinc-500 mt-0.5">
                    {step.description}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Stepper;
