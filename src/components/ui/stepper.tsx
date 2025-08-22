"use client";

import React from "react";
import { motion } from "framer-motion";
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
  orientation?: "vertical" | "horizontal";
}

export function Stepper({
  steps,
  currentStep,
  completedSteps,
  className,
  orientation = "vertical",
}: StepperProps) {
  if (orientation === "horizontal") {
    const progressPct =
      steps.length > 1 ? ((currentStep - 1) / (steps.length - 1)) * 100 : 100;
    return (
      <nav className={cn("relative", className)} aria-label="Progress">
        <ol className="relative flex justify-between gap-4 md:gap-6 before:content-[''] before:absolute before:top-5 before:left-0 before:right-0 before:h-[2px] before:bg-zinc-800">
          <motion.div
            aria-hidden
            className="absolute top-5 left-0 h-[2px] bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 shadow-[0_0_10px_2px_rgba(251,191,36,0.35)]"
            style={{ width: progressPct + "%" }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = completedSteps.includes(stepNumber);
            const isCurrent = stepNumber === currentStep;
            return (
              <li
                key={step.id}
                className="relative z-10 flex flex-1 flex-col items-center text-center min-w-[56px]"
              >
                <div
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors backdrop-blur",
                    isCompleted
                      ? "border-yellow-400 bg-yellow-400 text-black"
                      : isCurrent
                      ? "border-yellow-400 bg-black text-yellow-400 ring-2 ring-yellow-400/60 ring-offset-2 ring-offset-black"
                      : "border-zinc-800 bg-zinc-950/70 text-zinc-400"
                  )}
                  aria-current={isCurrent ? "step" : undefined}
                >
                  {isCompleted ? <CheckIcon className="h-5 w-5" /> : stepNumber}
                </div>
                <p
                  className={cn(
                    "mt-2 text-[11px] font-medium tracking-wide uppercase",
                    isCompleted || isCurrent ? "text-zinc-200" : "text-zinc-500"
                  )}
                >
                  {step.name}
                </p>
              </li>
            );
          })}
        </ol>
      </nav>
    );
  }

  return (
    <nav className={cn("relative", className)} aria-label="Progress">
      <ol className="space-y-3">
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = completedSteps.includes(stepNumber);
          const isCurrent = stepNumber === currentStep;
          return (
            <li key={step.id} className="flex items-start">
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
