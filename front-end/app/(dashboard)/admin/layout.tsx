import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  MessageCircleWarning,
  LogOut,
  ChevronLeft,
  Images,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { AdminNavLink } from "@/components/layouts/AdminNavLink";

type NavItem = {
  href: string;
  label: string;
  Icon: LucideIcon;
  iconClassName: string;
};

const moderationItems: NavItem[] = [
  {
    href: "/admin/comments",
    label: "Avis en Attente",
    Icon: MessageCircleWarning,
    iconClassName: "text-yellow-400",
  },
  {
    href: "/admin/reports",
    label: "Signalements",
    Icon: ShieldAlert,
    iconClassName: "text-red-500",
  },
  {
    href: "/admin/media",
    label: "Médias",
    Icon: Images,
    iconClassName: "text-purple-400",
  },
];

const accountItems: NavItem[] = [
  {
    href: "/admin/profiles",
    label: "C.A.S Profils",
    Icon: UserCheck,
    iconClassName: "text-brand-400",
  },
  {
    href: "/admin/users",
    label: "Gérer les Comptes",
    Icon: Users,
    iconClassName: "text-dark-300",
  },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // Protect Admin Route strictly
  if (!session || session.user.role !== "ADMIN") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen flex bg-dark-950 font-sans">
      
      {/* Sidebar Admin Navigation */}
      <aside className="w-64 shrink-0 bg-dark-900 border-r border-white/5 flex flex-col">
        <div className="p-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors mb-4">
            <ChevronLeft className="w-4 h-4" />
            Retour au site
          </Link>
          <div className="flex items-center gap-2 mb-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            <span className="font-display font-black tracking-widest text-white uppercase text-sm">
              Administration
            </span>
          </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-1">
          <AdminNavLink
            href="/admin"
            label="Vue d&apos;ensemble"
            Icon={LayoutDashboard}
            iconClassName="text-blue-400"
          />

          <div className="pt-2 pb-1 px-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-dark-600">Modération</p>
          </div>
          {moderationItems.map((item) => (
            <AdminNavLink key={item.href} {...item} />
          ))}

          <div className="pt-2 pb-1 px-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-dark-600">Comptes</p>
          </div>
          {accountItems.map((item) => (
            <AdminNavLink key={item.href} {...item} />
          ))}
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <Link href="/api/auth/signout" className="flex items-center justify-center gap-2 px-4 py-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-lg font-medium transition-colors w-full text-sm">
            <LogOut className="w-4 h-4" />
            Déconnexion
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">
        <div className="max-w-5xl mx-auto space-y-8">
          {children}
        </div>
      </main>
      
    </div>
  );
}
