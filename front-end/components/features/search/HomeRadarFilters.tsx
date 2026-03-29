'use client';

import { cn } from "@/lib/utils/cn";

interface HomeRadarFiltersProps {
  radius: number;
  setRadius: (val: number) => void;
  isAvailableNow: boolean;
  setIsAvailableNow: (val: boolean) => void;
  category: string;
  setCategory: (val: string) => void;
}

export function HomeRadarFilters({
  radius, setRadius,
  isAvailableNow, setIsAvailableNow,
  category, setCategory
}: HomeRadarFiltersProps) {
  
  const categories = ["ESCORT", "TV/TS", "MASSAGE", "WEBCAM"];

  return (
    <div className="space-y-6">
      {/* Rayon de recherche */}
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2 flex justify-between">
          Rayon de recherche
          <span className="text-brand-400 font-bold">{radius / 1000} km</span>
        </label>
        <input 
          type="range" 
          min="1000" 
          max="100000" 
          step="1000"
          value={radius} 
          onChange={(e) => setRadius(parseInt(e.target.value))}
          className="w-full h-1.5 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
        />
      </div>

      {/* Catégories (Filtre rapide) */}
      <div>
        <label className="block text-sm font-medium text-dark-300 mb-2">Prestation</label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCategory('')}
            className={cn(
              "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
              category === '' ? "bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20" : "bg-dark-800 text-dark-400 border-white/5 hover:border-white/10"
            )}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={cn(
                "px-3 py-1.5 rounded-full text-xs font-semibold transition-all border",
                category === cat ? "bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20" : "bg-dark-800 text-dark-400 border-white/5 hover:border-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Disponibilité immédiate */}
      <label className="flex items-center justify-between p-3 rounded-xl bg-dark-800/50 border border-white/5 cursor-pointer hover:border-green-500/30 transition-colors group">
        <span className="text-sm font-medium text-dark-200">En ligne maintenant</span>
        <div className="relative inline-flex items-center h-5 w-10">
          <input 
            type="checkbox" 
            checked={isAvailableNow} 
            onChange={(e) => setIsAvailableNow(e.target.checked)}
            className="sr-only"
          />
          <div className={cn(
            "w-full h-full rounded-full transition-colors",
            isAvailableNow ? "bg-green-500" : "bg-dark-600"
          )} />
          <div className={cn(
            "absolute left-0.5 top-0.5 bg-white w-4 h-4 rounded-full transition-transform",
            isAvailableNow && "translate-x-5"
          )} />
        </div>
      </label>
    </div>
  );
}
