"use client";

import { useState } from "react";
import { Filter, Users, Flame, CreditCard } from "lucide-react";

export interface HomeRadarFiltersData {
  gender: string;
  minAge: string;
  maxAge: string;
  maxPrice: string;
  services: string[];
  isOnline: boolean;
}

interface HomeRadarFiltersProps {
  filters: HomeRadarFiltersData;
  onChange: (newFilters: HomeRadarFiltersData) => void;
  resultCount: number;
}

const COMMON_SERVICES = ["GFE", "MASSAGE", "OUTCALL", "INCALL", "BDSM"];

export function HomeRadarFilters({ filters, onChange, resultCount }: HomeRadarFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateFilter = (key: keyof HomeRadarFiltersData, value: any) => {
    onChange({ ...filters, [key]: value });
  };

  const toggleService = (service: string) => {
    if (filters.services.includes(service)) {
      updateFilter("services", filters.services.filter(s => s !== service));
    } else {
      updateFilter("services", [...filters.services, service]);
    }
  };

  return (
    <div className="bg-dark-900 border-b border-white/5 relative z-10 shrink-0">
      <div className="flex items-center justify-between p-3 md:p-4">
        
        <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
          <button 
            onClick={() => setIsOpen(!isOpen)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${isOpen ? 'bg-brand-500 text-white border-brand-500' : 'bg-dark-800 text-dark-200 border-white/10 hover:bg-dark-700'}`}
          >
            <Filter className="w-4 h-4" /> Filtres
          </button>

          <button 
            onClick={() => updateFilter("isOnline", !filters.isOnline)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all whitespace-nowrap border ${filters.isOnline ? 'bg-green-500/10 text-green-400 border-green-500/30' : 'bg-dark-800 text-dark-200 border-white/10 hover:bg-dark-700'}`}
          >
             <Flame className="w-4 h-4" /> En Ligne
          </button>

          <select 
            value={filters.gender}
            onChange={(e) => updateFilter("gender", e.target.value)}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all bg-dark-800 text-dark-200 border border-white/10 hover:bg-dark-700 focus:outline-none focus:border-brand-500 cursor-pointer appearance-none pr-8"
            style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'16\' height=\'16\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'%236b7280\' stroke-width=\'2\' stroke-linecap=\'round\' stroke-linejoin=\'round\'%3E%3Cpath d=\'m6 9 6 6 6-6\'/%3E%3C/svg%3E")', backgroundPosition: 'right 12px center', backgroundRepeat: 'no-repeat'}}
          >
            <option value="">Tous les genres</option>
            <option value="FEMALE">Femmes</option>
            <option value="MALE">Hommes</option>
            <option value="TRANS">Trans</option>
            <option value="COUPLE">Couples</option>
          </select>

          <div className="flex items-center px-4 py-2 rounded-full text-sm font-bold transition-all bg-dark-800 border border-white/10 shrink-0 gap-2 focus-within:border-brand-500">
             <CreditCard className="w-4 h-4 text-dark-400" />
             <input 
               type="number" 
               placeholder="Budget Max (€)" 
               value={filters.maxPrice}
               onChange={(e) => updateFilter("maxPrice", e.target.value)}
               className="bg-transparent border-none text-white w-28 focus:outline-none placeholder-dark-500"
               min={0}
               step={50}
             />
          </div>
        </div>

        <div className="hidden lg:flex shrink-0 ml-4 font-black text-white/50 text-sm bg-black/20 px-3 py-1.5 rounded border border-white/5">
           {resultCount} Profil(s)
        </div>

      </div>

      {isOpen && (
        <div className="p-4 border-t border-white/5 bg-dark-900/90 backdrop-blur w-full flex flex-wrap gap-4 items-center">
            
            <div className="flex items-center gap-2">
              <span className="text-dark-400 text-sm font-medium">Âge :</span>
              <input type="number" placeholder="Min" value={filters.minAge} onChange={(e) => updateFilter("minAge", e.target.value)} className="w-16 bg-dark-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500" />
              <span className="text-dark-400">-</span>
              <input type="number" placeholder="Max" value={filters.maxAge} onChange={(e) => updateFilter("maxAge", e.target.value)} className="w-16 bg-dark-800 border border-white/10 rounded-lg px-2 py-1.5 text-sm text-white focus:outline-none focus:border-brand-500" />
            </div>

            <div className="h-6 w-px bg-white/10 mx-2 hidden md:block"></div>

            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-dark-400 text-sm font-medium mr-2">Prestations :</span>
              {COMMON_SERVICES.map(service => (
                <button
                  key={service}
                  onClick={() => toggleService(service)}
                  className={`px-3 py-1 rounded border text-xs font-bold transition-colors ${
                    filters.services.includes(service)
                      ? "bg-purple-500/20 border-purple-500 text-purple-300"
                      : "bg-dark-800 border-white/10 text-dark-300 hover:bg-dark-700"
                  }`}
                >
                  {service}
                </button>
              ))}
            </div>

            {(filters.minAge || filters.maxAge || filters.maxPrice || filters.gender || filters.services.length > 0 || filters.isOnline) && (
              <button 
                onClick={() => onChange({ gender: "", minAge: "", maxAge: "", maxPrice: "", services: [], isOnline: false })}
                className="ml-auto text-sm text-red-400 hover:text-red-300 font-bold transition-colors"
              >
                Réinitialiser
              </button>
            )}

        </div>
      )}
    </div>
  );
}
