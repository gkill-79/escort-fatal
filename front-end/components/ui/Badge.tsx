import { cn } from "@/lib/utils/cn";
import { ShieldCheckIcon } from "@heroicons/react/24/solid";

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

export function BiometricBadge() {
  return (
    <div className="flex items-center space-x-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-md transform transition hover:scale-105">
      <ShieldCheckIcon className="h-4 w-4 text-white" />
      <span>Profil 100% Vérifié</span>
    </div>
  );
}
