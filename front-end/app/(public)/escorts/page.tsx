import { Metadata } from "next";
import { searchProfiles } from "@/lib/queries/profiles";
import { fetchApi } from "@/lib/api-client";
import { ProfileCard } from "@/components/features/profiles/ProfileCard";
import type { ProfileItem } from "@/components/features/profiles/ProfileCard";
import { SearchFilters } from "@/components/features/search/SearchFilters";
import { Flame } from "lucide-react";

export const metadata: Metadata = {
  title: "Recherche d'escortes — Escorte Fatal",
  description: "Recherchez parmi des milliers de profils vérifiés partout en France.",
};

type SearchPageProps = {
  searchParams: { [key: string]: string | string[] | undefined };
};

export default async function EscortsSearchPage({ searchParams }: SearchPageProps) {
  const page = parseInt(searchParams.page as string) || 1;
  const isOnline = searchParams.isOnline === "true" || searchParams.online === "true"; 
  
  const filters = {
    cityId: searchParams.cityId ? parseInt(searchParams.cityId as string) : undefined,
    gender: searchParams.gender as string | undefined,
    minPrice: searchParams.minPrice ? parseInt(searchParams.minPrice as string) : undefined,
    maxPrice: searchParams.maxPrice ? parseInt(searchParams.maxPrice as string) : undefined,
    isOnline,
  };

  const [searchResult, cities] = await Promise.all([
    searchProfiles(filters, page, 24),
    fetchApi("/cities/list").catch(() => [])
  ]);

  return (
    <div className="min-h-screen">
      {/* ─── Hero / Header ──────────────────────────────────────── */}
      <section className="relative py-8 lg:py-12 border-b border-white/5 bg-dark-900/50">
        <div className="max-w-[1600px] mx-auto px-4">
          <div className="flex items-center gap-3 mb-2">
            <Flame className="w-6 h-6 text-brand-400" />
            <h1 className="font-display text-3xl font-bold text-white">Recherche d&apos;escortes</h1>
          </div>
          <p className="text-dark-300">
            {searchResult.total} profil(s) correspond(ent) à vos critères.
          </p>
        </div>
      </section>

      {/* ─── Main Content ──────────────────────────────────────── */}
      <div className="max-w-[1600px] mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
          
          {/* Sidebar */}
          <aside className="hidden lg:block">
            <SearchFilters cities={cities} />
          </aside>

          {/* Listing */}
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
              {Array.isArray(searchResult?.items) && searchResult.items.map((profile: ProfileItem, index: number) => (
                <ProfileCard key={profile.id} profile={profile} priority={index < 4} />
              ))}
            </div>

            {(!Array.isArray(searchResult?.items) || searchResult.items.length === 0) && (
              <div className="py-20 text-center border border-dashed border-white/10 rounded-2xl">
                <p className="text-dark-400">Aucun profil ne correspond à votre recherche.</p>
              </div>
            )}

            {/* Basic Pagination */}
            {searchResult.totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                <span className="text-dark-400 text-sm">
                  Page {searchResult.page} sur {searchResult.totalPages}
                </span>
              </div>
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}
