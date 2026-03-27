import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
  LayoutDashboard, Users, Shield, CreditCard,
  FileCheck, Settings, ChevronLeft, BarChart3
} from "lucide-react";

const NAV = [
  { href: "/admin",          icon: LayoutDashboard, label: "Vue d'ensemble" },
  { href: "/admin/profiles", icon: FileCheck,       label: "Profils"        },
  { href: "/admin/users",    icon: Users,           label: "Utilisateurs"   },
  { href: "/admin/reports",  icon: Shield,          label: "Signalements"   },
  { href: "/admin/payments", icon: CreditCard,      label: "Paiements"      },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/");

  return (
    <div className="min-h-screen flex bg-[#0a0d14]">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 bg-[#111827] border-r border-white/5 flex flex-col">
        {/* Header */}
        <div className="px-5 py-5 border-b border-white/5">
          <Link href="/" className="flex items-center gap-2 text-sm text-dark-400 hover:text-white transition-colors mb-4">
            <ChevronLeft className="w-3.5 h-3.5" />
            Retour au site
          </Link>
          <p className="text-[10px] font-bold text-dark-600 uppercase tracking-widest">Administration</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {NAV.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-dark-400 hover:text-white hover:bg-white/5 transition-colors group"
            >
              <item.icon className="w-4 h-4 shrink-0 group-hover:text-brand-400 transition-colors" />
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-white/5">
          <p className="text-[10px] text-dark-700 text-center">
            Connecté : <span className="text-dark-500">{session.user.name}</span>
          </p>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 min-w-0 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
