import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import Link from "next/link";
import { ChevronLeft, MessageSquare } from "lucide-react";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();

  if (!session) {
    redirect("/login");
  }

  return (
    <div className="min-h-screen bg-dark-950 flex flex-col font-sans">
      
      {/* Universal Chat Header */}
      <header className="bg-dark-900 border-b border-white/5 h-16 flex items-center px-4 md:px-8 justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Link href="/" className="w-10 h-10 flex items-center justify-center bg-white/5 hover:bg-white/10 rounded-full transition-colors text-dark-300">
             <ChevronLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-500/20 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-brand-400" />
             </div>
             <div>
                <h1 className="text-white font-bold leading-none">Messagerie</h1>
                <p className="text-xs text-dark-400 font-medium tracking-wide">Privé & Sécurisé</p>
             </div>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-3 text-sm font-medium text-dark-300 bg-dark-800 px-4 py-2 rounded-full border border-white/5">
           Connecté en tant que <span className="text-white">{session.user.username}</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 overflow-hidden relative">
        {children}
      </main>

    </div>
  );
}
