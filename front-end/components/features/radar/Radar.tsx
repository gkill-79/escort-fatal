'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { HomeRadarFilters } from '../search/HomeRadarFilters';
import { fetchApi } from '@/lib/api-client';
import { MapPin, Search, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

// Importation dynamique du MapRadar car Leaflet a besoin du window (client-side)
const MapRadar = dynamic(
  () => import('../search/MapRadar'),
  { 
    ssr: false,
    loading: () => <div className="h-full w-full bg-dark-900 animate-pulse flex items-center justify-center text-dark-500 font-bold uppercase tracking-widest text-xs">Initialisation du Radar...</div>
  }
);

export function Radar() {
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // États des filtres avancés
  const [radius, setRadius] = useState(50000); // 50km par défaut
  const [filters, setFilters] = useState({
    isAvailableNow: false,
    category: "",
    ageRange: "",
    hairColor: "",
    origin: "",
    maxPrice: null as number | null,
    verifiedOnly: false,
  });

  // 3. Filtrage côté client complet (Mode SexeModel)
  const filteredProfiles = useMemo(() => {
    return profiles.filter((profile: any) => {
      // 1. En ligne
      if (filters.isAvailableNow && !profile.isOnline) return false;
      
      // 2. Vérifié
      if (filters.verifiedOnly && !profile.isVerified) return false;

      // 3. Catégorie / Prestation (Recherche multi-sources)
      if (filters.category) {
        const matchCat = profile.category === filters.category
          || (profile.categories && profile.categories.includes(filters.category))
          || (profile.services && profile.services.includes(filters.category));
        if (!matchCat) return false;
      }

      // 4. Âge
      if (filters.ageRange) {
        const age = profile.age || 20; // Fallback si non défini
        if (filters.ageRange === "18-25" && (age < 18 || age > 25)) return false;
        if (filters.ageRange === "26-35" && (age < 26 || age > 35)) return false;
        if (filters.ageRange === "36-45" && (age < 36 || age > 45)) return false;
        if (filters.ageRange === "46+" && age < 46) return false;
      }

      // 5. Cheveux (Sensible à la casse ou normalisé)
      if (filters.hairColor && profile.hairColor !== filters.hairColor) return false;

      // 6. Origine
      if (filters.origin && profile.origin !== filters.origin) return false;

      // 7. Prix max (priceFrom ou pricePerHour)
      if (filters.maxPrice) {
        const price = profile.priceFrom || profile.pricePerHour;
        if (price && price > filters.maxPrice) return false;
      }

      return true;
    });
  }, [profiles, filters]);

  // 1. Demander la position au chargement
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLoading(false);
        },
        (error) => {
          console.error("Géolocalisation refusée ou indisponible", error);
          // Fallback : Paris par défaut si l'utilisateur refuse
          setUserLocation({ lat: 48.8566, lng: 2.3522 });
          setLoading(false);
        },
        { enableHighAccuracy: true }
      );
    } else {
      // Pas de géolocalisation
      setUserLocation({ lat: 48.8566, lng: 2.3522 });
      setLoading(false);
    }
  }, []);

  // 2. Lancer la recherche dès que la position ou les filtres changent
  useEffect(() => {
    if (!userLocation) return;

    const fetchRadarProfiles = async () => {
      // On ne met fixed loading à true que si on n'a pas encore de profils 
      // pour éviter le flash blanc sur la carte lors des micro-changements
      // On extrait la plage d'âge
      let ageMin = null, ageMax = null;
      if (filters.ageRange) {
        if (filters.ageRange === "18-25") { ageMin = 18; ageMax = 25; }
        else if (filters.ageRange === "26-35") { ageMin = 26; ageMax = 35; }
        else if (filters.ageRange === "36-45") { ageMin = 36; ageMax = 45; }
        else if (filters.ageRange === "46+") { ageMin = 46; }
      }

      const queryParams = new URLSearchParams({
        lat: userLocation.lat.toString(),
        lng: userLocation.lng.toString(),
        radiusInMeters: radius.toString(),
        ...(filters.isAvailableNow && { isOnline: 'true' }),
        ...(filters.category && { category: filters.category }),
        ...(filters.maxPrice && { maxPrice: filters.maxPrice.toString() }),
        ...(filters.hairColor && { hairColor: filters.hairColor }),
        ...(filters.origin && { origin: filters.origin }),
        ...(filters.verifiedOnly && { isVerified: 'true' }),
        ...(ageMin && { ageMin: ageMin.toString() }),
        ...(ageMax && { ageMax: ageMax.toString() })
      });

      try {
        // Note: On utilise fetchApi pour injecter les headers de base si besoin
        const data = await fetchApi(`/radar/search?${queryParams}`);
        setProfiles(data || []);
      } catch (error) {
        console.error("Erreur fetch radar", error);
      }
    };

    fetchRadarProfiles();
  }, [userLocation, radius, filters]);

  if (loading && !userLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] bg-dark-950 text-white">
        <Loader2 className="w-12 h-12 text-brand-500 animate-spin mb-4" />
        <p className="text-xl font-bold animate-pulse">Scan GPS en cours...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row h-[calc(100vh-85px)] overflow-hidden bg-dark-950">
      
      {/* Panneau latéral : Filtres et Liste */}
      <div className="w-full md:w-[380px] lg:w-[420px] bg-dark-900 border-r border-white/5 flex flex-col shadow-2xl z-20 overflow-hidden">
        
        {/* En-tête du Radar */}
        <div className="p-6 pb-2 border-b border-white/5 bg-gradient-to-b from-dark-800/50 to-transparent">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-white flex items-center tracking-tight">
              <span className="relative flex h-3 w-3 mr-3 mt-1">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
              Radar Actif
            </h2>
            <div className="bg-dark-700/50 px-3 py-1 rounded-full border border-white/5">
                <span className="text-[10px] uppercase font-bold text-dark-400 tracking-widest">Temps Réel</span>
            </div>
          </div>
          
        </div>

        {/* Liste défilante des résultats proches */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 scrollbar-thin scrollbar-thumb-dark-700">
           <div className="flex justify-between items-center mb-2">
              <span className="text-xs font-bold text-dark-500 uppercase tracking-widest">
                {filteredProfiles.length} RÉSULTAT{filteredProfiles.length > 1 ? 'S' : ''} PROCHE{filteredProfiles.length > 1 ? 'S' : ''}
              </span>
              {userLocation && (
                <span className="text-[10px] text-dark-600 flex items-center gap-1">
                   <MapPin className="w-3 h-3" /> Paris, FR
                </span>
              )}
           </div>

           {filteredProfiles.length === 0 ? (
             <div className="py-20 text-center border-2 border-dashed border-white/5 rounded-2xl bg-dark-800/20">
                <Search className="w-10 h-10 text-dark-700 mx-auto mb-3" />
                <p className="text-dark-400 text-sm">Aucun profil trouvé dans ce rayon.</p>
                <button 
                  onClick={() => setFilters(prev => ({...prev, isAvailableNow: false, category: ""}))}
                  className="mt-4 text-brand-400 font-bold text-xs underline"
                >
                  Réinitialiser les filtres ?
                </button>
             </div>
           ) : (
             <div className="space-y-3">
               {filteredProfiles.map((profile) => (
                 <Link 
                   href={`/escorts/${profile.slug}`} 
                   key={profile.id}
                   className="flex items-center gap-4 p-3 rounded-2xl bg-dark-800/40 border border-white/5 hover:bg-dark-800 transition-all hover:border-brand-500/30 group"
                 >
                    <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0">
                      <Image 
                        src={profile.photos?.[0]?.url || profile.avatarUrl || "https://placehold.co/100x100/1e293b/64748b?text=..."} 
                        alt={profile.name}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                         <h4 className="font-bold text-white truncate text-sm">
                           {profile.name}
                           {profile.isOnline && <span className="ml-2 inline-block w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_green]"></span>}
                         </h4>
                         <span className="text-brand-400 font-bold text-xs">{profile.priceFrom}€/h</span>
                      </div>
                      <p className="text-xs text-dark-400 truncate">{profile.categories?.[0] || 'Escort'}</p>
                      <div className="flex items-center mt-1">
                         <span className="text-[9px] uppercase font-bold text-dark-600 bg-dark-700 px-2 py-0.5 rounded">
                            {profile.city}
                         </span>
                      </div>
                    </div>
                 </Link>
               ))}
             </div>
           )}
        </div>
      </div>

      {/* La Carte Interactive */}
      <div className="flex-1 relative order-first md:order-last overflow-hidden">
        {/* Filtres flottants au-dessus de la carte */}
        <div className="absolute top-4 md:top-6 left-4 md:left-6 right-4 md:right-6 z-[1000] pointer-events-none">
          <div className="pointer-events-auto max-w-5xl mx-auto">
            <HomeRadarFilters 
              radius={radius} setRadius={setRadius}
              filters={filters} setFilters={setFilters}
            />
          </div>
        </div>

        {userLocation ? (
          <MapRadar 
            profiles={filteredProfiles.map(p => ({
              ...p,
              photoUrl: p.photos?.[0]?.url || p.avatarUrl || "https://placehold.co/200x200/1e293b/64748b?text=...",
              pinLat: p._geo?.lat,
              pinLon: p._geo?.lng,
              isTopGirl: p.boostScore > 50 // Un boost élevé définit une "Top Girl"
            }))} 
            center={[userLocation.lat, userLocation.lng]} 
            zoom={12}
            onBoundsChange={() => {}} // Pourra être lié à une recherche par zone plus tard
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-dark-900">
             <div className="text-center">
                <Loader2 className="w-8 h-8 text-dark-700 animate-spin mx-auto mb-2" />
                <p className="text-dark-500 font-bold uppercase tracking-widest text-[10px]">Attente de géolocalisation...</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
}
