import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
	label,
	value,
	delta,
	icon,
	className,
}: {
	label: string;
	value: string | number;
	delta?: string;
	icon?: React.ReactNode;
	className?: string;
}) {
	return (
		<Card className={cn("relative overflow-hidden", className)}>
			<CardContent className="p-5">
				<div className="flex items-start justify-between">
					<div>
						<div className="text-xs uppercase tracking-wide text-zinc-400">{label}</div>
						<div className="mt-1 text-2xl font-semibold text-zinc-100">{value}</div>
						{delta && (
							<div className="mt-1 text-xs text-emerald-300">{delta}</div>
						)}
					</div>
					<div className="rounded-lg border border-yellow-500/40 bg-yellow-400/10 p-2 text-yellow-300">
						{icon}
					</div>
				</div>
			</CardContent>
			<div className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-inset ring-yellow-400/5" />
		</Card>
	);
}
