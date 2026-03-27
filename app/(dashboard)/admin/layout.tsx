import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { LayoutDashboard, Users, ShieldAlert, MessageCircleWarning, LogOut, ChevronLeft, Images, UserCheck } from "lucide-react";

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
          <Link href="/admin" className="flex items-center gap-3 px-3 py-3 text-dark-300 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5 text-blue-400" />
            Vue d&apos;ensemble
          </Link>

          <div className="pt-2 pb-1 px-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-dark-600">Modération</p>
          </div>
          <Link href="/admin/comments" className="flex items-center gap-3 px-3 py-3 text-dark-300 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <MessageCircleWarning className="w-5 h-5 text-yellow-400" />
            Avis en Attente
          </Link>
          <Link href="/admin/reports" className="flex items-center gap-3 px-3 py-3 text-dark-300 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <ShieldAlert className="w-5 h-5 text-red-500" />
            Signalements
          </Link>
          <Link href="/admin/media" className="flex items-center gap-3 px-3 py-3 text-dark-300 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <Images className="w-5 h-5 text-purple-400" />
            Médias
          </Link>

          <div className="pt-2 pb-1 px-3">
            <p className="text-[10px] font-bold uppercase tracking-widest text-dark-600">Comptes</p>
          </div>
          <Link href="/admin/profiles" className="flex items-center gap-3 px-3 py-3 text-dark-300 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <UserCheck className="w-5 h-5 text-brand-400" />
            C.A.S Profils
          </Link>
          <Link href="/admin/users" className="flex items-center gap-3 px-3 py-3 text-dark-300 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <Users className="w-5 h-5 text-dark-300" />
            Gérer les Comptes
          </Link>
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
