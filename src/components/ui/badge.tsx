import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "outline" | "warning" | "success";

export function Badge({
  className,
  variant = "default",
  children,
}: {
  className?: string;
  variant?: Variant;
  children: React.ReactNode;
}) {
  const styles: Record<Variant, string> = {
    default: "bg-yellow-400 text-black border border-yellow-500/40",
    secondary: "bg-zinc-900 text-zinc-100 border border-zinc-800",
    outline: "bg-transparent text-zinc-200 border border-zinc-800",
    warning: "bg-amber-500/20 text-amber-300 border border-amber-500/40",
    success: "bg-emerald-500/20 text-emerald-300 border border-emerald-600/40",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium",
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
