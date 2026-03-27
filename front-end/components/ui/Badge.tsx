import { cn } from "@/lib/utils/cn";

export function Badge({ className, children }: { className?: string; children: React.ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded text-xs font-medium",
        className
      )}
    >
      {children}
    </span>
  );
}

export function TopGirlBadge() {
  return <Badge className="bg-amber-500/90 text-white">TOP GIRL</Badge>;
}

export function OnlineBadge() {
  return (
    <Badge className="bg-green-500/90 text-white flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
      En ligne
    </Badge>
  );
}

export function VerifiedBadge() {
  return <Badge className="bg-blue-500/90 text-white">Vérifié</Badge>;
}

export function ExclusiveBadge() {
  return <Badge className="bg-purple-500/90 text-white">Exclusif</Badge>;
}
