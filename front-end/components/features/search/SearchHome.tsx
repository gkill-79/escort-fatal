"use client";

import { useState, useEffect } from "react";
import { HomeRadarFilters, HomeRadarFiltersData } from "./HomeRadarFilters";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

// the react-leaflet component MUST be loaded dynamically with SSR disabled!
const MapRadar = dynamic(() => import("./MapRadar"), { 
  ssr: false, 
  loading: () => (
    <div className="w-full h-full bg-dark-900 flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-brand-500 animate-spin" />
    </div>
  )
});

export function SearchHome() {
  const [profiles, setProfiles] = useState<any[]>([]);
  const [resultCount, setResultCount] = useState(0);
  const [loading, setLoading] = useState(false);
  
  const [filters, setFilters] = useState<HomeRadarFiltersData>({
    gender: "",
    minAge: "",
    maxAge: "",
    maxPrice: "",
    services: [],
    isOnline: false,
  });

  const [bounds, setBounds] = useState({
    minLat: 41.0, 
    maxLat: 51.5,
    minLon: -5.0,
    maxLon: 9.0
  });

  // Debounced API Fetches so it doesn't slam the endpoint on fast map panning
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const query = new URLSearchParams();
        
        if (bounds.minLat) query.append("minLat", bounds.minLat.toString());
        if (bounds.maxLat) query.append("maxLat", bounds.maxLat.toString());
        if (bounds.minLon) query.append("minLon", bounds.minLon.toString());
        if (bounds.maxLon) query.append("maxLon", bounds.maxLon.toString());

        if (filters.gender) query.append("gender", filters.gender);
        if (filters.minAge) query.append("minAge", filters.minAge);
        if (filters.maxAge) query.append("maxAge", filters.maxAge);
        if (filters.maxPrice) query.append("maxPrice", filters.maxPrice);
        if (filters.isOnline) query.append("isOnline", "true");
        if (filters.services.length > 0) query.append("services", filters.services.join(","));

        // Limit defaults to 100 via Meilisearch API
        const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
        const res = await fetch(`${API_URL}/radar?${query.toString()}`);
        if (!res.ok) throw new Error("Erreur Search Route");
        
        const data = await res.json();
        setProfiles(data.data || []);
        setResultCount(data.count || 0);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(fetchData, 400); // 400ms debounce
    return () => clearTimeout(timer);
  }, [bounds, filters]);

  return (
    <div className="relative w-full h-[600px] lg:h-[750px] bg-dark-950 rounded-3xl overflow-hidden border border-white/10 shadow-[0_10px_40px_rgba(0,0,0,0.5)] flex flex-col mt-4 mb-20">
      
      <HomeRadarFilters 
        filters={filters} 
        onChange={setFilters} 
        resultCount={resultCount}
      />
      
      <div className="flex-1 relative z-0">
        <MapRadar 
          profiles={profiles}
          onBoundsChange={setBounds}
          center={[46.603354, 1.888334]} // France center
          zoom={6}
        />
        
        {loading && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[1000] bg-brand-500 text-white px-4 py-2 rounded-full font-bold text-sm flex items-center shadow-[0_0_15px_rgba(233,69,96,0.5)]">
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Scan Radar...
          </div>
        )}
      </div>

    </div>
  );
}
