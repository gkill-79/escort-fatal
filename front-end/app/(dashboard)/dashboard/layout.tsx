import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { User, Settings, Camera, Flame, LogOut, LayoutDashboard, Calendar, MessageCircle, Zap } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  // If not logged in, or not an escort, redirect
  if (!session || session.user.role !== "ESCORT") {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-dark-900 border-r border-white/5 flex flex-col">
        <div className="p-6 border-b border-white/5 flex items-center gap-2">
          <Flame className="w-8 h-8 text-brand-500" />
          <span className="font-display font-black text-xl tracking-tighter text-white">
            MON<span className="text-brand-500">PROFIL</span>
          </span>
        </div>
        
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 text-dark-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <LayoutDashboard className="w-5 h-5" />
            Console d'Accueil
          </Link>
          <Link href="/dashboard/settings" className="flex items-center gap-3 px-4 py-3 text-dark-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <User className="w-5 h-5" />
            Mon Identité
          </Link>
          <Link href="/dashboard/schedule" className="flex items-center gap-3 px-4 py-3 text-dark-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <Calendar className="w-5 h-5" />
            Emploi du temps
          </Link>
          <Link href="/dashboard/media" className="flex items-center gap-3 px-4 py-3 text-dark-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <Camera className="w-5 h-5" />
            Galerie Médias
          </Link>
          <Link href="/dashboard/messages" className="flex items-center gap-3 px-4 py-3 text-dark-400 hover:text-white hover:bg-white/5 rounded-xl font-medium transition-colors">
            <MessageCircle className="w-5 h-5" />
            Messagerie (Tchat)
          </Link>
          
          <div className="pt-4 mt-2 border-t border-white/5">
            <Link href="/dashboard/billing" className="flex items-center gap-3 px-4 py-3 text-brand-400 hover:text-white hover:bg-brand-500/10 transition-colors rounded-xl font-medium">
              <Zap className="w-5 h-5" />
              Boosts & Visibilité
            </Link>
          </div>
        </nav>
        
        <div className="p-4 border-t border-white/5">
          <Link href={`/escorts/${session.user.username}`} className="block w-full text-center py-2 px-4 bg-dark-800 text-white rounded-lg hover:bg-dark-700 transition font-medium text-sm mb-3">
            Voir mon rendu public
          </Link>
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-500/10 rounded-xl font-medium transition-colors">
            <LogOut className="w-5 h-5" />
            Déconnexion
          </Link>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-10 max-w-4xl mx-auto">
          {children}
        </div>
      </main>
      
    </div>
  );
}
