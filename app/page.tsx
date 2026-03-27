import type { Metadata } from "next";
import Link from "next/link";
import { Flame, Users, MapPin, Video, ChevronRight, Zap } from "lucide-react";
import { getTopGirls, getOnlineProfiles, getSiteStats, getNewProfiles } from "@/lib/queries/profiles";
import { getPopularCities } from "@/lib/queries/cities";
import { ProfileCard } from "@/components/features/profiles/ProfileCard";
import { LiveFeedWidget } from "@/components/features/misc/LiveFeedWidget";
import { SearchHome } from "@/components/features/search/SearchHome";
import { Radar } from "@/components/features/radar/Radar";
import { Button } from "@/components/ui/Button";
import { formatCount } from "@/lib/utils";
import { Header } from "@/components/layouts/Header";

export const metadata: Metadata = {
  title: "Escorte Fatal — Annonces Escortes France",
  description: "Rencontrez des escortes et modèles près de chez vous. Plus de 15 000 annonces vérifiées en France.",
};

export const revalidate = 60; // ISR — revalidate every 60s

export default async function HomePage() {
  const [stats, topGirls, onlineProfiles, newProfiles, popularCities] = await Promise.all([
    getSiteStats(),
    getTopGirls(24),
    getOnlineProfiles(12),
    getNewProfiles(12),
    getPopularCities(20),
  ]);

  return (
    <div className="min-h-screen">
      <Header />

      {/* ─── Hero Section ──────────────────────────────────────── */}
      <section className="relative py-12 lg:py-20 overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-brand-500/5 via-transparent to-purple-500/5" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(230,57,70,0.08)_0%,transparent_60%)]" />

        <div className="relative max-w-[1600px] mx-auto px-4 pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand-500/10 border border-brand-500/20 rounded-full px-3 py-1.5 text-xs text-brand-400 font-semibold mb-5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
              {stats.onlineCount.toLocaleString()} escortes en ligne maintenant
            </div>

            <h1 className="font-display text-4xl lg:text-6xl font-black text-white leading-tight mb-4">
              Trouvez votre
              <span className="text-gradient-red block">escorte idéale</span>
              près de chez vous
            </h1>

            <p className="text-dark-300 text-lg leading-relaxed mb-8 max-w-xl">
              {formatCount(stats.totalProfiles)} annonces d&apos;escortes vérifiées dans {stats.totalCities}+ villes de France, Belgique et Luxembourg.
            </p>

            {/* Stats pills */}
            <div className="flex flex-wrap gap-3 mb-8">
              {[
                { icon: <Users className="w-4 h-4" />, value: formatCount(stats.totalProfiles), label: "Annonces" },
                { icon: <Zap className="w-4 h-4" />, value: formatCount(stats.onlineCount), label: "En ligne" },
                { icon: <MapPin className="w-4 h-4" />, value: stats.totalCities.toString(), label: "Villes" },
              ].map(stat => (
                <div key={stat.label} className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-4 py-2.5">
                  <span className="text-brand-400">{stat.icon}</span>
                  <span className="text-white font-bold">{stat.value}</span>
                  <span className="text-dark-400 text-sm">{stat.label}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-3 flex-wrap">
              <Link href="/escorts?isOnline=true">
                <Button size="lg">
                  <Flame className="w-4 h-4" />
                  Voir les escortes en ligne
                </Button>
              </Link>
              <Link href="/escorts/photos">
                <Button variant="secondary" size="lg">
                  <Video className="w-4 h-4" />
                  Galerie photos
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Map Radar Search ──────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 relative z-10 -mt-8 sm:-mt-12 mb-16 space-y-6">
        <SearchHome />
        <Radar />
      </div>

      {/* ─── Main Content ──────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 pb-16">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8">

          {/* Left column — profiles */}
          <div className="space-y-12">

            {/* TOP GIRLS */}
            <section>
              <SectionHeader
                title="TOP GIRLS"
                subtitle="Les profils du moment"
                icon="⭐"
                href="/escorts?isTopGirl=true"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 lg:gap-4">
                {topGirls.slice(0, 24).map((p: unknown, i: number) => (
                  <ProfileCard key={(p as { id: string }).id} profile={p as never} priority={i < 8} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/escorts?isTopGirl=true">
                  <Button variant="outline">
                    Voir toutes les Top Girls <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </section>

            {/* EN LIGNE MAINTENANT */}
            <section>
              <SectionHeader
                title="En ligne maintenant"
                subtitle={`${stats.onlineCount} disponibles`}
                icon="🟢"
                href="/escorts?isOnline=true"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 lg:gap-4">
                {onlineProfiles.slice(0, 12).map((p: unknown) => (
                  <ProfileCard key={(p as { id: string }).id} profile={p as never} />
                ))}
              </div>
              <div className="mt-6 text-center">
                <Link href="/escorts?isOnline=true">
                  <Button variant="outline">
                    Voir toutes — {stats.onlineCount} en ligne <ChevronRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            </section>

            {/* NOUVEAUX PROFILS */}
            <section>
              <SectionHeader
                title="Nouveaux profils"
                subtitle="Fraîchement arrivées"
                icon="✨"
                href="/escorts?sort=newest"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-4 gap-3 lg:gap-4">
                {newProfiles.slice(0, 12).map((p: unknown) => (
                  <ProfileCard key={(p as { id: string }).id} profile={p as never} />
                ))}
              </div>
            </section>

            {/* CITIES GRID */}
            <section>
              <SectionHeader
                title="Chercher par ville"
                subtitle="Toutes les villes de France"
                icon="🗺️"
                href="/all-cities"
              />
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
                {popularCities.map((city: { id: number; name: string; slug: string; profileCount: number }) => (
                  <Link
                    key={city.id}
                    href={`/escorts/${city.slug}`}
                    className="flex items-center justify-between p-3 rounded-xl bg-dark-800/60 border border-white/5 hover:border-brand-500/30 hover:bg-dark-700/60 transition-all group"
                  >
                    <span className="text-sm text-dark-200 group-hover:text-white transition-colors font-medium truncate">
                      {city.name}
                    </span>
                    <span className="text-xs text-dark-500 shrink-0 ml-2">
                      {formatCount(city.profileCount)}
                    </span>
                  </Link>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link href="/all-cities">
                  <Button variant="ghost" size="sm">
                    Voir toutes les villes <ChevronRight className="w-3.5 h-3.5" />
                  </Button>
                </Link>
              </div>
            </section>
          </div>

          {/* Right sidebar — Live Feed */}
          <aside className="hidden xl:block">
            <div className="sticky top-28 space-y-6">
              <LiveFeedWidget />

              {/* CTA Poster annonce */}
              <div className="rounded-2xl bg-gradient-to-br from-brand-500/15 to-brand-900/30 border border-brand-500/20 p-5">
                <Flame className="w-6 h-6 text-brand-400 mb-3" />
                <h3 className="font-bold text-white text-base mb-1">
                  Vous êtes escorte ?
                </h3>
                <p className="text-dark-400 text-xs leading-relaxed mb-4">
                  Publiez votre annonce gratuitement et rejoignez des milliers de profils.
                </p>
                <Link href="/register/escort">
                  <Button size="sm" fullWidth>
                    Créer mon profil
                  </Button>
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

// ─── Section Header ───────────────────────────────────────────────────
function SectionHeader({
  title, subtitle, icon, href
}: { title: string; subtitle?: string; icon?: string; href?: string }) {
  return (
    <div className="flex items-center justify-between mb-5">
      <div className="flex items-center gap-3">
        {icon && <span className="text-xl">{icon}</span>}
        <div>
          <h2 className="text-lg font-bold text-white leading-tight">{title}</h2>
          {subtitle && <p className="text-xs text-dark-400 mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {href && (
        <Link
          href={href}
          className="text-xs text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1"
        >
          Voir tout <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      )}
    </div>
  );
}
