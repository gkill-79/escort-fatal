'use client';

import { cn } from "@/lib/utils/cn";
import { CheckCircle2, SlidersHorizontal } from "lucide-react";

export interface AdvancedFilters {
  isAvailableNow: boolean;
  category: string;
  ageRange: string;
  hairColor: string;
  origin: string;
  maxPrice: number | null;
  verifiedOnly: boolean;
}

interface HomeRadarFiltersProps {
  radius: number;
  setRadius: (val: number) => void;
  filters: AdvancedFilters;
  setFilters: React.Dispatch<React.SetStateAction<AdvancedFilters>>;
}

export function HomeRadarFilters({ radius, setRadius, filters, setFilters }: HomeRadarFiltersProps) {
  
  const categories = ["ESCORT", "TV/TS", "MASSAGE", "WEBCAM"];

  const updateFilter = (key: keyof AdvancedFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex flex-col gap-4 p-4 z-10 relative bg-dark-900/80 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl shadow-black/50 overflow-hidden">
      
      {/* Ligne 1 : Filtres Rapides & Catégories */}
      <div className="flex flex-wrap items-center gap-3">
        
        {/* En ligne maintenant */}
        <button
          onClick={() => updateFilter('isAvailableNow', !filters.isAvailableNow)}
          className={cn(
            "px-4 py-2 rounded-full font-bold text-xs transition-all border flex items-center gap-2",
            filters.isAvailableNow 
              ? "bg-green-500 text-white border-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)]" 
              : "bg-dark-800 text-dark-300 border-white/5 hover:border-white/20"
          )}
        >
          <span className={cn("w-2 h-2 rounded-full", filters.isAvailableNow ? "bg-white animate-pulse" : "bg-green-500")}></span>
          En ligne
        </button>

        {/* Profils Vérifiés */}
        <button
          onClick={() => updateFilter('verifiedOnly', !filters.verifiedOnly)}
          className={cn(
            "px-4 py-2 rounded-full font-bold text-xs transition-all border flex items-center gap-2",
            filters.verifiedOnly 
              ? "bg-blue-500 text-white border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.4)]" 
              : "bg-dark-800 text-dark-300 border-white/5 hover:border-white/20"
          )}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          Vérifiés
        </button>

        <div className="hidden md:block w-px h-6 bg-white/10 mx-1" />

        {/* Catégories */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar py-1">
          <button
            onClick={() => updateFilter('category', '')}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap",
              filters.category === '' ? "bg-brand-500 text-white border-brand-500" : "bg-dark-800 text-dark-400 border-white/5 hover:border-white/10"
            )}
          >
            Tous
          </button>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => updateFilter('category', filters.category === cat ? '' : cat)}
              className={cn(
                "px-4 py-2 rounded-full text-xs font-bold transition-all border whitespace-nowrap",
                filters.category === cat ? "bg-brand-500 text-white border-brand-500 shadow-lg shadow-brand-500/20" : "bg-dark-800 text-dark-400 border-white/5 hover:border-white/10"
              )}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Ligne 2 : Filtres Avancés & Slider */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 pt-2 border-t border-white/5">
        
        {/* Rayon */}
        <div className="col-span-2 md:col-span-1 flex flex-col gap-1">
          <span className="text-[10px] font-bold text-dark-500 uppercase px-1">Rayon: <span className="text-brand-400">{radius / 1000}km</span></span>
          <input 
            type="range" min="1000" max="100000" step="1000" value={radius} 
            onChange={(e) => setRadius(parseInt(e.target.value))}
            className="w-full h-1.5 bg-dark-700 rounded-lg appearance-none cursor-pointer accent-brand-500"
          />
        </div>

        {/* Âge */}
        <select 
          value={filters.ageRange}
          onChange={(e) => updateFilter('ageRange', e.target.value)}
          className="bg-dark-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer hover:border-white/20 transition-colors"
        >
          <option value="">Âge (Tous)</option>
          <option value="18-25">18 - 25 ans</option>
          <option value="26-35">26 - 35 ans</option>
          <option value="36-45">36 - 45 ans</option>
          <option value="46+">46 ans et +</option>
        </select>

        {/* Cheveux */}
        <select 
          value={filters.hairColor}
          onChange={(e) => updateFilter('hairColor', e.target.value)}
          className="bg-dark-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer hover:border-white/20 transition-colors"
        >
          <option value="">Cheveux (Tous)</option>
          <option value="Blonde">Blonde</option>
          <option value="Brune">Brune</option>
          <option value="Rousse">Rousse</option>
          <option value="Noire">Noire</option>
        </select>

        {/* Origine */}
        <select 
          value={filters.origin}
          onChange={(e) => updateFilter('origin', e.target.value)}
          className="bg-dark-800 border border-white/5 rounded-xl px-3 py-2 text-xs text-white outline-none cursor-pointer hover:border-white/20 transition-colors"
        >
          <option value="">Origine (Toutes)</option>
          <option value="Européenne">Européenne</option>
          <option value="Latina">Latina</option>
          <option value="Asiatique">Asiatique</option>
          <option value="Africaine">Africaine</option>
        </select>

        {/* Prix Max */}
        <div className="flex items-center gap-2 bg-dark-800 border border-white/5 rounded-xl px-3 py-2">
          <span className="text-[10px] font-bold text-dark-500 uppercase">Max €</span>
          <input 
            type="number"
            placeholder="Prix"
            value={filters.maxPrice || ''}
            onChange={(e) => updateFilter('maxPrice', e.target.value ? Number(e.target.value) : null)}
            className="bg-transparent w-full text-xs text-white outline-none"
          />
        </div>

        {/* Bouton Reset visible uniquement si filtres actifs */}
        {(filters.ageRange || filters.hairColor || filters.origin || filters.maxPrice || filters.verifiedOnly) && (
          <button 
            onClick={() => setFilters({
              isAvailableNow: false, category: "", ageRange: "", 
              hairColor: "", origin: "", maxPrice: null, verifiedOnly: false
            })}
            className="bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl px-3 py-2 text-[10px] font-bold uppercase hover:bg-red-500/20 transition-colors"
          >
            Réinitialiser
          </button>
        )}
      </div>
    </div>
  );
}
