import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils/cn";

interface VerifiedBadgeProps {
  className?: string;
  text?: string;
}

export const VerifiedBadge = ({ className, text = "Vérifié" }: VerifiedBadgeProps) => {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 dark:bg-blue-500/10 dark:text-blue-400 dark:border-blue-500/20",
        className
      )}
      title="Profil vérifié"
    >
      <CheckCircle2 className="w-3 h-3" />
      <span>{text}</span>
    </div>
  );
};
