"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Menu, X, MessageCircle, User, LogOut, Settings, LayoutDashboard, Shield, Coins } from "lucide-react";
import { cn } from "@/lib/utils/cn";

/**
 * StickyHeader — variante header avec recherche et notifications.
 * Dépendances optionnelles: OnlineCounter, NotificationsPanel, Drawer, SearchBar
 * (à ajouter dans components/ pour activer les fonctionnalités complètes).
 */
export function StickyHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const session: any = null; // TODO: useSession()
  const isAdmin = (session as { user?: { role?: string } })?.user?.role === "ADMIN";

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
  }, [pathname]);

  return (
    <>
      <header
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
          scrolled
            ? "bg-[#0e1117]/95 backdrop-blur-xl border-b border-white/8 shadow-xl"
            : "bg-gradient-to-b from-black/40 to-transparent"
        )}
      >
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-3">
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <span className="text-2xl">🔥</span>
              <span className="text-lg font-black text-white hidden sm:block tracking-tight group-hover:text-brand-400 transition-colors">
                Escorte<span className="text-brand-400">Fatal</span>
              </span>
            </Link>

            <nav className="hidden lg:flex items-center gap-1 text-sm">
              {[
                { href: "/escorts?isOnline=true", label: "En ligne" },
                { href: "/all-cities", label: "Villes" },
                { href: "/media?type=videos", label: "Vidéos" },
                { href: "/escorts?isTopGirl=true", label: "Top 50" },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "px-3 py-1.5 rounded-lg transition-colors font-medium",
                    pathname === item.href
                      ? "text-white bg-white/8"
                      : "text-dark-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <Link
                href="/search"
                className="w-9 h-9 rounded-xl flex items-center justify-center text-dark-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Search className="w-4.5 h-4.5" />
              </Link>

              {session ? (
                <>
                  <Link
                    href="/dashboard/messages"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-dark-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <MessageCircle className="w-4.5 h-4.5" />
                  </Link>
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setUserOpen((v) => !v)}
                      className="w-9 h-9 rounded-xl overflow-hidden bg-dark-700 border border-white/10 hover:border-brand-500/30 transition-all flex items-center justify-center text-sm font-bold text-dark-300"
                    >
                      ?
                    </button>
                    {userOpen && (
                      <div className="absolute right-0 top-11 w-52 bg-[#1c2235] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50 p-2">
                        <Link href="/dashboard" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-dark-400 hover:text-white hover:bg-white/5">
                          <LayoutDashboard className="w-4 h-4" /> Espace Escorte
                        </Link>
                        <Link href="/member/credits" className="flex items-center justify-between px-3 py-2 rounded-xl text-sm text-dark-400 hover:text-white hover:bg-white/5">
                          <div className="flex items-center gap-3">
                            <Coins className="w-4 h-4" /> Mes Crédits
                          </div>
                          <span className="bg-brand-500/10 text-brand-400 text-[10px] font-bold px-2 py-0.5 rounded-full">ACHETER</span>
                        </Link>
                        <Link href="/dashboard/profile" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-dark-400 hover:text-white hover:bg-white/5">
                          <User className="w-4 h-4" /> Mon profil
                        </Link>
                        <Link href="/dashboard/settings" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-dark-400 hover:text-white hover:bg-white/5">
                          <Settings className="w-4 h-4" /> Paramètres
                        </Link>
                        {isAdmin && (
                          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-brand-400 hover:bg-white/5">
                            <Shield className="w-4 h-4" /> Administration
                          </Link>
                        )}
                        <button type="button" className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-dark-400 hover:text-red-400 hover:bg-red-500/5">
                          <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link href="/login" className="hidden sm:block px-4 py-2 rounded-xl text-sm font-medium text-dark-300 hover:text-white transition-colors">
                    Connexion
                  </Link>
                  <Link href="/register" className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white transition-colors">
                    Inscription
                  </Link>
                </>
              )}

              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-dark-400 hover:text-white hover:bg-white/5"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {userOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} aria-hidden="true" />
      )}

      <div className="h-16" />
    </>
  );
}
