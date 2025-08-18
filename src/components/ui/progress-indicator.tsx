"use client";

import React from "react";
import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  name: string;
  description?: string;
}

interface ProgressIndicatorProps {
  steps: Step[];
  currentStep: number;
  completedSteps: number[];
  className?: string;
}

export function ProgressIndicator({
  steps,
  currentStep,
  completedSteps,
  className,
}: ProgressIndicatorProps) {
  const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

  return (
    <div className={cn("w-full", className)}>
      {/* Progress Bar */}
      <div className="mb-8">
        <div
          className="flex items-center justify-between text-sm text-zinc-400 mb-2"
          aria-live="polite"
        >
          <span>
            Step {currentStep} of {steps.length}
          </span>
          <span>{Math.round(progress)}% Complete</span>
        </div>
        <div
          className="w-full bg-zinc-800 rounded-full h-2"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{
              width: `${progress}%`,
              background: "linear-gradient(90deg, #FFD24C, #FF7A18)",
            }}
          />
        </div>
      </div>

      {/* Step Indicators */}
      <nav aria-label="Progress">
        <ol className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isCompleted = completedSteps.includes(stepNumber);
            const isCurrent = stepNumber === currentStep;
            const isUpcoming = stepNumber > currentStep;

            return (
              <li key={step.id} className="flex-1">
                <div className="flex flex-col items-center">
                  {/* Step Circle */}
                  <div className="flex items-center">
                    <div
                      className={cn(
                        "flex h-10 w-10 items-center justify-center rounded-full border-2 text-sm font-semibold",
                        {
                          "border-yellow-400 bg-yellow-400 text-black":
                            isCompleted,
                          "border-yellow-400 bg-black text-yellow-400 ring-2 ring-yellow-400 ring-offset-2 ring-offset-black":
                            isCurrent,
                          "border-zinc-700 bg-black text-zinc-400": isUpcoming,
                        }
                      )}
                      aria-current={isCurrent ? "step" : undefined}
                      aria-label={`${step.name}${
                        isCurrent
                          ? " (current step)"
                          : isCompleted
                          ? " (completed)"
                          : ""
                      }`}
                    >
                      {isCompleted ? (
                        <CheckIcon className="h-6 w-6" />
                      ) : (
                        stepNumber
                      )}
                    </div>

                    {/* Connector Line */}
                    {index < steps.length - 1 && (
                      <div
                        className={cn(
                          "ml-4 h-0.5 w-full transition-colors duration-300",
                          {
                            "bg-yellow-400": stepNumber <= currentStep,
                            "bg-zinc-700": stepNumber > currentStep,
                          }
                        )}
                      />
                    )}
                  </div>

                  {/* Step Label */}
                  <div className="mt-2 text-center">
                    <p
                      className={cn("text-sm font-medium", {
                        "text-yellow-400": isCurrent || isCompleted,
                        "text-zinc-200":
                          !isCurrent && !isCompleted && !isUpcoming,
                        "text-zinc-500": isUpcoming,
                      })}
                    >
                      {step.name}
                    </p>
                    {step.description && (
                      <p className="text-xs text-zinc-500 mt-1 max-w-20">
                        {step.description}
                      </p>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
