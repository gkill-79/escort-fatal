"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { LucideIcon } from "lucide-react";

type AdminNavLinkProps = {
  href: string;
  label: string;
  Icon: LucideIcon;
  iconClassName: string;
};

export function AdminNavLink({ href, label, Icon, iconClassName }: AdminNavLinkProps) {
  const pathname = usePathname();
  // `/admin` est un item "racine" : on ne le surligne pas sur les sous-pages.
  const isActive =
    pathname === href || (href !== "/admin" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      aria-current={isActive ? "page" : undefined}
      className={[
        "flex items-center gap-3 px-3 py-3 rounded-xl font-medium transition-colors",
        "border border-transparent",
        isActive
          ? "text-white bg-white/5 border-white/10"
          : "text-dark-300 hover:text-white hover:bg-white/5",
      ].join(" ")}
    >
      <Icon className={`w-5 h-5 ${iconClassName}`} />
      {label}
    </Link>
  );
}

