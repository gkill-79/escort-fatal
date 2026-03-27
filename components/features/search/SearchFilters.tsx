"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";

interface SearchFiltersProps {
  cities: { id: number; name: string }[];
}

export function SearchFilters({ cities }: SearchFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleApply = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    
    if (formData.get("cityId")) params.append("cityId", formData.get("cityId") as string);
    if (formData.get("gender")) params.append("gender", formData.get("gender") as string);
    if (formData.get("minPrice")) params.append("minPrice", formData.get("minPrice") as string);
    if (formData.get("maxPrice")) params.append("maxPrice", formData.get("maxPrice") as string);
    if (formData.get("isOnline")) params.append("isOnline", "true");

    router.push(`/escorts?${params.toString()}`);
  };

  return (
    <div className="bg-dark-900 border border-white/5 bg-gradient-to-br from-dark-800/50 to-bg-dark-900/50 rounded-2xl p-6 sticky top-28">
      <h2 className="text-xl font-bold text-white mb-6">Filtres de recherche</h2>
      <form onSubmit={handleApply} className="space-y-5">
        
        <div>
          <label className="block text-xs font-bold text-dark-400 mb-2 uppercase tracking-wide">Ville</label>
          <select 
            name="cityId" 
            defaultValue={searchParams.get("cityId") || ""}
            className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 appearance-none pointer-events-auto"
          >
            <option value="">Toutes les villes</option>
            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-dark-400 mb-2 uppercase tracking-wide">Genre</label>
          <select 
            name="gender" 
            defaultValue={searchParams.get("gender") || ""}
            className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500 appearance-none pointer-events-auto"
          >
            <option value="">Tous les genres</option>
            <option value="FEMALE">Femmes</option>
            <option value="MALE">Hommes</option>
            <option value="TRANS">Trans</option>
            <option value="COUPLE">Couples</option>
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
           <div>
              <label className="block text-xs font-bold text-dark-400 mb-2 uppercase tracking-wide">Min Prix</label>
              <input type="number" name="minPrice" defaultValue={searchParams.get("minPrice") || ""} className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500" placeholder="€" />
           </div>
           <div>
              <label className="block text-xs font-bold text-dark-400 mb-2 uppercase tracking-wide">Max Prix</label>
              <input type="number" name="maxPrice" defaultValue={searchParams.get("maxPrice") || ""} className="w-full bg-dark-800 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-brand-500" placeholder="€" />
           </div>
        </div>

        <label className="flex items-center gap-3 cursor-pointer p-4 rounded-xl border border-white/10 bg-dark-800 hover:bg-dark-700 transition-colors">
          <input 
             type="checkbox" 
             name="isOnline" 
             defaultChecked={searchParams.get("isOnline") === "true"} 
             className="w-4 h-4 rounded border-dark-600 text-brand-500 focus:ring-brand-500 bg-dark-900" 
          />
          <span className="text-sm font-bold text-white">En Ligne Seulement</span>
        </label>

        <Button type="submit" fullWidth size="lg">Filtrer les résultats</Button>
      </form>
    </div>
  );
}
