"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSession, signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import {
  Search, Menu, X, MessageCircle,
  User, LogOut, Settings, LayoutDashboard, Shield
} from "lucide-react";
import { cn } from "@/lib/utils";
import { OnlineCounter } from "./OnlineCounter";
import { NotificationsBell, NotificationsPanel } from "./NotificationsPanel";
import { Drawer } from "@/components/ui/Drawer";
import { SearchBar } from "@/components/features/search/SearchBar";

export function StickyHeader() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen,  setUserOpen]  = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  // Close menus on navigation
  useEffect(() => {
    setMenuOpen(false);
    setUserOpen(false);
    setNotifOpen(false);
    setSearchOpen(false);
  }, [pathname]);

  const isAdmin = session?.user?.role === "ADMIN";

  return (
    <>
      <header className={cn(
        "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
        scrolled
          ? "bg-[#0e1117]/95 backdrop-blur-xl border-b border-white/8 shadow-xl"
          : "bg-gradient-to-b from-black/40 to-transparent"
      )}>
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center justify-between h-16 gap-3">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 shrink-0 group">
              <span className="text-2xl">🔥</span>
              <span className="text-lg font-black text-white hidden sm:block tracking-tight group-hover:text-brand-400 transition-colors">
                Escorte<span className="text-brand-400">Fatal</span>
              </span>
            </Link>

            {/* Desktop nav */}
            <nav className="hidden lg:flex items-center gap-1 text-sm">
              {[
                { href: "/escorts/online",  label: "En ligne" },
                { href: "/france",          label: "Villes" },
                { href: "/video",           label: "Vidéos" },
                { href: "/exclusives",      label: "Exclusives" },
                { href: "/top-50-members-choice", label: "Top 50" },
              ].map(item => (
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

            {/* Right actions */}
            <div className="flex items-center gap-2">
              {/* Online counter */}
              <OnlineCounter size="sm" className="hidden md:flex" />

              {/* Search */}
              <button
                onClick={() => setSearchOpen(v => !v)}
                className="w-9 h-9 rounded-xl flex items-center justify-center text-dark-400 hover:text-white hover:bg-white/5 transition-all"
              >
                <Search className="w-4.5 h-4.5" />
              </button>

              {session ? (
                <>
                  {/* Notifications */}
                  <NotificationsBell onClick={() => setNotifOpen(v => !v)} />

                  {/* Messages */}
                  <Link
                    href="/dashboard/messages"
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-dark-400 hover:text-white hover:bg-white/5 transition-all"
                  >
                    <MessageCircle className="w-4.5 h-4.5" />
                  </Link>

                  {/* Avatar / user menu */}
                  <div className="relative">
                    <button
                      onClick={() => setUserOpen(v => !v)}
                      className="w-9 h-9 rounded-xl overflow-hidden bg-dark-700 border border-white/10 hover:border-brand-500/30 transition-all"
                    >
                      {session.user.image ? (
                        <Image src={session.user.image} alt="" width={36} height={36} className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-sm font-bold text-dark-300">
                          {session.user.name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                      )}
                    </button>

                    {userOpen && (
                      <div className="absolute right-0 top-11 w-52 bg-[#1c2235] border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-white/5">
                          <p className="text-sm font-bold text-white truncate">{session.user.name}</p>
                          <p className="text-xs text-dark-500 truncate">{session.user.email}</p>
                        </div>
                        <div className="p-2 space-y-0.5">
                          <MenuItem href="/dashboard"         icon={<LayoutDashboard className="w-4 h-4" />} label="Dashboard" />
                          <MenuItem href="/dashboard/profile" icon={<User className="w-4 h-4" />}            label="Mon profil" />
                          <MenuItem href="/dashboard/messages" icon={<MessageCircle className="w-4 h-4" />} label="Messages" />
                          <MenuItem href="/dashboard/settings" icon={<Settings className="w-4 h-4" />}       label="Paramètres" />
                          {isAdmin && (
                            <MenuItem href="/admin"           icon={<Shield className="w-4 h-4" />}          label="Administration" className="text-brand-400" />
                          )}
                          <button
                            onClick={() => signOut({ callbackUrl: "/" })}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-dark-400 hover:text-red-400 hover:bg-red-500/5 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Déconnexion
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="hidden sm:block px-4 py-2 rounded-xl text-sm font-medium text-dark-300 hover:text-white transition-colors"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 rounded-xl text-sm font-bold bg-brand-500 hover:bg-brand-600 text-white transition-colors"
                  >
                    Inscription
                  </Link>
                </>
              )}

              {/* Mobile menu */}
              <button
                onClick={() => setMenuOpen(v => !v)}
                className="lg:hidden w-9 h-9 rounded-xl flex items-center justify-center text-dark-400 hover:text-white hover:bg-white/5 transition-all"
              >
                {menuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Search bar dropdown */}
        {searchOpen && (
          <div className="border-t border-white/8 bg-[#0e1117]/95 px-4 py-3">
            <SearchBar autoFocus onSearch={() => setSearchOpen(false)} />
          </div>
        )}
      </header>

      {/* Notifications drawer */}
      <Drawer open={notifOpen} onClose={() => setNotifOpen(false)} title="Notifications" side="right" width="w-80">
        <NotificationsPanel onClose={() => setNotifOpen(false)} />
      </Drawer>

      {/* Click-away for user menu */}
      {userOpen && (
        <div className="fixed inset-0 z-40" onClick={() => setUserOpen(false)} aria-hidden="true" />
      )}

      {/* Spacer */}
      <div className="h-16" />
    </>
  );
}

function MenuItem({
  href, icon, label, className
}: { href: string; icon: React.ReactNode; label: string; className?: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-dark-400 hover:text-white hover:bg-white/5 transition-colors",
        className
      )}
    >
      {icon}
      {label}
    </Link>
  );
}
