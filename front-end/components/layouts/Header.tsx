"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import {
  Search, Menu, X, User, LogOut, Settings,
  ChevronDown, Flame, Video, Camera, MessageCircle,
  Star, Users, Map, Coins, ShieldAlert, Zap
} from "lucide-react";
import { cn } from "@/lib/utils/cn";
import { Button } from "@/components/ui/Button";

const NAV_ITEMS = [
  {
    label: "Escortes",
    href:  "/escorts",
    icon:  <Flame className="w-3.5 h-3.5" />,
    dropdown: [
      { label: "Toutes les escortes",   href: "/escorts?isOnline=true",          desc: "Voir qui est en ligne maintenant" },
      { label: "Nouveaux profils",      href: "/escorts?sort=newest",            desc: "Dernières arrivées" },
      { label: "Services webcam",       href: "/escorts?services=WEBCAM",        desc: "Depuis chez vous" },
      { label: "TV / Trans",            href: "/escorts?gender=TRANS",           desc: "Profils trans et travestis" },
      { label: "Hommes",                href: "/escorts?gender=MALE",            desc: "Escortes masculines" },
      { label: "Couples",               href: "/escorts?gender=COUPLE",          desc: "Pour tous les goûts" },
    ],
  },
  {
    label: "Photos",
    href:  "/media?type=photos",
    icon:  <Camera className="w-3.5 h-3.5" />,
    dropdown: [
      { label: "Galerie photos",    href: "/media?type=photos",    desc: "Parcourir les photos" },
      { label: "Top 100 photos",    href: "/media?sort=top",       desc: "Les mieux notées" },
    ],
  },
  {
    label: "Vidéos",
    href:  "/media?type=videos",
    icon:  <Video className="w-3.5 h-3.5" />,
  },
  {
    label: "Chat",
    href:  "/escorts?isOnline=true",
    icon:  <MessageCircle className="w-3.5 h-3.5" />,
    dropdown: [
      { label: "Dans le chat",  href: "/escorts?isOnline=true", desc: "Membres connectés maintenant" },
    ],
  },
  {
    label: "Top 50",
    href:  "/escorts?isTopGirl=true",
    icon:  <Star className="w-3.5 h-3.5" />,
  },
  {
    label: "Villes",
    href:  "/all-cities",
    icon:  <Map className="w-3.5 h-3.5" />,
    dropdown: [
      { label: "Annuaire des villes",   href: "/all-cities",       desc: "Chercher géolocalisé" },
    ],
  },
];

export function Header() {
  const [isScrolled,      setIsScrolled]      = useState(false);
  const [mobileMenuOpen,  setMobileMenuOpen]  = useState(false);
  const [activeDropdown,  setActiveDropdown]  = useState<string | null>(null);
  const [onlineCount,     setOnlineCount]     = useState(2649);
  const { data: session } = useSession();

  useEffect(() => {
    const handler = () => setIsScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-[#0e1117]/95 backdrop-blur-xl border-b border-white/5 shadow-2xl"
          : "bg-gradient-to-b from-[#0e1117] to-transparent"
      )}
    >
      {/* Top bar */}
      <div className="bg-[#080c14] border-b border-white/5 px-4">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between h-8 text-[11px]">
          <div className="flex items-center gap-4 text-dark-400">
            <Link href="/france" className="hover:text-white transition-colors flex items-center gap-1">
              🇫🇷 France
            </Link>
            <Link href="/belgium" className="hover:text-white transition-colors flex items-center gap-1">
              🇧🇪 Belgique
            </Link>
            <Link href="/luxembourg" className="hover:text-white transition-colors flex items-center gap-1">
              🇱🇺 Luxembourg
            </Link>
          </div>
          <div className="flex items-center gap-3 text-dark-400">
            <span className="flex items-center gap-1">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-green-400 font-semibold">{onlineCount.toLocaleString()}</span>
              <span>en ligne</span>
            </span>
            <Link href="/annonces" className="hover:text-white transition-colors">Annonces</Link>
          </div>
        </div>
      </div>

      {/* Main nav */}
      <div className="px-4">
        <div className="max-w-[1600px] mx-auto flex items-center h-16 gap-6">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-8 h-8 rounded-lg bg-brand-500 flex items-center justify-center shadow-[0_0_16px_rgba(230,57,70,0.5)] group-hover:shadow-[0_0_24px_rgba(230,57,70,0.7)] transition-shadow">
              <Flame className="w-4.5 h-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div>
              <span className="font-display text-xl font-black text-white leading-none block">
                Escorte<span className="text-brand-500">Fatal</span>
              </span>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {NAV_ITEMS.map(item => (
              <div
                key={item.label}
                className="relative h-full flex items-center"
                onMouseEnter={() => setActiveDropdown(item.label)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium",
                    "text-dark-300 hover:text-white hover:bg-white/5 transition-all duration-150",
                    activeDropdown === item.label && "text-white bg-white/5"
                  )}
                >
                  {item.icon}
                  {item.label}
                  {item.dropdown && (
                    <ChevronDown
                      className={cn(
                        "w-3 h-3 transition-transform duration-200",
                        activeDropdown === item.label && "rotate-180"
                      )}
                    />
                  )}
                </Link>

                {/* Dropdown */}
                {item.dropdown && activeDropdown === item.label && (
                  <div className="absolute top-full left-0 pt-2 z-50 animate-[slideDownFade_0.15s_ease-out]">
                    <div className="bg-[#1c2235] border border-white/8 rounded-xl shadow-2xl overflow-hidden min-w-[240px] py-1.5">
                      {item.dropdown.map(sub => (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          className="flex flex-col px-4 py-2.5 hover:bg-white/5 transition-colors"
                        >
                          <span className="text-sm font-medium text-white">{sub.label}</span>
                          <span className="text-xs text-dark-400 mt-0.5">{sub.desc}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2 ml-auto">
            <Link
              href="/search"
              className="w-9 h-9 flex items-center justify-center rounded-lg text-dark-400 hover:text-white hover:bg-white/5 transition-colors"
            >
              <Search className="w-4.5 h-4.5" />
            </Link>

            {session ? (
              <>
                <Link href="/member/credits" className="hidden xl:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-brand-500 to-rose-600 hover:from-brand-400 hover:to-rose-500 text-white text-xs font-black rounded-xl shadow-lg shadow-brand-500/20 transition-all hover:scale-105 active:scale-95 group">
                   <Zap className="w-3.5 h-3.5 fill-white group-hover:animate-pulse" />
                   ACHETER DES CRÉDITS
                </Link>

                <div
                  className="relative h-full flex items-center"
                  onMouseEnter={() => setActiveDropdown("user")}
                  onMouseLeave={() => setActiveDropdown(null)}
                >
                  <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors">
                    <div className="w-7 h-7 rounded-full bg-brand-500/20 border border-brand-500/40 flex items-center justify-center">
                      <User className="w-3.5 h-3.5 text-brand-400" />
                    </div>
                    <span className="text-sm text-dark-300 hidden sm:block max-w-[100px] truncate">
                      {session.user?.username || session.user?.email}
                    </span>
                    <ChevronDown className="w-3 h-3 text-dark-500" />
                  </button>

                  {activeDropdown === "user" && (
                    <div className="absolute top-full right-0 pt-2 z-50">
                      <div className="bg-[#1c2235] border border-white/8 rounded-xl shadow-2xl py-1.5 min-w-[180px]">
                      <Link href="/dashboard" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/5 text-sm text-white transition-colors">
                          <Settings className="w-4 h-4 text-dark-400" /> Espace Escorte
                        </Link>
                        <Link href="/member/credits" className="flex items-center justify-between px-4 py-2.5 hover:bg-white/5 text-sm text-white transition-colors">
                          <div className="flex items-center gap-2.5">
                            <Coins className="w-4 h-4 text-brand-400" /> Mes Crédits
                          </div>
                          <span className="bg-brand-500/20 text-brand-400 text-[10px] font-bold px-2 py-0.5 rounded-full">Recharger</span>
                        </Link>
                        {(session.user as any)?.role === "ADMIN" && (
                          <>
                            <div className="my-1 border-t border-white/5" />
                            <Link href="/admin" className="flex items-center gap-2.5 px-4 py-2.5 hover:bg-red-500/10 text-sm text-red-400 hover:text-red-300 transition-colors font-semibold">
                              <ShieldAlert className="w-4 h-4" /> Administration
                            </Link>
                          </>
                        )}
                        <button
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/5 text-sm text-dark-300 hover:text-red-400 transition-colors"
                        >
                          <LogOut className="w-4 h-4" /> Déconnexion
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm">Connexion</Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">Inscription</Button>
                </Link>
              </>
            )}

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-dark-300"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0e1117]/98 backdrop-blur-xl border-t border-white/5 animate-[slideDownFade_0.2s_ease-out]">
          <nav className="max-w-[1600px] mx-auto px-4 py-4 space-y-1">
            {NAV_ITEMS.map(item => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-3 rounded-xl text-dark-300 hover:text-white hover:bg-white/5 transition-colors"
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </Link>
            ))}
            {!session && (
              <div className="pt-2 flex gap-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button variant="secondary" size="sm" fullWidth>Connexion</Button>
                </Link>
                <Link href="/register" onClick={() => setMobileMenuOpen(false)} className="flex-1">
                  <Button size="sm" fullWidth>Inscription</Button>
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
