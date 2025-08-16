"use client";
import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cn } from "@/lib/utils";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?:
    | "default"
    | "secondary"
    | "ghost"
    | "outline"
    | "danger"
    | "success";
  size?: "sm" | "md" | "lg" | "icon";
}

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 disabled:opacity-50 disabled:pointer-events-none";

const variants: Record<NonNullable<ButtonProps["variant"]>, string> = {
  default:
    "bg-yellow-400 text-black hover:bg-yellow-300 shadow-sm border border-yellow-500/40",
  secondary:
    "bg-zinc-900 text-zinc-100 hover:bg-zinc-800 border border-zinc-800",
  ghost: "bg-transparent hover:bg-zinc-900/50 text-zinc-100",
  outline:
    "bg-transparent border border-zinc-800 text-zinc-100 hover:bg-zinc-900/40",
  danger: "bg-red-600 text-white hover:bg-red-500 border border-red-500/60",
  success:
    "bg-emerald-600 text-white hover:bg-emerald-500 border border-emerald-500/60",
};

const sizes: Record<NonNullable<ButtonProps["size"]>, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-9 px-4 text-sm",
  lg: "h-10 px-5 text-sm",
  icon: "h-9 w-9",
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild, variant = "default", size = "md", ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";
